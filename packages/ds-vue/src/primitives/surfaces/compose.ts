/**
 * Compose helpers used by the Vue host-adoption path. Vue passes the
 * native DOM event object straight through to handlers (no wrapper),
 * so `event.preventDefault()` mutates `event.defaultPrevented` in the
 * standard browser way. The composition rule mirrors the React
 * substrate: consumer handler runs first, surface handler is skipped
 * if the consumer called `event.preventDefault()`.
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
