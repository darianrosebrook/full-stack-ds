/**
 * Jetpack Compose test source emission — scaffold.
 *
 * Runner: `androidx.compose.ui.test.junit4` with `createComposeRule()`.
 * Behavioral tests consume the same `buildComponentTestPlan` output as
 * the other emitters:
 *
 *   - Channel tests → `composeTestRule.setContent { ... }` with controlled
 *     state hoisted to a `var` outside, then `performClick()` /
 *     `performTextInput(...)`, then `assert(hasText("..."))` or
 *     `onNodeWithTag(...).assertIsDisplayed()`.
 *   - Escape dismissal → `performKeyInput { keyDown(Key.Escape); keyUp(Key.Escape) }`.
 *   - Accessibility → semantics-tree assertions (`hasContentDescription`,
 *     `isToggleable`, `expandable`). No `axe` equivalent.
 *
 * For compound-state-container components (Tabs-shaped), follow the
 * established convention: smoke + a11y in `@generated`, behavioral
 * coverage in `@custom`.
 */
import type { ComponentIR } from "../../ir.js";

export function generateJetpackComposeTest(_ir: ComponentIR): string {
  throw new Error(
    "generateJetpackComposeTest: not implemented — Jetpack Compose emitter is scaffold-only.",
  );
}
