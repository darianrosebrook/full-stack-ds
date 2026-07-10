/**
 * Icon ledger driver — wires the icon corpus through the target-agnostic
 * ledger core (ledger.mjs). Records ONE emission row per icon contract:
 *
 *   observation (declared inputs) = the icon's .icon.json  +  build.mjs  +  package.json
 *   attachments (produced output) = every generated/ file whose name derives
 *                                   from this icon's platformNames
 *
 * Modes:
 *   node build/ledger-icons.mjs               -> build, attest, WRITE emission-ledger.json (commit this)
 *   node build/ledger-icons.mjs --check       -> build, recompute, GATE against committed ledger (no write)
 *
 * The generated/ tree stays gitignored scratch; only emission-ledger.json is
 * committed. That is the whole point — drift is proven by the committed edge
 * set, not by committing ~13 output files per icon per target.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assembleLedger,
  buildRow,
  checkAgainstCommitted,
  computeAttachments,
  computeObservation,
  serializeLedger,
} from "./ledger.mjs";

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(buildDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const iconsRoot = path.join(packageRoot, "icons");
const generatedRoot = path.join(packageRoot, "generated");
const ledgerPath = path.join(packageRoot, "emission-ledger.json");
const checkMode = process.argv.includes("--check");

// --- declared inputs shared by every icon emission (the generator + manifest) ---
const sharedInputs = [
  { role: "generator", abs: path.join(buildDir, "build.mjs") },
  { role: "generator", abs: path.join(buildDir, "ledger.mjs") },
  { role: "generator", abs: path.join(buildDir, "ledger-icons.mjs") },
  { role: "manifest", abs: path.join(packageRoot, "package.json") },
  { role: "schema", abs: path.join(packageRoot, "icon.contract.schema.json") },
];

function rel(abs) {
  return path.relative(repoRoot, abs).split(path.sep).join("/");
}

function walk(dir, onFile) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, onFile);
    else if (entry.isFile()) onFile(abs);
  }
}

/** Discover icon contracts (mirrors build.mjs discovery: *.icon.json under icons/). */
function loadIconContracts() {
  const files = [];
  walk(iconsRoot, (abs) => {
    if (abs.endsWith(".icon.json")) files.push(abs);
  });
  files.sort((a, b) => a.localeCompare(b));
  return files.map((abs) => ({ abs, data: JSON.parse(fs.readFileSync(abs, "utf8")) }));
}

/**
 * The set of platform-name tokens an icon owns across all its size variants.
 * A generated file "belongs" to an icon iff its basename (sans extension /
 * directory) matches one of these tokens. This is how we attribute outputs back
 * to their governing contract without depending on build.mjs internals.
 */
function platformTokensFor(icon) {
  const tokens = new Set();
  for (const variant of Object.values(icon.data.variants ?? {})) {
    for (const v of Object.values(variant.platformNames ?? {})) {
      if (typeof v === "string" && v.length > 0) tokens.add(v);
    }
  }
  return tokens;
}

/** Run the real icon build so generated/ reflects current sources. */
function runBuild() {
  execFileSync("node", [path.join(buildDir, "build.mjs")], { cwd: packageRoot, stdio: "pipe" });
}

function main() {
  runBuild();

  // Collect every generated file once, then attribute to icons by platform token.
  const generatedFiles = [];
  walk(generatedRoot, (abs) => generatedFiles.push(abs));

  // The committed package-root export module (index.mjs/index.d.ts) is build
  // output too — a function of ALL icon contracts + the generator — so it must
  // carry ledger edges like everything else. Its basename ("index") matches no
  // per-icon platform token, so it attributes to the __corpus__ unit below.
  for (const name of ["index.mjs", "index.d.ts"]) {
    const abs = path.join(packageRoot, name);
    if (fs.existsSync(abs)) generatedFiles.push(abs);
  }

  const icons = loadIconContracts();
  const rows = [];
  const attributed = new Set();

  for (const icon of icons) {
    const tokens = platformTokensFor(icon);
    const outputs = generatedFiles
      .filter((abs) => {
        const base = path.basename(abs).replace(/\.[^.]+$/, ""); // strip one extension
        // android drawable names carry a size suffix (ui_ic_placeholder_17dp);
        // match by "any token is a prefix of, or equals, the basename".
        return [...tokens].some((t) => base === t || base.startsWith(t));
      })
      .map((abs) => ({ relPath: rel(abs), absPath: abs }));

    for (const o of outputs) attributed.add(o.absPath);

    const inputs = [
      { role: "contract", relPath: rel(icon.abs), absPath: icon.abs },
      ...sharedInputs.map((s) => ({ role: s.role, relPath: rel(s.abs), absPath: s.abs })),
    ];

    rows.push(
      buildRow({
        unitId: icon.data.name,
        target: "iconography",
        observation: computeObservation(inputs),
        attachments: computeAttachments(outputs),
      }),
    );
  }

  // Catalog / sprite / residuals are corpus-level outputs (not per-icon). Attribute
  // them to a synthetic corpus unit so NO generated file is left unattested — an
  // unattributed output would be a silent gap in the drift proof.
  const corpusOutputs = generatedFiles
    .filter((abs) => !attributed.has(abs))
    .map((abs) => ({ relPath: rel(abs), absPath: abs }));
  if (corpusOutputs.length > 0) {
    const inputs = [
      // Corpus-level output is a function of ALL icon contracts + the generator.
      ...icons.map((i) => ({ role: "contract", relPath: rel(i.abs), absPath: i.abs })),
      ...sharedInputs.map((s) => ({ role: s.role, relPath: rel(s.abs), absPath: s.abs })),
    ];
    rows.push(
      buildRow({
        unitId: "__corpus__",
        target: "iconography",
        observation: computeObservation(inputs),
        attachments: computeAttachments(corpusOutputs),
      }),
    );
  }

  const fresh = assembleLedger(rows);

  if (checkMode) {
    const committed = fs.existsSync(ledgerPath)
      ? JSON.parse(fs.readFileSync(ledgerPath, "utf8"))
      : null;
    const verdict = checkAgainstCommitted(fresh, committed);
    report(verdict, fresh);
    process.exit(verdict.ok ? 0 : 1);
  }

  fs.writeFileSync(ledgerPath, serializeLedger(fresh));
  console.log(
    `Wrote ${rel(ledgerPath)}: ${fresh.row_count} rows, ${fresh.edge_count} edges ` +
      `(${icons.length} icon(s), ${generatedFiles.length} generated file(s)).`,
  );
}

function report(verdict, fresh) {
  console.log(
    `Icon emission gate: ${verdict.fresh_edge_count} fresh edges vs ` +
      `${verdict.committed_edge_count} committed.`,
  );
  if (verdict.missing.length > 0) {
    console.error(`\nMISSING ${verdict.missing.length} edge(s) — un-attested emission or nondeterminism:`);
    for (const e of verdict.missing) {
      console.error(`  - ${e.rel_path}  (obs ${e.observation_ref.slice(0, 19)}… -> ${e.attachment_ref.slice(0, 19)}…)`);
    }
    console.error(`\nRepair: re-attest with 'node build/ledger-icons.mjs' and commit emission-ledger.json.`);
  }
  if (verdict.stale.length > 0) {
    console.warn(`\nSTALE ${verdict.stale.length} committed edge(s) the generator no longer produces:`);
    for (const e of verdict.stale) {
      console.warn(`  - ${e.rel_path}`);
    }
  }
  if (verdict.ok && verdict.stale.length === 0) {
    console.log(`OK: every fresh edge is attested (${fresh.edge_count} edges).`);
  }
}

main();
