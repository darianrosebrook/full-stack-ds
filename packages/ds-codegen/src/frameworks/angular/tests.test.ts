import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateAngularTest } from "./tests.js";

describe("generateAngularTest", () => {
  it("emits a jest-globals class-instantiation suite from the shared test plan", () => {
    const source = generateAngularTest(buildComponentIR(makeContract()));

    expect(source).toContain(`import { describe, expect, it } from "@jest/globals";`);
    expect(source).toContain(`import { SwitchComponent } from "../Switch.component";`);
    expect(source).toContain(`new SwitchComponent()`);
    expect(source).toContain(`toBeInstanceOf(SwitchComponent)`);
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
          { name: "onChange", type: "(event: Event) => void" },
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
