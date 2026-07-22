import type { ReactiveController, ReactiveControllerHost } from "lit";

/**
 * Internal substrate for the presence-surface family.
 *
 * NOT part of the public package API. Used only by generated surface
 * components (Tooltip, Popover, Menu, ...). Consumers interact via
 * the compound custom-element API:
 *
 *   <fsds-tooltip>
 *     <fsds-tooltip-trigger>
 *       <button>Save</button>     <!-- consumer-rendered host -->
 *     </fsds-tooltip-trigger>
 *     <fsds-tooltip-content>Save the document</fsds-tooltip-content>
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
 * Abstract policy for a presence surface. Concrete subclasses install
 * DOM listeners and manage anchor/content node references. Owns no
 * state — open/close lives on the host element via its own
 * ControllableStateController.
 */
export abstract class SurfaceController implements ReactiveController {
  protected anchor: HTMLElement | null = null;
  protected content: HTMLElement | null = null;
  protected mounted = false;

  /**
   * Public read of the currently registered anchor node. Anchored
   * positioning (content-part fixed-position math) needs this from
   * outside the controller's own install/uninstall wiring — the
   * anchor and content elements are separate custom elements in Lit's
   * compound-component realization, so the content element learns the
   * anchor node via the surface context rather than DOM adjacency.
   */
  getAnchor(): HTMLElement | null {
    return this.anchor;
  }

  constructor(
    protected readonly host: ReactiveControllerHost,
    protected readonly options: {
      isOpen: () => boolean;
      setOpen: (next: boolean) => void;
    },
  ) {
    host.addController(this);
  }

  setAnchor(node: HTMLElement | null): void {
    this.anchor = node;
    if (this.mounted) this.remount();
  }

  setContent(node: HTMLElement | null): void {
    this.content = node;
    if (this.mounted) this.remount();
  }

  hostConnected(): void {
    this.mounted = true;
    this.remount();
  }

  hostDisconnected(): void {
    this.mounted = false;
    this.uninstall();
  }

  /**
   * Re-runs uninstall then install. Public so hosts can force a
   * reconfigure when reactive options (e.g. closeOnEscape) change
   * value — the underlying option getters are read fresh on each
   * install, so this is the canonical way for the host to propagate
   * a prop change into listener wiring.
   */
  public requestRemount(): void {
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
