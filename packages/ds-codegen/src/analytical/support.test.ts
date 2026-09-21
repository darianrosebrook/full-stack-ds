/**
 * THE CROSS-SURFACE INVARIANT: one definition of primitive support.
 *
 * The defect this file guards against was not a wrong answer in one place — it
 * was TWO answers. `primitiveRatified` conferred primitive standing from
 * `coordinates.length === 1`, the witness audit classified the same argument as
 * destroying a sibling facet, `final-quotient` carried a third copy of the
 * syntactic rule, and the subtraction gate never consulted the drift checker at
 * all. Every consumer was internally consistent and the composition was not.
 *
 * These tests assert the composition: audit standing, the ratified set the
 * closure ledger reads, the verdict drift checker, and the final-quotient
 * support clause must agree witness by witness.
 */
import { describe, expect, it } from "vitest";
import { computeReport, specimens } from "./erasure-audit.js";
import { judge } from "./engines.js";
import type { Fixture } from "./structure.js";
import { canonical, erase } from "./quotient.js";
import { loadCensus } from "./census.js";
import { checkWitness, loadOracle, loadWitnesses, primitiveRatified } from "./necessity.js";
import { claimedFootprints, censusById, readSupport } from "./support.js";
import { loadSubtraction, verdictDrift } from "./subtraction.js";

const census = loadCensus();
const oracle = loadOracle();
const witnesses = loadWitnesses().witnesses;
const holding = witnesses.filter((w) => checkWitness(w, census, oracle).ok);
const ratified = primitiveRatified(holding);
const report = computeReport();
const oracleFixtures = () => [...oracle.fixtures.values()];
const judged = (f: Fixture) => {
  try {
    const j = judge(f.structure, f.assertions, f.evidence);
    return `${j.status}|${[...j.diagnostics.map((d) => d.code)].sort().join(",")}|${[...j.obligations.map((o) => o.term)].sort().join(",")}`;
  } catch (e) {
    return `THROWS|${(e as Error).message.slice(0, 40)}`;
  }
};
/** Committed or synthesized fixtures the coordinate's erasure identifies while the oracle separates them. */
const separatingPairsIn = (pool: Fixture[], id: string): [string, string][] => {
  const c = censusById().get(id);
  if (!c) return [];
  const groups = new Map<string, Fixture[]>();
  for (const f of pool) {
    const img = canonical(erase(f, c));
    groups.set(img, [...(groups.get(img) ?? []), f]);
  }
  const out: [string, string][] = [];
  for (const g of groups.values())
    for (let i = 0; i < g.length; i++)
      for (let j = i + 1; j < g.length; j++) if (judged(g[i]) !== judged(g[j])) out.push([g[i].id, g[j].id]);
  return out;
};

describe("one definition of primitive support, consumed by every surface", () => {
  it("the audit's standing IS the classifier's answer, witness by witness", () => {
    const footprint = claimedFootprints();
    const byId = censusById();
    const disagreements: string[] = [];
    for (const w of holding) {
      const reading = readSupport(w.coordinates, footprint, byId);
      const expected = reading.ratifies ? "primitive" : w.coordinates.length === 1 ? "composite" : "interaction-only";
      const audited = report.witnesses.find((a) => a.witness === [...w.coordinates].sort().join(" + "));
      expect(audited, `${w.coordinates.join(" + ")} is in the audit`).toBeDefined();
      if (audited!.standing !== expected) disagreements.push(`${audited!.witness}: audit=${audited!.standing} classifier=${expected}`);
    }
    expect(disagreements).toEqual([]);
  });

  it("every coordinate the ledger records as witnessed is ratified, and the gate now says so itself", () => {
    // The re-adjudicated case is the reason this test exists: the round-25
    // witness HOLDS and is filed, but its erasure takes `nest.levels#order`
    // with it, so `witnessed` — which means primitive ratification here — was
    // the overclaim and the verdict returned to unresolved.
    const ledger = loadSubtraction();
    const live = new Set(census.map((c) => c.id));
    expect(verdictDrift(ledger, live, ratified)).toEqual([]);
    expect(ledger.verdicts["relation.derivedBy.nest.levels#incidence"]?.disposition).toBe("unresolved");
    expect(ratified.has("relation.derivedBy.nest.levels#incidence")).toBe(false);
    // And the witness that would have ratified it is still on file, classified.
    const filed = report.witnesses.find((a) => a.witness === "relation.derivedBy.nest.levels#incidence");
    expect(filed).toMatchObject({ verdict: "sibling-facet", standing: "composite", holds: true });
    expect(filed!.sibling).toEqual(["relation.derivedBy.nest.levels#order"]);
  });

  it("the refinement class keeps primitive standing, so the repair is not a blanket demotion", () => {
    // The opposite error. A leaf subsuming its own member pairs is the intended
    // reading (round 30: those pairs are sub-distinctions of the leaf's
    // proposition), and the presence family joins it once the test is the
    // CARRIER rather than the leaf: deleting a holder takes what is inside it.
    for (const id of ["relation.derivedBy.bin.closure", "field.transformation", "assertion.aggregate.along#present"]) {
      expect(ratified.has(id), `${id} ratifies`).toBe(true);
      const audited = report.witnesses.find((a) => a.witness === id);
      if (audited) expect(audited.standing, `${id} audit standing`).toBe("primitive");
    }
    expect(ratified.size).toBe(62);
  });

  it("the classifier names THREE consequences, and each is exercised by a real witness", () => {
    const verdicts = new Map(report.witnesses.map((a) => [a.witness, a.verdict]));
    expect(verdicts.get("relation.derivedBy.nest.levels#incidence")).toBe("sibling-facet");
    expect(verdicts.get("relation.derivedBy.bin.closure")).toBe("subsumes-refinements");
    expect(report.witnesses.some((a) => a.verdict === "atomic")).toBe(true);
    // No witness reaches outside its own proposition any more: the holder
    // deletion that used to land there is collateral INSIDE what was erased.
    expect(report.witnesses.filter((a) => a.outside.length > 0)).toEqual([]);
  });

  it("the regression the repair must fail: one coordinate is not enough", () => {
    // The mutation this guards: put `coordinates.length === 1` back and the
    // real case must break. Stated executably rather than described, because
    // the whole defect was a rule that looked right in isolation.
    const footprint = claimedFootprints();
    const byId = censusById();
    const real = readSupport(["relation.derivedBy.nest.levels#incidence"], footprint, byId);
    expect(real.declared).toHaveLength(1);
    expect(real.sibling).toEqual(["relation.derivedBy.nest.levels#order"]);
    expect(real.ratifies, "a declared length of one must not be sufficient").toBe(false);
    // The syntactic rule would have accepted it:
    expect(real.declared.length === 1).toBe(true);
  });
});

describe("the footprint-class triage over the live basis candidates", () => {
  /**
   * WHAT CAN EVER EARN PRIMITIVE STANDING, measured before any witness is
   * filed. The round-38 mistake was filing first and discovering the standing
   * question afterwards; this sweep is the ordering the successor ledger now
   * prescribes — classify the candidates, then file.
   *
   * A candidate's class is what a SINGLE-coordinate witness on it would do, so
   * it is read through the same classifier every consumer uses. "Ratifiable" is
   * necessary and not sufficient: an atomic candidate whose erasure changes no
   * fixture is corpus-dead, and one whose erasure changes fixtures but
   * identifies no oracle-separated pair is evidence-blocked.
   */
  const ledger = loadSubtraction();
  const footprint = claimedFootprints();
  const byId = censusById();
  const candidates = ledger.basis.candidates.filter((id) => byId.has(id));
  const classOf = (id: string) => readSupport([id], footprint, byId).cls;
  const movesOnCorpus = (id: string) => {
    const c = byId.get(id)!;
    return oracleFixtures().some((f) => canonical(erase(f, c)) !== canonical(f));
  };
  const unresolved = candidates.filter((id) => (ledger.verdicts[id]?.disposition ?? "unresolved") === "unresolved");

  it("partitions every candidate, and a future erasure change that widens the unwitnessable set fails here", () => {
    const tally: Record<string, number> = {};
    for (const id of candidates) tally[classOf(id)] = (tally[classOf(id)] ?? 0) + 1;
    expect(tally).toEqual({ atomic: 74, "own-refinements": 8, "sibling-facet": 2, outside: 1 });
  });

  it("names the three that can NEVER be ratified by a primitive claim, and why", () => {
    const blocked = candidates.filter((id) => !readSupport([id], footprint, byId).ratifies).sort();
    expect(blocked).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#incidence",
      "relation.derivedBy.nest.levels#incidence",
      "structure.peers[]#present",
    ]);
    // Two take a sibling facet with them; one reaches outside its own
    // proposition. Neither shape is a sub-distinction, so no witness on them
    // can claim that erasing "exactly this coordinate" destroyed the
    // distinction -- which is what `witnessStrength.single` requires.
    expect(readSupport(["relation.derivedBy.nest.levels#incidence"], footprint, byId).sibling).toEqual(["relation.derivedBy.nest.levels#order"]);
    expect(readSupport(["relation.derivedBy.aggregate-to-grain.toGrain#incidence"], footprint, byId).sibling).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
    ]);
    expect(readSupport(["structure.peers[]#present"], footprint, byId).outside.length).toBeGreaterThan(0);
  });

  it("counts the ratifiable unresolved set and its corpus-moving subset, which is what filing may draw on", () => {
    const ratifiable = unresolved.filter((id) => readSupport([id], footprint, byId).ratifies);
    const moving = ratifiable.filter(movesOnCorpus);
    // 65 of the 68 unresolved candidates could in principle be ratified (the
    // other three are the blocked set above). 51 of those 65 actually change a
    // fixture; the remaining 14 are corpus-dead -- their erasure IS the binding
    // the corpus writes, a corpus fact and not a defect, which C1e enumerates.
    //
    // NON-IDENTITY IS NOT EVIDENCE. Changing a fixture only says the erasure
    // does something; a witness still needs two stimuli the oracle SEPARATES
    // that the erasure identifies, and the constructibility triage below
    // measures that separately -- 16 of the 60 have such a shape at all.
    expect(unresolved.length).toBe(70);
    expect(ratifiable.length).toBe(61);
    expect(moving.length).toBe(47);
    // And the blocked three are NOT in it.
    expect(ratifiable).not.toContain("relation.derivedBy.nest.levels#incidence");
    expect(ratifiable).not.toContain("structure.peers[]#present");
  });
});

describe("the constructibility triage: what EVIDENCE each ratifiable candidate has", () => {
  /**
   * The instrument can now produce a legal image for every candidate (round 37),
   * standing is coherent (round 38) and the candidates are classed (round 39).
   * What remains is EVIDENCE, and this measures it: a witness needs two stimuli
   * the oracle separates that the erasure identifies.
   *
   * Outcomes are JUDGED FROM CONTENT here, never resolved by id — the specimen
   * population repeats ids deliberately, so an id-resolving sweep reports pairs
   * that are not about their content (the pinned hazard from round 24).
   */
  const ledger = loadSubtraction();
  const footprint = claimedFootprints();
  const byId = censusById();
  const unresolved = ledger.basis.candidates.filter((id) => (ledger.verdicts[id]?.disposition ?? "unresolved") === "unresolved" && byId.has(id));
  const ratifiable = unresolved.filter((id) => readSupport([id], footprint, byId).ratifies);

  /** The candidates whose erasure identifies two COMMITTED fixtures the oracle separates. */
  const byCommittedPair = ratifiable.filter((id) => separatingPairsIn([...oracle.fixtures.values()], id).length > 0);
  /** The candidates with such a SHAPE among the synthesized specimens — authoring backlog, not citable stimuli. */
  const bySpecimenShape = ratifiable.filter((id) =>
    separatingPairsIn(specimens().fixtures.filter((f) => oracle.validate(f).length === 0 && !judged(f).startsWith("THROWS")), id).length > 0,
  );

  it(
    "exactly one ratifiable candidate is separable by committed fixtures, and its pair is about content rather than the coordinate",
    () => {
      expect(byCommittedPair).toEqual(["evidence.rows.*#present"]);
      // WHY it was never filed, as a property of the pair rather than a note:
      // BOTH sides carry rows, so erasing the holder's presence destroys content
      // on both sides and the collision is about that content, not about
      // presence. A presence witness needs a pair where one side IS the other
      // minus the holder, and the corpus has no such pair.
      for (const id of ["FX_T_GRAIN_WITNESS_UNIQUE_ROWS", "FX_T_GRAIN_WITNESS_DUPLICATE_ROWS"]) {
        const f = oracle.fixtures.get(id)!;
        expect((f.evidence as { rows?: unknown }).rows, `${id} carries rows`).toBeDefined();
      }
    },
    600_000,
  );

  it(
    "names the authoring backlog: the candidates whose SHAPE separates, which is raw material and not yet evidence",
    () => {
      // 17 of the 61 have a synthesized near-miss pair that separates. (A
      // looser probe reported 24 by counting a specimen whose judgment THROWS
      // as a differing outcome; a throw is not a judgment, so the pool here
      // excludes those specimens and the smaller number is the honest one.)
      // Five of the original 21 were FILED and left this list, and that is
      // the move this triage is for: the shape was a specimen, and the citable
      // stimulus that replaced it is a committed fixture plus an authored
      // patch. `relation.derivedBy.normalize.field#incidence` is the latest,
      // filed as `FX_SHARE_OF_AVERAGE_SCORE` against the same fixture with
      // `shares.derivedBy.field` moved from the non-additive `avg_score` to the
      // key field `region`. A specimen
      // is a SEARCH DEVICE — its ids repeat and it is not a citable stimulus —
      // so each of the remaining ones still needs a committed fixture or an
      // authored {base, patch} whose judgment follows from an existing cause
      // before a witness can be filed. For ONE of them that route is closed by
      // measurement rather than by backlog: `relation.derivedBy.project.from#incidence`
      // separates over specimens, but authored over its committed fixture the side
      // that does not type is the AUTHORED one, so the evidence-pool clause refuses
      // it. One of the other two is now FILED (normalize.field#incidence, above);
      // `relation.derivedBy.graph.value#incidence` still authors cleanly and is
      // unfiled, and `necessity.test.ts` pins all three verdicts together.
      expect(bySpecimenShape.length).toBe(17);
      expect(bySpecimenShape).toContain("relation.derivedBy.graph.value#incidence");
      // And the remainder have no separating shape at all, which is a corpus gap
      // and not an instrument one.
      expect(ratifiable.length - bySpecimenShape.length).toBe(50);
    },
    600_000,
  );
});
