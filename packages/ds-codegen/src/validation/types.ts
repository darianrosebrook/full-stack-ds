/**
 * Types for FRAMEWORK-EMIT-VALIDATE-01: framework-admission rail.
 *
 * Behavioral tests are PROOF gates — they answer "does the rendered
 * interaction work?" Framework parsers/typecheckers are ADMISSION
 * gates — they answer "would this framework's compiler, parser, and
 * language server accept this artifact as idiomatic and type-correct
 * source?" Both gates are required; this module is the admission half.
 *
 * Slice history:
 *
 *   FRAMEWORK-EMIT-VALIDATE-01 (atom 1):
 *     scope: "workspace" — we run each framework's existing
 *       package-level typecheck command without per-file scoping.
 *     artifactSelection: "none" — there is no generated-artifact
 *       manifest yet. The rail validates framework workspaces after
 *       generation, NOT a precise list of newly emitted files.
 *
 *   CODEGEN-RAIL-ANGULAR-NGTSC-01:
 *     Added multi-command plans (`commands: PlanCommand[]`) so
 *     Angular declares `typecheck` (raw tsc) and `templateTypecheck`
 *     (ngc strictTemplates) as two distinct checks.
 *
 *   CODEGEN-RAIL-LIT-TEMPLATE-ADMISSION-01:
 *     Same shape for Lit (tsc + lit-analyzer), with one declared
 *     rule narrowing (`no-incompatible-type-binding`) surfaced
 *     verbatim in `knownGaps`.
 *
 *   CODEGEN-RAIL-ARTIFACT-MANIFEST-ADMISSION-01 (this slice):
 *     Doctrine: the manifest is NOT the proof. It binds emitted
 *     artifacts to the checker runs that cover them. Two records:
 *       - EmissionManifest: what the generator claims it emitted
 *         (framework, component, file paths).
 *       - admission evidence (per-artifact-group ArtifactAdmission
 *         entries on each FrameworkValidationResult): which checks
 *         covered which files, and at what granularity.
 *     The rail still runs workspace/package-level commands; this
 *     slice does NOT introduce per-file isolation. The new
 *     vocabulary lets the report cite checks against artifacts
 *     truthfully without overclaiming "per-file proof" the
 *     underlying checkers do not produce.
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
 * Declared effective scope of a PlanCommand for the purpose of
 * joining emitted artifacts against admission evidence.
 *
 * Authority for these scopes lives in the framework plan, not in
 * the join algorithm. The plan author knows what the command's
 * argv was set up to examine; the rail should not re-derive it
 * from filesystem reads (which would be fragile and would invent
 * a second source of truth for tsconfig include/exclude).
 *
 * Each scope describes:
 *   - a workspace-root-relative directory prefix all matching
 *     artifacts must live under (`packageRoot`), and
 *   - an optional file-extension filter (`extensions`) — when
 *     present, only artifacts whose extension matches are in
 *     scope. Files outside `packageRoot` are `not_selected`;
 *     files inside `packageRoot` but failing `extensions` are
 *     `not_selected` for this command (a different command in
 *     the same plan may still cover them).
 *
 * `coverage` is the label the join assigns to in-scope artifacts.
 */
export interface PlanCommandScope {
  /** Workspace-root-relative POSIX prefix (must end with `/`). */
  packageRoot: string;
  /**
   * If present, only artifacts whose path ends in one of these
   * extensions (each starting with `.`) are in scope. Omit to
   * match every file under `packageRoot`.
   */
  extensions?: readonly string[];
  /**
   * Optional path substrings that disqualify an artifact even if
   * it matches `packageRoot` and `extensions`. Used for commands
   * that exclude tests via tsconfig (e.g. Angular's
   * `tsconfig.ngc.json` excludes `__tests__` and `.test.ts`).
   * An artifact matching ANY of these substrings is `not_selected`
   * for the command, not `not_checkable_by_this_lane` — the lane
   * could check it in principle, the command's argv chose not to.
   */
  excludePathSubstrings?: readonly string[];
  /** Label applied to in-scope artifacts. */
  coverage: ArtifactAdmissionCoverage;
}

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
  /**
   * Declared scope used by the manifest×command join to attribute
   * artifacts. Omit when the rail is running in legacy
   * (no-manifest) mode; the join simply skips commands without
   * a declared scope.
   */
  scope?: PlanCommandScope;
  /**
   * Optional list of analyzer-rule IDs intentionally narrowed in
   * this command's argv (e.g. `["no-incompatible-type-binding"]`
   * for Lit's `typecheck:templates`). Propagated into per-artifact
   * `ArtifactAdmissionEntry.knownRuleNarrowings` so closure notes
   * can cite the narrowing artifact-by-artifact.
   */
  knownRuleNarrowings?: readonly string[];
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

/**
 * How tightly a given check's effective scope binds to a specific
 * emitted artifact. The doctrine is honest underclaiming: the rail
 * never labels an artifact "per-file proven" because none of the
 * current five frameworks' admission commands isolate per-file.
 *
 * Each label describes what the check's command-line scope DID
 * include the artifact in, and what it explicitly does NOT prove.
 */
export type ArtifactAdmissionCoverage =
  /**
   * The check ran at the workspace level (e.g. a `tsc --build` from
   * the repo root). The artifact is transitively in the check's
   * input graph but is not directly named by the command. Coverage
   * is real but the weakest of the "covered" tier — a passing
   * check proves the workspace compiles, not that this artifact
   * was meaningfully exercised.
   *
   * Does NOT prove: per-file isolation, that the artifact would
   * compile if extracted from its workspace, or that the artifact
   * was actually loaded by the check (an unimported file in the
   * include graph contributes nothing).
   */
  | "covered_by_workspace_check"
  /**
   * The check ran at the package level (e.g.
   * `pnpm --filter @full-stack-ds/<pkg> run typecheck`). The
   * artifact is in the package's tsconfig include / glob and is
   * exercised whenever the package check runs. This is the default
   * coverage for the per-framework `typecheck` command.
   *
   * Does NOT prove: per-file isolation. A passing package check
   * proves the package compiles as a whole, including the
   * artifact's contribution; it does not prove the artifact would
   * compile in a different package context.
   */
  | "covered_by_package_check"
  /**
   * The check's command explicitly globs / lists the artifact's
   * path (e.g. `lit-analyzer 'src/components/**\/*.ts'` with the
   * artifact at `src/components/Foo/Foo.ts`). Strongest current
   * evidence short of per-file isolation: the check definitely
   * opened this file, parsed it, and applied its rules.
   *
   * Does NOT prove: per-file isolation. The check still has
   * package context available (tsconfig, other source files); a
   * passing direct-template check does not prove the artifact
   * would pass with all sibling files removed.
   */
  | "covered_by_direct_template_check"
  /**
   * The check exists in this framework's plan but the artifact is
   * excluded by the command's scope (e.g. test files excluded from
   * `tsconfig.ngc.json`, or non-`.ts` artifacts excluded from
   * lit-analyzer's glob). Honest negative claim: the check ran,
   * but did not look at this artifact.
   */
  | "not_selected"
  /**
   * No check in this framework's plan can in principle examine
   * this artifact class (e.g. a CSS file under a TS-only rail, or
   * a future artifact type the current plans do not know about).
   * Distinct from `not_selected` because the constraint is at the
   * lane level, not the per-command-scope level.
   */
  | "not_checkable_by_this_lane";

/**
 * One check's verdict against one emitted-artifact group.
 *
 * The rail produces these by joining the EmissionManifest's file
 * paths against each PlanCommand's effective scope (tsconfig
 * include/exclude, lit-analyzer glob, etc.). Production is
 * mechanical — no heuristics, no inference of "probably covered."
 */
export interface ArtifactAdmissionEntry {
  /** Matches a check name in the framework plan's `checks` map. */
  check: string;
  /** Matches a `command` field in a `PlanCommandRun`. */
  command: string;
  /** Outcome of the underlying PlanCommandRun. */
  status: "pass" | "fail";
  /** How tightly the command's scope bound to this artifact. */
  coverage: ArtifactAdmissionCoverage;
  /**
   * If the check's command intentionally disables specific
   * analyzer rules (e.g. Lit's `no-incompatible-type-binding`),
   * those rule IDs are propagated here from the framework plan's
   * `knownGaps`. Lets per-artifact closure notes cite the
   * narrowing without re-citing the full framework `knownGaps`
   * paragraph.
   */
  knownRuleNarrowings?: readonly string[];
}

/**
 * One file in an EmittedArtifactGroup. Carries both the path and
 * a content digest. The digest binds the manifest to specific
 * on-disk bytes, so the required-mode verifier
 * (CODEGEN-RAIL-ARTIFACT-MANIFEST-REQUIRED-CI-01) can detect
 * `--force` rewrites, hand-edits to `@generated` regions, or any
 * other content drift between the generator's claim and the
 * checker's actual input.
 *
 * The digest MUST be computed over the exact on-disk bytes AFTER
 * write (not from the in-memory generated string), so it reflects
 * any newline/formatter effects of the write path. See
 * `cli.ts.writeFiles`.
 */
export interface EmittedArtifactFile {
  /** Workspace-root-relative POSIX path. */
  path: string;
  /**
   * Lowercase hex SHA-256 of the exact on-disk file bytes after
   * write. Algorithm and encoding are fixed for the lifetime of
   * the manifest schema; a future migration may extend or replace
   * this field but must bump `EmissionManifest.schemaVersion`.
   */
  sha256: string;
}

/**
 * A group of generated files emitted for one component on one
 * framework. The group is the unit of admission attribution: all
 * files in a group share the same per-check coverage (they live
 * in the same tsconfig include / glob scope by construction).
 *
 * Paths are workspace-root-relative POSIX paths so the manifest
 * is portable across machines.
 */
export interface EmittedArtifactGroup {
  framework: FrameworkId;
  /** Component name from the contract (e.g. "Input", "Popover"). */
  component: string;
  /**
   * Every file written for this component on this framework, in
   * emission order. Each entry carries the POSIX path AND a
   * sha256 digest of the on-disk bytes.
   *
   * Schema migration note: pre-REQUIRED-CI-01 manifests used
   * `paths: string[]` directly on the group. That shape is
   * removed, not aliased. Manifests with the old shape are
   * detected by the schemaVersion mismatch on EmissionManifest
   * and either fall back to legacy unattributed mode (optional
   * rail) or fail with RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH
   * (required rail).
   */
  files: readonly EmittedArtifactFile[];
}

/**
 * Current schema version for EmissionManifest. Bumped whenever
 * the manifest shape changes in a way that requires consumer
 * changes (renaming/removing fields, changing semantic meaning).
 * Additive optional fields do NOT bump the version.
 *
 *   v1 (pre-REQUIRED-CI-01): groups carried `paths: string[]`.
 *       Implicit (no schemaVersion field on disk).
 *   v2 (REQUIRED-CI-01): groups carry `files: EmittedArtifactFile[]`
 *       with sha256 digests. schemaVersion: 2 written explicitly.
 */
export const EMISSION_MANIFEST_SCHEMA_VERSION = 2 as const;

/**
 * Record produced by the codegen CLI after a successful generate
 * run. Captures what the generator claims it emitted, with enough
 * structure that the rail can join it against admission commands
 * AND verify the on-disk artifacts match the manifest's claims.
 *
 * This is the "emission" half of the slice; the "admission" half
 * lives in each FrameworkValidationResult's `artifacts` field.
 */
export interface EmissionManifest {
  /**
   * Schema version. Must equal `EMISSION_MANIFEST_SCHEMA_VERSION`
   * for the rail to consume the manifest. Mismatches are surfaced
   * as RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH in required mode and
   * as a stderr warning + legacy fallback in optional mode.
   */
  schemaVersion: typeof EMISSION_MANIFEST_SCHEMA_VERSION;
  /** When the generate run completed (ISO 8601). */
  generatedAt: string;
  /** All artifact groups emitted in this run, in emission order. */
  groups: readonly EmittedArtifactGroup[];
}

export interface FrameworkValidationResult {
  framework: FrameworkId;
  scope: "workspace";
  /**
   * Pre-CODEGEN-RAIL-ARTIFACT-MANIFEST-ADMISSION-01: was the only
   * artifact-level statement the rail made. Now superseded by the
   * `artifacts` field; retained as the literal `"none"` placeholder
   * when no EmissionManifest was supplied (so report consumers
   * relying on its presence can still parse), and as
   * `"by_manifest"` when artifacts were attributed.
   */
  artifactSelection: "none" | "by_manifest";
  /**
   * Pre-CODEGEN-RAIL-ARTIFACT-MANIFEST-ADMISSION-01: was always
   * null. Now: when the rail was supplied an EmissionManifest, the
   * full manifest is included once at the RailReport level (see
   * `RailReport.artifactManifest`), and this field carries the
   * count of artifact groups attributed to this framework. Left
   * `null` when no manifest was supplied.
   */
  artifactManifest: null | { groupCount: number };
  /**
   * Per-artifact-group admission attribution. Present (possibly
   * empty) when an EmissionManifest was supplied to the rail.
   * Omitted (`undefined`) in the legacy no-manifest mode.
   *
   * Each entry binds one EmittedArtifactGroup to the set of
   * ArtifactAdmissionEntry verdicts that cover it on this
   * framework. The rail computes these by joining the manifest's
   * paths against each PlanCommand's effective scope.
   */
  artifacts?: readonly {
    component: string;
    paths: readonly string[];
    admission: readonly ArtifactAdmissionEntry[];
  }[];
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

/**
 * Stable codes emitted by the required-mode verifier
 * (CODEGEN-RAIL-ARTIFACT-MANIFEST-REQUIRED-CI-01). Public API:
 * CI pipelines may grep RailReport JSON by code rather than by
 * prose, so codes must not change once published. Adding a new
 * code is additive; renaming or removing one requires a slice
 * with a migration plan.
 */
export type RailDiagnosticCode =
  /**
   * The manifest file does not exist on disk. Required mode fails
   * the rail. Repair: run `pnpm run generate -- --target=all`
   * before `validate:generated --require-artifact-manifest`.
   *
   * Distinct from MALFORMED — MISSING means "no file at all";
   * MALFORMED means "file exists but is not consumable as a
   * manifest." Distinct from SCHEMA_MISMATCH — SCHEMA_MISMATCH
   * means the producer wrote a different schema version (a
   * staleness / version-drift problem); MALFORMED means the file
   * is structurally broken regardless of schema version.
   */
  | "RAIL_REQUIRE_MANIFEST_MISSING"
  /**
   * The manifest file exists but cannot be consumed as valid
   * manifest data. Causes: JSON parse failure, filesystem read
   * error, or the file matches the expected schemaVersion but
   * has a structurally broken body (e.g. `groups` is not an
   * array). Required mode fails the rail; optional mode warns to
   * stderr and falls back to unattributed legacy admission.
   *
   * The operator repair is the same as MISSING (regenerate), but
   * the evidence state is materially different: a MALFORMED
   * manifest tells you the producer wrote something AND it's
   * unreadable, which can indicate disk corruption, a partial
   * write, or external tooling interfering with the file.
   * Surfacing this as its own code lets CI distinguish "no
   * manifest" from "manifest is broken."
   */
  | "RAIL_REQUIRE_MANIFEST_MALFORMED"
  /**
   * The manifest's `schemaVersion` does not match
   * `EMISSION_MANIFEST_SCHEMA_VERSION`. Required mode fails the
   * rail; optional mode warns to stderr and falls back to
   * unattributed legacy admission. Repair: regenerate to produce
   * a manifest at the current schema version.
   */
  | "RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH"
  /**
   * The manifest claims one or more paths that do not exist on
   * disk. Most common cause: a generated file was deleted by
   * hand, or the manifest is stale (predates a contract that was
   * later removed). Repair: regenerate.
   */
  | "RAIL_REQUIRE_MANIFEST_MISSING_PATHS"
  /**
   * One or more on-disk files generated by codegen (detected via
   * the `@generated:start` marker under
   * `packages/ds-{framework}/src/components/**`) are NOT in the
   * manifest. Most common cause: the manifest was produced by a
   * partial-target generate run and is being checked against a
   * full-target tree. Repair: regenerate with `--target=all`.
   */
  | "RAIL_REQUIRE_MANIFEST_UNTRACKED_GENERATED_PATHS"
  /**
   * The sha256 digest of an on-disk file does not match the
   * manifest's recorded digest for that path. Most common
   * causes: `--force` overwrite without a fresh manifest write,
   * hand-edits inside `@generated:start`/`@generated:end`
   * regions, or external tooling (formatters, eslint --fix) that
   * mutated the file after the manifest was written. Repair:
   * regenerate, or revert the unintended edit.
   */
  | "RAIL_REQUIRE_MANIFEST_HASH_MISMATCH";

/**
 * One typed diagnostic emitted by the required-mode verifier.
 * Carries the offending paths (when applicable) so closure notes
 * can cite the specific files. `message` is plain prose for human
 * consumption in the stderr summary; `code` is the stable
 * machine-readable identifier.
 */
export interface RailDiagnostic {
  code: RailDiagnosticCode;
  message: string;
  /**
   * The offending paths, when applicable to the code. Workspace-
   * root-relative POSIX. Empty/absent for codes that do not
   * relate to specific files (e.g. SCHEMA_MISMATCH).
   */
  paths?: readonly string[];
}

export interface RailReport {
  timestamp: string;
  scope: "workspace";
  /**
   * `"none"` in legacy invocations (no manifest supplied);
   * `"by_manifest"` when the rail was supplied an EmissionManifest
   * and produced per-artifact admission attribution.
   */
  artifactSelection: "none" | "by_manifest";
  /**
   * The full EmissionManifest the rail attributed against, when
   * one was supplied. `null` in legacy invocations.
   */
  artifactManifest: EmissionManifest | null;
  /**
   * Whether the rail was invoked with `--require-artifact-manifest`.
   * Carried in the report so closure notes can distinguish
   * required-mode passes from optional-mode passes.
   */
  requireArtifactManifest: boolean;
  /**
   * Diagnostics from the required-mode verifier. Present (possibly
   * empty) when `requireArtifactManifest` is true; omitted in
   * optional mode. A non-empty list forces `overall: "fail"`
   * regardless of framework-plan outcomes.
   */
  requiredModeDiagnostics?: readonly RailDiagnostic[];
  frameworks: Record<FrameworkId, FrameworkValidationResult>;
  knownGaps: string[];
  overall: "pass" | "fail";
}
