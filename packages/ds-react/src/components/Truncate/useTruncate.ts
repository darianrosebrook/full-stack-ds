// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTruncateOptions {
  /** Controlled "expanded" value. */
  expanded?: boolean;
  /** Initial uncontrolled "expanded" value. */
  defaultExpanded?: boolean;
  /** Called when "expanded" changes. */
  onExpandedChange?: (value: boolean) => void;
}

export interface UseTruncateResult {
  expanded: boolean;
  setExpanded: (next: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTruncate(options: UseTruncateOptions = {}): UseTruncateResult {
  const [expanded, setExpanded] = useControllableState<boolean>({
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
