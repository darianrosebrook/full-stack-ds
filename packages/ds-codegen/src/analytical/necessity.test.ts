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
import { type Coordinate, deriveCensus, FIXTURE_SCHEMA, loadBranchSignatures, loadCensus, loadPlans } from "./census.js";
import { judge } from "./engines.js";
import { codesOf, termsOf } from "./judgment.js";
import {
  checkWitness,
  disposition,
  FIXTURES_DIR,
  CONTRACTS_DIR,
  checkIsolation,
  checkCombinedIsolation,
  changedPaths,
  findingId,
  type IsolationResult,
  codomainHolds,
  evidenceStanding,
  historicallyAccounted,
  historicalDispositions,
  reinterpretHistorically,
  loadHistoricalAccounting,
  reconcileHistory,
  accountedBy,
  type CurrentSupport,
  loadCodomainAdjudications,
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
import { checkDerivations, type BoundaryFinding } from "./derivation.js";
import { markersIn } from "./quotient-image.js";
import { canonical, collides, erase } from "./quotient.js";
import { loadClosures } from "./closure.js";
import { loadBases, orphanedCoordinates } from "./experiments.js";
import { basesForSpec, loadSubtraction, verdictDrift } from "./subtraction.js";
import type { RelationalStructure } from "./relation-model.js";
import { type Fixture, loadFixtureValidator } from "./structure.js";

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
  holdout: string[];
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
/**
 * Candidates a verdict has already removed from the kernel, across EVERY basis
 * the spec opened.
 *
 * Reading only `subtraction-stage2.json` was the same gap the gate had: a
 * verdict recorded in a sibling basis did not count, so a coordinate correctly
 * adjudicated `representation-artifact` there still read as expected-in-kernel
 * and the equality below failed against a removal that had in fact taken effect.
 */
const removedByVerdict = new Set(
  basesForSpec("REL-VIEW-ALGEBRA-01")
    .flatMap(({ ledger }) => Object.entries(ledger.verdicts))
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
/**
 * Closure carriers whose stimuli exist and whose argument is not refuted.
 *
 * Accounting must follow the evidence when the evidence changes FORM. The two
 * additivity hygiene 2-sets became closures — same stimuli, same causes, a
 * structurally derived operation in place of a synthetic presence coordinate —
 * and leaving them out here would re-score a finished experiment's coordinates
 * as unaccounted because a later stage improved how their argument is written.
 * That is the precise thing the note above forbids.
 *
 * It confers no STANDING: `primitiveRatified` is untouched, and a provisional
 * closure still leaves its candidate `unresolved`.
 */
const closureAccounted = new Set(
  loadClosures()
    .closures.filter((c) => c.a !== undefined && c.b !== undefined && c.promotion !== "refuted")
    .flatMap((c) => [c.carrier, ...c.dependencies]),
);
/**
 * The three classes, kept apart.
 *
 * `stage1Accounted` below is their union and is an ACCOUNTING figure: it
 * answers whether the experiment carries a coordinate at all, which is what the
 * stage-1 dispositioner asks. It is not a standing figure — 4 of the 77 it
 * yields rest on a not-refuted closure and nothing stronger — so anything that
 * reports standing takes `support` and names the class.
 */
const support: CurrentSupport = { primitive: ratifiedIds, interactionOnly: interactionIds, closureAccounted };
const stage1Accounted = accountedBy(support);

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
    // 52 -> 36: the SECOND instance of that class. A property required by an
    // optional holder's branch has present(p) = present(H) AND branch(H) = k,
    // which the holder-presence coordinate and the `kind` member pairs already
    // carry between them, so sixteen inherited-only presence facets were
    // derived conjunctions rather than degrees of freedom.
    expect(count(kernel)).toEqual({ leaves: 36, pairs: 55, references: 25 });
    // Accounted THREE ways, not two: ratified, on the pending ledger, or
    // suspended by the codomain adjudication. The third is a coordinate whose
    // witness the instrument change invalidated — it is still accounted for,
    // by a ledger that names the invalidated evidence and the repair, and the
    // equality below means a coordinate cannot go missing by being quietly
    // added to it.
    const unaccounted = kernel
      .filter(isCoordinate)
      .filter((c) => !ratifiedIds.has(c.id) && !pendingIds.has(c.id))
      .map((c) => c.id);
    expect(unaccounted.sort()).toEqual([...new Set(heldOpen)].filter((id) => kernelIds.has(id) && !pendingIds.has(id)).sort());
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

describe("C2 — every witness holds, or is held open for adjudication", () => {
  const awaiting = new Map(loadCodomainAdjudications().awaiting.map((a) => [a.witness, a]));

  for (const w of witnesses) {
    const key = w.coordinates.join(" + ");
    it(key, () => {
      const r = checkWitness(w, kernel, oracle);
      const open = awaiting.get(key);
      if (open === undefined) {
        expect(r.failures, JSON.stringify(r.failures)).toEqual([]);
        expect(r.ok).toBe(true);
        return;
      }
      // Held open by `codomain-adjudications.json`. The entry does NOT excuse
      // the witness — it asserts the witness currently fails, which is checked
      // here, so a ledger entry cannot outlive the failure it describes.
      expect(r.ok, `${key} holds again: remove its codomain-adjudications entry`).toBe(false);
      expect(open.detail.length, `${key} is held open with no measured detail`).toBeGreaterThan(80);
      expect(open.repair.length, `${key} is held open with no named repair`).toBeGreaterThan(40);
    });
  }

  it("holds open exactly three witnesses, all of them one defect: a hole is observable where an absence was not", () => {
    // The ratchet, in the direction a list of names cannot see. Every witness
    // that fails must be listed, so a NEW failure cannot hide behind the
    // ledger's existence; and the count is pinned, so the ledger cannot grow
    // quietly.
    const failing = witnesses.filter((w) => !checkWitness(w, kernel, oracle).ok).map((w) => w.coordinates.join(" + "));
    expect([...new Set(failing)].sort()).toEqual([...awaiting.keys()].sort());
    expect(awaiting.size).toBe(3);
    expect([...awaiting.values()].map((a) => a.reason).sort()).toEqual(["branch-residue", "branch-residue", "holder-presence"]);
  });

  it("every suspension points from a recorded historical standing to a measured current failure", () => {
    // Both ends verified against evidence, neither authored. The historical end
    // is the recovered stage-1 record; the current end is what `checkWitness`
    // reports right now. An entry claiming a coordinate held something it never
    // held, or claiming a failure the harness does not produce, fails here.
    const hist = loadHistoricalAccounting().byEvidenceClass;
    const classOf = (id: string) =>
      hist.primitive.includes(id) ? "primitive" : hist.interactionOnly.includes(id) ? "interaction-only" : hist.closureAccounted.includes(id) ? "closure-accounted" : "none";
    for (const [key, a] of awaiting) {
      const w = witnesses.find((x) => x.coordinates.join(" + ") === key)!;
      // The declared set is the witness's own coordinate set, so nothing it
      // touched can be omitted and nothing it did not touch can be smuggled in.
      expect([...a.declares].sort(), key).toEqual([...w.coordinates].sort());
      for (const id of a.declares) expect(a.historicalStanding[id], `${key}/${id}`).toBe(classOf(id));
      // A loss is only ever of the class the coordinate actually held.
      for (const id of a.lost) expect(classOf(id), `${key}/${id} is recorded as a primitive loss`).toBe("primitive");
      for (const id of a.interactionOnlyLost ?? []) expect(classOf(id), `${key}/${id} is recorded as an interaction-only loss`).toBe("interaction-only");
      // And the current end is the codes the harness produces, not a summary.
      const codes = [...new Set(checkWitness(w, kernel, oracle).failures.map((f) => f.code))].sort();
      expect(a.currentFailure.codes, key).toEqual(codes);
      expect(codes.length, `${key} is held open with no current failure`).toBeGreaterThan(0);
    }
  });

  it("a coordinate a lapsed witness merely NAMES is not thereby suspended", () => {
    // The distinction the `declares` field exists to keep. Every coordinate a
    // ledger entry names must be either recorded as having lost a class it
    // actually held, or still supported by evidence of its own.
    const holds = codomainHolds();
    for (const a of loadCodomainAdjudications().awaiting) {
      for (const id of a.declares) {
        const claimedLoss = a.lost.includes(id) || (a.interactionOnlyLost ?? []).includes(id);
        if (claimedLoss) {
          expect(holds.has(id), `${id} is recorded as a loss but not suspended`).toBe(true);
          continue;
        }
        const s = evidenceStanding(id, support, holds);
        expect(s.state, `${id} is named by a failed witness, claims no loss, and has nothing supporting it`).toBe("holding");
      }
    }
  });
  it("no coordinate set is claimed by more than one witness of the same shape with the same stimuli", () => {
    const seen = new Set<string>();
    for (const w of witnesses) {
      const k = `${w.coordinates.join("+")}|${JSON.stringify(w.a)}|${JSON.stringify(w.b)}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
    }
  });
});

/** Coordinates whose evidence is held open by the codomain adjudication ledger. */
const heldOpen = loadCodomainAdjudications().awaiting.flatMap((a) => a.lost);

describe("C1 — coverage: every kernel coordinate is ratified", () => {
  const ratified = primitiveRatified(witnesses.filter((w) => checkWitness(w, kernel, oracle).ok));
  it("every leaf and member pair of the kernel has a holding witness, or an open codomain adjudication", () => {
    const missing = kernel
      .filter(isCoordinate)
      .filter((c) => !pendingIds.has(c.id))
      .filter((c) => !ratified.has(c.id))
      .map((c) => c.id);
    // The four that lost their witness when the quotient gained a codomain are
    // NOT quietly excused: each is named in `codomain-adjudications.json` with
    // the measured reason its evidence changed, and this asserts the two sets
    // are EQUAL — so a coordinate that loses its witness for some other reason
    // still fails here, and an adjudication that stops being needed fails too.
    expect(missing.sort()).toEqual([...new Set(heldOpen)].sort());
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
  it("the separating-set bound is 2, and the two 2-sets left are the assertion cluster", () => {
    const twoSets = witnesses.filter((w) => w.coordinates.length === 2).map((w) => w.coordinates.join(" + ")).sort();
    expect(witnesses.every((w) => w.coordinates.length <= 2)).toBe(true);
    expect(twoSets).toEqual([
      "assertion.kind + assertion.aggregate.op",
      "assertion.kind:aggregate~ratio-comparison + assertion.aggregate.op",
    ]);
  });

  it("the two additivity 2-sets became closures rather than disappearing", () => {
    // They named `field.additivity.semi-additive.nonAdditiveAlong#present`,
    // which the required-child presence rule removes as a derived conjunction.
    // They were expressible as plain 2-sets ONLY because that synthetic
    // proposition made a branch-field deletion look like a coordinate erasure,
    // so this is a change of FORM, not a loss of evidence — and an honest
    // downgrade, since a closure confers no standing where a holding 2-set
    // conferred interaction-only support. The check is that the argument
    // survived, not merely that the witnesses left.
    const migrated = loadClosures().closures.filter((c) => c.carrier.startsWith("field.additivity.kind:"));
    expect(migrated.map((c) => c.carrier).sort()).toEqual([
      "field.additivity.kind:additive~semi-additive",
      "field.additivity.kind:semi-additive~ratio-measure",
    ]);
    for (const c of migrated) {
      expect(c.a, `${c.carrier} lost its stimuli in the migration`).toBeDefined();
      expect(c.b, `${c.carrier} lost its stimuli in the migration`).toBeDefined();
      expect(c.normalization.map((n) => `${n.holder}.${n.branch}.${n.field}`)).toEqual([
        "field.additivity.semi-additive.nonAdditiveAlong",
      ]);
    }
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
    // The diagnostic is NAMED, not merely counted. `REL_DERIVATION_INPUT_MISSING`
    // is the specific collateral this guard exists to catch; a message that only
    // says "a defect appeared" would go on passing if the guard started firing
    // on something else entirely.
    const r = checkIsolation(fixture, coord);
    expect(r.state).toBe("violated");
    expect(r.state === "violated" && r.detail).toContain("REL_DERIVATION_INPUT_MISSING@out");
  });

  /**
   * The applicability boundary: which ARGUMENT decides whether the check runs.
   *
   * `checkDerivations` takes a `RelationalStructure`. Deciding applicability
   * from the enclosing `Fixture` instead makes an ENVELOPE requirement — a
   * fixture id pattern, a minimum assertion count — silently disable a
   * STRUCTURAL check, which is how this guard stopped guarding once already.
   */
  describe("C3b — applicability is decided by the argument, not the envelope", () => {
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
    const wrap = (assertions: unknown[]) => ({ id: "fx_probe", structure, assertions }) as unknown as Fixture;
    const bare = wrap([]);
    const wrapped = wrap([{ kind: "aggregate", relation: "out", field: "v", op: "sum", along: ["k"] }]);
    const incidence = loadCensus().find((c) => c.id === "relation.derivedBy.project.from#incidence")!;

    it("the envelope rejects both probes, on grounds that say nothing about the structure", () => {
      // Stated first because it is what makes the next test a falsifier rather
      // than a tautology. Validating the fixture would have suppressed the
      // check on BOTH probes — `assertions` for one, the id pattern for both —
      // and neither ground is a claim about whether `checkDerivations` can read
      // this structure.
      const validate = loadFixtureValidator(CONTRACTS_DIR);
      expect(validate(bare)).toEqual(['/id must match pattern "^FX_[A-Z0-9_]+$"', "/assertions must NOT have fewer than 1 items"]);
      expect(validate(wrapped)).toEqual(['/id must match pattern "^FX_[A-Z0-9_]+$"']);
    });

    it("gives the same derivation-isolation result at zero and at one assertion", () => {
      const expected: IsolationResult = {
        state: "violated",
        detail:
          "erasure introduced derivation defect(s) diagnostic REL_DERIVATION_INPUT_MISSING@out via project(keep=2) [derivation-typing/schema], so any collision may be that defect rather than the coordinate",
      };
      expect(checkIsolation(bare, incidence)).toEqual(expected);
      expect(checkIsolation(wrapped, incidence)).toEqual(expected);
    });

    it("a forgotten discriminator is out of the ENGINE's domain, and no operator lookup is executed", () => {
      // `erase` holes `derivedBy.kind`, and `OPERATOR_LAWS[d.kind]` is a lookup
      // on a string: handing the image to the engine THROWS. That throw is the
      // observable. If the comparison ran, this call could not return — so a
      // returned result is direct evidence the lookup never happened, with
      // nothing mocked.
      const kindLeaf = loadCensus().find((c) => c.id === "relation.derivedBy.kind")!;
      const image = erase(bare, kindLeaf) as unknown as { structure: RelationalStructure };
      expect(markersIn(image.structure).map((m) => m.path)).toEqual(["relations.out.derivedBy.kind"]);
      expect(() => checkDerivations(image.structure)).toThrow();

      // AND THE OBLIGATION IS STILL DISCHARGED, by a named structural proof.
      // This is the control that keeps the repair from becoming "an image with
      // a marker may not support evidence" — which would hand the source
      // engine's domain authority over the quotient language, the confusion the
      // codomain exists to end.
      expect(checkIsolation(bare, kindLeaf)).toEqual({ state: "discharged", by: ["quotient-legal", "slot-local"] });
    });

    it("names every proposition established, and the engine adds to them rather than replacing them", () => {
      // The three states are distinguishable at the call site, which is what
      // `string | undefined` could not express: `undefined` meant both "the
      // comparison ran and found nothing" and "no comparison ran".
      //
      // And a discharge is a CONJUNCTION. A single label let the engine route
      // return before anything bounded where the change landed — which is how
      // an assertion-side erasure earned a discharge from a comparison that
      // reads only `structure`. Legality and locality are required of every
      // discharge; the engine contributes one more proposition on top.
      const kindLeaf = loadCensus().find((c) => c.id === "relation.derivedBy.kind")!;
      const byEngine = checkIsolation(bare, loadCensus().find((c) => c.id === "field.key")!);
      expect(byEngine.state === "discharged" && byEngine.by).toEqual(["no-introduced-finding", "quotient-legal", "slot-local"]);
      const byStructure = checkIsolation(bare, kindLeaf);
      expect(byStructure.state === "discharged" && byStructure.by).toEqual(["quotient-legal", "slot-local"]);
      // The engine's contribution is additive: whatever it established, the
      // structural propositions were established too.
      expect(byEngine.state === "discharged" && byEngine.by).toEqual(expect.arrayContaining(byStructure.state === "discharged" ? [...byStructure.by] : []));
      expect(byEngine).not.toEqual(byStructure);
    });

    it("an obligation nothing can bound is UNEVALUATED, not discharged", () => {
      // The third state, reachable and observed. Without a plan there is no
      // locator, so nothing says where the change was allowed to reach — and an
      // unbounded change is not a proof of locality, it is the absence of one.
      const kindLeaf = loadCensus().find((c) => c.id === "relation.derivedBy.kind")!;
      const r = checkIsolation(bare, kindLeaf, checkDerivations, () => undefined);
      expect(r.state).toBe("unevaluated");
      expect(r.state === "unevaluated" && r.reason).toMatch(/no erasure plan/);
    });

    it("catches a change the coordinate's own locator does not reach", () => {
      // Slot-locality can REFUTE, which is what makes it a proof rather than a
      // formality. A plan whose locator resolves to a different slot leaves the
      // real change outside every bound, and the result is a violation naming
      // the path.
      const kindLeaf = loadCensus().find((c) => c.id === "relation.derivedBy.kind")!;
      const elsewhere = loadPlans().get("relation.grain")!;
      const r = checkIsolation(bare, kindLeaf, checkDerivations, () => elsewhere);
      expect(r.state).toBe("violated");
      expect(r.state === "violated" && r.detail).toMatch(/derivedBy\.kind/);
      expect(r.state === "violated" && r.detail).toMatch(/its own locator does not reach/);
    });

    it("an instrument failure on an in-domain structure propagates; it is neither inapplicable nor clean", () => {
      // The property a catch-all destroys. Both structures here are in domain —
      // the previous tests establish that the same probe yields a real verdict
      // — so a throw can only mean the checker broke. Absorbing it would report
      // "this erasure introduced no defect", which is a false discharge of the
      // guard rather than an absence of opinion.
      const boom = () => {
        throw new TypeError("injected instrument failure");
      };
      expect(() => checkIsolation(bare, incidence, boom)).toThrow(/injected instrument failure/);
    });

    it("is a pure function of its arguments: no accumulated state orders the results", () => {
      // The hazard the module-level `inapplicableIsolationChecks` set carried.
      // Two coordinates over the same stimulus — one the engine can read, one it
      // cannot — must give the same pair of results in either evaluation order.
      const kindLeaf = loadCensus().find((c) => c.id === "relation.derivedBy.kind")!;
      const forward = [checkIsolation(bare, incidence), checkIsolation(bare, kindLeaf)];
      const backward = [checkIsolation(bare, kindLeaf), checkIsolation(bare, incidence)];
      expect(forward).toEqual([backward[1], backward[0]]);
      expect(forward[0].state).toBe("violated");
      expect(forward[1].state).toBe("discharged");
    });
  });

  /**
   * The two helpers the discharges REST ON, tested against structure rather
   * than against themselves.
   *
   * Both were wrong in the same way: a projection that dropped exactly the
   * information the check needed, while reporting confidently over what
   * survived. Expected results here are direct structural assertions — deep
   * equality, or a count read off the input — never the helper under test.
   */
  describe("C3d — the difference and the finding identity observe what they claim to", () => {
    /** Independent of `valueMap`: two JSON values are equal iff their serializations are. */
    const reallyEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

    const structural: [string, unknown, unknown][] = [
      ["an array emptied, then its holder dropped", { evidence: { rows: { r: [] } } }, { evidence: { rows: {} } }],
      ["an empty object deleted", { evidence: {} }, {}],
      ["an array becomes an object", { x: [] }, { x: {} }],
      ["an array of empty objects grows", { x: [{}] }, { x: [{}, {}] }],
    ];

    it("sees a container change with no scalar descendant", () => {
      // The blind spot, named case by case. The earlier walk recorded a value
      // only on reaching a scalar, so a container with none contributed nothing
      // — and holder presence, empty evidence collections and absent
      // declarations are precisely the distinctions this work keeps having to
      // recover. A no-op is still reported as one.
      for (const [name, a, b] of structural) {
        expect(reallyEqual(a, b), `${name}: the probe pair must actually differ`).toBe(false);
        expect(changedPaths(a, b), name).not.toEqual([]);
      }
      expect(changedPaths({ evidence: { rows: {} } }, { evidence: { rows: {} } })).toEqual([]);
      expect(changedPaths({ x: [1, 2] }, { x: [1, 2] })).toEqual([]);
    });

    it("locates the change at the container, not merely at some scalar under it", () => {
      // Locality is computed from these paths, so a difference reported at the
      // wrong depth would bound the erasure incorrectly even once it is seen.
      expect(changedPaths({ x: [] }, { x: {} })).toEqual([".x"]);
      expect(changedPaths({ x: [{}] }, { x: [{}, {}] })).toEqual(["", ".x", ".x[1]"].filter((p) => p !== ""));
      expect(changedPaths({ evidence: {} }, {})).toEqual(["", ".evidence"]);
    });

    it("refuses locality when an unrelated empty container is deleted alongside a legitimate erasure", () => {
      // The case that makes the repair load-bearing rather than cosmetic: an
      // erasure that does its own job AND quietly removes something invisible
      // must not pass. The plan is real; the extra deletion is not its business.
      const withSpare = {
        id: "fx_probe",
        structure: {
          relations: { r: { grain: ["k"], fields: { k: { transformation: "nominal", key: true }, v: { transformation: "ratio" } } } },
        },
        assertions: [],
        spare: {},
      } as unknown as Fixture;
      const grain = loadCensus().find((c) => c.id === "relation.grain")!;
      expect(checkIsolation(withSpare, grain).state).toBe("discharged");

      // Same erasure, plus the deletion of an empty container nothing named.
      const alsoDrops = (f: Fixture, c: Coordinate) => {
        const r = checkIsolation(f, c);
        void r;
        const image = JSON.parse(JSON.stringify(erase(f, c))) as Record<string, unknown>;
        delete image.spare;
        return image;
      };
      const image = alsoDrops(withSpare, grain);
      const outside = changedPaths(withSpare, image).filter((p) => !p.includes("grain") && p !== "");
      expect(outside, "the extra deletion must be visible as a change outside the erased slot").toContain(".spare");
    });

    it("distinguishes findings the coarse key collapsed", () => {
      // Three losses, each reproduced against the identity rather than argued.
      const f = (over: Partial<BoundaryFinding>): BoundaryFinding =>
        ({ kind: "diagnostic", subject: "out", derivation: "project(keep=2)", engine: "declaration-missing", evidenceClass: "declared", detail: "", ...over }) as BoundaryFinding;
      // An obligation carries `term` and no `code`; two different ones at one
      // subject both read `undefined@out` under the old projection.
      expect(findingId(f({ kind: "obligation", code: undefined, term: "grain:declared" }))).not.toBe(
        findingId(f({ kind: "obligation", code: undefined, term: "conservation" })),
      );
      // Which occurrence, and under what authority, were dropped entirely.
      expect(findingId(f({ code: "X", derivation: "project(keep=2)" }))).not.toBe(findingId(f({ code: "X", derivation: "join(one-to-many)" })));
      expect(findingId(f({ code: "X", engine: "declaration-missing" }))).not.toBe(findingId(f({ code: "X", engine: "additivity" })));
      // `detail` is prose that legitimately moves when the erasure changes a
      // value it quotes, so it is deliberately NOT part of the identity.
      expect(findingId(f({ code: "X", detail: "keep set misses the grain" }))).toBe(findingId(f({ code: "X", detail: "input lacks revenue" })));
    });

    it("does not credit the engine where a finding still present could mask a new cause, and does not discharge around it either", () => {
      // `checkDerivations` returns at its first refutation, so a structure that
      // still carries a broad code after the erasure can hide a DIFFERENT cause
      // behind the same identity — and no richer key recovers a cause that was
      // never computed. The engine route contributes nothing there. It used to
      // say so as a `limitation` on a discharge the structural proofs carried,
      // and nothing at admission read the limitation. The obligation is now
      // UNEVALUATED: the structural proofs bound the change and the image, and
      // say nothing about a defect introduced inside the slot.
      const corpus = [...oracle.fixtures.values()];
      const masking = corpus.find((f) => f.id === "FX_H_ORDERS_FLATTENED_REINTERPRETS_AMOUNT")!;
      expect(checkDerivations(masking.structure).map((d) => d.code)).toContain("REL_DERIVATION_RESULT_NOT_DERIVABLE");
      const at = (id: string) => checkIsolation(masking, kernel.find((c) => c.id === id)!);

      // The table over the real fixture, one row per way the engine's answer can go.
      // The key persists with the SAME cause behind it: unsettled.
      expect(at("relation.derivedBy.project.keep#order")).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/still carries diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat.*first-refutation checker cannot show/) });
      // The key persists with a DIFFERENT cause behind it (see the next test): unsettled — the engine cannot tell these two rows apart.
      expect(at("relation.derivedBy.project.keep#incidence")).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/first-refutation checker cannot show/) });
      // A different key appears: refuted, as before.
      expect(at("relation.derivedBy.project.from#incidence")).toMatchObject({ state: "violated", detail: expect.stringMatching(/introduced derivation defect\(s\) diagnostic REL_DERIVATION_INPUT_MISSING@flat/) });
      // The defective derivation itself is deleted and the finding goes with it:
      // the after-structure carries nothing, so there is nothing to hide behind,
      // and the engine HAS answered. Not a blanket withdrawal.
      expect(at("relation.derivedBy#present")).toEqual({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
      // The combined route answers the same way: a combination that deletes the
      // defective derivation leaves nothing behind to hide a cause, and the
      // engine has answered for the composed image too.
      const byId = (id: string) => kernel.find((c) => c.id === id)!;
      expect(checkCombinedIsolation(masking, [byId("relation.derivedBy#present"), byId("field.key")])).toEqual({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
      // No discharge on this fixture carries a hidden caveat any more: the field is gone.
      for (const c of kernel) expect(Object.keys(checkIsolation(masking, c)), c.id).not.toContain("limitation");

      // The control: a clean structure still earns an engine discharge, so the
      // rule is a response to masking and not a blanket withdrawal.
      const clean = corpus.find((f) => checkDerivations(f.structure).length === 0)!;
      const cleanResults = kernel.map((c) => checkIsolation(clean, c));
      expect(cleanResults.some((r) => r.state === "discharged" && r.by.includes("no-introduced-finding"))).toBe(true);
    });

    /**
     * THE REAL BROAD-CODE MASKING FIXTURE, through the witness the collision is
     * about. Side b is the same declaration with `keep` reordered and the
     * reinterpretation repaired: admissible, and it collides with a under
     * {keep#incidence, interval~ratio} while neither coordinate alone identifies
     * them — so the witness reaches the isolation loop on its own merits.
     */
    const MASKING_BASE = "FX_H_ORDERS_FLATTENED_REINTERPRETS_AMOUNT";
    const repairedAndReordered = {
      base: MASKING_BASE,
      patch: [
        { set: "structure.relations.flat.derivedBy.keep", value: ["amount", "order_id"] },
        { set: "structure.relations.flat.fields.amount.transformation", value: "ratio" },
      ],
      outcome: { status: "admissible" as const, codes: [], terms: [] },
      cause: "keep reordered; reinterpretation repaired",
    };
    const reachesIsolation = (codes: string[]) => {
      for (const gate of ["SCHEMA_INVALID", "IDENTICAL_STIMULI", "SAME_OUTCOME", "NO_COLLISION", "NOT_MINIMAL", "UNKNOWN_COORDINATE"]) {
        expect(codes, `the witness must reach the isolation loop on its own merits; ${gate} fired`).not.toContain(gate);
      }
    };

    it("a keep-set defect introduced behind the reinterpretation's key does not admit the witness", () => {
      const census = loadCensus();
      const keepInc = census.find((c) => c.id === "relation.derivedBy.project.keep#incidence")!;
      const a = oracle.fixtures.get(MASKING_BASE)!;

      // THE MASKING, from the instrument's own output rather than argued: one
      // finding before, one after, the same identity — and a different cause
      // behind it. The erasure writes tokens, not markers, so the engine can be
      // asked, and this is what it says.
      const image = erase(a, keepInc);
      expect(markersIn(image)).toEqual([]);
      const before = checkDerivations(a.structure);
      const after = checkDerivations((image as unknown as Fixture).structure);
      expect(after.map(findingId)).toEqual(before.map(findingId));
      expect(before[0].detail).toMatch(/retains amount by name but redeclares it/);
      expect(after[0].detail).toMatch(/keeping \[zz_erased_reference_0, zz_erased_reference_1\] cannot yield fields \[order_id, amount\]/);

      const r = checkWitness({ coordinates: [keepInc.id, "field.transformation:interval~ratio"], a: { fixture: MASKING_BASE }, b: repairedAndReordered }, census, oracle);
      expect(checkDerivations(r.b.fixture.structure), "b must be clean, or the comparison below is not a comparison").toEqual([]);
      const codes = r.failures.map((f) => f.code);
      reachesIsolation(codes);

      // The SAME erasure. On the clean side the engine sees the finding it
      // introduces and refuses...
      const onB = r.isolation.find((i) => i.side === "b" && i.coordinate === keepInc.id)!.result;
      expect(onB).toMatchObject({ state: "violated", detail: expect.stringMatching(/introduced derivation defect\(s\) diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat/) });
      // ...and on the hostile side the same key was already there to hide it,
      // so the obligation is unsettled — not discharged with a caveat, as it was.
      const onA = r.isolation.find((i) => i.side === "a" && i.coordinate === keepInc.id)!.result;
      expect(onA).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/still carries diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat via project\(keep=2\)/) });
      // The combined image the collision is about, on the clean side: legal and
      // local, and the set now SAYS both (the combined route used to name only locality).
      const combinedB = r.isolation.find((i) => i.side === "b" && i.composed)!.result;
      expect(combinedB).toEqual({ state: "discharged", by: ["quotient-legal", "slot-local"] });
      // And a combined image the engine CAN be asked about — two token-writing
      // erasures over the hostile side — is unsettled for the same reason.
      const keepOrder = census.find((c) => c.id === "relation.derivedBy.project.keep#order")!;
      expect(checkCombinedIsolation(a, [keepInc, keepOrder])).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/still carries diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat/) });

      expect(r.ok).toBe(false);
      expect(codes).toContain("ERASURE_ISOLATION_UNEVALUATED");
      expect(r.failures.find((f) => f.code === "ERASURE_ISOLATION_UNEVALUATED")!.detail).toMatch(/^a\/relation\.derivedBy\.project\.keep#incidence: /);
    });

    it("the control with the same pre-existing defect and nothing introduced is unevaluated too, and says so, rather than admitted", () => {
      // keep#order on the same stimulus introduces nothing: the finding and the
      // cause behind it are byte-identical before and after. The consumer cannot
      // tell that from the case above — the engine returns at its first
      // refutation either way — so it says so. This witness WAS admitted, through
      // a discharge whose limitation nothing read. That is the cost of the rule,
      // stated: a witness over a stimulus that still carries a finding cannot
      // earn standing from a comparison the engine could not make. Telling the
      // two rows apart would need the rule surface to report every refutation,
      // which is frozen under the holdout digest and is not this consumer's to change.
      const census = loadCensus();
      const keepOrder = census.find((c) => c.id === "relation.derivedBy.project.keep#order")!;
      const a = oracle.fixtures.get(MASKING_BASE)!;
      const before = checkDerivations(a.structure);
      const after = checkDerivations((erase(a, keepOrder) as unknown as Fixture).structure);
      expect(after.map(findingId)).toEqual(before.map(findingId));
      expect(after[0].detail).toBe(before[0].detail);

      const r = checkWitness({ coordinates: [keepOrder.id, "field.transformation:interval~ratio"], a: { fixture: MASKING_BASE }, b: repairedAndReordered }, census, oracle);
      const codes = r.failures.map((f) => f.code);
      reachesIsolation(codes);
      expect(r.isolation.find((i) => i.side === "a" && i.coordinate === keepOrder.id)!.result).toMatchObject({ state: "unevaluated" });
      // b's keep is already in order: nothing to erase, nothing to ask.
      expect(r.isolation.find((i) => i.side === "b" && i.coordinate === keepOrder.id)!.result).toEqual({ state: "discharged", by: ["unchanged"] });
      // The ONLY reason it is refused. Everything else about this witness holds.
      expect(r.ok).toBe(false);
      expect(codes).toEqual(["ERASURE_ISOLATION_UNEVALUATED"]);
    });

    it("a definite structural refutation outranks an unsettled engine comparison", () => {
      // The order matters: the structural proofs still run when the engine
      // cannot settle, and a change outside the slot is REFUTED, not left as
      // unevaluated. Forced by handing the locality proof the wrong locator, so
      // that keep#order's change lies outside the slot it is measured against.
      const census = loadCensus();
      const keepOrder = census.find((c) => c.id === "relation.derivedBy.project.keep#order")!;
      const grainPlan = loadPlans().get("relation.grain")!;
      const a = oracle.fixtures.get(MASKING_BASE)!;
      expect(checkIsolation(a, keepOrder), "engine unsettled, structure fine").toMatchObject({ state: "unevaluated" });
      expect(checkIsolation(a, keepOrder, checkDerivations, () => grainPlan)).toMatchObject({ state: "violated", detail: expect.stringMatching(/which its own locator does not reach/) });
    });
  });

  /**
   * THE CONSUMER, which is where the collapse actually mattered.
   *
   * `checkIsolation` can distinguish three states perfectly and still change
   * nothing if `checkWitness` folds two of them together. These range over
   * admission and the standing set it feeds, not over the check in isolation.
   */
  describe("C3c — an unevaluated obligation does not become standing", () => {
    const held = witnesses.find((w) => w.coordinates.length === 1 && checkWitness(w, kernel, oracle).ok)!;
    const discharged = (): IsolationResult => ({ state: "discharged", by: ["quotient-legal", "slot-local"] });
    const unevaluated = (): IsolationResult => ({ state: "unevaluated", reason: "no proof was constructed" });

    it("the control: an inapplicable engine comparison discharged by a structural proof still ratifies", () => {
      // Stated first, because without it the test below would pass for a system
      // that simply refused every marker-bearing image. The engine comparison is
      // equally unavailable in both cases; only the alternative proof differs.
      const r = checkWitness(held, kernel, oracle, discharged);
      expect(r.ok).toBe(true);
      expect(r.isolation.map((i) => i.result)).toEqual(r.isolation.map(discharged));
      expect(primitiveRatified([held])).toContain(held.coordinates[0]);
    });

    it("the same witness, with no proof identified, fails and confers nothing", () => {
      const r = checkWitness(held, kernel, oracle, unevaluated);
      expect(r.ok).toBe(false);
      expect(r.failures.map((f) => f.code)).toContain("ERASURE_ISOLATION_UNEVALUATED");
      // And the standing consumer follows the admission result rather than
      // re-deriving it: `primitiveRatified` is given the witnesses that HOLD.
      const holding = [held].filter((w) => checkWitness(w, kernel, oracle, unevaluated).ok);
      expect(holding).toEqual([]);
      expect(primitiveRatified(holding)).not.toContain(held.coordinates[0]);
    });

    it("carries an obligation on the COMBINED image, which is the one the collision is about", () => {
      // Individually-checked coordinates say nothing about their composition,
      // and the collision is decided by `eraseAll`. A 2-set therefore carries a
      // third record, over the image admission actually compares.
      const pair = witnesses.find((w) => w.coordinates.length === 2)!;
      const r = checkWitness(pair, kernel, oracle);
      const composed = r.isolation.filter((i) => i.composed);
      expect(composed).toHaveLength(2); // one per side
      expect(composed.map((i) => i.coordinate)).toEqual([pair.coordinates.join(" + "), pair.coordinates.join(" + ")]);
      // And it is not a restatement of the singles: it names the set, and the
      // per-coordinate records are still present beside it.
      expect(r.isolation.filter((i) => !i.composed)).toHaveLength(2 * pair.coordinates.length);
    });

    it("the combined obligation can refute where the individual ones do not", () => {
      // Non-redundancy, shown rather than asserted. Both coordinates pass alone;
      // the composition is judged against a locator union that does not bound
      // it, and fails.
      const pair = witnesses.find((w) => w.coordinates.length === 2)!;
      const coords = pair.coordinates.map((id) => kernel.find((c) => c.id === id)!);
      const stimulus = resolveSide(pair.a, oracle).fixture;
      for (const c of coords) expect(checkIsolation(stimulus, c).state).not.toBe("violated");

      const elsewhere = loadPlans().get("field.key")!;
      const combined = checkCombinedIsolation(stimulus, coords, checkDerivations, () => elsewhere);
      expect(combined.state).toBe("violated");
      expect(combined.state === "violated" && combined.detail).toMatch(/no locator in .* reaches/);
    });

    it("a violated combined obligation fails the witness, though every single one passes", () => {
      const pair = witnesses.find((w) => w.coordinates.length === 2)!;
      const r = checkWitness(pair, kernel, oracle, discharged, () => ({ state: "violated", detail: "the composition left the union of its locators" }));
      expect(r.ok).toBe(false);
      expect(r.failures.filter((f) => f.detail.startsWith("a/combined") || f.detail.startsWith("b/combined"))).toHaveLength(2);
      expect(r.failures.map((f) => f.code)).toContain("ERASURE_NOT_ISOLATED");
    });

    it("records which stimulus and which proof, so the admission record identifies more than a coordinate id", () => {
      const r = checkWitness(held, kernel, oracle);
      expect(r.isolation.length).toBe(2 * held.coordinates.length);
      expect(r.isolation.map((i) => i.side).sort()).toEqual(["a", "b"]);
      for (const rec of r.isolation) {
        expect(rec.coordinate).toBe(held.coordinates[0]);
        expect(rec.fixture, "the record must name the stimulus it was evaluated on").toMatch(/\S/);
        expect(rec.result.state).toBe("discharged");
      }
    });
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
    expect(checkIsolation(fixture, coord)).toEqual({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
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
    const r = checkIsolation(fixture, coord);
    expect(r.state).toBe("violated");
    const violation = r.state === "violated" ? r.detail : "";
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
    expect(checkIsolation(fixture, coord)).toEqual({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
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
    expect(checkIsolation(fieldWith({ kind: "instant" }), coord)).toEqual({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
    const both = checkIsolation(fieldWith({ kind: "instant", grain: "day" }), coord);
    expect(both.state === "violated" && both.detail).toMatch(/holder presence/);
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

  it("no LIVE witness is hygienic any more: that argument moved to the closure ledger", () => {
    // The two hygiene witnesses named a coordinate the required-child presence
    // rule removes. They are closures now — same stimuli, same causes, a
    // structurally derived `forget-branch-field` operation in place of a
    // synthetic presence coordinate. This asserts the migration is COMPLETE, so
    // the two authorities cannot both be answering the hygiene question.
    expect(multi.filter((w) => classify(w).klass === "quotient-hygiene")).toEqual([]);
    expect(loadClosures().closures.filter((c) => c.carrier.startsWith("field.additivity.kind:"))).toHaveLength(2);
  });

  it("hygiene requires all five conditions, so dropping the control changes the verdict", () => {
    // Condition 5 is what makes this empirical rather than an excuse: without a
    // control, "the payload got in the way" is unfalsifiable. The corpus no
    // longer supplies an instance, so the classifier is exercised on a
    // reconstructed one — otherwise the branch would be dead code that still
    // compiles, and a later edit to it would break nothing.
    const closure = loadClosures().closures.find((c) => c.carrier === "field.additivity.kind:additive~semi-additive")!;
    const reconstructed: Witness = {
      coordinates: [closure.carrier, "field.additivity.semi-additive.nonAdditiveAlong#incidence"],
      a: closure.a!,
      b: closure.b!,
    };
    const withControl = new Set(["field.additivity.kind:additive~ratio-measure"]);
    expect(classifyWitness(reconstructed, kernel, oracle, withControl).klass).toBe("quotient-hygiene");
    // and the same witness without a control is NOT hygienic
    expect(classifyWitness(reconstructed, kernel, oracle, new Set()).klass).not.toBe("quotient-hygiene");
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
    //
    // Read from the witness FILE, not from the holding set. This asks what the
    // CLASSIFIER does with a witness of that shape, which is a property of
    // `classifyWitness` and not of whether the witness currently holds — and
    // this one's evidence is suspended by the codomain ledger. Sourcing it from
    // `multi` made a classifier test silently disappear when standing moved,
    // which is the wrong thing to be sensitive to.
    const w = witnesses.filter((x) => x.coordinates.length > 1).find((x) => x.coordinates.includes("assertion.kind"));
    expect(w, "expected the bare-leaf witness to still exist in witnesses.json").toBeDefined();
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

describe("C1e — no coordinate is un-erasable for a WALK reason", () => {
  /**
   * A coordinate whose erasure alters no fixture cannot collide two of them, so
   * no witness naming it can ever hold. Two very different things produce that,
   * and they must never be confused:
   *
   *   CORPUS — the erasure is defined but this corpus gives it nothing to do:
   *     truncating an already-one-element list, sorting a sorted one, merging an
   *     enum member no fixture uses. A fact about the corpus, and a real limit
   *     on what can be witnessed today.
   *   WALK — the quotient never visits that label, so the erasure is a no-op on
   *     ANY input. Then "no witness holds" is a statement about this walk, and
   *     reading it as "the coordinate is not necessary" is a subtraction verdict
   *     drawn from a bug.
   *
   * Both look identical from outside, so the corpus-caused ones are enumerated
   * BY NAME with their reason. Anything else is a walk defect until proven
   * otherwise. Three separate instances have now been found this way — the
   * grainWitness facets, the five optional HOLDERS whose `#present` had no node
   * to erase, and `field.temporality`, which is tagged but is not a union, so
   * the walk branch-qualified a label the census does not.
   */
  const CORPUS_DEAD: Record<string, string> = {
    "relation.derivedBy.bin.closure:right-closed~<absent>": "no fixture declares right-closed",
    // THREE ENTRIES LEFT THIS LIST when merging became symmetric. A merge used
    // to rewrite only the value equal to `from`, so a pair naming a member the
    // corpus never declares changed nothing and read as dead. A merge now names
    // a CLASS, and a slot carrying EITHER member joins it — so
    // `left-closed~right-closed` acts on every `left-closed` the corpus does
    // declare. They are no longer un-erasable; they are unSEPARATING, which the
    // footprint audit reports and this ledger deliberately does not, because
    // the two say different things. Only `one-to-one~many-to-many` remains here,
    // and only because the corpus declares neither of its members.
    "relation.derivedBy.join.cardinality:one-to-one~many-to-many": "no fixture joins many-to-many or one-to-one, so neither member is present to join the class",
    "assertion.aggregate.along#order": "every corpus `along` is one name or already sorted, so sorting is identity",
    "evidence.grainWitness#arity": "every corpus grain witness names one column, so truncating to one is identity",
    "evidence.grainWitness#order": "every corpus grain witness is one name or already sorted",
    "field.additivity.semi-additive.nonAdditiveAlong#arity": "every corpus nonAdditiveAlong names one dimension",
    "field.additivity.semi-additive.nonAdditiveAlong#order": "every corpus nonAdditiveAlong names one dimension",
    "relation.derivedBy.aggregate-to-grain.toGrain#arity": "every corpus toGrain names one column",
    "relation.derivedBy.aggregate-to-grain.toGrain#order": "every corpus toGrain names one column",
    "relation.derivedBy.nest.levels#order": "every corpus nest declares its levels already sorted",
    "structure.peers[]#order": "every corpus peer set is already sorted",
    // Both became dead when arity erasure started truncating to the slot's
    // DECLARED floor instead of to one. `levels` and a peer set each require
    // minItems 2, and every corpus instance is exactly two long, so truncating
    // to two is identity. This is a corpus fact of the same kind as the entries
    // above — a third element in either would make both live immediately — and
    // NOT a claim that arity is unwitnessable: the previous behaviour truncated
    // to one, which reached these by also destroying incidence ([a,b] and [a,c]
    // both became [a]), so what it was erasing was never arity alone.
    "relation.derivedBy.nest.levels#arity": "every corpus nest declares exactly two levels, which is the declared minimum, so truncating to it is identity",
    "structure.peers[]#arity": "every corpus peer set names exactly two peers, which is the declared minimum, so truncating to it is identity",
  };

  const fixtures = [...oracle.fixtures.values()];
  const dead = kernel
    .filter((c) => c.kind !== "reference")
    .filter((c) => fixtures.every((f) => canonical(erase(f, c)) === canonical(f)))
    .map((c) => c.id)
    .sort();

  it("every un-erasable coordinate is named, with the corpus reason it has nothing to erase", () => {
    expect(dead.filter((id) => !(id in CORPUS_DEAD))).toEqual([]);
  });

  it("the enumeration is exact, so a coordinate that BECOMES erasable is noticed too", () => {
    // A list that only had to be a superset would let a stale entry hide the
    // fact that the corpus grew a case for it — the ratchet has to bite in both
    // directions or it is only a suppression list.
    expect(Object.keys(CORPUS_DEAD).sort()).toEqual(dead);
  });

  it("every optional holder's presence coordinate erases the holder", () => {
    // The specific defect: `props` labels a holder's children and never the
    // holder, so `#present` had no node. All three of the holder-presence
    // candidates in the holders basis were affected, which would have made them
    // unwitnessable by construction.
    for (const id of ["relation.derivedBy#present", "field.additivity#present", "field.temporality#present", "evidence.rows.*#present", "structure.peers[]#present"]) {
      const c = kernel.find((x) => x.id === id)!;
      const altered = fixtures.filter((f) => canonical(erase(f, c)) !== canonical(f));
      expect(altered.length, `${id} erases nothing anywhere`).toBeGreaterThan(0);
    }
  });

  it("a tagged holder that is not a union keeps the census's unqualified labels", () => {
    // `field.temporality` carries a `kind` but is not a discriminated union, so
    // the census emits `field.temporality.grain`. A walk that branch-qualified
    // on the presence of `kind` labelled the same node
    // `field.temporality.instant.grain` and never visited what the census named.
    expect(loadBranchSignatures().has("field.temporality.kind")).toBe(false);
    expect(loadBranchSignatures().has("field.additivity.kind")).toBe(true);
    const grain = kernel.find((c) => c.id === "field.temporality.grain")!;
    const altered = fixtures.filter((f) => canonical(erase(f, grain)) !== canonical(f));
    expect(altered.length).toBeGreaterThan(0);
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

describe("C4b — CURRENT evidence standing: what the authority in force now supports", () => {
  // The other half of the pair, and the reason neither is equivocation. C4 says
  // what stage 1 concluded under its bound instrument; this says what evidence
  // survives the instrument's correction. Both are true at once, and reporting
  // only one of them would either bury a real evidence loss or falsify a closed
  // experiment's record.
  const holds = codomainHolds();
  const historicalRecord = loadHistoricalAccounting();
  const historicalSet = historicallyAccounted(historicalRecord);
  const ratifiedUnder = (live: ReadonlySet<string>) =>
    stage1.coordinates.filter((c) => disposition(c, live, kernelIds, removals).state === "ratified").map((c) => c.id);
  /** Read, never recomputed: the historical interpreter's own verdicts. */
  const ratifiedThen = [...historicalDispositions(historicalRecord)].filter(([, d]) => d.state === "ratified").map(([id]) => id);

  it("the historical record is recovered from a named tree, not inferred from today", () => {
    // What makes it an authority. The digests are of the files that tree held;
    // the commit says which tree; the procedure says the recovery ran that
    // tree's own code. None of it is a function of present support, which is
    // the property the derived version could not have.
    expect(historicalRecord.recoveredFrom.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(Object.keys(historicalRecord.recoveredFrom.inputs).sort()).toEqual([
      "census-stage1.json",
      "closures-stage2.json",
      "removals.json",
      "witnesses.json",
    ]);
    for (const d of Object.values(historicalRecord.recoveredFrom.inputs)) expect(d).toMatch(/^[0-9a-f]{64}$/);
    // The union it records is the union of the three classes it records, so a
    // class cannot be edited without the accounting figure moving with it.
    const { primitive, interactionOnly, closureAccounted } = historicalRecord.byEvidenceClass;
    expect([...historicalSet].sort()).toEqual([...new Set([...primitive, ...interactionOnly, ...closureAccounted])].sort());
  });

  it("81 ratified historically, 77 still accounted, 4 suspended — the same 268 coordinates counted twice", () => {
    // Counted in the SAME units as C4, by running the same dispositioner over
    // the same stage-1 coordinates against the two different accounted sets.
    // Comparing `stage1Accounted.size` to 81 would be comparing kernel ids to
    // stage-1 dispositions, which are not the same population.
    //
    // ACCOUNTED, not holding. 77 is the union of three evidence classes — see
    // the standing tally below, where 4 of those 77 rest on a provisional
    // closure and nothing stronger. Calling the figure "holding" would report
    // the weakest class with the authority of the strongest.
    const historical = ratifiedThen;
    const current = ratifiedUnder(stage1Accounted);
    expect(historical).toHaveLength(81);
    expect(current).toHaveLength(77);

    // Nothing appeared and nothing vanished: exactly four moved from accounted
    // to suspended, and each is named in the ledger.
    const lost = historical.filter((id) => !current.includes(id));
    expect(lost).toHaveLength(4);
    for (const id of lost) expect(holds.has(id) || holds.has(id.split(":")[0]), `${id} lost standing but is not in the ledger`).toBe(true);
  });

  it("reports standing BY CLASS, so a provisional closure is never counted as a ratification", () => {
    // The narrowing the accounting figure above cannot express. `primitive` is
    // the only class that ratifies; `closure-accounted` is explicitly not
    // standing, and a closure that is merely not-refuted must not read as one.
    const byClass: Record<string, number> = {};
    for (const id of new Set([...accountedBy(support), ...holds.keys()])) {
      const s = evidenceStanding(id, support, holds);
      byClass[s.state === "holding" ? s.via : s.state] = (byClass[s.state === "holding" ? s.via : s.state] ?? 0) + 1;
    }
    expect(byClass).toEqual({ primitive: 43, "closure-accounted": 11, suspended: 3 });
    // And the class boundary is real: every closure-accounted coordinate is
    // absent from the primitive set, by construction of `evidenceStanding`.
    for (const id of support.closureAccounted) {
      const s = evidenceStanding(id, support, holds);
      if (s.state === "holding" && s.via === "closure-accounted") expect(support.primitive.has(id), id).toBe(false);
    }
  });

  it("re-evaluates rather than handing back a stored suspension when acceptance moves", () => {
    // Its OWN test on purpose. It was first appended to the block above, where
    // an earlier assertion failed first under the very mutant it exists to
    // catch — so it never ran, and the kill came from a neighbour instead.
    const holds = codomainHolds();
    // THE STALE-STANDING TEST, at the consumer that turns a stored suspension
    // into standing.
    //
    // `codomain-adjudications.json` is a stored evaluated conclusion: three
    // witnesses, the standing each lost, and the failure codes the harness
    // produced for them. If `evidenceStanding` read that ledger first, an
    // acceptance change that made those witnesses pass would leave their
    // coordinates reported as suspended on the strength of a conclusion
    // computed under rules that no longer apply.
    //
    // The stimuli and the erasure images are untouched here. What moves is the
    // acceptance boundary, expressed as a predicate at the same place the
    // production path applies it: `checkWitness(...).ok` is what decides which
    // witnesses feed `primitiveRatified` and `interactionOnly`.
    const admits = (accept: (r: ReturnType<typeof checkWitness>) => boolean) => {
      const held = witnesses.filter((w) => accept(checkWitness(w, kernel, oracle)));
      return { primitive: primitiveRatified(held), interactionOnly: new Set(interactionOnly(held)), closureAccounted } satisfies CurrentSupport;
    };
    const asRecorded = admits((r) => r.ok);
    // The weaker boundary: the three held-open witnesses fail on NO_COLLISION
    // alone, so admitting that code is exactly the change that would make the
    // stored ledger obsolete.
    const weakened = admits((r) => r.ok || r.failures.every((f) => f.code === "NO_COLLISION"));

    const suspendedIds = [...holds.keys()];
    expect(suspendedIds.length, "the ledger must actually assert something, or this proves nothing").toBeGreaterThan(0);
    // Under the recorded boundary the ledger and the consumer agree.
    for (const id of suspendedIds) expect(evidenceStanding(id, asRecorded, holds).state, id).toBe("suspended");
    // Under the weakened one the consumer reports what it evaluated, not what
    // the ledger stored. Same ledger object, same stimuli, same images.
    for (const id of suspendedIds) {
      const s = evidenceStanding(id, weakened, holds);
      expect(s.state, `${id} was handed back a stored suspension under an acceptance boundary that no longer produces it`).toBe("holding");
    }
  });

  it("names the invalidated witness for every suspended coordinate, and suspends nothing else", () => {
    const suspended = [...new Set([...accountedBy(support), ...holds.keys()])]
      .map((id) => [id, evidenceStanding(id, support, holds)] as const)
      .filter(([, s]) => s.state === "suspended");
    // Three, not four. `assertion.aggregate.op` is DECLARED by the 2-set
    // witness that lapsed, and holds a primitive witness of its own that the
    // lapse did not touch — so it lost nothing. Coverage by a failed witness is
    // not a standing loss, and the ledger keeps the two apart: it appears under
    // `declares`, and under neither loss field.
    const covering = loadCodomainAdjudications().awaiting.filter((a) => a.declares.includes("assertion.aggregate.op"));
    expect(covering).toHaveLength(2);
    for (const a of covering) {
      expect(a.lost).not.toContain("assertion.aggregate.op");
      expect(a.interactionOnlyLost ?? []).not.toContain("assertion.aggregate.op");
    }
    expect(holds.has("assertion.aggregate.op")).toBe(false);
    expect(evidenceStanding("assertion.aggregate.op", support, holds)).toEqual({ state: "holding", via: "primitive", evidence: ["assertion.aggregate.op"] });
    expect(suspended.map(([id]) => id).sort()).toEqual([
      "assertion.kind",
      "assertion.kind:aggregate~ratio-comparison",
      "field.temporality.kind",
    ]);
    for (const [id, s] of suspended) {
      if (s.state !== "suspended") throw new Error("unreachable");
      expect(s.experiment).toBe("ANALYTICAL-QUOTIENT-CODOMAIN-AUTHORITY-01");
      expect(s.invalidatedEvidence.length, `${id} suspended with no witness named`).toBeGreaterThan(0);
    }
  });

  it("suspension is not a semantic outcome: every suspended coordinate still dispositions as stage 1 concluded", () => {
    // The load-bearing separation. A suspended coordinate must NOT read as
    // not-yet-admitted — that would say it was considered and left the kernel,
    // which nobody decided. It reads exactly as it did before the instrument
    // changed, and only its evidence standing moved.
    const byId = new Map(stage1.coordinates.map((c) => [c.id, c]));
    for (const id of holds.keys()) {
      const c = byId.get(id);
      if (!c) continue; // kernel-only ids have no stage-1 disposition to preserve
      expect(historicalDispositions(historicalRecord).get(c.id)?.state, id).toBe("ratified");
    }
  });
});

describe("C4c — history is an INPUT to reconciliation, not a function of the present", () => {
  /**
   * The four ways the derived version failed, each asserted directly.
   *
   * `historicallyRatified(live, holds)` returned `live ∪ holds.keys()`, which
   * agreed with the recovered record for exactly as long as nothing moved. It
   * had no way to disagree, which is the defect: a set that cannot contradict
   * the present cannot be evidence about the past.
   */
  const holds = codomainHolds();
  const historicalSet = historicallyAccounted();

  it("reconciles clean today: every loss is ledgered and nothing appeared from nowhere", () => {
    const r = reconcileHistory(accountedBy(support), historicalSet, holds);
    expect(r.unexplainedLoss).toEqual([]);
    expect(r.unexplainedGain).toEqual([]);
    expect(r.suspended).toEqual(["assertion.kind", "assertion.kind:aggregate~ratio-comparison", "field.temporality.kind"]);
  });

  it("SETTLING a suspension leaves the historical record untouched", () => {
    // The first break. Under the derivation, clearing the ledger deleted three
    // coordinates from history — the past shrinking because a present-day
    // exception was resolved.
    const settled: typeof holds = new Map();
    expect(historicallyAccounted()).toEqual(historicalSet);
    const r = reconcileHistory(accountedBy(support), historicalSet, settled);
    // History is unchanged; what moves is that the same three losses are now
    // UNEXPLAINED, which is the correct report for an unledgered loss.
    expect(historicallyAccounted()).toEqual(historicalSet);
    expect(r.unexplainedLoss).toEqual(["assertion.kind", "assertion.kind:aggregate~ratio-comparison", "field.temporality.kind"]);
    expect(r.suspended).toEqual([]);
  });

  it("ADMITTING new current evidence does not write it into the past", () => {
    // The second break. Under the derivation, any id added to `live` silently
    // became a coordinate stage 1 had accounted for.
    const widened = new Set([...accountedBy(support), "field.temporality.grain:day~month"]);
    expect(historicallyAccounted()).toEqual(historicalSet);
    const r = reconcileHistory(widened, historicalSet, holds);
    expect(r.unexplainedGain).toEqual(["field.temporality.grain:day~month"]);
    // And the historical dispositions are the same numbers as before.
    const ratified = [...historicalDispositions()].filter(([, d]) => d.state === "ratified");
    expect(ratified).toHaveLength(81);
  });

  it("EXCHANGING one historical identifier for another is caught, though the count is unchanged", () => {
    // The third break, and the reason a count is not an identity. Swapping one
    // id for another leaves |history| at 57 and would leave any size-based
    // check green.
    const swapped = new Set(historicalSet);
    swapped.delete("assertion.aggregate.nulls");
    swapped.add("assertion.aggregate.uncertainty:absolute~none");
    expect(swapped.size).toBe(historicalSet.size);
    const r = reconcileHistory(accountedBy(support), swapped, holds);
    expect(r.unexplainedLoss).toContain("assertion.aggregate.uncertainty:absolute~none");
    expect(r.unexplainedGain).toContain("assertion.aggregate.nulls");
  });

  it("a CURRENT MAPPING change cannot rewrite a historical disposition", () => {
    // The defect one level up from history-from-live. The support set is an
    // artifact and cannot move, but reading it through today's `removals` left
    // the CONCLUSION at the mercy of a present-day mapping: re-point a leaf and
    // a different original coordinate reads as ratified, with every recovered
    // input byte-identical.
    const record = loadHistoricalAccounting();
    const before = historicalDispositions(record);
    const moved: typeof removals = {
      ...removals,
      leafMap: { ...removals.leafMap, "field.scale": "field.cyclic" },
      removed: [...removals.removed, { coordinate: "relation.grain", reason: "probe only", reintroducibleAt: 2 }],
    };

    // History is unchanged, by IDENTIFIER and not by count.
    const after = historicalDispositions(record);
    expect([...after].map(([id, d]) => `${id}:${d.state}`)).toEqual([...before].map(([id, d]) => `${id}:${d.state}`));
    expect(after.get("relation.grain")).toEqual(before.get("relation.grain"));
    expect(after.get("field.scale")).toEqual(before.get("field.scale"));

    // And the reinterpretation reports the disagreement rather than adopting it.
    const drift = reinterpretHistorically(record, stage1.coordinates, kernelIds, moved);
    expect(drift.map((d) => d.coordinate)).toContain("relation.grain");
    expect(drift.find((d) => d.coordinate === "relation.grain")!.then.state).toBe("ratified");
    expect(drift.find((d) => d.coordinate === "relation.grain")!.now.state).toBe("not-yet-admitted");
  });

  it("a LIVE KERNEL change cannot rewrite one either, and today's reading agrees where nothing moved", () => {
    const record = loadHistoricalAccounting();
    const before = [...historicalDispositions(record)].map(([id, d]) => `${id}:${d.state}:${"via" in d ? d.via.join("+") : ""}`);
    const shrunk = new Set([...kernelIds].filter((id) => id !== "field.transformation"));
    expect(shrunk.size).toBe(kernelIds.size - 1);

    const after = [...historicalDispositions(record)].map(([id, d]) => `${id}:${d.state}:${"via" in d ? d.via.join("+") : ""}`);
    expect(after).toEqual(before);

    // The kernel the historical interpreter was GIVEN is recorded, so the two
    // readings can be told apart rather than silently conflated.
    expect(record.kernelIds).toHaveLength(165);
    // Under the unmodified present mappings the two readings still agree, which
    // is what makes the two drift assertions above findings rather than noise.
    expect(reinterpretHistorically(record, stage1.coordinates, kernelIds, removals)).toEqual([]);
    // Under a shrunken kernel they need not, and the difference is reported.
    const drift = reinterpretHistorically(record, stage1.coordinates, shrunk, removals);
    for (const d of drift) expect(d.then).not.toEqual(d.now);
  });

  it("reports what the ARTIFACT says, even where recomputation would say otherwise", () => {
    // The falsifier for "read, not derived", and the only one that bites: today
    // the two readings agree, so a recomputing implementation would pass every
    // comparison against the live tree. Handing it a record whose verdict
    // disagrees with what recomputation produces separates them — a reader of
    // the artifact returns the recorded verdict; a re-deriver silently corrects
    // it, which is the present rewriting the past one coordinate at a time.
    const record = loadHistoricalAccounting();
    const real = historicalDispositions(record).get("relation.grain");
    expect(real).toEqual({ state: "ratified", via: ["relation.grain"] });

    const flipped: typeof record = {
      ...record,
      dispositions: record.dispositions.map((d) =>
        d.coordinate === "relation.grain" ? { coordinate: d.coordinate, state: "not-yet-admitted" as const, reason: "probe only", reintroducibleAt: 2 } : d,
      ),
    };
    expect(historicalDispositions(flipped).get("relation.grain")).toEqual({ state: "not-yet-admitted", reason: "probe only", reintroducibleAt: 2 });
    // And the disagreement with today's mappings is reported, not resolved.
    const drift = reinterpretHistorically(flipped, stage1.coordinates, kernelIds, removals);
    expect(drift.map((d) => d.coordinate)).toEqual(["relation.grain"]);
    expect(drift[0].now).toEqual(real);
  });

  it("says what the checkpoint is, and what it is not", () => {
    // The provenance bound, carried in the artifact so a reader cannot quote it
    // for more than the recovery performed.
    const { what, nonClaim, procedure, dependencyEnvironment } = loadHistoricalAccounting().recoveredFrom;
    expect(what).toMatch(/PRE-CODOMAIN ACCOUNTING CHECKPOINT/);
    expect(nonClaim).toMatch(/not.*established/i);
    expect(nonClaim, "reproducing a tally is agreement, not epoch equivalence").toMatch(/tally/);
    // The dependency environment is named rather than the runtime being claimed
    // historical: the extracted tree ships no node_modules.
    expect(procedure).toMatch(/DEPENDENCY ENVIRONMENT AVAILABLE NOW/);
    expect(dependencyEnvironment.ajv).toMatch(/^\d+\.\d+\.\d+/);
    expect(dependencyEnvironment.node).toMatch(/^v\d+/);
  });

  it("a PROVISIONAL closure confers accounting, never primitive standing", () => {
    // The fourth. `closureAccounted` admits any closure that is not refuted,
    // including one whose promotion is still open — so a coordinate can be
    // accounted for by an argument nobody has finished making. It must never
    // read as ratified.
    const provisional = loadClosures().closures.filter((c) => c.promotion === "provisional");
    expect(provisional.length).toBeGreaterThan(0);
    for (const c of provisional) {
      for (const id of [c.carrier, ...c.dependencies]) {
        if (support.primitive.has(id)) continue; // separately ratified; the closure adds nothing
        const s = evidenceStanding(id, support, holds);
        if (s.state === "holding") expect(s.via, `${id} is carried only by a provisional closure`).toBe("closure-accounted");
      }
    }
  });
});

describe("C4 — HISTORICAL accounting: what the completed stage-1 experiment concluded", () => {
  // Accounting, not standing: see the note on `stage1Accounted`.
  //
  // WHICH LEDGER THIS IS. `disposition` reports what a COMPLETED experiment
  // concluded under the erasure authority it was bound to, so the set it is
  // given is the historical one — the live holding set plus the coordinates the
  // codomain change suspended. Feeding it the live set instead would rewrite a
  // finished record to match a later instrument, turning 81 into 77 as though
  // stage 1 had concluded something it did not. What is currently SUPPORTED is
  // a different question, asked in "C4b — current evidence standing" below.
  // READ, not recomputed. `historicallyAccounted()` is the SUPPORT the
  // historical interpreter was given; running today's `disposition` over it
  // through today's `kernelIds` and `removals` would answer a different
  // question — what present mappings make of that support — and report the
  // answer as what stage 1 concluded. The two are compared explicitly in C4d.
  const then = historicalDispositions();
  const dispositions = stage1.coordinates.filter((c) => then.has(c.id)).map((c) => [c, then.get(c.id)!] as const);
  /** The kernel-level SUPPORT the historical interpreter was given, as opposed to its verdicts. */
  const accountedThen = historicallyAccounted();

  it("every stage-1 coordinate is ratified, not-yet-admitted, or a name reference", () => {
    const undecided = dispositions.filter(([, d]) => d.state !== "ratified" && d.state !== "not-yet-admitted" && d.state !== "reference");
    expect(undecided).toEqual([]);
  });
  it("counts, UNMOVED by the codomain: 81 ratified (24 leaves, 57 pairs), 177 not-yet-admitted (128 at stage 2, 49 at stage 3), 10 references", () => {
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
        accountedThen.has(r.coordinate) || pendingIds.has(r.coordinate),
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
    const expected = [...new Set([...accountedThen, ...pendingIds])].filter((id) => !removedByVerdict.has(id)).sort();
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
    // Every one of them is a fixture the binding ledger accounts for, which is
    // where new fixtures are governed. All FOUR of its sections count: the
    // holdout list is a binding section — `checkFixtureLedger` raises
    // LEDGER_HOLDOUT_UNBOUND for an item missing from it — and omitting it here
    // made this assertion narrower than the sentence above it. It passed only
    // because every holdout item predated the baseline freeze, so the branch had
    // never been reached.
    const bound = new Set([
      ...Object.values(bindings.cases),
      ...Object.values(bindings.neighbours),
      ...Object.values(bindings.triads).flatMap((t) => [t.absent, t.satisfying, t.hostile]),
      ...bindings.holdout,
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
