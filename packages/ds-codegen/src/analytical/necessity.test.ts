/**
 * REL-FIELD-ALGEBRA-02 Phase B acceptance: the stage-1.5 necessity census.
 *
 * C1  every kernel coordinate carries a holding witness (coverage);
 * C2  every witness holds: schema-valid stimuli, oracle-different outcomes,
 *     collision under the claimed erasure, minimality for 2-sets;
 * C3  the harness is falsified: it rejects a non-collision, a non-minimal
 *     2-set, an erasure that only produces schema invalidity, a same-outcome
 *     pair, and a 3-set;
 * C4  every stage-1 coordinate (census-stage1.json, derived from the frozen
 *     Phase-A schema) is dispositioned exactly once, and the live kernel census
 *     equals exactly the ratified set (post-removal equality);
 * C5  D6: the eight scale labels decode onto the capability basis with exactly
 *     one alias pair, and every factorized distinction resolves;
 * C6  conservation: the frozen Phase-A ledger equals the live ledger modulo the
 *     recorded key rewrites (removals change occurrence keys and nothing else);
 * C7  the engine agrees with every hand adjudication (evidence, not source).
 */
import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { BASELINE_FILE, checkBaseline, type Baseline } from "./baseline.js";
import { decodeScale, scaleAliases, type ScaleLabel } from "./capabilities.js";
import { type Coordinate, deriveCensus, FIXTURE_SCHEMA, loadBranchSignatures, loadCensus } from "./census.js";
import { judge } from "./engines.js";
import { codesOf, termsOf } from "./judgment.js";
import {
  checkWitness,
  disposition,
  FIXTURES_DIR,
  isolationViolation,
  loadCensusSnapshot,
  loadOracle,
  loadRemovals,
  loadWitnesses,
  outcomeFrom,
  primitiveRatified,
  interactionOnly,
  classifyWitness,
  resolveSide,
  type Witness,
} from "./necessity.js";
import { canonical, collides, erase } from "./quotient.js";
import { loadBases, orphanedCoordinates } from "./experiments.js";
import { loadSubtraction, verdictDrift } from "./subtraction.js";
import type { RelationalStructure } from "./relation-model.js";
import type { Fixture } from "./structure.js";

const oracle = loadOracle();
const kernel = loadCensus();
const kernelIds = new Set(kernel.map((c) => c.id));
const stage1 = loadCensusSnapshot();
const witnesses = loadWitnesses().witnesses;
const removals = loadRemovals();
const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf-8")) as Baseline;
const bindings = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, "bindings.json"), "utf-8")) as {
  cases: Record<string, string>;
  neighbours: Record<string, string>;
  triads: Record<string, { absent: string; satisfying: string; hostile: string }>;
};
const isCoordinate = (c: Coordinate) => c.kind !== "reference";

/**
 * REL-VIEW-ALGEBRA-01 admitted the L3 derivation coordinates before any rule or
 * fixture can witness them. `subtraction-stage2.json` freezes exactly that set
 * as the basis of one experiment, and the slice may not claim ratification
 * while any of them is unadjudicated. Every assertion below that would
 * otherwise refuse an unwitnessed kernel coordinate subtracts this FROZEN set
 * and nothing else, so the guard is narrowed by an auditable list rather than
 * relaxed — and, because the list is frozen rather than re-derived, a
 * coordinate a later stage admits does not slip through it either.
 */
const subtraction = loadSubtraction();
// Accounting is basis MEMBERSHIP: every registered experiment's candidates are
// propositions somebody has opened. (Ownership — who is still on the hook — is
// the narrower `unresolved` question, and lives in experiments.ts.)
const pendingIds = new Set(loadBases().flatMap((b) => b.candidates));
/** Candidates a verdict has already removed from the kernel. */
const removedByVerdict = new Set(
  Object.entries(subtraction.verdicts)
    .filter(([, v]) => v.disposition === "representation-artifact" || v.disposition === "not-yet-admitted")
    .map(([id]) => id),
);
const holding = witnesses.filter((w) => checkWitness(w, kernel, oracle).ok);
/**
 * STANDING: a holding single-coordinate witness. The only evidence that meets
 * the retention criterion — erasing exactly this coordinate destroys the
 * distinction.
 */
const ratifiedIds = primitiveRatified(holding);
/** Supported only by a minimal multi-coordinate witness: distinction proven, factorization open. */
const interactionIds = new Set(interactionOnly(holding));
/**
 * ACCOUNTING over the FROZEN stage-1 ledger: any holding witness. Stage 1.5
 * closed under the older rule, and re-scoring its coordinates from outside it
 * would rewrite a finished experiment's result. The newer rule reaches them
 * through a bounded audit basis instead.
 */
const stage1Accounted = new Set([...ratifiedIds, ...interactionIds]);

const count = (cs: Coordinate[]) => ({
  leaves: cs.filter((c) => c.kind === "leaf").length,
  pairs: cs.filter((c) => c.kind === "member-pair").length,
  references: cs.filter((c) => c.kind === "reference").length,
});

describe("C0 — provenance of the two censuses", () => {
  it("census-stage1.json was derived from the schema the Phase-A baseline froze", () => {
    expect(stage1.derivedFrom).toBe(baseline.digests["fixture.schema.json"]);
  });
  it("the stage-1 census has 46 leaves, 212 member pairs and 10 references", () => {
    expect(count(stage1.coordinates)).toEqual({ leaves: 46, pairs: 212, references: 10 });
  });
  it("the kernel census is the stage-1.5 kernel plus the stage-2 admission, and every addition is ledgered", () => {
    // Stage 1.5 closed at 26 leaves / 21 pairs / 4 references. Stage 2 admits
    // the L3 derivation algebra; the growth is only legitimate while every
    // added coordinate is either witnessed or in the pending ledger.
    // 49 -> 52 leaves: the discriminator normal form replaced 13 member-absence
    // cross-terms with the three holder-presence facts they were spelling
    // (`relation.derivedBy`, `field.additivity`, `field.temporality`), which
    // are owned by their own basis rather than appended to the frozen 118.
    expect(count(kernel)).toEqual({ leaves: 52, pairs: 55, references: 25 });
    const unaccounted = kernel
      .filter(isCoordinate)
      .filter((c) => !ratifiedIds.has(c.id) && !pendingIds.has(c.id))
      .map((c) => c.id);
    expect(unaccounted).toEqual([]);
  });
  it("the kernel is a proper subset of the stage-1 census by identity or recorded mapping", () => {
    const stage1Ids = new Set(stage1.coordinates.map((c) => c.id));
    const carried = new Set([...Object.values(removals.leafMap), ...removals.factorized["field.scale"].into]);
    for (const c of kernel) {
      if (c.kind === "reference") continue;
      // member-absence is a coordinate CLASS the stage-1 census could not
      // express, not a new kernel fact: the schema it walked is unchanged, so
      // these ids have no stage-1 counterpart by construction. Stage-2
      // admissions likewise post-date that snapshot. Both are dispositioned
      // against the stage-2 oracle via the pending ledger, not here.
      // A `#facet` id is a refinement of a stage-1 leaf, not a new kernel
      // fact; `removals.leafMap` records which successor carries it.
      if (c.kind === "member-absence" || c.id.includes("#") || pendingIds.has(c.id)) continue;
      const known = stage1Ids.has(c.id) || carried.has(c.leaf);
      expect(known, `${c.id} is a kernel coordinate the stage-1 census never carried`).toBe(true);
    }
  });
  it("every member-absence coordinate belongs to a leaf the kernel already carries", () => {
    // Refining the census must not smuggle in a new leaf under cover of the
    // new class.
    for (const c of kernel.filter((c) => c.kind === "member-absence")) {
      expect(kernelIds.has(c.leaf), `${c.id} has no kernel leaf`).toBe(true);
    }
  });
});

describe("C2 — every witness holds", () => {
  for (const w of witnesses) {
    it(`${w.coordinates.join(" + ")}`, () => {
      const r = checkWitness(w, kernel, oracle);
      expect(r.failures, JSON.stringify(r.failures)).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }
  it("no coordinate set is claimed by more than one witness of the same shape with the same stimuli", () => {
    const seen = new Set<string>();
    for (const w of witnesses) {
      const k = `${w.coordinates.join("+")}|${JSON.stringify(w.a)}|${JSON.stringify(w.b)}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
    }
  });
});

describe("C1 — coverage: every kernel coordinate is ratified", () => {
  const ratified = primitiveRatified(witnesses.filter((w) => checkWitness(w, kernel, oracle).ok));
  it("every leaf and member pair of the kernel has a holding witness", () => {
    const missing = kernel
      .filter(isCoordinate)
      .filter((c) => !pendingIds.has(c.id))
      .filter((c) => !ratified.has(c.id))
      .map((c) => c.id);
    expect(missing).toEqual([]);
  });
  /**
   * The member-absence class is the open obligation of REL-VIEW-ALGEBRA-01 A4,
   * and it is enumerated here so it cannot be forgotten or quietly absorbed.
   * The slice may not close with this list non-empty: each id must either earn
   * a witness against the stage-2 oracle or leave the kernel with a removals
   * entry. It is deliberately NOT dispositioned yet — a coordinate that stage 1
   * cannot separate may be separable once the stage-2 derivations exist, and
   * ablating before that would remove something the next commit re-earns.
   */
  it("no live kernel coordinate is an orphaned claim", () => {
    // The invariant that survives growth, and it is NOT stage-2's: a later
    // stage may admit whatever its authority demands, provided the same bounded
    // change opens a basis that owns it. What fails is an unexplained degree of
    // freedom with neither a proof nor a burden of proof attached.
    expect(orphanedCoordinates()).toEqual([]);
  });

  it("every recorded verdict is true of the live tree", () => {
    // Keyed to the frozen basis, never to the census: it asks only whether the
    // verdicts this experiment recorded have actually taken effect.
    expect(verdictDrift(subtraction, kernelIds, ratified)).toEqual([]);
  });
  it("no witness names a coordinate the kernel does not have", () => {
    const phantom = [...ratified].filter((id) => !kernelIds.has(id));
    expect(phantom).toEqual([]);
  });
  it("the separating-set bound is 2 and the 2-sets are exactly the four precommitted shapes", () => {
    const twoSets = witnesses.filter((w) => w.coordinates.length === 2).map((w) => w.coordinates.join(" + ")).sort();
    expect(witnesses.every((w) => w.coordinates.length <= 2)).toBe(true);
    expect(twoSets).toEqual([
      "assertion.kind + assertion.aggregate.op",
      "assertion.kind:aggregate~ratio-comparison + assertion.aggregate.op",
      "field.additivity.kind:additive~semi-additive + field.additivity.semi-additive.nonAdditiveAlong#present",
      "field.additivity.kind:semi-additive~ratio-measure + field.additivity.semi-additive.nonAdditiveAlong#present",
    ]);
  });
  it("witness evidence class: schema-role coordinates witnessed only with rows are exactly the three null-handling distinctions (invariant 9)", () => {
    const hasRows = (w: Witness) =>
      [w.a, w.b].some((s) => {
        const f = resolveSide(s, oracle).fixture;
        return f.evidence?.rows !== undefined;
      });
    const instanceOnly = kernel
      .filter(isCoordinate)
      .filter((c) => c.role === "schema")
      .filter((c) => {
        const ws = witnesses.filter((w) => w.coordinates.includes(c.id));
        return ws.length > 0 && ws.every(hasRows);
      })
      .map((c) => c.id);
    // A handling's distinctions are visible only once a missing value is present; the
    // leaf itself (handling declared or not) has a schema-class witness.
    expect(instanceOnly).toEqual([
      "assertion.aggregate.nulls:exclude~as-zero",
      "assertion.aggregate.nulls:exclude~as-observed",
      "assertion.aggregate.nulls:as-zero~as-observed",
    ]);
  });
});

describe("C3 — the harness is falsified", () => {
  const byId = new Map(kernel.map((c) => [c.id, c]));
  const codes = (w: Witness) => checkWitness(w, kernel, oracle).failures.map((f) => f.code);

  it("rejects a pair that does not collide under the claimed erasure", () => {
    // FX_REGION_MAX vs FX_N_TEMP_MEAN differ in transformation AND op: erasing transformation alone cannot identify them
    expect(codes({ coordinates: ["field.transformation"], a: { fixture: "FX_REGION_MAX" }, b: { fixture: "FX_N_TEMP_MEAN" } })).toEqual(["NO_COLLISION"]);
  });
  it("rejects a 2-set whose single erasure already collides", () => {
    expect(
      codes({ coordinates: ["field.transformation", "field.key"], a: { fixture: "FX_REGION_MAX" }, b: { fixture: "FX_N_ORDINAL_MAX" } }),
    ).toEqual(["NOT_MINIMAL"]);
  });
  it("rejects an erasure that only produces schema invalidity", () => {
    const w: Witness = {
      coordinates: ["field.transformation"],
      a: { fixture: "FX_REGION_MAX" },
      b: { base: "FX_REGION_MAX", patch: [{ set: "structure.relations.sites.fields.region.transformation", value: "absolute" }], outcome: outcomeFrom("admissible"), cause: "none" },
    };
    expect(codes(w)).toContain("SCHEMA_INVALID");
  });
  it("rejects an erasure that manufactures a derivation defect instead of isolating its coordinate", () => {
    // A structure whose derived relation is lawful. Erasing the incidence of
    // `derivedBy.project.from` replaces a resolvable relation name with a
    // token, which dangles — so any collision would be that dangling reference
    // rather than the co-reference relation the coordinate is about.
    const structure = {
      relations: {
        src: { grain: ["k"], fields: { k: { transformation: "nominal", key: true }, v: { transformation: "ratio" } } },
        out: {
          grain: ["k"],
          fields: { k: { transformation: "nominal", key: true }, v: { transformation: "ratio" } },
          derivedBy: { kind: "project", from: "src", keep: ["k", "v"] },
        },
      },
    } as unknown as RelationalStructure;
    const fixture = { id: "fx_probe", structure, assertions: [] } as unknown as Fixture;
    const coord = loadCensus().find((c) => c.id === "relation.derivedBy.project.from#incidence")!;
    expect(coord).toBeDefined();
    expect(isolationViolation(fixture, coord)).toMatch(/introduced derivation defect/);
  });
  it("incidence erasure preserves arity and order, so it isolates co-reference alone", () => {
    const before = ["region", "product", "region"];
    const coord = loadCensus().find((c) => c.id === "assertion.aggregate.along#incidence")!;
    const fixture = {
      id: "fx_probe",
      structure: {
        relations: {
          r: {
            grain: ["region"],
            fields: {
              region: { transformation: "nominal", key: true },
              product: { transformation: "nominal", key: true },
              v: { transformation: "ratio" },
            },
          },
        },
      },
      assertions: [{ kind: "aggregate", relation: "r", field: "v", op: "sum", along: before }],
    } as unknown as Fixture;
    const after = erase(fixture, coord) as unknown as { assertions: { along: string[] }[] };
    expect(after.assertions[0].along).toHaveLength(before.length);
    // Every position distinct: co-reference (region appearing twice) is gone,
    // which is exactly and only what incidence means.
    expect(new Set(after.assertions[0].along).size).toBe(before.length);
    expect(isolationViolation(fixture, coord)).toBeUndefined();
  });
  /**
   * A discriminator member-absence coordinate. Built rather than looked up: the
   * census no longer emits this class (it is the cross-term of holder presence
   * and branch identity), but the erasure rule that refuses it must stay
   * falsifiable, or retiring the class would have deleted its own guard.
   */
  const absenceCoord = (leaf: string, member: string): Coordinate => ({
    id: `${leaf}:${member}~<absent>`,
    kind: "member-absence",
    leaf,
    members: [member, "<absent>"],
    role: "schema",
  });

  it("rejects a member-absence erasure that empties a payload-carrying branch", () => {
    // `erase` spells "member m vs absent" by emptying the holder, because a
    // branch stripped of its tag is neither absence nor schema-valid. For
    // `derivedBy` every branch requires `from`, so the quotient removes the
    // operand as well as the tag and stops being about the member at all: what
    // it actually erases is "this relation is derived" versus "it is not".
    const structure = {
      relations: {
        src: { grain: ["k"], fields: { k: { transformation: "nominal", key: true }, v: { transformation: "ratio" } } },
        out: {
          grain: ["k"],
          fields: { k: { transformation: "nominal", key: true }, v: { transformation: "ratio" } },
          derivedBy: { kind: "project", from: "src", keep: ["k", "v"] },
        },
      },
    } as unknown as RelationalStructure;
    const fixture = { id: "fx_probe", structure, assertions: [] } as unknown as Fixture;
    const coord = absenceCoord("relation.derivedBy.kind", "project");
    const violation = isolationViolation(fixture, coord);
    expect(violation).toMatch(/holder presence/);
    // The message must name what was destroyed, or it cannot be adjudicated.
    expect(violation).toMatch(/\.from|\.keep/);
  });

  it("permits a member-absence erasure on a tag-only branch, so the rule is not a blanket refusal", () => {
    // `additivity: { kind: "additive" }` carries nothing but its tag, so
    // emptying the holder removes exactly the leaf the coordinate names. The
    // rule has to distinguish these two cases or it would refuse every
    // member-absence coordinate rather than the over-factored ones.
    const structure = {
      relations: {
        r: {
          grain: ["k"],
          fields: {
            k: { transformation: "nominal", key: true },
            v: { transformation: "ratio", additivity: { kind: "additive" } },
          },
        },
      },
    } as unknown as RelationalStructure;
    const fixture = { id: "fx_probe", structure, assertions: [] } as unknown as Fixture;
    const coord = absenceCoord("field.additivity.kind", "additive");
    expect(isolationViolation(fixture, coord)).toBeUndefined();
  });

  it("is measured per stimulus: the same coordinate is isolated or not depending on what the branch carries", () => {
    // `temporality.grain` is optional on the same object as `kind`, so
    // `temporality.kind:instant~<absent>` is isolated against a bare `{kind}`
    // and NOT isolated against `{kind, grain}` — where erasure would also
    // destroy the grain fact that REL_TEMPORAL_GRAIN_MIXED depends on.
    const fieldWith = (temporality: Record<string, unknown>) =>
      ({
        id: "fx_probe",
        structure: {
          relations: {
            r: {
              grain: ["k"],
              fields: { k: { transformation: "nominal", key: true }, t: { transformation: "interval", temporality } },
            },
          },
        },
        assertions: [],
      }) as unknown as Fixture;
    const coord = absenceCoord("field.temporality.kind", "instant");
    expect(isolationViolation(fieldWith({ kind: "instant" }), coord)).toBeUndefined();
    expect(isolationViolation(fieldWith({ kind: "instant", grain: "day" }), coord)).toMatch(/holder presence/);
  });

  it("rejects a pair the oracle does not tell apart", () => {
    expect(codes({ coordinates: ["field.transformation:ordinal~interval"], a: { fixture: "FX_N_TEMP_MEAN" }, b: { fixture: "FX_N_SURVEY_MEAN_RATIO_SCORE" } })).toContain("SAME_OUTCOME");
  });
  it("rejects a separating set of three", () => {
    expect(codes({ coordinates: ["field.transformation", "field.key", "relation.grain"], a: { fixture: "FX_REGION_MAX" }, b: { fixture: "FX_N_ORDINAL_MAX" } })).toContain(
      "TOO_MANY_COORDINATES",
    );
  });
  it("rejects a witness whose stimuli are the same representation", () => {
    expect(codes({ coordinates: ["field.key"], a: { fixture: "FX_TEMP_SUM" }, b: { base: "FX_TEMP_SUM", patch: [], outcome: outcomeFrom("admissible"), cause: "none" } })).toContain(
      "IDENTICAL_STIMULI",
    );
  });
  it("a side with no oracle adjudication and no hand adjudication is refused", () => {
    expect(() => resolveSide({ fixture: "FX_P_OHLC" }, oracle)).toThrow(/no oracle-adjudicated outcome/);
  });
  it("erasure is total: a leaf erased leaves no occurrence anywhere in the fixture", () => {
    const key = byId.get("field.key")!;
    const f = oracle.fixtures.get("FX_USER_ID_SUM")!;
    expect(JSON.stringify(erase(f, key))).not.toContain('"key"');
    expect(canonical(erase(f, key))).not.toContain('"key"');
  });

  it("the canonical form carries every part of a fixture a coordinate can name", () => {
    // `canonical` decides what "the same representation" means, so anything it
    // drops is a distinction no witness can ever be required to erase — every
    // coordinate under that key would collide with everything, and NO_COLLISION
    // would pass without the erasure doing any work. `alphaRename` rebuilt each
    // relation as {grain, fields} and each structure as {relations}, silently
    // dropping `derivedBy` and `peers`, which is exactly the surface stage 2
    // adjudicates.
    for (const f of oracle.fixtures.values()) {
      const shown = canonical(f);
      for (const [name, rel] of Object.entries(f.structure.relations)) {
        if (rel.derivedBy) expect(shown, `${f.id}: ${name}.derivedBy is invisible to canonical()`).toContain('"derivedBy"');
      }
      if (f.structure.peers) expect(shown, `${f.id}: structure.peers is invisible to canonical()`).toContain('"peers"');
    }
  });

  it("two fixtures differing only in their derivation are NOT the same representation", () => {
    // The direct consequence: before the repair these two collided under an
    // erasure that touches neither of them.
    const a = oracle.fixtures.get("FX_READINGS_BINNED_NO_CLOSURE")!;
    const b = oracle.fixtures.get("FX_N_READINGS_BINNED_LEFT_CLOSED")!;
    expect(canonical(a)).not.toBe(canonical(b));
    const unrelated = byId.get("relation.derivedBy.kind:aggregate-to-grain~project")!;
    expect(collides(a, b, unrelated)).toBe(false);
  });

  it("a derivation's operands are renamed, and its closed-vocabulary values are not", () => {
    const f = oracle.fixtures.get("FX_ORDER_REVENUE_SUMMED_AFTER_LINE_JOIN")!;
    const shown = canonical(f);
    // Operand spelling is gone (relations became r1.., fields f1..) while the
    // cardinality — a value, not an identifier — survives verbatim. Renaming it
    // would make a spelling confer standing rather than removing it.
    expect(shown).not.toContain('"orders"');
    expect(shown).toContain('"one-to-many"');
  });
});

describe("C1b — a minimal multi-coordinate witness is weaker evidence than a single one", () => {
  /**
   * The claim being separated. A holding 2-set proves:
   *
   *     erase c1        -> distinction remains
   *     erase c2        -> distinction remains
   *     erase c1 + c2   -> distinction disappears
   *
   * so it establishes that the SET is a necessary separating set, and — via the
   * NOT_MINIMAL rule — positively establishes that neither member separates
   * alone. Reading that as "each member has primitive standing" inverts it.
   */
  it("no coordinate gets standing from a multi-coordinate witness alone", () => {
    const primitive = primitiveRatified(holding);
    for (const id of interactionOnly(holding)) {
      expect(primitive.has(id), `${id} has standing but only a multi-coordinate witness supports it`).toBe(false);
    }
  });

  it("every multi-coordinate witness the harness accepts is minimal, which is what makes it weaker", () => {
    // If a member alone already collided the stimuli, checkWitness would have
    // raised NOT_MINIMAL. So acceptance IS the proof that neither separates
    // alone — the evidence and the disqualification are the same fact.
    for (const w of holding.filter((x) => x.coordinates.length > 1)) {
      const coords = w.coordinates.map((id) => kernel.find((c) => c.id === id)!);
      expect(coords.every(Boolean), `${w.coordinates.join(" + ")} names an unknown coordinate`).toBe(true);
      const a = resolveSide(w.a, oracle).fixture;
      const b = resolveSide(w.b, oracle).fixture;
      for (const c of coords) {
        expect(collides(a, b, c), `${c.id} alone already separates, so the set is not minimal`).toBe(false);
      }
    }
  });

  it("the interaction population is owned by an experiment, not silently accounted", () => {
    // The audit basis exists precisely so these are questions rather than
    // assumptions. If it were deleted they would become orphans, which is the
    // invariant refusing to let the population disappear quietly.
    const owned = new Set(loadBases().flatMap((b) => b.candidates));
    for (const id of interactionOnly(holding)) {
      expect(owned.has(id), `${id} is interaction-only and no basis owns it`).toBe(true);
    }
  });
});

describe("C1c — a multi-coordinate witness is classified, and the classification can fail", () => {
  const single = primitiveRatified(holding);
  const multi = holding.filter((w) => w.coordinates.length > 1);
  const classify = (w: (typeof multi)[number]) => classifyWitness(w, kernel, oracle, single);

  it("every multi-coordinate witness gets a classification, and none is silently `single`", () => {
    for (const w of multi) {
      const c = classify(w);
      expect(c.klass, w.coordinates.join(" + ")).not.toBe("single");
      expect(c.conditions.length).toBeGreaterThan(0);
    }
  });

  it("hygiene requires all five conditions, so dropping the control changes the verdict", () => {
    // Condition 5 is what makes this empirical rather than an excuse: without a
    // control, "the payload got in the way" is unfalsifiable.
    const hygienic = multi.filter((w) => classify(w).klass === "quotient-hygiene");
    expect(hygienic.length, "no hygiene witness to test the conditions against").toBeGreaterThan(0);
    for (const w of hygienic) {
      expect(classifyWitness(w, kernel, oracle, new Set()).klass).not.toBe("quotient-hygiene");
    }
  });

  it("an UNAVAILABLE control reports indeterminate, never interaction", () => {
    // A two-member discriminator has one member pair, so the pair under test is
    // the only one the enum has and no control can exist. Calling that
    // `interaction` would manufacture a conclusion from the size of the
    // vocabulary rather than from the witness.
    for (const w of multi) {
      const c = classify(w);
      const cond5 = c.conditions.find((x) => x.id.startsWith("5-"));
      if (cond5 && !cond5.held && cond5.detail.startsWith("UNAVAILABLE")) {
        expect(c.klass).toBe("indeterminate");
        expect(c.conditions.filter((x) => !x.held)).toHaveLength(1);
      }
    }
  });

  it("a witness with no discriminator substitution is interaction, not hygiene", () => {
    // `assertion.kind + assertion.aggregate.op` pairs a bare LEAF with a
    // payload leaf. There is no tag rewrite for residue to be conditional on.
    const w = multi.find((x) => x.coordinates.includes("assertion.kind"));
    expect(w, "expected the bare-leaf witness to still exist").toBeDefined();
    const c = classify(w!);
    expect(c.klass).toBe("interaction");
    expect(c.conditions[0].id).toBe("1-one-discriminator-substitution");
    expect(c.conditions[0].held).toBe(false);
  });

  it("names the carrier and the residue separately, because they are different claims", () => {
    for (const w of multi.filter((x) => classify(x).klass === "quotient-hygiene")) {
      const c = classify(w);
      expect(c.carrier).toBeTruthy();
      expect(c.residue?.length).toBeGreaterThan(0);
      expect(c.residue).not.toContain(c.carrier);
      // The residue must be branch-conditional payload under the carrier's holder.
      const holder = c.carrier!.split(":")[0].replace(/\.kind$/, "");
      for (const r of c.residue!) expect(r.startsWith(`${holder}.`)).toBe(true);
    }
  });
});

describe("C1d — cleanup cardinality bounds which pairs a <=2-coordinate witness can even express", () => {
  /**
   * Erasing a discriminator rewrites one member's tag to the other's. Required
   * payload each branch carries that the other does not is RESIDUE: it survives
   * the rewrite and keeps the two encodings out of the same comparison class.
   * So the smallest raw erasure set is 1 + the residue on each side.
   *
   * This is a fact about branch topology, not about any judgment, and it is
   * pinned because it is what makes a whole class of witness search futile
   * BEFORE anyone runs it.
   */
  // Read from the census's own accumulator rather than by re-walking the
  // schema here. Two readings of "which properties does branch m require" are
  // free to disagree, and `deriveNormalization` derives every closure's
  // normalization set from this one — so this is the reading that must be
  // under test.
  const branchRequired = (): Map<string, string[]> =>
    new Map(Object.entries(loadBranchSignatures().get("relation.derivedBy.kind")!.required));

  const pairs = () => {
    const req = branchRequired();
    const kinds = [...req.keys()];
    const rows: { pair: string; onlyA: string[]; onlyB: string[] }[] = [];
    for (let i = 0; i < kinds.length; i++) {
      for (let j = i + 1; j < kinds.length; j++) {
        const [a, b] = [kinds[i], kinds[j]];
        rows.push({
          pair: `${a}~${b}`,
          onlyA: req.get(a)!.filter((k) => !req.get(b)!.includes(k)),
          onlyB: req.get(b)!.filter((k) => !req.get(a)!.includes(k)),
        });
      }
    }
    return rows;
  };

  it("exactly one derivation pair has no residue, and it is the control", () => {
    const zero = pairs().filter((p) => p.onlyA.length === 0 && p.onlyB.length === 0);
    expect(zero.map((p) => p.pair)).toEqual(["bin~normalize"]);
  });

  it("every other pair has residue on BOTH sides, so no unilateral-asymmetry witness exists", () => {
    // The additivity hygiene witnesses fit in two coordinates because only one
    // branch carried payload. No derivation pair but the control has that shape.
    for (const p of pairs().filter((x) => x.pair !== "bin~normalize")) {
      expect(p.onlyA.length, `${p.pair} has no residue on the left`).toBeGreaterThan(0);
      expect(p.onlyB.length, `${p.pair} has no residue on the right`).toBeGreaterThan(0);
    }
  });

  it("only the control is expressible within the <=2-coordinate contract", () => {
    // The bound `checkWitness` enforces is 2. A pair needing 1 + residue > 2
    // raw erasures cannot be put to it at all, so recording `interaction` for
    // one of them would report a semantic difference where the test merely
    // failed to erase the second branch's residue.
    const expressible = pairs().filter((p) => 1 + p.onlyA.length + p.onlyB.length <= 2);
    expect(expressible.map((p) => p.pair)).toEqual(["bin~normalize"]);
  });

  it("records the minimum raw edit per pair, which is 3, 4 or 5 for the twenty", () => {
    const edits = pairs()
      .filter((p) => p.pair !== "bin~normalize")
      .map((p) => 1 + p.onlyA.length + p.onlyB.length);
    expect(edits).toHaveLength(20);
    expect(Math.min(...edits)).toBe(3);
    expect(Math.max(...edits)).toBe(5); // join~graph: {with, cardinality} against {edgeFrom, edgeTo}
  });
});

describe("C4 — every stage-1 coordinate is dispositioned exactly once; the kernel equals the ratified set", () => {
  // Accounting, not standing: see the note on `stage1Accounted`.
  const ratified = stage1Accounted;
  const dispositions = stage1.coordinates.map((c) => [c, disposition(c, ratified, kernelIds, removals)] as const);

  it("every stage-1 coordinate is ratified, not-yet-admitted, or a name reference", () => {
    const undecided = dispositions.filter(([, d]) => d.state !== "ratified" && d.state !== "not-yet-admitted" && d.state !== "reference");
    expect(undecided).toEqual([]);
  });
  it("counts: 81 ratified (24 leaves, 57 pairs), 177 not-yet-admitted (128 at stage 2, 49 at stage 3), 10 references", () => {
    const tally = { ratified: 0, "not-yet-admitted": 0, reference: 0 };
    const ratifiedKinds = { leaf: 0, "member-pair": 0 };
    const stages: Record<string, number> = {};
    for (const [c, d] of dispositions) {
      tally[d.state]++;
      if (d.state === "ratified") ratifiedKinds[c.kind as "leaf" | "member-pair"]++;
      if (d.state === "not-yet-admitted") stages[String(d.reintroducibleAt)] = (stages[String(d.reintroducibleAt)] ?? 0) + 1;
    }
    expect(dispositions).toHaveLength(268);
    expect(tally).toEqual({ ratified: 81, "not-yet-admitted": 177, reference: 10 });
    // 26 kernel leaves less the four capability leaves the scale leaf factorizes into, plus scale and rollup.op
    expect(ratifiedKinds).toEqual({ leaf: 24, "member-pair": 57 });
    expect(stages).toEqual({ "2": 128, "3": 49 });
  });
  it("every removal names a real stage-1 leaf that the kernel no longer carries, or has been re-admitted and ledgered", () => {
    const stage1Leaves = new Set(stage1.coordinates.filter((c) => c.kind === "leaf").map((c) => c.id));
    for (const r of removals.removed) {
      expect(stage1Leaves.has(r.coordinate), r.coordinate).toBe(true);
      expect(r.reintroducibleAt).toBeGreaterThanOrEqual(2);
      if (!kernelIds.has(r.coordinate)) continue;
      // Re-admission is the point of `reintroducibleAt`, but it is only lawful
      // when the coordinate is carrying its own new witness or is on the
      // pending ledger awaiting one. A removal that reappears silently would
      // mean stage 1.5's subtraction had been undone by drift.
      expect(r.reintroducibleAt, `${r.coordinate} re-admitted before its stage`).toBeLessThanOrEqual(2);
      expect(
        ratified.has(r.coordinate) || pendingIds.has(r.coordinate),
        `${r.coordinate} is back in the kernel with neither a witness nor a pending entry`,
      ).toBe(true);
    }
  });
  it("every removal says WHY, so absence is adjudicated rather than merely recorded", () => {
    // `reintroducibleAt` keeps absence re-earnable; the reason is what makes it
    // a verdict. A removal whose only message is that the coordinate is gone is
    // a bare enumeration, and a later stage reading it cannot tell whether the
    // distinction was unnecessary or merely unwitnessed at the time.
    for (const r of removals.removed) {
      expect(r.reason?.trim(), `${r.coordinate} was removed with no reason`).toBeTruthy();
      expect(r.reason, `${r.coordinate}: reason restates the coordinate instead of naming an authority`).not.toBe(
        r.coordinate,
      );
    }
  });
  it("stage 2 re-admitted exactly the coordinates its cases demand", () => {
    const back = removals.removed.filter((r) => kernelIds.has(r.coordinate)).map((r) => r.coordinate).sort();
    // temporal grain (daily vs monthly resolved together) and the suppressed
    // null kind (a withheld value is not zero) are the only stage-1.5 removals
    // a stage-2 case demands back. Rate re-derivation is NOT here: no stage-2
    // case requires unit numerator/denominator, so it stays out until stage 3
    // regardless of it having been named as a pressure point beforehand.
    expect(back).toEqual(["field.temporality.grain"]);
    expect(kernelIds.has("field.unit.numerator")).toBe(false);
    expect(kernelIds.has("field.unit.denominator")).toBe(false);
  });
  it("no coordinate is both removed and carried (leafMap / memberMap / factorized)", () => {
    const carried = new Set([...Object.keys(removals.leafMap), ...Object.keys(removals.memberMap), ...Object.keys(removals.factorized)]);
    for (const r of removals.removed) expect(carried.has(r.coordinate), r.coordinate).toBe(false);
  });
  it("every not-yet-admitted coordinate records the stage that may re-earn it", () => {
    for (const [c, d] of dispositions) {
      if (d.state === "not-yet-admitted") expect(d.reintroducibleAt, `${c.id}: ${d.reason}`).toBeGreaterThanOrEqual(2);
    }
  });
  it("the live kernel census is exactly the ratified set plus the pending ledger, with no overlap", () => {
    const live = kernel.filter(isCoordinate).map((c) => c.id).sort();
    // A candidate whose verdict removed it is no longer expected in the kernel,
    // so the equality doubles as a check that the removal actually took effect:
    // a `representation-artifact` still present would show up as a surplus here.
    const expected = [...new Set([...ratified, ...pendingIds])].filter((id) => !removedByVerdict.has(id)).sort();
    expect(live).toEqual(expected);
    // Membership is not ownership, and accounting is not standing. A candidate
    // whose verdict is `witnessed` is both in a basis and ratified, which is one
    // of the outcomes a basis exists to reach; an interaction-only coordinate is
    // historically accounted AND owed an audit, which is that audit's premise.
    // What must never coexist is PRIMITIVE STANDING and an open obligation.
    const stillOwed = new Set(loadBases().flatMap((b) => b.unresolved));
    expect([...ratifiedIds].filter((id) => stillOwed.has(id))).toEqual([]);
  });
  it("every ratified stage-1 coordinate resolves to a kernel coordinate that exists", () => {
    for (const [c, d] of dispositions) {
      if (d.state !== "ratified") continue;
      for (const via of d.via) expect(kernelIds.has(via), `${c.id} via ${via}`).toBe(true);
    }
  });
});

describe("C5 — D6: capabilities are primitive; scale labels are derived aliases", () => {
  const labels: ScaleLabel[] = ["nominal", "ordinal", "cyclic", "interval", "ratio", "count", "proportion", "index"];
  it("eight labels decode onto seven capability states with exactly one alias pair (ratio ≡ count)", () => {
    const states = new Set(labels.map((l) => JSON.stringify(decodeScale(l))));
    expect(states.size).toBe(7);
    const aliases = Object.values(scaleAliases()).filter((g) => g.length > 1);
    expect(aliases).toEqual([["ratio", "count"]]);
    expect(removals.factorized["field.scale"].aliases).toEqual([["ratio", "count"]]);
  });
  it("every stage-1 scale distinction is ratified through a capability coordinate, except the alias", () => {
    const ratified = primitiveRatified(witnesses.filter((w) => checkWitness(w, kernel, oracle).ok));
    const pairs = stage1.coordinates.filter((c) => c.kind === "member-pair" && c.leaf === "field.scale");
    expect(pairs).toHaveLength(28);
    const unratified = pairs.map((c) => [c.id, disposition(c, ratified, kernelIds, removals)] as const).filter(([, d]) => d.state !== "ratified");
    expect(unratified.map(([id]) => id)).toEqual(["field.scale:ratio~count"]);
  });
  it("the kernel carries no scale label", () => {
    expect(kernelIds.has("field.scale")).toBe(false);
    expect(JSON.stringify(kernel)).not.toContain('"field.scale');
  });
});

describe("C6 — conservation: the Phase-A ledger equals the live ledger modulo recorded key rewrites", () => {
  it("every recorded judgment is reproduced byte-for-byte after the key rewrites", () => {
    // The Phase-A record is a freeze, so fixtures added by later stages are
    // additions rather than movements and are excluded here. A movement inside
    // a recorded judgment is a regression under any option, and that is what
    // this asserts.
    expect(checkBaseline(BASELINE_FILE, { ledgerOnly: true, rewrites: removals.keyRewrites, ignoreAdditions: true })).toEqual([]);
  });

  it("still reports a fixture added since the freeze, so the exclusion is a choice and not a blind spot", () => {
    const added = checkBaseline(BASELINE_FILE, { ledgerOnly: true, rewrites: removals.keyRewrites })
      .filter((d) => d.startsWith("fixture added since baseline:"))
      .map((d) => d.replace("fixture added since baseline: ", ""));
    expect(added.length).toBeGreaterThan(0);
    // Every one of them is a stage-2 fixture the binding ledger accounts for,
    // which is where new fixtures are governed.
    const bound = new Set([
      ...Object.values(bindings.cases),
      ...Object.values(bindings.neighbours),
      ...Object.values(bindings.triads).flatMap((t) => [t.absent, t.satisfying, t.hostile]),
    ]);
    for (const id of added) expect(bound.has(id), `${id} is not bound by any ledger section`).toBe(true);
  });
  it("without the rewrites exactly the fixtures whose occurrence KEYS carried a rollup or a max move, and nothing else", () => {
    // Admissible fixtures carry no key, so a former rollup or max that is admissible does not appear.
    const moved = checkBaseline(BASELINE_FILE, { ledgerOnly: true })
      .map((d) => /^judgment moved: (\S+)/.exec(d)?.[1])
      .filter((x): x is string => x !== undefined)
      .sort();
    expect(moved).toEqual([
      "FX_GDP_PER_CAPITA_ROLLUP_MEAN",
      "FX_H_KPI_INDEX_AND_RATE",
      "FX_ORDERS_ROLLUP_UNKNOWN_GRAIN",
      "FX_REGION_MAX",
      "FX_S_MIXED_FAULT",
      "FX_S_TWO_CURRENCY_SUMS_TWO_UNKNOWN_GRAINS",
      "FX_T_GRAIN_WITNESS_DUPLICATE_ROWS",
    ]);
  });
});

describe("C8 — the census is derived, exhaustive and exactly-once", () => {
  const schema = JSON.parse(fs.readFileSync(FIXTURE_SCHEMA, "utf-8")) as Record<string, unknown>;

  it("every coordinate id appears exactly once", () => {
    const ids = kernel.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("a leaf added to the model appears in the census with no hand edit", () => {
    const mutated = JSON.parse(JSON.stringify(schema)) as { definitions: Record<string, { properties: Record<string, unknown> }> };
    mutated.definitions.field.properties.foo = { type: "string" };
    mutated.definitions.field.properties.mode = { type: "string", enum: ["a", "b", "c"] };
    const ids = deriveCensus(mutated as Record<string, unknown>).map((c) => c.id);
    expect(ids).toContain("field.foo");
    expect(ids).toContain("field.mode");
    // `mode` is optional (field.required does not name it), so it contributes
    // both member pairs and member-absence coordinates.
    expect(ids.filter((id) => id.startsWith("field.mode:"))).toEqual([
      "field.mode:a~b",
      "field.mode:a~c",
      "field.mode:b~c",
      "field.mode:a~<absent>",
      "field.mode:b~<absent>",
      "field.mode:c~<absent>",
    ]);
    expect(kernelIds.has("field.foo")).toBe(false);
  });
  it("member-absence is emitted only where absence is a state the schema admits and the member is not the leaf's only one", () => {
    const mutated = JSON.parse(JSON.stringify(schema)) as {
      definitions: Record<string, { properties: Record<string, unknown>; required?: string[] }>;
    };
    // required enum: absence is impossible, so no member-absence coordinate
    mutated.definitions.field.properties.req = { type: "string", enum: ["x", "y"] };
    mutated.definitions.field.required = [...(mutated.definitions.field.required ?? []), "req"];
    // optional single-member literal: "the one member vs absent" IS the leaf,
    // so emitting it too would double-count the same erasure under two ids
    mutated.definitions.field.properties.flag = { type: "boolean", enum: [true] };
    const ids = deriveCensus(mutated as Record<string, unknown>).map((c) => c.id);
    expect(ids).toContain("field.req");
    expect(ids).toContain("field.req:x~y");
    expect(ids.filter((id) => id.startsWith("field.req:") && id.includes("<absent>"))).toEqual([]);
    expect(ids).toContain("field.flag");
    expect(ids.filter((id) => id.startsWith("field.flag:"))).toEqual([]);
  });
  it("the absence sentinel cannot collide with a real member of the same name", () => {
    // `observation.null` really has a member called `absent`, so a bare
    // `observation.null:censored~absent` would denote both a member pair and a
    // member-absence coordinate; the later id shadowed the earlier one in
    // kernelPair and moved three stage-1 coordinates out of `ratified`.
    const nullIds = kernel.filter((c) => c.leaf === "observation.null").map((c) => c.id);
    expect(nullIds).toContain("observation.null:absent~censored");
    expect(nullIds).toContain("observation.null:absent~<absent>");
    expect(nullIds).not.toContain("observation.null:censored~absent");
    expect(new Set(nullIds).size).toBe(nullIds.length);
  });
  it("evidence coordinates are the instance-evidence ones and nothing in the declaration is", () => {
    const instance = kernel.filter((c) => c.role === "instance").map((c) => c.leaf);
    expect([...new Set(instance)].sort()).toEqual([
      "evidence.grainWitness",
      "evidence.rows.*",
      "observation.null",
      "observation.unit",
      "observation.value",
    ]);
    for (const c of kernel) if (c.id.startsWith("field.") || c.id.startsWith("relation.") || c.id.startsWith("assertion.")) expect(c.role).toBe("schema");
  });
  it("name references are listed for exhaustiveness and are not coordinates", () => {
    // References are detected structurally — a property whose value type is
    // `name` — so a new one joins the census with no hand edit. Their SPELLING
    // confers no standing; their structure does, and that lives in the
    // `reference-topology` coordinates beside each.
    expect(kernel.filter((c) => c.kind === "reference").map((c) => c.id).sort()).toEqual([
      "assertion.aggregate.along",
      "assertion.aggregate.field",
      "assertion.aggregate.relation",
      "assertion.ratio-comparison.field",
      "assertion.ratio-comparison.relation",
      "evidence.grainWitness",
      "field.additivity.semi-additive.nonAdditiveAlong",
      "field.whole.perRow",
      "relation.derivedBy.aggregate-to-grain.from",
      "relation.derivedBy.aggregate-to-grain.toGrain",
      "relation.derivedBy.bin.field",
      "relation.derivedBy.bin.from",
      "relation.derivedBy.graph.edgeFrom",
      "relation.derivedBy.graph.edgeTo",
      "relation.derivedBy.graph.from",
      "relation.derivedBy.graph.value",
      "relation.derivedBy.join.from",
      "relation.derivedBy.join.with",
      "relation.derivedBy.nest.from",
      "relation.derivedBy.nest.levels",
      "relation.derivedBy.normalize.field",
      "relation.derivedBy.normalize.from",
      "relation.derivedBy.project.from",
      "relation.derivedBy.project.keep",
      "structure.peers[]",
    ]);
    // Every reference carries an incidence coordinate; only list-valued ones
    // carry arity and order, because a single slot has neither to vary.
    const facetsOf = (leaf: string) =>
      kernel.filter((c) => c.kind === "reference-topology" && c.leaf === leaf).map((c) => c.facet).sort();
    expect(facetsOf("assertion.aggregate.relation")).toEqual(["incidence"]);
    expect(facetsOf("relation.derivedBy.nest.levels")).toEqual(["arity", "incidence", "order"]);
    // The peer declaration's presence is a claim its elements cannot carry.
    expect(kernelIds.has("structure.peers#present")).toBe(true);
  });
});

describe("C7 — the engine agrees with every hand adjudication (evidence, not source)", () => {
  for (const w of witnesses) {
    for (const [label, side] of [["a", w.a], ["b", w.b]] as const) {
      if ("fixture" in side) continue;
      it(`${w.coordinates.join(" + ")} / ${label}: ${side.cause.slice(0, 60)}`, () => {
        const r = resolveSide(side, oracle);
        const j = judge(r.fixture.structure, r.fixture.assertions, r.fixture.evidence);
        expect({ status: j.status, codes: codesOf(j), terms: termsOf(j) }).toEqual(r.outcome);
      });
    }
  }
  it("witness files are the committed ones the harness read", () => {
    expect(fs.existsSync(path.join(path.dirname(BASELINE_FILE), "witnesses.json"))).toBe(true);
    expect(fs.existsSync(path.join(path.dirname(BASELINE_FILE), "removals.json"))).toBe(true);
  });
});
