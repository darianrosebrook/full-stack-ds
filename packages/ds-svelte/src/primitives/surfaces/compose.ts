/**
 * Compose helpers for the snippet-based host adoption path. Svelte 5
 * passes native DOM events straight through to handlers, so
 * `event.preventDefault()` mutates `event.defaultPrevented` the way
 * the spec requires. Composition rule mirrors React and Vue:
 * consumer handler runs first; surface handler is suppressed if the
 * consumer called `event.preventDefault()`.
 */
export function composeEventHandlers<E extends Event>(
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
