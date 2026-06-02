/**
 * FEAT-MOBILE-DISCLOSURE-001 — native disclosure collapse intent for Details.
 *
 * Proves the spec's acceptance criteria at the IR boundary, native-facing,
 * WITHOUT completing the SwiftUI emitter or asserting final mobile rendering:
 *  - A1: Details exposes an explicit `native-disclosure` collapse intent via
 *        the governed contract/anatomy path (collapsibleTo on `root`), with no
 *        inference from the component name "Details".
 *  - A2: collectCollapseIntents admits BOTH `native-toggle-affordance` and
 *        `native-disclosure`, branching on the authored intent value — proven
 *        by a synthetic IR whose part declares the new intent, so the test
 *        cannot pass via Details-specific lore.
 *  - A3: Details carries enough typed information for a disclosure primitive —
 *        a summary/trigger part, a collapsible content part, and the open/close
 *        state channel. Data availability only; no rendering asserted.
 *  - A4: Switch's proven `native-toggle-affordance` path is unchanged.
 *
 * Consumes (does not modify) FEAT-MOBILE-IR-001's typed token facts.
 * Sidecar merge mirrors the CLI load order (contract + tokens + styles).
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildComponentIR, collectCollapseIntents } from "./ir.js";
import type { ComponentContract } from "./contract.js";
import type { ComponentIR, PartIR } from "./ir.js";

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

describe("FEAT-MOBILE-DISCLOSURE-001: Details native-disclosure intent (A1)", () => {
  it("exposes an explicit native-disclosure collapse intent on the root part", () => {
    const ir = buildComponentIR(loadContract("Details"));
    const intents = collectCollapseIntents(ir);

    expect(intents.has("native-disclosure")).toBe(true);
    // Declared on `root` — the whole disclosure collapses to one native
    // primitive (DisclosureGroup) holding summary + content.
    expect(intents.get("native-disclosure")).toContain("root");
  });

  it("derives the intent from the authored fact, not the component name", () => {
    const ir = buildComponentIR(loadContract("Details"));
    // The root part's authored detail carries the intent — proving the
    // contract/anatomy path, not a name check, is the source of truth.
    const root = ir.parts.find((p) => p.name === "root");
    expect(root?.details?.collapsibleTo).toBe("native-disclosure");
  });
});

describe("FEAT-MOBILE-DISCLOSURE-001: collector generalizes (A2)", () => {
  it("admits both native-toggle-affordance and native-disclosure by intent value", () => {
    // Synthetic IR: two parts, each declaring a different intent. The
    // collector must bucket BOTH by their authored value. No component name
    // is involved, so a pass cannot come from Details/Switch-specific lore.
    const synthetic = {
      parts: [
        { name: "p1", details: { collapsibleTo: "native-toggle-affordance" } },
        { name: "p2", details: { collapsibleTo: "native-disclosure" } },
        { name: "p3", details: {} },
      ] as unknown as PartIR[],
    } as unknown as ComponentIR;

    const intents = collectCollapseIntents(synthetic);
    expect(intents.get("native-toggle-affordance")).toEqual(["p1"]);
    expect(intents.get("native-disclosure")).toEqual(["p2"]);
    // p3 (no intent) contributes nothing.
    expect([...intents.keys()].sort()).toEqual([
      "native-disclosure",
      "native-toggle-affordance",
    ]);
  });
});

describe("FEAT-MOBILE-DISCLOSURE-001: disclosure primitive facts available (A3)", () => {
  it("Details carries summary/trigger, collapsible content, and an open-state channel", () => {
    const ir = buildComponentIR(loadContract("Details"));

    const partNames = ir.parts.map((p) => p.name);
    // Summary/trigger label + collapsible content — the two halves a native
    // disclosure primitive needs.
    expect(partNames).toContain("summary");
    expect(partNames).toContain("summaryText");
    expect(partNames).toContain("content");

    // Open/close state channel, typed boolean — drives the native expanded
    // binding. This is data availability only; no rendering is asserted.
    const open = ir.behavior.normalizedChannels.find((c) => c.name === "open");
    expect(open).toBeDefined();
    expect(open?.valueType).toBe("boolean");
  });
});

describe("FEAT-MOBILE-DISCLOSURE-001: Switch non-regression (A4)", () => {
  it("Switch still collects only native-toggle-affordance, unchanged", () => {
    const ir = buildComponentIR(loadContract("Switch"));
    const intents = collectCollapseIntents(ir);

    expect(intents.has("native-toggle-affordance")).toBe(true);
    expect(intents.has("native-disclosure")).toBe(false);
    // Track + thumb collapse into the native toggle — the proven mapping.
    expect(intents.get("native-toggle-affordance")?.sort()).toEqual([
      "thumb",
      "track",
    ]);
  });
});
