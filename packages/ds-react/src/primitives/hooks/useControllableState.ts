import { useCallback, useRef, useState } from "react";

/**
 * Manage a value that may be controlled by a parent or owned internally.
 *
 * When `controlled` is undefined the hook stores the value in internal state
 * (initialized from `defaultValue`) and the setter mutates it. When
 * `controlled` is defined the hook returns the controlled value directly
 * and the setter only fires `onChange` — the parent owns the source of
 * truth.
 *
 * The `onChange` callback is captured via ref so the returned setter is
 * referentially stable across renders. Mode (controlled vs uncontrolled)
 * must not change across the component's lifetime; doing so is a React
 * anti-pattern and the hook does not warn — calling code should preserve
 * the initial mode.
 */
export function useControllableState<T>(options: {
  controlled?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const { controlled, defaultValue, onChange } = options;
  const isControlled = controlled !== undefined;

  const [internal, setInternal] = useState<T>(defaultValue);
  const value = isControlled ? (controlled as T) : internal;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const valueRef = useRef(value);
  valueRef.current = value;

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const resolved =
      typeof next === "function"
        ? (next as (prev: T) => T)(valueRef.current)
        : next;
    if (!isControlledRef.current) setInternal(resolved);
    onChangeRef.current?.(resolved);
  }, []);

  return [value, setValue];
}
