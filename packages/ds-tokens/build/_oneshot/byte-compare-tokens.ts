/**
 * One-shot diagnostic: compare token coverage between the old hand-authored
 * token surface and the incoming generated surface, cross-referenced against
 * every `resolvesTo` reference in the 45 component contracts.
 *
 * Invocation:
 *   pnpm exec tsx packages/ds-tokens/build/_oneshot/byte-compare-tokens.ts
 *
 * Sections emitted:
 *   A — Contract resolvesTo refs vs OLD vars (do contracts depend on tokens
 *       the old surface already exposes?)
 *   B — OLD vars vs NEW vars, prefix-shifted (regression check for cutover)
 *   C — Contract resolvesTo refs vs NEW vars (are contracts fully covered by
 *       the new surface?)
 *
 * Prefix convention:
 *   Old surface: no project prefix  e.g. --fsds-core-color-palette-neutral-500
 *   New surface: --fsds- prefix     e.g. --fsds-core-color-palette-neutral-500
 *
 * Exit code: always 0 — informational only, not a gate.
 */

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../../../../");
const OLD_CSS = join(repoRoot, "packages/ds-contracts/tokens/designTokens.css");
const NEW_CSS = join(repoRoot, "packages/ds-tokens/generated/tokens.css");
const CONTRACTS_DIR = join(repoRoot, "packages/ds-contracts");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip block comments from CSS source before scanning for var names. */
function stripCssComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Extract every CSS custom-property declaration (`--name:`) from a CSS string.
 * Returns a Set of bare names without the leading `--`.
 */
function extractVarNames(css: string): Set<string> {
  const stripped = stripCssComments(css);
  const result = new Set<string>();
  for (const line of stripped.split("\n")) {
    const m = line.match(/^\s*(--[a-zA-Z0-9_-]+)\s*:/);
    if (m) {
      result.add(m[1].slice(2)); // strip leading --
    }
  }
  return result;
}

/**
 * Recursively walk a parsed JSON value and collect every string value whose
 * key is `resolvesTo`. Returns an array of [dotPath, sourceFile] tuples.
 */
function collectResolvesTo(
  value: unknown,
  sourceFile: string,
  out: Array<[string, string]> = [],
): Array<[string, string]> {
  if (Array.isArray(value)) {
    for (const item of value) collectResolvesTo(item, sourceFile, out);
  } else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (k === "resolvesTo" && typeof v === "string") {
        out.push([v, sourceFile]);
      } else {
        collectResolvesTo(v, sourceFile, out);
      }
    }
  }
  return out;
}

/**
 * Convert a dot-notation resolvesTo path to a CSS custom-property name
 * (without leading `--`).
 *   "semantic.color.foreground.primary" → "fsds-semantic-color-foreground-primary"
 */
function dotPathToNewVarName(dotPath: string): string {
  return "fsds-" + dotPath.replace(/\./g, "-");
}

/**
 * Convert a dot-notation resolvesTo path to the OLD CSS custom-property name
 * (without leading `--`).
 *
 * NOTE: the old surface used to have no project prefix, but as of commit
 * 8df5564 ("tokens: regen tokens with fsds name in component css") the old
 * surface was regenerated with the same `--fsds-` prefix as the new one. So
 * old/new now share a naming convention. This function is kept distinct from
 * `dotPathToNewVarName` so a future divergence can be expressed without
 * threading another flag.
 *   "semantic.color.foreground.primary" → "fsds-semantic-color-foreground-primary"
 */
function dotPathToOldVarName(dotPath: string): string {
  return "fsds-" + dotPath.replace(/\./g, "-");
}

// ---------------------------------------------------------------------------
// Load old file
// ---------------------------------------------------------------------------

console.log("=".repeat(72));
console.log("  Token Coverage Diagnostic");
console.log("=".repeat(72));
console.log();

if (!existsSync(OLD_CSS)) {
  console.error(`ERROR: Old token file not found: ${OLD_CSS}`);
  process.exit(0);
}

const oldCssSrc = readFileSync(OLD_CSS, "utf-8");
const oldVars = extractVarNames(oldCssSrc);
console.log(`Old surface: ${OLD_CSS}`);
console.log(`  → ${oldVars.size} custom properties found`);
console.log();

// ---------------------------------------------------------------------------
// Load contracts
// ---------------------------------------------------------------------------

const componentsDir = join(CONTRACTS_DIR, "components");
const contractFiles: { filename: string; absPath: string }[] = [];
for (const name of readdirSync(componentsDir)) {
  const folder = join(componentsDir, name);
  if (!statSync(folder).isDirectory()) continue;
  const filename = `${name}.contract.json`;
  const absPath = join(folder, filename);
  if (existsSync(absPath)) {
    contractFiles.push({ filename, absPath });
  }
}

console.log(`Contracts dir: ${componentsDir}`);
console.log(`  → ${contractFiles.length} contract files found`);
console.log();

// contractRefs: Map from dotPath → first sourceFile seen (for reporting)
const contractRefsMap = new Map<string, string>();

for (const { filename, absPath: fullPath } of contractFiles) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(fullPath, "utf-8"));
  } catch (e) {
    console.warn(`  WARN: failed to parse ${filename}: ${String(e)}`);
    continue;
  }
  const found = collectResolvesTo(parsed, filename);
  for (const [dotPath, src] of found) {
    if (!contractRefsMap.has(dotPath)) {
      contractRefsMap.set(dotPath, src);
    }
  }
}

console.log(
  `  → ${contractRefsMap.size} unique resolvesTo paths across all contracts`,
);
console.log();

// ---------------------------------------------------------------------------
// Load new file (optional)
// ---------------------------------------------------------------------------

let newVars: Set<string> | null = null;

if (existsSync(NEW_CSS)) {
  const newCssSrc = readFileSync(NEW_CSS, "utf-8");
  newVars = extractVarNames(newCssSrc);
  console.log(`New surface: ${NEW_CSS}`);
  console.log(`  → ${newVars.size} custom properties found`);
} else {
  console.log(`New surface: ${NEW_CSS}`);
  console.log(
    `  → FILE DOES NOT EXIST YET — Sections B and C will be skipped.`,
  );
}
console.log();

// ---------------------------------------------------------------------------
// Section A: Contract refs vs OLD vars
// ---------------------------------------------------------------------------

console.log("=".repeat(72));
console.log("  Section A: Contract resolvesTo refs vs OLD token surface");
console.log(
  "  (old surface as of commit 8df5564 shares the --fsds- prefix)",
);
console.log("=".repeat(72));
console.log();

const sectionAMissing: Array<[string, string]> = [];

for (const [dotPath, srcFile] of contractRefsMap) {
  const expectedOldName = dotPathToOldVarName(dotPath);
  if (!oldVars.has(expectedOldName)) {
    sectionAMissing.push([dotPath, srcFile]);
  }
}

const aCovered = contractRefsMap.size - sectionAMissing.length;
const aPct =
  contractRefsMap.size > 0
    ? ((aCovered / contractRefsMap.size) * 100).toFixed(1)
    : "n/a";

console.log(
  `  Summary: ${contractRefsMap.size} contract refs checked, ` +
    `${sectionAMissing.length} missing in old surface ` +
    `(${aPct}% satisfied)`,
);
console.log();

if (sectionAMissing.length === 0) {
  console.log("  All contract refs are satisfied by the old token surface.");
} else {
  const preview = sectionAMissing.slice(0, 20);
  console.log(
    `  First ${preview.length} unsatisfied refs (of ${sectionAMissing.length}):`,
  );
  for (const [dotPath, srcFile] of preview) {
    const expectedVar = `--${dotPathToOldVarName(dotPath)}`;
    console.log(`    ${expectedVar.padEnd(60)} [${srcFile}]`);
  }
  if (sectionAMissing.length > 20) {
    console.log(`    ... and ${sectionAMissing.length - 20} more`);
  }
}
console.log();

// ---------------------------------------------------------------------------
// Section B: OLD vars vs NEW vars
// Both surfaces share the --fsds- prefix, so the comparison is direct.
// ---------------------------------------------------------------------------

console.log("=".repeat(72));
console.log("  Section B: OLD vars vs NEW vars");
console.log("  (direct name comparison — both surfaces use --fsds- prefix)");
console.log("=".repeat(72));
console.log();

if (newVars === null) {
  console.log("  SKIPPED — new token file does not exist yet.");
} else {
  const sectionBMissing: string[] = [];
  for (const oldName of oldVars) {
    if (!newVars.has(oldName)) {
      sectionBMissing.push(oldName);
    }
  }

  const bPct =
    oldVars.size > 0
      ? (
          ((oldVars.size - sectionBMissing.length) / oldVars.size) *
          100
        ).toFixed(2)
      : "n/a";

  console.log(
    `  Summary: ${oldVars.size} old vars checked, ` +
      `${sectionBMissing.length} missing in new surface ` +
      `(${bPct}% coverage)`,
  );
  console.log();

  if (sectionBMissing.length === 0) {
    console.log("  All old vars have a counterpart in the new surface.");
  } else {
    const preview = sectionBMissing.slice(0, 20);
    console.log(
      `  First ${preview.length} old vars missing from new (of ${sectionBMissing.length}):`,
    );
    for (const name of preview) {
      console.log(`    --${name}`);
    }
    if (sectionBMissing.length > 20) {
      console.log(`    ... and ${sectionBMissing.length - 20} more`);
    }
  }
}
console.log();

// ---------------------------------------------------------------------------
// Section C: Contract refs vs NEW vars
// ---------------------------------------------------------------------------

console.log("=".repeat(72));
console.log("  Section C: Contract resolvesTo refs vs NEW token surface");
console.log(
  "  (e.g. semantic.color.foreground.primary → --fsds-semantic-color-foreground-primary)",
);
console.log("=".repeat(72));
console.log();

if (newVars === null) {
  console.log("  SKIPPED — new token file does not exist yet.");
} else {
  const sectionCMissing: Array<[string, string]> = [];
  for (const [dotPath, srcFile] of contractRefsMap) {
    const expectedNewName = dotPathToNewVarName(dotPath);
    if (!newVars.has(expectedNewName)) {
      sectionCMissing.push([dotPath, srcFile]);
    }
  }

  const cCovered = contractRefsMap.size - sectionCMissing.length;
  const cPct =
    contractRefsMap.size > 0
      ? ((cCovered / contractRefsMap.size) * 100).toFixed(1)
      : "n/a";

  console.log(
    `  Summary: ${contractRefsMap.size} contract refs checked, ` +
      `${sectionCMissing.length} missing in new surface ` +
      `(${cPct}% satisfied)`,
  );
  console.log();

  if (sectionCMissing.length === 0) {
    console.log("  All contract refs are satisfied by the new token surface.");
  } else {
    const preview = sectionCMissing.slice(0, 20);
    console.log(
      `  First ${preview.length} unsatisfied refs (of ${sectionCMissing.length}):`,
    );
    for (const [dotPath, srcFile] of preview) {
      const expectedVar = `--${dotPathToNewVarName(dotPath)}`;
      console.log(`    ${expectedVar.padEnd(70)} [${srcFile}]`);
    }
    if (sectionCMissing.length > 20) {
      console.log(`    ... and ${sectionCMissing.length - 20} more`);
    }
  }
}
console.log();

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

console.log("=".repeat(72));
console.log("  Diagnostic complete. Exit 0 (informational only).");
console.log("=".repeat(72));
