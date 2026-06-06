#!/usr/bin/env node
/**
 * VARIANT-STYLE-REALIZATION-AUDIT-01 — locked discriminator test.
 *
 * Locks the audit's classification on REAL contracts/CSS:
 *   - Batch 1 (VARIANT-STYLE-VAR-RESCOPE-BATCH-01) realized Spinner.thickness,
 *     Stat.trend and Select.size via var-rescope/consuming selectors — those
 *     three axes are now fully realized (regression lock for the fix);
 *   - the canary remainder (Spinner.size/variant) is still flagged: a visual
 *     variant axis with styling intent but no consuming `.prefix--value` selector
 *     (Spinner.size → Batch 2; Spinner.variant → contract decision);
 *   - a fully-realized component (Button: `.button--primary` etc. scope vars in
 *     tokens.css) is NOT flagged (false-positive control);
 *   - a behavioral axis (Calendar `mode`, NavList `orientation`) has no styling
 *     intent and is NOT flagged (behavioral false-positive control).
 *
 * Standalone (named *.test.mjs → exempt from the shortcut-language guard).
 * Run: node scripts/variant-style-audit/realization.test.mjs
 */
import assert from "node:assert/strict";
import { classify } from "./audit.mjs";

let pass = 0;
let fail = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok  ${name}`);
    pass++;
  } catch (e) {
    console.error(`  XX  ${name}: ${e.message}`);
    fail++;
  }
};
const dim = (c, d) => classify(c).dims.find((x) => x.dim === d);

console.log("Batch 1 (VARIANT-STYLE-VAR-RESCOPE-BATCH-01) — var-rescope axes now realized:");
for (const [c, d] of [["Spinner", "thickness"], ["Stat", "trend"], ["Select", "size"]]) {
  check(`${c}.${d} is fully realized (every value has a consuming selector)`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.gaps.length, 0, `unexpected gaps: ${JSON.stringify(x.gaps)}`);
    assert.equal(x.realizedCount, x.total, `realizedCount=${x.realizedCount} of ${x.total}`);
  });
}

console.log("\ncanary remainder — Spinner.size/variant still unrealized (Batch 2 + contract decision):");
for (const d of ["size", "variant"]) {
  check(`Spinner.${d} is still an unrealized axis`, () => {
    const x = dim("Spinner", d);
    assert.ok(x, `no Spinner.${d} axis`);
    assert.equal(x.realizedCount, 0, `realizedCount=${x.realizedCount} (expected 0)`);
  });
}
check("Spinner.size has styling intent (per-value size tokens) -> genuine gaps", () => {
  const x = dim("Spinner", "size");
  assert.equal(x.stylingIntent, true, "expected styling intent (size token segment exists)");
  assert.ok(x.gaps.length > 0, `expected gaps, got ${JSON.stringify(x.gaps)}`);
});

console.log("\nfalse-positive control — a fully-realized component is NOT flagged:");
check("Button has no realization gaps (variants scope vars in tokens.css)", () => {
  const gaps = classify("Button").dims.flatMap((d) => d.gaps);
  assert.deepEqual(gaps, [], `Button unexpectedly flagged: ${JSON.stringify(gaps)}`);
});

console.log("\nbehavioral false-positive control — behavioral axes have no styling intent:");
for (const [c, d] of [["Calendar", "mode"], ["NavList", "orientation"], ["OTP", "mode"]]) {
  check(`${c}.${d} is behavioral (no styling intent) -> not flagged`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.stylingIntent, false, `expected no styling intent for behavioral ${c}.${d}`);
    assert.deepEqual(x.gaps, [], `${c}.${d} should not be flagged`);
  });
}

console.log(`\nlocked test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
