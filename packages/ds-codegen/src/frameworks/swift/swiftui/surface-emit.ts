/**
 * SwiftUI Anchored Presence Surface emitter — scaffold.
 *
 * Parity target: the React/Vue/Svelte/Lit surface emitters (Tooltip,
 * Popover, ...). SwiftUI's native primitives map roughly as:
 *   - `.popover(isPresented:)`              → Popover surface
 *   - `.help("...")`                        → Tooltip on macOS
 *   - `.accessibilityHint`                  → Tooltip on iOS (no native)
 *   - `.overlay { ... }` + custom anchor   → fallback for either
 *
 * Host adoption (React `asChild`, Vue slot-props, Svelte split binding,
 * Lit slot-assignment) translates to SwiftUI's `@ViewBuilder` closure +
 * `PreferenceKey` for anchor geometry. Decision deferred.
 *
 * `isSurfaceComponent` mirrors the gate used by the other emitters so the
 * factory can dispatch without knowing surface internals.
 */
import type { ComponentIR } from "../../../ir.js";
import { isAnchoredPresenceKind } from "../../../semantics.js";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface != null && isAnchoredPresenceKind(ir.surface.kind);
}

export interface SwiftUISurfaceFiles {
  componentFile: string;
  behaviorFile: string | null;
}

export function generateSwiftUISurfaceFiles(
  _ir: ComponentIR,
): SwiftUISurfaceFiles {
  throw new Error(
    "generateSwiftUISurfaceFiles: not implemented — Swift emitter is scaffold-only.",
  );
}
