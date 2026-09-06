import { requestInteractionChange } from "../interaction.js";
export interface ControllableStateOptions<T> {
  controlled?: () => T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}

export interface ControllableStateResult<T> {
  readonly value: T;
  set(next: T): void;
}

export function createControllableState<T>(
  opts: ControllableStateOptions<T>,
): ControllableStateResult<T> {
  let internal = $state<T>(opts.defaultValue);
  const value = $derived(opts.controlled?.() ?? internal);

  function set(next: T) {
    requestInteractionChange(opts.controlled?.(), next, value => { internal = value; }, opts.onChange);
  }

  return {
    get value() {
      return value;
    },
    set,
  };
}
