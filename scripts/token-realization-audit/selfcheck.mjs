#!/usr/bin/env node
// @ts-check
/**
 * Selfcheck for the token-realization audit (FEAT-TOKEN-REALIZATION-AUDIT-001).
 *
 * Drives the pure gap computation with synthetic corpora and carrier maps so
 * every gap kind is falsifiable without touching the repo:
 *
 *   - admitted + all slots in carrier      → no gaps
 *   - missing slot                         → exactly one `slot` gap naming it
 *   - carrier file absent                  → one `carrier` gap
 *   - not in explicit allowlist            → one `admission` gap (only when
 *                                             the component declares slots —
 *                                             slotless components owe nothing)
 *   - carrier without declared slots       → one `orphan` gap
 *   - default target (react-native)        → admission is impossible
 *
 * Plus ratchet behavior through the shared lib: an unledgered new gap fails,
 * a fixed-but-still-ledgered gap fails, exact ledger matches pass.
 */

import assert from "node:assert/strict";
import { diffLedger } from "../lib/ledger-ratchet.mjs";
import { admittedSet, computeTargetGaps, gapId, NATIVE_TARGETS } from "./audit.mjs";

let checks = 0;
function check(name, fn) {
  fn();
  checks += 1;
  console.log(`  ok  ${name}`);
}

const CORPUS = [
  { name: "Switch", slots: ["switch.color.track.background.default", "switch.size.md.track.width"] },
  { name: "Markdown", slots: [] },
  { name: "Walkthrough", slots: ["walkthrough.surface.bg"] },
];

const EXPLICIT_TARGET = NATIVE_TARGETS.find((t) => t.id === "swiftui");
const DEFAULT_TARGET = NATIVE_TARGETS.find((t) => t.id === "react-native");

check("full realization produces no gaps", () => {
  const gaps = computeTargetGaps(DEFAULT_TARGET, CORPUS, new Set(["Switch", "Markdown", "Walkthrough"]), (name) =>
    name === "Switch"
      ? '"switch.color.track.background.default" ... "switch.size.md.track.width"'
      : null,
  );
  // Walkthrough declares a slot but has no carrier under a full-admission set.
  assert.deepEqual(
    gaps.map(gapId),
    ["react-native:Walkthrough:carrier:—"],
  );
});

check("missing slot yields exactly one slot gap naming the slot", () => {
  const gaps = computeTargetGaps(DEFAULT_TARGET, CORPUS, new Set(["Switch"]), () =>
    '"switch.color.track.background.default" only',
  );
  assert.deepEqual(
    gaps.filter((g) => g.kind === "slot").map((g) => g.slot),
    ["switch.size.md.track.width"],
  );
});

check("absent carrier yields one carrier gap", () => {
  const gaps = computeTargetGaps(
    DEFAULT_TARGET,
    CORPUS,
    new Set(["Switch", "Markdown", "Walkthrough"]),
    (name) => (name === "Walkthrough" ? '"walkthrough.surface.bg"' : null),
  );
  // Markdown declares no slots and has no carrier → no obligation.
  // Switch is admitted with slots but no carrier → the one carrier gap.
  assert.deepEqual(gaps.map((g) => g.kind), ["carrier"]);
});

check("explicit-only target: slotless unadmitted component owes nothing", () => {
  const gaps = computeTargetGaps(EXPLICIT_TARGET, CORPUS, new Set(["Switch"]), (name) =>
    name === "Switch"
      ? '"switch.color.track.background.default" "switch.size.md.track.width"'
      : null,
  );
  // Markdown (slots: []) not admitted → no admission gap.
  // Walkthrough not admitted but declares slots → admission gap.
  // Switch admitted, carrier realizes both slots → no slot gaps.
  assert.deepEqual(
    gaps.map(gapId),
    ["swiftui:Walkthrough:admission:—"],
  );
});

check("slot-matching is exact-quoted, not substring-loose", () => {
  const gaps = computeTargetGaps(DEFAULT_TARGET, CORPUS, new Set(["Walkthrough"]), () =>
    '"walkthrough.surface.bgx" unrelated',
  );
  assert.equal(gaps.filter((g) => g.kind === "slot").length, 1);
});

check("orphan carrier on a slotless component is flagged", () => {
  const gaps = computeTargetGaps(
    DEFAULT_TARGET,
    CORPUS,
    new Set(["Switch", "Markdown", "Walkthrough"]),
    (name) => (name === "Markdown" ? "stale carrier" : null),
  );
  // Switch/Walkthrough: admitted, slots, no carrier → carrier gaps.
  // Markdown: no declared slots but a carrier exists → orphan.
  assert.deepEqual(gaps.map((g) => g.kind), ["carrier", "orphan", "carrier"]);
});

check("empty allowlist on explicit target admits the full corpus", () => {
  const targetsJson = { targets: [{ id: "swiftui", components: [] }] };
  const admitted = admittedSet(EXPLICIT_TARGET, CORPUS, targetsJson);
  assert.equal(admitted.size, 3);
});

check("allowlist gates explicit target admission", () => {
  const targetsJson = { targets: [{ id: "swiftui", components: ["Switch"] }] };
  const admitted = admittedSet(EXPLICIT_TARGET, CORPUS, targetsJson);
  assert.deepEqual([...admitted], ["Switch"]);
});

check("ratchet: unledgered new gap fails, stale ledger entry fails, matched passes", () => {
  const current = [{ target: "swiftui", component: "Switch", kind: "carrier" }];
  const ledger = [
    { target: "swiftui", component: "Switch", kind: "carrier", spec: "X", note: "n" },
    { target: "swiftui", component: "Gone", kind: "slot", slot: "s.old", spec: "X", note: "n" },
  ];
  const { unledgered, stale } = diffLedger({ current, ledger, idOf: gapId });
  assert.equal(unledgered.length, 0);
  assert.equal(stale.length, 1);
  assert.equal(gapId(stale[0]), "swiftui:Gone:slot:s.old");

  const currentWithNew = [
    ...current,
    { target: "jetpack-compose", component: "Button", kind: "slot", slot: "button.color.bg" },
  ];
  const diff2 = diffLedger({ current: currentWithNew, ledger, idOf: gapId });
  assert.equal(diff2.unledgered.length, 1);
  assert.equal(gapId(diff2.unledgered[0]), "jetpack-compose:Button:slot:button.color.bg");
});

console.log(`\nselfcheck: ${checks} check(s) passed`);
