import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR } from "./ir.js";
import { buildComponentTestPlan } from "./test-plan.js";

describe("buildComponentTestPlan", () => {
  it("derives render, variant, channel, role, and accessibility cases", () => {
    const ir = buildComponentIR(makeContract());
    const plan = buildComponentTestPlan(ir);

    expect(plan.name).toBe("Switch");
    expect(plan.testId).toBe("switch");
    expect(plan.renderOpenProp).toBeUndefined();
    expect(plan.role).toBeUndefined();
    expect(plan.variants).toEqual([
      { dimension: "size", value: "small", className: "switch--small" },
      { dimension: "size", value: "large", className: "switch--large" },
    ]);
    expect(plan.channels).toHaveLength(1);
    expect(plan.channels[0]).toMatchObject({
      spyName: "onChangeSpy",
      interaction: "click",
    });
    expect(plan.accessibility.axeProps).toBe(` aria-label="Test Switch"`);
  });

  it("keeps the concrete open prop name for framework render helpers", () => {
    const ir = buildComponentIR({
      ...makeContract(),
      props: {
        styled: {
          members: [{ name: "isOpen", type: "boolean" }],
        },
      },
    });

    expect(buildComponentTestPlan(ir).renderOpenProp).toBe("isOpen");
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
