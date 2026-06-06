/**
 * VARIANT-CLASS-NAMESPACE-COLLISION-01 — variant-class collision namespacing.
 *
 * Locks the IR substrate that the five component-source emitters and the
 * test-plan share:
 *   - `computeTaintedAxes` marks every variant axis that shares a value with
 *     another axis in the same component (a collision);
 *   - `buildComponentIR` stamps `valuePrefix = "${axis}-"` onto the colliding
 *     value modifiers, so the emitted class becomes `${prefix}--${axis}-${value}`
 *     (unambiguous), while value-disjoint axes leave `valuePrefix` undefined and
 *     keep the legacy `${prefix}--${value}` shape (byte-identical output).
 *
 * List (variant/marker/spacing/size collide; `as` clean) and Image (size/radius
 * collide) are the real proof cases; Button is the value-disjoint control.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildComponentIR, computeTaintedAxes } from "./ir.js";
import type { ComponentContract } from "./contract.js";

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");

function loadContract(name: string): ComponentContract {
  const folder = resolve(CONTRACTS_ROOT, "components", name);
  return JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as ComponentContract;
}

/** propName → valuePrefix for the component's value modifiers. */
function valuePrefixes(name: string): Map<string, string | undefined> {
  const ir = buildComponentIR(loadContract(name));
  return new Map(ir.classRecipe.valueModifiers.map((m) => [m.propName, m.valuePrefix]));
}

describe("computeTaintedAxes (collision detection)", () => {
  it("marks axes that share a value as tainted (List-shaped fixture)", () => {
    const tainted = computeTaintedAxes({
      as: ["ul", "ol", "dl"],
      variant: ["default", "unstyled", "inline", "divided", "spaced"],
      marker: ["default", "none", "disc", "circle"],
      spacing: ["none", "sm", "md", "lg"],
      size: ["sm", "md", "lg"],
    });
    // size×spacing share sm/md/lg; marker×spacing share none; variant×marker share default
    expect([...tainted].sort()).toEqual(["marker", "size", "spacing", "variant"]);
    expect(tainted.has("as")).toBe(false);
  });

  it("returns an empty set when every axis is value-disjoint", () => {
    expect(
      computeTaintedAxes({ variant: ["primary", "ghost"], size: ["sm", "lg"] }).size,
    ).toBe(0);
  });

  it("is empty for a single axis (nothing to collide with)", () => {
    expect(computeTaintedAxes({ tone: ["a", "b", "c"] }).size).toBe(0);
  });
});

describe("buildComponentIR stamps valuePrefix on colliding value modifiers", () => {
  it("List: variant/marker/spacing/size are namespaced; `as` stays bare", () => {
    const p = valuePrefixes("List");
    expect(p.get("variant")).toBe("variant-");
    expect(p.get("marker")).toBe("marker-");
    expect(p.get("spacing")).toBe("spacing-");
    expect(p.get("size")).toBe("size-");
    expect(p.get("as")).toBeUndefined();
  });

  it("Image: size/radius are namespaced (second proof case)", () => {
    const p = valuePrefixes("Image");
    expect(p.get("size")).toBe("size-");
    expect(p.get("radius")).toBe("radius-");
  });

  it("Button (value-disjoint): no value modifier carries a valuePrefix", () => {
    const ir = buildComponentIR(loadContract("Button"));
    expect(ir.classRecipe.valueModifiers.length).toBeGreaterThan(0);
    for (const mod of ir.classRecipe.valueModifiers) {
      expect(mod.valuePrefix).toBeUndefined();
    }
  });
});
