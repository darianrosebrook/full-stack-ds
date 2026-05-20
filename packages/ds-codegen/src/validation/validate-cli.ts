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
 */
import fs from "node:fs";
import process from "node:process";
import { runValidationPlan } from "./run-command.js";
import type {
  EmissionManifest,
  FrameworkId,
  FrameworkValidationPlan,
  FrameworkValidationResult,
  RailReport,
} from "./types.js";
import { reactValidationPlan } from "./frameworks/react.js";
import { vueValidationPlan } from "./frameworks/vue.js";
import { svelteValidationPlan } from "./frameworks/svelte.js";
import { litValidationPlan } from "./frameworks/lit.js";
import { angularValidationPlan } from "./frameworks/angular.js";
import { emissionManifestAbsolutePath } from "./emission-manifest-path.js";
import { joinManifestAgainstResults } from "./artifact-join.js";

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
  process.stderr.write("[validate:generated] starting framework-admission rail\n");

  // Try to read the EmissionManifest written by the codegen CLI.
  // Absence is a legitimate mode (legacy single-CI run, fresh
  // workspace, etc.); the rail falls back to artifactSelection:
  // "none" and emits no per-artifact attribution in that case.
  const manifest = readEmissionManifestIfPresent();
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

  const results: Partial<Record<FrameworkId, FrameworkValidationResult>> = {};
  for (const plan of PLANS) {
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

  const overall: "pass" | "fail" = PLANS.every(
    (plan) => results[plan.framework]?.status === "pass",
  )
    ? "pass"
    : "fail";

  const knownGaps = Object.values(results).flatMap((r) => r?.knownGaps ?? []);

  const report: RailReport = {
    timestamp: new Date().toISOString(),
    scope: "workspace",
    artifactSelection,
    artifactManifest: manifest,
    frameworks: results as Record<FrameworkId, FrameworkValidationResult>,
    knownGaps,
    overall,
  };

  // Human summary to stderr (so JSON stdout can be piped/redirected
  // without humans losing visibility into what happened).
  writeHumanSummary(report);

  // Machine-readable JSON to stdout — citable from closure notes.
  process.stdout.write(JSON.stringify(report, null, 2));
  process.stdout.write("\n");

  process.exit(overall === "pass" ? 0 : 1);
}

/**
 * Read the EmissionManifest from its well-known path. Returns null
 * when the file is absent (legacy mode) or unreadable/malformed
 * (defensive — a broken manifest must not crash the rail; the
 * stderr summary warns about the parse failure so the operator can
 * regenerate).
 */
function readEmissionManifestIfPresent(): EmissionManifest | null {
  const cwd = process.cwd();
  const manifestPath = emissionManifestAbsolutePath(cwd);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const raw = fs.readFileSync(manifestPath, "utf8");
    const parsed = JSON.parse(raw) as EmissionManifest;
    if (!Array.isArray(parsed.groups)) {
      process.stderr.write(
        `[validate:generated] manifest at ${manifestPath} is malformed (no groups[]); ignoring\n`,
      );
      return null;
    }
    return parsed;
  } catch (err) {
    process.stderr.write(
      `[validate:generated] failed to read manifest at ${manifestPath}: ${(err as Error).message}; ignoring\n`,
    );
    return null;
  }
}

function writeHumanSummary(report: RailReport): void {
  const w = (s: string) => process.stderr.write(s);
  w("\n");
  w("=== Framework admission rail summary ===\n");
  w(`timestamp:         ${report.timestamp}\n`);
  w(`scope:             ${report.scope}\n`);
  w(`artifactSelection: ${report.artifactSelection}\n`);
  if (report.artifactManifest) {
    w(
      `artifactManifest:  ${report.artifactManifest.groups.length} group(s) from ${report.artifactManifest.generatedAt}\n`,
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
