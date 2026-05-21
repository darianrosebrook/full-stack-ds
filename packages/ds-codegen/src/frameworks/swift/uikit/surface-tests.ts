/**
 * UIKit behavioral tests for the Anchored Presence Surface family —
 * scaffold. Mirrors the test surface defined in the web emitters,
 * adapted to UIKit gesture and presentation APIs.
 *
 * Runner: XCTest, with `UITooltipInteraction` / `UIPopoverPresentationController`
 * exercised via direct API calls; full gesture flows go through
 * `XCUIApplication` UI tests.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateUIKitSurfaceTest(_ir: ComponentIR): string {
  throw new Error(
    "generateUIKitSurfaceTest: not implemented — Swift emitter is scaffold-only.",
  );
}
