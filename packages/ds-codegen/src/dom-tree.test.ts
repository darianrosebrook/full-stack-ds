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

  // BINDING-EXPRESSION-V2-01: the `iter:` form names the *role* of an
  // iteration local (index vs item), not a specific lexical variable.
  // The IR resolves the role to the enclosing iteration's declared
  // `indexVar` / `itemVar` at lowering time.
  it("parses iter:index bindings", () => {
    expect(parseBindingExpression("iter:index")).toEqual({
      kind: "iterationLocal",
      local: "index",
    });
  });

  it("parses iter:item bindings", () => {
    expect(parseBindingExpression("iter:item")).toEqual({
      kind: "iterationLocal",
      local: "item",
    });
  });

  it("rejects unknown iter: locals as literals (visible failure)", () => {
    // Only "index" and "item" are valid. Anything else falls through to
    // literal so the typo appears in output.
    expect(parseBindingExpression("iter:row")).toEqual({
      kind: "literal",
      value: "iter:row",
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
      iteration: undefined,
      cssVarBindings: [],
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
          iteration: undefined,
          cssVarBindings: [],
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
          iteration: undefined,
          cssVarBindings: [],
        },
      ],
      ifProp: undefined,
      ifNegated: false,
      iteration: undefined,
      cssVarBindings: [],
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

describe("iterate directive", () => {
  it("parses count-driven iteration into IterationIR", () => {
    const ir = buildComponentIR({
      name: "OTP",
      anatomy: {
        parts: ["root", "field"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "input",
              part: "field",
              iterate: {
                source: "prop:length",
                kind: "count",
                indexVar: "fieldIndex",
              },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [{ name: "length", type: "number", default: 6 }],
        },
      },
    } as ComponentContract);
    const field = ir.dom!.children[0];
    expect(field.iteration).toEqual({
      kind: "count",
      source: { kind: "prop", prop: "length" },
      sourceProp: "length",
      indexVar: "fieldIndex",
      itemVar: undefined,
      itemType: undefined,
    });
  });

  it("defaults indexVar to 'index' when omitted", () => {
    const ir = buildComponentIR({
      name: "Pin",
      anatomy: {
        parts: ["root", "dot"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "span",
              part: "dot",
              iterate: { source: "prop:count", kind: "count" },
            },
          ],
        },
      },
      props: { styled: { members: [{ name: "count", type: "number" }] } },
    } as ComponentContract);
    expect(ir.dom!.children[0].iteration!.indexVar).toBe("index");
  });

  it("parses array-driven iteration with itemVar/itemType", () => {
    const ir = buildComponentIR({
      name: "Calendar",
      types: {
        CalendarDay: {
          kind: "object",
          fields: { date: "string", isToday: "boolean" },
        },
      },
      anatomy: {
        parts: ["root", "cell"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "td",
              part: "cell",
              iterate: {
                source: "prop:days",
                kind: "array",
                itemVar: "day",
                itemType: "CalendarDay",
              },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [{ name: "days", type: "CalendarDay[]" }],
        },
      },
    } as ComponentContract);
    expect(ir.dom!.children[0].iteration).toEqual({
      kind: "array",
      source: { kind: "prop", prop: "days" },
      sourceProp: "days",
      indexVar: "index",
      itemVar: "day",
      itemType: "CalendarDay",
    });
  });

  it("defaults itemVar to 'item' for array iteration when omitted", () => {
    const ir = buildComponentIR({
      name: "Stack",
      types: { Item: { kind: "object", fields: { id: "string" } } },
      anatomy: {
        parts: ["root", "row"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "div",
              part: "row",
              iterate: {
                source: "prop:items",
                kind: "array",
                itemType: "Item",
              },
            },
          ],
        },
      },
      props: { styled: { members: [{ name: "items", type: "Item[]" }] } },
    } as ComponentContract);
    expect(ir.dom!.children[0].iteration!.itemVar).toBe("item");
  });

  it("rejects iterate.source when the named prop is not declared", () => {
    expect(() =>
      buildComponentIR({
        name: "Broken",
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: { source: "prop:nope", kind: "count" },
              },
            ],
          },
        },
        props: { styled: { members: [{ name: "other", type: "number" }] } },
      } as ComponentContract),
    ).toThrow(/iterate\.source references unknown prop 'nope'/);
  });

  it("rejects count iteration when the source prop is not number-typed", () => {
    expect(() =>
      buildComponentIR({
        name: "BadCount",
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: { source: "prop:label", kind: "count" },
              },
            ],
          },
        },
        props: { styled: { members: [{ name: "label", type: "string" }] } },
      } as ComponentContract),
    ).toThrow(/kind="count" requires prop 'label' to be typed 'number'/);
  });

  it("rejects array iteration when the source prop is not array-typed", () => {
    expect(() =>
      buildComponentIR({
        name: "BadArray",
        types: { Item: { kind: "object", fields: { id: "string" } } },
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: {
                  source: "prop:single",
                  kind: "array",
                  itemType: "Item",
                },
              },
            ],
          },
        },
        props: { styled: { members: [{ name: "single", type: "Item" }] } },
      } as ComponentContract),
    ).toThrow(/kind="array" requires prop 'single' to be an array type/);
  });

  it("rejects array iteration without itemType", () => {
    expect(() =>
      buildComponentIR({
        name: "NoItemType",
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: { source: "prop:items", kind: "array" },
              },
            ],
          },
        },
        props: { styled: { members: [{ name: "items", type: "string[]" }] } },
      } as ComponentContract),
    ).toThrow(/iterate\.kind="array" requires `itemType`/);
  });

  it("rejects iterate.source kinds outside { prop, channel.value }", () => {
    // PRODUCTION-ARRAY-ITERATION-CONSUMER-01: channel:X.value is now an
    // accepted iteration source (in addition to prop:X). Sources that
    // remain rejected are literal:, iter:, and channel:X.{onChange,
    // defaultValue} — none of which represent an iterable value.
    expect(() =>
      buildComponentIR({
        name: "LiteralSource",
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: { source: "literal:5", kind: "count" },
              },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/must be a prop: or channel:<name>\.value/);
  });

  it("rejects channel:X.value iterate.source when X is not a known channel", () => {
    expect(() =>
      buildComponentIR({
        name: "UnknownChannelSource",
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: { source: "channel:nonexistent.value", kind: "count" },
              },
            ],
          },
        },
        // No channels declared.
        props: { styled: { members: [] } },
      } as ComponentContract),
    ).toThrow(/iterate\.source references unknown channel 'nonexistent'/);
  });

  it("accepts channel:X.value iterate.source when X is declared", () => {
    const ir = buildComponentIR({
      name: "ChannelArraySource",
      anatomy: {
        parts: ["root", "x"],
        dom: {
          tag: "ul",
          part: "root",
          children: [
            {
              tag: "li",
              part: "x",
              iterate: {
                source: "channel:selection.value",
                kind: "array",
                itemType: "string",
              },
              children: [{ tag: "span", content: "iter:item" }],
            },
          ],
        },
      },
      channels: {
        selection: {
          value: "value",
          defaultValue: "defaultValue",
          onChange: "onValueChange",
          valueType: "string[]",
        },
      },
      props: {
        styled: {
          members: [
            { name: "value", type: "string[]" },
            { name: "defaultValue", type: "string[]" },
            { name: "onValueChange", type: "(value: string[]) => void" },
          ],
        },
      },
    } as unknown as ComponentContract);
    // The iteration's source binding survives intact; sourceProp is
    // resolved to the channel's valueProp by the validator.
    const iter = ir.dom!.children[0].iteration!;
    expect(iter.source).toEqual({
      kind: "channel",
      channel: "selection",
      field: "value",
    });
    expect(iter.sourceProp).toBe("value");
  });

  it("rejects iterate + content on the same node", () => {
    expect(() =>
      buildComponentIR({
        name: "IterContent",
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "span",
                part: "x",
                iterate: { source: "prop:n", kind: "count" },
                content: "prop:label",
              },
            ],
          },
        },
        props: {
          styled: {
            members: [
              { name: "n", type: "number" },
              { name: "label", type: "string" },
            ],
          },
        },
      } as ComponentContract),
    ).toThrow(/`iterate` and `content` are mutually exclusive/);
  });

  it("accepts Array<T> and ReadonlyArray<T> as array-typed sources", () => {
    expect(() =>
      buildComponentIR({
        name: "GenericArray",
        types: { Item: { kind: "object", fields: { id: "string" } } },
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: {
                  source: "prop:items",
                  kind: "array",
                  itemType: "Item",
                },
              },
            ],
          },
        },
        props: {
          styled: { members: [{ name: "items", type: "Array<Item>" }] },
        },
      } as ComponentContract),
    ).not.toThrow();
    expect(() =>
      buildComponentIR({
        name: "ReadonlyArray",
        types: { Item: { kind: "object", fields: { id: "string" } } },
        anatomy: {
          parts: ["root", "x"],
          dom: {
            tag: "div",
            part: "root",
            children: [
              {
                tag: "div",
                part: "x",
                iterate: {
                  source: "prop:items",
                  kind: "array",
                  itemType: "Item",
                },
              },
            ],
          },
        },
        props: {
          styled: {
            members: [{ name: "items", type: "ReadonlyArray<Item>" }],
          },
        },
      } as ComponentContract),
    ).not.toThrow();
  });
});

describe("cssVariableBindings", () => {
  it("parses well-formed bindings into CssVarBindingIR[] in order", () => {
    const ir = buildComponentIR({
      name: "Progress",
      anatomy: {
        parts: ["root", "fill"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "div",
              part: "fill",
              cssVariableBindings: {
                "--fsds-progress-fill-width": "prop:value",
                "--fsds-progress-intent": "prop:intent",
              },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [
            { name: "value", type: "number" },
            { name: "intent", type: "string" },
          ],
        },
      },
    } as ComponentContract);
    const fill = ir.dom!.children[0];
    expect(fill.cssVarBindings).toEqual([
      {
        varName: "--fsds-progress-fill-width",
        value: { kind: "prop", prop: "value" },
      },
      {
        varName: "--fsds-progress-intent",
        value: { kind: "prop", prop: "intent" },
      },
    ]);
  });

  it("rejects var names that don't include the component's cssPrefix", () => {
    expect(() =>
      buildComponentIR({
        name: "Progress",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "div",
            part: "root",
            cssVariableBindings: {
              "--fsds-truncate-lines": "prop:value",
            },
          },
        },
        props: {
          styled: { members: [{ name: "value", type: "number" }] },
        },
      } as ComponentContract),
    ).toThrow(/must match --fsds-progress-<name>/);
  });

  it("rejects bindings that reference an unknown prop", () => {
    expect(() =>
      buildComponentIR({
        name: "Progress",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "div",
            part: "root",
            cssVariableBindings: {
              "--fsds-progress-value": "prop:nope",
            },
          },
        },
        props: { styled: { members: [{ name: "value", type: "number" }] } },
      } as ComponentContract),
    ).toThrow(
      /cssVariableBindings '--fsds-progress-value' references unknown prop 'nope'/,
    );
  });

  it("rejects cssVariableBindings + literal attrs.style on the same node", () => {
    expect(() =>
      buildComponentIR({
        name: "Progress",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "div",
            part: "root",
            attrs: { style: "color: red;" },
            cssVariableBindings: {
              "--fsds-progress-value": "prop:value",
            },
          },
        },
        props: { styled: { members: [{ name: "value", type: "number" }] } },
      } as ComponentContract),
    ).toThrow(
      /`cssVariableBindings` and a literal `attrs.style` cannot both be set/,
    );
  });

  it("leaves cssVarBindings empty for nodes without the field", () => {
    const ir = buildComponentIR({
      name: "Bare",
      anatomy: {
        parts: ["root"],
        dom: { tag: "div", part: "root" },
      },
    } as ComponentContract);
    expect(ir.dom!.cssVarBindings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// BINDING-EXPRESSION-V2-01: iteration-local grammar + V1 normalization
// ---------------------------------------------------------------------------

describe("BindingExpressionV2 — iteration locals", () => {
  function withIteratingDom(opts: {
    iterateKind: "count" | "array";
    iterateSource: string;
    binding: string;
    extraProps?: Array<{ name: string; type: string }>;
  }): ComponentContract {
    return {
      name: "V2Fixture",
      cssPrefix: "v2-fixture",
      anatomy: {
        parts: ["root", "cell"],
        dom: {
          tag: "ul",
          part: "root",
          children: [
            {
              tag: "li",
              part: "cell",
              iterate:
                opts.iterateKind === "array"
                  ? {
                      source: opts.iterateSource,
                      kind: "array",
                      itemType: "string",
                    }
                  : { source: opts.iterateSource, kind: "count" },
              bindings: { "data-index": opts.binding },
            },
          ],
        },
      },
      props: {
        styled: {
          members: [
            opts.iterateKind === "count"
              ? { name: "count", type: "number" }
              : {
                  name: "rows",
                  type: "string[]",
                  description: "Items to render",
                },
            ...(opts.extraProps ?? []),
          ],
        },
      },
    } as unknown as ComponentContract;
  }

  it("auto-promotes prop:index inside count iteration to iterationLocal", () => {
    const ir = buildComponentIR(
      withIteratingDom({
        iterateKind: "count",
        iterateSource: "prop:count",
        binding: "prop:index",
      }),
    );
    expect(ir.dom!.children[0].bindings["data-index"]).toEqual({
      kind: "iterationLocal",
      local: "index",
    });
  });

  it("auto-promotes prop:item inside array iteration to iterationLocal", () => {
    const ir = buildComponentIR(
      withIteratingDom({
        iterateKind: "array",
        iterateSource: "prop:rows",
        binding: "prop:item",
      }),
    );
    expect(ir.dom!.children[0].bindings["data-index"]).toEqual({
      kind: "iterationLocal",
      local: "item",
    });
  });

  it("accepts explicit iter:index form (no auto-promotion needed)", () => {
    const ir = buildComponentIR(
      withIteratingDom({
        iterateKind: "count",
        iterateSource: "prop:count",
        binding: "iter:index",
      }),
    );
    expect(ir.dom!.children[0].bindings["data-index"]).toEqual({
      kind: "iterationLocal",
      local: "index",
    });
  });

  it("does NOT promote prop:X when X is not the iteration's declared indexVar/itemVar", () => {
    // Real prop named "foo" — still a prop binding, not an iteration local.
    const ir = buildComponentIR(
      withIteratingDom({
        iterateKind: "count",
        iterateSource: "prop:count",
        binding: "prop:foo",
        extraProps: [{ name: "foo", type: "string" }],
      }),
    );
    expect(ir.dom!.children[0].bindings["data-index"]).toEqual({
      kind: "prop",
      prop: "foo",
    });
  });

  it("rejects iter:item under count iteration (no item exists)", () => {
    expect(() =>
      buildComponentIR(
        withIteratingDom({
          iterateKind: "count",
          iterateSource: "prop:count",
          binding: "iter:item",
        }),
      ),
    ).toThrow(/iter:item.*count-kind iteration/);
  });

  it("accepts iter:item under array iteration", () => {
    const ir = buildComponentIR(
      withIteratingDom({
        iterateKind: "array",
        iterateSource: "prop:rows",
        binding: "iter:item",
      }),
    );
    expect(ir.dom!.children[0].bindings["data-index"]).toEqual({
      kind: "iterationLocal",
      local: "item",
    });
  });

  it("rejects iter:index outside any iteration scope", () => {
    expect(() =>
      buildComponentIR({
        name: "V2NoIter",
        cssPrefix: "v2-no-iter",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "div",
            part: "root",
            bindings: { "data-index": "iter:index" },
          },
        },
        props: { styled: { members: [] } },
      } as unknown as ComponentContract),
    ).toThrow(/iter:index.*not inside any `iterate` block/);
  });

  it("rejects prop:undeclared outside iteration (validation still catches typos)", () => {
    // Pre-V2 sanity: outside iteration, `prop:index` must refer to a real
    // prop named `index`. With no such prop declared, validation throws.
    expect(() =>
      buildComponentIR({
        name: "V2BadProp",
        cssPrefix: "v2-bad",
        anatomy: {
          parts: ["root"],
          dom: {
            tag: "div",
            part: "root",
            bindings: { "data-x": "prop:index" },
          },
        },
        props: { styled: { members: [] } },
      } as unknown as ComponentContract),
    ).toThrow(/references unknown prop 'index'/);
  });

  it("nested iterations resolve iter:index to the nearest enclosing scope", () => {
    // The inner iteration's indexVar shadows the outer one's. A binding on
    // the inner iterating node sees the inner index.
    const ir = buildComponentIR({
      name: "V2Nested",
      cssPrefix: "v2-nested",
      anatomy: {
        parts: ["outer", "inner"],
        dom: {
          tag: "ul",
          part: "outer",
          children: [
            {
              tag: "li",
              iterate: { source: "prop:outerRows", kind: "array", itemType: "string[]" },
              children: [
                {
                  tag: "span",
                  part: "inner",
                  iterate: { source: "prop:innerCount", kind: "count" },
                  bindings: { "data-inner-index": "iter:index" },
                },
              ],
            },
          ],
        },
      },
      props: {
        styled: {
          members: [
            { name: "outerRows", type: "string[][]" },
            { name: "innerCount", type: "number" },
          ],
        },
      },
    } as unknown as ComponentContract);
    const inner = ir.dom!.children[0].children[0];
    expect(inner.bindings["data-inner-index"]).toEqual({
      kind: "iterationLocal",
      local: "index",
    });
  });

  it("resolves iter:index to the iteration's declared indexVar at emit (not literal 'index')", () => {
    // Contract author overrides indexVar; the IR still carries
    // { kind: "iterationLocal", local: "index" } — the emitter looks up
    // the lexical name from the iteration's indexVar when lowering.
    const ir = buildComponentIR({
      name: "V2Renamed",
      cssPrefix: "v2-renamed",
      anatomy: {
        parts: ["root", "cell"],
        dom: {
          tag: "ul",
          part: "root",
          children: [
            {
              tag: "li",
              part: "cell",
              iterate: { source: "prop:count", kind: "count", indexVar: "dayIndex" },
              bindings: { "data-day": "iter:index" },
            },
          ],
        },
      },
      props: { styled: { members: [{ name: "count", type: "number" }] } },
    } as unknown as ComponentContract);
    // IR carries the role, not the variable name. The variable name
    // lives on `iteration.indexVar` and is resolved at emit time.
    expect(ir.dom!.children[0].bindings["data-day"]).toEqual({
      kind: "iterationLocal",
      local: "index",
    });
    expect(ir.dom!.children[0].iteration!.indexVar).toBe("dayIndex");
  });
});
