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

export interface FrameworkValidationPlan {
  framework: FrameworkId;
  /** Argv form. The runner passes this to spawn() with shell: false. */
  command: readonly [string, ...string[]];
  /** What each declared check produces in the plan's command. */
  checks: Readonly<Record<string, CheckOutcome>>;
  /** Honest gap declarations. Surfaced verbatim in the result. */
  knownGaps?: readonly string[];
}

export interface FrameworkValidationResult {
  framework: FrameworkId;
  scope: "workspace";
  artifactSelection: "none";
  artifactManifest: null;
  command: string;
  checks: Record<string, CheckOutcome>;
  /** Wall-clock duration of the spawned command. */
  durationMs: number;
  /** Captured diagnostic lines (capped). Empty when the command passed. */
  diagnostics: string[];
  /** Honest gap declarations from the plan. */
  knownGaps: string[];
  /** Aggregate: `pass` when the spawned command exited 0. */
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
