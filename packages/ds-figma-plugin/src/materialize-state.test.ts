import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  materializeComponentStateSurface,
  materializeComponentSurface,
  type MaterializeTarget,
} from "./materialize-state.js";
import type { PlannerDescriptor, FigmaStatePlan } from "./planner.js";

// FIGMA-COMPONENT-PROPERTY-MATERIALIZER-01: mocked-Figma evidence that the
// materializer lowers a plan into component-property / variant / metadata
// structure, consuming the plan only (never re-deriving state semantics).

interface RecordedProperty {
  name: string;
  type: string;
  options?: { defaultValue?: string | boolean; variantOptions?: string[] };
}

interface MockNode extends MaterializeTarget {
  componentProperties: RecordedProperty[];
  pluginData: Record<string, string>;
}

function mockNode(): MockNode {
  const componentProperties: RecordedProperty[] = [];
  const pluginData: Record<string, string> = {};
  return {
    componentProperties,
    pluginData,
    addComponentProperty(name, type, options) {
      componentProperties.push({ name, type, options });
      return name;
    },
    setPluginData(key, value) {
      pluginData[key] = value;
    },
  };
}

function loadDescriptor(name: string): PlannerDescriptor {
  const p = resolve(__dirname, `generated/components/${name}/${name}.figma.json`);
  return JSON.parse(readFileSync(p, "utf8")) as PlannerDescriptor;
}

function materialize(name: string): MockNode {
  const node = mockNode();
  materializeComponentStateSurface(node, loadDescriptor(name));
  return node;
}

function prop(node: MockNode, name: string): RecordedProperty | undefined {
  return node.componentProperties.find((p) => p.name === name);
}
function pd<T = unknown>(node: MockNode, key: string): T {
  return JSON.parse(node.pluginData[key]) as T;
}

describe("materialize-state: plan-driven Figma state surface", () => {
  // A3 + A5 + A7 + A8
  describe("A6 fixture: Button", () => {
    const node = materialize("Button");
    it("availability is a VARIANT property (not boolean), pointer/focus are NOT component properties (A3/A5)", () => {
      const avail = prop(node, "State/availability");
      expect(avail?.type).toBe("VARIANT");
      expect(avail?.options?.variantOptions).toContain("disabled");
      // No boolean property anywhere — disabled was residualized as restyle-unsafe.
      expect(node.componentProperties.every((p) => p.type !== "BOOLEAN")).toBe(true);
      // pointer/focus are interaction metadata, NOT public properties.
      expect(prop(node, "State/pointer")).toBeUndefined();
      expect(prop(node, "State/focus")).toBeUndefined();
      expect(node.pluginData["fsds.state.dim.pointer.lowering"]).toBe("interaction-axis");
      expect(node.pluginData["fsds.state.dim.focus.lowering"]).toBe("interaction-axis");
    });
    it("suppression is recorded as plugin data pointing at pointer/focus only (A7)", () => {
      const sup = pd<Array<{ sourceDimension: string; suppressedDimensions: string[] }>>(
        node,
        "fsds.state.suppressions",
      );
      const a = sup.find((s) => s.sourceDimension === "availability");
      expect(a!.suppressedDimensions.sort()).toEqual(["focus", "pointer"]);
      expect(a!.suppressedDimensions).not.toContain("selection");
    });
    it("availability has NO residual now that effect:restyle is an authored fact (A6/A8)", () => {
      const res = pd<Array<{ dimension: string; code: string }>>(node, "fsds.state.residuals");
      expect(res.find((r) => r.dimension === "availability")).toBeUndefined();
    });
  });

  describe("A6 fixture: Checkbox + Switch", () => {
    for (const name of ["Checkbox", "Switch"]) {
      it(`${name}: selection is a VARIANT property with aria-checked metadata; suppression spares selection`, () => {
        const node = materialize(name);
        expect(prop(node, "State/selection")?.type).toBe("VARIANT");
        const a11y = pd<{ attribute: string }>(node, "fsds.state.dim.selection.a11y");
        expect(a11y.attribute).toBe("aria-checked");
        const sup = pd<Array<{ sourceDimension: string; suppressedDimensions: string[] }>>(
          node,
          "fsds.state.suppressions",
        );
        expect(sup.find((s) => s.sourceDimension === "availability")!.suppressedDimensions).not.toContain(
          "selection",
        );
      });
    }
  });

  describe("A6 fixture: Dialog + Sheet", () => {
    it("Dialog: openness is channel-bound — omitted from controls, recorded as plugin data (A6)", () => {
      const node = materialize("Dialog");
      expect(prop(node, "State/openness")).toBeUndefined();
      expect(node.pluginData["fsds.state.dim.openness.lowering"]).toBe("channel-bound");
      expect(node.pluginData["fsds.state.dim.openness.omitted"]).toBe("true");
      expect(node.pluginData["fsds.state.dim.openness.channel"]).toBe("openness");
    });
    it("Sheet: openness is a BOOLEAN property; the precise mixed-value-effects residual is preserved (A4)", () => {
      const node = materialize("Sheet");
      expect(prop(node, "State/openness")?.type).toBe("BOOLEAN");
      const res = pd<Array<{ dimension: string; code: string }>>(node, "fsds.state.residuals");
      expect(res).toContainEqual(
        expect.objectContaining({ dimension: "openness", code: "mixed-value-effects" }),
      );
    });
  });

  describe("A6 fixture: Tabs", () => {
    it("selection is a VARIANT property with aria-selected metadata", () => {
      const node = materialize("Tabs");
      expect(prop(node, "State/selection")?.type).toBe("VARIANT");
      expect(pd<{ attribute: string }>(node, "fsds.state.dim.selection.a11y").attribute).toBe(
        "aria-selected",
      );
    });
  });

  // A1/A2/A4: the materializer consumes a plan and handles every lowering kind,
  // deciding purely on lowering.kind — never on dimension/value names.
  describe("plan consumption is name-free (A1/A2/A4)", () => {
    const plan: FigmaStatePlan = {
      component: "Probe",
      dimensions: [
        // Two differently-NAMED variant-axis dims -> both VARIANT properties.
        { name: "alpha", category: "validation", cardinality: 2, activeValues: ["bad"], initial: "ok", lowering: { kind: "variant-axis", activeValues: ["bad"] } },
        { name: "omega", category: "selection", cardinality: 2, activeValues: ["on"], initial: "off", lowering: { kind: "variant-axis", activeValues: ["on"] } },
        { name: "load", category: "data", cardinality: 2, activeValues: ["busy"], initial: "idle", lowering: { kind: "boolean-property", activeValue: "busy" } },
        { name: "phase", category: "interaction", cardinality: 3, activeValues: ["hover", "active"], initial: "rest", lowering: { kind: "interaction-axis", activeValues: ["hover", "active"] } },
        { name: "vis", category: "visibility", cardinality: 4, activeValues: ["open"], initial: "closed", lowering: { kind: "channel-bound", channel: "vis", values: ["a", "b"] } },
        { name: "meta", category: "presentation", cardinality: 1, activeValues: [], initial: "x", lowering: { kind: "metadata-only" } },
      ],
      suppressions: [],
      residuals: [{ dimension: "alpha", code: "mixed-value-effects", reason: "test" }],
    };
    const node = mockNode();
    materializeComponentSurface(node, plan);

    it("every lowering kind has an explicit behavior or omission record (A2)", () => {
      // variant-axis -> VARIANT property (regardless of name).
      expect(prop(node, "State/alpha")?.type).toBe("VARIANT");
      expect(prop(node, "State/omega")?.type).toBe("VARIANT");
      // boolean-property -> BOOLEAN property.
      expect(prop(node, "State/load")?.type).toBe("BOOLEAN");
      // interaction-axis -> NOT a property; metadata only.
      expect(prop(node, "State/phase")).toBeUndefined();
      expect(node.pluginData["fsds.state.dim.phase.lowering"]).toBe("interaction-axis");
      // channel-bound -> omitted, recorded.
      expect(prop(node, "State/vis")).toBeUndefined();
      expect(node.pluginData["fsds.state.dim.vis.omitted"]).toBe("true");
      // metadata-only -> omitted, recorded, no crash.
      expect(prop(node, "State/meta")).toBeUndefined();
      expect(node.pluginData["fsds.state.dim.meta.omitted"]).toBe("true");
    });
    it("residuals are recorded even on a synthetic plan (A8)", () => {
      const res = pd<Array<{ code: string }>>(node, "fsds.state.residuals");
      expect(res[0].code).toBe("mixed-value-effects");
    });
    it("classification keys off lowering.kind, not names: alpha vs omega behave identically", () => {
      expect(prop(node, "State/alpha")?.type).toBe(prop(node, "State/omega")?.type);
    });
  });
});
