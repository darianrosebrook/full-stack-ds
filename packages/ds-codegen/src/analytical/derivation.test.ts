/**
 * The derivation boundary (REL-VIEW-ALGEBRA-01 A1) and its occurrence domain.
 *
 * The point under test is not that `derivedBy` parses. It is that the declared
 * result of an operator is CERTIFIED against its inputs, so that the assertion
 * engine's deliberate blindness to base-versus-derived is sound rather than a
 * laundering mechanism. Each case below was accepted by the model before this
 * module existed.
 */
import { describe, expect, it } from "vitest";
import { checkDerivations, DERIVATION_DIAG, derivationKey, inputsOf } from "./derivation.js";
import { judge } from "./engines.js";
import { codesOf } from "./judgment.js";
import { RelationalStructure as RelationalStructureSchema } from "./relation-model.js";
import type { RelationalStructure } from "./relation-model.js";

const key = { transformation: "nominal", key: true } as const;
const ratio = { transformation: "ratio" } as const;
const codes = (s: unknown) => checkDerivations(s as RelationalStructure).map((f) => f.code);

/** Every structure below must be schema-valid: the point is that VALIDITY IS NOT ENOUGH. */
const valid = (s: unknown) => {
  const r = RelationalStructureSchema.safeParse(s);
  expect(r.success, `fixture is not schema-valid: ${r.success ? "" : JSON.stringify(r.error.issues[0])}`).toBe(true);
  return s;
};

describe("the derivation boundary certifies the transition, not just the annotation", () => {
  it("refuses a result grain the operator could not have produced", () => {
    const s = valid({
      relations: {
        source: { grain: ["store", "day"], fields: { store: key, day: key, revenue: ratio } },
        result: {
          grain: ["day"],
          fields: { day: key, revenue: ratio },
          derivedBy: { kind: "aggregate-to-grain", from: "source", toGrain: ["store"] },
        },
      },
    });
    expect(codes(s)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
    expect(checkDerivations(s as RelationalStructure)[0].detail).toContain("is not the target grain");
  });

  it("refuses a derivation naming an input the structure does not declare", () => {
    const s = valid({
      relations: {
        result: { grain: ["day"], fields: { day: key }, derivedBy: { kind: "project", from: "absent_relation", keep: ["day"] } },
      },
    });
    expect(codes(s)).toEqual([DERIVATION_DIAG.INPUT_MISSING]);
  });

  it("refuses a projection whose result carries a field the input never had", () => {
    const s = valid({
      relations: {
        source: { grain: ["a"], fields: { a: key } },
        result: { grain: ["a"], fields: { a: key, invented: ratio }, derivedBy: { kind: "project", from: "source", keep: ["a"] } },
      },
    });
    expect(codes(s)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
  });

  it("refuses a cycle, in which no relation is grounded", () => {
    const s = valid({
      relations: {
        a: { grain: ["k"], fields: { k: key }, derivedBy: { kind: "project", from: "b", keep: ["k"] } },
        b: { grain: ["k"], fields: { k: key }, derivedBy: { kind: "project", from: "a", keep: ["k"] } },
      },
    });
    expect(codes(s)).toEqual([DERIVATION_DIAG.CYCLE, DERIVATION_DIAG.CYCLE]);
  });

  it("refuses a nest whose result drops the level that defines its own hierarchy", () => {
    const s = valid({
      relations: {
        src: { grain: ["country", "state"], fields: { country: key, state: key, pop: ratio } },
        flat: { grain: ["state"], fields: { state: key, pop: ratio }, derivedBy: { kind: "nest", from: "src", levels: ["country", "state"] } },
      },
    });
    expect(codes(s)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
  });

  it("refuses a graph whose edge has no direction", () => {
    const s = valid({
      relations: {
        edges: { grain: ["n"], fields: { n: key, amount: ratio } },
        g: {
          grain: ["n"],
          fields: { n: key, amount: ratio },
          derivedBy: { kind: "graph", from: "edges", edgeFrom: "n", edgeTo: "n", value: "amount" },
        },
      },
    });
    expect(codes(s)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
  });

  it("stays silent on lawful derivations, so it is not vacuously refusing everything", () => {
    for (const s of [
      {
        relations: {
          source: { grain: ["store", "day"], fields: { store: key, day: key, revenue: ratio } },
          result: {
            grain: ["store"],
            fields: { store: key, revenue: ratio },
            derivedBy: { kind: "aggregate-to-grain", from: "source", toGrain: ["store"] },
          },
        },
      },
      {
        relations: {
          src: { grain: ["country", "state"], fields: { country: key, state: key, pop: ratio } },
          nested: {
            grain: ["country", "state"],
            fields: { country: key, state: key, pop: ratio },
            derivedBy: { kind: "nest", from: "src", levels: ["country", "state"] },
          },
        },
      },
      { relations: { plain: { grain: ["a"], fields: { a: key } } } },
    ]) {
      expect(codes(valid(s))).toEqual([]);
    }
  });
});

describe("derivation findings are their own occurrence domain", () => {
  const badJoin = () =>
    valid({
      relations: {
        orders: { grain: ["order_id"], fields: { order_id: key, amount: ratio } },
        lines: { grain: ["line_id"], fields: { line_id: key, order_id: key } },
        joined: {
          grain: ["line_id"],
          fields: { line_id: key, order_id: key, amount: ratio, invented: ratio },
          derivedBy: { kind: "join", from: "orders", with: "lines", cardinality: "one-to-many" },
        },
      },
    }) as RelationalStructure;

  it("one malformed join read by three assertions is ONE finding, not three", () => {
    const s = badJoin();
    const assertions = [
      { kind: "aggregate", relation: "joined", field: "amount", op: "sum" },
      { kind: "aggregate", relation: "joined", field: "amount", op: "mean" },
      { kind: "aggregate", relation: "joined", field: "amount", op: "count" },
    ] as never;
    const j = judge(s, assertions);
    expect(j.derivations).toHaveLength(1);
    expect(j.derivations[0].code).toBe(DERIVATION_DIAG.RESULT_NOT_DERIVABLE);
    expect(j.derivations[0].subject).toBe("joined");
  });

  it("a structural defect is found with NO assertion at all, so no fixture must invent one", () => {
    const j = judge(badJoin(), []);
    expect(j.derivations).toHaveLength(1);
    expect(j.status).toBe("illegal");
    expect(codesOf(j)).toContain(DERIVATION_DIAG.RESULT_NOT_DERIVABLE);
  });

  it("a lawful structure with no derivations reports an empty derivation set", () => {
    const j = judge({ relations: { r: { grain: ["a"], fields: { a: key } } } } as RelationalStructure, []);
    expect(j.derivations).toEqual([]);
    expect(j.status).toBe("admissible");
  });
});

describe("derivationKey is a stable identity, not a spelling", () => {
  it("survives alpha-renaming and carries operand arity, matching assertionKey's discipline", () => {
    expect(derivationKey({ kind: "project", from: "a", keep: ["x"] })).toBe(
      derivationKey({ kind: "project", from: "zzz", keep: ["y"] }),
    );
    expect(derivationKey({ kind: "project", from: "a", keep: ["x"] })).not.toBe(
      derivationKey({ kind: "project", from: "a", keep: ["x", "y"] }),
    );
    expect(derivationKey({ kind: "join", from: "a", with: "b", cardinality: "one-to-many" })).not.toBe(
      derivationKey({ kind: "join", from: "a", with: "b", cardinality: "many-to-many" })
    );
  });

  it("a conservation REQUIREMENT is part of the identity and is never a finding", () => {
    const decl = { kind: "graph", from: "e", edgeFrom: "s", edgeTo: "t" } as const;
    expect(derivationKey(decl)).toBe("graph");
    expect(derivationKey({ ...decl, requiresConservation: true })).toBe("graph(requiresConservation)");
    // The boundary never asserts that conservation HOLDS: that needs rows, and
    // the corpus twin expects `unproven` until they arrive.
    const s = valid({
      relations: {
        e: { grain: ["s"], fields: { s: key, t: key, v: ratio } },
        g: { grain: ["s"], fields: { s: key, t: key, v: ratio }, derivedBy: { ...decl, value: "v", requiresConservation: true } },
      },
    });
    expect(codes(s)).toEqual([]);
  });

  it("names the relations a derivation reads", () => {
    expect(inputsOf({ kind: "join", from: "a", with: "b", cardinality: "one-to-one" })).toEqual(["a", "b"]);
    expect(inputsOf({ kind: "normalize", from: "a", field: "f" })).toEqual(["a"]);
  });
});
