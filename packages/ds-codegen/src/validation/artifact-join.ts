/**
 * Manifest × command join
 * (CODEGEN-RAIL-ARTIFACT-MANIFEST-ADMISSION-01).
 *
 * Doctrine: the manifest is NOT the proof. It binds emitted
 * artifacts to the checker runs that cover them.
 *
 * This module joins one framework's EmittedArtifactGroups against
 * its PlanCommand scopes + PlanCommandRun outcomes to produce
 * per-artifact-group ArtifactAdmissionEntry verdicts. The join is
 * mechanical:
 *
 *   - Per artifact path, ask each PlanCommand "does your scope
 *     include this file?" using the plan author's declared scope
 *     (NOT a re-derivation from tsconfig on disk).
 *   - If yes: emit an ArtifactAdmissionEntry with the command's
 *     declared coverage label and the run's status.
 *   - If no: no entry is emitted for this (artifact, command) pair.
 *     A group with zero entries is `not_checkable_by_this_lane`
 *     (handled by the caller; see the artifact loop in
 *     `joinManifestAgainstResults`).
 *
 * The join does not invent labels. If a PlanCommand has no `scope`
 * declared, it contributes no entries; that's the legacy-shape
 * fallback path.
 */
import type {
  ArtifactAdmissionCoverage,
  ArtifactAdmissionEntry,
  EmissionManifest,
  EmittedArtifactGroup,
  FrameworkId,
  FrameworkValidationPlan,
  FrameworkValidationResult,
  PlanCommand,
  PlanCommandRun,
  PlanCommandScope,
} from "./types.js";

export interface ArtifactGroupAttribution {
  component: string;
  paths: readonly string[];
  admission: readonly ArtifactAdmissionEntry[];
}

/**
 * For one framework: produce per-artifact-group attributions by
 * joining the manifest's groups against the plan's PlanCommand
 * scopes and the runner's PlanCommandRun outcomes.
 *
 * Returns an empty array when the manifest has no groups for this
 * framework — the caller should leave `artifacts` unset rather
 * than emit an empty array, to keep the legacy-shape result a
 * faithful subset of the new shape.
 */
export function attributeFrameworkArtifacts(
  framework: FrameworkId,
  manifest: EmissionManifest,
  plan: FrameworkValidationPlan,
  runs: readonly PlanCommandRun[],
): ArtifactGroupAttribution[] {
  const groups = manifest.groups.filter((g) => g.framework === framework);
  if (groups.length === 0) return [];

  const planCommands = collectPlanCommands(plan);
  const runByCheck = new Map(runs.map((r) => [r.check, r]));

  return groups.map((group) => attributeGroup(group, planCommands, runByCheck));
}

/**
 * Top-level convenience: walk every framework in `manifest` and
 * apply `attributeFrameworkArtifacts`. Returns a Map keyed by
 * framework id; absent keys mean that framework had no manifest
 * entries (don't synthesize empties).
 */
export function joinManifestAgainstResults(
  manifest: EmissionManifest,
  plans: Readonly<Record<FrameworkId, FrameworkValidationPlan>>,
  results: Readonly<Record<FrameworkId, FrameworkValidationResult>>,
): Map<FrameworkId, ArtifactGroupAttribution[]> {
  const out = new Map<FrameworkId, ArtifactGroupAttribution[]>();
  const frameworks = new Set(manifest.groups.map((g) => g.framework));
  for (const framework of frameworks) {
    const plan = plans[framework];
    const result = results[framework];
    if (!plan || !result) continue;
    const attributions = attributeFrameworkArtifacts(
      framework,
      manifest,
      plan,
      result.commandRuns,
    );
    if (attributions.length > 0) out.set(framework, attributions);
  }
  return out;
}

function attributeGroup(
  group: EmittedArtifactGroup,
  planCommands: readonly PlanCommand[],
  runByCheck: ReadonlyMap<string, PlanCommandRun>,
): ArtifactGroupAttribution {
  // Per-command attribution at the GROUP level. A command covers
  // the group if its scope covers at least one file in the group.
  // (All files in a group live in the same package by
  // construction, so per-file attribution within a group would
  // produce identical labels for every file and just inflate the
  // report.)
  const groupPaths = group.files.map((f) => f.path);
  const admission: ArtifactAdmissionEntry[] = [];
  for (const pc of planCommands) {
    if (!pc.scope) continue;
    const coverage = labelGroupForCommand(groupPaths, pc.scope);
    if (coverage === null) continue;
    const run = runByCheck.get(pc.check);
    if (!run) continue;
    const entry: ArtifactAdmissionEntry = {
      check: pc.check,
      command: run.command,
      status: run.status,
      coverage,
      ...(pc.knownRuleNarrowings && pc.knownRuleNarrowings.length > 0
        ? { knownRuleNarrowings: [...pc.knownRuleNarrowings] }
        : {}),
    };
    admission.push(entry);
  }
  return {
    component: group.component,
    paths: groupPaths,
    admission,
  };
}

/**
 * For one PlanCommand scope: does it cover any path in the group?
 * Returns the scope's declared `coverage` label if so, otherwise
 * `null` (no entry emitted for this (group, command) pair).
 *
 * A path is in scope when:
 *   1. Its workspace-rel POSIX path starts with `scope.packageRoot`.
 *   2. Its extension matches `scope.extensions` (if any).
 *   3. Its path does NOT contain any `scope.excludePathSubstrings`.
 *
 * `not_selected` and `not_checkable_by_this_lane` are NOT emitted
 * by this function — they are absences. The caller decides how to
 * surface a group with no admission entries (see types.ts doc
 * comments for the semantic distinction).
 */
function labelGroupForCommand(
  groupPaths: readonly string[],
  scope: PlanCommandScope,
): ArtifactAdmissionCoverage | null {
  for (const p of groupPaths) {
    if (pathInScope(p, scope)) return scope.coverage;
  }
  return null;
}

function pathInScope(p: string, scope: PlanCommandScope): boolean {
  if (!p.startsWith(scope.packageRoot)) return false;
  if (scope.extensions && scope.extensions.length > 0) {
    if (!scope.extensions.some((ext) => p.endsWith(ext))) return false;
  }
  if (scope.excludePathSubstrings) {
    for (const sub of scope.excludePathSubstrings) {
      if (p.includes(sub)) return false;
    }
  }
  return true;
}

/**
 * Normalize a plan's command/commands shorthand into a uniform
 * PlanCommand[]. Mirrors the runner's `normalizePlanCommands`
 * logic, but tolerates plans that have no scope-declaring
 * commands (legacy shape) by simply yielding them; the join then
 * emits no attribution for those.
 */
function collectPlanCommands(plan: FrameworkValidationPlan): PlanCommand[] {
  if (plan.commands && plan.commands.length > 0) {
    return [...plan.commands];
  }
  if (plan.command) {
    // Synthesize a PlanCommand-shape entry for the legacy single
    // command. No scope means it contributes nothing to the join.
    const firstDirect = Object.entries(plan.checks).find(
      ([, outcome]) => outcome === "direct",
    );
    if (!firstDirect) return [];
    return [{ check: firstDirect[0], command: plan.command }];
  }
  return [];
}
