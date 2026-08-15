/**
 * SwiftUI test source emission — deferred.
 *
 * Target runner: XCTest, optionally with `ViewInspector` for body
 * introspection and `Snapshotting` (pointfreeco/swift-snapshot-testing)
 * for visual regressions. Behavioral tests should consume the same
 * `buildComponentTestPlan` output the other emitters use, so channel /
 * escape / a11y coverage stays in sync across frameworks.
 *
 * The factory does NOT call this yet: an XCTest file cannot live inside
 * the SwiftPM library target (Sources/DsSwiftUI), and no test target
 * exists. This throws so accidental wiring fails loudly instead of
 * emitting a file that breaks `swift build`.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateSwiftUITest(_ir: ComponentIR): string {
  throw new Error(
    "generateSwiftUITest: deferred — XCTest emission requires a SwiftPM " +
      "test target outside the library target; the factory returns no " +
      "test files until that lands.",
  );
}
