import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateReactTest } from "./tests.js";

describe("generateReactTest", () => {
  it("emits a React Testing Library suite from the shared test plan", () => {
    const source = generateReactTest(buildComponentIR(makeContract()));

    expect(source).toContain(`import { render, screen } from "@testing-library/react";`);
    expect(source).toContain(`import userEvent from "@testing-library/user-event";`);
    expect(source).toContain(`import { axe } from "vitest-axe";`);
    expect(source).toContain(`import { Switch } from "../Switch";`);
    expect(source).toContain(`expect(screen.getByTestId("switch")).toHaveClass("switch");`);
    expect(source).toContain(`expect(screen.getByTestId("switch")).toHaveClass("switch--small");`);
    expect(source).toContain(`unexpectedViolations`);
  });

  it("emits a channel interaction test for a boolean channel", () => {
    const source = generateReactTest(buildComponentIR(makeContract()));
    expect(source).toContain(`it("calls onChange when checked changes"`);
    expect(source).toContain(`await userEvent.setup().click(screen.getByTestId("switch"));`);
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
