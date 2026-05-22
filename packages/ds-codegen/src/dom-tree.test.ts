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
      events: {},
      content: undefined,
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
                disabled: "prop:disabled",
              },
              events: {
                change: "channel:checked.onChange",
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
      events: {},
      content: undefined,
      children: [
        {
          tag: "input",
          slotName: undefined,
          part: "field",
          attrs: { type: "checkbox", role: "switch" },
          bindings: {
            checked: { kind: "channel", channel: "checked", field: "value" },
            disabled: { kind: "prop", prop: "disabled" },
          },
          events: {
            change: { kind: "channel", channel: "checked", field: "onChange" },
          },
          content: undefined,
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
          events: {},
          content: undefined,
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

describe("legacy bindings shapes hard-reject (IR-DOM-BINDING-CAPABILITY-01/4C)", () => {
  // After step 4C, the IR rejects the three legacy shapes that used to
  // be auto-translated. These tests pin the rejection so a future
  // refactor can't silently reintroduce the dual-pathway retention.

  it("rejects bindings.onClick with an actionable message", () => {
    expect(() =>
      buildComponentIR({
        name: "LegacyEventBinding",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "button",
            part: "root",
            attrs: { type: "button" },
            bindings: {
              onClick: "prop:onPress",
            } as any,
          },
        },
        props: {
          styled: {
            members: [
              { name: "onPress", type: "() => void" },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/bindings\.onClick is an event-shaped key.*events.*click/);
  });

  it("rejects bindings.onChange with an actionable message", () => {
    expect(() =>
      buildComponentIR({
        name: "LegacyChangeBinding",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "input",
            part: "root",
            bindings: {
              onChange: "channel:value.onChange",
            } as any,
          },
        },
        channels: {
          value: { value: "value", onChange: "onValueChange", valueType: "string" },
        },
        props: {
          styled: {
            members: [
              { name: "value", type: "string" },
              { name: "onValueChange", type: "(v: string) => void" },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/bindings\.onChange is an event-shaped key.*events.*change/);
  });

  it("rejects bindings.children with an actionable message", () => {
    expect(() =>
      buildComponentIR({
        name: "LegacyChildrenBinding",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "span",
            part: "root",
            bindings: {
              children: "prop:icon",
            } as any,
          },
        },
        props: {
          styled: {
            members: [
              { name: "icon", type: "ReactNode" },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/bindings\.children smuggles inner content.*content.*prop:icon/);
  });

  it("rejects bindings.textContent with an actionable message", () => {
    expect(() =>
      buildComponentIR({
        name: "LegacyTextContentBinding",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "span",
            part: "root",
            bindings: {
              textContent: "prop:label",
            } as any,
          },
        },
        props: {
          styled: {
            members: [
              { name: "label", type: "string" },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/bindings\.textContent smuggles inner content.*content.*prop:label/);
  });

  it("rejects content + children on the same node", () => {
    expect(() =>
      buildComponentIR({
        name: "ContentAndChildrenConflict",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "div",
            part: "root",
            content: "prop:label",
            children: [{ tag: "span" }],
          } as any,
        },
        props: {
          styled: {
            members: [
              { name: "label", type: "string" },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/`content` and `children` are mutually exclusive/);
  });

  it("accepts the canonical authoring path", () => {
    // The post-4C shape. Should parse without throwing and surface all
    // three fields on the IR.
    const ir = buildComponentIR({
      name: "CanonicalAuthoring",
      anatomy: {
        parts: ["root", "icon", "dismiss"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "span",
              part: "icon",
              attrs: { "aria-hidden": "true" },
              content: "prop:icon",
            },
            {
              tag: "button",
              part: "dismiss",
              attrs: { type: "button" },
              bindings: { "aria-label": "prop:dismissLabel" },
              events: { click: "prop:onDismiss" },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [
            { name: "icon", type: "ReactNode" },
            { name: "onDismiss", type: "() => void" },
            { name: "dismissLabel", type: "string" },
          ],
        },
      },
    } as ComponentContract);

    const root = ir.dom!;
    expect(root.children).toHaveLength(2);
    // icon: content set, bindings empty, events empty.
    expect(root.children[0].content).toEqual({ kind: "prop", prop: "icon" });
    expect(root.children[0].bindings).toEqual({});
    expect(root.children[0].events).toEqual({});
    // dismiss: bindings.aria-label and events.click set, content undefined.
    expect(root.children[1].bindings).toEqual({
      "aria-label": { kind: "prop", prop: "dismissLabel" },
    });
    expect(root.children[1].events).toEqual({
      click: { kind: "prop", prop: "onDismiss" },
    });
    expect(root.children[1].content).toBeUndefined();
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
