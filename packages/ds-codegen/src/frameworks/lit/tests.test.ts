import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateLitTest } from "./tests.js";

describe("generateLitTest", () => {
  it("emits a Lit suite from the shared test plan", () => {
    const source = generateLitTest(buildComponentIR(makeContract()));

    expect(source).toContain(`import { axe } from "vitest-axe";`);
    expect(source).toContain(`import "../Switch";`);
    expect(source).toContain(`unexpectedViolations`);
    expect(source).toContain("switch");
  });

  it("emits channel behavior assertions for a boolean channel", () => {
    const source = generateLitTest(buildComponentIR(makeContract()));
    expect(source).toContain("checked");
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
