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
import {
  validateContractFallbackCompleteness,
  collectFallbackDivergenceAdvisories,
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

describe("collectFallbackDivergenceAdvisories — corpus-wide divergence", () => {
  /** Build a corpus map from named contracts for the divergence pass. */
  function corpus(...named: [string, ComponentContract][]): Map<string, ComponentContract> {
    return new Map(named);
  }

  it("returns no advisories when all contracts agree on a token's fallback", () => {
    const a = base({
      name: "Alpha",
      tokens: { "alpha.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    const b = base({
      name: "Beta",
      tokens: { "beta.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    expect(collectFallbackDivergenceAdvisories(corpus(["Alpha", a], ["Beta", b]))).toEqual([]);
  });

  it("emits an advisory when two contracts give the same token different fallbacks", () => {
    const a = base({
      name: "Alpha",
      tokens: { "alpha.bg": { resolvesTo: "semantic.color.action.bg", fallback: "#0566fe" } },
    });
    const b = base({
      name: "Beta",
      tokens: { "beta.bg": { resolvesTo: "semantic.color.action.bg", fallback: "#d9292b" } },
    });
    const advisories = collectFallbackDivergenceAdvisories(corpus(["Alpha", a], ["Beta", b]));
    expect(advisories).toHaveLength(1);
    expect(advisories[0]).toContain("[FALLBACK_DIVERGENT]");
    expect(advisories[0]).toContain("semantic.color.action.bg");
    expect(advisories[0]).toContain("#0566fe");
    expect(advisories[0]).toContain("#d9292b");
    expect(advisories[0]).toContain("Alpha");
    expect(advisories[0]).toContain("Beta");
  });

  it("emits an advisory for intra-contract divergence (Button base vs --primary)", () => {
    // The reviewer's case: one contract, base block + --primary variant,
    // same token, two fallbacks.
    const button = base({
      name: "Button",
      tokens: {
        "button.color.background.default": {
          resolvesTo: "semantic.color.action.background.primary.default",
          fallback: "#d9292b",
        },
      },
      styles: {
        "--primary": {
          "button.color.background.default": {
            resolvesTo: "semantic.color.action.background.primary.default",
            fallback: "#0566fe",
          },
        },
      },
    });
    const advisories = collectFallbackDivergenceAdvisories(corpus(["Button", button]));
    expect(advisories).toHaveLength(1);
    expect(advisories[0]).toContain("[FALLBACK_DIVERGENT]");
    expect(advisories[0]).toContain("#d9292b");
    expect(advisories[0]).toContain("#0566fe");
    expect(advisories[0]).toContain("<root>"); // the base block site
    expect(advisories[0]).toContain("--primary"); // the variant block site
  });

  it("canonicalizes unit-equivalent fallbacks (16px == 1rem) and does NOT fire", () => {
    const a = base({
      name: "Alpha",
      tokens: { "alpha.size": { resolvesTo: "semantic.typography.body", fallback: "16px" } },
    });
    const b = base({
      name: "Beta",
      tokens: { "beta.size": { resolvesTo: "semantic.typography.body", fallback: "1rem" } },
    });
    expect(collectFallbackDivergenceAdvisories(corpus(["Alpha", a], ["Beta", b]))).toEqual([]);
  });

  it("canonicalizes unit-equivalent fallbacks (14px == 0.875rem) and does NOT fire", () => {
    const a = base({
      name: "Alpha",
      tokens: { "alpha.size": { resolvesTo: "semantic.typography.caption", fallback: "14px" } },
    });
    const b = base({
      name: "Beta",
      tokens: { "beta.size": { resolvesTo: "semantic.typography.caption", fallback: "0.875rem" } },
    });
    expect(collectFallbackDivergenceAdvisories(corpus(["Alpha", a], ["Beta", b]))).toEqual([]);
  });

  it("lowercases hex before comparing so case drift does not false-fire", () => {
    const a = base({
      name: "Alpha",
      tokens: { "alpha.bg": { resolvesTo: "semantic.color.bg", fallback: "#D9292B" } },
    });
    const b = base({
      name: "Beta",
      tokens: { "beta.bg": { resolvesTo: "semantic.color.bg", fallback: "#d9292b" } },
    });
    expect(collectFallbackDivergenceAdvisories(corpus(["Alpha", a], ["Beta", b]))).toEqual([]);
  });

  it("returns no advisories when allContracts is absent", () => {
    expect(collectFallbackDivergenceAdvisories(undefined)).toEqual([]);
    expect(collectFallbackDivergenceAdvisories(new Map())).toEqual([]);
  });

  it("ignores slots without fallbacks (the [FALLBACK_MISSING] gate owns those)", () => {
    const a = base({
      name: "Alpha",
      tokens: { "alpha.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" } },
    });
    const b = base({
      name: "Beta",
      tokens: { "beta.bg": { resolvesTo: "semantic.color.bg" } }, // no fallback
    });
    // Only one fallback-bearing reading for semantic.color.bg → no divergence.
    expect(collectFallbackDivergenceAdvisories(corpus(["Alpha", a], ["Beta", b]))).toEqual([]);
  });
});
