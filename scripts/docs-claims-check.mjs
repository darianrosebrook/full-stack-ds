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
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const COMPONENTS_DIR = join(REPO_ROOT, "packages", "ds-contracts", "components");
const RAIL_FRAMEWORKS_DIR = join(
  REPO_ROOT, "packages", "ds-codegen", "src", "validation", "frameworks",
);
const TARGET_REGISTRY = join(REPO_ROOT, "fsds.targets.json");
const ICONS_DIR = join(REPO_ROOT, "packages", "ds-iconography", "icons");

const FIX = process.argv.includes("--fix");

/** Marker -> deriving function. Add a row when a new claim is governed. */
const CLAIMS = {
  "component-count": deriveComponentCount,
  "rail-admitted-target-count": deriveRailAdmittedTargetCount,
  "registered-target-count": deriveRegisteredTargetCount,
  "icon-count": deriveIconCount,
};

/**
 * Docs scanned for markers: every tracked markdown file.
 *
 * This used to be a hardcoded one-entry list (`docs/normal-form.md`), which
 * made the gate structurally unable to catch what it was built for. Prose
 * counts rotted in every OTHER doc precisely because they were unreachable:
 * admission-rail.md claimed "53 components ... 265 artifact groups, 1024
 * generated files" while the corpus was 49 and the manifest said 294/1422.
 * A marker is now honoured wherever an author puts it, so opting a claim in
 * is a one-line doc edit with no list to keep in sync.
 */
function governedDocs() {
  try {
    return execFileSync("git", ["ls-files", "-z", "*.md"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    })
      .split("\0")
      .filter(Boolean);
  } catch (err) {
    console.error(`docs-claims-check: could not list tracked docs — ${err.message}`);
    process.exit(2);
  }
}

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

/**
 * Rail-admitted targets: framework modules that SELF-DECLARE an
 * AdmissionDescriptor. This mirrors how the registry is actually built —
 * `validation/admission-descriptor.ts` aggregates one descriptor per module —
 * so the count self-corrects when a target is added or withdrawn.
 *
 * Matching `export const <name>AdmissionDescriptor` (not a bare mention of
 * the type) is deliberate: `figma.ts` imports rail types but declares no
 * descriptor, because figma is generate-admitted and rail-EXCLUDED. A looser
 * grep would silently count it and inflate the number this gate exists to pin.
 */
function deriveRailAdmittedTargetCount() {
  if (!existsSync(RAIL_FRAMEWORKS_DIR)) {
    console.error(`docs-claims-check: rail frameworks dir not found at ${RAIL_FRAMEWORKS_DIR}`);
    process.exit(2);
  }
  const declares = /export\s+const\s+[A-Za-z0-9_]*AdmissionDescriptor\b/;
  let count = 0;
  for (const name of readdirSync(RAIL_FRAMEWORKS_DIR)) {
    if (!name.endsWith(".ts") || name.endsWith(".test.ts")) continue;
    if (declares.test(readFileSync(join(RAIL_FRAMEWORKS_DIR, name), "utf8"))) count += 1;
  }
  return count;
}

/** Registered codegen targets — the `targets` array in fsds.targets.json. */
function deriveRegisteredTargetCount() {
  if (!existsSync(TARGET_REGISTRY)) {
    console.error(`docs-claims-check: target registry not found at ${TARGET_REGISTRY}`);
    process.exit(2);
  }
  const registry = JSON.parse(readFileSync(TARGET_REGISTRY, "utf8"));
  if (!Array.isArray(registry.targets)) {
    console.error(`docs-claims-check: fsds.targets.json has no targets array`);
    process.exit(2);
  }
  return registry.targets.length;
}

/** Icon corpus — directories under the iconography package's icons/ root. */
function deriveIconCount() {
  if (!existsSync(ICONS_DIR)) {
    console.error(`docs-claims-check: icons dir not found at ${ICONS_DIR}`);
    process.exit(2);
  }
  let count = 0;
  for (const name of readdirSync(ICONS_DIR)) {
    if (statSync(join(ICONS_DIR, name)).isDirectory()) count += 1;
  }
  return count;
}

// Matches: <!-- claim-name --> <optional whitespace> <integer>
// Captures: 1=claim name, 2=whitespace between marker and number, 3=number
const MARKER = /<!--\s*([a-z][a-z0-9-]*)\s*-->(\s*)(\d+)/g;

let drift = 0;
let governedHits = 0;

for (const file of governedDocs()) {
  const path = join(REPO_ROOT, file);
  // Tracked but not materialised (sparse checkout in a CAWS worktree) — the
  // canonical checkout still gates it, so skipping here is not a hole.
  if (!existsSync(path)) continue;
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
