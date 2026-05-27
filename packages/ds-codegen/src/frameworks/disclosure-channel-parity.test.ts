import { describe, expect, it } from "vitest";
import {
  buildComponentIR,
  pickPrimaryDisclosureChannel,
  type NormalizedChannelIR,
} from "../ir.js";
import type { ComponentContract } from "../contract.js";

// Cross-framework parity for the disclosure-channel structural fact.
// The five admitted framework emitters (react/vue/svelte/angular/lit)
// historically each replicated `c.name === "open"` / `"expanded"`
// predicates to identify the channel that drives overlay/dismissal
// wiring. The IR now exposes:
//
//   - `NormalizedChannelIR.isDisclosureChannel` — boolean structural fact
//   - `NormalizedChannelIR.disclosurePriority` — priority ordering
//   - `pickPrimaryDisclosureChannel(channels)` — pre-computed top pick
//
// This test pins the structural rule so every emitter consumes the
// same answer rather than re-deriving it from channel names.

function makeContract(
  channels: Record<
    string,
    { value: string; onChange: string; valueType?: string }
  >,
  styledProps: Array<{ name: string; type: string }>,
): ComponentContract {
  return {
    name: "Probe",
    layer: "primitive",
    props: { styled: { members: styledProps } },
    channels,
  } as ComponentContract;
}

describe("disclosure-channel structural fact", () => {
  it("a boolean-valued channel is a disclosure channel", () => {
    const ir = buildComponentIR(
      makeContract(
        {
          collapsed: {
            value: "collapsed",
            onChange: "onCollapsedChange",
            valueType: "boolean",
          },
        },
        [
          { name: "collapsed", type: "boolean" },
          { name: "onCollapsedChange", type: "(v: boolean) => void" },
        ],
      ),
    );
    const channel = ir.behavior.normalizedChannels[0];
    expect(channel.isDisclosureChannel).toBe(true);
    expect(channel.disclosurePriority).toBe(2); // not named open/expanded
  });

  it("a channel named 'open' is a disclosure channel even if valueType is omitted", () => {
    const ir = buildComponentIR(
      makeContract(
        { open: { value: "open", onChange: "onOpenChange" } },
        [
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "(open: boolean) => void" },
        ],
      ),
    );
    const channel = ir.behavior.normalizedChannels[0];
    expect(channel.isDisclosureChannel).toBe(true);
    expect(channel.disclosurePriority).toBe(0);
  });

  it("a non-boolean, non-'open' channel is NOT a disclosure channel", () => {
    const ir = buildComponentIR(
      makeContract(
        { value: { value: "value", onChange: "onValueChange", valueType: "string" } },
        [
          { name: "value", type: "string" },
          { name: "onValueChange", type: "(v: string) => void" },
        ],
      ),
    );
    const channel = ir.behavior.normalizedChannels[0];
    expect(channel.isDisclosureChannel).toBe(false);
    expect(channel.disclosurePriority).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("priority order is open(0) < expanded(1) < other boolean(2)", () => {
    const ir = buildComponentIR(
      makeContract(
        {
          extra: {
            value: "extra",
            onChange: "onExtraChange",
            valueType: "boolean",
          },
          expanded: {
            value: "expanded",
            onChange: "onExpandedChange",
            valueType: "boolean",
          },
          open: {
            value: "open",
            onChange: "onOpenChange",
            valueType: "boolean",
          },
        },
        [
          { name: "extra", type: "boolean" },
          { name: "onExtraChange", type: "(v: boolean) => void" },
          { name: "expanded", type: "boolean" },
          { name: "onExpandedChange", type: "(v: boolean) => void" },
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "(v: boolean) => void" },
        ],
      ),
    );
    const byName = new Map(
      ir.behavior.normalizedChannels.map((c) => [c.name, c]),
    );
    expect(byName.get("open")?.disclosurePriority).toBe(0);
    expect(byName.get("expanded")?.disclosurePriority).toBe(1);
    expect(byName.get("extra")?.disclosurePriority).toBe(2);
  });

  it("primaryDisclosureChannel picks 'open' over 'expanded' and 'expanded' over other boolean", () => {
    const ir = buildComponentIR(
      makeContract(
        {
          extra: {
            value: "extra",
            onChange: "onExtraChange",
            valueType: "boolean",
          },
          expanded: {
            value: "expanded",
            onChange: "onExpandedChange",
            valueType: "boolean",
          },
          open: {
            value: "open",
            onChange: "onOpenChange",
            valueType: "boolean",
          },
        },
        [
          { name: "extra", type: "boolean" },
          { name: "onExtraChange", type: "(v: boolean) => void" },
          { name: "expanded", type: "boolean" },
          { name: "onExpandedChange", type: "(v: boolean) => void" },
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "(v: boolean) => void" },
        ],
      ),
    );
    expect(ir.behavior.primaryDisclosureChannel?.name).toBe("open");
  });

  it("primaryDisclosureChannel falls through to 'expanded' when 'open' is absent", () => {
    const ir = buildComponentIR(
      makeContract(
        {
          extra: {
            value: "extra",
            onChange: "onExtraChange",
            valueType: "boolean",
          },
          expanded: {
            value: "expanded",
            onChange: "onExpandedChange",
            valueType: "boolean",
          },
        },
        [
          { name: "extra", type: "boolean" },
          { name: "onExtraChange", type: "(v: boolean) => void" },
          { name: "expanded", type: "boolean" },
          { name: "onExpandedChange", type: "(v: boolean) => void" },
        ],
      ),
    );
    expect(ir.behavior.primaryDisclosureChannel?.name).toBe("expanded");
  });

  it("primaryDisclosureChannel returns undefined when no disclosure channel exists", () => {
    const ir = buildComponentIR(
      makeContract(
        {
          value: {
            value: "value",
            onChange: "onValueChange",
            valueType: "string",
          },
        },
        [
          { name: "value", type: "string" },
          { name: "onValueChange", type: "(v: string) => void" },
        ],
      ),
    );
    expect(ir.behavior.primaryDisclosureChannel).toBeUndefined();
  });

  it("pickPrimaryDisclosureChannel helper agrees with the precomputed BehaviorIR field", () => {
    const channels: NormalizedChannelIR[] = [
      {
        name: "extra",
        valueProp: "extra",
        changeHandlerProp: "onExtraChange",
        valueType: "boolean",
        callbackKind: "value",
        isDisclosureChannel: true,
        disclosurePriority: 2,
      },
      {
        name: "open",
        valueProp: "open",
        changeHandlerProp: "onOpenChange",
        valueType: "boolean",
        callbackKind: "value",
        isDisclosureChannel: true,
        disclosurePriority: 0,
      },
    ];
    expect(pickPrimaryDisclosureChannel(channels)?.name).toBe("open");
  });

  describe("cross-framework parity — disclosure-driven hook references", () => {
    // Build a single contract that gives all 5 frameworks the same
    // structural fact to consume. The behavioral parity (each
    // framework's primitive being wired correctly) is already covered
    // by the per-framework hook-source.test.ts files; this test
    // proves they all share the same IR fact.
    const ir = buildComponentIR(
      makeContract(
        {
          open: {
            value: "open",
            onChange: "onOpenChange",
            valueType: "boolean",
          },
        },
        [
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "(open: boolean) => void" },
        ],
      ),
    );

    it("contract maps to exactly one disclosure channel", () => {
      const disclosure = ir.behavior.normalizedChannels.filter(
        (c) => c.isDisclosureChannel,
      );
      expect(disclosure).toHaveLength(1);
      expect(disclosure[0].name).toBe("open");
    });

    it("primaryDisclosureChannel is the same identity each framework will read", () => {
      // Every emitter accesses ir.behavior.primaryDisclosureChannel
      // (or pickPrimaryDisclosureChannel over the same list) — they
      // cannot diverge because the IR computed it once.
      expect(ir.behavior.primaryDisclosureChannel?.name).toBe("open");
      expect(
        pickPrimaryDisclosureChannel(ir.behavior.normalizedChannels)?.name,
      ).toBe("open");
    });
  });
});
