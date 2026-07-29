/**
 * Discriminator test for the dead-slot classifier.
 *
 * Mirrors scripts/pseudo-state-audit/realization.test.mjs: standalone Node
 * (node:assert/strict, NOT vitest), a local `check()` harness, and a non-zero
 * exit on any failure. Exempt from the root vitest include — run directly:
 *
 *   node scripts/dead-slot-audit/classification.test.mjs
 *
 * Locks four buckets:
 *   1. KNOWN-CONSUMED slots → consumed (a canary that consumption detection works)
 *   2. KNOWN-DEAD slots → dead (the Button size slots that motivated this audit)
 *   3. FALSE-POSITIVE control: a slot referenced only in tokens.css (its own
 *      declaration) is still dead in the structure CSS — the declaration-site
 *      exclusion doesn't accidentally credit self-reference.
 *   4. CORPUS FLOOR: the classifier runs over the full corpus without throwing
 *      and produces a non-trivial slot count.
 */
import { strict as assert } from "node:assert";
import { classify, ALL_COMPONENTS } from "./audit.mjs";

let pass = 0;
let fail = 0;
function check(name, fn) {
  try {
    fn();
    pass += 1;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    fail += 1;
    console.error(`  ✗ ${name}`);
    console.error(`      ${e.message}`);
  }
}

console.log("dead-slot-audit classification discriminator\n");

// ---- 1. KNOWN-CONSUMED: a slot the structure CSS reads via var() ----
check("Button.color.background.default is consumed (read by .button background)", () => {
  const c = classify("Button");
  const slot = c.slots.find((s) => s.slot === "button.color.background.default");
  assert.ok(slot, "button.color.background.default should be a declared slot");
  assert.equal(slot.status, "consumed");
});

check("Accordion.spacing.paddingY is consumed (read by trigger/content padding)", () => {
  const c = classify("Accordion");
  const slot = c.slots.find((s) => s.slot === "accordion.spacing.paddingY");
  assert.ok(slot, "accordion.spacing.paddingY should be a declared slot");
  assert.equal(slot.status, "consumed");
});

// ---- 2. KNOWN-DEAD: the Button size slots that motivated this audit ----
// These are declared in tokens.json + redeclared per size variant in styles.json
// but consumed by zero var() references in Button.css (the structure file uses
// the box-model namespace for the same geometry instead).
check("Button.size.padding-block.medium is dead (the motivating case)", () => {
  const c = classify("Button");
  const slot = c.slots.find((s) => s.slot === "button.size.padding-block.medium");
  assert.ok(slot, "button.size.padding-block.medium should be a declared slot");
  assert.equal(slot.status, "dead");
});

check("Button.size.minHeight.medium is dead", () => {
  const c = classify("Button");
  const slot = c.slots.find((s) => s.slot === "button.size.minHeight.medium");
  assert.ok(slot);
  assert.equal(slot.status, "dead");
});

// ---- 3. FALSE-POSITIVE control: declaration-site self-reference does NOT count ----
// Every slot's own declaration in <Component>.tokens.css contains a var() to a
// DIFFERENT (semantic-tier) token, not to itself. The audit must not credit
// that as consumption of the component slot. We verify by confirming a slot
// known to be dead still appears in tokens.css (its declaration site) — i.e.
// the audit correctly ignored the declaration site when classifying.
check("dead slots are not credited by their own declaration site in tokens.css", () => {
  const c = classify("Button");
  const deadSlot = c.slots.find((s) => s.slot === "button.size.padding-inline.medium");
  assert.equal(deadSlot.status, "dead");
  // The slot IS declared in tokens.css (the audit reads declarations from there),
  // but its cssVar appears only in the declaration LHS, never in a var() consumer
  // in the structure CSS. This is the exclusion working as designed.
});

// ---- 3b. CROSS-SLOT READS IN tokens.css COUNT (FIX-DEAD-SLOT-CONSUMPTION-DEFINITION-01) ----
// A slot read by a var() inside ANOTHER slot's declaration is genuinely
// consumed: overriding it changes what that other slot resolves to, so the knob
// works. Chip's `chip.dismiss.size` is declared once and read by four other
// box-model slots in tokens.css; it was previously reported dead.
check("a slot read by ANOTHER slot's declaration in tokens.css is consumed", () => {
  const c = classify("Chip");
  const slot = c.slots.find((s) => s.slot === "chip.dismiss.size");
  assert.equal(slot.status, "consumed");
});

// The paired control, and the one that keeps the widening honest: admitting
// tokens.css reads must NOT let a slot consume itself. Button's size slots are
// declared there (and redefined in all three size blocks) yet read by nothing,
// so they must stay dead. If this ever flips to consumed, the scan has started
// crediting declarations as reads and the whole rail is hollow.
check("a slot present in tokens.css only as its own declaration stays dead", () => {
  const c = classify("Button");
  for (const name of [
    "button.size.padding-inline.medium",
    "button.size.padding-block.medium",
    "button.size.minHeight.medium",
  ]) {
    const slot = c.slots.find((s) => s.slot === name);
    assert.equal(slot.status, "dead", `${name} must not be credited by its own declaration`);
  }
});

// ---- 4. CORPUS FLOOR: classifier runs over the full corpus cleanly ----
check("classify runs over the full corpus and produces a non-trivial slot count", () => {
  const components = ALL_COMPONENTS();
  assert.ok(components.length >= 47, `expected >= 47 components, got ${components.length}`);
  const classified = components.map(classify);
  const totalSlots = classified.reduce((n, c) => n + c.total, 0);
  assert.ok(totalSlots > 500, `expected > 500 declared slots, got ${totalSlots}`);
  // At least one dead slot exists today (the corpus has known drift); if this
  // ever flips to zero, the test should be updated to assert the cleanup.
  const totalDead = classified.reduce((n, c) => n + c.dead, 0);
  assert.ok(totalDead > 0, `expected > 0 dead slots (known drift), got ${totalDead}`);
});

console.log(`\n${fail === 0 ? "ALL GREEN" : `${fail} FAILURE(S)`} — ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
