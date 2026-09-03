/**
 * Quotients over the representation (REL-FIELD-ALGEBRA-02, invariant 6).
 *
 * `erase(fixture, coordinate)` removes a coordinate from a fixture: a leaf is
 * deleted wherever it occurs; a member pair is merged by rewriting the second
 * member as the first. `canonical(fixture)` is a name-blind, key-sorted
 * serialization (identifiers confer no standing, so two fixtures that differ
 * only in spelling are the same representation). A necessity witness for
 * coordinate X is a pair (A, B) whose oracle-required outcomes differ while
 * `canonical(erase(A, X)) === canonical(erase(B, X))`: no consumer of the
 * quotiented representation can tell them apart, so X is necessary.
 *
 * This module is external to the engine: it never judges anything.
 */
import type { Coordinate } from "./census.js";
import { alphaRename, type Fixture } from "./structure.js";

type Json = Record<string, unknown>;

/** The single name every reference at an incidence-erased path collapses to. */
const INCIDENCE_TOKEN = "zz_erased_reference";

/** Visit every labelled node of a fixture; `visit` may mutate `parent[key]`. */
function walkFixture(fixture: Json, visit: (labelId: string, parent: Json, key: string) => void): void {
  const obj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
  // A `kind`-discriminated object labels its other properties by branch, as the census does.
  const props = (node: Json, prefix: string) => {
    const branch = typeof node.kind === "string" ? `${prefix}.${node.kind}` : prefix;
    for (const key of Object.keys(node)) visit(key === "kind" ? `${prefix}.kind` : `${branch}.${key}`, node, key);
  };
  const structure = fixture.structure as Json | undefined;
  if (structure) {
    if ("peers" in structure) visit("structure.peers", structure, "peers");
    const relations = (structure.relations ?? {}) as Record<string, Json>;
    for (const rel of Object.values(relations)) {
      if ("grain" in rel) visit("relation.grain", rel, "grain");
      // The derivation is part of the relation's declaration, so the quotient
      // must reach it: without this every coordinate the L3 algebra admits is
      // un-erasable, and a witness naming one could only fail NO_COLLISION or
      // pass for the wrong reason.
      if (obj(rel.derivedBy)) props(rel.derivedBy as Json, "relation.derivedBy");
      const fields = (rel.fields ?? {}) as Record<string, Json>;
      for (const f of Object.values(fields)) {
        for (const key of Object.keys(f)) {
          const v = f[key];
          if (key === "whole") {
            if (obj(v)) visit("field.whole.perRow", v, "perRow");
            else visit("field.whole", f, "whole");
          } else if (obj(v)) {
            props(v, `field.${key}`);
          } else visit(`field.${key}`, f, key);
        }
      }
    }
  }
  const assertions = (fixture.assertions ?? []) as Json[];
  for (const a of assertions) props(a, "assertion");
  const evidence = fixture.evidence as Json | undefined;
  if (evidence) {
    const rows = (evidence.rows ?? {}) as Record<string, Record<string, unknown>[]>;
    for (const relRows of Object.values(rows)) {
      for (const row of relRows) {
        for (const key of Object.keys(row)) {
          const o = row[key];
          if (obj(o)) props(o, "observation");
          else visit("observation.value", row, key);
        }
      }
    }
    if ("grainWitness" in evidence) visit("evidence.grainWitness", evidence, "grainWitness");
  }
}

/** Deep-clone then erase one coordinate everywhere it occurs. */
export function erase(fixture: Fixture, coordinate: Coordinate): Fixture {
  const copy = JSON.parse(JSON.stringify(fixture)) as Json;
  const cleanup: Json[] = [];
  // A reference coordinate's id carries a `#facet` suffix; the walk labels
  // nodes by their base path, so match on the leaf.
  const isPresence = coordinate.kind === "leaf" && coordinate.id.endsWith("#present");
  walkFixture(copy, (id, parent, key) => {
    if (coordinate.kind === "reference-topology" && id === coordinate.leaf) {
      const v = parent[key];
      if (coordinate.facet === "arity" && Array.isArray(v)) {
        // How MANY names are bound stops being expressible.
        parent[key] = v.slice(0, 1);
      } else if (coordinate.facet === "order" && Array.isArray(v)) {
        // Their sequence stops being expressible; membership survives.
        parent[key] = [...v].sort();
      } else if (coordinate.facet === "incidence") {
        // What incidence erases is CO-REFERENCE: which reference positions
        // name the same thing. Each position therefore gets its own token, so
        // no position co-refers with any other while arity and sequence are
        // untouched. Collapsing the list to a single token would erase arity
        // and order too, and a quotient that destroys three coordinates at
        // once cannot support a claim that any one of them is necessary.
        parent[key] = Array.isArray(v)
          ? v.map((_, i) => `${INCIDENCE_TOKEN}_${i}`)
          : `${INCIDENCE_TOKEN}_0`;
      }
      return;
    }
    if (isPresence && id === coordinate.leaf) {
      delete parent[key];
      cleanup.push(parent);
      return;
    }
    if (coordinate.kind === "leaf" && id === coordinate.leaf) {
      // a bare scalar observation IS its value, so erasing the value erases the observation,
      // exactly as `{value}` erased to `{}` is dropped below.
      delete parent[key];
      cleanup.push(parent);
    } else if (coordinate.kind === "member-pair" && id === coordinate.leaf && coordinate.members) {
      const [a, b] = coordinate.members;
      const v = parent[key];
      if (v === b) parent[key] = a;
      else if (Array.isArray(v)) parent[key] = [...new Set(v.map((x) => (x === b ? a : x)))];
    } else if (coordinate.kind === "member-absence" && id === coordinate.leaf && coordinate.members) {
      // Erasing "member m vs absent" spells m as absence: a representation that
      // cannot say m explicitly must express it by leaving the leaf off. If
      // nothing downstream can tell the two apart, m is a redundant spelling of
      // the default rather than a degree of freedom.
      const [m] = coordinate.members;
      if (parent[key] === m) {
        // Absence of a discriminated declaration is absence of the WHOLE
        // declaration, not of its tag: erasing `additivity.kind:semi-additive`
        // must not leave `{nonAdditiveAlong}` behind, which is neither absence
        // nor a schema-valid declaration. Emptying the holder lets the cleanup
        // below drop it from its parent exactly as leaf erasure does.
        if (key === "kind") for (const k of Object.keys(parent)) delete parent[k];
        else delete parent[key];
        cleanup.push(parent);
      }
    }
  });
  // A sub-declaration emptied by erasure carries no coordinate: drop it from its
  // holder (`whole: {perRow}` with perRow erased is no declaration of a whole;
  // `{null}` with null erased is no observation). Named declarations (a field,
  // a relation) and positional ones (an assertion, a row) stay, empty or not.
  for (const emptied of cleanup) {
    if (Object.keys(emptied).length === 0) dropEmpty(copy, emptied, null);
  }
  return copy as unknown as Fixture;
}

const NAMED_HOLDERS = new Set(["fields", "relations"]);

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
 * Erase a set of coordinates in a listing-order-independent way: branch
 * leaves first, then member pairs, then discriminator leaves (`*.kind`) last,
 * since a merged or erased discriminator relabels the branch-qualified leaves
 * under it.
 */
export function eraseAll(fixture: Fixture, coordinates: readonly Coordinate[]): Fixture {
  const rank = (c: Coordinate) => (c.kind === "leaf" ? (c.leaf.endsWith(".kind") ? 2 : 0) : 1);
  const ordered = [...coordinates].sort((x, y) => rank(x) - rank(y));
  return ordered.reduce((f, c) => erase(f, c), fixture);
}

/** Sort keys recursively so serialization is declaration-order-blind. */
function sortKeys(v: unknown): unknown {
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

/** Positional identifiers in first-appearance order: relations r1.., fields f1.. */
export function nameBlindMap(fixture: Fixture): Record<string, string> {
  const map: Record<string, string> = {};
  let r = 0;
  let f = 0;
  for (const [rel, decl] of Object.entries(fixture.structure.relations)) {
    if (!(rel in map)) map[rel] = `r${++r}`;
    for (const field of Object.keys(decl.fields)) if (!(field in map)) map[field] = `f${++f}`;
  }
  return map;
}

/** Name-blind, key-sorted, id-free serialization of a fixture. */
export function canonical(fixture: Fixture): string {
  const renamed = alphaRename(fixture, nameBlindMap(fixture));
  const { id: _id, ...rest } = renamed as unknown as Json;
  void _id;
  return JSON.stringify(sortKeys(rest));
}

/** Do A and B become the same representation once `coordinate` is erased? */
export function collides(a: Fixture, b: Fixture, coordinate: Coordinate): boolean {
  return canonical(erase(a, coordinate)) === canonical(erase(b, coordinate));
}
