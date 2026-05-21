/**
 * UIKit test source emission — scaffold.
 *
 * Runner: XCTest. Behavioral tests instantiate the view, exercise
 * `sendActions(for:)` or invoke target/action selectors directly, and
 * assert against `accessibilityLabel`, subview presence, and bound
 * state. Accessibility coverage can use the `XCUIApplication` audit
 * APIs (iOS 17+) or `AccessibilitySnapshot`.
 *
 * Same `buildComponentTestPlan` consumption pattern as the other
 * emitters so coverage stays in sync.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateUIKitTest(_ir: ComponentIR): string {
  throw new Error(
    "generateUIKitTest: not implemented — Swift emitter is scaffold-only.",
  );
}
