// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseFieldOptions {
  value?: () => unknown | undefined;
  defaultValue?: () => unknown | undefined;
  onChange?: () => ((value: unknown) => void) | undefined;
}

export interface UseFieldResult {
  readonly value: unknown;
  setValue(next: unknown): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useField(opts: UseFieldOptions = {}): UseFieldResult {
  const valueState = createControllableState<unknown>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? undefined as never,
    onChange: (v) => opts.onChange?.()?.(v),
  });

  return {
    get value() { return valueState.value; },
    setValue(v) { valueState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
