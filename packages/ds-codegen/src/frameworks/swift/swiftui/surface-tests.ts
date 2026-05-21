/**
 * SwiftUI behavioral tests for the Anchored Presence Surface family —
 * scaffold. Mirrors the test surface defined in the web emitters:
 * hover/focus open, pointer-leave/blur/escape close, accessibility
 * label/hint wiring on the adopted anchor, disabled suppression,
 * controlled vs uncontrolled state, default-host vs adopted-host.
 *
 * Runner: XCTest + ViewInspector. Gesture simulation goes through
 * `XCUIApplication` in UI tests or `ViewInspector.callOnAppear` /
 * `.callOnTapGesture` for unit-level coverage.
 */
import type { ComponentIR } from "../../../ir.js";

export function generateSwiftUISurfaceTest(_ir: ComponentIR): string {
  throw new Error(
    "generateSwiftUISurfaceTest: not implemented — Swift emitter is scaffold-only.",
  );
}
