#!/usr/bin/env node
/**
 * sync-analytical-fixtures.mjs — regenerate the showcase's fixture dump.
 *
 * The ONLY writer of src/data/analytical-fixtures/fixtures.ts. Reads the
 * governed, answer-free fixture corpus
 * (packages/ds-contracts/analytical-fixtures/fixtures.jsonl, authored by the
 * analytical-relation slices) and emits it as a TypeScript array the showcase
 * can import directly. Re-running over an unchanged corpus is byte-identical:
 * the header records the source's sha256, never a timestamp.
 *
 * Guard rails (this script refuses to write, rather than writing a leak):
 *   1. Every line parses as JSON with an `id` and unique across the corpus.
 *   2. Top-level keys are exactly the closed fixture set:
 *      { id, structure, assertions, evidence }.
 *   3. No key anywhere in the tree is answer-key material — no case ids,
 *      verdicts, diagnostics, obligations, bindings, holdouts, or expected
 *      values. The binding ledger and holdout are engine-side files and are
 *      never read here.
 *
 * Usage: node scripts/sync-analytical-fixtures.mjs
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SOURCE = resolve(ROOT, "packages/ds-contracts/analytical-fixtures/fixtures.jsonl");
const TARGET = resolve(ROOT, "src/data/analytical-fixtures/fixtures.ts");

const ALLOWED_TOP_LEVEL = new Set(["id", "structure", "assertions", "evidence"]);

/** Exact-match key names that would smuggle the answer key into the showcase. */
const FORBIDDEN_KEYS = new Set([
  "case",
  "case_id",
  "caseid",
  "cases",
  "verdict",
  "verdicts",
  "diagnostic",
  "diagnostics",
  "obligation",
  "obligations",
  "binding",
  "bindings",
  "holdout",
  "holdouts",
  "expected",
  "expectedverdict",
  "expected_diagnostic",
]);

function assertNoForbiddenKeys(node, path) {
  if (Array.isArray(node)) {
    node.forEach((child, i) => assertNoForbiddenKeys(child, `${path}[${i}]`));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
        console.error(`LEAK: forbidden answer-key key "${key}" at ${path}`);
        process.exit(1);
      }
      assertNoForbiddenKeys(child, `${path}.${key}`);
    }
  }
}

const sourceBytes = readFileSync(SOURCE);
const sourceSha = createHash("sha256").update(sourceBytes).digest("hex");

const fixtures = [];
const seenIds = new Set();
for (const [index, line] of sourceBytes.toString("utf8").split("\n").entries()) {
  if (!line.trim()) continue;
  let parsed;
  try {
    parsed = JSON.parse(line);
  } catch (err) {
    console.error(`FAIL: line ${index + 1} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
  if (typeof parsed.id !== "string" || !parsed.id) {
    console.error(`FAIL: line ${index + 1} has no string "id"`);
    process.exit(1);
  }
  if (seenIds.has(parsed.id)) {
    console.error(`FAIL: duplicate fixture id "${parsed.id}" (line ${index + 1})`);
    process.exit(1);
  }
  for (const key of Object.keys(parsed)) {
    if (!ALLOWED_TOP_LEVEL.has(key)) {
      console.error(
        `LEAK: fixture "${parsed.id}" (line ${index + 1}) has non-closed top-level key "${key}"`,
      );
      process.exit(1);
    }
  }
  assertNoForbiddenKeys(parsed, parsed.id);
  seenIds.add(parsed.id);
  fixtures.push(parsed);
}

if (fixtures.length === 0) {
  console.error("FAIL: source corpus is empty — refusing to write an empty dump");
  process.exit(1);
}

const header = `// GENERATED FILE — do not edit by hand.
// Source: packages/ds-contracts/analytical-fixtures/fixtures.jsonl
// Source sha256: ${sourceSha}
// Regenerate:    node scripts/sync-analytical-fixtures.mjs
// Answer-free by construction: this dump carries fixtures only — no corpus
// case ids, verdicts, diagnostics, obligations, bindings, or holdouts. The
// sync script refuses to write any key that looks like answer-key material.
import type { AnalyticalFixture } from "./types";

export const FIXTURES: AnalyticalFixture[] = `;

const body = JSON.stringify(fixtures, null, 2);
writeFileSync(TARGET, `${header}${body};\n`);

console.log(`fixtures: wrote ${fixtures.length} fixtures -> ${TARGET}`);
console.log(`fixtures: source sha256 ${sourceSha}`);
