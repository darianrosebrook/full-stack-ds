/**
 * Tests for the required-slot usage obligations (FEAT-SLOT-REQUIRED-USAGE-BINDING-01).
 *
 * `collectSuppliedRegions` resolves both curated-frame composition dialects;
 * `deriveRequiredRegionObligations` narrows slots[].required to consumer-
 * supplied regions. Synthetic fixtures exercise the dialects independently of
 * the corpus; the corpus sweep itself lives in src/lib/render-usage.test.tsx.
 */
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import {
  collectSuppliedRegions,
  deriveRequiredRegionObligations,
} from "./usage-composition.js";

describe("collectSuppliedRegions — frame dialects", () => {
  it("collects node-level slots-map regions (Field dialect)", () => {
    const frame = {
      "fsds.Field": {
        props: { name: "email" },
        slots: {
          label: { "fsds.Label": { props: { children: "Email" } } },
          control: { "fsds.Input": { props: { type: "email" } } },
        },
      },
    };
    expect(collectSuppliedRegions(frame)).toEqual(new Set(["label", "control"]));
  });

  it("collects part-suffixed refs from children trees (Card dialect)", () => {
    const frame = {
      "fsds.Card": {
        props: {
          children: [
            { "fsds.Card.header": { props: { children: "Title" } } },
            { "fsds.Card.actions": { props: { children: "Go" } } },
          ],
        },
      },
    };
    expect(collectSuppliedRegions(frame)).toEqual(new Set(["header", "actions"]));
  });

  it("collects slots nested inside props and recurses through mixed children", () => {
    const frame = {
      "fsds.Test": {
        props: {
          slots: { control: { "fsds.Input": { props: {} } } },
          children: [{ "fsds.Test.footer": { props: { children: [] } } }],
        },
      },
    };
    expect(collectSuppliedRegions(frame)).toEqual(new Set(["control", "footer"]));
  });

  it("does not count empty slot entries as supplied", () => {
    const frame = {
      "fsds.Test": { props: {}, slots: { control: null, help: "", error: false } },
    };
    expect(collectSuppliedRegions(frame)).toEqual(new Set());
  });

  it("ignores non-fsds keys and non-object garbage without throwing", () => {
    expect(collectSuppliedRegions({ plain: { props: { slots: { x: 1 } } } })).toEqual(new Set());
    expect(collectSuppliedRegions(null)).toEqual(new Set());
    expect(collectSuppliedRegions([1, 2, 3])).toEqual(new Set());
  });
});

describe("deriveRequiredRegionObligations — narrowing", () => {
  const base = {
    name: "Test",
    layer: "compound",
    anatomy: { parts: ["root"] },
  } as Partial<ComponentContract>;

  it("obligates a required:true named slot region rendered by anatomy.dom", () => {
    const contract = {
      ...base,
      anatomy: {
        parts: ["root", "control", "help"],
        dom: { tag: "div", part: "root", children: [{ tag: "slot", name: "control" }] },
      },
      slots: { control: { required: true }, help: { required: false } },
    } as unknown as ComponentContract;
    expect(deriveRequiredRegionObligations(contract)).toEqual([
      { component: "Test", region: "control" },
    ]);
  });

  it("excludes component-owned required anchors (the anchor-presence sense)", () => {
    const contract = {
      ...base,
      slots: { input: { required: true } },
    } as ComponentContract;
    expect(deriveRequiredRegionObligations(contract)).toEqual([]);
  });

  it("excludes the root host anchor even though the corpus marks it required", () => {
    const contract = {
      ...base,
      slots: { root: { required: true }, control: { required: false } },
    } as unknown as ComponentContract;
    expect(deriveRequiredRegionObligations(contract)).toEqual([]);
  });

  it("returns nothing for a contract with no slots declaration", () => {
    expect(deriveRequiredRegionObligations(base as ComponentContract)).toEqual([]);
  });

  it("obligates a subcomponent:true region (the Card.actions mutant shape)", () => {
    const contract = {
      ...base,
      anatomy: {
        parts: ["root", "actions"],
        details: { actions: { subcomponent: true } },
      },
      slots: { actions: { required: true } },
    } as unknown as ComponentContract;
    expect(deriveRequiredRegionObligations(contract)).toEqual([
      { component: "Test", region: "actions" },
    ]);
  });
});
