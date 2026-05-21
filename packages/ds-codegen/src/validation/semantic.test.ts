/**
 * Tests for the beyond-schema semantic validator.
 *
 * Each test pins one rule. Positive tests assert "no issue raised for
 * this rule"; negative tests assert "exactly this issue raised". We do
 * not assert on issue ordering across rules (the validator's output
 * order is an implementation detail), only that the expected pointer
 * appears in the issue list for the failing case.
 */

import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { validateContractSemantics } from "./semantic.js";

function issueAt(issues: { pointer: string }[], pointer: string): boolean {
  return issues.some((i) => i.pointer === pointer);
}

function base(extra: Partial<ComponentContract>): ComponentContract {
  return {
    name: "Test",
    layer: "compound",
    anatomy: { parts: ["root"] },
    props: { styled: { members: [] } },
    ...extra,
  } as ComponentContract;
}

describe("validateContractSemantics — clean contracts", () => {
  it("raises no issues for a minimal compound", () => {
    expect(validateContractSemantics(base({}))).toEqual([]);
  });

  it("raises no issues for a composer with channels + focus", () => {
    const contract = base({
      layer: "composer",
      props: {
        styled: {
          members: [
            { name: "open", type: "boolean", description: "Controlled openness" },
            { name: "onOpenChange", type: "(v: boolean) => void", description: "cb" },
          ],
        },
      },
      channels: {
        openness: {
          value: "open",
          onChange: "onOpenChange",
        },
      },
      focus: { strategy: "trap" },
    });
    expect(validateContractSemantics(contract)).toEqual([]);
  });
});

describe("validateContractSemantics — cross-reference rules", () => {
  it("flags anatomy.details key not in anatomy.parts", () => {
    const c = base({
      anatomy: {
        parts: ["root"],
        details: { phantom: { description: "x" } },
      },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/anatomy/details/phantom")).toBe(true);
  });

  it("flags relationships.from referencing a non-existent part", () => {
    const c = base({
      anatomy: { parts: ["root", "content"] },
      relationships: [{ from: "panel", to: "content", attribute: "aria-labelledby" }],
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/relationships/0/from")).toBe(true);
  });

  it("flags relationships.to referencing a non-existent part", () => {
    const c = base({
      anatomy: { parts: ["root", "trigger"] },
      relationships: [{ from: "trigger", to: "listbox", attribute: "aria-controls" }],
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/relationships/0/to")).toBe(true);
  });

  it("flags channels.value referencing a missing prop", () => {
    const c = base({
      layer: "composer",
      props: { styled: { members: [] } },
      channels: { selection: { value: "selectedRows", onChange: "onSelectionChange" } },
      focus: { strategy: "auto" },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/channels/selection/value")).toBe(true);
    expect(issueAt(issues, "/channels/selection/onChange")).toBe(true);
  });

  it("flags channels referencing props in non-styled buckets too", () => {
    const c = base({
      layer: "composer",
      props: {
        designed: {
          members: [{ name: "open", type: "boolean", description: "" }],
        },
      },
      channels: { openness: { value: "open", onChange: "onChange" } },
      focus: { strategy: "auto" },
    });
    const issues = validateContractSemantics(c);
    // open exists in designed; onChange does not exist anywhere.
    expect(issueAt(issues, "/channels/openness/value")).toBe(false);
    expect(issueAt(issues, "/channels/openness/onChange")).toBe(true);
  });

  it("flags events.emittedVia referencing a missing prop", () => {
    const c = base({
      props: {
        styled: { members: [{ name: "onValueChange", type: "fn", description: "" }] },
      },
      events: {
        valueChange: {
          description: "fires",
          emittedVia: ["onChange"], // wrong — prop is onValueChange
        },
      },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/events/valueChange/emittedVia/0")).toBe(true);
  });

  it("flags form.labeling.via referencing a missing prop", () => {
    const c = base({
      props: { styled: { members: [{ name: "name", type: "string", description: "" }] } },
      form: {
        participates: true,
        labeling: { via: ["prop:label"] }, // wrong — no `label` prop
      } as never,
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/form/labeling/via/0")).toBe(true);
  });

  it("ignores form.labeling.via entries that don't start with prop:", () => {
    const c = base({
      props: { styled: { members: [] } },
      form: {
        participates: true,
        labeling: { via: ["aria-label", "wrapping-label"] },
      } as never,
    });
    expect(validateContractSemantics(c)).toEqual([]);
  });

  it("flags stateMachine.from referencing a state outside states.dimensions", () => {
    const c = base({
      states: {
        dimensions: { openness: { values: ["closed", "expanded"] } },
      },
      stateMachine: {
        transitions: [
          { event: "open", from: "openness=collapsed", to: "openness=expanded" },
        ],
      },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/stateMachine/transitions/0/from")).toBe(true);
  });

  it("flags stateMachine.from as string-array entries individually", () => {
    const c = base({
      states: {
        dimensions: { openness: { values: ["closed", "expanded"] } },
      },
      // Schema-side widening: `from` may be string | string[]. The
      // contract type still declares string; cast through unknown
      // so the test exercises the wire shape.
      stateMachine: {
        transitions: [
          { event: "toggle", from: ["openness=closed", "openness=phantom"] as unknown as string, to: "openness=expanded" },
        ],
      },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/stateMachine/transitions/0/from/1")).toBe(true);
    expect(issueAt(issues, "/stateMachine/transitions/0/from/0")).toBe(false);
  });

  it("skips stateMachine cross-check when states is a flat array (legacy)", () => {
    const c = base({
      states: ["default", "hover"],
      stateMachine: {
        transitions: [{ event: "hover", from: "default", to: "hover" }],
      },
    } as Partial<ComponentContract>);
    // Legacy form — can't cross-check; should not flag.
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/stateMachine/transitions/0/from")).toBe(false);
    expect(issueAt(issues, "/stateMachine/transitions/0/to")).toBe(false);
  });

  it("flags anatomy.dom binding referencing a missing channel", () => {
    const c = base({
      anatomy: {
        parts: ["root", "input"],
        dom: {
          tag: "label",
          part: "root",
          children: [
            {
              tag: "input",
              part: "input",
              bindings: {
                checked: "channel:checked.value", // no `checked` channel declared
              },
            },
          ],
        },
      },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/anatomy/dom/children/0/bindings/checked")).toBe(true);
  });

  it("flags anatomy.dom binding referencing a missing prop", () => {
    const c = base({
      props: { styled: { members: [] } },
      anatomy: {
        parts: ["root"],
        dom: {
          tag: "button",
          part: "root",
          bindings: { disabled: "prop:isDisabled" },
        },
      },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/anatomy/dom/bindings/disabled")).toBe(true);
  });
});

describe("validateContractSemantics — layer-conditional rules", () => {
  it("flags a composer that does not declare focus", () => {
    const c = base({
      layer: "composer",
      props: { styled: { members: [{ name: "open", type: "boolean", description: "" }] } },
      channels: { openness: { value: "open", onChange: "onOpenChange" } },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/focus")).toBe(true);
  });

  it("flags a composer with empty channels", () => {
    const c = base({ layer: "composer", focus: { strategy: "trap" } });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/channels")).toBe(true);
  });

  it("flags a primitive that declares dismissal", () => {
    const c = base({
      layer: "primitive",
      dismissal: { triggers: [{ event: "escape" }] } as never,
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/dismissal")).toBe(true);
  });

  it("allows a primitive with empty dismissal triggers", () => {
    const c = base({
      layer: "primitive",
      dismissal: { triggers: [] } as never,
    });
    expect(validateContractSemantics(c)).toEqual([]);
  });

  it("flags a primitive that enables portal", () => {
    const c = base({
      layer: "primitive",
      portal: { enabled: true },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/portal/enabled")).toBe(true);
  });

  it("flags a primitive that traps focus", () => {
    const c = base({
      layer: "primitive",
      focus: { strategy: "trap" },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/focus/strategy")).toBe(true);
  });

  it("flags a primitive with roving focus", () => {
    const c = base({
      layer: "primitive",
      focus: { strategy: "roving" },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/focus/strategy")).toBe(true);
  });

  it("allows a primitive with auto/manual/none focus strategies", () => {
    for (const strat of ["auto", "manual", "none"] as const) {
      const c = base({ layer: "primitive", focus: { strategy: strat } });
      expect(validateContractSemantics(c)).toEqual([]);
    }
  });

  it("allows a primitive carrying a single channel (Checkbox/Switch pattern)", () => {
    const c = base({
      layer: "primitive",
      props: {
        styled: {
          members: [
            { name: "checked", type: "boolean", description: "" },
            { name: "onChange", type: "fn", description: "" },
          ],
        },
      },
      channels: { checked: { value: "checked", onChange: "onChange" } },
    });
    expect(validateContractSemantics(c)).toEqual([]);
  });

  it("flags a compound that declares channels", () => {
    const c = base({
      layer: "compound",
      props: {
        styled: {
          members: [
            { name: "selected", type: "string[]", description: "" },
            { name: "onSelectionChange", type: "fn", description: "" },
          ],
        },
      },
      channels: { selection: { value: "selected", onChange: "onSelectionChange" } },
    });
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/channels")).toBe(true);
  });
});
