/**
 * Admission descriptor registry (RAIL-ADMISSION-DESCRIPTOR-INTERFACE-01).
 *
 * The single place a rail-admitted target declares the facts the rail needs to
 * verify it. Before this module, those facts were spread across five parallel
 * FrameworkId-keyed literals in four modules:
 *
 *   - PLANS_BY_ID            (validate-cli.ts)   — the per-framework plan
 *   - DEFAULT_FRAMEWORKS     (validate-cli.ts)   — default selection + order
 *   - COMPONENT_TREES        (required-mode.ts)  — generated-tree relPath
 *   - GENERATED_TREE_PREFIXES(git-range-scope.ts)— generated-tree relPath + "/"
 *   - FRAMEWORK_RANK         (markdown-report.ts)— report ordering
 *
 * Each of those is now DERIVED from this registry, so adding or changing a
 * target is one descriptor edit, not five parallel edits that can silently
 * drift apart.
 *
 * Authority split (the durable shape): a descriptor is a POLICY DATA CONTRACT,
 * not a plugin hook. It carries DECLARED FACTS only — what tree the target
 * emits, what extensions it emits, what command admits it, how it ranks in the
 * report. It carries NO executable policy and CANNOT bypass a central rail
 * invariant. The rail core (validate-cli / required-mode / git-range-scope /
 * markdown-report) remains the sole authority for byte-stability, manifest
 * integrity, contract<->artifact provenance, emitter-source provenance,
 * environment provenance, and report semantics. The rail evaluates a
 * descriptor's declarations against the same evidence ladder it always used.
 *
 * Scope note: this registry holds exactly the six TS-toolchain targets the
 * rail admits today (react, vue, svelte, lit, angular, react-native). It does
 * NOT widen the admitted set. figma stays generate-admitted-but-rail-excluded
 * (it has a plan file but is not a FrameworkId and is not registered here);
 * jetpack-compose / swiftui are unaffected. Loosening the toolchain (a Gradle
 * compileCommand, a CI native lane) is a later slice that CONSUMES this seam.
 */
import type { FrameworkId, FrameworkValidationPlan } from "./types.js";
// Each target self-declares its admission facts in its own module (beside its
// plan). This module imports those declarations and ONLY aggregates + validates
// them — it authors no per-target metadata itself.
import { reactAdmissionDescriptor } from "./frameworks/react.js";
import { vueAdmissionDescriptor } from "./frameworks/vue.js";
import { svelteAdmissionDescriptor } from "./frameworks/svelte.js";
import { litAdmissionDescriptor } from "./frameworks/lit.js";
import { angularAdmissionDescriptor } from "./frameworks/angular.js";
import { reactNativeAdmissionDescriptor } from "./frameworks/react-native.js";

/**
 * The declared facts a rail-admitted target supplies. Everything here is data;
 * none of it is a function the rail calls to make an admission decision.
 */
export interface AdmissionDescriptor {
  /** Stable target id. Must match `plan.framework`. */
  readonly id: FrameworkId;
  /**
   * Workspace-relative POSIX root of the target's generated component tree
   * (no trailing slash). The untracked-generated walk (required-mode) and the
   * reviewer git-range projection (git-range-scope) both derive from this; the
   * latter appends "/" to form a path prefix.
   */
  readonly outputTreeRelPath: string;
  /**
   * Source/SFC extensions this target emits. Today every value is a
   * TS-toolchain extension (.ts/.tsx/.vue/.svelte). A non-TS target would
   * declare .kt / .swift here; the rail does not assume .ts anywhere it reads
   * this field. (The per-command artifact-join scope still lives on the plan's
   * PlanCommandScope.extensions; this is the target-level summary.)
   */
  readonly sourceExtensions: readonly string[];
  /**
   * The admission plan: compile/test command argv, declared checks, and known
   * gaps. This is the existing FrameworkValidationPlan, unchanged — the
   * descriptor wraps it rather than replacing it, so the runner and the
   * artifact-join keep consuming the exact same shape.
   */
  readonly plan: FrameworkValidationPlan;
  /**
   * Stable ordering rank used only for report grouping. Lower sorts first.
   * Purely cosmetic; carries no admission authority.
   */
  readonly reportRank: number;
}

/**
 * The self-declared descriptors this registry aggregates. The ONLY per-target
 * facts this module names are the imported descriptor identifiers — the facts
 * themselves (outputTreeRelPath, sourceExtensions, reportRank, plan) are
 * authored in each target module, not here. This module's job from here is
 * aggregation + validation, not authorship.
 */
const SELF_DECLARED_DESCRIPTORS: readonly AdmissionDescriptor[] = [
  reactAdmissionDescriptor,
  vueAdmissionDescriptor,
  svelteAdmissionDescriptor,
  litAdmissionDescriptor,
  angularAdmissionDescriptor,
  reactNativeAdmissionDescriptor,
];

/**
 * Adjudicate the self-declared descriptors into a validated registry. The rail
 * core enforces the structural invariants a target module cannot enforce alone:
 * id↔plan agreement, no duplicate ids, full FrameworkId coverage, and a
 * contiguous 0-based reportRank sequence (so report ordering is total and
 * stable). A violation is a load-bearing defect — fail loud at module load,
 * not silently at rail time.
 */
function buildRegistry(
  declared: readonly AdmissionDescriptor[],
): Readonly<Record<FrameworkId, AdmissionDescriptor>> {
  const byId = {} as Record<FrameworkId, AdmissionDescriptor>;
  for (const d of declared) {
    if (d.id !== d.plan.framework) {
      throw new Error(
        `admission descriptor id "${d.id}" disagrees with plan.framework "${d.plan.framework}"`,
      );
    }
    if (Object.prototype.hasOwnProperty.call(byId, d.id)) {
      throw new Error(`duplicate admission descriptor for "${d.id}"`);
    }
    byId[d.id] = d;
  }
  // Full coverage + contiguous ranks. Sorting by rank and checking it equals
  // the index proves the six ranks are exactly 0..5 with no gap or collision.
  const sorted = declared.slice().sort((a, b) => a.reportRank - b.reportRank);
  sorted.forEach((d, i) => {
    if (d.reportRank !== i) {
      throw new Error(
        `admission descriptor reportRank sequence is not contiguous 0-based: "${d.id}" has rank ${d.reportRank} at sorted index ${i}`,
      );
    }
  });
  return byId;
}

/**
 * The validated rail-admitted descriptor registry, keyed by id. Typed
 * `Record<FrameworkId, …>` so the compiler still rejects partial coverage; the
 * runtime `buildRegistry` adjudication adds the cross-field invariants TypeScript
 * cannot express (id↔plan, contiguous ranks).
 */
export const ADMISSION_DESCRIPTORS: Readonly<Record<FrameworkId, AdmissionDescriptor>> =
  buildRegistry(SELF_DECLARED_DESCRIPTORS);

/**
 * Canonical framework order, derived from the registry's reportRank. This is
 * the single source for DEFAULT_FRAMEWORKS and the report rank lookup.
 */
export const ADMITTED_FRAMEWORKS: readonly FrameworkId[] = (
  Object.values(ADMISSION_DESCRIPTORS) as AdmissionDescriptor[]
)
  .slice()
  .sort((a, b) => a.reportRank - b.reportRank)
  .map((d) => d.id);

/** Plans keyed by id — the descriptor-derived replacement for PLANS_BY_ID. */
export function admissionPlansById(): Record<FrameworkId, FrameworkValidationPlan> {
  const out = {} as Record<FrameworkId, FrameworkValidationPlan>;
  for (const id of ADMITTED_FRAMEWORKS) {
    out[id] = ADMISSION_DESCRIPTORS[id].plan;
  }
  return out;
}

/** `{framework, relPath}` rows — the descriptor-derived COMPONENT_TREES. */
export function admissionComponentTrees(): ReadonlyArray<{ framework: FrameworkId; relPath: string }> {
  return ADMITTED_FRAMEWORKS.map((id) => ({
    framework: id,
    relPath: ADMISSION_DESCRIPTORS[id].outputTreeRelPath,
  }));
}

/** `{framework, prefix}` rows — the descriptor-derived GENERATED_TREE_PREFIXES. */
export function admissionGeneratedTreePrefixes(): ReadonlyArray<{ framework: FrameworkId; prefix: string }> {
  return ADMITTED_FRAMEWORKS.map((id) => ({
    framework: id,
    prefix: `${ADMISSION_DESCRIPTORS[id].outputTreeRelPath}/`,
  }));
}

/** `Record<FrameworkId, number>` — the descriptor-derived FRAMEWORK_RANK. */
export function admissionFrameworkRank(): Record<FrameworkId, number> {
  const out = {} as Record<FrameworkId, number>;
  for (const id of ADMITTED_FRAMEWORKS) {
    out[id] = ADMISSION_DESCRIPTORS[id].reportRank;
  }
  return out;
}

/** Runtime FrameworkId guard, derived from the registry keys. */
export function isAdmittedFrameworkId(value: string): value is FrameworkId {
  return Object.prototype.hasOwnProperty.call(ADMISSION_DESCRIPTORS, value);
}
