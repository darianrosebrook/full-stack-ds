import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import {
  componentNeedsInstanceId,
} from "./id-relationships.js";
import { buildComponentIR, type DomNodeIR } from "./ir.js";

/**
 * FEAT-A11Y-LABEL-ID-ASSOCIATION-01 — relationship lowering.
 *
 * These tests pin the IR-level semantics: a contract `relationships[]`
 * entry with a lowered idref attribute must produce a generated id on the
 * target element and a typed idref attribute on the source element (or
 * field-association provider facts when the target is consumer-slotted) —
 * never remain prose.
 */

function findPart(dom: DomNodeIR, part: string): DomNodeIR {
  const stack = [dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.part === part) return node;
    stack.push(...node.children);
  }
  throw new Error(`part "${part}" not found`);
}

function stringProp(name: string) {
  return { name, propType: { kind: "string" }, description: name };
}

function booleanProp(name: string) {
  return { name, propType: { kind: "boolean" }, description: name };
}

function textFieldLikeContract(): ComponentContract {
  return {
    name: "FixtureTextField",
    layer: "compound",
    cssPrefix: "fx-text-field",
    anatomy: {
      parts: ["root", "label", "field", "description", "error"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            tag: "label",
            part: "label",
            children: [{ tag: "slot", name: "label" }],
          },
          {
            tag: "input",
            part: "field",
            bindings: { "aria-describedby": "prop:ariaDescribedby" },
          },
          {
            tag: "span",
            part: "description",
            children: [{ tag: "slot", name: "description" }],
          },
          {
            tag: "span",
            part: "error",
            children: [{ tag: "slot", name: "error" }],
          },
        ],
      },
    },
    props: {
      designed: {
        members: [stringProp("ariaDescribedby"), booleanProp("invalid")],
      },
    },
    relationships: [
      { from: "field", to: "label", attribute: "aria-labelledby" },
      {
        from: "field",
        to: "description",
        attribute: "aria-describedby",
        when: "description=present",
      },
      {
        from: "field",
        to: "error",
        attribute: "aria-describedby",
        when: "invalid=true",
      },
    ],
  } as unknown as ComponentContract;
}

function fieldLikeContract(): ComponentContract {
  return {
    name: "FixtureField",
    layer: "composer",
    cssPrefix: "fx-field",
    anatomy: {
      parts: ["root", "label", "control", "help", "error"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            tag: "label",
            part: "label",
            children: [{ tag: "slot", name: "label" }],
          },
          {
            tag: "div",
            part: "control",
            children: [{ tag: "slot", name: "control" }],
          },
          {
            tag: "span",
            part: "help",
            children: [{ tag: "slot", name: "help" }],
          },
          {
            tag: "span",
            part: "error",
            children: [{ tag: "slot", name: "error" }],
          },
        ],
      },
    },
    props: { designed: { members: [stringProp("status")] } },
    relationships: [
      { from: "label", to: "control", attribute: "for" },
      {
        from: "control",
        to: "help",
        attribute: "aria-describedby",
        when: "status!=invalid",
      },
      {
        from: "control",
        to: "error",
        attribute: "aria-describedby",
        when: "status=invalid",
      },
    ],
  } as unknown as ComponentContract;
}

describe("owned-pair relationship lowering", () => {
  it("puts a generated id on the target and a typed idref attr on the source", () => {
    const ir = buildComponentIR(textFieldLikeContract());
    const label = findPart(ir.dom!, "label");
    const field = findPart(ir.dom!, "field");
    expect(label.generatedIdSlug).toBe("label");
    const labelledby = field.idRefAttrs.find(
      (a) => a.attribute === "aria-labelledby",
    );
    expect(labelledby).toEqual({
      attribute: "aria-labelledby",
      refs: [{ slug: "label", when: undefined }],
    });
  });

  it("merges same-attribute relationships and folds a prop binding into passthrough", () => {
    const ir = buildComponentIR(textFieldLikeContract());
    const field = findPart(ir.dom!, "field");
    const describedby = field.idRefAttrs.find(
      (a) => a.attribute === "aria-describedby",
    );
    // The original prop binding is absorbed — never emitted twice.
    expect(field.bindings["aria-describedby"]).toBeUndefined();
    expect(describedby?.passthroughProp).toBe("ariaDescribedby");
    // Slot-presence clause lowers unconditionally (idref to an empty
    // element contributes nothing to the accessible description).
    expect(describedby?.refs).toEqual([
      { slug: "description", when: undefined },
      {
        slug: "error",
        when: { prop: "invalid", op: "truthy", negated: false },
      },
    ]);
  });

  it("inherits the target's ifProp render guard so refs never dangle", () => {
    const contract = {
      name: "FixtureToast",
      cssPrefix: "fx-toast",
      anatomy: {
        parts: ["root", "item", "title"],
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "div",
              part: "item",
              children: [{ tag: "div", part: "title", if: "title" }],
            },
          ],
        },
      },
      props: { designed: { members: [stringProp("title")] } },
      relationships: [
        { from: "item", to: "title", attribute: "aria-labelledby" },
      ],
    } as unknown as ComponentContract;
    const ir = buildComponentIR(contract);
    const item = findPart(ir.dom!, "item");
    expect(item.idRefAttrs[0].refs).toEqual([
      { slug: "title", when: { prop: "title", op: "truthy", negated: false } },
    ]);
  });

  it("lowers eq and negated-eq when clauses against a string prop", () => {
    const ir = buildComponentIR(fieldLikeContract());
    const provider = ir.fieldAssociation?.provides;
    expect(provider?.describedBy).toEqual([
      {
        slug: "help",
        when: { prop: "status", op: "eq", value: "invalid", negated: true },
      },
      {
        slug: "error",
        when: { prop: "status", op: "eq", value: "invalid", negated: false },
      },
    ]);
  });
});

describe("skip rules (unlowerable relationships stay rail-visible gaps)", () => {
  function contractWith(
    relationships: unknown[],
    domChildren?: unknown[],
  ): ComponentContract {
    return {
      name: "FixtureSkip",
      cssPrefix: "fx-skip",
      anatomy: {
        parts: ["root", "a", "b"],
        dom: {
          tag: "div",
          part: "root",
          children: domChildren ?? [
            { tag: "span", part: "a" },
            { tag: "span", part: "b" },
          ],
        },
      },
      props: { designed: { members: [stringProp("x")] } },
      relationships,
    } as unknown as ComponentContract;
  }

  it("skips relationships whose parts are never rendered (contract overclaim)", () => {
    const ir = buildComponentIR(
      contractWith([{ from: "a", to: "ghost", attribute: "aria-labelledby" }]),
    );
    expect(findPart(ir.dom!, "a").idRefAttrs).toEqual([]);
    expect(ir.fieldAssociation).toBeUndefined();
  });

  it("skips non-lowered attributes (aria-controls belongs to another slice)", () => {
    const ir = buildComponentIR(
      contractWith([{ from: "a", to: "b", attribute: "aria-controls" }]),
    );
    expect(findPart(ir.dom!, "a").idRefAttrs).toEqual([]);
    expect(findPart(ir.dom!, "b").generatedIdSlug).toBeUndefined();
  });

  it("skips a source already carrying the attribute statically", () => {
    const ir = buildComponentIR(
      contractWith(
        [{ from: "a", to: "b", attribute: "aria-labelledby" }],
        [
          { tag: "span", part: "a", attrs: { "aria-labelledby": "external" } },
          { tag: "span", part: "b" },
        ],
      ),
    );
    expect(findPart(ir.dom!, "a").idRefAttrs).toEqual([]);
    expect(findPart(ir.dom!, "b").generatedIdSlug).toBeUndefined();
  });

  it("skips relationships inside iterations (per-item ids not modeled)", () => {
    const contract = {
      name: "FixtureIter",
      cssPrefix: "fx-iter",
      anatomy: {
        parts: ["root", "a", "b"],
        dom: {
          tag: "ul",
          part: "root",
          children: [
            {
              tag: "li",
              part: "a",
              iterate: { source: "prop:items", kind: "array", itemType: "string" },
              children: [{ tag: "span", part: "b" }],
            },
          ],
        },
      },
      props: {
        designed: {
          members: [
            {
              name: "items",
              propType: { kind: "array", items: { kind: "string" } },
              description: "items",
            },
          ],
        },
      },
      relationships: [{ from: "a", to: "b", attribute: "aria-labelledby" }],
    } as unknown as ComponentContract;
    const ir = buildComponentIR(contract);
    expect(findPart(ir.dom!, "a").idRefAttrs).toEqual([]);
  });

  it("skips an unparseable or unresolvable when clause", () => {
    const ir = buildComponentIR(
      contractWith([
        {
          from: "a",
          to: "b",
          attribute: "aria-describedby",
          when: "validity=valid",
        },
      ]),
    );
    expect(findPart(ir.dom!, "a").idRefAttrs).toEqual([]);
    expect(findPart(ir.dom!, "b").generatedIdSlug).toBeUndefined();
  });
});

describe("field-association routing (consumer-slotted targets)", () => {
  it("routes a for→slotted-control relationship through the provider", () => {
    const ir = buildComponentIR(fieldLikeContract());
    const label = findPart(ir.dom!, "label");
    const control = findPart(ir.dom!, "control");
    expect(ir.fieldAssociation?.provides?.controlSlug).toBe("control");
    // The label still binds `for` to the generated control id directly.
    expect(label.idRefAttrs).toEqual([
      { attribute: "for", refs: [{ slug: "control", when: undefined }] },
    ]);
    // No owned element carries the control id — it reaches the slotted
    // control via context, so the wrapper div must NOT get an id.
    expect(control.generatedIdSlug).toBeUndefined();
    // The describedby targets are owned elements and do carry ids.
    expect(findPart(ir.dom!, "help").generatedIdSlug).toBe("help");
    expect(findPart(ir.dom!, "error").generatedIdSlug).toBe("error");
  });

  it("marks a contract with fieldAssociation: control as a consumer", () => {
    const contract = {
      name: "FixtureInput",
      cssPrefix: "fx-input",
      fieldAssociation: "control",
      anatomy: {
        parts: ["root"],
        dom: { tag: "input", part: "root" },
      },
      props: { designed: { members: [] } },
    } as unknown as ComponentContract;
    const ir = buildComponentIR(contract);
    expect(ir.fieldAssociation).toEqual({
      provides: undefined,
      consumes: true,
    });
  });
});

describe("componentNeedsInstanceId", () => {
  it("is true for components with lowered relationships or a provider", () => {
    expect(componentNeedsInstanceId(buildComponentIR(textFieldLikeContract()))).toBe(true);
    expect(componentNeedsInstanceId(buildComponentIR(fieldLikeContract()))).toBe(true);
  });

  it("is false for components without lowered relationships", () => {
    const contract = {
      name: "FixturePlain",
      cssPrefix: "fx-plain",
      anatomy: { parts: ["root"], dom: { tag: "div", part: "root" } },
      props: { designed: { members: [] } },
    } as unknown as ComponentContract;
    expect(componentNeedsInstanceId(buildComponentIR(contract))).toBe(false);
  });
});
