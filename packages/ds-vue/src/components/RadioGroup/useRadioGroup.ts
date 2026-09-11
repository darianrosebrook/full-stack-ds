// @generated:start imports
import { type Ref } from "vue";
import { useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseRadioGroupOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface UseRadioGroupResult {
  selection: Ref<string>;
  setSelection: (next: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useRadioGroup(options: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const { value: selection, set: setSelection } = useControllableState<string>({
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
