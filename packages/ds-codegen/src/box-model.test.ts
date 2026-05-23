/**
 * Box-model primitive coverage.
 *
 * Proves the four invariants the box-model surface depends on:
 *   1. Defaults flow through to every component's emitted `.tokens.css`.
 *   2. Component-authored `box-model.*` keys override the primitive defaults.
 *   3. Schema rejects typos, unknown slot names, and out-of-vocabulary literals.
 *   4. Portal-enabled components keep box-model slots on `.<cssPrefix>`
 *      while hoisting component slots to `:root`.
 *
 * Tests assert against the actual emitted CSS string — not against an
 * intermediate IR shape — so a regression in the emitter or the merge
 * order surfaces here as a textual mismatch.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildComponentIR } from "./ir.js";
import { emitTokensCss } from "./css.js";
import {
  _resetBoxModelCache,
  isBoxModelKey,
  loadBoxModelPrimitive,
  mergeBoxModelDefaults,
  partitionBoxModelTokens,
} from "./box-model.js";
import { createContractValidator } from "./validate.js";
import type { ComponentContract, TokenResolution } from "./contract.js";

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");
const validator = createContractValidator({ contractsRoot: CONTRACTS_ROOT });

const EXPECTED_SLOTS = [
  "box-model.padding",
  "box-model.padding-block",
  "box-model.padding-block-start",
  "box-model.padding-block-end",
  "box-model.padding-inline",
  "box-model.padding-inline-start",
  "box-model.padding-inline-end",
  "box-model.gap",
  "box-model.width",
  "box-model.min-width",
  "box-model.max-width",
  "box-model.height",
  "box-model.min-height",
  "box-model.max-height",
];

function loadButtonContract(): ComponentContract {
  const raw = JSON.parse(
    readFileSync(
      resolve(CONTRACTS_ROOT, "components/Button/Button.contract.json"),
      "utf-8",
    ),
  );
  const result = validator.validateComponent(raw);
  if (!result.ok) {
    throw new Error("Button contract failed validation in test setup");
  }
  return result.value;
}

describe("loadBoxModelPrimitive", () => {
  it("loads all 14 slot names from the schema", () => {
    _resetBoxModelCache();
    const { slotNames } = loadBoxModelPrimitive();
    expect([...slotNames].sort()).toEqual([...EXPECTED_SLOTS].sort());
  });

  it("loads canonical defaults for every slot", () => {
    _resetBoxModelCache();
    const { defaults } = loadBoxModelPrimitive();
    for (const slot of EXPECTED_SLOTS) {
      expect(defaults[slot]).toBeDefined();
      // Defaults are all literals — the primitive isn't pinned to any
      // global token; consumers override per component if they want one.
      expect((defaults[slot] as TokenResolution).literal).toBeTypeOf("string");
    }
    expect((defaults["box-model.padding"] as TokenResolution).literal).toBe("0");
    expect((defaults["box-model.width"] as TokenResolution).literal).toBe("auto");
    expect((defaults["box-model.max-width"] as TokenResolution).literal).toBe(
      "none",
    );
  });
});

describe("isBoxModelKey", () => {
  it("identifies box-model.* keys", () => {
    expect(isBoxModelKey("box-model.padding")).toBe(true);
    expect(isBoxModelKey("box-model.padding-inline-start")).toBe(true);
    expect(isBoxModelKey("button.color.bg")).toBe(false);
    expect(isBoxModelKey("boxmodel.padding")).toBe(false);
  });
});

describe("partitionBoxModelTokens", () => {
  it("splits a sidecar into box-model and component partitions", () => {
    const sidecar: Record<string, TokenResolution> = {
      "box-model.padding-inline-start": { literal: "8px" },
      "button.color.background.default": {
        resolvesTo: "semantic.color.action.background.primary.default",
        fallback: "#d9292b",
      },
    };
    const { boxModel, component } = partitionBoxModelTokens(sidecar);
    expect(Object.keys(boxModel)).toEqual(["box-model.padding-inline-start"]);
    expect(Object.keys(component)).toEqual(["button.color.background.default"]);
  });
});

describe("mergeBoxModelDefaults", () => {
  it("returns the full default pool when no sidecar is provided", () => {
    _resetBoxModelCache();
    const merged = mergeBoxModelDefaults(undefined);
    for (const slot of EXPECTED_SLOTS) {
      expect(merged[slot]).toBeDefined();
    }
    expect((merged["box-model.gap"] as TokenResolution).literal).toBe("0");
  });

  it("lets author-supplied box-model.* keys win over defaults", () => {
    const authored: Record<string, TokenResolution> = {
      "box-model.padding-inline-start": {
        resolvesTo: "core.spacing.size.05",
        fallback: "12px",
      },
    };
    const merged = mergeBoxModelDefaults(authored);
    expect(merged["box-model.padding-inline-start"]).toEqual({
      resolvesTo: "core.spacing.size.05",
      fallback: "12px",
    });
    // Other slots still get their defaults.
    expect((merged["box-model.padding-block-start"] as TokenResolution).literal).toBe(
      "0",
    );
  });

  it("preserves non-box-model keys untouched", () => {
    const authored: Record<string, TokenResolution> = {
      "button.color.background.default": { literal: "#fff" },
    };
    const merged = mergeBoxModelDefaults(authored);
    expect(merged["button.color.background.default"]).toEqual({ literal: "#fff" });
    expect(merged["box-model.padding"]).toBeDefined();
  });
});

describe("emitTokensCss with box-model defaults", () => {
  it("emits all 14 box-model slots on a button.tokens.css", () => {
    const contract = loadButtonContract();
    const withTokens = {
      ...contract,
      tokens: mergeBoxModelDefaults(contract.tokens),
    };
    const ir = buildComponentIR(withTokens);
    const out = emitTokensCss(ir);
    for (const slot of EXPECTED_SLOTS) {
      const cssVar = `--fsds-${slot.replace(/\./g, "-")}`;
      expect(out, `expected ${cssVar} in emitted CSS`).toContain(cssVar);
    }
    expect(out).toContain("--fsds-box-model-padding: 0;");
    expect(out).toContain("--fsds-box-model-width: auto;");
    expect(out).toContain("--fsds-box-model-max-width: none;");
  });

  it("author override emits as var(--graph, fallback) instead of literal", () => {
    const contract = loadButtonContract();
    const authored: Record<string, TokenResolution> = {
      "box-model.padding-inline-start": {
        resolvesTo: "core.spacing.size.05",
        fallback: "12px",
      },
    };
    const withTokens = {
      ...contract,
      tokens: mergeBoxModelDefaults(authored),
    };
    const ir = buildComponentIR(withTokens);
    const out = emitTokensCss(ir);
    expect(out).toContain(
      "--fsds-box-model-padding-inline-start: var(--fsds-core-spacing-size-05, 12px);",
    );
    // Other defaults still literal.
    expect(out).toContain("--fsds-box-model-padding-inline-end: 0;");
  });
});

describe("portal-aware emission", () => {
  function makePortalContract(): ComponentContract {
    // Minimal synthetic contract with a portal-enabled surface so we
    // don't pull in the Dialog contract here.
    const base = loadButtonContract();
    return {
      ...base,
      name: "PortalProbe",
      portal: { enabled: true } as never,
    };
  }

  it("hoists component slots to :root but keeps box-model on .<cssPrefix>", () => {
    const contract = makePortalContract();
    const authored: Record<string, TokenResolution> = {
      "portalprobe.color.bg": {
        resolvesTo: "semantic.color.background.primary",
        fallback: "#fff",
      },
    };
    const withTokens = {
      ...contract,
      tokens: mergeBoxModelDefaults(authored),
    };
    const ir = buildComponentIR(withTokens);
    // Force portal on the IR (the contract field above is the
    // input-shape escape; this asserts the emitter behavior).
    const portalIr = {
      ...ir,
      behavior: { ...ir.behavior, portal: { enabled: true, fallback: false } },
    };
    const out = emitTokensCss(portalIr);
    // Component slot hoisted to :root.
    // (cssPrefix kebab-cases the component name: PortalProbe → portal-probe.)
    // `[^}]*` so the regex can't escape the block via the closing brace.
    expect(out).toMatch(/:root\s*\{[^}]*--fsds-portalprobe-color-bg/);
    // Box-model slot still on the cssPrefix selector (not on :root).
    expect(out).toMatch(
      /\.portal-probe\s*\{[^}]*--fsds-box-model-padding-block-start: 0;/,
    );
    expect(out).not.toMatch(/:root\s*\{[^}]*--fsds-box-model-/);
  });
});

describe("schema strictness", () => {
  it("rejects an unknown box-model slot name (typo)", () => {
    const result = validator.validateBoxModelTokens({
      "box-model.padding-inlne-start": { literal: "12px" },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const msgs = result.issues.map((i) => `${i.pointer}: ${i.message}`).join("\n");
      expect(msgs).toMatch(/additional|not allowed/i);
    }
  });

  it("rejects a literal that isn't in the box-model vocabulary", () => {
    const result = validator.validateBoxModelTokens({
      "box-model.padding": { literal: "Bananas" },
    });
    expect(result.ok).toBe(false);
  });

  it("rejects a fallback that isn't in the box-model vocabulary", () => {
    const result = validator.validateBoxModelTokens({
      "box-model.padding": {
        resolvesTo: "core.spacing.size.04",
        fallback: "Bananas",
      },
    });
    expect(result.ok).toBe(false);
  });

  it("accepts a valid token-backed slot", () => {
    const result = validator.validateBoxModelTokens({
      "box-model.padding-inline-start": {
        resolvesTo: "core.spacing.size.05",
        fallback: "12px",
      },
    });
    expect(result.ok).toBe(true);
  });

  it("accepts each canonical literal default (0, auto, none)", () => {
    const result = validator.validateBoxModelTokens({
      "box-model.padding": { literal: "0" },
      "box-model.width": { literal: "auto" },
      "box-model.max-width": { literal: "none" },
    });
    expect(result.ok).toBe(true);
  });
});
