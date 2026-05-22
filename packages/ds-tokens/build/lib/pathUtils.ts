/**
 * Path Utilities for Design Tokens
 *
 * Shared utility functions for navigating nested token structures.
 * @author @darianrosebrook
 */

/**
 * Get nested object value by dot-separated path
 *
 * Safely navigates through nested objects using a dot-notation path string.
 * Returns undefined if any segment in the path doesn't exist.
 *
 * @param obj - The object to navigate
 * @param path - Dot-separated path (e.g., "color.primary.base")
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * ```typescript
 * const tokens = { color: { primary: { base: '#000' } } };
 * const value = getNestedValue(tokens, 'color.primary.base'); // '#000'
 * const missing = getNestedValue(tokens, 'color.secondary'); // undefined
 * ```
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split('.').reduce((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Select value from object by trying multiple keys in order
 *
 * Useful for theme/platform/brand selection where multiple keys
 * might exist and we want the first match.
 *
 * @param obj - The object to search
 * @param keys - Array of keys to try in order
 * @returns The value of the first matching key, or undefined
 *
 * @example
 * ```typescript
 * const themed = { light: '#fff', dark: '#000' };
 * const value = selectByKeys(themed, ['dark', 'light']); // '#000'
 * ```
 */
export function selectByKeys(
  obj: Record<string, unknown>,
  keys: (string | undefined)[]
): unknown {
  for (const key of keys) {
    if (key && key in obj) {
      return obj[key];
    }
  }
  return undefined;
}
