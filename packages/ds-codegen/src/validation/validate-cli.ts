/**
 * FRAMEWORK-EMIT-VALIDATE-01 CLI entrypoint.
 *
 * Invoked via `pnpm run validate:generated`. Runs each framework's
 * validation plan serially, normalizes results, and emits:
 *   - JSON RailReport to stdout (machine-readable, closure-citable)
 *   - Human-readable summary table to stderr
 *
 * Exits with non-zero status when any framework's plan command
 * exited non-zero. The rail is advisory by default — the generate
 * CLI does NOT auto-invoke it; closure-checklists for surface ports
 * are expected to invoke it explicitly and cite the output.
 *
 * Flags
 * -----
 *   --require-artifact-manifest
 *     (CODEGEN-RAIL-ARTIFACT-MANIFEST-REQUIRED-CI-01) Refuse to
 *     pass when the emission manifest is missing, schema-mismatched,
 *     drifted from on-disk state, or untracking generated files
 *     under packages/ds-{framework}/src/components/**. Required-
 *     mode failures emit typed RailDiagnosticCode entries on
 *     RailReport.requiredModeDiagnostics so CI scripts can grep by
 *     code rather than prose. Without this flag the rail keeps its
 *     legacy fallback behavior: missing/mismatched manifests
 *     downgrade gracefully to artifactSelection: "none".
 *
 *   --scope-to-git-range <range>
 *     (CODEGEN-RAIL-CHANGED-ARTIFACT-SCOPE-01) Add a reviewer
 *     projection to the report scoped to artifact groups whose
 *     files intersect the given git range (e.g.
 *     `origin/main...HEAD`). This DOES NOT change what the rail
 *     checks — full-workspace admission still runs. The flag only
 *     adds a `scopedProjection` field to the report and a
 *     "Changed artifact scope" section to the markdown output.
 *     Reviewer ergonomic, NOT a reduced gate.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildComponentIndex } from "./component-index.js";
import { projectGitRange } from "./git-range-scope.js";
import { renderMarkdownReport } from "./markdown-report.js";
import { runValidationPlan } from "./run-command.js";
import type {
  FrameworkId,
  FrameworkValidationPlan,
  FrameworkValidationResult,
  RailDiagnostic,
  RailReport,
} from "./types.js";
import { reactValidationPlan } from "./frameworks/react.js";
import { vueValidationPlan } from "./frameworks/vue.js";
import { svelteValidationPlan } from "./frameworks/svelte.js";
import { litValidationPlan } from "./frameworks/lit.js";
import { angularValidationPlan } from "./frameworks/angular.js";
import { emissionManifestAbsolutePath } from "./emission-manifest-path.js";
import { joinManifestAgainstResults } from "./artifact-join.js";
import {
  readManifestForVerification,
  verifyManifestAgainstDisk,
} from "./required-mode.js";

const PLANS_BY_ID: Record<FrameworkId, FrameworkValidationPlan> = {
  react: reactValidationPlan,
  vue: vueValidationPlan,
  svelte: svelteValidationPlan,
  lit: litValidationPlan,
  angular: angularValidationPlan,
};

const PLANS = [
  reactValidationPlan,
  vueValidationPlan,
  svelteValidationPlan,
  litValidationPlan,
  angularValidationPlan,
] as const;

async function main(): Promise<void> {
  const requireArtifactManifest = process.argv.includes(
    "--require-artifact-manifest",
  );
  const scopeToGitRange = parseScopeToGitRangeArg(process.argv);

  process.stderr.write("[validate:generated] starting framework-admission rail\n");
  if (requireArtifactManifest) {
    process.stderr.write(
      "[validate:generated] mode: required (--require-artifact-manifest)\n",
    );
  }
  if (scopeToGitRange) {
    process.stderr.write(
      `[validate:generated] scope projection: git range \`${scopeToGitRange}\` (rail still admits full workspace)\n`,
    );
  }

  // Read the EmissionManifest in a structured way: distinct
  // result kinds let us tell "absent" from "schema mismatched"
  // from "unparseable" apart. Required mode surfaces each kind as
  // a typed RailDiagnostic; optional mode falls back to legacy
  // unattributed admission for absent/mismatched/unparseable
  // (with a stderr warning on the latter two), and emits a
  // by_manifest attribution only for ok.
  const cwd = process.cwd();
  const manifestRead = readManifestForVerification(
    emissionManifestAbsolutePath(cwd),
  );
  const manifest = manifestRead.kind === "ok" ? manifestRead.manifest : null;

  if (!requireArtifactManifest) {
    // Optional-mode advisory warnings: keep the legacy
    // non-blocking degradation, but never silently — operators
    // running locally should still see WHY attribution was
    // skipped if the manifest exists but cannot be consumed.
    if (manifestRead.kind === "schema_mismatch") {
      process.stderr.write(
        `[validate:generated] WARNING: manifest schemaVersion ${String(manifestRead.foundVersion)} != expected; falling back to legacy admission. Regenerate to attribute artifacts.\n`,
      );
    } else if (manifestRead.kind === "parse_error") {
      process.stderr.write(
        `[validate:generated] WARNING: manifest at ${emissionManifestAbsolutePath(cwd)} is malformed (${manifestRead.message}); falling back to legacy admission. In required mode this would be RAIL_REQUIRE_MANIFEST_MALFORMED.\n`,
      );
    }
  }

  const artifactSelection: "none" | "by_manifest" = manifest ? "by_manifest" : "none";
  process.stderr.write(
    `[validate:generated] scope: workspace, artifactSelection: ${artifactSelection}`,
  );
  if (manifest) {
    process.stderr.write(
      ` (manifest: ${manifest.groups.length} group(s) from ${manifest.generatedAt})`,
    );
  }
  process.stderr.write("\n");

  // Required-mode verification runs BEFORE any framework plan
  // executes. Catastrophic diagnostics (MISSING / SCHEMA_MISMATCH)
  // short-circuit the framework plans entirely — running tsc/ngc
  // /lit-analyzer when we already know the evidence trail is
  // broken would only add ~20s of misleading "pass" lines to a
  // report that's going to fail anyway. Non-catastrophic
  // diagnostics (MISSING_PATHS / HASH_MISMATCH /
  // UNTRACKED_GENERATED_PATHS) still let framework plans run —
  // their output is meaningful evidence even when content has
  // drifted.
  let requiredModeDiagnostics: RailDiagnostic[] | undefined;
  let shortCircuitFrameworkPlans = false;
  if (requireArtifactManifest) {
    requiredModeDiagnostics = verifyManifestAgainstDisk(manifestRead, cwd);
    for (const d of requiredModeDiagnostics) {
      process.stderr.write(
        `[validate:generated] [${d.code}] ${d.message}\n`,
      );
      if (d.paths && d.paths.length > 0) {
        const head = d.paths.slice(0, 5);
        for (const p of head) {
          process.stderr.write(`[validate:generated]   - ${p}\n`);
        }
        if (d.paths.length > head.length) {
          process.stderr.write(
            `[validate:generated]   ... (${d.paths.length - head.length} more)\n`,
          );
        }
      }
      if (
        d.code === "RAIL_REQUIRE_MANIFEST_MISSING" ||
        d.code === "RAIL_REQUIRE_MANIFEST_MALFORMED" ||
        d.code === "RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH"
      ) {
        shortCircuitFrameworkPlans = true;
      }
    }
    if (shortCircuitFrameworkPlans) {
      process.stderr.write(
        "[validate:generated] short-circuiting framework plans: required-mode invariant broken before any check could run\n",
      );
    }
  }

  const results: Partial<Record<FrameworkId, FrameworkValidationResult>> = {};
  if (shortCircuitFrameworkPlans) {
    // Synthesize "not_run" placeholder results so the report's
    // frameworks shape stays valid. Plans contribute no command
    // runs and no checks — the diagnostic is the load-bearing
    // evidence in this mode.
    for (const plan of PLANS) {
      results[plan.framework] = {
        framework: plan.framework,
        scope: "workspace",
        artifactSelection: "none",
        artifactManifest: null,
        command: "(not run: required-mode invariant broken)",
        commandRuns: [],
        checks: {},
        durationMs: 0,
        diagnostics: [],
        knownGaps: [...(plan.knownGaps ?? [])],
        status: "fail",
      };
    }
  } else for (const plan of PLANS) {
    const commandSummary = plan.command
      ? plan.command.join(" ")
      : (plan.commands ?? [])
          .map((pc) => `${pc.check}: ${pc.command.join(" ")}`)
          .join(" | ");
    process.stderr.write(
      `[validate:generated] ${plan.framework}: running ${commandSummary}\n`,
    );
    const result = await runValidationPlan(plan);
    results[plan.framework] = result;
    process.stderr.write(
      `[validate:generated] ${plan.framework}: ${result.status} (${result.durationMs}ms)\n`,
    );
  }

  // Manifest × command join: attach per-artifact admission entries
  // to each framework result. Run after all command runs complete
  // so each entry can cite the run's pass/fail status.
  if (manifest) {
    const attributions = joinManifestAgainstResults(
      manifest,
      PLANS_BY_ID,
      results as Record<FrameworkId, FrameworkValidationResult>,
    );
    for (const [framework, groups] of attributions) {
      const result = results[framework];
      if (!result) continue;
      result.artifacts = groups;
      result.artifactSelection = "by_manifest";
      result.artifactManifest = { groupCount: groups.length };
    }
  }

  // Pivot per-framework artifacts into the per-component index
  // (CODEGEN-RAIL-ARTIFACT-EVIDENCE-REPORT-01). Pure derivation
  // over existing evidence; no new pass/fail behavior.
  const componentsIndex = buildComponentIndex(
    results as Record<FrameworkId, FrameworkValidationResult>,
  );

  // Project the full-workspace admission report down to the
  // artifact groups intersecting the requested git range
  // (CODEGEN-RAIL-CHANGED-ARTIFACT-SCOPE-01). Read-only
  // projection — the rail's overall verdict is independent of
  // this surface. Only computed when --scope-to-git-range was
  // passed AND a manifest is available to project against;
  // without a manifest there is no artifact-group universe to
  // intersect with.
  const scopedProjection =
    scopeToGitRange && manifest
      ? projectGitRange({
          rangeNotation: scopeToGitRange,
          workspaceRoot: cwd,
          manifest,
          results: results as Record<FrameworkId, FrameworkValidationResult>,
        })
      : undefined;
  if (scopedProjection) {
    process.stderr.write(
      `[validate:generated] scope counts: ${scopedProjection.matchedGroups.length} matched group(s), ${scopedProjection.changedGeneratedPaths.length} changed generated file(s), ${scopedProjection.unmatchedGeneratedPaths.length} unmatched, ${scopedProjection.nonGeneratedChangedPaths.length} non-generated\n`,
    );
  } else if (scopeToGitRange && !manifest) {
    process.stderr.write(
      "[validate:generated] WARNING: --scope-to-git-range requested but no manifest is available; skipping projection\n",
    );
  }

  const frameworksPass = PLANS.every(
    (plan) => results[plan.framework]?.status === "pass",
  );
  const requiredModePass =
    !requireArtifactManifest ||
    (requiredModeDiagnostics && requiredModeDiagnostics.length === 0);
  const overall: "pass" | "fail" =
    frameworksPass && requiredModePass ? "pass" : "fail";

  const knownGaps = Object.values(results).flatMap((r) => r?.knownGaps ?? []);

  const report: RailReport = {
    timestamp: new Date().toISOString(),
    scope: "workspace",
    artifactSelection,
    artifactManifest: manifest,
    requireArtifactManifest,
    ...(requireArtifactManifest
      ? { requiredModeDiagnostics: requiredModeDiagnostics ?? [] }
      : {}),
    ...(componentsIndex ? { componentsIndex } : {}),
    ...(scopedProjection ? { scopedProjection } : {}),
    frameworks: results as Record<FrameworkId, FrameworkValidationResult>,
    knownGaps,
    overall,
  };

  // Human summary to stderr (so JSON stdout can be piped/redirected
  // without humans losing visibility into what happened).
  writeHumanSummary(report);

  // Markdown projection alongside the JSON. Skipped when no
  // manifest was supplied — projecting an empty index would be a
  // misleading artifact rather than evidence.
  if (componentsIndex) {
    writeMarkdownReport(report, cwd);
  } else {
    process.stderr.write(
      "[validate:generated] markdown report skipped (no manifest; legacy unattributed mode)\n",
    );
  }

  // Machine-readable JSON to stdout — citable from closure notes.
  process.stdout.write(JSON.stringify(report, null, 2));
  process.stdout.write("\n");

  process.exit(overall === "pass" ? 0 : 1);
}

/**
 * Parse `--scope-to-git-range <range>` from argv. Accepts either
 * `--scope-to-git-range origin/main...HEAD` (two argv elements)
 * or `--scope-to-git-range=origin/main...HEAD` (one). Returns the
 * range string, or undefined when the flag is absent.
 */
function parseScopeToGitRangeArg(argv: readonly string[]): string | undefined {
  const FLAG = "--scope-to-git-range";
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]!;
    if (a === FLAG) {
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) return next;
      return undefined;
    }
    if (a.startsWith(`${FLAG}=`)) {
      return a.slice(FLAG.length + 1);
    }
  }
  return undefined;
}

/**
 * Write the derived markdown projection to a known path under
 * tmp/ (gitignored). The JSON on stdout remains canonical; the
 * markdown is a citation surface, not a parallel source of truth.
 */
function writeMarkdownReport(report: RailReport, workspaceRoot: string): void {
  const relPath = "tmp/generated-admission-report.md";
  const absPath = path.join(workspaceRoot, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, renderMarkdownReport(report));
  process.stderr.write(
    `[validate:generated] wrote markdown report to ${relPath}\n`,
  );
}

function writeHumanSummary(report: RailReport): void {
  const w = (s: string) => process.stderr.write(s);
  w("\n");
  w("=== Framework admission rail summary ===\n");
  w(`timestamp:                  ${report.timestamp}\n`);
  w(`scope:                      ${report.scope}\n`);
  w(`artifactSelection:          ${report.artifactSelection}\n`);
  w(
    `requireArtifactManifest:    ${report.requireArtifactManifest ? "true" : "false"}\n`,
  );
  if (report.artifactManifest) {
    const fileCount = report.artifactManifest.groups.reduce(
      (acc, g) => acc + g.files.length,
      0,
    );
    w(
      `artifactManifest:           ${report.artifactManifest.groups.length} group(s), ${fileCount} file(s), schema v${report.artifactManifest.schemaVersion}, from ${report.artifactManifest.generatedAt}\n`,
    );
  }
  w("\n");
  w("framework  status  duration   checks                                                          artifacts\n");
  w("---------  ------  --------   ------                                                          ---------\n");
  for (const fw of Object.keys(report.frameworks) as FrameworkId[]) {
    const r = report.frameworks[fw];
    const checks = Object.entries(r.checks)
      .map(([name, outcome]) => `${name}=${outcome}`)
      .join(" ")
      .padEnd(62);
    const durationStr = `${r.durationMs}ms`.padEnd(8);
    const artifactStr = r.artifacts
      ? `${r.artifacts.length} group(s)`
      : "n/a";
    w(
      `${fw.padEnd(9)}  ${r.status.padEnd(6)}  ${durationStr}  ${checks}  ${artifactStr}\n`,
    );
  }
  // Surface per-framework diagnostic lines (truncated captures of the
  // underlying tsc / ngc / svelte-check / vue-tsc stderr) right after
  // the summary table. Without this, CI logs only show "<fw>: fail
  // (N ms)" with the JSON dump below — and the JSON often gets visually
  // truncated by GitHub's log viewer, hiding the actual TS error. Adding
  // the diagnostics here means the operator sees the error in the same
  // place they see the status.
  const failingFrameworks = (
    Object.keys(report.frameworks) as FrameworkId[]
  ).filter((fw) => report.frameworks[fw].status === "fail");
  if (failingFrameworks.length > 0) {
    w("\nPer-framework diagnostics (failing frameworks only):\n");
    for (const fw of failingFrameworks) {
      const r = report.frameworks[fw];
      if (r.diagnostics.length === 0) {
        w(`  ${fw}: (no diagnostics captured)\n`);
        continue;
      }
      w(`  ${fw}:\n`);
      for (const line of r.diagnostics) {
        w(`    ${line}\n`);
      }
    }
  }
  if (report.scopedProjection) {
    const sp = report.scopedProjection;
    w("\nChanged artifact scope (reviewer projection; rail still admitted full workspace):\n");
    if (sp.mode.kind === "git_range") {
      w(`  git range: ${sp.mode.rangeNotation}\n`);
    }
    w(`  matched groups: ${sp.matchedGroups.length}\n`);
    w(`  changed generated files: ${sp.changedGeneratedPaths.length}\n`);
    w(`  unmatched generated paths: ${sp.unmatchedGeneratedPaths.length}\n`);
    w(`  non-generated changed paths: ${sp.nonGeneratedChangedPaths.length}\n`);
  }
  if (report.requiredModeDiagnostics && report.requiredModeDiagnostics.length > 0) {
    w("\nRequired-mode diagnostics:\n");
    for (const d of report.requiredModeDiagnostics) {
      w(`  [${d.code}] ${d.message}\n`);
      if (d.paths && d.paths.length > 0) {
        const head = d.paths.slice(0, 3);
        for (const p of head) w(`    - ${p}\n`);
        if (d.paths.length > head.length) {
          w(`    ... (${d.paths.length - head.length} more)\n`);
        }
      }
    }
  }
  if (report.knownGaps.length > 0) {
    w("\nKnown gaps:\n");
    for (const gap of report.knownGaps) {
      w(`  - ${gap}\n`);
    }
  }
  w(`\nOverall: ${report.overall.toUpperCase()}\n`);
  w("\n");
}

main().catch((err) => {
  process.stderr.write(`[validate:generated] fatal: ${(err as Error).message}\n`);
  process.exit(2);
});
