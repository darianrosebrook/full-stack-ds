#!/usr/bin/env node
/**
 * Contract-driven codegen CLI.
 *
 * Pipeline:
 *   1. Discover contract files in `packages/ds-contracts/`.
 *   2. Validate them with the schema (`validate.ts`).
 *   3. Build a `ComponentIR` for each valid contract.
 *   4. Resolve requested targets via the registry.
 *   5. Hand the IR to each target's `FrameworkEmitter`.
 *   6. Write outputs (with preservation rules), then write the per-target
 *      barrel file.
 *
 * Run from repository root: `npm run generate -- [--target=react,vue] [...]`
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import type { ComponentContract } from "./contract.js";
import {
  type FrameworkEmitter,
  type GeneratedFile,
  type TargetId,
  parseTargetArg,
} from "./emitter.js";
import { buildComponentIR, type ComponentIR } from "./ir.js";
import {
  type CommentStyle,
  PreserveError,
  hasMarkers,
  injectMigrationTodo,
  mergeSections,
  renderSections,
  splitSections,
} from "./preserve.js";
import {
  createDefaultRegistry,
  type TargetBinding,
  type TargetRegistry,
} from "./registry.js";
import {
  type ContractValidator,
  createContractValidator,
  formatIssues,
} from "./validate.js";
import {
  EMISSION_MANIFEST_SCHEMA_VERSION,
  type ContractProvenance,
  type EmissionManifest,
  type EmittedArtifactFile,
  type EmittedArtifactGroup,
} from "./validation/types.js";
import {
  EMISSION_MANIFEST_RELATIVE_PATH,
  emissionManifestAbsolutePath,
} from "./validation/emission-manifest-path.js";

/**
 * One contract's parsed value paired with the source-side
 * provenance the EmissionManifest needs at write time
 * (CODEGEN-RAIL-CONTRACT-PROVENANCE-01). The digest is captured
 * over the on-disk bytes at read time so the manifest binds to the
 * contract revision the generator actually consumed, not to a
 * later edit.
 */
interface ContractInput {
  contract: ComponentContract;
  provenance: ContractProvenance;
}

const cwd = process.cwd();
const CONTRACTS_DIR = path.join(cwd, "packages", "ds-contracts");
const STACK_PRIMITIVE_PATH = path.join(
  CONTRACTS_DIR,
  "primitives",
  "Stack.primitive.json",
);

interface CliArgs {
  validateOnly: boolean;
  dryRun: boolean;
  testsOnly: boolean;
  force: boolean;
  strictTypes: boolean;
  migrate: boolean;
  watch: boolean;
  targets: string | undefined;
  names: string[];
}

function parseArgs(argv: string[]): CliArgs {
  const validateOnly = argv.includes("--validate");
  const dryRun = argv.includes("--dry-run");
  const testsOnly = argv.includes("--tests-only");
  const force = argv.includes("--force");
  const strictTypes = argv.includes("--strict-types");
  const migrate = argv.includes("--migrate");
  const watch = argv.includes("--watch");

  let targets: string | undefined;
  for (const a of argv) {
    if (a.startsWith("--target=")) targets = a.slice("--target=".length);
    else if (a.startsWith("--targets=")) targets = a.slice("--targets=".length);
  }

  const names = argv.filter((a) => !a.startsWith("--"));
  return {
    validateOnly,
    dryRun,
    testsOnly,
    force,
    strictTypes,
    migrate,
    watch,
    targets,
    names,
  };
}

function main(): void {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.watch && args.validateOnly) {
    console.error("--watch is incompatible with --validate.");
    process.exit(1);
  }
  if (args.watch && args.dryRun) {
    console.error("--watch is incompatible with --dry-run.");
    process.exit(1);
  }
  if (args.watch && args.migrate) {
    console.error("--watch is incompatible with --migrate.");
    process.exit(1);
  }

  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.error("Contracts directory not found:", CONTRACTS_DIR);
    process.exit(1);
  }

  const validator = createContractValidator({ contractsRoot: CONTRACTS_DIR });

  const contractFiles = fs
    .readdirSync(CONTRACTS_DIR)
    .filter((f) => f.endsWith(".contract.json"));

  if (contractFiles.length === 0) {
    console.error("No *.contract.json files in", CONTRACTS_DIR);
    process.exit(1);
  }

  const filtered =
    args.names.length > 0
      ? contractFiles.filter((f) => {
          const cName = f.replace(".contract.json", "");
          return args.names.includes(cName);
        })
      : contractFiles;

  console.log(`Found ${filtered.length} component contract(s) to process.\n`);

  let hasErrors = false;

  // Validate the Stack primitive contract first.
  const stackRaw = JSON.parse(fs.readFileSync(STACK_PRIMITIVE_PATH, "utf-8"));
  const stackResult = validator.validatePrimitive(stackRaw);
  if (!stackResult.ok) {
    console.error("INVALID Stack.primitive.json");
    console.error(formatIssues(stackResult.issues));
    hasErrors = true;
  } else {
    console.log("  VALID  primitives/Stack.primitive.json");
  }

  const validContracts: ContractInput[] = [];

  for (const file of filtered) {
    const filePath = path.join(CONTRACTS_DIR, file);
    const rawBytes = fs.readFileSync(filePath);
    const raw = JSON.parse(rawBytes.toString("utf-8"));
    const result = validator.validateComponent(raw);

    if (!result.ok) {
      console.error(`INVALID  ${file}`);
      console.error(formatIssues(result.issues));
      hasErrors = true;
    } else {
      console.log(`  VALID  ${file}`);
      validContracts.push({
        contract: result.value,
        provenance: {
          path: toPosixRel(filePath),
          sha256: crypto.createHash("sha256").update(rawBytes).digest("hex"),
        },
      });
    }
  }

  console.log(
    `\nValidation: ${validContracts.length}/${filtered.length} component contract(s) passed.`,
  );

  if (hasErrors) {
    console.error("\nFix validation errors before generating.");
  }

  if (args.validateOnly) {
    process.exit(hasErrors ? 1 : 0);
  }

  if (validContracts.length === 0) {
    console.log("No valid contracts to generate.");
    process.exit(1);
  }

  // Build registry + resolve targets.
  const registry = createDefaultRegistry({
    workspaceRoot: cwd,
    contractsRoot: CONTRACTS_DIR,
  });
  const available = registry.available();

  let requestedTargets: TargetId[];
  try {
    requestedTargets = parseTargetArg(args.targets, available);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  // Build IRs once; emitters share them. Pair each IR with the
  // contract's provenance so emit time can stamp every artifact
  // group with its source contract revision.
  const irInputs: { ir: ComponentIR; provenance: ContractProvenance }[] =
    validContracts.map((input) => ({
      ir: buildComponentIR(input.contract),
      provenance: input.provenance,
    }));
  const irs: ComponentIR[] = irInputs.map((x) => x.ir);

  if (!surfaceTypeDiagnostics(irs, args.strictTypes)) {
    process.exit(1);
  }

  console.log(
    `\nGenerating ${irs.length} component(s) for target(s): ${requestedTargets.join(", ")}\n`,
  );

  let totalGenerated = 0;
  const allGroups: EmittedArtifactGroup[] = [];
  for (const targetId of requestedTargets) {
    const binding = registry.get(targetId);
    const { processed, groups } = emitForTarget(binding, irInputs, args);
    totalGenerated += processed;
    allGroups.push(...groups);
  }

  console.log(
    `\nDone. ${totalGenerated} file group(s) ${args.dryRun ? "would be " : ""}generated.`,
  );

  // Write the EmissionManifest after all targets emit. The rail
  // (validate:generated) joins this manifest against each
  // framework's PlanCommand scopes to produce per-artifact
  // admission attribution.
  //
  // Skipped in --dry-run (no files were actually written, so the
  // manifest would not reflect on-disk state) and in --tests-only
  // (the component-source artifacts would be missing from the
  // group; misleading for downstream admission joins).
  if (!args.dryRun && !args.testsOnly && allGroups.length > 0) {
    writeEmissionManifest(allGroups);
  }

  if (args.watch) {
    console.log(
      `\nWatching ${path.relative(cwd, CONTRACTS_DIR)} for changes (Ctrl+C to stop)...`,
    );
    startWatch(args, requestedTargets, registry, validator);
    return; // keep process alive
  }
}

/**
 * Apply one target's emitter to a list of IRs and write/preview the results.
 * Returns the per-component artifact groups for the EmissionManifest, plus
 * a count for the human-summary line. Each group carries the source contract
 * provenance the IR was built from. Groups are empty in `--dry-run` mode
 * (no files were actually written).
 */
function emitForTarget(
  binding: TargetBinding,
  irInputs: { ir: ComponentIR; provenance: ContractProvenance }[],
  args: CliArgs,
): { processed: number; groups: EmittedArtifactGroup[] } {
  const { emitter, componentsRoot } = binding;
  console.log(`\n[${emitter.id}] components root: ${path.relative(cwd, componentsRoot)}`);

  const groups: EmittedArtifactGroup[] = [];
  for (const { ir, provenance } of irInputs) {
    const writtenFiles = writeFiles(emitter, ir, binding, args);
    if (writtenFiles.length > 0) {
      groups.push({
        framework: emitter.id,
        component: ir.name,
        contract: provenance,
        files: writtenFiles,
      });
    }
  }

  if (!args.dryRun) {
    writeBarrel(binding);
  }

  return { processed: irInputs.length, groups };
}

/**
 * Write every file the emitter produced for one component on one
 * target. Returns one EmittedArtifactFile per file actually
 * written, with the post-write content sha256 digest. Empty in
 * `--dry-run`. Excludes skipped legacy files. Legacy snapshots
 * (kind: "migrated") are NOT included — they are preservation
 * artifacts, not new generated output.
 *
 * The sha256 is computed by re-reading the just-written file from
 * disk, NOT by hashing the in-memory generated string. This
 * intentionally captures any newline/formatter effects that
 * `fs.writeFileSync` (or downstream tooling between write and
 * verification) might introduce, so the digest binds the manifest
 * to the bytes the framework checkers actually consume.
 */
function writeFiles(
  emitter: FrameworkEmitter,
  ir: ComponentIR,
  binding: TargetBinding,
  args: CliArgs,
): EmittedArtifactFile[] {
  const componentFiles: GeneratedFile[] = args.testsOnly
    ? []
    : emitter.emitComponent(ir, {
        componentsRoot: binding.componentsRoot,
        contractsRoot: CONTRACTS_DIR,
      });
  const hookFiles: GeneratedFile[] =
    !args.testsOnly && emitter.emitHook
      ? emitter.emitHook(ir, {
          componentsRoot: binding.componentsRoot,
          contractsRoot: CONTRACTS_DIR,
        })
      : [];
  const testFiles: GeneratedFile[] = ir.generateTests
    ? emitter.emitTests(ir, {
        componentsRoot: binding.componentsRoot,
        contractsRoot: CONTRACTS_DIR,
      })
    : [];
  const allFiles = [...componentFiles, ...hookFiles, ...testFiles];

  if (args.dryRun) {
    console.log(`  DRY RUN  ${ir.name}`);
    for (const f of allFiles) {
      console.log(
        `    → ${path.relative(cwd, path.join(binding.componentsRoot, f.relativePath))}`,
      );
    }
    return [];
  }

  const written: EmittedArtifactFile[] = [];
  for (const file of allFiles) {
    const absPath = path.join(binding.componentsRoot, file.relativePath);
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    const result = resolveWriteContents(file, absPath, args);
    if (result.kind === "skipped") {
      console.log(`  SKIPPED  ${file.relativePath} (${result.reason})`);
      continue;
    }
    if (result.kind === "migrated") {
      fs.writeFileSync(result.legacyAbsPath, result.legacyContents);
      console.log(
        `  LEGACY   ${path.relative(cwd, result.legacyAbsPath)} (snapshot)`,
      );
    }
    fs.writeFileSync(absPath, result.contents);
    written.push({
      path: toPosixRel(absPath),
      sha256: sha256FromDisk(absPath),
    });
  }
  console.log(`  GENERATED  ${args.testsOnly ? "(tests) " : ""}${ir.name}`);
  return written;
}

/**
 * Workspace-root-relative POSIX path of an absolute path. Used to
 * keep EmissionManifest paths portable across machines/OSes.
 */
function toPosixRel(absPath: string): string {
  return path.relative(cwd, absPath).split(path.sep).join("/");
}

/**
 * Lowercase hex sha256 of the file at `absPath`. Reads bytes from
 * disk (NOT from any in-memory copy) so the digest captures the
 * actual on-disk state — including any newline normalization
 * `fs.writeFileSync` applied, or any downstream tooling that may
 * have mutated the file after write.
 */
function sha256FromDisk(absPath: string): string {
  const bytes = fs.readFileSync(absPath);
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

/**
 * Serialize the EmissionManifest to its well-known location so
 * `validate:generated` can join it against framework PlanCommand
 * scopes AND verify on-disk artifacts against the manifest's
 * recorded digests (REQUIRED-CI-01).
 *
 * The manifest is per-machine (gitignored). Each successful
 * non-dry-run, non-tests-only invocation of the codegen CLI
 * overwrites it; partial invocations (target subsets) write a
 * manifest scoped to the requested targets only — the rail consumes
 * whatever is on disk, and a subsetted manifest means subsetted
 * admission attribution.
 *
 * The manifest carries an explicit `schemaVersion`. Consumers that
 * see a mismatch must either fall back to legacy unattributed mode
 * (optional rail) or fail with RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH
 * (required rail). Never silently degrade.
 */
function writeEmissionManifest(groups: EmittedArtifactGroup[]): void {
  const manifest: EmissionManifest = {
    schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    groups,
  };
  const absPath = emissionManifestAbsolutePath(cwd);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const fileCount = groups.reduce((acc, g) => acc + g.files.length, 0);
  console.log(
    `\n  MANIFEST  ${EMISSION_MANIFEST_RELATIVE_PATH} (${groups.length} group(s), ${fileCount} file(s), schema v${EMISSION_MANIFEST_SCHEMA_VERSION})`,
  );
}

type WriteResolution =
  | { kind: "fresh"; contents: string }
  | { kind: "merged"; contents: string }
  | {
      kind: "migrated";
      contents: string;
      legacyAbsPath: string;
      legacyContents: string;
    }
  | { kind: "skipped"; reason: string };

/**
 * Decide what to write for a single generated file. The CLI handles four
 * cases:
 *
 *   1. File doesn't exist         → write the generator output as-is.
 *   2. --force                    → write the generator output as-is.
 *   3. Existing file has markers  → merge: replace `@generated` regions,
 *                                   preserve `@custom` regions.
 *   4. Existing file has no markers (legacy):
 *        - with --migrate         → snapshot existing as `<name>.legacy.<ext>`
 *                                   and write the fresh marker scaffold with
 *                                   a TODO pointing at the snapshot.
 *        - without --migrate      → skip with a hint to re-run with --migrate.
 *
 * Files not marked `preservable` are written verbatim; preservation is
 * opt-in per `GeneratedFile`.
 */
function resolveWriteContents(
  file: GeneratedFile,
  absPath: string,
  args: CliArgs,
): WriteResolution {
  if (!file.preservable) {
    return { kind: "fresh", contents: file.contents };
  }
  if (!fs.existsSync(absPath) || args.force) {
    return { kind: "fresh", contents: file.contents };
  }

  const existing = fs.readFileSync(absPath, "utf-8");
  const style = inferCommentStyle(absPath);

  if (!hasMarkers(existing)) {
    if (!args.migrate) {
      return {
        kind: "skipped",
        reason: "legacy file (no markers); rerun with --migrate to convert",
      };
    }
    const ext = path.extname(absPath);
    const base = absPath.slice(0, absPath.length - ext.length);
    const legacyAbsPath = `${base}.legacy${ext}`;
    const legacyRel = path.basename(legacyAbsPath);
    const freshSections = splitSections(file.contents);
    const migrated = injectMigrationTodo(
      freshSections,
      legacyRel,
      style,
      candidateMigrationIdsFor(absPath),
    );
    return {
      kind: "migrated",
      contents: renderSections(migrated, style),
      legacyAbsPath,
      legacyContents: existing,
    };
  }

  try {
    const merged = mergeSections(
      splitSections(file.contents),
      splitSections(existing),
    );
    return { kind: "merged", contents: renderSections(merged, style) };
  } catch (err) {
    if (err instanceof PreserveError) {
      return {
        kind: "skipped",
        reason: `marker parse error: ${err.message}`,
      };
    }
    throw err;
  }
}

/**
 * Choose the comment style for marker emission/merging based on file
 * extension. CSS uses block comments; everything else uses line comments.
 */
function inferCommentStyle(absPath: string): CommentStyle {
  const ext = path.extname(absPath).toLowerCase();
  if (ext === ".css" || ext === ".scss" || ext === ".sass" || ext === ".less") {
    return "block";
  }
  return "line";
}

/**
 * Per-file-type list of custom region ids to consider when injecting the
 * legacy migration TODO. The first match in the generated section list
 * receives the TODO; if no candidate matches, the TODO is appended as
 * a new custom region named after the first candidate.
 */
function candidateMigrationIdsFor(absPath: string): readonly string[] {
  const lower = absPath.toLowerCase();
  if (lower.endsWith(".test.tsx") || lower.endsWith(".test.ts")) {
    return ["tests"];
  }
  if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".sass") || lower.endsWith(".less")) {
    return ["overrides"];
  }
  return ["trailing"];
}

function writeBarrel(binding: TargetBinding): void {
  const componentIds = binding.emitter.discoverComponentIds(
    binding.componentsRoot,
  );
  if (componentIds.length === 0) return;
  const barrelPath = path.join(binding.componentsRoot, binding.barrelFile);
  fs.writeFileSync(
    barrelPath,
    binding.emitter.emitBarrel(componentIds, binding.componentsRoot),
  );
  console.log(
    `\n  BARREL  ${path.relative(cwd, barrelPath)} (${componentIds.length} components)`,
  );
}

/**
 * Watch the contracts directory for file changes and re-generate the affected
 * component on each save. Uses `node:fs` watch (FSEvents on macOS) with a
 * 150 ms debounce to coalesce the double-fire many editors produce.
 *
 * Compatible flags: --target, --force, --tests-only, --strict-types, names.
 * Incompatible flags (rejected before reaching here): --validate, --dry-run,
 * --migrate.
 */
function startWatch(
  args: CliArgs,
  requestedTargets: TargetId[],
  registry: TargetRegistry,
  validator: ContractValidator,
): void {
  const debounce = new Map<string, ReturnType<typeof setTimeout>>();

  fs.watch(CONTRACTS_DIR, { persistent: true }, (event, filename) => {
    if (!filename?.endsWith(".contract.json")) return;
    if (event !== "change" && event !== "rename") return;

    const existing = debounce.get(filename);
    if (existing) clearTimeout(existing);
    debounce.set(
      filename,
      setTimeout(() => {
        debounce.delete(filename);
        watchHandleChange(filename, args, requestedTargets, registry, validator);
      }, 150),
    );
  });
}

function watchHandleChange(
  filename: string,
  args: CliArgs,
  requestedTargets: TargetId[],
  registry: TargetRegistry,
  validator: ContractValidator,
): void {
  const filePath = path.join(CONTRACTS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`\n[watch] ${filename} removed — skipping.`);
    return;
  }

  const componentName = filename.replace(".contract.json", "");

  // If a names filter was set, only process matching contracts.
  if (args.names.length > 0 && !args.names.includes(componentName)) return;

  console.log(`\n[watch] ${filename} changed — regenerating ${componentName}...`);

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      console.log(`[watch] ${filename} disappeared mid-read — skipping.`);
      return;
    }
    console.error(`[watch] JSON parse error in ${filename} — skipping.`);
    return;
  }

  const result = validator.validateComponent(raw);
  if (!result.ok) {
    console.error(`[watch] INVALID ${filename}:`);
    console.error(formatIssues(result.issues));
    return;
  }

  const ir = buildComponentIR(result.value);

  if (ir.unresolvedTypeRefs.length > 0) {
    for (const ref of ir.unresolvedTypeRefs) {
      console.warn(
        `[watch] unresolved type "${ref.ref}" in ${ir.name} (${ref.fromProps.join(", ")})`,
      );
    }
    if (args.strictTypes) {
      console.error("[watch] --strict-types: aborting due to unresolved types.");
      return;
    }
  }

  for (const targetId of requestedTargets) {
    const binding = registry.get(targetId);
    // Watch mode intentionally does NOT update the EmissionManifest
    // after each contract change. An incremental update would leave
    // the manifest in a partial state the rail cannot distinguish
    // from a full run; the manifest is a full-run snapshot by design.
    // After a watch session, re-run `pnpm run generate` to refresh
    // the manifest before invoking `validate:generated`.
    writeFiles(binding.emitter, ir, binding, args);
    writeBarrel(binding);
  }

  console.log(`[watch] Done.`);
}

/**
 * Print and (optionally) fail on unresolved type references in the IR.
 * Returns `true` when generation should proceed.
 */
function surfaceTypeDiagnostics(
  irs: ComponentIR[],
  strict: boolean,
): boolean {
  const offenders = irs.filter((ir) => ir.unresolvedTypeRefs.length > 0);
  if (offenders.length === 0) return true;

  console.warn("\nUnresolved type references:");
  for (const ir of offenders) {
    for (const ref of ir.unresolvedTypeRefs) {
      console.warn(
        `  ${ir.name}: type "${ref.ref}" referenced by ${ref.fromProps.join(", ")}`,
      );
    }
  }

  if (strict) {
    console.error(
      "\n--strict-types is set. Add the missing types to the contract's `types` block, or remove --strict-types.",
    );
    return false;
  }

  console.warn(
    "Generation will continue, but the missing types fall through as `unknown`. Define them in the contract or pass --strict-types to fail the build.",
  );
  return true;
}

main();
