/**
 * SwiftUI surface emission.
 *
 * The surface path routes by `ir.surface.kind`:
 *
 * - Centered modal (`dialog`, blocking modality): presented as a SwiftUI
 *   `.sheet` whose dismissal drives the openness channel back through the
 *   controllable-state projection (native Esc/overlay dismissal realizes
 *   the contract's escape/overlayClick triggers). FEAT-SWIFTUI-DIALOG-SURFACE-01.
 * - Anchored kinds (tooltip/popover): NOT implemented — they throw
 *   explicitly until their slice lands (host adoption via PreferenceKey
 *   is the open question).
 *
 * The component path refuses every surface kind; all surfaces route here.
 */
import type { ComponentIR } from "../../../ir.js";
import {
  swiftCase,
  swiftExportName,
  resolveChrome,
  emitChromeAccessorLines,
  emitTokenScopesSection,
} from "./component-source.js";

const INDENT = "    ";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface != null;
}

export interface SwiftUISurfaceFiles {
  componentFile: string;
  behaviorFile: string | null;
}

/** Swift reserved member names on a View — `body` collides with the View requirement. */
const SWIFT_VIEW_RESERVED_MEMBERS: ReadonlySet<string> = new Set(["body"]);

function regionPropertyName(part: string): string {
  return SWIFT_VIEW_RESERVED_MEMBERS.has(part) ? `${part}Content` : part;
}

export function generateSwiftUISurfaceFiles(ir: ComponentIR): SwiftUISurfaceFiles {
  if (!ir.surface) {
    throw new Error("generateSwiftUISurfaceFiles: component declares no surface block.");
  }
  if (ir.surface.kind !== "dialog") {
    throw new Error(
      `generateSwiftUISurfaceFiles: surface kind "${ir.surface.kind}" is not ` +
        `implemented — only the centered-modal (dialog) branch exists. ` +
        `Anchored surfaces (tooltip/popover) are a later slice.`,
    );
  }
  const openness = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "boolean",
  );
  if (!openness) {
    throw new Error(
      `generateSwiftUISurfaceFiles: dialog surface on "${ir.name}" declares ` +
        `no boolean openness channel.`,
    );
  }

  const exportName = swiftExportName(ir.name);
  const chrome = resolveChrome(ir);
  const regions = ir.compoundParts.map((part) => regionPropertyName(part.name));
  const lines: string[] = [];

  lines.push("// @generated:start imports");
  lines.push("import SwiftUI");
  lines.push("// @generated:end");
  lines.push("");
  lines.push("// @generated:start component");
  lines.push(...emitTokenScopesSection(ir));
  lines.push("");
  lines.push(
    `/// Emitted through the centered-modal surface path: presented as a ` +
      `sheet whose native dismissal (Esc, overlay click) drives the ` +
      `openness channel back through onOpenChange — the contract's ` +
      `escape/overlayClick dismissal triggers realized by the platform.`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  const genericParams = regions.map((r) => `${swiftCase(capitalize(r))}: View`);
  lines.push(
    `public struct ${exportName}${genericParams.length > 0 ? `<${genericParams.join(", ")}>` : ""}: View {`,
  );
  lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);
  lines.push(`${INDENT}private let controlledOpen: Binding<Bool>?`);
  lines.push(`${INDENT}@State private var uncontrolledOpen: Bool`);
  lines.push(`${INDENT}private let onOpenChange: ((Bool) -> Void)?`);
  for (const region of regions) {
    lines.push(`${INDENT}private let ${region}: ${swiftCase(capitalize(region))}`);
  }
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params: string[] = [
    "open: Binding<Bool>? = nil,",
    "defaultOpen: Bool = false,",
    "onOpenChange: ((Bool) -> Void)? = nil,",
  ];
  for (const region of regions) {
    params.push(
      `@ViewBuilder ${region}: () -> ${swiftCase(capitalize(region))} = { EmptyView() }${region === regions[regions.length - 1] ? "" : ","}`,
    );
  }
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self.controlledOpen = open`);
  lines.push(`${INDENT}${INDENT}self._uncontrolledOpen = State(initialValue: defaultOpen)`);
  lines.push(`${INDENT}${INDENT}self.onOpenChange = onOpenChange`);
  for (const region of regions) {
    lines.push(`${INDENT}${INDENT}self.${region} = ${region}()`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private var isOpen: Bool {`);
  lines.push(`${INDENT}${INDENT}controlledOpen?.wrappedValue ?? uncontrolledOpen`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private func setOpen(_ next: Bool) {`);
  lines.push(`${INDENT}${INDENT}if let binding = controlledOpen {`);
  lines.push(`${INDENT}${INDENT}${INDENT}binding.wrappedValue = next`);
  lines.push(`${INDENT}${INDENT}} else {`);
  lines.push(`${INDENT}${INDENT}${INDENT}uncontrolledOpen = next`);
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}onOpenChange?(next)`);
  lines.push(`${INDENT}}`);
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
  lines.push(
    ...emitChromeAccessorLines(chrome, [
      "background",
      "foreground",
      "borderColor",
      "radius",
      "blockPadding",
      "inlinePadding",
      "gap",
      "minHeight",
    ]),
  );
  lines.push("");
  lines.push(`${INDENT}@ViewBuilder`);
  lines.push(`${INDENT}private var panel: some View {`);
  lines.push(`${INDENT}${INDENT}VStack(spacing: ${chrome.gap ? "gap" : "nil"}) {`);
  for (const region of regions) {
    lines.push(`${INDENT}${INDENT}${INDENT}${region}`);
  }
  lines.push(`${INDENT}${INDENT}}`);
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
  if (chrome.foreground) {
    lines.push(`${INDENT}${INDENT}${INDENT}.foregroundStyle(foreground)`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}EmptyView()`);
  lines.push(`${INDENT}${INDENT}${INDENT}.sheet(isPresented: Binding(`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}get: { isOpen },`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}set: { setOpen($0) }`);
  lines.push(`${INDENT}${INDENT}${INDENT})) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}panel`);
  lines.push(`${INDENT}${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");

  return { componentFile: lines.join("\n") + "\n", behaviorFile: null };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
