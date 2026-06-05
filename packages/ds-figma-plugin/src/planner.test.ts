import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  planFigmaStateSurface,
  type PlannerDescriptor,
  type FigmaStatePlan,
  type PlannedDimension,
} from "./planner.js";

// FIGMA-DIMENSIONAL-STATE-PLANNER-01: the planner is a PURE descriptor->plan
// layer. These tests run it against the real generated descriptors (which now
// carry dimensional states) and assert classification + residuals. No canvas.

function loadDescriptor(name: string): PlannerDescriptor {
  const p = resolve(__dirname, `generated/components/${name}/${name}.figma.json`);
  return JSON.parse(readFileSync(p, "utf8")) as PlannerDescriptor;
}

function planFor(name: string): FigmaStatePlan {
  return planFigmaStateSurface(loadDescriptor(name));
}

function dim(plan: FigmaStatePlan, name: string): PlannedDimension {
  const d = plan.dimensions.find((x) => x.name === name);
  if (!d) throw new Error(`dimension ${name} not in plan for ${plan.component}`);
  return d;
}

describe("planFigmaStateSurface", () => {
  // A1: determinism
  it("A1: is deterministic — same descriptor yields a deeply equal plan", () => {
    const d = loadDescriptor("Button");
    expect(planFigmaStateSurface(d)).toEqual(planFigmaStateSurface(d));
  });

  // A4: classification is name-free — same (category, cardinality) -> same lowering
  it("A4: classifies by category + cardinality, not by state-value names", () => {
    const base = (name: string, category: string, vals: string[]) =>
      planFigmaStateSurface({
        component: { name: "Probe" },
        states: {
          dimensions: {
            [name]: { category: category as never, values: vals, initial: vals[0], exclusive: true },
          },
        },
      }).dimensions[0].lowering.kind;

    // Two differently-NAMED 3-value data dimensions classify identically.
    expect(base("alpha", "data", ["a", "b", "c"])).toBe("variant-axis");
    expect(base("zeta", "data", ["x", "y", "z"])).toBe("variant-axis");
    // 2-value additive (data, no a11y) -> boolean-property regardless of names.
    expect(base("loadish", "data", ["idle", "busy"])).toBe("boolean-property");
    expect(base("fetchy", "data", ["off", "on"])).toBe("boolean-property");
    // 2-value restyle category -> NOT boolean.
    expect(base("avail", "availability", ["enabled", "disabled"])).toBe("variant-axis");
  });

  describe("A6 fixture: Button", () => {
    const plan = planFor("Button");
    it("pointer and focus are SEPARATE interaction axes (A2)", () => {
      expect(dim(plan, "pointer").lowering).toEqual({
        kind: "interaction-axis",
        activeValues: ["hover", "active"],
      });
      expect(dim(plan, "focus").lowering).toEqual({
        kind: "interaction-axis",
        activeValues: ["focus"],
      });
      // hover and active are mutually exclusive WITHIN pointer (one axis);
      // focus is a different axis, so hover+focus is representable.
      expect(dim(plan, "pointer").activeValues).toContain("active");
      expect(dim(plan, "focus").activeValues).not.toContain("hover");
    });
    it("availability is a variant axis with a boolean-refused residual (A5)", () => {
      expect(dim(plan, "availability").lowering).toEqual({
        kind: "variant-axis",
        activeValues: ["disabled"],
      });
      expect(plan.residuals).toContainEqual(
        expect.objectContaining({ dimension: "availability", code: "boolean-refused-restyle" }),
      );
    });
    it("availability suppresses ONLY interaction dimensions, never semantic ones (A3)", () => {
      const s = plan.suppressions.find((x) => x.sourceDimension === "availability");
      expect(s).toBeDefined();
      expect(s!.suppressesCategories).toEqual(["interaction"]);
      expect(s!.suppressedDimensions.sort()).toEqual(["focus", "pointer"]);
    });
  });

  describe("A6 fixture: Checkbox + Switch (selection)", () => {
    for (const name of ["Checkbox", "Switch"]) {
      it(`${name}: selection is a variant axis (semantic restyle, A5) with a11y retained as metadata`, () => {
        const plan = planFor(name);
        const sel = dim(plan, "selection");
        expect(sel.lowering.kind).toBe("variant-axis");
        expect(sel.a11y?.attribute).toBe("aria-checked");
        expect(plan.residuals).toContainEqual(
          expect.objectContaining({ dimension: "selection", code: "boolean-refused-restyle" }),
        );
      });
      it(`${name}: disabled suppression does NOT reach the selection dimension (A3)`, () => {
        const plan = planFor(name);
        const s = plan.suppressions.find((x) => x.sourceDimension === "availability");
        expect(s!.suppressedDimensions).not.toContain("selection");
      });
    }
  });

  describe("A6 fixture: Dialog + Sheet (openness)", () => {
    it("Dialog: openness is fully channel-bound (omitted from controls), no residual", () => {
      const plan = planFor("Dialog");
      const o = dim(plan, "openness");
      expect(o.lowering).toEqual({
        kind: "channel-bound",
        channel: "openness",
        values: ["opening", "open", "closing"],
      });
      expect(plan.residuals.find((r) => r.dimension === "openness")).toBeUndefined();
    });
    it("Sheet: openness mixes a visual open state with channel transition phases (A5 residual)", () => {
      const plan = planFor("Sheet");
      const o = dim(plan, "openness");
      // `open` is the visual state (a boolean toggle); opening/closing are channel-driven.
      expect(o.lowering).toEqual({ kind: "boolean-property", activeValue: "open" });
      expect(plan.residuals).toContainEqual(
        expect.objectContaining({ dimension: "openness", code: "mixed-channel-and-visual" }),
      );
    });
  });

  describe("A6 fixture: Tabs (selection, no selected prop)", () => {
    const plan = planFor("Tabs");
    it("declares pointer/focus interaction axes + a selection variant axis", () => {
      expect(dim(plan, "pointer").lowering.kind).toBe("interaction-axis");
      expect(dim(plan, "focus").lowering.kind).toBe("interaction-axis");
      expect(dim(plan, "selection").lowering.kind).toBe("variant-axis");
      expect(dim(plan, "selection").a11y?.attribute).toBe("aria-selected");
    });
    it("has no suppression (Tabs has no availability dimension)", () => {
      expect(plan.suppressions).toEqual([]);
    });
  });

  // A7 is enforced structurally: this module imports nothing from the Figma API
  // and the planner returns plain data. This test documents that contract.
  it("A7: the planner returns plain data and performs no Figma/canvas side effects", () => {
    const plan = planFor("Button");
    expect(typeof plan).toBe("object");
    expect(Array.isArray(plan.dimensions)).toBe(true);
    expect(Array.isArray(plan.residuals)).toBe(true);
    expect(Array.isArray(plan.suppressions)).toBe(true);
  });
});
