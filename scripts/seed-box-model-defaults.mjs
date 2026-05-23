#!/usr/bin/env node
/**
 * Seed `box-model.*` defaults into component tokens sidecars by category.
 *
 * Reads each contract's top-level `category` field and merges the
 * corresponding `box-model.*` entries into `<Name>.tokens.json` so the
 * component's box-model slots resolve to category-keyed semantic tokens
 * (e.g. action.size.medium.padding-block) instead of the literal `0`
 * defaults inherited from the box-model primitive.
 *
 * The script is the seed pass — it gets us 50% of the way. After running,
 * each component's box-model surface points at a sensible category default
 * (medium size, surface padding, etc.). Authors then hand-tweak per
 * component in follow-up commits where category defaults are wrong.
 *
 * Idempotent rules:
 *   - Only writes `box-model.*` keys; never touches component-local slots.
 *   - Never OVERWRITES an existing `box-model.*` entry — manual edits
 *     survive re-runs of this script.
 *   - Skips contracts with no category field (warns).
 *   - Preserves field order: writes box-model keys at the top of the
 *     sidecar, before existing component-local entries.
 *
 * Category → default slot mapping is encoded once in CATEGORY_DEFAULTS
 * below. Add a new category by adding it to the contract schema enum
 * AND to this table.
 *
 * Usage:
 *   node scripts/seed-box-model-defaults.mjs
 *
 *   By default seeds ALL contracts under packages/ds-contracts/components/.
 *   Pass component names as args to limit:
 *
 *   node scripts/seed-box-model-defaults.mjs Button Card Dialog
 *
 *   Add `--dry-run` to preview without writing:
 *
 *   node scripts/seed-box-model-defaults.mjs --dry-run
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(
  REPO_ROOT,
  "packages",
  "ds-contracts",
  "components",
);

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY = new Set(args.filter((a) => !a.startsWith("--")));

/**
 * Category → box-model slot defaults.
 *
 * Each entry maps the 14 box-model slot names to a `tokenResolution`
 * (either { resolvesTo, fallback, layer } for token-backed slots or
 * { literal } for non-themable defaults).
 *
 * Convention:
 *   - Sizing categories (action, input) point at <category>.size.medium.*
 *     because medium is the default size variant. Components that author
 *     `--small` / `--large` variants override the same box-model slot at
 *     the variant selector via styles.json (see docs/box-model-primitive.md).
 *   - Container categories (surface, feedback) point at <category>.size.*
 *     (no size variant — padding is single-tier).
 *   - Glyph and structure: glyph uses a single extent token; structure
 *     uses gap-only (children carry their own padding).
 *
 * Fallback literals are the resolved value at default density / default
 * brand. They're the second arg of var() so the component renders correctly
 * even if the global token graph isn't loaded.
 */
const CATEGORY_DEFAULTS = {
  action: {
    "box-model.padding-block-start": {
      resolvesTo: "semantic.action.size.medium.padding-block",
      fallback: "8px",
      layer: "semantic",
    },
    "box-model.padding-block-end": {
      resolvesTo: "semantic.action.size.medium.padding-block",
      fallback: "8px",
      layer: "semantic",
    },
    "box-model.padding-inline-start": {
      resolvesTo: "semantic.action.size.medium.padding-inline",
      fallback: "12px",
      layer: "semantic",
    },
    "box-model.padding-inline-end": {
      resolvesTo: "semantic.action.size.medium.padding-inline",
      fallback: "12px",
      layer: "semantic",
    },
    "box-model.gap": {
      resolvesTo: "semantic.action.size.medium.gap",
      fallback: "8px",
      layer: "semantic",
    },
    "box-model.min-height": {
      resolvesTo: "semantic.action.size.medium.min-height",
      fallback: "36px",
      layer: "semantic",
    },
    "box-model.min-width": {
      resolvesTo: "semantic.action.size.medium.min-width",
      fallback: "36px",
      layer: "semantic",
    },
  },
  input: {
    "box-model.padding-block-start": {
      resolvesTo: "semantic.input.size.medium.padding-block",
      fallback: "8px",
      layer: "semantic",
    },
    "box-model.padding-block-end": {
      resolvesTo: "semantic.input.size.medium.padding-block",
      fallback: "8px",
      layer: "semantic",
    },
    "box-model.padding-inline-start": {
      resolvesTo: "semantic.input.size.medium.padding-inline",
      fallback: "12px",
      layer: "semantic",
    },
    "box-model.padding-inline-end": {
      resolvesTo: "semantic.input.size.medium.padding-inline",
      fallback: "12px",
      layer: "semantic",
    },
    "box-model.gap": {
      resolvesTo: "semantic.input.size.medium.gap",
      fallback: "8px",
      layer: "semantic",
    },
    "box-model.min-height": {
      resolvesTo: "semantic.input.size.medium.min-height",
      fallback: "36px",
      layer: "semantic",
    },
  },
  surface: {
    "box-model.padding-block-start": {
      resolvesTo: "semantic.surface.size.padding-block",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.padding-block-end": {
      resolvesTo: "semantic.surface.size.padding-block",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.padding-inline-start": {
      resolvesTo: "semantic.surface.size.padding-inline",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.padding-inline-end": {
      resolvesTo: "semantic.surface.size.padding-inline",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.gap": {
      resolvesTo: "semantic.surface.size.gap",
      fallback: "12px",
      layer: "semantic",
    },
    "box-model.min-width": {
      resolvesTo: "semantic.surface.size.min-width",
      fallback: "64px",
      layer: "semantic",
    },
  },
  feedback: {
    "box-model.padding-block-start": {
      resolvesTo: "semantic.feedback.size.padding-block",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.padding-block-end": {
      resolvesTo: "semantic.feedback.size.padding-block",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.padding-inline-start": {
      resolvesTo: "semantic.feedback.size.padding-inline",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.padding-inline-end": {
      resolvesTo: "semantic.feedback.size.padding-inline",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.gap": {
      resolvesTo: "semantic.feedback.size.gap",
      fallback: "12px",
      layer: "semantic",
    },
  },
  glyph: {
    // Glyphs are square-extent atoms with no padding by default.
    // Width/height resolve to the medium glyph extent; consumers override
    // at instance for small/large via the same slot.
    "box-model.width": {
      resolvesTo: "semantic.glyph.size.medium.extent",
      fallback: "16px",
      layer: "semantic",
    },
    "box-model.height": {
      resolvesTo: "semantic.glyph.size.medium.extent",
      fallback: "16px",
      layer: "semantic",
    },
  },
  display: {
    // Display components are inline content / structural visuals that
    // size to context: Text, Label, Chip, Image, Links, Stat, Truncate,
    // Divider. No fixed width/height (auto from the primitive default).
    // Only gap is opinionated — for the inline-children case (a Text
    // with a leading icon, a Chip's label+icon row).
    "box-model.gap": {
      resolvesTo: "semantic.display.size.gap",
      fallback: "4px",
      layer: "semantic",
    },
  },
  structure: {
    // Structures arrange children; the root carries gap, children carry
    // their own padding.
    "box-model.gap": {
      resolvesTo: "semantic.structure.size.gap",
      fallback: "8px",
      layer: "semantic",
    },
  },
};

function listComponents() {
  if (!existsSync(COMPONENTS_DIR)) {
    throw new Error(`Components directory not found: ${COMPONENTS_DIR}`);
  }
  return readdirSync(COMPONENTS_DIR)
    .filter((name) => {
      const folder = path.join(COMPONENTS_DIR, name);
      return statSync(folder).isDirectory();
    })
    .sort();
}

function readJson(filepath) {
  return JSON.parse(readFileSync(filepath, "utf-8"));
}

function writeJson(filepath, data) {
  writeFileSync(filepath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function seedComponent(name) {
  const contractPath = path.join(COMPONENTS_DIR, name, `${name}.contract.json`);
  if (!existsSync(contractPath)) {
    return { status: "missing-contract", name };
  }
  const contract = readJson(contractPath);
  const category = contract.category;
  if (!category) {
    return { status: "no-category", name };
  }
  const defaults = CATEGORY_DEFAULTS[category];
  if (!defaults) {
    return { status: "unknown-category", name, category };
  }

  const tokensPath = path.join(COMPONENTS_DIR, name, `${name}.tokens.json`);
  const existing = existsSync(tokensPath) ? readJson(tokensPath) : {};

  // Idempotent merge: only add box-model.* keys that aren't already
  // present. Component-local slots pass through untouched.
  const added = [];
  const out = {};
  // Insert defaults first (so they appear at the top of the file), then
  // existing entries. Existing keys win — both for box-model overrides
  // and for component-local slots.
  for (const [slot, resolution] of Object.entries(defaults)) {
    if (!(slot in existing)) {
      out[slot] = resolution;
      added.push(slot);
    }
  }
  for (const [k, v] of Object.entries(existing)) {
    out[k] = v;
  }

  if (added.length === 0) {
    return { status: "already-seeded", name, category };
  }

  if (!DRY_RUN) {
    writeJson(tokensPath, out);
  }
  return { status: "seeded", name, category, added };
}

const all = listComponents().filter((n) => ONLY.size === 0 || ONLY.has(n));
const results = all.map(seedComponent);

const counts = {};
for (const r of results) counts[r.status] = (counts[r.status] || 0) + 1;

for (const r of results) {
  switch (r.status) {
    case "seeded":
      console.log(`  SEEDED   ${r.name.padEnd(16)} category=${r.category}  +${r.added.length} slot(s)`);
      for (const s of r.added) console.log(`             ${s}`);
      break;
    case "already-seeded":
      console.log(`  SKIP     ${r.name.padEnd(16)} category=${r.category}  (all slots already authored)`);
      break;
    case "no-category":
      console.log(`  NO-CAT   ${r.name.padEnd(16)} (contract has no top-level category — add one to use this script)`);
      break;
    case "unknown-category":
      console.log(`  UNKNOWN  ${r.name.padEnd(16)} category="${r.category}" not in CATEGORY_DEFAULTS — extend this script.`);
      break;
    case "missing-contract":
      console.log(`  MISSING  ${r.name.padEnd(16)} no contract.json found`);
      break;
  }
}

console.log(
  `\nDone${DRY_RUN ? " (dry-run, no files written)" : ""}. ` +
    Object.entries(counts).map(([k, v]) => `${k}=${v}`).join("  ") +
    `  total=${results.length}`,
);
