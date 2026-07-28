/**
 * Fallback-completeness validation.
 *
 * The invariant: every contract slot that declares `resolvesTo` MUST also
 * declare `fallback`. The codegen emits `var(--ref, fallback)` only when
 * `fallback` is present (ir.ts renders the declaration string from the
 * sidecar fields verbatim — `var(--ref)` when fallback is absent). Without
 * a fallback, the property silently drops to its initial value the moment
 * the referenced token is unavailable (tokens.css absent, brand override
 * removes it, density layer doesn't define it). That is the defect class
 * this gate catches: a Button variant that renders with no background
 * because `--fsds-semantic-color-action-background-primary-default` wasn't
 * defined in the active theme.
 *
 * Scope: wide. The rule applies to every `resolvesTo` entry in BOTH
 * `contract.tokens` (TokenResolution) and `contract.styles` (StyleEntry,
 * across every selector block). Component-local slot redirections are NOT
 * exempt — the cascade-chain argument ("the slot's own fallback in
 * tokens.json covers it") does not hold at a variant scope where the slot
 * has been re-pointed at a different global token. The discipline is
 * universal because the failure mode is universal.
 *
 * The companion corpus repair (this slice, Phase 2) backfills `fallback`
 * on every existing resolvesTo entry by resolving the real value from the
 * composed token graph, so the fallback is the literal the ref would have
 * resolved to — a component renders identically with the token sheet
 * loaded or absent. This is the QDS universal-fallback discipline, enforced
 * once at the contract layer where the codegen can guarantee it across all
 * five frameworks, rather than hoped-for per variant file.
 *
 * Failure shape: one `[FALLBACK_MISSING]`-prefixed ValidationIssue per
 * offending slot, with a JSON pointer to the entry. The CLI treats every
 * issue as a hard error (cli.ts:560-563 sets hasErrors on any non-empty
 * drift array).
 */

import type { ComponentContract } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

/**
 * Validate that every `resolvesTo` slot in `contract.tokens` and
 * `contract.styles` carries a `fallback`. Returns one issue per offender.
 *
 * Pure-shape: no I/O, no token-graph dependency. Runs before the
 * token-graph validators (validateContractTokens / validateContractStyles)
 * so a missing fallback is reported independently of whether the ref path
 * itself is valid — two distinct defect classes.
 */
export function validateContractFallbackCompleteness(
  contract: ComponentContract,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // --- contract.tokens side (TokenResolution entries) ---
  const tokens = contract.tokens;
  if (tokens && typeof tokens === "object") {
    for (const [slotName, entry] of Object.entries(tokens)) {
      if (!entry || typeof entry !== "object") continue;
      const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
      if (typeof resolvesTo !== "string") continue; // literal-only or empty: out of scope
      const fallback = (entry as { fallback?: unknown }).fallback;
      if (typeof fallback === "string" && fallback.length > 0) continue;
      issues.push({
        pointer: `/tokens/${escapePointerSegment(slotName)}`,
        message:
          `[FALLBACK_MISSING] slot "${slotName}" declares resolvesTo ` +
          `"${resolvesTo}" without a fallback. The codegen emits var(--ref) ` +
          `with no second argument, so the property drops to its initial ` +
          `value when the token is unavailable. Add a "fallback" field whose ` +
          `value is the real resolved literal (run the corpus-repair script ` +
          `under tmp/ for a mechanical fix across all contracts).`,
      });
    }
  }

  // --- contract.styles side (StyleEntry entries, per selector block) ---
  const styles = contract.styles;
  if (styles && typeof styles === "object") {
    for (const [selectorKey, block] of Object.entries(styles)) {
      if (!block || typeof block !== "object") continue;
      for (const [property, entry] of Object.entries(
        block as Record<string, unknown>,
      )) {
        if (!entry || typeof entry !== "object") continue;
        const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
        if (typeof resolvesTo !== "string") continue;
        const fallback = (entry as { fallback?: unknown }).fallback;
        if (typeof fallback === "string" && fallback.length > 0) continue;
        issues.push({
          pointer:
            `/styles/${escapePointerSegment(selectorKey)}/` +
            `${escapePointerSegment(property)}`,
          message:
            `[FALLBACK_MISSING] styles "${selectorKey}" redefines slot ` +
            `"${property}" with resolvesTo "${resolvesTo}" but no fallback. ` +
          `The variant/state scope does not inherit the slot's own fallback ` +
            `from tokens.json — the re-pointed ref is unguarded here. Add a ` +
            `"fallback" field whose value is the real resolved literal.`,
        });
      }
    }
  }

  return issues;
}

/** RFC 6901 escape: `/` → `~1`, `~` → `~0`. Slot names contain `.` (fine). */
function escapePointerSegment(seg: string): string {
  return seg.replace(/~/g, "~0").replace(/\//g, "~1");
}
