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
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadBranchSignatures, loadCensus } from "./census.js";
import type { Oracle, Witness } from "./necessity.js";
import type { Fixture } from "./structure.js";
import {
  checkClosure,
  checkClosures,
  closureCycles,
  closureGate,
  compatibleControls,
  deriveNormalization,
  footprintOf,
  groundedVocabulary,
  loadClosures,
  loadStanding,
  parseCarrier,
  type BranchNormalization,
  type SemanticErasureClosure,
  type Standing,
  type StandingIndex,
} from "./closure.js";
import { checkWitness, classifyWitness, loadCodomainAdjudications, loadOracle, loadWitnesses, primitiveRatified } from "./necessity.js";

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
    // The handle model said nine coordinates. Forgetting `toGrain` costs four —
    // the reference's arity, order and incidence go with it — and forgetting
    // `join.cardinality` costs seven, since every cardinality member pair is
    // inside the field. Naming the dependency after the eraser under-reported it
    // by more than half, and obligation 8 could have gone green over the gap.
    const r = checkClosures();
    const derivation = r.dependencies.filter((d) => d.coordinate.startsWith("relation.derivedBy."));
    expect(derivation).toHaveLength(21);
    expect(r.dependencies.length).toBeGreaterThan(21);
    // Every one is a topology facet or a member pair — never a presence facet,
    // because those were the derived conjunctions the census no longer emits.
    expect(derivation.filter((d) => d.coordinate.endsWith("#present"))).toEqual([]);
    const cardinality = derivation.filter((d) => d.coordinate.startsWith("relation.derivedBy.join.cardinality"));
    expect(cardinality).toHaveLength(7);
    expect(derivation.every((d) => d.standing.state === "unresolved")).toBe(true);
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

  it("no coordinate gains standing by appearing in a closure, and one that already had it is reported", () => {
    // The derivation footprints are all unresolved. The additivity footprint is
    // not: `nonAdditiveAlong#incidence` is PRIMITIVELY ratified, which is the
    // fact the handle model hid — under the handle the dependency looked merely
    // unadjudicated, and obligation 8 would have read as "not yet" rather than
    // as the composite-constructor finding it actually is.
    const r = checkClosures();
    for (const { coordinate, standing: s } of r.dependencies.filter((d) => d.coordinate.startsWith("relation.derivedBy."))) {
      expect(s.state, `${coordinate} must not gain standing by appearing in a closure`).toBe("unresolved");
    }
    const primitiveDeps = r.dependencies.filter((d) => d.standing.state === "primitive");
    expect(primitiveDeps.map((d) => d.coordinate)).toEqual(["field.additivity.semi-additive.nonAdditiveAlong#incidence"]);
    const affected = r.checks.filter((c) => c.obligations.find((o) => o.id.startsWith("8-"))!.detail.includes("PRIMITIVE"));
    expect(affected.map((c) => c.carrier).sort()).toEqual([
      "field.additivity.kind:additive~semi-additive",
      "field.additivity.kind:semi-additive~ratio-measure",
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
    // edits, six coordinates: the topology of both references goes with them.
    const d = deriveNormalization(AGG_PROJECT, signatures);
    if ("error" in d) throw new Error(d.error);
    expect(d.minRawEdit).toBe(3);
    expect(d.footprint).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#arity",
      "relation.derivedBy.aggregate-to-grain.toGrain#incidence",
      "relation.derivedBy.aggregate-to-grain.toGrain#order",
      "relation.derivedBy.project.keep#arity",
      "relation.derivedBy.project.keep#incidence",
      "relation.derivedBy.project.keep#order",
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
    expect(g.message).toContain("24 dependency coordinate(s) without a settled standing");
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

  it("no production path retains a support set or a witness result across evaluations", () => {
    // The structural half. The test above shows the current call sites rebuild;
    // this one fails if a future one starts caching, which is the only way the
    // retained-positive-result problem becomes reachable at all.
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
