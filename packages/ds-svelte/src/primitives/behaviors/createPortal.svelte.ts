export interface PortalOptions {
  enabled: boolean;
  target?: () => Element | string | undefined;
}

export interface PortalResult {
  readonly target: Element | null;
}

export function createPortal(opts: PortalOptions): PortalResult {
  let target = $state<Element | null>(null);

  if (opts.enabled) {
    const resolve = () => {
      const t = opts.target?.();
      if (typeof t === 'string') return document.querySelector(t);
      return t ?? document.body;
    };
    $effect(() => {
      target = resolve() ?? document.body;
    });
  }

  return {
    get target() {
      return target;
    },
  };
}
