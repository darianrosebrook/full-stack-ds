import { type Context, createContext, useContext } from "react";

/**
 * Helper for compound components (Tabs, Accordion, Dropdown, Menu, …):
 * creates a typed React context plus a `useX` consumer that throws when
 * called outside the provider.
 *
 * Generated hook code uses this so each compound component avoids
 * re-implementing the same null-check + descriptive-error boilerplate.
 *
 * Usage:
 *   const [TabsContextProvider, useTabsContext, TabsContext] =
 *     createCompoundContext<TabsContextValue>("Tabs");
 */
export function createCompoundContext<T>(
  name: string,
): [Context<T | null>["Provider"], () => T, Context<T | null>] {
  const ctx = createContext<T | null>(null);
  ctx.displayName = `${name}Context`;
  function useCompoundContext(): T {
    const value = useContext(ctx);
    if (value === null) {
      throw new Error(
        `${name} compound component used outside of <${name}> provider.`,
      );
    }
    return value;
  }
  return [ctx.Provider, useCompoundContext, ctx];
}
