/**
 * The semantic footprint is a coarsening relation, claimed structurally and
 * falsified against specimens — and the witness audit reads it, rather than
 * reading coordinate ids.
 *
 * The two failure modes these tests exist for are opposite. A footprint built
 * from id prefixes UNDER-reports where the ids lie (`field.whole` prefixes
 * `field.whole.perRow` as a string and cannot reach it as a locator) and
 * OVER-reports where a merge leaves an erasure vacuous without destroying the
 * distinction it names.
 */
import { describe, expect, it } from "vitest";
import { loadPlans } from "./census.js";
import { claimedFootprints, computeReport, loadReport, measure, specimens } from "./erasure-audit.js";

const recorded = loadReport();
const live = computeReport();
const claimed = claimedFootprints();

describe("the committed footprint report", () => {
  it("matches the live tree, so a moved input cannot silently restate a footprint", () => {
    const r = { recorded, live };
    const drift = Object.entries(r.recorded.footprints).filter(([id, f]) => JSON.stringify(r.live.footprints[id]) !== JSON.stringify(f));
    expect(drift.map(([id]) => id)).toEqual([]);
    expect(r.live.digests).toEqual(r.recorded.digests);
  });

  it("is measured over the corpus AND every witness and closure stimulus", () => {
    const s = specimens();
    expect(s.corpus).toBe(84);
    expect(s.stimuli).toBeGreaterThan(0);
    // Without the stimuli, a coordinate whose only evidence is a patched pair
    // would read as dead — the exact misreading this lane exists to prevent.
    expect(live.specimens.total).toBe(s.corpus + s.stimuli);
  });
});

describe("structural claims survive falsification", () => {
  it("has no refuted claim: no specimen pair separates something a claimed destroyer keeps", () => {
    expect(live.refuted).toEqual([]);
  });

  it("reports the three supported-but-unclaimed coarsenings rather than adopting them", () => {
    // Each is a MERGE that appears to coarsen its own leaf's DELETION. That is
    // false in general — deleting `grain` identifies `{day}`, `{month}` and
    // absence, while merging day~month leaves absence separable — and it is
    // only supported here because no specimen pair exercises the difference.
    // Adopting it would let a thin specimen set widen a footprint.
    expect(live.unclaimed.map((u) => `${u.destroys} -> ${u.supported}`).sort()).toEqual([
      "field.temporality.grain:day~month -> field.temporality.grain",
      "relation.derivedBy.bin.closure:left-closed~<absent> -> relation.derivedBy.bin.closure",
      "relation.derivedBy.kind:bin~normalize -> relation.derivedBy.kind",
    ]);
  });

  it("can refute: a false claim is caught by a specimen pair", () => {
    // Injected rather than fabricated through a plan, because a plan cannot
    // express a false containment — the claim rule reads the locator the
    // operation executes at, so any containment it derives is true by
    // construction. The falsifier is only worth having if it can fail, so the
    // claim map is the seam.
    const plans = loadPlans();
    const lie = claimedFootprints(plans);
    lie.set("field.key", ["field.key", "field.transformation"]);
    const m = measure(specimens().fixtures, plans, lie);
    expect(m.refuted.map((r) => `${r.destroys} !-> ${r.claimed}`)).toContain("field.key !-> field.transformation");
    expect(m.refuted[0].counterexample).toMatch(/\S+ \/ \S+/);
  });

  it("reports what it could not test at all, instead of counting it as agreement", () => {
    // 79 of 140 erasures identify no two distinct specimens, so their claimed
    // footprint is unfalsified rather than confirmed. That is the corpus
    // ceiling, and it is the argument for schema-minimal specimens.
    expect(live.unseparated.length).toBeGreaterThan(live.dead.length);
    for (const id of live.dead) expect(live.unseparated).toContain(id);
  });
});

describe("containment is structural, never a string prefix", () => {
  it("does not let `field.whole` claim `field.whole.perRow`, which its id prefixes", () => {
    expect("field.whole.perRow#incidence".startsWith("field.whole")).toBe(true);
    expect(claimed.get("field.whole")).toEqual(["field.whole"]);
  });

  it("gives a leaf deletion its own member pairs, and nothing else", () => {
    expect(claimed.get("assertion.aggregate.op")).toEqual([
      "assertion.aggregate.op",
      "assertion.aggregate.op:count~min",
      "assertion.aggregate.op:mean~count",
      "assertion.aggregate.op:mean~min",
      "assertion.aggregate.op:sum~count",
      "assertion.aggregate.op:sum~mean",
      "assertion.aggregate.op:sum~min",
    ]);
  });

  it("does not let one merge claim another, which the vacuous-composition reading would", () => {
    // After merging `interval` into `nominal`, erasing `ordinal~interval` is a
    // no-op — and the ordinal/interval distinction still survives, spelled
    // ordinal/nominal. A footprint that counted vacuity as destruction recorded
    // six transformation pairs that are in fact all separable.
    expect(claimed.get("field.transformation:nominal~interval")).toEqual(["field.transformation:nominal~interval"]);
  });

  it("gives a holder deletion everything beneath it, across branches", () => {
    const f = claimed.get("relation.derivedBy#present")!;
    expect(f).toContain("relation.derivedBy.kind");
    expect(f).toContain("relation.derivedBy.join.cardinality");
    expect(f).toContain("relation.derivedBy.graph.edgeTo#incidence");
    expect(f.length).toBe(58);
  });

  it("gives incidence the order at its own slot, and not the reverse", () => {
    expect(claimed.get("assertion.aggregate.along#incidence")).toContain("assertion.aggregate.along#order");
    expect(claimed.get("assertion.aggregate.along#order")).toEqual(["assertion.aggregate.along#order"]);
    expect(claimed.get("assertion.aggregate.along#arity")).toEqual(["assertion.aggregate.along#arity"]);
  });
});

describe("the witness audit", () => {
  const byVerdict = (v: string) => live.witnesses.filter((w) => w.verdict === v);

  it("classifies all 47 witnesses and leaves none with an unresolved plan", () => {
    expect(live.witnesses.length).toBe(47);
    expect(byVerdict("unresolved-plan")).toEqual([]);
  });

  it("finds no witness that destroys a coordinate outside the leaves it names", () => {
    // The headline result, and it contradicts the expectation this audit was
    // built to test. Twelve witnesses destroy more than they declare, but every
    // excess is a REFINEMENT of a leaf they already name — the aggregate-op
    // member pairs under `assertion.aggregate.op`, the transformation pairs
    // under `field.transformation`. None reaches a neighbouring declaration, so
    // none is the shape a closure or an explicitly composite proposition is for.
    expect(byVerdict("over-erasing")).toEqual([]);
    expect(live.witnesses.filter((w) => w.outside.length > 0)).toEqual([]);
  });

  it("still records the twelve, because 'declares one, destroys seven' is a weaker claim than primitive", () => {
    expect(byVerdict("subsumes-refinements").map((w) => w.witness).sort()).toEqual([
      "assertion.aggregate.along#incidence",
      "assertion.aggregate.nulls",
      "assertion.aggregate.nulls",
      "assertion.aggregate.op",
      "assertion.kind + assertion.aggregate.op",
      "assertion.kind:aggregate~ratio-comparison + assertion.aggregate.op",
      "evidence.grainWitness#present",
      "field.additivity.kind",
      "field.additivity.semi-additive.nonAdditiveAlong#incidence",
      "field.temporality.kind",
      "field.transformation",
      "observation.null",
    ]);
  });

  it("names the assertion cluster's real excess: six member pairs of the very leaf it declares", () => {
    const two = live.witnesses.find((w) => w.witness === "assertion.kind:aggregate~ratio-comparison + assertion.aggregate.op")!;
    expect(two.declared).toEqual(["assertion.aggregate.op", "assertion.kind:aggregate~ratio-comparison"]);
    expect(two.collateral).toEqual([
      "assertion.aggregate.op:count~min",
      "assertion.aggregate.op:mean~count",
      "assertion.aggregate.op:mean~min",
      "assertion.aggregate.op:sum~count",
      "assertion.aggregate.op:sum~mean",
      "assertion.aggregate.op:sum~min",
    ]);
    expect(two.outside).toEqual([]);
    expect(two.standing).toBe("interaction-only");
  });

  it("leaves the remaining thirty-five atomic, so the correction is bounded", () => {
    expect(byVerdict("atomic").length).toBe(35);
    for (const w of byVerdict("atomic")) {
      expect(w.declared.length).toBe(1);
      expect(w.actual).toEqual(w.declared);
    }
  });

  it("reports standing without moving it: every audited witness still holds", () => {
    expect(live.witnesses.filter((w) => !w.holds)).toEqual([]);
  });
});
