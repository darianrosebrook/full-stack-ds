/**
 * Falsification probe for the shared ledger ratchet
 * (RAIL-STYLING-REALIZATION-LEDGERS-01, A1 + A2).
 *
 * A gate that cannot fail proves nothing. These drive `diffLedger` with
 * fixtures in both directions and assert it actually fires — the ratchet's
 * whole value is that BOTH `unledgered` and `stale` block, so both are pinned
 * here, plus the ledger-validation rules that keep entries accountable.
 *
 * Standalone Node (node:assert/strict), matching the sibling discriminator
 * tests in scripts/*-audit/ — these are deliberately outside the vitest include.
 */
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { diffLedger, loadLedger, reportRatchet } from "./ledger-ratchet.mjs";

const idOf = (r) => `${r.component} ${r.slot}`;
const entry = (component, slot) => ({
  component,
  slot,
  spec: "SOME-SPEC-01",
  note: "why it is here",
});

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

console.log("ledger-ratchet falsification probe");

// --- A1: an unaccounted finding must fail ---
check("a finding absent from the ledger is reported as unledgered", () => {
  const { unledgered, stale } = diffLedger({
    current: [{ component: "Chip", slot: "chip.focus.ring.color" }],
    ledger: [],
    idOf,
  });
  assert.equal(unledgered.length, 1, "expected the unledgered finding to fire");
  assert.equal(unledgered[0].slot, "chip.focus.ring.color");
  assert.equal(stale.length, 0, "an unledgered finding must not also read as stale");
});

// --- A2: a ledger entry that no longer reproduces must fail ---
check("a ledger entry with no matching finding is reported as stale", () => {
  const { unledgered, stale } = diffLedger({
    current: [],
    ledger: [entry("Card", "card.color.badge.success.background")],
    idOf,
  });
  assert.equal(stale.length, 1, "expected the stale entry to fire");
  assert.equal(stale[0].slot, "card.color.badge.success.background");
  assert.equal(unledgered.length, 0, "a stale entry must not also read as unledgered");
});

// --- the green path must actually be reachable ---
check("an exactly-matching ledger yields neither unledgered nor stale", () => {
  const { unledgered, stale } = diffLedger({
    current: [{ component: "Chip", slot: "chip.dismiss.size" }],
    ledger: [entry("Chip", "chip.dismiss.size")],
    idOf,
  });
  assert.equal(unledgered.length, 0);
  assert.equal(stale.length, 0);
});

// --- both directions fire at once (a rename presents as one of each) ---
check("a renamed slot fires as one unledgered AND one stale", () => {
  const { unledgered, stale } = diffLedger({
    current: [{ component: "Chip", slot: "chip.dismiss.size.new" }],
    ledger: [entry("Chip", "chip.dismiss.size")],
    idOf,
  });
  assert.equal(unledgered.length, 1);
  assert.equal(stale.length, 1);
});

// --- accountability: entries cannot omit their owning spec or reason ---
function ledgerFile(gaps) {
  const dir = mkdtempSync(join(tmpdir(), "ledger-ratchet-"));
  const path = join(dir, "known.json");
  writeFileSync(path, JSON.stringify({ gaps }));
  return path;
}

check("an entry missing `spec` is rejected", () => {
  const path = ledgerFile([{ component: "Chip", slot: "a.b", note: "reason" }]);
  assert.throws(() => loadLedger(path, ["component", "slot"]), /missing required "spec"/);
});

check("an entry missing `note` is rejected", () => {
  const path = ledgerFile([{ component: "Chip", slot: "a.b", spec: "S-01" }]);
  assert.throws(() => loadLedger(path, ["component", "slot"]), /missing required "note"/);
});

check("an entry with an empty `note` is rejected, not treated as present", () => {
  const path = ledgerFile([{ component: "Chip", slot: "a.b", spec: "S-01", note: "" }]);
  assert.throws(() => loadLedger(path, ["component", "slot"]), /missing required "note"/);
});

check("a missing ledger file yields an empty ledger, so findings read as unledgered", () => {
  const loaded = loadLedger(join(tmpdir(), "definitely-absent-ledger.json"), ["component"]);
  assert.deepEqual(loaded, [], "a missing ledger must not silently pass the audit");
});

// --- reportRatchet: the diff -> exit code mapping ---------------------------
// Six audits call this and exit on what it returns, so it is the function that
// actually decides whether a push is blocked — and until now nothing pinned it.
// It briefly picked up accidental coverage inside one audit's selfcheck; that
// left the mapping unproven for the other five and made a PASSING selfcheck
// print two FAIL blocks, because reportRatchet logs its verdict as a side
// effect of being asked for a return code. It belongs here instead.
//
// `capture` exists so the probe's own output stays honest — a green run must
// not contain the word FAIL — but it is not mere muting: the captured text is
// asserted on, because the ids and the owning spec in that output are the only
// thing a human can act on when the gate blocks them.
function capture(fn) {
  const lines = [];
  const { log, error } = console;
  console.log = (...args) => lines.push(args.join(" "));
  console.error = (...args) => lines.push(args.join(" "));
  try {
    return { returned: fn(), output: lines.join("\n") };
  } finally {
    console.log = log;
    console.error = error;
  }
}

const ratchet = (current, ledger) => {
  const { unledgered, stale } = diffLedger({ current, ledger, idOf });
  return capture(() =>
    reportRatchet({ label: "probe", current, unledgered, stale, idOf }),
  );
};

check("an unledgered finding returns exit code 1 and names the finding", () => {
  const { returned, output } = ratchet([{ component: "Chip", slot: "a.b" }], []);
  assert.equal(returned, 1, "new unaccounted debt must block the push");
  assert.match(output, /UNLEDGERED/);
  assert.match(output, /Chip a\.b/, "the operator can only act on a named id");
});

check("a stale ledger entry returns exit code 1 and names its owning spec", () => {
  const { returned, output } = ratchet([], [entry("Chip", "a.b")]);
  assert.equal(returned, 1, "a ledger that no longer reproduces has rotted into fiction");
  assert.match(output, /STALE/);
  assert.match(output, /Chip a\.b \(spec SOME-SPEC-01\)/);
});

check("a fully ledgered finding set returns exit code 0 and reports no failure", () => {
  const current = [{ component: "Chip", slot: "a.b" }];
  const { returned, output } = ratchet(current, [entry("Chip", "a.b")]);
  assert.equal(returned, 0);
  assert.match(output, /PASS/);
  assert.doesNotMatch(output, /FAIL/, "a green verdict must not print the word FAIL");
});

check("both directions firing at once still returns a single blocking code", () => {
  // The renamed-slot case from A1/A2 above, carried through to the exit code:
  // one unledgered and one stale must not cancel out into a pass.
  const { returned, output } = ratchet([{ component: "Chip", slot: "new" }], [entry("Chip", "old")]);
  assert.equal(returned, 1);
  assert.match(output, /UNLEDGERED/);
  assert.match(output, /STALE/);
});

if (failures > 0) {
  console.error(`\nledger-ratchet probe FAILED (${failures})`);
  process.exit(1);
}
console.log("ledger-ratchet probe PASS");
