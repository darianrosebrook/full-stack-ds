import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { planFigmaStateSurface, type PlannerDescriptor, type FigmaStatePlan } from "./planner.js";
import { runLiveMaterialization } from "./live-run.js";
import { projectLiveAudit, comparePlanToLive } from "./live-audit.js";
import type { LiveFigmaLike, LiveNode } from "./live-materialize.js";

// Stateful mock modelling the parts of the Figma API the live adapter touches:
// combineAsVariants derives VARIANT properties from variant naming;
// addComponentProperty records a BOOLEAN definition and THROWS on duplicate
// (so the idempotency guard is genuinely exercised). This proves the
// idempotency CONTRACT deterministically; the live run proves it on real Figma.
function makeMockFigma(): LiveFigmaLike & { currentPage: { id: string; children: LiveNode[]; appendChild(n: LiveNode): void } } {
  let n = 0;
  function makeNode(): LiveNode {
    const pluginData: Record<string, string> = {};
    const componentPropertyDefinitions: Record<string, { type: string; variantOptions?: string[]; defaultValue?: unknown }> = {};
    return {
      name: `node${n++}`,
      componentPropertyDefinitions,
      remove() {},
      setSharedPluginData(ns, k, v) { pluginData[`${ns}:${k}`] = v; },
      getSharedPluginData(ns, k) { return pluginData[`${ns}:${k}`] ?? ""; },
      getSharedPluginDataKeys(ns) {
        return Object.keys(pluginData)
          .filter((x) => x.startsWith(`${ns}:`))
          .map((x) => x.slice(ns.length + 1));
      },
      addComponentProperty(name, type) {
        if (name in componentPropertyDefinitions) throw new Error(`duplicate component property: ${name}`);
        componentPropertyDefinitions[name] = { type };
        return `${name}#id`;
      },
    };
  }
  const children: LiveNode[] = [];
  const page = { id: "page:0", children, appendChild(node: LiveNode) { children.push(node); } };
  return {
    currentPage: page,
    createComponent() { return makeNode(); },
    combineAsVariants(comps, parent) {
      const set = makeNode();
      const axes: Record<string, Set<string>> = {};
      for (const c of comps) {
        for (const pair of c.name.split(", ")) {
          const [k, v] = pair.split("=");
          (axes[k] ??= new Set()).add(v);
        }
      }
      for (const [k, vals] of Object.entries(axes)) {
        set.componentPropertyDefinitions![k] = { type: "VARIANT", variantOptions: [...vals] };
      }
      (parent as { children: LiveNode[] }).children.push(set);
      return set;
    },
  };
}

const FIXTURES = ["Button", "Checkbox", "Switch", "Dialog", "Sheet", "Tabs"];

function loadPlans(): FigmaStatePlan[] {
  return FIXTURES.map((name) => {
    const p = resolve(__dirname, `generated/components/${name}/${name}.figma.json`);
    return planFigmaStateSurface(JSON.parse(readFileSync(p, "utf8")) as PlannerDescriptor);
  });
}

function ownedCount(figma: ReturnType<typeof makeMockFigma>): number {
  return figma.currentPage.children.filter((c) => c.getSharedPluginData("fsds", "live.owned") === "1").length;
}

describe("live-materialize: idempotency + plan-vs-live audit (mock)", () => {
  it("A3/A8: a second run is idempotent — same digest, no duplicate nodes", () => {
    const figma = makeMockFigma();
    const plans = loadPlans();
    const run1 = runLiveMaterialization(figma, plans);
    const run2 = runLiveMaterialization(figma, plans);
    expect(run2.digest).toBe(run1.digest); // A8: identical audit digest
    expect(run2.ownedNodeCount).toBe(run1.ownedNodeCount);
    expect(ownedCount(figma)).toBe(6); // exactly 6 owned nodes — no duplicates
  });

  it("A4: plan-vs-live audit matches for every fixture", () => {
    const figma = makeMockFigma();
    const plans = loadPlans();
    runLiveMaterialization(figma, plans);
    const audits = projectLiveAudit(figma, FIXTURES);
    for (let i = 0; i < plans.length; i++) {
      expect(comparePlanToLive(plans[i], audits[i]).mismatches).toEqual([]);
    }
    const by = Object.fromEntries(audits.map((a) => [a.component, a]));
    // A4 specifics:
    expect(by.Button.variantProperties).toContain("State/availability");
    expect(by.Checkbox.variantProperties).toContain("State/selection");
    expect(by.Switch.variantProperties).toContain("State/selection");
    expect(by.Tabs.variantProperties).toContain("State/selection");
    expect(by.Sheet.booleanProperties).toContain("State/openness");
    // Dialog openness is channel-bound -> NO component property.
    expect(by.Dialog.variantProperties).not.toContain("State/openness");
    expect(by.Dialog.booleanProperties).not.toContain("State/openness");
    expect(by.Dialog.loweringByDim.openness).toBe("channel-bound");
    // suppression + residual metadata preserved.
    expect(by.Button.suppressions).toEqual(plans[0].suppressions);
    expect(by.Sheet.residuals).toEqual(plans.find((p) => p.component === "Sheet")!.residuals);
  });
});
