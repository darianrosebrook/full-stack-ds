/**
 * React Native test source emission — scaffold.
 *
 * Runner: jest + `@testing-library/react-native`. Behavioral tests consume
 * the same `buildComponentTestPlan` output as the web emitters; channel
 * and a11y plan items translate cleanly. Escape-dismissal plan items
 * become Android-only `BackHandler` tests; outside-press becomes a
 * `Pressable` overlay `fireEvent.press` assertion.
 *
 * Accessibility assertions target `accessibilityRole`, `accessibilityState`,
 * and `accessibilityLabel` instead of ARIA. There is no `axe` equivalent;
 * coverage relies on TLT queries (`getByRole`, `getByLabelText`).
 *
 * For compound-state-container components (Tabs-shaped), follow the
 * established convention: smoke + a11y in `@generated`, behavioral
 * coverage in `@custom`.
 */
import type { ComponentIR } from "../../ir.js";

export function generateReactNativeTest(_ir: ComponentIR): string {
  throw new Error(
    "generateReactNativeTest: not implemented — React Native emitter is scaffold-only.",
  );
}
