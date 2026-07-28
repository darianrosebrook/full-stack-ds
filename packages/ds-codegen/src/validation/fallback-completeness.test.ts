/**
 * Tests for the fallback-completeness validator.
 *
 * The validator is pure-shape: it walks contract.tokens and contract.styles
 * and asserts that every resolvesTo entry carries a non-empty fallback. No
 * I/O, no token-graph dependency — so these are fast in-memory unit tests
 * over synthetic contract shapes.
 *
 * Cases mirror the rule's scope: both sidecars walked, literal entries
 * exempt, empty-string fallback treated as missing (a stray "" is the same
 * defect class as an absent field).
 */

import { afterEach, describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import {
  validateContractFallbackCompleteness,
  validateContractFallbackStale,
  _resetResolvedGraphCacheForTests,
} from "./fallback-completeness.js";

function base(extra: Partial<ComponentContract>): ComponentContract {
  return {
    name: "Test",
    cssPrefix: "test",
    layer: "primitive",
    anatomy: { parts: ["root"] },
    props: { styled: { members: [] } },
    ...extra,
  } as ComponentContract;
}

describe("validateContractFallbackCompleteness — happy paths", () => {
  it("returns no issues when contract has neither tokens nor styles", () => {
    expect(validateContractFallbackCompleteness(base({}))).toEqual([]);
  });

  it("returns no issues when every tokens entry has resolvesTo + fallback", () => {
    const contract = base({
      tokens: {
        "test.color.bg": {
          resolvesTo: "semantic.color.action.background.primary.default",
          fallback: "#d9292b",
          layer: "semantic",
        },
        "test.color.fg": {
          resolvesTo: "semantic.color.foreground.inverse",
          fallback: "#fafafa",
          layer: "semantic",
        },
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });

  it("returns no issues for literal-only entries (no resolvesTo)", () => {
    const contract = base({
      tokens: {
        "test.bg.transparent": { literal: "transparent" },
      },
      styles: {
        "--ghost": {
          "test.color.background.default": { literal: "transparent" },
        },
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });

  it("returns no issues when styles entries carry fallback", () => {
    const contract = base({
      styles: {
        "--primary": {
          "test.color.background.default": {
            resolvesTo: "semantic.color.action.background.primary.default",
            fallback: "#d9292b",
          },
        },
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });
});

describe("validateContractFallbackCompleteness — detects missing fallback", () => {
  it("flags a tokens entry with resolvesTo but no fallback", () => {
    const contract = base({
      tokens: {
        "test.color.bg": {
          resolvesTo: "semantic.color.action.background.primary.default",
          // no fallback
          layer: "semantic",
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/tokens/test.color.bg");
    expect(issues[0].message).toContain("[FALLBACK_MISSING]");
    expect(issues[0].message).toContain("test.color.bg");
    expect(issues[0].message).toContain(
      "semantic.color.action.background.primary.default",
    );
  });

  it("flags a styles entry with resolvesTo but no fallback (the Button --primary case)", () => {
    const contract = base({
      styles: {
        "--primary": {
          "test.color.background.default": {
            resolvesTo: "semantic.color.action.background.primary.default",
            // no fallback — the bug this gate exists to catch
          },
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/styles/--primary/test.color.background.default");
    expect(issues[0].message).toContain("[FALLBACK_MISSING]");
    expect(issues[0].message).toContain("--primary");
    expect(issues[0].message).toContain("test.color.background.default");
  });

  it("flags every offending entry across multiple blocks and sidecars", () => {
    const contract = base({
      tokens: {
        "test.a": { resolvesTo: "semantic.color.a" }, // missing
        "test.b": { resolvesTo: "semantic.color.b", fallback: "#000" }, // ok
        "test.c": { resolvesTo: "semantic.color.c" }, // missing
      },
      styles: {
        "--primary": {
          "test.x": { resolvesTo: "semantic.x" }, // missing
          "test.y": { resolvesTo: "semantic.y", fallback: "#fff" }, // ok
        },
        "--ghost": {
          "test.z": { resolvesTo: "semantic.z" }, // missing
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(4);
    const pointers = issues.map((i) => i.pointer).sort();
    expect(pointers).toEqual([
      "/styles/--ghost/test.z",
      "/styles/--primary/test.x",
      "/tokens/test.a",
      "/tokens/test.c",
    ]);
  });

  it("treats an empty-string fallback as missing (a stray \"\" is the same defect)", () => {
    const contract = base({
      tokens: {
        "test.color.bg": {
          resolvesTo: "semantic.color.bg",
          fallback: "",
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("[FALLBACK_MISSING]");
  });

  it("does not flag entries with neither resolvesTo nor literal (out of scope)", () => {
    const contract = base({
      tokens: {
        "test.empty": {}, // malformed but not this validator's concern
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });
});

describe("validateContractFallbackStale — fallback must equal the graph value", () => {
  afterEach(() => {
    _resetResolvedGraphCacheForTests();
  });

  /** Install a fixture resolved-token graph in place of the on-disk one. */
  function withGraph(graph: Record<string, unknown>): void {
    _resetResolvedGraphCacheForTests(graph);
  }

  it("passes when the fallback equals the graph value", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("reports a stale fallback and names the graph-derived correct literal", () => {
    withGraph({
      semantic: { color: { border: { accent: { $value: "#d92d2e" } } } },
    });
    const contract = base({
      tokens: {
        "test.border": { resolvesTo: "semantic.color.border.accent", fallback: "#d9292b" },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/tokens/test.border");
    expect(issues[0]!.message).toContain("[FALLBACK_STALE]");
    expect(issues[0]!.message).toContain("#d9292b"); // what was authored
    expect(issues[0]!.message).toContain("#d92d2e"); // what it should be
  });

  it("detects a stale fallback in a styles variant block and points at it", () => {
    withGraph({ semantic: { shape: { radius: { $value: "6px" } } } });
    const contract = base({
      styles: {
        "--primary": {
          "test.radius": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
        },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/styles/--primary/test.radius");
    expect(issues[0]!.message).toContain("6px");
  });

  it("fires on a MAJORITY-authored literal that disagrees with the graph", () => {
    // Frequency is not evidence. Three sites agree on 8px; the graph says 6px;
    // all three are stale. This pins the anti-vote rule that motivated the gate.
    withGraph({ semantic: { shape: { radius: { $value: "6px" } } } });
    const contract = base({
      tokens: {
        "test.a": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
        "test.b": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
        "test.c": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
      },
    });
    expect(validateContractFallbackStale(contract)).toHaveLength(3);
  });

  it("follows a component-layer slot chain to the terminal graph value", () => {
    // styles → accordion.border.color (component layer, absent from the graph)
    // → semantic.color.border.light → #b8b8b8.
    withGraph({
      semantic: { color: { border: { light: { $value: "#b8b8b8" } } } },
    });
    const contract = base({
      tokens: {
        "accordion.border.color": {
          resolvesTo: "semantic.color.border.light",
          fallback: "#b8b8b8",
        },
      },
      styles: {
        root: {
          "border-color": { resolvesTo: "accordion.border.color", fallback: "#fceaea" },
        },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/styles/root/border-color");
    expect(issues[0]!.message).toContain("#b8b8b8");
  });

  it("collapses a theme-mode object to its light value", () => {
    withGraph({
      semantic: {
        color: { bg: { $value: { light: "#ffffff", dark: "#141414" } } },
      },
    });
    const ok = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    expect(validateContractFallbackStale(ok)).toEqual([]);

    // The DARK value is not accepted — a static fallback encodes light only.
    const dark = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#141414" } },
    });
    expect(validateContractFallbackStale(dark)).toHaveLength(1);
  });

  it("treats rem and px as equal at the 16px root", () => {
    withGraph({ semantic: { size: { $value: "16px" } } });
    const contract = base({
      tokens: { "test.size": { resolvesTo: "semantic.size", fallback: "1rem" } },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("treats 3-digit and 6-digit hex as equal", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#FFF" } },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("ignores whitespace drift inside a multi-part shadow value", () => {
    withGraph({
      semantic: { elevation: { $value: "0 1px 2px rgba(0,0,0,0.1)" } },
    });
    const contract = base({
      tokens: {
        "test.shadow": {
          resolvesTo: "semantic.elevation",
          fallback: "0 1px 2px rgba(0, 0, 0, 0.1)",
        },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("refuses to treat a serialized DTCG composite as a CSS literal", () => {
    // resolved.tokens.json stores $type:shadow as a JSON string of the
    // structured form, NOT as box-shadow CSS. Deriving a fallback from it
    // writes a JSON blob into var(…, fallback) and breaks the CSS parse — the
    // Lit template rail caught exactly this on Calendar. The gate must report
    // nothing here rather than "repair" the fallback into garbage.
    const composite =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":4,"unit":"px"},' +
      '"blur":{"value":6,"unit":"px"},"color":{"colorSpace":"srgb",' +
      '"components":[0,0,0],"alpha":0.05}}]';
    withGraph({ semantic: { elevation: { overlay: { $value: composite } } } });
    const contract = base({
      tokens: {
        "test.elevation": {
          resolvesTo: "semantic.elevation.overlay",
          fallback: "0 4px 6px rgba(0,0,0,0.05)",
        },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("still compares normally when a CSS literal merely starts with a brace-like char", () => {
    // Guard the composite check against over-refusal: only values that PARSE
    // as JSON objects/arrays are refused, not any string starting with '['.
    withGraph({ semantic: { content: { marker: { $value: "[stale]" } } } });
    const contract = base({
      tokens: {
        "test.marker": { resolvesTo: "semantic.content.marker", fallback: "[fresh]" },
      },
    });
    expect(validateContractFallbackStale(contract)).toHaveLength(1);
  });

  it("skips a reading whose chain dead-ends rather than claiming it is wrong", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: {
        "test.mystery": { resolvesTo: "semantic.color.doesNotExist", fallback: "#123456" },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("terminates on a self-referential slot chain instead of recursing forever", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: {
        "test.loop": { resolvesTo: "test.loop", fallback: "#000000" },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("returns a loud instructional issue when the token graph is not built", () => {
    _resetResolvedGraphCacheForTests("missing");
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.message).toContain("token graph not built");
    expect(issues[0]!.message).toContain("@full-stack-ds/tokens build");
  });

  it("does not consult the graph at all when there are no fallback readings", () => {
    // An unbuilt graph must not fail a contract that declares no fallbacks.
    _resetResolvedGraphCacheForTests("missing");
    expect(validateContractFallbackStale(base({}))).toEqual([]);
  });

  it("ignores slots without fallbacks (the [FALLBACK_MISSING] gate owns those)", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg" } }, // no fallback
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });
});
