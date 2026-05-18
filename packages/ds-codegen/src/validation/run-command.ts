import { spawn } from "node:child_process";
import type {
  CheckOutcome,
  FrameworkValidationPlan,
  FrameworkValidationResult,
} from "./types.js";

const DIAGNOSTIC_CAP = 80;

/**
 * Execute a single framework validation plan. The runner is
 * intentionally low-ceremony for atom 1: it shells the plan's
 * command, captures stdout + stderr, and folds the result into a
 * normalized FrameworkValidationResult. No per-tool diagnostic
 * parsing — the raw lines are captured and capped so the closure
 * note can cite evidence without the rail growing a tool-specific
 * taxonomy prematurely.
 */
export async function runValidationPlan(
  plan: FrameworkValidationPlan,
): Promise<FrameworkValidationResult> {
  const [program, ...args] = plan.command;
  const start = Date.now();
  const { code, stdout, stderr } = await spawnCaptured(program, args);
  const durationMs = Date.now() - start;

  const status: "pass" | "fail" = code === 0 ? "pass" : "fail";
  const checks = resolveChecks(plan.checks, status);
  const diagnostics =
    status === "pass" ? [] : extractDiagnosticLines(stdout, stderr);

  return {
    framework: plan.framework,
    scope: "workspace",
    artifactSelection: "none",
    artifactManifest: null,
    command: [program, ...args].join(" "),
    checks,
    durationMs,
    diagnostics,
    knownGaps: [...(plan.knownGaps ?? [])],
    status,
  };
}

/**
 * Plans declare which check a command exercises (`direct`,
 * `covered_by_typecheck`, `not_covered`). When the command passes,
 * `direct` becomes `pass`; when it fails, `direct` becomes `fail`.
 * `covered_by_typecheck` and `not_covered` are preserved verbatim
 * because they are honest declarations of what the rail did and
 * did not exercise — not pass/fail outcomes.
 */
function resolveChecks(
  declared: Readonly<Record<string, CheckOutcome>>,
  commandStatus: "pass" | "fail",
): Record<string, CheckOutcome> {
  const out: Record<string, CheckOutcome> = {};
  for (const [name, declaredOutcome] of Object.entries(declared)) {
    if (declaredOutcome === "direct") {
      out[name] = commandStatus;
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
