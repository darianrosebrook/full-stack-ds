import { type InjectionKey, inject, provide } from "vue";

/**
 * Vue equivalent of React's createCompoundContext. Returns a typed
 * provide/inject pair plus the symbolic key.
 *
 * Usage:
 *   const [provideTabsContext, useTabsContext, TabsKey] =
 *     createCompoundContext<TabsContextValue>("Tabs");
 *
 *   // In <Tabs>:
 *   provideTabsContext({ ...state });
 *
 *   // In any descendant <TabsTab> / <TabsPanel>:
 *   const ctx = useTabsContext();  // throws if outside <Tabs>
 */
export function createCompoundContext<T>(
  name: string,
): [(value: T) => void, () => T, InjectionKey<T>] {
  const key: InjectionKey<T> = Symbol(`${name}Context`);
  function provideContext(value: T): void {
    provide(key, value);
  }
  function useContext(): T {
    const value = inject(key, null as T | null);
    if (value === null) {
      throw new Error(
        `${name} compound component used outside of <${name}> provider.`,
      );
    }
    return value;
  }
  return [provideContext, useContext, key];
}
