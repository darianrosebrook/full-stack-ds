import { describe, expect, it } from "vitest";
import type { ComponentContract, ContractDomNode } from "./contract.js";
import { buildComponentIR, parseBindingExpression } from "./ir.js";

describe("parseBindingExpression", () => {
  it("parses prop: bindings", () => {
    expect(parseBindingExpression("prop:disabled")).toEqual({
      kind: "prop",
      prop: "disabled",
    });
  });

  it("parses channel:value bindings", () => {
    expect(parseBindingExpression("channel:checked.value")).toEqual({
      kind: "channel",
      channel: "checked",
      field: "value",
    });
  });

  it("parses channel:onChange bindings", () => {
    expect(parseBindingExpression("channel:checked.onChange")).toEqual({
      kind: "channel",
      channel: "checked",
      field: "onChange",
    });
  });

  it("parses channel:defaultValue bindings", () => {
    expect(parseBindingExpression("channel:open.defaultValue")).toEqual({
      kind: "channel",
      channel: "open",
      field: "defaultValue",
    });
  });

  it("parses literal: bindings", () => {
    expect(parseBindingExpression("literal:Submit")).toEqual({
      kind: "literal",
      value: "Submit",
    });
  });

  it("falls back to literal for malformed expressions", () => {
    // Visible failure mode: the expression appears verbatim in output rather
    // than disappearing silently.
    expect(parseBindingExpression("not-a-binding")).toEqual({
      kind: "literal",
      value: "not-a-binding",
    });
  });
});

describe("buildDomTree (via buildComponentIR)", () => {
  function withDom(dom: unknown): ComponentContract {
    return {
      name: "TestComponent",
      anatomy: {
        parts: ["wrapper", "field"],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dom: dom as any,
      },
    } as ComponentContract;
  }

  it("returns undefined when no dom block is present", () => {
    const ir = buildComponentIR({
      name: "Plain",
      anatomy: { parts: ["root"] },
    } as ComponentContract);
    expect(ir.dom).toBeUndefined();
  });

  it("returns undefined for legacy flat-array anatomy", () => {
    const ir = buildComponentIR({
      name: "Legacy",
      anatomy: ["root"],
    } as ComponentContract);
    expect(ir.dom).toBeUndefined();
  });

  it("parses a single root node with attrs", () => {
    const ir = buildComponentIR(
      withDom({
        tag: "label",
        part: "wrapper",
        attrs: { class: "switch__wrapper" },
      }),
    );
    expect(ir.dom).toEqual({
      tag: "label",
      slotName: undefined,
      part: "wrapper",
      attrs: { class: "switch__wrapper" },
      bindings: {},
      children: [],
      ifProp: undefined,
      ifNegated: false,
    });
  });

  it("parses nested children with bindings", () => {
    // The contract must declare the channels and props that DOM bindings
    // reference, otherwise validateDomBindings() throws.
    const ir = buildComponentIR({
      name: "TestComponent",
      anatomy: {
        parts: ["wrapper", "field"],
        dom: {
          tag: "label",
          part: "wrapper",
          children: [
            {
              tag: "input",
              part: "field",
              attrs: { type: "checkbox", role: "switch" },
              bindings: {
                checked: "channel:checked.value",
                onChange: "channel:checked.onChange",
                disabled: "prop:disabled",
              },
            },
            { tag: "slot" },
          ],
        } as any,
      },
      channels: {
        checked: { value: "checked", defaultValue: "defaultChecked", onChange: "onCheckedChange" },
      },
      props: {
        styled: {
          members: [
            { name: "checked", type: "boolean" },
            { name: "defaultChecked", type: "boolean" },
            { name: "onCheckedChange", type: "(value: boolean) => void" },
            { name: "disabled", type: "boolean" },
          ],
        },
      },
    } as ComponentContract);
    expect(ir.dom).toEqual({
      tag: "label",
      slotName: undefined,
      part: "wrapper",
      attrs: {},
      bindings: {},
      children: [
        {
          tag: "input",
          slotName: undefined,
          part: "field",
          attrs: { type: "checkbox", role: "switch" },
          bindings: {
            checked: { kind: "channel", channel: "checked", field: "value" },
            onChange: { kind: "channel", channel: "checked", field: "onChange" },
            disabled: { kind: "prop", prop: "disabled" },
          },
          children: [],
          ifProp: undefined,
          ifNegated: false,
        },
        {
          tag: "slot",
          slotName: undefined,
          part: undefined,
          attrs: {},
          bindings: {},
          children: [],
          ifProp: undefined,
          ifNegated: false,
        },
      ],
      ifProp: undefined,
      ifNegated: false,
    });
  });

  it("carries the slot name through the IR when a slot declares one", () => {
    const ir = buildComponentIR(
      withDom({
        tag: "div",
        children: [
          { tag: "slot", name: "title" } as ContractDomNode,
          { tag: "slot" } as ContractDomNode,
        ],
      }),
    );
    expect(ir.dom?.children[0].slotName).toBe("title");
    expect(ir.dom?.children[1].slotName).toBeUndefined();
  });

  it("leaves slotName undefined for non-slot nodes even if they accidentally carry a name", () => {
    // Defensive: only `tag: "slot"` should produce a slotName. A `<div name="foo">`
    // would set slotName=undefined; the `name` attribute would still need to
    // flow through attrs if the contract intended it.
    const ir = buildComponentIR(
      withDom({ tag: "div", name: "foo" } as unknown as ContractDomNode),
    );
    expect(ir.dom?.slotName).toBeUndefined();
  });

  it("preserves the if guard for conditional rendering", () => {
    const ir = buildComponentIR(
      withDom({
        tag: "div",
        children: [{ tag: "span", part: "label", if: "children" }],
      }),
    );
    expect(ir.dom?.children[0].ifProp).toBe("children");
  });
});

describe("if-prop validation", () => {
  it("rejects if-prop references that don't resolve to a prop or channel", () => {
    // The bug this guards against: contracts with `if: "validating"` when
    // `validating` is neither a prop nor a channel — the React emitter
    // previously produced `{validating && ...}` which throws ReferenceError.
    expect(() =>
      buildComponentIR({
        name: "BrokenGuard",
        anatomy: {
          parts: ["root", "indicator"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              { tag: "span", part: "indicator", if: "bogus" },
            ],
          },
        },
        props: { styled: { members: [{ name: "label", type: "string" }] } },
      } as ComponentContract),
    ).toThrow(/'if: "bogus"' does not resolve/);
  });

  it("accepts if-prop matching a declared prop", () => {
    expect(() =>
      buildComponentIR({
        name: "GoodGuardProp",
        anatomy: {
          parts: ["root", "label"],
          dom: {
            tag: "div",
            part: "root",
            children: [{ tag: "label", part: "label", if: "labelText" }],
          },
        },
        props: {
          styled: { members: [{ name: "labelText", type: "string" }] },
        },
      } as ComponentContract),
    ).not.toThrow();
  });

  it("accepts if-prop matching a channel name", () => {
    expect(() =>
      buildComponentIR({
        name: "GoodGuardChannel",
        anatomy: {
          parts: ["root", "panel"],
          dom: {
            tag: "div",
            part: "root",
            children: [{ tag: "div", part: "panel", if: "open" }],
          },
        },
        channels: {
          open: { value: "open", onChange: "onOpenChange", valueType: "boolean" },
        },
        props: {
          styled: {
            members: [
              { name: "open", type: "boolean" },
              { name: "onOpenChange", type: "(open: boolean) => void" },
            ],
          },
        },
      } as ComponentContract),
    ).not.toThrow();
  });

  it("accepts if-prop matching a channel value-prop (different from channel name)", () => {
    // Some contracts name the channel something abstract (e.g. `openness`) but
    // the actual prop the consumer passes is `open`. Both must validate.
    expect(() =>
      buildComponentIR({
        name: "GoodGuardChannelValueProp",
        anatomy: {
          parts: ["root", "panel"],
          dom: {
            tag: "div",
            part: "root",
            children: [{ tag: "div", part: "panel", if: "open" }],
          },
        },
        channels: {
          openness: {
            value: "open",
            onChange: "onOpenChange",
            valueType: "boolean",
          },
        },
        props: {
          styled: {
            members: [
              { name: "open", type: "boolean" },
              { name: "onOpenChange", type: "(open: boolean) => void" },
            ],
          },
        },
      } as ComponentContract),
    ).not.toThrow();
  });

  it("accepts the literal 'children' as the if-prop", () => {
    expect(() =>
      buildComponentIR({
        name: "GoodGuardChildren",
        anatomy: {
          parts: ["root", "label"],
          dom: {
            tag: "div",
            part: "root",
            children: [{ tag: "span", part: "label", if: "children" }],
          },
        },
      } as ComponentContract),
    ).not.toThrow();
  });
});
