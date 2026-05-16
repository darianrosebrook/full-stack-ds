// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTabsOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  destroyRef: DestroyRef;
}

export interface UseTabsResult {
  activeTab: Signal<string>;
  setActiveTab: (next: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTabs(options: UseTabsOptions): UseTabsResult {
  const { value: activeTab, set: setActiveTab } = createControllableState<string>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? "",
    onChange: options.onValueChange,
  });

  return {
    activeTab,
    setActiveTab,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
