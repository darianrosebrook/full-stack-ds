// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseRadioGroupOptions {
  value?: () => string | undefined;
  defaultValue?: () => string | undefined;
  onChange?: () => ((value: string) => void) | undefined;
}

export interface UseRadioGroupResult {
  readonly selection: string;
  setSelection(next: string): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useRadioGroup(opts: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const selectionState = createControllableState<string>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? "",
    onChange: (v) => opts.onChange?.()?.(v),
  });

  return {
    get selection() { return selectionState.value; },
    setSelection(v) { selectionState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
