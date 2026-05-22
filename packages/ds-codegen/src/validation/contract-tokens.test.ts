/**
 * Tests for the contract → emitted-CSS drift validator.
 *
 * The validator's correctness gate has three halves:
 *   1. Skips contracts with no structured TokenResolution entries (no-op).
 *   2. Catches missing-file, per-framework drift, and cross-framework drift.
 *   3. Returns no issues when on-disk artifacts match what the codegen
 *      would emit right now.
 *
 * These tests operate purely on contract shapes; the validator reads
 * from the repo's actual emitted CSS, so a live integration test of
 * "no drift after regen" lives in the project's regen workflow rather
 * than this unit suite (the per-test temp-dir setup needed for that
 * wouldn't add real coverage over the regen-and-check cycle that already
 * runs as `pnpm run generate:check`).
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

  it("returns no issues when contract has tokens but none are structured", () => {
    const contract = base({
      tokens: {
        root: ["test.legacy.one", "test.legacy.two"],
      },
    });
    expect(validateContractEmittedCss(contract)).toEqual([]);
  });

  it("returns no issues for a tokens block that contains only plain strings (mixed legacy)", () => {
    const contract = base({
      tokens: {
        root: {
          "test.legacy-string": "test.legacy.path",
        },
      },
    });
    // No structured entry → no validation needed.
    expect(validateContractEmittedCss(contract)).toEqual([]);
  });
});

describe("validateContractEmittedCss — detects structured tokens", () => {
  it("triggers validation when a contract has a structured TokenResolution", () => {
    // This contract uses a synthetic name `__nonexistent_validator_test__`
    // so the .tokens.css file won't exist on disk for any framework — we
    // expect per-framework "missing" errors (5 of them, one per framework).
    const contract = base({
      name: "__NonexistentValidatorTest__",
      cssPrefix: "test",
      tokens: {
        root: {
          "test.color": {
            resolvesTo: "semantic.color.foreground.primary",
            fallback: "#000",
            property: "color",
            layer: "semantic",
          },
        },
      },
    });
    const issues = validateContractEmittedCss(contract);
    // 5 frameworks × 1 missing file each = at least 5 issues.
    expect(issues.length).toBeGreaterThanOrEqual(5);
    // All issues should reference the non-existent file by name.
    for (const issue of issues) {
      expect(issue.pointer).toBe("/tokens");
      expect(issue.message).toContain("__NonexistentValidatorTest__.tokens.css");
    }
  });

  it("detects structured entries nested inside a state group", () => {
    const contract = base({
      name: "__NonexistentValidatorTest2__",
      cssPrefix: "test",
      tokens: {
        // root has no structured entries...
        root: {},
        // ...but `hover` does — validator should still notice.
        hover: {
          "test.color.fg": {
            resolvesTo: "semantic.color.fg",
            fallback: "red",
            property: "color",
            layer: "semantic",
          },
        },
      },
    });
    const issues = validateContractEmittedCss(contract);
    expect(issues.length).toBeGreaterThanOrEqual(5);
  });
});
