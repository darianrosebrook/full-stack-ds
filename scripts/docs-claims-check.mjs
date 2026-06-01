#!/usr/bin/env node
/**
 * Docs-claims check — fail-loud guard against numeric drift in prose.
 *
 * The corpus count ("N components") appears in narrative docs as a
 * hand-maintained number. It has drifted before (42 -> 53 in prose while
 * the corpus was actually 47), which is exactly the failure mode CLAUDE.md
 * warns about: "never trust hand-written counts in prose; the loader is
 * authoritative." This script makes the loader authoritative mechanically.
 *
 * Design: opt-in marker, not pattern-matching. A bare regex for "N
 * components" produces false positives — e.g. normal-form.md's open
 * question "will the contract hold past 100 components" is a hypothetical
 * threshold, not the corpus count. So the doc author marks the governed
 * number explicitly with an HTML comment:
 *
 *     <!-- component-count --> 47 component contracts ...
 *
 * Only the integer immediately following a `<!-- component-count -->`
 * marker is checked. Unmarked numbers are ignored. This keeps the gate's
 * scope exactly what the author declared governed.
 *
 * Usage:
 *   node scripts/docs-claims-check.mjs            # check, exit 1 on drift
 *   node scripts/docs-claims-check.mjs --fix      # rewrite marked counts in place
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const COMPONENTS_DIR = join(REPO_ROOT, "packages", "ds-contracts", "components");

const FIX = process.argv.includes("--fix");

/** Marker -> deriving function. Add a row when a new claim is governed. */
const CLAIMS = {
  "component-count": deriveComponentCount,
};

/** Docs scanned for markers. */
const GOVERNED_DOCS = ["docs/normal-form.md"];

/**
 * Authoritative count — mirrors contracts-fs.ts: walk components/* and
 * count dirs that contain their canonical <Name>.contract.json.
 */
function deriveComponentCount() {
  if (!existsSync(COMPONENTS_DIR)) {
    console.error(`docs-claims-check: components dir not found at ${COMPONENTS_DIR}`);
    process.exit(2);
  }
  let count = 0;
  for (const name of readdirSync(COMPONENTS_DIR)) {
    const dir = join(COMPONENTS_DIR, name);
    if (!statSync(dir).isDirectory()) continue;
    if (existsSync(join(dir, `${name}.contract.json`))) count += 1;
  }
  return count;
}

// Matches: <!-- claim-name --> <optional whitespace> <integer>
// Captures: 1=claim name, 2=whitespace between marker and number, 3=number
const MARKER = /<!--\s*([a-z][a-z0-9-]*)\s*-->(\s*)(\d+)/g;

let drift = 0;
let governedHits = 0;

for (const file of GOVERNED_DOCS) {
  const path = join(REPO_ROOT, file);
  if (!existsSync(path)) {
    console.error(`docs-claims-check: governed doc missing: ${file}`);
    process.exit(2);
  }
  let text = readFileSync(path, "utf8");
  let fileChanged = false;

  text = text.replace(MARKER, (match, claim, gap, num) => {
    const derive = CLAIMS[claim];
    if (!derive) {
      // Unknown marker — loud, because it means a typo'd claim is silently unchecked.
      console.error(`docs-claims-check: ${file}: unknown claim marker "${claim}"`);
      process.exit(2);
    }
    governedHits += 1;
    const expected = derive();
    if (Number(num) === expected) return match;
    drift += 1;
    console.error(
      `docs-claims-check: ${file}: "${claim}" stated ${num} but derived value is ${expected}`
    );
    if (FIX) {
      fileChanged = true;
      return `<!-- ${claim} -->${gap}${expected}`;
    }
    return match;
  });

  if (FIX && fileChanged) {
    writeFileSync(path, text);
    console.log(`docs-claims-check: rewrote stale claim(s) in ${file}`);
  }
}

if (governedHits === 0) {
  console.error(
    `docs-claims-check: no claim markers found in governed docs. ` +
      `Markers must be present (e.g. "<!-- component-count --> 47") or this gate guards nothing.`
  );
  process.exit(2);
}

if (drift === 0) {
  console.log(`docs-claims-check: OK — ${governedHits} marked claim(s) match derived values.`);
  process.exit(0);
}

if (FIX) {
  console.log(`docs-claims-check: fixed ${drift} stale claim(s).`);
  process.exit(0);
}

console.error(
  `\ndocs-claims-check: ${drift} stale claim(s). ` +
    `Run \`node scripts/docs-claims-check.mjs --fix\` or edit the doc.`
);
process.exit(1);
