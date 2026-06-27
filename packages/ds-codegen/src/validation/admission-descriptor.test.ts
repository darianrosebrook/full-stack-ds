/**
 * Rail-output-equivalence contract (RAIL-ADMISSION-DESCRIPTOR-INTERFACE-01).
 *
 * The descriptor extraction is a NO-BEHAVIOR-CHANGE refactor: the five
 * FrameworkId-keyed lists the rail consumed (PLANS_BY_ID, DEFAULT_FRAMEWORKS,
 * COMPONENT_TREES, GENERATED_TREE_PREFIXES, FRAMEWORK_RANK) are now derived
 * from one descriptor registry. This test is the regression oracle: it pins the
 * exact pre-refactor literals as expected constants and asserts the
 * descriptor-derived values reproduce them byte-for-byte (and in the same
 * order, where order is load-bearing — DEFAULT_FRAMEWORKS selection order and
 * the report grouping order).
 *
 * If a later edit changes a descriptor's outputTreeRelPath, plan binding, or
 * reportRank in a way that would alter rail behavior, one of these assertions
 * fails — that is the point. These constants are intentionally a hand-copied
 * snapshot of the old hardcoded literals, NOT re-derived from the registry, so
 * the test can actually disagree with the registry.
 */
import { describe, it, expect } from "vitest";
import {
  ADMISSION_DESCRIPTORS,
  ADMITTED_FRAMEWORKS,
  admissionPlansById,
  admissionComponentTrees,
  admissionGeneratedTreePrefixes,
  admissionFrameworkRank,
  isAdmittedFrameworkId,
} from "./admission-descriptor.js";
import { reactValidationPlan } from "./frameworks/react.js";
import { vueValidationPlan } from "./frameworks/vue.js";
import { svelteValidationPlan } from "./frameworks/svelte.js";
import { litValidationPlan } from "./frameworks/lit.js";
import { angularValidationPlan } from "./frameworks/angular.js";
import { reactNativeValidationPlan } from "./frameworks/react-native.js";

// ── Pre-refactor literals, copied verbatim from the four consumer modules ────
// (validate-cli.ts, required-mode.ts, git-range-scope.ts, markdown-report.ts).
const LEGACY_DEFAULT_FRAMEWORKS = [
  "react",
  "vue",
  "svelte",
  "lit",
  "angular",
  "react-native",
] as const;

const LEGACY_PLANS_BY_ID = {
  react: reactValidationPlan,
  vue: vueValidationPlan,
  svelte: svelteValidationPlan,
  lit: litValidationPlan,
  angular: angularValidationPlan,
  "react-native": reactNativeValidationPlan,
} as const;

const LEGACY_COMPONENT_TREES = [
  { framework: "react", relPath: "packages/ds-react/src/components" },
  { framework: "vue", relPath: "packages/ds-vue/src/components" },
  { framework: "svelte", relPath: "packages/ds-svelte/src/components" },
  { framework: "lit", relPath: "packages/ds-lit/src/components" },
  { framework: "angular", relPath: "packages/ds-angular/src/components" },
  { framework: "react-native", relPath: "packages/ds-react-native/src/components" },
] as const;

const LEGACY_GENERATED_TREE_PREFIXES = [
  { framework: "react", prefix: "packages/ds-react/src/components/" },
  { framework: "vue", prefix: "packages/ds-vue/src/components/" },
  { framework: "svelte", prefix: "packages/ds-svelte/src/components/" },
  { framework: "lit", prefix: "packages/ds-lit/src/components/" },
  { framework: "angular", prefix: "packages/ds-angular/src/components/" },
  { framework: "react-native", prefix: "packages/ds-react-native/src/components/" },
] as const;

const LEGACY_FRAMEWORK_RANK = {
  react: 0,
  vue: 1,
  svelte: 2,
  lit: 3,
  angular: 4,
  "react-native": 5,
} as const;

describe("admission descriptor — rail output equivalence", () => {
  it("DEFAULT_FRAMEWORKS order is reproduced (selection order is load-bearing)", () => {
    expect(ADMITTED_FRAMEWORKS).toEqual([...LEGACY_DEFAULT_FRAMEWORKS]);
  });

  it("PLANS_BY_ID maps each framework to the same plan object identity", () => {
    const derived = admissionPlansById();
    expect(Object.keys(derived)).toEqual([...LEGACY_DEFAULT_FRAMEWORKS]);
    for (const id of LEGACY_DEFAULT_FRAMEWORKS) {
      // Identity, not deep-equal: the descriptor must bind the SAME plan object,
      // so the runner/artifact-join consume the exact existing FrameworkValidationPlan.
      expect(derived[id]).toBe(LEGACY_PLANS_BY_ID[id]);
    }
  });

  it("COMPONENT_TREES is reproduced byte-for-byte and in order", () => {
    expect(admissionComponentTrees()).toEqual([...LEGACY_COMPONENT_TREES]);
  });

  it("GENERATED_TREE_PREFIXES is reproduced byte-for-byte and in order", () => {
    expect(admissionGeneratedTreePrefixes()).toEqual([...LEGACY_GENERATED_TREE_PREFIXES]);
  });

  it("GENERATED_TREE_PREFIXES is exactly COMPONENT_TREES relPath + '/' (the invariant the two literals encoded)", () => {
    const trees = admissionComponentTrees();
    const prefixes = admissionGeneratedTreePrefixes();
    expect(prefixes.map((p) => p.prefix)).toEqual(trees.map((t) => `${t.relPath}/`));
  });

  it("FRAMEWORK_RANK is reproduced byte-for-byte", () => {
    expect(admissionFrameworkRank()).toEqual({ ...LEGACY_FRAMEWORK_RANK });
  });

  it("isAdmittedFrameworkId admits exactly the six and nothing else", () => {
    for (const id of LEGACY_DEFAULT_FRAMEWORKS) {
      expect(isAdmittedFrameworkId(id)).toBe(true);
    }
    // figma is generate-admitted but NOT rail-admitted — must be rejected here.
    expect(isAdmittedFrameworkId("figma")).toBe(false);
    expect(isAdmittedFrameworkId("jetpack-compose")).toBe(false);
    expect(isAdmittedFrameworkId("swiftui")).toBe(false);
    expect(isAdmittedFrameworkId("nonsense")).toBe(false);
  });

  it("descriptor id matches its plan.framework (no id/plan mismatch)", () => {
    for (const id of ADMITTED_FRAMEWORKS) {
      const d = ADMISSION_DESCRIPTORS[id];
      expect(d.id).toBe(id);
      expect(d.plan.framework).toBe(id);
    }
  });

  it("the registry holds exactly the six rail-admitted targets — no native target leaked in", () => {
    expect(Object.keys(ADMISSION_DESCRIPTORS).sort()).toEqual(
      [...LEGACY_DEFAULT_FRAMEWORKS].sort(),
    );
  });
});
