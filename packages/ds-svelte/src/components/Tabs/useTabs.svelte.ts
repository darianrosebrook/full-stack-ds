// @generated:start imports
import { createCompoundContext, createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTabsOptions {
  value?: () => string | undefined;
  defaultValue?: () => string | undefined;
  onValueChange?: () => ((value: string) => void) | undefined;
  /** Base string for generating tab and panel IDs. Defaults to a generated id. */
  idBase?: string | (() => string | undefined);
}

export interface UseTabsResult {
  readonly activeTab: string;
  setActiveTab(next: string): void;
  /** DOM-order list of registered tab values. */
  readonly registeredTabs: string[];
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  /** Base string for generating tab and panel IDs. */
  idBase: string;
}

export interface TabsContextValue {
  readonly activeTab: string;
  setActiveTab: (value: string) => void;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  readonly registeredTabs: string[];
  idBase: string;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
  loop: boolean;
  unmountInactive: boolean;
}

const _tabsContext = createCompoundContext<TabsContextValue>("Tabs");

export function provideTabsContext(value: TabsContextValue): void {
  _tabsContext.provide(value);
}

export function useTabsContext(): TabsContextValue {
  return _tabsContext.consume();
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
let _tabsIdCounter = 0;

export function useTabs(opts: UseTabsOptions = {}): UseTabsResult {
  const activeTabState = createControllableState<string>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? "",
    onChange: (v) => opts.onValueChange?.()?.(v),
  });

  let _registeredTabs = $state<string[]>([]);

  const rawIdBase = typeof opts.idBase === "function" ? opts.idBase() : opts.idBase;
  const resolvedIdBase = rawIdBase ?? `tabs-${++_tabsIdCounter}`;

  function registerTab(value: string): void {
    if (!_registeredTabs.includes(value)) {
      _registeredTabs = [..._registeredTabs, value];
    }
  }

  function unregisterTab(value: string): void {
    _registeredTabs = _registeredTabs.filter((v) => v !== value);
  }

  return {
    get activeTab() { return activeTabState.value; },
    setActiveTab(v) { activeTabState.set(v); },
    get registeredTabs() { return _registeredTabs; },
    registerTab,
    unregisterTab,
    idBase: resolvedIdBase,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end
