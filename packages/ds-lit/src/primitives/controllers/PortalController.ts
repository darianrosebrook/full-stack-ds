import type { ReactiveControllerHost } from 'lit';

export interface PortalControllerOptions {
  /** When false the controller is a no-op. */
  enabled: boolean;
  /** Optional getter for the target element or selector string. */
  getTarget?: () => Element | string | undefined;
}

/**
 * ReactiveController that resolves a portal target element on connect.
 *
 * Lit components that need to render into a portal (e.g. a modal into
 * `document.body`) use this controller to track the resolved target.
 * The component is responsible for moving its content into `target` via
 * a portal directive or manual DOM manipulation.
 */
export class PortalController {
  target: Element | null = null;
  private opts: PortalControllerOptions;

  constructor(host: ReactiveControllerHost, opts: PortalControllerOptions) {
    this.opts = opts;
    host.addController(this);
  }

  private resolve(): Element | null {
    if (!this.opts.enabled) return null;
    const t = this.opts.getTarget?.();
    if (typeof t === 'string') return document.querySelector(t);
    return t ?? document.body;
  }

  hostConnected() { this.target = this.resolve(); }
}
