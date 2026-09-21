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
  applyPatch,
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
import { DERIVATION_DIAG } from "./codes.js";
import { markersIn } from "./quotient-image.js";
import { canonical, collides, erase, planFor } from "./quotient.js";
import { executePlan, resolveSlots } from "./erasure-plan.js";
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
 * The THIRD accounting mode, and not a fourth evidence class: adjudicated
 * `required-derived-vocabulary` — in the kernel, owed no proof of its own, and
 * NOT ratified. Read from the bases, because the verdict lives there, and
 * carrying it here is what stops a retained coordinate reading as unsupported.
 */
const retainedIds = new Set(loadBases().flatMap((b) => b.retained));
/**
 * The classes, kept apart.
 *
 * `stage1Accounted` below is their union and is an ACCOUNTING figure: it
 * answers whether the experiment carries a coordinate at all, which is what the
 * stage-1 dispositioner asks. It is not a standing figure — some of what it
 * yields rests on a not-refuted closure or on a retained name and nothing
 * stronger — so anything that reports standing takes `support` and names the
 * class.
 */
const support: CurrentSupport = { primitive: ratifiedIds, interactionOnly: interactionIds, closureAccounted, retained: retainedIds };
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

  it("holds open exactly two witnesses, one defect: a hole is observable where an absence was not", () => {
    // The ratchet, in the direction a list of names cannot see. Every witness
    // that fails must be listed, so a NEW failure cannot hide behind the
    // ledger's existence; and the count is pinned, so the ledger cannot grow
    // quietly.
    const failing = witnesses.filter((w) => !checkWitness(w, kernel, oracle).ok).map((w) => w.coordinates.join(" + "));
    expect([...new Set(failing)].sort()).toEqual([...awaiting.keys()].sort());
    // TWO, not three. The holder-presence entry left this ledger because its
    // witness was re-pointed at the coordinate it actually measures
    // (`field.temporality#present`, where it holds), and the leaf it was filed
    // under is now ACCOUNTED as required derived vocabulary rather than
    // suspended. The pair of branch-residue entries is what remains.
    expect(awaiting.size).toBe(2);
    expect([...awaiting.values()].map((a) => a.reason).sort()).toEqual(["branch-residue", "branch-residue"]);
  });

  it("accounts a retained coordinate without ratifying it", () => {
    // The THIRD accounting mode. The disposition vocabulary carried it —
    // `required-derived-vocabulary` — while `CurrentSupport` had only the three
    // evidence classes, so a retained coordinate read as unsupported and its
    // loss filed as unexplained. Accounted and NOT ratified are both required:
    // accounted, or it is an orphan; not ratified, or a name external authority
    // governs reads as a necessity claim.
    const holds = codomainHolds();
    expect(retainedIds.size, "a basis must retain something, or this proves nothing").toBeGreaterThan(0);
    for (const id of retainedIds) {
      expect(evidenceStanding(id, support, holds).state, id).toBe("holding");
      expect(evidenceStanding(id, support, holds), id).toMatchObject({ via: "required-derived-vocabulary" });
      expect(ratifiedIds.has(id), `${id} is retained and must not also be a primitive ratification`).toBe(false);
    }
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
    // leaf itself (handling declared or not) has a schema-class witness. `exclude~<absent>`
    // joins them: whether a null policy is DECLARED is also only visible with rows.
    expect(instanceOnly).toEqual([
      "assertion.aggregate.nulls:exclude~as-zero",
      "assertion.aggregate.nulls:exclude~as-observed",
      "assertion.aggregate.nulls:as-zero~as-observed",
      "assertion.aggregate.nulls:exclude~<absent>",
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
  /**
   * THE EVIDENCE POOL, ENFORCED — and the half of it that is easy to get wrong.
   *
   * The doctrine says a witness side's required outcome must be a judgment the
   * corpus supplies, and that the boundary's well-formedness refusals are not in
   * that pool. Nothing enforced it: `resolveSide` records a hand adjudication's
   * cause as free text, so a pair whose whole distinction is "this declaration
   * does not type" could be filed as if a cause explained it. The clause reads
   * the pool off the SAME oracle the sides resolve against.
   *
   * WHICH SIDE carries the refusal is the entire question, and the specimen
   * population cannot answer it: `separatingPairs` clones a base and keeps its
   * id, so a specimen pair can show `illegal` with no diagnostic on either side
   * while the COMMITTED fixture at that id carries an ordinary corpus cause.
   * These three candidates are the measured instance — all three separate over
   * specimens through a judgment that names nothing, and only one of them is
   * refused once authored over the committed fixture.
   */
  it("refuses only the candidate whose AUTHORED side is the one that does not type", () => {
    const authoredOverCommitted = (id: string, base: string, path: string, value: unknown, outcome: ReturnType<typeof outcomeFrom>): Witness => ({
      coordinates: [id],
      a: { fixture: base },
      b: { base, patch: [{ set: path, value }], outcome, cause: "authored for the triage" },
    });
    const candidates: [string, Witness][] = [
      [
        "relation.derivedBy.graph.value#incidence",
        authoredOverCommitted(
          "relation.derivedBy.graph.value#incidence",
          "FX_FLOW_EDGES_LEAK_AT_MIDDLE_NODE",
          "structure.relations.routed.derivedBy.value",
          "src",
          outcomeFrom("unproven", [], ["invariant:conservation"]),
        ),
      ],
      [
        "relation.derivedBy.normalize.field#incidence",
        authoredOverCommitted(
          "relation.derivedBy.normalize.field#incidence",
          "FX_SHARE_OF_AVERAGE_SCORE",
          "structure.relations.shares.derivedBy.field",
          "region",
          outcomeFrom("admissible"),
        ),
      ],
      [
        "relation.derivedBy.project.from#incidence",
        authoredOverCommitted(
          "relation.derivedBy.project.from#incidence",
          "FX_PROJECT_DROPS_NEST_LEVEL",
          "structure.relations.flat.derivedBy.from",
          "sale_id",
          outcomeFrom("illegal"),
        ),
      ],
    ];
    // The committed side of each pair carries a CAUSE, which is what makes the
    // first two filable: their required outcomes are the corpus's own.
    expect(resolveSide({ fixture: "FX_FLOW_EDGES_LEAK_AT_MIDDLE_NODE" }, oracle).outcome).toEqual(outcomeFrom("illegal", ["REL_FLOW_NOT_CONSERVED"]));
    expect(resolveSide({ fixture: "FX_SHARE_OF_AVERAGE_SCORE" }, oracle).outcome).toEqual(outcomeFrom("illegal", ["REL_ADDITIVITY_NORMALIZE_NONADDITIVE"]));
    const verdicts = candidates.map(([, w]) => codes(w));
    expect(verdicts[0]).toEqual([]);
    expect(verdicts[1]).toEqual([]);
    // TWO refusals now, and both are the point: the pool clause refuses the
    // vocabulary (an `illegal` that names no diagnostic) and the applicability
    // clause refuses the OBSERVATION (the engine does not produce that outcome
    // for this stimulus). A witness must survive both.
    expect(verdicts[2]).toEqual(["OUTCOME_NOT_CORPUS_SUPPLIED", "OUTCOME_NOT_OBSERVED"]);
    // The other direction, over the whole surface: the clause refuses no
    // witness on file, so tightening it further (or loosening the pool) fails
    // here rather than silently re-opening or closing a verdict.
    const refusedOnFile = witnesses.filter((w) => codes(w).includes("OUTCOME_NOT_CORPUS_SUPPLIED"));
    expect(refusedOnFile.map((w) => w.coordinates.join(" + "))).toEqual([]);
  });
  it("rejects an erasure that manufactures a derivation defect instead of isolating its coordinate", () => {
    // A structure whose derived relation is lawful. Forgetting the bin's
    // CLOSURE declaration leaves the binned result underivable — the boundary
    // cannot type which side each interval owns — so any collision would be
    // that defect rather than the declaration the coordinate is about. This
    // is the last manufactured-defect subject left anywhere: the bound-
    // incidence rebind (round 31), the distinctness skip (round 35) and the
    // mirror (round 36) retired every operand-side subject, measured over the
    // whole population — the only remaining violated pairs in the corpus are
    // this coordinate on FX_H_READINGS_BINNED_DROPS_TEMP.
    const structure = {
      relations: {
        src: { grain: ["k"], fields: { k: { transformation: "nominal", key: true }, v: { transformation: "ratio" } } },
        out: {
          grain: ["k", "v_bin"],
          fields: { k: { transformation: "nominal", key: true }, v_bin: { transformation: "ordinal" } },
          derivedBy: { kind: "bin", from: "src", field: "v", closure: "left-closed" },
        },
      },
    } as unknown as RelationalStructure;
    const fixture = { id: "fx_probe", structure, assertions: [] } as unknown as Fixture;
    const coord = loadCensus().find((c) => c.id === "relation.derivedBy.bin.closure")!;
    expect(coord).toBeDefined();
    // The diagnostic is NAMED, not merely counted. `REL_DERIVATION_RESULT_NOT_DERIVABLE`
    // is the specific collateral this guard exists to catch; a message that only
    // says "a defect appeared" would go on passing if the guard started firing
    // on something else entirely.
    const r = checkIsolation(fixture, coord);
    expect(r.state).toBe("violated");
    expect(r.state === "violated" && r.detail).toContain("REL_DERIVATION_RESULT_NOT_DERIVABLE@out");
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
          grain: ["k", "v_bin"],
          fields: { k: { transformation: "nominal", key: true }, v_bin: { transformation: "ordinal" } },
          derivedBy: { kind: "bin", from: "src", field: "v", closure: "left-closed" },
        },
      },
    } as unknown as RelationalStructure;
    const wrap = (assertions: unknown[]) => ({ id: "fx_probe", structure, assertions }) as unknown as Fixture;
    const bare = wrap([]);
    const wrapped = wrap([{ kind: "aggregate", relation: "out", field: "v_bin", op: "count", along: ["k"] }]);
    // The coordinate the probe below is measured with. It reaches the boundary
    // and is refused there (forgetting the bin's closure leaves the binned
    // result underivable), which is what makes the isolation result a real
    // verdict rather than a no-op. It is the LAST such coordinate: the bound-
    // incidence rebind, the distinctness skip and the mirror retired every
    // operand-side subject, and `project.keep#arity` -- this probe's
    // coordinate until the mirror -- is now the identity on every corpus
    // declaration, which would have made the three tests below vacuous.
    const binClosure = loadCensus().find((c) => c.id === "relation.derivedBy.bin.closure")!;

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
          "erasure introduced derivation defect(s) diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@out via bin [derivation-typing/schema], so any collision may be that defect rather than the coordinate",
      };
      expect(checkIsolation(bare, binClosure)).toEqual(expected);
      expect(checkIsolation(wrapped, binClosure)).toEqual(expected);
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
      // (`field.key` carried this row on the project probe; the bin probe makes
      // its erasure introduce a finding, so the row moved to the bin's field
      // operand -- measured to discharge with the engine's contribution.)
      const byEngine = checkIsolation(bare, loadCensus().find((c) => c.id === "relation.derivedBy.bin.field#incidence")!);
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
      expect(() => checkIsolation(bare, binClosure, boom)).toThrow(/injected instrument failure/);
    });

    it("is a pure function of its arguments: no accumulated state orders the results", () => {
      // The hazard the module-level `inapplicableIsolationChecks` set carried.
      // Two coordinates over the same stimulus — one the engine can read, one it
      // cannot — must give the same pair of results in either evaluation order.
      const kindLeaf = loadCensus().find((c) => c.id === "relation.derivedBy.kind")!;
      const forward = [checkIsolation(bare, binClosure), checkIsolation(bare, kindLeaf)];
      const backward = [checkIsolation(bare, kindLeaf), checkIsolation(bare, binClosure)];
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
      // The key persists with the SAME cause and the SAME detail behind it: unsettled.
      // `project.keep#order` used to be this row; `keep` is a declared SET now, so the
      // sort erasure it demonstrated is gone and `assertion.aggregate.relation#incidence`
      // -- measured to leave this finding byte-identical -- carries it instead.
      expect(at("assertion.aggregate.relation#incidence")).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/still carries diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat.*first-refutation checker cannot show/) });
      // The key persists and the engine cannot say what moved behind it: a
      // second coordinate measured to leave the fixture carrying the finding.
      // (`project.keep#incidence` used to be this row; the MIRROR made it the
      // identity -- every corpus keep already equals fieldNames(out) -- so the
      // row moved to the assertion side, the one family the mirror cannot
      // touch because assertions are not operands.)
      expect(at("assertion.aggregate.field#incidence")).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/first-refutation checker cannot show/) });
      // A different key appears: refuted. This row now lives on the ONLY
      // fixture that still carries a manufactured defect anywhere -- the
      // mirror, the distinctness skip and the bound rebind retired every
      // operand-side subject, measured over the whole population (see the
      // violated-pairs pin in C3). Forgetting the bin's closure leaves the
      // binned result underivable: an INTRODUCED finding, not the standing
      // one, and the guard refuses the collision over it.
      const dropsTemp = corpus.find((f2) => f2.id === "FX_H_READINGS_BINNED_DROPS_TEMP")!;
      expect(checkIsolation(dropsTemp, kernel.find((c) => c.id === "relation.derivedBy.bin.closure")!)).toMatchObject({ state: "violated", detail: expect.stringMatching(/introduced derivation defect\(s\) diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@bucketed via bin/) });
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
    const repairedAndRebound = {
      base: MASKING_BASE,
      patch: [
        { set: "assertions.0.relation", value: "flat" },
        { set: "structure.relations.flat.fields.amount.transformation", value: "ratio" },
      ],
      outcome: { status: "admissible" as const, codes: [], terms: [] },
      cause: "the assertion reads `flat`, whose amount is declared ratio: no reinterpretation and no undeclared grain",
    };
    const reachesIsolation = (codes: string[]) => {
      for (const gate of ["SCHEMA_INVALID", "IDENTICAL_STIMULI", "SAME_OUTCOME", "NO_COLLISION", "NOT_MINIMAL", "UNKNOWN_COORDINATE"]) {
        expect(codes, `the witness must reach the isolation loop on its own merits; ${gate} fired`).not.toContain(gate);
      }
    };

    it("a reference-binding defect introduced behind the reinterpretation's key does not admit the witness", () => {
      const census = loadCensus();
      // `assertion.aggregate.relation#incidence` erases the relation the assertion
      // READS, so the assertion's own key is untouched and the projection finding
      // stays where it was while the cause behind it moves.
      const relInc = census.find((c) => c.id === "assertion.aggregate.relation#incidence")!;
      const a = oracle.fixtures.get(MASKING_BASE)!;

      // THE MASKING, from the instrument's own output rather than argued: one
      // finding before, one after, the same identity — and a different cause
      // behind it. The erasure writes tokens, not markers, so the engine can be
      // asked, and this is what it says.
      const image = erase(a, relInc);
      expect(markersIn(image)).toEqual([]);
      const before = checkDerivations(a.structure);
      const after = checkDerivations((image as unknown as Fixture).structure);
      expect(after.map(findingId)).toEqual(before.map(findingId));
      expect(before[0].detail).toMatch(/retains amount by name but redeclares it/);
      // The cause behind the SAME key does not move either: the assertion's
      // relation is not part of this projection's subject or detail.
      expect(after[0].detail).toBe(before[0].detail);

      const r = checkWitness({ coordinates: [relInc.id, "field.transformation:interval~ratio"], a: { fixture: MASKING_BASE }, b: repairedAndRebound }, census, oracle);
      expect(checkDerivations(r.b.fixture.structure), "b must be clean, or the comparison below is not a comparison").toEqual([]);
      const codes = r.failures.map((f) => f.code);
      reachesIsolation(codes);

      // The SAME erasure. On the clean side the engine sees the finding it
      // introduces and refuses...
      const onB = r.isolation.find((i) => i.side === "b" && i.coordinate === relInc.id)!.result;
      expect(onB).toMatchObject({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
      // ...and on the hostile side the same key was already there to hide it,
      // so the obligation is unsettled — not discharged with a caveat, as it was.
      const onA = r.isolation.find((i) => i.side === "a" && i.coordinate === relInc.id)!.result;
      expect(onA).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/still carries diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat/) });
      // The combined image the collision is about, on the clean side: legal and
      // local, and the set now SAYS both (the combined route used to name only locality).
      const combinedB = r.isolation.find((i) => i.side === "b" && i.composed)!.result;
      expect(combinedB).toEqual({ state: "discharged", by: ["quotient-legal", "slot-local"] });
      // And a combined image the engine CAN be asked about — two token-writing
      // erasures over the hostile side — is unsettled for the same reason.
      const keepInc = census.find((c) => c.id === "relation.derivedBy.project.keep#incidence")!;
      expect(checkCombinedIsolation(a, [keepInc, relInc])).toMatchObject({ state: "unevaluated", reason: expect.stringMatching(/still carries diagnostic REL_DERIVATION_RESULT_NOT_DERIVABLE@flat/) });

      expect(r.ok).toBe(false);
      expect(codes).toContain("ERASURE_ISOLATION_UNEVALUATED");
      expect(r.failures.find((f) => f.code === "ERASURE_ISOLATION_UNEVALUATED")!.detail).toMatch(/^a\/assertion\.aggregate\.relation#incidence: /);
    });

    it("the same key with the same cause behind it is unevaluated too, and says so, rather than admitted", () => {
      // The row `project.keep#order` used to carry: an erasure that changes the
      // representation and leaves the finding, and the cause behind it,
      // byte-identical. The consumer cannot tell that from the case above — the
      // engine returns at its first refutation either way — so it says so. This
      // witness WAS admitted, through a discharge whose limitation nothing read.
      // That is the cost of the rule, stated: a witness over a stimulus that
      // still carries a finding cannot earn standing from a comparison the
      // engine could not make. Telling the two rows apart would need the rule
      // surface to report every refutation, which is frozen under the holdout
      // digest and is not this consumer's to change.
      const census = loadCensus();
      const relInc = census.find((c) => c.id === "assertion.aggregate.relation#incidence")!;
      const a = oracle.fixtures.get(MASKING_BASE)!;
      const before = checkDerivations(a.structure);
      const after = checkDerivations((erase(a, relInc) as unknown as Fixture).structure);
      expect(after.map(findingId)).toEqual(before.map(findingId));
      expect(after[0].detail).toBe(before[0].detail);

      const r = checkWitness({ coordinates: [relInc.id, "field.transformation:interval~ratio"], a: { fixture: MASKING_BASE }, b: repairedAndRebound }, census, oracle);
      const codes = r.failures.map((f) => f.code);
      reachesIsolation(codes);
      expect(r.isolation.find((i) => i.side === "a" && i.coordinate === relInc.id)!.result).toMatchObject({ state: "unevaluated" });
      // b is clean and the same erasure introduces nothing there either, so the
      // clean side is discharged and the hostile side is what cannot be settled.
      expect(r.isolation.find((i) => i.side === "b" && i.coordinate === relInc.id)!.result).toMatchObject({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
      // The ONLY reason it is refused. Everything else about this witness holds.
      expect(r.ok).toBe(false);
      expect(codes).toEqual(["ERASURE_ISOLATION_UNEVALUATED"]);
    });

    it("a definite structural refutation outranks an unsettled engine comparison", () => {
      // The order matters: the structural proofs still run when the engine
      // cannot settle, and a change outside the slot is REFUTED, not left as
      // unevaluated. Forced by handing the locality proof the wrong locator, so
      // that the assertion's change lies outside the slot it is measured against.
      const census = loadCensus();
      const relInc = census.find((c) => c.id === "assertion.aggregate.relation#incidence")!;
      const grainPlan = loadPlans().get("relation.grain")!;
      const a = oracle.fixtures.get(MASKING_BASE)!;
      expect(checkIsolation(a, relInc), "engine unsettled, structure fine").toMatchObject({ state: "unevaluated" });
      expect(checkIsolation(a, relInc, checkDerivations, () => grainPlan)).toMatchObject({ state: "violated", detail: expect.stringMatching(/which its own locator does not reach/) });
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
   *
   * A corpus-dead entry can also be a fact about the ERASURE rather than about
   * the fixture, and the six at the bottom of this table are: a bound incidence
   * slot rebinds to the operand namespace's own DECLARATION order, and these
   * slots already hold the first relation their structure declares, so the
   * canonical bind writes the binding it found. They are CORPUS-dead by the
   * definition above — the erasure is defined and this corpus gives it nothing to
   * do — and each entry says WHICH declaration makes it so, because a fixture
   * that declared its input relation second would make it live immediately.
   */
  const FIRST_DECLARED_RELATION_IS_THE_BINDING =
    "the slot already holds the FIRST relation the structure declares, which is the operand namespace's own declaration order, so the canonical rebinding writes the binding it found and the erasure is the identity on every fixture";
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
    "evidence.grainWitness#arity": "every corpus grain witness names one column, so truncating to one is identity",
    "field.additivity.semi-additive.nonAdditiveAlong#arity": "every corpus nonAdditiveAlong names one dimension",
    "relation.derivedBy.aggregate-to-grain.toGrain#arity": "every corpus toGrain names one column",
    "relation.derivedBy.aggregate-to-grain.toGrain#order": "every corpus toGrain names one column",
    "relation.derivedBy.nest.levels#order": "every corpus nest declares its levels already sorted",
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
    // The six relation-valued operands whose canonical rebinding IS the binding
    // the corpus writes.
    "relation.derivedBy.bin.from#incidence": FIRST_DECLARED_RELATION_IS_THE_BINDING,
    "relation.derivedBy.graph.edgeFrom#incidence": FIRST_DECLARED_RELATION_IS_THE_BINDING,
    "relation.derivedBy.graph.from#incidence": FIRST_DECLARED_RELATION_IS_THE_BINDING,
    "relation.derivedBy.join.from#incidence": FIRST_DECLARED_RELATION_IS_THE_BINDING,
    "relation.derivedBy.nest.from#incidence": FIRST_DECLARED_RELATION_IS_THE_BINDING,
    "relation.derivedBy.normalize.from#incidence": FIRST_DECLARED_RELATION_IS_THE_BINDING,
    // The two DISTINCTNESS-CONSTRAINED operands. `join.with` and `graph.edgeTo`
    // used to move and be refused by the boundary (C1f) because their canonical
    // bind landed on the SIBLING's own binding -- a self-join, a degenerate
    // edge. The law now rides on the operand map (`distinctFrom`), the pool
    // skips the sibling's value, and the next declared name -- which is exactly
    // what the corpus writes (the second relation is the joined one, the second
    // field the edge's far endpoint) -- makes the erasure the identity on every
    // fixture. Same corpus fact as the six above, one law deeper: a fixture
    // joining a THIRD-declared relation, or binding a later endpoint field,
    // makes it move immediately.
    "relation.derivedBy.graph.edgeTo#incidence": "the canonical rebind skips the sibling edgeFrom binding and lands on the next declared field, which every corpus edge already names, so the erasure is the identity on every fixture",
    "relation.derivedBy.join.with#incidence": "the canonical rebind skips the sibling from binding and lands on the next declared relation, which every corpus join already names, so the erasure is the identity on every fixture",
    // The three MIRRORED operands. The law writes the binding TWICE
    // (sameSet(out.grain, d.toGrain), sameSet(fieldNames(out), d.keep)), and
    // every corpus declaration satisfies the equation -- unlawful ones
    // included, whose illegality lives in other rules -- so the mirror rebind
    // (the other side of the equation IS the pool) is the identity on every
    // fixture. That is a stronger corpus fact than the eight above: it says
    // the operand-side spelling carries NO independent information in this
    // corpus, because no two admissible fixtures can differ only in a
    // mirrored operand. An authored stimulus that breaks the equation makes
    // the erasure move -- and the mirror REPAIRS the break, which is the
    // collision the witness machinery needs.
    "relation.derivedBy.aggregate-to-grain.toGrain#incidence": "the mirror (the result's own declared grain) is the pool, and every corpus declaration satisfies the law's equation, so the rebind is the identity on every fixture",
    "relation.derivedBy.project.keep#arity": "the mirror (the result's own declared fields) supplies the truncation length, and every corpus keep already equals fieldNames(out), so the cut is the identity on every fixture",
    "relation.derivedBy.project.keep#incidence": "the mirror (the result's own declared fields) is the pool, and every corpus keep already equals fieldNames(out), so the rebind is the identity on every fixture",
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

describe("C1f — an erasure the boundary REFUSES is not a quotient, and no corpus case can mend it", () => {
  /**
   * C1e separates CORPUS-dead (the erasure is defined but this corpus gives it
   * nothing to do) from WALK-dead (the quotient never visits the label). There
   * is a THIRD way a coordinate can be unwitnessable, and it is neither: the
   * erasure is defined, the corpus gives it plenty to do, and the image it
   * produces is not a declaration — so `checkIsolation` refuses it on every
   * stimulus it touches, and no witness naming the coordinate can be admitted
   * however much the corpus grows.
   *
   * THIS RECORD IS NOW MOSTLY HISTORY, AND IS KEPT AS SUCH. Sixteen of the
   * eighteen were `relation.derivedBy.*` OPERAND references and the cause had one
   * shape for all of them. The erasure that forgets a bound slot's names WITHOUT
   * leaving it unresolvable now exists -- it rebinds the slot to DECLARED names
   * drawn from the operand namespace the relation model declares
   * (`x-fsds-operands`) -- so twelve of the eighteen left this list: six are
   * DISCHARGED, and six are corpus-dead instead, which C1e enumerates and
   * explains (their canonical rebinding is the binding the corpus already
   * writes). Six were left after that landing, the peers DECLARATION took one,
   * and the DISTINCTNESS constraint took two more -- `join.with` and
   * `graph.edgeTo`, whose canonical bind used to land on the SIBLING operand's
   * own binding (a self-join, a degenerate edge) until the law's distinctness
   * requirement rode on the operand map and the pool learned to skip the
   * sibling's value. They are corpus-dead now, for the measured reason C1e
   * records: the next declared name after the sibling IS the binding the
   * corpus writes. Three were left, and the MIRROR took all of them.
   *
   * The three were `toGrain#incidence` and `project.keep` (both facets),
   * refused because the law writes the SAME binding a second time in the
   * result's own declaration (`sameSet(out.grain, d.toGrain)`,
   * `sameSet(fieldNames(out), d.keep)`), so a one-sided rebind from the
   * input's namespace left a declaration that disagreed with itself -- which
   * round 30 read as "the coordinate's extent is wider than its locator, a
   * census change". The MIRROR measurement dissolved that: the equation
   * holds in EVERY corpus declaration, unlawful ones included, so taking the
   * OTHER SIDE of the equation as the pool satisfies it by construction with
   * a one-sided locator, and the rebind is the identity throughout. The
   * census change was never needed; the law itself was the pool.
   *
   * `structure.peers[]#incidence` USED to be the sixth, refused for the
   * ORIGINAL tokenizing reason: `peers` sits on the STRUCTURE rather than on a
   * derivation branch, and the operand map was read off a branch only, so the
   * walk declared no namespace for it. That one was mended by exactly the
   * DECLARATION this record called for -- the structure now carries the same
   * `x-fsds-operands` map the branches carry, and an array's ELEMENTS inherit
   * their annotated property's namespace -- so the peer sets rebind to declared
   * relation names and the coordinate is DISCHARGED on every fixture where it
   * moves. The rebind is lawful for a measured reason: the canonical bind lands
   * on the structure's FIRST declared relation, which the corpus declares as a
   * base relation, and the divergence law is conditioned on every member being
   * an aggregate -- so the rebound set is a lawful (vacuous) peer claim, not a
   * conserved one. That is the operand-typing question in miniature, and here
   * the corpus answers it.
   *
   * The refusals stay collateral for EVERY class by design, because a collision
   * found under one might be the break rather than the coordinate. The refusal is
   * correct -- and it is a fact about the QUOTIENT, not about the coordinate's
   * necessity.
   *
   * That distinction is measured here, not asserted. On
   * FX_N_NESTED_SUBTOTAL_AT_PREFIX, rebinding the FIRST level from `country` to
   * `revenue` moves exactly one path, leaves both sides with a clean derivation
   * boundary, and flips the verdict admissible -> illegal under the
   * already-existing cause CASE_NESTED_SUBTOTALS_OFF_GRAIN. That pair is now
   * ADMITTED as a witness for `nest.levels#incidence` -- the discharge this
   * record was waiting for -- and the test beside it records what the discharge
   * COSTS: the same erasure also identifies the ORDER pair.
   *
   * The residual question this describe was opened with is CLOSED: the
   * never-discharged list is empty, the eighteen are resolved -- discharged,
   * corpus-dead for a measured reason, or refused no longer -- and the ratchet
   * stays armed: any coordinate whose erasure again refuses on every stimulus
   * it moves reappears below, and filing a verdict to clear the subtraction
   * gate remains exactly the move the standing index exists to prevent.
   */
  const plans = loadPlans();
  const fixtures = [...oracle.fixtures.values()];
  const wellFormedness = new Set<string>(Object.values(DERIVATION_DIAG));
  const detailOf = (r: IsolationResult) => (r as { detail?: string }).detail ?? "";

  /** The fixtures where this coordinate's own erasure alters the canonical bytes. */
  const movedBy = (c: Coordinate) => {
    const plan = plans.get(c.id);
    if (!plan) return [];
    return fixtures.filter((f) => resolveSlots(f, plan.locator).length > 0 && canonical(executePlan(f, plan)) !== canonical(f));
  };

  // EMPTY since the mirror landed, and the ratchet still bites: any coordinate
  // whose erasure again refuses on every stimulus it moves reappears here and
  // fails the exactness test below. The list is kept as the pin of that fact.
  const NEVER_DISCHARGED: string[] = [];

  it("the reference-topology coordinates whose own erasure is never discharged are exactly these", () => {
    const measured = kernel
      .filter((c) => c.kind === "reference-topology")
      .filter((c) => {
        const moving = movedBy(c);
        return moving.length > 0 && moving.every((f) => checkIsolation(f, c).state !== "discharged");
      })
      .map((c) => c.id)
      .sort();
    expect(measured).toEqual(NEVER_DISCHARGED);
  });

  it("the enumeration is not vacuous, and every refusal is the boundary's own well-formedness line", () => {
    for (const id of NEVER_DISCHARGED) {
      const c = kernel.find((x) => x.id === id);
      expect(c, `${id} is no longer in the kernel`).toBeDefined();
      const states = movedBy(c!).map((f) => checkIsolation(f, c!));
      expect(states.length, `${id} now erases nothing anywhere`).toBeGreaterThan(0);
      // Nothing is discharged, and nothing is refused for a reason outside the
      // boundary's list: this is not a semantic finding the erasure produced,
      // it is the structure ceasing to be typable.
      expect(states.every((r) => r.state !== "discharged"), `${id} is discharged somewhere`).toBe(true);
      const violated = states.filter((r) => r.state === "violated");
      expect(violated.length, `${id} is never actually refuted`).toBeGreaterThan(0);
      for (const r of violated) {
        expect(
          [...wellFormedness].some((w) => detailOf(r).includes(w)),
          `${id}: ${detailOf(r).slice(0, 140)}`,
        ).toBe(true);
      }
    }
  });

  it("the nest-levels incidence distinction is real and oracle-separated, and the collision under its erasure HOLDS", () => {
    const base = oracle.fixtures.get("FX_N_NESTED_SUBTOTAL_AT_PREFIX")!;
    const levelPath = "structure.relations.hierarchy.derivedBy.levels";
    const patched = applyPatch(base, [{ set: levelPath, value: ["revenue", "state"] }]);
    // Exactly one path moves, and it is position 0 of the levels. Arity is
    // unchanged, and `#order`'s erasure (sorting) is identity on both sides,
    // so what separates them is neither arity nor order.
    expect(changedPaths(base, patched)).toEqual([".structure.relations.hierarchy.derivedBy.levels[0]"]);
    const ja = judge(base.structure, base.assertions, base.evidence);
    const jb = judge(patched.structure, patched.assertions, patched.evidence);
    expect({ status: ja.status, codes: codesOf(ja), terms: termsOf(ja) }).toEqual({ status: "admissible", codes: [], terms: [] });
    expect({ status: jb.status, codes: codesOf(jb), terms: termsOf(jb) }).toEqual({
      status: "illegal",
      codes: ["REL_GRAIN_SUBTOTAL_MISMATCH"],
      terms: [],
    });
    // Neither side is refused by the derivation boundary: the pair is legal.
    for (const j of [ja, jb]) {
      expect(j.derivations.some((d) => wellFormedness.has(d.code ?? d.term ?? ""))).toBe(false);
    }
    const incidence = kernel.find((c) => c.id === "relation.derivedBy.nest.levels#incidence")!;
    expect(canonical(erase(base, incidence))).toBe(canonical(erase(patched, incidence)));
  });

  it("the incidence erasure identifies the ORDER pair too, and admission now refuses the misattributed recast", () => {
    // WHAT THE DISCHARGE COSTS, measured rather than argued -- and now POLICED.
    // The order witness separates two fixtures holding the SAME two declared
    // levels in a different ARRANGEMENT. A bound incidence slot is forgotten by
    // landing on ONE arrangement of declared names, so every arrangement of the
    // same occupants reaches one image: the collision holds for `#incidence`
    // too, and before the attribution rule it was ADMITTED.
    //
    // It cannot be otherwise on the erasure side: one that PRESERVED the
    // arrangement could not identify the fixtures that differ in WHICH declared
    // names are bound. So the rule lives at ADMISSION, where the difference the
    // collision is over can be read: a pair whose entire difference is the
    // arrangement is order's degree of freedom, and citing incidence alone
    // credits the coordinate with a distinction that survives its erasure only
    // as collateral. The same pair stays admissible for `#order` alone -- the
    // committed witness -- and for the JOINT set, because the owner is then
    // named.
    const order = witnesses.find((w) => w.coordinates.join(" + ") === "relation.derivedBy.nest.levels#order");
    expect(order, "the committed nest-levels order witness is gone").toBeDefined();
    expect(checkWitness(order!, kernel, oracle).ok, "the owner's own witness is untouched by the rule").toBe(true);
    const recast: Witness = { ...order!, coordinates: ["relation.derivedBy.nest.levels#incidence"] };
    const r = checkWitness(recast, kernel, oracle);
    expect(r.ok).toBe(false);
    expect(r.failures.map((f) => f.code)).toEqual(["DIFFERENCE_MISATTRIBUTED"]);
    expect(r.failures[0].detail).toContain("relation.derivedBy.nest.levels#order");
    // The refusal is about the difference, not the pair: the stimuli differ ONLY
    // in the arrangement (the `.id` the patched side carries is the harness's own
    // labeling), and the collision itself still holds.
    const paths = changedPaths(r.a.fixture, r.b.fixture).filter((p) => p !== ".id");
    expect(paths).toEqual([
      ".structure.relations.hierarchy.derivedBy.levels[0]",
      ".structure.relations.hierarchy.derivedBy.levels[1]",
    ]);
    expect(canonical(erase(r.a.fixture, kernel.find((c) => c.id === "relation.derivedBy.nest.levels#incidence")!))).toBe(
      canonical(erase(r.b.fixture, kernel.find((c) => c.id === "relation.derivedBy.nest.levels#incidence")!)),
    );
    // And naming the owner beside the coordinate is admissible again: the joint
    // set says exactly what the pair is evidence about.
    const joint: Witness = { ...order!, coordinates: ["relation.derivedBy.nest.levels#incidence", "relation.derivedBy.nest.levels#order"] };
    const j = checkWitness(joint, kernel, oracle);
    expect(j.failures.map((f) => f.code)).not.toContain("DIFFERENCE_MISATTRIBUTED");
  });

  it("the authored incidence stimulus over the round-25 pair is ADMITTED, which is the discharge this record was waiting for", () => {
    const authored: Witness = {
      coordinates: ["relation.derivedBy.nest.levels#incidence"],
      a: { fixture: "FX_N_NESTED_SUBTOTAL_AT_PREFIX" },
      b: {
        base: "FX_N_NESTED_SUBTOTAL_AT_PREFIX",
        patch: [{ set: "structure.relations.hierarchy.derivedBy.levels", value: ["revenue", "state"] }],
        outcome: outcomeFrom("illegal", ["REL_GRAIN_SUBTOTAL_MISMATCH"]),
        cause:
          "CASE_NESTED_SUBTOTALS_OFF_GRAIN: rebinding position 0 of the declared levels removes `country` from the declared prefixes, so the existing toGrain: [country] subtotal is off-grain",
      },
    };
    const r = checkWitness(authored, kernel, oracle);
    expect(r, JSON.stringify(r.failures)).toMatchObject({ ok: true });
    // Not a vacuous admission: both sides must leave the boundary clean, which is
    // what the tokenizing erasure could not do.
    expect(checkIsolation(r.b.fixture, kernel.find((c) => c.id === "relation.derivedBy.nest.levels#incidence")!).state).toBe("discharged");
  });

  it("the incidence coordinate has a plan, so the refusal is the erasure's image and not a walk gap", () => {
    const incidence = kernel.find((c) => c.id === "relation.derivedBy.nest.levels#incidence")!;
    expect(planFor(incidence)).toBeDefined();
  });
});

describe("C1g — the ORDER facet is emitted only where the DECLARATION says the sequence is read", () => {
  /**
   * A JSON array is the only way the relation model spells a collection, so the
   * emitted schema used to be unable to tell a SET from a SEQUENCE: `keep`,
   * `along`, `nonAdditiveAlong`, `peers`, `grainWitness` and `grain` are read by
   * membership or set-equality by every rule that touches them, while `levels` is
   * compared positionally by `isDeclaredNestGrain` and `toGrain` against it. The
   * census emitted an `#order` facet for both kinds, so it claimed a degree of
   * freedom for an encoding artifact.
   *
   * The declaration now carries the fact (`x-fsds-sequence`) and the walk REFUSES
   * a name list that states neither, so the facet exists only where a rule reads
   * the positions. These tests pin that in both directions: the two ordered lists
   * keep their facet and are semantically real, and the six set-valued ones have
   * no facet at all and are filed as representation artifacts.
   *
   * What the corpus can and cannot show is stated rather than glossed. Permuting
   * `nest.levels` moves the judgment (2 of its 5 committed instances); `toGrain`
   * has no committed instance long enough to permute, so its order is reached by
   * an AUTHORED pair instead; and for the set-valued lists the corpus is not the
   * evidence at all -- the LAWS are, and the declaration is where they are
   * recorded.
   */
  const plans = loadPlans();
  const fixtures = [...oracle.fixtures.values()];
  const schema = JSON.parse(fs.readFileSync(FIXTURE_SCHEMA, "utf-8")) as unknown;

  /** A node whose `items` IS the name definition, not an array or record containing one. */
  const isNameList = (node: unknown): node is Record<string, unknown> => {
    const decl = node as Record<string, unknown> | null;
    if (!decl || typeof decl !== "object" || decl.type !== "array") return false;
    const it = decl.items as Record<string, unknown> | undefined;
    if (!it || typeof it !== "object") return false;
    if (it.$ref === "#/definitions/name") return true;
    const allOf = it.allOf as { $ref?: string }[] | undefined;
    return Array.isArray(allOf) && allOf.length === 1 && allOf[0]?.$ref === "#/definitions/name";
  };
  /** Every array-of-Name declaration in the emitted schema, wherever it sits. */
  const listDeclarations = (): Record<string, unknown>[] => {
    const found: Record<string, unknown>[] = [];
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node === null || typeof node !== "object") return;
      if (isNameList(node)) found.push(node);
      for (const v of Object.values(node as Record<string, unknown>)) walk(v);
    };
    walk(schema);
    return found;
  };

  /** Judgement identity: status plus every occurrence, order-independent. */
  const judgmentOf = (f: Fixture) => {
    const j = judge(f.structure, f.assertions, f.evidence);
    const part = (xs: readonly string[]) => [...xs].sort().join(",");
    return [
      j.status,
      part(j.diagnostics.map((d) => `${d.code}@${d.subject}`)),
      part(j.obligations.map((o) => `${o.term}@${o.subject}`)),
      part(j.derivations.map((d) => `${d.kind}:${d.code ?? d.term}@${d.subject}`)),
    ].join("|");
  };
  const writeAt = (f: Fixture, locator: NonNullable<ReturnType<typeof planFor>>["locator"], value: unknown) => {
    const copy = JSON.parse(JSON.stringify(f)) as Fixture;
    for (const s of resolveSlots(copy, locator)) (s.parent as Record<string, unknown>)[String(s.key)] = JSON.parse(JSON.stringify(value));
    return copy;
  };
  /** How many committed instances are long enough to permute, and how many judgments move. */
  const sensitivity = (id: string) => {
    const plan = plans.get(id)!;
    let permutable = 0;
    let moved = 0;
    for (const f of fixtures) {
      const slots = resolveSlots(f, plan.locator);
      if (slots.length === 0) continue;
      const v = (slots[0].parent as Record<string, unknown>)[String(slots[0].key)];
      if (!Array.isArray(v) || v.length < 2) continue;
      permutable += 1;
      if (judgmentOf(f) !== judgmentOf(writeAt(f, plan.locator, [...v].reverse()))) moved += 1;
    }
    return { permutable, moved };
  };

  const orderLeaves = kernel.filter((c) => c.kind === "reference-topology" && c.facet === "order").map((c) => c.leaf).sort();

  it("every name-list declaration states the fact, and exactly two of them say the order is read", () => {
    // The census THROWS on an unmarked name list, which is what makes this a
    // ratchet rather than a convention: a new list arrives failing rather than
    // silently gaining an order facet nothing can adjudicate. The count is the
    // non-vacuity guard — eight array-of-Name declarations sit in the model.
    const declared = listDeclarations();
    expect(declared).toHaveLength(8);
    for (const d of declared) expect(["set", "ordered"]).toContain(d["x-fsds-sequence"]);
    expect(declared.filter((d) => d["x-fsds-sequence"] === "ordered")).toHaveLength(2);
    expect(declared.filter((d) => d["x-fsds-sequence"] === "set")).toHaveLength(6);
  });

  it("the facet exists for exactly the two lists whose declaration says the order is read", () => {
    expect(orderLeaves).toEqual(["relation.derivedBy.aggregate-to-grain.toGrain", "relation.derivedBy.nest.levels"]);
  });

  it("the set-valued lists have no order coordinate at all, and their verdict files them as an artifact", () => {
    const ledger = loadSubtraction();
    for (const leaf of [
      "assertion.aggregate.along",
      "evidence.grainWitness",
      "field.additivity.semi-additive.nonAdditiveAlong",
      "relation.derivedBy.project.keep",
      "structure.peers[]",
    ]) {
      expect(kernel.some((c) => c.id === `${leaf}#order`), `${leaf}#order is still in the kernel`).toBe(false);
      expect(ledger.verdicts[`${leaf}#order`]?.disposition, `${leaf}#order`).toBe("representation-artifact");
    }
  });

  it("the ordered ones are real: `levels` order moves the judgment, and `toGrain` order is reached by an authored pair", () => {
    expect(sensitivity("relation.derivedBy.nest.levels#order").moved).toBeGreaterThan(0);
    const base = oracle.fixtures.get("FX_N_NESTED_SUBTOTAL_AT_PREFIX")!;
    const fields = { country: { transformation: "nominal", key: true }, state: { transformation: "nominal", key: true }, revenue: { transformation: "ratio" } };
    const side = (order: string[]) =>
      applyPatch(base, [
        { set: "structure.relations.subtotals.derivedBy.toGrain", value: order },
        { set: "structure.relations.subtotals.grain", value: ["country", "state"] },
        { set: "structure.relations.subtotals.fields", value: fields },
      ] as never);
    const a = side(["country", "state"]);
    const b = side(["state", "country"]);
    expect({ status: judge(a.structure, a.assertions, a.evidence).status, codes: codesOf(judge(a.structure, a.assertions, a.evidence)) }).toEqual({ status: "admissible", codes: [] });
    expect({ status: judge(b.structure, b.assertions, b.evidence).status, codes: codesOf(judge(b.structure, b.assertions, b.evidence)) }).toEqual({ status: "illegal", codes: ["REL_GRAIN_SUBTOTAL_MISMATCH"] });
    expect(changedPaths(a, b)).toEqual([".structure.relations.subtotals.derivedBy.toGrain[0]", ".structure.relations.subtotals.derivedBy.toGrain[1]"]);
  });

  it("relation.grain is a name list the census gives no facet at all, and its order is inert too", () => {
    // A second way the coverage is decided by the declaration's SHAPE: `grain` is
    // declared as a union (`unknown` | name[]), so the walk emits the leaf and no
    // reference-topology coordinates. Its order is read nowhere and is inert over
    // every multi-element instance the corpus carries.
    expect(kernel.filter((c) => c.leaf === "relation.grain").map((c) => c.kind)).toEqual(["leaf"]);
    let permutable = 0;
    let moved = 0;
    for (const f of fixtures) {
      for (const [rn, rel] of Object.entries(f.structure.relations)) {
        const g = (rel as { grain: unknown }).grain;
        if (!Array.isArray(g) || g.length < 2) continue;
        permutable += 1;
        const copy = JSON.parse(JSON.stringify(f)) as Fixture;
        (copy.structure.relations[rn] as { grain: unknown }).grain = [...g].reverse();
        if (judgmentOf(f) !== judgmentOf(copy)) moved += 1;
      }
    }
    expect(permutable).toBeGreaterThan(1);
    expect(moved, "reversing a declared grain now moves the judgment").toBe(0);
  });
});

describe("C1h — the incidence erasure at a BOUND reference is the LANDED resolution-preserving rebinding", () => {
  /**
   * C1f established the problem: the census's incidence erasure rewrites a
   * reference's names to reserved tokens, which is a legal QUOTIENT image but not
   * a legal DECLARATION, so for a reference the derivation boundary must RESOLVE
   * the boundary refuses it and no witness naming the coordinate can be admitted.
   * Eighteen coordinates are in that position, and every route to closing the
   * closure gate passes through them.
   *
   * This describe measured the CANDIDATE that has since LANDED. Canonical
   * rebinding replaces the slot's names with the operand's OWN first k declared
   * names: the image resolves because they are declared, arity is preserved, and
   * every pair of stimuli that differ only in WHICH declared things the slot
   * binds is identified. The `rebind` below is the prototype's own definition,
   * kept as the record of what was measured BEFORE the landing; the production
   * erasure now carries the same behaviour (`x-fsds-operands` on the branch,
   * `bindingPool` in `erasure-plan.ts`), and the last test in this describe pins
   * that the two agree on every coordinate both can express, so the prototype
   * cannot drift into a second, disagreeing definition of the erasure.
   *
   * What it measured is a DIVISION, and the division is the finding. It reaches
   * thirteen of the twenty-one bound reference-topology coordinates, including
   * the pair C1f used to show the distincton is real. The eight it does not reach
   * are named with the code the refusal introduces, and the dominant cause is
   * structural rather than incidental: for `toGrain`, `keep`, `bin.field` and
   * `edgeTo` the boundary's law writes the SAME binding a second time in the
   * result's own declaration (`sameSet(out.grain, d.toGrain)`,
   * `sameSet(fieldNames(out), d.keep)`, the retained binned field), so rebinding
   * the operand alone leaves a declaration that no longer agrees with itself.
   * The coordinate's extent is wider than its locator, and a quotient for those
   * has to name both sides.
   *
   * The LANDED division is finer than this one, because the census measures
   * whether an erasure MOVES BYTES separately from whether its image is legal:
   * six of the thirteen "reached" coordinates are corpus-dead (their canonical
   * bind is the binding the corpus already writes -- C1e enumerates them), six
   * are discharged, and six of the eight "refused" remain refused (C1f
   * enumerates them; `structure.peers[]#incidence` was never in this describe's
   * population because `peers` sits on the structure, not on a branch).
   */
  const wellFormedness = new Set<string>(Object.values(DERIVATION_DIAG));
  const rebindingPlans = loadPlans();
  const boundCoords = kernel.filter(
    (c) =>
      c.kind === "reference-topology" &&
      c.leaf.startsWith("relation.derivedBy.") &&
      c.leaf !== "relation.derivedBy.kind" &&
      c.leaf !== "relation.derivedBy.join.cardinality",
  );

  /** The holder relation carrying this derivedBy, and the relation its `from` names. */
  const holderOf = (f: Fixture, leaf: string): { holder: string; input: string } | undefined => {
    const m = /^relation\.derivedBy\.([^.]+)\./.exec(leaf);
    if (!m) return undefined;
    for (const [rn, rel] of Object.entries(f.structure.relations)) {
      const d = (rel as { derivedBy?: { kind: string; from: string } }).derivedBy;
      if (d && d.kind === m[1]) return { holder: rn, input: d.from };
    }
    return undefined;
  };

  /**
   * The candidate: replace each name at the slot with the operand's own first
   * declared name. A relation-valued operand ranges over the structure's
   * relations; a field-valued one over the input relation's fields.
   */
  const rebind = (f: Fixture, c: Coordinate): { image: Fixture; note: string } => {
    const plan = rebindingPlans.get(c.id);
    const image = JSON.parse(JSON.stringify(f)) as Fixture;
    if (!plan) return { image, note: "no plan" };
    const operand = c.leaf.slice(c.leaf.lastIndexOf(".") + 1);
    const h = holderOf(f, c.leaf);
    if (!h) return { image, note: "no holder" };
    const relationValued = operand === "from" || operand === "with";
    const input = (f.structure.relations as Record<string, { fields: Record<string, unknown> }>)[h.input];
    if (!relationValued && !input) return { image, note: "no input relation" };
    const pool = relationValued ? Object.keys(f.structure.relations) : Object.keys(input.fields);
    for (const s of resolveSlots(image, plan.locator)) {
      const v = (s.parent as Record<string, unknown>)[String(s.key)];
      const count = Array.isArray(v) ? v.length : 1;
      if (pool.length < count) return { image, note: `operand declares ${pool.length} name(s), slot holds ${count}` };
      (s.parent as Record<string, unknown>)[String(s.key)] = Array.isArray(v) ? pool.slice(0, count) : pool[0];
    }
    return { image, note: "" };
  };

  const findingsOf = (f: Fixture) => new Set(checkDerivations(f.structure).map((d) => `${d.code ?? d.term}@${d.subject}`));

  const measured = () => {
    const reached: string[] = [];
    const refused: string[] = [];
    const invalid: string[] = [];
    const introducedCodes = new Set<string>();
    for (const c of boundCoords) {
      const plan = rebindingPlans.get(c.id)!;
      let built = 0;
      let bad = 0;
      for (const f of oracle.fixtures.values()) {
        if (resolveSlots(f, plan.locator).length === 0) continue;
        const r = rebind(f, c);
        if (r.note) continue;
        built += 1;
        if (oracle.validate(r.image).length > 0) {
          bad += 1;
          continue;
        }
        for (const k of findingsOf(r.image)) {
          if (!findingsOf(f).has(k)) {
            bad += 1;
            const diag = [...wellFormedness].find((w) => k.includes(w));
            if (diag) introducedCodes.add(diag);
            break;
          }
        }
      }
      if (built === 0) continue;
      (bad > 0 ? refused : reached).push(c.id);
    }
    return { reached: reached.sort(), refused: refused.sort(), invalid, introducedCodes: [...introducedCodes].sort() };
  };

  it("reaches exactly the thirteen bound coordinates whose operand binding is written ONCE", () => {
    expect(measured().reached).toEqual([
      "relation.derivedBy.aggregate-to-grain.from#incidence",
      "relation.derivedBy.bin.from#incidence",
      "relation.derivedBy.graph.edgeFrom#incidence",
      "relation.derivedBy.graph.from#incidence",
      "relation.derivedBy.graph.value#incidence",
      "relation.derivedBy.join.from#incidence",
      "relation.derivedBy.nest.from#incidence",
      "relation.derivedBy.nest.levels#arity",
      "relation.derivedBy.nest.levels#incidence",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
      "relation.derivedBy.normalize.from#incidence",
      "relation.derivedBy.project.from#incidence",
    ]);
  });

  it("and leaves exactly eight, each refused by a boundary well-formedness code", () => {
    const m = measured();
    expect(m.refused).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#arity",
      "relation.derivedBy.aggregate-to-grain.toGrain#incidence",
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.bin.field#incidence",
      "relation.derivedBy.graph.edgeTo#incidence",
      "relation.derivedBy.join.with#incidence",
      "relation.derivedBy.project.keep#arity",
      "relation.derivedBy.project.keep#incidence",
    ]);
    // The refusal is the boundary's own line, never a schema-invalid image: the
    // candidate is a legal quotient throughout, which is what makes the remaining
    // division a fact about the LAWS and not about the image language.
    expect(m.invalid).toEqual([]);
    expect(m.introducedCodes).toEqual(["REL_DERIVATION_RESULT_NOT_DERIVABLE"]);
  });

  it("identifies the pair C1f used to show the distinction is real, without touching either side", () => {
    // The same stimulus pair C1f refuses: `[country, state]` against `[revenue, state]`.
    const incidence = boundCoords.find((c) => c.id === "relation.derivedBy.nest.levels#incidence")!;
    const base = oracle.fixtures.get("FX_N_NESTED_SUBTOTAL_AT_PREFIX")!;
    const patched = applyPatch(base, [{ set: "structure.relations.hierarchy.derivedBy.levels", value: ["revenue", "state"] }]);
    const ea = rebind(base, incidence).image;
    const eb = rebind(patched, incidence).image;
    expect(canonical(ea)).toBe(canonical(eb));
    // The a-side is UNCHANGED by the candidate, which is why its isolation closes
    // on `unchanged` rather than on a comparison the engine could not make.
    expect(JSON.stringify(ea)).toBe(JSON.stringify(base));
    expect(findingsOf(ea).size).toBe(findingsOf(base).size);
    expect([...findingsOf(eb)].filter((k) => !findingsOf(patched).has(k))).toEqual([]);
  });

  it("agrees with the prototype on every bound incidence coordinate both can express, so there is one definition", () => {
    // The prototype above predicted the landed erasure's images before the
    // landing; this is the pin that keeps them ONE definition. Any divergence —
    // a different pool, a different order, a different fallback — fails here
    // rather than turning the prototype into a second reading of the erasure
    // that quietly disagrees with the executor the ledgers were recorded under.
    //
    // ONE deliberate exception: the prototype measured the UNCONSTRAINED,
    // UNMIRRORED pool, and `join.with`/`graph.edgeTo` later gained the
    // distinctness skip while `toGrain`/`keep` gained the mirror. They are
    // excluded by reading the constraint off the LANDED plan -- not by name --
    // so a future constrained operand is excluded the same way.
    const plans = loadPlans();
    let compared = 0;
    for (const c of boundCoords.filter((x) => x.id.endsWith("#incidence"))) {
      const p = plans.get(c.id);
      // The prototype measured the UNCONSTRAINED, UNMIRRORED pool: constrained
      // and mirrored operands are excluded by reading the LANDED plan, not by
      // name, so a future one is excluded the same way.
      if (p?.locator.operandDistinctFrom || p?.locator.operandMirror) continue;
      for (const f of oracle.fixtures.values()) {
        const proto = rebind(f, c);
        if (proto.note) continue;
        const landed = erase(f, c);
        expect(canonical(landed), `${c.id} on ${f.id}`).toBe(canonical(proto.image));
        compared += 1;
      }
    }
    // Not vacuous: the comparison ran over real slots.
    expect(compared).toBeGreaterThan(0);
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

  it("81 ratified historically, 78 still accounted, 3 suspended — the same 268 coordinates counted twice", () => {
    // Counted in the SAME units as C4, by running the same dispositioner over
    // the same stage-1 coordinates against the two different accounted sets.
    // Comparing `stage1Accounted.size` to 81 would be comparing kernel ids to
    // stage-1 dispositions, which are not the same population.
    //
    // ACCOUNTED, not holding. 78 is the union of the accounting classes — see
    // the standing tally below, where some of those 78 rest on a provisional
    // closure or on a retained name and nothing stronger. Calling the figure
    // "holding" would report the weakest class with the authority of the
    // strongest.
    //
    // 78/3, not 77/4: `field.temporality.kind` is ACCOUNTED as required derived
    // vocabulary (subtraction-stage2-enum-leaf.json) instead of suspended, and
    // the member pair's stimulus pair ratifies `field.temporality#present`,
    // which enters the accounted set with it.
    const historical = ratifiedThen;
    const current = ratifiedUnder(stage1Accounted);
    expect(historical).toHaveLength(81);
    expect(current).toHaveLength(78);

    // Nothing appeared and nothing vanished: exactly three moved from accounted
    // to suspended, and each is named in the ledger.
    const lost = historical.filter((id) => !current.includes(id));
    expect(lost).toHaveLength(3);
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
    // 15, not 11: two closures gained controlled stimuli (their receipt pairs discharge
    // obligations 3-6), which puts both carriers and the two `#incidence` coordinates their
    // normalizations forget into the closure-accounted class. Then 14, because a coordinate the
    // closure form was accounting for earned a witness of its own and moved to `primitive` -- the
    // classes are a partition, so a coordinate cannot be in both. Accounted is not ratified, and
    // the assertion below is what keeps the two apart. Then 59: the FIRST witness filed under
    // the bound-incidence quotient (nest.levels#incidence, the round-25 pair the instrument
    // refused while the erasure tokenized) moved it to primitive standing, and each of
    // the stage-2 filings under that repaired standing added one more each.
    expect(byClass).toEqual({ primitive: 62, "closure-accounted": 10, "required-derived-vocabulary": 3, suspended: 2 });
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
      // `retained` is CONSTANT across acceptance boundaries on purpose: a
      // retained coordinate's accounting comes from a basis verdict, not from
      // any witness this boundary admits or refuses.
      return { primitive: primitiveRatified(held), interactionOnly: new Set(interactionOnly(held)), closureAccounted, retained: retainedIds } satisfies CurrentSupport;
    };
    const asRecorded = admits((r) => r.ok);
    // The weaker boundary: the held-open witnesses fail on NO_COLLISION
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
    // Two, not three. `assertion.aggregate.op` is DECLARED by the 2-set witness
    // that lapsed, and holds a primitive witness of its own that the lapse did
    // not touch — so it lost nothing. Coverage by a failed witness is not a
    // standing loss, and the ledger keeps the two apart: it appears under
    // `declares`, and under neither loss field. `field.temporality.kind` is not
    // suspended either: its witness was re-pointed at the coordinate it actually
    // measures, and the leaf is ACCOUNTED as required derived vocabulary, so it
    // holds via that class instead of sitting in the ledger.
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

  /**
   * The ACCOUNTING figure a reconciliation is given: current support UNION the
   * coordinates a verdict removed.
   *
   * `accountedBy` is a STANDING union — what carries a coordinate today — and a
   * removed coordinate has no standing. The reconciliation asks a different
   * question: "does the present still account for what history accounted for?" A
   * coordinate that left the kernel by DECISION is accounted for by that decision,
   * so reading support alone reported the two order facets this slice removed as
   * unexplained LOSSES while their representation-artifact verdicts sat in the
   * ledger.
   *
   * The intersection is deliberate: a removal history never carried is not a
   * "gain" in this comparison either, and admitting the whole removal set as live
   * would mint thirty-one of them. The comparison is like for like — history's
   * coordinates against the present's accounting of the SAME coordinates — and
   * the subtraction gate is where a removal that history never saw is reported.
   */
  const accountedNow = () => new Set([...accountedBy(support), ...[...removedByVerdict].filter((id) => historicalSet.has(id))]);

  it("reconciles: every loss is ledgered, and the gains are stage-2 coordinates stage 1 could not have accounted", () => {
    const r = reconcileHistory(accountedNow(), historicalSet, holds);
    expect(r.unexplainedLoss).toEqual([]);
    // Legitimate gains, REPORTED rather than absorbed: `field.temporality#present` is a holder
    // fact the STAGE-2 discriminator normal form discovered, and the other four are what the two
    // receipt-stimulated closures newly account for -- both carriers, and the two `#incidence`
    // coordinates their normalizations forget. The historical authority is an INPUT, never a
    // function of the present, so a gain is exactly what must surface here.
    expect(r.unexplainedGain).toEqual([
      "assertion.aggregate.along#present",
      "assertion.aggregate.field#incidence",
      "assertion.aggregate.nulls:exclude~<absent>",
      "evidence.grainWitness#arity",
      "field.additivity.kind:additive~non-additive",
      "field.additivity.kind:non-additive~ratio-measure",
      "field.temporality#present",
      "field.temporality.grain",
      "field.temporality.grain:day~month",
      "observation.null:censored~suppressed",
      "relation.derivedBy.aggregate-to-grain.from#incidence",
      "relation.derivedBy.bin.closure",
      "relation.derivedBy.bin.closure:left-closed~<absent>",
      "relation.derivedBy.bin.field#incidence",
      "relation.derivedBy.join.cardinality",
      "relation.derivedBy.join.cardinality:one-to-many~many-to-many",
      "relation.derivedBy.kind",
      "relation.derivedBy.kind:bin~project",
      "relation.derivedBy.kind:normalize~project",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
      "structure.peers[]#arity",
    ]);
    expect(r.suspended).toEqual(["assertion.kind", "assertion.kind:aggregate~ratio-comparison"]);
  });

  it("SETTLING a suspension leaves the historical record untouched", () => {
    // The first break. Under the derivation, clearing the ledger deleted three
    // coordinates from history — the past shrinking because a present-day
    // exception was resolved.
    const settled: typeof holds = new Map();
    expect(historicallyAccounted()).toEqual(historicalSet);
    const r = reconcileHistory(accountedNow(), historicalSet, settled);
    // History is unchanged; what moves is that the same three losses are now
    // UNEXPLAINED, which is the correct report for an unledgered loss.
    expect(historicallyAccounted()).toEqual(historicalSet);
    expect(r.unexplainedLoss).toEqual(["assertion.kind", "assertion.kind:aggregate~ratio-comparison"]);
    expect(r.suspended).toEqual([]);
  });

  it("ADMITTING new current evidence does not write it into the past", () => {
    // The second break. Under the derivation, any id added to `live` silently
    // became a coordinate stage 1 had accounted for.
    const widened = new Set([...accountedBy(support), "field.temporality.grain:day~month"]);
    expect(historicallyAccounted()).toEqual(historicalSet);
    const r = reconcileHistory(widened, historicalSet, holds);
    expect(r.unexplainedGain).toEqual([
      "assertion.aggregate.along#present",
      "assertion.aggregate.field#incidence",
      "assertion.aggregate.nulls:exclude~<absent>",
      "evidence.grainWitness#arity",
      "field.additivity.kind:additive~non-additive",
      "field.additivity.kind:non-additive~ratio-measure",
      "field.temporality#present",
      "field.temporality.grain",
      "field.temporality.grain:day~month",
      "observation.null:censored~suppressed",
      "relation.derivedBy.aggregate-to-grain.from#incidence",
      "relation.derivedBy.bin.closure",
      "relation.derivedBy.bin.closure:left-closed~<absent>",
      "relation.derivedBy.bin.field#incidence",
      "relation.derivedBy.join.cardinality",
      "relation.derivedBy.join.cardinality:one-to-many~many-to-many",
      "relation.derivedBy.kind",
      "relation.derivedBy.kind:bin~project",
      "relation.derivedBy.kind:normalize~project",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
      "structure.peers[]#arity",
    ]);
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
    const r = reconcileHistory(accountedNow(), swapped, holds);
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
        // Two accounting grounds, and BOTH are accounting rather than standing. A coordinate the
        // SUBTRACTION retained independently reads as `required-derived-vocabulary`, which is
        // strictly more specific than the provisional closure that also depends on it; the point
        // of this test is the `primitive` exclusion above, which no ground may cross.
        if (s.state === "holding") expect(["closure-accounted", "required-derived-vocabulary"], `${id} is carried only by a provisional closure`).toContain(s.via);
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
      // ...and the SPECIAL section counts for the same reason holdout does: the
      // orphan check raises LEDGER_FIXTURE_ORPHAN for a fixture no section
      // references, and its walk already includes every special.* entry. Omitting
      // it here restated that rule more narrowly than the production check
      // enforces it — the same narrowing the holdout line below was added to fix.
      ...Object.values(bindings.special).flat(),
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

describe("a non-confluent coordinate set is refused as evidence before any collision is read", () => {
  const census = loadCensus();
  const oracle = loadOracle();
  type W = Parameters<typeof checkWitness>[0];

  it("arity and order on one list: refused on each stimulus where the listings disagree, with no collision, minimality or isolation claim", () => {
    // relation.derivedBy.nest.levels#arity cuts the list to its declared floor,
    // keeping the FIRST elements; #order sorts it. Cut-then-sort and
    // sort-then-cut are two images. No edge decides it and no law says which
    // comes first -- the pair is declared non-commuting and refused as a
    // composite. (`toGrain` carried this example until the MIRROR: its arity
    // floor is now the result grain's own length, which made the cut the
    // identity on both sides and the pair stop colliding at all. `levels`
    // keeps the static floor, so the cut still reads the order.)
    const w: W = {
      coordinates: ["relation.derivedBy.nest.levels#arity", "relation.derivedBy.nest.levels#order"],
      a: { fixture: "FX_N_NESTED_SUBTOTAL_AT_PREFIX" },
      b: {
        base: "FX_N_NESTED_SUBTOTAL_AT_PREFIX",
        patch: [{ set: "structure.relations.hierarchy.derivedBy.levels", value: ["state", "country", "revenue"] }],
        outcome: outcomeFrom("illegal", ["REL_GRAIN_SUBTOTAL_MISMATCH"]),
        cause: "CASE_NESTED_SUBTOTALS_OFF_GRAIN: the reordered levels no longer declare country as a prefix, so the existing toGrain: [country] subtotal is off-grain",
      },
    };
    const r = checkWitness(w, census, oracle);
    expect(r.ok).toBe(false);
    expect(r.failures.length).toBeGreaterThan(0);
    expect(new Set(r.failures.map((f) => f.code))).toEqual(new Set(["ERASURE_NOT_CONFLUENT"]));
    // Only the b-side listings disagree: the a-side's two levels are already at
    // the floor and sorted, so it composes to one image and is not accused.
    expect(r.failures.map((f) => f.detail).filter((d) => d.startsWith("b: "))).toHaveLength(r.failures.length);
    for (const f of r.failures) {
      expect(f.detail).toMatch(/^b: 2 distinct images across the listings of relation\.derivedBy\.nest\.levels#arity \+ relation\.derivedBy\.nest\.levels#order; refused as evidence/);
      expect(f.detail).toContain("declared: arity is forgotten by cutting");
    }
    // Refused BEFORE the image is read: nothing downstream of the composition is claimed.
    expect(r.isolation).toEqual([]);
  });

  it("a merge and an absence-spelling on one leaf is no longer refused: absence absorbs the class, and the set is decided on its one image", () => {
    // This pair was the refused example until the absence-spelling learned to see a
    // class containing its member. It now composes to one image, so the 2-set is
    // judged as a witness -- and fails as one, on its merits, not on admission.
    const w: W = {
      coordinates: ["observation.null:absent~censored", "observation.null:censored~<absent>"],
      a: { fixture: "FX_SURVIVAL_MEAN_WITH_CENSORED_ROWS" },
      b: { fixture: "FX_N_SURVIVAL_MEAN_EXCLUDE_CENSORED" },
    };
    const r = checkWitness(w, census, oracle);
    expect(r.ok).toBe(false);
    expect(r.failures.map((f) => f.code)).not.toContain("ERASURE_NOT_CONFLUENT");
    expect(r.failures.map((f) => f.code)).toContain("NO_COLLISION");
  });

  it("the refusal is specific to non-confluence: a 2-set whose listings agree is decided on its image, not refused", () => {
    // The held-open assertion 2-set fails NO_COLLISION on its (confluent) image.
    const w = loadWitnesses().witnesses.find((x) => x.coordinates.join(" + ") === "assertion.kind + assertion.aggregate.op")!;
    const r = checkWitness(w, census, oracle);
    expect(r.failures.map((f) => f.code)).not.toContain("ERASURE_NOT_CONFLUENT");
    expect(r.failures.map((f) => f.code)).toContain("NO_COLLISION");
  });

  it("no live witness is a non-confluent set: every failure the committed file carries is a collision or isolation result", () => {
    for (const w of loadWitnesses().witnesses) {
      const r = checkWitness(w, census, oracle);
      expect(r.failures.map((f) => f.code), w.coordinates.join(" + ")).not.toContain("ERASURE_NOT_CONFLUENT");
    }
  });
});

describe("an oracle-separated pair is NECESSARY for a witness and not sufficient", () => {
  // The stage-2 witnessability measurement is the first of three stages, and the two later
  // ones each refuse something the first admits, for a different reason. Recorded so that
  // measurement is never read as "these ten are available".
  it("refuses a pair that does not vary the coordinate it is offered for", () => {
    // `evidence.rows.*#present` has a clean oracle-separated collided pair:
    // FX_T_GRAIN_WITNESS_UNIQUE_ROWS (admissible) against ..._DUPLICATE_ROWS (illegal with
    // REL_GRAIN_FANOUT). But BOTH carry `evidence.rows` -- three rows each -- so erasing the
    // presence coordinate collides them only by destroying the rows' content, which is what
    // actually differs between them. The adjudication policy's isolation rule is explicit that
    // substitution must isolate the claimed distinction, and this one does not. It stays
    // unresolved, and the footprint audit agrees by classifying the pair `over-erasing`.
    const rowsOf = (id: string) => (oracle.fixtures.get(id) as unknown as { evidence?: { rows?: unknown } }).evidence?.rows;
    const a = rowsOf("FX_T_GRAIN_WITNESS_UNIQUE_ROWS");
    const b = rowsOf("FX_T_GRAIN_WITNESS_DUPLICATE_ROWS");
    expect(a, "both sides carrying rows is exactly why this pair is no witness for presence").toBeDefined();
    expect(b, "both sides carrying rows is exactly why this pair is no witness for presence").toBeDefined();
    expect(a).not.toEqual(b);
  });

  it("accepts a slot-local erasure whose introduced finding is the CORPUS's semantic rule, and still refuses a well-formedness break", () => {
    // This pair was refused before REL-ISOLATION-SLOT-LOCAL-01, and the refusal was the
    // exemption's SCOPE and not its principle: the exemption was written for "a member pair on
    // a discriminator" and this is the declaration's leaf and its member-absence cross-term. It
    // is now stated for what it measures -- an erasure confined to the coordinate's own slot
    // that produces a SEMANTIC finding has produced the distinction under test.
    const c = checkWitness(
      {
        coordinates: ["relation.derivedBy.bin.closure"],
        a: { fixture: "FX_READINGS_BINNED_NO_CLOSURE" },
        b: { fixture: "FX_N_READINGS_BINNED_LEFT_CLOSED" },
      },
      kernel,
      oracle,
    );
    expect(c.ok, "the pair IS the ideal one: one fixture is the other minus the declaration").toBe(true);

    // And the guard is live, not vacuous: a slot-local erasure that introduces a WELL-FORMEDNESS
    // refusal is still refused, because that means the erasure broke the structure and a
    // collision would be that break. `REL_DERIVATION_*` are the boundary's own refusals, kept
    // out of the doctrine catalogue for exactly this reason. The subject is now measured
    // scarcity: `bin.field#incidence` (retired by the bound rebind), then
    // `project.keep#arity` (retired by the mirror) carried this demonstration, and
    // the ONLY remaining violated pairs in the corpus are `bin.closure` on
    // FX_H_READINGS_BINNED_DROPS_TEMP -- forgetting the closure leaves the
    // binned result underivable, a break nothing rebinds around.
    const binClosure = kernel.find((x) => x.id === "relation.derivedBy.bin.closure")!;
    const broken = checkIsolation(oracle.fixtures.get("FX_H_READINGS_BINNED_DROPS_TEMP")!, binClosure);
    expect(broken.state).toBe("violated");
    expect(String(broken.state === "violated" ? broken.detail : "")).toContain("REL_DERIVATION_");
    // No corpus pair can carry the witness-level half any further: over the whole
    // fixture population the erasures the boundary refuses identify no two fixtures
    // with different oracle outcomes (measured; see the never-discharged rows in
    // C1f), so `NO_COLLISION` fires before the isolation clause is reached. The
    // witness-level plumbing is pinned where a colliding pair DOES exist -- C3d's
    // masking witness, which reaches the isolation loop and is refused there.
  });

  it("the peers incidence erasure is lawful in BOTH binding regimes, and the difference is what the erasure is for", () => {
    // Round 32's open edge, settled by measurement rather than asserted away:
    // the lawful-image claim leaned on the corpus declaring its first relation
    // as a BASE relation, so the canonical peer bind [first two] never landed
    // on two aggregates. Reorder FX_PEERS_AGGREGATE_TO_DIFFERENT_TARGETS so it
    // does, and the two regimes separate cleanly:
    //
    //   base+aggregate bind -- the divergence law is conditioned on EVERY member
    //     being an aggregate, so the image carries no finding at all and the
    //     discharge rests on nothing but legality and locality;
    //   aggregate+aggregate bind -- the law FIRES on the rebound set and the
    //     image is judged illegal REL_PEER_GRAIN_DIVERGENCE, which is not a
    //     boundary refusal but the semantic distinction under test: the same
    //     principle that admits the bin.closure pair above, where a slot-local
    //     erasure producing the CORPUS's own rule IS the finding the coordinate
    //     names. The coordinate is lawful in both regimes for different
    //     reasons, and neither depends on the corpus's declaration order.
    const base = oracle.fixtures.get("FX_PEERS_AGGREGATE_TO_DIFFERENT_TARGETS")!;
    const peers = kernel.find((c) => c.id === "structure.peers[]#incidence")!;
    const plan = loadPlans().get("structure.peers[]#incidence")!;
    // The committed corpus IS the base+aggregate regime, and its image is clean.
    expect(checkIsolation(base, peers)).toMatchObject({ state: "discharged" });
    const clean = executePlan(base, plan) as unknown as Fixture;
    expect(codesOf(judge(clean.structure, clean.assertions, clean.evidence))).toEqual([]);
    // The aggregate+aggregate regime is one declaration order away: schema-valid,
    // moving, and discharged with the full conjunction -- the derivation boundary
    // itself reports nothing on the rebound set.
    const aggregates = JSON.parse(JSON.stringify(base)) as Fixture;
    {
      const s = aggregates.structure as unknown as { relations: Record<string, unknown>; peers?: string[][] };
      const { events, ...rest } = s.relations;
      s.relations = { ...rest, events };
      s.peers = [["by_day", "events"]];
    }
    expect(oracle.validate(aggregates), "the reorder is a legal declaration").toEqual([]);
    expect(checkIsolation(aggregates, peers)).toEqual({ state: "discharged", by: ["no-introduced-finding", "quotient-legal", "slot-local"] });
    const divergent = executePlan(aggregates, plan) as unknown as Fixture;
    const j = judge(divergent.structure, divergent.assertions, divergent.evidence);
    expect(j.status).toBe("illegal");
    expect(codesOf(j)).toEqual(["REL_PEER_GRAIN_DIVERGENCE"]);
    // The firing finding is SEMANTIC, not the boundary's own well-formedness
    // line -- the one class the isolation guard refuses a collision over.
    expect(Object.values(DERIVATION_DIAG)).not.toContain("REL_PEER_GRAIN_DIVERGENCE");
  });

  it("and the DIAGNOSTIC decides it, not the operation: the same erasure is witnessable where absence is lawful", () => {
    // The erased declaration is schema-VALID, so the deletion is the correct erasure and not a
    // plan defect. The illegality is semantic, which is exactly why an erasure can never be
    // neutral here: erasing == asserting the very thing CASE_WHICH_BIN_GETS_TEN calls illegal
    // ("bin with no declared closure", `invariant:declared-closure`).
    const neighbour = JSON.parse(JSON.stringify(oracle.fixtures.get("FX_N_READINGS_BINNED_LEFT_CLOSED"))) as {
      structure: { relations: Record<string, { derivedBy?: Record<string, unknown> }> };
    };
    expect(neighbour.structure.relations.bucketed!.derivedBy!.closure, "the control must carry it, or there is nothing to erase").toBe("left-closed");
    delete neighbour.structure.relations.bucketed!.derivedBy!.closure;
    expect(oracle.validate(neighbour), "optional in the schema: the erasure is legal, the ABSENCE is what is diagnosed").toEqual([]);

    // Same operation kind on both, opposite outcomes -- so the operation is not what decides it.
    const plans = loadPlans();
    expect(plans.get("relation.derivedBy.bin.closure:left-closed~<absent>")!.operation.kind).toBe("spell-member-as-absent");
    expect(plans.get("assertion.aggregate.nulls:exclude~<absent>")!.operation.kind).toBe("spell-member-as-absent");
    const lawfulAbsence = checkWitness(
      {
        coordinates: ["assertion.aggregate.nulls:exclude~<absent>"],
        a: { fixture: "FX_SURVIVAL_MEAN_WITH_CENSORED_ROWS" },
        b: { fixture: "FX_N_SURVIVAL_MEAN_EXCLUDE_CENSORED" },
      },
      kernel,
      oracle,
    );
    expect(lawfulAbsence.ok, "an absent null policy is a legal default, so here a witness exists").toBe(true);
  });
});
