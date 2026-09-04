import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR } from "./ir.js";
import {
  buildComponentTestPlan,
  runtimeRequiredPropExpression,
} from "./test-plan.js";

describe("runtimeRequiredPropExpression", () => {
  it("keeps the runtime object while removing a component-local alias cast", () => {
    expect(runtimeRequiredPropExpression("{} as PostcardAuthor")).toBe("{}");
    expect(runtimeRequiredPropExpression('"placeholder"')).toBe('"placeholder"');
  });
});

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
    expect(plan.accessibility.labelInput).toEqual({
      kind: "attribute",
      name: "aria-label",
      value: "Test Switch",
    });
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

  it("routes an authored role-owner label through the public component prop", () => {
    const ir = buildComponentIR({
      ...makeContract(),
      name: "DialogFixture",
      cssPrefix: "dialog-fixture",
      anatomy: {
        parts: ["root", "panel"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "div",
              part: "panel",
              attrs: { role: "dialog" },
              bindings: { "aria-label": "prop:ariaLabel" },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [{ name: "ariaLabel", type: "string" }],
        },
      },
      channels: undefined,
      variants: undefined,
      a11y: { role: "dialog", labeling: ["aria-label"] },
    });

    expect(buildComponentTestPlan(ir).accessibility.labelInput).toEqual({
      kind: "prop",
      name: "ariaLabel",
      value: "Test DialogFixture",
    });
  });

  it("finds a label prop on a synthesized root role owner", () => {
    const ir = buildComponentIR({
      ...makeContract(),
      name: "ToggleFixture",
      cssPrefix: "toggle-fixture",
      anatomy: {
        parts: ["root"],
        dom: {
          tag: "button",
          part: "root",
          bindings: { "aria-label": "prop:ariaLabel" },
        },
      },
      props: {
        styled: {
          members: [{ name: "ariaLabel", type: "string" }],
        },
      },
      channels: undefined,
      variants: undefined,
      a11y: { role: "switch", labeling: ["aria-label"] },
    });

    expect(buildComponentTestPlan(ir).accessibility.labelInput).toEqual({
      kind: "prop",
      name: "ariaLabel",
      value: "Test ToggleFixture",
    });
  });

  it("finds a bound label prop when a native control omits an explicit role", () => {
    const ir = buildComponentIR({
      ...makeContract(),
      name: "CheckboxFixture",
      cssPrefix: "checkbox-fixture",
      anatomy: {
        parts: ["root", "input"],
        dom: {
          tag: "label",
          part: "root",
          children: [
            {
              tag: "input",
              part: "input",
              attrs: { type: "checkbox" },
              bindings: { "aria-label": "prop:ariaLabel" },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [{ name: "ariaLabel", type: "string" }],
        },
      },
      channels: undefined,
      variants: undefined,
      a11y: { labeling: ["aria-label"] },
    });

    expect(buildComponentTestPlan(ir).accessibility.labelInput).toEqual({
      kind: "prop",
      name: "ariaLabel",
      value: "Test CheckboxFixture",
    });
  });

  it("fills named IDREF targets and does not mask aria-labelledby with aria-label", () => {
    const ir = buildComponentIR({
      name: "DialogFixture",
      cssPrefix: "dialog-fixture",
      anatomy: {
        parts: ["root", "dialog", "title", "body"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "section",
              part: "dialog",
              attrs: { role: "dialog" },
              children: [
                {
                  tag: "h2",
                  part: "title",
                  children: [{ tag: "slot", name: "title" }],
                },
                {
                  tag: "div",
                  part: "body",
                  children: [{ tag: "slot", name: "body" }],
                },
              ],
            },
          ],
        },
      },
      props: { styled: { members: [] } },
      relationships: [
        { from: "dialog", to: "title", attribute: "aria-labelledby" },
        { from: "dialog", to: "body", attribute: "aria-describedby" },
      ],
      a11y: { role: "dialog", labeling: ["aria-labelledby", "aria-describedby"] },
    } as unknown as ComponentContract);

    expect(buildComponentTestPlan(ir).accessibility).toEqual({
      labelInput: undefined,
      needsListParent: false,
      props: [],
      content: [
        { slotName: "title", html: "<span>Test DialogFixture title</span>" },
        { slotName: "body", html: "<span>Test DialogFixture body</span>" },
      ],
    });
  });

  it("activates the branch that realizes a conditional accessible role", () => {
    const ir = buildComponentIR({
      name: "LoadingFixture",
      cssPrefix: "loading-fixture",
      anatomy: {
        parts: ["root"],
        dom: {
          tag: "div",
          part: "root",
          bindings: {
            role: "conditional:prop:decorative|literal:presentation|literal:status",
            "aria-label": "prop:ariaLabel",
          },
        },
      },
      props: {
        styled: {
          members: [
            { name: "decorative", type: "boolean", default: true },
            { name: "ariaLabel", type: "string" },
          ],
        },
      },
      a11y: { role: "status", labeling: ["aria-label"] },
    } as ComponentContract);

    expect(buildComponentTestPlan(ir).accessibility).toMatchObject({
      labelInput: {
        kind: "prop",
        name: "ariaLabel",
        value: "Test LoadingFixture",
      },
      props: [{ name: "decorative", value: false }],
    });
  });

  it("wraps default content in a list item when the child placement lives under a list", () => {
    const ir = buildComponentIR({
      name: "BreadcrumbFixture",
      cssPrefix: "breadcrumb-fixture",
      anatomy: {
        parts: ["root", "list"],
        dom: {
          tag: "nav",
          part: "root",
          children: [
            {
              tag: "ol",
              part: "list",
              children: [{ tag: "children" }],
            },
          ],
        },
      },
      props: { styled: { members: [] } },
      a11y: { role: "navigation", labeling: ["aria-label"] },
    } as unknown as ComponentContract);

    expect(buildComponentTestPlan(ir).accessibility.content).toEqual([
      { slotName: undefined, html: "<li>content</li>" },
    ]);
  });

  it("uses a valid row/cell fixture for a default child placed directly in a table", () => {
    const ir = buildComponentIR({
      name: "TableFixture",
      cssPrefix: "table-fixture",
      anatomy: {
        parts: ["root", "table"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "table",
              part: "table",
              children: [{ tag: "children" }],
            },
          ],
        },
      },
      props: { styled: { members: [] } },
      a11y: { labeling: [] },
    } as unknown as ComponentContract);

    expect(buildComponentTestPlan(ir).accessibility.content).toEqual([
      {
        slotName: undefined,
        html: "<tbody><tr><td>content</td></tr></tbody>",
      },
    ]);
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
