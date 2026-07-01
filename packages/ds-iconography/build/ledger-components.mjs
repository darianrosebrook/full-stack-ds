/**
 * Component ledger driver (A3 generalization proof).
 *
 * Drives ONE component framework target (default: react) through the SAME
 * target-agnostic ledger core (ledger.mjs) the icon driver uses — with NO
 * icon-specific code and NO ledger-core change. This is the falsification test
 * for "the substrate generalizes": if a component target needed a different
 * core, the abstraction would be wrong.
 *
 * An emission UNIT here is one (component, target) pair. Declared inputs:
 *   - the component contract + style/token sidecars (usage.jsonl is DOC, not
 *     codegen input — excluded, per repo doctrine, so doc edits don't false-drift)
 *   - the target's emitter sources (SHARED + framework-specific, mirrored from
 *     the CLI's own provenance list so the fingerprint matches the rail model)
 *   - pnpm-lock.yaml (the environment fingerprint the CLI requires)
 * Attachments: every file the target emits under its component dir.
 *
 * ISOLATION: this regenerates the target into a SCRATCH copy of the repo (never
 * the committed tree), so running it mutates nothing the repo tracks. It proves
 * the ledger shape works for components; it does NOT replace the component rail.
 *
 *   node build/ledger-components.mjs [--target=react]         -> WRITE scratch ledger, print summary
 *   node build/ledger-components.mjs --check [--target=react] -> GATE recompute vs the scratch ledger
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
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
const repoRoot = path.resolve(buildDir, "..", "..", "..");
const targetArg = (process.argv.find((a) => a.startsWith("--target=")) ?? "--target=react").split("=")[1];
const checkMode = process.argv.includes("--check");

// Emitter provenance mirrored from packages/ds-codegen/src/cli.ts. Kept as data
// here (the prototype reads the same files); a production version would import
// the CLI's own list rather than duplicate it.
const SHARED_EMITTER_SOURCES = [
  "box-model.ts", "cli.ts", "contract.ts", "css.ts", "emitter.ts", "ir.ts",
  "preserve.ts", "registry.ts", "semantics.ts", "target-packs/builtin.ts",
  "target-packs/config.ts", "target-packs/local.ts", "target-packs/manifest.ts",
  "test-plan.ts",
].map((f) => `packages/ds-codegen/src/${f}`);

const FRAMEWORK_EMITTER_SOURCES = {
  react: [
    "frameworks/react/component-source.ts", "frameworks/react/factory.ts",
    "frameworks/react/hook-source.ts", "frameworks/react/surface-emit.ts",
    "frameworks/react/surface-tests.ts", "frameworks/react/tests.ts",
  ].map((f) => `packages/ds-codegen/src/${f}`),
};

const OUTPUT_TREE = { react: "packages/ds-react/src/components" };

function abs(relToRepo) {
  return path.join(repoRoot, relToRepo);
}
function rel(absPath, base) {
  return path.relative(base, absPath).split(path.sep).join("/");
}
function walk(dir, onFile) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, onFile);
    else if (e.isFile()) onFile(p);
  }
}

/** Build an isolated non-git scratch sandbox (sources only) and regen the target. */
function regenIntoSandbox(target) {
  const sb = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-comp-ledger-"));
  // Copy only what the CLI reads/writes; exclude node_modules & codegen dist.
  execFileSync("rsync", ["-a", "--exclude", "node_modules", "--exclude", "ds-codegen/dist",
    path.join(repoRoot, "packages") + "/", path.join(sb, "packages") + "/"]);
  for (const f of ["fsds.targets.json", "package.json", "tsconfig.json", "pnpm-lock.yaml"]) {
    const src = abs(f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(sb, f));
  }
  // Build codegen once in the real checkout, run its compiled CLI with sb as cwd.
  execFileSync("pnpm", ["exec", "turbo", "run", "build", "--filter=@full-stack-ds/codegen"],
    { cwd: repoRoot, stdio: "pipe" });
  execFileSync("node", [abs("packages/ds-codegen/dist/cli.js"), `--target=${target}`],
    { cwd: sb, stdio: "pipe" });
  return sb;
}

function componentContracts(sb) {
  const root = path.join(sb, "packages/ds-contracts/components");
  const names = fs.existsSync(root)
    ? fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];
  return names.map((name) => {
    const dir = path.join(root, name);
    const inputs = [];
    for (const f of fs.readdirSync(dir)) {
      // Codegen inputs only: contract + style/token sidecars. usage.jsonl is DOC.
      if (f.endsWith(".contract.json")) inputs.push({ role: "contract", abs: path.join(dir, f) });
      else if (f.endsWith(".styles.json")) inputs.push({ role: "styles", abs: path.join(dir, f) });
      else if (f.endsWith(".tokens.json")) inputs.push({ role: "tokens", abs: path.join(dir, f) });
    }
    return { name, inputs };
  });
}

function main() {
  if (!OUTPUT_TREE[targetArg]) {
    console.error(`Unsupported --target=${targetArg} (prototype supports: ${Object.keys(OUTPUT_TREE).join(", ")}).`);
    process.exit(2);
  }
  const sb = regenIntoSandbox(targetArg);
  try {
    const outRoot = path.join(sb, OUTPUT_TREE[targetArg]);
    // Emitter-source inputs, shared across every component of this target.
    const emitterInputs = [...SHARED_EMITTER_SOURCES, ...FRAMEWORK_EMITTER_SOURCES[targetArg]]
      .map((r) => ({ role: "emitter", abs: path.join(sb, r) }))
      .filter((i) => fs.existsSync(i.abs));
    const envInput = { role: "env", abs: path.join(sb, "pnpm-lock.yaml") };

    const rows = [];
    for (const comp of componentContracts(sb)) {
      const compOutDir = path.join(outRoot, comp.name);
      const outputs = [];
      walk(compOutDir, (p) => outputs.push({ relPath: rel(p, sb), absPath: p }));
      if (outputs.length === 0) continue; // component with no emitted output for this target

      const inputs = [
        ...comp.inputs.map((i) => ({ role: i.role, relPath: rel(i.abs, sb), absPath: i.abs })),
        ...emitterInputs.map((i) => ({ role: i.role, relPath: rel(i.abs, sb), absPath: i.abs })),
        { role: envInput.role, relPath: rel(envInput.abs, sb), absPath: envInput.abs },
      ];
      rows.push(buildRow({
        unitId: `${comp.name}@${targetArg}`,
        target: targetArg,
        observation: computeObservation(inputs),
        attachments: computeAttachments(outputs),
      }));
    }

    const fresh = assembleLedger(rows);
    const scratchLedger = path.join(sb, `emission-ledger.${targetArg}.json`);

    if (checkMode) {
      const committed = fs.existsSync(scratchLedger) ? JSON.parse(fs.readFileSync(scratchLedger, "utf8")) : null;
      const v = checkAgainstCommitted(fresh, committed);
      console.log(`Component gate (${targetArg}): ${v.fresh_edge_count} fresh vs ${v.committed_edge_count} committed; missing=${v.missing.length} stale=${v.stale.length}`);
      process.exit(v.ok ? 0 : 1);
    }

    fs.writeFileSync(scratchLedger, serializeLedger(fresh));
    const totalFiles = fresh.rows.reduce((n, r) => n + r.attachments.length, 0);
    console.log(`Component ledger (${targetArg}): ${fresh.row_count} units, ${totalFiles} files -> ${fresh.edge_count} distinct edges.`);
    console.log(`  dedup savings: ${totalFiles - fresh.edge_count} files collapsed into shared edges.`);
    console.log(`  scratch ledger: ${scratchLedger}`);
    // Emit a small machine-readable proof to stdout for the caller to capture.
    console.log(`PROOF ${JSON.stringify({ target: targetArg, units: fresh.row_count, files: totalFiles, edges: fresh.edge_count })}`);
    // Leave sandbox for the WRITE run so --check can compare; caller cleans up.
    console.log(`  (sandbox retained at ${sb})`);
    return;
  } finally {
    if (checkMode) fs.rmSync(sb, { recursive: true, force: true });
  }
}

main();
