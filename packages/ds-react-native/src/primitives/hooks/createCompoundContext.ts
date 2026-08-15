import { type Context, createContext, useContext } from "react";

/**
 * Helper for compound components (Tabs, Accordion, Dropdown, Menu, …):
 * creates a typed React context plus a `useX` consumer that throws when
 * called outside the provider.
 *
 * Ported verbatim from the ds-react seed primitive — React Native is React,
 * and this helper touches no DOM, so the two implementations stay
 * byte-equivalent by construction. ds-react-native must not import it from
 * ds-react (no cross-package dependency); the port is the dependency boundary.
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
