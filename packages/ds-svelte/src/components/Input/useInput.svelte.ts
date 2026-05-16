// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseInputOptions {
  value?: () => string | undefined;
  defaultValue?: () => string | undefined;
  onChange?: () => ((value: string) => void) | undefined;
}

export interface UseInputResult {
  readonly value: string;
  setValue(next: string): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useInput(opts: UseInputOptions = {}): UseInputResult {
  const valueState = createControllableState<string>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? "",
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
