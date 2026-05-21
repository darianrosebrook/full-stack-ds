/**
 * React Native Anchored Presence Surface emitter — scaffold.
 *
 * RN's native primitives don't include a real Tooltip or Popover. The
 * available substrate:
 *   - `<Modal transparent visible={...}>`   → Popover portal layer
 *   - `Pressable` overlay                   → outside-press dismissal
 *   - `BackHandler` (Android)               → escape-equivalent dismissal
 *   - `Tooltip` from `@react-native-community/tooltip` (third-party) or
 *     `accessibilityHint` for screen-reader-only tooltips
 *
 * Host adoption: React Native cannot do React's `asChild` slot pattern
 * cleanly because RN components are not generic DOM nodes. The most
 * idiomatic alternative is a `renderTrigger` render-prop that the
 * consumer wires onto their own `Pressable`. Decision deferred.
 *
 * `isSurfaceComponent` mirrors the gate used by the other emitters so the
 * factory can dispatch without knowing surface internals.
 *
 * Returns three files: the component `.tsx`, its `StyleSheet` sibling,
 * and the hook (optional — surfaces with no JS-side behavior can return
 * `hookFile: null`).
 */
import type { ComponentIR } from "../../ir.js";
import { isAnchoredPresenceKind } from "../../semantics.js";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface != null && isAnchoredPresenceKind(ir.surface.kind);
}

export interface ReactNativeSurfaceFiles {
  componentFile: string;
  stylesFile: string;
  hookFile: string | null;
}

export function generateReactNativeSurfaceFiles(
  _ir: ComponentIR,
): ReactNativeSurfaceFiles {
  throw new Error(
    "generateReactNativeSurfaceFiles: not implemented — React Native emitter is scaffold-only.",
  );
}
