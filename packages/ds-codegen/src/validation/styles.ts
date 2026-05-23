/**
 * Contract `styles.json` drift validation (after the tokens/styles
 * convergence, PLAN-TOKENS-STYLES-CONVERGENCE-001).
 *
 * Two invariants:
 *
 *   1. **Namespace rule on `resolvesTo`.** Every `resolvesTo` path in a
 *      styles.json entry must resolve. If the first dotted segment matches
 *      the contract's `cssPrefix`, the path is component-local — it must
 *      name a slot declared in `<Name>.tokens.json`. Otherwise the path
 *      points at the global token graph (`core.*` / `semantic.*`) and is
 *      checked against the composed graph the same way tokens.json
 *      `resolvesTo` is.
 *
 *   2. **Selector-aliasing collisions.** Two distinct top-level keys in
 *      styles.json that expand to the same CSS selector silently overwrite
 *      each other's declarations through the cascade. e.g. a key `hover`
 *      (expands to `.x:hover`) AND a key `:hover` (also `.x:hover`) is an
 *      authoring bug — the author thought they were targeting different
 *      things. We surface it as DRIFT.
 *
 * Doctrinal stance, matching the sibling tokens.ts validator: never
 * modifies anything. Reads the contract and the composed-token-graph
 * cache, returns one ValidationIssue per problem.
 */

import type { ComponentContract, StyleEntry } from "../contract.js";
import { getCssPrefix } from "../contract.js";
import { expandStylesKey } from "../ir.js";
import { loadKnownTokenPaths } from "./tokens.js";
import type { ValidationIssue } from "../validate.js";

/**
 * Validate every `resolvesTo` in `contract.styles` resolves correctly,
 * applying the namespace rule. Returns one issue per failing entry.
 */
export function validateContractStyles(
  contract: ComponentContract,
): ValidationIssue[] {
  const styles = contract.styles;
  if (!styles || typeof styles !== "object") return [];

  const cssPrefix = getCssPrefix(contract);
  const localSlots = new Set(Object.keys(contract.tokens ?? {}));
  const known = loadKnownTokenPaths();
  const issues: ValidationIssue[] = [];

  for (const [selectorKey, block] of Object.entries(styles)) {
    if (!block || typeof block !== "object") continue;
    for (const [property, entry] of Object.entries(
      block as Record<string, StyleEntry>,
    )) {
      if (!entry || typeof entry !== "object") continue;
      const resolvesTo = entry.resolvesTo;
      if (typeof resolvesTo !== "string") continue;
      const firstSegment = resolvesTo.split(".")[0];
      const pointer = `/styles/${escapePointerSegment(selectorKey)}/${escapePointerSegment(property)}/resolvesTo`;

      if (firstSegment === cssPrefix) {
        // Component-local: must match a declared slot.
        if (!localSlots.has(resolvesTo)) {
          issues.push({
            pointer,
            message:
              `references slot "${resolvesTo}" which is not declared in ` +
              `${contract.name}.tokens.json. Declare the slot, or change ` +
              `resolvesTo to reference an existing slot.`,
          });
        }
        continue;
      }

      // Global graph reference. Mirrors validateContractTokens.
      if (known === "missing") {
        issues.push({
          pointer,
          message:
            `cannot validate global token "${resolvesTo}" — token graph not built. ` +
            `Run \`pnpm -F @full-stack-ds/tokens build\` to emit ` +
            `packages/ds-tokens/generated/composed.tokens.json.`,
        });
        continue;
      }
      if (!known.has(resolvesTo)) {
        issues.push({
          pointer,
          message:
            `references global token "${resolvesTo}" which is not defined in ` +
            `the token graph. Author styles.json prefers component-local slot ` +
            `references (paths starting with "${cssPrefix}.") because the slot ` +
            `gives brands a per-component override point. Either add the slot ` +
            `to tokens.json or fix the resolvesTo path.`,
        });
      }
    }
  }

  return issues;
}

/**
 * Detect when two distinct top-level keys in styles.json expand to the
 * same CSS selector. The IR's last-writer-wins on declaration insertion
 * means one key's properties silently overwrite the other's — almost
 * always an authoring bug.
 */
export function validateStylesSelectorCollisions(
  contract: ComponentContract,
): ValidationIssue[] {
  const styles = contract.styles;
  if (!styles || typeof styles !== "object") return [];

  const cssPrefix = getCssPrefix(contract);
  // Mirror the portal-aware selector emission in computeCssBlocks so
  // collision detection sees the same final selectors. Without this
  // the validator would think `[data-popover-content]` and
  // `.popover [data-popover-content]` produce different selectors,
  // when in fact they both collapse to `[data-popover-content]` at
  // emit time for portal-enabled surfaces.
  const portalEnabled = contract.portal?.enabled === true;
  const expandOptions = portalEnabled
    ? { portalContentSelector: `[data-${cssPrefix}-content]` }
    : undefined;
  const seen = new Map<string, string>();
  const issues: ValidationIssue[] = [];

  for (const key of Object.keys(styles)) {
    const selector = expandStylesKey(key, cssPrefix, expandOptions);
    const prior = seen.get(selector);
    if (prior !== undefined && prior !== key) {
      issues.push({
        pointer: `/styles/${escapePointerSegment(key)}`,
        message:
          `selector "${selector}" is also produced by key "${prior}". ` +
          `Two distinct styles.json keys that resolve to the same CSS ` +
          `selector overwrite each other's declarations through the ` +
          `cascade. Pick one canonical form (prefer the shorthand: ` +
          `"hover" over ":hover", "__track" over "track" only when needed ` +
          `to disambiguate).`,
      });
      continue;
    }
    seen.set(selector, key);
  }

  return issues;
}

function escapePointerSegment(seg: string): string {
  return seg.replace(/~/g, "~0").replace(/\//g, "~1");
}
