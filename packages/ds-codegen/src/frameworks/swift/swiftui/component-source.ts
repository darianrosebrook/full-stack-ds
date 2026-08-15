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
]);

function swiftExportName(componentName: string): string {
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

  throw new Error(
    `generateSwiftUIComponentSource: no emission class matches ` +
      `component "${ir.name}". Implemented classes: native-toggle-affordance ` +
      `collapse, and the projected-children action root (root element button ` +
      `with a single projected children region). Slot-projected composers, ` +
      `compound parts, and surfaces are not yet implemented.`,
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

/** Slot-name suffixes the action path knows how to apply, and the chrome they drive. */
const ACTION_SLOT_SUFFIXES = {
  background: "color.background.default",
  foreground: "color.foreground.default",
  borderColor: "color.border.default",
  borderWidth: "size.border",
  radius: "size.radius",
  blockPadding: "padding-block-start",
  inlinePadding: "padding-inline-start",
  minHeight: "min-height",
} as const;

function actionSlotPresent(ir: ComponentIR, suffix: string): boolean {
  return ir.tokenScopes.some((scope) =>
    scope.values.some((v) => v.name.endsWith(suffix)),
  );
}

function emitActionComponent(ir: ComponentIR): string {
  const exportName = swiftExportName(ir.name);
  const has = (suffix: string) => actionSlotPresent(ir, suffix);

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
      const literalArg = value.rawValue
        ? `${value.isLiteral ? "literal" : "fallback"}: .string("${value.rawValue}")`
        : "";
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
      `${INDENT}${INDENT}${axis}: ${ir.name}${capitalize(axis)} = .${def},`,
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
  if (has(ACTION_SLOT_SUFFIXES.background)) {
    accessors.push(
      `${INDENT}private var background: Color { colorSlot("${ACTION_SLOT_SUFFIXES.background}") ?? .accentColor }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.foreground)) {
    accessors.push(
      `${INDENT}private var foreground: Color { colorSlot("${ACTION_SLOT_SUFFIXES.foreground}") ?? .primary }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.borderColor)) {
    accessors.push(
      `${INDENT}private var borderColor: Color { colorSlot("${ACTION_SLOT_SUFFIXES.borderColor}") ?? .clear }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.borderWidth)) {
    accessors.push(
      `${INDENT}private var borderWidth: CGFloat { pxSlot("${ACTION_SLOT_SUFFIXES.borderWidth}") ?? 0 }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.radius)) {
    accessors.push(
      `${INDENT}private var radius: CGFloat { pxSlot("${ACTION_SLOT_SUFFIXES.radius}") ?? 0 }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.blockPadding)) {
    accessors.push(
      `${INDENT}private var blockPadding: CGFloat { pxSlot("${ACTION_SLOT_SUFFIXES.blockPadding}") ?? 0 }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.inlinePadding)) {
    accessors.push(
      `${INDENT}private var inlinePadding: CGFloat { pxSlot("${ACTION_SLOT_SUFFIXES.inlinePadding}") ?? 0 }`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.minHeight)) {
    accessors.push(
      `${INDENT}private var minHeight: CGFloat { pxSlot("${ACTION_SLOT_SUFFIXES.minHeight}") ?? 0 }`,
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
  if (has(ACTION_SLOT_SUFFIXES.blockPadding)) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.padding(.vertical, blockPadding)`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.inlinePadding)) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.padding(.horizontal, inlinePadding)`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.minHeight)) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.frame(minHeight: minHeight)`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.background)) {
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}.background(background)`);
  }
  if (has(ACTION_SLOT_SUFFIXES.radius)) {
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))`,
    );
  }
  if (has(ACTION_SLOT_SUFFIXES.borderColor) && has(ACTION_SLOT_SUFFIXES.borderWidth)) {
    const radiusExpr = has(ACTION_SLOT_SUFFIXES.radius) ? "radius" : "0";
    lines.push(
      `${INDENT}${INDENT}${INDENT}${INDENT}.overlay(` +
        `RoundedRectangle(cornerRadius: ${radiusExpr}, style: .continuous)` +
        `.stroke(borderColor, lineWidth: borderWidth))`,
    );
  }
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}.buttonStyle(.plain)`);
  if (has(ACTION_SLOT_SUFFIXES.foreground)) {
    lines.push(`${INDENT}${INDENT}.foregroundStyle(foreground)`);
  }
  if (hasConventionalProp(ir, "disabled") && hasConventionalProp(ir, "loading")) {
    lines.push(`${INDENT}${INDENT}.disabled(disabled || loading)`);
  } else if (hasConventionalProp(ir, "disabled")) {
    lines.push(`${INDENT}${INDENT}.disabled(disabled)`);
  }
  if (hasConventionalProp(ir, "ariaLabel")) {
    lines.push(`${INDENT}${INDENT}.accessibilityLabel(accessibilityLabel ?? "")`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");

  return lines.join("\n");
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

function emitTypes(ir: ComponentIR): string {
  const lines: string[] = ["// @generated:start types"];
  for (const [typeName, def] of Object.entries(ir.definedTypes)) {
    if (def.kind !== "union" || !def.values) continue;
    lines.push(`public enum ${typeName}: String, CaseIterable {`);
    for (const value of def.values) {
      lines.push(`${INDENT}case ${value}`);
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
  lines.push(`${INDENT}private let controlledChecked: Binding<Bool>?`);
  lines.push(`${INDENT}@State private var uncontrolledChecked: Bool`);
  lines.push(`${INDENT}private let onChange: ((Bool) -> Void)?`);

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
    lines.push(`${INDENT}${INDENT}size: ${sizeTypeName} = .${sizeDefaultMember},`);
  }
  lines.push(`${INDENT}${INDENT}disabled: Bool = false,`);
  lines.push(`${INDENT}${INDENT}name: String? = nil,`);
  lines.push(`${INDENT}${INDENT}value: String? = nil,`);
  lines.push(`${INDENT}${INDENT}accessibilityLabel: String? = nil`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self.controlledChecked = checked`);
  lines.push(
    `${INDENT}${INDENT}self._uncontrolledChecked = State(initialValue: defaultChecked)`,
  );
  lines.push(`${INDENT}${INDENT}self.onChange = onChange`);
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

  // Channel read accessor
  lines.push(`${INDENT}private var checked: Bool {`);
  lines.push(
    `${INDENT}${INDENT}controlledChecked?.wrappedValue ?? uncontrolledChecked`,
  );
  lines.push(`${INDENT}}`);
  lines.push("");

  // Channel write accessor
  lines.push(`${INDENT}private func setChecked(_ next: Bool) {`);
  lines.push(`${INDENT}${INDENT}if let binding = controlledChecked {`);
  lines.push(`${INDENT}${INDENT}${INDENT}binding.wrappedValue = next`);
  lines.push(`${INDENT}${INDENT}} else {`);
  lines.push(`${INDENT}${INDENT}${INDENT}uncontrolledChecked = next`);
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}onChange?(next)`);
  lines.push(`${INDENT}}`);
  lines.push("");

  // Body: Toggle with .switch style
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}Toggle(isOn: Binding(`);
  lines.push(`${INDENT}${INDENT}${INDENT}get: { checked },`);
  lines.push(`${INDENT}${INDENT}${INDENT}set: { setChecked($0) }`);
  lines.push(`${INDENT}${INDENT})) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}EmptyView()`);
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}.toggleStyle(.switch)`);
  lines.push(`${INDENT}${INDENT}.disabled(disabled)`);
  lines.push(
    `${INDENT}${INDENT}.accessibilityLabel(accessibilityLabel ?? "")`,
  );
  lines.push(
    `${INDENT}${INDENT}.accessibilityValue(checked ? "on" : "off")`,
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
    lines.push(`${INDENT}${INDENT}case .${value}: return ${px}`);
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
