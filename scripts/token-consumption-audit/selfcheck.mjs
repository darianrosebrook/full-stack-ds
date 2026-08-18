#!/usr/bin/env node
/**
 * RAIL-TOKEN-CONSUMPTION-AUDIT-01 selfcheck — falsification fixtures for the
 * pure derivation and the ratchet bite. Run with:
 *   node scripts/token-consumption-audit/selfcheck.mjs
 * Exits non-zero on the first failed expectation. No repo state is read;
 * every input is a fixture, so a failure always names the code, never the
 * corpus.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { deadSubtrees, findingId, MIN_TOKENS } from "./audit.mjs";
import { diffLedger } from "../lib/ledger-ratchet.mjs";

const PATHS = [
  "core.color.palette.red.500",
  "semantic.color.foreground.primary",
  "semantic.color.syntax.plain",
  "semantic.color.syntax.keyword",
  "semantic.color.action.border.default",
  "semantic.color.action.border.hover",
  "semantic.motion.duration.fast",
  "semantic.motion.duration.slow",
  "semantic.motion.easing.standard",
  "semantic.typography.family.body",
  "semantic.content.lead",
  "semantic.content.body",
];

test("a fully-dead namespace of >=2 tokens reports as one finding", () => {
  const used = new Set([
    "core.color.palette.red.500",
    "semantic.color.foreground.primary",
    // keeps semantic.motion alive so duration is the MAXIMAL dead subtree
    "semantic.motion.easing.standard",
  ]);
  const findings = deadSubtrees({ paths: PATHS, usedPaths: used });
  const namespaces = findings.map(findingId);
  assert.ok(namespaces.includes("semantic.color.syntax"), "the 9-token split-brain shape must report");
  assert.ok(namespaces.includes("semantic.motion.duration"), "a dead pair inside a live parent reports");
  assert.ok(namespaces.includes("semantic.content"), "whole dead top-group reports");
});

test("the historical color.syntax split-brain shape reports as unledgered (the rail's reason to exist)", () => {
  // The palette repair re-pointed the consumer to foreground.syntax and
  // orphaned color.syntax; the count floor absorbed it. This rail must see it.
  const used = new Set(["semantic.color.foreground.primary"]);
  const { unledgered } = diffLedger({
    current: deadSubtrees({ paths: PATHS, usedPaths: used }),
    ledger: [],
    idOf: findingId,
  });
  assert.ok(
    unledgered.some((f) => f.namespace === "semantic.color.syntax"),
    "an orphaned duplicate namespace must be an unledgered finding",
  );
});

test("partial consumption keeps the namespace alive; only dead fragments report", () => {
  const used = new Set(["semantic.color.action.border.default"]);
  const findings = deadSubtrees({ paths: PATHS, usedPaths: used });
  const namespaces = findings.map(findingId);
  assert.ok(!namespaces.includes("semantic.color.action.border"), "live sibling keeps the namespace alive");
  assert.ok(!namespaces.includes("semantic.color.action.border.hover"), "a lone dead leaf is below threshold");
});

test("single dead leaves never report — the count floor owns that granularity", () => {
  const used = new Set(PATHS.filter((p) => p !== "semantic.typography.family.body"));
  const findings = deadSubtrees({ paths: PATHS, usedPaths: used });
  assert.ok(!findings.map(findingId).includes("semantic.typography.family.body"));
  assert.equal(MIN_TOKENS, 2);
});

test("nesting collapses: only the MAXIMAL dead subtree reports", () => {
  // motion.* entirely dead except nothing — motion root is dead, so it is the
  // one finding for that whole region, never its internal nodes.
  const used = new Set(PATHS.filter((p) => !p.startsWith("semantic.motion.")));
  const findings = deadSubtrees({ paths: PATHS, usedPaths: used });
  const motionFindings = findings.map(findingId).filter((n) => n.startsWith("semantic.motion"));
  assert.deepEqual(motionFindings, ["semantic.motion"]);
});

test("core tokens are never findings, even fully dead (vocabulary-by-doctrine)", () => {
  const used = new Set(PATHS.filter((p) => p !== "core.color.palette.red.500"));
  const findings = deadSubtrees({ paths: PATHS, usedPaths: used });
  assert.ok(findings.map(findingId).every((n) => !n.startsWith("core.")));
});

test("an entirely dead layer reports once at its root", () => {
  const findings = deadSubtrees({ paths: ["semantic.a.b", "semantic.a.c", "semantic.d.e"], usedPaths: [] });
  assert.deepEqual(findings.map(findingId), ["semantic"]);
});

test("ratchet bite: stale ledger entries fail", () => {
  const current = deadSubtrees({ paths: PATHS, usedPaths: new Set(["semantic.color.foreground.primary"]) });
  const staleLedger = [
    { namespace: "semantic.color.syntax", spec: "X-01", note: "n" },
    { namespace: "semantic.consumed.now", spec: "X-01", note: "no longer reproduces" },
  ];
  const { unledgered, stale } = diffLedger({ current, ledger: staleLedger, idOf: findingId });
  assert.equal(stale.length, 1, "revived/deleted namespace must go stale");
  // every current finding except syntax (which is ledgered) is unledgered
  assert.ok(unledgered.every((f) => f.namespace !== "semantic.color.syntax"));
});
