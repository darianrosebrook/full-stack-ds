/**
 * Design Token Generator
 *
 * Functions for generating component-specific CSS variables and token utilities.
 */

import type {
  ComponentTokenConfig,
  ResolverConfig,
  ResolveContext,
} from "./build/lib/types";
import {
  DEFAULT_REF,
  resolveInterpolated,
  applyTransforms,
} from "./build/lib/resolver";
import { builtInTransforms } from "./utils/transforms";
import { Logger } from "../../helpers/logger";
import { getNestedValue } from "./build/lib/pathUtils";
import { extractTokenPaths } from "./build/core/index";

/**
 * Builds CSS variable names with configurable casing and prefixes
 */
function buildName(
  prefix: string,
  path: string[],
  nameCase: "kebab" | "camel" | "pascal",
  cssVarPrefix: string,
): string {
  const segments = [prefix, ...path];

  switch (nameCase) {
    case "camel":
      return segments
        .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
        .join("");
    case "pascal":
      return segments
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
    case "kebab":
    default:
      return `${cssVarPrefix}${segments.join("-")}`;
  }
}

/**
 * Walks through token objects recursively
 */
function walk(
  obj: Record<string, unknown>,
  path: string[],
  callback: (path: string[], value: unknown, node: unknown) => void,
): void {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = [...path, key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      walk(value as Record<string, unknown>, currentPath, callback);
    } else {
      callback(currentPath, value, obj);
    }
  }
}

/**
 * Generates component-specific CSS variables from token configuration.
 *
 * This function takes component token definitions and resolves them to CSS custom properties,
 * applying transformations, theme/platform selection, and reference resolution as configured.
 *
 * @param tokenConfig - Configuration defining the component tokens and naming prefix
 * @param tokens - The global token system to resolve references against
 * @param config - Configuration options for resolution behavior and output format
 * @returns Object mapping CSS variable names to their resolved values
 *
 * @example
 * ```typescript
 * const config = {
 *   prefix: 'btn',
 *   tokens: { color: '{semantic.color.primary}', size: '16px' }
 * };
 *
 * const cssVars = generate(config, tokens, createDefaultConfig());
 * // Returns: { '--btn-color': 'var(--fsds-semantic-color-primary)', '--btn-size': '16px' }
 * ```
 */
export function generate(
  tokenConfig: ComponentTokenConfig,
  tokens: Record<string, unknown>,
  config: ResolverConfig,
): Record<string, string> {
  const cssVars: Record<string, string> = {};
  const { prefix } = tokenConfig;

  walk(tokenConfig.tokens, [], (path, raw, node) => {
    const name = buildName(
      prefix,
      path,
      config.nameCase ?? "kebab",
      config.cssVarPrefix ?? "--",
    );

    const ctx: ResolveContext = {
      path: path.join("."),
      node,
      tokens,
      config,
      theme: config.theme,
      platform: config.platform,
      brand: config.brand,
    };

    const visited: string[] = [];
    let resolved: unknown;

    if (config.output === "ref-map") {
      // Emit references instead of computed values
      const refValue =
        typeof raw === "string" ? String(raw) : `${prefix}.${path.join(".")}`;
      cssVars[name] = refValue;
      return;
    }

    if (config.emitVarsOnly) {
      // Only declare variable names; host CSS/classes should map values
      cssVars[name] = "";
      return;
    }

    if (typeof raw === "string") {
      resolved = resolveInterpolated(raw, String(raw), ctx, visited);
    } else {
      // For non-string values, apply transforms directly
      resolved = applyTransforms(raw, ctx);
    }

    cssVars[name] = String(resolved);
  });

  return cssVars;
}

/**
 * Creates a default configuration for token resolution with sensible defaults.
 *
 * This provides a baseline configuration that works well for most use cases,
 * with options to override specific behaviors as needed.
 *
 * @param overrides - Partial configuration to merge with defaults
 * @returns Complete resolver configuration with defaults applied
 *
 * @example
 * ```typescript
 * const config = createDefaultConfig({
 *   theme: 'dark',
 *   output: 'css-decl',
 *   cssVarPrefix: '--my-app'
 * });
 * ```
 */
export function createDefaultConfig(
  overrides: Partial<ResolverConfig> = {},
): ResolverConfig {
  return {
    output: "css-var-map",
    cssVarPrefix: "--",
    nameCase: "kebab",
    theme: "light",
    platform: "web",
    fallbackDelimiter: "||",
    referencePattern: DEFAULT_REF,
    maxDepth: 32,
    resolveToReferences: true, // Default to reference-based resolution
    systemTokenPrefix: "--", // Default system token prefix
    emitVarFallbackChain: true,
    emitVarsOnly: false,
    numberPrecision: 3,
    unitPreferences: {
      dimension: "px",
      duration: "ms",
      color: "hex",
    },
    transforms: builtInTransforms,
    cache: new Map(),
    onWarn: (d) => Logger.warn(`${d.code} @ ${d.path} — ${d.message}`),
    onError: (d) => Logger.error(`${d.code} @ ${d.path} — ${d.message}`),
    strict: false,
    ...overrides,
  };
}

/**
 * Validates that a token path exists in the design system
 *
 * @param tokenPath - The token path to validate
 * @param designTokens - The design tokens object to search in
 * @returns boolean indicating if the token exists
 */
export const validateTokenPath = (
  tokenPath: string,
  designTokens: Record<string, unknown>,
): boolean => {
  try {
    const cleanPath = tokenPath.replace(/[{}]/g, "");
    const node = getNestedValue(designTokens, cleanPath);

    if (node == null) return false;

    // Check if it has a $value or is a primitive value
    return (
      (typeof node === "object" && "$value" in node) ||
      typeof node === "string" ||
      typeof node === "number"
    );
  } catch {
    return false;
  }
};

/**
 * Formats CSS variables as CSS declarations
 */
export function formatAsCSS(
  cssVars: Record<string, string>,
  selector = ":root",
): string {
  const declarations = Object.entries(cssVars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${declarations}\n}`;
}

/**
 * Gets all available token paths from the design system
 *
 * @deprecated Use extractTokenPaths from '../core/index' instead
 * @param designTokens - Object to traverse
 * @param prefix - Current path prefix
 * @returns Array of all available token paths
 */
export const getAvailableTokenPaths = extractTokenPaths;
