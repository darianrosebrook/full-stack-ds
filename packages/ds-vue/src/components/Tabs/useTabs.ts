// @generated:start imports
import { ref, type Ref } from "vue";
import { createCompoundContext, useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTabsOptions {
  value?: () => string | undefined;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Base string for generating tab and panel IDs. Defaults to a generated id. */
  idBase?: string;
}

export interface UseTabsResult {
  activeTab: Ref<string>;
  setActiveTab: (next: string) => void;
  /** DOM-order list of registered tab values. */
  registeredTabs: Ref<string[]>;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  /** Base string for generating tab and panel IDs. */
  idBase: string;
}

export interface TabsContextValue {
  activeTab: Ref<string>;
  setActiveTab: (value: string) => void;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  registeredTabs: Ref<string[]>;
  idBase: string;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
  loop: boolean;
  unmountInactive: boolean;
}

export const [provideTabsContext, useTabsContext] =
  createCompoundContext<TabsContextValue>("Tabs");
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
let _tabsIdCounter = 0;

export function useTabs(options: UseTabsOptions = {}): UseTabsResult {
  const { value: activeTab, set: setActiveTab } = useControllableState<string>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? "",
    onChange: options.onValueChange,
  });

  const registeredTabs = ref<string[]>([]);

  const resolvedIdBase = options.idBase ?? `tabs-${++_tabsIdCounter}`;

  function registerTab(value: string): void {
    if (!registeredTabs.value.includes(value)) {
      registeredTabs.value = [...registeredTabs.value, value];
    }
  }

  function unregisterTab(value: string): void {
    registeredTabs.value = registeredTabs.value.filter((v) => v !== value);
  }

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
