#!/usr/bin/env node
/**
 * VARIANT-STYLE-REALIZATION-AUDIT-01 — locked discriminator test.
 *
 * Locks the audit's classification on REAL contracts/CSS:
 *   - Batch 1 (VARIANT-STYLE-VAR-RESCOPE-BATCH-01) realized Spinner.thickness,
 *     Stat.trend, Select.size; Batch 2 (VARIANT-STYLE-SIZE-INTENT-BATCH-02)
 *     realized Spinner.size, Avatar.size, Stat.size and Progress.intent via
 *     per-value tokens — all now fully realized (regression lock for the fixes);
 *   - the canary remainder is still flagged: Spinner.variant (ring/dots/bars →
 *     contract decision) and List.size (DEFERRED — its values sm/md/lg collide
 *     with List.spacing's, so `.list--sm` is ambiguous; needs a namespaced-class
 *     fix before it can be realized);
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

console.log("Batch 1 + Batch 2 — per-value-token axes now fully realized:");
for (const [c, d] of [
  ["Spinner", "thickness"], ["Stat", "trend"], ["Select", "size"],
  ["Spinner", "size"], ["Avatar", "size"], ["Stat", "size"], ["Progress", "intent"],
]) {
  check(`${c}.${d} is fully realized (styling axis, no gaps)`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.stylingIntent, true, `expected styling intent for ${c}.${d}`);
    assert.equal(x.gaps.length, 0, `unexpected gaps: ${JSON.stringify(x.gaps)}`);
    // realizedCount can be total-1 when the axis has a declared default that the
    // base rule realizes (e.g. Stat.size default=md), so assert >=1, not ==total.
    assert.ok(x.realizedCount >= 1, `expected >=1 consuming selector, got ${x.realizedCount}`);
  });
}

console.log("\nstill unrealized — Spinner.variant (contract decision) + List.size (DEFERRED: value-name collision with List.spacing):");
for (const [c, d] of [["Spinner", "variant"], ["List", "size"]]) {
  check(`${c}.${d} is still an unrealized axis`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.realizedCount, 0, `realizedCount=${x.realizedCount} (expected 0)`);
  });
}

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
