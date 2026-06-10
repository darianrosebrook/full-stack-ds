/**
 * Lit LitElement emission, IR-driven.
 *
 * Output shape (single TypeScript class file):
 *
 *   // @generated:start imports
 *   import { LitElement, html, css } from 'lit';
 *   import { property } from 'lit/decorators.js';
 *   import { classMap } from 'lit/directives/class-map.js';
 *   // @generated:end
 *   // @custom:start imports
 *   // @custom:end
 *
 *   // @generated:start types
 *   export type ButtonSize = 'small' | 'medium' | 'large';
 *   // @generated:end
 *   // @custom:start types
 *   // @custom:end
 *
 *   // @generated:start component
 *   export class ButtonElement extends LitElement { ... }
 *   customElements.define('fsds-button', ButtonElement);
 *   // @generated:end
 *   // @custom:start trailing
 *   // @custom:end
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
import { TABLE_COMPOSITION_TAGS, canonicalTsType } from "../../ir.js";
import type { ContractTypeDef } from "../../contract.js";
import {
  emitNonReactTypeAliases,
  translateNonReactType,
} from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";
import { resolveSurfaceAutoDismiss } from "../../semantics.js";
import { toKebab } from "../../contract.js";
import { emitLitInlineCss, escapeCssForLitTemplate } from "../../css.js";
import {
  isCompoundStateContainer,
  getGroupHostOrnamentPart,
} from "../react/hook-source.js";

/**
 * Build the `static override styles = css\`…\`;` line(s) for a Lit
 * component. Inlines the component's own CSS (slots + property
 * references) into the shadow root because shadow DOM cannot consume
 * a sibling `.css` file via `@import`.
 *
 * `extraHostRules` is appended after the inlined component CSS for
 * components whose host element needs structural styling beyond the
 * default `:host { display: contents; }` (e.g. TabsTab using
 * `display: inline-flex`).
 *
 * When the component has no generated CSS (helper-only classes like
 * the Stack passthrough), falls back to the bare host rule.
 */
function litStaticStylesLine(
  ir: ComponentIR,
  hostRule = ":host { display: contents; }",
  extraHostRules = "",
): string[] {
  const componentCss = emitLitInlineCss(ir);
  const hostBody = [hostRule, extraHostRules].filter((s) => s.trim()).join(" ");
  if (!componentCss) {
    return [`  static override styles = css\`${hostBody}\`;`];
  }
  const escaped = escapeCssForLitTemplate(componentCss);
  return [
    `  static override styles = css\``,
    `    ${hostBody}`,
    ...escaped.split("\n").map((line) => `    ${line}`.trimEnd() || "    "),
    `  \`;`,
  ];
}

/**
 * Map a TypeScript type string from React conventions to Lit-safe types via
 * the shared non-React translator. Lit components are plain DOM elements,
 * so React-specific types collapse to web-platform / `unknown` stand-ins.
 */
function litType(typeStr: string): string {
  return translateNonReactType(typeStr);
}

/**
 * Lower a framework-neutral PropTypeIR into a Lit/TS type expression. Reads the
 * structured `propType` (ref from `propType.to`, fallback via the legacy string
 * path on `propType.raw`, V1 kinds via the canonical string) so output is
 * byte-identical. (CODEGEN-PROP-TYPE-IR-PILOT-01, slice 2)
 */
function lowerLitPropType(pt: PropTypeIR): string {
  switch (pt.kind) {
    case "ref":
      return litType(pt.to);
    case "fallback":
      return litType(pt.raw);
    default:
      return litType(canonicalTsType(pt));
  }
}

/** Decorator-option classification from the neutral type (ref/fallback resolve via the existing path). */
function litPropertyTypeFromPropType(
  pt: PropTypeIR,
  definedTypes?: Record<string, ContractTypeDef>,
): LitPropertyDecorator {
  switch (pt.kind) {
    case "ref":
      return litPropertyType(pt.to, definedTypes);
    case "fallback":
      return litPropertyType(pt.raw, definedTypes);
    default:
      return litPropertyType(canonicalTsType(pt), definedTypes);
  }
}

/**
 * Apply a Lit-only type alias rename to a TypeScript type expression so that
 * property declarations reference the renamed alias. Word-boundary match
 * avoids touching substrings.
 */
function applyLitTypeRename(
  typeStr: string,
  rename: { from: string; to: string } | null,
): string {
  if (!rename) return typeStr;
  return typeStr.replace(new RegExp(`\\b${rename.from}\\b`, "g"), rename.to);
}

// Use the shared toKebab from contract.ts so Lit component-source kebabbing
// matches everywhere else (in particular the Lit test generator, which uses
// the same shared util via test-plan.ts). The previous local `toKebabCase`
// inserted a hyphen before *every* capital letter and produced names like
// `fsds-o-t-p` that didn't match `plan.testId` ("fsds-otp").
function toKebabCase(name: string): string {
  return toKebab(name);
}

/**
 * Build a Lit-template-safe accessor expression for an internal field bound
 * to a contract prop. Three rules:
 *   - Kebab-case prop → bracket access (`this["data-foo"]`).
 *   - Method-name collision (animate, scrollTo…) → renamed `_${name}` field
 *     emitted earlier to avoid shadowing the inherited Element method.
 *   - Normal camelCase → dot access (`this.foo`).
 */
function propAccessor(propName: string): string {
  if (propName.includes("-")) return `this["${propName}"]`;
  if (LIT_ELEMENT_METHOD_NAMES.has(propName)) return `this._${propName}`;
  return `this.${propName}`;
}

/**
 * Lower a `prop:X` reference to a Lit template expression. Post-V2
 * (BINDING-EXPRESSION-V2-01), iteration locals reach the emitter as
 * `iterationLocal`-kind bindings, never as `prop:` bindings — so this
 * always routes through `propAccessor` (which prefixes `this.` or
 * `this["..."]` for hyphenated names). The legacy
 * `iterationScope.has(propName)` shortcut is removed.
 */
function litPropAccessor(propName: string, ctx: LitRenderContext): string {
  void ctx;
  return propAccessor(propName);
}

/**
 * Append a dotted property path to a base Lit template expression.
 * BINDING-EXPRESSION-V2-PATH-01: identical lowering across all five
 * frameworks because `.x.y` is template-agnostic syntax.
 */
function appendPath(base: string, path: readonly string[] | undefined): string {
  if (!path || path.length === 0) return base;
  return `${base}.${path.join(".")}`;
}

/**
 * Resolve an `iterationLocal`-kind binding to the Lit iteration
 * callback parameter name. Lit's emit wraps the iterated subtree in
 * `.map((item, index) => html\`...\`)` (array) or
 * `Array.from({ length: N }, (_, index) => html\`...\`)` (count) —
 * the bare identifier matches the iteration's declared `itemVar` /
 * `indexVar`.
 */
function litIterationLocalName(
  local: "index" | "item",
  ctx: LitRenderContext,
): string | null {
  const it = ctx.enclosingIteration;
  if (!it) return null;
  if (local === "index") return it.indexVar;
  return it.itemVar ?? null;
}

// ---------------------------------------------------------------------------
// Import block
// ---------------------------------------------------------------------------

function generateImports(ir: ComponentIR): string {
  const hasClassMap =
    ir.classRecipe.valueModifiers.length > 0 ||
    ir.classRecipe.booleanModifiers.length > 0;

  const litImports = ["LitElement", "html", "css"];
  const decorators = ["property"];
  const directives: string[] = [];

  if (hasClassMap) directives.push("classMap");

  const lines: string[] = [
    `import { ${litImports.join(", ")} } from 'lit';`,
    `import { ${decorators.join(", ")} } from 'lit/decorators.js';`,
  ];
  if (directives.length > 0) {
    lines.push(
      `import { ${directives.join(", ")} } from 'lit/directives/class-map.js';`,
    );
  }
  // Use a relative import to the primitives barrel rather than the
  // package self-reference: tsup/tsc can't resolve `@full-stack-ds/lit/
  // primitives` during the package's own DTS build, since the published
  // dist doesn't exist yet at that point.
  lines.push(
    `import { StackElement as _Stack } from '../../primitives/index.js';`,
  );

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Type aliases
// ---------------------------------------------------------------------------

/**
 * Lit element classes are named `${ir.name}Element`. Some contracts declare
 * a `definedTypes` alias with the same name (e.g. `ListElement` for the `as`
 * prop's union of "ul"/"ol"/"dl") — TypeScript then sees both the type alias
 * and the class in the same module and raises TS2300 duplicate identifier.
 *
 * For Lit only, the colliding alias is renamed `${ir.name}As` everywhere it
 * appears: in the alias declaration line itself, and in every `litType()`
 * lookup for prop types that reference it. The change is purely lexical
 * within the generated module — the contract is untouched, and other
 * framework emitters (Vue/Angular/Svelte) continue to use the original name.
 */
function litAliasRename(ir: ComponentIR): { from: string; to: string } | null {
  const collidingName = `${ir.name}Element`;
  if (ir.definedTypes[collidingName]) {
    return { from: collidingName, to: `${ir.name}As` };
  }
  return null;
}

function applyLitAliasRename(
  source: string,
  rename: { from: string; to: string } | null,
): string {
  if (!rename) return source;
  // Word-boundary replace to avoid mangling unrelated identifiers.
  const re = new RegExp(`\\b${rename.from}\\b`, "g");
  return source.replace(re, rename.to);
}

function generateTypes(ir: ComponentIR): string {
  const aliases = emitNonReactTypeAliases(ir).join("\n");
  return applyLitAliasRename(aliases, litAliasRename(ir));
}

// ---------------------------------------------------------------------------
// Class body
// ---------------------------------------------------------------------------

// Props that Lit handles natively or shouldn't become @property declarations.
// children → <slot>, className → React convention (class handled by classRecipe).
// id/title/lang/dir are inherited from HTMLElement with non-optional types
// — redeclaring them as `?:` triggers TS2416 (subtype conflict) and cascades
// into TS2345 on customElements.define(). Users still set them as attributes.
const LIT_SKIP_PROPS = new Set([
  "class",
  "style",
  "children",
  "className",
  "id",
  "title",
  "lang",
  "dir",
  "slot",
  "tabIndex",
  "draggable",
  "role",
]);

// `LitElement` inherits the `ARIAMixin` interface via `HTMLElement`. Every
// `aria-*` attribute has a corresponding camelCase IDL accessor typed
// `string | null` (NOT `string | undefined`, and NOT `boolean` — even
// boolean-shaped ARIA attrs like `aria-pressed` accept `"true"`/`"false"`/
// `"mixed"` strings at the DOM level). Declaring `@property() ariaLabel?:
// string` produces TS2416 because `string | undefined` isn't assignable to
// `string | null`. Emit ARIA props through the `override` path with
// `string | null` and `reflect: true` so the attribute round-trips to the
// DOM for assistive tech.
const ARIA_MIXIN_NAMES = new Set([
  "ariaActiveDescendant",
  "ariaAtomic",
  "ariaAutoComplete",
  "ariaBrailleLabel",
  "ariaBrailleRoleDescription",
  "ariaBusy",
  "ariaChecked",
  "ariaColCount",
  "ariaColIndex",
  "ariaColIndexText",
  "ariaColSpan",
  "ariaCurrent",
  "ariaDescription",
  "ariaDisabled",
  "ariaExpanded",
  "ariaHasPopup",
  "ariaHidden",
  "ariaInvalid",
  "ariaKeyShortcuts",
  "ariaLabel",
  "ariaLevel",
  "ariaLive",
  "ariaModal",
  "ariaMultiLine",
  "ariaMultiSelectable",
  "ariaOrientation",
  "ariaPlaceholder",
  "ariaPosInSet",
  "ariaPressed",
  "ariaReadOnly",
  "ariaRelevant",
  "ariaRequired",
  "ariaRoleDescription",
  "ariaRowCount",
  "ariaRowIndex",
  "ariaRowIndexText",
  "ariaRowSpan",
  "ariaSelected",
  "ariaSetSize",
  "ariaSort",
  "ariaValueMax",
  "ariaValueMin",
  "ariaValueNow",
  "ariaValueText",
]);

// `LitElement` (via `HTMLElement` / `Element`) exposes a handful of bare-name
// methods/accessors that contracts have historically used as prop names
// (`animate` on Skeleton). Declaring an `@property() animate?: string` shadows
// `Element.animate()` and breaks TypeScript subtyping. Treat the same way as
// ARIA props: emit through a kebab-attribute string property under a
// non-colliding internal field name (`_animate`).
const LIT_ELEMENT_METHOD_NAMES = new Set([
  "animate",
  "scroll",
  "scrollTo",
  "scrollBy",
  "scrollIntoView",
  "focus",
  "blur",
  "click",
]);

/**
 * Translate a camelCase ARIA prop name to its kebab-case HTML attribute name.
 * Single special-case: `ariaLabelledBy` → `aria-labelledby` (not `-labelled-by`).
 */
function ariaCamelToKebab(name: string): string {
  // Strip "aria" prefix, lowercase the rest with kebab insertion.
  const rest = name.slice(4);
  let out = "aria";
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];
    if (i === 0) {
      out += "-" + ch.toLowerCase();
    } else if (/[A-Z]/.test(ch)) {
      out += ch.toLowerCase();
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Decide how a contract-prop type should be reflected as a Lit
 * `@property()` decorator option. Three buckets:
 *
 *   - `null`: not a declarative property at all (event handlers,
 *     function-valued props). Caller should skip emitting an
 *     @property declaration entirely.
 *
 *   - `{ kind: "primitive", type: "Boolean" | "Number" | "String" }`:
 *     a primitive that Lit's built-in attribute<->property
 *     converter understands. Emit `@property({ type: <T> })`.
 *
 *   - `{ kind: "internal" }`: a complex type (array, object, union
 *     including object types, Date, etc.) that Lit's built-in
 *     converter doesn't handle. Emit `@property({ attribute: false })`
 *     so Lit does NOT try to reflect the value to an HTML attribute.
 *     Consumers set the property directly on the element instance.
 *
 * Source of truth: Lit's built-in attribute converter handles
 * Boolean/Number/String only (per the Lit 3 docs). Non-primitive
 * @property declarations without `attribute: false` produce
 * lit-analyzer warnings 'The built in converter doesn't handle the
 * property type X' (rules: incompatible-property-type +
 * no-incompatible-type-binding).
 */
type LitPropertyDecorator =
  | null
  | { kind: "primitive"; type: "Boolean" | "Number" | "String" }
  | { kind: "internal" };

function litPropertyType(
  rawType: string,
  definedTypes?: Record<string, ContractTypeDef>,
): LitPropertyDecorator {
  // Event handlers are not declarative Lit properties — skip them.
  if (
    rawType.includes("EventHandler") ||
    rawType.includes("=> void") ||
    rawType.includes("=> never") ||
    rawType.includes("Function")
  )
    return null;
  const t = litType(rawType);
  if (t === "boolean") return { kind: "primitive", type: "Boolean" };
  if (t === "number") return { kind: "primitive", type: "Number" };
  if (t === "string") return { kind: "primitive", type: "String" };
  // Named string-union aliases (e.g. `TabsAppearance = "underline" | "pills"`)
  // are attribute-reflectable as plain strings. Without this, declaring the
  // prop as `attribute: false` would decouple the HTML attribute from the
  // property and break `el.setAttribute("appearance", "pills")` usage.
  if (definedTypes) {
    const def = definedTypes[rawType];
    if (
      def?.kind === "union" &&
      Array.isArray(def.values) &&
      def.values.every((v) => typeof v === "string")
    ) {
      return { kind: "primitive", type: "String" };
    }
  }
  // Anything else — array, object, named interface, union of object
  // types, Date, etc. — is not attribute-reflectable via Lit's
  // built-in converter. Emit as an internal-only property.
  return { kind: "internal" };
}

/** Format the decorator options string for a LitPropertyDecorator. */
function litPropertyDecoratorOptions(spec: LitPropertyDecorator): string {
  if (spec === null) {
    throw new Error(
      "litPropertyDecoratorOptions called on a null spec; caller should have skipped emission.",
    );
  }
  if (spec.kind === "primitive") {
    return `{ type: ${spec.type} }`;
  }
  return `{ attribute: false }`;
}

function generatePropertyDeclarations(ir: ComponentIR): string[] {
  const lines: string[] = [];
  const declared = new Set<string>();
  const rename = litAliasRename(ir);

  for (const p of ir.styledProps) {
    if (LIT_SKIP_PROPS.has(p.name)) continue;
    if (ARIA_MIXIN_NAMES.has(p.name)) {
      lines.push(
        `  @property({ attribute: '${ariaCamelToKebab(p.name)}', reflect: true })`,
      );
      lines.push(`  override ${p.name}: string | null = null;`);
      declared.add(p.name);
      continue;
    }
    if (LIT_ELEMENT_METHOD_NAMES.has(p.name)) {
      // Rename the public field to `_<name>` and bind the kebab attribute
      // to it so it doesn't shadow the inherited Element method (animate,
      // scrollTo, etc.). Preserve the contract's type and default — the
      // field still drives BEM class output, and consumers set the attribute
      // by its kebab name, not via the JS field directly.
      const t = applyLitTypeRename(lowerLitPropType(p.propType), rename);
      const defaultPart =
        p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
      lines.push(`  @property({ attribute: '${toKebab(p.name)}' })`);
      lines.push(`  _${p.name}?: ${t}${defaultPart};`);
      declared.add(p.name);
      continue;
    }
    const litPropType = litPropertyTypeFromPropType(p.propType, ir.definedTypes);
    const t = applyLitTypeRename(lowerLitPropType(p.propType), rename);
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    const defaultPart =
      p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
    // litPropertyType returns null for function-typed and other non-
    // attribute-reflectable props. Emit them with `attribute: false`
    // rather than dropping them entirely — callbacks like onDismiss must
    // exist on the element class so consumers can set them via JS and so
    // event bindings in render (`@click=${this.onDismiss}`) typecheck.
    // Pre-IR-DOM-BINDING-CAPABILITY-01 these were silently dropped.
    const decoratorOptions =
      litPropType === null
        ? "{ attribute: false }"
        : litPropertyDecoratorOptions(litPropType);
    lines.push(`  @property(${decoratorOptions})`);
    lines.push(`  ${propName}?: ${t}${defaultPart};`);
    declared.add(p.name);
  }

  // Variant dimensions referenced in classMap but not in styledProps need
  // their own @property declarations so `this.<dim>` resolves on the element.
  for (const dim of Object.keys(ir.variants)) {
    if (declared.has(dim) || LIT_SKIP_PROPS.has(dim)) continue;
    lines.push(`  @property({ type: String })`);
    lines.push(`  ${dim}?: string;`);
    declared.add(dim);
  }

  return lines;
}

function generateClassMapObject(ir: ComponentIR): string {
  const { classRecipe } = ir;
  const entries: string[] = [];

  entries.push(`      '${classRecipe.base}': true,`);

  for (const mod of classRecipe.valueModifiers) {
    const acc = propAccessor(mod.propName);
    entries.push(`      [\`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${acc}}\`]: !!${acc},`);
  }

  for (const mod of classRecipe.booleanModifiers) {
    const acc = propAccessor(mod.propName);
    entries.push(`      '${classRecipe.base}--${mod.safeName}': !!${acc},`);
  }

  return entries.join("\n");
}

/**
 * Emit an additional LitElement class for a compound part (e.g. ModalHeader,
 * ModalBody). Stateless wrapper: one BEM block class plus an optional
 * `as` / `variant` forwarded to <fsds-stack>.
 */
function generateCompoundPartClass(
  ir: ComponentIR,
  part: { name: string; semanticElement?: string; layoutVariant?: string },
): string {
  const subName = `${ir.name}${part.name[0].toUpperCase()}${part.name.slice(1)}`;
  const className = `${subName}Element`;
  const elementName = `fsds-${toKebabCase(subName)}`;
  const cssClass = `${ir.cssPrefix}__${part.name}`;
  const asAttr =
    part.semanticElement && part.semanticElement !== "div"
      ? ` as="${part.semanticElement}"`
      : "";
  const variantAttr =
    part.layoutVariant === "horizontal" ? ` variant="horizontal"` : "";

  return [
    `export class ${className} extends LitElement {`,
    ...litStaticStylesLine(ir),
    ``,
    `  override render() {`,
    `    return html\`<fsds-stack${asAttr}${variantAttr} class="${cssClass}"><slot></slot></fsds-stack>\`;`,
    `  }`,
    `}`,
    ``,
    `customElements.define('${elementName}', ${className});`,
  ].join("\n");
}

function generateClassBody(ir: ComponentIR): string {
  const lines: string[] = [];
  const elementName = `fsds-${toKebabCase(ir.name)}`;
  const className = `${ir.name}Element`;
  const asAttr = ir.root.element !== "div" ? ` as="${ir.root.element}"` : "";
  const roleAttr = ir.root.effectiveRole
    ? ` role="${ir.root.effectiveRole}"`
    : "";
  const hasClassMap =
    ir.classRecipe.valueModifiers.length > 0 ||
    ir.classRecipe.booleanModifiers.length > 0;

  lines.push(`export class ${className} extends LitElement {`);
  lines.push(...litStaticStylesLine(ir));
  lines.push(``);

  const propLines = generatePropertyDeclarations(ir);
  if (propLines.length > 0) {
    lines.push(...propLines);
    lines.push(``);
  }

  lines.push(`  override render() {`);
  if (hasClassMap) {
    lines.push(`    const classes = {`);
    lines.push(generateClassMapObject(ir));
    lines.push(`    };`);
    lines.push(
      `    return html\`<fsds-stack${asAttr}${roleAttr} class=\${classMap(classes)}><slot></slot></fsds-stack>\`;`,
    );
  } else {
    lines.push(
      `    return html\`<fsds-stack${asAttr}${roleAttr} class="${ir.classRecipe.base}"><slot></slot></fsds-stack>\`;`,
    );
  }
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`customElements.define('${elementName}', ${className});`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Compound-state-container component emitter (Tabs-shaped)
// ---------------------------------------------------------------------------

/**
 * Generate the Lit component source for a compound-state-container (Tabs).
 *
 * This emits four LitElement classes:
 *   - `<Name>Element` — root provider: holds the behavior, calls provideContext
 *   - `<Name>ListElement` — tablist host + keyboard handler
 *   - `<Name>TabElement` — single tab button, reads context, registers/unregisters
 *   - `<Name>PanelElement` — content panel, gated by activeTab
 */
function generateCompoundStateImports(ir: ComponentIR): string {
  const hasClassMap =
    ir.classRecipe.valueModifiers.length > 0 ||
    ir.classRecipe.booleanModifiers.length > 0;
  const lines: string[] = [
    `import { LitElement, html, css } from 'lit';`,
    `import { property } from 'lit/decorators.js';`,
  ];
  if (hasClassMap) {
    lines.push(`import { classMap } from 'lit/directives/class-map.js';`);
  }
  lines.push(
    `import { ${ir.name}Behavior } from './${ir.name}Behavior.js';`,
    `import {`,
    `  createCompoundContext,`,
    `  provideContext,`,
    `  ContextConsumerController,`,
    `} from '../../primitives/index.js';`,
  );
  return lines.join("\n");
}

function generateCompoundStateTypes(ir: ComponentIR): string {
  const lines: string[] = [];
  // Re-emit the orientation + activationMode type aliases.
  const aliases = emitNonReactTypeAliases(ir);
  if (aliases.length > 0) lines.push(aliases.join("\n"));

  // Context value interface.
  lines.push(``);
  lines.push(`export interface ${ir.name}ContextValue {`);
  lines.push(`  activeTab: string;`);
  lines.push(`  setActiveTab: (value: string) => void;`);
  lines.push(`  registerTab: (value: string) => void;`);
  lines.push(`  unregisterTab: (value: string) => void;`);
  lines.push(`  registeredTabs: string[];`);
  lines.push(`  idBase: string;`);
  lines.push(`  orientation: "horizontal" | "vertical";`);
  lines.push(`  activationMode: "automatic" | "manual";`);
  lines.push(`  loop: boolean;`);
  lines.push(`  unmountInactive: boolean;`);
  lines.push(`}`);

  // Context token (exported so sub-elements can import it).
  lines.push(``);
  lines.push(`const TABS_CTX = createCompoundContext<${ir.name}ContextValue>("${ir.name}");`);
  lines.push(`export { TABS_CTX };`);

  return lines.join("\n");
}

function generateCompoundStateRootClass(ir: ComponentIR): string {
  const className = `${ir.name}Element`;
  const elementName = `fsds-${toKebabCase(ir.name)}`;
  const cssBase = ir.classRecipe.base;

  const lines: string[] = [];
  lines.push(`export class ${className} extends LitElement {`);
  lines.push(...litStaticStylesLine(ir));
  lines.push(``);
  // Property declarations come from the IR so any variant added to the
  // contract (e.g. appearance) emits a real @property and lands in the
  // BEM class composition below. Hardcoding the prop list here would
  // silently drop new variants — see #20.
  const propLines = generatePropertyDeclarations(ir);
  // generatePropertyDeclarations skips function-typed props (channel
  // callbacks like onValueChange). For the compound-state-container
  // path, emit them explicitly so consumers can listen.
  const rename = litAliasRename(ir);
  const declaredNames = new Set(
    propLines
      .filter((line) => line.includes(":") && !line.startsWith("  @"))
      .map((line) => line.trim().match(/^([_a-zA-Z][\w]*)\??:/)?.[1] ?? "")
      .filter(Boolean),
  );
  const channelLines: string[] = [];
  for (const ch of ir.behavior.normalizedChannels) {
    if (declaredNames.has(ch.changeHandlerProp)) continue;
    const t = applyLitTypeRename(ch.valueType ?? "unknown", rename);
    channelLines.push(
      `  @property({ attribute: false }) ${ch.changeHandlerProp}?: (value: ${t}) => void;`,
    );
  }
  if (propLines.length > 0 || channelLines.length > 0) {
    lines.push(...propLines);
    lines.push(...channelLines);
    lines.push(``);
  }
  lines.push(`  private behavior = new ${ir.name}Behavior(this, {`);
  lines.push(`    value: () => this.value,`);
  lines.push(`    defaultValue: this.defaultValue,`);
  lines.push(`    onValueChange: (v) => this.onValueChange?.(v),`);
  lines.push(`  });`);
  lines.push(``);
  // idBase: use attribute if supplied, otherwise use a stable element id (set lazily).
  lines.push(`  private _generatedIdBase: string | null = null;`);
  lines.push(``);
  lines.push(`  private get resolvedIdBase(): string {`);
  lines.push(`    if (this.idBase) return this.idBase;`);
  lines.push(`    if (!this._generatedIdBase) {`);
  lines.push(`      this._generatedIdBase = "fsds-tabs-" + Math.random().toString(36).slice(2, 8);`);
  lines.push(`    }`);
  lines.push(`    return this._generatedIdBase;`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  override connectedCallback(): void {`);
  lines.push(`    super.connectedCallback();`);
  lines.push(`    // Sync the behavior's internal state from defaultValue if no controlled`);
  lines.push(`    // value was set. This handles the case where defaultValue is set after`);
  lines.push(`    // element construction (property set order issue with class fields).`);
  lines.push(`    if (this.value === undefined && this.defaultValue !== undefined) {`);
  lines.push(`      this.behavior.activeTabState["_internal"] = this.defaultValue;`);
  lines.push(`    }`);
  lines.push(`    this._provideCtx();`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  override updated(): void {`);
  lines.push(`    this._provideCtx();`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  private _provideCtx(): void {`);
  lines.push(`    if (!this.isConnected) return;`);
  lines.push(`    provideContext(this, TABS_CTX.key, {`);
  lines.push(`      activeTab: this.behavior.activeTab,`);
  lines.push(`      setActiveTab: (v: string) => { this.behavior.setActiveTab(v); this._provideCtx(); },`);
  lines.push(`      registerTab: (v: string) => { this.behavior.registerTab(v); this._provideCtx(); },`);
  lines.push(`      unregisterTab: (v: string) => { this.behavior.unregisterTab(v); this._provideCtx(); },`);
  lines.push(`      registeredTabs: this.behavior.registeredTabs,`);
  lines.push(`      idBase: this.resolvedIdBase,`);
  lines.push(`      orientation: this.orientation ?? "horizontal",`);
  lines.push(`      activationMode: this.activationMode ?? "automatic",`);
  lines.push(`      loop: this.loop ?? true,`);
  lines.push(`      unmountInactive: this.unmountInactive ?? true,`);
  lines.push(`    });`);
  lines.push(`  }`);
  lines.push(``);
  // Class composition is derived from the IR's classRecipe so that any
  // variant declared in the contract (orientation, activationMode,
  // appearance, …) automatically appears in the rendered class list.
  const hasClassMap =
    ir.classRecipe.valueModifiers.length > 0 ||
    ir.classRecipe.booleanModifiers.length > 0;

  lines.push(`  override render() {`);
  if (hasClassMap) {
    lines.push(`    const classes = {`);
    lines.push(generateClassMapObject(ir));
    lines.push(`    };`);
    lines.push(
      `    return html\`<div class=\${classMap(classes)}><slot></slot></div>\`;`,
    );
  } else {
    lines.push(
      `    return html\`<div class="${cssBase}"><slot></slot></div>\`;`,
    );
  }
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`customElements.define('${elementName}', ${className});`);

  return lines.join("\n");
}

function generateTabsListClass(ir: ComponentIR): string {
  const subName = `${ir.name}List`;
  const className = `${subName}Element`;
  const elementName = `fsds-${toKebabCase(subName)}`;
  const cssClass = `${ir.classRecipe.base}__list`;

  const lines: string[] = [];
  lines.push(`export class ${className} extends LitElement {`);
  lines.push(...litStaticStylesLine(ir));
  lines.push(``);
  lines.push(`  private _ctx = new ContextConsumerController(this, TABS_CTX);`);
  lines.push(``);
  lines.push(`  private _handleKeyDown = (e: KeyboardEvent): void => {`);
  lines.push(`    let ctx: ${ir.name}ContextValue;`);
  lines.push(`    try { ctx = this._ctx.value; } catch { return; }`);
  lines.push(`    const tabs = ctx.registeredTabs;`);
  lines.push(`    if (tabs.length === 0) return;`);
  lines.push(`    const currentIndex = tabs.indexOf(ctx.activeTab);`);
  lines.push(`    const isHorizontal = ctx.orientation !== "vertical";`);
  lines.push(`    let nextIndex = currentIndex;`);
  lines.push(`    if ((isHorizontal && e.key === "ArrowRight") || (!isHorizontal && e.key === "ArrowDown")) {`);
  lines.push(`      e.preventDefault();`);
  lines.push(`      nextIndex = ctx.loop ? (currentIndex + 1) % tabs.length : Math.min(currentIndex + 1, tabs.length - 1);`);
  lines.push(`    } else if ((isHorizontal && e.key === "ArrowLeft") || (!isHorizontal && e.key === "ArrowUp")) {`);
  lines.push(`      e.preventDefault();`);
  lines.push(`      nextIndex = ctx.loop ? (currentIndex - 1 + tabs.length) % tabs.length : Math.max(currentIndex - 1, 0);`);
  lines.push(`    } else if (e.key === "Home") {`);
  lines.push(`      e.preventDefault();`);
  lines.push(`      nextIndex = 0;`);
  lines.push(`    } else if (e.key === "End") {`);
  lines.push(`      e.preventDefault();`);
  lines.push(`      nextIndex = tabs.length - 1;`);
  lines.push(`    } else if (e.key === "Enter" || e.key === " ") {`);
  lines.push(`      if (ctx.activationMode === "manual") {`);
  lines.push(`        e.preventDefault();`);
  lines.push(`        // Find the currently focused tab host (it has data-value and role="tab").`);
  lines.push(`        const focusedTab = this.querySelector("[role=\\"tab\\"]:focus") as HTMLElement | null;`);
  lines.push(`        const val = focusedTab?.getAttribute("data-value");`);
  lines.push(`        if (val) ctx.setActiveTab(val);`);
  lines.push(`      }`);
  lines.push(`      return;`);
  lines.push(`    } else {`);
  lines.push(`      return;`);
  lines.push(`    }`);
  lines.push(`    const targetValue = tabs[nextIndex];`);
  lines.push(`    if (ctx.activationMode === "automatic") {`);
  lines.push(`      ctx.setActiveTab(targetValue);`);
  lines.push(`    }`);
  lines.push(`    // Focus the target tab host element (which now has role="tab" on the host).`);
  lines.push(`    const targetTabHost = this.querySelector(\`[data-value="\${targetValue}"]\`) as HTMLElement | null;`);
  lines.push(`    targetTabHost?.focus();`);
  lines.push(`  };`);
  lines.push(``);
  lines.push(`  override connectedCallback(): void {`);
  lines.push(`    super.connectedCallback();`);
  lines.push(`    this.addEventListener("keydown", this._handleKeyDown);`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  override disconnectedCallback(): void {`);
  lines.push(`    this.removeEventListener("keydown", this._handleKeyDown);`);
  lines.push(`    super.disconnectedCallback();`);
  lines.push(`  }`);
  lines.push(``);
  // TABS-INDICATOR-REALIZATION-01: declared DOM realization of the
  // group-host ornament (e.g. Tabs's `indicator`) as a sibling of the
  // default slot. Visual treatment and motion live in the contract's
  // styles.json / Tabs.css. aria-hidden because it's a non-interactive
  // decoration that's announced via the active tab's aria-selected.
  const ornamentPart = getGroupHostOrnamentPart(ir);
  const ornamentMarkup = ornamentPart
    ? `<span class="${ir.classRecipe.base}__${ornamentPart.name}" aria-hidden="true"></span>`
    : "";

  lines.push(`  override render() {`);
  lines.push(`    let orientation = "horizontal";`);
  lines.push(`    try { orientation = this._ctx.value.orientation; } catch { /* no context yet */ }`);
  lines.push(`    return html\`<div class="${cssClass}" role="tablist" aria-orientation="\${orientation}"><slot></slot>${ornamentMarkup}</div>\`;`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`customElements.define('${elementName}', ${className});`);

  return lines.join("\n");
}

function generateTabsTabClass(ir: ComponentIR): string {
  const subName = `${ir.name}Tab`;
  const className = `${subName}Element`;
  const elementName = `fsds-${toKebabCase(subName)}`;
  const cssClass = `${ir.classRecipe.base}__tab`;

  const lines: string[] = [];
  // The host element itself acts as the interactive tab: role, id, aria-* and
  // tabindex are set on the host so that aria-controls can reference the panel
  // id across the light DOM. Shadow DOM IDs are not visible to aria-controls.
  // The host renders only a <slot> — no nested interactive element.
  lines.push(`export class ${className} extends LitElement {`);
  lines.push(`  // Host element IS the tab — ARIA attrs on the host, slot-only shadow.`);
  lines.push(
    ...litStaticStylesLine(
      ir,
      ":host { display: inline-flex; cursor: pointer; }",
      ':host([disabled]), :host([aria-disabled="true"]) { cursor: not-allowed; pointer-events: none; }',
    ),
  );
  lines.push(``);
  lines.push(`  @property() value = "";`);
  lines.push(`  @property({ type: Boolean }) disabled?: boolean;`);
  lines.push(``);
  lines.push(`  private _ctx = new ContextConsumerController(this, TABS_CTX);`);
  lines.push(``);
  lines.push(`  private _onClick = (): void => { if (!this.disabled) { try { this._ctx.value.setActiveTab(this.value); } catch { /* no context */ } } };`);
  lines.push(``);
  lines.push(`  override connectedCallback(): void {`);
  lines.push(`    super.connectedCallback();`);
  lines.push(`    this.addEventListener("click", this._onClick);`);
  lines.push(`    // Register after the context is available (provider fires provideContext in connectedCallback).`);
  lines.push(`    // Use a microtask so the provider has connected first.`);
  lines.push(`    Promise.resolve().then(() => {`);
  lines.push(`      if (!this.isConnected) return;`);
  lines.push(`      try { this._ctx.value.registerTab(this.value); } catch { /* no context */ }`);
  lines.push(`    });`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  override disconnectedCallback(): void {`);
  lines.push(`    this.removeEventListener("click", this._onClick);`);
  lines.push(`    try { this._ctx.value.unregisterTab(this.value); } catch { /* no context */ }`);
  lines.push(`    super.disconnectedCallback();`);
  lines.push(`  }`);
  lines.push(``);
  // Reflect ARIA and identity attrs onto the host element so aria-controls
  // can resolve the panel id across the light DOM boundary.
  // The HOST is the tab interactive element; shadow DOM renders only the slot.
  lines.push(`  private _updateHostAttrs(isActive: boolean, idBase: string): void {`);
  lines.push(`    this.setAttribute("role", "tab");`);
  lines.push(`    this.setAttribute("id", \`\${idBase}-tab-\${this.value}\`);`);
  lines.push(`    this.setAttribute("aria-controls", \`\${idBase}-panel-\${this.value}\`);`);
  lines.push(`    this.setAttribute("aria-selected", isActive ? "true" : "false");`);
  lines.push(`    this.setAttribute("tabindex", isActive ? "0" : "-1");`);
  lines.push(`    this.setAttribute("data-value", this.value);`);
  lines.push(`    if (this.disabled) this.setAttribute("aria-disabled", "true");`);
  lines.push(`    else this.removeAttribute("aria-disabled");`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  override render() {`);
  lines.push(`    let isActive = false;`);
  lines.push(`    let idBase = "";`);
  lines.push(`    try {`);
  lines.push(`      const ctx = this._ctx.value;`);
  lines.push(`      isActive = ctx.activeTab === this.value;`);
  lines.push(`      idBase = ctx.idBase;`);
  lines.push(`    } catch { /* no context yet */ }`);
  lines.push(`    this._updateHostAttrs(isActive, idBase);`);
  lines.push(`    // Render slot only — host IS the interactive element, no nested button needed.`);
  lines.push(`    const cssClasses = [\`${cssClass}\`, isActive ? \`${cssClass}--active\` : ""].filter(Boolean).join(" ");`);
  lines.push(`    this.className = cssClasses;`);
  lines.push(`    return html\`<slot></slot>\`;`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`customElements.define('${elementName}', ${className});`);

  return lines.join("\n");
}

function generateTabsPanelClass(ir: ComponentIR): string {
  const subName = `${ir.name}Panel`;
  const className = `${subName}Element`;
  const elementName = `fsds-${toKebabCase(subName)}`;
  const cssClass = `${ir.classRecipe.base}__panel`;

  const lines: string[] = [];
  // Like TabsTab, put role/id/aria-labelledby/tabindex on the HOST element so
  // aria-labelledby can resolve the tab id across the light DOM boundary.
  lines.push(`export class ${className} extends LitElement {`);
  lines.push(
    ...litStaticStylesLine(
      ir,
      ":host { display: block; }",
      ":host([hidden]) { display: none !important; }",
    ),
  );
  lines.push(``);
  lines.push(`  @property() value = "";`);
  lines.push(``);
  lines.push(`  private _ctx = new ContextConsumerController(this, TABS_CTX);`);
  lines.push(``);
  lines.push(`  private _updateHostAttrs(isActive: boolean, unmountInactive: boolean, idBase: string): void {`);
  lines.push(`    this.setAttribute("role", "tabpanel");`);
  lines.push(`    this.setAttribute("id", \`\${idBase}-panel-\${this.value}\`);`);
  lines.push(`    this.setAttribute("aria-labelledby", \`\${idBase}-tab-\${this.value}\`);`);
  lines.push(`    this.setAttribute("tabindex", "0");`);
  lines.push(`    if (!unmountInactive) {`);
  lines.push(`      // Keep all panels in the DOM; toggle hidden attribute.`);
  lines.push(`      if (isActive) this.removeAttribute("hidden");`);
  lines.push(`      else this.setAttribute("hidden", "");`);
  lines.push(`    } else {`);
  lines.push(`      this.removeAttribute("hidden");`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  override render() {`);
  lines.push(`    let isActive = false;`);
  lines.push(`    let unmountInactive = true;`);
  lines.push(`    let idBase = "";`);
  lines.push(`    try {`);
  lines.push(`      const ctx = this._ctx.value;`);
  lines.push(`      isActive = ctx.activeTab === this.value;`);
  lines.push(`      unmountInactive = ctx.unmountInactive;`);
  lines.push(`      idBase = ctx.idBase;`);
  lines.push(`    } catch { /* no context yet */ }`);
  lines.push(`    this._updateHostAttrs(isActive, unmountInactive, idBase);`);
  lines.push(`    if (unmountInactive && !isActive) return html\`\`;`);
  lines.push(`    return html\`<div class="${cssClass}"><slot></slot></div>\`;`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`customElements.define('${elementName}', ${className});`);

  return lines.join("\n");
}

function generateCompoundStateSource(ir: ComponentIR): string {
  const importsBody = generateCompoundStateImports(ir);
  const typesBody = generateCompoundStateTypes(ir);
  const componentBody = [
    generateCompoundStateRootClass(ir),
    "",
    generateTabsListClass(ir),
    "",
    generateTabsTabClass(ir),
    "",
    generateTabsPanelClass(ir),
  ].join("\n");

  const blank = (): Section => ({ kind: "between", body: "" });
  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "component", body: componentBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
  ];

  return renderSections(sections, "line");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Emit a Lit `LitElement` class source for a `ComponentIR`. The file is
 * partitioned with section markers so hand-authored additions survive
 * regeneration.
 */
export function generateLitComponentSource(ir: ComponentIR): string {
  // Compound-state-container components (Tabs-shaped) get a bespoke emitter
  // that produces four LitElement classes instead of the generic wrapper.
  if (isCompoundStateContainer(ir)) {
    return generateCompoundStateSource(ir);
  }

  const typesBody = generateTypes(ir);
  // Lit framework boundary: parts whose native realization is in the
  // HTML table content model set (TABLE_COMPOSITION_TAGS) CANNOT be
  // exported as autonomous custom elements. Autonomous custom elements
  // host themselves as their custom tag (`<fsds-table-row>`), and the
  // browser's table content parser hoists or discards foreign elements
  // inside <table>/<thead>/<tbody>/<tfoot>. Shipping
  // `customElements.define('fsds-table-row', ...)` would encode an
  // invalid table semantic. Instead, the root <fsds-table> shadow
  // template owns the full native table structure via anatomy.dom +
  // slots; consumers compose by placing native <tr>/<td>/<th>
  // elements into named slots.
  //
  // Doctrine: this filter is intentionally Lit-only. React/Vue/Svelte
  // emit native subcomponents (no custom-element constraint); Angular
  // uses attribute selectors that attach to native hosts. Lit alone
  // is forced to suppress subcomponent emission for these parts.
  const compoundClasses = ir.compoundParts
    .filter(
      (part) =>
        !(part.nativeTag && TABLE_COMPOSITION_TAGS.has(part.nativeTag)),
    )
    .map((part) => generateCompoundPartClass(ir, part))
    .join("\n\n");
  const componentBody =
    (ir.dom ? generateDomTreeClassBody(ir) : generateClassBody(ir)) +
    (compoundClasses ? "\n\n" + compoundClasses : "");

  // Imports depend on what the rendered class body actually references.
  // We conditionally emit directive imports only when at least one
  // rendered binding uses the directive. Mirrors the same pattern used
  // by `treeUsesNgIf` in the Angular emitter — only declare imports the
  // template actually consumes. IR-DOM-CSS-VAR-BINDING-01 adds the
  // `styleMap` directive for `cssVariableBindings` lowering.
  const usesIfDefined = componentBody.includes("ifDefined(");
  const usesStyleMap = componentBody.includes("styleMap(");
  const baseImports = ir.dom ? generateDomTreeImports(ir) : generateImports(ir);
  const directiveImports: string[] = [];
  if (usesIfDefined) {
    directiveImports.push(`import { ifDefined } from 'lit/directives/if-defined.js';`);
  }
  if (usesStyleMap) {
    directiveImports.push(`import { styleMap } from 'lit/directives/style-map.js';`);
  }
  const importsBody = directiveImports.length > 0
    ? `${baseImports}\n${directiveImports.join("\n")}`
    : baseImports;

  const blank = (): Section => ({ kind: "between", body: "" });
  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "component", body: componentBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
  ];

  return renderSections(sections, "line");
}

// ---------------------------------------------------------------------------
// DOM-tree-driven component (B.2c)
// ---------------------------------------------------------------------------

function generateDomTreeImports(ir: ComponentIR): string {
  const litImports = ["LitElement", "html", "css", "nothing"];
  const lines: string[] = [`import { ${litImports.join(", ")} } from 'lit';`];
  // Always include `property`; add `state` when the dom tree has a children
  // guard so the private _hasChildren reactive field can be declared.
  const decorators = ["property"];
  if (ir.dom && treeHasChildrenGuard(ir.dom)) {
    decorators.push("state");
  }
  lines.push(`import { ${decorators.join(", ")} } from 'lit/decorators.js';`);
  if (ir.behavior.normalizedChannels.length > 0) {
    lines.push(`import { ${ir.name}Behavior } from './${ir.name}Behavior.js';`);
  }
  if (
    resolveSurfaceAutoDismiss(ir) &&
    ir.behavior.normalizedChannels.some((c) => c.valueType === "boolean")
  ) {
    lines.push(`import { AutoDismissController } from '../../primitives/index.js';`);
  }
  return lines.join("\n");
}

/** Walk a DomNodeIR tree and return true if any node has ifProp === "children". */
function treeHasChildrenGuard(node: DomNodeIR): boolean {
  if (node.ifProp === "children") return true;
  return node.children.some(treeHasChildrenGuard);
}

function generateDomTreeClassBody(ir: ComponentIR): string {
  if (!ir.dom) throw new Error("generateDomTreeClassBody requires ir.dom");

  const className = `${ir.name}Element`;
  const elementName = `fsds-${toKebabCase(ir.name)}`;
  const channels = ir.behavior.normalizedChannels;
  const channelByName = new Map(channels.map((c) => [c.name, c]));
  const styledByName = new Map(ir.styledProps.map((p) => [p.name, p]));
  const hasBehavior = channels.length > 0;

  const overlayClickTrigger = ir.behavior.normalizedDismissalTriggers.find(
    (t) => t.event === "overlayClick",
  );
  const booleanChannel = channels.find((c) => c.valueType === "boolean");
  const hasOverlayClick = !!(
    overlayClickTrigger &&
    booleanChannel &&
    hasBehavior
  );
  const ctx: LitRenderContext = {
    classRecipe: ir.classRecipe.base,
    channelByName,
    styledByName,
    isRoot: true,
    autoDismissPause: Boolean(
      resolveSurfaceAutoDismiss(ir) &&
        channels.some((c) => c.valueType === "boolean"),
    ),
    hasOverlayClick,
  };
  // Inject the contract's effective ARIA role onto the root node if the
  // contract didn't already pin one in `attrs.role`. Without this, components
  // that declare `a11y.role: "switch"` (ToggleSwitch) keep the implicit
  // `<button>` role, which makes `aria-checked` an axe-illegal attribute.
  // Mirrors how React's emitter spreads `role="switch"` onto the element.
  const rootForRender: DomNodeIR =
    ir.root.effectiveRole && !ir.dom.attrs["role"]
      ? {
          ...ir.dom,
          attrs: { ...ir.dom.attrs, role: ir.root.effectiveRole },
        }
      : ir.dom;
  const template = renderLitDomNode(rootForRender, ctx, 0);
  const hasChildrenGuard = treeHasChildrenGuard(ir.dom);

  const lines: string[] = [];
  lines.push(`export class ${className} extends LitElement {`);
  lines.push(...litStaticStylesLine(ir));
  lines.push(``);

  // Property declarations for every styled prop
  const declared = new Set<string>();
  const rename = litAliasRename(ir);
  for (const p of ir.styledProps) {
    if (LIT_DOM_SKIP_PROPS.has(p.name)) continue;
    const decl = generateLitDomTreePropertyDecl(p, rename, ir.definedTypes);
    if (decl) {
      lines.push(decl);
      declared.add(p.name);
    }
  }
  for (const ch of channels) {
    if (declared.has(ch.changeHandlerProp)) continue;
    const t = applyLitTypeRename(ch.valueType ?? "unknown", rename);
    lines.push(
      `  @property({ attribute: false }) ${ch.changeHandlerProp}?: (value: ${t}) => void;`,
    );
    declared.add(ch.changeHandlerProp);
  }
  for (const dim of Object.keys(ir.variants)) {
    if (declared.has(dim) || LIT_DOM_SKIP_PROPS.has(dim)) continue;
    lines.push(`  @property() ${dim}?: string;`);
    declared.add(dim);
  }

  // If any dom node uses `if: "children"`, emit a reactive boolean that tracks
  // slot content presence — mirrors Vue's $slots.default / Svelte's {#if children}.
  if (hasChildrenGuard) {
    lines.push(``);
    lines.push(
      `  // Tracks whether any content has been slotted in — used by the`,
    );
    lines.push(
      `  // conditional label wrapper (if: "children" in the contract dom tree).`,
    );
    lines.push(`  @state() private _hasChildren = false;`);
    lines.push(``);
    lines.push(`  override firstUpdated(): void {`);
    lines.push(
      `    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;`,
    );
    lines.push(`    if (slot) {`);
    lines.push(
      `      const update = () => { this._hasChildren = slot.assignedNodes({ flatten: true }).length > 0; };`,
    );
    lines.push(`      slot.addEventListener('slotchange', update);`);
    lines.push(`      update();`);
    lines.push(`    }`);
    lines.push(`  }`);
  }

  if (hasBehavior) {
    lines.push(``);
    lines.push(`  private behavior = new ${ir.name}Behavior(this, {`);
    for (const ch of channels) {
      lines.push(`    ${ch.valueProp}: () => this.${ch.valueProp},`);
      if (ch.defaultValueProp) {
        lines.push(`    ${ch.defaultValueProp}: this.${ch.defaultValueProp},`);
      }
      lines.push(
        `    ${ch.changeHandlerProp}: (v) => this.${ch.changeHandlerProp}?.(v),`,
      );
    }
    // Forward dismissal-trigger enabledBy props.
    for (const trigger of ir.behavior.normalizedDismissalTriggers) {
      if (!trigger.enabledByProp) continue;
      lines.push(
        `    ${trigger.enabledByProp}: this.${trigger.enabledByProp},`,
      );
    }
    lines.push(`  });`);
    // Ephemeral-surface auto-dismiss (WCAG 2.2.1). The controller re-syncs
    // on host updates; pause listeners land on the template root.
    const autoDismissPolicy = resolveSurfaceAutoDismiss(ir);
    const autoDismissChannel = autoDismissPolicy
      ? channels.find((c) => c.valueType === "boolean")
      : undefined;
    if (autoDismissPolicy && autoDismissChannel) {
      lines.push(
        ``,
        `  private autoDismiss = new AutoDismissController(this, {`,
        `    open: () => Boolean(this.behavior.${autoDismissChannel.name}),`,
        `    durationMs: () => this.${autoDismissPolicy.durationProp} === undefined ? ${autoDismissPolicy.defaultMs ?? "undefined"} : this.${autoDismissPolicy.durationProp},`,
        `    onDismiss: () => this.behavior.set${capitalizeLit(autoDismissChannel.name)}(false),`,
        `  });`,
      );
    }
  }

  // Event handler methods (Lit templates can host arrow fns inline, but
  // splitting them out makes the html template cleaner and easier to test).
  //
  // The handler reads the new value off the native DOM event. Type extraction:
  //   boolean → input.checked
  //   number  → Number(input.value)
  //   string  → input.value
  //   Date    → input.valueAsDate  (input[type=date|datetime-local|month|week])
  //
  // For value types that can't be read from a DOM input (Date[], custom shapes,
  // event-shaped channels), skip the handler emission entirely. The template
  // won't reference the handler, and consumers wire the state via
  // `el.behavior.set<Name>(...)` directly.
  for (const ch of channels) {
    const handlerName = `handle${capitalizeLit(ch.name)}Change`;
    const setter = `set${capitalizeLit(ch.name)}`;
    const handlerRef = `this.${handlerName}(e)`;
    if (!template.includes(handlerRef)) {
      // Handler is unreachable — skip to avoid emitting code that mistypes
      // the channel value (e.g. reading a string into a Date setter).
      continue;
    }
    const valueExpr = litChannelValueExtraction(ch.valueType ?? "unknown");
    if (valueExpr === null) {
      // Type isn't DOM-extractable; the template shouldn't have referenced
      // the handler in the first place. Surface the contradiction instead
      // of silently generating broken code.
      throw new Error(
        `Lit codegen: ${ir.name}.${ch.name} channel has valueType "${ch.valueType}" which can't be read from a DOM input, but the rendered template references handle${capitalizeLit(ch.name)}Change. Either change the contract's valueType to a DOM-extractable scalar (boolean/number/string/Date), or remove the @change binding from the contract.`,
      );
    }
    lines.push(``);
    lines.push(`  private ${handlerName}(event: Event): void {`);
    lines.push(`    this.behavior.${setter}(${valueExpr});`);
    lines.push(`  }`);
  }

  if (hasOverlayClick && booleanChannel) {
    const setter = `set${capitalizeLit(booleanChannel.name)}`;
    const enabledProp = overlayClickTrigger?.enabledByProp;
    lines.push(``);
    lines.push(`  private _handleOverlayClick = (): void => {`);
    if (enabledProp) {
      lines.push(`    if (this.${enabledProp} !== false) {`);
      lines.push(`      this.behavior.${setter}(false);`);
      lines.push(`    }`);
    } else {
      lines.push(`    this.behavior.${setter}(false);`);
    }
    lines.push(`  };`);
    lines.push(``);
    lines.push(`  override connectedCallback(): void {`);
    lines.push(`    super.connectedCallback();`);
    lines.push(`    this.addEventListener('click', this._handleOverlayClick);`);
    lines.push(`  }`);
    lines.push(``);
    lines.push(`  override disconnectedCallback(): void {`);
    lines.push(
      `    this.removeEventListener('click', this._handleOverlayClick);`,
    );
    lines.push(`    super.disconnectedCallback();`);
    lines.push(`  }`);
  }

  // computeClasses() — analogous to React's classNames array / Vue's
  // computed `classNames` / Angular's classes() signal. Walks the BEM recipe
  // referencing instance state.
  const channelValueProps = new Set(channels.map((c) => c.valueProp));
  lines.push(``);
  lines.push(`  private computeClasses(): string {`);
  lines.push(`    return [`);
  lines.push(`      "${ir.classRecipe.base}",`);
  for (const mod of ir.classRecipe.valueModifiers) {
    const acc = propAccessor(mod.propName);
    lines.push(
      `      ${acc} ? \`${ir.classRecipe.base}--${mod.valuePrefix ?? ""}\${${acc}}\` : null,`,
    );
  }
  for (const mod of ir.classRecipe.booleanModifiers) {
    if (channelValueProps.has(mod.propName)) {
      // The behavior class exposes channel state via `get ${ch.name}()`,
      // not via valueProp — resolve channel by valueProp and use its name.
      const ch = channels.find((c) => c.valueProp === mod.propName)!;
      lines.push(
        `      this.behavior.${ch.name} ? "${ir.classRecipe.base}--${mod.safeName}" : null,`,
      );
    } else {
      lines.push(
        `      ${propAccessor(mod.safeName)} ? "${ir.classRecipe.base}--${mod.safeName}" : null,`,
      );
    }
  }
  lines.push(`    ].filter(Boolean).join(" ");`);
  lines.push(`  }`);

  lines.push(``);
  lines.push(`  override render() {`);
  lines.push(`    return html\`${template}\`;`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`customElements.define('${elementName}', ${className});`);
  return lines.join("\n");
}

function generateLitDomTreePropertyDecl(
  p: {
    name: string;
    type: string;
    propType: PropTypeIR;
    defaultExpr?: string;
    required: boolean;
  },
  rename: { from: string; to: string } | null = null,
  definedTypes?: Record<string, ContractTypeDef>,
): string | null {
  // Function-typed props (callbacks like `onDismiss?: () => void`) need to
  // exist on the Lit element class so renderLitBinding can reference
  // `this.onDismiss` from `@click=${this.onDismiss}`. Without this they
  // were silently dropped — IR-DOM-BINDING-CAPABILITY-01 surfaced the gap
  // when Alert/AlertNotice tried to project a dismiss button.
  //
  // Always emit them as `@property({ attribute: false })`: function values
  // can never round-trip through HTML attributes, so attribute reflection
  // makes no sense, but the property still must be declared so consumer
  // code can set it via JS (`el.onDismiss = handler`) and so lit-analyzer
  // does not flag the render reference as an undeclared property access.
  // A function-typed prop arrives either as a structured `callback` (PropTypeIR
  // V2) or — for legacy/un-migrated members — as a `fallback` whose raw string
  // is a function type. Both must reflect `attribute: false`; a callback value
  // can never round-trip through an HTML attribute. (CODEGEN-PROP-TYPE-IR-
  // OBSERVED-TYPES-01: the V1-era assumption "functions only arrive as fallback"
  // no longer holds once callbacks are first-class.)
  const isFunctionType =
    p.propType.kind === "callback" ||
    (p.propType.kind === "fallback" &&
      (/=>\s*(void|never|[A-Za-z])/.test(p.propType.raw) ||
        /EventHandler/.test(p.propType.raw)));
  if (isFunctionType) {
    const propType = applyLitTypeRename(lowerLitPropType(p.propType), rename);
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    return `  @property({ attribute: false }) ${propName}?: ${propType};`;
  }
  if (ARIA_MIXIN_NAMES.has(p.name)) {
    return [
      `  @property({ attribute: '${ariaCamelToKebab(p.name)}', reflect: true })`,
      `  override ${p.name}: string | null = null;`,
    ].join("\n");
  }
  if (LIT_ELEMENT_METHOD_NAMES.has(p.name)) {
    const propType = applyLitTypeRename(lowerLitPropType(p.propType), rename);
    const defaultPart = p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
    return [
      `  @property({ attribute: '${toKebab(p.name)}' })`,
      `  _${p.name}?: ${propType}${defaultPart};`,
    ].join("\n");
  }
  const propType = applyLitTypeRename(lowerLitPropType(p.propType), rename);
  const defaultPart = p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
  // Use the same policy as the legacy emitter (litPropertyType +
  // litPropertyDecoratorOptions): primitives → `{ type: <T> }`,
  // anything else → `{ attribute: false }`. This is what lit-analyzer's
  // `no-incompatible-property-type` rule expects — Lit's built-in
  // attribute<->property converter handles only Boolean/Number/String.
  // When the prop name is kebab-case, the attribute name must be
  // explicit. `attribute: false` and `attribute: 'kebab-name'` are
  // mutually exclusive — when the type is non-primitive, prefer the
  // explicit kebab attribute mapping (consumer-set via setAttribute
  // is the consumer's intent for kebab-named props), but warn via
  // the type field that the converter isn't a fit. In practice
  // contracts don't combine kebab-case names with non-primitive
  // types today, so the conflict is theoretical.
  const spec = litPropertyTypeFromPropType(p.propType, definedTypes);
  const decoratorArgs: string[] = [];
  const hasKebabName = p.name.includes("-");
  if (spec !== null) {
    if (spec.kind === "primitive") {
      decoratorArgs.push(`type: ${spec.type}`);
    } else if (!hasKebabName) {
      decoratorArgs.push("attribute: false");
    }
  }
  if (hasKebabName) {
    decoratorArgs.push(`attribute: '${p.name}'`);
  }
  const decoratorBody =
    decoratorArgs.length > 0 ? `{ ${decoratorArgs.join(", ")} }` : "";
  const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
  if (p.required && !p.defaultExpr) {
    return `  @property(${decoratorBody}) ${propName}!: ${propType};`;
  }
  return `  @property(${decoratorBody}) ${propName}?: ${propType}${defaultPart};`;
}

interface LitRenderContext {
  classRecipe: string;
  channelByName: Map<string, NormalizedChannelIR>;
  styledByName: Map<string, { type: string }>;
  isRoot: boolean;
  /** When true, bind auto-dismiss pause listeners on the template root. */
  autoDismissPause?: boolean;
  hasOverlayClick?: boolean;
  /**
   * Identifier names introduced by enclosing iteration. After
   * BINDING-EXPRESSION-V2-01 the binding-side `prop:X` lowering no
   * longer consults this set — iteration locals reach the emitter as
   * `iterationLocal`-kind bindings and dispatch via
   * `ctx.enclosingIteration`. The set survives as the resolver for the
   * `if:` guard grammar (V2 did not migrate `if:`).
   */
  iterationScope?: Set<string>;
  /**
   * Nearest enclosing iteration directive. Resolution target for
   * `iterationLocal`-kind bindings.
   */
  enclosingIteration?: IterationIR;
}

function renderLitDomNode(
  node: DomNodeIR,
  ctx: LitRenderContext,
  indent: number,
): string {
  const pad = " ".repeat(indent);

  if (node.tag === "slot" || node.tag === "children") {
    if (node.slotName) {
      return `${pad}<slot name="${node.slotName}"></slot>`;
    }
    return `${pad}<slot></slot>`;
  }

  // IR-DOM-ITERATE-CAPABILITY-01: extend iterationScope for this node
  // and every descendant when `iterate` is declared. Bindings resolve
  // `prop:item` / `prop:index` as bare locals from the map callback's
  // scope, not via `this.item`.
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
    attrs.push(`${key}="${value.replace(/"/g, "&quot;")}"`);
  }

  // IR-DOM-BINDING-CAPABILITY-01: event bindings lower to Lit's
  // `@eventname=` syntax. Critically, event handlers are NOT wrapped in
  // ifDefined() — Lit invokes the bound expression once per render to
  // produce the listener; an undefined value installs no listener
  // (silent no-op), which is exactly the right behavior for optional
  // callback props. ifDefined() would wrap the listener-producing
  // function itself, breaking listener installation.
  for (const [eventName, expr] of Object.entries(node.events)) {
    const rendered = renderLitEvent(eventName, expr, ctx, node.tag);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  for (const [key, expr] of Object.entries(node.bindings)) {
    // Dual-pathway dedup: parseDomNode mirrored `bindings.onX` into
    // `events.<x>` for back-compat. Skip the legacy attribute pass.
    if (/^on[A-Z]/.test(key)) {
      const evt = key.slice(2).toLowerCase();
      if (node.events[evt]) continue;
    }
    const rendered = renderLitBinding(key, expr, ctx, node.tag);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  // IR-DOM-CSS-VAR-BINDING-01: lower `cssVarBindings` to Lit's
  // `style=${styleMap({ '--fsds-foo': value })}` directive form.
  // styleMap accepts arbitrary string keys (including CSS custom
  // properties), and lit-analyzer types non-known property values as
  // `string | undefined`, so cast non-string sources with `String(...)`
  // to avoid no-incompatible-type-binding. The `styleMap` directive
  // import is conditionally injected by the imports-body scan
  // (`usesStyleMap`) so files that don't reference it stay clean.
  if (node.cssVarBindings.length > 0) {
    const entries: string[] = [];
    for (const { varName, value } of node.cssVarBindings) {
      const valueExpr = renderLitBindingValue(value, ctx);
      if (valueExpr === null) continue;
      // styleMap value slots are typed `string | undefined`. Prop and
      // channel sources may carry non-string types (number/boolean),
      // so coerce with String(). But a literal `String(undefined)`
      // serializes to the string "undefined", which styleMap then sets
      // as `--fsds-foo: undefined;` — a parseable but semantically
      // wrong CSS declaration that overrides the var() rule's
      // fallback. The runtime rail caught this on Progress (default
      // props have no `value`, so the inline emit produced
      // `--fsds-progress-fill-width: undefined`, blocking the CSS
      // rule's `var(..., 0)` fallback from resolving).
      //
      // Lowering becomes:
      //   <expr> === undefined ? undefined : String(<expr>)
      // — preserves styleMap's "omit when undefined" semantics while
      // satisfying lit-analyzer's `string | undefined` typing for
      // arbitrary custom-property slots. Iteration aliases (loop
      // locals) can't be undefined in the iterated scope, but using
      // a uniform expression keeps the emit branch-free.
      entries.push(
        `'${varName}': ${valueExpr} === undefined ? undefined : String(${valueExpr})`,
      );
    }
    if (entries.length > 0) {
      attrs.push(`style=\${styleMap({ ${entries.join(", ")} })}`);
    }
  }

  // Tag channel-guarded subtrees with `data-fsds-channel-renders="${name}"`
  // so behavioral tests can assert that the channel state is reflected in
  // the rendered DOM, not just in the behavior controller. The attribute is
  // only emitted for channel-driven guards (not `children` slot guards or
  // arbitrary-prop guards), since those have different test semantics.
  if (node.ifProp && node.ifProp !== "children") {
    const matchingChannel = [...ctx.channelByName.values()].find(
      (c) => c.valueProp === node.ifProp || c.name === node.ifProp,
    );
    if (matchingChannel) {
      attrs.push(`data-fsds-channel-renders="${matchingChannel.name}"`);
    }
  }

  if (ctx.isRoot) {
    attrs.unshift(`class="\${this.computeClasses()}"`);
    if (ctx.autoDismissPause) {
      attrs.push(
        `@pointerenter=\${this.autoDismiss.pauseListeners.pointerenter}`,
        `@pointerleave=\${this.autoDismiss.pauseListeners.pointerleave}`,
        `@focusin=\${this.autoDismiss.pauseListeners.focusin}`,
        `@focusout=\${this.autoDismiss.pauseListeners.focusout}`,
      );
    }
  } else if (classParts.length > 0) {
    if (classParts.length === 1) {
      attrs.unshift(`class=\${${classParts[0]}}`);
    } else {
      attrs.unshift(`class=\${[${classParts.join(", ")}].join(' ')}`);
    }
  }

  if (!ctx.isRoot && ctx.hasOverlayClick && node.attrs["role"] === "dialog") {
    attrs.push(`@click=\${(e: Event) => e.stopPropagation()}`);
  }

  const childCtx: LitRenderContext = { ...ctx, isRoot: false };
  const renderedChildren = node.children.map((c) =>
    renderLitDomNode(c, childCtx, indent + 2),
  );

  // IR-DOM-BINDING-CAPABILITY-01: content binding lowers to a `${...}`
  // interpolation as the element's child content. Lit's html`` tagged
  // template invokes the expression once per render; the result is
  // rendered as text or a nested template depending on its type
  // (Lit's renderer handles strings, nodes, and templates uniformly).
  // Mutually exclusive with children — parseDomNode rejects the
  // combination. Inline (no newline) because most content bindings are
  // short value interpolations, not block elements.
  let contentInline: string | null = null;
  if (node.content) {
    const contentExpr = renderLitContent(node.content, ctx);
    if (contentExpr !== null) contentInline = contentExpr;
  }

  const tag = node.tag;
  const isVoidEl = VOID_HTML_ELEMENTS_LIT.has(tag);

  let body: string;
  if (contentInline !== null && renderedChildren.length === 0) {
    body = `${pad}<${tag}${formatLitAttrs(attrs)}>${contentInline}</${tag}>`;
  } else if (renderedChildren.length === 0 && isVoidEl) {
    body = `${pad}<${tag}${formatLitAttrs(attrs)} />`;
  } else if (renderedChildren.length === 0) {
    body = `${pad}<${tag}${formatLitAttrs(attrs)}></${tag}>`;
  } else {
    body = [
      `${pad}<${tag}${formatLitAttrs(attrs)}>`,
      ...renderedChildren,
      `${pad}</${tag}>`,
    ].join("\n");
  }

  let withIfGuard = body;
  if (node.ifProp) {
    if (node.ifProp === "children") {
      // Guard the label wrapper on slot presence, mirroring Vue's `v-if="$slots.default"`
      // and Svelte's `{#if children}`. Lit doesn't expose a synchronous
      // "is anything slotted?" API, so we track it with a reactive `_hasChildren`
      // state property that gets flipped true/false via a `slotchange` listener
      // on the inner <slot>. The class body generator injects this property and
      // the handler when it detects any `if: "children"` node in the tree.
      withIfGuard = `\${this._hasChildren ? html\`\n${body}\n${pad}\` : nothing}`;
    } else {
      // IR-DOM-ITERATE-CAPABILITY-01: iteration aliases match before
      // channel lookup. A guard `if: "item"` resolves to the bare
      // local introduced by the surrounding .map callback.
      const matchingChannel = [...ctx.channelByName.values()].find(
        (c) => c.valueProp === node.ifProp || c.name === node.ifProp,
      );
      const expr = ctx.iterationScope?.has(node.ifProp)
        ? node.ifProp
        : matchingChannel
          ? `this.behavior.${matchingChannel.name}`
          : `this.${node.ifProp}`;
      const condition = node.ifNegated ? `!${expr}` : expr;
      withIfGuard = `${pad}\${${condition} ? html\`\n${body}\n${pad}\` : nothing}`;
    }
  }

  // IR-DOM-ITERATE-CAPABILITY-01: iteration wrap as the outermost
  // layer. Lit's html-template arrays render natively, so a bare
  // `.map(...)` returning an array of html fragments works without
  // explicit `repeat()` directive (which would be needed only for
  // keyed reconciliation of reorderable lists — not relevant here
  // since iteration sources are count or non-reorderable arrays).
  //
  //   kind="array": ${items.map((item, index) => html`...`)}
  //   kind="count": ${Array.from({ length: count }, (_, index) => html`...`)}
  if (node.iteration) {
    const { kind, source, indexVar, itemVar } = node.iteration;
    const params = kind === "array" ? `${itemVar}, ${indexVar}` : `_, ${indexVar}`;
    // PRODUCTION-ARRAY-ITERATION-CONSUMER-01: route iteration source
    // through the binding-value renderer. The previous bare `this.X`
    // happened to work for `prop:X` because Lit components expose props
    // as instance fields, but channel-driven sources should resolve to
    // `this.behavior.X` (the controllable-state value), not the raw
    // `@property` field. Going through `renderLitBindingValue` keeps
    // the dispatch source-uniform.
    const sourceExpr = renderLitBindingValue(source, ctx);
    if (sourceExpr === null) {
      throw new Error(
        `Lit emitter: iteration source could not be lowered (source kind=${source.kind})`,
      );
    }
    const arrowSource =
      kind === "array"
        ? `(${sourceExpr} ?? []).map((${params}) => html\`\n${withIfGuard}\n${pad}\`)`
        : `Array.from({ length: ${sourceExpr} ?? 0 }, (${params}) => html\`\n${withIfGuard}\n${pad}\`)`;
    return `${pad}\${${arrowSource}}`;
  }
  return withIfGuard;
}

// Attributes that should be bound as plain HTML attributes (no `.` prefix
// in Lit's html template), not DOM properties. Covers two cases:
//   1. `data-*` and `aria-*` — not real DOM properties on most elements
//   2. Native HTML attrs that have a read-only IDL property of the same name
//      (e.g. `HTMLLabelElement.form` returns the associated form *element*
//      and can't be assigned). The codegen doesn't know which root tag the
//      template emits at binding time, so we conservatively list common
//      readonly-IDL names here.
const LIT_READONLY_IDL_NAMES = new Set(["form", "labels", "list", "options"]);

function isAttributeOnlyBinding(attr: string): boolean {
  if (attr.startsWith("aria-") || attr.startsWith("data-")) return true;
  return LIT_READONLY_IDL_NAMES.has(attr);
}

/**
 * Lower a React-style camelCase contract binding key to its HTML-native DOM
 * attribute name for Lit templates. Lit (like Vue/Svelte) passes attribute
 * names through to the rendered HTML, so a `htmlFor` binding key would emit the
 * non-standard `htmlfor` attribute instead of the DOM `for` — breaking the
 * <label> for-association. Mirrors vueAttrName and the Svelte equivalent. The
 * value still reads from the `htmlFor` @property; only the emitted attribute
 * name is lowered. (className is handled separately by the class recipe.)
 */
function litDomAttrName(name: string): string {
  if (name === "htmlFor") return "for";
  return name;
}

const LIT_FORM_HOSTS = new Set(["input", "textarea", "select"]);

/**
 * Host-aware channel event lowering (FIX-CHANNEL-EVENT-LOWERING-001):
 * reading element state (.checked/.value) is only valid on form hosts.
 * A channel click on a button/div host toggles the boolean channel,
 * matching react/vue/svelte/react-native.
 */
function litChannelEventBinding(
  eventName: string,
  ch: NormalizedChannelIR,
  tag: string | undefined,
): string {
  if (ch.callbackKind === "event") {
    return `@${eventName}=\${(e: Event) => this.${ch.changeHandlerProp}?.(e)}`;
  }
  if (!LIT_FORM_HOSTS.has(tag ?? "") && ch.valueType === "boolean") {
    const setter = `set${capitalizeLit(ch.name)}`;
    return `@${eventName}=\${() => this.behavior.${setter}(!this.behavior.${ch.name})}`;
  }
  const handlerName = `handle${capitalizeLit(ch.name)}Change`;
  return `@${eventName}=\${(e: Event) => this.${handlerName}(e)}`;
}

function renderLitBinding(
  rawAttr: string,
  expr: BindingExpression,
  ctx: LitRenderContext,
  tag?: string,
): string | null {
  const attr = litDomAttrName(rawAttr);
  switch (expr.kind) {
    case "prop": {
      const prop = ctx.styledByName.get(expr.prop);
      // BINDING-EXPRESSION-V2-PATH-01: when a path is present, the
      // projected field's type is unknown to the emitter — the
      // prop.type string describes only the root prop, not nested
      // members. Special-case coercions (boolean attribute binding,
      // ARIA string serialization, ARIA-mixin null coercion) are
      // only applied when the binding reads the raw prop. With a
      // path, fall through to the generic attribute binding with
      // ifDefined.
      const hasPath = expr.path !== undefined && expr.path.length > 0;
      const isBoolean = !hasPath && prop ? /\bboolean\b/.test(prop.type) : false;
      // ARIA-mixin props (`ariaLabel`, `ariaDescribedby`, etc.) are
      // declared as `string | null` because the underlying DOM IDL
      // (ARIAMixin) typing is `string | null`. Coerce null to
      // undefined before handing to `ifDefined` so a null value
      // omits the attribute rather than serializing as the literal
      // string "null". Other props are declared `T | undefined` and
      // need no coercion.
      //
      // Post-V2 (BINDING-EXPRESSION-V2-01): iteration locals never
      // reach this branch — they come in as `iterationLocal`-kind
      // bindings and are handled in the dedicated case below.
      const isAriaMixin = !hasPath && ARIA_MIXIN_NAMES.has(expr.prop);
      const rawAcc = appendPath(propAccessor(expr.prop), expr.path);
      const acc = isAriaMixin ? `${rawAcc} ?? undefined` : rawAcc;
      // Every styled prop is declared as `propName?: T` in the Lit
      // emitter (see generatePropertyDeclarations), so at the field
      // type level the value is always `T | undefined` regardless of
      // the IR `required` flag. Lit's `ifDefined` directive on an
      // attribute binding handles `undefined` correctly: it removes
      // the attribute when the value is undefined and sets it
      // otherwise. lit-analyzer's strict-typing rules require this
      // for any non-boolean attribute binding whose source can be
      // undefined (no-incompatible-type-binding).
      //
      // ARIA attributes are always string-valued at the DOM level
      // even when the contract types them as boolean (e.g.
      // `aria-pressed`). Emit a plain `attr=` binding that lets the
      // value coerce to "true"/"false" rather than `?attr=`
      // boolean-attribute presence/absence, which is structurally
      // wrong for ARIA semantics ("aria-pressed=false" is meaningful,
      // while `?aria-pressed=${false}` removes the attribute).
      // When the underlying prop is boolean, serialize as the
      // explicit `'true'`/`'false'` string the ARIA spec expects —
      // lit-analyzer's HTML data model types these attribute slots
      // as the strict union `"true" | "false" | undefined` and
      // refuses `boolean | undefined`. The ternary preserves
      // undefined so `ifDefined` can omit the attribute when unset.
      if (attr.startsWith("aria-")) {
        if (isBoolean) {
          return `${attr}=\${ifDefined(${rawAcc} === undefined ? undefined : (${rawAcc} ? 'true' : 'false'))}`;
        }
        return `${attr}=\${ifDefined(${acc})}`;
      }
      if (isBoolean) {
        // Boolean attrs → `?attr=` (Lit boolean attribute binding).
        // Coerce `undefined` to `false` so the type narrows to
        // `boolean` and lit-analyzer accepts it. Runtime semantics
        // are unchanged: undefined and false both produce attribute
        // absence in Lit's boolean-attribute binding.
        return `?${attr}=\${${rawAcc} ?? false}`;
      }
      // Attribute binding for every other case. The previous default
      // emitted `.${attr}=` (DOM property binding), but Lit's
      // property-binding syntax sets `el[attr] = undefined` literally
      // when the value is undefined — lit-analyzer rejects this
      // because the underlying DOM IDL is typed `string`. Switching
      // to attribute binding with `ifDefined` is the canonical
      // lit-html idiom for optional values: attribute set when
      // defined, removed when undefined, with no DOM-property
      // assignment of undefined.
      return `${attr}=\${ifDefined(${acc})}`;
    }
    case "literal":
      return `${attr}="${expr.value.replace(/"/g, "&quot;")}"`;
    case "iterationLocal": {
      // Iteration locals are loop-scope locals introduced by the
      // surrounding `.map((item, index) => html\`\`)` / `Array.from`
      // callback — never undefined, no `ifDefined` wrap needed.
      // Paths on `iter:item.field` are projected directly; the field's
      // value may itself be undefined (no compile-time guarantee), but
      // emitting `item.field` matches the contract author's intent and
      // lets the underlying type-checker flag mismatches.
      const name = litIterationLocalName(expr.local, ctx);
      if (!name) return null;
      const acc = appendPath(name, expr.path);
      if (attr.startsWith("aria-")) {
        return `${attr}=\${${acc}}`;
      }
      if (isAttributeOnlyBinding(attr)) {
        return `${attr}=\${${acc}}`;
      }
      return `.${attr}=\${${acc}}`;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        // BINDING-EXPRESSION-V2-PATH-01: ch.valueType describes the
        // channel's value at the root; a path-projected field's type
        // is opaque to the emitter. Skip boolean-coercion shortcuts
        // when a path is present and emit a plain expression — the
        // type-checker on the consumer side handles shape.
        const hasPath = expr.path !== undefined && expr.path.length > 0;
        const channelAcc = appendPath(`this.behavior.${ch.name}`, expr.path);
        // ARIA attrs are always string-typed at the DOM. For boolean channels
        // (`aria-checked`, `aria-pressed`, `aria-selected`), serialize the
        // value as the explicit `"true"`/`"false"` string the ARIA spec
        // expects — `?aria-checked=` would collapse to attribute-presence
        // ("aria-checked=\"\"") which is structurally invalid, and plain
        // `aria-checked=${false}` would serialize as `aria-checked="false"`
        // (valid but axe correctly flags it when the role doesn't permit it).
        if (attr.startsWith("aria-")) {
          if (!hasPath && ch.valueType === "boolean") {
            return `${attr}=\${${channelAcc} ? 'true' : 'false'}`;
          }
          return `${attr}=\${${channelAcc}}`;
        }
        if (!hasPath && ch.valueType === "boolean") {
          return `?${attr}=\${${channelAcc}}`;
        }
        if (isAttributeOnlyBinding(attr)) {
          return `${attr}=\${${channelAcc}}`;
        }
        return `.${attr}=\${${channelAcc}}`;
      }
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        if (isAttributeOnlyBinding(attr)) {
          return `${attr}=\${this.${ch.defaultValueProp}}`;
        }
        return `.${attr}=\${this.${ch.defaultValueProp}}`;
      }
      // onChange synthesis — bind to a method on the class.
      // Event-shaped channels pass the raw event to the consumer's
      // change handler property; consumer drives state externally.
      const eventName = mapJsxEventToLit(attr);
      return litChannelEventBinding(eventName, ch, tag);
    }
    case "predicate": {
      // BINDING-EXPRESSION-V2-PREDICATE-01. Predicate result is
      // boolean. ARIA boolean attrs need the explicit `"true"`/`"false"`
      // string serialization Lit's templates use for boolean channels;
      // other attribute slots get the bare boolean.
      const lowered = renderLitPredicate(expr, ctx);
      if (lowered === null) return null;
      if (attr.startsWith("aria-")) {
        return `${attr}=\${(${lowered}) ? 'true' : 'false'}`;
      }
      if (isAttributeOnlyBinding(attr)) {
        return `${attr}=\${${lowered}}`;
      }
      return `.${attr}=\${${lowered}}`;
    }
  }
}

/**
 * Lower a content binding to the bare Lit template expression that goes
 * inside `${...}` interpolation. For `prop:X` returns `this.X`; for
 * `literal:X` returns the JSON-quoted literal; for `channel:X.value`
 * returns `this.behavior.X`.
 */
function renderLitContent(
  expr: BindingExpression,
  ctx: LitRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `\${${appendPath(litPropAccessor(expr.prop, ctx), expr.path)}}`;
    case "literal":
      return expr.value.replace(/[<>&]/g, (c) =>
        c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;",
      );
    case "iterationLocal": {
      const name = litIterationLocalName(expr.local, ctx);
      return name ? `\${${appendPath(name, expr.path)}}` : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") return `\${${appendPath(`this.behavior.${ch.name}`, expr.path)}}`;
      return null;
    }
    case "predicate": {
      // BINDING-EXPRESSION-V2-PREDICATE-01: defensive (validator
      // rejects predicate in content position). Returns the boolean
      // expression wrapped in template interpolation.
      const lowered = renderLitPredicate(expr, ctx);
      return lowered === null ? null : `\${${lowered}}`;
    }
  }
}

/**
 * Lower a predicate-kind binding to a Lit template-expression string
 * (no `${...}` scaffold). Operand accessors come from
 * `renderLitBindingValue`.
 */
function renderLitPredicate(
  expr: BindingExpression & { kind: "predicate" },
  ctx: LitRenderContext,
): string | null {
  const left = renderLitBindingValue(expr.left, ctx);
  const right = renderLitBindingValue(expr.right, ctx);
  if (left === null || right === null) return null;
  return loweredLitPredicate(expr.op, left, right);
}

function loweredLitPredicate(op: BindingPredicateOp, left: string, right: string): string {
  switch (op) {
    case "eq":
      return `(${left} === ${right})`;
    case "contains":
      return `((${left} ?? []).includes(${right}))`;
    case "memberOf":
      return `(Array.isArray(${right}) ? ${right}.includes(${left}) : ${left} === ${right})`;
  }
}

/**
 * Lower a BindingExpression to a bare TS expression usable inside a Lit
 * template's `${...}` interpolation (e.g. as an entry value in a
 * `styleMap({...})` directive). Distinct from `renderLitContent` because
 * the latter wraps prop/channel cases in their own `${...}` for embedding
 * directly into the `html\`...\`` text context, and HTML-escapes literals
 * — wrong for object-literal/JS-expression positions.
 */
function renderLitBindingValue(
  expr: BindingExpression,
  ctx: LitRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return appendPath(litPropAccessor(expr.prop, ctx), expr.path);
    case "literal":
      return JSON.stringify(expr.value);
    case "iterationLocal": {
      const name = litIterationLocalName(expr.local, ctx);
      return name ? appendPath(name, expr.path) : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") return appendPath(`this.behavior.${ch.name}`, expr.path);
      return null;
    }
    case "predicate":
      // BINDING-EXPRESSION-V2-PREDICATE-01.
      return renderLitPredicate(expr, ctx);
  }
}

/**
 * Lower an entry from `node.events` into Lit's `@eventname=${...}` form.
 * For `prop:X` returns `@click=${this.X}` — NOT wrapped in ifDefined()
 * because Lit installs no listener when the value is undefined, which
 * is the correct behavior for optional callbacks. ifDefined() would
 * apply to attribute bindings, not event bindings.
 */
function renderLitEvent(
  eventName: string,
  expr: BindingExpression,
  ctx: LitRenderContext,
  tag?: string,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `@${eventName}=\${${litPropAccessor(expr.prop, ctx)}}`;
    case "literal":
      // Rare. Inline as a string handler — would need eval at runtime;
      // emit verbatim and let the consumer catch authoring errors.
      return `@${eventName}="${expr.value.replace(/"/g, "&quot;")}"`;
    case "iterationLocal": {
      // Iteration locals are values, not callables. Drop the binding —
      // the IR validator would already reject a contract that routes
      // iter:index to an event.
      void ctx;
      return null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      return litChannelEventBinding(eventName, ch, tag);
    }
    case "predicate":
      // BINDING-EXPRESSION-V2-PREDICATE-01: validator rejects this at
      // IR-build; the case keeps the switch exhaustive.
      return null;
  }
}

function mapJsxEventToLit(attr: string): string {
  if (attr === "onChange") return "change";
  if (attr === "onClick") return "click";
  if (attr === "onInput") return "input";
  if (attr === "onKeyDown") return "keydown";
  if (attr === "onFocus") return "focus";
  if (attr === "onBlur") return "blur";
  if (attr.startsWith("on") && attr.length > 2) {
    return attr.slice(2).toLowerCase();
  }
  return attr;
}

function formatLitAttrs(attrs: string[]): string {
  if (attrs.length === 0) return "";
  return " " + attrs.join(" ");
}

function capitalizeLit(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Map a channel's TypeScript value type to the DOM expression that reads the
 * post-change value off a native input element. Returns `null` when the type
 * isn't DOM-extractable from a single `<input>` (e.g. `Date[]` ranges,
 * complex object shapes) — the caller decides whether to skip emission or
 * surface an error.
 *
 * Supports:
 *   boolean        → input.checked      (checkbox-style)
 *   number         → Number(input.value)
 *   string         → input.value
 *   Date           → input.valueAsDate  (input[type=date|datetime-local|month|week])
 *   Date | null    → input.valueAsDate
 */
function litChannelValueExtraction(valueType: string): string | null {
  if (valueType === "boolean") {
    return `(event.target as HTMLInputElement).checked`;
  }
  if (valueType === "number") {
    return `Number((event.target as HTMLInputElement).value)`;
  }
  if (valueType === "string") {
    return `(event.target as HTMLInputElement).value`;
  }
  // Date or `Date | null` (but not `Date[]` or `Date | Date[] | null`).
  if (/^Date(\s*\|\s*null)?$/.test(valueType.trim())) {
    return `(event.target as HTMLInputElement).valueAsDate`;
  }
  return null;
}

const LIT_DOM_SKIP_PROPS = new Set([
  // HTMLElement built-ins that conflict with declared types
  "id",
  "title",
  "lang",
  "dir",
  "slot",
  "tabIndex",
  "draggable",
  "role",
  // class is the user's passthrough — handled separately in computeClasses
  "class",
  "style",
  "className",
  "children",
]);

const VOID_HTML_ELEMENTS_LIT = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
