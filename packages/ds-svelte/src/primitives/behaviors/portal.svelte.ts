export interface PortalActionOptions {
  /** When false the action is a no-op and the node stays in place. */
  enabled?: boolean;
  /** Mount point: a DOM element, a CSS selector, or undefined for document.body. */
  target?: Element | string;
}

/**
 * Svelte `use:` action that relocates its host node into a portal target
 * (default `document.body`). Used by full-overlay surfaces (Dialog, Sheet,
 * Toast, Command) whose fixed root must escape any transform/overflow/filter
 * ancestor's containing block.
 *
 * The action moves the element via `appendChild`, which reparents it without
 * re-creating it, so component state, refs, and event listeners survive. On
 * destroy the node is removed from wherever it now lives; Svelte's own
 * teardown then discards it. SSR-safe: `document` access is guarded so the
 * action degrades to an inline no-op when there is no DOM.
 */
export function portal(
  node: HTMLElement,
  options: PortalActionOptions = {},
): { destroy(): void } {
  const enabled = options.enabled ?? true;

  if (!enabled || typeof document === "undefined") {
    return { destroy() {} };
  }

  let mount: Element = document.body;
  const t = options.target;
  if (typeof t === "string") {
    mount = document.querySelector(t) ?? document.body;
  } else if (t) {
    mount = t;
  }

  mount.appendChild(node);

  return {
    destroy() {
      node.parentNode?.removeChild(node);
    },
  };
}
