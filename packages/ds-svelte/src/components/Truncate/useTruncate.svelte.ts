// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTruncateOptions {
  expanded?: () => boolean | undefined;
  defaultExpanded?: () => boolean | undefined;
  onExpandedChange?: () => ((value: boolean) => void) | undefined;
}

export interface UseTruncateResult {
  readonly expanded: boolean;
  setExpanded(next: boolean): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTruncate(opts: UseTruncateOptions = {}): UseTruncateResult {
  const expandedState = createControllableState<boolean>({
    controlled: opts.expanded,
    defaultValue: opts.defaultExpanded?.() ?? false,
    onChange: (v) => opts.onExpandedChange?.()?.(v),
  });

  return {
    get expanded() { return expandedState.value; },
    setExpanded(v) { expandedState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
