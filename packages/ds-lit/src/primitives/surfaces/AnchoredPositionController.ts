import type { ReactiveController, ReactiveControllerHost } from "lit";

export type AnchoredPlacement = "top" | "bottom" | "left" | "right";

export type AnchoredCollisionStrategy =
  /** Prefer requested placement; flip to opposite axis on overflow; clamp on cross-axis. */
  | "flip-shift"
  /** Prefer requested placement; clamp on both axes but never flip. */
  | "shift"
  /** Use requested placement as-is, no flipping or clamping. */
  | "none";

export interface AnchoredPositionControllerOptions {
  /** The trigger / anchor element to position against. Getter form so the
   *  host can supply the latest node without re-instantiating the controller. */
  anchor: () => HTMLElement | null;
  /** The content element being positioned. */
  content: () => HTMLElement | null;
  /** Whether the surface is currently open. Position only computes when true. */
  open: () => boolean;
  /**
   * Preferred placement. May be overridden by collision detection
   * depending on `collision`. Defaults to "bottom".
   */
  placement?: () => AnchoredPlacement | "auto";
  /** How to react to viewport collisions. Defaults to "flip-shift". */
  collision?: () => AnchoredCollisionStrategy;
  /** Gap in pixels between anchor and content. Defaults to 8. */
  offset?: () => number;
  /**
   * Minimum gap to viewport edges when clamping horizontally / vertically
   * via "shift". Defaults to 8.
   */
  viewportPadding?: () => number;
  /**
   * Called after `state` is recomputed. The generated component uses this
   * to call `host.requestUpdate()` (Lit's ReactiveController protocol does
   * not auto-trigger a render for controller-internal mutable state, so the
   * host must be told explicitly). Optional — hosts that read `state` via
   * a getter inside `render()` and don't need eager updates may omit it.
   */
  onChange?: () => void;
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
 * ReactiveController mirroring React's `useAnchoredPosition` hook —
 * same options shape (as getters, matching this package's controller
 * idiom — see `AnchoredSurfaceControllerOptions`), same state shape,
 * same collision/flip/clamp computation (ported verbatim; framework-
 * neutral geometry).
 *
 * Wiring while open: ResizeObserver (feature-detected — jsdom and some
 * older environments don't ship it) on both anchor and content, plus
 * window scroll (capture phase, to catch nested scroll containers) and
 * resize. All cleaned up on close, on `hostDisconnected`, or when the
 * anchor/content nodes are missing.
 *
 * The host is responsible for calling `requestUpdate()` (or relying on
 * the `onChange` callback to do so) since controller-internal state
 * mutation does not itself trigger a Lit render.
 */
export class AnchoredPositionController implements ReactiveController {
  private _state: AnchoredPositionState = HIDDEN_STATE;
  private resizeObserver: ResizeObserver | null = null;
  private lastAnchor: HTMLElement | null = null;
  private lastContent: HTMLElement | null = null;
  private wasOpen = false;
  /**
   * True while `reconcile()` is running synchronously as part of the
   * host's own `hostUpdate()` lifecycle callback. A state change
   * discovered in that window is already about to be read by the
   * host's `updated()` in the SAME render pass, so calling
   * `onChange()` (which the generated host wires to
   * `requestUpdate()`) would ask Lit to schedule a second, redundant
   * update on top of the one already in flight — observable as Lit's
   * dev-mode "scheduled an update after an update completed"
   * warning, and in the worst case a self-sustaining reconcile loop
   * across sibling elements sharing context (e.g. the content
   * element's `registerContent()` call re-provides root context,
   * which the content's own `ContextConsumerController` observes and
   * reacts to). `onChange` is reserved for asynchronous state changes
   * — ResizeObserver / scroll / resize callbacks — which happen
   * strictly outside any Lit update pass and must self-initiate one.
   */
  private _inHostUpdate = false;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: AnchoredPositionControllerOptions,
  ) {
    host.addController(this);
  }

  get state(): AnchoredPositionState {
    return this._state;
  }

  private setState(next: AnchoredPositionState): void {
    const prev = this._state;
    // Avoid spurious updates when the computed values match.
    if (
      prev.ready === next.ready &&
      prev.placement === next.placement &&
      prev.top === next.top &&
      prev.left === next.left
    ) {
      return;
    }
    this._state = next;
    if (!this._inHostUpdate) {
      this.options.onChange?.();
    }
  }

  private compute(): void {
    const open = this.options.open();
    const anchor = this.options.anchor();
    const content = this.options.content();
    // Asynchronous callers (ResizeObserver/scroll/resize) can fire
    // after the node has disconnected — treat a detached node as
    // absent rather than measuring stale geometry.
    if (!open || !anchor || !anchor.isConnected || !content || !content.isConnected) {
      return;
    }
    const next = computePosition({
      anchor,
      content,
      placement: this.options.placement?.() ?? "auto",
      collision: this.options.collision?.() ?? "flip-shift",
      offset: this.options.offset?.() ?? 8,
      viewportPadding: this.options.viewportPadding?.() ?? 8,
    });
    this.setState(next);
  }

  private onScroll = (): void => this.compute();
  private onResize = (): void => this.compute();

  private teardown(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    // Guard against `window` being torn down already — this can fire
    // from a late-arriving `hostUpdate()`/`hostDisconnected()` call
    // after a test environment (or, in principle, an SSR/non-DOM
    // host) has already removed the global.
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.onScroll, true);
      window.removeEventListener("resize", this.onResize);
    }
    this.lastAnchor = null;
    this.lastContent = null;
    this.wasOpen = false;
  }

  private setup(anchor: HTMLElement, content: HTMLElement): void {
    this.compute();

    // Feature-detect ResizeObserver. jsdom and a handful of older
    // environments don't ship it; in those cases we fall back to just
    // window resize + scroll, which is enough to keep the surface
    // anchored if the trigger position changes via layout.
    const RO: typeof ResizeObserver | undefined =
      typeof ResizeObserver !== "undefined" ? ResizeObserver : undefined;
    this.resizeObserver = RO ? new RO(() => this.compute()) : null;
    this.resizeObserver?.observe(content);
    this.resizeObserver?.observe(anchor);

    // Listen with capture so we catch nested scrollables, not just the
    // window. Anchor + content can both move when an intermediate scroll
    // container scrolls.
    window.addEventListener("scroll", this.onScroll, true);
    window.addEventListener("resize", this.onResize);
  }

  /**
   * Re-evaluate wiring. Call whenever `open`/`anchor`/`content` may have
   * changed (e.g. from the host's `updated()`). Idempotent — a no-op call
   * with unchanged inputs does not tear down and re-install listeners.
   */
  reconcile(): void {
    const open = this.options.open();
    const anchor = this.options.anchor();
    const content = this.options.content();

    // A disconnected content or anchor node (e.g. the host was
    // removed from the document but Lit's already-queued update
    // still runs — Lit does not cancel a scheduled update on
    // disconnect) must be treated as absent. Without this check, a
    // straggling post-disconnect `hostUpdate()` sees a non-null-but-
    // detached node, believes the surface is still open, and
    // recomputes against `getBoundingClientRect()`/`window` on a
    // node that may outlive the environment that created it (in
    // tests: a jsdom instance torn down between test files).
    const anchorLive = anchor && anchor.isConnected ? anchor : null;
    const contentLive = content && content.isConnected ? content : null;

    if (!open || !anchorLive || !contentLive) {
      if (this.wasOpen) {
        this.teardown();
        this.setState(HIDDEN_STATE);
      }
      return;
    }

    if (
      open === this.wasOpen &&
      anchorLive === this.lastAnchor &&
      contentLive === this.lastContent
    ) {
      return;
    }

    this.teardown();
    this.lastAnchor = anchorLive;
    this.lastContent = contentLive;
    this.wasOpen = true;
    this.setup(anchorLive, contentLive);
  }

  hostConnected(): void {
    this.reconcile();
  }

  hostUpdate(): void {
    this._inHostUpdate = true;
    try {
      this.reconcile();
    } finally {
      this._inHostUpdate = false;
    }
  }

  hostDisconnected(): void {
    this.teardown();
    this.setState(HIDDEN_STATE);
  }
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
