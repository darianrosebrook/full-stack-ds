/**
 * Per-component admission index
 * (CODEGEN-RAIL-ARTIFACT-EVIDENCE-REPORT-01).
 *
 * Read-only projection of the per-framework artifact attribution
 * already on each FrameworkValidationResult. Adds no new
 * pass/fail behavior — pivots existing evidence so closure notes
 * can cite "what happened to component X across all five
 * frameworks" without walking every framework and filtering.
 *
 * The pivot is a pure function over the results map.
 */
import type {
  ArtifactAdmissionCoverage,
  ComponentAdmissionIndex,
  ComponentAdmissionRow,
  FrameworkId,
  FrameworkValidationResult,
} from "./types.js";

/**
 * Build the per-component index. Returns undefined when no
 * framework has artifact attributions (legacy unattributed
 * mode); the caller should leave RailReport.componentsIndex
 * unset in that case rather than emit an empty object — keeps
 * the report shape an honest superset of the legacy shape.
 */
export function buildComponentIndex(
  results: Readonly<Record<FrameworkId, FrameworkValidationResult>>,
): ComponentAdmissionIndex | undefined {
  const anyAttributed = Object.values(results).some(
    (r) => r.artifacts !== undefined,
  );
  if (!anyAttributed) return undefined;

  const index: ComponentAdmissionIndex = {};
  for (const fw of Object.keys(results) as FrameworkId[]) {
    const result = results[fw];
    if (!result.artifacts) continue;
    for (const group of result.artifacts) {
      const row = makeRow(group.admission, group.paths.length);
      const componentEntry = index[group.component] ?? {};
      componentEntry[fw] = row;
      index[group.component] = componentEntry;
    }
  }
  return index;
}

function makeRow(
  admission: ReadonlyArray<{
    status: "pass" | "fail";
    coverage: ArtifactAdmissionCoverage;
    knownRuleNarrowings?: readonly string[];
  }>,
  pathCount: number,
): ComponentAdmissionRow {
  if (admission.length === 0) {
    return {
      status: "not_admitted",
      coverages: [],
      knownRuleNarrowings: [],
      pathCount,
    };
  }
  const anyFail = admission.some((a) => a.status === "fail");
  const coverages = admission.map((a) => a.coverage);
  const narrowings = new Set<string>();
  for (const a of admission) {
    for (const n of a.knownRuleNarrowings ?? []) {
      narrowings.add(n);
    }
  }
  return {
    status: anyFail ? "fail" : "pass",
    coverages,
    knownRuleNarrowings: [...narrowings],
    pathCount,
  };
}
