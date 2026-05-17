// @generated:start imports
import { useCallback, useId, useState } from "react";
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
  /** Base string for generating tab and panel IDs. Defaults to a generated id. */
  idBase?: string;
}

export interface UseTabsResult {
  activeTab: string;
  setActiveTab: (next: string) => void;
  /** DOM-order list of registered tab values. */
  registeredTabs: string[];
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  /** Base string for generating tab and panel IDs. */
  idBase: string;
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

  const [registeredTabs, setRegisteredTabs] = useState<string[]>([]);

  const generatedId = useId();
  const resolvedIdBase = options.idBase ?? generatedId;

  const registerTab = useCallback((value: string) => {
    setRegisteredTabs((prev) =>
      prev.includes(value) ? prev : [...prev, value],
    );
  }, []);

  const unregisterTab = useCallback((value: string) => {
    setRegisteredTabs((prev) => prev.filter((v) => v !== value));
  }, []);

  return {
    activeTab,
    setActiveTab,
    registeredTabs,
    registerTab,
    unregisterTab,
    idBase: resolvedIdBase,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
