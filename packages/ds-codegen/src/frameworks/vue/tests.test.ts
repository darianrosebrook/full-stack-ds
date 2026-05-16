import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateVueTest } from "./tests.js";

describe("generateVueTest", () => {
  it("emits Vue Test Utils tests from the shared component test plan", () => {
    const source = generateVueTest(buildComponentIR(makeContract()));

    expect(source).toContain(`import { mount } from "@vue/test-utils";`);
    expect(source).toContain(`import Switch from "../Switch.vue";`);
    expect(source).toContain(`expect(wrapper.classes()).toContain("switch");`);
    expect(source).toContain(`props: { "size": "small" }`);
    expect(source).toContain(`await wrapper.trigger("click");`);
    expect(source).toContain(`expect(onChangeSpy).toHaveBeenCalled();`);
    expect(source).toContain(`const results = await axe(wrapper.element);`);
    expect(source).toContain(`unexpectedViolations`);
    expect(source).toContain(
      `expect(unexpectedViolations.map((v) => v.id)).toEqual([]);`,
    );
  });
});

function makeContract(): ComponentContract {
  return {
    name: "Switch",
    cssPrefix: "switch",
    anatomy: { parts: ["root"] },
    props: {
      styled: {
        members: [
          { name: "checked", type: "boolean" },
          { name: "onChange", type: "(event: ChangeEvent<HTMLInputElement>) => void" },
          { name: "size", type: "SwitchSize", default: "small" },
          { name: "aria-label", type: "string" },
        ],
      },
    },
    types: {
      SwitchSize: { kind: "union", values: ["small", "large"] },
    },
    variants: {
      size: ["small", "large"],
    },
    channels: {
      checked: {
        value: "checked",
        defaultValue: "defaultChecked",
        onChange: "onChange",
        valueType: "boolean",
      },
    },
    a11y: {
      role: "switch",
      labeling: ["aria-label"],
    },
  };
}
