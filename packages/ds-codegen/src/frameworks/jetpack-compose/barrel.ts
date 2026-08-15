/**
 * Barrel for the `packages/ds-jetpack-compose` Gradle package.
 *
 * Kotlin modules don't use JS-style re-export barrels: the Gradle source
 * set compiles every `.kt` file under the components root into one module
 * and auto-exports all public symbols, so no import machinery is needed —
 * the same situation as SwiftPM (see swift/swiftui/barrel.ts). The barrel
 * file still exists because the codegen CLI writes one per components
 * root: it carries the generation stamp and the generated component list
 * as comments, declares no symbols, and compiles to nothing.
 */

export function generateJetpackComposeBarrel(
  componentNames: string[],
  _componentsRoot?: string,
): string {
  const lines: string[] = [
    "// @generated:start barrel",
    "// ds-jetpack-compose generated components: " + componentNames.join(", "),
    "// The Gradle source set auto-exports all public symbols in this module;",
    "// this file intentionally declares none.",
    "// @generated:end",
  ];
  return lines.join("\n") + "\n";
}
