// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseFieldOptions {
  /** Controlled "value" value. */
  value?: unknown;
  /** Initial uncontrolled "value" value. */
  defaultValue?: unknown;
  /** Called when "value" changes. */
  onChange?: (value: unknown) => void;
}

export interface UseFieldResult {
  value: unknown;
  setValue: (next: unknown) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useField(options: UseFieldOptions = {}): UseFieldResult {
  const [value, setValue] = useControllableState<unknown>({
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
