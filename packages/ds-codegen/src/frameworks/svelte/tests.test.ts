import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateSvelteTest } from "./tests.js";

describe("generateSvelteTest", () => {
  it("emits a Testing Library Svelte suite from the shared test plan", () => {
    const source = generateSvelteTest(buildComponentIR(makeContract()));

    expect(source).toContain(`from "@testing-library/svelte";`);
    expect(source).toContain(`import { axe } from "vitest-axe";`);
    expect(source).toContain(`import Switch from "../Switch.svelte";`);
    expect(source).toContain(`container.firstElementChild?.className).toContain("switch");`);
    expect(source).toContain(`unexpectedViolations`);
  });

  it("emits channel interaction code for a stack-only boolean channel", () => {
    const source = generateSvelteTest(buildComponentIR(makeContract()));
    expect(source).toContain(`vi`);
    expect(source).toContain(`fireEvent`);
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
