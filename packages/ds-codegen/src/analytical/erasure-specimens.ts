/**
 * Separating pairs, synthesized: for each coordinate, two schema-valid
 * representations that differ ONLY where that coordinate lives.
 *
 * The corpus cannot supply these. Its fixtures differ from one another in many
 * places at once, so erasing one coordinate almost never makes two of them
 * equal — 79 of 140 erasures identify no two distinct corpus specimens. A
 * footprint claim tested only against that set is unfalsified, not confirmed,
 * and "no witness holds for it" reverts to being a statement about the corpus.
 * That is the ceiling this module raises.
 *
 * A pair is built by taking an existing fixture and writing two values at the
 * ONE slot the coordinate's locator resolves to. Which two values is decided by
 * the OPERATION, because the operation is what defines the distinction:
 *
 *   merge a~b            a  versus  b
 *   member m vs absent   m  versus  the slot deleted
 *   forget a required    two DIFFERENT values the corpus writes there
 *   delete an optional   its value  versus  the slot deleted
 *   forget arity         [x]  versus  [x, y]
 *   forget order         [x, y]  versus  [y, x]
 *   forget incidence     x  versus  y, two names the fixture already binds
 *
 * A pair is kept only when it is genuinely separating: the two sides differ,
 * the coordinate's erasure makes them equal, and both are schema-valid. All
 * three are checked, so a pair that merely looks constructed cannot enter.
 *
 * This synthesizes STIMULI, never judgments. Nothing here consults the engine,
 * and a synthesized pair confers no standing: it exists so a footprint claim
 * has something that could refute it.
 */
import { loadCensus, loadPlans, type Coordinate } from "./census.js";
import { executePlan, resolveSlots, type ErasurePlan, type StructuralLocator } from "./erasure-plan.js";
import { canonical } from "./quotient.js";
import type { Fixture } from "./structure.js";

type Json = Record<string, unknown>;

/** The absence of a value, distinct from any value a slot could hold. */
const DELETE = Symbol("delete");
type Written = unknown | typeof DELETE;

export interface SeparatingPair {
  coordinate: string;
  /** The fixture the pair was written over. */
  base: string;
  a: Fixture;
  b: Fixture;
}

export interface PairFailure {
  coordinate: string;
  reason: string;
}

/** Write one value at every slot a locator resolves to, or delete them. */
function writeAt(fixture: Fixture, locator: StructuralLocator, value: Written): Fixture {
  const copy = JSON.parse(JSON.stringify(fixture)) as Fixture;
  for (const s of resolveSlots(copy, locator)) {
    const parent = s.parent as Json;
    if (value === DELETE) delete parent[s.key as string];
    else parent[s.key as string] = value;
  }
  return copy;
}

/**
 * A value some fixture actually writes at this locator.
 *
 * Searched across the whole corpus rather than taken from the base alone, so a
 * slot the base leaves empty can still be written with something the schema
 * demonstrably accepts.
 */
function valueAt(base: Fixture, plan: ErasurePlan, corpus: Fixture[]): unknown {
  return distinctValuesAt(base, plan, corpus)[0];
}

/**
 * Every DISTINCT value the corpus writes at this locator, base first.
 *
 * `forget-value` needs two of them, and needs them to be different values
 * rather than a value and an absence: holing a slot no longer identifies
 * present with absent, so a pair built that way would not be separating and
 * would be discarded — silently turning a coordinate that is testable into one
 * reported as unbuilt.
 */
function distinctValuesAt(base: Fixture, plan: ErasurePlan, corpus: Fixture[]): unknown[] {
  const out: unknown[] = [];
  const seen = new Set<string>();
  for (const f of [base, ...corpus]) {
    for (const s of resolveSlots(f, plan.locator)) {
      const v = (s.parent as Json)[s.key as string];
      if (v === undefined) continue;
      const k = JSON.stringify(v);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(v);
    }
  }
  return out;
}

/** Every relation and field name the fixture binds, in first-appearance order. */
function names(fixture: Fixture): string[] {
  const out: string[] = [];
  for (const [rel, decl] of Object.entries(fixture.structure.relations)) {
    if (!out.includes(rel)) out.push(rel);
    for (const f of Object.keys(decl.fields)) if (!out.includes(f)) out.push(f);
  }
  return out;
}

/**
 * The two values that isolate this coordinate, or undefined where the base
 * cannot express the distinction.
 *
 * `list` decides the reference shape. It is read from the census — a reference
 * carries `#arity` only when it is a list — rather than guessed from whatever
 * the base happens to hold, so an absent slot is still written correctly.
 */
function valuesFor(plan: ErasurePlan, base: Fixture, list: boolean, corpus: Fixture[]): [Written, Written] | undefined {
  const slots = resolveSlots(base, plan.locator);
  if (slots.length === 0) return undefined;
  const current = valueAt(base, plan, corpus);
  const bound = names(base);
  const op = plan.operation;
  switch (op.kind) {
    case "merge-enum-members":
      return [op.into, op.from];
    case "spell-member-as-absent":
      return [op.member, DELETE];
    case "forget-value": {
      // TWO VALUES, not a value and an absence. This leaf is REQUIRED, so there
      // is no absent state to write: `[current, DELETE]` would build a pair one
      // side of which the schema rejects, and the coordinate would be reported
      // unbuilt when it is perfectly testable.
      //
      // Both come from the corpus, never invented here. Inventing would mean
      // re-reading the schema — the duplication this architecture exists to
      // remove — and the census's `enum` is not a substitute: it stringifies,
      // so `z.literal(true)` reads back as the STRING "true" and every pair
      // built from it is schema-invalid.
      const [a, b] = distinctValuesAt(base, plan, corpus);
      return b === undefined ? undefined : [a, b];
    }
    case "delete-slot":
    case "delete-holder":
    case "forget-branch-field":
      // Here absence is one of the states being identified, so
      // present-versus-absent is exactly the pair that isolates it.
      return current === undefined ? undefined : [current, DELETE];
    case "forget-reference-arity": {
      // A pair astride the DECLARED floor, not `[x]` versus `[x, y]`.
      // `nest.levels` and a peer set both require two members, so the short side
      // of the old pair was schema-invalid and every such pair was discarded —
      // leaving the coordinate reported dead when it is perfectly testable. The
      // shortest list the declaration admits, against one element longer, is the
      // smallest pair that differs in arity and nothing else.
      const floor = plan.locator.arityFloor ?? 1;
      if (bound.length < floor + 1) return undefined;
      return [bound.slice(0, floor), bound.slice(0, floor + 1)];
    }
    case "forget-reference-order": {
      const [x, y] = bound;
      return y === undefined ? undefined : [
        [x, y],
        [y, x],
      ];
    }
    case "forget-reference-incidence": {
      const [x, y] = bound;
      if (y === undefined) return undefined;
      return list ? [[x], [y]] : [x, y];
    }
    case "delete-tagged-holder":
      // A tagged holder's payload cannot be written without knowing the branch
      // signature's required fields; synthesized coordinates are outside the
      // registry anyway, so no pair is attempted.
      return undefined;
  }
}

export interface PairSet {
  pairs: SeparatingPair[];
  unbuilt: PairFailure[];
}

/**
 * One separating pair per plan, written over whichever corpus fixture admits
 * it first.
 *
 * `validate` is the schema validator, passed in rather than imported so this
 * module cannot become a second place that decides what a valid fixture is.
 */
export function separatingPairs(
  fixtures: Fixture[],
  validate: (f: unknown) => string[],
  plans: Map<string, ErasurePlan> = loadPlans(),
  census: Coordinate[] = loadCensus(),
): PairSet {
  const byId = new Map(census.map((c) => [c.id, c]));
  const lists = new Set(census.filter((c) => c.facet === "arity").map((c) => c.leaf));
  const pairs: SeparatingPair[] = [];
  const unbuilt: PairFailure[] = [];

  for (const plan of plans.values()) {
    const coordinate = byId.get(plan.id);
    if (!coordinate) continue;
    const reasons = new Set<string>();
    let built: SeparatingPair | undefined;
    for (const base of fixtures) {
      const values = valuesFor(plan, base, lists.has(coordinate.leaf), fixtures);
      if (!values) {
        reasons.add("the locator resolves to no slot, or the base binds too few names");
        continue;
      }
      const a = writeAt(base, plan.locator, values[0]);
      const b = writeAt(base, plan.locator, values[1]);
      if (canonical(a) === canonical(b)) {
        reasons.add("the two values are indistinguishable after alpha-renaming");
        continue;
      }
      if (canonical(executePlan(a, plan)) !== canonical(executePlan(b, plan))) {
        reasons.add("the erasure does not identify the two values");
        continue;
      }
      const errors = [...validate(a), ...validate(b)];
      if (errors.length > 0) {
        // Only the CLASS is recorded, not every message: the same failure
        // repeats once per relation, and a reason list that grows with the
        // corpus buries which failure it actually was.
        reasons.add("erasing it produces a schema-invalid representation");
        continue;
      }
      built = { coordinate: plan.id, base: base.id, a, b };
      break;
    }
    if (built) pairs.push(built);
    else unbuilt.push({ coordinate: plan.id, reason: [...reasons].join("; ") || "no base fixture attempted" });
  }
  return { pairs, unbuilt };
}
