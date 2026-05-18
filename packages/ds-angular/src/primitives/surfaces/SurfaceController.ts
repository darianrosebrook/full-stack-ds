/**
 * Internal substrate for the presence-surface family.
 *
 * NOT part of the public package API. Used only by generated surface
 * components (Tooltip, Popover, Menu, ...). Consumers interact via
 * the compound component API:
 *
 *   <fsds-tooltip>
 *     <a fsdsTooltipTrigger href="#help">Save</a>
 *     <fsds-tooltip-content>Help</fsds-tooltip-content>
 *   </fsds-tooltip>
 *
 * If you are reading this from outside the package: the substrate
 * shape is intentionally unstable. It will be promoted to public API
 * only after Popover and Menu prove it generalises.
 */
export type SurfaceOpenTrigger = "hover" | "focus" | "click";

export type SurfaceDismissalMode =
  | "escape"
  | "outside-click"
  | "blur"
  | "pointer-leave"
  | "close-button"
  | "timeout";

export type SurfaceAnchorRelation =
  | "describedby"
  | "controls-expanded"
  | "labelledby"
  | "activedescendant"
  | "none";

/**
 * Abstract policy for a presence surface. Plain TS class, NOT an
 * Angular @Injectable — instantiated per-Tooltip-root and wired into
 * the component's lifecycle via `DestroyRef.onDestroy`.
 */
export abstract class SurfaceController {
  protected anchor: HTMLElement | null = null;
  protected content: HTMLElement | null = null;
  protected mounted = false;

  constructor(
    protected readonly options: {
      isOpen: () => boolean;
      setOpen: (next: boolean) => void;
    },
  ) {}

  setAnchor(node: HTMLElement | null): void {
    this.anchor = node;
    if (this.mounted) this.remount();
  }

  setContent(node: HTMLElement | null): void {
    this.content = node;
    if (this.mounted) this.remount();
  }

  /**
   * Called by the host once it's ready to receive listener wiring.
   * Idempotent — calling twice does the right thing.
   */
  start(): void {
    this.mounted = true;
    this.remount();
  }

  /**
   * Called by the host (typically via DestroyRef.onDestroy) when the
   * surface should release all listeners.
   */
  stop(): void {
    this.mounted = false;
    this.uninstall();
  }

  /**
   * Force a re-install. Hosts call this when reactive options (e.g.
   * closeOnEscape) change value; the option getters are read fresh
   * on each install.
   */
  requestRemount(): void {
    if (!this.mounted) return;
    this.remount();
  }

  protected remount(): void {
    this.uninstall();
    this.install();
  }

  protected abstract install(): void;
  protected abstract uninstall(): void;
}
