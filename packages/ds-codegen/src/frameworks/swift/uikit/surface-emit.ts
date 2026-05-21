/**
 * UIKit Anchored Presence Surface emitter — scaffold.
 *
 * Native UIKit primitives:
 *   - `UIPopoverPresentationController`  → Popover surface
 *   - `UITooltipInteraction` (iOS 15+)   → Tooltip surface
 *   - `UIContextMenuInteraction`         → context-menu adjacent
 *
 * Host adoption: UIKit's analogue is a weak `anchorView: UIView` plus
 * `sourceRect`/`sourceItem` on the presentation controller. The trigger
 * "adopts" a consumer-provided view via property assignment rather than
 * slot composition.
 *
 * `isSurfaceComponent` mirrors the gate used by the other emitters so the
 * factory can dispatch without knowing surface internals.
 */
import type { ComponentIR } from "../../../ir.js";
import { isAnchoredPresenceKind } from "../../../semantics.js";

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface != null && isAnchoredPresenceKind(ir.surface.kind);
}

export interface UIKitSurfaceFiles {
  componentFile: string;
  behaviorFile: string | null;
}

export function generateUIKitSurfaceFiles(_ir: ComponentIR): UIKitSurfaceFiles {
  throw new Error(
    "generateUIKitSurfaceFiles: not implemented — Swift emitter is scaffold-only.",
  );
}
