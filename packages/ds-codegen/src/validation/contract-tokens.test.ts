/**
 * Tests for the contract → emitted-CSS drift validator.
 *
 * After the tokens/styles convergence (PLAN-TOKENS-STYLES-CONVERGENCE-001),
 * `contract.tokens` is a flat slot pool; entries with `resolvesTo` are the
 * trigger for validation against the per-framework `<Component>.tokens.css`
 * on disk. `literal`-only contracts and contracts with no tokens are no-ops.
 *
 * These tests operate purely on contract shapes; the validator reads the
 * repo's actual emitted CSS, so a live integration test of "no drift after
 * regen" lives in the regen workflow rather than this unit suite.
 */

import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { validateContractEmittedCss } from "./contract-tokens.js";

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

describe("validateContractEmittedCss — happy paths", () => {
  it("returns no issues when contract has no tokens field", () => {
    const contract = base({});
    expect(validateContractEmittedCss(contract)).toEqual([]);
  });

  it("returns no issues when every entry is a literal hardcode", () => {
    const contract = base({
      tokens: {
        "test.hardcode": { literal: "0px" },
      },
    });
    expect(validateContractEmittedCss(contract)).toEqual([]);
  });
});

describe("validateContractEmittedCss — detects slot resolutions", () => {
  it("triggers validation when a contract has a resolvesTo slot", () => {
    // This contract uses a synthetic name `__NonexistentValidatorTest__`
    // so the .tokens.css file won't exist on disk for any framework — we
    // expect per-framework "missing" errors (5 of them, one per framework).
    const contract = base({
      name: "__NonexistentValidatorTest__",
      cssPrefix: "test",
      tokens: {
        "test.color": {
          resolvesTo: "semantic.color.foreground.primary",
          fallback: "#000",
          layer: "semantic",
        },
      },
    });
    const issues = validateContractEmittedCss(contract);
    // 5 frameworks × 1 missing file each = at least 5 issues.
    expect(issues.length).toBeGreaterThanOrEqual(5);
    for (const issue of issues) {
      expect(issue.pointer).toBe("/tokens");
      expect(issue.message).toContain("__NonexistentValidatorTest__.tokens.css");
    }
  });

  it("triggers validation when at least one slot in a mixed slot pool has resolvesTo", () => {
    const contract = base({
      name: "__NonexistentValidatorTest2__",
      cssPrefix: "test",
      tokens: {
        "test.fixed": { literal: "0px" },
        "test.color.fg": {
          resolvesTo: "semantic.color.fg",
          fallback: "red",
          layer: "semantic",
        },
      },
    });
    const issues = validateContractEmittedCss(contract);
    expect(issues.length).toBeGreaterThanOrEqual(5);
  });
});
