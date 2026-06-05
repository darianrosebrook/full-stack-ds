import { describe, expect, it } from "vitest";
import { buildComponentIR, normalizePropType, canonicalTsType } from "./ir.js";
import { generateReactComponentSource } from "./frameworks/react/component-source.js";
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
  it("derives the canonical string for every PropTypeIR kind", () => {
    expect(canonicalTsType({ kind: "string" })).toBe("string");
    expect(canonicalTsType({ kind: "number" })).toBe("number");
    expect(canonicalTsType({ kind: "boolean" })).toBe("boolean");
    expect(canonicalTsType({ kind: "enum", values: ["sm", "md"] })).toBe("'sm' | 'md'");
    expect(canonicalTsType({ kind: "node", of: "icon" })).toBe("ReactNode");
    expect(canonicalTsType({ kind: "ref", to: "ButtonSize" })).toBe("ButtonSize");
    expect(canonicalTsType({ kind: "fallback", raw: "X<Y>" })).toBe("X<Y>");
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
          { name: "size", propType: { kind: "ref", to: "ProbeSize" }, description: "Size." },
        ],
      },
    },
    types: { ProbeSize: { kind: "union", values: ["sm", "lg"] } },
  } as ComponentContract;
}

describe("IR + React emitter lower from PropTypeIR (A3)", () => {
  it("resolveProps populates structured propType and a derived canonical type", () => {
    const ir = buildComponentIR(migratedContract());
    const byName = Object.fromEntries(ir.styledProps.map((p) => [p.name, p]));
    expect(byName.tone.propType).toEqual({ kind: "enum", values: ["info", "warn"] });
    // canonical type is DERIVED from the structured type (not authored)
    expect(byName.tone.type).toBe("'info' | 'warn'");
    expect(byName.open.propType).toEqual({ kind: "boolean" });
    expect(byName.size.propType).toEqual({ kind: "ref", to: "ProbeSize" });
    expect(byName.size.type).toBe("ProbeSize");
  });

  it("the React props interface lowers from propType — members carry NO authored `type`", () => {
    const src = generateReactComponentSource(buildComponentIR(migratedContract()), STACK_IMPORT);
    // enum -> inlined union; boolean -> boolean; ref -> alias name.
    // These can ONLY come from the structured propType, since no `type` string exists.
    expect(src).toContain("tone?: 'info' | 'warn';");
    expect(src).toContain("open?: boolean;");
    expect(src).toContain("size?: ProbeSize;");
  });
});
