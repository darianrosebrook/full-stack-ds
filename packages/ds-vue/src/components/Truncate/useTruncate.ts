// @generated:start imports
import { type Ref } from "vue";
import { useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTruncateOptions {
  expanded?: () => boolean | undefined;
  defaultExpanded?: boolean;
  onExpandedChange?: (value: boolean) => void;
}

export interface UseTruncateResult {
  expanded: Ref<boolean>;
  setExpanded: (next: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTruncate(options: UseTruncateOptions = {}): UseTruncateResult {
  const { value: expanded, set: setExpanded } = useControllableState<boolean>({
    controlled: options.expanded,
    defaultValue: options.defaultExpanded ?? false,
    onChange: options.onExpandedChange,
  });

  return {
    expanded,
    setExpanded,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
