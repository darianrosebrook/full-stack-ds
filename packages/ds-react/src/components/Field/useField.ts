// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseFieldOptions {
  /** Controlled "value" value. */
  value?: string;
  /** Initial uncontrolled "value" value. */
  defaultValue?: string;
  /** Called when "value" changes. */
  onChange?: (value: string) => void;
}

export interface UseFieldResult {
  value: string;
  setValue: (next: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useField(options: UseFieldOptions = {}): UseFieldResult {
  const [value, setValue] = useControllableState<string>({
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
