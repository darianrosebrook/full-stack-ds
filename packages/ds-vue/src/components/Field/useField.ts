// @generated:start imports
import { type Ref } from "vue";
import { useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseFieldOptions {
  value?: () => unknown | undefined;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
}

export interface UseFieldResult {
  value: Ref<unknown>;
  setValue: (next: unknown) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useField(options: UseFieldOptions = {}): UseFieldResult {
  const { value: value, set: setValue } = useControllableState<unknown>({
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
