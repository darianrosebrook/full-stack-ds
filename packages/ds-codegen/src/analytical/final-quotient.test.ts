/**
 * The final quotient (REL-VIEW-ALGEBRA-01 close condition `final-quotient`).
 *
 * Two claims, tested separately:
 *
 * - The checker RECOGNIZES the factorizations the census performs and HOLDS
 *   them against the final retained set: every recorded artifact has a form,
 *   its carriers are live and retained, the proposition is true and exercised
 *   on the specimens, and no grounded distinction collapses under the retained
 *   readings.
 * - Each of those judgments can FAIL for the right reason. A checker that only
 *   ever says OK on the ledger it was written against has pinned nothing, so
 *   every property below has a hostile input: a carrier adjudicated out, an
 *   artifact still live, a specimen violating the proposition on ITS branch
 *   (and not on another branch's same-named property), an unexercised side,
 *   a duplicated specimen carrying a contradicting outcome.
 */
import { describe, expect, it } from "vitest";
import { alphaRename } from "./alpha-rename.js";
import {
  checkArtifact,
  checkFinalQuotient,
  checkSeparation,
  factorizationOf,
  loadQuotientContext,
  readCoordinate,
  retained,
  summarizeFinalQuotient,
  type QuotientContext,
  type Specimen,
} from "./final-quotient.js";
import { loadOracle } from "./necessity.js";
import { nameBlindMap } from "./quotient.js";
import type { Fixture } from "./structure.js";

const oracle = loadOracle();
const ctx = loadQuotientContext("REL-VIEW-ALGEBRA-01", oracle);
const live = checkFinalQuotient("REL-VIEW-ALGEBRA-01", oracle, ctx);
const artifacts = [...ctx.verdicts].filter(([, d]) => d === "representation-artifact").map(([id]) => id);

const renamed = (f: Fixture) => alphaRename(f, nameBlindMap(f));
const specimen = (id: string, f: Fixture, outcome?: Specimen["outcome"]): Specimen => ({ id, renamed: renamed(f), outcome });
const withVerdict = (id: string, disposition: "representation-artifact" | "not-yet-admitted"): QuotientContext => ({
  ...ctx,
  verdicts: new Map([...ctx.verdicts, [id, disposition]]),
});

describe("the recorded artifacts are factorizations the census performs, not reason strings", () => {
  it("recognizes every artifact verdict across every basis, in exactly the three forms", () => {
    // A THIRD form arrived with the sequence declaration: a name list whose
    // declaration says `set` loses its `#order` facet because no rule reads the
    // positions. `FactorizationForm`'s own comment requires a new census rule to
    // be added here on purpose, and this is where that is noticed.
    expect(artifacts.length).toBe(34);
    const forms = artifacts.map((id) => factorizationOf(id, ctx.derived, ctx.signatures, ctx.census)?.form);
    expect(forms.filter((f) => f === "required-child-presence")).toHaveLength(16);
    expect(forms.filter((f) => f === "member-absence-cross-term")).toHaveLength(13);
    expect(forms.filter((f) => f === "declared-set-order")).toHaveLength(5);
    expect(forms.includes(undefined)).toBe(false);
  });

  it("recognizes a declared set from the DECLARATION, so an ordered list can never be filed this way", () => {
    expect(factorizationOf("relation.derivedBy.project.keep#order", ctx.derived, ctx.signatures, ctx.census)?.form).toBe("declared-set-order");
    expect(factorizationOf("relation.derivedBy.project.keep#order", ctx.derived, ctx.signatures, ctx.census)?.carriers).toEqual([
      "relation.derivedBy.project.keep#arity",
      "relation.derivedBy.project.keep#incidence",
    ]);
    // `nest.levels` IS ordered, so the same shape is not a factorization for it:
    // recognition reads the emitted declaration, which says `ordered`.
    expect(factorizationOf("relation.derivedBy.nest.levels#order", ctx.derived, ctx.signatures, ctx.census)).toBeUndefined();
  });

  it("reads a required-child factorization off the census record: holder, branch, property, carriers", () => {
    expect(factorizationOf("relation.derivedBy.join.with#present", ctx.derived, ctx.signatures, ctx.census)).toEqual({
      artifact: "relation.derivedBy.join.with#present",
      form: "required-child-presence",
      carriers: ["relation.derivedBy#present", "relation.derivedBy.kind"],
      holder: "relation.derivedBy",
      branch: "join",
      property: "with",
    });
  });

  it("recognizes a member-absence cross-term on a plain enum tag as well as on a discriminated union", () => {
    // field.temporality.kind is an enum leaf with no per-branch payload, so the branch signatures do not know it.
    expect(ctx.signatures.has("field.temporality.kind")).toBe(false);
    expect(factorizationOf("field.temporality.kind:instant~<absent>", ctx.derived, ctx.signatures, ctx.census)?.carriers).toEqual([
      "field.temporality#present",
      "field.temporality.kind",
    ]);
    expect(factorizationOf("relation.derivedBy.kind:join~<absent>", ctx.derived, ctx.signatures, ctx.census)?.form).toBe("member-absence-cross-term");
  });

  it("refuses what the census does not factorize: a member pair, an undeclared member, a presence nobody derives", () => {
    expect(factorizationOf("relation.derivedBy.kind:aggregate-to-grain~join", ctx.derived, ctx.signatures, ctx.census)).toBeUndefined();
    expect(factorizationOf("field.additivity.kind:bogus~<absent>", ctx.derived, ctx.signatures, ctx.census)).toBeUndefined();
    expect(factorizationOf("relation.derivedBy#present", ctx.derived, ctx.signatures, ctx.census)).toBeUndefined();
  });

  it("reports a verdict with no recognizable factorization as a reason string only", () => {
    const r = checkArtifact("relation.derivedBy.kind:aggregate-to-grain~join", ctx);
    expect(r.held).toBe(false);
    expect(r.problems.join("\n")).toContain("no factorization the census performs matches it");
  });
});

describe("the factorization is held against the FINAL retained set", () => {
  it("every artifact holds on the live ledgers, exercised on both sides", () => {
    expect(live.artifacts.every((a) => a.held)).toBe(true);
    for (const a of live.artifacts) {
      expect(a.exercised.entailed).toBeGreaterThan(0);
      // "Exercised on both sides" is a claim about a CROSS-TERM — a presence that
      // occurs with and without its holder. A declared-set order facet has no
      // holder to be absent, so its second side is how often the list occurred
      // with more than one member, which is the only shape a permutation could
      // have moved.
      if (a.form === "declared-set-order") expect(a.exercised.entailed).toBeGreaterThan(0);
      else expect(a.exercised.holderAbsent).toBeGreaterThan(0);
      expect(a.violations).toEqual([]);
    }
  });

  it("fails every artifact whose carrier is itself adjudicated out — the cyclic-redundancy form", () => {
    const r = checkFinalQuotient("REL-VIEW-ALGEBRA-01", oracle, withVerdict("relation.derivedBy#present", "representation-artifact"));
    const failing = r.artifacts.filter((a) => !a.held);
    // 15 required-child presences under relation.derivedBy plus the 7 kind:m~<absent> cross-terms on it
    // (the 16th required child is field.additivity's nonAdditiveAlong, whose carrier is untouched).
    const dependants = failing.filter((a) => a.artifact !== "relation.derivedBy#present");
    expect(dependants.map((a) => a.artifact).filter((id) => id.startsWith("relation.derivedBy"))).toHaveLength(22);
    expect(dependants.every((a) => a.problems.some((p) => p.includes("carrier relation.derivedBy#present is itself adjudicated out")))).toBe(true);
    // The holder itself, newly recorded as an artifact, fails for its own reasons: nothing factorizes it and the kernel carries it.
    const holder = failing.find((a) => a.artifact === "relation.derivedBy#present")!;
    expect(holder.problems.join("\n")).toContain("the kernel still carries it");
    expect(holder.problems.join("\n")).toContain("no factorization the census performs matches it");
    expect(r.ok).toBe(false);
  });

  it("a carrier adjudicated not-yet-admitted fails the same way, and `retained` says why", () => {
    const c = withVerdict("field.temporality#present", "not-yet-admitted");
    expect(retained("field.temporality#present", c)).toBe(false);
    expect(retained("field.temporality#present", ctx)).toBe(true);
    const r = checkArtifact("field.temporality.kind:instant~<absent>", c);
    expect(r.held).toBe(false);
    expect(r.problems.join("\n")).toContain("itself adjudicated out (not-yet-admitted)");
  });

  it("fails an artifact the kernel still carries or still has a plan for", () => {
    const c: QuotientContext = { ...ctx, live: new Set([...ctx.live, "relation.derivedBy.join.with#present"]) };
    const r = checkArtifact("relation.derivedBy.join.with#present", c);
    expect(r.held).toBe(false);
    expect(r.problems.join("\n")).toContain("the kernel still carries it");
  });
});

describe("the factorization is read on the specimens, on the right branch", () => {
  const base = oracle.fixtures.get("FX_NESTED_SUBTOTAL_OFF_HIERARCHY")!;
  const hostile = JSON.parse(JSON.stringify(base)) as Fixture;
  // An aggregate-to-grain derivation with its required `from` removed: schema-invalid, and false for the proposition.
  delete (hostile as unknown as { structure: { relations: Record<string, { derivedBy: Record<string, unknown> }> } }).structure.relations.subtotals.derivedBy.from;

  it("names a specimen on which present(p) != present(H) AND branch(H) = k", () => {
    const r = checkArtifact("relation.derivedBy.aggregate-to-grain.from#present", { ...ctx, specimens: [...ctx.specimens, specimen("HOSTILE_NO_FROM", hostile)] });
    expect(r.held).toBe(false);
    expect(r.violations).toEqual(["HOSTILE_NO_FROM"]);
  });

  it("does not read another branch's same-named property as this one — a join's `from` is not aggregate-to-grain's", () => {
    // The hostile specimen is on the aggregate-to-grain branch; join.from's proposition is not about it.
    const r = checkArtifact("relation.derivedBy.join.from#present", { ...ctx, specimens: [...ctx.specimens, specimen("HOSTILE_NO_FROM", hostile)] });
    expect(r.violations).toEqual([]);
    // And every holder on a non-join branch was counted as exactly that, never as a violation.
    expect(r.exercised.otherBranch).toBeGreaterThan(0);
  });

  it("reports an unexercised side rather than passing on an absent population", () => {
    const only = [specimen("ONE", base, oracle.outcomeOf("FX_NESTED_SUBTOTAL_OFF_HIERARCHY")?.outcome)];
    const r = checkArtifact("relation.derivedBy.graph.from#present", { ...ctx, specimens: only });
    expect(r.held).toBe(false);
    expect(r.problems.join("\n")).toContain("unexercised — no specimen shows the holder on this branch");
  });
});

describe("readings are the information each erasure forgets", () => {
  const plan = (id: string) => ctx.plans.get(id)!;
  const fx = (id: string) => renamed(oracle.fixtures.get(id)!);

  it("a merge reads which side of the pair a slot is on; a holder reads presence per slot; no slot at all reads empty", () => {
    // The census merges members[1] INTO members[0]: `sum~mean` reads a mean as `from` and a sum as `into`.
    expect(readCoordinate(fx("FX_SURVEY_MEAN_SATISFACTION"), plan("assertion.aggregate.op:sum~mean"))).toBe("from");
    expect(readCoordinate(fx("FX_STOCK_SUM_ALONG_DATE"), plan("assertion.aggregate.op:sum~mean"))).toBe("into");
    // A ratio-comparison assertion has no `aggregate` branch, so the branch-qualified
    // coordinate has NO slot there: an empty reading, distinct from "∅" (a slot that is absent).
    expect(readCoordinate(fx("FX_TEMP_RATIO_COMPARISON"), plan("assertion.aggregate.op:sum~mean"))).toBe("");
    expect(readCoordinate(fx("FX_SURVEY_MEAN_SATISFACTION"), plan("assertion.aggregate.along#incidence"))).toBe("∅");
    // One token per field: two fields without an additivity declaration, one with.
    expect(readCoordinate(fx("FX_STOCK_SUM_ALONG_DATE"), plan("field.additivity#present"))).toBe("∅;∅;present");
  });

  it("incidence reads the referent, so two specimens aggregating along different dimensions differ", () => {
    const a = readCoordinate(fx("FX_STOCK_SUM_ALONG_DATE"), plan("assertion.aggregate.along#incidence"));
    const b = readCoordinate(fx("FX_N_STOCK_SUM_ALONG_PRODUCT"), plan("assertion.aggregate.along#incidence"));
    expect(a).not.toBe(b);
  });

  it("order and arity read the list's shape", () => {
    const image = { assertions: [], structure: { relations: {} } } as unknown as Fixture;
    const list = { ...image, structure: { relations: { r: { derivedBy: { kind: "nest", from: "s", levels: ["b", "a", "b"] } } } } } as unknown as Fixture;
    expect(readCoordinate(list, plan("relation.derivedBy.nest.levels#arity"))).toBe("3");
    expect(readCoordinate(list, plan("relation.derivedBy.nest.levels#order"))).toBe("1,0,2");
  });
});

describe("no grounded distinction collapses under the retained readings", () => {
  it("holds on the live population, over a non-trivial number of differing pairs", () => {
    expect(live.separation.collapsed).toEqual([]);
    expect(live.separation.grounded).toBeGreaterThan(100);
    expect(live.separation.differingPairs).toBeGreaterThan(1000);
    expect(live.separation.retainedCoordinates).toBe([...ctx.plans.keys()].filter((id) => retained(id, ctx)).length);
  });

  it("reports a duplicated specimen carrying a contradicting outcome as a collapse", () => {
    const dup = ctx.specimens.find((s) => s.id === "FX_SURVEY_MEAN_SATISFACTION")!;
    const contradicting: Specimen = { id: "DUP", renamed: dup.renamed, outcome: { status: "admissible", codes: [], terms: [] } };
    const r = checkSeparation({ ...ctx, specimens: [...ctx.specimens, contradicting] });
    expect(r.collapsed.map((c) => `${c.a}~${c.b}`)).toContain("FX_SURVEY_MEAN_SATISFACTION~DUP");
  });

  it("counts a pair separated by row VALUES alone as instance-only, not as collapsed", () => {
    // Rows PRESENCE is a schema-role coordinate (evidence.rows.*#present); the values in a row are read by
    // instance-role coordinates (observation.value, observation.null), which the census classifies as such.
    type Rowed = { evidence?: { rows?: Record<string, Record<string, unknown>[]> } };
    const base = ctx.specimens.find((s) => s.outcome && (s.renamed as unknown as Rowed).evidence?.rows)!;
    const copy = JSON.parse(JSON.stringify(base.renamed)) as Rowed;
    const [relation, rows] = Object.entries(copy.evidence!.rows!)[0];
    copy.evidence!.rows![relation] = [...rows, { ...rows[0] }];
    const status = base.outcome!.status === "admissible" ? "illegal" : "admissible";
    const r = checkSeparation({ ...ctx, specimens: [...ctx.specimens, { id: "ROWS", renamed: copy as Specimen["renamed"], outcome: { status, codes: [], terms: [] } }] });
    expect(r.collapsed.map((c) => `${c.a}~${c.b}`)).not.toContain(`${base.id}~ROWS`);
    // At least the (base, ROWS) pair is new; the copy also inherits every instance-only pairing the base already had.
    expect(r.instanceOnly).toBeGreaterThan(live.separation.instanceOnly);
    expect(r.differingPairs).toBeGreaterThan(live.separation.differingPairs);
  });
});

describe("the whole check on the live ledgers", () => {
  it("is OK, with nothing executable to compose and every primitive witness retained", () => {
    expect(live.ok).toBe(true);
    expect(live.executableRemovals.ids).toEqual([]);
    expect(live.primitives.checked).toBeGreaterThan(40);
    expect(live.primitives.problems).toEqual([]);
    expect(summarizeFinalQuotient(live)).toContain("34/34 held");
  });

  it("fails the whole check when a carrier is adjudicated out, and says so in the summary", () => {
    const r = checkFinalQuotient("REL-VIEW-ALGEBRA-01", oracle, withVerdict("relation.derivedBy#present", "not-yet-admitted"));
    expect(r.ok).toBe(false);
    expect(summarizeFinalQuotient(r)).toContain("problem(s)");
  });

  it("reports a ratified primitive that is adjudicated out", () => {
    const primitive = "relation.derivedBy.kind:bin~normalize";
    expect(ctx.verdicts.get(primitive)).toBe("witnessed");
    const r = checkFinalQuotient("REL-VIEW-ALGEBRA-01", oracle, withVerdict(primitive, "not-yet-admitted"));
    expect(r.primitives.problems.join("\n")).toContain(`${primitive}: ratified by a holding witness and adjudicated out`);
  });
});
