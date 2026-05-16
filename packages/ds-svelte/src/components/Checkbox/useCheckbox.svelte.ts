// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCheckboxOptions {
  checked?: () => boolean | undefined;
  defaultChecked?: () => boolean | undefined;
  onChange?: () => ((value: boolean) => void) | undefined;
}

export interface UseCheckboxResult {
  readonly checked: boolean;
  setChecked(next: boolean): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useCheckbox(opts: UseCheckboxOptions = {}): UseCheckboxResult {
  const checkedState = createControllableState<boolean>({
    controlled: opts.checked,
    defaultValue: opts.defaultChecked?.() ?? false,
    onChange: (v) => opts.onChange?.()?.(v),
  });

  return {
    get checked() { return checkedState.value; },
    setChecked(v) { checkedState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
