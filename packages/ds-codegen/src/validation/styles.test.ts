/**
 * Tests for the contract.styles drift validator
 * (PLAN-TOKENS-STYLES-CONVERGENCE-001).
 *
 * Two invariants exercised:
 *   1. Namespace rule on resolvesTo: cssPrefix-prefixed paths must match
 *      a slot in tokens.json; other paths must exist in the global graph.
 *   2. Selector-aliasing collisions: two keys that expand to the same CSS
 *      selector are an authoring bug.
 */

import { afterEach, describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { _resetKnownTokenPathsCacheForTests } from "./tokens.js";
import {
  validateContractStyles,
  validateStylesSelectorCollisions,
} from "./styles.js";

function issueAt(
  issues: { pointer: string }[],
  pointer: string,
): boolean {
  return issues.some((i) => i.pointer === pointer);
}

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

describe("validateContractStyles — namespace rule", () => {
  afterEach(() => _resetKnownTokenPathsCacheForTests());

  it("returns no issues when contract has no styles field", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    expect(validateContractStyles(base({}))).toEqual([]);
  });

  it("passes when a component-local resolvesTo matches a declared slot", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        "test.color.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" },
      },
      styles: {
        root: {
          "background-color": { resolvesTo: "test.color.bg" },
        },
      },
    });
    expect(validateContractStyles(contract)).toEqual([]);
  });

  it("flags a component-local resolvesTo with no matching slot", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        "test.color.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" },
      },
      styles: {
        root: {
          "background-color": { resolvesTo: "test.color.foreground" },
        },
      },
    });
    const issues = validateContractStyles(contract);
    expect(issues).toHaveLength(1);
    expect(
      issueAt(issues, "/styles/root/background-color/resolvesTo"),
    ).toBe(true);
    expect(issues[0].message).toContain('slot "test.color.foreground"');
    expect(issues[0].message).toContain("not declared");
  });

  it("passes when a global-graph resolvesTo exists in the composed graph", () => {
    _resetKnownTokenPathsCacheForTests(
      new Set(["semantic.color.background.primary"]),
    );
    const contract = base({
      styles: {
        root: {
          "background-color": {
            resolvesTo: "semantic.color.background.primary",
          },
        },
      },
    });
    expect(validateContractStyles(contract)).toEqual([]);
  });

  it("flags a global-graph resolvesTo missing from the composed graph", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      styles: {
        root: {
          color: { resolvesTo: "semantic.color.does.not.exist" },
        },
      },
    });
    const issues = validateContractStyles(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("not defined in the token graph");
  });

  it("ignores `literal` styleEntries (nothing to resolve)", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      styles: {
        root: {
          display: { literal: "inline-flex", platforms: ["web"] },
        },
      },
    });
    expect(validateContractStyles(contract)).toEqual([]);
  });

  it("returns an instructional issue when token graph is missing and a global ref is used", () => {
    _resetKnownTokenPathsCacheForTests("missing");
    const contract = base({
      styles: {
        root: {
          color: { resolvesTo: "semantic.color.text" },
        },
      },
    });
    const issues = validateContractStyles(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("token graph not built");
  });

  it("uses the contract's cssPrefix (not its name) for the namespace rule", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      name: "MyComponent",
      cssPrefix: "mycomp",
      tokens: {
        "mycomp.color.bg": { resolvesTo: "semantic.bg", fallback: "#fff" },
      },
      styles: {
        root: {
          "background-color": { resolvesTo: "mycomp.color.bg" },
        },
      },
    });
    expect(validateContractStyles(contract)).toEqual([]);
  });

  // ---- slot-path property keys (variant / state redirection) ----
  it("passes when a slot-path property key names a declared component-local slot", () => {
    _resetKnownTokenPathsCacheForTests(
      new Set(["semantic.color.action.background.primary.default"]),
    );
    const contract = base({
      tokens: {
        "test.color.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" },
      },
      styles: {
        "--primary": {
          "test.color.bg": {
            resolvesTo: "semantic.color.action.background.primary.default",
          },
        },
      },
    });
    expect(validateContractStyles(contract)).toEqual([]);
  });

  it("flags a slot-path property key naming an undeclared component-local slot (typo gate)", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      tokens: {
        "test.color.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" },
      },
      styles: {
        "--primary": {
          "test.color.bgg": { resolvesTo: "semantic.color.bg" },
        },
      },
    });
    const issues = validateContractStyles(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("redefines slot");
    expect(issues[0].message).toContain("not declared");
  });

  it("passes when a slot-path property key names a box-model slot", () => {
    _resetKnownTokenPathsCacheForTests(
      new Set(["semantic.action.size.small.padding-block"]),
    );
    const contract = base({
      styles: {
        "--small": {
          "box-model.padding-block-start": {
            resolvesTo: "semantic.action.size.small.padding-block",
          },
        },
      },
    });
    expect(validateContractStyles(contract)).toEqual([]);
  });

  it("flags a slot-path property key with an unknown box-model slot name", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      styles: {
        "--small": {
          "box-model.padding-bloc-start": {
            resolvesTo: "semantic.action.size.small.padding-block",
          },
        },
      },
    });
    const issues = validateContractStyles(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("redefines box-model slot");
  });

  it("flags a slot-path property key with a foreign namespace", () => {
    _resetKnownTokenPathsCacheForTests(new Set());
    const contract = base({
      styles: {
        "--primary": {
          "other.color.bg": { resolvesTo: "semantic.color.bg" },
        },
      },
    });
    const issues = validateContractStyles(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("does not match the component's");
  });
});

describe("validateStylesSelectorCollisions", () => {
  it("returns no issues when every key expands to a unique selector", () => {
    const contract = base({
      anatomy: { parts: ["root", "track"] },
      styles: {
        root: { color: { literal: "red", platforms: ["web"] } },
        track: { color: { literal: "blue", platforms: ["web"] } },
        hover: { color: { literal: "green", platforms: ["web"] } },
      },
    });
    expect(validateStylesSelectorCollisions(contract)).toEqual([]);
  });

  it("flags two keys that resolve to the same selector", () => {
    // "hover" expands to ".test:hover" via DERIVABLE_STATE_TO_PSEUDO;
    // ":hover" also expands to ".test:hover" via the verbatim-pseudo
    // branch. Authoring both is a bug.
    const contract = base({
      styles: {
        hover: { color: { literal: "red", platforms: ["web"] } },
        ":hover": { color: { literal: "blue", platforms: ["web"] } },
      },
    });
    const issues = validateStylesSelectorCollisions(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/styles/:hover");
    expect(issues[0].message).toContain('selector ".test:hover"');
    expect(issues[0].message).toContain('also produced by key "hover"');
  });

  it("does not flag a single key (no prior to collide with)", () => {
    const contract = base({
      styles: {
        ":hover": { color: { literal: "red", platforms: ["web"] } },
      },
    });
    expect(validateStylesSelectorCollisions(contract)).toEqual([]);
  });
});
