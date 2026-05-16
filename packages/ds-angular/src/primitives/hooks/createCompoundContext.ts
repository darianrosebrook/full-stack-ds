import { InjectionToken, inject } from '@angular/core';

/**
 * Angular equivalent of Vue's createCompoundContext / React's createContext.
 *
 * Returns a typed InjectionToken and a `useContext()` helper that throws a
 * descriptive error when used outside the providing component.
 *
 * Usage:
 *   const { token: TabsContextToken, useContext: useTabsContext } =
 *     createCompoundContext<TabsContextValue>("Tabs");
 *
 *   // In <Tabs> providers array:
 *   providers: [{ provide: TabsContextToken, useValue: state }]
 *
 *   // In any descendant <TabsTab> / <TabsPanel>:
 *   const ctx = useTabsContext();  // throws if outside <Tabs>
 */
export function createCompoundContext<T>(displayName: string): {
  token: InjectionToken<T>;
  useContext: () => T;
} {
  const token = new InjectionToken<T>(`${displayName}Context`);

  function useContext(): T {
    const ctx = inject(token, { optional: true });
    if (ctx == null) {
      throw new Error(
        `${displayName} compound component used outside of its provider. ` +
        `Ensure a parent component provides the "${displayName}Context" token.`,
      );
    }
    return ctx;
  }

  return { token, useContext };
}
