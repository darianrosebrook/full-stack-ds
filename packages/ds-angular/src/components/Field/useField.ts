// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseFieldOptions {
  value?: () => unknown | undefined;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
  destroyRef: DestroyRef;
}

export interface UseFieldResult {
  value: Signal<unknown>;
  setValue: (next: unknown) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useField(options: UseFieldOptions): UseFieldResult {
  const { value: value, set: setValue } = createControllableState<unknown>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onChange,
  });

  return {
    value,
    setValue,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
