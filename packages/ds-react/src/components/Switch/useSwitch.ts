// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSwitchOptions {
  /** Controlled "checked" value. */
  checked?: boolean;
  /** Initial uncontrolled "checked" value. */
  defaultChecked?: boolean;
  /** Called when "checked" changes. */
  onChange?: (value: boolean) => void;
}

export interface UseSwitchResult {
  checked: boolean;
  setChecked: (next: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSwitch(options: UseSwitchOptions = {}): UseSwitchResult {
  const [checked, setChecked] = useControllableState<boolean>({
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
