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

// ---------------------------------------------------------------------------
// Fallback-divergence advisory (FALLBACK-DIVERGENCE-01)
// ---------------------------------------------------------------------------

/**
 * Canonicalize a fallback literal so unit-equivalent values compare equal.
 * - `16px` and `1rem` (at default 16px root) are equal.
 * - Hex is lowercased.
 * - Whitespace is collapsed and trimmed.
 *
 * This prevents false positives: of 30 measured corpus divergences, 2 are
 * pure unit-equivalence (`semantic.typography.body.02` 16px vs 1rem;
 * `semantic.typography.caption.01` 14px vs 0.875rem) that should NOT fire.
 */
function canonicalizeFallback(literal: string): string {
  let v = literal.trim().replace(/\s+/g, " ");
  // rem → px at default 16px root. Matches whole-token rem values (1rem, 0.875rem).
  const remMatch = v.match(/^(-?\d+(?:\.\d+)?)rem$/);
  if (remMatch) {
    const px = Math.round(parseFloat(remMatch[1]!) * 16);
    v = `${px}px`;
  }
  // Lowercase hex colors (#D9292B → #d9292b) so case drift doesn't diverge.
  if (/^#[0-9a-fA-F]+$/.test(v)) v = v.toLowerCase();
  return v;
}

/**
 * A single (contract, sidecar, block, slot) site that reads a token with a
 * fallback. Used by the divergence pass to report WHERE each distinct literal
 * comes from.
 */
interface FallbackSite {
  contract: string;
  slot: string;
  block: string; // "<root>" for tokens.json, selector key for styles.json
  fallback: string; // the raw (non-canonicalized) literal, for the report
}

/**
 * Collect every (token → canonical fallback literal) reading across the whole
 * corpus, with the sites that produced each literal. A token diverges when its
 * canonical-literal set has more than one entry.
 *
 * Corpus-wide: this is why the function takes the full `allContracts` map
 * rather than a single contract — divergence is a cross-contract property
 * (e.g. core.spacing.size.05 resolves to 12px in 13 components and 16px in
 * others), and a per-contract check would miss it entirely.
 */
function collectCorpusFallbackReadings(
  allContracts: ReadonlyMap<string, ComponentContract>,
): Map<string, { canonical: string; sites: FallbackSite[] }[]> {
  const tokenToLiterals = new Map<string, Map<string, FallbackSite[]>>();

  for (const [name, contract] of allContracts) {
    const record = (
      resolvesTo: string,
      fallback: string,
      slot: string,
      block: string,
    ) => {
      const canonical = canonicalizeFallback(fallback);
      let litMap = tokenToLiterals.get(resolvesTo);
      if (!litMap) {
        litMap = new Map();
        tokenToLiterals.set(resolvesTo, litMap);
      }
      let sites = litMap.get(canonical);
      if (!sites) {
        sites = [];
        litMap.set(canonical, sites);
      }
      sites.push({ contract: name, slot, block, fallback });
    };

    const tokens = contract.tokens;
    if (tokens && typeof tokens === "object") {
      for (const [slot, entry] of Object.entries(tokens)) {
        if (!entry || typeof entry !== "object") continue;
        const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
        const fallback = (entry as { fallback?: unknown }).fallback;
        if (typeof resolvesTo !== "string" || typeof fallback !== "string" || !fallback) continue;
        record(resolvesTo, fallback, slot, "<root>");
      }
    }

    const styles = contract.styles;
    if (styles && typeof styles === "object") {
      for (const [selector, block] of Object.entries(styles)) {
        if (!block || typeof block !== "object") continue;
        for (const [property, entry] of Object.entries(
          block as Record<string, unknown>,
        )) {
          if (!entry || typeof entry !== "object") continue;
          const resolvesTo = (entry as { resolvesTo?: unknown }).resolvesTo;
          const fallback = (entry as { fallback?: unknown }).fallback;
          if (typeof resolvesTo !== "string" || typeof fallback !== "string" || !fallback) continue;
          record(resolvesTo, fallback, property, selector);
        }
      }
    }
  }

  // Project to the divergent-only shape the caller wants.
  const out = new Map<string, { canonical: string; sites: FallbackSite[] }[]>();
  for (const [token, litMap] of tokenToLiterals) {
    if (litMap.size < 2) continue; // no divergence
    out.set(token, [...litMap.values()].map((sites) => ({
      canonical: canonicalizeFallback(sites[0]!.fallback),
      sites,
    })));
  }
  return out;
}

/**
 * Corpus-wide fallback-divergence advisory. Returns a formatted advisory
 * string per divergent token (NOT ValidationIssue[] — these are advisory and
 * must NOT fail the build; the CLI prints them via console.warn). Returns an
 * empty array when there is no divergence or when `allContracts` is absent.
 *
 * Each advisory names the token, its distinct canonical literals, and the
 * sites (contract + block + slot) producing each — enough to adjudicate
 * whether the divergence is intentional (per-component safe-default) or a
 * stale-palette residue bug.
 *
 * Posture: advisory only this slice (FALLBACK-DIVERGENCE-01), mirroring the
 * dead-slot audit. The Class-2 stale-palette cases are repaired alongside
 * this gate; the ~25 Class-3 semantic-inconsistency cases are surfaced for
 * per-token adjudication in a follow-up.
 */
export function collectFallbackDivergenceAdvisories(
  allContracts?: ReadonlyMap<string, ComponentContract>,
): string[] {
  if (!allContracts || allContracts.size === 0) return [];
  const divergent = collectCorpusFallbackReadings(allContracts);
  const advisories: string[] = [];
  for (const [token, literals] of [...divergent.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const literalSummary = literals
      .map((l) => `${l.canonical} (${l.sites.length} site${l.sites.length === 1 ? "" : "s"})`)
      .join(" vs ");
    advisories.push(
      `[FALLBACK_DIVERGENT] token "${token}" resolves to ${literals.length} distinct ` +
        `fallback literals: ${literalSummary}. Sites:\n` +
        literals
          .flatMap((l) =>
            l.sites.map(
              (s) => `    ${l.canonical}  <- ${s.contract} / ${s.block} / ${s.slot}`,
            ),
          )
          .join("\n"),
    );
  }
  return advisories;
}
