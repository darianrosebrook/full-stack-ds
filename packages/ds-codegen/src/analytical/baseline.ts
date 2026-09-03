/**
 * The frozen stage-1 baseline (REL-FIELD-ALGEBRA-02, invariant 2): digests of
 * every representation input and the canonical judgment of every fixture,
 * recorded at the end of Phase A. Phase B's conservation gate is `--check`:
 * after each removal the judgments must equal this ledger byte-for-byte, and
 * a digest that moved names exactly which input moved.
 *
 *   tsx packages/ds-codegen/src/analytical/baseline.ts                        # record
 *   tsx packages/ds-codegen/src/analytical/baseline.ts --check                # conserve
 *   tsx packages/ds-codegen/src/analytical/baseline.ts --check --ledger-only --rewrites
 *     # Phase B: digests are expected to move; the ledger must match modulo the
 *     # assertion-key rewrites removals.json records (a removed parameter or a
 *     # merged member changes an occurrence's key and nothing else).
 *
 * The ledger is engine output and is used ONLY for conservation; necessity
 * witnesses take their required outcomes from the oracle, never from here.
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { judge } from "./engines.js";
import { canonicalJudgment } from "./judgment.js";
import { parseFixtures } from "./structure.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTRACTS = path.resolve(HERE, "../../../ds-contracts");
export const BASELINE_FILE = path.join(CONTRACTS, "analytical-fixtures/baseline-stage1.json");

const INPUTS: Record<string, string> = {
  "relation-model.ts": path.join(HERE, "relation-model.ts"),
  "engines.ts": path.join(HERE, "engines.ts"),
  "derivation.ts": path.join(HERE, "derivation.ts"),
  "judgment.ts": path.join(HERE, "judgment.ts"),
  "relation.contract.schema.json": path.join(CONTRACTS, "relation.contract.schema.json"),
  "assertion.schema.json": path.join(CONTRACTS, "analytical-fixtures/assertion.schema.json"),
  "fixture.schema.json": path.join(CONTRACTS, "analytical-fixtures/fixture.schema.json"),
  "fixtures.jsonl": path.join(CONTRACTS, "analytical-fixtures/fixtures.jsonl"),
  "bindings.json": path.join(CONTRACTS, "analytical-fixtures/bindings.json"),
};

export interface Baseline {
  $comment: string;
  digests: Record<string, string>;
  /** fixture id -> canonicalJudgment */
  ledger: Record<string, string>;
}

const sha = (p: string) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

export function computeBaseline(): Baseline {
  const fixtures = parseFixtures(fs.readFileSync(INPUTS["fixtures.jsonl"], "utf-8"));
  const ledger: Record<string, string> = {};
  for (const f of fixtures) ledger[f.id] = canonicalJudgment(judge(f.structure, f.assertions, f.evidence));
  return {
    $comment:
      "Frozen stage-1 baseline recorded at the end of REL-FIELD-ALGEBRA-02 Phase A. Digests name the representation inputs; ledger is the canonical judgment of every fixture. Phase B removals must conserve the ledger byte-for-byte (analytical:check-baseline).",
    digests: Object.fromEntries(Object.entries(INPUTS).map(([k, p]) => [k, sha(p)])),
    ledger,
  };
}

/**
 * Apply the assertion-key rewrites a removal implies (recorded in
 * removals.json as [pattern, replacement] pairs, applied in order) to a
 * recorded canonical judgment. A removed parameter or merged member changes
 * the occurrence KEY and nothing else; the rewritten ledger must then match
 * the live one byte-for-byte.
 */
export function rewriteLedgerEntry(entry: string, rewrites: readonly (readonly [string, string])[]): string {
  return rewrites.reduce((s, [pattern, replacement]) => s.replace(new RegExp(pattern, "g"), replacement), entry);
}

/** Human-readable differences between the recorded baseline and the live tree (empty = conserved). */
export function checkBaseline(
  file = BASELINE_FILE,
  opts: { ledgerOnly?: boolean; rewrites?: readonly (readonly [string, string])[] } = {},
): string[] {
  const recorded = JSON.parse(fs.readFileSync(file, "utf-8")) as Baseline;
  const live = computeBaseline();
  const out: string[] = [];
  if (!opts.ledgerOnly) {
    for (const [k, v] of Object.entries(recorded.digests)) {
      if (live.digests[k] !== v) out.push(`digest moved: ${k} ${v.slice(0, 16)} -> ${(live.digests[k] ?? "missing").slice(0, 16)}`);
    }
  }
  for (const [id, raw] of Object.entries(recorded.ledger)) {
    const j = rewriteLedgerEntry(raw, opts.rewrites ?? []);
    if (live.ledger[id] === undefined) out.push(`fixture missing: ${id}`);
    else if (live.ledger[id] !== j) out.push(`judgment moved: ${id}\n  was ${j}\n  now ${live.ledger[id]}`);
  }
  for (const id of Object.keys(live.ledger)) if (recorded.ledger[id] === undefined) out.push(`fixture added since baseline: ${id}`);
  return out;
}

export function writeBaseline(file = BASELINE_FILE): Baseline {
  const b = computeBaseline();
  fs.writeFileSync(file, JSON.stringify(b, null, 2) + "\n");
  return b;
}

/** Key rewrites recorded in removals.json (Phase B), or none. */
export function loadKeyRewrites(file = path.join(CONTRACTS, "analytical-fixtures/removals.json")): [string, string][] {
  if (!fs.existsSync(file)) return [];
  return (JSON.parse(fs.readFileSync(file, "utf-8")) as { keyRewrites?: [string, string][] }).keyRewrites ?? [];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--check")) {
    const diffs = checkBaseline(BASELINE_FILE, {
      ledgerOnly: process.argv.includes("--ledger-only"),
      rewrites: process.argv.includes("--rewrites") ? loadKeyRewrites() : [],
    });
    if (diffs.length > 0) {
      console.error(`baseline --check: NOT CONSERVED\n${diffs.join("\n")}`);
      process.exit(1);
    }
    console.log("baseline --check: conserved");
  } else {
    const b = writeBaseline();
    console.log(`baseline: recorded ${Object.keys(b.ledger).length} judgments and ${Object.keys(b.digests).length} digests -> ${BASELINE_FILE}`);
  }
}
