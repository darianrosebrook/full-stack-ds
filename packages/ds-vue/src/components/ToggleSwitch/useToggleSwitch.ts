// @generated:start imports
import { type Ref } from "vue";
import { useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseToggleSwitchOptions {
  checked?: () => boolean | undefined;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
}

export interface UseToggleSwitchResult {
  checked: Ref<boolean>;
  setChecked: (next: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useToggleSwitch(options: UseToggleSwitchOptions = {}): UseToggleSwitchResult {
  const { value: checked, set: setChecked } = useControllableState<boolean>({
    controlled: options.checked,
    defaultValue: options.defaultChecked ?? false,
    onChange: options.onChange,
  });

  return {
    checked,
    setChecked,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
