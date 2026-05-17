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
 *
 * Reactivity: `provideContext` dispatches a `fsds-context-changed` CustomEvent
 * on the provider element whenever the context value is updated. Consumers use
 * `ContextConsumerController` (a `ReactiveController`) to subscribe and trigger
 * a host re-render whenever their relevant context key changes.
 */
import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Event name broadcast when a provider's context value changes. */
export const FSDS_CONTEXT_CHANGED = "fsds-context-changed";

type ContextMap = Map<symbol, unknown>;
const contextRegistry = new WeakMap<Element, ContextMap>();

/**
 * Attach a context value to an element. Typically called in the provider
 * element's `connectedCallback` or `hostConnected` lifecycle.
 * After setting the value, dispatches a `fsds-context-changed` CustomEvent
 * so that `ContextConsumerController` instances can trigger re-renders.
 */
export function provideContext<T>(element: Element, key: symbol, value: T): void {
  let map = contextRegistry.get(element) as ContextMap | undefined;
  if (!map) {
    map = new Map<symbol, unknown>();
    contextRegistry.set(element, map);
  }
  map.set(key, value);
  // Only dispatch events when the element is connected to the DOM.
  // This prevents jsdom errors when elements are removed mid-lifecycle
  // (e.g., deferred microtasks firing after test teardown).
  if (!element.isConnected) return;
  // Notify subscribed consumers that this context key has a new value.
  element.dispatchEvent(
    new CustomEvent(FSDS_CONTEXT_CHANGED, {
      detail: { key },
      bubbles: true,
      composed: true,
    }),
  );
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

/**
 * A `ReactiveController` that subscribes to `fsds-context-changed` events
 * on the document and triggers `host.requestUpdate()` when the matching
 * context key changes.
 *
 * Usage:
 * ```ts
 * class MyElement extends LitElement {
 *   private _ctx = new ContextConsumerController(this, TABS_CTX);
 *
 *   get ctx() { return this._ctx.value; }
 * }
 * ```
 */
export class ContextConsumerController<T> implements ReactiveController {
  private _listener: ((e: Event) => void) | null = null;

  constructor(
    private readonly host: ReactiveControllerHost & Element,
    private readonly ctx: { key: symbol; consume(el: Element): T },
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    this._listener = (e: Event) => {
      const ce = e as CustomEvent<{ key: symbol }>;
      if (ce.detail?.key === this.ctx.key) {
        this.host.requestUpdate();
      }
    };
    document.addEventListener(FSDS_CONTEXT_CHANGED, this._listener);
  }

  hostDisconnected(): void {
    if (this._listener) {
      document.removeEventListener(FSDS_CONTEXT_CHANGED, this._listener);
      this._listener = null;
    }
  }

  /** Read the current context value by walking up the ancestor tree. */
  get value(): T {
    return this.ctx.consume(this.host);
  }
}
