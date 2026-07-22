import { onScopeDispose, reactive, watch, type UnwrapNestedRefs } from "vue";

export type AnchoredPlacement = "top" | "bottom" | "left" | "right";

export type AnchoredCollisionStrategy =
  /** Prefer requested placement; flip to opposite axis on overflow; clamp on cross-axis. */
  | "flip-shift"
  /** Prefer requested placement; clamp on both axes but never flip. */
  | "shift"
  /** Use requested placement as-is, no flipping or clamping. */
  | "none";

export interface UseAnchoredPositionOptions {
  /** Getter for the trigger / anchor element to position against. */
  anchor: () => HTMLElement | null;
  /** Getter for the content element being positioned. */
  content: () => HTMLElement | null;
  /** Getter for whether the surface is currently open. Position only computes when true. */
  open: () => boolean;
  /**
   * Getter for the preferred placement. May be overridden by collision
   * detection depending on `collision`. Defaults to "bottom".
   */
  placement?: () => AnchoredPlacement | "auto";
  /** Getter for how to react to viewport collisions. Defaults to "flip-shift". */
  collision?: () => AnchoredCollisionStrategy;
  /** Getter for the gap in pixels between anchor and content. Defaults to 8. */
  offset?: () => number;
  /**
   * Getter for the minimum gap to viewport edges when clamping
   * horizontally / vertically via "shift". Defaults to 8.
   */
  viewportPadding?: () => number;
}

export interface AnchoredPositionState {
  /** Final placement after collision resolution. */
  placement: AnchoredPlacement;
  /** Computed `top` in CSS pixels (for `position: fixed`). */
  top: number;
  /** Computed `left` in CSS pixels (for `position: fixed`). */
  left: number;
  /**
   * `true` once the first measurement has run after open. Consumers use
   * this to avoid flashing the content at (0, 0) before placement is
   * known. Render hidden when `false`.
   */
  ready: boolean;
}

const HIDDEN_STATE: AnchoredPositionState = {
  placement: "bottom",
  top: 0,
  left: 0,
  ready: false,
};

/**
 * Compute anchored-surface position with flip + clamp collision handling.
 *
 * Designed to compose with `useAnchoredSurface`: pass getters for the
 * anchor and content nodes registered by the surface, and apply the
 * returned `{ top, left }` to the content node via `position: fixed`.
 *
 * Strategy for "flip-shift" (default):
 *   1. Place content along the requested side of the anchor (vertical
 *      for "top"/"bottom", horizontal for "left"/"right"; "auto"
 *      starts from "bottom").
 *   2. If the placed content overflows on the placement axis, flip to
 *      the opposite side and re-measure.
 *   3. Clamp on the cross axis so the content stays within the
 *      viewport (with `viewportPadding` from each edge).
 *
 * Recomputes on: open, anchor/content node identity changes, content
 * size (ResizeObserver), window resize, and window scroll (capture
 * phase — catches nested scroll containers). Cleans up listeners on
 * close or unmount.
 *
 * Returns `{ ready: false }` until the first measurement completes;
 * consumers should hide content (e.g. `visibility: hidden`) when not
 * ready to avoid a frame at (0, 0).
 */
export function useAnchoredPosition(
  options: UseAnchoredPositionOptions,
): UnwrapNestedRefs<AnchoredPositionState> {
  const {
    anchor,
    content,
    open,
    placement = () => "auto" as const,
    collision = () => "flip-shift" as const,
    offset = () => 8,
    viewportPadding = () => 8,
  } = options;

  const state = reactive<AnchoredPositionState>({ ...HIDDEN_STATE });

  function applyState(next: AnchoredPositionState): void {
    // Avoid spurious reactive triggers when the computed values match.
    if (
      state.ready &&
      state.placement === next.placement &&
      state.top === next.top &&
      state.left === next.left
    ) {
      return;
    }
    state.placement = next.placement;
    state.top = next.top;
    state.left = next.left;
    state.ready = next.ready;
  }

  function compute(): void {
    const anchorEl = anchor();
    const contentEl = content();
    if (!open() || !anchorEl || !contentEl) return;
    const next = computePosition({
      anchor: anchorEl,
      content: contentEl,
      placement: placement(),
      collision: collision(),
      offset: offset(),
      viewportPadding: viewportPadding(),
    });
    applyState(next);
  }

  let ro: ResizeObserver | null = null;
  let listening = false;

  function stopListening(): void {
    ro?.disconnect();
    ro = null;
    if (listening) {
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
      listening = false;
    }
  }

  function startListening(anchorEl: HTMLElement, contentEl: HTMLElement): void {
    compute();

    // Feature-detect ResizeObserver. jsdom and a handful of older
    // environments don't ship it; in those cases we fall back to just
    // window resize + scroll, which is enough to keep the surface
    // anchored if the trigger position changes via layout.
    const RO: typeof ResizeObserver | undefined =
      typeof ResizeObserver !== "undefined" ? ResizeObserver : undefined;
    ro = RO ? new RO(() => compute()) : null;
    ro?.observe(contentEl);
    ro?.observe(anchorEl);

    // Listen with capture so we catch nested scrollables, not just the
    // window. Anchor + content can both move when an intermediate scroll
    // container scrolls.
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    listening = true;
  }

  function sync(): void {
    const isOpen = open();
    const anchorEl = anchor();
    const contentEl = content();
    stopListening();
    if (!isOpen || !anchorEl || !contentEl) {
      applyState(HIDDEN_STATE);
      return;
    }
    startListening(anchorEl, contentEl);
  }

  watch(
    [open, anchor, content, placement, collision, offset, viewportPadding],
    () => sync(),
    { immediate: true },
  );

  // onScopeDispose fires both on component unmount (setup() runs
  // inside the component's own effect scope) and on a bare
  // effectScope().stop() (the shape composable unit tests use), so
  // listener teardown is covered in both host contexts.
  onScopeDispose(() => {
    stopListening();
  });

  return state;
}

interface ComputeArgs {
  anchor: HTMLElement;
  content: HTMLElement;
  placement: AnchoredPlacement | "auto";
  collision: AnchoredCollisionStrategy;
  offset: number;
  viewportPadding: number;
}

function computePosition(args: ComputeArgs): AnchoredPositionState {
  const { anchor, content, collision, offset, viewportPadding } = args;
  const anchorRect = anchor.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Normalize "auto" → "bottom" as the seed placement. The flip step
  // below handles the case where bottom doesn't fit.
  const seedPlacement: AnchoredPlacement =
    args.placement === "auto" ? "bottom" : args.placement;

  let placement = seedPlacement;
  let { top, left } = placeAlong(placement, anchorRect, contentRect, offset);

  // Flip phase. Only flip along the placement axis (top↔bottom or left↔right).
  if (collision === "flip-shift") {
    const overflows = measureOverflow(top, left, contentRect, viewportWidth, viewportHeight);
    if (placement === "bottom" && overflows.bottom > 0 && overflows.bottom > overflows.top) {
      placement = "top";
      ({ top, left } = placeAlong(placement, anchorRect, contentRect, offset));
    } else if (placement === "top" && overflows.top > 0 && overflows.top > overflows.bottom) {
      placement = "bottom";
      ({ top, left } = placeAlong(placement, anchorRect, contentRect, offset));
    } else if (placement === "right" && overflows.right > 0 && overflows.right > overflows.left) {
      placement = "left";
      ({ top, left } = placeAlong(placement, anchorRect, contentRect, offset));
    } else if (placement === "left" && overflows.left > 0 && overflows.left > overflows.right) {
      placement = "right";
      ({ top, left } = placeAlong(placement, anchorRect, contentRect, offset));
    }
  }

  // Shift / clamp phase. Applies for both "flip-shift" and "shift".
  if (collision !== "none") {
    const maxLeft = viewportWidth - contentRect.width - viewportPadding;
    const maxTop = viewportHeight - contentRect.height - viewportPadding;
    if (left > maxLeft) left = maxLeft;
    if (left < viewportPadding) left = viewportPadding;
    if (top > maxTop) top = maxTop;
    if (top < viewportPadding) top = viewportPadding;
  }

  return { placement, top, left, ready: true };
}

interface Overflow {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function measureOverflow(
  top: number,
  left: number,
  content: DOMRect,
  viewportWidth: number,
  viewportHeight: number,
): Overflow {
  return {
    top: Math.max(0, -top),
    bottom: Math.max(0, top + content.height - viewportHeight),
    left: Math.max(0, -left),
    right: Math.max(0, left + content.width - viewportWidth),
  };
}

interface PlacedRect {
  top: number;
  left: number;
}

function placeAlong(
  placement: AnchoredPlacement,
  anchor: DOMRect,
  content: DOMRect,
  offset: number,
): PlacedRect {
  switch (placement) {
    case "top":
      return {
        top: anchor.top - content.height - offset,
        left: anchor.left + (anchor.width - content.width) / 2,
      };
    case "bottom":
      return {
        top: anchor.bottom + offset,
        left: anchor.left + (anchor.width - content.width) / 2,
      };
    case "left":
      return {
        top: anchor.top + (anchor.height - content.height) / 2,
        left: anchor.left - content.width - offset,
      };
    case "right":
      return {
        top: anchor.top + (anchor.height - content.height) / 2,
        left: anchor.right + offset,
      };
  }
}
