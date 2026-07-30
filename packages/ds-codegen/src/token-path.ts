/**
 * The single authority for lowering a dotted design-token path into the
 * character form used inside its CSS custom-property name.
 *
 * Two independent lowerings used to exist and disagreed: codegen replaced
 * dots and preserved casing, while the token build also kebab-cased. A
 * contract resolving to `semantic.shape.control.border.defaultWidth` was
 * therefore emitted as a read of `--fsds-semantic-shape-control-border-defaultWidth`
 * while the token graph declared `--fsds-semantic-shape-control-border-default-width`.
 * The names never met, so the read silently fell through to the `var()`
 * fallback literal — invisible to every gate until the token-resolvability
 * rail was built to look for exactly this.
 *
 * Repairing one side to match the other would have left the seam intact for
 * the next divergence. Both sides now call this function, so agreement is a
 * property of the code rather than of two comments each claiming authority.
 *
 * ## Why this module lives in ds-codegen rather than ds-tokens
 *
 * ds-codegen compiles with `tsc` under `rootDir: "src"`, so it cannot import
 * source from a sibling package. ds-tokens runs its build through `tsx`, so it
 * can import this module as source. The dependency therefore has exactly one
 * viable direction. The naming convention itself is layer-neutral: it is a
 * character transformation, not a token-graph or codegen concern.
 *
 * Namespace handling (deciding whether a bare `spacing.size.04` belongs under
 * `core-`) is deliberately NOT here. That is a token-graph question, it applies
 * only to unprefixed paths, and its heuristics collide with component-scoped
 * slot names — `icon.size.md` is a slot on the Icon component, not a core token.
 */

/**
 * Lower the segments of a dotted token path: dots and separators become
 * hyphens, camelCase humps become hyphenated lowercase, and anything that
 * cannot appear in a custom-property name is dropped.
 *
 *   "semantic.shape.control.border.defaultWidth"
 *     → "semantic-shape-control-border-default-width"
 */
export function lowerTokenPath(tokenPath: string): string {
  return tokenPath
    .replace(/\./g, "-")
    .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())
    .replace(/[\s_]/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/**
 * Lower a dotted token path into its CSS custom-property slug, prefixed with
 * the project namespace. Callers prepend `--` (e.g. `--${tokenSlug(...)}`) so
 * the IR never carries the leading dashes.
 *
 *   "semantic.color.fg" → "fsds-semantic-color-fg"
 */
export function tokenSlug(tokenPath: string): string {
  return `fsds-${lowerTokenPath(tokenPath)}`;
}
