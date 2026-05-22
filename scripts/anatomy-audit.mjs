#!/usr/bin/env node
/**
 * Anatomy audit — dual-metric coverage report.
 *
 * Tracks two independent metrics per component:
 *
 *   contract-anatomy coverage: declared parts (from contract.anatomy)
 *     that have authored entries in <Component>.styles.json. Strict
 *     ceiling: a component is "fully styled" only when every declared
 *     non-infrastructural part has a selector authored for it.
 *
 *   rendered-DOM coverage: BEM classes actually emitted by the React
 *     TSX that have a matching authored selector. This is the
 *     "functionally styled" metric — a component can be fully covered
 *     here while failing the strict anatomy metric, because the
 *     generator doesn't render every declared part. That isn't a
 *     styling failure; it's a realization mismatch.
 *
 * Why two metrics: the convergence's "contract is source of truth"
 * doctrine puts the declared anatomy in the lead role, but `styles.json`
 * can only meaningfully target classes that the framework emitters
 * actually project. Round 3 surfaced this gap (Breadcrumbs declares
 * link/current/separator/overflow but the TSX renders only nav+ol).
 * Reporting both metrics keeps the recon honest.
 *
 * Usage:
 *   node scripts/anatomy-audit.mjs [--verbose]
 *
 *   Default output is one row per component plus a summary. --verbose
 *   adds the per-component list of (declared, rendered, authored) sets.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const COMPONENTS_DIR = join(REPO_ROOT, "packages", "ds-contracts", "components");
const REACT_DIR = join(REPO_ROOT, "packages", "ds-react", "src", "components");

const VERBOSE = process.argv.includes("--verbose");

const INFRASTRUCTURAL_PARTS = new Set(["root", "focus", "context", "provider"]);
const STATE_KEYS = new Set([
  "hover", "focus", "focus-visible", "focus-within", "active", "disabled",
  "checked", "expanded", "pressed", "selected",
]);

function listComponents() {
  return readdirSync(COMPONENTS_DIR).filter((entry) => {
    return statSync(join(COMPONENTS_DIR, entry)).isDirectory();
  }).sort();
}

function readJson(p) {
  try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
}

function getDeclaredParts(contract) {
  const a = contract?.anatomy;
  if (!a) return [];
  if (Array.isArray(a)) return a;
  return a.parts || [];
}

function getCssPrefix(contract) {
  if (contract?.cssPrefix) return contract.cssPrefix;
  return (contract?.name || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Extract BEM classes from the React TSX. Matches `<prefix>__<part>` and
 * `<prefix>--<value>` patterns inside quoted strings (className literals).
 * Not perfect — won't catch dynamically-composed class names — but covers
 * the 99% case where emitters write `"prefix__part"` literally.
 */
function extractRenderedClasses(tsxPath, prefix) {
  if (!existsSync(tsxPath)) return { parts: new Set(), modifiers: new Set() };
  const source = readFileSync(tsxPath, "utf8");
  // Escape regex metachars in the prefix
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const partRe = new RegExp(`['"\`]${escaped}__([a-zA-Z][a-zA-Z0-9_-]*)`, "g");
  const modRe = new RegExp(`['"\`]${escaped}--([a-zA-Z][a-zA-Z0-9_-]*)`, "g");
  const parts = new Set();
  const modifiers = new Set();
  let m;
  while ((m = partRe.exec(source)) !== null) parts.add(m[1]);
  while ((m = modRe.exec(source)) !== null) modifiers.add(m[1]);
  return { parts, modifiers };
}

/**
 * Map a styles.json key to the anatomy part it targets, if any.
 * Returns null when the key doesn't correspond to a single anatomy part
 * (e.g. compound selectors, state shorthands, variant modifiers).
 */
function styleKeyToPart(key, declaredParts, prefix) {
  if (key === "root") return "root";
  if (STATE_KEYS.has(key)) return null;
  if (key.startsWith("--")) return null;
  if (key.startsWith(":") || key.startsWith("[")) return null;
  if (key.startsWith("__")) {
    const name = key.slice(2);
    return declaredParts.includes(name) ? name : null;
  }
  if (key.startsWith(".") || key.startsWith("#") || key.startsWith("*")) {
    // Compound selector — see if it mentions any anatomy part
    for (const part of declaredParts) {
      if (key.includes(`__${part}`)) return part;
    }
    return null;
  }
  // Compound with combinators?
  if (/[\s+~>]/.test(key) || (key.includes(":") && key.includes("__"))) {
    for (const part of declaredParts) {
      if (key.includes(`__${part}`)) return part;
    }
    return null;
  }
  // Bare anatomy part
  if (declaredParts.includes(key)) return key;
  return null;
}

function auditComponent(name) {
  const contractPath = join(COMPONENTS_DIR, name, `${name}.contract.json`);
  const stylesPath = join(COMPONENTS_DIR, name, `${name}.styles.json`);
  const tsxPath = join(REACT_DIR, name, `${name}.tsx`);

  const contract = readJson(contractPath);
  if (!contract) return null;
  const styles = readJson(stylesPath) || {};

  const declaredParts = getDeclaredParts(contract);
  const prefix = getCssPrefix(contract);
  const { parts: renderedParts, modifiers: renderedModifiers } = extractRenderedClasses(tsxPath, prefix);

  // Anatomy parts that should be styled (exclude infrastructural).
  const declaredStyleable = declaredParts.filter((p) => !INFRASTRUCTURAL_PARTS.has(p));

  // Which declared parts have a styles.json key that targets them.
  const authoredParts = new Set();
  for (const key of Object.keys(styles)) {
    const targeted = styleKeyToPart(key, declaredParts, prefix);
    if (targeted) authoredParts.add(targeted);
  }

  // Coverage metrics.
  const contractCovered = declaredStyleable.filter((p) => authoredParts.has(p)).length;
  const contractMissing = declaredStyleable.filter((p) => !authoredParts.has(p));
  const contractCoverage = declaredStyleable.length === 0
    ? 100
    : Math.round((contractCovered / declaredStyleable.length) * 100);

  const renderedStyleable = [...renderedParts]; // Excludes root (no __ class).
  const renderedCovered = renderedStyleable.filter((p) => authoredParts.has(p)).length;
  const renderedMissing = renderedStyleable.filter((p) => !authoredParts.has(p));
  const renderedCoverage = renderedStyleable.length === 0
    ? 100
    : Math.round((renderedCovered / renderedStyleable.length) * 100);

  // Realization mismatch: declared parts not rendered, or rendered parts not declared.
  const declaredNotRendered = declaredStyleable.filter((p) => !renderedParts.has(p));
  const renderedNotDeclared = renderedStyleable.filter((p) => !declaredParts.includes(p));

  return {
    name,
    declaredParts: declaredStyleable,
    renderedParts: renderedStyleable,
    authoredParts: [...authoredParts],
    contractCovered,
    contractMissing,
    contractCoverage,
    renderedCovered,
    renderedMissing,
    renderedCoverage,
    declaredNotRendered,
    renderedNotDeclared,
    selectorCount: Object.keys(styles).length,
  };
}

const rows = listComponents()
  .map(auditComponent)
  .filter(Boolean);

// Sort by combined coverage (worst first) to surface high-leverage work.
rows.sort((a, b) => {
  const aScore = (a.contractCoverage + a.renderedCoverage) / 2;
  const bScore = (b.contractCoverage + b.renderedCoverage) / 2;
  return aScore - bScore;
});

const COL = {
  name: 18,
  decl: 5,
  rend: 5,
  auth: 5,
  ctx: 7,
  rdr: 7,
  mismatch: 14,
};

function pad(s, n) {
  return (String(s) + " ".repeat(n)).slice(0, n);
}

console.log(
  pad("component", COL.name),
  pad("decl", COL.decl),
  pad("rend", COL.rend),
  pad("auth", COL.auth),
  pad("c-cov%", COL.ctx),
  pad("r-cov%", COL.rdr),
  pad("d!=r", COL.mismatch),
);
console.log(
  pad("---------", COL.name),
  pad("----", COL.decl),
  pad("----", COL.rend),
  pad("----", COL.auth),
  pad("------", COL.ctx),
  pad("------", COL.rdr),
  pad("------------", COL.mismatch),
);

for (const r of rows) {
  const mismatch = r.declaredNotRendered.length > 0
    ? `dec>ren:${r.declaredNotRendered.length}`
    : (r.renderedNotDeclared.length > 0 ? `ren>dec:${r.renderedNotDeclared.length}` : "—");
  console.log(
    pad(r.name, COL.name),
    pad(r.declaredParts.length, COL.decl),
    pad(r.renderedParts.length, COL.rend),
    pad(r.authoredParts.length, COL.auth),
    pad(r.contractCoverage + "%", COL.ctx),
    pad(r.renderedCoverage + "%", COL.rdr),
    pad(mismatch, COL.mismatch),
  );
}

const contractFull = rows.filter((r) => r.contractCoverage === 100).length;
const renderedFull = rows.filter((r) => r.renderedCoverage === 100).length;
console.log(
  `\nContract-anatomy coverage: ${contractFull}/45 fully styled.`,
);
console.log(
  `Rendered-DOM coverage:     ${renderedFull}/45 fully styled.`,
);
console.log(
  `\nRealization mismatches: ${rows.filter((r) => r.declaredNotRendered.length > 0).length}` +
    ` components have declared parts not rendered;` +
    ` ${rows.filter((r) => r.renderedNotDeclared.length > 0).length} have rendered classes not declared.`,
);

if (VERBOSE) {
  console.log("\n=== Detail per component ===");
  for (const r of rows) {
    console.log(`\n${r.name}:`);
    console.log(`  declared (${r.declaredParts.length}): [${r.declaredParts.join(", ")}]`);
    console.log(`  rendered (${r.renderedParts.length}): [${r.renderedParts.join(", ")}]`);
    console.log(`  authored (${r.authoredParts.length}): [${r.authoredParts.join(", ")}]`);
    if (r.declaredNotRendered.length > 0) {
      console.log(`  declared-not-rendered (${r.declaredNotRendered.length}): [${r.declaredNotRendered.join(", ")}]`);
    }
    if (r.renderedNotDeclared.length > 0) {
      console.log(`  rendered-not-declared (${r.renderedNotDeclared.length}): [${r.renderedNotDeclared.join(", ")}]`);
    }
  }
}
