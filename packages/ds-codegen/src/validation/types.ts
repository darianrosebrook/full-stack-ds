/**
 * Types for FRAMEWORK-EMIT-VALIDATE-01: framework-admission rail.
 *
 * Behavioral tests are PROOF gates — they answer "does the rendered
 * interaction work?" Framework parsers/typecheckers are ADMISSION
 * gates — they answer "would this framework's compiler, parser, and
 * language server accept this artifact as idiomatic and type-correct
 * source?" Both gates are required; this module is the admission half.
 *
 * Current slice (atom 1):
 *   scope: "workspace" — we run each framework's existing
 *     package-level typecheck command without per-file scoping. The
 *     point of the first slice is to make admission explicit,
 *     normalized, and citable, not to scope it further.
 *
 *   artifactSelection: "none" — there is no generated-artifact
 *     manifest yet. The rail validates framework workspaces after
 *     generation, NOT a precise list of newly emitted files. This
 *     is documented honestly in the output JSON so the rail does
 *     not make a stronger claim than it proves.
 */

export type FrameworkId = "react" | "vue" | "svelte" | "lit" | "angular";

/**
 * What a single check produced. `direct` means the framework
 * command exercised this check. `covered_by_typecheck` means the
 * typecheck pass subsumes this check (e.g. tsc's parser covers
 * syntactic admission). `not_covered` is the honest-gap state
 * (currently used for Angular template/ngtsc admission, which raw
 * tsc does not exercise).
 */
export type CheckOutcome = "direct" | "covered_by_typecheck" | "not_covered" | "pass" | "fail";

/**
 * A single shell-out exercising a specific admission check. Plans
 * declare one or more PlanCommand entries; each runs serially and
 * its check outcome (`direct`) becomes `pass` or `fail` based on
 * the exit code. Multi-command plans let us distinguish e.g.
 * Angular's `typecheck` (raw tsc) from `templateTypecheck` (ngc)
 * without conflating them under one combined exit code.
 */
export interface PlanCommand {
  /** The check name this command exercises (must be a key in `checks`). */
  check: string;
  /** Argv form. The runner passes this to spawn() with shell: false. */
  command: readonly [string, ...string[]];
}

export interface FrameworkValidationPlan {
  framework: FrameworkId;
  /**
   * Argv form for the single shell-out, when the plan only needs
   * one command. Mutually exclusive with `commands`. The runner
   * normalizes single-`command` plans by treating it as the first
   * (and only) declared `direct` check.
   */
  command?: readonly [string, ...string[]];
  /**
   * Per-check commands for plans that need to attribute admission
   * results to multiple shell-outs. Order is the run order; a
   * failed command does NOT short-circuit subsequent commands
   * because we want full diagnostic surface in one rail invocation.
   */
  commands?: readonly PlanCommand[];
  /** What each declared check produces in the plan's command. */
  checks: Readonly<Record<string, CheckOutcome>>;
  /** Honest gap declarations. Surfaced verbatim in the result. */
  knownGaps?: readonly string[];
}

/**
 * Per-command run record. Captured for every PlanCommand the runner
 * shells out for; lets closure notes cite which exact admission
 * pass produced which diagnostics.
 */
export interface PlanCommandRun {
  check: string;
  command: string;
  durationMs: number;
  status: "pass" | "fail";
  diagnostics: string[];
}

export interface FrameworkValidationResult {
  framework: FrameworkId;
  scope: "workspace";
  artifactSelection: "none";
  artifactManifest: null;
  /**
   * Joined command strings for backwards-compat readability. Real
   * structured output lives in `commandRuns`.
   */
  command: string;
  /** One entry per PlanCommand the runner executed. */
  commandRuns: PlanCommandRun[];
  checks: Record<string, CheckOutcome>;
  /** Wall-clock duration: sum across all command runs. */
  durationMs: number;
  /**
   * Concatenated diagnostic lines (capped). Each line is prefixed
   * with `[<check>] ` so the source command is identifiable. Empty
   * when all command runs passed.
   */
  diagnostics: string[];
  /** Honest gap declarations from the plan. */
  knownGaps: string[];
  /** Aggregate: `pass` only when every command run exited 0. */
  status: "pass" | "fail";
}

export interface RailReport {
  timestamp: string;
  scope: "workspace";
  artifactSelection: "none";
  artifactManifest: null;
  frameworks: Record<FrameworkId, FrameworkValidationResult>;
  knownGaps: string[];
  overall: "pass" | "fail";
}
