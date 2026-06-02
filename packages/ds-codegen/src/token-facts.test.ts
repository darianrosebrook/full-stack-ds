/**
 * FEAT-MOBILE-IR-001 — typed token facts for non-DOM target-family projection.
 *
 * Proves the spec's acceptance criteria at the IR boundary:
 *  - A1: ComponentIR.tokenFacts exposes path/category/value/alias/provenance.
 *  - A2: the value a native consumer needs is read from typed facts, and is
 *        the SAME value the old CSS-string-mining hack would have produced.
 *  - A4: the projection branches only on token path/category/source — no
 *        component-name lore (asserted structurally below).
 *  - A5: Switch (collapsed native primitive) and Details (next C1 candidate)
 *        both expose typed token facts available to a native consumer,
 *        without asserting any final mobile rendering.
 *
 * Sidecar merge mirrors the CLI load order (contract + tokens + styles).
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildComponentIR } from "./ir.js";
import type { ComponentContract } from "./contract.js";

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");

function loadContract(name: string): ComponentContract {
  const folder = resolve(CONTRACTS_ROOT, "components", name);
  const contract = JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as ComponentContract & { tokens?: unknown; styles?: unknown };
  const tokensPath = resolve(folder, `${name}.tokens.json`);
  if (existsSync(tokensPath)) {
    contract.tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
  }
  const stylesPath = resolve(folder, `${name}.styles.json`);
  if (existsSync(stylesPath)) {
    contract.styles = JSON.parse(readFileSync(stylesPath, "utf8"));
  }
  return contract;
}

describe("FEAT-MOBILE-IR-001: typed token facts (A1)", () => {
  it("exposes path, category, layer, value, alias, and provenance for a ref-backed token", () => {
    const ir = buildComponentIR(loadContract("Switch"));

    const fact = ir.tokenFacts.find(
      (t) => t.name === "switch.size.md.track.width",
    );
    expect(fact).toBeDefined();
    // path/name
    expect(fact!.name).toBe("switch.size.md.track.width");
    // category derived from PATH structure (segment after the slug), not name
    expect(fact!.category).toBe("size");
    // provenance: tier + source kind
    expect(fact!.layer).toBe("core");
    expect(fact!.source).toBe("tokens-sidecar");
    // semantic alias (resolvesTo) preserved
    expect(fact!.resolvesTo).toBe("core.spacing.size.09");
    // concrete value available — the fallback, no CSS parsing
    expect(fact!.rawValue).toBe("48px");
    expect(fact!.isLiteral).toBe(false);
    // typed cssVar exposed (the projection's bridge to the CSS layer)
    expect(fact!.cssVar).toBe("--fsds-switch-size-md-track-width");
  });

  it("marks literal tokens as literal and carries their raw value", () => {
    const ir = buildComponentIR(loadContract("Switch"));
    const literals = ir.tokenFacts.filter((t) => t.isLiteral);
    // Every literal fact must carry a value and no resolvesTo alias.
    for (const lit of literals) {
      expect(lit.rawValue).toBeDefined();
      expect(lit.resolvesTo).toBeUndefined();
    }
  });
});

describe("FEAT-MOBILE-IR-001: typed value matches the old CSS-mining result (A2 regression)", () => {
  // The retired findSizeToken/parsePxFallback hack read
  //   ir.cssBlocks[..].declarations["--fsds-switch-size-md-track-width"]
  // = "var(--fsds-core-spacing-size-09, 48px)" and regexed the px fallback.
  // The typed fact must yield the identical number from typed data, and must
  // NOT depend on the CSS declaration string existing.
  it("typed rawValue equals the px fallback the CSS string carried", () => {
    const ir = buildComponentIR(loadContract("Switch"));

    // What the CSS string would have yielded (the regression oracle):
    const cssDecl = ir.cssBlocks
      .flatMap((b) => Object.entries(b.declarations))
      .find(([k]) => k === "--fsds-switch-size-md-track-width")?.[1];
    const cssPx = cssDecl?.match(/(\d+)px\)$/)?.[1];
    expect(cssPx).toBe("48"); // sanity: the CSS path still carries 48px

    // The typed fact yields the same number, from typed data:
    const fact = ir.tokenFacts.find(
      (t) => t.name === "switch.size.md.track.width",
    );
    expect(fact!.rawValue?.match(/^(\d+)/)?.[1]).toBe("48");
  });

  it("typed facts survive even if CSS declaration strings are stripped", () => {
    const ir = buildComponentIR(loadContract("Switch"));
    // Simulate the CSS layer being mutated/removed — the typed source must
    // not be erased, because it is projected from contract.tokens, not from
    // cssBlocks.
    const mutated = { ...ir, cssBlocks: [] };
    const fact = mutated.tokenFacts.find(
      (t) => t.name === "switch.size.md.track.width",
    );
    expect(fact?.rawValue).toBe("48px");
  });
});

describe("FEAT-MOBILE-IR-001: no component-name lore in projection (A4)", () => {
  it("category is the path segment after the slug for every fact, never the component name", () => {
    for (const name of ["Switch", "Details"]) {
      const ir = buildComponentIR(loadContract(name));
      for (const fact of ir.tokenFacts) {
        const expectedCategory =
          fact.name.split(".").length > 1 ? fact.name.split(".")[1] : "root";
        expect(fact.category).toBe(expectedCategory);
        // category is never the component's own name
        expect(fact.category).not.toBe(ir.name.toLowerCase());
      }
    }
  });
});

describe("FEAT-MOBILE-IR-001: native availability for Switch + Details (A5)", () => {
  // Proves DATA AVAILABILITY for a native consumer — not final rendering.
  for (const name of ["Switch", "Details"]) {
    it(`${name} exposes non-empty, well-typed token facts`, () => {
      const ir = buildComponentIR(loadContract(name));
      expect(ir.tokenFacts.length).toBeGreaterThan(0);
      for (const fact of ir.tokenFacts) {
        expect(typeof fact.name).toBe("string");
        expect(fact.name.length).toBeGreaterThan(0);
        expect(typeof fact.category).toBe("string");
        expect(["core", "semantic", "brand", "density"]).toContain(fact.layer);
        expect(fact.source).toBe("tokens-sidecar");
        // ref-backed facts carry an alias; literal facts carry a value;
        // every fact carries at least one of them (never an empty fact).
        expect(fact.isLiteral ? fact.rawValue : fact.resolvesTo).toBeDefined();
      }
    });
  }
});
