import { createContext, useContext, type ReactNode } from "react";

export type NativeTokenValue = string | number;

export interface FsdsTheme {
  tokens?: Record<string, NativeTokenValue>;
  brand?: string;
  density?: string;
}

export interface ComponentTokenDefinition {
  cssVar: string;
  name: string;
  ref?: string;
  fallback?: NativeTokenValue;
  literal?: NativeTokenValue;
}

export type ComponentTokenScope = Record<string, ComponentTokenDefinition>;
export type ComponentTokenScopes = Record<string, ComponentTokenScope>;
export type ResolvedTokenScope = Record<string, NativeTokenValue | undefined>;
export type ResolvedTokenScopes<T extends ComponentTokenScopes> = {
  [K in keyof T]: ResolvedTokenScope;
};

const FsdsThemeContext = createContext<FsdsTheme>({});

export function FsdsThemeProvider({
  value,
  children,
}: {
  value: FsdsTheme;
  children?: ReactNode;
}) {
  return (
    <FsdsThemeContext.Provider value={value}>
      {children}
    </FsdsThemeContext.Provider>
  );
}

export function useFsdsTheme(): FsdsTheme {
  return useContext(FsdsThemeContext);
}

export function resolveComponentTokens<T extends ComponentTokenScopes>(
  scopes: T,
  theme?: FsdsTheme,
): ResolvedTokenScopes<T> {
  const out: Record<string, ResolvedTokenScope> = {};
  for (const [scopeName, scope] of Object.entries(scopes)) {
    const resolved: ResolvedTokenScope = {};
    for (const [slotName, definition] of Object.entries(scope)) {
      resolved[slotName] = resolveTokenValue(definition, theme);
    }
    out[scopeName] = resolved;
  }
  return out as ResolvedTokenScopes<T>;
}

/**
 * Drop undefined values from a style object before StyleSheet registration.
 * Joined variant/state styles read theme-reactive token scopes; without a
 * theme, a ref-only token resolves undefined, and React Native's style
 * flattening would let that undefined clobber an earlier layer's committed
 * fallback (e.g. variant_primary unsetting root's backgroundColor).
 */
export function definedStyle<const T extends Record<string, unknown>>(style: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}

export function resolveTokenValue(
  definition: ComponentTokenDefinition,
  theme?: FsdsTheme,
): NativeTokenValue | undefined {
  if (definition.literal !== undefined) return normalizeNativeToken(definition.literal);
  if (definition.ref && theme?.tokens?.[definition.ref] !== undefined) {
    return normalizeNativeToken(theme.tokens[definition.ref]);
  }
  return normalizeNativeToken(definition.fallback);
}

function normalizeNativeToken(
  value: NativeTokenValue | undefined,
): NativeTokenValue | undefined {
  if (typeof value !== "string") return value;
  const px = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim());
  if (px) return Number(px[1]);
  return value;
}
