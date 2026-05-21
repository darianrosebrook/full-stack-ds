/**
 * React Native hook emission — scaffold.
 *
 * Same dispatch surface as `frameworks/react/hook-source.ts` but routed
 * to RN-native primitives where the DOM analogue doesn't apply:
 *
 *   - `behavior.normalizedChannels`        → `useControllableState`
 *                                            (identical to React — pure JS)
 *   - `behavior.focus.strategy=trap`       → RN focus trap (likely
 *                                            `accessibilityViewIsModal` on
 *                                            iOS, manual focus mgmt on Android)
 *   - `behavior.focus.scrollLock`          → no-op or RN-specific
 *                                            (no document scroll)
 *   - `behavior.portal.enabled`            → RN `<Modal transparent>` or
 *                                            react-native-portalize
 *   - `behavior.normalizedDismissalTriggers`:
 *       escape  → Android `BackHandler` (iOS has no escape; suppressed)
 *       outside → `Pressable` overlay with `onPress`
 *
 * Returns `null` when the IR declares no behavior — caller skips the
 * file entirely (parity with React).
 */
import type { ComponentIR } from "../../ir.js";

export function generateReactNativeHookSource(
  _ir: ComponentIR,
): string | null {
  throw new Error(
    "generateReactNativeHookSource: not implemented — React Native emitter is scaffold-only.",
  );
}
