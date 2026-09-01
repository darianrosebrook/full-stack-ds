import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { corpusIR } from "../corpus-fixtures.js";
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

describe("generateAngularTest — real corpus contracts", () => {
  it("emits a TestBed plan for the compound Tabs contract", () => {
    const source = generateAngularTest(corpusIR("Tabs"));

    expect(source).toContain(`import { TabsComponent } from "../Tabs.component";`);
    expect(source).toContain(`describe("Tabs — unit"`);
  });

  it("emits the Select plan with TestBed", () => {
    const source = generateAngularTest(corpusIR("Select"));

    expect(source).toContain(`import { SelectComponent } from "../Select.component";`);
    expect(source).toContain(`TestBed`);
  });

  it("emits the Accordion disclosure plan", () => {
    const source = generateAngularTest(corpusIR("Accordion"));

    expect(source).toContain(`import { AccordionComponent } from "../Accordion.component";`);
  });

  it("emits the Dialog plan with TestBed", () => {
    const source = generateAngularTest(corpusIR("Dialog"));

    expect(source).toContain(`import { DialogComponent } from "../Dialog.component";`);
    expect(source).toContain(`TestBed`);
  });

  it("routes the anchored Popover surface to the class-surface plan", () => {
    const source = generateAngularTest(corpusIR("Popover"));

    expect(source).toContain(`import { PopoverComponent } from "../Popover.component";`);
    expect(source).toContain(`creates the component class`);
  });

  it("keeps the generic plan for the Toast surface", () => {
    const source = generateAngularTest(corpusIR("Toast"));

    expect(source).toContain(`import { ToastComponent } from "../Toast.component";`);
    expect(source).toContain(`describe("Toast — unit"`);
  });
});
