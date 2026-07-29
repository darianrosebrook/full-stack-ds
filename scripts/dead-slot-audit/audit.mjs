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

import { diffLedger, loadLedger, reportRatchet } from "../lib/ledger-ratchet.mjs";
import { classifyDisposition, renderedPartsOf } from "./disposition.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const REACT = resolve(REPO, "packages/ds-react/src/components");
const OUT_DIR = resolve(REPO, "docs/dead-slot-audit");
const LEDGER_PATH = resolve(HERE, "known-dead.json");

/** Ledger identity for a dead slot. Slot keys are unique per component. */
export function deadId(row) {
  return `${row.component} ${row.slot}`;
}

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
  // Disposition inputs. Read once per component, not once per slot.
  const tokens = readJSON(resolve(CONTRACTS, component, `${component}.tokens.json`));
  const styles = readJSON(resolve(CONTRACTS, component, `${component}.styles.json`));
  const contract = readJSON(resolve(CONTRACTS, component, `${component}.contract.json`));
  const renderedParts = renderedPartsOf(
    readText(resolve(REACT, component, `${component}.tsx`)),
    prefix,
  );

  // A slot is consumed when some rule READS it. Two distinct read sites:
  //
  //   1. the structure CSS — `padding: var(--fsds-x-size-padding-default)`
  //   2. ANOTHER slot's declaration in tokens.css —
  //      `--fsds-box-model-min-height: var(--fsds-chip-dismiss-size, 12px)`
  //
  // (2) is a real consumption under the premise this rail measures: overriding
  // the slot changes what the other slot resolves to, so the knob works. Chip's
  // `chip.dismiss.size` is read by four other slots this way and was reported
  // inert — a false positive independent of any repair.
  //
  // What must NOT count is a slot's own declaration line. That is the reason
  // tokens.css was excluded wholesale, and it survives: we match `var(--slot`,
  // a READ, never `--slot:`, a declaration. So a slot still cannot consume
  // itself, and a variant block that redefines a sibling without routing
  // through the leaf still leaves the leaf dead.
  const tokensCss = readText(resolve(REACT, component, `${component}.tokens.css`));

  const slots = declaredSlots(component).map((s) => {
    // Boundary-safe: require the cssVar followed by a non-identifier char so
    // --foo-medium doesn't match when searching for --foo-medium-extra.
    const re = new RegExp(`${escapeRe(s.cssVar)}(?![A-Za-z0-9_-])`);
    const readRe = new RegExp(`var\\(\\s*${escapeRe(s.cssVar)}(?![A-Za-z0-9_-])`);
    const status =
      re.test(structureCss) || readRe.test(tokensCss) ? "consumed" : "dead";
    if (status === "consumed") return { ...s, status };
    // Every dead slot carries its diagnosis and the evidence for it, so the
    // reviewer audits the rule rather than 134 individual rows — and so the
    // ledger entry can record WHY the declaration exists.
    const { disposition, evidence } = classifyDisposition(s.slot, {
      tokens,
      styles,
      contract,
      prefix,
      renderedParts,
    });
    // A shadowed slot is not a DEFECT and is not counted dead. The primitive
    // consumer IS emitted on every root by renderBoxModelConsumers(); the
    // author's styles.root rule spreads after it and wins the property, so the
    // primitive var never reaches the CSS. That is the layering working as
    // designed.
    //
    // It is still INERT, and stays in the ledger for that reason. An earlier
    // version of this comment justified the exclusion with "tokens.css declares
    // the full vocabulary so an override always resolves" — that is wrong. The
    // override resolves to nothing: no rule reads the shadowed var, so setting
    // it has no effect, exactly as for any other inert slot. Not-a-defect and
    // not-inert are different claims and only the first one holds here.
    //
    // This narrows what "dead" means, so it is fair to ask whether it moves the
    // goalposts. The check that it does not is A2 — removing the author
    // override must return the slot to `consumed`, never leave it `shadowed`.
    if (disposition === "shadowed") return { ...s, status: "shadowed", disposition, evidence };
    return { ...s, status, disposition, evidence };
  });

  const consumed = slots.filter((s) => s.status === "consumed").length;
  const shadowed = slots.filter((s) => s.status === "shadowed").length;
  // `dead` is now a residual of three statuses, not two — shadowed slots are
  // neither consumed nor a defect.
  const dead = slots.length - consumed - shadowed;
  return { component, prefix, total: slots.length, consumed, shadowed, dead, slots };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deadSlotsOf(c) {
  return c.slots.filter((s) => s.status === "dead");
}

/** Every slot no rule reads: the defects AND the inert-by-design ones. */
function inertSlotsOf(c) {
  return c.slots.filter((s) => s.status !== "consumed");
}

// ---- run (only when executed directly; importable for the locked test) ----
const RUN_DIRECTLY = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
  const components = ALL_COMPONENTS().map(classify);

  // INERT is the accounting unit; DEAD is the defect subset of it.
  //
  // A slot is inert when no rule reads it — setting the custom property has no
  // effect. That is the user-facing symptom, and it is identical for both
  // statuses: `--fsds-box-model-gap` on Button is shadowed by the author's own
  // gap rule, and `--fsds-accordion-border-width` is simply unread; a consumer
  // or brand setting either gets nothing. (Measured: every one of these is
  // declared in 9 emitted files and read by var() in zero.)
  //
  // A declared-but-unread slot is therefore NOT an override escape hatch — the
  // hatch requires a consumer rule, and without one the declaration advertises
  // a control with no wire behind it.
  //
  // Shadowed slots are inert-by-DESIGN (the author deliberately overrode the
  // primitive), so they are not defects. But they are still inert, so they stay
  // in the ledger: an entry leaves only by becoming consumed or by having its
  // declaration deleted — never by being declared acceptable.
  const inert = components
    .filter((c) => c.dead + c.shadowed > 0)
    .map((c) => ({ component: c.component, inert: inertSlotsOf(c) }));
  const failing = components
    .filter((c) => c.dead > 0)
    .map((c) => ({ component: c.component, dead: deadSlotsOf(c) }));

  const totalSlots = components.reduce((n, c) => n + c.total, 0);
  const consumedCount = components.reduce((n, c) => n + c.consumed, 0);
  const deadCount = components.reduce((n, c) => n + c.dead, 0);
  const shadowedCount = components.reduce((n, c) => n + c.shadowed, 0);

  mkdirSync(OUT_DIR, { recursive: true });
  const json = {
    spec: "ICONOGRAPHY-TOKEN-DISCIPLINE-02",
    components: components.length,
    slotsDeclared: totalSlots,
    consumed: consumedCount,
    inert: deadCount + shadowedCount,
    shadowed: shadowedCount,
    dead: deadCount,
    inertSlots: inert,
    failing,
    perComponent: components,
  };
  writeFileSync(resolve(OUT_DIR, "dead-slot-matrix.json"), JSON.stringify(json, null, 2) + "\n");

  const md = [];
  md.push("# Dead-slot matrix");
  md.push("");
  md.push(
    "`RAIL-STYLING-REALIZATION-LEDGERS-01` — gated by a two-directional ledger (`scripts/dead-slot-audit/known-dead.json`): the audit fails if a dead slot is unledgered OR if a ledger entry no longer reproduces. Each dead slot carries a machine-computed **disposition** (`scripts/dead-slot-audit/disposition.mjs`) so the reviewer audits the rule rather than the rows. `review` means no rule matched and the entry needs human adjudication — it does NOT mean the slot is safe to delete. Every token/style slot a contract declares (from `<Component>.tokens.json` top-level keys + `<Component>.styles.json` dotted property keys) is classified against the generated React structure CSS (`<Component>.css`): **consumed** if `var(--fsds-<slug>)` appears, **dead** otherwise. The declaration site (`<Component>.tokens.css`) is excluded so a slot cannot consume itself. Consumption is scanned in ds-react only (the reference framework); all five web frameworks derive from the same IR, so a slot dead in ds-react is dead everywhere. Advisory this slice — not a CI gate (mirrors `PSEUDO-STATE-STYLING-RAIL-01`'s posture).",
  );
  md.push("");
  md.push(
    `Components: **${components.length}** · slots declared: **${totalSlots}** · consumed: **${consumedCount}** · **inert: ${deadCount + shadowedCount}** (defects: **${deadCount}** · inert-by-design: **${shadowedCount}**)`,
  );
  md.push("");
  md.push("## Dead slots — declared slots with no `var()` consumer in the structure CSS");
  md.push("");
  if (failing.length) {
    md.push("| component | slot | CSS var | disposition | evidence |");
    md.push("|---|---|---|---|---|");
    for (const f of failing) {
      for (const d of f.dead) {
        md.push(
          `| ${f.component} | \`${d.slot}\` | \`${d.cssVar}\` | \`${d.disposition}\` | ${d.evidence} |`,
        );
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
    `\nRAIL-STYLING-REALIZATION-LEDGERS-01 — ${components.length} components, ${totalSlots} slots declared, ${consumedCount} consumed, ${deadCount + shadowedCount} inert (${deadCount} defects + ${shadowedCount} inert-by-design)`,
  );
  const byDisposition = {};
  for (const f of failing) {
    for (const d of f.dead) byDisposition[d.disposition] = (byDisposition[d.disposition] ?? 0) + 1;
  }
  console.log(
    `Dispositions: ${Object.entries(byDisposition)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}=${v}`)
      .join(" ")}`,
  );
  console.log(`Report: ${resolve(OUT_DIR, "dead-slot-matrix.md")}\n`);

  // --- ratchet: the ledger may only shrink truthfully ---
  const current = inert.flatMap((f) => f.inert.map((d) => ({ component: f.component, ...d })));
  const ledger = loadLedger(LEDGER_PATH, ["component", "slot"]);
  const { unledgered, stale } = diffLedger({ current, ledger, idOf: deadId });
  let code = reportRatchet({ label: "dead-slot", current, unledgered, stale, idOf: deadId });

  // Third check, specific to this ledger: entries carry the disposition and the
  // evidence that justified them, and a downstream slice ACTS on that note. If
  // the classifier's verdict moves and the ledger doesn't, the note becomes a
  // confident lie — which is exactly how `button.size.padding-block.medium`
  // came to be filed as "wire ... with no styling block" when a `--medium`
  // block redefines it. Re-seeding fixed that once; this makes it structural.
  const computed = new Map(current.map((row) => [deadId(row), row.disposition]));
  const drifted = ledger.filter(
    (entry) => computed.has(deadId(entry)) && computed.get(deadId(entry)) !== entry.disposition,
  );
  if (drifted.length > 0) {
    console.error(
      `\n[dead-slot] FAIL — ${drifted.length} ledger entr(ies) whose recorded disposition no longer matches the classifier:`,
    );
    for (const entry of drifted) {
      console.error(
        `  ${deadId(entry)}: ledger says "${entry.disposition}", classifier says "${computed.get(deadId(entry))}"`,
      );
    }
    console.error("\nRe-seed the ledger so its notes describe what the classifier actually found.");
    code = 1;
  }
  if (code !== 0) process.exit(code);
}
