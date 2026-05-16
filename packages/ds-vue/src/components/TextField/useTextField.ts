// @generated:start imports
import { type Ref } from "vue";
import { useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTextFieldOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface UseTextFieldResult {
  value: Ref<string>;
  setValue: (next: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTextField(options: UseTextFieldOptions = {}): UseTextFieldResult {
  const { value: value, set: setValue } = useControllableState<string>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? "",
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
