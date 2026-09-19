/**
 * Semantic erasure closure (REL-VIEW-ALGEBRA-01).
 *
 * Two claims are under test, and they are different claims:
 *
 * - The proof form WORKS: each of the eight obligations can be discharged, and
 *   — the half that matters — each can FAIL, on a stimulus pair built to make
 *   it fail. An obligation nothing can refute pins nothing.
 * - The proof form CONFERS NOTHING. Adopting a dependency-aware witness form
 *   must not widen what ratifies a coordinate. No closure carrier reaches
 *   `primitiveRatified`, no verdict moves, and the <=2-coordinate bound on
 *   `witnesses.json` is untouched.
 *
 * The falsifier closures below cite "probe only" as their cause on purpose:
 * they are tests OF THE CHECKER, not candidate witnesses, and obligation 3 is
 * expected to reject them for exactly that reason.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadBranchSignatures, loadCensus, loadLocators, loadPlans } from "./census.js";
import type { Oracle, Witness } from "./necessity.js";
import type { Fixture } from "./structure.js";
import {
  authorityDrift,
  checkClosure,
  checkClosures,
  CLOSURES_FILE,
  closureCycles,
  liveAuthority,
  restampClosures,
  closureGate,
  compatibleControls,
  deriveNormalization,
  footprintOf,
  forgetHolderOf,
  groundedVocabulary,
  holderLocatorOf,
  loadClosures,
  loadStanding,
  parseCarrier,
  type BranchNormalization,
  type SemanticErasureClosure,
  type Standing,
  type StandingIndex,
} from "./closure.js";
import { executeAll, executePlan, wouldChange } from "./erasure-plan.js";
import { specimens } from "./erasure-audit.js";
import { findingId, loadReceipts } from "./stimulus.js";
import type { StimulusPrediction } from "./stimulus.js";
import { checkWitness, classifyWitness, loadCodomainAdjudications, loadOracle, loadWitnesses, primitiveRatified } from "./necessity.js";
import { canonical } from "./quotient.js";
import { basesForSpec, loadSubtraction } from "./subtraction.js";

const census = loadCensus();
const oracle = loadOracle();
const signatures = loadBranchSignatures();
const standing = loadStanding("REL-VIEW-ALGEBRA-01", oracle, census);
const ledger = loadClosures();

const CONTROL = "relation.derivedBy.kind:bin~normalize";
const AGG_PROJECT = "relation.derivedBy.kind:aggregate-to-grain~project";

/** The stimulus pair from the exercised closure, for reuse under other carriers. */
const AGG_PROJECT_SIDES = {
  a: { fixture: "FX_PROJECT_DROPS_NEST_LEVEL" },
  b: {
    base: "FX_PROJECT_DROPS_NEST_LEVEL",
    patch: [{ set: "structure.relations.flat.derivedBy", value: { kind: "aggregate-to-grain", from: "hierarchy", toGrain: ["sale_id"] } }],
    outcome: { status: "illegal" as const, codes: ["REL_GRAIN_SUBTOTAL_MISMATCH"], terms: [] },
    cause: "probe only",
  },
};

const closureOf = (over: Partial<SemanticErasureClosure> & { carrier: string }): SemanticErasureClosure => {
  const d = deriveNormalization(over.carrier, signatures);
  return {
    normalization: "error" in d ? [] : d.normalization,
    control: { coordinate: CONTROL },
    dependencies: "error" in d ? [] : d.footprint,
    minRawEdit: "error" in d ? 0 : d.minRawEdit,
    promotion: "provisional",
    ...over,
  };
};

/** A branch-field operation with its footprint taken from the live locators. */
const op = (holder: string, branch: string, field: string): BranchNormalization => ({
  holder,
  branch,
  field,
  operation: "forget-branch-field",
  footprint: footprintOf(`${holder}.${branch}.${field}`),
});

const DERIVATION = (c: { carrier: string }) => c.carrier.startsWith("relation.derivedBy.kind:");

const check = (c: SemanticErasureClosure, index: StandingIndex = standing) => checkClosure(c, census, oracle, index, ledger.closures, signatures);
const obligation = (c: SemanticErasureClosure, prefix: string, index?: StandingIndex) =>
  check(c, index).obligations.find((o) => o.id.startsWith(prefix))!;

describe("the committed closure ledger", () => {
  it("is consistent with what the obligations actually yield", () => {
    const r = checkClosures();
    expect(r.problems).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("covers exactly the derivation pairs that need normalization, and not the control", () => {
    const pairs = census.filter((c) => c.kind === "member-pair" && c.leaf === "relation.derivedBy.kind").map((c) => c.id);
    expect(pairs).toHaveLength(21);
    expect(ledger.closures.filter(DERIVATION)).toHaveLength(20);
    expect(ledger.closures.map((c) => c.carrier)).not.toContain(CONTROL);
    // The control is the one pair whose branches require the same payload, so
    // it needs no normalization and a single-coordinate witness already holds.
    const d = deriveNormalization(CONTROL, signatures);
    expect("error" in d ? [] : d.normalization).toEqual([]);
    expect(primitiveRatified(loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok))).toContain(CONTROL);
  });

  it("records every carrier as provisional, so none has been promoted", () => {
    // 22: the twenty derivation pairs plus the two additivity hygiene
    // witnesses, migrated here when the required-child presence rule removed the
    // coordinate they named.
    expect(ledger.closures).toHaveLength(22);
    expect(ledger.closures.map((c) => c.promotion)).toEqual(Array(22).fill("provisional"));
    expect(checkClosures().checks.map((c) => c.promotion)).toEqual(Array(22).fill("provisional"));
  });

  it("reports what the operations DESTROY, not the handles that implement them", () => {
    // The handle model said nine coordinates. Forgetting `toGrain` costs three —
    // the reference's arity, order and incidence go with it — and forgetting
    // `join.cardinality` costs seven, since every cardinality member pair is
    // inside the field. Naming the dependency after the eraser under-reported it
    // by more than half, and obligation 8 could have gone green over the gap.
    // `project.keep` costs two rather than three: its order facet left the kernel
    // when the declaration was made to say `keep` is a set.
    const r = checkClosures();
    const derivation = r.dependencies.filter((d) => d.coordinate.startsWith("relation.derivedBy."));
    expect(derivation).toHaveLength(20);
    expect(r.dependencies.length).toBeGreaterThan(20);
    // Every one is a topology facet or a member pair — never a presence facet,
    // because those were the derived conjunctions the census no longer emits.
    expect(derivation.filter((d) => d.coordinate.endsWith("#present"))).toEqual([]);
    const cardinality = derivation.filter((d) => d.coordinate.startsWith("relation.derivedBy.join.cardinality"));
    expect(cardinality).toHaveLength(7);
    // Standing here tracks the SUBTRACTION's verdicts and nothing else: the cardinality leaf is
    // settled because REL-OPERATOR-LEAF-FACTORING-01 retained it as required derived vocabulary,
    // and the rest are unresolved. Neither primitive is primitive FOR being in a closure -- which
    // is the standing the closure form is forbidden to confer.
    expect(derivation.filter((d) => d.standing.state !== "unresolved").map((d) => d.coordinate)).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.join.cardinality",
      "relation.derivedBy.join.cardinality:one-to-many~many-to-many",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
    ]);
    // And two ARE primitive, each because a single-coordinate witness ratifies it:
    // REL-TOPOLOGY-AUTHORED-STIMULUS-01 witnessed the nest-levels ORDER and this slice witnessed the
    // aggregate TARGET-GRAIN order, so the closures whose footprints contain either now carry the
    // composite diagnosis rather than an outstanding one. That reading is obligation 8's, and
    // asserting it here keeps it visible.
    expect(derivation.filter((d) => d.standing.state === "primitive").map((d) => d.coordinate)).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.join.cardinality:one-to-many~many-to-many",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
    ]);
  });

  it("has no dependency cycle, so no carrier's normalization depends back on it", () => {
    expect(checkClosures().cycles).toEqual([]);
  });

  it("records the measured minimum raw edit, which is 3, 4 or 5 for the twenty", () => {
    // Scoped to the derivation family: the additivity closures have UNILATERAL
    // residue and sit at 2, which is exactly why they fitted the <=2-coordinate
    // bound and the derivation pairs never could.
    const edits = ledger.closures.filter(DERIVATION).map((c) => c.minRawEdit).sort();
    expect(edits[0]).toBe(3);
    expect(edits[edits.length - 1]).toBe(5);
    expect(ledger.closures.find((c) => c.carrier === "relation.derivedBy.kind:join~graph")!.minRawEdit).toBe(5);
    expect(ledger.closures.filter((c) => !DERIVATION(c)).map((c) => c.minRawEdit)).toEqual([2, 2]);
  });
});

describe("adopting the closure form confers no standing", () => {
  it("leaves every closure carrier out of the primitively ratified set", () => {
    const holding = loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok);
    const primitive = primitiveRatified(holding);
    for (const c of ledger.closures) expect(primitive.has(c.carrier), `${c.carrier} must not be ratified by a closure`).toBe(false);
  });

  it("no coordinate gains standing by appearing in a closure: standing tracks the subtraction's verdicts and nothing else", () => {
    // The derivation footprints are unresolved except one. That one is settled by the SUBTRACTION
    // (`relation.derivedBy.join.cardinality`, retained as required derived vocabulary by
    // REL-OPERATOR-LEAF-FACTORING-01), not by the closure that depends on it -- which is what this
    // asserts: standing agrees with the basis verdicts for every dependency, and none is primitive.
    // The additivity footprint is the other kind of decided: `nonAdditiveAlong#incidence` is
    // PRIMITIVELY ratified, which is the fact the handle model hid -- under the handle the
    // dependency looked merely unadjudicated, and obligation 8 would have read as "not yet"
    // rather than as the composite-constructor finding it actually is.
    const recorded = new Map<string, string>();
    for (const { ledger: l } of basesForSpec("REL-VIEW-ALGEBRA-01")) {
      for (const id of l.basis.candidates) recorded.set(id, l.verdicts[id]?.disposition ?? "unresolved");
    }
    const holdingWitnesses = loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok);
    const r = checkClosures();
    for (const { coordinate, standing: s } of r.dependencies.filter((d) => d.coordinate.startsWith("relation.derivedBy."))) {
      const verdict = recorded.get(coordinate) ?? "unresolved";
      // Standing tracks the WITNESSES and the BASIS VERDICTS, in that order, and never the
      // closure: a holding single-coordinate witness ratifies, a recorded verdict resolves, and
      // nothing else reaches this index.
      if (primitiveRatified(holdingWitnesses).has(coordinate)) expect(s.state, `${coordinate} must read its witness, not the closure`).toBe("primitive");
      else if (verdict === "unresolved") expect(s.state, `${coordinate} must not gain standing by appearing in a closure`).toBe("unresolved");
      else expect(s, `${coordinate} must read its own basis verdict, not the closure`).toEqual({ state: "resolved", disposition: verdict });
    }
    const primitiveDeps = r.dependencies.filter((d) => d.standing.state === "primitive");
    // Six now, all for the same reason: a holding single-coordinate witness ratifies them.
    expect(primitiveDeps.map((d) => d.coordinate)).toEqual([
      "field.additivity.semi-additive.nonAdditiveAlong#arity",
      "field.additivity.semi-additive.nonAdditiveAlong#incidence",
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.join.cardinality:one-to-many~many-to-many",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
    ]);
    const affected = r.checks.filter((c) => c.obligations.find((o) => o.id.startsWith("8-"))!.detail.includes("PRIMITIVE"));
    // Nineteen, not two. The two additivity closures were already there; witnessing the nest-levels
    // ORDER put it in six more footprints; witnessing the aggregate TARGET-GRAIN order puts it in
    // all six `aggregate-to-grain~X` footprints, five of which the ORDER facet does not reach; and
    // witnessing the normalize FIELD incidence puts it in the two `normalize~X` footprints, which
    // no earlier filing reached. Those closures carry obligation 8's composite diagnosis rather
    // than an outstanding one.
    expect(affected.map((c) => c.carrier).sort()).toEqual([
      "field.additivity.kind:additive~semi-additive",
      "field.additivity.kind:semi-additive~ratio-measure",
      "relation.derivedBy.kind:aggregate-to-grain~bin",
      "relation.derivedBy.kind:aggregate-to-grain~graph",
      "relation.derivedBy.kind:aggregate-to-grain~join",
      "relation.derivedBy.kind:aggregate-to-grain~nest",
      "relation.derivedBy.kind:aggregate-to-grain~normalize",
      "relation.derivedBy.kind:aggregate-to-grain~project",
      "relation.derivedBy.kind:join~bin",
      "relation.derivedBy.kind:join~graph",
      "relation.derivedBy.kind:join~nest",
      "relation.derivedBy.kind:join~normalize",
      "relation.derivedBy.kind:join~project",
      "relation.derivedBy.kind:nest~bin",
      "relation.derivedBy.kind:nest~graph",
      "relation.derivedBy.kind:nest~normalize",
      "relation.derivedBy.kind:nest~project",
      "relation.derivedBy.kind:normalize~graph",
      "relation.derivedBy.kind:normalize~project",
    ]);
    for (const c of affected) expect(c.rereadIf).toContain("COMPOSITE CONSTRUCTOR");
  });

  it("refuses a carrier already ratified while its closure is not holding", () => {
    // The guard exists so a closure cannot be recorded as merely provisional
    // for a coordinate the witness file has already ratified — two authorities
    // disagreeing about the same coordinate, with the weaker one silent.
    const r = checkClosures();
    const primitive = primitiveRatified(loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok));
    expect(r.checks.filter((c) => c.promotion !== "holding" && primitive.has(c.carrier))).toEqual([]);
  });
});

describe("the closure form agrees with the 2-set witnesses it was tested against", () => {
  // The adjudication policy licensed closure only once it was "formalized and
  // tested against the existing 2-set witnesses". Two authorities that describe
  // one witness differently is worse than either being wrong, so the derived
  // normalization set must reproduce the residue `classifyWitness` observed.
  //
  // THE POPULATION MOVED AND THE CLAIM DID NOT. Both 2-set witnesses stopped
  // holding when the quotient gained a codomain — the branch residue a hole
  // leaves is observable where a deletion destroyed it — so scoping this block
  // to HOLDING witnesses would now scope it to the empty set, and every
  // assertion in it would pass by having nothing to range over. That is the one
  // outcome a test may not have.
  //
  // So it ranges over the 2-sets the codomain ledger names instead. Nothing is
  // weakened by the move: `classifyWitness` reads a witness's coordinate set
  // and its erasure, never its standing, and the classifications below are
  // byte-identical to the ones recorded while both witnesses held. What their
  // suspension changes is what they SUPPORT, which is adjudicated in
  // `codomain-adjudications.json` and is not this block's question.
  const witnesses = loadWitnesses().witnesses;
  const single = primitiveRatified(witnesses.filter((w) => checkWitness(w, census, oracle).ok));
  const ledgered = new Set(loadCodomainAdjudications().awaiting.map((a) => a.witness));
  const multi = witnesses.filter((w) => w.coordinates.length > 1);

  it("ranges over a non-empty set, every member of which is ledgered rather than silently gone", () => {
    // Stated first, because it is what stops the rest of the block from being
    // vacuous. If a 2-set disappears from `witnesses.json` this fails; if one
    // stops holding without an adjudication, the necessity harness fails.
    expect(multi).toHaveLength(2);
    for (const w of multi) {
      expect(checkWitness(w, census, oracle).ok, `${w.coordinates.join(" + ")} holds again`).toBe(false);
      expect(ledgered.has(w.coordinates.join(" + ")), `${w.coordinates.join(" + ")} stopped holding unledgered`).toBe(true);
    }
  });

  it("the residue of the one classified witness left equals the operation's footprint", () => {
    const classified = multi.map((w) => classifyWitness(w, census, oracle, single)).filter((k) => k.carrier !== undefined);
    expect(classified.map((k) => k.klass)).toEqual(["indeterminate"]);
    for (const k of classified) {
      const d = deriveNormalization(k.carrier!, signatures);
      expect("error" in d).toBe(false);
      if ("error" in d) continue;
      // The witness names one coordinate; the operation that implements the
      // same erasure destroys seven. Erasing the `assertion.aggregate.op` LEAF
      // deletes the key, and every member pair under it goes with it.
      expect(k.residue).toEqual(["assertion.aggregate.op"]);
      expect(d.normalization.map((n) => `${n.branch}.${n.field}`)).toEqual(["aggregate.op"]);
      expect(d.footprint).toHaveLength(7);
      expect(d.footprint).toContain("assertion.aggregate.op");
      expect(d.footprint.filter((f) => f.includes("~"))).toHaveLength(6);
      // So the under-approximation the footprint model fixes is NOT confined to
      // closures: this witness lives in witnesses.json and its recorded
      // coordinate set understates what its own erasure destroys by six. It is
      // recorded here rather than repaired, because changing what a holding
      // witness supports is a standing question, not a bookkeeping one.
      expect(d.footprint.length).toBeGreaterThan(k.residue!.length);
    }
  });

  it("the two hygiene witnesses are gone from witnesses.json and present as closures", () => {
    // The two that remain in `witnesses.json` are the assertion 2-sets, and
    // they classify exactly as they did while holding — which is the point:
    // the hygiene pair MIGRATED to the closure ledger, it did not lapse.
    expect(multi.map((w) => classifyWitness(w, census, oracle, single).klass).sort()).toEqual(["indeterminate", "interaction"]);
    const migrated = ledger.closures.filter((c) => c.carrier.startsWith("field.additivity.kind:"));
    expect(migrated).toHaveLength(2);
    for (const c of migrated) {
      expect(c.a).toBeDefined();
      expect(c.normalization.map((n) => n.field)).toEqual(["nonAdditiveAlong"]);
    }
  });

  it("agrees that both unilateral-residue pairs fit inside the <=2-coordinate bound", () => {
    // The additivity witnesses were expressible as plain 2-sets because only
    // one branch carried payload. That is the same measurement the twenty
    // derivation pairs fail, and it is why they needed a new proof form rather
    // than a bespoke search.
    for (const carrier of ["field.additivity.kind:additive~semi-additive", "field.additivity.kind:semi-additive~ratio-measure"]) {
      const d = deriveNormalization(carrier, signatures);
      expect("error" in d).toBe(false);
      if ("error" in d) continue;
      expect(d.minRawEdit).toBe(2);
      expect(d.bilateral).toBe(false);
    }
  });
});

describe("obligation 1 — a single semantic carrier", () => {
  it("holds for a discriminator member pair", () => {
    expect(obligation(closureOf({ carrier: AGG_PROJECT }), "1-").held).toBe(true);
  });

  it("rejects a coordinate that is not a discriminator member pair", () => {
    const r = check(closureOf({ carrier: "relation.derivedBy.project.keep#present" }));
    expect(r.obligations[0].held).toBe(false);
    expect(r.ok).toBe(false);
    expect(r.promotion).toBe("refuted");
  });

  it("rejects a member pair on an enum leaf that tags nothing", () => {
    // `join.cardinality` is an enum with member pairs, but it is not a `.kind`
    // leaf and tags no branch, so nothing about it is branch-conditional.
    const r = check(closureOf({ carrier: "relation.derivedBy.join.cardinality:one-to-one~one-to-many" }));
    expect(r.obligations[0].held).toBe(false);
    expect(r.problems.join(" ")).toContain("obligation 1 failed");
  });

  it("rejects a `.kind` leaf that is tagged but is not a discriminated union", () => {
    // `field.temporality.kind` is the shape that gets furthest while still
    // being wrong: it looks like a discriminator, so obligation 1 admits it,
    // and only the branch-signature lookup can tell that it indexes no
    // conditional payload at all. There is nothing for a closure to normalize.
    expect(loadBranchSignatures().has("field.temporality.kind")).toBe(false);
    const carrier = census.find((c) => c.kind === "member-pair" && c.leaf === "field.temporality.kind")!.id;
    const r = check(closureOf({ carrier }));
    expect(r.obligations[0].held).toBe(true);
    expect(r.problems.join(" ")).toContain("is not a discriminated union in the schema");
    expect(r.ok).toBe(false);
  });
});

describe("obligation 2 — the normalization set is derived, not chosen", () => {
  it("derives the symmetric difference of the two branch payload signatures", () => {
    const d = deriveNormalization(AGG_PROJECT, signatures);
    expect("error" in d).toBe(false);
    if ("error" in d) return;
    expect(d.residue).toEqual({ "aggregate-to-grain": ["toGrain"], project: ["keep"] });
    expect(d.normalization.map((n) => `${n.branch}.${n.field}`)).toEqual(["aggregate-to-grain.toGrain", "project.keep"]);
    expect(d.minRawEdit).toBe(3);
    expect(d.bilateral).toBe(true);
  });

  it("the footprint is what the operation destroys, which is more than the edit count", () => {
    // minRawEdit counts EDITS; the footprint counts semantic coordinates. Two
    // edits, five coordinates: the topology of both references goes with them —
    // and `keep` contributes two, not three, because a declared set carries no
    // order facet to destroy.
    const d = deriveNormalization(AGG_PROJECT, signatures);
    if ("error" in d) throw new Error(d.error);
    expect(d.minRawEdit).toBe(3);
    expect(d.footprint).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#arity",
      "relation.derivedBy.aggregate-to-grain.toGrain#incidence",
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.project.keep#arity",
      "relation.derivedBy.project.keep#incidence",
    ]);
  });

  it("forgetting an enum field forgets every member pair inside it", () => {
    // The largest gap the handle model hid: `join.cardinality` is a plain enum
    // leaf, and deleting it forgets all six cardinality distinctions, not a
    // bare leaf.
    const d = deriveNormalization("relation.derivedBy.kind:join~project", signatures);
    if ("error" in d) throw new Error(d.error);
    const cardinality = d.footprint.filter((f) => f.startsWith("relation.derivedBy.join.cardinality"));
    expect(cardinality).toHaveLength(7);
    expect(cardinality.filter((f) => f.includes("~"))).toHaveLength(6);
    expect(census.map((c) => c.id)).not.toContain("relation.derivedBy.join.cardinality#present");
  });

  it("rejects an authored set narrower than the derived one", () => {
    const c = closureOf({ carrier: AGG_PROJECT, normalization: [op("relation.derivedBy", "project", "keep")] });
    expect(obligation(c, "2-").held).toBe(false);
    expect(check(c).ok).toBe(false);
  });

  it("rejects an authored set wider than the derived one", () => {
    const c = closureOf({
      carrier: AGG_PROJECT,
      normalization: [
        op("relation.derivedBy", "aggregate-to-grain", "toGrain"),
        op("relation.derivedBy", "project", "keep"),
        op("relation.derivedBy", "nest", "levels"),
      ],
    });
    expect(obligation(c, "2-").held).toBe(false);
  });

  it("rejects an UNDER-REPORTED footprint even when the operations are right", () => {
    // The defect this model exists to close: the operations can be exactly
    // derived while the record understates what they destroy, and obligation 8
    // would then reason over a set that is too small.
    const full = op("relation.derivedBy", "aggregate-to-grain", "toGrain");
    const c = closureOf({
      carrier: AGG_PROJECT,
      normalization: [{ ...full, footprint: full.footprint.slice(0, 1) }, op("relation.derivedBy", "project", "keep")],
    });
    expect(obligation(c, "2-").held).toBe(false);
    expect(check(c).ok).toBe(false);
  });

  it("rejects a minRawEdit that does not match the derived residue", () => {
    expect(obligation(closureOf({ carrier: AGG_PROJECT, minRawEdit: 2 }), "2-").held).toBe(false);
  });

  it("refuses a closure whose derived normalization set is empty", () => {
    // Nothing to normalize means it is a single-coordinate witness in the wrong
    // record type; admitting it would let a plain witness claim the licence.
    const r = check(closureOf({ carrier: CONTROL }));
    expect(r.problems.join(" ")).toContain("EMPTY normalization set");
    expect(r.ok).toBe(false);
  });
});

describe("obligation 3 — controlled stimuli", () => {
  it("holds when the stimuli differ only in the discriminated holder and cite grounded authority", () => {
    const live = ledger.closures.find((c) => c.carrier === AGG_PROJECT)!;
    expect(live.a).toBeDefined();
    expect(obligation(live, "3-").held).toBe(true);
  });

  it("rejects a hand adjudication citing nothing the frozen oracle grounds", () => {
    const c = closureOf({ carrier: AGG_PROJECT, ...AGG_PROJECT_SIDES });
    const o = obligation(c, "3-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("cite no corpus case");
  });

  it("names a real vocabulary, so the citation check is not vacuous", () => {
    const v = groundedVocabulary(oracle);
    expect(v.has("CASE_NESTED_SUBTOTALS_OFF_GRAIN")).toBe(true);
    expect(v.has("REL_GRAIN_SUBTOTAL_MISMATCH")).toBe(true);
    expect(v.has("probe only")).toBe(false);
  });

  it("rejects stimuli that differ outside the discriminated holder", () => {
    const c = closureOf({
      carrier: AGG_PROJECT,
      a: { fixture: "FX_PROJECT_DROPS_NEST_LEVEL" },
      b: { fixture: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY" },
    });
    const o = obligation(c, "3-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("differ somewhere other than relation.derivedBy");
  });

  it("rejects stimuli whose required outcomes are the same", () => {
    const c = closureOf({
      carrier: AGG_PROJECT,
      a: { fixture: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY" },
      b: {
        base: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY",
        patch: [{ set: "structure.relations.subtotals.derivedBy.toGrain", value: ["country"] }],
        outcome: { status: "illegal", codes: ["REL_GRAIN_SUBTOTAL_MISMATCH"], terms: [] },
        cause: "CASE_NESTED_SUBTOTALS_OFF_GRAIN — deliberately the same outcome as side a",
      },
    });
    const o = obligation(c, "3-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("both stimuli require");
  });
});

describe("obligation 3 — the holder instrument is located from the discriminator leaf, not from a presence coordinate", () => {
  const locators = loadLocators();
  const ASSERTION = "assertion.kind:aggregate~ratio-comparison";

  /**
   * The exercised stimulus pair: the recorded illegal ratio reading of an interval
   * field, against the same declaration asserting that field's mean, which an
   * interval scale supports. The two differ inside the one assertion and nowhere else.
   */
  const ASSERTION_SIDES = {
    a: { fixture: "FX_TEMP_RATIO_COMPARISON" },
    b: {
      base: "FX_TEMP_RATIO_COMPARISON",
      patch: [{ set: "assertions.0", value: { kind: "aggregate", relation: "readings", field: "temp", op: "mean" } }],
      outcome: { status: "admissible" as const, codes: [] as string[], terms: [] as string[] },
      cause: "CASE_TEMPERATURE_LENGTH_FROM_ZERO forbids reading an interval field as a ratio; the mean of the same field is interval-meaningful",
    },
  };

  const assertionClosure = () => closureOf({ carrier: ASSERTION, ...ASSERTION_SIDES });

  it("agrees with the census wherever the census locates the holder, over every discriminated union", () => {
    const checked: string[] = [];
    for (const leaf of signatures.keys()) {
      const holder = leaf.replace(/\.[^.]+$/, "");
      const fromCensus = locators.get(holder);
      if (!fromCensus) continue;
      expect(holderLocatorOf(leaf, locators).steps).toEqual(fromCensus.steps);
      checked.push(holder);
    }
    // Not vacuous: both object holders whose closures carry stimuli are among the agreements.
    expect(checked).toEqual(expect.arrayContaining(["relation.derivedBy", "field.additivity"]));
  });

  it("locates a positional holder the census emits no presence coordinate for", () => {
    expect(locators.has("assertion")).toBe(false);
    expect(holderLocatorOf("assertion.kind", locators)).toEqual({
      path: "assertion",
      steps: [{ kind: "prop", name: "assertions" }, { kind: "elements" }],
    });
  });

  it("confers nothing: no assertion holder coordinate or registered plan exists because the instrument needed one", () => {
    expect(census.some((c) => c.leaf === "assertion" || c.id === "assertion#present")).toBe(false);
    expect(loadPlans().has("forget(assertion)")).toBe(false);
    // The instrument's id is spelled like a plan id and is deliberately not a registry key.
    expect(forgetHolderOf("assertion.kind", locators).id).toBe("forget(assertion)");
  });

  it("holes a positional holder and deletes an optional one, so the image stays expressible either way", () => {
    // A required element is holed like a required leaf; an optional declaration is deleted like an optional one.
    expect(forgetHolderOf("assertion.kind", locators).operation).toEqual({ kind: "forget-value" });
    expect(forgetHolderOf("relation.derivedBy.kind", locators).operation).toEqual({ kind: "delete-holder" });
    const before = oracle.fixtures.get("FX_TEMP_RATIO_COMPARISON")!;
    const image = executeAll(before, [forgetHolderOf("assertion.kind", locators)]);
    const after = (image as unknown as { assertions: unknown[] }).assertions;
    // Arity survives; nothing inside the element does; and the canonical form accepts the image.
    expect(after).toHaveLength(before.assertions.length);
    expect(after.every((a) => typeof a === "object" && a !== null && !("kind" in (a as object)))).toBe(true);
    expect(() => canonical(image)).not.toThrow();
  });

  it("refuses a leaf that selects no holder, and a census locator that disagrees with the derived one", () => {
    const fake = new Map(locators);
    fake.set("x.kind", { path: "x.kind", steps: [{ kind: "prop", name: "xs" }, { kind: "elements" }] });
    expect(() => holderLocatorOf("x.kind", fake)).toThrow("selects no holder to forget");
    fake.set("y.kind", { path: "y.kind", steps: [{ kind: "prop", name: "y" }, { kind: "prop", name: "kind" }] });
    fake.set("y", { path: "y", steps: [{ kind: "prop", name: "elsewhere" }] });
    expect(() => holderLocatorOf("y.kind", fake)).toThrow("the census locates y at");
  });

  it("evaluates every obligation for an assertion-branch carrier instead of throwing, and obligation 3 can hold", () => {
    const r = check(assertionClosure());
    expect(r.obligations.map((o) => o.id.split("-")[0])).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    const o = r.obligations.find((x) => x.id.startsWith("3-"))!;
    expect(o.unevaluable).toBeUndefined();
    expect(o.held).toBe(true);
    expect(o.detail).toContain("identical outside assertion");
    expect(r.problems.filter((p) => p.includes("schema-invalid"))).toEqual([]);
  });

  it("leaves the assertion residue blocked by the FORM, not by a tooling limit: 1-6 hold, 7 cannot be satisfied by construction, 8 fails on a primitive footprint", () => {
    // The recorded state of this carrier, measured rather than argued. `codomain-adjudications.json`
    // used to carry a checker limit here -- that obligation 3 could not be evaluated for an assertion
    // holder -- and that limit is gone; what remains is a property of the proof form and a property
    // of the encoding. Pinned so neither can quietly become a repair again.
    const r = check(assertionClosure());
    // Every obligation up to the two that cannot be discharged.
    for (const id of ["1", "2", "3", "4", "5", "6"]) {
      expect(r.obligations.find((o) => o.id.startsWith(`${id}-`))!.held, `obligation ${id}`).toBe(true);
    }
    // 7 is not false, it is UNSATISFIABLE: assertion.kind has two members, so its only member
    // pair is this carrier and no payload-compatible sibling exists to serve as the control.
    expect(r.classification).toBe("indeterminate");
    const seven = r.obligations.find((o) => o.id.startsWith("7-"))!;
    expect(seven.held).toBe(false);
    expect(seven.detail).toContain("no sibling pair on assertion.kind has a compatible branch payload signature");
    // 8 fails on the ENCODING: constructor and payload are both primitive under it.
    const eight = r.obligations.find((o) => o.id.startsWith("8-"))!;
    expect(eight.held).toBe(false);
    expect(eight.detail).toContain("7 PRIMITIVE");
    expect(eight.detail).toContain("composite under this encoding");
    // A form that cannot be discharged is not a refutation of the residue.
    expect(r.promotion).toBe("provisional");
    expect(r.problems).toEqual([]);
    // And the footprint that would have to be re-decided is exactly the seven measured coordinates.
    expect(r.standing.map((s) => s.coordinate).sort()).toEqual(
      [
        "assertion.aggregate.op",
        "assertion.aggregate.op:count~min",
        "assertion.aggregate.op:mean~count",
        "assertion.aggregate.op:mean~min",
        "assertion.aggregate.op:sum~count",
        "assertion.aggregate.op:sum~mean",
        "assertion.aggregate.op:sum~min",
      ].sort(),
    );
    expect(r.standing.every((s) => s.standing.state === "primitive")).toBe(true);
  });

  it("still rejects assertion stimuli that differ outside the assertion", () => {
    const c = closureOf({ carrier: ASSERTION, a: { fixture: "FX_TEMP_RATIO_COMPARISON" }, b: { fixture: "FX_SURVEY_MEAN_SATISFACTION" } });
    const o = obligation(c, "3-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("differ somewhere other than assertion");
  });
});

describe("obligation 4 — the carrier is insufficient before normalization", () => {
  it("holds when the carrier and every proper subset leave the stimuli distinct", () => {
    const live = ledger.closures.find((c) => c.carrier === AGG_PROJECT)!;
    const o = obligation(live, "4-");
    expect(o.held).toBe(true);
    expect(o.detail).toContain("the carrier alone and every one of the 2 other proper subsets");
  });

  it("tests the carrier alone unconditionally, not as subset zero of the sweep", () => {
    // With an empty normalization set the subset sweep has no proper subsets,
    // so folding the two together skipped the one clause obligation 4 exists
    // for and reported PASS for a carrier that collided on its own.
    const c = closureOf({
      carrier: CONTROL,
      a: { fixture: "FX_READINGS_BINNED_NO_CLOSURE" },
      b: {
        base: "FX_READINGS_BINNED_NO_CLOSURE",
        patch: [{ set: "structure.relations.bucketed.derivedBy", value: { kind: "normalize", from: "readings", field: "celsius" } }],
        outcome: { status: "admissible", codes: [], terms: [] },
        cause: "CASE_WHICH_BIN_GETS_TEN keys the undeclared-closure rule to the bin constructor",
      },
    });
    const o = obligation(c, "4-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("the carrier alone");
  });

  it("rejects a carrier that already collides once part of the normalization is erased", () => {
    const c = closureOf({
      carrier: AGG_PROJECT,
      a: { fixture: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY" },
      b: {
        base: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY",
        patch: [{ set: "structure.relations.subtotals.derivedBy.toGrain", value: ["country"] }],
        outcome: { status: "illegal", codes: ["REL_DERIVATION_RESULT_NOT_DERIVABLE"], terms: [] },
        cause: "probe only",
      },
    });
    const o = obligation(c, "4-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("carrier + relation.derivedBy.aggregate-to-grain.toGrain");
  });
});

describe("obligation 5 — complete closure sufficiency", () => {
  it("holds when the carrier plus the whole normalization set collides", () => {
    expect(obligation(ledger.closures.find((c) => c.carrier === AGG_PROJECT)!, "5-").held).toBe(true);
  });

  it("refutes the closure when an interaction remains", () => {
    // The right stimuli under the wrong carrier: `nest~project` cannot identify
    // a project with an aggregate-to-grain however much payload is erased.
    const c = closureOf({ carrier: "relation.derivedBy.kind:nest~project", ...AGG_PROJECT_SIDES });
    const r = check(c);
    expect(r.obligations.find((o) => o.id.startsWith("5-"))!.held).toBe(false);
    expect(r.promotion).toBe("refuted");
  });
});

describe("obligation 6 — normalization is not the cited cause", () => {
  it("holds when erasing the normalization without the carrier leaves the stimuli distinct", () => {
    expect(obligation(ledger.closures.find((c) => c.carrier === AGG_PROJECT)!, "6-").held).toBe(true);
  });

  it("refutes the closure when the normalization alone already collides", () => {
    // Two stimuli differing ONLY in a normalization coordinate's value: the
    // payload, not the constructor choice, is what separates them.
    const c = closureOf({
      carrier: AGG_PROJECT,
      a: { fixture: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY" },
      b: {
        base: "FX_NESTED_SUBTOTAL_OFF_HIERARCHY",
        patch: [{ set: "structure.relations.subtotals.derivedBy.toGrain", value: ["country"] }],
        outcome: { status: "illegal", codes: ["REL_DERIVATION_RESULT_NOT_DERIVABLE"], terms: [] },
        cause: "probe only",
      },
    });
    const r = check(c);
    expect(r.obligations.find((o) => o.id.startsWith("6-"))!.detail).toContain("already collides the stimuli, so IT carries the distinction");
    expect(r.promotion).toBe("refuted");
  });
});

describe("obligation 7 — a same-enum control", () => {
  it("accepts only a payload-compatible sibling with a holding single-coordinate witness", () => {
    expect(compatibleControls(AGG_PROJECT, census, signatures)).toEqual([CONTROL]);
    expect(obligation(ledger.closures.find((c) => c.carrier === AGG_PROJECT)!, "7-").held).toBe(true);
  });

  it("rejects a control that is not payload-compatible", () => {
    const c = closureOf({ carrier: AGG_PROJECT, control: { coordinate: "relation.derivedBy.kind:join~graph" } });
    const o = obligation(c, "7-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("is not a payload-compatible sibling");
  });

  it("reports indeterminate, never failed, when no control can exist", () => {
    // `assertion.kind` has two members, so the pair under test is the only one
    // the enum has. Unsatisfiable by construction is not the same as false, and
    // reporting it as a failure would manufacture a conclusion from the size of
    // the vocabulary rather than from the evidence.
    const c = closureOf({ carrier: "assertion.kind:aggregate~ratio-comparison" });
    const r = check(c);
    expect(compatibleControls(c.carrier, census, signatures)).toEqual([]);
    expect(r.obligations.find((o) => o.id.startsWith("7-"))!.unevaluable).toBe(true);
    expect(r.classification).toBe("indeterminate");
    expect(r.promotion).not.toBe("refuted");
  });
});

describe("obligation 8 — dependency and fixed-point discharge", () => {
  it("does not hold while any footprint coordinate is unadjudicated", () => {
    const o = obligation(ledger.closures.find((c) => c.carrier === AGG_PROJECT)!, "8-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("footprint coordinate(s) unadjudicated");
  });

  it("reports a PRIMITIVE footprint coordinate as composite, not as merely unadjudicated", () => {
    // The two readings are opposite. "Not yet adjudicated" says the work is
    // outstanding; a primitive dependency says this closure CANNOT prove its
    // carrier primitive, because constructor and payload are composite under
    // this encoding. Under the handle model both additivity closures reported
    // the first, because the handle was unresolved and the primitive coordinate
    // inside the footprint was never named.
    const r = check(ledger.closures.find((c) => c.carrier === "field.additivity.kind:additive~semi-additive")!);
    const o = r.obligations.find((x) => x.id.startsWith("8-"))!;
    expect(o.held).toBe(false);
    expect(o.detail).toContain("PRIMITIVE");
    expect(o.detail).toContain("composite under this encoding");
    expect(o.detail).toContain("field.additivity.semi-additive.nonAdditiveAlong#incidence");
    expect(r.rereadIf).toContain("DERIVED DISCRIMINATOR");
    expect(r.rereadIf).toContain("COMPOSITE CONSTRUCTOR");
  });

  it("holds, and promotes, only once every dependency is resolved and none is independently supported", () => {
    // The promotion path must be reachable, or `holding` is a state the
    // apparatus can describe and never enter. Nothing in the repository is in
    // this state; the index is synthetic precisely so the test says that.
    const resolved: StandingIndex = { of: () => ({ state: "resolved", disposition: "representation-artifact" }) };
    const live = ledger.closures.find((c) => c.carrier === AGG_PROJECT)!;
    // The control must keep its real standing, or obligation 7 fails instead.
    const index: StandingIndex = { of: (id) => (id === CONTROL ? { state: "primitive" } : resolved.of(id)) };
    const r = check(live, index);
    expect(r.obligations.find((o) => o.id.startsWith("8-"))!.held).toBe(true);
    expect(r.promotion).toBe("holding");
    // And the live tree is NOT in that state.
    expect(check(live).promotion).toBe("provisional");
  });
});

describe("the unresolved dependencies are blocked by EVIDENCE, not by an undecided verdict", () => {
  // The gate reports how many footprint coordinates lack a settled standing, and that reads
  // as a backlog of verdicts nobody has got round to writing. It is not one. Measured against
  // the committed specimen population, every one of these coordinates has an erasure that DOES
  // collide specimens -- so none is `unseparated`, the instrument reaches them -- and every
  // collided pair the oracle binds carries the SAME outcome on both sides. There is therefore
  // no pair from which a witness could be built, and no verdict the corpus would support.
  // Filing them as `not-yet-admitted` or `representation-artifact` to unblock the gate would be
  // deciding them by convenience, which is the one thing the standing index exists to prevent.
  const openDeps = () => checkClosures().dependencies.filter((d) => d.standing.state !== "resolved");

  it("names the dependencies that ARE decided, and every one of them is decided AGAINST its closures", () => {
    // A stage-1 re-earning ratified the additivity one (`removals.json` leafMap maps the removed
    // `nonAdditiveAlong` leaf onto `nonAdditiveAlong#incidence`), so the two additivity
    // closures cannot prove their carrier primitive at all: constructor and payload are
    // composite under this encoding. The two ORDER facets are primitive the ordinary way, from a
    // holding single-coordinate witness. Either way that is a verdict, not an outstanding
    // adjudication: obligation 8 admits no primitive, so a witnessed dependency blocks its
    // carrier's promotion just as firmly as an unsettled one.
    const primitive = openDeps().filter((d) => d.standing.state === "primitive").map((d) => d.coordinate);
    expect(primitive).toEqual([
      "field.additivity.semi-additive.nonAdditiveAlong#arity",
      "field.additivity.semi-additive.nonAdditiveAlong#incidence",
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.join.cardinality:one-to-many~many-to-many",
      "relation.derivedBy.nest.levels#order",
      "relation.derivedBy.normalize.field#incidence",
    ]);
  });

  // Pair search over the specimen population; timed out at the 5s default in
  // the retained 2026-09-19 worktree run (FIX-CLOSURE-LEDGER-AUTHORITY-TIMEOUT-01).
  it("finds no oracle-separated pair for any other dependency, so no witness is constructible", { timeout: 30_000 }, () => {
    const s = specimens();
    const plans = loadPlans();
    const oracle = loadOracle();
    const baseline = s.fixtures.map(canonical);
    const outcomeOf = (id: string) => oracle.outcomeOf(id)?.outcome;
    const outcomeDiffers = (a: ReturnType<typeof outcomeOf>, b: ReturnType<typeof outcomeOf>) =>
      a !== undefined &&
      b !== undefined &&
      (a.status !== b.status || JSON.stringify(a.codes) !== JSON.stringify(b.codes) || JSON.stringify(a.terms) !== JSON.stringify(b.terms));

    const unresolved = openDeps().filter((d) => d.standing.state === "unresolved");
    // Keeps the claim below from going vacuous if the set is ever emptied by other means.
    expect(unresolved.length).toBeGreaterThan(0);

    const collidesSomething: string[] = [];
    const witnessable: string[] = [];
    for (const { coordinate } of unresolved) {
      const plan = plans.get(coordinate);
      expect(plan, `${coordinate} has no erasure plan to measure`).toBeDefined();
      const sig = s.fixtures.map((f, i) => (wouldChange(f, plan!) ? canonical(executePlan(f, plan!)) : baseline[i]));
      const blocks = new Map<string, number[]>();
      sig.forEach((x, i) => blocks.set(x, [...(blocks.get(x) ?? []), i]));
      const pairs: [number, number][] = [];
      for (const idx of blocks.values())
        for (let x = 0; x < idx.length; x++)
          for (let y = x + 1; y < idx.length; y++) if (baseline[idx[x]] !== baseline[idx[y]]) pairs.push([idx[x], idx[y]]);
      if (pairs.length > 0) collidesSomething.push(coordinate);
      if (pairs.some(([i, j]) => outcomeDiffers(outcomeOf(s.fixtures[i].id), outcomeOf(s.fixtures[j].id)))) witnessable.push(coordinate);
    }
    // Each of their erasures collides at least one pair: the block is not that the
    // instrument cannot see them, it is that nothing in the corpus turns on what it sees.
    // ONE exception, and it is the mirror's consequence for this gate:
    // `project.keep#arity` no longer collides ANY pair -- the mirror makes its
    // erasure the identity on the specimen population too (every specimen's
    // keep already equals fieldNames(out)), so its blocker moved from "the
    // corpus does not turn on what the instrument sees" to "the instrument's
    // own erasure is the identity". An equation-breaking specimen would make
    // it collide; none is synthesized today.
    expect(collidesSomething).toEqual(unresolved.map((d) => d.coordinate).filter((id) => id !== "relation.derivedBy.project.keep#arity"));
    expect(witnessable).toEqual([]);
  });
});

describe("the dependency graph makes a composite object visible", () => {
  it("finds a cycle when a normalization coordinate's own closure reaches back to the carrier", () => {
    // A strongly connected component is the signature of tag and payload
    // constituting one irreducible object rather than two independent
    // coordinates, and it must stay unresolved rather than let one delete the
    // other.
    const reaches = (holder: string, target: string): BranchNormalization => ({
      holder,
      branch: "b",
      field: "f",
      operation: "forget-branch-field",
      footprint: [target],
    });
    const cyclic: SemanticErasureClosure[] = [
      closureOf({ carrier: "x.kind:a~b", normalization: [reaches("x", "y.kind:c~d")] }),
      closureOf({ carrier: "y.kind:c~d", normalization: [reaches("y", "x.kind:a~b")] }),
    ];
    expect(closureCycles(cyclic)).toEqual([["x.kind:a~b", "y.kind:c~d"]]);
  });

  it("finds a self-loop", () => {
    const self: BranchNormalization = { holder: "x", branch: "b", field: "f", operation: "forget-branch-field", footprint: ["x.kind:a~b"] };
    expect(closureCycles([closureOf({ carrier: "x.kind:a~b", normalization: [self] })])).toEqual([["x.kind:a~b"]]);
  });

  it("reports no cycle for an acyclic ledger", () => {
    const plain: BranchNormalization = { holder: "x", branch: "b", field: "f", operation: "forget-branch-field", footprint: ["p.q"] };
    expect(closureCycles([closureOf({ carrier: "x.kind:a~b", normalization: [plain] })])).toEqual([]);
  });
});

describe("carrier parsing", () => {
  it("splits a member-pair id into its leaf, holder and members", () => {
    expect(parseCarrier(AGG_PROJECT)).toEqual({
      leaf: "relation.derivedBy.kind",
      holder: "relation.derivedBy",
      members: ["aggregate-to-grain", "project"],
    });
  });

  it("refuses an id that is not a discriminator member pair", () => {
    expect(parseCarrier("relation.derivedBy.project.keep#present")).toBeUndefined();
    expect(parseCarrier("field.additivity.kind")).toBeUndefined();
  });
});

describe("the consistency check and the terminal gate are different questions", () => {
  const r = checkClosures();

  it("check passes: all twenty-two closures are internally consistent", () => {
    expect(r.ok).toBe(true);
    expect(r.problems).toEqual([]);
    expect(r.checks.length).toBe(22);
  });

  it("gate FAILS, because consistency is not settlement", () => {
    // The naming hazard this split exists for: every closure satisfies its
    // obligations today and every one is `provisional`, so a single `--gate`
    // reporting OK would read in CI as "the closures are settled". Nothing they
    // carry may be spent, and the terminal command has to say so.
    const g = closureGate(r);
    expect(g.ok).toBe(false);
    expect(g.message).toContain("22 of 22 carrier(s) still provisional");
    // 21, not 24: `relation.derivedBy.join.cardinality` is one of the footprint dependencies and
    // the subtraction records a `required-derived-vocabulary` verdict for it, and the two declared
    // SET order facets (`keep`, `nonAdditiveAlong`) left every footprint when the census stopped
    // emitting them, taking their dependency rows with them.
    expect(g.message).toContain("21 dependency coordinate(s) without a settled standing");
  });

  it("gate passes only when every carrier holds and every dependency is settled", () => {
    const settled = {
      ...r,
      checks: r.checks.map((c) => ({ ...c, promotion: "holding" as const })),
      dependencies: r.dependencies.map((d) => ({ ...d, standing: { state: "resolved", disposition: "witnessed" } as Standing })),
      cycles: [],
    };
    expect(closureGate(settled).ok).toBe(true);
    expect(closureGate({ ...settled, cycles: [["a", "b"]] }).ok).toBe(false);
    expect(closureGate({ ...settled, ok: false, problems: ["x"] }).ok).toBe(false);
    expect(closureGate({ ...settled, checks: settled.checks.map((c, i) => (i === 0 ? { ...c, promotion: "refuted" as const } : c)) }).ok).toBe(
      false,
    );
  });
});


/**
 * WHO OWNS SUPPORT FRESHNESS.
 *
 * `evidenceStanding` is a projection: it receives a `CurrentSupport` and reads
 * its three sets. It performs no witness check and holds no evaluation
 * identity, so it cannot be the thing that keeps support fresh — and an earlier
 * summary of mine said "the consumer re-evaluates", which attributed the work
 * to the wrong boundary.
 *
 * The boundary that actually owns freshness is the CALL SITE. Every production
 * construction of support is inline and per-call:
 *
 *   closure.ts:324       loadStanding
 *   closure.ts:748       checkClosures
 *   experiments.ts:118   orphanedCoordinates
 *   erasure-audit.ts:307 auditWitnesses
 *
 * all of the form `primitiveRatified(witnesses.filter(w => checkWitness(...).ok))`,
 * none at module scope, and nothing anywhere persists a support set or a
 * witness result. So there is no retention boundary to police today — which is
 * a property that must keep holding, not a fact to state once.
 */
describe("support freshness is owned by the call site, and stays owned there", () => {
  const census = loadCensus();
  const oracle = loadOracle();

  /**
   * A genuine tightening of acceptance, injected through the real parameter:
   * one stimulus stops validating, so every witness resting on it fails
   * SCHEMA_INVALID. Nothing about the coordinates or the erasures moves.
   */
  /** A side is a named fixture or a patch on one; both name a base stimulus. */
  const stimulusOf = (side: Witness["a"]): string => ("fixture" in side ? side.fixture : side.base);

  const stricter = (fixtureId: string): Oracle => ({
    ...oracle,
    validate: (f: unknown) => ((f as Fixture).id === fixtureId ? ["tightened: this stimulus is no longer admitted"] : oracle.validate(f)),
  });

  it("a previously supported coordinate stops being reported as supported when acceptance tightens", () => {
    const witnesses = loadWitnesses().witnesses;
    const before = loadStanding("REL-VIEW-ALGEBRA-01", oracle, census);

    // A coordinate that IS primitive now, and the stimulus its witness rests on.
    const single = witnesses.find((w) => w.coordinates.length === 1 && before.of(w.coordinates[0]).state === "primitive")!;
    const target = stimulusOf(single.a);
    expect(before.of(single.coordinates[0]).state).toBe("primitive");

    // An unaffected control: primitive, and resting on neither of the stimuli
    // the tightening touches. Without it this test would also pass for a path
    // that simply reported nothing as supported.
    const control = witnesses.find(
      (w) => w.coordinates.length === 1 && w !== single && stimulusOf(w.a) !== target && stimulusOf(w.b) !== target && before.of(w.coordinates[0]).state === "primitive",
    )!;
    expect(control, "no unaffected control exists; the assertion below would be vacuous").toBeDefined();

    const after = loadStanding("REL-VIEW-ALGEBRA-01", stricter(target), census);
    // The invalidated support class is not reported as still holding. NOT a
    // specific replacement state: with no suspension ledger entry, whatever the
    // fresh evaluation yields is the correct answer -- the property is that the
    // stale positive cannot survive.
    expect(after.of(single.coordinates[0]).state, "a support class invalidated by tighter acceptance was still reported").not.toBe("primitive");
    expect(after.of(control.coordinates[0]).state, "the control lost standing it should have kept").toBe("primitive");

    // And nothing sticks in either direction: the original acceptance yields
    // the original answer again. A memoised support set would fail here even
    // though it passed above.
    const again = loadStanding("REL-VIEW-ALGEBRA-01", oracle, census);
    expect(again.of(single.coordinates[0]).state).toBe("primitive");
  });

  it("no support set is built at MODULE SCOPE or written to disk", () => {
    // NAMED FOR WHAT IT CHECKS. It was called "no production path retains a
    // support set or a witness result across evaluations", which is a claim a
    // line-pattern scan cannot establish, and the mutation run that seemed to
    // support it was confounded: both freshness mutants were derived from a
    // scratch copy into which a module-scope constant had already been planted,
    // so this guard fired on the plant rather than on the mutation.
    //
    // Re-run isolated from a pristine baseline:
    //
    //   MEMO ONLY  (loadStanding caches its holding set)  -> killed by the
    //              behavioural test above ONLY. This guard does not see it.
    //   HOIST ONLY (support built once at module scope)   -> killed by both.
    //
    // So the division of labour is: this test excludes the two retention forms
    // a scan can actually decide -- construction at module scope, and
    // persistence to disk. Memoisation inside a function, an aliased
    // construction, or a cache in a helper are NOT covered here; the
    // behavioural test above is what catches those, and it caught the one
    // mutant that exercised them.
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const sources = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
    const offenders: string[] = [];
    for (const f of sources) {
      const src = fs.readFileSync(path.join(dir, f), "utf-8");
      src.split("\n").forEach((line, i) => {
        // A support set built at MODULE scope outlives every call in the
        // process and is exactly the retention this forbids.
        if (/^(export )?const .*\b(primitiveRatified|interactionOnly)\s*\(/.test(line)) offenders.push(`${f}:${i + 1} ${line.trim()}`);
        // Persisting one is worse: it outlives the process.
        if (/writeFileSync/.test(line) && /(primitive|support|standing)/i.test(line)) offenders.push(`${f}:${i + 1} ${line.trim()}`);
      });
    }
    expect(offenders, "support was cached at module scope or written to disk; the freshness owner moved").toEqual([]);
    // And the guard is not vacuous: the pattern it looks for does occur, inside
    // functions, at the four call sites named above.
    const perCall = sources.filter((f) => /primitiveRatified\s*\(/.test(fs.readFileSync(path.join(dir, f), "utf-8")));
    expect(perCall.length, "the guard is scanning for a pattern that no longer appears anywhere").toBeGreaterThan(1);
  });
});

describe("the ledger carries the authority its claims were verified under", () => {
  const copyWith = (mutate: (ledger: Record<string, unknown>) => void): string => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "closures-"));
    const ledger = JSON.parse(fs.readFileSync(CLOSURES_FILE, "utf-8")) as Record<string, unknown>;
    mutate(ledger);
    const file = path.join(dir, "closures.json");
    fs.writeFileSync(file, `${JSON.stringify(ledger, null, 2)}\n`);
    return file;
  };
  const drifted = (ledger: Record<string, unknown>) => {
    (ledger.authority as Record<string, unknown>).erasureAuthorityDigest = "0".repeat(64);
  };

  it("the committed ledger is stamped with the live authority, over every identity the report format names", () => {
    expect(loadClosures().authority).toEqual(liveAuthority());
    expect(Object.keys(liveAuthority()).sort()).toEqual(["coordinateBasisDigest", "erasureAuthorityDigest", "quotientSchemaVersion", "ruleDigest", "witnessAuthorityDigest"]);
  });

  // Five checkClosures re-derivations in one callback measured 758–1301ms
  // locally but exceeded the 5s default twice in cold-clone gate contexts
  // (mutation-runner baseline and pre-push) under parallel load — a ~5x
  // contention factor. 30s is finite, local to this test only, and stays far
  // below the runner's 20-minute stage budget, so a genuine hang still fails.
  // Assertions are unchanged (FIX-CLOSURE-LEDGER-AUTHORITY-TIMEOUT-01).
  it("a ledger authored under a different authority is refused, not re-read -- for EACH identity, though every derivation still agrees", { timeout: 30_000 }, () => {
    // Before this, such a ledger passed: every claim was re-derived and agreed,
    // and nothing recorded that the agreement was under a different executor.
    // Every identity, not only the erasure one: a compared set missing a key is
    // a key under which a ledger can move unrefused.
    const identities = ["coordinateBasisDigest", "erasureAuthorityDigest", "witnessAuthorityDigest", "quotientSchemaVersion", "ruleDigest"];
    const results = identities.map((k) => {
      const moved = k === "quotientSchemaVersion" ? 999 : "0".repeat(64);
      return [k, checkClosures(copyWith((l) => { (l.authority as Record<string, unknown>)[k] = moved; })), moved] as const;
    });
    // THE DISCRIMINATOR FIRST, for every identity: the moved key is named with
    // both endpoints. (Any mutant of closure.ts also moves witnessAuthorityDigest,
    // since this module is witness-owned; a mutant that dropped a key from the
    // compared set must fail HERE, on that key's row, not on the count below.)
    for (const [k, r, moved] of results) {
      expect(r.ok, k).toBe(false);
      expect(r.problems, k).toContainEqual(expect.stringMatching(new RegExp(`^closure ledger authored under a different ${k}: ${moved} -> ([0-9a-f]{64}|1);`)));
    }
    // THEN the "only problem" claim: the derivations DO agree; what each lacks is the stamp.
    for (const [k, r] of results) expect(r.problems, `${k}: more than the stamp was refused`).toHaveLength(1);
  });

  it("a ledger with no authority block is refused: its claims were verified under an authority nobody can name", () => {
    const r = checkClosures(copyWith((l) => { delete l.authority; }));
    expect(r.ok).toBe(false);
    expect(r.problems).toEqual([expect.stringMatching(/^closure ledger carries no authority block/)]);
    expect(authorityDrift(undefined, liveAuthority())).toHaveLength(1);
  });

  // restampClosures + checkClosures + loadClosures full re-derivations; timed
  // out at the 5s default in the retained 2026-09-19 worktree run
  // (FIX-CLOSURE-LEDGER-AUTHORITY-TIMEOUT-01).
  it("restamp re-verifies and writes the live authority; it refuses to stamp over a claim that is wrong", { timeout: 30_000 }, () => {
    const agreeing = copyWith(drifted);
    const stamped = restampClosures(agreeing);
    expect(stamped.ok, stamped.message).toBe(true);
    expect(checkClosures(agreeing).problems).toEqual([]);
    expect(loadClosures(agreeing).authority).toEqual(liveAuthority());
    // Unknown top-level keys survive the rewrite.
    expect(Object.keys(JSON.parse(fs.readFileSync(agreeing, "utf-8")) as object)).toContain("$control");

    const wrong = copyWith((l) => {
      drifted(l);
      ((l.closures as Record<string, unknown>[])[0] as Record<string, unknown>).promotion = "holding";
    });
    const before = fs.readFileSync(wrong, "utf-8");
    const refused = restampClosures(wrong);
    expect(refused.ok).toBe(false);
    expect(refused.message).toMatch(/refused -- 1 problem\(s\) are not authority drift/);
    expect(refused.message).toMatch(/recorded promotion "holding"/);
    expect(fs.readFileSync(wrong, "utf-8"), "a refused restamp must not touch the file").toBe(before);
  });
});

describe("a receipt's pair enters a closure only when that closure's own obligations accept it", () => {
  // The receipts are occurrence-bound PREDICTIONS for a carrier. A closure's controlled stimuli
  // are a different claim about the same bytes: that THIS carrier plus THIS normalization
  // explains the collision. The two coincided for some carriers and not others, so the carry is
  // decided by measurement rather than by the receipt's existence.
  const withPair = (carrier: string, p: StimulusPrediction): SemanticErasureClosure => ({
    ...ledger.closures.find((c) => c.carrier === carrier)!,
    a: { fixture: p.base },
    b: {
      base: p.base,
      patch: p.patch,
      outcome: p.expected,
      cause: p.target.law ? `${p.target.authority}; ${p.target.law.case} (${findingId(p.target.law)})` : p.target.authority,
    },
  });
  const discharges = (c: SemanticErasureClosure) =>
    ["3", "4", "5", "6"].every((n) => check(c).obligations.find((o) => o.id.startsWith(`${n}-`))!.held);

  it("carries every receipt pair that discharges obligations 3-6, refuses the four that do not, and the ledger agrees in both directions", () => {
    // Carrying every receipt across would have recorded four `refuted` promotions on the
    // strength of pairs no closure was built for. So the ledger's own state is the assertion:
    // a receipt carrier carries a pair exactly when that pair discharges obligations 3-6.
    const carried: string[] = [];
    const refused: string[] = [];
    for (const rec of loadReceipts().receipts) {
      const p = rec.prediction;
      if (p.carrier === CONTROL || p.carrier === AGG_PROJECT) continue; // the control; and its own record carries its own pair
      const target = ledger.closures.find((c) => c.carrier === p.carrier);
      if (!target) continue;
      const fits = discharges(withPair(p.carrier, p));
      expect(Boolean(target.a && target.b), `${p.carrier}: carried=${Boolean(target.a && target.b)} but closure-fit=${fits}`).toBe(fits);
      (fits ? carried : refused).push(p.carrier);
    }
    expect(carried.sort()).toEqual([
      "field.additivity.kind:additive~semi-additive",
      "field.additivity.kind:semi-additive~ratio-measure",
      "relation.derivedBy.kind:bin~project",
      "relation.derivedBy.kind:normalize~project",
    ]);
    expect(refused.sort()).toEqual([
      "relation.derivedBy.kind:aggregate-to-grain~graph",
      "relation.derivedBy.kind:bin~graph",
      "relation.derivedBy.kind:normalize~graph",
      "relation.derivedBy.kind:project~graph",
    ]);
  });

  it("refuses them on SUFFICIENCY — the clause that would otherwise have read as a refutation", () => {
    for (const carrier of ["relation.derivedBy.kind:bin~graph", "relation.derivedBy.kind:project~graph"]) {
      const p = loadReceipts().receipts.find((r) => r.prediction.carrier === carrier)!.prediction;
      const r = check(withPair(carrier, p));
      const five = r.obligations.find((o) => o.id.startsWith("5-"))!;
      expect(five.held, carrier).toBe(false);
      expect(five.detail, carrier).toContain("INTERACTION remains");
      // The other three clauses DO hold, so the pair is not simply the wrong evidence --
      // it is evidence this closure's normalization does not suffice to explain.
      for (const n of ["3", "4", "6"]) {
        expect(r.obligations.find((o) => o.id.startsWith(`${n}-`))!.held, `${carrier} obligation ${n}`).toBe(true);
      }
    }
  });
});

describe("what actually blocks the closures, decomposed by coordinate kind", () => {
  it("names the reference-topology facets as the keystone, and separates them from the candidates that block nothing", () => {
    // The candidate list is not the obligation. Decomposed, the unresolved candidates split four ways,
    // and the closures' unsettled footprints split the same way -- which is what turns an
    // undifferentiated backlog into a targeted one.
    const byId = new Map(census.map((c) => [c.id, c]));
    const kindOf = (id: string) => byId.get(id)?.kind ?? "not-in-census";
    const doc = loadSubtraction();
    const unresolved = doc.basis.candidates.filter((id) => (doc.verdicts[id]?.disposition ?? "unresolved") === "unresolved");
    const tally = (ids: readonly string[]) => {
      const out: Record<string, number> = {};
      for (const id of ids) out[kindOf(id)] = (out[kindOf(id)] ?? 0) + 1;
      return out;
    };

    expect(unresolved.length).toBe(64);
    expect(tally(unresolved)).toEqual({ "reference-topology": 23, "member-absence": 8, leaf: 5, "member-pair": 28 });

    // EVERY blocked closure depends on at least one reference-topology facet, and sixteen of the
    // twenty-two on NOTHING ELSE. So those facets are the keystone: settle them and obligation 8
    // can hold for sixteen carriers that today cannot promote at all.
    const r = checkClosures();
    const shape: Record<string, number> = {};
    const dependents = new Set<string>();
    for (const c of r.checks) {
      const unsettled = c.standing.filter((s) => s.standing.state !== "resolved").map((s) => s.coordinate);
      if (unsettled.length === 0) continue;
      for (const id of unsettled) dependents.add(id);
      const kinds = [...new Set(unsettled.map(kindOf))].sort().join("+");
      shape[kinds] = (shape[kinds] ?? 0) + 1;
    }
    expect(shape).toEqual({ "reference-topology": 16, "member-pair+reference-topology": 6 });

    // And only part of the topology facets block anything at all: the rest, and every
    // non-topology candidate, are a separate obligation that no carrier is waiting on.
    // Five topology facets left the kernel with the sequence declaration, so the
    // unresolved topology set is 28 rather than 33.
    const topology = unresolved.filter((id) => kindOf(id) === "reference-topology");
    // 25: the FIRST bound-incidence witness (nest.levels#incidence, rounds
    // 31-37) moved it out of unresolved for one round; the footprint-aware
    // classifier put it back, because its erasure takes the sibling ORDER facet
    // of a surviving list and so does not ratify primitive standing.
    expect(topology.length).toBe(23);
    // Fourteen, not sixteen: two of the sixteen were witnessed -- `relation.derivedBy.nest.levels#order`
    // by REL-TOPOLOGY-AUTHORED-STIMULUS-01 and `relation.derivedBy.aggregate-to-grain.toGrain#order` by
    // REL-ORDER-FACET-SEMANTICS-01 -- so neither is unresolved and neither is counted here, while the
    // closures that depended on them still depend on a PRIMITIVE coordinate and stay blocked.
    // Twelve: two of the sixteen were witnessed (see above), and two more -- `keep#order` and
    // `nonAdditiveAlong#order` -- left the kernel with the sequence declaration, so they are
    // neither unresolved nor in a footprint any more.
    // Ten: `nest.levels#incidence` is unresolved again after the footprint-aware classifier
    // demoted it, so it blocks its carriers once more rather than being counted settled -- and
    // `normalize.field#incidence` LEFT this set by being witnessed, which is the filing that
    // reaches the `normalize~X` carriers.
    expect(topology.filter((id) => dependents.has(id)).length).toBe(10);
    // 48, not 57: three coordinates that blocked nothing are gone from the kernel -- `along#order`,
    // `peers[]#order` and `grainWitness#order` -- and six more left the unresolved set with a
    // verdict, so the non-blocking unresolved count falls by nine. Those six are
    // `evidence.grainWitness#incidence`, `relation.derivedBy.aggregate-to-grain.from#incidence`,
    // `field.additivity.kind:non-additive~ratio-measure`, `observation.null:censored~suppressed`
    // and the two orders settled earlier: each blocked no carrier, so filing it moved this count
    // and no other. `relation.derivedBy.normalize.field#incidence` -- filed after them -- DID block
    // carriers, so it left this count alone and moved the closures' composite diagnosis instead
    // (the `affected` list above grows by the two `normalize~X` carriers). The grain
    // witness coordinate returned to unresolved when its fabricated pair was retired, and
    // it blocks no carrier either, so this count is back to 49.
    expect(unresolved.filter((id) => !dependents.has(id)).length).toBe(49);
  });
});

