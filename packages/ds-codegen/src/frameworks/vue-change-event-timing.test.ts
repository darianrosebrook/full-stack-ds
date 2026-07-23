import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateVueComponentSource } from "./vue/component-source.js";

/**
 * FIX-SETTINGS-FIELD-VUE-FINDINGS-01 (#6): the Vue emitter must lower a
 * text-value change channel to the keystroke-firing `@input` event, not the
 * blur-timed native `@change`. Boolean controls (checkbox/switch) keep
 * `@change` — they have no keystroke concept.
 *
 * Rationale: React's `onChange` already means "the input event" (fires per
 * keystroke), so Vue's faithful realization of the same value-change semantic
 * is `@input`. A `@change` binding defers keystroke-time validation until the
 * field loses focus, which the settings example exposed as a real defect.
 */

function inputLikeContract(valueType: "string" | "boolean"): ComponentContract {
  return {
    name: "FixtureValueInput",
    layer: "primitive",
    cssPrefix: "fixture-value-input",
    anatomy: {
      parts: ["root"],
      dom: {
        tag: "input",
        part: "root",
        bindings: { value: "channel:value.value" },
        events: { change: "channel:value.onChange" },
      },
    },
    props: {
      designed: {
        members: [
          {
            name: "value",
            propType: { kind: valueType === "boolean" ? "boolean" : "string" },
            description: "current value",
          },
          {
            name: "onChange",
            propType: {
              kind: "callback",
              params: [{ name: "value", type: { kind: valueType } }],
              returns: { kind: "void" },
            },
            description: "change handler",
          },
        ],
      },
    },
    channels: {
      value: {
        value: "value",
        onChange: "onChange",
        valueType,
        description: "value channel",
      },
    },
  } as unknown as ComponentContract;
}

describe("Vue change-event timing (FIX-SETTINGS-FIELD-VUE-FINDINGS-01 #6)", () => {
  it("lowers a string value channel's change event to @input (keystroke)", () => {
    const ir = buildComponentIR(inputLikeContract("string"), { allContracts: new Map() });
    const src = generateVueComponentSource(ir);
    // The value channel setter fires on @input, not the blur-timed @change.
    expect(src).toMatch(/@input="\(e\) => behavior\.setValue\(/);
    expect(src).not.toMatch(/@change="\(e\) => behavior\.setValue\(/);
  });

  it("keeps a boolean value channel's change event on @change (toggle)", () => {
    const ir = buildComponentIR(inputLikeContract("boolean"), { allContracts: new Map() });
    const src = generateVueComponentSource(ir);
    // Boolean (checkbox/switch) fires the native change event on toggle;
    // there is no keystroke to react to, so @input would be wrong.
    expect(src).toMatch(/@change="\(e\) => behavior\.setValue\(.*\.checked\)"/);
    expect(src).not.toMatch(/@input=/);
  });
});
