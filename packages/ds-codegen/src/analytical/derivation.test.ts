/**
 * The derivation boundary (REL-VIEW-ALGEBRA-01 A1) and its occurrence domain.
 *
 * The point under test is not that `derivedBy` parses. It is that the declared
 * result of an operator is CERTIFIED against its inputs, so that the assertion
 * engine's deliberate blindness to base-versus-derived is sound rather than a
 * laundering mechanism. Each case below was accepted by the model before this
 * module existed.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { DIAG, OBLIGATION } from "./codes.js";
import { checkDerivations, DERIVATION_DIAG, derivationKey, inputsOf, OPERATOR_LAWS } from "./derivation.js";
import { judge } from "./engines.js";
import { codesOf, termsOf } from "./judgment.js";
import { CONTRACTS_DIR } from "./necessity.js";
import { Derivation, RelationalStructure as RelationalStructureSchema } from "./relation-model.js";
import type { DerivationDecl, RelationalStructure } from "./relation-model.js";

const key = { transformation: "nominal", key: true } as const;
const ratio = { transformation: "ratio" } as const;
const ordinal = { transformation: "ordinal" } as const;
const codes = (s: unknown) => checkDerivations(s as RelationalStructure).map((f) => f.code);
const findings = (s: unknown) => checkDerivations(s as RelationalStructure);

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

  it("downstream semantics do not acquire standing before their premise: an assertion over an unadmitted result is not evaluated", () => {
    // `bad` is not derivable (project inventing a field). Its `code` field is
    // nominal, so `mean` over it would independently raise
    // REL_MEANINGFULNESS_ORDINAL_MEAN — a semantic finding about a result that
    // has no standing yet. The boundary must gate that, not merely outrank it.
    const s = valid({
      relations: {
        src: { grain: ["code"], fields: { code: key } },
        bad: {
          grain: ["code"],
          fields: { code: key, invented: { transformation: "ordinal" } },
          derivedBy: { kind: "project", from: "src", keep: ["code"] },
        },
      },
    }) as RelationalStructure;
    const j = judge(s, [{ kind: "aggregate", relation: "bad", field: "invented", op: "mean" }] as never);
    expect(j.derivations.map((d) => d.code)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
    expect(j.diagnostics).toEqual([]);
    expect(codesOf(j)).not.toContain("REL_MEANINGFULNESS_ORDINAL_MEAN");
  });

  it("one failed derivation does not silence assertions over relations that are grounded", () => {
    const s = valid({
      relations: {
        src: { grain: ["code"], fields: { code: key } },
        bad: { grain: ["code"], fields: { code: key, invented: ratio }, derivedBy: { kind: "project", from: "src", keep: ["code"] } },
        fine: { grain: ["rank"], fields: { rank: { transformation: "ordinal" } } },
      },
    }) as RelationalStructure;
    const j = judge(s, [
      { kind: "aggregate", relation: "bad", field: "invented", op: "sum" },
      { kind: "aggregate", relation: "fine", field: "rank", op: "mean" },
    ] as never);
    expect(j.derivations).toHaveLength(1);
    // The grounded relation's own defect still surfaces.
    expect(j.diagnostics.map((d) => d.code)).toEqual(["REL_MEANINGFULNESS_ORDINAL_MEAN"]);
  });

  it("ungroundedness is transitive: a relation derived FROM an unadmitted result has no standing either", () => {
    const s = valid({
      relations: {
        src: { grain: ["code"], fields: { code: key } },
        bad: { grain: ["code"], fields: { code: key, invented: { transformation: "ordinal" } }, derivedBy: { kind: "project", from: "src", keep: ["code"] } },
        downstream: {
          grain: ["code"],
          fields: { code: key, invented: { transformation: "ordinal" } },
          derivedBy: { kind: "project", from: "bad", keep: ["code", "invented"] },
        },
      },
    }) as RelationalStructure;
    const j = judge(s, [{ kind: "aggregate", relation: "downstream", field: "invented", op: "mean" }] as never);
    expect(j.diagnostics).toEqual([]);
    expect(j.derivations.map((d) => d.subject)).toContain("bad");
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
    // The boundary never asserts that conservation HOLDS: that needs rows. The
    // declaration raises the question and nothing more, so with no rows the
    // result is the outstanding obligation, never a discharge and never a
    // refutation.
    const s = valid({
      relations: {
        e: { grain: ["s"], fields: { s: key, t: key, v: ratio } },
        g: { grain: ["s"], fields: { s: key, t: key, v: ratio }, derivedBy: { ...decl, value: "v", requiresConservation: true } },
      },
    });
    const f = findings(s);
    expect(f.map((x) => x.kind)).toEqual(["obligation"]);
    expect(f[0].term).toBe("invariant:conservation");
  });

  it("names the relations a derivation reads", () => {
    expect(inputsOf({ kind: "join", from: "a", with: "b", cardinality: "one-to-one" })).toEqual(["a", "b"]);
    expect(inputsOf({ kind: "normalize", from: "a", field: "f" })).toEqual(["a"]);
  });
});

/**
 * Silence has to MEAN something, operator by operator.
 *
 * If "the boundary said nothing" only means "no rule fired", then a derived
 * relation acquires analytical authority by the boundary's ignorance, and the
 * whole certification is decorative. Every operator therefore owes three
 * separable outcomes, and each one below is asserted per operator rather than
 * once for the module, because the epistemic state is a property of the
 * OPERATOR's declaration, not of the checker.
 */
describe("silence is proven admissibility, not absence of contradiction", () => {
  interface OperatorCases {
    /** Lawful, and the operator DETERMINES the declared result grain. Silence here is a proof. */
    proven: unknown;
    /**
     * Lawful, and the operator cannot determine the result grain from the
     * declaration. `null` records the claim that this operator always can —
     * which is a claim, not an omission.
     */
    undetermined: unknown | null;
    /** The operator determines a grain, and the declaration contradicts it. */
    refuted: unknown;
  }

  const cases: Record<DerivationDecl["kind"], OperatorCases> = {
    "aggregate-to-grain": {
      proven: {
        relations: {
          src: { grain: ["store", "day"], fields: { store: key, day: key, revenue: ratio } },
          out: {
            grain: ["store"],
            fields: { store: key, revenue: ratio },
            derivedBy: { kind: "aggregate-to-grain", from: "src", toGrain: ["store"] },
          },
        },
      },
      // The target grain IS the result grain: there is nothing left to not know.
      undetermined: null,
      refuted: {
        relations: {
          src: { grain: ["store", "day"], fields: { store: key, day: key, revenue: ratio } },
          out: {
            grain: ["day"],
            fields: { day: key, revenue: ratio },
            derivedBy: { kind: "aggregate-to-grain", from: "src", toGrain: ["store"] },
          },
        },
      },
    },
    join: {
      proven: {
        relations: {
          orders: { grain: ["order_id"], fields: { order_id: key, amount: ratio } },
          lines: { grain: ["line_id"], fields: { line_id: key, order_id: key } },
          joined: {
            grain: ["line_id"],
            fields: { line_id: key, order_id: key, amount: ratio },
            derivedBy: { kind: "join", from: "orders", with: "lines", cardinality: "one-to-many" },
          },
        },
      },
      // Many-to-many is the fan-out case: neither side's grain survives and the
      // declaration says nothing about what replaces it.
      undetermined: {
        relations: {
          orders: { grain: ["order_id"], fields: { order_id: key, amount: ratio } },
          lines: { grain: ["line_id"], fields: { line_id: key, order_id: key } },
          joined: {
            grain: ["line_id"],
            fields: { line_id: key, order_id: key, amount: ratio },
            derivedBy: { kind: "join", from: "orders", with: "lines", cardinality: "many-to-many" },
          },
        },
      },
      refuted: {
        relations: {
          orders: { grain: ["order_id"], fields: { order_id: key, amount: ratio } },
          lines: { grain: ["line_id"], fields: { line_id: key, order_id: key } },
          joined: {
            grain: ["order_id"],
            fields: { line_id: key, order_id: key, amount: ratio },
            derivedBy: { kind: "join", from: "orders", with: "lines", cardinality: "one-to-many" },
          },
        },
      },
    },
    nest: {
      proven: {
        relations: {
          src: { grain: ["country", "state"], fields: { country: key, state: key, pop: ratio } },
          nested: {
            grain: ["country", "state"],
            fields: { country: key, state: key, pop: ratio },
            derivedBy: { kind: "nest", from: "src", levels: ["country", "state"] },
          },
        },
      },
      // Imposing a hierarchy reorganises rows without combining them.
      undetermined: null,
      refuted: {
        relations: {
          src: { grain: ["country", "state"], fields: { country: key, state: key, pop: ratio } },
          nested: {
            grain: ["state"],
            fields: { country: key, state: key, pop: ratio },
            derivedBy: { kind: "nest", from: "src", levels: ["country", "state"] },
          },
        },
      },
    },
    bin: {
      proven: {
        relations: {
          src: { grain: ["id"], fields: { id: key, amount: ratio } },
          binned: {
            grain: ["id"],
            fields: { id: key, amount: ratio },
            derivedBy: { kind: "bin", from: "src", field: "amount", closure: "left-closed" },
          },
        },
      },
      // Binning a field the grain is defined by coarsens the row set in a way
      // the declaration does not pin down.
      undetermined: {
        relations: {
          src: { grain: ["day"], fields: { day: key, v: ratio } },
          binned: {
            grain: ["day"],
            fields: { day: key, v: ratio },
            // The closure is declared so the ONLY thing outstanding is the grain.
            derivedBy: { kind: "bin", from: "src", field: "day", closure: "left-closed" },
          },
        },
      },
      // A determined grain cannot be laundered into `unknown`: declaring
      // ignorance about a fact the operator settles is a false claim, and it
      // would otherwise be the cheapest way to dodge every grain-dependent rule.
      refuted: {
        relations: {
          src: { grain: ["id"], fields: { id: key, amount: ratio } },
          binned: {
            grain: "unknown",
            fields: { id: key, amount: ratio },
            derivedBy: { kind: "bin", from: "src", field: "amount", closure: "right-closed" },
          },
        },
      },
    },
    normalize: {
      proven: {
        relations: {
          src: { grain: ["id"], fields: { id: key, region: key, v: ratio } },
          norm: {
            grain: ["id"],
            fields: { id: key, region: key, v: ratio },
            derivedBy: { kind: "normalize", from: "src", field: "v" },
          },
        },
      },
      // Rescaling a measure leaves the row set alone.
      undetermined: null,
      refuted: {
        relations: {
          src: { grain: ["id"], fields: { id: key, region: key, v: ratio } },
          norm: {
            grain: ["region"],
            fields: { id: key, region: key, v: ratio },
            derivedBy: { kind: "normalize", from: "src", field: "v" },
          },
        },
      },
    },
    project: {
      proven: {
        relations: {
          src: { grain: ["a"], fields: { a: key, b: ratio } },
          p: { grain: ["a"], fields: { a: key }, derivedBy: { kind: "project", from: "src", keep: ["a"] } },
        },
      },
      // Dropping a grain column may or may not collapse duplicate rows. Which
      // one happened is a fact about the ROWS, so the declaration cannot say.
      undetermined: {
        relations: {
          src: { grain: ["a", "b"], fields: { a: key, b: key, c: ratio } },
          p: { grain: ["a"], fields: { a: key, c: ratio }, derivedBy: { kind: "project", from: "src", keep: ["a", "c"] } },
        },
      },
      refuted: {
        relations: {
          src: { grain: ["a"], fields: { a: key, b: key } },
          p: { grain: ["b"], fields: { a: key, b: key }, derivedBy: { kind: "project", from: "src", keep: ["a", "b"] } },
        },
      },
    },
    graph: {
      proven: {
        relations: {
          edges: { grain: ["s", "t"], fields: { s: key, t: key, v: ratio } },
          g: {
            grain: ["s", "t"],
            fields: { s: key, t: key, v: ratio },
            derivedBy: { kind: "graph", from: "edges", edgeFrom: "s", edgeTo: "t", value: "v" },
          },
        },
      },
      // Reading a relation as edges does not change which rows exist.
      undetermined: null,
      refuted: {
        relations: {
          edges: { grain: ["s", "t"], fields: { s: key, t: key, v: ratio } },
          g: {
            grain: ["s"],
            fields: { s: key, t: key, v: ratio },
            derivedBy: { kind: "graph", from: "edges", edgeFrom: "s", edgeTo: "t", value: "v" },
          },
        },
      },
    },
  };

  /** Every relation's grain replaced by `unknown`, leaving the derivations alone. */
  const withUnknownGrain = (s: unknown) => {
    const c = JSON.parse(JSON.stringify(s)) as RelationalStructure;
    for (const r of Object.values(c.relations)) r.grain = "unknown";
    return c;
  };

  it("covers every operator the schema admits, so a new one cannot inherit silence by default", () => {
    const schemaKinds = Derivation.options.map((o) => o.shape.kind.value as string);
    expect(schemaKinds.sort()).toEqual(Object.keys(cases).sort());
  });

  for (const [kind, c] of Object.entries(cases)) {
    describe(kind, () => {
      it("says nothing only when the declared result is a PROVEN member of the operator's result set", () => {
        expect(findings(valid(c.proven))).toEqual([]);
        expect(judge(c.proven as RelationalStructure, []).status).toBe("admissible");
      });

      it("refutes a declaration the operator's own semantics contradict", () => {
        const f = findings(valid(c.refuted));
        expect(f).toHaveLength(1);
        expect(f[0].kind).toBe("diagnostic");
        expect(f[0].code).toBe(DERIVATION_DIAG.RESULT_NOT_DERIVABLE);
        expect(judge(c.refuted as RelationalStructure, []).status).toBe("illegal");
      });

      it("decides rather than abstains when the INPUT grain is itself unknown", () => {
        // The uninformative input is where an operator is most tempted to fall
        // through to "cannot tell". It must not: an unknown input grain yields
        // an unknown result grain, which is a determination. Only the three
        // operators with an `undetermined` entry above may ever owe an
        // obligation, and never for this reason.
        const s = valid(withUnknownGrain(c.proven));
        expect(findings(s).filter((f) => f.kind === "obligation")).toEqual([]);
      });

      if (c.undetermined !== null) {
        it("raises an obligation, not silence, when it cannot determine the result grain", () => {
          const f = findings(valid(c.undetermined));
          expect(f).toHaveLength(1);
          expect(f[0].kind).toBe("obligation");
          expect(f[0].term).toBe(OBLIGATION.GRAIN_DECLARED);
          expect(f[0].code).toBeUndefined();
          const j = judge(c.undetermined as RelationalStructure, []);
          expect(j.status).toBe("unproven");
          expect(termsOf(j)).toContain(OBLIGATION.GRAIN_DECLARED);
          expect(codesOf(j)).toEqual([]);
        });
      }
    });
  }

  it("the three outcomes are genuinely distinct for one operator, not three unrelated fixtures", () => {
    // Same relations, same fields, same operator. Only the cardinality and the
    // declared grain move — and the judgment moves across all three values.
    const statuses = (["proven", "undetermined", "refuted"] as const).map(
      (k) => judge(cases.join[k] as RelationalStructure, []).status,
    );
    expect(statuses).toEqual(["admissible", "unproven", "illegal"]);
  });

  it("uses an obligation term the frozen vocabulary already carries", () => {
    // The boundary may not invent premises. `grain:declared` is in the pack's
    // `grain` namespace, which is scope.out for this slice.
    const vocabulary = JSON.parse(
      fs.readFileSync(path.join(CONTRACTS_DIR, "analytical-pack", "vocabulary.json"), "utf-8"),
    ) as { namespaces: Record<string, string[]> };
    const [ns, name] = OBLIGATION.GRAIN_DECLARED.split(":");
    expect(vocabulary.namespaces[ns]).toContain(name);
  });

  it("an undecided derivation narrows the judgment; only a refuted one withholds standing", () => {
    // A refuted result has no standing, so assertions over it are not
    // evaluated. An UNDECIDED one is a different epistemic state: the field
    // typing is settled by the declaration whether or not the grain is, so a
    // measurement-theoretic defect over it is a real finding and must surface.
    const undecided = valid({
      relations: {
        orders: { grain: ["order_id"], fields: { order_id: key, rank: ordinal } },
        lines: { grain: ["line_id"], fields: { line_id: key, order_id: key } },
        joined: {
          grain: ["line_id"],
          fields: { line_id: key, order_id: key, rank: ordinal },
          derivedBy: { kind: "join", from: "orders", with: "lines", cardinality: "many-to-many" },
        },
      },
    }) as RelationalStructure;
    const j = judge(undecided, [{ kind: "aggregate", relation: "joined", field: "rank", op: "mean" }] as never);
    expect(termsOf(j)).toContain(OBLIGATION.GRAIN_DECLARED);
    expect(j.diagnostics.map((d) => d.code)).toContain("REL_MEANINGFULNESS_ORDINAL_MEAN");
    expect(j.status).toBe("illegal");
  });
});

describe("the project transition law: remove fields, never reinterpret retained ones", () => {
  /**
   * The defect: certification compared field NAMES. A projection could change a
   * retained field from ratio to nominal and `checkDerivations` returned
   * nothing, so every downstream judgment about that field was about a
   * different field wearing the old name.
   */
  const src = {
    grain: ["k"],
    fields: {
      k: { transformation: "nominal", key: true },
      v: { transformation: "ratio", unit: { units: ["usd"] } },
      dropped: { transformation: "ordinal" },
    },
  };
  const structure = (outFields: Record<string, unknown>, keep: string[] = ["k", "v"]) =>
    ({
      relations: {
        src,
        out: { grain: ["k"], fields: outFields, derivedBy: { kind: "project", from: "src", keep } },
      },
    }) as unknown as RelationalStructure;

  const codes = (s: RelationalStructure) => checkDerivations(s).map((f) => f.code ?? f.term);

  it("an identical retained declaration is valid", () => {
    expect(codes(structure({ k: src.fields.k, v: src.fields.v }))).toEqual([]);
  });

  it("a retained field whose transformation changed is refuted, even though its name survived", () => {
    const s = structure({ k: src.fields.k, v: { transformation: "nominal", unit: { units: ["usd"] } } });
    expect(codes(s)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
    expect(checkDerivations(s)[0].detail).toMatch(/retains v by name but redeclares/);
  });

  it("a retained field whose unit changed is refuted: reinterpretation is not only about transformation", () => {
    const s = structure({ k: src.fields.k, v: { transformation: "ratio", unit: { units: ["eur"] } } });
    expect(codes(s)).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
  });

  it("a renamed field is refuted, which the name check already caught and must keep catching", () => {
    expect(codes(structure({ k: src.fields.k, w: src.fields.v }))).toEqual([DERIVATION_DIAG.RESULT_NOT_DERIVABLE]);
  });

  it("CONTROL: a DROPPED field's declaration is irrelevant, or projection would be impossible", () => {
    // The over-broad version of this check would require the output to equal
    // its input, defeating the operator. `dropped` is not kept, so nothing about
    // it — including its absence — may be refuted.
    expect(codes(structure({ k: src.fields.k, v: src.fields.v }))).toEqual([]);
  });

  it("the law is STATED where it is certified, so the prose and the check cannot drift", () => {
    expect(OPERATOR_LAWS.project.statement).toMatch(/may not reinterpret/);
    for (const [name, law] of Object.entries(OPERATOR_LAWS)) {
      expect(law.statement.trim().length, `${name} states no law`).toBeGreaterThan(0);
      expect(typeof law.certify, `${name} has no certifier`).toBe("function");
    }
  });
});

describe("conservation fails closed on evidence it cannot read", () => {
  /**
   * The defect: a row missing `from`, `to`, or a numeric value was skipped.
   * An unread edge is missing from BOTH sides of the balance, so silence could
   * turn an unbalanced graph into an apparently balanced one.
   */
  const structure = {
    relations: {
      edges: {
        grain: ["src", "dst"],
        fields: {
          src: { transformation: "nominal", key: true },
          dst: { transformation: "nominal", key: true },
          qty: { transformation: "ratio" },
        },
      },
      flow: {
        grain: ["src", "dst"],
        fields: {
          src: { transformation: "nominal", key: true },
          dst: { transformation: "nominal", key: true },
          qty: { transformation: "ratio" },
        },
        derivedBy: { kind: "graph", from: "edges", edgeFrom: "src", edgeTo: "dst", value: "qty", requiresConservation: true },
      },
    },
  } as unknown as RelationalStructure;

  const run = (rows: Record<string, unknown>[]) =>
    checkDerivations(structure, { rows: { edges: rows } } as never).map((f) => f.code ?? f.term);

  // a -> b -> c, balanced at b.
  const BALANCED = [
    { src: "a", dst: "b", qty: 5 },
    { src: "b", dst: "c", qty: 5 },
  ];

  it("CONTROL: all rows complete and balanced yields no finding", () => {
    expect(run(BALANCED)).toEqual([]);
  });

  it("CONTROL: all rows complete and unbalanced is a DIAGNOSTIC, not an obligation", () => {
    expect(
      run([
        { src: "a", dst: "b", qty: 5 },
        { src: "b", dst: "c", qty: 3 },
      ]),
    ).toEqual([DIAG.FLOW_NOT_CONSERVED]);
  });

  for (const [label, row] of [
    ["from", { dst: "c", qty: 5 }],
    ["to", { src: "b", qty: 5 }],
    ["value", { src: "b", dst: "c" }],
  ] as const) {
    it(`a row missing ${label} yields an obligation, never silence`, () => {
      expect(run([{ src: "a", dst: "b", qty: 5 }, row as Record<string, unknown>])).toEqual([OBLIGATION.CONSERVATION]);
    });
  }

  it("a null value is unusable, so an absent observation cannot discharge the invariant", () => {
    expect(run([{ src: "a", dst: "b", qty: 5 }, { src: "b", dst: "c", qty: null }])).toEqual([OBLIGATION.CONSERVATION]);
  });

  it("MIXED: complete rows alongside an incomplete one cannot decide, even when the readable rows balance", () => {
    // The mutant killer. An implementation that used "whatever rows it could
    // understand" would return no finding here, because a->b->c balances on its
    // own — while the unread edge could carry any amount into or out of b.
    const mixed = [...BALANCED, { src: "b", qty: 99 } as Record<string, unknown>];
    expect(run(mixed)).toEqual([OBLIGATION.CONSERVATION]);
    const detail = checkDerivations(structure, { rows: { edges: mixed } } as never)[0].detail;
    expect(detail).toMatch(/1 of 3 edge observation\(s\) cannot be read/);
    expect(detail).toMatch(/missing from both sides of the balance/);
  });

  it("an obligation narrows the judgment rather than blocking it", () => {
    const findings = checkDerivations(structure, { rows: { edges: [...BALANCED, { src: "b" }] } } as never);
    expect(findings.every((f) => f.kind === "obligation")).toBe(true);
  });
});
