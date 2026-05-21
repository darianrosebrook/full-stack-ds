// @generated:start imports
import { type Ref } from "vue";
import { useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseShuttleOptions {
  value?: () => string[] | undefined;
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export interface UseShuttleResult {
  selection: Ref<string[]>;
  setSelection: (next: string[]) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useShuttle(options: UseShuttleOptions = {}): UseShuttleResult {
  const { value: selection, set: setSelection } = useControllableState<string[]>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onValueChange,
  });

  return {
    selection,
    setSelection,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
