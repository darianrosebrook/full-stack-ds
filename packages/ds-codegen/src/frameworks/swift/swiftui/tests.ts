/**
 * SwiftUI test source emission — scaffold.
 *
 * Target runner: XCTest, optionally with `ViewInspector` for body
 * introspection and `Snapshotting` (pointfreeco/swift-snapshot-testing)
 * for visual regressions. Behavioral tests should consume the same
 * `buildComponentTestPlan` output the other emitters use, so channel /
 * escape / a11y coverage stays in sync across frameworks.
 *
 * For compound-state-container components (Tabs-shaped), follow the
 * Lit/React convention: emit only a smoke test + accessibility check
 * in `@generated`, leave behavioral coverage in `@custom`.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateSwiftUITest(_ir: ComponentIR): string {
  throw new Error(
    "generateSwiftUITest: not implemented — Swift emitter is scaffold-only.",
  );
}
