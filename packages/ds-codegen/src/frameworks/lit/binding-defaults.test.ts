import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateLitComponentSource } from "./component-source.js";

// FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01 — Lit accessor defaulting.
//
// Cross-framework parity rule: a prop explicitly set to `undefined` must
// resolve to its CONTRACT default in every framework. React (parameter
// default), Vue (`withDefaults`), and Svelte (`export let`) already honor
// this because their defaulting is parameter-evaluation. Lit's
// `@property() x?: T = default` class-field initializer applies its
// default ONLY once, at construction — a later explicit `undefined`
// assignment does not re-trigger it, so a bare `this.x` read downstream
// observes `undefined` even though the contract declares a default.
//
// The fix pushes defaulting into `litPropAccessor` (the shared accessor
// primitive every prop-kind binding lowering routes through) so
// conditional bindings, predicate bindings, and class-modifier loops all
// inherit parity without each call site re-deriving it.

const CONDITIONAL_CONTRACT: ComponentContract = {
  name: "FixtureBindingDefaultConditional",
  layer: "primitive",
  cssPrefix: "fixture-binding-default-conditional",
  anatomy: {
    parts: ["root"],
    dom: {
      tag: "div",
      part: "root",
      bindings: {
        role: "conditional:prop:decorative|literal:presentation|literal:status",
      },
    },
  },
  props: {
    designed: {
      members: [
        {
          name: "decorative",
          propType: { kind: "boolean" },
          description: "When true, hides the component from assistive tech.",
          default: true,
        },
      ],
    },
  },
  a11y: {
    role: "status",
    labeling: [],
    keyboard: [],
  },
};

const PREDICATE_CONTRACT: ComponentContract = {
  name: "FixtureBindingDefaultPredicate",
  layer: "primitive",
  cssPrefix: "fixture-binding-default-predicate",
  anatomy: {
    parts: ["root"],
    dom: {
      tag: "div",
      part: "root",
      bindings: {
        // BINDING-EXPRESSION-V2-PREDICATE-01: `eq`'s grammar rejects
        // `literal` operands (only `prop`/`channel`/`iterationLocal` are
        // value-shaped) — compare two props instead, `status` (defaulted)
        // against `activeStatus` (no default), matching the shape a real
        // contract like Select's `predicate:memberOf` uses.
        "aria-current": "predicate:eq(prop:status, prop:activeStatus)",
      },
    },
  },
  props: {
    designed: {
      members: [
        {
          name: "status",
          propType: { kind: "enum", values: ["active", "inactive"] },
          description: "Current status.",
          default: "active",
        },
        {
          name: "activeStatus",
          propType: { kind: "enum", values: ["active", "inactive"] },
          description: "The status value considered active. No contract default.",
        },
      ],
    },
  },
};

const CLASS_MODIFIER_CONTRACT: ComponentContract = {
  name: "FixtureBindingDefaultClassModifier",
  layer: "primitive",
  cssPrefix: "fixture-binding-default-class-modifier",
  anatomy: {
    parts: ["root"],
    dom: { tag: "div", part: "root" },
  },
  props: {
    designed: {
      members: [
        {
          name: "size",
          propType: { kind: "enum", values: ["sm", "md", "lg"] },
          description: "Size variant.",
          default: "md",
        },
        {
          name: "disabled",
          propType: { kind: "boolean" },
          description: "Disabled state.",
        },
      ],
    },
  },
  variants: {
    size: ["sm", "md", "lg"],
  },
  // `disabled` is one of `buildClassRecipe`'s IMPLICIT_BOOLEAN_STATE_PROPS
  // (ir.ts) — no `states.dimensions` declaration needed to become a
  // boolean class modifier.
};

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: Lit conditional binding defaulting", () => {
  it("wraps the condition operand with the contract default when the prop declares one", () => {
    const src = generateLitComponentSource(buildComponentIR(CONDITIONAL_CONTRACT));
    expect(src).toContain(
      '.role=${((this.decorative ?? true) ? "presentation" : "status")}',
    );
  });

  it("falsification: reverting to the bare accessor produces the pre-fix (buggy) shape", () => {
    // Documents what the pinned assertion above would have matched before
    // the fix — a bare `this.decorative` read that silently observes
    // `undefined` (not the contract default `true`) once a consumer
    // explicitly sets the property to `undefined` after construction.
    const src = generateLitComponentSource(buildComponentIR(CONDITIONAL_CONTRACT));
    expect(src).not.toContain(
      '.role=${(this.decorative ? "presentation" : "status")}',
    );
  });
});

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: Lit predicate binding defaulting", () => {
  it("wraps the defaulted operand but leaves the no-default operand bare", () => {
    const src = generateLitComponentSource(buildComponentIR(PREDICATE_CONTRACT));
    expect(src).toContain(
      `aria-current=\${(((this.status ?? "active") === this.activeStatus)) ? 'true' : 'false'}`,
    );
  });

  it("falsification: the bare (undefaulted) accessor shape must not appear", () => {
    const src = generateLitComponentSource(buildComponentIR(PREDICATE_CONTRACT));
    expect(src).not.toMatch(/\(this\.status === this\.activeStatus\)/);
  });
});

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: Lit class-modifier defaulting", () => {
  it("wraps a value-modifier prop's class recipe accessor with its contract default", () => {
    const src = generateLitComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    expect(src).toContain(
      '(this.size ?? "md") ? `fixture-binding-default-class-modifier--${(this.size ?? "md")}` : null,',
    );
  });

  it("leaves a boolean modifier prop with NO contract default unwrapped", () => {
    // `disabled` declares no `default` — the accessor must not invent one.
    const src = generateLitComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    expect(src).toContain(
      'this.disabled ? "fixture-binding-default-class-modifier--disabled" : null,',
    );
    expect(src).not.toMatch(/\(this\.disabled \?\? /);
  });

  it("falsification: the bare (undefaulted) size accessor shape must not appear", () => {
    const src = generateLitComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    expect(src).not.toContain(
      "this.size ? `fixture-binding-default-class-modifier--${this.size}` : null,",
    );
  });
});

const PRIMARY_ATTR_CONTRACT: ComponentContract = {
  name: "FixtureBindingDefaultPrimaryAttr",
  layer: "primitive",
  cssPrefix: "fixture-binding-default-primary-attr",
  anatomy: {
    parts: ["root"],
    dom: {
      tag: "div",
      part: "root",
      bindings: {
        // Plain (non-aria, non-boolean, non-componentRef) attribute
        // binding — the `case "prop"` path in `renderLitBinding` that
        // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01 left uncovered.
        "data-kind": "prop:kind",
        // Sibling with no contract default — must stay bare.
        "data-label": "prop:label",
      },
    },
  },
  props: {
    designed: {
      members: [
        {
          name: "kind",
          propType: { kind: "string" },
          description: "Has a contract default.",
          default: "neutral",
        },
        {
          name: "label",
          propType: { kind: "string" },
          description: "No contract default on purpose.",
        },
      ],
    },
  },
};

describe("FIX-LIT-PRIMARY-ATTR-DEFAULTING-01: Lit primary attribute-binding defaulting", () => {
  it("wraps the primary attr accessor with the contract default when the prop declares one", () => {
    const src = generateLitComponentSource(buildComponentIR(PRIMARY_ATTR_CONTRACT));
    expect(src).toContain('data-kind=${ifDefined((this.kind ?? "neutral"))}');
  });

  it("leaves the primary attr accessor bare when the prop has no contract default", () => {
    const src = generateLitComponentSource(buildComponentIR(PRIMARY_ATTR_CONTRACT));
    expect(src).toContain("data-label=${ifDefined(this.label)}");
    expect(src).not.toMatch(/this\.label \?\? /);
  });

  it("falsification: the pre-fix bare accessor shape must not appear for the defaulted prop", () => {
    // Documents what the pinned assertion above would have matched before
    // the fix — a bare `this.kind` read in the primary attribute-binding
    // path that silently observes `undefined` (not the contract default
    // `"neutral"`) once a consumer explicitly sets the property to
    // `undefined` after construction.
    const src = generateLitComponentSource(buildComponentIR(PRIMARY_ATTR_CONTRACT));
    expect(src).not.toContain("data-kind=${ifDefined(this.kind)}");
  });
});

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: no-default props stay bare everywhere", () => {
  // A prop with no contract `default` must never gain an invented `?? …`
  // fallback — the accessor primitive is opt-in per prop, not blanket.
  const NO_DEFAULT_CONTRACT: ComponentContract = {
    name: "FixtureBindingNoDefault",
    layer: "primitive",
    cssPrefix: "fixture-binding-no-default",
    anatomy: {
      parts: ["root"],
      dom: {
        tag: "div",
        part: "root",
        bindings: {
          role: "conditional:prop:decorative|literal:presentation|literal:status",
        },
      },
    },
    props: {
      designed: {
        members: [
          {
            name: "decorative",
            propType: { kind: "boolean" },
            description: "No declared default on purpose.",
          },
        ],
      },
    },
  };

  it("keeps a bare accessor read when the prop has no contract default", () => {
    const src = generateLitComponentSource(buildComponentIR(NO_DEFAULT_CONTRACT));
    expect(src).toContain(
      '.role=${(this.decorative ? "presentation" : "status")}',
    );
    expect(src).not.toMatch(/this\.decorative \?\? /);
  });
});
