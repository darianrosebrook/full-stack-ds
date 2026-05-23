import {
  SurfaceController,
  type SurfaceDismissalMode,
  type SurfaceOpenTrigger,
} from "./SurfaceController";

export interface AnchoredSurfaceControllerOptions {
  isOpen: () => boolean;
  setOpen: (next: boolean) => void;
  /** Anchor-element interactions that open the surface. */
  openTriggers: readonly SurfaceOpenTrigger[];
  /** Dismissal modes that close the surface. */
  dismissal: readonly SurfaceDismissalMode[];
  /** When true, opening is suppressed (the trigger renders but the
   *  surface stays closed regardless of interaction). */
  disabled?: () => boolean;
  /**
   * When true, the controller does NOT install anchor-side DOM
   * listeners (pointerenter/leave, focus/blur, click). The host
   * component (asChild path) composes those as React handlers and
   * dispatches into `setOpen` itself. The controller still installs
   * document-level dismissal (Escape) and content-level pointer-leave
   * grace listeners. The anchor node is still tracked for ARIA
   * queries and content↔anchor grace-path checks.
   *
   * Default false (F-2A default-host behavior).
   */
  handlerMode?: boolean;
}

/**
 * Concrete controller for anchored surfaces (Tooltip, Popover, Menu,
 * Select). Wires `openTriggers` and `dismissal` from contract IR onto
 * the anchor/content DOM nodes. Pure listener wiring; no positioning.
 *
 * Listeners live on `document` for global events (Escape) and on the
 * anchor/content nodes for local events (pointer-enter/leave, focus).
 * Re-mounted whenever `openTriggers` or `dismissal` change.
 */
export class AnchoredSurfaceController extends SurfaceController {
  private listenerCleanups: Array<() => void> = [];
  /**
   * Timestamp of the last pointerdown that landed inside the surface
   * (anchor ∪ content). Read by the blur-dismissal deferred branch:
   * `relatedTarget === null` focusouts that follow an inside
   * pointerdown by less than POINTER_GRACE_MS are treated as clicks on
   * non-focusable elements (keep open), not tab-outs (close).
   *
   * Using a timestamp rather than a tick-flag because microtask FIFO
   * ordering doesn't reliably let a flag set by pointerdown survive
   * past the deferred focusout check.
   */
  protected lastInsidePointerdownAt = 0;
  protected static readonly POINTER_GRACE_MS = 50;

  constructor(private readonly anchoredOptions: AnchoredSurfaceControllerOptions) {
    super({
      isOpen: anchoredOptions.isOpen,
      setOpen: anchoredOptions.setOpen,
    });
  }

  mount(): void {
    this.unmount();
    if (!this.anchoredOptions.handlerMode) {
      this.installOpenTriggers();
    }
    this.installDismissal();
  }

  unmount(): void {
    for (const cleanup of this.listenerCleanups) cleanup();
    this.listenerCleanups = [];
  }

  private isDisabled(): boolean {
    return this.anchoredOptions.disabled?.() === true;
  }

  /**
   * Returns true when `node` is part of the registered surface
   * boundary (anchor ∪ content). Used by boundary-semantic dismissal
   * predicates: `blur` (focus leaving the surface), `pointer-leave`
   * (grace path), and `outside-click`. The surface boundary is what
   * the substrate considers "inside the surface" — focus or pointer
   * movement that stays within it must NOT trigger dismissal.
   */
  private isInsideSurface(node: EventTarget | null): boolean {
    if (!(node instanceof Node)) return false;
    const anchor = this.anchor;
    const content = this.content;
    return Boolean(
      (anchor && anchor.contains(node)) || (content && content.contains(node)),
    );
  }

  private installOpenTriggers(): void {
    const anchor = this.anchor;
    if (!anchor) return;
    const triggers = this.anchoredOptions.openTriggers;
    const open = () => {
      if (this.isDisabled()) return;
      this.anchoredOptions.setOpen(true);
    };
    const toggle = () => {
      if (this.isDisabled()) return;
      this.anchoredOptions.setOpen(!this.anchoredOptions.isOpen());
    };

    if (triggers.includes("hover")) {
      anchor.addEventListener("pointerenter", open);
      this.listenerCleanups.push(() =>
        anchor.removeEventListener("pointerenter", open),
      );
    }
    if (triggers.includes("focus")) {
      anchor.addEventListener("focus", open);
      this.listenerCleanups.push(() =>
        anchor.removeEventListener("focus", open),
      );
    }
    if (triggers.includes("click")) {
      anchor.addEventListener("click", toggle);
      this.listenerCleanups.push(() =>
        anchor.removeEventListener("click", toggle),
      );
    }
  }

  private installDismissal(): void {
    const anchor = this.anchor;
    const content = this.content;
    const dismissal = this.anchoredOptions.dismissal;
    const close = () => this.anchoredOptions.setOpen(false);
    const handlerMode = this.anchoredOptions.handlerMode === true;

    if (dismissal.includes("escape")) {
      const onKey = (e: KeyboardEvent) => {
        if (!this.anchoredOptions.isOpen()) return;
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      };
      document.addEventListener("keydown", onKey);
      this.listenerCleanups.push(() =>
        document.removeEventListener("keydown", onKey),
      );
    }

    // `blur` is boundary semantics: dismiss when focus leaves the
    // anchor ∪ content surface. We listen via `focusout` (which
    // bubbles, unlike `blur`) so a single listener on the content
    // host catches focus leaving any descendant. The substrate
    // installs on both anchor and content; in handler-mode the
    // anchor side is skipped because the asChild host owns the
    // consumer-facing React onBlur and would otherwise double-fire.
    // Content is always controlled (never adopted in F-2B), so the
    // content listener installs unconditionally. The boundary
    // predicate `isInsideSurface` is what makes this work for
    // interactive content (Popover) without regressing non-
    // interactive content (Tooltip): Tooltip content has no
    // focusable descendants, so the content listener never fires.
    if (dismissal.includes("blur")) {
      // Boundary semantics: close only when focus truly leaves the
      // surface. The fast path uses `relatedTarget` — if it's inside
      // the surface, do nothing. If it's outside, close.
      //
      // `relatedTarget === null` is ambiguous: it happens both on
      // tab-out (focus going to body, surface should close) AND on
      // click on a non-focusable element inside the surface (focus
      // also goes to body, but surface should stay open because the
      // pointer landed inside). The fallback path defers the close
      // decision by one microtask, then checks whether
      // `document.activeElement` is still inside the surface or — if
      // a click is in flight — whether the most recent pointerdown
      // target was inside. This makes the predicate purely about
      // boundary, with no timing-based heuristic.
      const onFocusOut = (e: FocusEvent) => {
        if (!this.anchoredOptions.isOpen()) return;
        if (e.relatedTarget !== null) {
          if (this.isInsideSurface(e.relatedTarget)) return;
          close();
          return;
        }
        // Defer to next microtask so document.activeElement settles.
        // Then disambiguate: if focus moved to a node inside the
        // surface, do nothing. If focus fell back to body but a
        // pointerdown landed inside the surface within the grace
        // window, treat as click on non-focusable inside (keep open).
        // Otherwise, true tab-out — close.
        queueMicrotask(() => {
          if (!this.anchoredOptions.isOpen()) return;
          const active = document.activeElement;
          if (this.isInsideSurface(active)) return;
          if (
            Date.now() - this.lastInsidePointerdownAt <
            AnchoredSurfaceController.POINTER_GRACE_MS
          ) {
            return;
          }
          close();
        });
      };
      if (anchor && !handlerMode) {
        anchor.addEventListener("focusout", onFocusOut);
        this.listenerCleanups.push(() =>
          anchor.removeEventListener("focusout", onFocusOut),
        );
      }
      if (content) {
        content.addEventListener("focusout", onFocusOut);
        this.listenerCleanups.push(() =>
          content.removeEventListener("focusout", onFocusOut),
        );
      }
    }

    if (!handlerMode && dismissal.includes("pointer-leave") && anchor) {
      const onAnchorLeave = (e: PointerEvent) => {
        const next = e.relatedTarget as Node | null;
        if (next && content && content.contains(next)) return;
        close();
      };
      anchor.addEventListener("pointerleave", onAnchorLeave);
      this.listenerCleanups.push(() =>
        anchor.removeEventListener("pointerleave", onAnchorLeave),
      );
    }

    // Content-side pointer-leave grace listener installs in both modes
    // because the content is always owned by Tooltip.Content (never
    // adopted from the consumer in F-2B).
    if (dismissal.includes("pointer-leave") && content) {
      const onContentLeave = (e: PointerEvent) => {
        const next = e.relatedTarget as Node | null;
        if (next && anchor && anchor.contains(next)) return;
        close();
      };
      content.addEventListener("pointerleave", onContentLeave);
      this.listenerCleanups.push(() =>
        content.removeEventListener("pointerleave", onContentLeave),
      );
    }

    if (dismissal.includes("outside-click") && (anchor || content)) {
      const onPointer = (e: MouseEvent) => {
        if (!this.anchoredOptions.isOpen()) return;
        if (this.isInsideSurface(e.target)) return;
        close();
      };
      document.addEventListener("mousedown", onPointer);
      this.listenerCleanups.push(() =>
        document.removeEventListener("mousedown", onPointer),
      );
    }

    // Track inside-pointerdown timestamp for the blur-dismissal
    // deferred branch (see onFocusOut above). Capture phase so the
    // controller sees the pointer regardless of stopPropagation.
    if (dismissal.includes("blur")) {
      const onPointerInside = (e: MouseEvent) => {
        if (this.isInsideSurface(e.target)) {
          this.lastInsidePointerdownAt = Date.now();
        }
      };
      document.addEventListener("mousedown", onPointerInside, true);
      this.listenerCleanups.push(() =>
        document.removeEventListener("mousedown", onPointerInside, true),
      );
    }
  }
}
