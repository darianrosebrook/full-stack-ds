import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateReactNativeTest } from "./tests.js";

describe("generateReactNativeTest", () => {
  it("emits a ComponentProps type-surface suite from the shared test plan", () => {
    const source = generateReactNativeTest(buildComponentIR(makeContract()));

    expect(source).toContain(`import { describe, it } from "vitest";`);
    expect(source).toContain(`import type { ComponentProps } from "react";`);
    expect(source).toContain(`import { Switch } from "../Switch";`);
    expect(source).toContain(`type SwitchSmokeProps = ComponentProps<typeof Switch>;`);
    expect(source).toContain(`const smokeProps = {} as SwitchSmokeProps;`);
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
          { name: "onChange", type: "(event: unknown) => void" },
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
