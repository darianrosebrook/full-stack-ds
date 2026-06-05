#!/usr/bin/env node
/**
 * COMPONENT-AUDIT-TOOL-01 A3 — negative control.
 *
 * Proves the audit CAN fail: the static flag detector and the (pure) geometry
 * verdict report non-OK on injected/known mismatches, and stay silent/OK on
 * clean inputs and the known harness confound (flex-item blockification). Run
 * standalone — NOT wired into CI:
 *
 *   node scripts/component-audit/selftest.mjs
 */
import assert from "node:assert/strict";
import { extractStatic } from "./extract.mjs";
import { computeVerdict } from "./geometry.mjs";

let pass = 0;
let fail = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    pass++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    fail++;
  }
};

console.log("static — hardcoded-dimension detector:");
// Known-bad: real components that carry a hardcoded dimensional literal (the
// detector MUST bite, else the audit silently passes a real token-hygiene gap).
for (const c of ["Command", "OTP", "Stat"]) {
  check(`flags hardcoded dim in ${c} (known-bad)`, () => {
    const s = extractStatic(c);
    assert.ok(
      s.flags.some((f) => /hardcoded dim/.test(f)),
      `expected a hardcoded-dim flag, got: ${s.flags.join(" | ") || "(none)"}`,
    );
  });
}
// Discriminator: a clean, fully-tokenized component must NOT be flagged, else
// the detector is just always-on noise.
check("does NOT flag clean, tokenized Button (discriminator)", () => {
  const s = extractStatic("Button");
  assert.ok(
    !s.flags.some((f) => /hardcoded dim/.test(f)),
    `Button unexpectedly flagged: ${s.flags.join(" | ")}`,
  );
});

console.log("\ngeometry — pure verdict:");
// Injected mismatch 1: rendered height below the computed min-height.
check("FLAGs an unhonored min-height (injected)", () => {
  const v = computeVerdict("flex", { visible: true, display: "flex", height: 20, width: 50, minHeight: "36px" });
  assert.match(v, /^FLAG:.*min-height/, `got: ${v}`);
});
// Injected mismatch 2: a genuine display mismatch survives blockification.
check("FLAGs a genuine display mismatch (grid vs block, injected)", () => {
  const v = computeVerdict("block", { visible: true, display: "grid", height: 40, width: 50, minHeight: "0px" });
  assert.match(v, /^FLAG:.*display/, `got: ${v}`);
});
// Clean render must pass.
check("OK on a clean render (discriminator)", () => {
  const v = computeVerdict("flex", { visible: true, display: "flex", height: 40, width: 50, minHeight: "36px" });
  assert.match(v, /^ok/, `got: ${v}`);
});
// The known confound must NOT flag: inline-flex declared, blockified to flex.
check("OK on harness blockification (inline-flex declared -> flex rendered)", () => {
  const v = computeVerdict("inline-flex", { visible: true, display: "flex", height: 40, width: 50, minHeight: "0px" });
  assert.match(v, /^ok/, `got: ${v}`);
});
// Zero-size empty default must route to manual, not a false OK.
check("routes a zero-size root to manual (Image-shape)", () => {
  const v = computeVerdict("(default)", { visible: false, display: "inline", height: 0, width: 0, minHeight: "0px" });
  assert.match(v, /manual/, `got: ${v}`);
});

console.log(`\nself-test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
