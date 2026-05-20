import type { ReactiveControllerHost } from "lit";
import {
  SurfaceController,
  type SurfaceDismissalMode,
  type SurfaceOpenTrigger,
} from "./SurfaceController";

export interface AnchoredSurfaceControllerOptions {
  isOpen: () => boolean;
  setOpen: (next: boolean) => void;
  openTriggers: readonly SurfaceOpenTrigger[];
  /** Dismissal modes. Getter form so the host can react to prop
   *  changes (e.g. toggling closeOnEscape) by triggering a re-install
   *  via setAnchor()/setContent(). */
  dismissal: () => readonly SurfaceDismissalMode[];
  disabled?: () => boolean;
}

/**
 * Concrete controller for anchored surfaces (Tooltip, Popover, Menu,
 * Select). Matches the React/Vue/Svelte substrates: wires
 * `openTriggers` and `dismissal` from contract IR onto the
 * anchor/content DOM nodes. Pure listener wiring; no positioning.
 *
 * Lit-specific design choice: the anchor element is owned by the
 * consumer (slotted into `TooltipTrigger`). Once `TooltipTrigger`
 * captures the assigned element via `slot.assignedElements()`, it
 * passes it to `setAnchor()` and the controller installs all
 * required DOM listeners on it directly. There is no separate
 * "handlerMode" because the controller always installs listeners
 * itself — consumer event handlers compose naturally via native
 * `event.defaultPrevented` because both listeners attach to the
 * same DOM node and fire during the standard browser event flow.
 */
export class AnchoredSurfaceController extends SurfaceController {
  private listenerCleanups: Array<() => void> = [];

  constructor(
    host: ReactiveControllerHost,
    private readonly anchoredOptions: AnchoredSurfaceControllerOptions,
  ) {
    super(host, {
      isOpen: anchoredOptions.isOpen,
      setOpen: anchoredOptions.setOpen,
    });
  }

  protected install(): void {
    this.installOpenTriggers();
    this.installDismissal();
  }

  protected uninstall(): void {
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
   * (grace path), and `outside-click`. Focus or pointer movement that
   * stays within this boundary must NOT trigger dismissal.
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
    // Defer the open via queueMicrotask so the consumer's own event
    // listener — which may register AFTER ours and run later in the
    // same synchronous event flow — has a chance to call
    // event.preventDefault() before we observe it. After the
    // microtask, defaultPrevented reflects the final state of the
    // dispatched event. Without this we'd race the consumer's
    // listener and possibly act before preventDefault was called.
    const open = (e: Event) => {
      queueMicrotask(() => {
        if (this.isDisabled()) return;
        if (e.defaultPrevented) return;
        this.anchoredOptions.setOpen(true);
      });
    };
    const toggle = (e: Event) => {
      queueMicrotask(() => {
        if (this.isDisabled()) return;
        if (e.defaultPrevented) return;
        this.anchoredOptions.setOpen(!this.anchoredOptions.isOpen());
      });
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
    const dismissal = this.anchoredOptions.dismissal();
    // Read `this.anchor` / `this.content` only at install time for
    // attach-target selection; the handler closures read them again
    // at fire time via `this.anchor` / `this.content` so they see
    // the latest values without re-installing.
    const anchorAtInstall = this.anchor;
    const contentAtInstall = this.content;
    const close = (e?: Event) => {
      if (e?.defaultPrevented) return;
      this.anchoredOptions.setOpen(false);
    };

    if (dismissal.includes("escape")) {
      const onKey = (e: KeyboardEvent) => {
        if (!this.anchoredOptions.isOpen()) return;
        if (e.key === "Escape") {
          e.stopPropagation();
          close(e);
        }
      };
      document.addEventListener("keydown", onKey);
      this.listenerCleanups.push(() =>
        document.removeEventListener("keydown", onKey),
      );
    }

    // `blur` is boundary semantics: dismiss when focus leaves the
    // anchor ∪ content surface. We listen via `focusout` (which
    // bubbles, unlike `blur`) so a single listener on each host
    // catches focus leaving any descendant. Lit's substrate has no
    // handlerMode — the anchor element is always owned and registered
    // by TooltipTrigger/PopoverTrigger via slot capture, so we
    // install on both anchor and content unconditionally. The
    // boundary predicate `isInsideSurface` is what makes this work
    // for interactive content (Popover) without regressing non-
    // interactive content (Tooltip): Tooltip content has no
    // focusable descendants, so its focusout listener never fires.
    if (dismissal.includes("blur")) {
      const onFocusOut = (e: FocusEvent) => {
        if (!this.anchoredOptions.isOpen()) return;
        if (this.isInsideSurface(e.relatedTarget)) return;
        close(e);
      };
      if (anchorAtInstall) {
        anchorAtInstall.addEventListener("focusout", onFocusOut);
        this.listenerCleanups.push(() =>
          anchorAtInstall.removeEventListener("focusout", onFocusOut),
        );
      }
      if (contentAtInstall) {
        contentAtInstall.addEventListener("focusout", onFocusOut);
        this.listenerCleanups.push(() =>
          contentAtInstall.removeEventListener("focusout", onFocusOut),
        );
      }
    }

    if (dismissal.includes("pointer-leave") && anchorAtInstall) {
      const onAnchorLeave = (e: PointerEvent) => {
        const next = e.relatedTarget as Node | null;
        const content = this.content;
        if (next && content && content.contains(next)) return;
        close(e);
      };
      anchorAtInstall.addEventListener("pointerleave", onAnchorLeave);
      this.listenerCleanups.push(() =>
        anchorAtInstall.removeEventListener("pointerleave", onAnchorLeave),
      );
    }

    if (dismissal.includes("pointer-leave") && contentAtInstall) {
      const onContentLeave = (e: PointerEvent) => {
        const next = e.relatedTarget as Node | null;
        const anchor = this.anchor;
        if (next && anchor && anchor.contains(next)) return;
        close(e);
      };
      contentAtInstall.addEventListener("pointerleave", onContentLeave);
      this.listenerCleanups.push(() =>
        contentAtInstall.removeEventListener("pointerleave", onContentLeave),
      );
    }

    if (dismissal.includes("outside-click") && (anchorAtInstall || contentAtInstall)) {
      const onPointer = (e: MouseEvent) => {
        if (!this.anchoredOptions.isOpen()) return;
        if (this.isInsideSurface(e.target)) return;
        close(e);
      };
      document.addEventListener("mousedown", onPointer);
      this.listenerCleanups.push(() =>
        document.removeEventListener("mousedown", onPointer),
      );
    }
  }
}
