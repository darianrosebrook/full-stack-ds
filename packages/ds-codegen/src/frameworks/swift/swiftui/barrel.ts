/**
 * Barrel for the `packages/ds-swiftui` SwiftPM package.
 *
 * Swift modules don't use JS-style re-export barrels: SwiftPM compiles every
 * `.swift` file under `Sources/DsSwiftUI/` into one module and auto-exports
 * all public symbols, so no import machinery is needed. The barrel file still
 * exists because the codegen CLI writes one per components root — it carries
 * the generation stamp and the generated component list as comments, declares
 * no symbols, and compiles to nothing.
 */

export function generateSwiftUIBarrel(
  componentNames: string[],
  _componentsRoot?: string,
): string {
  const lines: string[] = [
    "// @generated:start barrel",
    "// DsSwiftUI generated components: " + componentNames.join(", "),
    "// SwiftPM auto-exports all public symbols in this target; this file",
    "// intentionally declares none.",
    "// @generated:end",
  ];
  return lines.join("\n") + "\n";
}
