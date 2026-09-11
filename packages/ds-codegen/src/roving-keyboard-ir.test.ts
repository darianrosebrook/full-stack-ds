import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract, ContractFocus } from "./contract.js";
import {
  buildComponentIR,
  buildKeyboardActions,
  resolveRovingItemPartName,
  resolveRovingItemSelector,
  type ComponentIR,
  type CompositeControlIR,
  type KeyboardActionIR,
  type PartIR,
} from "./ir.js";

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts/components");

function loadIR(name: string): ComponentIR {
  const contract = JSON.parse(
    readFileSync(resolve(CONTRACTS_ROOT, name, `${name}.contract.json`), "utf8"),
  ) as ComponentContract;
  return buildComponentIR(contract);
}

function partIR(name: string, details?: PartIR["details"]): PartIR {
  return {
    name,
    semanticElement: undefined,
    isCompound: false,
    isRootOnly: false,
    ...(details ? { details } : {}),
  };
}

type KeyboardEntry = Array<Record<string, unknown>>;

function fixtureContract(keyboard: KeyboardEntry): ComponentContract {
  return { name: "RovingFixture", a11y: { keyboard } } as unknown as ComponentContract;
}

function rovingActions(args: {
  parts: PartIR[];
  compositeControl?: CompositeControlIR;
  focus?: ContractFocus;
  keyboard?: KeyboardEntry;
}): KeyboardActionIR[] {
  return buildKeyboardActions(
    fixtureContract(
      args.keyboard ?? [
        { key: "ArrowRight", behavior: "roving-next", when: "item" },
        { key: "ArrowLeft", behavior: "roving-prev", when: "item" },
        { key: "Home", behavior: "roving-first", when: "item" },
        { key: "End", behavior: "roving-last", when: "item" },
      ],
    ),
    args.parts,
    [],
    args.compositeControl,
    args.focus,
  );
}

describe("resolveRovingItemPartName", () => {
  it("prefers the compositeControl item part (Select)", () => {
    expect(resolveRovingItemPartName(loadIR("Select"))).toBe("option");
  });

  it("falls back to the anatomy part carrying focusable roving (Tabs)", () => {
    // Tabs declares no compositeControl: its items are registered by the
    // compound container, and the tab part's `focusable: "roving"` detail is
    // the only declaration of the roved-over item set.
    const ir = loadIR("Tabs");
    expect(ir.compositeControl).toBeUndefined();
    expect(resolveRovingItemPartName(ir)).toBe("tab");
  });

  it("is undefined when the contract declares neither source (Button)", () => {
    expect(resolveRovingItemPartName(loadIR("Button"))).toBeUndefined();
  });
});

describe("resolveRovingItemSelector", () => {
  it("resolves the composite item part's role (Select)", () => {
    expect(resolveRovingItemSelector(loadIR("Select"))).toBe('[role="option"]:not(:disabled)');
  });

  it("resolves the focusable-roving part's role (Tabs)", () => {
    expect(resolveRovingItemSelector(loadIR("Tabs"))).toBe('[role="tab"]');
  });

  it("is undefined when the contract declares no roving item set", () => {
    expect(resolveRovingItemSelector(loadIR("Button"))).toBeUndefined();
  });
});

describe("buildKeyboardActions roving validation", () => {
  it("accepts a compositeControl item set and returns all four roving ops", () => {
    const actions = rovingActions({
      parts: [partIR("item")],
      compositeControl: { part: { name: "item" } } as unknown as CompositeControlIR,
      focus: { strategy: "roving" },
    });
    expect(actions.map((action) => action.op)).toEqual([
      "roving-next",
      "roving-prev",
      "roving-first",
      "roving-last",
    ]);
    expect(actions.every((action) => action.part === "item")).toBe(true);
  });

  it("accepts a focusable-roving anatomy part as the item set", () => {
    const actions = rovingActions({
      parts: [partIR("item", { focusable: "roving" })],
      focus: { strategy: "roving" },
    });
    expect(actions).toHaveLength(4);
  });

  it("throws when neither compositeControl nor a focusable-roving part exists", () => {
    expect(() =>
      rovingActions({ parts: [partIR("item")], focus: { strategy: "roving" } }),
    ).toThrow(/requires a declared roving item set/);
  });

  it("throws when focus.strategy is not roving", () => {
    expect(() =>
      rovingActions({ parts: [partIR("item", { focusable: "roving" })], focus: undefined }),
    ).toThrow(/requires focus\.strategy "roving"/);
  });

  it("skips declaration-only entries without demanding an item set", () => {
    const actions = rovingActions({
      parts: [partIR("item")],
      focus: undefined,
      keyboard: [{ key: "ArrowRight", action: "Move focus", when: "item" }],
    });
    expect(actions).toEqual([]);
  });
});
