import type { MutableRefObject, Ref, RefCallback, SyntheticEvent } from "react";

/**
 * Compose several refs into a single ref callback that fans the same
 * node to all of them. Accepts function refs, object refs, and
 * `undefined`/`null`. Used by `asChild` host-adoption: the consumer's
 * ref on the adopted child + the substrate's `registerAnchor`.
 */
interface RefCache {
  children: WeakMap<object, RefCache>;
  callback?: RefCallback<unknown>;
}
const refCache: RefCache = { children: new WeakMap() };

export function composeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  let cache = refCache;
  for (const ref of refs) {
    if (ref == null) continue;
    let next = cache.children.get(ref);
    if (!next) { next = { children: new WeakMap() }; cache.children.set(ref, next); }
    cache = next;
  }
  if (cache.callback) return cache.callback as RefCallback<T>;
  const callback: RefCallback<T> = (node) => {
    const cleanups = refs.map(ref => {
      if (ref == null) return undefined;
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return typeof cleanup === "function" ? cleanup : () => ref(null);
      }
      (ref as MutableRefObject<T | null>).current = node;
      return () => { (ref as MutableRefObject<T | null>).current = null; };
    });
    return () => { for (const cleanup of cleanups) cleanup?.(); };
  };
  cache.callback = callback as RefCallback<unknown>;
  return callback;
}

/**
 * Compose a consumer's React event handler with the surface's internal
 * handler. The consumer's handler runs first; if it calls
 * `event.preventDefault()`, the surface handler is suppressed. This is
 * the asChild adoption contract: consumers can opt out of surface
 * behavior on a per-event basis without needing another prop.
 */
export function composeEventHandlers<E extends SyntheticEvent>(
  consumerHandler: ((event: E) => void) | undefined,
  surfaceHandler: (event: E) => void,
): (event: E) => void {
  return (event) => {
    consumerHandler?.(event);
    if (!event.defaultPrevented) {
      surfaceHandler(event);
    }
  };
}
