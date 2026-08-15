/**
 * Tests for the component-derived WCAG contrast gate
 * (RAIL-COMPONENT-CONTRAST-01).
 *
 * Test strategy mirrors validation/tokens.test.ts: the resolved token
 * tree and the known-gaps ledger are injected through the test-only
 * cache resets so no test depends on gitignored build output or on the
 * committed ledger's current contents.
 */

import { afterEach, describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import {
  _resetKnownGapsCacheForTests,
  _resetResolvedTokensCacheForTests,
  contrastRatioHex,
  deriveComponentContrastPairs,
  validateComponentContrast,
} from "./component-contrast.js";

/** Synthetic resolved tree: good fg passes AA in both themes, bad fg fails in light. */
const TREE = {
  semantic: {
    color: {
      fg: {
        good: { $value: { light: "#141414", dark: "#fafafa" } },
        bad: { $value: { light: "#777777", dark: "#888888" } },
      },
      bg: {
        light: { $value: { light: "#ffffff", dark: "#000000" } },
        dark: { $value: { light: "#000000", dark: "#fafafa" } },
      },
    },
  },
};

function base(extra: Partial<ComponentContract>): ComponentContract {
  return {
    name: "Test",
    layer: "primitive",
    anatomy: { parts: ["root"] },
    props: { styled: { members: [] } },
    ...extra,
  } as ComponentContract;
}

function pairContract(
  styles: Record<string, unknown>,
  tokens: Record<string, unknown> = {
    "test.fg": { resolvesTo: "semantic.color.fg.good", fallback: "#141414" },
    "test.bg": { resolvesTo: "semantic.color.bg.light", fallback: "#ffffff" },
  },
): ComponentContract {
  return base({
    tokens,
    styles,
  } as Partial<ComponentContract>);
}

const ROOT_BLOCK = {
  color: { resolvesTo: "test.fg", fallback: "#141414" },
  "background-color": { resolvesTo: "test.bg", fallback: "#ffffff" },
};

afterEach(() => {
  _resetResolvedTokensCacheForTests();
  _resetKnownGapsCacheForTests();
});

describe("contrastRatioHex", () => {
  it("computes the WCAG ratio symmetrically", () => {
    const ratio = contrastRatioHex("#141414", "#ffffff");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeCloseTo(contrastRatioHex("#ffffff", "#141414")!, 10);
    expect(ratio!).toBeGreaterThan(17);
  });

  it("expands 3-digit hex", () => {
    expect(contrastRatioHex("#000", "#fff")).toBeCloseTo(21, 1);
  });

  it("returns null for non-hex input", () => {
    expect(contrastRatioHex("inherit", "#ffffff")).toBeNull();
  });
});

describe("deriveComponentContrastPairs", () => {
  it("derives a base-scope pair through the slot chain", () => {
    const pairs = deriveComponentContrastPairs(
      pairContract({ root: ROOT_BLOCK }),
    );
    expect(pairs).toHaveLength(1);
    expect(pairs[0].block).toBe("root");
    expect(pairs[0].scopes).toEqual(["(base)"]);
    expect(pairs[0].fg).toEqual({ kind: "global", path: "semantic.color.fg.good" });
    expect(pairs[0].bg).toEqual({ kind: "global", path: "semantic.color.bg.light" });
  });

  it("applies root variant slot redirections and merges scope provenance", () => {
    const pairs = deriveComponentContrastPairs(
      pairContract({
        root: ROOT_BLOCK,
        "--bad": {
          "test.fg": { resolvesTo: "semantic.color.fg.bad", fallback: "#777777" },
        },
      }),
    );
    expect(pairs).toHaveLength(2);
    const redirected = pairs.find(
      (p) => p.fg.kind === "global" && p.fg.path === "semantic.color.fg.bad",
    );
    expect(redirected).toBeDefined();
    expect(redirected!.scopes).toEqual(["--bad"]);
    expect(redirected!.bg).toEqual({ kind: "global", path: "semantic.color.bg.light" });
  });

  it("keeps part scopes out of sibling parts (no phantom cross-part pairs)", () => {
    const contract = base({
      anatomy: { parts: ["backdrop", "modal"] },
      tokens: {
        "test.fg": { resolvesTo: "semantic.color.fg.good", fallback: "#141414" },
        "test.bg": { resolvesTo: "semantic.color.bg.light", fallback: "#ffffff" },
      },
      styles: {
        modal: { ...ROOT_BLOCK },
        backdrop: { ...ROOT_BLOCK },
        ".test__backdrop": {
          "test.bg": { resolvesTo: "semantic.color.bg.dark", fallback: "#000000" },
        },
      },
    } as Partial<ComponentContract>);
    const pairs = deriveComponentContrastPairs(contract);

    const modalPairs = pairs.find((p) => p.block === "modal");
    expect(modalPairs).toBeDefined();
    expect(modalPairs!.bg).toEqual({ kind: "global", path: "semantic.color.bg.light" });

    const backdropPairs = pairs.filter((p) => p.block === "backdrop");
    expect(backdropPairs).toHaveLength(2);
    const redirected = backdropPairs.find((p) => p.scopes.includes(".test__backdrop"));
    expect(redirected).toBeDefined();
    expect(redirected!.bg).toEqual({ kind: "global", path: "semantic.color.bg.dark" });
  });

  it("exempts disabled blocks and disabled scopes (WCAG 1.4.3 Note 5)", () => {
    const pairs = deriveComponentContrastPairs(
      pairContract({
        root: ROOT_BLOCK,
        disabled: {
          color: { resolvesTo: "test.fg", fallback: "#141414" },
          "background-color": { resolvesTo: "test.bg", fallback: "#ffffff" },
        },
        ".test--disabled .test__root": {
          color: { resolvesTo: "test.fg", fallback: "#141414" },
          "background-color": { resolvesTo: "test.bg", fallback: "#ffffff" },
        },
      }),
    );
    expect(pairs.map((p) => p.block)).toEqual(["root"]);
  });

  it("pairs literal hex declarations and skips non-color literals", () => {
    const pairs = deriveComponentContrastPairs(
      pairContract({
        root: {
          color: { literal: "#123456", platforms: ["web"] },
          "background-color": { literal: "#ffffff", platforms: ["web"] },
        },
        inheritBlock: {
          color: { literal: "inherit", platforms: ["web"] },
          "background-color": { literal: "#ffffff", platforms: ["web"] },
        },
      }, {}),
    );
    expect(pairs).toHaveLength(1);
    expect(pairs[0].fg).toEqual({ kind: "hex", hex: "#123456" });
  });

  it("returns no pairs for a contract without styles", () => {
    expect(deriveComponentContrastPairs(base({}))).toEqual([]);
  });
});

describe("validateComponentContrast", () => {
  it("passes a contract whose derived pairs meet AA in both themes", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests([]);
    expect(validateComponentContrast(pairContract({ root: ROOT_BLOCK }))).toEqual([]);
  });

  it("flags a failing pair with theme, ratio, and terminal provenance", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests([]);
    const contract = pairContract({
      root: ROOT_BLOCK,
      "--bad": {
        "test.fg": { resolvesTo: "semantic.color.fg.bad", fallback: "#777777" },
      },
    });
    const issues = validateComponentContrast(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/styles/root");
    expect(issues[0].message).toContain("light theme");
    expect(issues[0].message).toContain("semantic.color.fg.bad");
    expect(issues[0].message).toContain("4.5");
  });

  it("suppresses ledgered failures", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests([
      {
        component: "Test",
        fg: "semantic.color.fg.bad",
        bg: "semantic.color.bg.light",
        note: "pre-existing debt",
      },
    ]);
    const contract = pairContract({
      root: ROOT_BLOCK,
      "--bad": {
        "test.fg": { resolvesTo: "semantic.color.fg.bad", fallback: "#777777" },
      },
    });
    expect(validateComponentContrast(contract)).toEqual([]);
  });

  it("flags a ledger entry that no longer reproduces (ratchet only shrinks)", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests([
      {
        component: "Test",
        fg: "semantic.color.fg.good",
        bg: "semantic.color.bg.light",
        note: "was debt, now fixed",
      },
    ]);
    const issues = validateComponentContrast(pairContract({ root: ROOT_BLOCK }));
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("no longer reproduces");
    expect(issues[0].message).toContain("component-contrast-known-gaps.json");
  });

  it("does not evaluate other components' ledger entries", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests([
      { component: "Other", fg: "semantic.color.fg.good", bg: "semantic.color.bg.light" },
    ]);
    expect(validateComponentContrast(pairContract({ root: ROOT_BLOCK }))).toEqual([]);
  });

  it("emits one instructional issue when the resolved graph is missing", () => {
    _resetResolvedTokensCacheForTests("missing");
    _resetKnownGapsCacheForTests([]);
    const issues = validateComponentContrast(pairContract({ root: ROOT_BLOCK }));
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/styles");
    expect(issues[0].message).toContain("pnpm -F @full-stack-ds/tokens build");
  });

  it("refuses to run when the ledger file is missing", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests("missing");
    const issues = validateComponentContrast(pairContract({ root: ROOT_BLOCK }));
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("component-contrast-known-gaps.json");
  });

  it("skips contracts without styles", () => {
    _resetResolvedTokensCacheForTests(TREE);
    _resetKnownGapsCacheForTests([]);
    expect(validateComponentContrast(base({}))).toEqual([]);
  });

  it("skips pairs whose terminal is transparent (alpha hex is unmeasurable)", () => {
    // FIX-CONTRAST-DEBT-01: the resolver now preserves alpha, so a
    // genuinely transparent background resolves to an 8-digit hex the
    // WCAG math cannot consume. Contrast against transparent is defined
    // by whatever sits beneath — the pair must be skipped, not failed
    // (the pre-alpha-fix phantom that ledgered Walkthrough's prev pair).
    _resetResolvedTokensCacheForTests({
      semantic: {
        color: {
          fg: { good: { $value: { light: "#141414", dark: "#fafafa" } } },
          bg: { clear: { $value: { light: "#00000000", dark: "#00000000" } } },
        },
      },
    });
    _resetKnownGapsCacheForTests([]);
    const contract = base({
      tokens: {
        "test.fg": { resolvesTo: "semantic.color.fg.good", fallback: "#141414" },
        "test.bg": { resolvesTo: "semantic.color.bg.clear", fallback: "#00000000" },
      },
      styles: { root: ROOT_BLOCK },
    } as Partial<ComponentContract>);
    expect(validateComponentContrast(contract)).toEqual([]);
  });
});
