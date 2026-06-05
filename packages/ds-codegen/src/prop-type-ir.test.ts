import { describe, expect, it } from "vitest";
import { buildComponentIR, normalizePropType, canonicalTsType } from "./ir.js";
import { generateReactComponentSource } from "./frameworks/react/component-source.js";
import { generateVueComponentSource } from "./frameworks/vue/component-source.js";
import { generateSvelteComponentSource } from "./frameworks/svelte/component-source.js";
import { generateAngularComponentSource } from "./frameworks/angular/component-source.js";
import { generateLitComponentSource } from "./frameworks/lit/component-source.js";
import type { ComponentContract } from "./contract.js";

// Contract: rail-coverage... no — CODEGEN-PROP-TYPE-IR-PILOT-01, contract
// `proptypeir-emitter-lowering`. Proves the IR normalizes authored prop types
// into PropTypeIR (structured wins; out-of-V1 is an EXPLICIT fallback, never a
// silent neutral kind) and that the React emitter LOWERS from PropTypeIR rather
// than re-parsing a raw `type` string for migrated props.

describe("normalizePropType — structured vs explicit fallback (A5)", () => {
  it("returns the authored structured propType unchanged", () => {
    expect(normalizePropType({ propType: { kind: "enum", values: ["a", "b"] } })).toEqual({
      kind: "enum",
      values: ["a", "b"],
    });
    expect(normalizePropType({ propType: { kind: "ref", to: "ButtonSize" } })).toEqual({
      kind: "ref",
      to: "ButtonSize",
    });
    expect(normalizePropType({ propType: { kind: "boolean" } })).toEqual({ kind: "boolean" });
  });

  it("marks an out-of-V1 legacy TS string as an explicit fallback — NOT a silent neutral kind", () => {
    // A complex union the V1 vocabulary does not model must not collapse to a
    // clean {kind:'string'} etc. It is fallback{raw}, observably non-neutral.
    expect(normalizePropType({ type: "Foo<Bar> | Baz" })).toEqual({
      kind: "fallback",
      raw: "Foo<Bar> | Baz",
    });
    // Even a simple legacy string stays fallback (the IR does not retro-parse
    // legacy members into V1 — that would risk byte drift; emitters keep their
    // existing string handling on the fallback raw).
    expect(normalizePropType({ type: "boolean" })).toEqual({ kind: "fallback", raw: "boolean" });
  });

  it("never fabricates a type when neither source is present", () => {
    expect(normalizePropType({})).toEqual({ kind: "fallback", raw: "unknown" });
  });
});

describe("canonicalTsType — back-compat TS string per kind", () => {
  it("derives the canonical string for every V1 PropTypeIR kind", () => {
    expect(canonicalTsType({ kind: "string" })).toBe("string");
    expect(canonicalTsType({ kind: "number" })).toBe("number");
    expect(canonicalTsType({ kind: "boolean" })).toBe("boolean");
    // enum lowers to a DOUBLE-quoted union — matching the generated-TS
    // convention (CODEGEN-PROP-TYPE-IR-OBSERVED-TYPES-01 A2). The corpus has no
    // single-quoted inline unions, so double quotes keep migrations byte-clean.
    expect(canonicalTsType({ kind: "enum", values: ["sm", "md"] })).toBe('"sm" | "md"');
    expect(canonicalTsType({ kind: "enum", values: ["horizontal", "vertical"] })).toBe(
      '"horizontal" | "vertical"',
    );
    expect(canonicalTsType({ kind: "node", of: "icon" })).toBe("ReactNode");
    expect(canonicalTsType({ kind: "ref", to: "ButtonSize" })).toBe("ButtonSize");
    expect(canonicalTsType({ kind: "fallback", raw: "X<Y>" })).toBe("X<Y>");
  });

  // CODEGEN-PROP-TYPE-IR-OBSERVED-TYPES-01 A1: each V2 kind lowers byte-identically
  // to the legacy TS-string actually present in the corpus today. Byte-identity of
  // the whole migration reduces to these — emitters + import scanners consume the
  // string this produces, so reproducing the legacy string is sufficient.
  it("lowers every V2 kind byte-identically to observed corpus signatures", () => {
    // void + simple callbacks
    expect(canonicalTsType({ kind: "void" })).toBe("void");
    expect(canonicalTsType({ kind: "callback", params: [], returns: { kind: "void" } })).toBe(
      "() => void",
    );
    expect(
      canonicalTsType({
        kind: "callback",
        params: [{ name: "checked", type: { kind: "boolean" } }],
        returns: { kind: "void" },
      }),
    ).toBe("(checked: boolean) => void"); // Checkbox/Switch/ToggleSwitch
    expect(
      canonicalTsType({
        kind: "callback",
        params: [{ name: "value", type: { kind: "string" } }],
        returns: { kind: "void" },
      }),
    ).toBe("(value: string) => void"); // Input/OTP/Tabs/TextField/Command
    expect(
      canonicalTsType({
        kind: "callback",
        params: [
          { name: "value", type: { kind: "number" } },
          { name: "max", type: { kind: "number" } },
        ],
        returns: { kind: "string" },
      }),
    ).toBe("(value: number, max: number) => string"); // Progress.formatValue

    // array kinds
    expect(canonicalTsType({ kind: "array", items: { kind: "string" } })).toBe("string[]"); // Shuttle
    expect(canonicalTsType({ kind: "array", items: { kind: "ref", to: "SelectOption" } })).toBe(
      "SelectOption[]",
    ); // Select.options
    expect(canonicalTsType({ kind: "array", items: { kind: "ref", to: "WalkthroughStepSpec" } })).toBe(
      "WalkthroughStepSpec[]",
    );

    // union kinds (string | string[], Date | Date[] | null) and literal/null
    expect(
      canonicalTsType({
        kind: "union",
        of: [{ kind: "string" }, { kind: "array", items: { kind: "string" } }],
      }),
    ).toBe("string | string[]"); // Accordion/Select value
    expect(
      canonicalTsType({
        kind: "union",
        of: [
          { kind: "ref", to: "Date" },
          { kind: "array", items: { kind: "ref", to: "Date" } },
          { kind: "literal", value: null },
        ],
      }),
    ).toBe("Date | Date[] | null"); // Calendar.onChange param
    expect(
      canonicalTsType({
        kind: "callback",
        params: [
          {
            name: "value",
            type: {
              kind: "union",
              of: [{ kind: "string" }, { kind: "array", items: { kind: "string" } }],
            },
          },
        ],
        returns: { kind: "void" },
      }),
    ).toBe("(value: string | string[]) => void"); // Accordion/Select.onValueChange

    // callback inside a union is parenthesized for precedence; promise + literals
    expect(
      canonicalTsType({
        kind: "union",
        of: [
          {
            kind: "callback",
            params: [
              { name: "value", type: { kind: "string" } },
              { name: "search", type: { kind: "string" } },
            ],
            returns: { kind: "number" },
          },
          { kind: "literal", value: null },
        ],
      }),
    ).toBe("((value: string, search: string) => number) | null");
    expect(canonicalTsType({ kind: "promise", of: { kind: "void" } })).toBe("Promise<void>");
    expect(canonicalTsType({ kind: "literal", value: "foo" })).toBe('"foo"');
    expect(canonicalTsType({ kind: "literal", value: 42 })).toBe("42");
  });
});

const STACK_IMPORT = "../primitives/Stack";

/** A migrated contract: every prop authors a structured propType, NO `type` string. */
function migratedContract(): ComponentContract {
  return {
    name: "Probe",
    layer: "primitive",
    a2ui: { category: "action" },
    props: {
      designed: {
        members: [
          { name: "tone", propType: { kind: "enum", values: ["info", "warn"] }, description: "Tone." },
          { name: "open", propType: { kind: "boolean" }, description: "Open state." },
          { name: "label", propType: { kind: "string" }, description: "Label." },
          { name: "size", propType: { kind: "ref", to: "ProbeSize" }, description: "Size." },
        ],
      },
    },
    types: { ProbeSize: { kind: "union", values: ["sm", "lg"] } },
  } as ComponentContract;
}

const POISON = "__RAW_TYPE_SHOULD_NOT_APPEAR__";

/** The four non-React emitters migrated in slice 2 (React is slice 1). */
const NON_REACT_EMITTERS: ReadonlyArray<{ name: string; gen: (ir: ReturnType<typeof buildComponentIR>) => string }> = [
  { name: "vue", gen: generateVueComponentSource },
  { name: "svelte", gen: generateSvelteComponentSource },
  { name: "angular", gen: generateAngularComponentSource },
  { name: "lit", gen: generateLitComponentSource },
];

describe("non-React emitters lower from propType, not raw p.type (A3 negative control)", () => {
  for (const { name, gen } of NON_REACT_EMITTERS) {
    it(`${name}: a poisoned p.type never leaks; output realizes the lowered propType (boolean/string/ref)`, () => {
      const ir = buildComponentIR(migratedContract());
      // Poison the back-compat canonical type on every prop. A correct emitter
      // lowers from p.propType and must ignore p.type entirely.
      for (const p of ir.styledProps) p.type = POISON;
      const src = gen(ir);
      expect(src).not.toContain(POISON);
      // boolean (open) and ref->alias (size) realized from propType
      expect(src).toContain("boolean");
      expect(src).toContain("ProbeSize");
      // string (label) realized as a TS string type
      expect(src).toMatch(/\bstring\b/);
    });
  }
});

describe("fallback{raw} is observable ONLY for propType.kind === 'fallback' (A3 inverse)", () => {
  for (const { name, gen } of NON_REACT_EMITTERS) {
    it(`${name}: a legacy styled prop surfaces its raw type; a poisoned non-fallback prop's type does not`, () => {
      const c = {
        name: "Probe",
        layer: "primitive",
        a2ui: { category: "action" },
        props: {
          designed: { members: [{ name: "open", propType: { kind: "boolean" }, description: "x" }] },
          // legacy styled -> normalizes to fallback{raw: "LegacyKind"}
          styled: { members: [{ name: "legacyFlag", type: "LegacyKind", description: "x" }] },
        },
        types: { LegacyKind: { kind: "union", values: ["x", "y"] } },
      } as ComponentContract;
      const ir = buildComponentIR(c);
      // Poison ONLY non-fallback props' canonical type.
      for (const p of ir.styledProps) {
        if (p.propType.kind !== "fallback") p.type = POISON;
      }
      const src = gen(ir);
      expect(src).not.toContain(POISON);
      // The fallback raw is the only source for legacyFlag and must surface.
      expect(src).toContain("LegacyKind");
    });
  }
});

describe("IR + React emitter lower from PropTypeIR (A3)", () => {
  it("resolveProps populates structured propType and a derived canonical type", () => {
    const ir = buildComponentIR(migratedContract());
    const byName = Object.fromEntries(ir.styledProps.map((p) => [p.name, p]));
    expect(byName.tone.propType).toEqual({ kind: "enum", values: ["info", "warn"] });
    // canonical type is DERIVED from the structured type (not authored), and
    // enum now lowers to a DOUBLE-quoted union (observed-corpus convention).
    expect(byName.tone.type).toBe('"info" | "warn"');
    expect(byName.open.propType).toEqual({ kind: "boolean" });
    expect(byName.size.propType).toEqual({ kind: "ref", to: "ProbeSize" });
    expect(byName.size.type).toBe("ProbeSize");
  });

  it("the React props interface lowers from propType — members carry NO authored `type`", () => {
    const src = generateReactComponentSource(buildComponentIR(migratedContract()), STACK_IMPORT);
    // enum -> inlined union; boolean -> boolean; ref -> alias name.
    // These can ONLY come from the structured propType, since no `type` string exists.
    expect(src).toContain('tone?: "info" | "warn";');
    expect(src).toContain("open?: boolean;");
    expect(src).toContain("size?: ProbeSize;");
  });
});

/** A migrated contract using V2 kinds: a callback prop and an array prop. */
function v2MigratedContract(): ComponentContract {
  return {
    name: "ProbeV2",
    layer: "primitive",
    a2ui: { category: "action" },
    anatomy: { parts: ["root"], dom: { tag: "div", part: "root", children: [{ tag: "children" }] } },
    props: {
      designed: {
        members: [
          {
            name: "onValueChange",
            propType: {
              kind: "callback",
              params: [{ name: "value", type: { kind: "string" } }],
              returns: { kind: "void" },
            },
            description: "Called when the value changes.",
          },
          {
            name: "items",
            propType: { kind: "array", items: { kind: "ref", to: "ProbeItem" } },
            description: "Collection of items.",
          },
        ],
      },
    },
    types: { ProbeItem: { kind: "alias", alias: "{ id: string }" } },
  } as ComponentContract;
}

describe("V2 kinds lower through the emitters from propType (A1/A5)", () => {
  // Non-React emitters re-lower from propType: poison the cached canonical
  // string and prove it never leaks while the V2 callback/array still realize.
  for (const { name, gen } of NON_REACT_EMITTERS) {
    it(`${name}: a poisoned p.type never leaks; callback + array realize from propType`, () => {
      const ir = buildComponentIR(v2MigratedContract());
      for (const p of ir.styledProps) p.type = POISON;
      const src = gen(ir);
      expect(src).not.toContain(POISON);
      expect(src).toContain("(value: string) => void"); // callback lowered byte-identically
      expect(src).toContain("ProbeItem[]"); // array element ref preserved
    });
  }

  // React: the contract authors NO `type` string, so the only possible source
  // for these exact strings is the structured propType lowering.
  it("react: callback + array realize from propType (no authored type string)", () => {
    const src = generateReactComponentSource(buildComponentIR(v2MigratedContract()), STACK_IMPORT);
    expect(src).toContain("onValueChange?: (value: string) => void;");
    expect(src).toContain("items?: ProbeItem[];");
  });

  // Lit: a `callback` propType is not attribute-serializable, so it must reflect
  // `@property({ attribute: false })` — the same decoration a legacy function-typed
  // `fallback` got. Regression guard for the V1-era assumption that functions only
  // arrive as `fallback` (broken once callbacks became first-class V2 kinds).
  it("lit: callback propType reflects @property({ attribute: false })", () => {
    const src = generateLitComponentSource(buildComponentIR(v2MigratedContract()));
    expect(src).toContain("@property({ attribute: false }) onValueChange?: (value: string) => void;");
  });
});
