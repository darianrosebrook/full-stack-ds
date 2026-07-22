import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateAngularComponentSource } from "./component-source.js";

// FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01 — Angular accessor defaulting.
//
// Cross-framework parity rule: a prop explicitly set to `undefined` must
// resolve to its CONTRACT default in every framework. React (parameter
// default), Vue (`withDefaults`), and Svelte (`export let`) already honor
// this because their defaulting is parameter-evaluation. Angular's
// `@Input() x?: T = default` class-field initializer applies its default
// ONLY once, at construction — a later explicit `undefined` assignment
// does not re-trigger it, so a bare `x` read downstream observes
// `undefined` even though the contract declares a default.
//
// The fix pushes defaulting into two accessor primitives:
//   - `angularPropAccessor` (template-position reads, bare identifiers —
//     `defaultAwareAngularTemplatePropAccessor` under the hood)
//   - `defaultAwareAngularClassPropAccessor` (TypeScript class-body reads
//     in `classes()`/`computed()` class-modifier generators, which need
//     an explicit `this.` prefix — bare identifiers don't resolve there)
// so conditional bindings, predicate bindings, and class-modifier loops
// all inherit parity without each call site re-deriving it.

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

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: Angular conditional binding defaulting", () => {
  it("wraps the condition operand with the contract default when the prop declares one", () => {
    const src = generateAngularComponentSource(buildComponentIR(CONDITIONAL_CONTRACT));
    expect(src).toContain(
      `[attr.role]="((decorative ?? true) ? 'presentation' : 'status')"`,
    );
  });

  it("falsification: reverting to the bare accessor produces the pre-fix (buggy) shape", () => {
    const src = generateAngularComponentSource(buildComponentIR(CONDITIONAL_CONTRACT));
    expect(src).not.toContain(
      `[attr.role]="(decorative ? 'presentation' : 'status')"`,
    );
  });
});

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: Angular predicate binding defaulting", () => {
  it("wraps the defaulted operand but leaves the no-default operand bare", () => {
    const src = generateAngularComponentSource(buildComponentIR(PREDICATE_CONTRACT));
    // Single-quoted, not double: the `[attr.aria-current]="..."` template
    // binding is itself `"`-delimited — a double-quoted string default
    // spliced in verbatim would prematurely close the attribute (this
    // exact defect broke the Angular JIT compiler for OTP's aria-label
    // during development; see `angularTemplateSafeDefaultExpr`).
    expect(src).toContain(
      `[attr.aria-current]="((status ?? 'active') === activeStatus)"`,
    );
  });

  it("falsification: the bare (undefaulted) accessor shape must not appear", () => {
    const src = generateAngularComponentSource(buildComponentIR(PREDICATE_CONTRACT));
    expect(src).not.toMatch(/\(status === activeStatus\)/);
  });
});

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: Angular class-modifier defaulting", () => {
  it("wraps a value-modifier prop's class recipe accessor with its contract default, using this.-prefixed class-body reads", () => {
    const src = generateAngularComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    expect(src).toContain(
      '(this.size ?? "md") ? `fixture-binding-default-class-modifier--${(this.size ?? "md")}` : null,',
    );
  });

  it("leaves a boolean modifier prop with NO contract default unwrapped", () => {
    // `disabled` declares no `default` — the accessor must not invent one.
    const src = generateAngularComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    expect(src).toContain(
      'this.disabled ? "fixture-binding-default-class-modifier--disabled" : null,',
    );
    expect(src).not.toMatch(/\(this\.disabled \?\? /);
  });

  it("falsification: the bare (undefaulted) size accessor shape must not appear", () => {
    const src = generateAngularComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    expect(src).not.toContain(
      "this.size ? `fixture-binding-default-class-modifier--${this.size}` : null,",
    );
  });

  it("never emits a BARE (non-this.-prefixed) identifier read in class-body code", () => {
    // Regression guard for the intermediate bug this fix introduced and
    // caught during development: `angularPropAccessor`'s bare-identifier
    // template accessor must NOT be reused inside TypeScript class-body
    // code (classes()/computed()) — bare `size`/`disabled` there is a
    // ReferenceError at runtime (no implicit `this` outside a template).
    const src = generateAngularComponentSource(buildComponentIR(CLASS_MODIFIER_CONTRACT));
    const classesBody = src.slice(
      src.indexOf("classes(): string {"),
      src.indexOf("}", src.indexOf("classes(): string {")) + 1,
    );
    expect(classesBody).not.toMatch(/[^.]\bsize\b/);
    expect(classesBody).not.toMatch(/[^.]\bdisabled\b/);
  });
});

describe("FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: no-default props stay bare everywhere", () => {
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
    const src = generateAngularComponentSource(buildComponentIR(NO_DEFAULT_CONTRACT));
    expect(src).toContain(
      `[attr.role]="(decorative ? 'presentation' : 'status')"`,
    );
    expect(src).not.toMatch(/decorative \?\? /);
  });
});
