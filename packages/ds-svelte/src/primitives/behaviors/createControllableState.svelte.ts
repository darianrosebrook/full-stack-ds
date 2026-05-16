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
    internal = next;
    opts.onChange?.(next);
  }

  return {
    get value() {
      return value;
    },
    set,
  };
}
