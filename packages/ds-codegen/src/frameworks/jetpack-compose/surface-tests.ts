/**
 * Jetpack Compose behavioral tests for the Anchored Presence Surface
 * family — scaffold. Parity with the web emitters where semantics
 * overlap; platform-conditional where they don't (touch-only hover
 * semantics, no separate Escape key in most form factors, system back
 * gesture replaces some dismissal paths).
 *
 * Runner: `androidx.compose.ui.test.junit4`. Hover via `performMouseInput`
 * (Compose Multiplatform desktop only — Android skips), press via
 * `performClick()`, back via `Espresso.pressBack()` from a JUnit test rule.
 */
import type { ComponentIR } from "../../ir.js";

export function generateJetpackComposeSurfaceTest(_ir: ComponentIR): string {
  throw new Error(
    "generateJetpackComposeSurfaceTest: not implemented — Jetpack Compose emitter is scaffold-only.",
  );
}
