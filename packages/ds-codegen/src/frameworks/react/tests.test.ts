import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { corpusIR } from "../corpus-fixtures.js";
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
    expect(source).toContain(`expect(results.violations.map((v) => v.id)).toEqual([]);`);
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

describe("generateReactTest — real corpus contracts", () => {
  it("emits compound-subcomponent imports and a render-only channel test for Tabs", () => {
    const source = generateReactTest(corpusIR("Tabs"));

    expect(source).toContain(
      `import { Tabs, TabsList, TabsTab, TabsPanel } from "../Tabs";`,
    );
    expect(source).toContain(
      `it("calls onValueChange when activeTab changes", async () => {`,
    );
    // Tabs' string channel is deep-bound: the plan falls back to
    // render-only prop acceptance instead of firing an event.
    expect(source).toContain(`value={""} onValueChange={onValueChangeSpy}`);
  });

  it("emits the open-render prop and dismissal tests for Select", () => {
    const source = generateReactTest(corpusIR("Select"));

    expect(source).toContain(`open={true}`);
    expect(source).toContain(
      `it("calls onChange when selection changes", async () => {`,
    );
    expect(source).toContain(`closes on Escape key`);
  });

  it("emits disclosure subcomponent imports for Accordion", () => {
    const source = generateReactTest(corpusIR("Accordion"));

    expect(source).toContain(
      `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";`,
    );
  });

  it("emits Escape and overlay-click dismissal tests for Dialog", () => {
    const source = generateReactTest(corpusIR("Dialog"));

    expect(source).toContain(`import { render, screen, act, fireEvent }`);
    expect(source).toContain(`closes on Escape key`);
    // FIX-OVERLAY-CLICK-DISMISSAL-BINDING-01: the dismissal test dispatches
    // on the declared targetPart element (Dialog's backdrop), not the root —
    // jsdom does no hit-testing, so the root click proved nothing.
    expect(source).toContain(
      `const overlay = screen.getByTestId("dialog").querySelector(".dialog__backdrop");`,
    );
    expect(source).toContain(`fireEvent.click(overlay!);`);
  });

  it("scans the realized component subtree and does not suppress dialog naming failures", () => {
    const source = generateReactTest(corpusIR("Dialog"));

    expect(source).toContain(
      `const component = baseElement.querySelector('[data-fsds-component="dialog"]');`,
    );
    expect(source).toContain(`expect(component).not.toBeNull();`);
    expect(source).toContain(
      `const results = await axe(component!, componentAxeOptions)`,
    );
    expect(source).toContain(`region: { enabled: false }`);
    expect(source).not.toContain(`"button-name"`);
    expect(source).not.toContain(`"aria-required-children"`);
    expect(source).not.toContain(`knownScaffoldViolationIds`);
    expect(source).toContain(`expect(results.violations.map((v) => v.id)).toEqual([]);`);
    expect(source).not.toContain(`const { container } = render(`);
  });

  it("lets the accessible-name fixture replace the required placeholder", () => {
    const source = generateReactTest(corpusIR("Avatar"));
    const axeRender = source.split(`describe("Avatar — accessibility"`)[1];

    expect(axeRender).toContain(`<Avatar name="Test Avatar"`);
    expect(axeRender).not.toContain(`name={"placeholder"}`);
  });

  it("routes anchored surfaces (Popover) to the surface test plan", () => {
    const source = generateReactTest(corpusIR("Popover"));

    expect(source).toContain(`describe("Popover — compound API surface"`);
  });

  it("keeps the generic plan for non-anchored surfaces (Toast)", () => {
    const source = generateReactTest(corpusIR("Toast"));

    expect(source).toContain(`describe("Toast — unit"`);
    expect(source).toContain(`closes on Escape key`);
  });
});
