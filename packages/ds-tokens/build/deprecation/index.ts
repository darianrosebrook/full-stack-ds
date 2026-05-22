/**
 * Design Token Deprecation System
 *
 * Provides warnings and migration guidance for deprecated tokens
 */

import type { TokenGroup, TokenValue } from "../build/core/index";

export interface DeprecationInfo {
  tokenPath: string;
  deprecated: boolean;
  deprecatedDate?: string;
  removalDate?: string;
  replacement?: string;
  reason?: string;
}

/**
 * Extract deprecation info from token
 */
function extractDeprecationInfo(
  tokenPath: string,
  token: TokenValue,
): DeprecationInfo | null {
  const extensions = token.$extensions as Record<string, unknown> | undefined;
  const designExt = extensions?.design as Record<string, unknown> | undefined;

  if (!designExt?.deprecated) {
    return null;
  }

  return {
    tokenPath,
    deprecated: true,
    deprecatedDate: designExt.deprecatedDate as string | undefined,
    removalDate: designExt.removalDate as string | undefined,
    replacement: designExt.replacement as string | undefined,
    reason: designExt.reason as string | undefined,
  };
}

/**
 * Find all deprecated tokens in token tree
 */
export function findDeprecatedTokens(
  tokens: TokenGroup,
  prefix = "",
  result: DeprecationInfo[] = [],
): DeprecationInfo[] {
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith("$")) continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object") {
      if ("$value" in value) {
        const deprecation = extractDeprecationInfo(
          currentPath,
          value as TokenValue,
        );
        if (deprecation) {
          result.push(deprecation);
        }
      } else {
        findDeprecatedTokens(value as TokenGroup, currentPath, result);
      }
    }
  }

  return result;
}

/**
 * Check if token is deprecated
 */
export function isTokenDeprecated(
  tokens: TokenGroup,
  tokenPath: string,
): DeprecationInfo | null {
  const parts = tokenPath.split(".");
  let current: TokenGroup | TokenValue = tokens;

  for (const part of parts) {
    if (
      current &&
      typeof current === "object" &&
      !("$value" in current) &&
      part in current
    ) {
      current = (current as TokenGroup)[part] as TokenGroup | TokenValue;
    } else {
      return null;
    }
  }

  if (current && typeof current === "object" && "$value" in current) {
    return extractDeprecationInfo(tokenPath, current as TokenValue);
  }

  return null;
}

/**
 * Generate deprecation warning message
 */
export function formatDeprecationWarning(
  tokenPath: string,
  deprecation: DeprecationInfo,
): string {
  const parts: string[] = [`⚠️  Deprecated token: ${tokenPath}`];

  if (deprecation.replacement) {
    parts.push(`   Replacement: ${deprecation.replacement}`);
  }

  if (deprecation.deprecatedDate) {
    parts.push(`   Deprecated: ${deprecation.deprecatedDate}`);
  }

  if (deprecation.removalDate) {
    const removalDate = new Date(deprecation.removalDate);
    const now = new Date();
    if (removalDate < now) {
      parts.push(`   ⛔ REMOVAL DATE PASSED: ${deprecation.removalDate}`);
    } else {
      parts.push(`   Removal planned: ${deprecation.removalDate}`);
    }
  }

  if (deprecation.reason) {
    parts.push(`   Reason: ${deprecation.reason}`);
  }

  return parts.join("\n");
}

/**
 * Validate deprecation dates
 */
export function validateDeprecations(deprecations: DeprecationInfo[]): {
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const now = new Date();

  for (const dep of deprecations) {
    if (!dep.deprecated) continue;

    if (dep.removalDate) {
      const removalDate = new Date(dep.removalDate);
      if (removalDate < now) {
        errors.push(
          `Token ${dep.tokenPath} has passed its removal date (${dep.removalDate})`,
        );
      } else {
        const daysUntilRemoval = Math.ceil(
          (removalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysUntilRemoval <= 30) {
          warnings.push(
            `Token ${dep.tokenPath} will be removed in ${daysUntilRemoval} days`,
          );
        }
      }
    }

    if (!dep.replacement) {
      warnings.push(
        `Deprecated token ${dep.tokenPath} has no replacement specified`,
      );
    }
  }

  return { warnings, errors };
}
