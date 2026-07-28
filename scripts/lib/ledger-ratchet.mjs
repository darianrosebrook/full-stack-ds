/**
 * Two-directional ledger ratchet — shared by the styling-realization audits
 * (RAIL-STYLING-REALIZATION-LEDGERS-01).
 *
 * The mechanism is lifted from `scripts/a11y-realization-audit/audit.mjs`,
 * which proved it across three burn-down campaigns (213 → 181 → 156). It is
 * factored here rather than copied a third and fourth time: the identity keys
 * differ per audit, but the ratchet does not, and two divergent copies of a
 * gate is how a gate quietly stops meaning the same thing in both places.
 *
 * The invariant it enforces — "the ledger only shrinks truthfully" — needs
 * BOTH directions:
 *
 *   unledgered = current − ledger   a finding nobody has accounted for.
 *                                   Without this, new debt lands silently.
 *   stale      = ledger − current   a ledger entry that no longer reproduces.
 *                                   Without this, burned debt stays on the
 *                                   books and the count overstates the work
 *                                   remaining — the ledger rots into fiction.
 *
 * This is deliberately stricter than the count-based ratchet in
 * `packages/ds-tokens/build/runners/usage.ts`, which compares totals against a
 * baseline and tolerates stale entries. A count floor cannot tell you WHICH
 * item regressed, and it silently permits swapping one defect for another.
 */

import { existsSync, readFileSync } from "node:fs";

/**
 * Load and validate a ledger file.
 *
 * Every entry must carry each of `requiredFields` as a non-empty string. `spec`
 * and `note` are required of every ledger regardless of audit: an entry that
 * names no owning spec is untracked debt, and one that records no reason is
 * un-adjudicatable later — the reader cannot tell an intentional deferral from
 * an oversight. A missing file yields an empty ledger so a fresh audit reports
 * every finding as unledgered rather than silently passing.
 */
export function loadLedger(ledgerPath, requiredFields) {
  if (!existsSync(ledgerPath)) return [];
  const parsed = JSON.parse(readFileSync(ledgerPath, "utf-8"));
  if (!Array.isArray(parsed.gaps)) {
    throw new Error(`${ledgerPath} must be { gaps: [...] }`);
  }
  const fields = [...requiredFields, "spec", "note"];
  for (const entry of parsed.gaps) {
    for (const field of fields) {
      if (typeof entry[field] !== "string" || entry[field].length === 0) {
        throw new Error(
          `${ledgerPath} entry missing required "${field}": ${JSON.stringify(entry)}`,
        );
      }
    }
  }
  return parsed.gaps;
}

/**
 * Diff current findings against the ledger. Pure — no I/O, no process exit —
 * so the selfchecks can drive it with fixtures.
 */
export function diffLedger({ current, ledger, idOf }) {
  const ledgerIds = new Set(ledger.map(idOf));
  const currentIds = new Set(current.map(idOf));
  return {
    unledgered: current.filter((row) => !ledgerIds.has(idOf(row))),
    stale: ledger.filter((entry) => !currentIds.has(idOf(entry))),
  };
}

/**
 * Print the verdict and return the intended exit code. Returns rather than
 * exits so callers stay testable; the audit's main block does the exiting.
 */
export function reportRatchet({ label, current, unledgered, stale, idOf }) {
  const ledgered = current.length - unledgered.length;
  console.log(
    `[${label}] findings=${current.length} (ledgered=${ledgered}) unledgered=${unledgered.length} stale=${stale.length}`,
  );

  if (unledgered.length > 0) {
    console.error(`\n[${label}] FAIL — ${unledgered.length} UNLEDGERED finding(s):`);
    for (const row of unledgered) console.error(`  ${idOf(row)}`);
    console.error(
      "\nFix the finding, or (in review) add a ledger entry naming the owning spec and why it is deferred.",
    );
  }

  if (stale.length > 0) {
    console.error(
      `\n[${label}] FAIL — ${stale.length} STALE ledger entr(ies) (no longer reproduce — delete them):`,
    );
    for (const entry of stale) console.error(`  ${idOf(entry)} (spec ${entry.spec})`);
  }

  if (unledgered.length > 0 || stale.length > 0) return 1;
  console.log(`[${label}] PASS — every finding is ledgered; no stale entries.`);
  return 0;
}
