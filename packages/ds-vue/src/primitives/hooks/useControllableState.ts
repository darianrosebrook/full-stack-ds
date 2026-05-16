import { computed, ref, type ComputedRef, type Ref } from "vue";

export interface UseControllableStateOptions<T> {
  /** Getter for the controlled value (returns undefined → uncontrolled). */
  controlled?: () => T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export interface UseControllableStateResult<T> {
  /** Reactive read-only value (controlled value when supplied, internal state otherwise). */
  value: ComputedRef<T>;
  /** Setter that updates internal state (when uncontrolled) and fires onChange. */
  set: (next: T | ((prev: T) => T)) => void;
}

/**
 * Vue equivalent of React's useControllableState. Mirrors the ref-stable
 * setter contract: the function returned from `set` does not change
 * across renders.
 *
 * Mode (controlled vs uncontrolled) must remain stable across the
 * component lifetime; this matches how Vue's reactivity system expects
 * computed sources to behave.
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): UseControllableStateResult<T> {
  const internal = ref(options.defaultValue) as Ref<T>;

  const value = computed<T>(() => {
    const controlled = options.controlled?.();
    return controlled !== undefined ? controlled : internal.value;
  });

  function set(next: T | ((prev: T) => T)): void {
    const resolved =
      typeof next === "function"
        ? (next as (prev: T) => T)(value.value)
        : next;
    if (options.controlled?.() === undefined) {
      internal.value = resolved;
    }
    options.onChange?.(resolved);
  }

  return { value, set };
}
