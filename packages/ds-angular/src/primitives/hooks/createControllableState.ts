import { signal, computed, type Signal } from '@angular/core';

export interface ControllableStateOptions<T> {
  /** Getter for the controlled value (returns undefined → uncontrolled). */
  controlled?: () => T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export interface ControllableStateResult<T> {
  /** Reactive read-only signal (controlled value when supplied, internal state otherwise). */
  value: Signal<T>;
  /** Setter that updates internal state (when uncontrolled) and fires onChange. */
  set(next: T): void;
}

/**
 * Angular equivalent of React's useControllableState / Vue's useControllableState.
 *
 * Returns an Angular signal-based value + setter. Mode (controlled vs.
 * uncontrolled) must remain stable across the component lifetime.
 */
export function createControllableState<T>(
  opts: ControllableStateOptions<T>,
): ControllableStateResult<T> {
  const internal = signal<T>(opts.defaultValue);
  const value = computed(() => opts.controlled?.() ?? internal());

  function set(next: T): void {
    internal.set(next);
    opts.onChange?.(next);
  }

  return { value, set };
}
