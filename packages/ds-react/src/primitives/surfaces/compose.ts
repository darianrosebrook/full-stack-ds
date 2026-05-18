import type { MutableRefObject, Ref, RefCallback, SyntheticEvent } from "react";

/**
 * Compose several refs into a single ref callback that fans the same
 * node to all of them. Accepts function refs, object refs, and
 * `undefined`/`null`. Used by `asChild` host-adoption: the consumer's
 * ref on the adopted child + the substrate's `registerAnchor`.
 */
export function composeRefs<T>(
  ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
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
