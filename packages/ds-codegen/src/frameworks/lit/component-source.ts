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
  ComponentIR,
  DomNodeIR,
  NormalizedChannelIR,
} from "../../ir.js";
import {
  emitNonReactTypeAliases,
  translateNonReactType,
} from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";
import { toKebab } from "../../contract.js";

/**
 * Map a TypeScript type string from React conventions to Lit-safe types via
 * the shared non-React translator. Lit components are plain DOM elements,
 * so React-specific types collapse to web-platform / `unknown` stand-ins.
 */
function litType(typeStr: string): string {
  return translateNonReactType(typeStr);
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

function litPropertyType(rawType: string): string | null {
  // Event handlers are not declarative Lit properties — skip them.
  if (
    rawType.includes("EventHandler") ||
    rawType.includes("=> void") ||
    rawType.includes("=> never") ||
    rawType.includes("Function")
  )
    return null;
  const t = litType(rawType);
  if (t === "boolean") return "Boolean";
  if (t === "number") return "Number";
  return "String";
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
      const t = applyLitTypeRename(litType(p.type), rename);
      const defaultPart =
        p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
      lines.push(`  @property({ attribute: '${toKebab(p.name)}' })`);
      lines.push(`  _${p.name}?: ${t}${defaultPart};`);
      declared.add(p.name);
      continue;
    }
    const litPropType = litPropertyType(p.type);
    if (litPropType === null) continue;
    const t = applyLitTypeRename(litType(p.type), rename);
    const propName = p.name.includes("-") ? `"${p.name}"` : p.name;
    const defaultPart =
      p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
    lines.push(`  @property({ type: ${litPropType} })`);
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
    entries.push(`      [\`${classRecipe.base}--\${${acc}}\`]: !!${acc},`);
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
    `  static override styles = css\`:host { display: contents; }\`;`,
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
  lines.push(`  static override styles = css\`:host { display: contents; }\`;`);
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
// Public API
// ---------------------------------------------------------------------------

/**
 * Emit a Lit `LitElement` class source for a `ComponentIR`. The file is
 * partitioned with section markers so hand-authored additions survive
 * regeneration.
 */
export function generateLitComponentSource(ir: ComponentIR): string {
  const importsBody = ir.dom ? generateDomTreeImports(ir) : generateImports(ir);
  const typesBody = generateTypes(ir);
  const compoundClasses = ir.compoundParts
    .map((part) => generateCompoundPartClass(ir, part))
    .join("\n\n");
  const componentBody =
    (ir.dom ? generateDomTreeClassBody(ir) : generateClassBody(ir)) +
    (compoundClasses ? "\n\n" + compoundClasses : "");

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
  lines.push(`  static override styles = css\`:host { display: contents; }\`;`);
  lines.push(``);

  // Property declarations for every styled prop
  const declared = new Set<string>();
  const rename = litAliasRename(ir);
  for (const p of ir.styledProps) {
    if (LIT_DOM_SKIP_PROPS.has(p.name)) continue;
    const decl = generateLitDomTreePropertyDecl(p, rename);
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
      `      ${acc} ? \`${ir.classRecipe.base}--\${${acc}}\` : null,`,
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
    defaultExpr?: string;
    required: boolean;
  },
  rename: { from: string; to: string } | null = null,
): string | null {
  const skipEventHandler = /=>\s*(void|never)|EventHandler/.test(p.type);
  if (skipEventHandler) return null;
  if (ARIA_MIXIN_NAMES.has(p.name)) {
    return [
      `  @property({ attribute: '${ariaCamelToKebab(p.name)}', reflect: true })`,
      `  override ${p.name}: string | null = null;`,
    ].join("\n");
  }
  if (LIT_ELEMENT_METHOD_NAMES.has(p.name)) {
    const propType = applyLitTypeRename(litType(p.type), rename);
    const defaultPart = p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
    return [
      `  @property({ attribute: '${toKebab(p.name)}' })`,
      `  _${p.name}?: ${propType}${defaultPart};`,
    ].join("\n");
  }
  const propType = applyLitTypeRename(litType(p.type), rename);
  const defaultPart = p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
  const decoratorArgs: string[] = [];
  if (/\bboolean\b/.test(propType)) {
    decoratorArgs.push("type: Boolean");
  } else if (/\bnumber\b/.test(propType)) {
    decoratorArgs.push("type: Number");
  }
  if (p.name.includes("-")) {
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
  hasOverlayClick?: boolean;
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

  for (const [key, expr] of Object.entries(node.bindings)) {
    const rendered = renderLitBinding(key, expr, ctx);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  if (ctx.isRoot) {
    attrs.unshift(`class="\${this.computeClasses()}"`);
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

  const tag = node.tag;
  const isVoidEl = VOID_HTML_ELEMENTS_LIT.has(tag);

  let body: string;
  if (renderedChildren.length === 0 && isVoidEl) {
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

  if (node.ifProp) {
    if (node.ifProp === "children") {
      // Guard the label wrapper on slot presence, mirroring Vue's `v-if="$slots.default"`
      // and Svelte's `{#if children}`. Lit doesn't expose a synchronous
      // "is anything slotted?" API, so we track it with a reactive `_hasChildren`
      // state property that gets flipped true/false via a `slotchange` listener
      // on the inner <slot>. The class body generator injects this property and
      // the handler when it detects any `if: "children"` node in the tree.
      return `\${this._hasChildren ? html\`\n${body}\n${pad}\` : nothing}`;
    }
    const matchingChannel = [...ctx.channelByName.values()].find(
      (c) => c.valueProp === node.ifProp || c.name === node.ifProp,
    );
    const expr = matchingChannel
      ? `this.behavior.${matchingChannel.name}`
      : `this.${node.ifProp}`;
    return `${pad}\${${expr} ? html\`\n${body}\n${pad}\` : nothing}`;
  }
  return body;
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

function renderLitBinding(
  attr: string,
  expr: BindingExpression,
  ctx: LitRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop": {
      const prop = ctx.styledByName.get(expr.prop);
      const isBoolean = prop ? /\bboolean\b/.test(prop.type) : false;
      const acc = propAccessor(expr.prop);
      // ARIA attributes are always string-valued at the DOM level even when
      // the contract types them as boolean (e.g. `aria-pressed`). Emit a
      // plain `attr=` binding that lets the value coerce to "true"/"false"
      // rather than `?attr=` boolean-attribute presence/absence, which is
      // structurally wrong for ARIA semantics ("aria-pressed=false" is
      // meaningful, while `?aria-pressed=${false}` removes the attribute).
      if (attr.startsWith("aria-")) {
        return `${attr}=\${${acc}}`;
      }
      if (isBoolean) {
        // Boolean attrs → `?attr=` (Lit boolean attribute binding).
        return `?${attr}=\${${acc}}`;
      }
      if (isAttributeOnlyBinding(attr)) {
        // Plain attribute binding: data-*/aria-* aren't real DOM properties,
        // and a handful of native attributes (HTMLLabelElement.form,
        // HTMLInputElement.list) are read-only IDL properties on their
        // host element — Lit's `.prop=` syntax tries to assign and throws.
        return `${attr}=\${${acc}}`;
      }
      // Default → property binding so the value flows through the DOM IDL.
      return `.${attr}=\${${acc}}`;
    }
    case "literal":
      return `${attr}="${expr.value.replace(/"/g, "&quot;")}"`;
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        // ARIA attrs are always string-typed at the DOM. For boolean channels
        // (`aria-checked`, `aria-pressed`, `aria-selected`), serialize the
        // value as the explicit `"true"`/`"false"` string the ARIA spec
        // expects — `?aria-checked=` would collapse to attribute-presence
        // ("aria-checked=\"\"") which is structurally invalid, and plain
        // `aria-checked=${false}` would serialize as `aria-checked="false"`
        // (valid but axe correctly flags it when the role doesn't permit it).
        if (attr.startsWith("aria-")) {
          if (ch.valueType === "boolean") {
            return `${attr}=\${this.behavior.${ch.name} ? 'true' : 'false'}`;
          }
          return `${attr}=\${this.behavior.${ch.name}}`;
        }
        if (ch.valueType === "boolean") {
          return `?${attr}=\${this.behavior.${ch.name}}`;
        }
        if (isAttributeOnlyBinding(attr)) {
          return `${attr}=\${this.behavior.${ch.name}}`;
        }
        return `.${attr}=\${this.behavior.${ch.name}}`;
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
      if (ch.callbackKind === "event") {
        return `@${eventName}=\${(e: Event) => this.${ch.changeHandlerProp}?.(e)}`;
      }
      const handlerName = `handle${capitalizeLit(ch.name)}Change`;
      return `@${eventName}=\${(e: Event) => this.${handlerName}(e)}`;
    }
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
