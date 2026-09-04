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
import { CONTRACTS_DIR } from "./emit-schemas.js";
import { claimedFootprints, computeReport, loadReport, measure, specimens } from "./erasure-audit.js";
import { loadOracle } from "./necessity.js";
import { forgotten, loadQuotientValidator } from "./quotient-image.js";

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

  it("is measured over the corpus, every authored stimulus, and synthesized separating pairs", () => {
    const s = specimens();
    expect(s.corpus).toBe(90);
    // Without the authored stimuli, a coordinate whose only evidence is a
    // patched pair reads as dead — the exact misreading this lane prevents.
    expect(s.stimuli).toBeGreaterThan(0);
    // Without the synthesized pairs, 79 of 140 erasures were untestable.
    expect(s.synthesized).toBeGreaterThan(80);
    expect(live.specimens.total).toBe(s.corpus + s.stimuli + s.synthesized);
  });
});

describe("structural claims survive falsification", () => {
  it("has no refuted claim: no specimen pair separates something a claimed destroyer keeps", () => {
    expect(live.refuted).toEqual([]);
  });

  it("reports supported-but-unclaimed coarsenings rather than adopting them", () => {
    expect(live.unclaimed.map((u) => `${u.destroys} -> ${u.supported}`).sort()).toEqual([
      "relation.derivedBy.kind:bin~normalize -> relation.derivedBy.kind",
      "relation.derivedBy.nest.levels#incidence -> relation.derivedBy.nest.levels#arity",
      "structure.peers[]#incidence -> structure.peers[]#arity",
    ]);
  });

  it("and every one is VACUOUS: its target has no separating pair at all", () => {
    // The distinction that makes the report readable. A coarsening "supported"
    // by a coordinate nothing separates rests on an empty implication, not on
    // evidence, so none of the three is a footprint the structural rules miss.
    // The one that WAS real — `structure.peers[]#present` coarsening
    // `structure.peers#present`, because deleting every element empties the
    // array and an emptied declaration is dropped — is now claimed, which is
    // why it no longer appears here. The falsification pass found it; the
    // structural rule was widened rather than the under-report left standing.
    const unbuilt = new Set(live.unbuilt.map((u) => u.coordinate));
    for (const u of live.unclaimed) expect(unbuilt.has(u.supported), `${u.supported} has a separating pair`).toBe(true);
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
    // Synthesis moved this a long way. Every one of the 140 erasures now acts
    // on some specimen — `dead` is empty where the corpus alone left 16 — and
    // 25 still identify no two distinct ones, where the corpus alone left 79.
    // Those 25 carry claimed footprints that are unfalsified, not confirmed.
    expect(live.dead).toEqual([]);
    expect(live.unseparated.length).toBe(25);
  });
});

describe("the two language questions, which used to be one", () => {
  it("every specimen is a legal image of itself, so the codomain contains the domain", () => {
    // The cheapest possible falsifier for the relaxation transform, and it has
    // to hold before any count below means anything: if the quotient language
    // did not admit an unerased fixture, every other number here would be
    // measuring the schema rather than the erasures.
    const validate = loadQuotientValidator(CONTRACTS_DIR);
    const rejected = specimens().fixtures.filter((f) => validate(f).length > 0);
    expect(rejected.map((f) => f.id)).toEqual([]);
  });

  it("admits a marker where the source language requires a value", () => {
    const validate = loadQuotientValidator(CONTRACTS_DIR);
    const source = loadOracle().validate;
    const base = specimens().fixtures[0];
    const holed = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
    (holed.assertions as Record<string, unknown>[])[0].kind = forgotten(["assertion.kind"]);
    // Departs the source language — and is a perfectly good quotient image.
    expect(source(holed).length).toBeGreaterThan(0);
    expect(validate(holed)).toEqual([]);
  });

  it("still refuses an image that is not a legal hole: a deleted required leaf leaves nothing behind", () => {
    // `required` is deliberately NOT relaxed. The relaxation admits a marker
    // where a value was; it does not admit the absence of both.
    const validate = loadQuotientValidator(CONTRACTS_DIR);
    const base = specimens().fixtures[0];
    const gutted = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
    delete (gutted.assertions as Record<string, unknown>[])[0].kind;
    expect(validate(gutted).join("; ")).toMatch(/required property 'kind'/);
  });

  it("refuses a fake marker, because the tag is checked as a value and not as a key", () => {
    const validate = loadQuotientValidator(CONTRACTS_DIR);
    const base = specimens().fixtures[0];
    const bad = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
    (bad.assertions as Record<string, unknown>[])[0].kind = { "@q": "forgotten", by: ["x"], smuggled: 1 };
    expect(validate(bad).length).toBeGreaterThan(0);
  });

  it("reports 34 erasures leaving the source language and, TODAY, all 34 illegal as images", () => {
    // The measurement the codomain was introduced to make, and it does not say
    // what the split was expected to say. None of the 34 is a benign departure:
    // every one is also an illegal IMAGE, so all 34 are defects of the
    // operations rather than shapes to be tolerated. The next commit drives the
    // second count to 0; the first is expected to stay non-zero forever.
    expect(live.sourceLanguageDeparture.length).toBe(34);
    expect(live.quotientLanguageInvalid.length).toBe(34);
    const benign = live.sourceLanguageDeparture.filter((d) => !live.quotientLanguageInvalid.some((i) => i.coordinate === d.coordinate));
    expect(benign).toEqual([]);
  });

  it("separates three defect classes by OPERATION, each needing a different repair", () => {
    // Classified by the operation, never by the validator's error string: ajv
    // reports the first failing branch, so truncating `nest.levels` surfaces as
    // a missing `toGrain` and would be filed under the wrong repair.
    const plans = loadPlans();
    const byOp = new Map<string, string[]>();
    for (const i of live.quotientLanguageInvalid) {
      const op = plans.get(i.coordinate)?.operation.kind ?? "(no plan)";
      byOp.set(op, [...(byOp.get(op) ?? []), i.coordinate].sort());
    }
    expect([...byOp].map(([op, ids]) => `${op}: ${ids.length}`).sort()).toEqual([
      "delete-slot: 8",
      "forget-reference-arity: 2",
      "merge-enum-members: 24",
    ]);

    // A branch tag written over another branch's payload: `{kind:"aggregate-to-grain",
    // levels:[…]}` claims to be an aggregation while carrying a nesting. That is
    // not forgetting the distinction, it is asserting something false about it.
    // The repair is a member CLASS, which identifies the two without claiming
    // either of them.
    expect(byOp.get("merge-enum-members")).toContain("relation.derivedBy.kind:aggregate-to-grain~nest");

    // A required leaf deleted with no hole left behind. The repair is a typed
    // forgotten value — NOT deleting the enclosing declaration, which would
    // forget the relation, the field, every other assertion parameter, and turn
    // the present `subsumes-refinements` result into real sibling over-erasure.
    expect(byOp.get("delete-slot")).toEqual([
      "assertion.aggregate.op",
      "assertion.kind",
      "field.additivity.kind",
      "field.temporality.kind",
      "field.transformation",
      "relation.derivedBy.join.cardinality",
      "relation.derivedBy.kind",
      "relation.grain",
    ]);

    // Arity truncated below the representation's own floor: a peer group needs
    // two members and `slice(0, 1)` leaves one. `slice` to the floor instead is
    // also strictly LESS erasing — truncating a 2-list to 1 identifies [a,b]
    // with [a,c], which differ in incidence and not in arity at all.
    expect(byOp.get("forget-reference-arity")).toEqual(["relation.derivedBy.nest.levels#arity", "structure.peers[]#arity"]);
  });

  it("keeps each of the four high-reach cases attached to the witness it would move", () => {
    // Recorded so that the cost of the repair stays visible: these are not
    // orphaned erasures, they are the evidence four holding witnesses rest on.
    const worst = live.quotientLanguageInvalid.filter((i) => i.specimens > 100).map((i) => i.coordinate).sort();
    expect(worst).toEqual(["assertion.aggregate.op", "assertion.kind", "field.transformation", "relation.grain"]);
    for (const id of worst) {
      const w = live.witnesses.find((x) => x.declared.includes(id));
      expect(w?.holds, `${id} has no holding witness`).toBe(true);
    }
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
