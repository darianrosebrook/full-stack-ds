/**
 * React-target-admitted type names.
 *
 * The IR's framework-neutral builtin set deliberately omits React-specific
 * types so that contracts leaking realization detail (e.g. `ReactNode` to
 * type a slot, `SyntheticEvent` to type a callback) get surfaced by the
 * unresolved-ref diagnostic. Targets that idiomatically *do* admit those
 * names declare them here and the CLI passes the set into
 * `buildComponentIR` only when the React target is being emitted in
 * isolation.
 *
 * This set is intentionally narrow: it lists React-shaped names that
 * appear in the current contract corpus or that are reasonable for a
 * framework-neutral contract to reference when the React target is the
 * only consumer. It is NOT a permission slip to author React-only
 * contracts; the project goal is for contracts to be framework-neutral
 * and for slot/event types to be pushed down into structural IR fields.
 */
export const REACT_ADMITTED_TYPES: ReadonlySet<string> = new Set([
  // Slot content shapes — used to type slot/children props
  "ReactNode",
  "ReactElement",
  "ComponentType",

  // Style/ref realization types
  "CSSProperties",
  "Ref",
  "RefObject",

  // Synthetic event types
  "SyntheticEvent",
  "MouseEvent",
  "KeyboardEvent",
  "ChangeEvent",
  "FocusEvent",
  "FormEvent",
  "MouseEventHandler",
  "KeyboardEventHandler",
  "ChangeEventHandler",
  "FocusEventHandler",
  "FormEventHandler",
  "EventHandler",

  // DOM element narrowing types
  "HTMLElement",
  "HTMLButtonElement",
  "HTMLInputElement",
  "HTMLSpanElement",
  "HTMLDivElement",
  "HTMLAnchorElement",
  "HTMLFormElement",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLLabelElement",
  "HTMLTableElement",
  "Element",
  "Node",
  "AllHTMLAttributes",
  "AriaRole",

  // The React namespace itself (for `React.X` references)
  "React",
]);
