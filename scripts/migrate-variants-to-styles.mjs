#!/usr/bin/env node
/**
 * Variant slot redirection migration.
 *
 * Converts the variant-keyed slot pattern in component tokens/styles to
 * the slot-redirection pattern documented in
 * docs/box-model-primitive.md.
 *
 * Before (Button):
 *   tokens.json: button.color.background.{default, primary, secondary, ...}
 *   styles.json: "--primary": { background-color: { resolvesTo: button.color.background.primary } }
 *
 * After:
 *   tokens.json: button.color.background.default (canonical)
 *   styles.json: "--primary": { button.color.background.default: { resolvesTo: <semantic.path the .primary slot used to point to> } }
 *
 * The script runs in two phases per component:
 *
 *   Phase 1 — identify slot families.
 *     A "family" is a set of slots sharing a prefix path with different
 *     terminal segments. e.g. `button.color.background.{default, primary,
 *     secondary, hover, disabled}` is one family. A family is migratable
 *     iff it has a `default` sibling, which is treated as the canonical.
 *
 *     Families without a `default` (e.g. `switch.size.{sm,md,lg}.track.width`)
 *     are reported and skipped. Human creates the canonical name
 *     (or renames `md` → `default`) and reruns.
 *
 *   Phase 2 — rewrite styles.json entries that read the variant slots
 *     and remove the variant slots from tokens.json.
 *
 *     For each variant slot in a migratable family (any sibling that
 *     isn't the canonical), the script:
 *     - finds every styles.json entry with `resolvesTo: "<variant slot>"`
 *     - replaces it with a slot-path entry that redefines the canonical:
 *       `{ <canonical slot>: { resolvesTo: <variant slot's resolvesTo>, fallback: <its fallback> } }`
 *     - drops the variant slot from tokens.json
 *
 * Heuristic limits:
 *   - The script only touches color / size / text / motion families that
 *     have a clear `.default` canonical. Families with anatomy-part
 *     infixes (e.g. `switch.color.track.background.default` vs `...checked`)
 *     are handled — the family's prefix is everything before the last
 *     segment, so the canonical is `switch.color.track.background.default`
 *     and the variants are `switch.color.track.background.{checked, disabled}`.
 *   - State-keyed terminal segments (hover/active/focus/disabled/checked)
 *     get the same treatment — those redirections land at state selectors
 *     in styles.json (which it already does, just at a different key).
 *
 * Usage:
 *   node scripts/migrate-variants-to-styles.mjs                       # all components
 *   node scripts/migrate-variants-to-styles.mjs Button Switch         # specific
 *   node scripts/migrate-variants-to-styles.mjs --dry-run             # report only
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(REPO_ROOT, "packages", "ds-contracts", "components");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const ONLY = new Set(args.filter((a) => !a.startsWith("--")));

// Last-segment names treated as canonical. `default` is the kind/state
// canonical (Button's primary/secondary kinds canonicalize to `default`);
// `medium` is the size canonical (Button's small/medium/large sizes
// canonicalize to `medium`). The script prefers `default` when both exist
// (sibling members include both `default` and `medium`).
const CANONICAL_KEYS = ["default", "medium"];

// Recognized variant suffixes. A family is treated as a variant family
// only when at least one non-canonical member's last segment is in this
// set. Otherwise the script treats co-prefixed slots as independent
// concepts that happen to share a structural prefix (e.g.
// `button.size.radius` and `button.size.border` aren't variants of
// each other).
const VARIANT_SUFFIXES = new Set([
  // size variants
  "small", "medium", "large", "xs", "sm", "md", "lg", "xl",
  // kind variants
  "primary", "secondary", "tertiary", "quaternary", "destructive",
  "ghost", "outline", "link", "danger", "brand", "subtle", "default",
  // state variants
  "hover", "active", "focus", "focus-visible", "disabled", "checked",
  "selected", "pressed", "expanded", "loading", "error", "warning",
  "success", "info",
  // checkbox/switch states
  "indeterminate", "on", "off",
]);

function listComponents() {
  return readdirSync(COMPONENTS_DIR)
    .filter((n) => statSync(path.join(COMPONENTS_DIR, n)).isDirectory())
    .sort();
}

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf-8"));
}

function writeJson(p, data) {
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/**
 * Group slot keys into families. A family is identified by everything
 * EXCEPT the last segment of the dotted path. A family is migratable iff
 * one of its members' last segment is the canonical (`default`).
 *
 * Returns: Map<family-prefix, { canonical: slot-name | null, variants: slot-name[] }>
 */
function groupByFamily(tokens, cssPrefix) {
  const families = new Map();
  for (const key of Object.keys(tokens)) {
    if (!key.startsWith(`${cssPrefix}.`)) continue; // skip box-model.* and others
    const segments = key.split(".");
    if (segments.length < 3) continue; // need at least <prefix>.<dim>.<key>
    const prefix = segments.slice(0, -1).join(".");
    const last = segments[segments.length - 1];
    let entry = families.get(prefix);
    if (!entry) {
      entry = { canonical: null, variants: [] };
      families.set(prefix, entry);
    }
    if (CANONICAL_KEYS.includes(last)) {
      // Prefer the first canonical hit (= "default" since it comes first
      // in CANONICAL_KEYS). If a family has BOTH `default` and `medium`,
      // `default` wins and `medium` is treated as a variant.
      if (entry.canonical === null) {
        entry.canonical = key;
      } else {
        entry.variants.push(key);
      }
    } else {
      entry.variants.push(key);
    }
  }
  return families;
}

/**
 * Walk styles.json looking for entries whose `resolvesTo` matches any of
 * the variant slot paths in `variantSet`. Returns a list of mutations:
 *   { selector, property, oldEntry, variantSlot, canonicalSlot }
 */
function findStylesUsages(styles, variantSet, canonicalBySlot) {
  const mutations = [];
  for (const [selectorKey, block] of Object.entries(styles)) {
    if (!block || typeof block !== "object") continue;
    for (const [property, entry] of Object.entries(block)) {
      if (!entry || typeof entry !== "object") continue;
      const target = entry.resolvesTo;
      if (typeof target !== "string") continue;
      if (!variantSet.has(target)) continue;
      mutations.push({
        selector: selectorKey,
        property,
        oldEntry: entry,
        variantSlot: target,
        canonicalSlot: canonicalBySlot.get(target),
      });
    }
  }
  return mutations;
}

/**
 * Apply mutations to styles.json. Returns the mutated styles object.
 *
 * For each mutation:
 *   - At the selector, REMOVE the property→{resolvesTo:variant} entry
 *   - At the same selector, ADD a property→entry where:
 *       property = the canonical slot path (e.g. "button.color.background.default")
 *       entry = { resolvesTo: <the variant slot's resolvesTo from tokens.json>,
 *                 fallback: <same> }
 *   - If multiple mutations at the same selector redefine the SAME
 *     canonical slot, the last one wins (with a warning). This shouldn't
 *     happen in well-formed contracts but the script is defensive.
 */
function applyStylesMutations(styles, mutations, tokens) {
  const out = JSON.parse(JSON.stringify(styles)); // deep clone
  const warnings = [];
  for (const m of mutations) {
    const block = out[m.selector];
    if (!block) continue;
    // Remove old property→{resolvesTo: variantSlot} entry
    delete block[m.property];
    // Add canonical-keyed entry pointing to whatever the variant slot used to
    const variantDef = tokens[m.variantSlot];
    if (!variantDef) continue;
    const newEntry = {};
    if (typeof variantDef.resolvesTo === "string") {
      newEntry.resolvesTo = variantDef.resolvesTo;
      if (typeof variantDef.fallback === "string") {
        newEntry.fallback = variantDef.fallback;
      }
    } else if (typeof variantDef.literal === "string") {
      newEntry.literal = variantDef.literal;
      newEntry.platforms = ["web", "ios", "android"];
    }
    if (block[m.canonicalSlot] !== undefined) {
      warnings.push(
        `${m.selector}: ${m.canonicalSlot} already redefined — last assignment wins`,
      );
    }
    block[m.canonicalSlot] = newEntry;
  }
  return { styles: out, warnings };
}

function migrateComponent(name) {
  const contractPath = path.join(COMPONENTS_DIR, name, `${name}.contract.json`);
  if (!existsSync(contractPath)) return { status: "missing-contract", name };
  const contract = readJson(contractPath);
  const cssPrefix = contract.cssPrefix ?? name.toLowerCase();

  const tokensPath = path.join(COMPONENTS_DIR, name, `${name}.tokens.json`);
  const stylesPath = path.join(COMPONENTS_DIR, name, `${name}.styles.json`);
  if (!existsSync(tokensPath) || !existsSync(stylesPath)) {
    return { status: "missing-sidecars", name };
  }
  const tokens = readJson(tokensPath);
  const styles = readJson(stylesPath);

  const families = groupByFamily(tokens, cssPrefix);

  const migratable = [];
  const skipped = [];
  const canonicalBySlot = new Map(); // variant slot → canonical slot
  const variantSet = new Set();

  for (const [prefix, fam] of families.entries()) {
    // A "family" needs at least 2 sibling members at the same prefix to
    // be considered. Single-member entries (e.g. button.text.weight,
    // button.motion.duration.fast) are not variant families even though
    // they share a prefix structure — they're just regular slots.
    const totalMembers =
      fam.variants.length + (fam.canonical !== null ? 1 : 0);
    if (totalMembers < 2) continue;
    if (fam.variants.length === 0) continue;
    // Family must contain at least one recognized variant suffix.
    // Otherwise the co-prefixed slots are independent concepts.
    const hasVariantSuffix = fam.variants.some((v) =>
      VARIANT_SUFFIXES.has(v.split(".").pop()),
    );
    if (!hasVariantSuffix) continue;
    if (!fam.canonical) {
      skipped.push({ prefix, variants: fam.variants });
      continue;
    }
    migratable.push({ prefix, canonical: fam.canonical, variants: fam.variants });
    for (const v of fam.variants) {
      canonicalBySlot.set(v, fam.canonical);
      variantSet.add(v);
    }
  }

  if (variantSet.size === 0) {
    return { status: "nothing-to-migrate", name, skipped };
  }

  const mutations = findStylesUsages(styles, variantSet, canonicalBySlot);

  // The set of variant slots that have at least one styles.json reference.
  // Slots referenced by nothing are still removed from tokens.json (they
  // were dead code in the variant pattern).
  const referencedVariants = new Set(mutations.map((m) => m.variantSlot));
  const orphans = [...variantSet].filter((v) => !referencedVariants.has(v));

  const { styles: newStyles, warnings } = applyStylesMutations(
    styles,
    mutations,
    tokens,
  );

  // Drop variant slots from tokens.json
  const newTokens = { ...tokens };
  for (const v of variantSet) delete newTokens[v];

  if (!DRY_RUN) {
    writeJson(tokensPath, newTokens);
    writeJson(stylesPath, newStyles);
  }

  return {
    status: "migrated",
    name,
    families: migratable.length,
    mutations: mutations.length,
    droppedSlots: variantSet.size,
    orphans,
    skipped,
    warnings,
  };
}

const all = listComponents().filter((n) => ONLY.size === 0 || ONLY.has(n));
const results = all.map(migrateComponent);

let totalMigrated = 0;
let totalSkipped = 0;
let totalOrphans = 0;
for (const r of results) {
  switch (r.status) {
    case "migrated":
      totalMigrated++;
      console.log(
        `  ✓ ${r.name.padEnd(16)} ${r.families} family/families  ${r.mutations} styles entry/entries rewritten  ${r.droppedSlots} slot(s) dropped`,
      );
      if (r.orphans.length > 0) {
        totalOrphans += r.orphans.length;
        console.log(
          `             orphans (dropped, no styles ref): ${r.orphans.join(", ")}`,
        );
      }
      if (r.warnings.length > 0) {
        for (const w of r.warnings) console.log(`             ⚠ ${w}`);
      }
      if (r.skipped.length > 0) {
        for (const s of r.skipped) {
          totalSkipped++;
          console.log(
            `             ⚠ skipped family (no .default canonical): ${s.prefix}.{${s.variants.map((v) => v.split(".").pop()).join(",")}}`,
          );
        }
      }
      break;
    case "nothing-to-migrate":
      console.log(`  · ${r.name.padEnd(16)} no variant slot families found`);
      if (r.skipped.length > 0) {
        for (const s of r.skipped) {
          totalSkipped++;
          console.log(
            `             ⚠ skipped family (no .default canonical): ${s.prefix}.{${s.variants.map((v) => v.split(".").pop()).join(",")}}`,
          );
        }
      }
      break;
    case "missing-contract":
    case "missing-sidecars":
      console.log(`  · ${r.name.padEnd(16)} (${r.status})`);
      break;
  }
}

console.log(
  `\nDone${DRY_RUN ? " (dry-run, no files written)" : ""}.  ` +
    `migrated=${totalMigrated}  skipped-families=${totalSkipped}  ` +
    `orphan-slots-dropped=${totalOrphans}  total=${results.length}`,
);
