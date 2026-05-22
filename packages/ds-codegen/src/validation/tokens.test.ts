/**
 * Tests for the contract → token-graph drift validator.
 *
 * After the tokens/styles convergence (PLAN-TOKENS-STYLES-CONVERGENCE-001),
 * `contract.tokens` is a flat slot pool: each top-level key is a slot name,
 * each value is a `TokenResolution`. The validator's job:
 *   1. For every entry that has a `resolvesTo`, confirm the dotted path
 *      exists in the composed token graph.
 *   2. Ignore `literal`-only entries (intentional hardcodes).
 *   3. Report missing paths with JSON pointers tied to the slot name.
 *
 * Test strategy: inject a synthetic knownPaths via the test-only escape
 * hatch (`_resetKnownTokenPathsCacheForTests`) so tests don't depend on
 * the live packages/ds-tokens/generated/composed.tokens.json (which is
 * gitignored and may not exist in fresh clones).
 */

import { afterEach, describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import {
  _resetKnownTokenPathsCacheForTests,
  validateContractTokens,
} from "./tokens.js";

function issueAt(
  issues: { pointer: string }[],
  pointer: string,
): boolean {
  return issues.some((i) => i.pointer === pointer);
}

function base(extra: Partial<ComponentContract>): ComponentContract {
  return {
    name: "Test",
    layer: "primitive",
    anatomy: { parts: ["root"] },
    props: { styled: { members: [] } },
    ...extra,
  } as ComponentContract;
}

describe("validateContractTokens — happy paths", () => {
  afterEach(() => _resetKnownTokenPathsCacheForTests());

  it("returns no issues when contract has no tokens field", () => {
    _resetKnownTokenPathsCacheForTests(new Set(["semantic.color.foreground.primary"]));
    const contract = base({});
    expect(validateContractTokens(contract)).toEqual([]);
  });

  it("returns no issues when every resolvesTo exists in the graph", () => {
    _resetKnownTokenPathsCacheForTests(
      new Set([
        "semantic.color.foreground.primary",
        "core.shape.radius.medium",
      ]),
    );
    const contract = base({
      tokens: {
        "test.color": {
          resolvesTo: "semantic.color.foreground.primary",
          fallback: "#000",
        },
        "test.radius": {
          resolvesTo: "core.shape.radius.medium",
          fallback: "6px",
        },
      },
    });
    expect(validateContractTokens(contract)).toEqual([]);
  });

  it("ignores `literal`-only entries (no resolvesTo to validate)", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        "test.hardcode": { literal: "0px" },
      },
    });
    expect(validateContractTokens(contract)).toEqual([]);
  });
});

describe("validateContractTokens — drift detection", () => {
  afterEach(() => _resetKnownTokenPathsCacheForTests());

  it("flags a single missing resolvesTo with a slot-keyed JSON pointer", () => {
    _resetKnownTokenPathsCacheForTests(new Set(["semantic.color.background.primary"]));
    const contract = base({
      tokens: {
        "test.color": {
          resolvesTo: "semantic.color.foreground.nonexistent",
          fallback: "#000",
        },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(1);
    expect(issueAt(issues, "/tokens/test.color/resolvesTo")).toBe(true);
    expect(issues[0].message).toContain("semantic.color.foreground.nonexistent");
  });

  it("flags multiple misses independently — no short-circuit", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        "test.a": { resolvesTo: "semantic.missing.one", fallback: "x" },
        "test.b": { resolvesTo: "semantic.missing.two", fallback: "y" },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(2);
    expect(issueAt(issues, "/tokens/test.a/resolvesTo")).toBe(true);
    expect(issueAt(issues, "/tokens/test.b/resolvesTo")).toBe(true);
  });

  it("mixes hits and misses; only the miss flags", () => {
    _resetKnownTokenPathsCacheForTests(new Set(["semantic.color.foreground.primary"]));
    const contract = base({
      tokens: {
        "test.good": {
          resolvesTo: "semantic.color.foreground.primary",
          fallback: "#000",
        },
        "test.bad": {
          resolvesTo: "semantic.does.not.exist",
          fallback: "#fff",
        },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(1);
    expect(issueAt(issues, "/tokens/test.bad/resolvesTo")).toBe(true);
  });
});

describe("validateContractTokens — token graph not built", () => {
  afterEach(() => _resetKnownTokenPathsCacheForTests());

  it("returns one instructional issue when composed.tokens.json is missing", () => {
    _resetKnownTokenPathsCacheForTests("missing");
    const contract = base({
      tokens: {
        "test.color": {
          resolvesTo: "semantic.color.foreground.primary",
          fallback: "#000",
        },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/tokens");
    expect(issues[0].message).toContain("pnpm -F @full-stack-ds/tokens build");
  });
});
