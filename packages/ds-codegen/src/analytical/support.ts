/**
 * THE ONE SUPPORT CLASSIFIER: what a witness's erasure destroys, and which of
 * that is a sub-distinction rather than an independent degree of freedom.
 *
 * The defect this module exists to end: standing was conferred by
 * `w.coordinates.length === 1` while the audit classified the SAME witness as
 * destroying more than it declares. Both statements were computed in different
 * modules from different facts, and the ledger's own prose already denied what
 * the syntactic rule conferred — the `assertion.aggregate.along#present`
 * adjudication says the witness "does NOT by itself establish the coordinate as
 * a primitive analytical axis" while `primitiveRatified` put it in primitive
 * standing anyway. One classifier, consumed by both, is the repair.
 *
 * WHAT COUNTS AS ONE DEGREE OF FREEDOM. The footprint (see `claimedFootprints`)
 * names every coordinate an erasure makes unobservable, and not all of that is
 * collateral damage:
 *
 *   REFINEMENT    the collateral lies INSIDE what the declared coordinate's
 *                 erasure removes — a member pair or member absence of the same
 *                 leaf, or a facet of a slot the erasure DELETES. Subsuming a
 *                 sub-distinction is correct, not collateral: the erased
 *                 proposition is its carrier, so erasing the carrier and
 *                 erasing "says a versus says b" are one act at two
 *                 resolutions. The test is the CARRIER, not the leaf: a
 *                 presence erasure deletes the list, so that list's arity and
 *                 incidence facets are conditional on it and go with it.
 *
 *   SIBLING       the collateral is a reference-topology facet at the SAME
 *                 locator while the carrier SURVIVES — `nest.levels#incidence`
 *                 making `nest.levels#order` unobservable. The list still
 *                 exists and still has its arity; a distinction belonging to a
 *                 different coordinate of a surviving slot has been destroyed
 *                 in place. This is the case with no conditional relation to
 *                 appeal to. Round 31 measured it (`DECLARED_NON_COMMUTING`
 *                 declares incidence and order not composable) and round 34
 *                 built `DIFFERENCE_MISATTRIBUTED` so a witness PAIR could not
 *                 be credited across it; standing has to read it too.
 *
 *   OUTSIDE       the collateral belongs to another leaf entirely. The holder
 *                 erasure case is the measured instance.
 *
 * Only REFINEMENT preserves the claim that erasing "exactly this coordinate"
 * destroys the distinction, which is what `witnessStrength.single` requires —
 * so a witness ratifies PRIMITIVE standing only when it declares one
 * coordinate and its collateral is all refinements.
 */
import { loadCensus, loadPlans, type Coordinate } from "./census.js";
import { containsSteps, deletionFootprint, TOTAL_SUPPRESSIONS, type ErasurePlan } from "./erasure-plan.js";

const stepsOf = (p: ErasurePlan) => JSON.stringify(p.locator.steps);

/**
 * The coordinates each erasure CLAIMS to make unobservable, including itself.
 *
 * Structural, from locators and operations — no specimen is consulted. Three
 * rules, and each is a claim the falsification pass can refute:
 *
 * 1. A TOTAL SUPPRESSION takes everything whose locator it CONTAINS
 *    (`deletionFootprint`), and the containment is transitive.
 *
 * 2. Forgetting a reference's INCIDENCE coarsens forgetting its ORDER at the
 *    same slot: the canonical rebinding lands on ONE arrangement, so every
 *    permutation the order erasure identifies, incidence identifies too. (The
 *    earlier reading credited this to index-keyed tokens; the rule survives the
 *    rebinding because the image is a single canonical arrangement either way.)
 *    The converse fails, and so does arity in both directions.
 *
 * 3. A CONDITIONAL deletion — `spell-member-as-absent`, `delete-tagged-holder` —
 *    claims nothing beyond itself: it acts only where the slot carries one
 *    member, so it identifies nothing a sibling distinction depends on. If that
 *    is too conservative the falsification pass reports the omission rather than
 *    the claim being widened by hand.
 */
export function claimedFootprints(plans: Map<string, ErasurePlan> = loadPlans()): Map<string, string[]> {
  const all = [...plans.values()];
  const out = new Map<string, string[]>();
  for (const p of all) {
    const f = new Set<string>([p.id, ...deletionFootprint(p, all)]);
    if (p.operation.kind === "forget-reference-incidence") {
      for (const q of all) if (q.operation.kind === "forget-reference-order" && stepsOf(q) === stepsOf(p)) f.add(q.id);
    }
    out.set(p.id, [...f].sort());
  }
  // Containment is transitive on its own, but the incidence/order rule is not
  // reachable by it, so close the relation rather than assume it is closed.
  for (const p of all) {
    const f = new Set(out.get(p.id));
    for (let grew = true; grew; ) {
      grew = false;
      for (const id of [...f]) {
        for (const r of out.get(id) ?? []) {
          if (f.has(r)) continue;
          f.add(r);
          grew = true;
        }
      }
    }
    out.set(p.id, [...f].sort());
  }
  return out;
}

/** The census by id, for readers that have only ids. */
export function censusById(): Map<string, Coordinate> {
  return new Map(loadCensus().map((c) => [c.id, c]));
}

/** Which kind of thing a witness's collateral is, and what that permits. */
export type SupportClass = "atomic" | "own-refinements" | "sibling-facet" | "outside";

export interface SupportReading {
  declared: string[];
  /** Everything the declared coordinates' footprints reach, beyond the declared set. */
  collateral: string[];
  /** Collateral INSIDE a declared proposition: sub-distinctions. Subsumption is correct. */
  refinements: string[];
  /** Reference-topology facets at a declared coordinate's own locator, carrier surviving. */
  sibling: string[];
  /** Collateral at another leaf entirely. */
  outside: string[];
  cls: SupportClass;
  /**
   * Whether this witness may confer PRIMITIVE standing: one declared
   * coordinate, and nothing destroyed but its own refinements.
   */
  ratifies: boolean;
}

/**
 * Read one declared coordinate set against a footprint.
 *
 * The order of the tests IS the doctrine: a sibling facet shares the declared
 * coordinate's leaf, so testing "same leaf" first would swallow the very case
 * this classifier exists to name.
 */
export function readSupport(
  declaredIds: readonly string[],
  footprint: Map<string, string[]>,
  byId: Map<string, Coordinate>,
  plans: Map<string, ErasurePlan> = loadPlans(),
): SupportReading {
  const declared = [...declaredIds].sort();
  const declaredSet = new Set(declared);
  const actual = [...new Set(declared.flatMap((id) => footprint.get(id) ?? []))].sort();
  const collateral = actual.filter((id) => !declaredSet.has(id));
  const refinements: string[] = [];
  const sibling: string[] = [];
  const outside: string[] = [];
  for (const q of collateral) {
    const qc = byId.get(q);
    const qSteps = plans.get(q)?.locator;
    // Does a declared coordinate's erasure REMOVE the slot q lives in (or above
    // it)? Then q is conditional on the erased proposition and its subsumption
    // is correct. `containsSteps` includes equality, and the operation decides
    // the equal case: a total suppression takes the whole slot with it.
    const conditional = declared.some((p) => {
      const plan = plans.get(p);
      if (!plan || !qc || !qSteps) return false;
      return containsSteps(plan.locator, qSteps) && (TOTAL_SUPPRESSIONS.has(plan.operation.kind) || plan.locator.steps.length < qSteps.steps.length);
    });
    if (conditional) {
      refinements.push(q);
      continue;
    }
    const isSibling =
      qc !== undefined &&
      qc.kind === "reference-topology" &&
      declared.some((p) => {
        const plan = plans.get(p);
        return plan !== undefined && qSteps !== undefined && stepsOf(plan) === JSON.stringify(qSteps.steps);
      });
    if (isSibling) sibling.push(q);
    else outside.push(q);
  }
  const cls: SupportClass =
    collateral.length === 0 ? "atomic" : sibling.length > 0 ? "sibling-facet" : outside.length > 0 ? "outside" : "own-refinements";
  return {
    declared,
    collateral,
    refinements,
    sibling,
    outside,
    cls,
    ratifies: declared.length === 1 && sibling.length === 0 && outside.length === 0,
  };
}

/**
 * The coordinates a witness population PRIMITIVELY ratifies.
 *
 * The one definition: `checkWitness` decides the witness holds, the classifier
 * decides what it destroys, and only a holding one-coordinate witness whose
 * collateral is entirely its own refinements ratifies primitive standing.
 */
export function primitiveSupport(
  holds: readonly { coordinates: readonly string[] }[],
  footprint: Map<string, string[]> = claimedFootprints(),
  byId: Map<string, Coordinate> = censusById(),
): Set<string> {
  const out = new Set<string>();
  for (const w of holds) {
    const reading = readSupport(w.coordinates, footprint, byId);
    if (reading.ratifies) out.add(reading.declared[0]);
  }
  return out;
}
