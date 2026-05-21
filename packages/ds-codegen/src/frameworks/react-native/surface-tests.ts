/**
 * React Native behavioral tests for the Anchored Presence Surface family —
 * scaffold. Parity with the web emitters where semantics overlap; platform-
 * conditional where they don't (no hover events on touch devices, no
 * Escape key, no document focus model).
 *
 * Runner: jest + `@testing-library/react-native`. Press events via
 * `fireEvent.press`, Android back via mocking `BackHandler`.
 */
import type { ComponentIR } from "../../ir.js";

export function generateReactNativeSurfaceTest(_ir: ComponentIR): string {
  throw new Error(
    "generateReactNativeSurfaceTest: not implemented — React Native emitter is scaffold-only.",
  );
}
