// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTabsOptions {
  value?: () => string | undefined;
  defaultValue?: () => string | undefined;
  onValueChange?: () => ((value: string) => void) | undefined;
}

export interface UseTabsResult {
  readonly activeTab: string;
  setActiveTab(next: string): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTabs(opts: UseTabsOptions = {}): UseTabsResult {
  const activeTabState = createControllableState<string>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? "",
    onChange: (v) => opts.onValueChange?.()?.(v),
  });

  return {
    get activeTab() { return activeTabState.value; },
    setActiveTab(v) { activeTabState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
