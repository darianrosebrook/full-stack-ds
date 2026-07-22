/**
 * FIX-COMPOUND-CONTAINER-ANCESTOR-PREDICATE-01 (A1) — ancestor-aware
 * compound-state-container detection on the REAL corpus contracts.
 *
 * The bug this pins: `getInteractiveItemPart` required `multiple` AND
 * `interactive` on ONE part. Accordion authors these separated (`item` is
 * multiple, its nested `trigger` two DOM levels down is interactive), so the
 * predicate returned false and Accordion fell through to the dead dom-tree
 * passthrough. Tabs works because its `tab` carries both flags co-located.
 *
 * These tests exercise the resolution against the real Tabs and Accordion
 * shapes plus a negative fixture, and assert the disclosure-vs-tab-selection
 * discriminator that keeps Tabs on the tab lowering and routes Accordion to
 * the repeated-disclosure lowering — all from contract data, no name matching.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildComponentIR } from "../../ir.js";
import type { ComponentContract } from "../../contract.js";
import {
  getInteractiveItemPart,
  getMultipleItemPart,
  getRegionPart,
  isCompoundStateContainer,
  isDisclosureContainer,
} from "./hook-source.js";

const CONTRACTS_ROOT = resolve(__dirname, "../../../../ds-contracts");

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

const tabsIr = buildComponentIR(loadContract("Tabs"));
const accordionIr = buildComponentIR(loadContract("Accordion"));

describe("compound-container detection: co-located item (Tabs)", () => {
  it("resolves the interactive item to the part that is itself multiple+interactive", () => {
    // `tab` carries both flags; the ancestor walk must return it directly so
    // Tabs output stays byte-identical.
    expect(getInteractiveItemPart(tabsIr)?.name).toBe("tab");
    expect(getMultipleItemPart(tabsIr)?.name).toBe("tab");
  });

  it("classifies Tabs as a compound-state container", () => {
    expect(isCompoundStateContainer(tabsIr)).toBe(true);
    expect(getRegionPart(tabsIr)?.name).toBe("panel");
  });

  it("does NOT classify Tabs as a disclosure container (binds aria-selected, not aria-expanded)", () => {
    expect(isDisclosureContainer(tabsIr)).toBe(false);
  });
});

describe("compound-container detection: ancestor-nested item (Accordion)", () => {
  it("resolves the interactive item to the trigger nested under the multiple item", () => {
    // `item` is multiple but not interactive; the interactive `trigger` lives
    // two DOM levels down (item > header > trigger). The ancestor-aware walk
    // must find it.
    expect(getMultipleItemPart(accordionIr)?.name).toBe("item");
    expect(getInteractiveItemPart(accordionIr)?.name).toBe("trigger");
  });

  it("classifies Accordion as a compound-state container (the fix)", () => {
    // Before the fix this returned false and Accordion rendered dead.
    expect(isCompoundStateContainer(accordionIr)).toBe(true);
    expect(getRegionPart(accordionIr)?.name).toBe("content");
  });

  it("classifies Accordion as a disclosure container (trigger binds aria-expanded to the channel)", () => {
    expect(isDisclosureContainer(accordionIr)).toBe(true);
  });
});

describe("compound-container detection: negative fixture", () => {
  // A component with a multiple part but no interactive descendant and no
  // region — must not be treated as a compound-state container.
  const nonContainer: ComponentContract = {
    name: "FixtureList",
    cssPrefix: "fixture-list",
    layer: "compound",
    anatomy: {
      parts: ["root", "row", "cell"],
      details: {
        row: { role: "listitem", multiple: true },
        cell: { role: "cell" },
      },
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            tag: "div",
            part: "row",
            children: [{ tag: "div", part: "cell", children: [{ tag: "children" }] }],
          },
        ],
      },
    },
    props: { styled: { members: [] } },
  };
  const ir = buildComponentIR(nonContainer);

  it("returns undefined interactive item when no descendant is interactive", () => {
    expect(getInteractiveItemPart(ir)).toBeUndefined();
  });

  it("is neither a compound-state container nor a disclosure container", () => {
    expect(isCompoundStateContainer(ir)).toBe(false);
    expect(isDisclosureContainer(ir)).toBe(false);
  });
});
