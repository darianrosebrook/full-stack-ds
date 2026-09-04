/**
 * Name-blinding: rename every relation and field, everywhere they are referenced.
 *
 * This is the apparatus behind two claims, and it is NOT a judgment rule:
 *
 *   the alpha-renaming invariant — a renamed fixture must judge identically to
 *   the original, up to `renameSubject`, because identifier spelling confers no
 *   analytical standing;
 *
 *   `canonical` — two representations that differ only in spelling are the same
 *   representation, so the collision oracle renames before it compares.
 *
 * IT LIVES HERE, AND NOT IN `structure.ts`, FOR AN AUTHORITY REASON. `structure.ts`
 * is a declared RULE SOURCE: `normalizeObservation` decides what a row says, so
 * its bytes can move a judgment and the holdout digest covers them. These
 * functions cannot move a judgment — no engine calls them — but they must reach
 * marker semantics, because `canonical` renames quotient IMAGES and a marker is
 * a legal value wherever a value is.
 *
 * Left in `structure.ts`, that import made `quotient-image.ts` reachable from the
 * rule surface, and `experiments.test.ts` caught it. The right repair was not to
 * add the module to the allow-list: it was to notice that the judgment engine
 * had acquired a path to the quotient apparatus it must never depend on. The
 * engine judges source `Fixture` declarations; images are compared outside it.
 */
import type { AdditivityDecl, Assertion, FieldDecl, Fixture, RelationDecl } from "./relation-model.js";
import { isMarker, type QuotientImage } from "./quotient-image.js";

const rn = (map: Record<string, string>) => (s: string) => map[s] ?? s;

/**
 * Rename relations and fields everywhere they are referenced. Used to prove
 * that identifier spelling confers no analytical standing: the judgment of a
 * renamed fixture must equal the original's up to `renameSubject`.
 *
 * Takes a fixture OR an image and returns an IMAGE, always — no overload
 * pretending the fixture case round-trips. A caller that knows its input has no
 * markers (the alpha-renaming invariant, which runs on corpus lines) narrows at
 * the call site and says why; that is one visible assertion instead of a
 * signature quietly making it for everyone.
 *
 * This is a hand-written rebuild that names its keys — the shape its own doc
 * comment records a past failure of. It is not trusted here either: the
 * canonicalizer is separately falsified against every plan, so a slot it forgot
 * to carry surfaces as a dropped marker rather than as a silent collision.
 */
export function alphaRename(fixture: Fixture | QuotientImage, map: Record<string, string>): QuotientImage {
  const source = fixture as Fixture;
  const r = rn(map);
  // Tolerant of erased leaves: a quotiented fixture (quotient.ts) may lack any of them.
  const names = (xs: unknown) => (Array.isArray(xs) ? (xs as string[]).map(r) : xs);
  /**
   * Rebuild a record, or hand back a marker untouched.
   *
   * A marker stands for a subtree that is no longer there. Rebuilding THROUGH
   * one would iterate its `@q`/`by` keys as if they were record entries; DROPPING
   * one is worse still, because the canonicalizer would then be blind to the
   * hole and two images differing only by it would collide.
   */
  const rebuild = <T>(v: unknown, each: (entries: [string, T][]) => unknown): unknown =>
    isMarker(v) ? v : v === undefined ? undefined : each(Object.entries(v as Record<string, T>));

  const relations = rebuild<RelationDecl>(source.structure.relations, (rels) => {
    const out: Record<string, unknown> = {};
    for (const [name, rel] of rels) {
      if (isMarker(rel)) {
        out[r(name)] = rel;
        continue;
      }
      const fields = rebuild<FieldDecl>(rel.fields, (fs) => {
        const acc: Record<string, unknown> = {};
        for (const [fname, f] of fs) {
          if (isMarker(f)) {
            acc[r(fname)] = f;
            continue;
          }
          const g: FieldDecl = { ...f };
          if (f.additivity && !isMarker(f.additivity) && "nonAdditiveAlong" in f.additivity) {
            g.additivity = { ...f.additivity, nonAdditiveAlong: names(f.additivity.nonAdditiveAlong) } as AdditivityDecl;
          }
          if (typeof f.whole === "object" && !isMarker(f.whole) && typeof f.whole.perRow === "string") g.whole = { perRow: r(f.whole.perRow) };
          acc[r(fname)] = g;
        }
        return acc;
      });
      const grain = rel.grain === undefined || isMarker(rel.grain) ? rel.grain : rel.grain === "unknown" ? "unknown" : names(rel.grain);
      out[r(name)] = {
        ...(grain !== undefined ? { grain } : {}),
        ...(fields !== undefined ? { fields } : {}),
        ...(rel.derivedBy ? { derivedBy: isMarker(rel.derivedBy) ? rel.derivedBy : renameDerivation(rel.derivedBy, r, names) } : {}),
      };
    }
    return out;
  });

  const assertions = isMarker(source.assertions)
    ? source.assertions
    : source.assertions.map((a) => {
        if (isMarker(a)) return a;
        const base = { ...a, ...(a.relation !== undefined ? { relation: r(a.relation) } : {}), ...(a.field !== undefined ? { field: r(a.field) } : {}) };
        if ("along" in a && a.along) return { ...base, along: names(a.along) } as Assertion;
        return base as Assertion;
      });

  let evidence: unknown;
  if (source.evidence !== undefined) {
    if (isMarker(source.evidence)) evidence = source.evidence;
    else {
      const e: Record<string, unknown> = {};
      const rows = rebuild<Record<string, unknown>[]>(source.evidence.rows, (rs) =>
        Object.fromEntries(
          rs.map(([rel, rowList]) => [
            r(rel),
            isMarker(rowList) ? rowList : rowList.map((row) => (isMarker(row) ? row : Object.fromEntries(Object.entries(row).map(([k, v]) => [r(k), v])))),
          ]),
        ),
      );
      const grainWitness = rebuild<string[]>(source.evidence.grainWitness, (gs) =>
        Object.fromEntries(gs.map(([rel, keys]) => [r(rel), isMarker(keys) ? keys : keys.map(r)])),
      );
      if (rows !== undefined) e.rows = rows;
      if (grainWitness !== undefined) e.grainWitness = grainWitness;
      evidence = e;
    }
  }

  const peers = source.structure.peers;
  return {
    id: source.id,
    structure: {
      relations,
      ...(peers !== undefined ? { peers: isMarker(peers) ? peers : peers.map(names) } : {}),
    },
    assertions,
    ...(evidence !== undefined ? { evidence } : {}),
  } as unknown as QuotientImage;
}

/**
 * Rename a derivation's name-bearing operands, and only those.
 *
 * `from` and `with` name relations; `toGrain`, `levels`, `keep`, `field`,
 * `edgeFrom`, `edgeTo` and `value` name fields. `kind`, `cardinality`,
 * `closure` and `requiresConservation` are VALUES of closed vocabularies, not
 * identifiers, and renaming them would make a spelling confer standing rather
 * than removing it.
 *
 * The slots are listed rather than inferred because a rebuild that names its
 * keys stops covering any key added later — the failure this function is being
 * repaired from. A `derivedBy` this did not carry was invisible to
 * `canonical`, which made every derivation coordinate collide with everything
 * and would have let a necessity witness pass without erasing anything.
 */
function renameDerivation(
  d: NonNullable<RelationDecl["derivedBy"]>,
  r: (s: string) => string,
  names: (xs: unknown) => unknown,
): NonNullable<RelationDecl["derivedBy"]> {
  const out = { ...d } as Record<string, unknown>;
  for (const slot of ["from", "with", "field", "edgeFrom", "edgeTo", "value"]) {
    if (typeof out[slot] === "string") out[slot] = r(out[slot] as string);
  }
  for (const slot of ["toGrain", "levels", "keep"]) {
    if (Array.isArray(out[slot])) out[slot] = names(out[slot]);
  }
  return out as NonNullable<RelationDecl["derivedBy"]>;
}

/** Apply a rename map to a judgment subject (`rel`, `rel.field`). */
export function renameSubject(subject: string, map: Record<string, string>): string {
  const r = rn(map);
  return subject.split(".").map(r).join(".");
}
