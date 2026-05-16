/**
 * Compound context for Lit components.
 *
 * Lit does not have a built-in context API equivalent to React context or
 * Vue's `provide`/`inject`. This module provides a lightweight DOM-tree
 * walk approach: context values are stored in a WeakMap keyed by element,
 * and consumers walk up `parentElement` to find the nearest provider.
 *
 * For richer context needs (cross-shadow-root, async), prefer the
 * `@lit/context` package once it is available as a peer dependency.
 */

type ContextMap = Map<symbol, unknown>;
const contextRegistry = new WeakMap<Element, ContextMap>();

/**
 * Attach a context value to an element. Typically called in the provider
 * element's `connectedCallback` or `hostConnected` lifecycle.
 */
export function provideContext<T>(element: Element, key: symbol, value: T): void {
  let map = contextRegistry.get(element) as ContextMap | undefined;
  if (!map) {
    map = new Map<symbol, unknown>();
    contextRegistry.set(element, map);
  }
  map.set(key, value);
}

/**
 * Create a typed compound context token pair.
 *
 * @param displayName - Human-readable name for error messages.
 * @returns An object with `key` (the symbol used with `provideContext`) and
 *   `consume` (walks the ancestor chain to retrieve the value).
 */
export function createCompoundContext<T>(displayName: string): {
  key: symbol;
  consume(element: Element): T;
} {
  const key = Symbol(displayName);

  function consume(element: Element): T {
    let node: Element | null = element;
    while (node) {
      const map = contextRegistry.get(node) as ContextMap | undefined;
      if (map?.has(key)) return map.get(key) as T;
      node = node.parentElement;
    }
    throw new Error(`${displayName} context not found in ancestor tree`);
  }

  return { key, consume };
}
