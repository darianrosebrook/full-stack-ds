/**
 * SwiftUI surface emission.
 *
 * The surface path routes by `ir.surface.kind`:
 *
 * - Centered modal (`dialog`, blocking modality): presented as a SwiftUI
 *   `.sheet` whose dismissal drives the openness channel back through the
 *   controllable-state projection (native Esc/overlay dismissal realizes
 *   the contract's escape/overlayClick triggers). FEAT-SWIFTUI-DIALOG-SURFACE-01.
 * - Anchored tooltip: the trigger region hosts consumer content; hover
 *   drives the open channel and presents the content region in a popover
 *   (FEAT-SWIFTUI-TOOLTIP-ANCHOR-01). Anchored popovers still throw.
 *
 * The component path refuses every surface kind; all surfaces route here.
 */
import type { ComponentIR } from "../../../ir.js";
import {
  emitTypes,
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
  const withTypes = (body: string): string => {
    const sections = [emitTypes(ir), body];
    return sections.filter((x) => x.trim().length > 0).join("\n\n") + "\n";
  };
  if (!ir.surface) {
    throw new Error("generateSwiftUISurfaceFiles: component declares no surface block.");
  }
  if (ir.surface.kind === "tooltip") {
    return { componentFile: withTypes(emitAnchoredTooltip(ir)), behaviorFile: null };
  }
  if (ir.surface.kind === "popover") {
    // Anchored like the tooltip but manual-open: the open channel rides
    // the substrate with NO hover affordance (the web trigger wires it).
    return { componentFile: withTypes(emitAnchoredPopover(ir)), behaviorFile: null };
  }
  if (ir.surface.kind === "toast") {
    // The generative proof of the compositional substrate: a NEW surface
    // kind emits through the same ControllableValue channel with only a
    // presentation row — ephemeral presence drives a dwell auto-dismiss
    // task whose duration comes from the motion token scopes. Zero new
    // state-machine code (FEAT-SWIFTUI-PRESENCE-COMPOSITION-01).
    return { componentFile: withTypes(emitToastSurface(ir)), behaviorFile: null };
  }
  // `sheet` shares the centered-modal presentation shape (openness
  // channel + compound content regions); macOS sheets are window-attached
  // and modal, so side/modal props are omitted-and-documented.
  if (ir.surface.kind !== "dialog" && ir.surface.kind !== "sheet") {
    throw new Error(
      `generateSwiftUISurfaceFiles: surface kind "${ir.surface.kind}" is not ` +
        `implemented — implemented kinds are the centered modal (dialog/` +
        `sheet) and the anchored tooltip. Anchored popovers remain a later ` +
        `slice.`,
    );
  }
  const openness = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "boolean",
  );
  const searchChannel = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "string",
  );
  const searchPlaceholder = searchChannel
    ? ir.styledProps.find((p) => p.safeName === "placeholder")?.defaultExpr
        ?.replace(/^["']|["']$/g, "") ?? "Search..."
    : null;
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
  lines.push(`${INDENT}@StateObject private var open: ControllableValue<Bool>`);
  if (searchChannel) {
  lines.push(`${INDENT}@StateObject private var search: ControllableValue<String>`);
  }
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
  if (searchChannel) {
    params.push("search: Binding<String>? = nil,");
    params.push('defaultSearch: String = "",');
    params.push("onSearchChange: ((String) -> Void)? = nil,");
  }
  for (const region of regions) {
    params.push(
      `@ViewBuilder ${region}: () -> ${swiftCase(capitalize(region))} = { EmptyView() }${region === regions[regions.length - 1] ? "" : ","}`,
    );
  }
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))`);
  if (searchChannel) {
  lines.push(`${INDENT}${INDENT}self._search = StateObject(wrappedValue: ControllableValue(controlled: search, defaultValue: defaultSearch, onChange: onSearchChange))`);
  }
  for (const region of regions) {
    lines.push(`${INDENT}${INDENT}self.${region} = ${region}()`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push("");
  if (searchChannel) {
    lines.push("");
  }
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
  if (searchChannel) {
    lines.push(`${INDENT}${INDENT}${INDENT}TextField(`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}"",`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}text: Binding(`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}get: { search.value },`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}set: { search.set($0) }`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}),`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}prompt: Text("${searchPlaceholder}")`);
    lines.push(`${INDENT}${INDENT}${INDENT})`);
  }
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
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}get: { open.value },`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}set: { open.set($0) }`);
  lines.push(`${INDENT}${INDENT}${INDENT})) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}panel`);
  lines.push(`${INDENT}${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");

  return { componentFile: withTypes(lines.join("\n")), behaviorFile: null };
}


/** Placement union value → SwiftUI popover edge (grammar-level mapping). */
const PLACEMENT_EDGE: Record<string, string> = {
  // `auto` is browser auto-positioning; the platform default popover edge
  // on macOS presents below the anchor, so auto lowers to .bottom.
  auto: ".bottom",
  top: ".top",
  bottom: ".bottom",
  left: ".leading",
  right: ".trailing",
  "top-start": ".topLeading",
  "top-end": ".topTrailing",
  "bottom-start": ".bottomLeading",
  "bottom-end": ".bottomTrailing",
};

/**
 * The anchored-tooltip branch: the trigger region is consumer content;
 * hover (the declared trigger modality on macOS) drives the open channel
 * through the controllable-state projection, presenting the content region
 * in a popover with presence-driven chrome.
 */
function emitAnchoredTooltip(ir: ComponentIR): string {
  const openChannel = ir.behavior.normalizedChannels.find(
    (c) => c.valueType === "boolean",
  );
  if (!openChannel) {
    throw new Error(
      `emitAnchoredTooltip: anchored surface on "${ir.name}" declares no ` +
        `boolean open channel.`,
    );
  }
  const triggerPart = ir.compoundParts.find((p) => p.name === "trigger");
  const contentPart = ir.compoundParts.find((p) => p.name === "content");
  if (!triggerPart || !contentPart) {
    throw new Error(
      `emitAnchoredTooltip: anchored surface on "${ir.name}" lacks ` +
        `trigger/content compound parts (found: ` +
        `${ir.compoundParts.map((p) => p.name).join("/") || "none"}).`,
    );
  }

  const exportName = swiftExportName(ir.name);
  const chrome = resolveChrome(ir);
  const placementType = ir.styledProps.find((p) => p.safeName === "placement")
    ?.typeRefs[0];
  const placementValues = placementType
    ? (ir.definedTypes[placementType]?.values ?? [])
    : [];
  const defaultPlacement =
    ir.styledProps.find((p) => p.safeName === "placement")?.defaultExpr
      ?.replace(/^["']|["']$/g, "") ?? placementValues[0];
  for (const value of placementValues) {
    if (!PLACEMENT_EDGE[value]) {
      throw new Error(
        `emitAnchoredTooltip: placement value "${value}" has no SwiftUI ` +
          `popover edge mapping.`,
      );
    }
  }
  const hasDisabled = ir.styledProps.some((p) => p.safeName === "disabled");

  const lines: string[] = [];
  lines.push("// @generated:start imports");
  lines.push("import SwiftUI");
  lines.push("// @generated:end");
  lines.push("");
  lines.push("// @generated:start component");
  lines.push(...emitTokenScopesSection(ir));
  lines.push("");
  lines.push(
    `/// Emitted through the anchored-tooltip surface path: hover on the ` +
      `trigger region drives the open channel (the declared trigger ` +
      `modality on this target), presenting the content region in a ` +
      `popover. Native popover dismissal realizes escape/blur.`,
  );
  if (exportName !== ir.name) {
    lines.push(
      `/// SwiftUI reserves the \`${ir.name}\` type name; this target ` +
        `exports it as \`${exportName}\`.`,
    );
  }
  lines.push(`public struct ${exportName}<Trigger: View, Content: View>: View {`);
  lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);
  lines.push(`${INDENT}@StateObject private var open: ControllableValue<Bool>`);
  if (placementValues.length > 0) {
    lines.push(`${INDENT}private let placement: ${placementType}`);
  }
  if (hasDisabled) {
    lines.push(`${INDENT}private let disabled: Bool`);
  }
  lines.push(`${INDENT}private let trigger: Trigger`);
  lines.push(`${INDENT}private let content: Content`);
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params: string[] = [
    "open: Binding<Bool>? = nil,",
    "defaultOpen: Bool = false,",
    "onOpenChange: ((Bool) -> Void)? = nil,",
  ];
  if (placementValues.length > 0 && defaultPlacement && PLACEMENT_EDGE[defaultPlacement]) {
    params.push(`placement: ${placementType} = .${swiftCase(defaultPlacement)},`);
  }
  if (hasDisabled) {
    params.push("disabled: Bool = false,");
  }
  params.push("@ViewBuilder trigger: () -> Trigger,");
  params.push("@ViewBuilder content: () -> Content = { EmptyView() }");
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))`);
  if (placementValues.length > 0 && defaultPlacement) {
    lines.push(`${INDENT}${INDENT}self.placement = placement`);
  }
  if (hasDisabled) {
    lines.push(`${INDENT}${INDENT}self.disabled = disabled`);
  }
  lines.push(`${INDENT}${INDENT}self.trigger = trigger()`);
  lines.push(`${INDENT}${INDENT}self.content = content()`);
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
  lines.push(`${INDENT}${INDENT}content`);
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
  lines.push(`${INDENT}${INDENT}trigger`);
  if (placementValues.length > 0) {
    lines.push(`${INDENT}${INDENT}${INDENT}.popover(isPresented: Binding(`);
  } else {
    lines.push(`${INDENT}${INDENT}${INDENT}.popover(isPresented: Binding(`);
  }
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}get: { open.value },`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}set: { open.set($0) }`);
  if (placementValues.length > 0) {
    lines.push(`${INDENT}${INDENT}${INDENT}), arrowEdge: placementEdge) {`);
  } else {
    lines.push(`${INDENT}${INDENT}${INDENT})) {`);
  }
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}panel`);
  lines.push(`${INDENT}${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}${INDENT}.onHover { hovering in`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}if !disabled { open.set(hovering) }`);
  lines.push(`${INDENT}${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
  if (placementValues.length > 0) {
    lines.push("");
    lines.push(`${INDENT}private var placementEdge: Edge {`);
    lines.push(`${INDENT}${INDENT}switch placement {`);
    for (const value of placementValues) {
      lines.push(
        `${INDENT}${INDENT}case .${swiftCase(value)}: return ${PLACEMENT_EDGE[value]}`,
      );
    }
    lines.push(`${INDENT}${INDENT}}`);
    lines.push(`${INDENT}}`);
  }
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n") + "\n";
}


function emitToastSurface(ir: ComponentIR): string {
  const chrome = resolveChrome(ir);
  const regions = ir.compoundParts.map((part) => regionPropertyName(part.name));
  // Dwell from the motion token scopes (presence budget): first ms-valued
  // token under the root scope. Absence means no auto-dismiss.
  const dwell = ir.tokenScopes
    .find((scope) => scope.scope === "root")
    ?.values.find((v) => /ms$/.test(v.rawValue ?? ""))
    ?.rawValue?.replace(/ms$/, "");
  const dwellMs = dwell ? Number(dwell) : null;
  const ephemeral = ir.surface?.presence === "ephemeral";

  const lines: string[] = [];
  lines.push("// @generated:start imports");
  lines.push("import SwiftUI");
  lines.push("// @generated:end");
  lines.push("");
  lines.push("// @generated:start component");
  lines.push(...emitTokenScopesSection(ir));
  lines.push("");
  lines.push(
    `/// Emitted through the toast surface path: an overlay presentation ` +
      `over the open channel (the shared ControllableValue substrate)` +
      (ephemeral && dwellMs
        ? `; ephemeral presence auto-dismisses after the dwell token (${dwellMs}ms).`
        : `.`),
  );
  const toastGenerics = regions
    .map((r) => `${swiftCase(capitalize(r))}: View`)
    .join(", ");
  lines.push(
    `public struct Toast${toastGenerics ? `<${toastGenerics}>` : ""}: View {`,
  );
  lines.push(`${INDENT}private var fsdsScopes: FsdsComponentTokenScopes {`);
  lines.push(`${INDENT}${INDENT}${ir.name}Tokens.scopes`);
  lines.push(`${INDENT}}`);
  lines.push(`${INDENT}@StateObject private var open: ControllableValue<Bool>`);
  for (const region of regions) {
    lines.push(`${INDENT}private let ${region}: ${swiftCase(capitalize(region))}`);
  }
  lines.push(`${INDENT}@Environment(\\.fsdsTheme) private var fsdsTheme`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  const params = [
    "open: Binding<Bool>? = nil,",
    "defaultOpen: Bool = false,",
    "onOpenChange: ((Bool) -> Void)? = nil,",
  ];
  regions.forEach((region, i) => {
    params.push(
      `@ViewBuilder ${region}: () -> ${swiftCase(capitalize(region))} = { EmptyView() }${i === regions.length - 1 ? "" : ","}`,
    );
  });
  for (const param of params) lines.push(`${INDENT}${INDENT}${param}`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))`);
  for (const region of regions) {
    lines.push(`${INDENT}${INDENT}self.${region} = ${region}()`);
  }
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
      "background", "foreground", "borderColor", "radius",
      "blockPadding", "inlinePadding", "gap", "minHeight",
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
  if (chrome.blockPadding) lines.push(`${INDENT}${INDENT}${INDENT}.padding(.vertical, blockPadding)`);
  if (chrome.inlinePadding) lines.push(`${INDENT}${INDENT}${INDENT}.padding(.horizontal, inlinePadding)`);
  if (chrome.background) lines.push(`${INDENT}${INDENT}${INDENT}.background(background)`);
  if (chrome.radius) lines.push(`${INDENT}${INDENT}${INDENT}.clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))`);
  if (chrome.foreground) lines.push(`${INDENT}${INDENT}${INDENT}.foregroundStyle(foreground)`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}ZStack(alignment: .topTrailing) {`);
  lines.push(`${INDENT}${INDENT}${INDENT}Color.clear`);
  lines.push(`${INDENT}${INDENT}${INDENT}if open.value {`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}panel`);
  lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}.transition(.move(edge: .top).combined(with: .opacity))`);
  lines.push(`${INDENT}${INDENT}${INDENT}}`);
  lines.push(`${INDENT}${INDENT}}`);
  if (ephemeral && dwellMs) {
    lines.push(`${INDENT}${INDENT}${INDENT}.task(id: open.value) {`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}if open.value {`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}try? await Task.sleep(for: .milliseconds(${dwellMs}))`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}${INDENT}open.set(false)`);
    lines.push(`${INDENT}${INDENT}${INDENT}${INDENT}}`);
    lines.push(`${INDENT}${INDENT}${INDENT}}`);
  }
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");
  return lines.join("\n");
}


function emitAnchoredPopover(ir: ComponentIR): string {
  // The popover shares the anchored tooltip's shape; strip the hover
  // driver (manual open only) from a tooltip-shaped emission. The hover
  // block is three emitted lines (.onHover …, guard body, closing }) —
  // remove all three by index so no orphan braces remain.
  const tooltipShaped = emitAnchoredTooltip(ir);
  const lines = tooltipShaped.split("\n");
  const hoverIndex = lines.findIndex((line) => line.includes(".onHover"));
  if (hoverIndex !== -1) {
    lines.splice(hoverIndex, 3);
  }
  return lines.join("\n");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
