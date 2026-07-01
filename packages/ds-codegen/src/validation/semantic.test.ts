/**
 * Tests for the beyond-schema semantic validator.
 *
 * Each test pins one rule. Positive tests assert "no issue raised for
 * this rule"; negative tests assert "exactly this issue raised". We do
 * not assert on issue ordering across rules (the validator's output
 * order is an implementation detail), only that the expected pointer
 * appears in the issue list for the failing case.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { validateContractSemantics, validateTextOverflow } from "./semantic.js";

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
        dimensions: { openness: { category: "visibility", values: ["closed", "expanded"], initial: "closed" } },
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
        dimensions: { openness: { category: "visibility", values: ["closed", "expanded"], initial: "closed" } },
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

// ---------------------------------------------------------------------
// Cross-axis obligation rules (docs/architecture/contract-group-axes.md).
//
// These tests are loaded from real contract JSON fixtures under
// test/fixtures/obligation-axes so the rules are exercised against the
// actual on-disk contract shape, not a hand-built partial. Each family
// asserts BOTH polarities — the rule FIRES on an incoherent fixture and
// is SILENT on a coherent sibling — so a rule that always fires (or
// never fires) is caught. We match on the typed [CODE] prefix in the
// message, not only the pointer, so a diagnostic that lands on the
// right pointer with the wrong family is also caught.
// ---------------------------------------------------------------------

const FIXTURE_DIR = path.resolve(
  fileURLToPath(import.meta.url),
  "../../../test/fixtures/obligation-axes",
);

function loadFixture(file: string): ComponentContract {
  const raw = fs.readFileSync(path.join(FIXTURE_DIR, file), "utf8");
  return JSON.parse(raw) as ComponentContract;
}

function hasCode(issues: { message: string }[], code: string): boolean {
  return issues.some((i) => i.message.includes(`[${code}]`));
}

describe("obligation rule — input data binding (OBLIGATION_INPUT_NO_DATA_BINDING)", () => {
  it("FIRES on a category:input contract that binds no data", () => {
    const issues = validateContractSemantics(
      loadFixture("input-no-binding.fail.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_INPUT_NO_DATA_BINDING")).toBe(true);
    // the diagnostic lands at /category
    expect(
      issues.some(
        (i) =>
          i.pointer === "/category" &&
          i.message.includes("OBLIGATION_INPUT_NO_DATA_BINDING"),
      ),
    ).toBe(true);
  });

  it("is SILENT when the input declares a channel", () => {
    const issues = validateContractSemantics(
      loadFixture("input-with-channel.pass.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_INPUT_NO_DATA_BINDING")).toBe(false);
  });

  it("is SILENT when the input documents a display-only exception", () => {
    const issues = validateContractSemantics(
      loadFixture("input-display-only.pass.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_INPUT_NO_DATA_BINDING")).toBe(false);
  });
});

describe("obligation rule — surface dismissal focus policy (OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY)", () => {
  it("FIRES on a dismissable surface with no focus and no escape/outside-click", () => {
    const issues = validateContractSemantics(
      loadFixture("surface-dismissal-no-policy.fail.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY")).toBe(
      true,
    );
    // both halves fire: the missing focus policy (/focus) and the
    // missing escape/outside-click affordance (/dismissal).
    expect(issueAt(issues, "/focus")).toBe(true);
    expect(issueAt(issues, "/dismissal")).toBe(true);
  });

  it("is SILENT on a dismissable surface with focus + escape/outside-click", () => {
    const issues = validateContractSemantics(
      loadFixture("surface-dismissal-with-policy.pass.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY")).toBe(
      false,
    );
  });

  it("is SILENT on a surface that declares no dismissal (obligation is conditional)", () => {
    const issues = validateContractSemantics(
      loadFixture("surface-no-dismissal.exempt.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY")).toBe(
      false,
    );
  });
});

describe("obligation rule — a2ui children host (OBLIGATION_A2UI_CHILDREN_NO_HOST)", () => {
  it("FIRES when a2ui.children.slot names a host that exists nowhere", () => {
    const issues = validateContractSemantics(
      loadFixture("a2ui-children-no-host.fail.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_A2UI_CHILDREN_NO_HOST")).toBe(true);
    expect(issueAt(issues, "/a2ui/children/slot")).toBe(true);
  });

  it("is SILENT when the named slot resolves to a real anatomy host", () => {
    const issues = validateContractSemantics(
      loadFixture("a2ui-children-real-host.pass.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_A2UI_CHILDREN_NO_HOST")).toBe(false);
  });

  it('is SILENT for the default-slot sentinel "children"', () => {
    const issues = validateContractSemantics(
      loadFixture("a2ui-children-default-slot.pass.contract.json"),
    );
    expect(hasCode(issues, "OBLIGATION_A2UI_CHILDREN_NO_HOST")).toBe(false);
  });
});

// CODEGEN-RECURSIVE-COMPOSITION-01: componentRef layer-ordering rule. Only
// runs when the caller supplies the full contract set (allContracts ctx).
describe("validateContractSemantics — componentRef layer ordering", () => {
  function contracts(
    ...list: ComponentContract[]
  ): ReadonlyMap<string, ComponentContract> {
    return new Map(list.map((c) => [c.name, c]));
  }

  const Image = base({ name: "Image", layer: "primitive" });
  const Card = base({ name: "Card", layer: "compound" });

  function withRef(
    host: Partial<ComponentContract>,
    refPart: string,
    ref: string,
  ): ComponentContract {
    return base({
      ...host,
      anatomy: {
        parts: ["root", refPart],
        dom: {
          tag: "div",
          part: "root",
          children: [{ componentRef: ref, part: refPart }],
        },
      },
    } as Partial<ComponentContract>);
  }

  it("admits a compound referencing a primitive (compound -> primitive)", () => {
    const host = withRef({ name: "Avatar", layer: "compound" }, "image", "fsds.Image");
    const issues = validateContractSemantics(host, {
      allContracts: contracts(host, Image),
    });
    expect(
      issues.some((i) => /higher layer/.test(i.message)),
    ).toBe(false);
  });

  it("admits a composer referencing a compound (composer -> compound)", () => {
    const host = withRef({ name: "Wizard", layer: "composer" }, "card", "fsds.Card");
    const issues = validateContractSemantics(host, {
      allContracts: contracts(host, Card),
    });
    expect(issues.some((i) => /higher layer/.test(i.message))).toBe(false);
  });

  it("REJECTS a primitive referencing a compound (primitive -> compound)", () => {
    const host = withRef({ name: "BadPrim", layer: "primitive" }, "card", "fsds.Card");
    const issues = validateContractSemantics(host, {
      allContracts: contracts(host, Card),
    });
    const offending = issues.find((i) => /higher layer/.test(i.message));
    expect(offending).toBeDefined();
    expect(offending?.pointer).toBe("/anatomy/dom/children/0/componentRef");
    expect(offending?.message).toMatch(/compound.*than this primitive/);
  });

  it("REJECTS a componentRef to an unknown component", () => {
    const host = withRef({ name: "Avatar", layer: "compound" }, "x", "fsds.DoesNotExist");
    const issues = validateContractSemantics(host, {
      allContracts: contracts(host),
    });
    expect(
      issues.some((i) => /does not resolve to a known component/.test(i.message)),
    ).toBe(true);
  });

  it("admits an equal-layer reference (compound -> compound)", () => {
    const host = withRef({ name: "Postcard", layer: "compound" }, "card", "fsds.Card");
    const issues = validateContractSemantics(host, {
      allContracts: contracts(host, Card),
    });
    expect(issues.some((i) => /higher layer/.test(i.message))).toBe(false);
  });

  it("SKIPS the layer rule entirely when no allContracts ctx is given", () => {
    // Single-contract callers (no cross-contract context) must not fail
    // closed — the rule simply does not run.
    const host = withRef({ name: "BadPrim", layer: "primitive" }, "card", "fsds.Card");
    const issues = validateContractSemantics(host);
    expect(issues.some((i) => /higher layer/.test(i.message))).toBe(false);
    expect(
      issues.some((i) => /does not resolve/.test(i.message)),
    ).toBe(false);
  });

  it("resolves a componentRef declared in anatomy.details", () => {
    const host = base({
      name: "BadPrim",
      layer: "primitive",
      anatomy: {
        parts: ["root", "card"],
        details: { card: { componentRef: "fsds.Card" } },
      },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(host, {
      allContracts: contracts(host, Card),
    });
    const offending = issues.find((i) => /higher layer/.test(i.message));
    expect(offending?.pointer).toBe("/anatomy/details/card/componentRef");
  });
});

describe("validateContractSemantics — textOverflow.line ⊆ prop names (Rule 8)", () => {
  it("raises no issue when textOverflow is absent", () => {
    const c = base({});
    expect(issueAt(validateContractSemantics(c), "/textOverflow/line")).toBe(false);
  });

  it("raises no issue when textOverflow.line references a real prop", () => {
    const c = base({
      props: {
        styled: { members: [{ name: "maxLines", type: "number", description: "" }] },
      },
      textOverflow: { kind: "line-clamp", line: "prop:maxLines" },
    } as Partial<ComponentContract>);
    expect(issueAt(validateContractSemantics(c), "/textOverflow/line")).toBe(false);
  });

  it("flags textOverflow.line referencing a missing prop — prevents a second, unverifiable authority over the line count", () => {
    const c = base({
      props: { styled: { members: [] } },
      textOverflow: { kind: "line-clamp", line: "prop:doesNotExist" },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    expect(issueAt(issues, "/textOverflow/line")).toBe(true);
  });

  it("flags a malformed textOverflow.line that is not a prop: binding at all", () => {
    const c = base({
      textOverflow: { kind: "line-clamp", line: "literal-string-not-a-binding" },
    } as Partial<ComponentContract>);
    const issues = validateContractSemantics(c);
    const offending = issues.find((i) => i.pointer === "/textOverflow/line");
    expect(offending?.message).toMatch(/must be of the form "prop:<name>"/);
  });

  it("validateTextOverflow (standalone) rejects a fixture referencing a prop declared nowhere in the contract", () => {
    const c = base({
      props: { styled: { members: [{ name: "lines", type: "number", description: "" }] } },
      textOverflow: { kind: "line-clamp", line: "prop:wrongName" },
    } as Partial<ComponentContract>);
    const propNames = new Set(["lines"]);
    const issues = validateTextOverflow(c, propNames);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/textOverflow/line");
    expect(issues[0].message).toMatch(/references prop "wrongName"/);
  });

  it("validateTextOverflow (standalone) accepts a fixture whose line prop is declared", () => {
    const c = base({
      textOverflow: { kind: "line-clamp", line: "prop:lines" },
    } as Partial<ComponentContract>);
    const issues = validateTextOverflow(c, new Set(["lines"]));
    expect(issues).toEqual([]);
  });
});
