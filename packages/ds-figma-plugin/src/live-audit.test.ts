// Live-audit projector: deterministic projection of Figma node state plus
// plan-vs-live comparison. Runs against fake Figma-shaped objects.
import { describe, expect, it } from "vitest";
import {
  auditDigest,
  comparePlanToLive,
  projectComponentAudit,
  projectLiveAudit,
  type ComponentAudit,
} from "./live-audit.js";
import { FSDS_NS, type LiveNode } from "./live-materialize.js";
import {
  type FigmaStatePlan,
  type Residual,
  type SuppressionRelation,
} from "./planner.js";

/**
 * Shared plan-metadata fixtures. The materializer writes these structures
 * into shared plugin data (live-materialize.ts) and the projector reads them
 * back, so the plan side and the live side must stay the same objects —
 * define them once and serialize from the same source.
 */
const planSuppressions: SuppressionRelation[] = [
  {
    sourceDimension: "disabled",
    sourceValues: ["true"],
    suppressesCategories: ["interaction"],
    suppressedDimensions: ["color"],
  },
];
const planResiduals: Residual[] = [
  {
    dimension: "color",
    code: "effect-missing",
    reason: "no effect fact for color's active values",
  },
];

function makeNode(overrides: Partial<Record<string, unknown>> = {}): LiveNode {
  const sharedData: Record<string, string> = {
    "state.dim.size.lowering": "variant-axis",
    "state.dim.disabled.lowering": "boolean-property",
    "state.dim.color.lowering": "channel-bound",
    "state.suppressions": JSON.stringify(planSuppressions),
    "state.residuals": JSON.stringify(planResiduals),
    ...(overrides.sharedData ?? {}),
  };
  return {
    componentPropertyDefinitions: {
      "State/size#12:3": { type: "VARIANT", defaultValue: "md" },
      "State/disabled#9:1": { type: "BOOLEAN", defaultValue: false },
      "Notes#1": { type: "TEXT", defaultValue: "" },
    },
    getSharedPluginDataKeys: (ns: string) =>
      ns === FSDS_NS ? Object.keys(sharedData) : [],
    getSharedPluginData: (ns: string, key: string) =>
      ns === FSDS_NS ? (sharedData[key] ?? "") : "",
    ...(overrides.node ?? {}),
  } as unknown as LiveNode;
}

const plan: FigmaStatePlan = {
  component: "Button",
  dimensions: [
    {
      name: "size",
      category: "presentation",
      cardinality: 3,
      activeValues: ["sm", "md", "lg"],
      initial: "md",
      lowering: { kind: "variant-axis", activeValues: ["sm", "md", "lg"] },
    },
    {
      name: "disabled",
      category: "availability",
      cardinality: 2,
      activeValues: ["true"],
      initial: "false",
      lowering: { kind: "boolean-property", activeValue: "true" },
    },
    {
      name: "color",
      category: "presentation",
      cardinality: 2,
      activeValues: ["accent", "neutral"],
      lowering: { kind: "channel-bound", channel: "data-color", values: ["accent", "neutral"] },
    },
  ],
  suppressions: planSuppressions,
  residuals: planResiduals,
};

describe("projectComponentAudit", () => {
  it("projects variant and boolean properties with id suffixes stripped", () => {
    const audit = projectComponentAudit(makeNode(), "Button");
    expect(audit.found).toBe(true);
    expect(audit.component).toBe("Button");
    expect(audit.variantProperties).toEqual(["State/size"]);
    expect(audit.booleanProperties).toEqual(["State/disabled"]);
  });

  it("projects lowering by dimension from shared plugin data", () => {
    const audit = projectComponentAudit(makeNode(), "Button");
    expect(audit.loweringByDim).toEqual({
      size: "variant-axis",
      disabled: "boolean-property",
      color: "channel-bound",
    });
  });

  it("parses suppressions and residuals; absent keys project null", () => {
    const withData = projectComponentAudit(makeNode(), "Button");
    expect(withData.suppressions).toEqual(planSuppressions);
    expect(withData.residuals).toEqual(planResiduals);

    const bare = projectComponentAudit(
      makeNode({ sharedData: { "state.suppressions": "", "state.residuals": "" } }),
      "Button",
    );
    expect(bare.suppressions).toBeNull();
    expect(bare.residuals).toBeNull();
  });
});

describe("projectLiveAudit and auditDigest", () => {
  it("finds only owned nodes and reports missing components", () => {
    const figma = {
      currentPage: {
        children: [
          {
            name: "Button",
            getSharedPluginData: (ns: string, key: string) =>
              ns === FSDS_NS && key === "live.owned" ? "1" : "",
            componentPropertyDefinitions: {},
            getSharedPluginDataKeys: () => [],
          },
          {
            name: "Unowned",
            getSharedPluginData: () => "",
            componentPropertyDefinitions: {},
            getSharedPluginDataKeys: () => [],
          },
        ],
      },
    };
    const audits = projectLiveAudit(figma as never, ["Button", "Missing"]);
    expect(audits).toHaveLength(2);
    expect(audits[0].found).toBe(true);
    expect(audits[1].found).toBe(false);
  });

  it("produces a stable digest that changes with the audit content", () => {
    const a: ComponentAudit[] = [projectComponentAudit(makeNode(), "Button")];
    const digest = auditDigest(a);
    expect(digest).toBe(auditDigest(a));
    const b: ComponentAudit[] = [
      projectComponentAudit(
        makeNode({
          sharedData: {
            "state.suppressions": JSON.stringify([
              {
                sourceDimension: "disabled",
                sourceValues: ["true"],
                suppressesCategories: ["validation"],
                suppressedDimensions: ["color"],
              },
            ]),
          },
        }),
        "Button",
      ),
    ];
    expect(auditDigest(b)).not.toBe(digest);
  });
});

describe("comparePlanToLive", () => {
  it("accepts a plan whose live audit matches", () => {
    const audit = projectComponentAudit(makeNode(), "Button");
    const diff = comparePlanToLive(plan, audit);
    expect(diff.ok).toBe(true);
    expect(diff.mismatches).toEqual([]);
  });

  it("reports a missing node", () => {
    const diff = comparePlanToLive(plan, {
      component: "Button",
      found: false,
      variantProperties: [],
      booleanProperties: [],
      loweringByDim: {},
      suppressions: null,
      residuals: null,
    });
    expect(diff.ok).toBe(false);
    expect(diff.mismatches).toContain("node not found in live file");
  });

  it("flags lowering mismatches", () => {
    const audit = projectComponentAudit(
      makeNode({ sharedData: { "state.dim.size.lowering": "boolean-property" } }),
      "Button",
    );
    const diff = comparePlanToLive(plan, audit);
    expect(diff.ok).toBe(false);
    expect(diff.mismatches).toContain(
      "size: lowering boolean-property != plan variant-axis",
    );
  });

  it("flags a variant-axis dimension whose VARIANT property is absent live", () => {
    const audit = projectComponentAudit(
      makeNode({
        node: {
          componentPropertyDefinitions: {
            "State/disabled#9:1": { type: "BOOLEAN", defaultValue: false },
          },
        },
      }),
      "Button",
    );
    const diff = comparePlanToLive(plan, audit);
    expect(diff.ok).toBe(false);
    expect(
      diff.mismatches.some((m) => m.includes("expected VARIANT property State/size")),
    ).toBe(true);
  });

  it("flags channel-bound dims that leaked a component property", () => {
    const audit = projectComponentAudit(
      makeNode({
        node: {
          componentPropertyDefinitions: {
            "State/size#12:3": { type: "VARIANT", defaultValue: "md" },
            "State/disabled#9:1": { type: "BOOLEAN", defaultValue: false },
            "State/color#5": { type: "VARIANT", defaultValue: "" },
          },
        },
      }),
      "Button",
    );
    const diff = comparePlanToLive(plan, audit);
    expect(diff.ok).toBe(false);
    expect(diff.mismatches.some((m) => m.includes("color:"))).toBe(true);
  });

  it("flags suppressions drift", () => {
    const audit = projectComponentAudit(
      makeNode({ sharedData: { "state.suppressions": JSON.stringify([]) } }),
      "Button",
    );
    const diff = comparePlanToLive(plan, audit);
    expect(diff.ok).toBe(false);
    expect(diff.mismatches).toContain("suppressions metadata differs from plan");
  });
});
