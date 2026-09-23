import type { ReactiveControllerHost } from 'lit';

export interface FocusTrapOptions {
  /** Returns true when the trap is active and should intercept Tab. */
  getActive: () => boolean;
  /** Returns the container element whose focusables are trapped. */
  getContainer: () => HTMLElement | null;
}

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
  'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * ReactiveController that implements keyboard focus trapping.
 * When active, Tab and Shift+Tab cycle through focusable elements
 * inside the container rather than leaving it.
 */
export class FocusTrapController {
  private opts: FocusTrapOptions;

  constructor(host: ReactiveControllerHost, opts: FocusTrapOptions) {
    this.opts = opts;
    host.addController(this);
  }

  private focusables(): HTMLElement[] {
    return Array.from(
      this.opts.getContainer()?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
    );
  }

  private _onKeydown = (e: KeyboardEvent) => {
    if (!this.opts.getActive() || e.key !== 'Tab') return;
    const els = this.focusables();
    if (els.length === 0) { e.preventDefault(); return; }
    const first = els[0];
    const last = els[els.length - 1];
    // Inside a shadow root document.activeElement is retargeted to the host,
    // so read focus from the container's own root.
    const root = this.opts.getContainer()?.getRootNode() as Document | ShadowRoot | undefined;
    const active = root?.activeElement ?? document.activeElement;
    if (e.shiftKey) {
      if (active === first) { e.preventDefault(); last.focus(); }
    } else {
      if (active === last) { e.preventDefault(); first.focus(); }
    }
  };

  hostConnected() { document.addEventListener('keydown', this._onKeydown); }
  hostDisconnected() { document.removeEventListener('keydown', this._onKeydown); }
}
