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
import { runValidationPlan } from "./run-command.js";
import type { FrameworkId, FrameworkValidationResult, RailReport } from "./types.js";
import { reactValidationPlan } from "./frameworks/react.js";
import { vueValidationPlan } from "./frameworks/vue.js";
import { svelteValidationPlan } from "./frameworks/svelte.js";
import { litValidationPlan } from "./frameworks/lit.js";
import { angularValidationPlan } from "./frameworks/angular.js";

const PLANS = [
  reactValidationPlan,
  vueValidationPlan,
  svelteValidationPlan,
  litValidationPlan,
  angularValidationPlan,
] as const;

async function main(): Promise<void> {
  process.stderr.write("[validate:generated] starting framework-admission rail\n");
  process.stderr.write(
    `[validate:generated] scope: workspace, artifactSelection: none\n`,
  );

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

  const overall: "pass" | "fail" = PLANS.every(
    (plan) => results[plan.framework]?.status === "pass",
  )
    ? "pass"
    : "fail";

  const knownGaps = Object.values(results).flatMap((r) => r?.knownGaps ?? []);

  const report: RailReport = {
    timestamp: new Date().toISOString(),
    scope: "workspace",
    artifactSelection: "none",
    artifactManifest: null,
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

function writeHumanSummary(report: RailReport): void {
  const w = (s: string) => process.stderr.write(s);
  w("\n");
  w("=== Framework admission rail summary ===\n");
  w(`timestamp:         ${report.timestamp}\n`);
  w(`scope:             ${report.scope}\n`);
  w(`artifactSelection: ${report.artifactSelection}\n`);
  w("\n");
  w("framework  status  duration   checks\n");
  w("---------  ------  --------   ------\n");
  for (const fw of Object.keys(report.frameworks) as FrameworkId[]) {
    const r = report.frameworks[fw];
    const checks = Object.entries(r.checks)
      .map(([name, outcome]) => `${name}=${outcome}`)
      .join(" ");
    const durationStr = `${r.durationMs}ms`.padEnd(8);
    w(`${fw.padEnd(9)}  ${r.status.padEnd(6)}  ${durationStr}  ${checks}\n`);
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
