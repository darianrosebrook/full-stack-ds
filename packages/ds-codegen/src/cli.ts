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
import type { ComponentContract, TokenResolution } from "./contract.js";
import {
  mergeBoxModelDefaults,
  partitionBoxModelTokens,
} from "./box-model.js";
import {
  findComponentStyles,
  findComponentTokens,
  findComponentUsage,
  listComponentContracts,
  type DiscoveredContract,
} from "./contracts-fs.js";
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
  type EmitterSourceFile,
  type EmitterSourceSet,
  type EnvironmentProvenance,
  type FrameworkId,
} from "./validation/types.js";
import {
  EMISSION_MANIFEST_RELATIVE_PATH,
  emissionManifestAbsolutePath,
} from "./validation/emission-manifest-path.js";
import { readManifestForVerification } from "./validation/required-mode.js";
import { validateContractSemantics } from "./validation/semantic.js";
import { validateContractTokens } from "./validation/tokens.js";
import {
  validateContractStyles,
  validateStylesSelectorCollisions,
} from "./validation/styles.js";
import { validateContractEmittedCss } from "./validation/contract-tokens.js";
import { validateContractEmittedStyles } from "./validation/contract-styles.js";
import {
  parseUsageJsonl,
  validateUsageLine as validateUsageLineCrossRefs,
} from "./validation/usage.js";
import {
  detectOrphans,
  executeOrphanRemoval,
  type OrphanGroup,
  type OrphanRemovalReport,
} from "./prune/orphans.js";

/**
 * Static declaration of the BOUNDED MATERIAL SOURCE SET per
 * framework (CODEGEN-RAIL-EMITTER-PROVENANCE-01). "Bounded": every
 * file is named explicitly here, not derived at runtime. "Material":
 * inclusion means "this file's bytes can change what THIS framework
 * emits"; validation, reporting, and other non-emit code is
 * deliberately excluded.
 *
 * Authority for this set lives in this file alone. When you add a
 * new emitter helper, you MUST add it here (and to the right
 * framework subset) for the rail's emitter-provenance evidence to
 * stay honest. If you don't, the manifest will silently under-claim
 * coverage and a contributor could edit the helper without
 * EMITTER_SOURCE_HASH_MISMATCH firing.
 *
 * Cross-framework borrowing: `frameworks/react/hook-source.ts` is
 * imported by vue/svelte/angular emitters as a shared substrate, so
 * it appears in those framework sets too (even though it lives
 * under react/). Same logic for `non-react-types.ts`. Bytes are
 * identical regardless of which set claims them.
 */
const SHARED_EMITTER_SOURCES: readonly string[] = [
  "packages/ds-codegen/src/cli.ts",
  "packages/ds-codegen/src/contract.ts",
  "packages/ds-codegen/src/css.ts",
  "packages/ds-codegen/src/emitter.ts",
  "packages/ds-codegen/src/ir.ts",
  "packages/ds-codegen/src/preserve.ts",
  "packages/ds-codegen/src/registry.ts",
  "packages/ds-codegen/src/semantics.ts",
  "packages/ds-codegen/src/test-plan.ts",
];

const FRAMEWORK_EMITTER_SOURCES: Record<FrameworkId, readonly string[]> = {
  react: [
    "packages/ds-codegen/src/frameworks/react/component-source.ts",
    "packages/ds-codegen/src/frameworks/react/factory.ts",
    "packages/ds-codegen/src/frameworks/react/hook-source.ts",
    "packages/ds-codegen/src/frameworks/react/surface-emit.ts",
    "packages/ds-codegen/src/frameworks/react/surface-tests.ts",
    "packages/ds-codegen/src/frameworks/react/tests.ts",
  ],
  vue: [
    "packages/ds-codegen/src/frameworks/vue/barrel.ts",
    "packages/ds-codegen/src/frameworks/vue/component-source.ts",
    "packages/ds-codegen/src/frameworks/vue/factory.ts",
    "packages/ds-codegen/src/frameworks/vue/hook-source.ts",
    "packages/ds-codegen/src/frameworks/vue/surface-emit.ts",
    "packages/ds-codegen/src/frameworks/vue/surface-tests.ts",
    "packages/ds-codegen/src/frameworks/vue/tests.ts",
    "packages/ds-codegen/src/non-react-types.ts",
    "packages/ds-codegen/src/frameworks/react/hook-source.ts",
  ],
  svelte: [
    "packages/ds-codegen/src/frameworks/svelte/barrel.ts",
    "packages/ds-codegen/src/frameworks/svelte/component-source.ts",
    "packages/ds-codegen/src/frameworks/svelte/factory.ts",
    "packages/ds-codegen/src/frameworks/svelte/hook-source.ts",
    "packages/ds-codegen/src/frameworks/svelte/surface-emit.ts",
    "packages/ds-codegen/src/frameworks/svelte/surface-tests.ts",
    "packages/ds-codegen/src/frameworks/svelte/tests.ts",
    "packages/ds-codegen/src/non-react-types.ts",
    "packages/ds-codegen/src/frameworks/react/hook-source.ts",
  ],
  angular: [
    "packages/ds-codegen/src/frameworks/angular/barrel.ts",
    "packages/ds-codegen/src/frameworks/angular/component-source.ts",
    "packages/ds-codegen/src/frameworks/angular/factory.ts",
    "packages/ds-codegen/src/frameworks/angular/hook-source.ts",
    "packages/ds-codegen/src/frameworks/angular/surface-emit.ts",
    "packages/ds-codegen/src/frameworks/angular/surface-tests.ts",
    "packages/ds-codegen/src/frameworks/angular/tests.ts",
    "packages/ds-codegen/src/non-react-types.ts",
    "packages/ds-codegen/src/frameworks/react/hook-source.ts",
  ],
  lit: [
    "packages/ds-codegen/src/frameworks/lit/barrel.ts",
    "packages/ds-codegen/src/frameworks/lit/component-source.ts",
    "packages/ds-codegen/src/frameworks/lit/factory.ts",
    "packages/ds-codegen/src/frameworks/lit/hook-source.ts",
    "packages/ds-codegen/src/frameworks/lit/surface-emit.ts",
    "packages/ds-codegen/src/frameworks/lit/surface-tests.ts",
    "packages/ds-codegen/src/frameworks/lit/tests.ts",
    "packages/ds-codegen/src/non-react-types.ts",
  ],
};

/**
 * Workspace-relative POSIX path of the pnpm lockfile. Authority
 * lives here so a future migration to a different lockfile (e.g.
 * `pnpm-workspace.yaml` overrides, or a non-pnpm package manager)
 * is a single-constant change. The verifier uses
 * `manifest.environment.lockfile.path` rather than this constant
 * because old manifests must continue to verify against the path
 * the producer recorded, even if the constant later moves.
 */
const LOCKFILE_RELATIVE_PATH = "pnpm-lock.yaml";

/**
 * Workspace-relative POSIX path of the codegen package manifest.
 * Producer reads `version` from here to stamp the manifest's
 * `environment.codegenPackageVersion`.
 */
const CODEGEN_PACKAGE_JSON_RELATIVE_PATH = "packages/ds-codegen/package.json";

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
  /**
   * When set with --validate, also run the beyond-schema semantic
   * validator (cross-field references + layer-conditional rules).
   * Findings are surfaced as additional issues alongside any AJV
   * errors. Off by default so legacy invocations of --validate stay
   * non-breaking; opt-in via `pnpm run generate:check`.
   */
  checkSemantics: boolean;
  /**
   * When set with --validate, also schema-validate every component's
   * `<Name>.usage.jsonl` and then resolve `fsds.*` refs against the
   * contract registry, checking that referenced props and slots are real.
   * Off by default; runs independently of --check-semantics so usage drift
   * fails on its own surface.
   */
  checkUsage: boolean;
  dryRun: boolean;
  testsOnly: boolean;
  force: boolean;
  strictTypes: boolean;
  migrate: boolean;
  watch: boolean;
  /**
   * Orphan-pruning policy for hand-edited files when --prune is set.
   *   "off"         — pruning disabled entirely (default).
   *   "skip"        — delete generated orphans; leave hand-edited
   *                   files in place; list them in the summary.
   *   "force"       — delete every orphan file regardless of marker.
   *   "quarantine"  — delete generated orphans; move hand-edited
   *                   files into packages/ds-codegen/.orphan-quarantine/.
   */
  prune: "off" | "skip" | "force" | "quarantine";
  targets: string | undefined;
  names: string[];
}

function parseArgs(argv: string[]): CliArgs {
  const validateOnly = argv.includes("--validate");
  const checkSemantics = argv.includes("--check-semantics");
  const checkUsage = argv.includes("--check-usage");
  const dryRun = argv.includes("--dry-run");
  const testsOnly = argv.includes("--tests-only");
  const force = argv.includes("--force");
  const strictTypes = argv.includes("--strict-types");
  const migrate = argv.includes("--migrate");
  const watch = argv.includes("--watch");

  // --prune (default policy: skip) | --prune=force | --prune=quarantine.
  // Off when --prune is not passed at all. `--prune` alone is the
  // recommended default — it removes generated orphans and surfaces
  // hand-edited ones in the summary without losing them.
  let prune: CliArgs["prune"] = "off";
  for (const a of argv) {
    if (a === "--prune") {
      prune = "skip";
    } else if (a.startsWith("--prune=")) {
      const value = a.slice("--prune=".length);
      if (value === "skip" || value === "force" || value === "quarantine") {
        prune = value;
      } else {
        console.error(
          `Unknown --prune value "${value}". Expected: skip, force, or quarantine.`,
        );
        process.exit(1);
      }
    }
  }

  let targets: string | undefined;
  for (const a of argv) {
    if (a.startsWith("--target=")) targets = a.slice("--target=".length);
    else if (a.startsWith("--targets=")) targets = a.slice("--targets=".length);
  }

  const names = argv.filter((a) => !a.startsWith("--"));
  return {
    validateOnly,
    checkSemantics,
    checkUsage,
    dryRun,
    testsOnly,
    force,
    strictTypes,
    migrate,
    watch,
    prune,
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

  // --prune is only safe when the generator sees the complete
  // current component set. Partial runs (--target=<subset>,
  // name-filtered) would falsely declare every component outside
  // the partial scope as orphan. Refuse instead of producing
  // dangerous state.
  if (args.prune !== "off") {
    if (args.watch) {
      console.error("--prune is incompatible with --watch.");
      process.exit(1);
    }
    if (args.testsOnly) {
      console.error("--prune is incompatible with --tests-only.");
      process.exit(1);
    }
    if (args.names.length > 0) {
      console.error(
        "--prune refuses to run with a name filter — it would falsely\n" +
          "  orphan every component outside the filter. Drop the name args\n" +
          "  or remove --prune.",
      );
      process.exit(1);
    }
    if (args.targets && args.targets !== "all") {
      console.error(
        `--prune refuses to run with --target=${args.targets} — it would falsely\n` +
          "  orphan components in untargeted frameworks. Use --target=all or\n" +
          "  remove --prune.",
      );
      process.exit(1);
    }
  }

  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.error("Contracts directory not found:", CONTRACTS_DIR);
    process.exit(1);
  }

  const validator = createContractValidator({ contractsRoot: CONTRACTS_DIR });

  const discovered = listComponentContracts(CONTRACTS_DIR);

  if (discovered.length === 0) {
    console.error(
      "No *.contract.json files found under",
      path.join(CONTRACTS_DIR, "components"),
    );
    process.exit(1);
  }

  const filtered =
    args.names.length > 0
      ? discovered.filter((c) => args.names.includes(c.name))
      : discovered;

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

  for (const entry of filtered) {
    const { filename: file, absPath: filePath } = entry;
    const rawBytes = fs.readFileSync(filePath);
    const raw = JSON.parse(rawBytes.toString("utf-8"));
    const result = validator.validateComponent(raw);

    if (!result.ok) {
      console.error(`INVALID  ${file}`);
      console.error(formatIssues(result.issues));
      hasErrors = true;
      continue;
    }

    // Attach tokens + styles from the sidecars (if any) onto the in-memory
    // contract before IR/emit. Downstream code reads `contract.tokens` and
    // `contract.styles` as if they came from the contract directly; the
    // sidecars are purely a source-of-truth split. A missing sidecar means
    // this component has no tokens / no styles — that is supported, not an
    // error.
    //
    // The box-model primitive's defaults are merged UNDER whatever the
    // sidecar declares (component-authored `box-model.*` keys win), so
    // every component gets the full box-model slot pool on its root
    // selector even if the sidecar is missing entirely. See box-model.ts.
    let authoredTokens: Record<string, TokenResolution> | undefined;
    const tokensEntry = findComponentTokens(entry);
    if (tokensEntry) {
      const tokensRaw = JSON.parse(fs.readFileSync(tokensEntry.absPath, "utf-8"));
      const tokensResult = validator.validateTokens(tokensRaw);
      if (!tokensResult.ok) {
        console.error(`INVALID  ${tokensEntry.filename}`);
        console.error(formatIssues(tokensResult.issues));
        hasErrors = true;
        continue;
      }
      // Partition: `box-model.*` keys must pass the strict box-model
      // schema (closed slot enum + literal vocabulary); everything else
      // is a component-local slot already accepted by validateTokens.
      const partitioned = partitionBoxModelTokens(
        tokensResult.value as Record<string, TokenResolution>,
      );
      const boxResult = validator.validateBoxModelTokens(partitioned.boxModel);
      if (!boxResult.ok) {
        console.error(`INVALID  ${tokensEntry.filename} (box-model)`);
        console.error(formatIssues(boxResult.issues));
        hasErrors = true;
        continue;
      }
      authoredTokens = tokensResult.value as Record<string, TokenResolution>;
    }
    (result.value as { tokens?: unknown }).tokens =
      mergeBoxModelDefaults(authoredTokens);
    const stylesEntry = findComponentStyles(entry);
    if (stylesEntry) {
      const stylesRaw = JSON.parse(fs.readFileSync(stylesEntry.absPath, "utf-8"));
      const stylesResult = validator.validateStyles(stylesRaw);
      if (!stylesResult.ok) {
        console.error(`INVALID  ${stylesEntry.filename}`);
        console.error(formatIssues(stylesResult.issues));
        hasErrors = true;
        continue;
      }
      (result.value as { styles?: unknown }).styles = stylesResult.value;
    }

    // Beyond-schema semantic checks run only when explicitly
    // requested (--check-semantics). Surfaced as DRIFT separately
    // from INVALID so operators can tell "fails JSON Schema" from
    // "fails cross-field invariants".
    //
    // Three passes contribute issues:
    //   1. validateContractSemantics — intra-contract cross-field rules
    //   2. validateContractTokens — every resolvesTo path must exist in
    //      the composed token graph (packages/ds-tokens/generated/
    //      composed.tokens.json). Catches contract↔graph drift.
    //   3. validateContractEmittedCss — emitted <Component>.tokens.css per
    //      framework matches what the codegen would emit right now. Catches
    //      "edited the contract but didn't regen" / "hand-edited the CSS
    //      out of contract truth" drift on the SLOT side.
    //   4. validateContractEmittedStyles — same byte-compare invariant on
    //      the CONSUMER side: each framework's <Component>.css
    //      @generated:start styles region must match the contract's
    //      derived emit. Closes the asymmetric proof that existed after
    //      the convergence (slot side was admission-locked; consumer side
    //      had only indirect IR-unit-test coverage).
    //   5. validateContractStyles — every resolvesTo in styles.json must
    //      either name a slot declared in tokens.json (component-local
    //      paths, first segment === cssPrefix) or exist in the global
    //      token graph. Catches typos and cross-contract drift.
    //   6. validateStylesSelectorCollisions — two distinct top-level keys
    //      in styles.json that expand to the same CSS selector silently
    //      overwrite each other.
    // All pass results merge — one DRIFT line per failing contract
    // with all issues from all validators concatenated.
    if (args.checkSemantics) {
      const driftIssues = [
        ...validateContractSemantics(result.value),
        ...validateContractTokens(result.value),
        ...validateContractEmittedCss(result.value),
        ...validateContractEmittedStyles(result.value),
        ...validateContractStyles(result.value),
        ...validateStylesSelectorCollisions(result.value),
      ];
      if (driftIssues.length > 0) {
        console.error(`DRIFT    ${file}`);
        console.error(formatIssues(driftIssues));
        hasErrors = true;
      } else {
        console.log(`  VALID  ${file}`);
      }
    } else {
      console.log(`  VALID  ${file}`);
    }

    validContracts.push({
      contract: result.value,
      provenance: {
        path: toPosixRel(filePath),
        sha256: crypto.createHash("sha256").update(rawBytes).digest("hex"),
      },
    });
  }

  console.log(
    `\nValidation: ${validContracts.length}/${filtered.length} component contract(s) passed.`,
  );

  if (args.checkUsage) {
    const usageHadErrors = runUsageValidation(filtered, validContracts, validator);
    if (usageHadErrors) hasErrors = true;
  }

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

  // Snapshot the previous manifest BEFORE it is overwritten so the
  // prune pass can compare its groups against the current contract
  // set. `null` means there was no previous manifest (first run or
  // the file was deleted by hand) — orphan detection then has
  // nothing to compare against and silently does nothing.
  const previousManifest = args.prune !== "off" ? snapshotPreviousManifest() : null;

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

  // Run orphan pruning AFTER the new manifest has been written so
  // the prior manifest is the source of truth for "what existed
  // before this run". --dry-run prints what would be removed
  // without touching disk.
  if (args.prune !== "off" && previousManifest) {
    runPruneStep(args, previousManifest, registry, requestedTargets);
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
  const environment = computeEnvironmentProvenance();
  const emitterSourceSets = computeEmitterSourceSets();
  const manifest: EmissionManifest = {
    schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    environment,
    emitterSourceSets,
    groups,
  };
  const absPath = emissionManifestAbsolutePath(cwd);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const fileCount = groups.reduce((acc, g) => acc + g.files.length, 0);
  const emitterSourceCount = Object.values(emitterSourceSets).reduce(
    (acc, set) => acc + set.sources.length,
    0,
  );
  console.log(
    `\n  MANIFEST  ${EMISSION_MANIFEST_RELATIVE_PATH} (${groups.length} group(s), ${fileCount} file(s), ${emitterSourceCount} emitter source(s), node v${environment.nodeMajor}+, codegen v${environment.codegenPackageVersion}, schema v${EMISSION_MANIFEST_SCHEMA_VERSION})`,
  );
}

/**
 * Load the on-disk EmissionManifest snapshot from the previous run.
 * Returns null when there is nothing usable to compare against —
 * the manifest is missing, malformed, or on an incompatible schema
 * version. Prune logic treats null as "no previous state", which is
 * the correct semantics for first-run, hand-deleted, or
 * schema-bumped scenarios; absence is information, not an error.
 */
function snapshotPreviousManifest(): EmissionManifest | null {
  const absPath = emissionManifestAbsolutePath(cwd);
  const read = readManifestForVerification(absPath);
  if (read.kind !== "ok") return null;
  return read.manifest;
}

/**
 * Detect and remove orphaned generated artifacts. An orphan is a
 * (framework, component) group from the previous manifest whose
 * source contract no longer exists on disk. The contract is the
 * single source of truth, so anything it used to produce is stale
 * and should be cleaned up.
 *
 * Hand-edited files (no `@generated:start` marker) are handled per
 * the policy from --prune:
 *   skip       — left in place, listed in the summary
 *   quarantine — moved to packages/ds-codegen/.orphan-quarantine/<iso>/
 *   force      — deleted alongside generated files
 *
 * --dry-run prints the orphan set without modifying disk.
 */
function runPruneStep(
  args: CliArgs,
  previousManifest: EmissionManifest,
  registry: TargetRegistry,
  requestedTargets: TargetId[],
): void {
  const policy = args.prune;
  if (policy === "off") return;
  const orphans = detectOrphans(previousManifest, cwd);
  if (orphans.length === 0) {
    console.log("\n  PRUNE  no orphan components found.");
    return;
  }

  if (args.dryRun) {
    printPruneDryRun(orphans);
    return;
  }
  // policy is "skip" | "force" | "quarantine" here, never "off".
  const report = executeOrphanRemoval(orphans, policy, cwd);

  // Rewrite each framework barrel that lost a component. The
  // per-framework `discoverComponentIds` walks the live components
  // directory, so it naturally excludes the orphan dirs we just
  // removed. Done after orphan removal — order matters.
  const touchedFrameworks = new Set<string>(orphans.map((g) => g.framework));
  for (const targetId of requestedTargets) {
    if (!touchedFrameworks.has(targetId)) continue;
    writeBarrel(registry.get(targetId));
  }

  printPruneReport(orphans, report);
}

function printPruneDryRun(orphans: OrphanGroup[]): void {
  const components = new Set(orphans.map((g) => g.component));
  console.log(
    `\n  PRUNE (dry-run)  ${orphans.length} orphan group(s) across ${components.size} component(s):`,
  );
  for (const group of orphans) {
    console.log(`    - ${group.framework}/${group.component} (contract gone: ${group.contractPath})`);
    for (const file of group.files) {
      console.log(`        [${file.kind}] ${file.path}`);
    }
  }
}

function printPruneReport(
  orphans: OrphanGroup[],
  report: OrphanRemovalReport,
): void {
  const components = new Set(orphans.map((g) => g.component));
  console.log(
    `\n  PRUNE  ${orphans.length} orphan group(s) across ${components.size} component(s):`,
  );
  console.log(
    `    deleted:     ${report.deleted.length} file(s)`,
  );
  if (report.quarantined.length > 0) {
    console.log(`    quarantined: ${report.quarantined.length} file(s)`);
    if (report.quarantineRoot) {
      console.log(
        `      sidecar: ${path.relative(cwd, report.quarantineRoot)}`,
      );
    }
  }
  if (report.skipped.length > 0) {
    console.log(
      `    skipped:     ${report.skipped.length} hand-edited file(s) (re-run with --prune=force or --prune=quarantine to handle):`,
    );
    for (const file of report.skipped) {
      console.log(`      - ${file.path}`);
    }
  }
  if (report.removedDirs.length > 0) {
    console.log(`    empty dirs removed: ${report.removedDirs.length}`);
  }
}

/**
 * Build the EnvironmentProvenance record
 * (CODEGEN-RAIL-ENVIRONMENT-PROVENANCE-01) by capturing the
 * Node major from `process.versions.node`, the codegen package
 * version from its package.json, and the on-disk lockfile bytes.
 *
 * Throws when the lockfile is missing — that's a producer-side
 * invariant violation (operator ran codegen without a lockfile),
 * not a runtime user condition. Loud failure is the right
 * behavior because the rail's environment claim would be
 * fundamentally incomplete without it.
 */
function computeEnvironmentProvenance(): EnvironmentProvenance {
  const nodeMajor = parseNodeMajor(process.versions.node);
  const pkgPath = path.join(cwd, CODEGEN_PACKAGE_JSON_RELATIVE_PATH);
  if (!fs.existsSync(pkgPath)) {
    throw new Error(
      `codegen package.json missing at ${CODEGEN_PACKAGE_JSON_RELATIVE_PATH}; cannot stamp environment provenance.`,
    );
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
    version?: unknown;
  };
  if (typeof pkg.version !== "string") {
    throw new Error(
      `codegen package.json at ${CODEGEN_PACKAGE_JSON_RELATIVE_PATH} has no string \`version\` field.`,
    );
  }
  const lockAbs = path.join(cwd, LOCKFILE_RELATIVE_PATH);
  if (!fs.existsSync(lockAbs)) {
    throw new Error(
      `Lockfile missing at ${LOCKFILE_RELATIVE_PATH}; environment provenance requires a lockfile to attribute against.`,
    );
  }
  return {
    nodeMajor,
    codegenPackageVersion: pkg.version,
    lockfile: {
      path: LOCKFILE_RELATIVE_PATH,
      sha256: sha256FromDisk(lockAbs),
    },
  };
}

/**
 * Parse `process.versions.node` (e.g. "22.19.0") to an integer
 * major version. Throws if the input is not a valid Node-style
 * version string. The throw posture matches
 * `computeEnvironmentProvenance` — these are producer-side
 * invariants, not user inputs.
 */
function parseNodeMajor(versionString: string): number {
  const m = /^(\d+)\./.exec(versionString);
  if (!m) {
    throw new Error(
      `Unrecognized Node version string: ${versionString}`,
    );
  }
  return Number.parseInt(m[1]!, 10);
}

/**
 * Build the per-framework EmitterSourceSet map by reading each
 * declared source file from disk and hashing its bytes
 * (CODEGEN-RAIL-EMITTER-PROVENANCE-01). Sources are sorted by
 * path within each set so manifest diffs are stable across runs.
 *
 * Throws when a declared source file is missing on disk — that's
 * a codegen build/test invariant failure (the static set is wrong
 * for the current tree), not a runtime user condition, so the
 * loud failure is the right behavior.
 */
function computeEmitterSourceSets(): Record<FrameworkId, EmitterSourceSet> {
  const out: Partial<Record<FrameworkId, EmitterSourceSet>> = {};
  for (const framework of Object.keys(FRAMEWORK_EMITTER_SOURCES) as FrameworkId[]) {
    const declared = [
      ...SHARED_EMITTER_SOURCES,
      ...FRAMEWORK_EMITTER_SOURCES[framework],
    ];
    // Dedupe (a cross-framework borrow could in theory collide
    // with shared) and sort by path for stable manifest diffs.
    const uniquePaths = Array.from(new Set(declared)).sort();
    const sources: EmitterSourceFile[] = uniquePaths.map((relPath) => {
      const abs = path.join(cwd, relPath);
      if (!fs.existsSync(abs)) {
        throw new Error(
          `Declared emitter source missing on disk: ${relPath}. ` +
            "Update FRAMEWORK_EMITTER_SOURCES / SHARED_EMITTER_SOURCES in cli.ts.",
        );
      }
      return { path: relPath, sha256: sha256FromDisk(abs) };
    });
    out[framework] = { framework, sources };
  }
  return out as Record<FrameworkId, EmitterSourceSet>;
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
 * Validate every component's usage JSONL sidecar. Two passes per line:
 *   1. Ajv schema check (validateUsageLine).
 *   2. Cross-contract resolution (validateUsageLineCrossRefs) — fsds.* refs
 *      exist, props/slots match the target contract.
 *
 * Returns true when any errors were found. Output mirrors the per-contract
 * loop: "VALID  <file>" / "INVALID <file>" lines, then a summary count.
 */
function runUsageValidation(
  contracts: readonly DiscoveredContract[],
  validContracts: readonly ContractInput[],
  validator: ContractValidator,
): boolean {
  console.log("\nUsage validation:");

  // Registry: contract name -> ComponentContract. Only contracts that passed
  // schema validation are eligible to be referenced from usage trees.
  const contractsByName = new Map<string, ComponentContract>();
  for (const v of validContracts) {
    contractsByName.set(v.contract.name, v.contract);
  }
  const ctx = { contracts: contractsByName };

  let hadErrors = false;
  let totalFiles = 0;
  let totalLines = 0;

  for (const entry of contracts) {
    const usage = findComponentUsage(entry);
    if (!usage) continue; // No sidecar — supported, skip silently.
    totalFiles++;

    const text = fs.readFileSync(usage.absPath, "utf-8");
    const lines = parseUsageJsonl(text);
    if (lines.length === 0) {
      console.log(`  EMPTY  ${usage.filename}`);
      continue;
    }

    let fileHasErrors = false;
    const seenNames = new Set<string>();

    for (const { lineNumber, raw, parseError } of lines) {
      totalLines++;
      if (parseError) {
        console.error(`INVALID  ${usage.filename}#L${lineNumber}: JSON parse error — ${parseError}`);
        fileHasErrors = true;
        continue;
      }
      const schemaResult = validator.validateUsageLine(raw);
      if (!schemaResult.ok) {
        console.error(`INVALID  ${usage.filename}#L${lineNumber}:`);
        console.error(formatIssues(schemaResult.issues));
        fileHasErrors = true;
        continue;
      }
      const line = schemaResult.value as unknown as {
        name: string;
        tree: Record<string, unknown>;
      };
      if (seenNames.has(line.name)) {
        console.error(
          `INVALID  ${usage.filename}#L${lineNumber}: duplicate example name "${line.name}"`,
        );
        fileHasErrors = true;
        continue;
      }
      seenNames.add(line.name);

      const crossRefIssues = validateUsageLineCrossRefs(
        line as Parameters<typeof validateUsageLineCrossRefs>[0],
        { file: usage.relPath, lineNumber, exampleName: line.name },
        ctx,
      );
      if (crossRefIssues.length > 0) {
        console.error(`INVALID  ${usage.filename}#L${lineNumber}:`);
        console.error(formatIssues(crossRefIssues));
        fileHasErrors = true;
      }
    }

    if (!fileHasErrors) {
      console.log(`  VALID  ${usage.filename} (${lines.length} example(s))`);
    } else {
      hadErrors = true;
    }
  }

  console.log(
    `\nUsage: ${totalFiles} sidecar(s), ${totalLines} example(s) checked.`,
  );
  return hadErrors;
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
  const componentsRoot = path.join(CONTRACTS_DIR, "components");

  fs.watch(
    componentsRoot,
    { persistent: true, recursive: true },
    (event, filename) => {
      if (!filename) return;
      if (event !== "change" && event !== "rename") return;
      // With recursive:true, filename arrives as e.g. "Button/Button.contract.json",
      // "Button/Button.tokens.json", or "Button/Button.styles.json". Accept
      // any of the three; reject editor temp files and stray top-level files.
      // Coalesce all three into a single component-keyed debounce entry so a
      // contract+sidecar edit in one save triggers a single re-emit.
      const parts = filename.split(path.sep);
      if (parts.length !== 2) return;
      const [folder, leaf] = parts;
      const isContract = leaf === `${folder}.contract.json`;
      const isTokens = leaf === `${folder}.tokens.json`;
      const isStyles = leaf === `${folder}.styles.json`;
      if (!isContract && !isTokens && !isStyles) return;

      const componentName = folder;
      const existing = debounce.get(componentName);
      if (existing) clearTimeout(existing);
      debounce.set(
        componentName,
        setTimeout(() => {
          debounce.delete(componentName);
          watchHandleChange(componentName, args, requestedTargets, registry, validator);
        }, 150),
      );
    },
  );
}

function watchHandleChange(
  componentName: string,
  args: CliArgs,
  requestedTargets: TargetId[],
  registry: TargetRegistry,
  validator: ContractValidator,
): void {
  const folder = path.join(CONTRACTS_DIR, "components", componentName);
  const contractFilename = `${componentName}.contract.json`;
  const filePath = path.join(folder, contractFilename);
  if (!fs.existsSync(filePath)) {
    console.log(`\n[watch] ${componentName} removed — skipping.`);
    return;
  }

  // If a names filter was set, only process matching contracts.
  if (args.names.length > 0 && !args.names.includes(componentName)) return;

  console.log(`\n[watch] ${componentName} changed — regenerating...`);

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      console.log(`[watch] ${contractFilename} disappeared mid-read — skipping.`);
      return;
    }
    console.error(`[watch] JSON parse error in ${contractFilename} — skipping.`);
    return;
  }

  const result = validator.validateComponent(raw);
  if (!result.ok) {
    console.error(`[watch] INVALID ${contractFilename}:`);
    console.error(formatIssues(result.issues));
    return;
  }

  // Attach tokens + styles from sibling sidecars — missing file means
  // zero tokens / zero styles. Routes through findComponentTokens /
  // findComponentStyles for symmetry with the main loop.
  const watchEntry: DiscoveredContract = {
    name: componentName,
    filename: contractFilename,
    relPath: path.join("components", componentName, contractFilename),
    absPath: filePath,
  };
  let watchAuthoredTokens: Record<string, TokenResolution> | undefined;
  const tokensEntry = findComponentTokens(watchEntry);
  if (tokensEntry) {
    let tokensRaw: unknown;
    try {
      tokensRaw = JSON.parse(fs.readFileSync(tokensEntry.absPath, "utf-8"));
    } catch {
      console.error(`[watch] JSON parse error in ${tokensEntry.filename} — skipping.`);
      return;
    }
    const tokensResult = validator.validateTokens(tokensRaw);
    if (!tokensResult.ok) {
      console.error(`[watch] INVALID ${tokensEntry.filename}:`);
      console.error(formatIssues(tokensResult.issues));
      return;
    }
    const partitioned = partitionBoxModelTokens(
      tokensResult.value as Record<string, TokenResolution>,
    );
    const boxResult = validator.validateBoxModelTokens(partitioned.boxModel);
    if (!boxResult.ok) {
      console.error(`[watch] INVALID ${tokensEntry.filename} (box-model):`);
      console.error(formatIssues(boxResult.issues));
      return;
    }
    watchAuthoredTokens = tokensResult.value as Record<string, TokenResolution>;
  }
  (result.value as { tokens?: unknown }).tokens =
    mergeBoxModelDefaults(watchAuthoredTokens);
  const stylesEntry = findComponentStyles(watchEntry);
  if (stylesEntry) {
    let stylesRaw: unknown;
    try {
      stylesRaw = JSON.parse(fs.readFileSync(stylesEntry.absPath, "utf-8"));
    } catch {
      console.error(`[watch] JSON parse error in ${stylesEntry.filename} — skipping.`);
      return;
    }
    const stylesResult = validator.validateStyles(stylesRaw);
    if (!stylesResult.ok) {
      console.error(`[watch] INVALID ${stylesEntry.filename}:`);
      console.error(formatIssues(stylesResult.issues));
      return;
    }
    (result.value as { styles?: unknown }).styles = stylesResult.value;
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
