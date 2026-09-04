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
import { loadDerivation, loadPlans } from "./census.js";
import { CONTRACTS_DIR } from "./emit-schemas.js";
import { claimedFootprints, computeReport, loadReport, measure, specimens } from "./erasure-audit.js";
import { loadCodomainAdjudications, loadOracle } from "./necessity.js";
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
      "field.temporality.kind:instant~interval -> field.temporality.kind",
      "relation.derivedBy.kind:bin~normalize -> relation.derivedBy.kind",
    ]);
    // The two incidence -> arity entries left this list when arity erasure
    // started truncating to the declared floor. They were supported only
    // vacuously — arity had no separating pair to falsify against — and the
    // floor-aware specimen synthesizer gave it one, so the empty implication
    // that carried them is gone.
  });

  it("and none of them is one the STRUCTURAL rules should have claimed", () => {
    // The invariant worth having, rather than an enumeration of why each entry
    // is here. `unclaimed` means "the specimens support this coarsening and the
    // structure does not imply it" — so the failure mode it guards against is a
    // GAP in the claim rules: an entry that containment already covers would
    // mean the rules missed something they were supposed to derive.
    //
    // The three reasons an honest entry appears, none of which is a gap:
    //   vacuous       — the target has no separating pair, so the implication
    //                   is empty rather than evidenced;
    //   two-member    — merging a two-member discriminator's only pair
    //                   partitions the slot exactly as forgetting its value
    //                   does, with no third member left to tell them apart
    //                   (`field.temporality.kind:instant~interval`);
    //   population    — the specimens happen to separate the leaf only where
    //                   the merged members differ (`relation.derivedBy.kind`
    //                   has seven members and this is true of the current set).
    //
    // The first two are structural facts about the schema, the third is a fact
    // about the corpus, and NONE is adopted: claiming any of them would mean
    // the footprint rules reading enum arity or specimen counts, and the census
    // is the single reader of the schema.
    const plans = loadPlans();
    for (const u of live.unclaimed) {
      const destroyer = plans.get(u.destroys)!;
      const supported = plans.get(u.supported)!;
      const alreadyImplied = claimedFootprints(plans).get(u.destroys)!.includes(u.supported);
      expect(alreadyImplied, `${u.destroys} -> ${u.supported} is claimed and unclaimed at once`).toBe(false);
      // A merge never totally suppresses its slot, so containment cannot apply.
      expect(destroyer.operation.kind, `${u.destroys} should not be a total suppression`).toBe("merge-enum-members");
      expect(supported.locator.path).toBe(destroyer.locator.path);
    }
    expect(live.unclaimed.length).toBeGreaterThan(0);
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

  it("THE TERMINAL INVARIANT: no erasure produces an illegal quotient image", () => {
    // The only one of the three counts in this block that is an invariant. It
    // is stated as zero rather than as a number that happens to be zero today,
    // because any non-zero value is a defect in the operations.
    expect(live.quotientLanguageInvalid).toEqual([]);
  });

  it("departures from the SOURCE language are expected, reported, and not a ceiling", () => {
    // Deliberately not pinned to a count. Departures move whenever specimens or
    // plans grow, and freezing the number here would make a growing corpus look
    // like a regression — the mistake the terminal invariant above exists to
    // avoid making twice. What must hold is that every departure is CLASSIFIED,
    // so none is silently unaccounted.
    expect(live.sourceLanguageDeparture.length).toBeGreaterThan(0);
    const plans = loadPlans();
    for (const d of live.sourceLanguageDeparture) {
      expect(plans.has(d.coordinate), `${d.coordinate} departs the source language with no plan to attribute it to`).toBe(true);
      expect(d.error.length).toBeGreaterThan(0);
    }
    // The generated artifact records the current number under a bound basis;
    // this test records only that the two questions give different answers,
    // which is the whole reason they were separated.
    expect(live.sourceLanguageDeparture.length).toBeGreaterThan(live.quotientLanguageInvalid.length);
  });

  it("holes a required leaf and deletes an optional one, which is why the invariant holds", () => {
    // The structural rule behind the zero above, asserted directly so that a
    // regression names its cause instead of surfacing as an anonymous count.
    const plans = loadPlans();
    const { requiredLeaves } = loadDerivation();
    const leaves = [...plans.values()].filter((p) => !p.id.includes(":") && !p.id.includes("#"));
    expect(leaves.length).toBeGreaterThan(20);
    for (const p of leaves) {
      const required = requiredLeaves.has(p.id);
      expect(p.operation.kind, p.id).toBe(required ? "forget-value" : "delete-slot");
    }
  });

  it("keeps the four high-reach cases visible, and records that their standing moved", () => {
    // These are the coordinates the repair was always going to cost something
    // on: each supported a holding witness under the old deletion. Two still do
    // (`field.transformation`, `relation.grain`); two do not, and are suspended
    // in `codomain-adjudications.json` rather than decided here.
    const ledgeredCoordinates = new Set(loadCodomainAdjudications().awaiting.flatMap((a) => a.declares));
    for (const id of ["field.transformation", "relation.grain"]) {
      const w = live.witnesses.find((x) => x.declared.includes(id));
      expect(w?.holds, `${id} lost its witness without being ledgered`).toBe(true);
    }
    for (const id of ["assertion.kind", "assertion.aggregate.op"]) {
      expect(ledgeredCoordinates.has(id), `${id} lost standing and is not named by any codomain adjudication`).toBe(true);
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
    // Its standing is now `none`, and that is the codomain result rather than a
    // regression: the witness rested on deletion destroying the `op` slot, and
    // a hole leaves the slot standing so the two sides no longer collide. What
    // the audit says about its FOOTPRINT is unchanged — the excess is still six
    // member pairs of the leaf it declares, still nothing outside. The standing
    // change is held in `codomain-adjudications.json`, not decided here.
    expect(two.standing).toBe("none");
    const ledgeredCoordinates = new Set(loadCodomainAdjudications().awaiting.flatMap((a) => a.declares));
    for (const id of two.declared) expect(ledgeredCoordinates.has(id), `${id} is named by a lapsed witness that no adjudication covers`).toBe(true);
  });

  it("leaves the remaining thirty-five atomic, so the correction is bounded", () => {
    expect(byVerdict("atomic").length).toBe(35);
    for (const w of byVerdict("atomic")) {
      expect(w.declared.length).toBe(1);
      expect(w.actual).toEqual(w.declared);
    }
  });

  it("reports standing without moving it: every witness that stopped holding is ledgered, and no other", () => {
    // The audit still moves no standing — it classifies. What changed is that
    // the OPERATIONS moved, and three witnesses stopped holding as a result.
    // The ratchet is stated as an equality so it bites both ways: a witness
    // cannot fail without appearing in the ledger, and a ledger entry cannot
    // outlive the failure that justified it.
    const notHolding = live.witnesses.filter((w) => !w.holds).map((w) => w.witness);
    const ledgered = loadCodomainAdjudications().awaiting.map((a) => a.witness);
    expect([...new Set(notHolding)].sort()).toEqual([...new Set(ledgered)].sort());
  });
});
