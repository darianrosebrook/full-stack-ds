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

  const validContracts: ComponentContract[] = [];

  for (const file of filtered) {
    const filePath = path.join(CONTRACTS_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const result = validator.validateComponent(raw);

    if (!result.ok) {
      console.error(`INVALID  ${file}`);
      console.error(formatIssues(result.issues));
      hasErrors = true;
    } else {
      console.log(`  VALID  ${file}`);
      validContracts.push(result.value);
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

  // Build IRs once; emitters share them.
  const irs: ComponentIR[] = validContracts.map(buildComponentIR);

  if (!surfaceTypeDiagnostics(irs, args.strictTypes)) {
    process.exit(1);
  }

  console.log(
    `\nGenerating ${irs.length} component(s) for target(s): ${requestedTargets.join(", ")}\n`,
  );

  let totalGenerated = 0;
  for (const targetId of requestedTargets) {
    const binding = registry.get(targetId);
    totalGenerated += emitForTarget(binding, irs, args);
  }

  console.log(
    `\nDone. ${totalGenerated} file group(s) ${args.dryRun ? "would be " : ""}generated.`,
  );

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
 * Returns the count of components processed for that target.
 */
function emitForTarget(
  binding: TargetBinding,
  irs: ComponentIR[],
  args: CliArgs,
): number {
  const { emitter, componentsRoot } = binding;
  console.log(`\n[${emitter.id}] components root: ${path.relative(cwd, componentsRoot)}`);

  for (const ir of irs) {
    writeFiles(emitter, ir, binding, args);
  }

  if (!args.dryRun) {
    writeBarrel(binding);
  }

  return irs.length;
}

function writeFiles(
  emitter: FrameworkEmitter,
  ir: ComponentIR,
  binding: TargetBinding,
  args: CliArgs,
): void {
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
    return;
  }

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
  }
  console.log(`  GENERATED  ${args.testsOnly ? "(tests) " : ""}${ir.name}`);
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
