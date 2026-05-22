/**
 * Design Token Resolver
 *
 * Core logic for resolving design token references with support for
 * themes, platforms, transforms, and fallback chains.
 */

import {
  Resolver,
  loadResolverDocument,
  type ResolutionInput,
} from "./resolver-module";
import type { ResolveContext } from "./types";
import { getNestedValue, selectByKeys } from "./pathUtils";
import { tokenPathToCSSVar } from "../core/index";

/**
 * Apply transformation pipeline to a token value.
 *
 * Runs through all configured transforms that match the current context,
 * allowing for type-specific conversions and custom processing.
 *
 * @param value - The token value to transform
 * @param ctx - Resolution context containing transforms and metadata
 * @returns Transformed value after applying all matching transforms
 */
export function applyTransforms(value: unknown, ctx: ResolveContext): unknown {
  const transforms = ctx.config.transforms ?? [];
  let result = value;

  for (const transform of transforms) {
    if (transform.match(ctx)) {
      result = transform.apply(result, ctx);
    }
  }

  return result;
}

// Default reference pattern for interpolation
export const DEFAULT_REF = /\{([^}]+)\}/g;

/**
 * Resolves interpolated strings with embedded references and fallbacks
 */
export function resolveInterpolated(
  input: string,
  fallback: string,
  ctx: ResolveContext,
  visited: string[],
): string {
  const parts = input
    .split(ctx.config.fallbackDelimiter ?? "||")
    .map((s) => s.trim());

  // If reference mode with fallback chain enabled, always build fallback chains
  // regardless of whether tokens exist or not
  if (
    ctx.config.resolveToReferences !== false &&
    (ctx.config.emitVarFallbackChain ?? true) &&
    parts.length > 1
  ) {
    const pattern = ctx.config.referencePattern ?? DEFAULT_REF;
    const systemPrefix = ctx.config.systemTokenPrefix ?? "--";

    // Process each part to handle interpolation within it
    const processedParts = parts.map((part) => {
      // If the part contains references, replace them with var() calls
      if (pattern.test(part)) {
        return part.replace(pattern, (match, path) => {
          return `var(${tokenPathToCSSVar(path, systemPrefix)})`;
        });
      }
      return part;
    });

    // For interpolated strings, build nested fallbacks manually
    let result = processedParts[processedParts.length - 1];
    for (let i = processedParts.length - 2; i >= 0; i--) {
      const current = processedParts[i];
      // Check if current part has var() calls that need fallbacks
      if (current.includes("var(--")) {
        // Replace each var() with a fallback version
        result = current.replace(/var\((--[^)]+)\)/g, (match, varName) => {
          return `var(${varName}, ${result})`;
        });
      } else {
        result = current;
      }
    }
    return result;
  }

  // Fallback to original logic for non-reference mode or when fallback chains are disabled
  for (const candidate of parts) {
    try {
      const resolved = candidate.replace(
        ctx.config.referencePattern ?? DEFAULT_REF,
        (match, path) => {
          const v = resolvePath(path, ctx, visited);
          if (v == null) throw new Error(`Unresolved ${path}`);
          return String(v);
        },
      );
      // If no unresolved references remain, return the resolved value
      if (!resolved.match(ctx.config.referencePattern ?? DEFAULT_REF)) {
        return resolved;
      }
    } catch {
      // Continue to next fallback candidate
      continue;
    }
  }

  // All candidates failed → use provided fallback literal
  ctx.config.onWarn?.({
    code: "UNRESOLVED_FALLBACK",
    path: ctx.path,
    message: `Could not resolve any fallback for: ${input}`,
    hint: "Check that all referenced tokens exist and are accessible",
  });
  return fallback;
}

/**
 * Enhanced path resolution with theme/mode/platform support and aliases.
 *
 * Supports both legacy token resolution and DTCG 1.0 Resolver Module.
 * When resolverDocumentPath is configured, uses the new resolver module.
 *
 * @param path - Token path to resolve (e.g., "color.primary.base")
 * @param ctx - Resolution context with theme, platform, config, etc.
 * @param visited - Array of already visited paths (for cycle detection)
 * @returns Resolved token value or CSS variable reference
 *
 * @example
 * ```typescript
 * const value = resolvePath("color.primary.base", {
 *   theme: "light",
 *   tokens: myTokens,
 *   config: { resolveToReferences: true }
 * }, []);
 * ```
 */
export function resolvePath(
  path: string,
  ctx: ResolveContext,
  visited: string[],
): unknown {
  // Check if we should use the DTCG 1.0 Resolver Module
  if (ctx.config.resolverDocumentPath) {
    try {
      const resolverDoc = loadResolverDocument(ctx.config.resolverDocumentPath);
      if (resolverDoc) {
        const resolver = new Resolver(resolverDoc, {
          basePath: ctx.config.resolverDocumentPath.replace(/[^/]+$/, ""),
          onWarn: ctx.config.onWarn,
          onError: ctx.config.onError,
          strict: ctx.config.strict,
        });

        // Build input from context
        const input: ResolutionInput = {};
        if (ctx.theme) input.theme = ctx.theme;
        if (ctx.brand) input.brand = ctx.brand;
        if (ctx.platform) input.platform = ctx.platform;

        const result = resolver.resolve(input);

        // Extract value from resolved tokens
        const value = getNestedValue(result.tokens, path);
        if (value !== undefined) {
          // Apply transforms if configured
          const transformed = applyTransforms(value, ctx);

          // If resolveToReferences is true, return CSS custom property reference
          if (ctx.config.resolveToReferences !== false) {
            const systemPrefix = ctx.config.systemTokenPrefix ?? "--";
            const cssVarName = ctx.config.referenceNamespace
              ? ctx.config.referenceNamespace(path)
              : tokenPathToCSSVar(path, systemPrefix);
            return `var(${cssVarName})`;
          }

          return transformed;
        }

        // Fall through to legacy resolver if path not found
        ctx.config.onWarn?.({
          code: "MISSING",
          path,
          message: "Token path not found in resolver document",
          hint: "Verify the token path exists in your resolver document",
        });
      }
    } catch {
      ctx.config.onWarn?.({
        code: "UNRESOLVED_FALLBACK",
        path,
        message: `Could not resolve any fallback for: ${path}`,
        hint: "Falling back to legacy resolver",
      });
    }
  }

  // Legacy resolver logic
  const key = `@${ctx.theme}|${ctx.platform}|${ctx.brand}|${path}`;
  const cache = ctx.config.cache;
  if (cache?.has(key)) return cache.get(key)!;

  if (visited.includes(path)) {
    ctx.config.onWarn?.({
      code: "CIRCULAR",
      path,
      message: "Circular reference detected",
      hint: "Check for circular dependencies in token definitions",
    });
    return null;
  }

  if (visited.length >= (ctx.config.maxDepth ?? 32)) {
    ctx.config.onError?.({
      code: "DEPTH_EXCEEDED",
      path,
      message: `Maximum resolution depth exceeded (${ctx.config.maxDepth ?? 32})`,
      hint: "Check for deeply nested or infinite token references",
    });
    return null;
  }

  visited.push(path);

  const node = getNestedValue(ctx.tokens, path);
  if (node == null) {
    // In reference mode, emit a CSS var reference rather than failing. This
    // allows late-bound BYODS overrides without flooding warnings.
    if (ctx.config.resolveToReferences !== false) {
      const systemPrefix = ctx.config.systemTokenPrefix ?? "--";
      const cssVarName = ctx.config.referenceNamespace
        ? ctx.config.referenceNamespace(path)
        : tokenPathToCSSVar(path, systemPrefix);
      visited.pop();
      return `var(${cssVarName})`;
    }

    ctx.config.onWarn?.({
      code: "MISSING",
      path,
      message: "Token path not found",
      hint: "Verify the token path exists in your design tokens",
    });
    visited.pop();
    return null;
  }

  // Prefer W3C structure
  const valueNode =
    typeof node === "object" &&
    node &&
    "$value" in (node as Record<string, unknown>)
      ? (node as Record<string, unknown>).$value
      : node;

  // Theme/platform/brand selection
  let raw = valueNode;
  if (raw && typeof raw === "object") {
    const themed = selectByKeys(raw as Record<string, unknown>, [
      ctx.brand,
      ctx.theme,
      ctx.platform,
    ]);
    raw = themed ?? raw;
  }

  // $extensions-based overrides (e.g., fsds.dark -> "{core.color.light}")
  if (typeof node === "object" && node) {
    const ext = (node as Record<string, unknown>)["$extensions"];
    if (ext && typeof ext === "object") {
      const extObj = ext as Record<string, unknown>;
      const theme = ctx.theme;
      const extensionKeys = theme
        ? [
            `fsds.${theme}`,
            `design.tokens.modes.${theme}`,
            `modes.${theme}`,
            `theme.${theme}`,
          ]
        : [];
      for (const k of extensionKeys) {
        if (k in extObj) {
          const extVal = extObj[k];
          if (typeof extVal === "string") {
            // Allow extVal to be a reference string
            raw = extVal;
          }
          break;
        }
      }
    }
  }

  let out = raw;

  // Alias support: $alias: "semantic.color.bg.primary"
  if (
    typeof node === "object" &&
    node &&
    "$alias" in (node as Record<string, unknown>)
  ) {
    out = resolvePath(
      (node as Record<string, unknown>).$alias as string,
      ctx,
      visited,
    );
  }

  // String with embedded references
  if (
    typeof out === "string" &&
    (ctx.config.referencePattern ?? DEFAULT_REF).test(out)
  ) {
    out = resolveInterpolated(out, String(out), ctx, visited);
  }

  // Apply transforms by $type or path
  const $type =
    typeof node === "object" && node
      ? ((node as Record<string, unknown>).$type as string)
      : undefined;

  let next = applyTransforms(out, { ...ctx, node, path, type: $type });

  // If resolveToReferences is true, return CSS custom property reference instead of resolved value
  if (ctx.config.resolveToReferences !== false) {
    const systemPrefix = ctx.config.systemTokenPrefix ?? "--";
    const cssVarName = ctx.config.referenceNamespace
      ? ctx.config.referenceNamespace(path)
      : tokenPathToCSSVar(path, systemPrefix);
    next = `var(${cssVarName})`;
  }

  cache?.set(key, String(next));
  visited.pop();
  return next;
}
