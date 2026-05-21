/**
 * Jetpack Compose Anchored Presence Surface emitter — scaffold.
 *
 * Compose's native substrate:
 *   - `TooltipBox` + `PlainTooltip` / `RichTooltip` (Material 3)  → Tooltip surface
 *   - `Popup` with a custom `PopupPositionProvider`              → Popover surface
 *   - `Dialog`                                                   → Modal surface (separate family)
 *   - `BackHandler`                                              → system-back dismissal
 *
 * Host adoption: Compose doesn't have a slot model in the
 * React `asChild` / Vue slot-props / Svelte split-binding sense. Instead,
 * the consumer composes their anchor inside the surface's content lambda
 * and the surface uses `Modifier.onGloballyPositioned { coords -> ... }`
 * to capture the anchor's layout coordinates. The IR's host-capability
 * facts feed this directly; no Compose-specific re-interpretation in the
 * emitter beyond modifier composition.
 *
 * `isSurfaceComponent` mirrors the gate used by the other emitters so the
 * factory can dispatch without knowing surface internals.
 *
 * Returns the component file plus an optional state file. The state
 * file holds anchor coordinates + open/closed state when the surface
 * is more complex than a single `MutableState<Boolean>`.
 */
import type { ComponentIR } from "../../ir.js";
import { isAnchoredPresenceKind } from "../../semantics.js";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface != null && isAnchoredPresenceKind(ir.surface.kind);
}

export interface JetpackComposeSurfaceFiles {
  componentFile: string;
  stateFile: string | null;
}

export function generateJetpackComposeSurfaceFiles(
  _ir: ComponentIR,
): JetpackComposeSurfaceFiles {
  throw new Error(
    "generateJetpackComposeSurfaceFiles: not implemented — Jetpack Compose emitter is scaffold-only.",
  );
}
