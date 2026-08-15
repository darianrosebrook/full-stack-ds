/**
 * SwiftUI Stack primitive emission.
 *
 * Lowers the primitive contract IR (`PrimitiveIR`) into a SwiftUI `Stack`
 * generic View. Every layout fact comes from the IR — the axis vocabulary
 * (`layout.axisByVariant`), the axis-bearing modes (`axisModes`, derived
 * from displayByMode's flex/inline-flex entries), the layout-mode union
 * (`layout.displayByMode` keys), the gap token identity (`layout.gap.token`),
 * and the prop defaults (`props[].kind` layoutVariant/layoutMode). The
 * emitter's only job is SwiftUI grammar: which native container expresses
 * which IR axis.
 *
 * Doctrine carried over from the web targets (FIX-STACK-NATIVE-AXIS-LEAK-01):
 * the axis applies ONLY in axis-bearing modes; every other mode — including
 * `native` — renders a neutral container with no imposed spacing. SwiftUI has
 * no zero-layout multi-child container (any parent imposes arrangement), so
 * the neutral path is documented as the platform-default analog of RN's
 * unstyled View.
 *
 * The gap token's concrete value is deliberately NOT invented here: spacing
 * is a consumer-settable parameter, and value projection arrives with the
 * FsdsTheme token module.
 */
import type { GeneratedFile } from "../../../emitter.js";
import type { PrimitiveIR } from "../../../primitive-contract.js";

const INDENT = "  ";

/** IR axis vocabulary → SwiftUI container. Unknown axes fail loudly. */
const AXIS_CONTAINER: Record<string, string> = {
  column: "VStack",
  row: "HStack",
};

export function generateSwiftUIPrimitiveFiles(ir: PrimitiveIR): GeneratedFile[] {
  const { axisByVariant, displayByMode, gap } = ir.layout;
  const variants = Object.keys(axisByVariant);
  if (variants.length === 0) {
    throw new Error(
      `generateSwiftUIPrimitiveFiles: primitive ${ir.name} declares no axisByVariant entries.`,
    );
  }
  for (const v of variants) {
    const axis = axisByVariant[v]!;
    if (!AXIS_CONTAINER[axis]) {
      throw new Error(
        `generateSwiftUIPrimitiveFiles: unknown axis "${axis}" for variant ` +
          `"${v}" — no SwiftUI container mapping in the IR axis vocabulary.`,
      );
    }
  }
  const modes = Object.keys(displayByMode).sort();
  const axisModes = new Set(ir.axisModes);
  const defaultVariant =
    (ir.props.find((p) => p.kind === "layoutVariant")?.default as string) ??
    "vertical";
  const defaultMode =
    (ir.props.find((p) => p.kind === "layoutMode")?.default as string) ??
    "stack";

  const lines: string[] = [];
  lines.push("// @generated:start imports");
  lines.push("import SwiftUI");
  lines.push("// @generated:end");
  lines.push("");
  lines.push("// @generated:start primitive");
  lines.push(`/// FSDS \`${ir.name}\` layout primitive, lowered from the primitive contract IR.`);
  lines.push("///");
  lines.push("/// The axis applies only in axis-bearing layout modes (" +
    [...axisModes].map((m) => `"${m}"`).join(", ") +
    "); every other mode renders a neutral container with no imposed");
  lines.push("/// spacing — the SwiftUI analog of the web targets' axis-mode gating.");
  if (gap?.token) {
    lines.push("///");
    lines.push(`/// Gap: the contract binds inter-child spacing to the "${gap.token}"`);
    lines.push("/// token; until the theme module projects concrete values, `spacing` is");
    lines.push("/// consumer-settable (nil = SwiftUI default spacing).");
  }
  lines.push(`public struct ${ir.name}<Content: View>: View {`);
  lines.push(`${INDENT}public enum ${ir.name}Variant: String, CaseIterable {`);
  for (const variant of variants) {
    lines.push(`${INDENT}${INDENT}case ${swiftCaseDecl(variant)}`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public enum ${ir.name}Layout: String, CaseIterable {`);
  for (const mode of modes) {
    lines.push(`${INDENT}${INDENT}case ${swiftCaseDecl(mode)}`);
  }
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}private let variant: ${ir.name}Variant`);
  lines.push(`${INDENT}private let layout: ${ir.name}Layout`);
  lines.push(`${INDENT}private let spacing: CGFloat?`);
  lines.push(`${INDENT}private let accessibilityIdentifier: String?`);
  lines.push(`${INDENT}private let content: Content`);
  lines.push("");
  lines.push(`${INDENT}public init(`);
  lines.push(`${INDENT}${INDENT}variant: ${ir.name}Variant = .${swiftCase(defaultVariant)},`);
  lines.push(`${INDENT}${INDENT}layout: ${ir.name}Layout = .${swiftCase(defaultMode)},`);
  lines.push(`${INDENT}${INDENT}spacing: CGFloat? = nil,`);
  lines.push(`${INDENT}${INDENT}accessibilityIdentifier: String? = nil,`);
  lines.push(`${INDENT}${INDENT}@ViewBuilder content: () -> Content`);
  lines.push(`${INDENT}) {`);
  lines.push(`${INDENT}${INDENT}self.variant = variant`);
  lines.push(`${INDENT}${INDENT}self.layout = layout`);
  lines.push(`${INDENT}${INDENT}self.spacing = spacing`);
  lines.push(`${INDENT}${INDENT}self.accessibilityIdentifier = accessibilityIdentifier`);
  lines.push(`${INDENT}${INDENT}self.content = content()`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}/// Axis-bearing modes derive from the primitive contract's`);
  lines.push(`${INDENT}/// displayByMode flex entries; all other modes keep the host's own`);
  lines.push(`${INDENT}/// layout behavior (no imposed axis, no imposed spacing).`);
  lines.push(`${INDENT}private var appliesAxis: Bool {`);
  lines.push(`${INDENT}${INDENT}switch layout {`);
  for (const mode of modes) {
    lines.push(
      `${INDENT}${INDENT}case .${swiftCase(mode)}: return ${axisModes.has(mode)}`,
    );
  }
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}public var body: some View {`);
  lines.push(`${INDENT}${INDENT}stackBody`);
  lines.push(`${INDENT}${INDENT}${INDENT}.fsdsAccessibilityIdentifier(accessibilityIdentifier)`);
  lines.push(`${INDENT}}`);
  lines.push("");
  lines.push(`${INDENT}@ViewBuilder`);
  lines.push(`${INDENT}private var stackBody: some View {`);
  lines.push(`${INDENT}${INDENT}switch (appliesAxis, variant) {`);
  for (const variant of variants) {
    const container = AXIS_CONTAINER[axisByVariant[variant]!]!;
    lines.push(
      `${INDENT}${INDENT}case (true, .${swiftCase(variant)}):`,
    );
    lines.push(
      `${INDENT}${INDENT}${INDENT}${container}(spacing: spacing) { content }`,
    );
  }
  lines.push(`${INDENT}${INDENT}case (false, _):`);
  lines.push(`${INDENT}${INDENT}${INDENT}VStack(spacing: nil) { content }`);
  lines.push(`${INDENT}${INDENT}}`);
  lines.push(`${INDENT}}`);
  lines.push(`}`);
  lines.push("// @generated:end");

  return [
    {
      relativePath: `${ir.name}.swift`,
      contents: lines.join("\n") + "\n",
    },
  ];
}

/** `inline-stack` → `case inlineStack = "inline-stack"` (kebab IR values keep a raw value). */
function swiftCaseDecl(value: string): string {
  const swiftName = value
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
  return swiftName === value ? swiftName : `${swiftName} = "${value}"`;
}

/** `inline-stack` → `inlineStack` (Swift case reference). */
function swiftCase(value: string): string {
  return value
    .split("-")
    .map((part, i) =>
      i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}
