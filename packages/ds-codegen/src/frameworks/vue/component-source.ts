/**
 * Vue 3 SFC emission, IR-driven.
 *
 * Output shape (single file component):
 *
 *   <script setup lang="ts">
 *   import { computed } from "vue";
 *   import { Stack } from "../../primitives/index.js";
 *
 *   interface Props { ... }
 *   const props = withDefaults(defineProps<Props>(), { ... });
 *   const classNames = computed(() => [ ... ].filter(Boolean).join(" "));
 *   </script>
 *
 *   <template>
 *     <Stack :class="classNames" ...>
 *       <slot />
 *     </Stack>
 *   </template>
 */
import type {
  BindingExpression,
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
} from "../../ir.js";
import {
  emitNonReactTypeAliases,
  translateNonReactType,
} from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";

// Props handled natively by Vue: class via :class binding, style passthrough,
// children via <slot />, className is the React convention for class (skip it).
const VUE_SKIP_PROPS = new Set(["class", "style", "children", "className"]);

/**
 * Emit a Vue 3 Single File Component for a `ComponentIR`. The script
 * block is partitioned into the same marker regions React uses
 * (imports/types/component/trailing); template + style are simple
 * single-region blocks for now (template surface is small enough that
 * users override entire SFCs rather than splice template fragments).
 */
export function generateVueComponentSource(ir: ComponentIR): string {
  if (ir.dom) {
    return generateVueDomTreeComponentSource(ir);
  }
  const importsBody = [
    `import { computed } from "vue";`,
    `import { Stack } from "../../primitives/index.js";`,
  ].join("\n");

  const typesBody = emitNonReactTypeAliases(ir).join("\n");
  const propsInterfaceBody = generatePropsInterface(ir);
  const definePropsBody = generateDefineProps(ir);
  const classesBody = generateClassesComputed(ir);
  const eventHandlersBody = generateEventHandlers(ir);

  const blank = (): Section => ({ kind: "between", body: "" });
  const scriptSections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "props", body: propsInterfaceBody },
    blank(),
    { kind: "generated", id: "defineProps", body: definePropsBody },
    blank(),
    { kind: "generated", id: "classes", body: classesBody },
    blank(),
    ...(eventHandlersBody
      ? [
          { kind: "generated" as const, id: "events", body: eventHandlersBody },
          blank(),
        ]
      : []),
    { kind: "custom", id: "trailing", body: "" },
  ];

  return [
    `<script setup lang="ts">`,
    renderSections(scriptSections, "line"),
    `</script>`,
    ``,
    generateTemplate(ir),
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Vue's `defineProps<Props>()` treats `?` as optional; required boolean props
 * (which are uncommon in design system APIs) need explicit `required: true`
 * but we follow the convention that all visual props are optional with sane
 * defaults. The helper therefore mirrors React's loose-typed component API.
 */
function generatePropsInterface(ir: ComponentIR): string {
  const propNames = new Set(ir.styledProps.map((p) => p.name));
  const lines: string[] = [`interface Props {`];
  for (const p of ir.styledProps) {
    if (VUE_SKIP_PROPS.has(p.name)) continue;
    const optional = p.required ? "" : "?";
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    lines.push(`  ${propName}${optional}: ${vueType(p.type)};`);
  }
  for (const dim of Object.keys(ir.variants)) {
    if (!propNames.has(dim)) {
      lines.push(`  ${dim}?: string;`);
    }
  }
  // Mirror React's parity logic: every attribute the template binds must
  // appear in the Props interface. `children` is handled via <slot/> so we
  // don't declare it; `className` is React-only (Vue uses `class`).
  if (!propNames.has("class")) lines.push(`  class?: string;`);
  if (!propNames.has("data-testid")) lines.push(`  "data-testid"?: string;`);
  if (ir.dom && domTreeHasRole(ir.dom, "dialog")) {
    if (!propNames.has("aria-label")) lines.push(`  "aria-label"?: string;`);
    if (!propNames.has("aria-labelledby"))
      lines.push(`  "aria-labelledby"?: string;`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

/** Returns true if any node in the dom tree has the given role attribute. */
function domTreeHasRole(
  node: DomNodeIR | null | undefined,
  role: string,
): boolean {
  if (!node) return false;
  if (node.attrs["role"] === role) return true;
  return node.children.some((child) => domTreeHasRole(child, role));
}

function generateDefineProps(ir: ComponentIR): string {
  const defaults = collectDefaults(ir);
  if (defaults.length === 0) {
    return `const props = defineProps<Props>();`;
  }
  const lines: string[] = [`const props = withDefaults(defineProps<Props>(), {`];
  for (const [name, value, needsFactory] of defaults) {
    const propKey = name.includes("-") ? `"${name}"` : name;
    // Vue's withDefaults requires a factory function whenever the prop type
    // covers non-primitive shapes — including `unknown`, which is what
    // ReactNode / ReactElement / etc. translate to. Wrap the literal value
    // so TS doesn't complain that the literal isn't a factory.
    const expr = needsFactory ? `() => (${value})` : value;
    lines.push(`  ${propKey}: ${expr},`);
  }
  lines.push(`});`);
  return lines.join("\n");
}

/**
 * Vue defaults need a factory wrapper when the prop type allows a non-
 * primitive value (object/array/function). `unknown` covers all of those,
 * so any prop whose translated type contains a bare `unknown` token gets
 * its default wrapped at emission time.
 */
function defaultNeedsFactory(translatedType: string): boolean {
  return /\bunknown\b/.test(translatedType);
}

function collectDefaults(ir: ComponentIR): Array<[string, string, boolean]> {
  const out: Array<[string, string, boolean]> = [];
  for (const p of ir.styledProps) {
    if (p.defaultExpr === undefined) continue;
    if (VUE_SKIP_PROPS.has(p.name)) continue;
    out.push([p.name, p.defaultExpr, defaultNeedsFactory(vueType(p.type))]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Class recipe
// ---------------------------------------------------------------------------

function generateClassesComputed(ir: ComponentIR): string {
  const { classRecipe } = ir;
  const lines: string[] = [
    `const classNames = computed(() => [`,
    `  "${classRecipe.base}",`,
  ];

  for (const mod of classRecipe.valueModifiers) {
    const accessor = propAccessor(mod.propName);
    lines.push(
      `  ${accessor} ? \`${classRecipe.base}--\${${accessor}}\` : null,`,
    );
  }

  for (const mod of classRecipe.booleanModifiers) {
    const accessor = propAccessor(mod.propName);
    lines.push(`  ${accessor} ? "${classRecipe.base}--${mod.safeName}" : null,`);
  }

  // Forward the consumer-passed `class` prop so users can extend styling.
  // Matches React's `className && className` pattern in classRoot recipes.
  lines.push(`  props.class,`);

  lines.push(`].filter(Boolean).join(" "));`);
  return lines.join("\n");
}

function propAccessor(propName: string): string {
  // Use single-quoted bracket notation for hyphenated names so the
  // accessor can be safely embedded inside a double-quoted template
  // attribute binding (e.g. :aria-label="props['aria-label']").
  if (propName.includes("-")) return `props['${propName}']`;
  return `props.${propName}`;
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

function generateEventHandlers(ir: ComponentIR): string {
  const styledPropNames = new Set(ir.styledProps.map((prop) => prop.name));
  const styledPropsByName = new Map(ir.styledProps.map((prop) => [prop.name, prop]));
  const clickHandlers = new Map<string, string>();
  const changeHandlers = new Map<string, string>();
  const keydownHandlers = new Map<string, string>();

  if (styledPropNames.has("onClick")) clickHandlers.set("onClick", "event");
  if (styledPropNames.has("onKeyDown")) keydownHandlers.set("onKeyDown", "event");

  for (const channel of ir.behavior.normalizedChannels) {
    if (!styledPropNames.has(channel.changeHandlerProp)) continue;
    const propType = styledPropsByName.get(channel.changeHandlerProp)?.type ?? "";
    const argument = callbackArgument(propType, channel.valueType);
    if (channel.valueType === "boolean") {
      clickHandlers.set(channel.changeHandlerProp, argument);
    } else {
      changeHandlers.set(channel.changeHandlerProp, argument);
    }
  }

  const blocks: string[] = [];
  if (clickHandlers.size > 0) {
    blocks.push(generateEventHandler("handleRootClick", clickHandlers));
  }
  if (changeHandlers.size > 0) {
    blocks.push(generateEventHandler("handleRootChange", changeHandlers));
  }
  if (keydownHandlers.size > 0) {
    blocks.push(generateEventHandler("handleRootKeydown", keydownHandlers));
  }

  return blocks.join("\n\n");
}

function generateEventHandler(name: string, handlers: Map<string, string>): string {
  const lines = [`function ${name}(event: Event) {`];
  for (const [handler, argument] of handlers) {
    lines.push(`  ${propAccessor(handler)}?.(${argument});`);
  }
  lines.push(`}`);
  return lines.join("\n");
}

function callbackArgument(propType: string, valueType: string | undefined): string {
  if (/\bEvent\b|EventHandler|ChangeEvent|MouseEvent|KeyboardEvent/.test(propType)) {
    return "event";
  }
  if (valueType === "boolean" || /\bboolean\b/.test(propType)) {
    return "true";
  }
  if (valueType === "number") return "0";
  return `"test"`;
}

// ---------------------------------------------------------------------------
// Compound-part SFC
// ---------------------------------------------------------------------------

/**
 * Emit a compound-part SFC mirroring the React reference shape:
 *   <ComponentNamePartName> → <Stack as="header" class="component__part">
 *
 * Compound parts are stateless wrappers that contribute one BEM block
 * class. Each one is its own `.vue` file because Vue SFCs cannot hold
 * multiple components.
 */
export function generateVueCompoundPartSource(
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
    `<script setup lang="ts">`,
    `// @generated:start imports`,
    `import { computed } from "vue";`,
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
    `}`,
    ``,
    `const props = defineProps<Props>();`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const classNames = computed(() =>`,
    `  ["${cssClass}", props.class].filter(Boolean).join(" "),`,
    `);`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<template>`,
    `  <Stack${asAttr}${variantAttr} :class="classNames" :data-testid="props['data-testid']">`,
    `    <slot />`,
    `  </Stack>`,
    `</template>`,
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
  const propAttrs = generateTemplatePropAttrs(ir);
  const eventAttrs = generateTemplateEventAttrs(ir);
  // data-testid is universally bound on the root, in parallel with React
  // (which writes `data-testid={testId}` unconditionally). The Props
  // interface declares it via generatePropsInterface; keep them in sync.
  const styledNames = new Set(ir.styledProps.map((p) => p.name));
  const testIdAttr = styledNames.has("data-testid")
    ? ""
    : ` :data-testid="props['data-testid']"`;

  return [
    `<template>`,
    `  <Stack${asAttr}${roleAttr}${propAttrs}${eventAttrs}${testIdAttr} :class="classNames">`,
    `    <slot />`,
    `  </Stack>`,
    `</template>`,
  ].join("\n");
}

function generateTemplatePropAttrs(ir: ComponentIR): string {
  const attrs: string[] = [];
  for (const prop of ir.styledProps) {
    if (
      prop.name.startsWith("aria-") ||
      prop.name === "data-testid" ||
      prop.name === "id" ||
      prop.name === "tabIndex" ||
      prop.name === "disabled" ||
      prop.name === "type"
    ) {
      attrs.push(` :${prop.name}="${propAccessor(prop.name)}"`);
    }
  }
  return attrs.join("");
}

function generateTemplateEventAttrs(ir: ComponentIR): string {
  const styledPropNames = new Set(ir.styledProps.map((prop) => prop.name));
  const hasClick =
    styledPropNames.has("onClick") ||
    ir.behavior.normalizedChannels.some(
      (channel) =>
        channel.valueType === "boolean" &&
        styledPropNames.has(channel.changeHandlerProp),
    );
  const hasChange = ir.behavior.normalizedChannels.some(
    (channel) =>
      channel.valueType !== "boolean" &&
      styledPropNames.has(channel.changeHandlerProp),
  );
  const hasKeydown = styledPropNames.has("onKeyDown");
  const attrs: string[] = [];
  if (hasClick) attrs.push(` @click="handleRootClick"`);
  if (hasChange) attrs.push(` @change="handleRootChange"`);
  if (hasKeydown) attrs.push(` @keydown="handleRootKeydown"`);
  return attrs.join("");
}

// ---------------------------------------------------------------------------
// Type translation (TS subset → TS as Vue understands it)
// ---------------------------------------------------------------------------

/**
 * The IR carries TypeScript type strings authored against React conventions.
 * Vue needs the same syntactic types but without React namespace shorthand.
 * Delegates to the shared non-React translator so all four frameworks stay
 * in lockstep.
 */
function vueType(typeStr: string): string {
  return translateNonReactType(typeStr);
}

// ---------------------------------------------------------------------------
// DOM-tree-driven component source (B.2c)
// ---------------------------------------------------------------------------

/**
 * Generate a Vue 3 SFC that renders the contract's `dom` tree. Native
 * HTML elements with `:` and `@` bindings; consumer-provided children land
 * at the `tag: "slot"` / `tag: "children"` placeholder via `<slot />`.
 * Calls the generated `useX` composable in script setup, exposing
 * channel state to the template via reactive bindings.
 *
 * Unlike the legacy path, no `<Stack>` wrapper — the contract's `tag` IS
 * the rendered root.
 */
function generateVueDomTreeComponentSource(ir: ComponentIR): string {
  if (!ir.dom) throw new Error("generateVueDomTreeComponentSource requires ir.dom");

  const channels = ir.behavior.normalizedChannels;
  const channelByName = new Map(channels.map((c) => [c.name, c]));
  const hasHook = channels.length > 0;

  const importLines = [`import { computed } from "vue";`];
  if (hasHook) importLines.push(`import { use${ir.name} } from "./use${ir.name}.js";`);
  const importsBody = importLines.join("\n");

  const typesBody = emitNonReactTypeAliases(ir).join("\n");
  const propsInterfaceBody = generatePropsInterface(ir);
  const definePropsBody = generateDefineProps(ir);

  // Build the hook call. Vue's primitives expect getter-shaped controlled
  // values (`() => boolean | undefined`), and value-shaped onChange.
  //
  // We assign the hook result to a single `behavior` variable rather than
  // destructuring — destructuring would create top-level locals (e.g. `open`)
  // that collide with same-named props in template scope, and Vue's template
  // identifier resolution prefers the prop in that case (silently rendering
  // stale data). `behavior.open` is unambiguous.
  const hookLines: string[] = [];
  if (hasHook) {
    hookLines.push(`const behavior = use${ir.name}({`);
    for (const ch of channels) {
      hookLines.push(`  ${ch.valueProp}: () => props.${propAccess(ch.valueProp)},`);
      if (ch.defaultValueProp) {
        hookLines.push(`  ${ch.defaultValueProp}: props.${propAccess(ch.defaultValueProp)},`);
      }
      hookLines.push(`  ${ch.changeHandlerProp}: props.${propAccess(ch.changeHandlerProp)},`);
    }
    for (const trigger of ir.behavior.normalizedDismissalTriggers) {
      if (!trigger.enabledByProp) continue;
      hookLines.push(`  ${trigger.enabledByProp}: props.${propAccess(trigger.enabledByProp)},`);
    }
    hookLines.push(`});`);
  }
  const hookBody = hookLines.join("\n");

  // Compute classNames from BEM recipe. State props that are channel-driven
  // reference the hook-resolved value (as a Ref, so `.value`).
  const classRecipe = ir.classRecipe;
  const channelValuePropSet = new Set(channels.map((c) => c.valueProp));
  const classExprs: string[] = [`"${classRecipe.base}"`];
  for (const mod of classRecipe.valueModifiers) {
    classExprs.push(
      `props.${mod.propName} ? \`${classRecipe.base}--\${props.${mod.propName}}\` : null`,
    );
  }
  const channelNamesSet = new Set(channels.map((c) => c.name));
  for (const mod of classRecipe.booleanModifiers) {
    if (channelValuePropSet.has(mod.propName)) {
      // Match by valueProp: find the channel by valueProp and reference
      // its hook-resolved name on the behavior object.
      const ch = channels.find((c) => c.valueProp === mod.propName)!;
      classExprs.push(
        `behavior.${ch.name}.value ? "${classRecipe.base}--${mod.safeName}" : null`,
      );
    } else if (channelNamesSet.has(mod.propName)) {
      classExprs.push(
        `behavior.${mod.propName}.value ? "${classRecipe.base}--${mod.safeName}" : null`,
      );
    } else {
      classExprs.push(
        `props.${mod.safeName} ? "${classRecipe.base}--${mod.safeName}" : null`,
      );
    }
  }
  const classesBody = [
    `const classNames = computed(() => [`,
    ...classExprs.map((e) => `  ${e},`),
    `  props.class,`,
    `].filter(Boolean).join(" "));`,
  ].join("\n");

  const overlayClickTrigger = ir.behavior.normalizedDismissalTriggers.find(
    (t) => t.event === "overlayClick",
  );
  const booleanChannel = channels.find((c) => c.valueType === "boolean");
  const ctx: VueRenderContext = {
    classRecipe: classRecipe.base,
    channelByName,
    isRoot: true,
    rootRole: ir.root.effectiveRole,
    ...(overlayClickTrigger && booleanChannel
      ? {
          overlayClickSetter: `behavior.set${capitalize(booleanChannel.name)}`,
          overlayClickEnabledProp: overlayClickTrigger.enabledByProp,
        }
      : {}),
  };
  const templateInner = renderVueDomNode(ir.dom, ctx, 2);
  const templateBody = [`<template>`, templateInner, `</template>`].join("\n");

  const blank = (): Section => ({ kind: "between", body: "" });
  const scriptSections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "props", body: propsInterfaceBody },
    blank(),
    { kind: "generated", id: "defineProps", body: definePropsBody },
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
    `<script setup lang="ts">`,
    renderSections(scriptSections, "line"),
    `</script>`,
    ``,
    templateBody,
    ``,
  ].join("\n");
}

interface VueRenderContext {
  classRecipe: string;
  channelByName: Map<string, NormalizedChannelIR>;
  isRoot: boolean;
  overlayClickSetter?: string;
  overlayClickEnabledProp?: string;
  /**
   * Effective ARIA role to emit on the root unless the dom tree already
   * declares one. Parity with React's `ReactRenderContext.rootRole`.
   */
  rootRole?: string;
}

function renderVueDomNode(
  node: DomNodeIR,
  ctx: VueRenderContext,
  indent: number,
): string {
  const pad = " ".repeat(indent);

  if (node.tag === "slot" || node.tag === "children") {
    if (node.slotName) {
      return `${pad}<slot name="${node.slotName}" />`;
    }
    return `${pad}<slot />`;
  }

  const attrs: string[] = [];
  const classParts: string[] = [];
  if (node.part) classParts.push(`'${ctx.classRecipe}__${node.part}'`);

  for (const [key, value] of Object.entries(node.attrs)) {
    if (key === "class" || key === "className") {
      classParts.push(`'${value}'`);
      continue;
    }
    attrs.push(`${vueAttrName(key)}="${escapeAttrString(value)}"`);
  }

  // textContent bindings render as a `{{ ... }}` interpolation inside the
  // element body, not as a template attribute.
  const textChildren: string[] = [];
  for (const [key, expr] of Object.entries(node.bindings)) {
    if (key === "textContent") {
      const interpolated = renderVueTextContent(expr, ctx);
      if (interpolated !== null) textChildren.push(interpolated);
      continue;
    }
    const rendered = renderVueBinding(vueAttrName(key), expr, ctx);
    if (rendered === null) continue;
    // ARIA boolean-ish attributes have type `Booleanish`. Boolean sources
    // pass through; non-boolean sources need explicit string coercion to
    // produce "true"/"false" for screen readers and to satisfy
    // axe/aria-valid-attr-value. Skip the wrap when the source is a known
    // boolean channel — Vue auto-stringifies primitives at render time.
    if (ARIA_BOOLEAN_ATTRS_VUE.has(key)) {
      const sourceType =
        expr.kind === "channel"
          ? ctx.channelByName.get(expr.channel)?.valueType
          : undefined;
      if (sourceType !== "boolean" && sourceType !== undefined) {
        attrs.push(rewriteAriaBoolean(rendered, key));
        continue;
      }
    }
    attrs.push(rendered);
  }

  if (ctx.isRoot) {
    if (classParts.length > 0) {
      // The root node's BEM class is included in `classNames` (computed).
      // The dom-tree's root part class is the same as classRecipe.base, so
      // we don't double-emit.
      attrs.unshift(`:class="classNames"`);
    } else {
      attrs.unshift(`:class="classNames"`);
    }
    // Apply contract-declared a11y.role on the root unless the dom tree
    // already set `attrs.role` (consumed above into `attrs`).
    if (ctx.rootRole && !node.attrs["role"]) {
      attrs.push(`role="${ctx.rootRole}"`);
    }
    attrs.push(`:data-testid="props['data-testid']"`);
    if (ctx.overlayClickSetter) {
      const guardExpr = ctx.overlayClickEnabledProp
        ? `props.${propAccess(ctx.overlayClickEnabledProp)} !== false && ${ctx.overlayClickSetter}(false)`
        : `${ctx.overlayClickSetter}(false)`;
      // `.self` fires the handler only when the click target is the overlay
      // itself, not a descendant. This avoids needing a click handler on the
      // inner non-interactive panel (which would trip a11y lint rules).
      attrs.push(`@click.self="${guardExpr}"`);
    }
  } else if (classParts.length > 0) {
    attrs.unshift(`:class="${classPartsExprVue(classParts)}"`);
  }

  const ifGuard = node.ifProp;
  if (ifGuard) {
    let expr: string;
    if (ifGuard === "children") {
      expr = "$slots.default";
    } else {
      const matchingChannel = [...ctx.channelByName.values()].find(
        (c) => c.valueProp === ifGuard || c.name === ifGuard,
      );
      // Reference behavior.<channelName>.value to avoid prop-name collision —
      // a top-level local `open` would be shadowed by props.open in templates.
      expr = matchingChannel
        ? `behavior.${matchingChannel.name}.value`
        : `props.${propAccess(ifGuard)}`;
    }
    attrs.unshift(`v-if="${expr}"`);
  }

  const childCtx: VueRenderContext = { ...ctx, isRoot: false };
  const renderedChildren = node.children.map((c) =>
    renderVueDomNode(c, childCtx, indent + 2),
  );

  const textChildLines = textChildren.map(
    (tc) => `${" ".repeat(indent + 2)}${tc}`,
  );
  const allChildren = [...textChildLines, ...renderedChildren];

  const tag = node.tag;
  const isVoidEl = VOID_HTML_ELEMENTS_VUE.has(tag);

  if (allChildren.length === 0 && isVoidEl) {
    return `${pad}<${tag}${formatVueAttrs(attrs)} />`;
  }
  if (allChildren.length === 0) {
    return `${pad}<${tag}${formatVueAttrs(attrs)}></${tag}>`;
  }
  return [
    `${pad}<${tag}${formatVueAttrs(attrs)}>`,
    ...allChildren,
    `${pad}</${tag}>`,
  ].join("\n");
}

/**
 * Render a textContent binding as a Vue `{{ ... }}` interpolation. Mirrors
 * the React side's child-text rendering: the binding becomes the element's
 * body, not an attribute.
 */
function renderVueTextContent(
  expr: BindingExpression,
  ctx: VueRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `{{ props.${propAccess(expr.prop)} }}`;
    case "literal":
      return escapeAttrString(expr.value);
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") return `{{ behavior.${ch.name}.value }}`;
      if (expr.field === "defaultValue" && ch.defaultValueProp) {
        return `{{ props.${propAccess(ch.defaultValueProp)} }}`;
      }
      return null;
    }
  }
}

function classPartsExprVue(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return `[${parts.join(", ")}]`;
}

function formatVueAttrs(attrs: string[]): string {
  if (attrs.length === 0) return "";
  return " " + attrs.join(" ");
}

function escapeAttrString(s: string): string {
  return s.replace(/"/g, "&quot;");
}

/**
 * Map a binding expression into a Vue template attribute. Channel onChange
 * handlers become `@change="(e) => setX((e.target as HTMLInputElement).checked)"`
 * etc., based on the channel's value type.
 */
function renderVueBinding(
  attr: string,
  expr: BindingExpression,
  ctx: VueRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `:${attr}="props.${propAccess(expr.prop)}"`;
    case "literal":
      return `${attr}="${escapeAttrString(expr.value)}"`;
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        // Reference behavior.<name>.value — Vue's auto-unwrap only kicks in
        // for top-level refs in template scope. For nested property access
        // we must explicitly read .value to satisfy strict typecheck.
        return `:${attr}="behavior.${ch.name}.value"`;
      }
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        return `:${attr}="props.${propAccess(ch.defaultValueProp)}"`;
      }
      // Event handler synthesis. For `onChange` (mapped to `@change`),
      // unwrap the DOM event based on valueType. For other events
      // (`onClick` → `@click`, etc.), boolean channels toggle; other
      // valueTypes pass through the current value (no DOM payload).
      // Event-shaped channels skip unwrapping entirely.
      const eventName = mapJsxEventToVue(attr);
      if (ch.callbackKind === "event") {
        return `@${eventName}="props.${propAccess(ch.changeHandlerProp)}"`;
      }
      const setter = `behavior.set${capitalize(ch.name)}`;
      const isChangeEvent = attr === "onChange";
      if (isChangeEvent) {
        if (ch.valueType === "boolean") {
          return `@${eventName}="(e) => ${setter}((e.target as HTMLInputElement).checked)"`;
        }
        if (ch.valueType === "number") {
          return `@${eventName}="(e) => ${setter}(Number((e.target as HTMLInputElement).value))"`;
        }
        if (ch.valueType === "string" || ch.valueType === undefined) {
          return `@${eventName}="(e) => ${setter}((e.target as HTMLInputElement).value)"`;
        }
        return `@${eventName}="(e) => ${setter}(e as unknown as ${ch.valueType})"`;
      }
      if (ch.valueType === "boolean") {
        return `@${eventName}="() => ${setter}(!behavior.${ch.name}.value)"`;
      }
      return `@${eventName}="() => ${setter}(behavior.${ch.name}.value)"`;
    }
  }
}

/**
 * Translate React-style camelCase attribute names to their HTML-native
 * equivalents for Vue templates. Vue passes attribute names through to the
 * rendered HTML, so `htmlFor` would emit a literal `htmlFor="..."` attribute
 * (invalid HTML). Event handlers are translated separately by
 * `mapJsxEventToVue` — this helper only handles non-event attrs.
 */
function vueAttrName(name: string): string {
  if (name === "htmlFor") return "for";
  return name;
}

function mapJsxEventToVue(attr: string): string {
  if (attr === "onChange") return "change";
  if (attr === "onClick") return "click";
  if (attr === "onInput") return "input";
  if (attr === "onKeyDown") return "keydown";
  if (attr === "onKeyUp") return "keyup";
  if (attr === "onFocus") return "focus";
  if (attr === "onBlur") return "blur";
  if (attr.startsWith("on") && attr.length > 2) {
    return attr.slice(2).toLowerCase();
  }
  return attr;
}

/** Vue prop access helper: bracket notation for hyphenated names. */
function propAccess(name: string): string {
  if (!name) return "";
  return name.includes("-") ? `['${name}']` : name;
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

const VOID_HTML_ELEMENTS_VUE = new Set([
  "area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "source", "track", "wbr",
]);

const ARIA_BOOLEAN_ATTRS_VUE = new Set([
  "aria-selected",
  "aria-pressed",
  "aria-expanded",
  "aria-checked",
  "aria-busy",
  "aria-disabled",
  "aria-hidden",
  "aria-readonly",
  "aria-required",
  "aria-modal",
  "aria-multiselectable",
  "aria-haspopup",
  "aria-invalid",
  "aria-current",
  "aria-grabbed",
]);

/**
 * If `rendered` is a bound template attribute for an ARIA boolean-ish
 * attribute (`:aria-selected="behavior.value.value"`), rewrite its
 * expression to coerce to Vue's Booleanish union: the binding becomes a
 * ternary that yields `undefined` when the source is undefined (so Vue
 * omits the attribute), `"true"` for truthy, `"false"` for falsy.
 * Static literal attrs and non-aria-boolean bindings pass through.
 */
function rewriteAriaBoolean(rendered: string, key: string): string {
  if (!ARIA_BOOLEAN_ATTRS_VUE.has(key)) return rendered;
  const boundMatch = rendered.match(/^:([a-z-]+)="(.+)"$/);
  if (boundMatch) {
    const expr = boundMatch[2];
    // `expr === undefined ? undefined : Boolean(expr)` — preserves the
    // attribute-omission behavior for undefined while coercing to boolean
    // for any other value. Vue's Booleanish accepts boolean directly.
    return `:${boundMatch[1]}="${expr} === undefined ? undefined : Boolean(${expr})"`;
  }
  return rendered;
}
