// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTabsOptions {
  /** Controlled "activeTab" value. */
  value?: string;
  /** Initial uncontrolled "activeTab" value. */
  defaultValue?: string;
  /** Called when "activeTab" changes. */
  onValueChange?: (value: string) => void;
}

export interface UseTabsResult {
  activeTab: string;
  setActiveTab: (next: string) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTabs(options: UseTabsOptions = {}): UseTabsResult {
  const [activeTab, setActiveTab] = useControllableState<string>({
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
