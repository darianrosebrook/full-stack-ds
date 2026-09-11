// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseRadioGroupOptions {
  /** Controlled "selection" value. */
  value?: string;
  /** Initial uncontrolled "selection" value. */
  defaultValue?: string;
  /** Called when "selection" changes. */
  onChange?: (value: string) => void;
}

export interface UseRadioGroupResult {
  selection: string;
  setSelection: (next: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useRadioGroup(options: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const [selection, setSelection] = useControllableState<string>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? "",
    onChange: options.onChange,
  });

  return {
    selection,
    setSelection,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
