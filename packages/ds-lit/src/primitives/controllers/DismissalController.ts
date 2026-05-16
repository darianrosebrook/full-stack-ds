import type { ReactiveController, ReactiveControllerHost } from 'lit';

export interface DismissalOptions {
  /** Whether the dismissable surface is currently open. */
  open: () => boolean;
  /** Called when a dismissal trigger fires. */
  onDismiss: () => void;
  /** Close on Escape key (default: true). */
  closeOnEscape?: () => boolean | undefined;
  /** Close on click/tap outside the panel (default: false; opt-in per call). */
  closeOnOutsideClick?: () => boolean | undefined;
  /** Element that bounds "inside"; outside clicks here do not dismiss. */
  getPanelEl?: () => HTMLElement | null;
  /** Optional anchor element; clicks here also do not dismiss. */
  getAnchorEl?: () => HTMLElement | null;
}

/**
 * Generic dismissal ReactiveController — Lit equivalent of React's
 * useDismissal. Wires document-level Escape and outside-click listeners
 * only while `open()` returns true, mirroring the Vue watchEffect pattern:
 * listeners attach when the component opens, detach when it closes, and are
 * always removed on disconnect.
 *
 * Gating uses `hostUpdate()` (called before every render) so the attach/detach
 * cycle stays synchronised with property changes that flip `open`. The `_held`
 * flag prevents redundant add/remove calls on updates where `open` is unchanged.
 *
 * Decoupled from controlled-state: pass `open` as a getter and supply
 * `onDismiss` to define what happens (typically toggle the host's open
 * property to false).
 */
export class DismissalController implements ReactiveController {
  private host: ReactiveControllerHost;
  private opts: DismissalOptions;
  /** True when listeners are currently attached. */
  private _held = false;

  constructor(host: ReactiveControllerHost, opts: DismissalOptions) {
    this.host = host;
    this.opts = opts;
    host.addController(this);
  }

  private isEscapeEnabled(): boolean {
    return this.opts.closeOnEscape ? this.opts.closeOnEscape() !== false : true;
  }

  private isOutsideClickEnabled(): boolean {
    return this.opts.closeOnOutsideClick ? this.opts.closeOnOutsideClick() === true : false;
  }

  private _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.opts.open() && this.isEscapeEnabled()) {
      this.opts.onDismiss();
    }
  };

  private _onPointerDown = (e: PointerEvent) => {
    if (!this.opts.open() || !this.isOutsideClickEnabled()) return;
    const target = e.target as Node;
    const panelEl = this.opts.getPanelEl?.();
    const anchorEl = this.opts.getAnchorEl?.();
    if (panelEl && panelEl.contains(target)) return;
    if (anchorEl && anchorEl.contains(target)) return;
    this.opts.onDismiss();
  };

  private _attach(): void {
    document.addEventListener('keydown', this._onKeydown);
    document.addEventListener('pointerdown', this._onPointerDown);
    this._held = true;
  }

  private _detach(): void {
    document.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('pointerdown', this._onPointerDown);
    this._held = false;
  }

  /** Called before every host render — gate listeners on open(). */
  hostUpdate(): void {
    const isOpen = this.opts.open();
    if (isOpen && !this._held) this._attach();
    else if (!isOpen && this._held) this._detach();
  }

  hostConnected(): void {
    // Sync once on connect in case the host is already open when connected.
    if (this.opts.open()) this._attach();
  }

  hostDisconnected(): void {
    this._detach();
  }
}
