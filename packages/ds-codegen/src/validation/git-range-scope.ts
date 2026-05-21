/**
 * Git-range scope projection
 * (CODEGEN-RAIL-CHANGED-ARTIFACT-SCOPE-01).
 *
 * Doctrine: changed-artifact scope is a reporting projection, not
 * a reduced admission mode. The rail still admits the full
 * workspace; this module produces a `ScopedProjection` that
 * narrows the report to the artifact groups intersecting a given
 * git range — and explicitly surfaces changed paths the rail
 * could NOT bind to a group, so the reviewer surface never goes
 * silent on drift the required-mode verifier might also be
 * flagging.
 *
 * git range parsing is deferred to git itself: the caller's
 * `rangeNotation` (e.g. `origin/main...HEAD`) is passed verbatim
 * to `git diff --name-only`. Both `..` (asymmetric) and `...`
 * (symmetric difference) semantics flow through naturally.
 */
import { execFileSync } from "node:child_process";
import type {
  ArtifactAdmissionEntry,
  EmissionManifest,
  FrameworkId,
  FrameworkValidationResult,
  RailScopeMode,
  ScopedArtifactGroup,
  ScopedProjection,
} from "./types.js";

/**
 * Generated-tree roots, in workspace-rel POSIX form. A path is
 * considered "generated-tree" if it starts with one of these
 * prefixes. Mirrors the COMPONENT_TREES constant in
 * required-mode.ts but local-to-this-module so the two concerns
 * remain decoupled.
 */
const GENERATED_TREE_PREFIXES: readonly string[] = [
  "packages/ds-react/src/components/",
  "packages/ds-vue/src/components/",
  "packages/ds-svelte/src/components/",
  "packages/ds-lit/src/components/",
  "packages/ds-angular/src/components/",
];

/**
 * Paths excluded from `nonGeneratedChangedPaths` because they are
 * tooling output / runtime state rather than review-relevant
 * source. Reviewer doesn't need to see these in the PR context.
 */
const NON_GENERATED_EXCLUDE_SUBSTRINGS: readonly string[] = [
  "tmp/",
  "dist/",
  "packages/ds-codegen/.emission-manifest.json",
  "node_modules/",
];

export interface ProjectGitRangeArgs {
  rangeNotation: string;
  workspaceRoot: string;
  manifest: EmissionManifest;
  results: Readonly<Record<FrameworkId, FrameworkValidationResult>>;
  /**
   * Test seam — overrides the default `git` execution for unit
   * tests. Receives the argv to git (minus the binary itself);
   * returns the stdout. Default uses `execFileSync('git', ...)`.
   */
  gitExec?: (args: readonly string[]) => string;
}

/**
 * Build the ScopedProjection. The function never throws on a git
 * exec failure — instead it returns a projection with empty
 * arrays plus the mode set to the requested range. (A missing
 * upstream like `origin/main` is a CI-environment issue, not a
 * verification failure; the rail's overall verdict comes from
 * other layers.)
 */
export function projectGitRange(args: ProjectGitRangeArgs): ScopedProjection {
  const { rangeNotation, manifest, results } = args;
  const mode: RailScopeMode = { kind: "git_range", rangeNotation };

  const allChanged = runGitDiff(args, [rangeNotation]);
  const generatedChanged = allChanged.filter(isGeneratedTreePath);
  const generatedChangedSet = new Set(generatedChanged);

  const nonGeneratedChanged = allChanged
    .filter((p) => !isGeneratedTreePath(p))
    .filter((p) => !isExcludedFromContext(p));

  // Collect every contract path the manifest knows about so we
  // can answer "did this PR touch a contract" without re-walking
  // the manifest in the markdown renderer. NOT itself a failure
  // surface — the required-mode CONTRACT_HASH_MISMATCH code is
  // the authoritative failure for contract-without-regenerate
  // drift.
  const knownContractPaths = new Set<string>();
  for (const group of manifest.groups) {
    knownContractPaths.add(group.contract.path);
  }
  const changedContractPaths = allChanged.filter((p) =>
    knownContractPaths.has(p),
  );

  // Walk the manifest; a group MATCHES the range when any of its
  // files OR its source contract is in the changed set.
  // Contract-driven matches surface groups whose generated output
  // didn't textually change but whose source contract did — the
  // operator may have edited the contract without re-running
  // codegen, which required mode will catch as
  // CONTRACT_HASH_MISMATCH; the reviewer projection cites the
  // implicated group either way.
  const changedContractSet = new Set(changedContractPaths);
  const matchedGroups: ScopedArtifactGroup[] = [];
  const matchedPathSet = new Set<string>();
  for (const group of manifest.groups) {
    const filesIntersect = group.files.some((f) =>
      generatedChangedSet.has(f.path),
    );
    const contractIntersects = changedContractSet.has(group.contract.path);
    if (!filesIntersect && !contractIntersects) continue;
    for (const f of group.files) matchedPathSet.add(f.path);

    // Pull the joined admission entries for this (framework,
    // component) pair from results[]. Empty when artifacts isn't
    // populated (no manifest) — but we already require a manifest
    // to call projectGitRange, so artifacts should be present.
    const admission = findAdmissionFor(
      results,
      group.framework,
      group.component,
    );
    matchedGroups.push({
      framework: group.framework,
      component: group.component,
      contract: group.contract,
      files: group.files,
      admission,
    });
  }

  // Unmatched: changed generated paths that no manifest group
  // claims. These are review-context, not rail failures. The
  // required-mode verifier may already be flagging them via
  // UNTRACKED_GENERATED_PATHS or MISSING_PATHS; this projection
  // surfaces them so the reviewer surface stays honest.
  const unmatchedGeneratedPaths = generatedChanged.filter(
    (p) => !matchedPathSet.has(p),
  );

  return {
    mode,
    changedGeneratedPaths: generatedChanged,
    nonGeneratedChangedPaths: nonGeneratedChanged,
    unmatchedGeneratedPaths,
    changedContractPaths,
    matchedGroups,
  };
}

function findAdmissionFor(
  results: Readonly<Record<FrameworkId, FrameworkValidationResult>>,
  framework: FrameworkId,
  component: string,
): readonly ArtifactAdmissionEntry[] {
  const r = results[framework];
  if (!r?.artifacts) return [];
  for (const a of r.artifacts) {
    if (a.component === component) return a.admission;
  }
  return [];
}

function isGeneratedTreePath(p: string): boolean {
  return GENERATED_TREE_PREFIXES.some((prefix) => p.startsWith(prefix));
}

function isExcludedFromContext(p: string): boolean {
  return NON_GENERATED_EXCLUDE_SUBSTRINGS.some((sub) => p.includes(sub));
}

/**
 * Run `git diff --name-only <range> [-- <paths...>]`, returning
 * the resulting POSIX paths. Returns an empty array on any git
 * exec failure (missing upstream, bad range, etc.) — the rail's
 * overall verdict is determined elsewhere and a missing range
 * should not crash the projection.
 */
function runGitDiff(
  args: ProjectGitRangeArgs,
  cliArgs: readonly string[],
): string[] {
  const exec =
    args.gitExec ??
    ((argv: readonly string[]) =>
      execFileSync("git", [...argv], {
        cwd: args.workspaceRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }));
  let stdout: string;
  try {
    stdout = exec(["diff", "--name-only", ...cliArgs]);
  } catch {
    return [];
  }
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
