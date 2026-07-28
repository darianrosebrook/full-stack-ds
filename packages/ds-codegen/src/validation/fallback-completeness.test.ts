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

import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { validateContractFallbackCompleteness } from "./fallback-completeness.js";

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
