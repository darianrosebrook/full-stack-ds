/**
 * Quotients over the representation (REL-FIELD-ALGEBRA-02, invariant 6).
 *
 * `erase(fixture, coordinate)` executes the coordinate's erasure plan.
 * `canonical(fixture)` is a name-blind, key-sorted serialization (identifiers
 * confer no standing, so two fixtures that differ only in spelling are the same
 * representation). A necessity witness for coordinate X is a pair (A, B) whose
 * oracle-required outcomes differ while `canonical(erase(A, X)) ===
 * canonical(erase(B, X))`: no consumer of the quotiented representation can tell
 * them apart, so X is necessary.
 *
 * This module used to carry a hand-maintained traversal of the fixture shape —
 * a second reading of the schema, independent of the one the census derives
 * coordinate ids from, and free to disagree with it. It did: eleven coordinates
 * the census named were at labels the walk never produced, so their erasure was
 * a no-op on every input and "no witness holds for it" was a statement about the
 * walk. It now EXECUTES plans the census emits and interprets nothing; the
 * schema has one reader.
 *
 * It is external to the engine: it never judges anything.
 */
import { loadDerivation, type Coordinate } from "./census.js";
import { executeAll, executePlan, synthesizePlan, type ErasurePlan } from "./erasure-plan.js";
import { isForgotten, isMarker, Q, type QuotientImage } from "./quotient-image.js";
import { alphaRename } from "./alpha-rename.js";
import type { Fixture } from "./structure.js";

type Json = Record<string, unknown>;

/**
 * The plan a coordinate's erasure executes, or `undefined` for the `reference`
 * kind — whose spelling confers no standing, so there is nothing to forget. Its
 * STRUCTURE is forgotten by the `#arity` / `#order` / `#incidence` coordinates,
 * each of which has a plan of its own at the same slot.
 *
 * A coordinate the census REFUSES to emit still gets one, synthesized from the
 * same registries, so a refusal stays falsifiable rather than becoming an
 * erasure that quietly does nothing.
 */
export function planFor(coordinate: Coordinate): ErasurePlan | undefined {
  const d = loadDerivation();
  return d.plans.get(coordinate.id) ?? synthesizePlan(coordinate, d.locators, d.requiredLeaves);
}

/**
 * Deep-clone then erase one coordinate everywhere its plan locates it.
 *
 * Throws where no plan can be built. The alternative — returning the fixture
 * untouched — is how eleven coordinates spent this experiment "unwitnessed":
 * every witness naming them failed NO_COLLISION against an unerased fixture,
 * and nothing distinguished that from a semantic result.
 */
export function erase(fixture: Fixture | QuotientImage, coordinate: Coordinate): QuotientImage {
  const plan = planFor(coordinate);
  if (plan) return executePlan(fixture, plan);
  if (coordinate.kind === "reference") return JSON.parse(JSON.stringify(fixture)) as QuotientImage;
  throw new Error(`quotient: no erasure plan for ${coordinate.id} (leaf ${coordinate.leaf}); its erasure would silently do nothing`);
}

/**
 * Erase a set of coordinates in a listing-order-independent way.
 *
 * The order was a hand-written three-way rank here (branch leaves, then member
 * pairs, then discriminator leaves). It is now derived from the plans' own
 * `runAfter` edges, and the difference is not cosmetic: the rank gave a
 * discriminator MERGE and a branch-qualified reference facet the same rank, so
 * listing order decided which ran first, and merging `kind:aggregate-to-grain~join`
 * before erasing `join.from#incidence` relabels the branch out from under the
 * second locator. 14 of 443 stress sets changed; no witness set did.
 */
export function eraseAll(fixture: Fixture | QuotientImage, coordinates: readonly Coordinate[]): QuotientImage {
  const plans = coordinates.map(planFor).filter((p): p is ErasurePlan => p !== undefined);
  return executeAll(fixture, plans);
}

/**
 * Evidence sets are certified confluent EXHAUSTIVELY: every listing is executed.
 * A witness names at most two coordinates and a closure a carrier plus its
 * normalization, so the bound is never approached by evidence; a larger set is
 * refused rather than sampled, because a sampled certificate is not one.
 */
export const CONFLUENCE_BOUND = 7;

/**
 * The distinct canonical images a plan set yields across every listing of it.
 *
 * One element means the set is CONFLUENT on this fixture: whatever order the
 * plans are written in, the ordering derived from their edges and the saturated
 * execution reach the same image. More than one means the composition is
 * order-dependent with no edge to decide it — a genuinely non-confluent set,
 * which admission refuses as evidence rather than normalizing through whichever
 * order the caller happened to write. Merges on one leaf are the case this must
 * NOT refuse: their raw two-step compositions differ by order, and saturation
 * reconciles them to the same class.
 */
export function distinctListingImages(fixture: Fixture | QuotientImage, plans: readonly ErasurePlan[]): string[] {
  if (plans.length > CONFLUENCE_BOUND) {
    throw new RangeError(`quotient: confluence is certified exhaustively up to ${CONFLUENCE_BOUND} plans; ${plans.length} given`);
  }
  const images = new Set<string>();
  for (const listing of permutations(plans)) images.add(canonical(executeAll(fixture, listing)));
  return [...images].sort();
}
function* permutations<T>(xs: readonly T[]): Generator<T[]> {
  if (xs.length <= 1) {
    yield [...xs];
    return;
  }
  for (let i = 0; i < xs.length; i++) {
    for (const rest of permutations([...xs.slice(0, i), ...xs.slice(i + 1)])) yield [xs[i], ...rest];
  }
}

/**
 * Sort keys recursively, and drop a hole's ATTRIBUTION.
 *
 * `by` records which erasures opened a hole. It is diagnostic: which erasure
 * made a hole confers no analytical standing, only that there is one does. If
 * canonical kept it, two images identical except for the route that produced
 * them would fail to collide, and the coordinate id — an encoding choice —
 * would be deciding a necessity result. `members` is NOT dropped: which values
 * were identified is the content of the class.
 */
function sortKeys(v: unknown): unknown {
  if (isForgotten(v)) return { [Q]: "forgotten" };
  if (Array.isArray(v)) return v.map(sortKeys);
  if (typeof v === "object" && v !== null) {
    return Object.fromEntries(
      Object.keys(v as Json)
        .sort()
        .map((k) => [k, sortKeys((v as Json)[k])]),
    );
  }
  return v;
}

/**
 * Positional identifiers in first-appearance order: relations r1.., fields f1..
 *
 * Tolerant of holes, because it runs on images: a forgotten `fields` record has
 * no field names to number, and numbering the marker's own keys would invent
 * identifiers out of the erasure's bookkeeping.
 */
export function nameBlindMap(fixture: Fixture | QuotientImage): Record<string, string> {
  const map: Record<string, string> = {};
  let r = 0;
  let f = 0;
  const relations = (fixture as Fixture).structure?.relations;
  if (isMarker(relations) || typeof relations !== "object" || relations === null) return map;
  for (const [rel, decl] of Object.entries(relations)) {
    if (!(rel in map)) map[rel] = `r${++r}`;
    const fields = (decl as { fields?: unknown })?.fields;
    if (isMarker(fields) || typeof fields !== "object" || fields === null) continue;
    for (const field of Object.keys(fields)) if (!(field in map)) map[field] = `f${++f}`;
  }
  return map;
}

/** Name-blind, key-sorted, id-free serialization of a fixture OR of an image. */
export function canonical(fixture: Fixture | QuotientImage): string {
  const renamed = alphaRename(fixture, nameBlindMap(fixture));
  const { id: _id, ...rest } = renamed as unknown as Json;
  void _id;
  return JSON.stringify(sortKeys(rest));
}

/** Do A and B become the same representation once `coordinate` is erased? */
export function collides(a: Fixture, b: Fixture, coordinate: Coordinate): boolean {
  return canonical(erase(a, coordinate)) === canonical(erase(b, coordinate));
}
