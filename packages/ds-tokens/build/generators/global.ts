#!/usr/bin/env node
/**
 * Global Token Generator
 *
 * Consolidates both .mjs and .ts implementations into a single,
 * TypeScript-based generator for global design tokens.
 *
 * Supports:
 * - CSS Cascade Layers (@layer core, semantic, theme, brand)
 * - Multi-brand theming via [data-brand] attribute selectors
 * - Light/dark theme variants
 */

import fs from "fs";
import path from "path";
import {
  PATHS,
  readTokenFile,
  writeOutputFile,
  tokenPathToCSSVar,
  formatCSSBlock,
  generateBanner,
  logSummary,
  type TokenGroup,
} from "../core/index.js";
import {
  hasFileChanged,
  updateFileCache,
} from "../core/cache.js";
import {
  isTokenDeprecated,
  formatDeprecationWarning,
} from "../deprecation/index.js";
import {
  Resolver,
  loadResolverDocument,
  type ResolutionInput,
} from "../lib/resolver-module.js";
import {
  isStructuredColorValue,
  isStructuredDimensionValue,
  colorValueToCSS,
  dimensionValueToCSS,
  shadowValueToCSS,
} from "../lib/transforms.js";

/**
 * Type guard for DTCG 1.0 structured shadow $value. A shadow is `{offsetX,
 * offsetY, blur, color, spread?, inset?}` where the dimensional fields are
 * each `{value, unit}` and `color` is `{colorSpace, components, alpha?}`.
 *
 * Detecting on the *presence* of offsetX is conservative: anything with that
 * key is going to be a shadow (no other DTCG composite types use it), and
 * leaving the detection narrow keeps non-shadow objects from being silently
 * coerced through the shadow flattener.
 */
function isStructuredShadowValue(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "offsetX" in value &&
    "offsetY" in value
  );
}

/** Available brand identifiers */
export type BrandId =
  | "default"
  | "corporate"
  | "forest"
  | "sunset"
  | "midnight"
  | "ocean"
  | "canary"
  | "monochrome"
  | "rose"
  | "slate";

/** Available density identifiers */
export type DensityId = "tight" | "compact" | "default" | "spacious";

/** Brand metadata from token files */
export interface BrandMetadata {
  name: string;
  description: string;
  accent: string;
}

/** Density metadata from token files */
export interface DensityMetadata {
  name: string;
  description: string;
  base: string;
}

/** Processed brand token overrides */
export interface BrandOverrides {
  metadata: BrandMetadata;
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
}

/** Processed density token overrides */
export interface DensityOverrides {
  metadata: DensityMetadata;
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
}

interface ThemeMaps {
  root: Record<string, string>;
  lightColors: Record<string, string>;
  darkColors: Record<string, string>;
  hasDarkOverride: boolean;
}

/** Shared token-walk context. Exported for tests. */
export interface CollectionContext {
  theme?: "light" | "dark";
  definedVars: Set<string>;
  referencedVars: Set<string>;
}

/**
 * Walk token tree and collect CSS custom properties
 */
function collectTokens(
  obj: TokenGroup,
  path: string[] = [],
  context: CollectionContext,
  maps: ThemeMaps,
  tokens: TokenGroup,
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue; // Skip metadata

    const currentPath = [...path, key];
    const cssVar = tokenPathToCSSVar(currentPath.join("."));

    if (value && typeof value === "object") {
      if ("$value" in value) {
        // This is a token
        const tokenValue = value.$value;
        const tokenType = value.$type;

        // Skip tokens with undefined/null values
        if (tokenValue === undefined || tokenValue === null) {
          return;
        }

        // Track defined variables
        context.definedVars.add(cssVar);

        // Handle composition type tokens specially (before other processing)
        if (tokenType === "composition") {
          const processedValue = processTokenValue(
            tokenValue,
            context,
            currentPath.join("."),
            tokens,
          );
          // Skip composition tokens that return empty (like focus-ring)
          if (processedValue) {
            maps.root[cssVar] = processedValue;
          }
          return; // Skip further processing for composition tokens
        }

        // Check for theme-specific values in $extensions
        const extensions = value.$extensions as
          | Record<string, unknown>
          | undefined;
        const hasThemeExtensions =
          extensions &&
          ("fsds.light" in extensions || "fsds.dark" in extensions);

        if (hasThemeExtensions) {
          maps.hasDarkOverride = true;

          // Light theme value (from extension or default)
          const lightValue = extensions!["fsds.light"] || tokenValue;
          const processedLightValue = processTokenValue(
            lightValue,
            context,
            currentPath.join("."),
            tokens,
          );
          if (processedLightValue) {
            maps.lightColors[cssVar] = processedLightValue;
          }

          // Dark theme value (from extension or default)
          const darkValue = extensions!["fsds.dark"] || tokenValue;
          const processedDarkValue = processTokenValue(
            darkValue,
            context,
            currentPath.join("."),
            tokens,
          );
          if (processedDarkValue) {
            maps.darkColors[cssVar] = processedDarkValue;
          }
        } else if (typeof tokenValue === "object" && tokenValue !== null) {
          const themeObj = tokenValue as Record<string, unknown>;

          if ("light" in themeObj || "dark" in themeObj) {
            maps.hasDarkOverride = true;

            // Light theme value
            if ("light" in themeObj) {
              const lightValue = processTokenValue(
                themeObj.light,
                context,
                currentPath.join("."),
                tokens,
              );
              if (lightValue) {
                maps.lightColors[cssVar] = lightValue;
              }
            }

            // Dark theme value
            if ("dark" in themeObj) {
              const darkValue = processTokenValue(
                themeObj.dark,
                context,
                currentPath.join("."),
                tokens,
              );
              if (darkValue) {
                maps.darkColors[cssVar] = darkValue;
              }
            }
          } else {
            // Regular object value (not theme-specific)
            const processedValue = processTokenValue(
              tokenValue,
              context,
              currentPath.join("."),
              tokens,
            );
            if (processedValue) {
              maps.root[cssVar] = processedValue;
            }
          }
        } else {
          // Simple value
          const processedValue = processTokenValue(
            tokenValue,
            context,
            currentPath.join("."),
            tokens,
          );

          // Skip if value is empty/undefined
          if (!processedValue) {
            return;
          }

          // Determine where to place based on token type or path
          if (
            tokenType === "color" ||
            currentPath.some((p) => p.includes("color"))
          ) {
            // For color tokens without theme extensions, use default value for both themes
            maps.lightColors[cssVar] = processedValue;
            maps.darkColors[cssVar] = processedValue;
          } else {
            maps.root[cssVar] = processedValue;
          }
        }
      } else {
        // This is a group, recurse
        collectTokens(value as TokenGroup, currentPath, context, maps, tokens);
      }
    } else if (value !== undefined && value !== null) {
      // Handle plain values from resolver module (not DTCG structure)
      // These are already resolved values, not token objects

      // Check if value is actually undefined (from unresolved references)
      // The resolver may return undefined for tokens that couldn't be resolved
      if (value === undefined) {
        // Skip undefined values - they're unresolved references
        return;
      }

      const processedValue = processTokenValue(
        value,
        context,
        currentPath.join("."),
        tokens,
      );

      // Skip if processed value is empty (but allow 0, false, etc.)
      if (
        processedValue === "" &&
        value !== "" &&
        value !== 0 &&
        value !== false
      ) {
        return;
      }

      // Track defined variables
      context.definedVars.add(cssVar);

      // Determine where to place based on path
      if (currentPath.some((p) => p.includes("color"))) {
        // For color tokens, use default value for both themes
        maps.lightColors[cssVar] = processedValue;
        maps.darkColors[cssVar] = processedValue;
      } else {
        maps.root[cssVar] = processedValue;
      }
    } else if (value === undefined) {
      // Explicitly handle undefined values from resolver
      // These are tokens that exist but couldn't be resolved
      // Skip them entirely - they're not valid CSS
      return;
    }
  }
}

/**
 * Process token value and handle references.
 *
 * Converts DTCG 1.0 structured values to CSS strings and resolves token references.
 * Supports both legacy string values and new structured objects.
 *
 * @param value - Raw token value to process
 * @param context - Collection context for tracking variables and references
 * @param tokenPath - Current token path (for reference resolution)
 * @param tokens - Full token tree (for reference validation)
 * @returns Processed CSS value string
 */
/**
 * Check if value is a composition type token (e.g., padding composite, focus ring)
 * Handles both direct objects and objects wrapped in $value
 */
function isCompositionValue(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check for composition properties directly
  const hasCompositionProps =
    "paddingTop" in obj ||
    "paddingRight" in obj ||
    "paddingBottom" in obj ||
    "paddingLeft" in obj ||
    "marginTop" in obj ||
    "marginRight" in obj ||
    "marginBottom" in obj ||
    "marginLeft" in obj ||
    "border" in obj ||
    "offset" in obj ||
    "opacity" in obj;

  return hasCompositionProps;
}

/**
 * Extract actual value from token structure (handles $value wrappers recursively)
 */
function extractTokenValue(value: unknown): unknown {
  if (typeof value === "object" && value !== null && "$value" in value) {
    const innerValue = (value as { $value: unknown }).$value;
    // Recursively extract if nested
    return extractTokenValue(innerValue);
  }
  return value;
}

/**
 * Serialize composition token to CSS shorthand
 * Handles padding and margin composites
 */
function compositionValueToCSS(
  composition: Record<string, unknown>,
  context: CollectionContext,
  tokens?: TokenGroup,
): string {
  // Handle padding composite
  if (
    "paddingTop" in composition ||
    "paddingRight" in composition ||
    "paddingBottom" in composition ||
    "paddingLeft" in composition
  ) {
    const top = processTokenValue(
      extractTokenValue(composition.paddingTop),
      context,
      undefined,
      tokens,
    );
    const right = processTokenValue(
      extractTokenValue(composition.paddingRight),
      context,
      undefined,
      tokens,
    );
    const bottom = processTokenValue(
      extractTokenValue(composition.paddingBottom),
      context,
      undefined,
      tokens,
    );
    const left = processTokenValue(
      extractTokenValue(composition.paddingLeft),
      context,
      undefined,
      tokens,
    );

    // Generate CSS padding shorthand
    if (top === right && bottom === left && top === bottom) {
      return top; // All sides equal: "4px"
    } else if (top === bottom && right === left) {
      return `${top} ${right}`; // Vertical and horizontal: "4px 8px"
    } else if (right === left) {
      return `${top} ${right} ${bottom}`; // Top, horizontal, bottom: "4px 8px 4px"
    } else {
      return `${top} ${right} ${bottom} ${left}`; // All different: "4px 8px 4px 8px"
    }
  }

  // Handle margin composite (same logic as padding)
  if (
    "marginTop" in composition ||
    "marginRight" in composition ||
    "marginBottom" in composition ||
    "marginLeft" in composition
  ) {
    const top = processTokenValue(
      extractTokenValue(composition.marginTop),
      context,
      undefined,
      tokens,
    );
    const right = processTokenValue(
      extractTokenValue(composition.marginRight),
      context,
      undefined,
      tokens,
    );
    const bottom = processTokenValue(
      extractTokenValue(composition.marginBottom),
      context,
      undefined,
      tokens,
    );
    const left = processTokenValue(
      extractTokenValue(composition.marginLeft),
      context,
      undefined,
      tokens,
    );

    if (top === right && bottom === left && top === bottom) {
      return top;
    } else if (top === bottom && right === left) {
      return `${top} ${right}`;
    } else if (right === left) {
      return `${top} ${right} ${bottom}`;
    } else {
      return `${top} ${right} ${bottom} ${left}`;
    }
  }

  // Handle focus ring composition (border, offset, opacity)
  if (
    "border" in composition ||
    "offset" in composition ||
    "opacity" in composition
  ) {
    // Focus ring can't be represented as a single CSS value
    // It should be used via individual properties or excluded from CSS generation
    console.warn(
      "[tokens] Skipping focus ring composition — cannot serialize to single CSS value",
    );
    return "";
  }

  // Fallback for other composition types - skip them
  return "";
}

function processTokenValue(
  value: unknown,
  context: CollectionContext,
  tokenPath?: string,
  tokens?: TokenGroup,
): string {
  // Handle undefined/null values - skip them
  if (value === undefined || value === null) {
    return "";
  }

  // Handle DTCG 1.0 structured values first
  if (isStructuredColorValue(value)) {
    return colorValueToCSS(value);
  }

  if (isStructuredDimensionValue(value)) {
    return dimensionValueToCSS(value);
  }

  // Shadow $value (single or array). The check has to come BEFORE
  // isCompositionValue() because a shadow's `offset` key would otherwise be
  // misread as a focus-ring composition. Single shadows like the elevation
  // levels are objects; multi-shadow tokens (DTCG allows shadow arrays) flatten
  // via comma-join.
  if (Array.isArray(value) && value.every(isStructuredShadowValue)) {
    return value
      .map((s) => shadowValueToCSS(s as Record<string, unknown>))
      .join(", ");
  }
  if (isStructuredShadowValue(value)) {
    return shadowValueToCSS(value);
  }

  // Handle composition type tokens (padding/margin composites) - check BEFORE $value check
  if (isCompositionValue(value)) {
    return compositionValueToCSS(value, context, tokens);
  }

  if (typeof value === "string") {
    // Handle token references like {core.color.blue.500}
    const processedValue = value.replace(
      /\{([^}]+)\}/g,
      (_match: string, refTokenPath: string) => {
        // Check for deprecation warnings
        if (tokens) {
          const deprecation = isTokenDeprecated(tokens, refTokenPath);
          if (deprecation) {
            console.warn(formatDeprecationWarning(refTokenPath, deprecation));
          }
        }

        const cssVar = tokenPathToCSSVar(refTokenPath);
        context.referencedVars.add(cssVar);
        return `var(${cssVar})`;
      },
    );
    return processedValue;
  }

  // Handle legacy DTCG structured values (objects that are token references)
  // But skip if it's a composition (already handled above)
  if (typeof value === "object" && value !== null && "$value" in value) {
    const tokenValue = (value as { $value: unknown }).$value;
    // Recursively process the actual value
    return processTokenValue(tokenValue, context, tokenPath, tokens);
  }

  return String(value);
}

/**
 * Validate that all referenced tokens are defined
 */
function validateReferences(context: CollectionContext): string[] {
  const errors: string[] = [];

  for (const referenced of context.referencedVars) {
    if (!context.definedVars.has(referenced)) {
      errors.push(`Referenced token not found: ${referenced}`);
    }
  }

  return errors;
}

/**
 * Load all brand token files from the brands directory
 */
function loadBrandTokens(): Map<BrandId, BrandOverrides> {
  const brands = new Map<BrandId, BrandOverrides>();
  const brandsDir = PATHS.brandsDir;

  if (!fs.existsSync(brandsDir)) {
    console.log("[tokens] No brands directory found, skipping brand tokens");
    return brands;
  }

  const brandFiles = fs
    .readdirSync(brandsDir)
    .filter((f) => f.endsWith(".tokens.json") && !f.startsWith("_"));

  for (const file of brandFiles) {
    const brandName = file.replace(".tokens.json", "") as BrandId;
    const filePath = path.join(brandsDir, file);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const brandData = JSON.parse(content);

      if (!brandData.$brand) {
        console.warn(
          `[tokens] Brand file ${file} missing $brand metadata, skipping`,
        );
        continue;
      }

      const context: CollectionContext = {
        definedVars: new Set(),
        referencedVars: new Set(),
      };

      const lightVars: Record<string, string> = {};
      const darkVars: Record<string, string> = {};

      // Process brand token overrides (skip $brand metadata)
      processBrandTokens(brandData, [], context, lightVars, darkVars);

      // NOTE: We deliberately do NOT call validateReferences() here. Brand
      // tokens reference core tokens via `{shape.border.style.solid}` etc.,
      // which the global walker emits as `--fsds-core-*` later in the same
      // build. Reference resolution happens at CSS-cascade time via var(),
      // not at build time — so the brand processor's local `definedVars` set
      // (empty at this point) would generate false-positive warnings about
      // every cross-tier ref. The brand block's emitted `var(--fsds-core-*)`
      // calls are validated by the browser at runtime against the @layer core
      // block in the same stylesheet.

      brands.set(brandName, {
        metadata: brandData.$brand,
        lightVars,
        darkVars,
      });

      console.log(
        `[tokens] Loaded brand: ${brandName} (${Object.keys(lightVars).length} overrides)`,
      );
    } catch (error) {
      console.error(`[tokens] Failed to load brand ${file}:`, error);
    }
  }

  return brands;
}

/**
 * Process brand token overrides into CSS variables.
 * Exported for tests; mutates `lightVars` / `darkVars` in place.
 */
export function processBrandTokens(
  obj: Record<string, unknown>,
  pathArr: string[],
  context: CollectionContext,
  lightVars: Record<string, string>,
  darkVars: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue; // Skip metadata

    const currentPath = [...pathArr, key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const valueObj = value as Record<string, unknown>;

      if ("$value" in valueObj || "$type" in valueObj) {
        // This is a token definition
        const tokenValue = valueObj.$value;
        const extensions = valueObj.$extensions as
          | Record<string, unknown>
          | undefined;

        // Build semantic path (brand tokens override semantic layer)
        const semanticPath = `semantic.${currentPath.join(".")}`;
        const cssVar = tokenPathToCSSVar(semanticPath);

        // Process light value
        const lightValue = extensions?.["fsds.light"] || tokenValue;
        if (lightValue !== undefined) {
          const processedLight = processTokenValue(
            lightValue,
            context,
            semanticPath,
            undefined,
          );
          if (processedLight) {
            lightVars[cssVar] = processedLight;
          }
        }

        // Only emit a dark var when an explicit dark extension is provided.
        // Without one, the unconditional [data-brand=...] block already
        // covers dark mode via lightVars; duplicating it bloats CSS.
        const darkValue = extensions?.["fsds.dark"];
        if (darkValue !== undefined) {
          const processedDark = processTokenValue(
            darkValue,
            context,
            semanticPath,
            undefined,
          );
          if (processedDark) {
            darkVars[cssVar] = processedDark;
          }
        }
      } else {
        // Nested group, recurse
        processBrandTokens(valueObj, currentPath, context, lightVars, darkVars);
      }
    }
  }
}

/**
 * Format CSS block for brand selector
 */
function formatBrandBlock(
  brandId: string,
  properties: Record<string, string>,
  indent = "",
): string {
  if (Object.keys(properties).length === 0) return "";

  const lines = Object.entries(properties)
    .map(([prop, value]) => `${indent}    ${prop}: ${value};`)
    .join("\n");

  return `${indent}  [data-brand="${brandId}"] {\n${lines}\n${indent}  }`;
}

/**
 * Generate CSS layers declaration
 */
function generateLayerDeclaration(): string {
  return "/* CSS Cascade Layers - order defines precedence */\n@layer core, semantic, theme, brand, density;";
}

/**
 * Generate brand layer CSS with all brand overrides
 */
function generateBrandLayerCSS(brands: Map<BrandId, BrandOverrides>): string {
  if (brands.size === 0) return "";

  const blocks: string[] = ["@layer brand {"];

  for (const [brandId, overrides] of brands) {
    if (Object.keys(overrides.lightVars).length === 0) continue;

    // The brand named "default" applies unconditionally at :root in
    // addition to its [data-brand="default"] selector. Without this, the
    // "unbranded" page state (no data-brand attribute) resolves brand-
    // dependent semantic tokens (e.g. action.background.primary.default)
    // through the raw core.color.palette.brand.* values — which are the
    // palette's literal hues, not the project's actual brand. The default
    // brand override file IS the source of truth for the project's
    // canonical look, so it must be the unbranded default too.
    if (brandId === "default") {
      const rootProps = Object.entries(overrides.lightVars)
        .map(([p, v]) => `    ${p}: ${v};`)
        .join("\n");
      blocks.push(`  :root {\n${rootProps}\n  }`);
    }

    // Light mode overrides (default)
    const lightBlock = formatBrandBlock(brandId, overrides.lightVars);
    if (lightBlock) {
      blocks.push(lightBlock);
    }

    // Light mode class overrides (for manual .light/data-theme toggle when system prefers dark)
    if (Object.keys(overrides.lightVars).length > 0) {
      const lightProps = Object.entries(overrides.lightVars)
        .map(([p, v]) => `    ${p}: ${v};`)
        .join("\n");
      blocks.push(
        `  .light[data-brand="${brandId}"], .light [data-brand="${brandId}"], [data-theme="light"][data-brand="${brandId}"], [data-theme="light"] [data-brand="${brandId}"] {\n${lightProps}\n  }`,
      );
    }

    // Dark mode overrides within brand
    if (Object.keys(overrides.darkVars).length > 0) {
      const darkBlock = Object.entries(overrides.darkVars)
        .map(([prop, value]) => `      ${prop}: ${value};`)
        .join("\n");

      blocks.push(
        `  @media (prefers-color-scheme: dark) {\n    [data-brand="${brandId}"] {\n${darkBlock}\n    }\n  }`,
      );
      const darkProps = Object.entries(overrides.darkVars)
        .map(([p, v]) => `    ${p}: ${v};`)
        .join("\n");
      blocks.push(
        `  .dark[data-brand="${brandId}"], .dark [data-brand="${brandId}"], [data-theme="dark"][data-brand="${brandId}"], [data-theme="dark"] [data-brand="${brandId}"] {\n${darkProps}\n  }`,
      );

      // Default brand's dark overrides also apply unconditionally so the
      // unbranded page state honors dark theme. Mirrors the :root block
      // added above for light overrides.
      if (brandId === "default") {
        blocks.push(
          `  @media (prefers-color-scheme: dark) {\n    :root {\n${darkBlock}\n    }\n  }`,
        );
        blocks.push(
          `  .dark, [data-theme="dark"] {\n${darkProps}\n  }`,
        );
      }
    }
  }

  blocks.push("}");

  return blocks.join("\n\n");
}

/**
 * Load all density token files from the density directory
 */
function loadDensityTokens(): Map<DensityId, DensityOverrides> {
  const densities = new Map<DensityId, DensityOverrides>();
  const densityDir = PATHS.densityDir;

  if (!fs.existsSync(densityDir)) {
    console.log("[tokens] No density directory found, skipping density tokens");
    return densities;
  }

  const densityFiles = fs
    .readdirSync(densityDir)
    .filter((f) => f.endsWith(".tokens.json") && !f.startsWith("_"));

  for (const file of densityFiles) {
    const densityName = file.replace(".tokens.json", "") as DensityId;
    const filePath = path.join(densityDir, file);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const densityData = JSON.parse(content);

      if (!densityData.$density) {
        console.warn(
          `[tokens] Density file ${file} missing $density metadata, skipping`,
        );
        continue;
      }

      const context: CollectionContext = {
        definedVars: new Set(),
        referencedVars: new Set(),
      };

      const lightVars: Record<string, string> = {};
      const darkVars: Record<string, string> = {};

      // Process density token overrides (skip $density metadata)
      processDensityTokens(densityData, [], context, lightVars, darkVars);

      densities.set(densityName, {
        metadata: densityData.$density,
        lightVars,
        darkVars,
      });

      console.log(
        `[tokens] Loaded density: ${densityName} (${Object.keys(lightVars).length} overrides)`,
      );
    } catch (error) {
      console.error(`[tokens] Failed to load density ${file}:`, error);
    }
  }

  return densities;
}

/**
 * Process density token overrides into CSS variables.
 * Exported for tests; mutates `lightVars` / `darkVars` in place.
 */
export function processDensityTokens(
  obj: Record<string, unknown>,
  pathArr: string[],
  context: CollectionContext,
  lightVars: Record<string, string>,
  darkVars: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue; // Skip metadata

    const currentPath = [...pathArr, key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const valueObj = value as Record<string, unknown>;

      if ("$value" in valueObj || "$type" in valueObj) {
        // This is a token definition
        const tokenValue = valueObj.$value;
        const extensions = valueObj.$extensions as
          | Record<string, unknown>
          | undefined;

        // Build semantic path (density tokens override semantic layer)
        const semanticPath = `semantic.${currentPath.join(".")}`;
        const cssVar = tokenPathToCSSVar(semanticPath);

        // Process light value
        const lightValue = extensions?.["fsds.light"] || tokenValue;
        if (lightValue !== undefined) {
          const processedLight = processTokenValue(
            lightValue,
            context,
            semanticPath,
            undefined,
          );
          if (processedLight) {
            lightVars[cssVar] = processedLight;
          }
        }

        // Only emit a dark var when an explicit dark extension is provided.
        const darkValue = extensions?.["fsds.dark"];
        if (darkValue !== undefined) {
          const processedDark = processTokenValue(
            darkValue,
            context,
            semanticPath,
            undefined,
          );
          if (processedDark) {
            darkVars[cssVar] = processedDark;
          }
        }
      } else {
        // Nested group, recurse
        processDensityTokens(
          valueObj,
          currentPath,
          context,
          lightVars,
          darkVars,
        );
      }
    }
  }
}

/**
 * Format CSS block for density selector
 */
function formatDensityBlock(
  densityId: string,
  properties: Record<string, string>,
  indent = "",
): string {
  if (Object.keys(properties).length === 0) return "";

  const lines = Object.entries(properties)
    .map(([prop, value]) => `${indent}    ${prop}: ${value};`)
    .join("\n");

  return `${indent}  [data-density="${densityId}"] {\n${lines}\n${indent}  }`;
}

/**
 * Generate density layer CSS with all density overrides
 */
function generateDensityLayerCSS(
  densities: Map<DensityId, DensityOverrides>,
): string {
  if (densities.size === 0) return "";

  const blocks: string[] = ["@layer density {"];

  for (const [densityId, overrides] of densities) {
    if (Object.keys(overrides.lightVars).length === 0) continue;

    // Light mode overrides (default)
    const lightBlock = formatDensityBlock(densityId, overrides.lightVars);
    if (lightBlock) {
      blocks.push(lightBlock);
    }

    // Light mode class overrides (for manual .light/data-theme toggle when system prefers dark)
    if (Object.keys(overrides.lightVars).length > 0) {
      const lightProps = Object.entries(overrides.lightVars)
        .map(([p, v]) => `    ${p}: ${v};`)
        .join("\n");
      blocks.push(
        `  .light[data-density="${densityId}"], .light [data-density="${densityId}"], [data-theme="light"][data-density="${densityId}"], [data-theme="light"] [data-density="${densityId}"] {\n${lightProps}\n  }`,
      );
    }

    // Dark mode overrides within density
    if (Object.keys(overrides.darkVars).length > 0) {
      const darkBlock = Object.entries(overrides.darkVars)
        .map(([prop, value]) => `      ${prop}: ${value};`)
        .join("\n");

      blocks.push(
        `  @media (prefers-color-scheme: dark) {\n    [data-density="${densityId}"] {\n${darkBlock}\n    }\n  }`,
      );
      const darkProps = Object.entries(overrides.darkVars)
        .map(([p, v]) => `    ${p}: ${v};`)
        .join("\n");
      blocks.push(
        `  .dark[data-density="${densityId}"], .dark [data-density="${densityId}"], [data-theme="dark"][data-density="${densityId}"], [data-theme="dark"] [data-density="${densityId}"] {\n${darkProps}\n  }`,
      );
    }
  }

  blocks.push("}");

  return blocks.join("\n\n");
}

/**
 * Generate CSS from resolved token tree (used by resolver module).
 *
 * Converts DTCG 1.0 structured token values to CSS custom properties.
 * Handles color conversions, dimension formatting, and reference validation.
 * Supports CSS Cascade Layers and multi-brand theming.
 *
 * @param tokens - Resolved token tree from resolver module
 * @returns Success status of CSS generation
 */
function generateCSSFromTokens(tokens: TokenGroup): boolean {
  const context: CollectionContext = {
    definedVars: new Set(),
    referencedVars: new Set(),
  };

  const maps: ThemeMaps = {
    root: {},
    lightColors: {},
    darkColors: {},
    hasDarkOverride: false,
  };

  // Collect all tokens into CSS variables
  collectTokens(tokens, [], context, maps, tokens);

  // Skip reference validation when using resolver module
  // The resolver module already validates references during resolution
  // and resolves aliases inline, so there are no {token.path} patterns
  // left to validate. The resolver's diagnostics handle missing token warnings.
  // Reference validation is only meaningful for legacy token processing
  // where references remain as {token.path} strings.

  // Load brand tokens
  const brands = loadBrandTokens();

  // Load density tokens
  const densities = loadDensityTokens();

  // Generate CSS content with layers
  const banner = generateBanner("Resolver Module");
  const layerDeclaration = generateLayerDeclaration();

  // Separate core and semantic tokens for layering
  const coreVars: Record<string, string> = {};
  const semanticVars: Record<string, string> = {};

  for (const [cssVar, value] of Object.entries({
    ...maps.root,
    ...maps.lightColors,
  })) {
    if (cssVar.startsWith("--fsds-core-")) {
      coreVars[cssVar] = value;
    } else {
      semanticVars[cssVar] = value;
    }
  }

  // Generate layered CSS blocks
  const coreLayer =
    Object.keys(coreVars).length > 0
      ? `@layer core {\n${formatCSSBlock("  :root", coreVars)}\n}`
      : "";

  const semanticLayer =
    Object.keys(semanticVars).length > 0
      ? `@layer semantic {\n${formatCSSBlock("  :root", semanticVars)}\n}`
      : "";

  // Theme layer for light/dark variants
  const themeLayerContent: string[] = [];

  if (maps.hasDarkOverride) {
    // Dark mode vars for theme layer
    const darkSemanticVars: Record<string, string> = {};
    for (const [cssVar, value] of Object.entries(maps.darkColors)) {
      if (!cssVar.startsWith("--fsds-core-")) {
        darkSemanticVars[cssVar] = value;
      }
    }

    // Light mode vars for theme layer
    const lightSemanticVars: Record<string, string> = {};
    for (const [cssVar, value] of Object.entries(maps.lightColors)) {
      if (!cssVar.startsWith("--fsds-core-")) {
        lightSemanticVars[cssVar] = value;
      }
    }

    if (Object.keys(lightSemanticVars).length > 0) {
      themeLayerContent.push(
        formatCSSBlock(
          '  .light, [data-theme="light"]',
          lightSemanticVars,
        ),
      );
    }

    if (Object.keys(darkSemanticVars).length > 0) {
      themeLayerContent.push(
        formatCSSBlock(
          '  .dark, [data-theme="dark"]',
          darkSemanticVars,
        ),
      );
      themeLayerContent.push(
        `  @media (prefers-color-scheme: dark) {\n${formatCSSBlock("    :root", darkSemanticVars)}\n${formatCSSBlock('    .light, [data-theme="light"]', lightSemanticVars)}\n  }`,
      );
    }
  }

  const themeLayer =
    themeLayerContent.length > 0
      ? `@layer theme {\n${themeLayerContent.join("\n\n")}\n}`
      : "";

  // Brand layer
  const brandLayer = generateBrandLayerCSS(brands);

  // Density layer
  const densityLayer = generateDensityLayerCSS(densities);

  // Combine all blocks
  const content = [
    banner,
    layerDeclaration,
    coreLayer,
    semanticLayer,
    themeLayer,
    brandLayer,
    densityLayer,
    "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Write output file
  writeOutputFile(PATHS.outputCSS, content, "CSS variables with layers");

  // Update cache after file is written
  updateFileCache(PATHS.outputCSS);

  // Log summary
  logSummary({
    totalTokens: context.definedVars.size,
    referencedTokens: context.referencedVars.size,
    generatedFiles: 1,
    errors: 0, // Reference warnings don't count as errors - they're handled at CSS generation time
  });

  console.log(`[tokens] Loaded ${brands.size} brand theme(s)`);
  console.log(`[tokens] Loaded ${densities.size} density mode(s)`);

  // Always return true - reference warnings don't fail the build
  // Unresolved references are converted to CSS var() calls
  return true;
}

/**
 * Check for and use DTCG 1.0 resolver document for CSS generation.
 *
 * Loads resolver document and resolves tokens for the specified theme context.
 * Returns resolved tokens that can be directly converted to CSS.
 *
 * @param theme - Theme context to resolve ('light' or 'dark')
 * @returns Resolved token group for the specified theme, or null if resolver unavailable
 */
function tryResolverDocumentCSSGeneration(
  theme?: "light" | "dark",
): TokenGroup | null {
  const resolverDocPath = path.join(PATHS.srcDir, "resolver.json");

  if (!fs.existsSync(resolverDocPath)) {
    return null; // No resolver document found
  }

  console.log(
    `[tokens] 🔧 Using DTCG 1.0 Resolver Module for ${theme || "default"} theme...`,
  );

  try {
    const resolverDoc = loadResolverDocument(resolverDocPath);
    if (!resolverDoc) {
      console.warn("[tokens] ⚠️  Failed to load resolver document");
      return null;
    }

    const resolver = new Resolver(resolverDoc, {
      basePath: path.dirname(resolverDocPath),
      onWarn: (d) => console.warn(`[resolver] ⚠️  ${d.message}`),
      onError: (d) => console.error(`[resolver] ❌ ${d.message}`),
    });

    // Resolve tokens for specified theme context
    const input: ResolutionInput = {};
    if (theme) input.theme = theme;

    const result = resolver.resolve(input);
    console.log(
      `[tokens] ✅ Resolver CSS generation successful for ${theme || "default"}`,
    );

    return result.tokens as TokenGroup;
  } catch (error) {
    console.error(
      `[tokens] ❌ Resolver CSS generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.log("[tokens] 🔄 Falling back to legacy CSS generation...");
    return null;
  }
}

/**
 * Generate global design tokens CSS.
 *
 * Supports both legacy token processing and DTCG 1.0 Resolver Module.
 * When a resolver document is present, uses resolver module output directly.
 * Otherwise, processes tokens through legacy collection and transformation pipeline.
 *
 * @param incremental - Whether to use incremental building (skip if no changes)
 * @returns Success status of CSS generation
 */
export function generateGlobalTokens(incremental = true): boolean {
  console.log("[tokens] Generating global tokens...");

  // Check for incremental build
  if (incremental) {
    if (!hasFileChanged(PATHS.tokens) && fs.existsSync(PATHS.outputScss)) {
      console.log(
        "[tokens] ⚡ Design tokens unchanged, skipping global generation (incremental build)",
      );
      return true;
    }
  }

  // Try resolver document approach first
  const resolverTokens = tryResolverDocumentCSSGeneration();
  if (resolverTokens) {
    // Generate CSS from resolved tokens
    return generateCSSFromTokens(resolverTokens);
  }

  // Fall back to legacy approach
  console.log("[tokens] 🔄 Using legacy CSS generation...");

  // Read source tokens
  const tokens = readTokenFile(PATHS.tokens);
  if (!tokens) {
    console.error("[tokens] Failed to read design tokens");
    return false;
  }

  // Initialize collection context
  const context: CollectionContext = {
    definedVars: new Set(),
    referencedVars: new Set(),
  };

  // Initialize theme maps
  const maps: ThemeMaps = {
    root: {},
    lightColors: {},
    darkColors: {},
    hasDarkOverride: false,
  };

  // Collect all tokens
  collectTokens(tokens, [], context, maps, tokens);

  // Validate references
  const referenceErrors = validateReferences(context);
  if (referenceErrors.length > 0) {
    console.warn("[tokens] Reference validation warnings:");
    referenceErrors.forEach((error) => console.warn(`  - ${error}`));
  }

  // Load brand tokens
  const brands = loadBrandTokens();

  // Load density tokens
  const densities = loadDensityTokens();

  // Generate CSS content with layers
  const banner = generateBanner(PATHS.tokens);
  const layerDeclaration = generateLayerDeclaration();

  // Separate core and semantic tokens for layering
  const coreVars: Record<string, string> = {};
  const semanticVars: Record<string, string> = {};

  for (const [cssVar, value] of Object.entries({
    ...maps.root,
    ...maps.lightColors,
  })) {
    if (cssVar.startsWith("--fsds-core-")) {
      coreVars[cssVar] = value;
    } else {
      semanticVars[cssVar] = value;
    }
  }

  // Generate layered CSS blocks
  const coreLayer =
    Object.keys(coreVars).length > 0
      ? `@layer core {\n${formatCSSBlock("  :root", coreVars)}\n}`
      : "";

  const semanticLayer =
    Object.keys(semanticVars).length > 0
      ? `@layer semantic {\n${formatCSSBlock("  :root", semanticVars)}\n}`
      : "";

  // Theme layer for light/dark variants
  const themeLayerContent: string[] = [];

  if (maps.hasDarkOverride) {
    // Dark mode vars for theme layer
    const darkSemanticVars: Record<string, string> = {};
    for (const [cssVar, value] of Object.entries(maps.darkColors)) {
      if (!cssVar.startsWith("--fsds-core-")) {
        darkSemanticVars[cssVar] = value;
      }
    }

    // Light mode vars for theme layer
    const lightSemanticVars: Record<string, string> = {};
    for (const [cssVar, value] of Object.entries(maps.lightColors)) {
      if (!cssVar.startsWith("--fsds-core-")) {
        lightSemanticVars[cssVar] = value;
      }
    }

    if (Object.keys(lightSemanticVars).length > 0) {
      themeLayerContent.push(
        formatCSSBlock(
          '  .light, [data-theme="light"]',
          lightSemanticVars,
        ),
      );
    }

    if (Object.keys(darkSemanticVars).length > 0) {
      themeLayerContent.push(
        formatCSSBlock(
          '  .dark, [data-theme="dark"]',
          darkSemanticVars,
        ),
      );
      themeLayerContent.push(
        `  @media (prefers-color-scheme: dark) {\n${formatCSSBlock("    :root", darkSemanticVars)}\n${formatCSSBlock('    .light, [data-theme="light"]', lightSemanticVars)}\n  }`,
      );
    }
  }

  const themeLayer =
    themeLayerContent.length > 0
      ? `@layer theme {\n${themeLayerContent.join("\n\n")}\n}`
      : "";

  // Brand layer
  const brandLayer = generateBrandLayerCSS(brands);

  // Density layer
  const densityLayer = generateDensityLayerCSS(densities);

  // Combine all blocks
  const content = [
    banner,
    layerDeclaration,
    coreLayer,
    semanticLayer,
    themeLayer,
    brandLayer,
    densityLayer,
    "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Write output file
  writeOutputFile(
    PATHS.outputScss,
    content,
    "global design tokens with layers",
  );

  // Update cache after file is written
  updateFileCache(PATHS.outputScss);

  // Log summary
  logSummary({
    totalTokens: context.definedVars.size,
    referencedTokens: context.referencedVars.size,
    generatedFiles: 1,
    errors: 0, // Reference warnings don't count as errors - they're handled at CSS generation time
  });

  console.log(`[tokens] Loaded ${brands.size} brand theme(s)`);
  console.log(`[tokens] Loaded ${densities.size} density mode(s)`);

  // Always return true - reference warnings don't fail the build
  // Unresolved references are converted to CSS var() calls
  return true;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = generateGlobalTokens();
  process.exit(success ? 0 : 1);
}
