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
import { describe, expect, it } from "vitest";
import { loadBranchSignatures, loadCensus } from "./census.js";
import {
  checkClosure,
  checkClosures,
  closureCycles,
  compatibleControls,
  deriveNormalization,
  groundedVocabulary,
  loadClosures,
  loadStanding,
  parseCarrier,
  type SemanticErasureClosure,
  type StandingIndex,
} from "./closure.js";
import { checkWitness, classifyWitness, loadOracle, loadWitnesses, primitiveRatified } from "./necessity.js";

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
  const d = deriveNormalization(over.carrier, census, signatures);
  const normalization = "error" in d ? [] : d.normalization;
  return {
    normalization,
    control: { coordinate: CONTROL },
    dependencies: normalization,
    minRawEdit: "error" in d ? 0 : d.minRawEdit,
    promotion: "provisional",
    ...over,
  };
};

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
    expect(ledger.closures).toHaveLength(20);
    expect(ledger.closures.map((c) => c.carrier)).not.toContain(CONTROL);
    // The control is the one pair whose branches require the same payload, so
    // it needs no normalization and a single-coordinate witness already holds.
    const d = deriveNormalization(CONTROL, census, signatures);
    expect("error" in d ? [] : d.normalization).toEqual([]);
    expect(primitiveRatified(loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok))).toContain(CONTROL);
  });

  it("records every carrier as provisional, so none of the twenty has been promoted", () => {
    expect(ledger.closures.map((c) => c.promotion)).toEqual(Array(20).fill("provisional"));
    expect(checkClosures().checks.map((c) => c.promotion)).toEqual(Array(20).fill("provisional"));
  });

  it("collapses twenty pairwise questions onto nine distinct dependency coordinates", () => {
    // This is the point of recording the twenty structurally rather than
    // hunting twenty bespoke witnesses: adjudicating nine payload coordinates
    // once settles more than twenty pairwise combinations would.
    const r = checkClosures();
    expect(r.dependencies.map((d) => d.coordinate)).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#present",
      "relation.derivedBy.bin.field#present",
      "relation.derivedBy.graph.edgeFrom#present",
      "relation.derivedBy.graph.edgeTo#present",
      "relation.derivedBy.join.cardinality",
      "relation.derivedBy.join.with#present",
      "relation.derivedBy.nest.levels#present",
      "relation.derivedBy.normalize.field#present",
      "relation.derivedBy.project.keep#present",
    ]);
    expect(r.dependencies.every((d) => d.standing.state === "unresolved")).toBe(true);
  });

  it("has no dependency cycle, so no carrier's normalization depends back on it", () => {
    expect(checkClosures().cycles).toEqual([]);
  });

  it("records the measured minimum raw edit, which is 3, 4 or 5 for the twenty", () => {
    const edits = ledger.closures.map((c) => c.minRawEdit).sort();
    expect(edits[0]).toBe(3);
    expect(edits[edits.length - 1]).toBe(5);
    expect(ledger.closures.find((c) => c.carrier === "relation.derivedBy.kind:join~graph")!.minRawEdit).toBe(5);
  });
});

describe("adopting the closure form confers no standing", () => {
  it("leaves every closure carrier out of the primitively ratified set", () => {
    const holding = loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok);
    const primitive = primitiveRatified(holding);
    for (const c of ledger.closures) expect(primitive.has(c.carrier), `${c.carrier} must not be ratified by a closure`).toBe(false);
  });

  it("leaves every normalization coordinate unresolved rather than dispositioned by appearing here", () => {
    for (const { coordinate, standing: s } of checkClosures().dependencies) {
      expect(s.state, `${coordinate} must not gain standing by appearing in a closure`).toBe("unresolved");
    }
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

describe("the closure form agrees with the 2-set witnesses that already hold", () => {
  // The adjudication policy licensed closure only once it was "formalized and
  // tested against the existing 2-set witnesses". Two authorities that describe
  // one witness differently is worse than either being wrong, so the derived
  // normalization set must reproduce the residue `classifyWitness` observed.
  const holding = loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok);
  const single = primitiveRatified(holding);
  const multi = holding.filter((w) => w.coordinates.length > 1);

  it("reproduces the observed residue of every classified witness that has a carrier", () => {
    const classified = multi.map((w) => ({ w, k: classifyWitness(w, census, oracle, single) })).filter(({ k }) => k.carrier !== undefined);
    expect(classified.length).toBeGreaterThan(0);
    for (const { k } of classified) {
      const d = deriveNormalization(k.carrier!, census, signatures);
      expect("error" in d).toBe(false);
      if ("error" in d) continue;
      expect(d.normalization, `${k.carrier} residue must equal the derived normalization`).toEqual([...k.residue!].sort());
    }
  });

  it("covers both hygiene witnesses and the indeterminate one, and no more", () => {
    const withCarrier = multi.map((w) => classifyWitness(w, census, oracle, single)).filter((k) => k.carrier !== undefined);
    expect(withCarrier.map((k) => k.klass).sort()).toEqual(["indeterminate", "quotient-hygiene", "quotient-hygiene"]);
    // The one witness with no carrier pairs a BARE enum leaf with payload, so
    // no discriminator substitution is under test and no closure applies.
    const noCarrier = multi.map((w) => ({ w, k: classifyWitness(w, census, oracle, single) })).filter(({ k }) => k.carrier === undefined);
    expect(noCarrier).toHaveLength(1);
    expect(noCarrier[0].w.coordinates).toContain("assertion.kind");
    expect(noCarrier[0].k.klass).toBe("interaction");
  });

  it("agrees that both unilateral-residue pairs fit inside the <=2-coordinate bound", () => {
    // The additivity witnesses were expressible as plain 2-sets because only
    // one branch carried payload. That is the same measurement the twenty
    // derivation pairs fail, and it is why they needed a new proof form rather
    // than a bespoke search.
    for (const carrier of ["field.additivity.kind:additive~semi-additive", "field.additivity.kind:semi-additive~ratio-measure"]) {
      const d = deriveNormalization(carrier, census, signatures);
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
    const d = deriveNormalization(AGG_PROJECT, census, signatures);
    expect("error" in d).toBe(false);
    if ("error" in d) return;
    expect(d.residue).toEqual({ "aggregate-to-grain": ["toGrain"], project: ["keep"] });
    expect(d.normalization).toEqual([
      "relation.derivedBy.aggregate-to-grain.toGrain#present",
      "relation.derivedBy.project.keep#present",
    ]);
    expect(d.minRawEdit).toBe(3);
    expect(d.bilateral).toBe(true);
    expect(d.unmapped).toEqual([]);
  });

  it("selects the coordinate the census actually emits, not a presumed `#present`", () => {
    // `join.cardinality` is a plain enum leaf and has no presence facet;
    // erasing the bare leaf is what deletes the key. A selector that assumed
    // `#present` universally named a coordinate that does not exist.
    const d = deriveNormalization("relation.derivedBy.kind:join~project", census, signatures);
    expect("error" in d ? [] : d.normalization).toContain("relation.derivedBy.join.cardinality");
    expect(census.map((c) => c.id)).not.toContain("relation.derivedBy.join.cardinality#present");
  });

  it("rejects an authored set narrower than the derived one", () => {
    const c = closureOf({ carrier: AGG_PROJECT, normalization: ["relation.derivedBy.project.keep#present"] });
    expect(obligation(c, "2-").held).toBe(false);
    expect(check(c).ok).toBe(false);
  });

  it("rejects an authored set wider than the derived one", () => {
    const c = closureOf({
      carrier: AGG_PROJECT,
      normalization: [
        "relation.derivedBy.aggregate-to-grain.toGrain#present",
        "relation.derivedBy.project.keep#present",
        "relation.derivedBy.nest.levels#present",
      ],
    });
    expect(obligation(c, "2-").held).toBe(false);
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
    expect(o.detail).toContain("carrier + relation.derivedBy.aggregate-to-grain.toGrain#present");
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
  it("does not hold while any dependency is unadjudicated", () => {
    const o = obligation(ledger.closures.find((c) => c.carrier === AGG_PROJECT)!, "8-");
    expect(o.held).toBe(false);
    expect(o.detail).toContain("not yet adjudicated");
  });

  it("does not hold when a dependency carries standing of its own", () => {
    // `assertion.aggregate.op` is primitively ratified, so the closure over
    // `assertion.kind` depends on a coordinate that has already earned its
    // place. That is the case the re-reading rule exists for.
    const r = check(closureOf({ carrier: "assertion.kind:aggregate~ratio-comparison" }));
    const o = r.obligations.find((x) => x.id.startsWith("8-"))!;
    expect(o.held).toBe(false);
    expect(o.detail).toContain("carry standing of their own");
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
    const cyclic: SemanticErasureClosure[] = [
      closureOf({ carrier: "x.kind:a~b", normalization: ["y.kind:c~d"], dependencies: ["y.kind:c~d"] }),
      closureOf({ carrier: "y.kind:c~d", normalization: ["x.kind:a~b"], dependencies: ["x.kind:a~b"] }),
    ];
    expect(closureCycles(cyclic)).toEqual([["x.kind:a~b", "y.kind:c~d"]]);
  });

  it("finds a self-loop", () => {
    expect(closureCycles([closureOf({ carrier: "x.kind:a~b", normalization: ["x.kind:a~b"] })])).toEqual([["x.kind:a~b"]]);
  });

  it("reports no cycle for an acyclic ledger", () => {
    expect(closureCycles([closureOf({ carrier: "x.kind:a~b", normalization: ["p.q"] })])).toEqual([]);
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
