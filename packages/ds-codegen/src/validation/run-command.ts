import { spawn } from "node:child_process";
import type {
  CheckOutcome,
  FrameworkValidationPlan,
  FrameworkValidationResult,
  PlanCommand,
  PlanCommandRun,
} from "./types.js";

const DIAGNOSTIC_CAP = 80;

/**
 * Execute a single framework validation plan. Supports two shapes:
 *
 *  - `command`: single shell-out; the first `direct` check in
 *    `plan.checks` is treated as that command's check. This is the
 *    shape used by React/Vue/Svelte/Lit (one tsc pass = one direct
 *    check).
 *
 *  - `commands`: per-check shell-outs; runs all of them serially
 *    even if an earlier one fails, so closure notes get the full
 *    diagnostic surface in one rail invocation. Used by Angular
 *    after CODEGEN-RAIL-ANGULAR-NGTSC-01 to attribute raw-tsc
 *    `typecheck` separately from ngc `templateTypecheck`.
 *
 * `direct` checks not exercised by any run are an authoring error;
 * we surface that as `fail` so the plan can't silently under-claim.
 */
export async function runValidationPlan(
  plan: FrameworkValidationPlan,
): Promise<FrameworkValidationResult> {
  const planCommands = normalizePlanCommands(plan);
  const runs: PlanCommandRun[] = [];
  for (const pc of planCommands) {
    const [program, ...args] = pc.command;
    const start = Date.now();
    const { code, stdout, stderr } = await spawnCaptured(program, args);
    const durationMs = Date.now() - start;
    const status: "pass" | "fail" = code === 0 ? "pass" : "fail";
    const diagnostics =
      status === "pass"
        ? []
        : extractDiagnosticLines(stdout, stderr).map(
            (line) => `[${pc.check}] ${line}`,
          );
    runs.push({
      check: pc.check,
      command: [program, ...args].join(" "),
      durationMs,
      status,
      diagnostics,
    });
  }

  const checks = resolveChecks(plan.checks, runs);
  const aggregate: "pass" | "fail" = runs.every((r) => r.status === "pass")
    ? "pass"
    : "fail";
  const diagnostics = runs.flatMap((r) => r.diagnostics).slice(0, DIAGNOSTIC_CAP);
  const durationMs = runs.reduce((acc, r) => acc + r.durationMs, 0);

  return {
    framework: plan.framework,
    scope: "workspace",
    artifactSelection: "none",
    artifactManifest: null,
    command: runs.map((r) => r.command).join(" && "),
    commandRuns: runs,
    checks,
    durationMs,
    diagnostics,
    knownGaps: [...(plan.knownGaps ?? [])],
    status: aggregate,
  };
}

/**
 * Normalize the two plan shapes (`command` shorthand vs explicit
 * `commands` list) into a uniform PlanCommand[]. The shorthand
 * attributes the lone command to the first `direct` check in
 * declaration order — that's the implicit contract the existing
 * single-command plans (React/Vue/Svelte/Lit) rely on.
 */
function normalizePlanCommands(plan: FrameworkValidationPlan): PlanCommand[] {
  if (plan.commands && plan.command) {
    throw new Error(
      `Plan for ${plan.framework} declares both \`command\` and \`commands\`; pick one.`,
    );
  }
  if (plan.commands) {
    if (plan.commands.length === 0) {
      throw new Error(
        `Plan for ${plan.framework} declares empty \`commands\`; declare at least one PlanCommand.`,
      );
    }
    return [...plan.commands];
  }
  if (!plan.command) {
    throw new Error(
      `Plan for ${plan.framework} declares neither \`command\` nor \`commands\`.`,
    );
  }
  // Pick the first `direct` check as the implicit attribution. The
  // existing plans declare `typecheck: "direct"` first, so this
  // preserves behavior.
  const firstDirect = Object.entries(plan.checks).find(
    ([, outcome]) => outcome === "direct",
  );
  if (!firstDirect) {
    throw new Error(
      `Plan for ${plan.framework} declares a \`command\` but no \`direct\` check to attribute it to.`,
    );
  }
  return [{ check: firstDirect[0], command: plan.command }];
}

/**
 * Plans declare which check a command exercises (`direct`,
 * `covered_by_typecheck`, `not_covered`). Each `direct` check is
 * resolved from the corresponding command run's status. Direct
 * checks with no matching command run become `fail` — that
 * surfaces under-claiming as an explicit failure rather than a
 * silent green.
 *
 * `covered_by_typecheck` and `not_covered` are preserved verbatim
 * because they are honest declarations of what the rail did and
 * did not exercise — not pass/fail outcomes.
 */
function resolveChecks(
  declared: Readonly<Record<string, CheckOutcome>>,
  runs: PlanCommandRun[],
): Record<string, CheckOutcome> {
  const runByCheck = new Map(runs.map((r) => [r.check, r]));
  const out: Record<string, CheckOutcome> = {};
  for (const [name, declaredOutcome] of Object.entries(declared)) {
    if (declaredOutcome === "direct") {
      const run = runByCheck.get(name);
      out[name] = run ? run.status : "fail";
    } else {
      out[name] = declaredOutcome;
    }
  }
  return out;
}

interface SpawnResult {
  code: number;
  stdout: string;
  stderr: string;
}

function spawnCaptured(
  program: string,
  args: string[],
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, {
      shell: false,
      env: process.env,
    });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      resolve({
        code: code ?? 1,
        stdout: Buffer.concat(stdoutChunks).toString("utf8"),
        stderr: Buffer.concat(stderrChunks).toString("utf8"),
      });
    });
  });
}

/**
 * Capture meaningful lines from the combined stdout+stderr. We
 * keep the heuristics minimal and capped — the goal is evidence,
 * not perfect parsing. Lines that look like pnpm/build framing
 * (the `> @full-stack-ds/...@version typecheck` headers) are
 * dropped because they don't carry diagnostic information.
 */
function extractDiagnosticLines(stdout: string, stderr: string): string[] {
  const combined = `${stdout}\n${stderr}`;
  const lines = combined
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .filter((line) => !isPnpmFraming(line));
  return lines.slice(0, DIAGNOSTIC_CAP);
}

function isPnpmFraming(line: string): boolean {
  return (
    /^> @full-stack-ds\//.test(line) ||
    /^> .* run typecheck/.test(line) ||
    line.startsWith(" ELIFECYCLE") ||
    line.startsWith(" ERR_PNPM_") ||
    /^Exit status \d+$/.test(line)
  );
}
