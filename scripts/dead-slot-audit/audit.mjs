/**
 * Dead-slot audit — read-only classifier.
 *
 * Mirrors scripts/pseudo-state-audit/audit.mjs in shape: a direct-`readdirSync`
 * corpus walk, a pure `classify(component)` function, and a `RUN_DIRECTLY`
 * guard that writes the matrix only when executed directly (importable for
 * the locked discriminator test).
 *
 * The obligation axis this audit covers: every token/style slot a contract
 * DECLARES vs. every slot the generated CSS actually CONSUMES via var(). A
 * slot is:
 *   - consumed  iff `var(--fsds-<slug>)` appears in the component's
 *                structure CSS (`<Component>.css`). The declaration site
 *                (`<Component>.tokens.css`) is EXCLUDED so a slot can't
 *                consume itself by appearing in its own declaration block.
 *   - dead      iff declared but consumed in no structure rule.
 *
 * Consumption is scanned in ds-react only (the reference framework), matching
 * pseudo-state-audit's posture. All five web frameworks derive from the same
 * IR, so a slot dead in ds-react is dead everywhere.
 *
 * Output: docs/dead-slot-audit/dead-slot-matrix.{json,md}
 * Spec:    ICONOGRAPHY-TOKEN-DISCIPLINE-02 (Phase 3)
 *
 * Usage:   node scripts/dead-slot-audit/audit.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const REACT = resolve(REPO, "packages/ds-react/src/components");
const OUT_DIR = resolve(REPO, "docs/dead-slot-audit");

const readJSON = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const readText = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

export const ALL_COMPONENTS = () =>
  readdirSync(CONTRACTS)
    .filter((d) => statSync(resolve(CONTRACTS, d)).isDirectory())
    .filter((d) => existsSync(resolve(CONTRACTS, d, `${d}.contract.json`)))
    .sort();

/**
 * The slug transform mirroring the codegen: token key `button.size.fontSize.medium`
 * → CSS custom property `--fsds-button-size-fontSize-medium`. Dots become dashes;
 * the `--fsds-` prefix is prepended; case is preserved (camelCase stays camelCase).
 */
function slotToCssVar(slotKey) {
  return `--fsds-${slotKey.split(".").join("-")}`;
}

/**
 * cssPrefix = the first BEM root class in the generated tokens.css. Mirrors
 * pseudo-state-audit/audit.mjs#cssPrefix so the two audits agree on identity.
 */
function cssPrefix(component) {
  const tokensCss = readText(resolve(REACT, component, `${component}.tokens.css`));
  const css = readText(resolve(REACT, component, `${component}.css`));
  const m = tokensCss.match(/\.([a-zA-Z][\w-]*)\s*\{/) || css.match(/\.([a-zA-Z][\w-]*)\s*\{/);
  return m ? m[1] : component.toLowerCase();
}

/**
 * Collect every slot a contract declares. Slots come from TWO sidecars:
 *   - <Component>.tokens.json: top-level keys are slot names.
 *   - <Component>.styles.json: property keys containing "." within each
 *     selector block are slot redefinitions (the same slot namespace).
 * box-model.* slots are declared by the primitive and auto-emitted on every
 * component's root; they are included (they ARE slots the component carries),
 * but a box-model slot consumed by ANY component counts as consumed for that
 * component (the box-model consumer block is shared).
 *
 * @returns {{ slot: string, cssVar: string, source: "tokens"|"styles"|"styles:<selector>" }[]}
 */
function declaredSlots(component) {
  const out = [];
  const seen = new Set();
  const add = (slot, source) => {
    if (seen.has(slot)) return;
    seen.add(slot);
    out.push({ slot, cssVar: slotToCssVar(slot), source });
  };

  const tokens = readJSON(resolve(CONTRACTS, component, `${component}.tokens.json`));
  if (tokens && typeof tokens === "object") {
    for (const key of Object.keys(tokens)) add(key, "tokens");
  }

  const styles = readJSON(resolve(CONTRACTS, component, `${component}.styles.json`));
  if (styles && typeof styles === "object") {
    for (const [selector, block] of Object.entries(styles)) {
      if (!block || typeof block !== "object") continue;
      for (const property of Object.keys(block)) {
        // Slot-path keys contain a dot (e.g. "button.color.background.default").
        // Plain CSS property keys ("padding", "color") are consumer-site
        // declarations, not slot redefinitions — they don't declare a slot.
        if (property.includes(".")) add(property, `styles:${selector}`);
      }
    }
  }

  return out;
}

/**
 * Classify every declared slot for one component as consumed or dead.
 * Consumption is scanned ONLY in <Component>.css (the structure file). The
 * declaration file (<Component>.tokens.css) is excluded so a slot can't
 * consume itself — the var() inside its own declaration block references a
 * DIFFERENT (semantic-tier) var, not the component slot.
 *
 * @returns {{ component: string, prefix: string, total: number, consumed: number, dead: number, slots: { slot: string, cssVar: string, status: "consumed"|"dead", source: string }[] }}
 */
export function classify(component) {
  const prefix = cssPrefix(component);
  const structureCss = readText(resolve(REACT, component, `${component}.css`));
  const slots = declaredSlots(component).map((s) => {
    // Boundary-safe: require the cssVar followed by a non-identifier char so
    // --foo-medium doesn't match when searching for --foo-medium-extra.
    const re = new RegExp(`${escapeRe(s.cssVar)}(?![A-Za-z0-9_-])`);
    const status = re.test(structureCss) ? "consumed" : "dead";
    return { ...s, status };
  });

  const consumed = slots.filter((s) => s.status === "consumed").length;
  const dead = slots.length - consumed;
  return { component, prefix, total: slots.length, consumed, dead, slots };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deadSlotsOf(c) {
  return c.slots.filter((s) => s.status === "dead");
}

// ---- run (only when executed directly; importable for the locked test) ----
const RUN_DIRECTLY = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
  const components = ALL_COMPONENTS().map(classify);

  const failing = components
    .filter((c) => c.dead > 0)
    .map((c) => ({ component: c.component, dead: deadSlotsOf(c) }));

  const totalSlots = components.reduce((n, c) => n + c.total, 0);
  const consumedCount = components.reduce((n, c) => n + c.consumed, 0);
  const deadCount = components.reduce((n, c) => n + c.dead, 0);

  mkdirSync(OUT_DIR, { recursive: true });
  const json = {
    spec: "ICONOGRAPHY-TOKEN-DISCIPLINE-02",
    components: components.length,
    slotsDeclared: totalSlots,
    consumed: consumedCount,
    dead: deadCount,
    failing,
    perComponent: components,
  };
  writeFileSync(resolve(OUT_DIR, "dead-slot-matrix.json"), JSON.stringify(json, null, 2) + "\n");

  const md = [];
  md.push("# Dead-slot matrix");
  md.push("");
  md.push(
    "`ICONOGRAPHY-TOKEN-DISCIPLINE-02` (Phase 3) — read-only. Every token/style slot a contract declares (from `<Component>.tokens.json` top-level keys + `<Component>.styles.json` dotted property keys) is classified against the generated React structure CSS (`<Component>.css`): **consumed** if `var(--fsds-<slug>)` appears, **dead** otherwise. The declaration site (`<Component>.tokens.css`) is excluded so a slot cannot consume itself. Consumption is scanned in ds-react only (the reference framework); all five web frameworks derive from the same IR, so a slot dead in ds-react is dead everywhere. Advisory this slice — not a CI gate (mirrors `PSEUDO-STATE-STYLING-RAIL-01`'s posture).",
  );
  md.push("");
  md.push(
    `Components: **${components.length}** · slots declared: **${totalSlots}** · consumed: **${consumedCount}** · dead: **${deadCount}**`,
  );
  md.push("");
  md.push("## Dead slots — declared slots with no `var()` consumer in the structure CSS");
  md.push("");
  if (failing.length) {
    md.push("| component | slot | CSS var | source |");
    md.push("|---|---|---|---|");
    for (const f of failing) {
      for (const d of f.dead) {
        md.push(`| ${f.component} | \`${d.slot}\` | \`${d.cssVar}\` | \`${d.source}\` |`);
      }
    }
  } else md.push("_none_");
  md.push("");
  md.push("## Full matrix (per component)");
  md.push("");
  for (const c of components) {
    md.push(`### ${c.component}  \`.${c.prefix}\``);
    md.push("");
    md.push(`declared: **${c.total}** · consumed: **${c.consumed}** · dead: **${c.dead}**`);
    if (c.dead > 0) {
      md.push("");
      md.push("| slot | CSS var | status | source |");
      md.push("|---|---|---|---|");
      for (const s of c.slots) {
        const mark = s.status === "consumed" ? "✓ consumed" : "✗ dead";
        md.push(`| \`${s.slot}\` | \`${s.cssVar}\` | ${mark} | \`${s.source}\` |`);
      }
    }
    md.push("");
  }
  writeFileSync(resolve(OUT_DIR, "dead-slot-matrix.md"), md.join("\n") + "\n");

  console.log(
    `\nICONOGRAPHY-TOKEN-DISCIPLINE-02 (Phase 3) — ${components.length} components, ${totalSlots} slots declared, ${consumedCount} consumed, ${deadCount} dead`,
  );
  console.log("\nDead slots by component:");
  for (const f of failing) {
    console.log(`  - ${f.component}: ${f.dead.map((d) => d.slot).join(", ")}`);
  }
  console.log(`\nReport: ${resolve(OUT_DIR, "dead-slot-matrix.md")}`);
}
