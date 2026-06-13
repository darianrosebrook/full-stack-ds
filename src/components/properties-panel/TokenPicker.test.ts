// Behavioral coverage for sortAndFilterByType — the picker's filter+sort core.
// Proves: (1) the authoritative DTCG $type drives the kind filter, (2) the
// value-regex is only a fallback when a token carries no $type, (3) tokens sort
// semantic-before-core, and (4) pathPattern/query narrow within a kind.

import { describe, expect, it } from "vitest";
import { sortAndFilterByType } from "./TokenPicker";
import type { FoundationToken } from "../../types/data";

function tok(p: Partial<FoundationToken>): FoundationToken {
  return { layer: "core", path: "x", ...p };
}

describe("sortAndFilterByType", () => {
  it("keeps only color-typed tokens for kind=color, dropping dimensions", () => {
    const list = [
      tok({ path: "color.action.bg", type: "color", value: "#1d4ed8", layer: "semantic" }),
      tok({ path: "shape.radius.md", type: "dimension", value: "8px" }),
      tok({ path: "color.palette.red.500", type: "color", value: "#ef4444" }),
    ];
    const out = sortAndFilterByType(list, "color");
    expect(out.map((t) => t.path)).toEqual([
      "color.action.bg", // semantic-first
      "color.palette.red.500",
    ]);
    // The dimension token is gone — a color picker never shows a length.
    expect(out.some((t) => t.type === "dimension")).toBe(false);
  });

  it("keeps dimension + borderWidth for kind=dimension, dropping colors", () => {
    const list = [
      tok({ path: "color.foreground.accent", type: "color", value: "#000" }),
      tok({ path: "shape.radius.md", type: "dimension", value: "8px", layer: "semantic" }),
      tok({ path: "border.width.thin", type: "borderWidth", value: "1px" }),
    ];
    const out = sortAndFilterByType(list, "dimension");
    expect(out.map((t) => t.path)).toEqual([
      "shape.radius.md", // semantic-first
      "border.width.thin",
    ]);
    // No color leaks into a border/spacing picker.
    expect(out.some((t) => t.type === "color")).toBe(false);
  });

  it("falls back to the value regex only when $type is absent", () => {
    const list = [
      tok({ path: "legacy.untyped.color", value: "#abcdef" }), // no $type → regex says color
      tok({ path: "legacy.untyped.len", value: "12px" }), // no $type → regex says dimension
    ];
    expect(sortAndFilterByType(list, "color").map((t) => t.path)).toEqual([
      "legacy.untyped.color",
    ]);
    expect(sortAndFilterByType(list, "dimension").map((t) => t.path)).toEqual([
      "legacy.untyped.len",
    ]);
  });

  it("ranks semantic < brand < core, then by path within a layer", () => {
    const list = [
      tok({ path: "color.z.core", type: "color", value: "#1", layer: "core" }),
      tok({ path: "color.a.core", type: "color", value: "#2", layer: "core" }),
      tok({ path: "color.m.brand", type: "color", value: "#3", layer: "brand" }),
      tok({ path: "color.m.semantic", type: "color", value: "#4", layer: "semantic" }),
    ];
    expect(sortAndFilterByType(list, "color").map((t) => t.layer)).toEqual([
      "semantic",
      "brand",
      "core",
      "core",
    ]);
    // Within the core tier, alphabetical by path.
    const core = sortAndFilterByType(list, "color").filter((t) => t.layer === "core");
    expect(core.map((t) => t.path)).toEqual(["color.a.core", "color.z.core"]);
  });

  it("drops branch-only nodes that carry no value", () => {
    const list = [
      tok({ path: "color.group", type: "color" }), // no value → branch node
      tok({ path: "color.leaf", type: "color", value: "#fff" }),
    ];
    expect(sortAndFilterByType(list, "color").map((t) => t.path)).toEqual([
      "color.leaf",
    ]);
  });

  it("with kind=undefined, keeps every value-carrying token regardless of type", () => {
    const list = [
      tok({ path: "color.x", type: "color", value: "#fff" }),
      tok({ path: "shape.r", type: "dimension", value: "4px" }),
      tok({ path: "motion.d", type: "duration", value: "200ms" }),
      tok({ path: "branch", type: "color" }), // no value → still dropped
    ];
    expect(sortAndFilterByType(list, undefined).map((t) => t.path).sort()).toEqual([
      "color.x",
      "motion.d",
      "shape.r",
    ]);
  });

  it("narrows by pathPattern in addition to kind (radius control case)", () => {
    const list = [
      tok({ path: "shape.radius.md", type: "dimension", value: "8px" }),
      tok({ path: "spacing.4", type: "dimension", value: "16px" }),
      tok({ path: "density.gap", type: "dimension", value: "12px" }),
    ];
    const out = sortAndFilterByType(list, "dimension", {
      pathPattern: /shape\.radius/,
    });
    // Only radius dimensions — not spacing/density.
    expect(out.map((t) => t.path)).toEqual(["shape.radius.md"]);
  });

  it("matches the free-text query against path and value", () => {
    const list = [
      tok({ path: "color.action.primary", type: "color", value: "#1d4ed8" }),
      tok({ path: "color.action.danger", type: "color", value: "#ef4444" }),
    ];
    // Query against path
    expect(
      sortAndFilterByType(list, "color", { query: "danger" }).map((t) => t.path),
    ).toEqual(["color.action.danger"]);
    // Query against resolved value
    expect(
      sortAndFilterByType(list, "color", { query: "1d4ed8" }).map((t) => t.path),
    ).toEqual(["color.action.primary"]);
  });
});
