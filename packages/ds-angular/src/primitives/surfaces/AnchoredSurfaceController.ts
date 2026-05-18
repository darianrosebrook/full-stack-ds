import {
  SurfaceController,
  type SurfaceDismissalMode,
  type SurfaceOpenTrigger,
} from "./SurfaceController.js";

export interface AnchoredSurfaceControllerOptions {
  isOpen: () => boolean;
  setOpen: (next: boolean) => void;
  openTriggers: readonly SurfaceOpenTrigger[];
  /** Dismissal modes. Getter form so the host can react to prop
   *  changes (e.g. toggling closeOnEscape) by calling
   *  requestRemount(). */
  dismissal: () => readonly SurfaceDismissalMode[];
  disabled?: () => boolean;
}

/**
 * Concrete controller for anchored surfaces. Wires `openTriggers`
 * and `dismissal` from contract IR onto anchor/content DOM nodes.
 * Pure listener wiring; no positioning.
 *
 * Open-trigger handlers defer their action via `queueMicrotask` so
 * the consumer's own template-bound handler (which receives the same
 * native event object before our listener via Angular's standard
 * event flow ordering — Angular template bindings + addEventListener
 * fire in registration order on a single node) can call
 * `event.preventDefault()` and be observed by us. Dismissal handlers
 * fire synchronously.
 */
export class AnchoredSurfaceController extends SurfaceController {
  private listenerCleanups: Array<() => void> = [];

  constructor(private readonly anchoredOptions: AnchoredSurfaceControllerOptions) {
    super({
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

  private installOpenTriggers(): void {
    const anchor = this.anchor;
    if (!anchor) return;
    const triggers = this.anchoredOptions.openTriggers;
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

    if (dismissal.includes("blur") && anchorAtInstall) {
      const onBlur = (e: FocusEvent) => {
        const next = e.relatedTarget as Node | null;
        const content = this.content;
        if (next && content && content.contains(next)) return;
        close(e);
      };
      anchorAtInstall.addEventListener("blur", onBlur);
      this.listenerCleanups.push(() =>
        anchorAtInstall.removeEventListener("blur", onBlur),
      );
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
        const target = e.target as Node | null;
        if (!target) return;
        const anchor = this.anchor;
        const content = this.content;
        if (anchor && anchor.contains(target)) return;
        if (content && content.contains(target)) return;
        close(e);
      };
      document.addEventListener("mousedown", onPointer);
      this.listenerCleanups.push(() =>
        document.removeEventListener("mousedown", onPointer),
      );
    }
  }
}
