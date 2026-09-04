/**
 * The erasure-plan authority: what it MEANS to forget a representational
 * distinction, in one place, derived from the schema.
 *
 * Four objects were previously conflated, and every walk defect this experiment
 * has produced came from identifying two of them:
 *
 *   coordinate proposition   this distinction may have semantic standing
 *   structural locator       these are the representation occurrences encoding it
 *   forget operation         this is the transformation making it unobservable
 *   semantic footprint       these are ALL propositions that operation destroys
 *
 * A proof system that identifies them will eventually certify its own encoding
 * choices as semantics. The concrete instances: a coordinate id built from
 * schema topology while a handwritten walk reconstructed its location
 * independently (eleven coordinates the census named and the walk never
 * visited); and a closure normalization named after the coordinate handle that
 * implemented a deletion rather than after the operation, which under-reported
 * what the deletion destroys by more than half.
 *
 * This module owns the second and third. The census owns the first and emits
 * the plans. The footprint is MEASURED, never declared — see `erasure-audit.ts`.
 *
 * The locator is a list of steps, not a path string, because a path string has
 * to be re-interpreted by whoever executes it, and re-interpretation is the
 * defect. Five steps close over the kernel schema:
 *
 *   prop        descend into a named property (`sugar` for union scalar sugar)
 *   entries     every entry of a record — each is its own occurrence
 *   elements    every element of an array
 *   branch      only where a discriminated holder carries this member
 *   scalar-only only where the slot carries the union's primitive branch
 *
 * `branch` is the step the old walker had to rediscover from `node.kind`, which
 * is why `field.temporality` — tagged but not a union — was mislabelled and
 * four coordinates went un-erasable.
 */
import type { Coordinate, ReferenceFacet } from "./census.js";
import { absorb, forgotten, isMarker, isMemberClass, memberClass, type QuotientImage, type QuotientMarker } from "./quotient-image.js";
import type { Fixture } from "./structure.js";

export type CoordinateId = string;
export type ErasurePlanId = string;
/** A path in the SCHEMA, branch-qualified. Names a representation fact, not a proposition. */
export type StructuralFactId = string;

export type LocatorStep =
  /** Descend to `name`. With `sugar`, a non-object slot IS this property (union scalar sugar). */
  | { kind: "prop"; name: string; sugar?: true }
  /** Every entry of a record. An entry's existence is its own fact, so entries are slots. */
  | { kind: "entries" }
  /** Every element of an array. */
  | { kind: "elements" }
  /** Keep only slots whose discriminated holder carries this member. */
  | { kind: "branch"; member: string }
  /** Keep only slots carrying the primitive branch of a primitive|object union. */
  | { kind: "scalar-only" };

export interface StructuralLocator {
  /** The schema path the steps arrive at. Descriptive; the steps are what executes. */
  path: StructuralFactId;
  steps: LocatorStep[];
  /**
   * The shortest list the DECLARATION admits here (`minItems`), for list slots.
   *
   * A property of the slot, so it rides on the locator rather than on the
   * operation: the walk is the single reader of the schema, and "how short this
   * list may be" is something only it knows. Arity erasure truncating past it
   * produced `peers: [x]` where two are required — an image the representation
   * cannot express.
   */
  arityFloor?: number;
}

/**
 * The closed, code-owned vocabulary of ways to forget something.
 *
 * A LEAF'S PROPOSITION IS "WHAT THIS SLOT SAYS", and saying nothing is one of
 * the things it can say. So its erasure has to identify every state the slot can
 * be in — each value, and absence where the slot is optional. Two operations do
 * that, and which one applies is decided by the SCHEMA, never by which
 * coordinates happen to be retained:
 *
 *   delete-slot   the leaf is OPTIONAL. Deleting identifies every value with
 *                 each other AND with absence, which is exactly the partition
 *                 wanted, and it adds no path to a representation that lacked
 *                 one.
 *   forget-value  the leaf is REQUIRED. There is no absent state to identify,
 *                 and deleting would leave an image the representation cannot
 *                 express — a declaration missing something it must have. The
 *                 slot stays, holding a hole.
 *   delete-holder the proposition IS existence (`#present`). Present and absent
 *                 must reach the same image, and a hole would keep them apart.
 *
 * A member-pair and a member-absence coordinate are both REFINEMENTS of their
 * leaf — "says a versus says b" and "says m versus says nothing" are each
 * sub-distinctions of "what this slot says" — so a leaf erasure subsuming them
 * is correct, not collateral. The witness audit already classified it that way.
 *
 * `spell-member-as-absent` is not in the four-operation sketch this vocabulary
 * was specified from; it is required because `member-absence` is a coordinate
 * kind, and its erasure is a CONDITIONAL deletion (delete the slot only where it
 * carries this member), which no unconditional delete expresses.
 */
export type ForgetOperation =
  | { kind: "forget-value" }
  | { kind: "delete-slot" }
  | { kind: "delete-holder" }
  | { kind: "merge-enum-members"; from: string; into: string }
  | { kind: "spell-member-as-absent"; member: string }
  | { kind: "delete-tagged-holder"; member: string }
  | { kind: "forget-reference-arity" }
  | { kind: "forget-reference-order" }
  | { kind: "forget-reference-incidence" }
  | { kind: "forget-branch-field"; branch: string; field: string };

export interface ErasurePlan {
  id: ErasurePlanId;
  locator: StructuralLocator;
  operation: ForgetOperation;
  /**
   * Schema paths the operation alters or deletes, including syntax that carries
   * no coordinate. Derived from the walk, not from string prefixes on ids.
   */
  representationEffects: StructuralFactId[];
  /**
   * Plans that must execute BEFORE this one, because this one invalidates their
   * locator. Derived: only a discriminator-modifying plan has any, and its
   * predecessors are exactly the plans that `branch` on that discriminator.
   */
  runAfter?: ErasurePlanId[];
}

/** The single name every reference at an incidence-erased path collapses toward. */
export const INCIDENCE_TOKEN = "zz_erased_reference";

/** Holders whose named entries survive being emptied: a field, a relation. */
const NAMED_HOLDERS = new Set(["fields", "relations"]);

type Json = Record<string, unknown>;
type Container = Record<string, unknown> | unknown[];
interface Slot {
  parent: Container;
  key: string | number;
}

const obj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const read = (s: Slot): unknown => (s.parent as Json)[s.key as string];
const write = (s: Slot, v: unknown): void => {
  (s.parent as Json)[s.key as string] = v;
};

function step(s: Slot, st: LocatorStep): Slot[] {
  const v = read(s);
  // A hole is OPAQUE: nothing is reachable through it. Descending into one
  // would let a later erasure act on the inside of something already
  // forgotten, and — via the sugar rule, where a non-object slot IS the value
  // property — would treat a marker as the record form it replaced.
  if (isMarker(v)) return [];
  switch (st.kind) {
    case "prop":
      if (obj(v)) return [{ parent: v, key: st.name }];
      // Union scalar sugar: `3` and `{ value: 3 }` are the same observation, so
      // a bare scalar IS the `value` slot. Without this the sugar form is
      // unreachable and `observation.value` is erasable only where the fixture
      // happened to spell the record form.
      return st.sugar ? [s] : [];
    case "entries":
      return obj(v) ? Object.keys(v).map((k) => ({ parent: v, key: k })) : [];
    case "elements":
      return Array.isArray(v) ? v.map((_, i) => ({ parent: v, key: i })) : [];
    case "branch":
      return obj(v) && v.kind === st.member ? [s] : [];
    case "scalar-only":
      return obj(v) ? [] : [s];
  }
}

/** Every occurrence the locator arrives at, as (container, key) pairs. */
export function resolveSlots(fixture: Fixture | QuotientImage, locator: StructuralLocator): Slot[] {
  const wrapper: Json = { root: fixture };
  let slots: Slot[] = [{ parent: wrapper, key: "root" }];
  for (const st of locator.steps) slots = slots.flatMap((s) => step(s, st));
  return slots;
}

/**
 * Does this slot carry something the operation would alter?
 *
 * The presence test guards EVERY operation, not just the deletions. A locator
 * arrives at a slot whether or not the property is declared there, so an
 * unguarded rewrite would WRITE the slot into existence: incidence erasure on
 * an undeclared `along` added `along: "zz_erased_reference_0"` to 76 fixtures
 * that had never declared it, turning a reach of 6 into 82. Forgetting must
 * never be able to add a declaration.
 */
function affects(s: Slot, op: ForgetOperation, floor = 1): boolean {
  const present = Array.isArray(s.parent) ? (s.key as number) < s.parent.length : (s.key as string) in (s.parent as Json);
  if (!present) return false;
  const v = read(s);
  switch (op.kind) {
    case "forget-value":
    case "delete-slot":
    case "delete-holder":
    case "forget-branch-field":
      return present;
    case "merge-enum-members":
      // Symmetric in `from` and `into`, unlike the string rewrite it replaces.
      // The proposition is "these two are the same", so a slot carrying EITHER
      // must reach the same class — otherwise composing two merges over one
      // leaf leaves the untouched member outside the class the others reached,
      // and the result depends on listing order.
      return mergesHere(v, op);
    case "spell-member-as-absent":
      return v === op.member;
    case "delete-tagged-holder":
      return obj(v) && v.kind === op.member;
    case "forget-reference-arity":
      return Array.isArray(v) && v.length > floor;
    case "forget-reference-order":
      return Array.isArray(v) && JSON.stringify(v) !== JSON.stringify([...v].sort());
    case "forget-reference-incidence":
      if (Array.isArray(v)) return v.some((x, i) => x !== `${INCIDENCE_TOKEN}_${i}`);
      return !obj(v) && v !== `${INCIDENCE_TOKEN}_0`;
  }
}

/**
 * Drop duplicates by VALUE, not by reference.
 *
 * `new Set` was enough while a merge wrote a string; a merged class is an
 * object, so two slots that reached the same class would survive as two
 * distinct list members and the merge would fail to identify them.
 */
function dedupe(xs: unknown[]): unknown[] {
  const seen = new Set<string>();
  return xs.filter((x) => {
    const k = JSON.stringify(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Does this value, or any member of this list, fall in the merged class? */
function mergesHere(v: unknown, op: { from: string; into: string }): boolean {
  const one = (x: unknown): boolean =>
    x === op.from || x === op.into || (isMemberClass(x) && x.members.some((m) => m === op.from || m === op.into));
  return Array.isArray(v) ? v.some(one) : one(v);
}

/**
 * Whether executing the plan would touch the representation at all.
 *
 * A SOUND fast path, in one direction only: false means the executor provably
 * leaves the object identical, so the canonical form is unchanged. True means
 * only that something is there to act on — the canonical form may still be
 * equal, because canonicalization is name-blind. Callers that need the exact
 * answer must compare canonical forms; this is for pruning.
 */
export function wouldChange(fixture: Fixture | QuotientImage, plan: ErasurePlan): boolean {
  return resolveSlots(fixture, plan.locator).some((s) => affects(s, plan.operation, plan.locator.arityFloor));
}

/**
 * Deep-clone and execute one plan over every occurrence its locator finds.
 *
 * Takes a fixture OR an image and returns an IMAGE. The input widening is what
 * makes composition typecheck; the output is what stops the result being handed
 * back as a `Fixture` it is not. `QuotientImage` is an index-signature object,
 * so a `Fixture` is assignable to it and it is not assignable to a `Fixture` —
 * which is the direction that matters, and it is the compiler that enforces it
 * rather than a reviewer.
 */
export function executePlan(fixture: Fixture | QuotientImage, plan: ErasurePlan): QuotientImage {
  const copy = JSON.parse(JSON.stringify(fixture)) as QuotientImage;
  const slots = resolveSlots(copy, plan.locator);
  const emptied: Json[] = [];
  const op = plan.operation;
  const floor = plan.locator.arityFloor ?? 1;
  /** Fold a suppression into whatever already stands at the slot. */
  const suppress = (s: Slot, m: QuotientMarker) => write(s, absorb(read(s), m));

  // Deletions are collected and applied afterwards, highest array index first:
  // splicing while iterating would renumber the slots still to be visited, and
  // `delete arr[i]` would leave a hole that serializes as `null` — a shape the
  // schema does not admit and nothing downstream can read.
  const deletions: Slot[] = [];
  const remove = (s: Slot) => deletions.push(s);

  for (const s of slots) {
    if (!affects(s, op, floor)) continue;
    const v = read(s);
    switch (op.kind) {
      case "forget-value":
        // A REQUIRED leaf: the slot survives as a hole. Deleting it would leave
        // a declaration missing something it must have — an image the
        // representation cannot express, and the whole reason this codomain
        // exists. There is no absent state here to identify it with.
        suppress(s, forgotten([plan.id]));
        break;
      case "delete-slot":
      case "delete-holder":
      case "forget-branch-field":
        remove(s);
        break;
      case "merge-enum-members": {
        // A CLASS, not a rewrite. Writing `into` over `from` asserts the value
        // is `into`, which for a discriminator means writing one branch's tag
        // over another branch's payload — `{kind:"aggregate-to-grain",
        // levels:[…]}` claims to be an aggregation while carrying a nesting.
        // A class identifies the two without claiming either.
        const cls = memberClass([op.from, op.into]);
        if (Array.isArray(v)) {
          write(s, dedupe(v.map((x) => (mergesHere(x, op) ? absorb(x, cls) : x))));
        } else {
          suppress(s, cls);
        }
        break;
      }
      case "spell-member-as-absent":
        // A representation that cannot say `m` explicitly must express it by
        // leaving the slot off. If nothing downstream tells the two apart, `m`
        // is a redundant spelling of the default rather than a degree of freedom.
        if (v === op.member) remove(s);
        break;
      case "delete-tagged-holder":
        // Absence of a DISCRIMINATED declaration is absence of the whole
        // declaration, not of its tag: `{kind, from, keep}` stripped to
        // `{from, keep}` is neither absence nor schema-valid.
        if (obj(v) && v.kind === op.member) remove(s);
        break;
      case "forget-reference-arity":
        // To the DECLARATION's floor, not to one. Truncating past the floor
        // produced `peers: [x]` where the schema requires two — an image the
        // representation cannot express — and it also erased more than arity:
        // cutting a 2-list to 1 identifies [a,b] with [a,c], which differ in
        // incidence and not in arity at all.
        //
        // Truncation still conflates the two ABOVE the floor: [a,b,c] and
        // [a,b,d] both become [a,b]. That is a limit of expressing three
        // independent facets by cutting one list, not something the floor fixes.
        if (Array.isArray(v)) write(s, v.slice(0, floor));
        break;
      case "forget-reference-order":
        if (Array.isArray(v)) write(s, [...v].sort());
        break;
      case "forget-reference-incidence":
        // Incidence is CO-REFERENCE: which positions name the same thing. Each
        // position gets its own token, so no position co-refers with any other
        // while arity and order survive. Collapsing to a single token would
        // erase three coordinates at once, and a quotient that destroys three
        // cannot support a claim that any one of them is necessary.
        if (Array.isArray(v)) write(s, v.map((_, i) => `${INCIDENCE_TOKEN}_${i}`));
        else if (!obj(v)) write(s, `${INCIDENCE_TOKEN}_0`);
        break;
    }
  }

  const arrays = new Map<unknown[], number[]>();
  for (const s of deletions) {
    if (Array.isArray(s.parent)) {
      const idx = arrays.get(s.parent) ?? [];
      idx.push(s.key as number);
      arrays.set(s.parent, idx);
    } else {
      delete (s.parent as Json)[s.key as string];
      emptied.push(s.parent as Json);
    }
  }
  for (const [arr, idx] of arrays) {
    for (const i of [...idx].sort((a, b) => b - a)) arr.splice(i, 1);
    // An emptied ARRAY declaration is dropped exactly as an emptied object one
    // is: `peers: []` violates the schema's minItems and is not a peer claim.
    // Splicing rather than `delete` is what makes this reachable — deleting an
    // element leaves a hole that serializes as `null`, a shape the schema does
    // not admit and nothing downstream can read.
    if (arr.length === 0) emptied.push(arr as unknown as Json);
  }

  // A sub-declaration emptied by erasure carries no coordinate: drop it from its
  // holder (`whole: {perRow}` with perRow gone is no declaration of a whole;
  // `{null}` with null gone is no observation). Named declarations (a field, a
  // relation) and positional ones (an assertion, a row) stay, empty or not.
  for (const e of emptied) if (Object.keys(e).length === 0) dropEmpty(copy as unknown as Json, e, null);
  return copy;
}

function dropEmpty(root: unknown, target: Json, viaKey: string | null): void {
  if (typeof root !== "object" || root === null) return;
  if (Array.isArray(root)) {
    for (const item of root) dropEmpty(item, target, null);
    return;
  }
  const node = root as Json;
  for (const key of Object.keys(node)) {
    if (node[key] === target) {
      if (viaKey === null || !NAMED_HOLDERS.has(viaKey)) delete node[key];
    } else dropEmpty(node[key], target, key);
  }
}

/**
 * Execute a set of plans in an order derived from their `runAfter` edges.
 *
 * The order used to be a hand-written three-way rank (branch leaves, then
 * member pairs, then discriminator leaves) living in the walker — a second,
 * subtler copy of schema interpretation. It is now a topological sort over
 * edges the census emits, and `erasure-audit.ts` proves the remaining pairs
 * commute, so the sort is the only ordering claim the system makes.
 */
export function executeAll(fixture: Fixture | QuotientImage, plans: readonly ErasurePlan[]): QuotientImage {
  const ordered = orderPlans(plans);
  let image: QuotientImage = ordered.reduce<QuotientImage>((f, p) => executePlan(f, p), fixture);

  // THE FIXPOINT IS THE CONFLUENCE LAW, not an optimisation guard.
  //
  // A set of merges over one leaf is not the composition of the individual
  // merges: {sum,mean} then {mean,count} leaves `count` outside the class the
  // other two reached, because the first pass never looked at it. Iterating
  // until nothing moves computes the transitive closure — the union-find every
  // set of merge plans actually denotes — and that result cannot depend on the
  // order the plans were listed in.
  //
  // It terminates because every pass either changes nothing or strictly grows a
  // member class, and the classes are bounded by the leaf's enum. The bound is
  // asserted rather than assumed: exceeding it is a defect in the operations,
  // and silently returning a half-closed image would be worse than failing.
  if (!ordered.some((p) => p.operation.kind === "merge-enum-members")) return image;
  for (let pass = 0; ; pass++) {
    if (pass > MAX_CLOSURE_PASSES) throw new Error(`erasure-plan: merge closure did not settle in ${MAX_CLOSURE_PASSES} passes`);
    const next = ordered.reduce<QuotientImage>((f, p) => executePlan(f, p), image);
    if (JSON.stringify(next) === JSON.stringify(image)) return image;
    image = next;
  }
}

/** Larger than any enum in the kernel schema, so only a defect can reach it. */
const MAX_CLOSURE_PASSES = 32;

/** Topological order of `runAfter` edges; ties keep the callers order (stable). */
export function orderPlans(plans: readonly ErasurePlan[]): ErasurePlan[] {
  const present = new Set(plans.map((p) => p.id));
  const depth = new Map<ErasurePlanId, number>();
  const byId = new Map(plans.map((p) => [p.id, p]));
  const rank = (id: ErasurePlanId, seen: Set<ErasurePlanId>): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    if (seen.has(id)) return 0; // a cycle is reported by the audit, not silently reordered here
    seen.add(id);
    const p = byId.get(id);
    const deps = (p?.runAfter ?? []).filter((d) => present.has(d));
    const r = deps.length === 0 ? 0 : 1 + Math.max(...deps.map((d) => rank(d, seen)));
    depth.set(id, r);
    return r;
  };
  return [...plans].sort((a, b) => rank(a.id, new Set()) - rank(b.id, new Set()));
}

/**
 * Does `outer`'s locator contain `inner`'s — structurally, on the step list?
 *
 * The step list, never the id string. An id is an encoding choice, and a
 * containment computed from ids certifies that choice as semantics; it is also
 * simply wrong here, because `field.whole` ends in `scalar-only` and is not a
 * prefix of `field.whole.perRow` even though one id prefixes the other.
 */
export function containsSteps(outer: StructuralLocator, inner: StructuralLocator): boolean {
  const a = outer.steps;
  const b = inner.steps;
  return a.length <= b.length && a.every((s, i) => JSON.stringify(s) === JSON.stringify(b[i]));
}

/**
 * Operations that make their whole slot unobservable, so everything inside goes.
 *
 * `forget-value` belongs here even though it deletes nothing: a hole is OPAQUE,
 * nothing is reachable through it, and a distinction beneath the slot is as
 * destroyed by a hole as by a deletion. Renamed from `UNCONDITIONAL_DELETIONS`
 * because "deletion" stopped being the shared property once a value erasure
 * left the slot standing.
 */
export const TOTAL_SUPPRESSIONS: ReadonlySet<ForgetOperation["kind"]> = new Set([
  "forget-value",
  "delete-slot",
  "delete-holder",
  "forget-branch-field",
]);

/**
 * The subset that actually REMOVES the slot from its parent.
 *
 * Narrower than `TOTAL_SUPPRESSIONS` on purpose: the "deleting every element
 * empties the array" rule only holds for operations that remove elements. A
 * `forget-value` over elements writes one hole per element and leaves the array
 * exactly as long as it was.
 */
const REMOVALS: ReadonlySet<ForgetOperation["kind"]> = new Set(["delete-slot", "delete-holder", "forget-branch-field"]);

/**
 * Every coordinate a TOTAL SUPPRESSION makes unobservable.
 *
 * Exported here rather than in the audit so that a plan which is not a
 * coordinate — a closure's `forget-branch-field` — computes its footprint the
 * same way every coordinate plan does, from the same locator registry. The
 * audit then falsifies the result against specimens; this function only claims.
 */
export function deletionFootprint(plan: ErasurePlan, plans: Iterable<ErasurePlan>): string[] {
  if (!TOTAL_SUPPRESSIONS.has(plan.operation.kind)) return [];
  const steps = plan.locator.steps;
  // REMOVING every ELEMENT of an array empties it, and an emptied declaration
  // is dropped from its holder — so an element removal is at least as coarse
  // as removing the array itself. The containment test alone cannot see this:
  // the array's locator is SHORTER, so it contains the element plan rather than
  // the other way round. Found by the falsification pass, which reported
  // `structure.peers[]#present -> structure.peers#present` as supported and
  // unclaimed; claimed here rather than left as an under-report.
  //
  // Keyed on REMOVALS, not on every total suppression: holing each element
  // leaves the array exactly as long as it was, so it empties nothing.
  const removes = REMOVALS.has(plan.operation.kind);
  const parent =
    removes && steps.length > 0 && steps[steps.length - 1].kind === "elements" ? { path: plan.locator.path, steps: steps.slice(0, -1) } : undefined;
  return [...plans]
    .filter(
      (q) =>
        containsSteps(plan.locator, q.locator) ||
        (parent !== undefined && REMOVALS.has(q.operation.kind) && stepsEqual(parent.steps, q.locator.steps)),
    )
    .map((q) => q.id)
    .sort();
}

const stepsEqual = (a: readonly LocatorStep[], b: readonly LocatorStep[]) =>
  a.length === b.length && a.every((s, i) => JSON.stringify(s) === JSON.stringify(b[i]));

/**
 * A plan for a path that is NOT a coordinate.
 *
 * A closure's normalization is the case: `forget-branch-field` deletes a
 * branch-conditional payload, an operation that happens not to correspond
 * one-to-one with a retained coordinate. It is not a second system — it takes
 * its location from the same census registry every coordinate plan does.
 *
 * It throws rather than returning undefined on a missing locator, because the
 * failure mode of a silently absent plan is an erasure that quietly does
 * nothing, and an obligation that "passes" against an unerased fixture is worse
 * than one that fails.
 */
export function planAt(id: ErasurePlanId, path: string, locators: Map<string, StructuralLocator>, operation: ForgetOperation): ErasurePlan {
  const locator = locators.get(path);
  if (!locator) throw new Error(`erasure-plan: no locator for ${path}; ${id} would erase nothing`);
  return { id, locator, operation, representationEffects: [] };
}

/**
 * A plan for a coordinate the census does NOT emit.
 *
 * This is the falsification path, and it has to exist. Several census rules are
 * refusals — no member-absence on a discriminator, no presence proposition for a
 * required branch child — and a refusal is only falsifiable if the refused
 * coordinate can still be constructed, erased, and shown to misbehave. Without
 * it, `isolationViolation` could never demonstrate WHY the seven
 * `derivedBy.kind:X~<absent>` ids are seven spellings of holder presence; the
 * rule would rest on argument alone.
 *
 * It reads the census's own registries rather than the schema, so it cannot
 * disagree with them about where anything lives.
 */
export function synthesizePlan(
  c: Coordinate,
  locators: Map<string, StructuralLocator>,
  requiredLeaves: ReadonlySet<string>,
): ErasurePlan | undefined {
  // Absence of a REQUIRED leaf is absence of its whole declaration: deleting
  // only the leaf leaves a holder the schema rejects — `{grain: "day"}` with no
  // `kind`, or a branch payload with no branch — so the quotient would stop
  // being "member m versus absent" without saying so. Every census-emitted
  // member-absence coordinate is on an OPTIONAL leaf, so this is reached only
  // by a synthesized falsification coordinate; that is its purpose.
  if (c.kind === "member-absence" && requiredLeaves.has(c.leaf)) {
    const locator = locators.get(c.leaf.replace(/\.[^.]+$/, ""));
    return locator ? { id: c.id, locator, operation: { kind: "delete-tagged-holder", member: c.members![0] }, representationEffects: [] } : undefined;
  }
  const locator = locators.get(c.leaf);
  const operation = operationFor(c, requiredLeaves);
  return locator && operation ? { id: c.id, locator, operation, representationEffects: [] } : undefined;
}

/**
 * The coordinate kinds that carry an erasure, and the operation each one names.
 *
 * `requiredLeaves` is a SCHEMA fact the census walk collects, not a reading of
 * which coordinates survived subtraction. That matters: an operation chosen from
 * the retained population would make the erasure algebra shift under its own
 * results, so "is this leaf required by its holder" has to come from the
 * declaration and nowhere else.
 */
export function operationFor(c: Coordinate, requiredLeaves: ReadonlySet<string> = new Set()): ForgetOperation | undefined {
  switch (c.kind) {
    case "reference":
      // Spelling confers no standing — the alpha-renaming invariant — so there
      // is nothing to forget. Its STRUCTURE is forgotten by the facet plans.
      return undefined;
    case "member-pair":
      return { kind: "merge-enum-members", from: c.members![1], into: c.members![0] };
    case "member-absence":
      return { kind: "spell-member-as-absent", member: c.members![0] };
    case "reference-topology":
      return referenceOperation(c.facet!);
    case "leaf":
      if (c.id.endsWith("#present")) return { kind: "delete-holder" };
      // An OPTIONAL leaf can say nothing, and "says nothing" is one of the
      // states its erasure must identify — deletion does that and adds no path.
      // A REQUIRED one has no such state, and deleting it would leave a
      // declaration missing something it must have.
      return requiredLeaves.has(c.leaf) ? { kind: "forget-value" } : { kind: "delete-slot" };
  }
}

const referenceOperation = (f: ReferenceFacet): ForgetOperation =>
  f === "arity" ? { kind: "forget-reference-arity" } : f === "order" ? { kind: "forget-reference-order" } : { kind: "forget-reference-incidence" };
