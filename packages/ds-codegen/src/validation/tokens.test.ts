/**
 * Tests for the contract → token-graph drift validator.
 *
 * The validator's correctness gate has two halves:
 *   1. Walks resolvesTo paths in arbitrary contract.tokens shapes
 *      (top-level keys → nested groups → TokenResolution leaves), AND
 *      legacy flat-array TokenLeaf and nested TokenTree shapes interleaved.
 *   2. Reports JSON-pointer-correctly when a resolvesTo doesn't exist
 *      in the supplied known-paths set.
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
        root: {
          "test.color": {
            resolvesTo: "semantic.color.foreground.primary",
            fallback: "#000",
            property: "color",
          },
          "test.radius": {
            resolvesTo: "core.shape.radius.medium",
            fallback: "6px",
            property: "border-radius",
          },
        },
      },
    });
    expect(validateContractTokens(contract)).toEqual([]);
  });

  it("ignores legacy flat-array TokenLeaf entries (no resolvesTo)", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        root: ["test.legacy.one", "test.legacy.two"],
      },
    });
    // No resolvesTo to validate → no issues, even though knownPaths is empty.
    expect(validateContractTokens(contract)).toEqual([]);
  });

  it("ignores plain-string entries inside a TokenLeaf record (legacy shape)", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        root: {
          "test.legacy-string-entry": "test.legacy.path",
        },
      },
    });
    expect(validateContractTokens(contract)).toEqual([]);
  });
});

describe("validateContractTokens — drift detection", () => {
  afterEach(() => _resetKnownTokenPathsCacheForTests());

  it("flags a single missing resolvesTo with the correct JSON pointer", () => {
    _resetKnownTokenPathsCacheForTests(new Set(["semantic.color.background.primary"]));
    const contract = base({
      tokens: {
        root: {
          "test.color": {
            resolvesTo: "semantic.color.foreground.nonexistent",
            fallback: "#000",
            property: "color",
          },
        },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(1);
    expect(issueAt(issues, "/tokens/root/test.color/resolvesTo")).toBe(true);
    expect(issues[0].message).toContain("semantic.color.foreground.nonexistent");
  });

  it("flags multiple misses independently — no short-circuit", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        root: {
          "test.a": {
            resolvesTo: "semantic.missing.one",
            fallback: "x",
          },
          "test.b": {
            resolvesTo: "semantic.missing.two",
            fallback: "y",
          },
        },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(2);
    expect(issueAt(issues, "/tokens/root/test.a/resolvesTo")).toBe(true);
    expect(issueAt(issues, "/tokens/root/test.b/resolvesTo")).toBe(true);
  });

  it("walks into nested TokenTree groups", () => {
    _resetKnownTokenPathsCacheForTests(new Set(["semantic.foo"]));
    const contract = base({
      tokens: {
        root: {
          "test.nested": {
            // This is a nested object that ISN'T a TokenResolution — it lacks
            // resolvesTo, so the walker descends. Its child has a bad ref.
            "deep.key": {
              resolvesTo: "semantic.does.not.exist",
              fallback: "z",
            },
          },
        },
      } as unknown as ComponentContract["tokens"],
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(1);
    expect(
      issueAt(issues, "/tokens/root/test.nested/deep.key/resolvesTo"),
    ).toBe(true);
  });
});

describe("validateContractTokens — token graph not built", () => {
  afterEach(() => _resetKnownTokenPathsCacheForTests());

  it("returns one instructional issue when composed.tokens.json is missing", () => {
    _resetKnownTokenPathsCacheForTests("missing");
    const contract = base({
      tokens: {
        root: {
          "test.color": {
            resolvesTo: "semantic.color.foreground.primary",
            fallback: "#000",
          },
        },
      },
    });
    const issues = validateContractTokens(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/tokens");
    expect(issues[0].message).toContain("pnpm -F @full-stack-ds/tokens build");
  });
});
