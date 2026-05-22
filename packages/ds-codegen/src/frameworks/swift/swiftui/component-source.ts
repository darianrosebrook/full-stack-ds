/**
 * SwiftUI View struct emission for components whose anatomy collapses
 * into a native SwiftUI primitive on this target.
 *
 * Round-2 scope (CODEGEN-NON-WEB-ROUND2-SWITCH-01): Switch only. The
 * emitter dispatches on `collectCollapseIntents(ir)` and, when the
 * `native-toggle-affordance` intent is present, emits a SwiftUI
 * `Toggle(.switch)` instead of walking the multi-part anatomy.
 *
 * The emitter intentionally consumes the IR's framework-neutral
 * facts only (channels, props, defined types, collapse intents). It
 * does not branch on component identity. Per binding-rule doctrine,
 * the toggle-style realization is keyed on the collapse intent —
 * which is a per-part anatomy fact declared in the contract.
 *
 * Out of scope for round 2: multi-part anatomy fallback, surface
 * components (Tooltip/Popover), compound parts, hand-edit
 * preservation via @custom sections, full token resolution against
 * a SwiftUI Theme module.
 */
import type { ComponentIR, NormalizedChannelIR } from "../../../ir.js";
import { collectCollapseIntents } from "../../../ir.js";

const INDENT = "    ";

export function generateSwiftUIComponentSource(ir: ComponentIR): string {
  const collapseIntents = collectCollapseIntents(ir);
  const isNativeToggle = collapseIntents.has("native-toggle-affordance");

  if (!isNativeToggle) {
    throw new Error(
      `generateSwiftUIComponentSource: only the native-toggle-affordance ` +
        `collapse path is implemented (round 2 scope). Component "${ir.name}" ` +
        `does not declare that intent; multi-part anatomy fallback is not yet ` +
        `implemented.`,
    );
  }

  const sections: string[] = [];
  sections.push(emitImports());
  sections.push(emitTypes(ir));
  sections.push(emitToggleComponent(ir));

  return sections.join("\n\n") + "\n";
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
  if (sizeTypeName) {
    lines.push(`${INDENT}${INDENT}size: ${sizeTypeName} = .md,`);
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
  lines.push(
    `${INDENT}${INDENT}.frame(width: trackWidth, height: trackHeight)`,
  );
  lines.push(`${INDENT}}`);
  lines.push("");

  // Size accessors (gap 1a still pending: only md tokens exist; sm/lg
  // fall through to md's value rather than guessing)
  if (sizeTypeName) {
    emitSizeAccessor(lines, "trackWidth", ir, sizeTypeName, "width");
    lines.push("");
    emitSizeAccessor(lines, "trackHeight", ir, sizeTypeName, "height");
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
  dimension: "width" | "height",
): void {
  const sizeDef = ir.definedTypes[sizeTypeName];
  if (!sizeDef?.values) return;

  // Round-2 honors only the md token (gap 1a deferred). When gap 1a lands,
  // each variant's own token populates and the per-variant lookup picks
  // each up distinctly. Until then, missing variants fall through to md
  // so SwiftUI doesn't ship a 0-sized track.
  const mdValue = parsePxFallback(findSizeToken(ir, "md", dimension));

  lines.push(`${INDENT}private var ${accessorName}: CGFloat {`);
  lines.push(`${INDENT}${INDENT}switch size {`);
  for (const value of sizeDef.values) {
    const variantToken = findSizeToken(ir, value, dimension);
    const px = variantToken ? parsePxFallback(variantToken) : mdValue;
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
 * Look up the px fallback for a `<componentSlug>.size.<variant>.track.<dimension>`
 * token. After TOKENS-WORKSTREAM-STEP-06A-II, the IR's cssBlocks declare
 * a per-variant slot like
 *
 *   "--fsds-switch-size-md-track-width": "var(--fsds-core-spacing-size-09, 48px)"
 *
 * The inner var() arg is the fallback. We match by the slot's custom-property
 * name (which embeds the variant), so this resolves per-variant even when
 * the IR carries entries for sm/md/lg simultaneously. Returns undefined when
 * the slot for that variant/dimension isn't present (gap 1a still pending
 * for Switch — only md is currently authored).
 */
function findSizeToken(
  ir: ComponentIR,
  variant: string,
  dimension: "width" | "height",
): string | undefined {
  const slotName = `--fsds-${ir.cssPrefix}-size-${variant}-track-${dimension}`;
  for (const block of ir.cssBlocks) {
    const slotValue = block.declarations[slotName];
    if (typeof slotValue === "string") return slotValue;
  }
  return undefined;
}

function parsePxFallback(varExpr: string | undefined): number {
  if (!varExpr) return 0;
  const match = varExpr.match(/(\d+)px\)$/);
  return match ? Number(match[1]) : 0;
}
