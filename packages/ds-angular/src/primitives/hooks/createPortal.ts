import { signal, type Signal } from '@angular/core';

export interface PortalOptions {
  enabled: boolean;
  target?: () => Element | string | undefined;
}

export interface PortalResult {
  target: Signal<Element | null>;
}

/**
 * Resolve a portal mount point for Angular. Unlike Vue's <Teleport>, Angular
 * uses the CDK or manual DOM insertion; this helper pre-resolves the target
 * Element so the component can pass it to whichever portal mechanism it uses.
 *
 * The target is resolved synchronously at call time. For dynamic targets,
 * call createPortal inside an effect() and update accordingly.
 */
export function createPortal(opts: PortalOptions): PortalResult {
  const target = signal<Element | null>(null);

  if (opts.enabled) {
    const t = opts.target?.();
    if (typeof t === 'string') {
      target.set(document.querySelector(t) ?? document.body);
    } else if (t instanceof Element) {
      target.set(t);
    } else {
      target.set(document.body);
    }
  }

  return { target };
}
