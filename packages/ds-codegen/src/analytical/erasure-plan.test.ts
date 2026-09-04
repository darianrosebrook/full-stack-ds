/**
 * The erasure-plan authority: one walk emits both the coordinate and where it
 * lives, and the quotient executes rather than re-interprets.
 *
 * Every test here is about the SEPARATION, not about any coordinate's standing.
 * The four objects the system used to conflate — proposition, locator,
 * operation, footprint — are checked as four, because identifying any two of
 * them is how this experiment produced eleven un-erasable coordinates and a
 * dependency set under-reported by more than half.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadCensus, loadDerivation, loadLocators, loadPlans, type Coordinate } from "./census.js";
import { executePlan, orderPlans, type ForgetOperation } from "./erasure-plan.js";
import { FIXTURES_DIR } from "./necessity.js";
import { canonical, erase, planFor } from "./quotient.js";
import { isMarker } from "./quotient-image.js";
import { parseFixtures, type Fixture } from "./structure.js";

const census = loadCensus();
const plans = loadPlans();
const fixtures = parseFixtures(fs.readFileSync(`${FIXTURES_DIR}/fixtures.jsonl`, "utf-8"));
const byId = new Map(census.map((c) => [c.id, c]));

/**
 * Every terminal path present in a fixture, so an ADDED key is detectable.
 *
 * A MARKER IS A TERMINAL. A hole replaces a value at a path that already
 * existed; its `@q` and `by` keys are the erasure's own bookkeeping, not
 * declarations the fixture acquired. Descending into them would report 1521
 * "added paths" for an operation that added no facts, and the invariant this
 * guard exists for — forgetting may destroy, never create — would be drowned by
 * its own instrument. What it still catches, unchanged, is the real defect: an
 * erasure writing a slot into existence, which is how incidence erasure once
 * added `along` to 76 fixtures that never declared it.
 */
function paths(node: unknown, at = "", out = new Set<string>()): Set<string> {
  if (node === null || typeof node !== "object" || isMarker(node)) {
    out.add(at);
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => paths(v, `${at}[${i}]`, out));
    return out;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) paths(v, `${at}.${k}`, out);
  return out;
}

describe("plan registry — one walk owns identity and location", () => {
  it("gives every coordinate a locator and every non-reference coordinate exactly one plan", () => {
    const locators = loadLocators();
    for (const c of census) expect(locators.has(c.id), `${c.id} has no locator`).toBe(true);
    const withoutPlan = census.filter((c) => !plans.has(c.id));
    expect([...new Set(withoutPlan.map((c) => c.kind))]).toEqual(["reference"]);
    expect(plans.size).toBe(census.length - withoutPlan.length);
  });

  it("keys locators by leaf as well, because coordinates sharing a leaf share a slot", () => {
    const locators = loadLocators();
    const leafOf = new Map<string, Coordinate[]>();
    for (const c of census) leafOf.set(c.leaf, [...(leafOf.get(c.leaf) ?? []), c]);
    for (const [leaf, cs] of leafOf) {
      const base = locators.get(leaf);
      expect(base, `no locator for leaf ${leaf}`).toBeDefined();
      // Every coordinate on that leaf must resolve to the same steps — a
      // divergence here would mean the census placed two propositions about one
      // slot in two different places.
      for (const c of cs) expect(JSON.stringify(locators.get(c.id)!.steps)).toBe(JSON.stringify(base!.steps));
    }
  });

  it("names one operation per coordinate kind, from a closed vocabulary", () => {
    const seen = new Map<Coordinate["kind"], Set<ForgetOperation["kind"]>>();
    for (const c of census) {
      const p = plans.get(c.id);
      if (!p) continue;
      seen.set(c.kind, (seen.get(c.kind) ?? new Set()).add(p.operation.kind));
    }
    expect(seen.get("member-pair")).toEqual(new Set(["merge-enum-members"]));
    expect(seen.get("member-absence")).toEqual(new Set(["spell-member-as-absent"]));
    expect(seen.get("reference-topology")).toEqual(
      new Set(["forget-reference-arity", "forget-reference-order", "forget-reference-incidence"]),
    );
    expect(seen.get("leaf")).toEqual(new Set(["forget-value", "delete-slot", "delete-holder"]));
  });

  it("chooses a leaf's operation from the SCHEMA: required leaves are holed, optional ones deleted", () => {
    // Asserted as the rule rather than as the eight names that satisfy it
    // today. A ninth required leaf added to the model must be holed too, and a
    // list of names would let it be deleted while the test still passed.
    const { requiredLeaves } = loadDerivation();
    const leaves = census.filter((c) => c.kind === "leaf" && !c.id.endsWith("#present"));
    expect(leaves.length).toBeGreaterThan(20);
    for (const c of leaves) {
      const op = plans.get(c.id)!.operation.kind;
      // A required leaf has no absent state to identify, and deleting it leaves
      // a declaration missing something it must have.
      if (requiredLeaves.has(c.leaf)) expect(op, `${c.id} is required`).toBe("forget-value");
      // An optional leaf CAN say nothing, and "says nothing" is one of the
      // states its erasure has to identify — which deletion does, and a hole
      // would not.
      else expect(op, `${c.id} is optional`).toBe("delete-slot");
    }
  });

  it("distinguishes forgetting a holder from forgetting a value, because their footprints differ", () => {
    expect(plans.get("relation.derivedBy#present")!.operation.kind).toBe("delete-holder");
    // Required within the join branch, so a hole rather than a deletion: the
    // join declaration cannot be missing its cardinality and still be a join.
    expect(plans.get("relation.derivedBy.join.cardinality")!.operation.kind).toBe("forget-value");
    // Optional on a field, so deletion: absence is one of the states it can be in.
    expect(plans.get("field.cyclic")!.operation.kind).toBe("delete-slot");
  });
});

describe("execution — forgetting may destroy, never create", () => {
  it("never declares a slot that was not already declared, for any plan", () => {
    // Stated over SLOTS rather than terminal paths, because a hole legitimately
    // moves a terminal upward: `grain: ["k"]` has the terminal `.grain[0]`, and
    // holing it makes `.grain` itself terminal. That is the hole replacing a
    // subtree that was there, not the fixture acquiring a declaration.
    //
    // So a path that appears is an offender only when it is not a PREFIX of one
    // that existed — which is exactly "something is now declared where nothing
    // was". The real defect this guards is untouched: incidence erasure once
    // wrote `along` into 76 fixtures that never declared it, and `.…along` is a
    // prefix of nothing in those fixtures.
    const declaredBefore = (before: Set<string>, x: string) =>
      before.has(x) || [...before].some((b) => b.startsWith(x) && (b[x.length] === "." || b[x.length] === "["));

    const offenders: string[] = [];
    for (const p of plans.values()) {
      for (const f of fixtures) {
        const before = paths(f);
        const added = [...paths(executePlan(f, p))].filter((x) => !declaredBefore(before, x));
        if (added.length > 0) offenders.push(`${p.id} added ${added.slice(0, 3).join(", ")} to ${f.id}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("and that guard can still fail: a plan that writes an undeclared slot is caught", () => {
    // The falsifier for the rule above, because a prefix test is exactly the
    // kind of loosening that can quietly stop catching anything. `along` is
    // optional on an aggregate assertion, so a fixture that omits it has no
    // path under it for a write to be a prefix of.
    const fixture = {
      id: "FX_T",
      structure: { relations: { r: { grain: ["k"], fields: { k: { transformation: "nominal", key: true } } } } },
      assertions: [{ kind: "aggregate", relation: "r", field: "k", op: "sum" }],
    } as unknown as Fixture;
    const before = paths(fixture);
    const written = JSON.parse(JSON.stringify(fixture)) as { assertions: Record<string, unknown>[] };
    written.assertions[0].along = ["k"];
    const declaredBefore = (x: string) => before.has(x) || [...before].some((b) => b.startsWith(x) && (b[x.length] === "." || b[x.length] === "["));
    expect([...paths(written)].filter((x) => !declaredBefore(x))).toEqual([".assertions[0].along[0]"]);
  });

  it("reaches the sugar spelling of an observation as well as the record spelling", () => {
    const fixture = {
      id: "FX_T",
      structure: { relations: { r: { grain: ["k"], fields: { v: { transformation: "ratio" } } } } },
      assertions: [{ kind: "aggregate", relation: "r", field: "v", op: "sum" }],
      evidence: { rows: { r: [{ v: 3 }, { v: { value: 4, unit: "kg" } }] } },
    } as unknown as Fixture;
    const after = executePlan(fixture, plans.get("observation.value")!) as unknown as Record<string, any>;
    // The bare scalar IS the value, so the whole observation goes; the record
    // form keeps its unit.
    expect(after.evidence.rows.r).toEqual([{}, { v: { unit: "kg" } }]);
  });

  it("guards `field.whole` to its scalar spelling so it cannot subsume `field.whole.perRow`", () => {
    const withRecord = {
      id: "FX_T",
      structure: { relations: { r: { grain: ["k"], fields: { v: { transformation: "ratio", whole: { perRow: "k" } } } } } },
      assertions: [{ kind: "aggregate", relation: "r", field: "v", op: "sum" }],
    } as unknown as Fixture;
    const scalar = JSON.parse(JSON.stringify(withRecord)) as Record<string, any>;
    scalar.structure.relations.r.fields.v.whole = "fixed";

    const wholePlan = plans.get("field.whole")!;
    expect((executePlan(withRecord, wholePlan) as unknown as Record<string, any>).structure.relations.r.fields.v.whole).toEqual({
      perRow: "k",
    });
    expect((executePlan(scalar as unknown as Fixture, wholePlan) as unknown as Record<string, any>).structure.relations.r.fields.v.whole).toBeUndefined();
  });

  it("leaves `relation.grain` UNguarded, because its other spelling carries no coordinate of its own", () => {
    // The scalar guard is not a special case for `whole`; it exists exactly
    // where the object branch contributes coordinates. `grain`'s array branch
    // collapses to the same id, so a guard would make the list form
    // un-erasable — which is the shape every corpus fixture actually uses.
    const steps = plans.get("relation.grain")!.locator.steps;
    expect(steps.some((s) => s.kind === "scalar-only")).toBe(false);
    const reached = fixtures.filter((f) => canonical(erase(f, byId.get("relation.grain")!)) !== canonical(f));
    expect(reached.length).toBeGreaterThan(0);
  });
});

describe("composition — the ordering is derived, and the laws hold", () => {
  const corpusPlans = [...plans.values()];

  it("is idempotent: erasing the same plan twice equals erasing it once", () => {
    const offenders: string[] = [];
    for (const p of corpusPlans) {
      for (const f of fixtures) {
        const once = executePlan(f, p);
        if (canonical(executePlan(once, p)) !== canonical(once)) offenders.push(`${p.id} on ${f.id}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("subsumes: erasing a holder makes every erasure beneath it a no-op", () => {
    const holder = plans.get("relation.derivedBy#present")!;
    const beneath = corpusPlans.filter((p) => p.id.startsWith("relation.derivedBy.") && p.id !== holder.id);
    expect(beneath.length).toBeGreaterThan(20);
    for (const f of fixtures) {
      const gone = executePlan(f, holder);
      for (const p of beneath) expect(canonical(executePlan(gone, p)), `${p.id} still acts after the holder is gone`).toBe(canonical(gone));
    }
  });

  it("orders a discriminator's plans after everything that branches on it", () => {
    const kind = plans.get("relation.derivedBy.kind")!;
    const merge = plans.get("relation.derivedBy.kind:join~nest")!;
    for (const p of [kind, merge]) {
      expect(p.runAfter, `${p.id} carries no ordering edges`).toBeDefined();
      expect(p.runAfter).toContain("relation.derivedBy.join.cardinality");
      expect(p.runAfter).toContain("relation.derivedBy.nest.levels#arity");
      // Its own plans are not among its predecessors, or the sort would cycle.
      expect(p.runAfter).not.toContain(kind.id);
    }
    const ordered = orderPlans([kind, plans.get("relation.derivedBy.join.cardinality")!]).map((p) => p.id);
    expect(ordered).toEqual(["relation.derivedBy.join.cardinality", "relation.derivedBy.kind"]);
  });

  it("the ordering is not cosmetic: the two orders genuinely disagree", () => {
    // The rank this replaces gave a discriminator MERGE and a branch-qualified
    // facet the same rank, so listing order decided the result. Merging
    // `aggregate-to-grain~join` first relabels the branch out from under the
    // second locator.
    const merge = plans.get("relation.derivedBy.kind:aggregate-to-grain~join")!;
    const facet = plans.get("relation.derivedBy.join.from#incidence")!;
    const target = fixtures.find((f) => f.id === "FX_ORDER_REVENUE_SUMMED_AFTER_LINE_JOIN")!;
    const derived = canonical(executePlan(executePlan(target, facet), merge));
    const reversed = canonical(executePlan(executePlan(target, merge), facet));
    expect(derived).not.toBe(reversed);
    expect(orderPlans([merge, facet]).map((p) => p.id)).toEqual([facet.id, merge.id]);
  });

  it("commutes where no ordering edge exists, over a spread of representative plans", () => {
    const sample = [
      "field.transformation",
      "field.key",
      "field.temporality#present",
      "field.temporality.grain",
      "field.additivity.kind",
      "relation.grain",
      "relation.derivedBy.join.cardinality",
      "relation.derivedBy.nest.levels#arity",
      "structure.peers#present",
      "assertion.aggregate.op",
      "assertion.aggregate.along#incidence",
      "assertion.aggregate.nulls",
      "observation.value",
      "observation.null",
      "evidence.rows.*#present",
    ].map((id) => plans.get(id)!);
    expect(sample.every(Boolean)).toBe(true);
    const offenders: string[] = [];
    for (let i = 0; i < sample.length; i++) {
      for (let j = i + 1; j < sample.length; j++) {
        const [p, q] = [sample[i], sample[j]];
        if ((p.runAfter ?? []).includes(q.id) || (q.runAfter ?? []).includes(p.id)) continue;
        for (const f of fixtures) {
          if (canonical(executePlan(executePlan(f, p), q)) !== canonical(executePlan(executePlan(f, q), p))) {
            offenders.push(`${p.id} / ${q.id} on ${f.id}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("refusals stay falsifiable", () => {
  const absence = (leaf: string, member: string): Coordinate => ({
    id: `${leaf}:${member}~<absent>`,
    kind: "member-absence",
    leaf,
    members: [member, "<absent>"],
    role: "schema",
  });

  it("synthesizes a plan for a coordinate the census refuses, so the refusal can be demonstrated", () => {
    const c = absence("relation.derivedBy.kind", "project");
    expect(census.some((x) => x.id === c.id)).toBe(false);
    const p = planFor(c)!;
    expect(p.operation).toEqual({ kind: "delete-tagged-holder", member: "project" });
    expect(p.locator.path).toBe("structure.relations.*.derivedBy");
  });

  it("spells absence of a REQUIRED leaf as absence of its whole declaration, not of the tag", () => {
    const fixture = {
      id: "FX_T",
      structure: {
        relations: {
          r: { grain: ["k"], fields: { v: { transformation: "ratio", temporality: { kind: "instant", grain: "day" } } } },
        },
      },
      assertions: [{ kind: "aggregate", relation: "r", field: "v", op: "sum" }],
    } as unknown as Fixture;
    const after = erase(fixture, absence("field.temporality.kind", "instant")) as unknown as Record<string, any>;
    // Not `{ grain: "day" }`, which the schema rejects: the whole declaration goes.
    expect(after.structure.relations.r.fields.v.temporality).toBeUndefined();
  });

  it("throws rather than silently doing nothing when no plan can be built", () => {
    const nowhere: Coordinate = { id: "not.a.path", kind: "leaf", leaf: "not.a.path", role: "schema" };
    expect(() => erase(fixtures[0], nowhere)).toThrow(/no erasure plan/);
  });

  it("still treats a reference coordinate's erasure as a no-op, which is the alpha-renaming invariant", () => {
    const ref = census.find((c) => c.kind === "reference")!;
    expect(planFor(ref)).toBeUndefined();
    expect(canonical(erase(fixtures[0], ref))).toBe(canonical(fixtures[0]));
  });
});

describe("derived presence — recorded, not merely suppressed", () => {
  const derived = loadDerivation().derivedPresence;

  it("records all sixteen conjunctions, each naming a branch", () => {
    expect(derived.length).toBe(16);
    expect(derived.every((d) => d.branch !== undefined)).toBe(true);
    expect(derived.map((d) => d.proposition)).toContain("relation.derivedBy.join.from#present");
    expect(derived.map((d) => d.proposition)).toContain("field.additivity.semi-additive.nonAdditiveAlong#present");
  });

  it("never suppresses into a hole: every holder it defers to is itself a live coordinate", () => {
    const live = new Set(census.map((c) => c.id));
    for (const d of derived) expect(live.has(d.holder), `${d.proposition} defers to ${d.holder}, which is not a coordinate`).toBe(true);
  });

  it("and none of the suppressed propositions is itself a coordinate, in the other direction", () => {
    const live = new Set(census.map((c) => c.id));
    for (const d of derived) expect(live.has(d.proposition), `${d.proposition} is both derived and emitted`).toBe(false);
  });

  it("is a claim about SCHEMA topology, not about which coordinates the kernel currently keeps", () => {
    // The rule reads "the holder structurally owns existence", so it must not be
    // expressible as "suppress the child while some other coordinate happens to
    // exist". The observable consequence: every deferral names a holder PATH
    // that the schema declares optional, and the branch it names is a real
    // member of that holder's discriminator.
    const kinds = new Map(census.filter((c) => c.enum && c.leaf.endsWith(".kind")).map((c) => [c.leaf, c.enum!]));
    for (const d of derived) {
      const holderLeaf = `${d.holder.replace(/#present$/, "")}.kind`;
      expect(kinds.get(holderLeaf), `${d.holder} is not a tagged holder`).toBeDefined();
      expect(kinds.get(holderLeaf)).toContain(d.branch);
    }
  });
});

describe("representation effects are schema facts, not coordinate ids", () => {
  it("lists paths beneath a holder, including ones that carry no coordinate", () => {
    const effects = plans.get("relation.derivedBy#present")!.representationEffects;
    expect(effects).toContain("structure.relations.*.derivedBy");
    expect(effects).toContain("structure.relations.*.derivedBy.join.cardinality");
    // `.kind` is a representation fact under the holder as much as any payload.
    expect(effects).toContain("structure.relations.*.derivedBy.kind");
  });

  it("is narrower for a value slot than for its holder", () => {
    const holder = plans.get("relation.derivedBy#present")!.representationEffects;
    const slot = plans.get("relation.derivedBy.join.cardinality")!.representationEffects;
    expect(slot).toEqual(["structure.relations.*.derivedBy.join.cardinality"]);
    expect(holder.length).toBeGreaterThan(slot.length);
  });
});

describe("the quotient no longer reads the schema", () => {
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "quotient.ts"), "utf-8");

  it("carries no traversal of the fixture shape and no branch-topology query", () => {
    // What this pins: the erasure path names no fixture property and asks the
    // census no shape questions. What it does NOT pin: `nameBlindMap` still
    // reads `structure.relations` and `.fields`, because alpha-renaming is
    // canonicalization, not location — that is the remaining, deliberate,
    // shape-aware code in this module.
    for (const token of ["walkFixture", "loadBranchSignatures", "derivedBy", "grainWitness", "peers", "assertions"]) {
      expect(source.includes(token), `quotient.ts still mentions ${token}`).toBe(false);
    }
  });
});
