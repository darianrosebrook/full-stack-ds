/**
 * SwiftUI View struct emission.
 *
 * Two IR-described emission classes:
 *
 * 1. Native-collapse (round 2, CODEGEN-NON-WEB-ROUND2-SWITCH-01): contracts
 *    whose anatomy declares `native-toggle-affordance` (Switch,
 *    ToggleSwitch) collapse to SwiftUI `Toggle(.switch)` — the multi-part
 *    anatomy describes a single native affordance on this target.
 *
 * 2. Projected-children action (FEAT-SWIFTUI-MULTIPART-BUTTON-01): the
 *    first multi-part path. Admits contracts whose root is a native action
 *    affordance (`ir.root.element === "button"`) and whose dom children are
 *    exactly one projected `{tag:"children"}` region — Button is the
 *    corpus consumer. Realized as a SwiftUI `Button` whose label is the
 *    consumer's content, styled from `ir.tokenScopes` through the
 *    hand-authored `Tokens/FsdsTheme.swift` runtime (RN's normal form:
 *    components ship scope data, resolution is theme-driven at render).
 *
 * The emitter consumes only framework-neutral IR facts (channels, props,
 * defined types, collapse intents, root element, dom tree, token scopes) —
 * never component identity. Component names that collide with SwiftUI's own
 * types are exported under an `Fsds` prefix via the reserved-type table
 * below (grammar-level, the SwiftUI analog of Lit's `StackElement` rename).
 *
 * Out of scope: surfaces (Tooltip/Popover), compound parts, slot-projected
 * composers (Card/Field), hand-edit preservation via @custom sections.
 */
import type {
  ComponentIR,
  NormalizedChannelIR,
  TokenFactIR,
} from "../../../ir.js";
import { collectCollapseIntents } from "../../../ir.js";
import nodeFs from "node:fs";
import nodePath from "node:path";

const INDENT = "    ";

/**
 * Component type names reserved by SwiftUI itself. A generated type with
 * one of these names would be ambiguous for any consumer importing both
 * modules, so the target exports them with an `Fsds` prefix.
 */
const SWIFTUI_RESERVED_TYPES: ReadonlySet<string> = new Set([
  "Button",
  "Toggle",
  "Slider",
  "Picker",
  "Label",
  "Link",
  "Menu",
  "Table",
  "List",
  "Form",
  "Section",
  "Field",
  "Divider",
]);

export function swiftExportName(componentName: string): string {
  return SWIFTUI_RESERVED_TYPES.has(componentName)
    ? `Fsds${componentName}`
    : componentName;
}

export function generateSwiftUIComponentSource(ir: ComponentIR): string {
  const collapseIntents = collectCollapseIntents(ir);
  const isNativeToggle = collapseIntents.has("native-toggle-affordance");

  if (isNativeToggle) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitToggleComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isProjectedChildrenAction(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitActionComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (collapseIntents.has("native-disclosure")) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitDisclosureComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isStaticContent(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitStaticContentComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isTextValueControl(ir) && soleValueChannel(ir)!.valueType === "boolean") {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitBooleanControlComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isTextValueControl(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitTextControlComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isGlyphHost(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitGlyphHostComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (ir.root.effectiveRole === "progressbar") {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitProgressComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isBareRuleLeaf(ir) || isVisualOnlyLeaf(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitLeafComponent(ir));
    return sections.join("\n\n") + "\n";
  }

  if (isCompoundPartComposer(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(
      emitComposerComponent(ir, ir.compoundParts.map((part) => part.name)),
    );
    return sections.join("\n\n") + "\n";
  }

  if (isNamedSlotComposer(ir)) {
    const sections: string[] = [];
    sections.push(emitImports());
    sections.push(emitTypes(ir));
    sections.push(emitComposerComponent(ir, collectDomSlots(ir.dom!)));
    return sections.join("\n\n") + "\n";
  }

  throw new Error(
    `generateSwiftUIComponentSource: no emission class matches ` +
      `component "${ir.name}". Implemented classes: native-toggle-affordance ` +
      `collapse, the projected-children action root (root element button ` +
      `with a single projected children region), and the compound-part ` +
      `composer (root-dom-less passive container), the named-slot ` +
      `composer (dom tree whose leaves are all named slots), and the ` +
      `value-channel text control (input root, one string channel). ` +
      `Component-` +
      `instance leaves (e.g. TextField) and surfaces are not yet ` +
      `implemented.`,
  );
}

/**
 * The projected-children action class: a native action affordance whose
 * entire content is the consumer's projected children.
 */
function isProjectedChildrenAction(ir: ComponentIR): boolean {
  if (!ir.dom || ir.root.element !== "button") return false;
  const children = ir.dom.children ?? [];
  return (
    children.length === 1 &&
    children[0]!.tag === "children" &&
    (children[0]!.children ?? []).length === 0
  );
}

/**
 * The value-channel text-control class: a dom root `input` element with
 * exactly one string channel and no slots/surface. Input is the corpus
 * consumer. The string channel projects through the Switch-proven
 * controllable-state pattern (Binding + @State + onChange).
 */
function isTextValueControl(ir: ComponentIR): boolean {
  if (!ir.dom || ir.dom.tag !== "input") return false;
  if (ir.surface != null) return false;
  if ((ir.dom.children ?? []).length > 0) return false;
  return soleValueChannel(ir) !== null;
}

/**
 * The single scalar (string or boolean) channel of an input-root control,
 * or null when the shape does not match. String lowers to TextField;
 * boolean lowers to Toggle(.checkbox).
 */
function soleValueChannel(ir: ComponentIR): NormalizedChannelIR | null {
  const scalar = ir.behavior.normalizedChannels.filter(
    (c) => c.valueType === "string" || c.valueType === "boolean",
  );
  return scalar.length === 1 ? scalar[0]! : null;
}

/** The single string channel of a text control (gate guarantees it). */
function soleStringChannel(ir: ComponentIR): NormalizedChannelIR {
  return ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "string",
  )!;
}

function emitTextControlComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  // The class gate guarantees exactly one string channel; the projection
  // below is its realization (value/defaultValue/onChange trio).
  soleStringChannel(ir);
  const chrome = resolveChrome(ir);
  const has = (concern: SlotConcern) => chrome[concern] !== undefined;
  const hasProp = (name: string) => hasConventionalProp(ir, name);

  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    `/// Token scope data for ${exportName} (ir.tokenScopes → RN normal ` +
      `form: data consumed through FsdsTheme at render, never resolved ` +
      `constants). A caseless enum namespace because generic types cannot ` +
      `hold static stored properties.`,
  );
  lines.push(`enum ${ir.name}Tokens {`);
  lines.push(`${INDENT}public static let scopes: FsdsComponentTokenScopes = [`);
  for (const scope of ir.tokenScopes) {
    lines.push(`${INDENT}${INDENT}"${scope.scope}": [`);
    for (const value of scope.values) {
      let literalArg = "";
      if (value.rawValue) {
        const kind = value.isLiteral ? "literal" : "fallback";
        const dark = graphDarkFor(value);
        literalArg = dark
          ? `${kind}: .adaptive(light: "${value.rawValue}", dark: "${dark}")`
          : `${kind}: .string("${value.rawValue}")`;
      }
      lines.push(
        `${INDENT}${INDENT}${INDENT}"${value.name}": FsdsComponentTokenDefinition(` +
          `cssVar: "${value.cssVar}", name: "${value.name}"${literalArg ? ", " + literalArg : ""}),`,
      );
    }
    lines.push(`${INDENT}${INDENT}],`);
  }
  lines.push(`${INDENT}]`);
  lines.push(`}`);
  lines.push("");
  lines.push(
    `/// Emitted through the value-channel text-control path: input root ` +
      `whose string channel projects through the controllable-state ` +
      `pattern (controlled Binding takes precedence over @State).`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}: View {`);
  lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);
  lines.push(`${INDENT}@StateObject private var text: ControllableValue<String>`);
  if (hasProp("placeholder")) {
    lines.push(`${INDENT}private let placeholder: String?`);
  }
  if (hasProp("disabled")) {
    lines.push(`${INDENT}private let disabled: Bool`);
  }
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params: string[] = [`value: Binding<String>? = nil,`];
  if (hasProp("defaultValue")) {
    params.push(`defaultValue: String = "",`);
  }
  params.push(`onChange: ((String) -> Void)? = nil,`);
  if (hasProp("placeholder")) {
    params.push(`placeholder: String? = nil,`);
  }
  if (hasProp("disabled")) {
    params.push(`disabled: Bool = false,`);
  }
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._text = StateObject(wrappedValue: ControllableValue(controlled: value, defaultValue: defaultValue, onChange: onChange))`);
  if (hasProp("placeholder")) {
    lines.push(`${INDENT}${INDENT}self.placeholder = placeholder`);
  }
  if (hasProp("disabled")) {
    lines.push(`${INDENT}${INDENT}self.disabled = disabled`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push("");
  lines.push(`${INDENT}private var layered: [String: FsdsTokenValue?] {`);
  lines.push(`${INDENT}${INDENT}resolveFsdsLayeredTokens(`);
  lines.push(`${INDENT}${INDENT}${INDENT}fsdsScopes,`);
  lines.push(`${INDENT}${INDENT}${INDENT}fsdsTheme,`);
  lines.push(`${INDENT}${INDENT}${INDENT}layers: ["root"]`);
  lines.push(`${INDENT}${INDENT})`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private func colorSlot(_ suffix: String) -> Color? {`);
  lines.push(`${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.color`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private func pxSlot(_ suffix: String) -> CGFloat? {`);
  lines.push(`${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.px`);
  lines.push(`${INDENT}}`);
  lines.push("");
  const accessors: string[] = [];
  if (has("background")) accessors.push(`${INDENT}private var background: Color { colorSlot("${chrome.background}") ?? .accentColor }`);
  if (has("foreground")) accessors.push(`${INDENT}private var foreground: Color { colorSlot("${chrome.foreground}") ?? .primary }`);
  if (has("blockPadding")) accessors.push(`${INDENT}private var blockPadding: CGFloat { pxSlot("${chrome.blockPadding}") ?? 0 }`);
  if (has("inlinePadding")) accessors.push(`${INDENT}private var inlinePadding: CGFloat { pxSlot("${chrome.inlinePadding}") ?? 0 }`);
  if (has("minHeight")) accessors.push(`${INDENT}private var minHeight: CGFloat { pxSlot("${chrome.minHeight}") ?? 0 }`);
  lines.push(...accessors);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  const textFieldArgs = [`""`, `text: Binding(`, `${INDENT}${INDENT}get: { text.value },`, `${INDENT}${INDENT}set: { text.set($0) }`, `${INDENT})`];
  lines.push(`${INDENT}${INDENT}TextField(`);
  lines.push(`${INDENT}${INDENT}${INDENT}"",`);
  lines.push(`${INDENT}${INDENT}${INDENT}text: Binding(`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}get: { text.value },`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}set: { text.set($0) }`);
  if (hasProp("placeholder")) {
    lines.push(`${INDENT}${INDENT}${INDENT}),`);
    lines.push(`${INDENT}${INDENT}${INDENT}prompt: placeholder.map(Text.init)`);
  } else {
    lines.push(`${INDENT}${INDENT}${INDENT})`);
  }
  lines.push(`${INDENT}${INDENT})`);
  if (has("blockPadding")) lines.push(`${INDENT}${INDENT}${INDENT}.padding(.vertical, blockPadding)`);
  if (has("inlinePadding")) lines.push(`${INDENT}${INDENT}${INDENT}.padding(.horizontal, inlinePadding)`);
  if (has("minHeight")) lines.push(`${INDENT}${INDENT}${INDENT}.frame(minHeight: minHeight)`);
  if (has("background")) lines.push(`${INDENT}${INDENT}${INDENT}.background(background)`);
  if (has("foreground")) lines.push(`${INDENT}${INDENT}${INDENT}.foregroundStyle(foreground)`);
  if (hasProp("disabled")) lines.push(`${INDENT}${INDENT}${INDENT}.disabled(disabled)`);
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  void textFieldArgs;
  return lines.join("\n");
}

/**
 * The boolean-channel input control: input root whose scalar channel is a
 * boolean (Checkbox) lowering to Toggle(.checkbox) with the controllable
 * state projection. `indeterminate` has no SwiftUI Toggle equivalent and
 * is omitted-and-documented.
 */
function emitBooleanControlComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  const hasDisabled = hasConventionalProp(ir, "disabled");
  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    `/// Emitted through the boolean-channel control path: the checked ` +
      `channel projects through the controllable-state pattern onto a ` +
      `native checkbox Toggle.`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}: View {`);
  lines.push(`${INDENT}@StateObject private var checked: ControllableValue<Bool>`);
  if (hasDisabled) lines.push(`${INDENT}private let disabled: Bool`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = ["checked: Binding<Bool>? = nil,", "defaultChecked: Bool = false,", "onChange: ((Bool) -> Void)? = nil,"];
  if (hasDisabled) params.push("disabled: Bool = false");
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._checked = StateObject(wrappedValue: ControllableValue(controlled: checked, defaultValue: defaultChecked, onChange: onChange))`);
  if (hasDisabled) lines.push(`${INDENT}${INDENT}self.disabled = disabled`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}Toggle(isOn: Binding(`);
  lines.push(`${INDENT}${INDENT}${INDENT}get: { checked.value },`);
  lines.push(`${INDENT}${INDENT}${INDENT}set: { checked.set($0) }`);
  lines.push(`${INDENT}${INDENT})) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}EmptyView()`);
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}.toggleStyle(.checkbox)`);
  if (hasDisabled) lines.push(`${INDENT}${INDENT}.disabled(disabled)`);
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}

/**
 * The progressbar class: root semantics carry role=progressbar (Progress).
 * The contract documents value as 0-100 with omission meaning
 * indeterminate — the emission honors that range, never guessing a scale.
 */
function emitProgressComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  const hasLabel = hasConventionalProp(ir, "label");
  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    `/// Emitted through the progressbar path: the contract's 0-100 value ` +
      `prop drives a native progress indicator; nil renders indeterminate.`,
  );
  lines.push(`public struct ${exportName}: View {`);
  lines.push(`${INDENT}private let value: Double?`);
  if (hasLabel) lines.push(`${INDENT}private let label: String?`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = ["value: Double? = nil,"];
  if (hasLabel) params.push("label: String? = nil");
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self.value = value`);
  if (hasLabel) lines.push(`${INDENT}${INDENT}self.label = label`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}Group {`);
  lines.push(`${INDENT}${INDENT}${INDENT}if let value {`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}ProgressView(value: value / 100)`);
  lines.push(`${INDENT}${INDENT}${INDENT}} else {`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}ProgressView()`);
  lines.push(`${INDENT}${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}}`);
  if (hasLabel) {
    lines.push(`${INDENT}${INDENT}${INDENT}.fsdsAccessibilityLabel(label)`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}

/** A bare rule leaf: an hr root with no children and no channels (Divider). */
function isBareRuleLeaf(ir: ComponentIR): boolean {
  return (
    !!ir.dom &&
    ir.dom.tag === "hr" &&
    (ir.dom.children ?? []).length === 0 &&
    ir.behavior.normalizedChannels.length === 0 &&
    ir.surface == null
  );
}

/** A visual-only leaf: one childless span under a passive root (Spinner). */
function isVisualOnlyLeaf(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  const children = ir.dom.children ?? [];
  if (children.length !== 1) return false;
  const child = children[0]!;
  return child.tag === "span" && (child.children ?? []).length === 0;
}

function emitLeafComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  const isRule = isBareRuleLeaf(ir);
  const hasOrientation = hasConventionalProp(ir, "orientation");
  const hasLabel = hasConventionalProp(ir, "label");
  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    isRule
      ? `/// Emitted through the bare-rule leaf path (hr root).`
      : `/// Emitted through the visual-only leaf path: a decorative ` +
        `affordance realized natively.`,
  );
  // Inline enum props (DividerOrientation) lower to local Swift enums —
  // the contract declares them inline rather than as named types.
  const orientationProp = ir.styledProps.find(
    (p) => p.safeName === "orientation",
  );
  const orientationEnumValues =
    orientationProp &&
    typeof orientationProp.propType === "object" &&
    "kind" in orientationProp.propType &&
    orientationProp.propType.kind === "enum"
      ? (orientationProp.propType as { values: string[] }).values
      : null;
  if (orientationEnumValues) {
    lines.push(`public enum ${ir.name}Orientation: String, CaseIterable {`);
    for (const value of orientationEnumValues) {
      lines.push(`${INDENT}case ${swiftCaseDecl(value)}`);
    }
    lines.push(`}`);
    lines.push("");
  }
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}: View {`);
  if (hasOrientation) lines.push(`${INDENT}private let orientation: ${ir.name}Orientation?`);
  if (hasLabel) lines.push(`${INDENT}private let label: String?`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = [];
  if (hasOrientation) params.push("orientation: " + ir.name + "Orientation? = nil");
  if (hasLabel) params.push("label: String? = nil");
  if (params.length === 0) {
    lines.push(`${INDENT}) {`);
  } else {
    params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
    for (const param of params) lines.push(`${INDENT}${INDENT}${param},`);
    lines[lines.length - 1] = lines[lines.length - 1]!.replace(/,$/, "");
    lines.push(`${INDENT}) {`);
  }
  if (hasOrientation) lines.push(`${INDENT}${INDENT}self.orientation = orientation`);
  if (hasLabel) lines.push(`${INDENT}${INDENT}self.label = label`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  if (isRule) {
    lines.push(`${INDENT}${INDENT}if orientation == .vertical {`);
    lines.push(`${INDENT}${INDENT}${INDENT}Rectangle()`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}.fill(.separator)`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}.frame(width: 1)`);
    lines.push(`${INDENT}${INDENT}} else {`);
    lines.push(`${INDENT}${INDENT}${INDENT}Divider()`);
    lines.push(`${INDENT}${INDENT}}`);
  } else {
    lines.push(`${INDENT}${INDENT}ProgressView()`);
    if (hasLabel) {
      lines.push(`${INDENT}${INDENT}${INDENT}.fsdsAccessibilityLabel(label)`);
    }
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}

/** A glyph host: some dom node carries the iconGlyph fact (Icon). */
function isGlyphHost(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  const stack = [ir.dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.iconGlyph) return true;
    stack.push(...(node.children ?? []));
  }
  return false;
}

function domGlyph(ir: ComponentIR): NonNullable<ComponentIR["dom"]>["iconGlyph"] {
  const stack = [ir.dom!];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.iconGlyph) return node.iconGlyph;
    stack.push(...(node.children ?? []));
  }
  return undefined;
}

/**
 * The glyph-host class: a component whose dom carries iconGlyph lowers to
 * a registry lookup — the compositional glyph substrate. Size hints from
 * the IR map the size prop to the rendered frame; decorative-by-default
 * comes from the catalog semantics (accessibilityHidden), per the
 * compositional-behavior direction this class exists to serve.
 */
function emitGlyphHostComponent(ir: ComponentIR): string {
  const glyph = domGlyph(ir)!;
  const nameProp = glyph.namePropName;
  const sizeProp = glyph.sizePropName;
  const hints = glyph.sizeHints;
  const sizeType = ir.styledProps.find((p) => p.safeName === sizeProp)
    ?.typeRefs.find((ref) => ir.definedTypes[ref]);
  const defaultSize = sizeProp
    ? findPropDefaultOrNull(ir, sizeProp) ?? Object.keys(hints ?? {})[0]
    : null;

  // Inline size unions (Icon has no named type) synthesize a local enum
  // from the hint keys — the Divider inline-enum precedent.
  const hintMembers = Object.keys(hints ?? {});
  const synthesizedSizeType = !sizeType && hintMembers.length > 0
    ? `${ir.name}Size`
    : null;
  const sizeTypeName = sizeType ?? synthesizedSizeType;
  const hintsUsable = sizeTypeName !== null && defaultSize !== null;

  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    `/// Emitted through the glyph-host path: the dom carries iconGlyph, ` +
      `so this component is a registry lookup over the shared glyph ` +
      `substrate — decorative-by-default per catalog semantics.`,
  );
  if (synthesizedSizeType) {
    lines.push(`public enum ${synthesizedSizeType}: String, CaseIterable {`);
    for (const member of hintMembers) {
      lines.push(`${INDENT}case ${swiftCaseDecl(member)}`);
    }
    lines.push(`}`);
    lines.push("");
  }
  const exportName = swiftExportName(ir.name);
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}: View {`);
  lines.push(`${INDENT}private let ${nameProp}: String`);
  if (sizeProp && hintsUsable) {
    lines.push(`${INDENT}private let ${sizeProp}: ${sizeTypeName}`);
  }
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = [`${nameProp}: String,`];
  if (sizeProp && hintsUsable) {
    params.push(`${sizeProp}: ${sizeTypeName} = .${swiftCaseRef(defaultSize!)}`);
  }
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self.${nameProp} = ${nameProp}`);
  if (sizeProp && hintsUsable) {
    lines.push(`${INDENT}${INDENT}self.${sizeProp} = ${sizeProp}`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private var glyphSize: CGFloat {`);
  if (sizeProp && sizeTypeName && hints) {
    lines.push(`${INDENT}${INDENT}switch ${sizeProp} {`);
    for (const [member, px] of Object.entries(hints)) {
      lines.push(`${INDENT}${INDENT}case .${swiftCaseRef(member)}: return ${px}`);
    }
    lines.push(`${INDENT}${INDENT}}`);
  } else {
    lines.push(`${INDENT}${INDENT}24`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}GlyphCatalog.glyph(named: ${nameProp}, size: glyphSize)`);
  lines.push(`${INDENT}${INDENT}${INDENT}.accessibilityHidden(`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}GlyphCatalog.decorativeDefaults.contains(${nameProp})`);
  lines.push(`${INDENT}${INDENT}${INDENT})`);
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}

/**
 * The native-disclosure collapse class: contracts declaring the
 * `native-disclosure` intent (Details) collapse to SwiftUI
 * DisclosureGroup — the open channel projects through the controllable
 * state pattern; the summary string prop is the group label; the content
 * compound part is the expanded region.
 */
function emitDisclosureComponent(ir: ComponentIR): string {
  const openChannel = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "boolean",
  );
  if (!openChannel) {
    throw new Error(
      `emitDisclosureComponent: ${ir.name} declares native-disclosure but ` +
        `has no boolean open channel.`,
    );
  }
  const contentParts = ir.compoundParts.filter((p) => p.name === "content");
  if (contentParts.length !== 1) {
    throw new Error(
      `emitDisclosureComponent: ${ir.name} needs exactly one content ` +
        `compound part (found: ${ir.compoundParts.map((p) => p.name).join("/") || "none"}).`,
    );
  }
  const hasSummary = hasConventionalProp(ir, "summary");
  const hasDisabled = hasConventionalProp(ir, "disabled");

  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(...emitTokenScopesSection(ir));
  lines.push("");
  lines.push(
    `/// Emitted through the native-disclosure collapse path: SwiftUI ` +
      `DisclosureGroup realizes the summary + expandable content anatomy.`,
  );
  const exportName = swiftExportName(ir.name);
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}<Content: View>: View {`);
  lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);
  lines.push(`${INDENT}@StateObject private var open: ControllableValue<Bool>`);
  if (hasSummary) lines.push(`${INDENT}private let summary: String?`);
  if (hasDisabled) lines.push(`${INDENT}private let disabled: Bool`);
  lines.push(`${INDENT}private let content: Content`);
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = ["open: Binding<Bool>? = nil,", "defaultOpen: Bool = false,", "onOpenChange: ((Bool) -> Void)? = nil,"];
  if (hasSummary) params.push("summary: String? = nil,");
  if (hasDisabled) params.push("disabled: Bool = false,");
  params.push("@ViewBuilder content: () -> Content");
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))`);
  if (hasSummary) lines.push(`${INDENT}${INDENT}self.summary = summary`);
  if (hasDisabled) lines.push(`${INDENT}${INDENT}self.disabled = disabled`);
  lines.push(`${INDENT}${INDENT}self.content = content()`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}DisclosureGroup(isExpanded: Binding(`);
  lines.push(`${INDENT}${INDENT}${INDENT}get: { open.value },`);
  lines.push(`${INDENT}${INDENT}${INDENT}set: { open.set($0) }`);
  lines.push(`${INDENT}${INDENT})) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}content`);
  lines.push(`${INDENT}${INDENT}} label: {`);
  if (hasSummary) {
    lines.push(`${INDENT}${INDENT}${INDENT}if let summary {`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}Text(summary)`);
    lines.push(`${INDENT}${INDENT}${INDENT}} else {`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}EmptyView()`);
    lines.push(`${INDENT}${INDENT}${INDENT}}`);
  } else {
    lines.push(`${INDENT}${INDENT}${INDENT}EmptyView()`);
  }
  lines.push(`${INDENT}${INDENT}}`);
  if (hasDisabled) {
    lines.push(`${INDENT}${INDENT}${INDENT}.disabled(disabled)`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}

/**
 * The static-content class: a passive non-container root (label,
 * blockquote, p, …) whose entire dom is one projected children region —
 * no channels, no surface. Label and Blockquote are the corpus consumers.
 */
function isStaticContent(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  if (ir.dom.tag === "div" || ir.dom.tag === "button" || ir.dom.tag === "input") {
    return false;
  }
  const children = ir.dom.children ?? [];
  return (
    children.length === 1 &&
    children[0]!.tag === "children" &&
    (children[0]!.children ?? []).length === 0
  );
}

function emitStaticContentComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  const chrome = resolveChrome(ir);
  const axes = collectVariantAxes(ir);
  const layerInfo = emitLayerExpressions(axes);
  const layerArray = ['"root"', ...layerInfo.expressions];
  const layersExpr = layerInfo.needsCompactMap
    ? `[${layerArray.join(", ")}].compactMap { $0 }`
    : `[${layerArray.join(", ")}]`;

  const lines: string[] = [];
  lines.push("// @generated:start component");
  if (ir.tokenScopes.length > 0) lines.push(...emitTokenScopesSection(ir));
  lines.push("");
  lines.push(
    `/// Emitted through the static-content path: passive ` +
      `${ir.dom!.tag} root with a single consumer content region.`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}<Content: View>: View {`);
  if (ir.tokenScopes.length > 0) {
    lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
    lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
    lines.push(`${INDENT}}`);
  }
  for (const axis of axes) {
    lines.push(`${INDENT}private let ${escapeSwiftKeyword(axis.prop)}: ${axis.typeName}${axis.defaultMember === null ? "?" : ""}`);
  }
  lines.push(`${INDENT}private let content: Content`);
  if (ir.tokenScopes.length > 0) {
    lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  }
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = axes.map((axis) =>
    axis.defaultMember !== null
      ? `${axis.prop}: ${axis.typeName} = .${swiftCaseRef(axis.defaultMember)},`
      : `${axis.prop}: ${axis.typeName}? = nil,`,
  );
  params.push("@ViewBuilder content: () -> Content");
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  for (const axis of axes) lines.push(`${INDENT}${INDENT}self.${escapeSwiftKeyword(axis.prop)} = ${escapeSwiftKeyword(axis.prop)}`);
  lines.push(`${INDENT}${INDENT}self.content = content()`);
  lines.push(`${INDENT}}`);
  if (ir.tokenScopes.length > 0) {
    lines.push("");
    lines.push(`${INDENT}private var layered: [String: FsdsTokenValue?] {`);
    lines.push(`${INDENT}${INDENT}resolveFsdsLayeredTokens(`);
    lines.push(`${INDENT}${INDENT}${INDENT}fsdsScopes,`);
    lines.push(`${INDENT}${INDENT}${INDENT}fsdsTheme,`);
    lines.push(`${INDENT}${INDENT}${INDENT}layers: ${layersExpr}`);
    lines.push(`${INDENT}${INDENT})`);
    lines.push(`${INDENT}}`);
    lines.push("");
    lines.push(`${INDENT}private func colorSlot(_ suffix: String) -> Color? {`);
    lines.push(`${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.color`);
    lines.push(`${INDENT}}`);
    lines.push("");
    lines.push(`${INDENT}private func pxSlot(_ suffix: String) -> CGFloat? {`);
    lines.push(`${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.px`);
    lines.push(`${INDENT}}`);
    lines.push("");
    lines.push(
      ...emitChromeAccessorLines(chrome, [
        "background", "foreground", "borderColor", "borderWidth",
        "radius", "blockPadding", "inlinePadding", "gap", "minHeight",
      ]),
    );
  }
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}content`);
  if (ir.tokenScopes.length > 0) {
    if (chrome.blockPadding) lines.push(`${INDENT}${INDENT}${INDENT}.padding(.vertical, blockPadding)`);
    if (chrome.inlinePadding) lines.push(`${INDENT}${INDENT}${INDENT}.padding(.horizontal, inlinePadding)`);
    if (chrome.background) lines.push(`${INDENT}${INDENT}${INDENT}.background(background)`);
    if (chrome.radius) lines.push(`${INDENT}${INDENT}${INDENT}.clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))`);
    if (chrome.foreground) lines.push(`${INDENT}${INDENT}${INDENT}.foregroundStyle(foreground)`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}

/**
 * The compound-part composer class: a passive container root with NO root
 * dom tree, whose content regions are its compound parts. Card is the
 * corpus consumer. Anchored surfaces (Popover/Tooltip) share the shape but
 * carry `ir.surface` and dispatch to the surface path before this point.
 */
function isCompoundPartComposer(ir: ComponentIR): boolean {
  return (
    ir.dom === undefined &&
    ir.surface == null &&
    ir.compoundParts.length > 0 &&
    ir.root.element === "div"
  );
}

/**
 * The named-slot composer class: a passive container WITH a root dom tree
 * whose every leaf is a named slot — semantic wrapper elements (label,
 * help spans) above the slots are allowed; component-instance leaves
 * (TextField's Input) and surfaces are not. Field is the corpus consumer.
 */
function isNamedSlotComposer(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.root.element !== "div") return false;
  const slots = collectDomSlots(ir.dom);
  return slots.length > 0 && allDomLeavesAreSlots(ir.dom);
}

/** Ordered named-slot list from the dom tree (document order). */
function collectDomSlots(
  node: NonNullable<ComponentIR["dom"]>,
): string[] {
  const out: string[] = [];
  const walk = (n: NonNullable<ComponentIR["dom"]>): void => {
    if (n.tag === "slot") {
      const name = (n as { slotName?: string; name?: string }).slotName
        ?? (n as { name?: string }).name;
      if (name) out.push(name);
    }
    for (const child of n.children ?? []) walk(child);
  };
  walk(node);
  return out;
}

/** True when every leaf of the dom tree is a named slot node. */
function allDomLeavesAreSlots(
  node: NonNullable<ComponentIR["dom"]>,
): boolean {
  const children = node.children ?? [];
  if (children.length === 0) {
    return node.tag === "slot"
      && ((node as { slotName?: string; name?: string }).slotName
        ?? (node as { name?: string }).name) !== undefined;
  }
  return children.every((child) => allDomLeavesAreSlots(child));
}

/**
 * Token slot-name suffixes the emitters know how to apply, and the chrome
 * they drive. This is the corpus-wide token naming vocabulary — the
 * SwiftUI analog of the primitive emitter's axis table. Alternatives exist
 * because slot naming is not uniform across the corpus (Button authors
 * `*.size.radius`, Card `*.size.radius.default`; foreground is `.default`
 * on Button but `.primary` on Card).
 */
export const SLOT_SUFFIX_ALTERNATIVES = {
  background: ["color.background.default", "color.bg.default", "color.bg"],
  foreground: ["color.foreground.default", "color.foreground.primary", "color.text.default", "color.fg"],
  borderColor: ["color.border.default", "color.border"],
  borderWidth: ["size.border", "size.border.default"],
  radius: ["size.radius", "size.radius.default", "radius"],
  blockPadding: ["padding-block-start"],
  inlinePadding: ["padding-inline-start"],
  gap: ["box-model.gap"],
  minHeight: ["min-height"],
  statusAccentColor: ["color.statusAccent.default"],
  statusAccentWidth: ["size.statusAccent.width"],
} as const;

export type SlotConcern = keyof typeof SLOT_SUFFIX_ALTERNATIVES;

/**
 * The first alternative suffix that exists in any of the component's
 * scopes, or null when the component authors no slot for the concern.
 * Chrome is presence-driven: a null concern is simply not applied.
 */
function pickSuffix(
  ir: ComponentIR,
  concern: SlotConcern,
): string | null {
  for (const suffix of SLOT_SUFFIX_ALTERNATIVES[concern]) {
    if (
      ir.tokenScopes.some((scope) =>
        scope.values.some((v) => v.name.endsWith(suffix)),
      )
    ) {
      return suffix;
    }
  }
  return null;
}

function emitActionComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  const chrome = resolveChrome(ir);
  const has = (concern: SlotConcern) => chrome[concern] !== undefined;

  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    `/// Token scope data for ${exportName} (ir.tokenScopes → RN normal ` +
      `form: data consumed through FsdsTheme at render, never resolved ` +
      `constants). A caseless enum namespace because generic types cannot ` +
      `hold static stored properties.`,
  );
  lines.push(`enum ${ir.name}Tokens {`);
  lines.push(`${INDENT}public static let scopes: FsdsComponentTokenScopes = [`);
  for (const scope of ir.tokenScopes) {
    lines.push(`${INDENT}${INDENT}"${scope.scope}": [`);
    for (const value of scope.values) {
      let literalArg = "";
      if (value.rawValue) {
        const kind = value.isLiteral ? "literal" : "fallback";
        const dark = graphDarkFor(value);
        literalArg = dark
          ? `${kind}: .adaptive(light: "${value.rawValue}", dark: "${dark}")`
          : `${kind}: .string("${value.rawValue}")`;
      }
      lines.push(
        `${INDENT}${INDENT}${INDENT}"${value.name}": FsdsComponentTokenDefinition(` +
          `cssVar: "${value.cssVar}", name: "${value.name}"${literalArg ? ", " + literalArg : ""}),`,
      );
    }
    lines.push(`${INDENT}${INDENT}],`);
  }
  lines.push(`${INDENT}]`);
  lines.push(`}`);
  lines.push("");
  lines.push(
    `/// Emitted through the projected-children action path: interactive ` +
      `button root with a single consumer content region.`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}<Label: View>: View {`);
  lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);

  // Props
  const variantAxes = Object.keys(ir.variants);
  for (const axis of variantAxes) {
    lines.push(`${INDENT}private let ${axis}: ${ir.name}${capitalize(axis)}`);
  }
  if (hasConventionalProp(ir, "disabled")) {
    lines.push(`${INDENT}private let disabled: Bool`);
  }
  if (hasConventionalProp(ir, "loading")) {
    lines.push(`${INDENT}private let loading: Bool`);
  }
  if (hasConventionalProp(ir, "ariaLabel")) {
    lines.push(`${INDENT}private let accessibilityLabel: String?`);
  }
  if (hasConventionalProp(ir, "onClick")) {
    lines.push(`${INDENT}private let onTap: (() -> Void)?`);
  }
  lines.push(`${INDENT}private let label: Label`);
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");

  // Initializer — defaults from contract prop defaults.
  lines.push(`${INDENT}public init(`);
  const params: string[] = [];
  for (const axis of variantAxes) {
    const def = findPropDefault(ir, axis);
    params.push(
      `${INDENT}${INDENT}${axis}: ${ir.name}${capitalize(axis)} = .${swiftCaseRef(def)},`,
    );
  }
  if (hasConventionalProp(ir, "disabled")) {
    params.push(`${INDENT}${INDENT}disabled: Bool = false,`);
  }
  if (hasConventionalProp(ir, "loading")) {
    params.push(`${INDENT}${INDENT}loading: Bool = false,`);
  }
  if (hasConventionalProp(ir, "ariaLabel")) {
    params.push(`${INDENT}${INDENT}accessibilityLabel: String? = nil,`);
  }
  if (hasConventionalProp(ir, "onClick")) {
    params.push(`${INDENT}${INDENT}onTap: (() -> Void)? = nil,`);
  }
  params.push(`${INDENT}${INDENT}@ViewBuilder label: () -> Label`);
  lines.push(...params);
  lines.push(`${INDENT}) {`);
  for (const axis of variantAxes) {
    lines.push(`${INDENT}${INDENT}self.${axis} = ${axis}`);
  }
  if (hasConventionalProp(ir, "disabled")) {
    lines.push(`${INDENT}${INDENT}self.disabled = disabled`);
  }
  if (hasConventionalProp(ir, "loading")) {
    lines.push(`${INDENT}${INDENT}self.loading = loading`);
  }
  if (hasConventionalProp(ir, "ariaLabel")) {
    lines.push(`${INDENT}${INDENT}self.accessibilityLabel = accessibilityLabel`);
  }
  if (hasConventionalProp(ir, "onClick")) {
    lines.push(`${INDENT}${INDENT}self.onTap = onTap`);
  }
  lines.push(`${INDENT}${INDENT}self.label = label()`);
  lines.push(`${INDENT}}`);
  lines.push("");

  // Token resolution: root base + variant layers, theme-driven.
  lines.push(`${INDENT}private var layered: [String: FsdsTokenValue?] {`);
  lines.push(`${INDENT}${INDENT}resolveFsdsLayeredTokens(`);
  lines.push(`${INDENT}${INDENT}${INDENT}fsdsScopes,`);
  lines.push(`${INDENT}${INDENT}${INDENT}fsdsTheme,`);
  const layerList = [
    "\"root\"",
    ...variantAxes.map(
      (axis) => `"variant_\\(${axis}.rawValue)"`,
    ),
  ];
  lines.push(
    `${INDENT}${INDENT}${INDENT}layers: [${layerList.join(", ")}]`,
  );
  lines.push(`${INDENT}${INDENT})`);
  lines.push(`${INDENT}}`);
  lines.push("");

  // Slot accessors (presence-driven).
  lines.push(`${INDENT}private func colorSlot(_ suffix: String) -> Color? {`);
  lines.push(
    `${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.color`,
  );
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private func pxSlot(_ suffix: String) -> CGFloat? {`);
  lines.push(
    `${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.px`,
  );
  lines.push(`${INDENT}}`);
  lines.push("");
  const accessors: string[] = [];
  if (has("background")) {
    accessors.push(
      `${INDENT}private var background: Color { colorSlot("${chrome.background}") ?? .accentColor }`,
    );
  }
  if (has("foreground")) {
    accessors.push(
      `${INDENT}private var foreground: Color { colorSlot("${chrome.foreground}") ?? .primary }`,
    );
  }
  if (has("borderColor")) {
    accessors.push(
      `${INDENT}private var borderColor: Color { colorSlot("${chrome.borderColor}") ?? .clear }`,
    );
  }
  if (has("borderWidth")) {
    accessors.push(
      `${INDENT}private var borderWidth: CGFloat { pxSlot("${chrome.borderWidth}") ?? 0 }`,
    );
  }
  if (has("radius")) {
    accessors.push(
      `${INDENT}private var radius: CGFloat { pxSlot("${chrome.radius}") ?? 0 }`,
    );
  }
  if (has("blockPadding")) {
    accessors.push(
      `${INDENT}private var blockPadding: CGFloat { pxSlot("${chrome.blockPadding}") ?? 0 }`,
    );
  }
  if (has("inlinePadding")) {
    accessors.push(
      `${INDENT}private var inlinePadding: CGFloat { pxSlot("${chrome.inlinePadding}") ?? 0 }`,
    );
  }
  if (has("minHeight")) {
    accessors.push(
      `${INDENT}private var minHeight: CGFloat { pxSlot("${chrome.minHeight}") ?? 0 }`,
    );
  }
  lines.push(...accessors);
  lines.push("");

  // Label content: loading swaps the projected content for a progress
  // affordance (the spinner part's decoration role realized natively).
  if (hasConventionalProp(ir, "loading")) {
    lines.push(`${INDENT}@ViewBuilder`);
    lines.push(`${INDENT}private var labelContent: some View {`);
    lines.push(`${INDENT}${INDENT}if loading {`);
    lines.push(`${INDENT}${INDENT}${INDENT}ProgressView().controlSize(.small)`);
    lines.push(`${INDENT}${INDENT}} else {`);
    lines.push(`${INDENT}${INDENT}${INDENT}label`);
    lines.push(`${INDENT}${INDENT}}`);
    lines.push(`${INDENT}}`);
    lines.push("");
  }

  // Body.
  lines.push(`${INDENT}public var body: some View {`);
  const action = hasConventionalProp(ir, "onClick") ? "{ onTap?() }" : "{}";
  const innerContent = hasConventionalProp(ir, "loading")
    ? "labelContent"
    : "label";
  lines.push(`${INDENT}${INDENT}Button(action: ${action}) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}${innerContent}`);
  if (has("blockPadding")) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.padding(.vertical, blockPadding)`,
    );
  }
  if (has("inlinePadding")) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.padding(.horizontal, inlinePadding)`,
    );
  }
  if (has("minHeight")) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.frame(minHeight: minHeight)`,
    );
  }
  if (has("background")) {
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}.background(background)`);
  }
  if (has("radius")) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))`,
    );
  }
  if (has("borderColor") && has("borderWidth")) {
    const radiusExpr = has("radius") ? "radius" : "0";
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.overlay(` +
        `RoundedRectangle(cornerRadius: ${radiusExpr}, style: .continuous)` +
        `.stroke(borderColor, lineWidth: borderWidth))`,
    );
  }
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}.buttonStyle(.plain)`);
  if (has("foreground")) {
    lines.push(`${INDENT}${INDENT}.foregroundStyle(foreground)`);
  }
  if (hasConventionalProp(ir, "disabled") && hasConventionalProp(ir, "loading")) {
    lines.push(`${INDENT}${INDENT}.disabled(disabled || loading)`);
  } else if (hasConventionalProp(ir, "disabled")) {
    lines.push(`${INDENT}${INDENT}.disabled(disabled)`);
  }
  if (hasConventionalProp(ir, "ariaLabel")) {
    lines.push(`${INDENT}${INDENT}.fsdsAccessibilityLabel(accessibilityLabel)`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");

  return lines.join("\n");
}

/**
 * Resolve every chrome concern the component authors slots for. Emitters
 * consult this once and generate accessors/modifiers only for present
 * concerns — absent concerns are skipped, never defaulted into existence.
 */
export function resolveChrome(ir: ComponentIR): Partial<Record<SlotConcern, string>> {
  const chrome: Partial<Record<SlotConcern, string>> = {};
  for (const concern of Object.keys(SLOT_SUFFIX_ALTERNATIVES) as SlotConcern[]) {
    const suffix = pickSuffix(ir, concern);
    if (suffix) chrome[concern] = suffix;
  }
  return chrome;
}

/**
 * Axis facts for variant-layered components. An axis with an authored
 * contract default always layers; an axis without one becomes an optional
 * parameter whose layer is applied only when set (the web behavior for
 * unset variant props — no variant class, no overrides).
 */
interface VariantAxis {
  prop: string;
  typeName: string;
  defaultMember: string | null;
}

function collectVariantAxes(ir: ComponentIR): VariantAxis[] {
  // An axis is emitted only when its prop references a declared union
  // type (e.g. ButtonVariant); axes without a typed prop (Links' inline
  // size values) are omitted from the API rather than guessed at.
  return Object.keys(ir.variants)
    .map((axis) => {
      const prop = ir.styledProps.find((p) => p.safeName === axis);
      const typeName = prop?.typeRefs.find((ref) => ir.definedTypes[ref]);
      if (!typeName) return null;
      return {
        prop: axis,
        typeName,
        defaultMember: findPropDefaultOrNull(ir, axis),
      };
    })
    .filter((axis): axis is VariantAxis => axis !== null);
}

function findPropDefaultOrNull(ir: ComponentIR, name: string): string | null {
  const prop = ir.styledProps.find((p) => p.safeName === name);
  const authored = prop?.defaultExpr?.replace(/^["']|["']$/g, "");
  const values = ir.variants[name];
  if (authored && values?.includes(authored)) return authored;
  return null;
}

/**
 * Emit the Swift layer-expression list for the variant axes: authored
 * defaults layer unconditionally; optional axes layer via compactMap over
 * the optional parameter.
 */
function emitLayerExpressions(axes: VariantAxis[]): {
  expressions: string[];
  needsCompactMap: boolean;
} {
  const expressions = axes.map((axis) =>
    axis.defaultMember !== null
      ? `"variant_\\(${escapeSwiftKeyword(axis.prop)}.rawValue)"`
      : `${escapeSwiftKeyword(axis.prop)}.map { "variant_\\($0.rawValue)" }`,
  );
  return {
    expressions,
    needsCompactMap: axes.some((a) => a.defaultMember === null),
  };
}

/**
 * Emit a compound-part composer: one ViewBuilder region closure per
 * compound part (contract part order), chrome from the root scope, variant
 * axes layered per their defaults. Card is the corpus consumer.
 */
function emitComposerComponent(
  ir: ComponentIR,
  regionNames: string[],
): string {
  const exportName = swiftExportName(ir.name);
  const chrome = resolveChrome(ir);
  const regions = regionNames;
  const axes = collectVariantAxes(ir);
  const layerInfo = emitLayerExpressions(axes);
  const layerArray = [
    '"root"',
    ...layerInfo.expressions,
  ];
  const layersExpr = layerInfo.needsCompactMap
    ? `[${layerArray.join(", ")}].compactMap { $0 }`
    : `[${layerArray.join(", ")}]`;

  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(
    `/// Token scope data for ${exportName} (ir.tokenScopes → RN normal ` +
      `form: data consumed through FsdsTheme at render, never resolved ` +
      `constants). A caseless enum namespace because generic types cannot ` +
      `hold static stored properties.`,
  );
  lines.push(`enum ${ir.name}Tokens {`);
  lines.push(`${INDENT}public static let scopes: FsdsComponentTokenScopes = [`);
  for (const scope of ir.tokenScopes) {
    lines.push(`${INDENT}${INDENT}"${scope.scope}": [`);
    for (const value of scope.values) {
      let literalArg = "";
      if (value.rawValue) {
        const kind = value.isLiteral ? "literal" : "fallback";
        const dark = graphDarkFor(value);
        literalArg = dark
          ? `${kind}: .adaptive(light: "${value.rawValue}", dark: "${dark}")`
          : `${kind}: .string("${value.rawValue}")`;
      }
      lines.push(
        `${INDENT}${INDENT}${INDENT}"${value.name}": FsdsComponentTokenDefinition(` +
          `cssVar: "${value.cssVar}", name: "${value.name}"${literalArg ? ", " + literalArg : ""}),`,
      );
    }
    lines.push(`${INDENT}${INDENT}],`);
  }
  lines.push(`${INDENT}]`);
  lines.push(`}`);
  lines.push("");
  lines.push(
    `/// Emitted through a composer path: passive container root, one ` +
      `content region per named region (compound part or named slot).`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  const genericParams = regions.map((r) => swiftCase(capitalize(r)));
  lines.push(
    `public struct ${exportName}${genericParams.length > 0 ? `<${genericParams.map((g) => `${g}: View`).join(", ")}>` : ""}: View {`,
  );
  lines.push(
    `${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`,
  );
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);
  for (const axis of axes) {
    lines.push(
      `${INDENT}private let ${escapeSwiftKeyword(axis.prop)}: ${axis.typeName}${axis.defaultMember === null ? "?" : ""}`,
    );
  }
  for (const region of regions) {
    lines.push(`${INDENT}private let ${swiftCase(region)}: ${swiftCase(capitalize(region))}`);
  }
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params: string[] = [];
  for (const axis of axes) {
    params.push(
      axis.defaultMember !== null
        ? `${INDENT}${INDENT}${axis.prop}: ${axis.typeName} = .${swiftCaseRef(axis.defaultMember)},`
        : `${INDENT}${INDENT}${axis.prop}: ${axis.typeName}? = nil,`,
    );
  }
  for (const region of regions) {
    params.push(
      `${INDENT}${INDENT}@ViewBuilder ${region}: () -> ${capitalize(region)} = { EmptyView() },`,
    );
  }
  params[params.length - 1] = params[params.length - 1]!.replace(/,$/, "");
  lines.push(...params);
  lines.push(`${INDENT}) {`);
  for (const axis of axes) {
    lines.push(`${INDENT}${INDENT}self.${escapeSwiftKeyword(axis.prop)} = ${escapeSwiftKeyword(axis.prop)}`);
  }
  for (const region of regions) {
    lines.push(`${INDENT}${INDENT}self.${region} = ${region}()`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private var layered: [String: FsdsTokenValue?] {`);
  lines.push(`${INDENT}${INDENT}resolveFsdsLayeredTokens(`);
  lines.push(`${INDENT}${INDENT}${INDENT}fsdsScopes,`);
  lines.push(`${INDENT}${INDENT}${INDENT}fsdsTheme,`);
  lines.push(`${INDENT}${INDENT}${INDENT}layers: ${layersExpr}`);
  lines.push(`${INDENT}${INDENT})`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private func colorSlot(_ suffix: String) -> Color? {`);
  lines.push(
    `${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.color`,
  );
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private func pxSlot(_ suffix: String) -> CGFloat? {`);
  lines.push(
    `${INDENT}${INDENT}layered.first { $0.key.hasSuffix(suffix) }?.value?.px`,
  );
  lines.push(`${INDENT}}`);
  lines.push("");
  const accessors: string[] = [];
  if (chrome.background) {
    accessors.push(`${INDENT}private var background: Color { colorSlot("${chrome.background}") ?? .accentColor }`);
  }
  if (chrome.foreground) {
    accessors.push(`${INDENT}private var foreground: Color { colorSlot("${chrome.foreground}") ?? .primary }`);
  }
  if (chrome.borderColor) {
    accessors.push(`${INDENT}private var borderColor: Color { colorSlot("${chrome.borderColor}") ?? .clear }`);
  }
  if (chrome.borderWidth) {
    accessors.push(`${INDENT}private var borderWidth: CGFloat { pxSlot("${chrome.borderWidth}") ?? 0 }`);
  }
  if (chrome.radius) {
    accessors.push(`${INDENT}private var radius: CGFloat { pxSlot("${chrome.radius}") ?? 0 }`);
  }
  if (chrome.blockPadding) {
    accessors.push(`${INDENT}private var blockPadding: CGFloat { pxSlot("${chrome.blockPadding}") ?? 0 }`);
  }
  if (chrome.inlinePadding) {
    accessors.push(`${INDENT}private var inlinePadding: CGFloat { pxSlot("${chrome.inlinePadding}") ?? 0 }`);
  }
  if (chrome.gap) {
    accessors.push(`${INDENT}private var gap: CGFloat { pxSlot("${chrome.gap}") ?? 0 }`);
  }
  if (chrome.statusAccentColor) {
    accessors.push(`${INDENT}private var statusAccent: Color { colorSlot("${chrome.statusAccentColor}") ?? .clear }`);
  }
  if (chrome.statusAccentWidth) {
    accessors.push(`${INDENT}private var statusAccentWidth: CGFloat { pxSlot("${chrome.statusAccentWidth}") ?? 0 }`);
  }
  lines.push(...accessors);
  lines.push("");
  lines.push(`${INDENT}@ViewBuilder`);
  lines.push(`${INDENT}private var regions: some View {`);
  lines.push(
    `${INDENT}${INDENT}VStack(spacing: ${chrome.gap ? "gap" : "nil"}) {`,
  );
  for (const region of regions) {
    lines.push(`${INDENT}${INDENT}${INDENT}${region}`);
  }
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
  lines.push("");
  const hasAccentBar =
    chrome.statusAccentColor !== undefined && chrome.statusAccentWidth !== undefined;
  lines.push(`${INDENT}public var body: some View {`);
  if (hasAccentBar) {
    lines.push(`${INDENT}${INDENT}HStack(spacing: 0) {`);
    lines.push(
      `${INDENT}${INDENT}${INDENT}Rectangle().fill(statusAccent).frame(width: statusAccentWidth)`,
    );
    lines.push(`${INDENT}${INDENT}${INDENT}regions`);
    lines.push(`${INDENT}${INDENT}}`);
  } else {
    lines.push(`${INDENT}${INDENT}regions`);
  }
  if (chrome.blockPadding) {
    lines.push(`${INDENT}${INDENT}${INDENT}.padding(.vertical, blockPadding)`);
  }
  if (chrome.inlinePadding) {
    lines.push(`${INDENT}${INDENT}${INDENT}.padding(.horizontal, inlinePadding)`);
  }
  if (chrome.background) {
    lines.push(`${INDENT}${INDENT}${INDENT}.background(background)`);
  }
  if (chrome.radius) {
    lines.push(`${INDENT}${INDENT}${INDENT}.clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))`);
  }
  if (chrome.borderColor && chrome.borderWidth) {
    const radiusExpr = chrome.radius ? "radius" : "0";
    lines.push(
      `${INDENT}${INDENT}${INDENT}.overlay(` +
        `RoundedRectangle(cornerRadius: ${radiusExpr}, style: .continuous)` +
        `.stroke(borderColor, lineWidth: borderWidth))`,
    );
  }
  if (chrome.foreground) {
    lines.push(`${INDENT}${INDENT}${INDENT}.foregroundStyle(foreground)`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");

  return lines.join("\n");
}

/** Swift keywords that may appear as union values (e.g. CardDensity `default`, ListVariant `as`). */
const SWIFT_KEYWORDS: ReadonlySet<string> = new Set([
  "default", "in", "out", "case", "for", "if", "else", "return", "init",
  "as", "is", "guard", "while", "defer", "where", "extension",
  "internal", "public", "private", "open", "static", "self", "Type", "Protocol",
]);

export function escapeSwiftKeyword(identifier: string): string {
  return SWIFT_KEYWORDS.has(identifier) ? `\`${identifier}\`` : identifier;
}

/** `in-progress` → `case inProgress = "in-progress"` (kebab values keep a raw value). */
export function swiftCaseDecl(value: string): string {
  const swiftName = swiftCase(value);
  if (swiftName !== value) return `${swiftName} = "${value}"`;
  return escapeSwiftKeyword(swiftName);
}

/** Enum member reference: `.default` → `` .`default` `` for keyword members. */
export function swiftCaseRef(value: string): string {
  return escapeSwiftKeyword(swiftCase(value));
}

/** `in-progress` → `inProgress` (Swift identifier reference). */
export function swiftCase(value: string): string {
  return value
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}


/** Chrome accessor lines shared by the component and surface emitters. */
export function emitChromeAccessorLines(
  chrome: Partial<Record<SlotConcern, string>>,
  include: readonly SlotConcern[],
): string[] {
  const accessors: string[] = [];
  for (const concern of include) {
    const suffix = chrome[concern];
    if (!suffix) continue;
    switch (concern) {
      case "background":
        accessors.push(`${INDENT}private var background: Color { colorSlot("${suffix}") ?? .accentColor }`);
        break;
      case "foreground":
        accessors.push(`${INDENT}private var foreground: Color { colorSlot("${suffix}") ?? .primary }`);
        break;
      case "borderColor":
        accessors.push(`${INDENT}private var borderColor: Color { colorSlot("${suffix}") ?? .clear }`);
        break;
      case "borderWidth":
        accessors.push(`${INDENT}private var borderWidth: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
      case "radius":
        accessors.push(`${INDENT}private var radius: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
      case "blockPadding":
        accessors.push(`${INDENT}private var blockPadding: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
      case "inlinePadding":
        accessors.push(`${INDENT}private var inlinePadding: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
      case "gap":
        accessors.push(`${INDENT}private var gap: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
      case "minHeight":
        accessors.push(`${INDENT}private var minHeight: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
      case "statusAccentColor":
        accessors.push(`${INDENT}private var statusAccent: Color { colorSlot("${suffix}") ?? .clear }`);
        break;
      case "statusAccentWidth":
        accessors.push(`${INDENT}private var statusAccentWidth: CGFloat { pxSlot("${suffix}") ?? 0 }`);
        break;
    }
  }
  return accessors;
}

/**
 * Lazily loaded resolved token graph (read-only). Theme-aware tokens carry
 * $value {light, dark}; invariant tokens carry a plain string. Used ONLY
 * to source dark values for adaptive pairs — the contract fallback stays
 * the light authority. Absent graph → no adaptive pairs (documented
 * degradation; CI/pre-push always build tokens before generation).
 */
let resolvedTokenGraph: Record<string, unknown> | null | undefined;

function loadResolvedGraph(contractsRoot?: string): Record<string, unknown> | null {
  if (resolvedTokenGraph !== undefined) return resolvedTokenGraph;
  try {
    // contractsRoot = <repo>/packages/ds-contracts when threaded; the
    // codegen CLI and the vitest suite both run from the repo root, so
    // process.cwd() is the equivalent fallback for unthreaded call sites.
    const repoRoot = contractsRoot
      ? nodePath.resolve(contractsRoot, "..", "..")
      : process.cwd();
    const graphPath = nodePath.resolve(
      repoRoot,
      "packages",
      "ds-tokens",
      "generated",
      "resolved.tokens.json",
    );
    resolvedTokenGraph = JSON.parse(
      nodeFs.readFileSync(graphPath, "utf8"),
    ) as Record<string, unknown>;
  } catch {
    resolvedTokenGraph = null;
  }
  return resolvedTokenGraph;
}

/** Walk the graph along a dotted path; null when absent. */
function graphValueAt(
  graph: Record<string, unknown>,
  resolvesTo: string,
): unknown {
  let node: unknown = graph;
  for (const segment of resolvesTo.split(".")) {
    if (typeof node !== "object" || node === null) return null;
    node = (node as Record<string, unknown>)[segment];
  }
  return node;
}

/**
 * The dark half of a theme-aware color token, when the slot resolves to
 * one: $value must be {light, dark} with a hex dark. The light half is
 * not taken from the graph — the contract fallback stays the light
 * authority (the corpus's collapsed-to-light convention).
 */
function graphDarkFor(
  value: { name: string; rawValue?: string; resolvesTo?: string },
  contractsRoot?: string,
): string | null {
  // The component-local slot name does not exist in the graph; the
  // resolvesTo path is the graph address.
  if (!value.resolvesTo) return null;
  if (!value.rawValue || !value.rawValue.startsWith("#")) return null;
  const graph = loadResolvedGraph(contractsRoot);
  if (!graph) return null;
  const token = graphValueAt(graph, value.resolvesTo);
  if (typeof token !== "object" || token === null) return null;
  const tokenValue = (token as Record<string, unknown>).$value;
  if (typeof tokenValue !== "object" || tokenValue === null) return null;
  const dark = (tokenValue as Record<string, unknown>).dark;
  return typeof dark === "string" && dark.startsWith("#") ? dark : null;
}

/** Generated token-scope-data lines shared by the component and surface emitters. */
export function emitTokenScopesSection(
  ir: ComponentIR,
  contractsRoot?: string,
): string[] {
  const lines: string[] = [];
  lines.push(
    `/// Token scope data for ${swiftExportName(ir.name)} (ir.tokenScopes → RN normal ` +
      `form: data consumed through FsdsTheme at render, never resolved ` +
      `constants). A caseless enum namespace because generic types cannot ` +
      `hold static stored properties.`,
  );
  lines.push(`enum ${ir.name}Tokens {`);
  lines.push(`${INDENT}public static let scopes: FsdsComponentTokenScopes = [`);
  for (const scope of ir.tokenScopes) {
    lines.push(`${INDENT}${INDENT}"${scope.scope}": [`);
    for (const value of scope.values) {
      let literalArg = "";
      if (value.rawValue) {
        const kind = value.isLiteral ? "literal" : "fallback";
        const dark = graphDarkFor(value, contractsRoot);
        literalArg = dark
          ? `${kind}: .adaptive(light: "${value.rawValue}", dark: "${dark}")`
          : `${kind}: .string("${value.rawValue}")`;
      }
      lines.push(
        `${INDENT}${INDENT}${INDENT}"${value.name}": FsdsComponentTokenDefinition(` +
          `cssVar: "${value.cssVar}", name: "${value.name}"${literalArg ? ", " + literalArg : ""}),`,
      );
    }
    lines.push(`${INDENT}${INDENT}],`);
  }
  lines.push(`${INDENT}]`);
  lines.push(`}`);
  return lines;
}

function hasConventionalProp(ir: ComponentIR, name: string): boolean {
  return ir.styledProps.some((p) => p.safeName === name);
}

function findPropDefault(ir: ComponentIR, name: string): string {
  const prop = ir.styledProps.find((p) => p.safeName === name);
  const authored = prop?.defaultExpr?.replace(/^["']|["']$/g, "");
  const values = ir.variants[name];
  if (authored && values?.includes(authored)) return authored;
  return values?.[0] ?? "unknown";
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function emitImports(): string {
  return [
    "// @generated:start imports",
    "import SwiftUI",
    "// @generated:end",
  ].join("\n");
}

export function emitTypes(ir: ComponentIR): string {
  const lines: string[] = ["// @generated:start types"];
  for (const [typeName, def] of Object.entries(ir.definedTypes)) {
    if (def.kind !== "union" || !def.values) continue;
    lines.push(`public enum ${typeName}: String, CaseIterable {`);
    for (const value of def.values) {
      lines.push(`${INDENT}case ${swiftCaseDecl(value)}`);
    }
    lines.push("}");
  }
  lines.push("// @generated:end");
  return lines.join("\n");
}

/**
 * Emit a SwiftUI View struct whose body collapses to `Toggle(.switch)`.
 *
 * Channel projection (controllable-state pattern):
 *   - `controlledChecked: Binding<Bool>?`         from channel.value
 *   - `@State private var uncontrolledChecked`    from channel.defaultValue
 *   - `onChange: ((Bool) -> Void)?`               from channel.onChange
 *
 * The two derived helpers (`checked` getter, `setChecked` mutator)
 * implement the same controlled-takes-precedence rule as React's
 * `useControllableState`. SwiftUI's `Binding(get:set:)` ties the
 * native Toggle to those helpers.
 *
 * Non-channel props (size, disabled, name, value, accessibilityLabel)
 * are emitted as plain `let` fields. `name` and `value` are retained
 * in the public API for consumers wiring to a form layer but are not
 * read by the body — that matches the round-1 golden where form data
 * is informational on non-web targets.
 */
function emitToggleComponent(ir: ComponentIR): string {
  const checkedChannel = findChannel(ir, "checked");
  if (!checkedChannel) {
    throw new Error(
      `generateSwiftUIComponentSource: ${ir.name} declares native-toggle-` +
        `affordance but has no "checked" channel.`,
    );
  }

  const sizeTypeName = findSizeTypeName(ir);
  const sizeDefaultMember = sizeTypeName
    ? findSizeDefaultMember(ir, sizeTypeName)
    : undefined;
  // Track geometry is emitted only when the contract authors width AND
  // height token facts for at least one variant. Without authored facts the
  // native Toggle keeps its intrinsic platform size — never a 0x0 frame.
  const hasTrackGeometry =
    sizeTypeName !== undefined &&
    sizeDefValues(ir, sizeTypeName).some(
      (v) =>
        sizeValuePx(ir, v, "width") !== undefined &&
        sizeValuePx(ir, v, "height") !== undefined,
    );

  const lines: string[] = [];
  lines.push("// @generated:start component");
  lines.push(`public struct ${ir.name}: View {`);

  // Channel storage
  lines.push(`${INDENT}@StateObject private var checked: ControllableValue<Bool>`);

  // Non-channel props (deterministic order matching golden)
  if (sizeTypeName) {
    lines.push(`${INDENT}private let size: ${sizeTypeName}`);
  }
  lines.push(`${INDENT}private let disabled: Bool`);
  lines.push(`${INDENT}private let name: String?`);
  lines.push(`${INDENT}private let value: String?`);
  lines.push(`${INDENT}private let accessibilityLabel: String?`);
  lines.push("");

  // Initializer
  lines.push(`${INDENT}public init(`);
  lines.push(`${INDENT}${INDENT}checked: Binding<Bool>? = nil,`);
  lines.push(`${INDENT}${INDENT}defaultChecked: Bool = false,`);
  lines.push(`${INDENT}${INDENT}onChange: ((Bool) -> Void)? = nil,`);
  if (sizeTypeName && sizeDefaultMember) {
    lines.push(`${INDENT}${INDENT}size: ${sizeTypeName} = .${swiftCaseRef(sizeDefaultMember)},`);
  }
  lines.push(`${INDENT}${INDENT}disabled: Bool = false,`);
  lines.push(`${INDENT}${INDENT}name: String? = nil,`);
  lines.push(`${INDENT}${INDENT}value: String? = nil,`);
  lines.push(`${INDENT}${INDENT}accessibilityLabel: String? = nil`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._checked = StateObject(wrappedValue: ControllableValue(controlled: checked, defaultValue: defaultChecked, onChange: onChange))`);
  if (sizeTypeName) {
    lines.push(`${INDENT}${INDENT}self.size = size`);
  }
  lines.push(`${INDENT}${INDENT}self.disabled = disabled`);
  lines.push(`${INDENT}${INDENT}self.name = name`);
  lines.push(`${INDENT}${INDENT}self.value = value`);
  lines.push(
    `${INDENT}${INDENT}self.accessibilityLabel = accessibilityLabel`,
  );

  lines.push(`${INDENT}}`);
  lines.push("");

  // Channel write accessor

  // Body: Toggle with .switch style
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}Toggle(isOn: Binding(`);
  lines.push(`${INDENT}${INDENT}${INDENT}get: { checked.value },`);
  lines.push(`${INDENT}${INDENT}${INDENT}set: { checked.set($0) }`);
  lines.push(`${INDENT}${INDENT})) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}EmptyView()`);
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}.toggleStyle(.switch)`);
  lines.push(`${INDENT}${INDENT}.disabled(disabled)`);
  lines.push(
    `${INDENT}${INDENT}.fsdsAccessibilityLabel(accessibilityLabel)`,
  );
  lines.push(
    `${INDENT}${INDENT}.accessibilityValue(checked.value ? "on" : "off")`,
  );
  if (hasTrackGeometry) {
    lines.push(
      `${INDENT}${INDENT}.frame(width: trackWidth, height: trackHeight)`,
    );
  }
  lines.push(`${INDENT}}`);
  lines.push("");

  // Size accessors — variants with no authored token fall through to the
  // contract-declared default member's value so SwiftUI never ships a
  // 0-sized track. Skipped entirely when no track geometry is authored
  // (the native control's intrinsic size is the honest realization).
  if (sizeTypeName && sizeDefaultMember && hasTrackGeometry) {
    emitSizeAccessor(lines, "trackWidth", ir, sizeTypeName, sizeDefaultMember, "width");
    lines.push("");
    emitSizeAccessor(lines, "trackHeight", ir, sizeTypeName, sizeDefaultMember, "height");
  }

  lines.push(`}`);
  lines.push("// @generated:end");

  return lines.join("\n");
}

function emitSizeAccessor(
  lines: string[],
  accessorName: string,
  ir: ComponentIR,
  sizeTypeName: string,
  defaultMember: string,
  dimension: "width" | "height",
): void {
  const sizeDef = ir.definedTypes[sizeTypeName];
  if (!sizeDef?.values) return;

  // Per-variant size values come from typed token facts (FEAT-MOBILE-IR-001),
  // not from regexing CSS var() strings. A variant with no authored token
  // falls through to the default member's value.
  const defaultValue = sizeValuePx(ir, defaultMember, dimension);

  lines.push(`${INDENT}private var ${accessorName}: CGFloat {`);
  lines.push(`${INDENT}${INDENT}switch size {`);
  for (const value of sizeDef.values) {
    const variantPx = sizeValuePx(ir, value, dimension);
    const px = variantPx ?? defaultValue ?? 0;
    lines.push(`${INDENT}${INDENT}case .${swiftCaseRef(value)}: return ${px}`);
  }
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
}

function findChannel(
  ir: ComponentIR,
  name: string,
): NormalizedChannelIR | undefined {
  return ir.behavior.normalizedChannels.find((c) => c.name === name);
}

/**
 * Find the `<Component>Size` defined type, if the contract declares one.
 * Returns undefined when no size variants exist.
 */
function findSizeTypeName(ir: ComponentIR): string | undefined {
  const expected = `${ir.name}Size`;
  if (ir.definedTypes[expected]?.kind === "union") return expected;
  return undefined;
}

/**
 * Declared values of a union defined type (empty when absent).
 */
function sizeDefValues(ir: ComponentIR, sizeTypeName: string): string[] {
  return ir.definedTypes[sizeTypeName]?.values ?? [];
}

/**
 * The default member of the size union, derived from the contract's
 * `props[].default` fact — never a hardcoded member name (ToggleSwitch's
 * union is small/medium/large with default `medium`; Switch's is
 * sm/md/lg with default `md`). Located by the prop's type ref, not by a
 * prop-name literal. Fails loudly when the authored default is not a
 * member of the union; falls back to the first member only when the
 * contract authors no default at all.
 */
function findSizeDefaultMember(ir: ComponentIR, sizeTypeName: string): string {
  const values = ir.definedTypes[sizeTypeName]?.values ?? [];
  const prop = ir.styledProps.find((p) => p.typeRefs.includes(sizeTypeName));
  const authored = prop?.defaultExpr?.replace(/^["']|["']$/g, "");
  if (authored) {
    if (!values.includes(authored)) {
      throw new Error(
        `generateSwiftUIComponentSource: prop "${prop?.name}" defaults to ` +
          `"${authored}", which is not a member of ${sizeTypeName} ` +
          `(${values.join(", ")}).`,
      );
    }
    return authored;
  }
  return values[0]!;
}

/**
 * Resolve the pixel value for a `<componentSlug>.size.<variant>.track.<dimension>`
 * token from typed token facts (FEAT-MOBILE-IR-001), NOT by parsing CSS.
 *
 * The token fact's `rawValue` is the concrete value the contract authored as
 * the var() fallback (e.g. `"48px"`); we read it directly and parse the
 * leading integer. Returns undefined when no fact for that variant/dimension
 * exists, so the caller can fall back to md.
 *
 * Lookup is by the slot `name` (path), which is target-neutral and embeds the
 * variant — no CSS custom-property string is constructed or scanned, and no
 * branch is keyed on component identity.
 */
function sizeValuePx(
  ir: ComponentIR,
  variant: string,
  dimension: "width" | "height",
): number | undefined {
  const slotName = `${ir.cssPrefix}.size.${variant}.track.${dimension}`;
  const fact = ir.tokenFacts.find(
    (t: TokenFactIR) => t.name === slotName && t.rawValue !== undefined,
  );
  if (!fact?.rawValue) return undefined;
  const match = fact.rawValue.match(/^(\d+)/);
  return match ? Number(match[1]) : undefined;
}
