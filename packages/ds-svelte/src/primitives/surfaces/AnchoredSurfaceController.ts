import {
  SurfaceController,
  type SurfaceDismissalMode,
  type SurfaceOpenTrigger,
} from "./SurfaceController";

export interface AnchoredSurfaceControllerOptions {
  isOpen: () => boolean;
  setOpen: (next: boolean) => void;
  openTriggers: readonly SurfaceOpenTrigger[];
  dismissal: readonly SurfaceDismissalMode[];
  disabled?: () => boolean;
  /**
   * When true, the controller does NOT install anchor-side DOM
   * listeners (pointerenter/leave, focus/blur, click). The host
   * (snippet-based adoption path) composes those as Svelte event
   * handlers on the adopted element and dispatches into setOpen
   * itself. The controller still installs document-level dismissal
   * (Escape) and content-side pointer-leave grace listeners.
   * Default false (default-host behaviour: TooltipTrigger renders
   * its own <button>).
   */
  handlerMode?: boolean;
}

/**
 * Concrete controller for anchored surfaces. Same shape as the
 * React/Vue substrates: wires `openTriggers` and `dismissal` from
 * contract IR onto the anchor/content DOM nodes. Pure listener
 * wiring; no positioning.
 */
export class AnchoredSurfaceController extends SurfaceController {
  private listenerCleanups: Array<() => void> = [];

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

    if (!handlerMode && dismissal.includes("blur") && anchor) {
      const onBlur = (e: FocusEvent) => {
        const next = e.relatedTarget as Node | null;
        if (next && content && content.contains(next)) return;
        close();
      };
      anchor.addEventListener("blur", onBlur);
      this.listenerCleanups.push(() =>
        anchor.removeEventListener("blur", onBlur),
      );
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
        const target = e.target as Node | null;
        if (!target) return;
        if (anchor && anchor.contains(target)) return;
        if (content && content.contains(target)) return;
        close();
      };
      document.addEventListener("mousedown", onPointer);
      this.listenerCleanups.push(() =>
        document.removeEventListener("mousedown", onPointer),
      );
    }
  }
}
