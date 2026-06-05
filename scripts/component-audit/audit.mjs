#!/usr/bin/env node
/**
 * COMPONENT-AUDIT-TOOL-01 — reusable component box-model / sizing / token +
 * rendered-geometry drift audit.
 *
 * NOT a CI gate. Run it occasionally to capture drift in how components realize
 * their contract (box model, intrinsic sizing, token usage, rendered geometry).
 *
 * Usage:
 *   node scripts/component-audit/audit.mjs --all                 # every component, static only
 *   node scripts/component-audit/audit.mjs --batch 1 --size 8    # alphabetical batch 1 (first 8)
 *   node scripts/component-audit/audit.mjs --components Button,Card
 *   node scripts/component-audit/audit.mjs --batch 1 --geometry  # + rendered geometry (needs dev server)
 *
 * Output: docs/component-audit/component-audit.csv (one row per component).
 * The `reviewed` and `notes` columns are PRESERVED across runs so human review
 * state survives a re-audit; changed rows are reported as drift on stderr.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { extractStatic, ALL_COMPONENTS, REPO } from "./extract.mjs";

const OUT_DIR = resolve(REPO, "docs/component-audit");
const CSV_PATH = resolve(OUT_DIR, "component-audit.csv");

const COLUMNS = [
  "component",
  "category",
  "layer",
  "root_tag",
  "reviewed",
  "box_model",
  "box_flags",
  "sizing",
  "token_usage",
  "layout",
  "geom_expected",
  "geom_actual",
  "geom_verdict",
  "visual_review",
  "notes",
];

// ---- CLI ----
function parseArgs(argv) {
  const a = { mode: "all", size: 8, batch: 1, components: null, geometry: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--all") a.mode = "all";
    else if (t === "--batch") {
      a.mode = "batch";
      a.batch = Number(argv[++i]);
    } else if (t === "--size") a.size = Number(argv[++i]);
    else if (t === "--components") {
      a.mode = "components";
      a.components = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (t === "--geometry") a.geometry = true;
    else if (t === "--no-geometry") a.geometry = false;
  }
  return a;
}

function selectComponents(args, all) {
  if (args.mode === "components") return args.components.filter((c) => all.includes(c));
  if (args.mode === "batch") {
    const start = (args.batch - 1) * args.size;
    return all.slice(start, start + args.size);
  }
  return all;
}

// ---- CSV ----
const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function parseCsv(text) {
  // minimal RFC-4180-ish parser (handles quoted fields + escaped quotes)
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (c === "\r") {
      /* skip */
    } else cell += c;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function loadExisting() {
  if (!existsSync(CSV_PATH)) return { byComponent: new Map(), header: null };
  const rows = parseCsv(readFileSync(CSV_PATH, "utf8")).filter((r) => r.length > 1);
  const header = rows.shift();
  const byComponent = new Map();
  for (const r of rows) {
    const obj = {};
    header.forEach((h, idx) => (obj[h] = r[idx] ?? ""));
    if (obj.component) byComponent.set(obj.component, obj);
  }
  return { byComponent, header };
}

// ---- row building ----
function boxModelSummary(boxOverrides) {
  const keys = Object.keys(boxOverrides);
  if (!keys.length) return "all-default (pad=0, w/h=auto, min=0, max=none)";
  const abbr = (s) =>
    s
      .replace("padding-block", "pb")
      .replace("padding-inline", "pi")
      .replace("padding", "p")
      .replace("min-width", "min-w")
      .replace("min-height", "min-h")
      .replace("max-width", "max-w")
      .replace("max-height", "max-h");
  return keys.map((k) => `${abbr(k)}=${boxOverrides[k]}`).join("; ");
}

function sizingSummary(sizing) {
  const entries = Object.entries(sizing);
  if (!entries.length) return "(none)";
  return entries
    .slice(0, 8)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function buildRow(s, prior) {
  return {
    component: s.component,
    category: s.category,
    layer: s.layer,
    root_tag: s.rootTag,
    reviewed: prior?.reviewed || "no",
    box_model: boxModelSummary(s.boxOverrides),
    box_flags: s.flags.join(" | "),
    sizing: sizingSummary(s.sizing),
    token_usage:
      `${s.tokenized}tok/${s.literal}lit` +
      (s.literalDims.length ? ` | dims: ${s.literalDims.join(", ")}` : ""),
    layout: s.layout,
    geom_expected: s.geom?.expected ?? prior?.geom_expected ?? "",
    geom_actual: s.geom?.actual ?? prior?.geom_actual ?? "",
    geom_verdict: s.geom?.verdict ?? (s.geometryProbed ? "" : prior?.geom_verdict ?? "(not probed)"),
    visual_review: s.flags.length ? "yes" : "",
    notes: prior?.notes || "",
  };
}

// ---- drift ----
const DRIFT_COLS = ["box_model", "box_flags", "sizing", "token_usage", "layout", "geom_verdict"];
function reportDrift(rows, existing) {
  const drifted = [];
  for (const row of rows) {
    const prior = existing.get(row.component);
    if (!prior) {
      drifted.push(`  + NEW ${row.component}`);
      continue;
    }
    const changes = DRIFT_COLS.filter((c) => (prior[c] ?? "") !== (row[c] ?? "") && (prior[c] || row[c]));
    if (changes.length) {
      drifted.push(`  ~ ${row.component}: ${changes.join(", ")} changed`);
      for (const c of changes) drifted.push(`       ${c}: "${prior[c] ?? ""}" -> "${row[c]}"`);
    }
  }
  return drifted;
}

// ---- main ----
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const all = ALL_COMPONENTS();
  const selected = selectComponents(args, all);
  if (!selected.length) {
    console.error("No components selected.");
    process.exit(1);
  }

  const { byComponent: existing } = loadExisting();

  const statics = selected.map((name) => ({ ...extractStatic(name), geometryProbed: args.geometry }));

  if (args.geometry) {
    const { probeBatch } = await import("./geometry.mjs");
    const geom = await probeBatch(statics);
    for (const s of statics) s.geom = geom.get(s.component);
  }

  const newRows = statics.map((s) => buildRow(s, existing.get(s.component)));

  // Merge: keep all previously-audited components, overwrite the selected ones.
  const merged = new Map();
  for (const [name, prior] of existing) merged.set(name, prior);
  for (const row of newRows) merged.set(row.component, row);

  // emit in canonical alphabetical order
  const ordered = [...merged.values()].sort((a, b) => a.component.localeCompare(b.component));
  const lines = [COLUMNS.join(",")];
  for (const row of ordered) lines.push(COLUMNS.map((c) => csvCell(row[c])).join(","));
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(CSV_PATH, lines.join("\n") + "\n");

  // report
  const drift = reportDrift(newRows, existing);
  console.error(`\nAudited ${selected.length} component(s): ${selected.join(", ")}`);
  console.error(`Geometry: ${args.geometry ? "ON" : "off (static only)"}`);
  console.error(`CSV: ${CSV_PATH} (${ordered.length} total rows)`);
  if (drift.length) {
    console.error(`\nDrift since last run (${drift.length} change line(s)):`);
    console.error(drift.join("\n"));
  } else if (existing.size) {
    console.error("\nNo drift since last run for the audited components.");
  }
  // print the audited rows as a quick table to stdout
  console.log(
    "\n" +
      newRows
        .map(
          (r) =>
            `### ${r.component}  [${r.category}/${r.layer}, <${r.root_tag}>]\n` +
            `  box-model : ${r.box_model}\n` +
            `  sizing    : ${r.sizing}\n` +
            `  tokens    : ${r.token_usage}\n` +
            `  layout    : ${r.layout}\n` +
            (r.geom_verdict ? `  geometry  : ${r.geom_verdict}\n` : "") +
            (r.box_flags ? `  ⚠ flags   : ${r.box_flags}\n` : ""),
        )
        .join("\n"),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
