#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CONTRACT_MUTANTS,
  applyContractMutation,
  changedLeaves,
  getAtPointer,
  summarizeMutationResults,
} from "./catalog.mjs";

let failures = 0;

function check(name, actual, expected) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return;
  failures += 1;
  console.error(
    "FAIL " +
      name +
      "\n  expected " +
      JSON.stringify(expected) +
      "\n  actual   " +
      JSON.stringify(actual),
  );
}

check(
  "mutant ids are unique",
  new Set(CONTRACT_MUTANTS.map((mutant) => mutant.id)).size,
  CONTRACT_MUTANTS.length,
);

for (const mutant of CONTRACT_MUTANTS) {
  check(
    mutant.id + " declares a valid expected outcome",
    ["detected", "survived"].includes(mutant.expectedOutcome),
    true,
  );
  if (mutant.expectedOutcome === "survived") {
    check(
      mutant.id + " names the spec owning its blind spot",
      typeof mutant.gap?.spec === "string" && mutant.gap.spec.length > 0,
      true,
    );
    check(
      mutant.id + " explains why its blind spot is retained",
      typeof mutant.gap?.note === "string" && mutant.gap.note.length > 0,
      true,
    );
  }

  const path = resolve(process.cwd(), mutant.contractPath);
  const contract = JSON.parse(readFileSync(path, "utf8"));
  const before = structuredClone(contract);
  const mutated = applyContractMutation(contract, mutant);
  const changes = changedLeaves(contract, mutated);

  check(mutant.id + " leaves its input immutable", contract, before);
  check(mutant.id + " changes exactly one leaf", changes.length, 1);
  check(
    mutant.id + " changes the declared pointer",
    changes[0]?.pointer,
    mutant.pointer,
  );
  check(mutant.id + " writes the declared value", getAtPointer(mutated, mutant.pointer), mutant.to);

  let driftRejected = false;
  try {
    applyContractMutation(mutated, mutant);
  } catch (error) {
    driftRejected = String(error).includes("expected");
  }
  check(mutant.id + " fails closed when its source value drifts", driftRejected, true);
}

const summary = summarizeMutationResults([
  {
    fieldClass: "relationship-target",
    outcome: "detected",
    expectedOutcome: "detected",
    firstDetection: { evidenceClass: "structural" },
  },
  {
    fieldClass: "relationship-target",
    outcome: "survived",
    expectedOutcome: "detected",
  },
  {
    fieldClass: "boolean-default",
    outcome: "survived",
    expectedOutcome: "survived",
  },
  {
    fieldClass: "boolean-default",
    outcome: "detected",
    expectedOutcome: "survived",
    firstDetection: { evidenceClass: "mixed-test" },
  },
]);
check("summary counts detected mutants", summary.detected, 2);
check("summary counts surviving mutants", summary.survived, 2);
check("summary groups detector evidence", summary.byEvidenceClass, {
  structural: 1,
  "mixed-test": 1,
});
check("summary rejects outcome swaps hidden by an unchanged count", summary.dispositionMismatches, 2);
check("summary names newly surviving protected mutants", summary.unexpectedSurvivors, 1);
check("summary names newly detected blind-spot sentinels", summary.unexpectedDetections, 1);
check("summary reports per-field survival", summary.byFieldClass["boolean-default"], {
  total: 2,
  detected: 1,
  survived: 1,
});

if (failures > 0) {
  console.error("\ncontract-oracle mutation self-check: " + failures + " failure(s)");
  process.exit(1);
}

console.log(
  "contract-oracle mutation self-check: PASS (" +
    CONTRACT_MUTANTS.length +
    " one-leaf mutants)",
);
