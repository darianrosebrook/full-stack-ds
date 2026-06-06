/**
 * Svelte 5 SFC emission, IR-driven.
 *
 * Output shape (single file component using runes):
 *
 *   <script lang="ts">
 *   // @generated:start imports
 *   import { Stack } from "@full-stack-ds/svelte/primitives";
 *   // @generated:end
 *   ...
 *   </script>
 *
 *   <Stack class={classes}>
 *     {@render children?.()}
 *   </Stack>
 *
 * The script block interior uses `renderSections` with `"line"` comment
 * style, matching the Vue emitter's approach. Template and style blocks
 * are single regions.
 */
import type {
  BindingExpression,
  BindingPredicateOp,
  ComponentIR,
  DomNodeIR,
  IterationIR,
  NormalizedChannelIR,
  PropTypeIR,
} from "../../ir.js";
import {
  hasChildrenPlaceholder,
  TABLE_COMPOSITION_TAGS,
  nativeTableAttrsFor,
  canonicalTsType,
  type NativeTableAttr,
} from "../../ir.js";

/** Svelte prop TS type for a forwarded native table attribute (template `style` is a string). */
function svelteTableAttrType(attr: NativeTableAttr): string {
  switch (attr) {
    case "id":
    case "style":
      return "string";
    case "colSpan":
    case "rowSpan":
      return "number";
    case "scope":
      return '"col" | "row" | "colgroup" | "rowgroup"';
  }
}

/**
 * Svelte template attribute for a forwarded native table attribute. `id`,
 * `style`, `scope` use the `{name}` shorthand (var name === HTML attribute);
 * `colSpan`/`rowSpan` bind the lowercase HTML attribute to the camelCase var.
 */
function svelteTableAttrBinding(attr: NativeTableAttr): string {
  switch (attr) {
    case "colSpan":
      return "colspan={colSpan}";
    case "rowSpan":
      return "rowspan={rowSpan}";
    default:
      return `{${attr}}`; // id, style, scope
  }
}
import { translateNonReactType } from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";
import { resolveEventValueStrategy } from "../../semantics.js";
import {
  isCompoundStateContainer,
  getInteractiveItemPart,
  getRegionPart,
  getGroupHostPart,
  getGroupHostOrnamentPart,
} from "../react/hook-source.js";

// Props the Svelte emitter handles natively: `class` via `class: className`
// destructuring, `children` via `import('svelte').Snippet`, `style` passthrough.
// `className` is the React convention for `class`; we translate it to `class`.
const SVELTE_SKIP_PROPS = new Set(["class", "style", "className", "children"]);

/**
 * Emit a Svelte 5 Single File Component for a `ComponentIR`. The script
 * block is partitioned into the same marker regions React and Vue use
 * (imports/types/props/classes/trailing); template is a simple block.
 */
export function generateSvelteComponentSource(ir: ComponentIR): string {
  if (isCompoundStateContainer(ir)) {
    return generateSvelteCompoundStateRootSource(ir);
  }
  if (ir.dom) {
    return generateSvelteDomTreeComponentSource(ir);
  }
  // Relative import to the primitives barrel (not the package self-
  // reference) so svelte-package / svelte-check can resolve it during
  // the package's own build, before dist exists.
  const importsBody = `import { Stack } from "../../primitives/index.js";`;

  const typesBody = generateTypeAliases(ir);
  const propsBody = generatePropsBlock(ir);
  const classesBody = generateClassesDerived(ir);

  const blank = (): Section => ({ kind: "between", body: "" });
  const scriptSections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    ...(typesBody
      ? [
          { kind: "generated" as const, id: "types", body: typesBody },
          blank(),
          { kind: "custom" as const, id: "types", body: "" },
          blank(),
        ]
      : []),
    { kind: "generated", id: "props", body: propsBody },
    blank(),
    { kind: "generated", id: "classes", body: classesBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
  ];

  return [
    `<script lang="ts">`,
    renderSections(scriptSections, "line"),
    `</script>`,
    ``,
    generateTemplate(ir),
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Type aliases
// ---------------------------------------------------------------------------

function generateTypeAliases(ir: ComponentIR): string {
  const lines: string[] = [];
  const emitted = new Set<string>();

  // Emit named types from ir.definedTypes that are referenced in styledProps
  for (const p of ir.styledProps) {
    if (SVELTE_SKIP_PROPS.has(p.name)) continue;
    for (const ref of p.typeRefs) {
      if (emitted.has(ref)) continue;
      const def = ir.definedTypes[ref];
      if (!def) continue;
      if (def.kind === "union" && def.values) {
        lines.push(`type ${ref} = ${def.values.map((v) => `"${v}"`).join(" | ")};`);
        emitted.add(ref);
      } else if (def.kind === "alias" && def.alias) {
        lines.push(`type ${ref} = ${svelteType(def.alias)};`);
        emitted.add(ref);
      }
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

function generatePropsBlock(ir: ComponentIR): string {
  const lines: string[] = [`interface Props {`];
  for (const p of ir.styledProps) {
    if (SVELTE_SKIP_PROPS.has(p.name)) continue;
    // A prop with a `defaultExpr` is effectively optional at the
    // call site even if the contract marks it required — the
    // component supplies the default in the `$props()` destructure.
    const optional = p.required && p.defaultExpr === undefined ? "" : "?";
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    lines.push(`  ${propName}${optional}: ${lowerSveltePropType(p.propType)};`);
  }
  for (const dim of Object.keys(ir.variants)) {
    if (!ir.styledProps.some((p) => p.name === dim)) {
      lines.push(`  ${dim}?: string;`);
    }
  }
  lines.push(`  class?: string;`);
  // Only expose a `children` snippet when the component actually renders
  // children — i.e. the dom tree has a `{ tag: "children" }` placeholder,
  // OR the component uses the legacy no-dom-tree path (which always wraps
  // body in `<Stack>{@render children?.()}</Stack>`).
  const acceptsChildren = ir.dom ? hasChildrenPlaceholder(ir) : true;
  if (acceptsChildren) {
    lines.push(`  children?: import('svelte').Snippet;`);
  }
  // Named-slot snippets: each named `{ tag: "slot", name: X }` in the dom
  // tree becomes an optional Snippet-typed prop named X.
  for (const slotName of collectNamedSlots(ir)) {
    lines.push(`  ${slotName}?: import('svelte').Snippet;`);
  }
  lines.push(`}`);
  lines.push(``);

  const destructured = buildDestructure(ir);
  lines.push(`let { ${destructured} }: Props = $props();`);

  return lines.join("\n");
}

function collectNamedSlots(ir: ComponentIR): string[] {
  if (!ir.dom) return [];
  const names: string[] = [];
  const stack = [ir.dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.tag === "slot" && node.slotName && !names.includes(node.slotName)) {
      names.push(node.slotName);
    }
    if (node.children) stack.push(...node.children);
  }
  return names.sort();
}

function buildDestructure(ir: ComponentIR): string {
  const parts: string[] = [];
  for (const p of ir.styledProps) {
    if (SVELTE_SKIP_PROPS.has(p.name)) continue;
    // For hyphenated keys (e.g. "aria-label"), JS destructuring requires an
    // alias to a valid identifier. Use the IR's safeName ("ariaLabel").
    const key = p.name.includes("-") ? `"${p.name}": ${p.safeName}` : p.safeName;
    if (p.defaultExpr !== undefined) {
      parts.push(`${key} = ${p.defaultExpr}`);
    } else {
      parts.push(key);
    }
  }
  for (const dim of Object.keys(ir.variants)) {
    if (!ir.styledProps.some((p) => p.name === dim)) {
      parts.push(dim);
    }
  }
  parts.push(`class: className`);
  const acceptsChildren = ir.dom ? hasChildrenPlaceholder(ir) : true;
  if (acceptsChildren) {
    parts.push(`children`);
  }
  for (const slotName of collectNamedSlots(ir)) {
    parts.push(slotName);
  }
  return parts.join(", ");
}

// ---------------------------------------------------------------------------
// Class recipe
// ---------------------------------------------------------------------------

function generateClassesDerived(ir: ComponentIR): string {
  const { classRecipe } = ir;
  const lines: string[] = [
    `const classes = $derived(`,
    `  [`,
    `    "${classRecipe.base}",`,
  ];

  for (const mod of classRecipe.valueModifiers) {
    // valueModifiers use ResolvedPropIR.safeName (camelCase via
    // toSafeIdentifier), which matches the destructured local name —
    // valid JS accessor.
    const accessor = mod.safeName;
    lines.push(
      `    ${accessor} ? \`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${accessor}}\` : null,`,
    );
  }

  for (const mod of classRecipe.booleanModifiers) {
    // booleanModifiers' safeName is dash-stripped (e.g. "data-loading" →
    // "dataloading") because it doubles as the CSS-class fragment. That
    // is NOT the destructured local name — the local is camelCase
    // ("dataLoading"). Derive the JS accessor from propName here.
    const accessor = jsAccessorFor(mod.propName);
    lines.push(
      `    ${accessor} ? "${classRecipe.base}--${mod.safeName}" : null,`,
    );
  }

  lines.push(`    className,`);
  lines.push(`  ].filter(Boolean).join(" ")`);
  lines.push(`);`);
  return lines.join("\n");
}

/**
 * Convert a contract prop name to its JS-identifier form (matches the
 * destructured local in buildDestructure). Mirrors ir.ts toSafeIdentifier.
 *
 * Exported for unit testing — the booleanModifier safeName divergence
 * (CSS-class fragment vs JS identifier) is subtle enough that an explicit
 * regression test is warranted even though no current contract exercises
 * the hyphenated-state path.
 */
export function jsAccessorFor(propName: string): string {
  return propName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Compound-state-container SFC emission (Tabs-shaped)
// ---------------------------------------------------------------------------

function sveltePascalCapitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Emit the root provider SFC (e.g. Tabs.svelte) for a compound-state-container IR.
 * This component calls `useTabs`, provides context via `provideTabsContext`, and
 * renders a plain `<div>` wrapper that accepts children.
 */
function generateSvelteCompoundStateRootSource(ir: ComponentIR): string {
  const { name, cssPrefix } = ir;

  const importsBody = [
    `import { use${name}, provide${name}Context } from "./use${name}.svelte.js";`,
  ].join("\n");

  // Type aliases for variant props
  const typeLines: string[] = [];
  const emittedTypes = new Set<string>();
  for (const p of ir.styledProps) {
    if (SVELTE_SKIP_PROPS.has(p.name)) continue;
    for (const ref of p.typeRefs) {
      if (emittedTypes.has(ref)) continue;
      const def = ir.definedTypes[ref];
      if (!def) continue;
      if (def.kind === "union" && def.values) {
        typeLines.push(`type ${ref} = ${def.values.map((v) => `"${v}"`).join(" | ")};`);
        emittedTypes.add(ref);
      } else if (def.kind === "alias" && def.alias) {
        typeLines.push(`type ${ref} = ${svelteType(def.alias)};`);
        emittedTypes.add(ref);
      }
    }
  }
  const typesBody = typeLines.join("\n");

  // Props interface — styledProps already include value/defaultValue/onValueChange/idBase
  // for Tabs, so we just iterate them. Then add class, data-testid, children.
  const styledPropNames = new Set(ir.styledProps.map((p) => p.name));
  const channel = ir.behavior.normalizedChannels[0];

  const propsLines: string[] = [`interface Props {`];
  for (const p of ir.styledProps) {
    if (SVELTE_SKIP_PROPS.has(p.name)) continue;
    // A prop with a `defaultExpr` is effectively optional at the
    // call site even if the contract marks it required — the
    // component supplies the default in the `$props()` destructure.
    const optional = p.required && p.defaultExpr === undefined ? "" : "?";
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    propsLines.push(`  ${propName}${optional}: ${lowerSveltePropType(p.propType)};`);
  }
  propsLines.push(`  class?: string;`);
  propsLines.push(`  "data-testid"?: string;`);
  propsLines.push(`  children?: import('svelte').Snippet;`);
  propsLines.push(`}`);

  // Destructure — alias `idBase` to `idBaseProp` so we can pass it as a getter
  // to useTabs without Svelte warning about "references only capture initial value".
  const destructParts: string[] = [];
  for (const p of ir.styledProps) {
    if (SVELTE_SKIP_PROPS.has(p.name)) continue;
    const key = p.name.includes("-") ? `"${p.name}": ${p.safeName}` : p.safeName;
    if (p.name === "idBase") {
      destructParts.push(`idBase: idBaseProp`);
    } else if (p.defaultExpr !== undefined) {
      destructParts.push(`${key} = ${p.defaultExpr}`);
    } else {
      destructParts.push(key);
    }
  }
  destructParts.push(`class: className`);
  destructParts.push(`"data-testid": dataTestid`);
  destructParts.push(`children`);

  const propsBody = [
    propsLines.join("\n"),
    ``,
    `let {`,
    `  ${destructParts.join(",\n  ")},`,
    `}: Props = $props();`,
  ].join("\n");

  // Hook call — forward channel props as getters for reactivity
  const hookLines: string[] = [`const behavior = use${name}({`];
  if (channel) {
    const vAccessor = jsAccessorFor(channel.valueProp);
    hookLines.push(`  ${channel.valueProp}: () => ${vAccessor},`);
    if (channel.defaultValueProp) {
      const dvAccessor = jsAccessorFor(channel.defaultValueProp);
      hookLines.push(`  ${channel.defaultValueProp}: () => ${dvAccessor},`);
    }
    const cbAccessor = jsAccessorFor(channel.changeHandlerProp);
    hookLines.push(`  ${channel.changeHandlerProp}: () => ${cbAccessor},`);
  }
  // idBase: pass as getter so Svelte doesn't warn about capturing initial value.
  // idBaseProp is the destructured alias for the `idBase` styled prop.
  if (styledPropNames.has("idBase")) {
    hookLines.push(`  // idBase is stable after mount — use getter to avoid Svelte lint warning.`);
    hookLines.push(`  get idBase() { return idBaseProp; },`);
  }
  hookLines.push(`});`);
  hookLines.push(``);
  hookLines.push(`provide${name}Context({`);
  if (channel) {
    const channelName = channel.name;
    const setter = `set${sveltePascalCapitalize(channelName)}`;
    hookLines.push(`  get ${channelName}() { return behavior.${channelName}; },`);
    hookLines.push(`  ${setter}(v) { behavior.${setter}(v); },`);
  }
  hookLines.push(`  get registeredTabs() { return behavior.registeredTabs; },`);
  hookLines.push(`  registerTab(v) { behavior.registerTab(v); },`);
  hookLines.push(`  unregisterTab(v) { behavior.unregisterTab(v); },`);
  hookLines.push(`  idBase: behavior.idBase,`);

  // Forward orientation, activationMode, loop, unmountInactive via getters
  const styledNames = new Set(ir.styledProps.map((p) => p.name));
  if (styledNames.has("orientation")) {
    hookLines.push(`  get orientation() { return orientation ?? "horizontal"; },`);
  }
  if (styledNames.has("activationMode")) {
    hookLines.push(`  get activationMode() { return activationMode ?? "automatic"; },`);
  }
  if (styledNames.has("loop")) {
    hookLines.push(`  get loop() { return loop ?? true; },`);
  }
  if (styledNames.has("unmountInactive")) {
    hookLines.push(`  get unmountInactive() { return unmountInactive ?? true; },`);
  }
  hookLines.push(`});`);
  const hookBody = hookLines.join("\n");

  // Classes derived
  const classExprs: string[] = [`"${cssPrefix}"`];
  for (const mod of ir.classRecipe.valueModifiers) {
    classExprs.push(`${jsAccessorFor(mod.propName)} ? \`${cssPrefix}--${mod.valuePrefix ?? ""}\${${jsAccessorFor(mod.propName)}}\` : null`);
  }
  classExprs.push("className");
  const classesBody = [
    `const classes = $derived(`,
    `  [`,
    ...classExprs.map((e) => `    ${e},`),
    `  ].filter(Boolean).join(" ")`,
    `);`,
  ].join("\n");

  const blank = (): Section => ({ kind: "between", body: "" });
  const scriptSections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    ...(typesBody
      ? [
          { kind: "generated" as const, id: "types", body: typesBody },
          blank(),
          { kind: "custom" as const, id: "types", body: "" },
          blank(),
        ]
      : []),
    { kind: "generated", id: "props", body: propsBody },
    blank(),
    { kind: "generated", id: "hook", body: hookBody },
    blank(),
    { kind: "generated", id: "classes", body: classesBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
  ];

  return [
    `<script lang="ts">`,
    renderSections(scriptSections, "line"),
    `</script>`,
    ``,
    `<div class={classes} data-testid={dataTestid}>`,
    `  {@render children?.()}`,
    `</div>`,
    ``,
  ].join("\n");
}

/**
 * Returns the sub-component SFC sources (List, Tab, Panel) for a
 * compound-state-container IR. Each sub-component is wired via
 * setContext/getContext using the provider emitted in the root.
 *
 * Returns an array of `{ name, content }` matching the Vue emitter's shape
 * so `factory.ts` can emit them uniformly.
 */
export function generateSvelteCompoundStateParts(
  ir: ComponentIR,
): Array<{ name: string; content: string }> {
  if (!isCompoundStateContainer(ir)) return [];

  const { name, cssPrefix } = ir;
  const itemPart = getInteractiveItemPart(ir);
  const regionPart = getRegionPart(ir);
  const groupPart = getGroupHostPart(ir);
  const ornamentPart = getGroupHostOrnamentPart(ir);

  if (!itemPart || !regionPart) return [];

  const listName = `${name}${sveltePascalCapitalize(groupPart?.name ?? "List")}`;
  const tabName = `${name}${sveltePascalCapitalize(itemPart.name)}`;
  const panelName = `${name}${sveltePascalCapitalize(regionPart.name)}`;

  const channel = ir.behavior.normalizedChannels[0];
  const channelName = channel?.name ?? "activeTab";
  const setter = `set${sveltePascalCapitalize(channelName)}`;
  const listCssClass = `${cssPrefix}__${groupPart?.name ?? "list"}`;
  const tabCssClass = `${cssPrefix}__${itemPart.name}`;
  const panelCssClass = `${cssPrefix}__${regionPart.name}`;

  // -------------------------------------------------------------------------
  // TabsList.svelte
  // -------------------------------------------------------------------------
  const listSource = [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { use${name}Context } from "./use${name}.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  children?: import('svelte').Snippet;`,
    `}`,
    ``,
    `let { class: className, "data-testid": dataTestid, children }: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const ctx = use${name}Context();`,
    ``,
    `const classes = $derived(["${listCssClass}", className].filter(Boolean).join(" "));`,
    `// @generated:end`,
    ``,
    `// @generated:start trailing`,
    `let listRef: HTMLElement | null = $state(null);`,
    ``,
    `function handleKeyDown(e: KeyboardEvent): void {`,
    `  const tabs = ctx.registeredTabs;`,
    `  if (tabs.length === 0) return;`,
    `  const currentIndex = tabs.indexOf(ctx.${channelName});`,
    `  const isHorizontal = ctx.orientation !== "vertical";`,
    `  let nextIndex = currentIndex;`,
    ``,
    `  if (`,
    `    (isHorizontal && e.key === "ArrowRight") ||`,
    `    (!isHorizontal && e.key === "ArrowDown")`,
    `  ) {`,
    `    e.preventDefault();`,
    `    nextIndex = ctx.loop`,
    `      ? (currentIndex + 1) % tabs.length`,
    `      : Math.min(currentIndex + 1, tabs.length - 1);`,
    `  } else if (`,
    `    (isHorizontal && e.key === "ArrowLeft") ||`,
    `    (!isHorizontal && e.key === "ArrowUp")`,
    `  ) {`,
    `    e.preventDefault();`,
    `    nextIndex = ctx.loop`,
    `      ? (currentIndex - 1 + tabs.length) % tabs.length`,
    `      : Math.max(currentIndex - 1, 0);`,
    `  } else if (e.key === "Home") {`,
    `    e.preventDefault();`,
    `    nextIndex = 0;`,
    `  } else if (e.key === "End") {`,
    `    e.preventDefault();`,
    `    nextIndex = tabs.length - 1;`,
    `  } else if (e.key === "Enter" || e.key === " ") {`,
    `    if (ctx.activationMode === "manual") {`,
    `      e.preventDefault();`,
    `      const focusedBtn = listRef?.querySelector<HTMLButtonElement>('[role="tab"]:focus');`,
    `      if (focusedBtn) {`,
    `        const val = focusedBtn.getAttribute("data-value");`,
    `        if (val) ctx.${setter}(val);`,
    `      }`,
    `    }`,
    `    return;`,
    `  } else {`,
    `    return;`,
    `  }`,
    ``,
    `  const targetValue = tabs[nextIndex];`,
    `  if (ctx.activationMode === "automatic") {`,
    `    ctx.${setter}(targetValue);`,
    `  }`,
    `  const btn = listRef?.querySelector<HTMLButtonElement>(`,
    `    \`[role="tab"][data-value="\${targetValue}"]\`,`,
    `  );`,
    `  btn?.focus();`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<div`,
    `  bind:this={listRef}`,
    `  role="tablist"`,
    `  class={classes}`,
    `  data-testid={dataTestid}`,
    `  aria-orientation={ctx.orientation}`,
    `  onkeydown={handleKeyDown}`,
    `>`,
    `  {@render children?.()}`,
    ...(ornamentPart
      ? [
          // TABS-INDICATOR-REALIZATION-01: declared DOM realization of the
          // group-host ornament (e.g. Tabs's `indicator`). Visual treatment
          // and motion live in the contract's styles.json / Tabs.css.
          `  <span class="${cssPrefix}__${ornamentPart.name}" aria-hidden="true"></span>`,
        ]
      : []),
    `</div>`,
    ``,
  ].join("\n");

  // -------------------------------------------------------------------------
  // TabsTab.svelte
  // -------------------------------------------------------------------------
  const tabSource = [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { onMount, onDestroy } from "svelte";`,
    `import { use${name}Context } from "./use${name}.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  value: string;`,
    `  disabled?: boolean;`,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  children?: import('svelte').Snippet;`,
    `}`,
    ``,
    `let { value, disabled, class: className, "data-testid": dataTestid, children }: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const ctx = use${name}Context();`,
    ``,
    `const isActive = $derived(ctx.${channelName} === value);`,
    ``,
    `const classes = $derived(`,
    `  [`,
    `    "${tabCssClass}",`,
    `    isActive && "${tabCssClass}--active",`,
    `    className,`,
    `  ]`,
    `    .filter(Boolean)`,
    `    .join(" "),`,
    `);`,
    `// @generated:end`,
    ``,
    `// @generated:start trailing`,
    `onMount(() => {`,
    `  ctx.registerTab(value);`,
    `});`,
    ``,
    `onDestroy(() => {`,
    `  ctx.unregisterTab(value);`,
    `});`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<button`,
    `  role="tab"`,
    `  type="button"`,
    `  class={classes}`,
    `  data-value={value}`,
    `  data-testid={dataTestid}`,
    `  id="{ctx.idBase}-tab-{value}"`,
    `  aria-controls="{ctx.idBase}-panel-{value}"`,
    `  aria-selected={isActive}`,
    `  tabindex={isActive ? 0 : -1}`,
    `  {disabled}`,
    `  onclick={() => ctx.${setter}(value)}`,
    `>`,
    `  {@render children?.()}`,
    `</button>`,
    ``,
  ].join("\n");

  // -------------------------------------------------------------------------
  // TabsPanel.svelte
  // -------------------------------------------------------------------------
  const panelSource = [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { use${name}Context } from "./use${name}.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  value: string;`,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  children?: import('svelte').Snippet;`,
    `}`,
    ``,
    `let { value, class: className, "data-testid": dataTestid, children }: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const ctx = use${name}Context();`,
    ``,
    `const isActive = $derived(ctx.${channelName} === value);`,
    ``,
    `const classes = $derived(["${panelCssClass}", className].filter(Boolean).join(" "));`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `{#if !ctx.unmountInactive || isActive}`,
    `<div`,
    `  role="tabpanel"`,
    `  class={classes}`,
    `  id="{ctx.idBase}-panel-{value}"`,
    `  aria-labelledby="{ctx.idBase}-tab-{value}"`,
    `  tabindex={0}`,
    `  data-testid={dataTestid}`,
    `  hidden={!isActive ? true : undefined}`,
    `>`,
    `  {@render children?.()}`,
    `</div>`,
    `{/if}`,
    ``,
  ].join("\n");

  return [
    { name: listName, content: listSource },
    { name: tabName, content: tabSource },
    { name: panelName, content: panelSource },
  ];
}

// ---------------------------------------------------------------------------
// Compound part SFC
// ---------------------------------------------------------------------------

/**
 * Emit a stateless compound-part SFC mirroring the React reference shape:
 *   <ComponentNamePartName> → <Stack as="header" class="component__part">
 *
 * One .svelte file per part because Svelte components are 1:1 with files.
 */
export function generateSvelteCompoundPartSource(
  cssPrefix: string,
  part: { name: string; semanticElement?: string; layoutVariant?: string; nativeTag?: string },
): string {
  const cssClass = `${cssPrefix}__${part.name}`;

  // Native-tag branch: emit native HTML element directly, no Stack.
  if (part.nativeTag && TABLE_COMPOSITION_TAGS.has(part.nativeTag)) {
    const tag = part.nativeTag;
    const attrs = nativeTableAttrsFor(tag);
    const attrPropLines = attrs.map((a) => `  ${a}?: ${svelteTableAttrType(a)};`);
    const destructured = ["class: className", `"data-testid": dataTestid`, "children", ...attrs];
    // Svelte omits an attribute whose bound value is undefined.
    const attrBindings = attrs
      .map((a) => ` ${svelteTableAttrBinding(a)}`)
      .join("");
    return [
      `<script lang="ts">`,
      `// @generated:start imports`,
      `// @generated:end`,
      ``,
      `// @custom:start imports`,
      ``,
      `// @custom:end`,
      ``,
      `// @generated:start props`,
      `interface Props {`,
      `  class?: string;`,
      `  "data-testid"?: string;`,
      `  children?: import('svelte').Snippet;`,
      ...attrPropLines,
      `}`,
      ``,
      `let { ${destructured.join(", ")} }: Props = $props();`,
      `// @generated:end`,
      ``,
      `// @generated:start classes`,
      `const classes = $derived(["${cssClass}", className].filter(Boolean).join(" "));`,
      `// @generated:end`,
      ``,
      `// @custom:start trailing`,
      ``,
      `// @custom:end`,
      `</script>`,
      ``,
      `<${tag} class={classes} data-testid={dataTestid}${attrBindings}>`,
      `  {@render children?.()}`,
      `</${tag}>`,
      ``,
    ].join("\n");
  }

  const asAttr =
    part.semanticElement && part.semanticElement !== "div"
      ? ` as="${part.semanticElement}"`
      : "";
  const variantAttr =
    part.layoutVariant === "horizontal" ? ` variant="horizontal"` : "";

  return [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { Stack } from "../../primitives/index.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  children?: import('svelte').Snippet;`,
    `}`,
    ``,
    `let { class: className, "data-testid": dataTestid, children }: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const classes = $derived(["${cssClass}", className].filter(Boolean).join(" "));`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<Stack${asAttr}${variantAttr} class={classes} data-testid={dataTestid}>`,
    `  {@render children?.()}`,
    `</Stack>`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

function generateTemplate(ir: ComponentIR): string {
  const { root } = ir;
  const asAttr = root.element !== "div" ? ` as="${root.element}"` : "";
  const roleAttr = root.effectiveRole ? ` role="${root.effectiveRole}"` : "";

  return [
    `<Stack${asAttr}${roleAttr} class={classes}>`,
    `  {@render children?.()}`,
    `</Stack>`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Type translation (TS subset → Svelte-safe TS)
// ---------------------------------------------------------------------------

/**
 * The IR carries TypeScript type strings authored against React conventions.
 * We coerce them via the shared non-React translator so Svelte SFCs compile
 * without a React dependency.
 */
function svelteType(typeStr: string): string {
  return translateNonReactType(typeStr);
}

/**
 * Lower a framework-neutral PropTypeIR into a Svelte/TS type expression. Reads
 * the structured `propType` (ref from `propType.to`, fallback via the legacy
 * string path on `propType.raw`, V1 kinds via the canonical string) so output is
 * byte-identical. (CODEGEN-PROP-TYPE-IR-PILOT-01, slice 2)
 */
function lowerSveltePropType(pt: PropTypeIR): string {
  switch (pt.kind) {
    case "ref":
      return svelteType(pt.to);
    case "fallback":
      return svelteType(pt.raw);
    default:
      return svelteType(canonicalTsType(pt));
  }
}

// ---------------------------------------------------------------------------
// DOM-tree-driven component source (B.2c)
// ---------------------------------------------------------------------------

function generateSvelteDomTreeComponentSource(ir: ComponentIR): string {
  if (!ir.dom) throw new Error("generateSvelteDomTreeComponentSource requires ir.dom");

  const channels = ir.behavior.normalizedChannels;
  const channelByName = new Map(channels.map((c) => [c.name, c]));
  const hasHook = channels.length > 0;
  const hookVar = "behavior";

  const importLines: string[] = [];
  if (hasHook) {
    importLines.push(`import { use${ir.name} } from "./use${ir.name}.svelte.js";`);
  }
  const importsBody = importLines.join("\n");

  const typesBody = generateTypeAliases(ir);
  const propsBody = generatePropsBlock(ir);

  const hookLines: string[] = [];
  if (hasHook) {
    hookLines.push(`const ${hookVar} = use${ir.name}({`);
    for (const ch of channels) {
      const accessor = jsAccessorFor(ch.valueProp);
      hookLines.push(`  ${ch.valueProp}: () => ${accessor},`);
      if (ch.defaultValueProp) {
        const defAccessor = jsAccessorFor(ch.defaultValueProp);
        hookLines.push(`  ${ch.defaultValueProp}: () => ${defAccessor},`);
      }
      const onChangeAccessor = jsAccessorFor(ch.changeHandlerProp);
      hookLines.push(`  ${ch.changeHandlerProp}: () => ${onChangeAccessor},`);
    }
    // Forward dismissal-trigger enabledBy props so the hook's createDismissal
    // call sees them. Forwarded as getters so prop updates flow through.
    for (const trigger of ir.behavior.normalizedDismissalTriggers) {
      if (!trigger.enabledByProp) continue;
      const accessor = jsAccessorFor(trigger.enabledByProp);
      hookLines.push(`  ${trigger.enabledByProp}: () => ${accessor},`);
    }
    hookLines.push(`});`);
  }
  const hookBody = hookLines.join("\n");

  const classRecipe = ir.classRecipe;
  const channelValuePropSet = new Set(channels.map((c) => c.valueProp));
  const classExprs: string[] = [`"${classRecipe.base}"`];
  for (const mod of classRecipe.valueModifiers) {
    const accessor = jsAccessorFor(mod.propName);
    classExprs.push(
      `${accessor} ? \`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${accessor}}\` : null`,
    );
  }
  for (const mod of classRecipe.booleanModifiers) {
    if (channelValuePropSet.has(mod.propName)) {
      // Hook return exposes channel state via getter `get <ch.name>()`,
      // not by valueProp — resolve channel by valueProp and use its name.
      const ch = channels.find((c) => c.valueProp === mod.propName)!;
      classExprs.push(
        `${hookVar}.${ch.name} ? "${classRecipe.base}--${mod.safeName}" : null`,
      );
    } else {
      const accessor = jsAccessorFor(mod.propName);
      classExprs.push(
        `${accessor} ? "${classRecipe.base}--${mod.safeName}" : null`,
      );
    }
  }
  classExprs.push("className");
  const classesBody = [
    `const classes = $derived(`,
    `  [`,
    ...classExprs.map((e) => `    ${e},`),
    `  ].filter(Boolean).join(" ")`,
    `);`,
  ].join("\n");

  const overlayClickTrigger = ir.behavior.normalizedDismissalTriggers.find(
    (t) => t.event === "overlayClick",
  );
  const booleanChannel = channels.find((c) => c.valueType === "boolean");
  const ctx: SvelteRenderContext = {
    classRecipe: classRecipe.base,
    channelByName,
    hookVar,
    isRoot: true,
    rootRole: ir.root.effectiveRole ?? undefined,
    ...(overlayClickTrigger && booleanChannel
      ? {
          overlayClickSetter: `${hookVar}.set${capitalizeSvelte(booleanChannel.name)}`,
          overlayClickEnabledProp: overlayClickTrigger.enabledByProp,
        }
      : {}),
  };
  const templateInner = renderSvelteDomNode(ir.dom, ctx, 0);

  const blank = (): Section => ({ kind: "between", body: "" });
  const scriptSections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    ...(typesBody
      ? [
          { kind: "generated" as const, id: "types", body: typesBody },
          blank(),
          { kind: "custom" as const, id: "types", body: "" },
          blank(),
        ]
      : []),
    { kind: "generated", id: "props", body: propsBody },
    blank(),
    ...(hookBody
      ? [
          { kind: "generated" as const, id: "hook", body: hookBody },
          blank(),
        ]
      : []),
    { kind: "generated", id: "classes", body: classesBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
  ];

  return [
    `<script lang="ts">`,
    renderSections(scriptSections, "line"),
    `</script>`,
    ``,
    templateInner,
    ``,
  ].join("\n");
}

interface SvelteRenderContext {
  classRecipe: string;
  channelByName: Map<string, NormalizedChannelIR>;
  hookVar: string;
  isRoot: boolean;
  // `a11y.role` from the contract — emitted on the root element when set.
  // React/Lit/Angular all forward this; Svelte was the odd one out and lost
  // the role attribute on dom-tree components.
  rootRole?: string;
  overlayClickSetter?: string;
  overlayClickEnabledProp?: string;
  /**
   * Identifier names introduced by enclosing `{#each}` iterations. After
   * BINDING-EXPRESSION-V2-01 the binding-side `prop:X` accessor no
   * longer consults this set — iteration locals reach the emitter as
   * `iterationLocal`-kind bindings and dispatch via
   * `ctx.enclosingIteration`. The set is retained as the `if:` guard's
   * resolver (V2 did not migrate `if:`).
   */
  iterationScope?: Set<string>;
  /**
   * Nearest enclosing iteration directive. Resolution target for
   * `iterationLocal`-kind bindings.
   */
  enclosingIteration?: IterationIR;
}

function renderSvelteDomNode(
  node: DomNodeIR,
  ctx: SvelteRenderContext,
  indent: number,
): string {
  const pad = " ".repeat(indent);

  if (node.tag === "slot" || node.tag === "children") {
    if (node.slotName) {
      // Svelte 5: named slot maps to a Snippet-typed prop. Consumers pass
      // `<MyComponent {title}>` or via children-with-snippets syntax.
      return `${pad}{@render ${node.slotName}?.()}`;
    }
    return `${pad}{@render children?.()}`;
  }

  // IR-DOM-ITERATE-CAPABILITY-01: extend iterationScope for this node
  // and every descendant when `iterate` is declared. Bindings on the
  // iterated node and its subtree resolve `prop:item` / `prop:index`
  // as bare locals from the {#each} scope, not as destructured
  // component props.
  if (node.iteration) {
    const extendedScope = new Set(ctx.iterationScope ?? []);
    extendedScope.add(node.iteration.indexVar);
    if (node.iteration.itemVar !== undefined) {
      extendedScope.add(node.iteration.itemVar);
    }
    ctx = {
      ...ctx,
      iterationScope: extendedScope,
      enclosingIteration: node.iteration,
    };
  }

  const attrs: string[] = [];
  const classParts: string[] = [];
  if (node.part) classParts.push(`'${ctx.classRecipe}__${node.part}'`);

  for (const [key, value] of Object.entries(node.attrs)) {
    if (key === "class" || key === "className") {
      classParts.push(`'${value}'`);
      continue;
    }
    attrs.push(`${svelteAttrName(key)}="${escapeAttrValue(value)}"`);
  }

  // Some contract binding keys are not real HTML attributes but
  // DOM-property facades — `textContent` is the canonical example.
  // Svelte rejects `textContent={...}` as an attribute (svelte-check:
  // "textcontent" does not exist on HTMLProps); the idiomatic Svelte
  // emit is to render the value as a text child of the element.
  // Collect those bindings here and splice them into the body below.
  let textContentExpr: string | null = null;

  // IR-DOM-BINDING-CAPABILITY-01: the new `content` field is the
  // canonical inner-content binding. Surface it through the same
  // textContentExpr slot the legacy textContent path uses.
  if (node.content) {
    textContentExpr = renderSvelteTextChildExpression(node.content, ctx);
  }

  // IR-DOM-BINDING-CAPABILITY-01: event bindings lower to Svelte 5's
  // `onclick={...}` lowercased-attribute form (NOT the legacy Svelte 4
  // `on:click={...}` directive — this codebase uses Svelte 5 runes).
  for (const [eventName, expr] of Object.entries(node.events)) {
    const rendered = renderSvelteEvent(eventName, expr, ctx, node.tag);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  for (const [key, expr] of Object.entries(node.bindings)) {
    if (key === "textContent" || key === "children") {
      if (textContentExpr === null) {
        textContentExpr = renderSvelteTextChildExpression(expr, ctx);
      }
      continue;
    }
    // Dual-pathway dedup for events.
    if (/^on[A-Z]/.test(key)) {
      const evt = key.slice(2).toLowerCase();
      if (node.events[evt]) continue;
    }
    const rendered = renderSvelteBinding(svelteAttrName(key), expr, ctx, node.tag);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  // IR-DOM-CSS-VAR-BINDING-01: lower `cssVarBindings` to Svelte 5's
  // `style:--fsds-foo={expr}` directive form, one per binding. This
  // idiomatic form sets a single CSS custom property without touching
  // the rest of the element's inline style, and svelte-check accepts
  // arbitrary `--*` names. A literal `style` attr coexisting with
  // cssVarBindings is rejected by the IR builder.
  for (const { varName, value } of node.cssVarBindings) {
    const valueExpr = renderSvelteBindingValue(value, ctx);
    if (valueExpr === null) continue;
    attrs.push(`style:${varName}={${valueExpr}}`);
  }

  if (ctx.isRoot) {
    attrs.unshift(`class={classes}`);
    // Only emit role if the anatomy.dom.attrs doesn't already declare one
    // (avoids duplicate `role="..."` when contract specifies both
    // a11y.role and an explicit attrs.role on the root node).
    if (ctx.rootRole && !("role" in node.attrs)) {
      attrs.push(`role="${ctx.rootRole}"`);
    }
    if (ctx.overlayClickSetter) {
      const enabledVar = ctx.overlayClickEnabledProp
        ? jsAccessorFor(ctx.overlayClickEnabledProp)
        : null;
      const guardExpr = enabledVar
        ? `${enabledVar} !== false && ${ctx.overlayClickSetter}(false)`
        : `${ctx.overlayClickSetter}(false)`;
      // Only fire dismissal when the user clicked the overlay itself, not
      // a descendant. This avoids needing a stopPropagation handler on the
      // inner panel (which would trip a11y_click_events_have_key_events on
      // non-interactive panel elements).
      attrs.push(
        `onclick={(e) => { if (e.target === e.currentTarget) { ${guardExpr}; } }}`,
      );
    }
  } else if (classParts.length > 0) {
    if (classParts.length === 1) {
      attrs.unshift(`class={${classParts[0]}}`);
    } else {
      attrs.unshift(`class={[${classParts.join(", ")}].join(' ')}`);
    }
  }

  const childCtx: SvelteRenderContext = { ...ctx, isRoot: false, rootRole: undefined };
  const renderedChildren = node.children.map((c) =>
    renderSvelteDomNode(c, childCtx, indent + 2),
  );

  const tag = node.tag;
  const isVoidEl = VOID_HTML_ELEMENTS_SVELTE.has(tag);

  let body: string;
  if (renderedChildren.length === 0 && isVoidEl) {
    body = `${pad}<${tag}${formatSvelteAttrs(attrs)} />`;
  } else if (renderedChildren.length === 0 && textContentExpr !== null) {
    // textContent binding without other children: inline the
    // expression as the element's text body.
    body = `${pad}<${tag}${formatSvelteAttrs(attrs)}>${textContentExpr}</${tag}>`;
  } else if (renderedChildren.length === 0) {
    body = `${pad}<${tag}${formatSvelteAttrs(attrs)}></${tag}>`;
  } else if (textContentExpr !== null) {
    // textContent + other children: text first, then children. The
    // contract treats textContent as the leading text node.
    body = [
      `${pad}<${tag}${formatSvelteAttrs(attrs)}>${textContentExpr}`,
      ...renderedChildren,
      `${pad}</${tag}>`,
    ].join("\n");
  } else {
    body = [
      `${pad}<${tag}${formatSvelteAttrs(attrs)}>`,
      ...renderedChildren,
      `${pad}</${tag}>`,
    ].join("\n");
  }

  let withIfGuard = body;
  if (node.ifProp) {
    let expr: string;
    if (node.ifProp === "children") {
      expr = "children";
    } else if (ctx.iterationScope?.has(node.ifProp)) {
      // IR-DOM-ITERATE-CAPABILITY-01: bare iteration-alias reference.
      expr = node.ifProp;
    } else {
      const matchingChannel = [...ctx.channelByName.values()].find(
        (c) => c.valueProp === node.ifProp || c.name === node.ifProp,
      );
      expr = matchingChannel
        ? `${ctx.hookVar}.${matchingChannel.name}`
        : jsAccessorFor(node.ifProp);
    }
    const condition = node.ifNegated ? `!${expr}` : expr;
    withIfGuard = [`${pad}{#if ${condition}}`, body, `${pad}{/if}`].join("\n");
  }

  // IR-DOM-ITERATE-CAPABILITY-01: apply the {#each} wrap as the
  // outermost layer. If-guard nests INSIDE the loop so each iteration
  // re-evaluates the guard against the per-iteration scope. Key the
  // iteration on `indexVar` — sufficient for the current contract
  // surface (count-iteration and non-reorderable arrays).
  //
  //   kind="array": {#each items as item, index (index)} ... {/each}
  //   kind="count": {#each Array(count) as _, index (index)} ... {/each}
  //
  // Svelte 5's destructure-in-{#each} accepts `_` as a discarded
  // item; Array(N) yields an iterable of length N with undefined slots,
  // giving 0-based index parity with the other frameworks.
  if (node.iteration) {
    const { kind, source, indexVar, itemVar } = node.iteration;
    // PRODUCTION-ARRAY-ITERATION-CONSUMER-01: route iteration source
    // through the binding-value renderer for invariant consistency across
    // emitters. For Svelte the practical effect is small — `prop:X`
    // lowers to the same bare identifier the destructured `$props` exposes
    // — but channel-driven sources (`channel:X.value` → `${hookVar}.X`)
    // now resolve to the hook's controllable-state value rather than the
    // raw `$props` field.
    const sourceExpr = renderSvelteBindingValue(source, ctx);
    if (sourceExpr === null) {
      throw new Error(
        `Svelte emitter: iteration source could not be lowered (source kind=${source.kind})`,
      );
    }
    const head =
      kind === "array"
        ? `{#each (${sourceExpr} ?? []) as ${itemVar}, ${indexVar} (${indexVar})}`
        : `{#each Array(${sourceExpr}) as _, ${indexVar} (${indexVar})}`;
    return [`${pad}${head}`, withIfGuard, `${pad}{/each}`].join("\n");
  }
  return withIfGuard;
}

function escapeAttrValue(s: string): string {
  return s.replace(/"/g, "&quot;");
}

function formatSvelteAttrs(attrs: string[]): string {
  if (attrs.length === 0) return "";
  return " " + attrs.join(" ");
}

/**
 * Render a contract binding intended for an element's text content
 * as a Svelte template-text expression (e.g. `{summary}`). The
 * caller splices the result inside the open/close tags of the
 * owning element. Returns null for binding kinds that don't map to
 * text content (channels with no value field, etc.).
 */
/**
 * Lower a `prop:X` reference to a Svelte template accessor. When `X`
 * is an in-scope iteration alias (item/index introduced by an
 * enclosing `{#each}`), emit the bare identifier — `jsAccessorFor`
 * would camelCase-mangle a hyphenated alias name. For default alias
 * names (`item`, `index`) `jsAccessorFor` is a no-op, so this check is
 * defensive against future renames. IR-DOM-ITERATE-CAPABILITY-01.
 */
function sveltePropAccessor(propName: string, ctx: SvelteRenderContext): string {
  // Post-V2 (BINDING-EXPRESSION-V2-01): iteration locals reach the
  // emitter as `iterationLocal`-kind bindings, never as `prop:`
  // bindings — so a `prop:X` accessor here is always a real component
  // prop. The legacy `iterationScope.has(propName)` shortcut is
  // intentionally removed.
  void ctx;
  return jsAccessorFor(propName);
}

/**
 * Append a dotted property path to a base Svelte expression.
 * BINDING-EXPRESSION-V2-PATH-01.
 */
function appendPath(base: string, path: readonly string[] | undefined): string {
  if (!path || path.length === 0) return base;
  return `${base}.${path.join(".")}`;
}

/**
 * Resolve an `iterationLocal`-kind binding to the Svelte `{#each}`
 * scope variable name. Svelte emits
 * `{#each ... as item, index}` (array) or
 * `{#each ... as _, index}` (count) — the bare identifier matches the
 * iteration's declared `itemVar` / `indexVar`.
 */
function svelteIterationLocalName(
  local: "index" | "item",
  ctx: SvelteRenderContext,
): string | null {
  const it = ctx.enclosingIteration;
  if (!it) return null;
  if (local === "index") return it.indexVar;
  return it.itemVar ?? null;
}

function renderSvelteTextChildExpression(
  expr: BindingExpression,
  ctx: SvelteRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `{${appendPath(sveltePropAccessor(expr.prop, ctx), expr.path)}}`;
    case "literal":
      return escapeAttrValue(expr.value);
    case "iterationLocal": {
      const name = svelteIterationLocalName(expr.local, ctx);
      return name ? `{${appendPath(name, expr.path)}}` : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        return `{${appendPath(`${ctx.hookVar}.${ch.name}`, expr.path)}}`;
      }
      return null;
    }
    case "predicate": {
      // BINDING-EXPRESSION-V2-PREDICATE-01: defensive. Validator rejects
      // predicates in content position; this branch keeps the switch
      // exhaustive if a future site admits them.
      const lowered = renderSveltePredicate(expr, ctx);
      return lowered === null ? null : `{${lowered}}`;
    }
  }
}

/**
 * Lower a BindingExpression to a bare Svelte template expression (no
 * `attr={...}` scaffolding). Used by callers that splice the expression
 * into a surrounding template construct — `cssVarBindings` ->
 * `style:--fsds-foo={<expr>}`, future `{#each}` source expressions, etc.
 * Returns null for binding kinds that can't appear in an expression
 * position (e.g. channel events).
 */
function renderSvelteBindingValue(
  expr: BindingExpression,
  ctx: SvelteRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return appendPath(sveltePropAccessor(expr.prop, ctx), expr.path);
    case "literal":
      return JSON.stringify(expr.value);
    case "iterationLocal": {
      const name = svelteIterationLocalName(expr.local, ctx);
      return name ? appendPath(name, expr.path) : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") return appendPath(`${ctx.hookVar}.${ch.name}`, expr.path);
      if (expr.field === "defaultValue" && ch.defaultValueProp) {
        return jsAccessorFor(ch.defaultValueProp);
      }
      return null;
    }
    case "predicate":
      // BINDING-EXPRESSION-V2-PREDICATE-01.
      return renderSveltePredicate(expr, ctx);
  }
}

/**
 * Lower a predicate-kind binding to a Svelte template expression
 * string (no `{ }` scaffold). Operand accessors come from
 * `renderSvelteBindingValue` so they pick up the idiomatic Svelte
 * shapes (`X` for props in legacy components, `hook.X` for channels,
 * iter locals introduced by `{#each}` scope).
 */
function renderSveltePredicate(
  expr: BindingExpression & { kind: "predicate" },
  ctx: SvelteRenderContext,
): string | null {
  const left = renderSvelteBindingValue(expr.left, ctx);
  const right = renderSvelteBindingValue(expr.right, ctx);
  if (left === null || right === null) return null;
  return loweredSveltePredicate(expr.op, left, right);
}

function loweredSveltePredicate(op: BindingPredicateOp, left: string, right: string): string {
  switch (op) {
    case "eq":
      return `(${left} === ${right})`;
    case "contains":
      return `((${left} ?? []).includes(${right}))`;
    case "memberOf":
      return `(Array.isArray(${right}) ? ${right}.includes(${left}) : ${left} === ${right})`;
  }
}

function renderSvelteBinding(
  attr: string,
  expr: BindingExpression,
  ctx: SvelteRenderContext,
  hostTag?: string,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `${attr}={${appendPath(sveltePropAccessor(expr.prop, ctx), expr.path)}}`;
    case "literal":
      return `${attr}="${escapeAttrValue(expr.value)}"`;
    case "iterationLocal": {
      const name = svelteIterationLocalName(expr.local, ctx);
      return name ? `${attr}={${appendPath(name, expr.path)}}` : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        // ARIA-Booleanish coercion: aria-expanded / aria-pressed /
        // aria-selected / aria-checked / aria-busy / aria-current /
        // aria-disabled / aria-hidden / aria-grabbed accept
        // Booleanish | null | undefined in svelte-check's DOM
        // typings. When the channel valueType is not boolean (e.g.
        // Accordion's "openness" is string | string[]), passing the
        // raw value is admission-red. Coerce to Boolean so the
        // attribute reflects "truthy" — matching React's existing
        // emitter behavior.
        //
        // Note: ARIA coercion applies to the base channel value only.
        // When a path is present, the result is a projection of the
        // channel value — semantically a different type — and the
        // contract author has opted into emitting the projected value
        // directly. Coercion would silently mask shape mismatches.
        const base = appendPath(`${ctx.hookVar}.${ch.name}`, expr.path);
        if (
          (expr.path === undefined || expr.path.length === 0) &&
          ARIA_BOOLEANISH_ATTRS.has(attr) &&
          ch.valueType !== undefined &&
          ch.valueType !== "boolean"
        ) {
          return `${attr}={Boolean(${base})}`;
        }
        return `${attr}={${base}}`;
      }
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        return `${attr}={${jsAccessorFor(ch.defaultValueProp)}}`;
      }
      // onChange synthesis. The framework-neutral fact "how does this
      // host expose the channel value to a DOM event listener" lives
      // in `resolveEventValueStrategy` in semantics.ts — see
      // docs/codegen-authority.md (ARCH-CODEGEN-AUTHORITY-001) for
      // why this is shared semantics, not a Svelte-emitter local.
      const eventName = mapJsxEventToSvelteAttr(attr);
      const strategy = resolveEventValueStrategy({
        hostTag: hostTag ?? "",
        channelValueType: ch.valueType,
        callbackKind: ch.callbackKind === "event" ? "event" : "value",
      });
      if (strategy === "event") {
        return `${eventName}={${jsAccessorFor(ch.changeHandlerProp)}}`;
      }
      const setter = `set${capitalizeSvelte(ch.name)}`;
      switch (strategy) {
        case "checked":
          return `${eventName}={(e) => ${ctx.hookVar}.${setter}((e.currentTarget as HTMLInputElement).checked)}`;
        case "numberValue":
          return `${eventName}={(e) => ${ctx.hookVar}.${setter}(Number((e.currentTarget as HTMLInputElement).value))}`;
        case "value": {
          // Form-control hosts have `.value` on HTMLInputElement;
          // non-form-control hosts shim via a structural type so the
          // emit stays admissible without claiming the host is an input.
          const isFormControl =
            ch.valueType === "string" || ch.valueType === "number"
              ? hostTag === "input" || hostTag === "select" || hostTag === "textarea"
              : false;
          if (!isFormControl) {
            return `${eventName}={(e) => ${ctx.hookVar}.${setter}((e.currentTarget as HTMLElement & { value?: string }).value ?? "")}`;
          }
          return `${eventName}={(e) => ${ctx.hookVar}.${setter}((e.currentTarget as HTMLInputElement).value)}`;
        }
        case "toggle":
          return `${eventName}={() => ${ctx.hookVar}.${setter}(!${ctx.hookVar}.${ch.name})}`;
      }
      // Exhaustive inner switch above; defensive return so eslint's
      // no-fallthrough rule sees a terminator before the next case.
      return null;
    }
    case "predicate": {
      // BINDING-EXPRESSION-V2-PREDICATE-01: the predicate result is
      // always boolean, so no ARIA-Booleanish coercion is needed —
      // svelte-check accepts `boolean | undefined | null` for the
      // ARIA-Booleanish attribute slot.
      const lowered = renderSveltePredicate(expr, ctx);
      return lowered === null ? null : `${attr}={${lowered}}`;
    }
  }
}

/**
 * Translate React-style camelCase attribute names that aren't valid HTML
 * attributes into their HTML-native equivalents for Svelte templates.
 * Svelte 5 warns when invalid attribute names appear in templates (e.g.
 * `htmlFor` instead of `for`). Event handlers are translated separately
 * by `mapJsxEventToSvelteAttr` — this helper only handles non-event attrs.
 */
function svelteAttrName(name: string): string {
  if (name === "htmlFor") return "for";
  return name;
}

/**
 * Lower an entry from `node.events` (keyed by unprefixed event name like
 * `click`) into Svelte 5's `oneventname={...}` form. For `prop:X` returns
 * `onclick={X}`. Channel-routed events follow the existing channel
 * handling (using `resolveEventValueStrategy`) by delegating to the
 * synthetic JSX-attr name path in renderSvelteBinding.
 */
function renderSvelteEvent(
  eventName: string,
  expr: BindingExpression,
  ctx: SvelteRenderContext,
  hostTag?: string,
): string | null {
  // Svelte 5: event attribute is the lowercased event name without
  // the `on:` directive prefix used by Svelte 4.
  const svelteEventAttr = `on${eventName}`;
  switch (expr.kind) {
    case "prop":
      return `${svelteEventAttr}={${sveltePropAccessor(expr.prop, ctx)}}`;
    case "literal":
      // Rare. Emit as a string handler — consumer-error territory.
      return `${svelteEventAttr}="${escapeAttrValue(expr.value)}"`;
    case "iterationLocal": {
      // Iteration locals are values, not handlers. Surface null so the
      // caller drops the attribute. Defensive — the IR validator would
      // already reject a contract that wires iter:index to an event.
      void ctx;
      return null;
    }
    case "channel": {
      // Delegate to the channel-onChange path in renderSvelteBinding by
      // re-deriving the synthetic JSX-attr name. resolveEventValueStrategy
      // there handles host-tag-specific value extraction.
      const jsxAttr = "on" + eventName.charAt(0).toUpperCase() + eventName.slice(1);
      return renderSvelteBinding(jsxAttr, expr, ctx, hostTag);
    }
    case "predicate":
      // BINDING-EXPRESSION-V2-PREDICATE-01: predicates are boolean,
      // not callable. The IR validator rejects predicate-in-event at
      // build time; this case keeps the switch exhaustive.
      return null;
  }
}

function mapJsxEventToSvelteAttr(attr: string): string {
  if (attr === "onChange") return "onchange";
  if (attr === "onClick") return "onclick";
  if (attr === "onInput") return "oninput";
  if (attr === "onKeyDown") return "onkeydown";
  if (attr === "onKeyUp") return "onkeyup";
  if (attr === "onFocus") return "onfocus";
  if (attr === "onBlur") return "onblur";
  if (attr.startsWith("on") && attr.length > 2) {
    return attr.toLowerCase();
  }
  return attr;
}

function capitalizeSvelte(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

const VOID_HTML_ELEMENTS_SVELTE = new Set([
  "area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "source", "track", "wbr",
]);

/**
 * ARIA attributes typed as `Booleanish | null | undefined` in
 * svelte-check's DOM typings. When a contract binds one of these
 * to a non-boolean channel value (e.g. Accordion's `openness`
 * channel is `string | string[]`), the Svelte emitter must coerce
 * the value with `Boolean(...)` so the resulting attribute passes
 * admission. Mirrors React's existing coercion behavior.
 */
const ARIA_BOOLEANISH_ATTRS = new Set([
  "aria-expanded",
  "aria-pressed",
  "aria-selected",
  "aria-checked",
  "aria-busy",
  "aria-disabled",
  "aria-hidden",
  "aria-grabbed",
  "aria-modal",
  "aria-multiline",
  "aria-multiselectable",
  "aria-readonly",
  "aria-required",
]);

