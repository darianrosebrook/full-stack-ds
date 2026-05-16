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
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
} from "../../ir.js";
import { hasChildrenPlaceholder } from "../../ir.js";
import { translateNonReactType } from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";

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
    const optional = p.required ? "" : "?";
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    lines.push(`  ${propName}${optional}: ${svelteType(p.type)};`);
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
      `    ${accessor} ? \`${classRecipe.base}--\${${accessor}}\` : null,`,
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
  part: { name: string; semanticElement?: string; layoutVariant?: string },
): string {
  const cssClass = `${cssPrefix}__${part.name}`;
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
      `${accessor} ? \`${classRecipe.base}--\${${accessor}}\` : null`,
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

  for (const [key, expr] of Object.entries(node.bindings)) {
    const rendered = renderSvelteBinding(svelteAttrName(key), expr, ctx);
    if (rendered === null) continue;
    attrs.push(rendered);
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
  } else if (renderedChildren.length === 0) {
    body = `${pad}<${tag}${formatSvelteAttrs(attrs)}></${tag}>`;
  } else {
    body = [
      `${pad}<${tag}${formatSvelteAttrs(attrs)}>`,
      ...renderedChildren,
      `${pad}</${tag}>`,
    ].join("\n");
  }

  if (node.ifProp) {
    let expr: string;
    if (node.ifProp === "children") {
      expr = "children";
    } else {
      const matchingChannel = [...ctx.channelByName.values()].find(
        (c) => c.valueProp === node.ifProp || c.name === node.ifProp,
      );
      expr = matchingChannel
        ? `${ctx.hookVar}.${matchingChannel.name}`
        : jsAccessorFor(node.ifProp);
    }
    return [`${pad}{#if ${expr}}`, body, `${pad}{/if}`].join("\n");
  }
  return body;
}

function escapeAttrValue(s: string): string {
  return s.replace(/"/g, "&quot;");
}

function formatSvelteAttrs(attrs: string[]): string {
  if (attrs.length === 0) return "";
  return " " + attrs.join(" ");
}

function renderSvelteBinding(
  attr: string,
  expr: BindingExpression,
  ctx: SvelteRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `${attr}={${jsAccessorFor(expr.prop)}}`;
    case "literal":
      return `${attr}="${escapeAttrValue(expr.value)}"`;
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        return `${attr}={${ctx.hookVar}.${ch.name}}`;
      }
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        return `${attr}={${jsAccessorFor(ch.defaultValueProp)}}`;
      }
      // onChange synthesis. Event-shaped channels pass the raw event
      // through to the consumer; consumer drives state externally.
      const eventName = mapJsxEventToSvelteAttr(attr);
      if (ch.callbackKind === "event") {
        return `${eventName}={${jsAccessorFor(ch.changeHandlerProp)}}`;
      }
      const setter = `set${capitalizeSvelte(ch.name)}`;
      if (ch.valueType === "boolean") {
        return `${eventName}={(e) => ${ctx.hookVar}.${setter}((e.currentTarget as HTMLInputElement).checked)}`;
      }
      if (ch.valueType === "number") {
        return `${eventName}={(e) => ${ctx.hookVar}.${setter}(Number((e.currentTarget as HTMLInputElement).value))}`;
      }
      if (ch.valueType === "string" || ch.valueType === undefined) {
        return `${eventName}={(e) => ${ctx.hookVar}.${setter}((e.currentTarget as HTMLInputElement).value)}`;
      }
      return `${eventName}={(e) => ${ctx.hookVar}.${setter}(e as unknown as ${ch.valueType})}`;
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

