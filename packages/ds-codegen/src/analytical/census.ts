/**
 * The coordinate census (REL-FIELD-ALGEBRA-02, invariant 5): every
 * independently variable semantic degree of freedom of the L0-L2 kernel,
 * derived by walking the EMITTED fixture schema (itself a drift-gated
 * projection of the zod model), so a leaf added to the model appears here
 * with no hand edit and a parent axis cannot hide unnecessary children.
 *
 * Three coordinate kinds:
 * - `leaf`: a property whose value is a primitive, an enum, a set of names, or
 *   a record of primitives (e.g. `field.unit.conversions`);
 * - `member-pair`: for an enum leaf, the distinction between two of its
 *   members. Erasing it merges the two members.
 * - `member-absence`: for an enum leaf that is OPTIONAL, the distinction
 *   between carrying a given member and not carrying the leaf at all. Erasing
 *   it rewrites that member as absence. Stage 1.5 could not see this class,
 *   and recorded the consequence as a non-claim: `temporality.interval` and
 *   `additivity.additive` are indistinguishable from the leaf's absence, but
 *   member-vs-absence was not a coordinate, so they stayed unexamined. A
 *   default member that no witness separates from absence is a redundant
 *   spelling of the default, not a semantic degree of freedom
 *   (REL-VIEW-ALGEBRA-01, closing that blind spot before the next subtraction
 *   pass rather than after it).
 *
 * Not coordinates: `id` (fixture identity) and the reference leaves
 * `assertion.relation` / `assertion.field` / `relationship.*.relation|field`
 * (names, which confer no standing - invariant on name irrelevance); they are
 * listed as `reference` so the census is still exhaustive.
 *
 * Labels: `structure.relations.*` -> `relation`, `.fields.*` -> `field`,
 * `assertions[]` -> `assertion` (every property of a discriminated-union
 * branch is qualified by its branch: `assertion.aggregate.op`), and
 * `evidence.rows.*[].*` -> `observation`.
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export type CoordinateKind = "leaf" | "member-pair" | "member-absence" | "reference";

/**
 * The pseudo-member a `member-absence` coordinate pairs a real member against.
 * The angle brackets are load-bearing: member names match `[a-z0-9-]+`, so a
 * bare `absent` would be ambiguous with the real member of that name on
 * `observation.null` — `observation.null:censored~absent` would denote both a
 * member pair and a member-absence coordinate, and the later id silently
 * shadowed the earlier one in `kernelPair`, moving three stage-1 coordinates
 * out of `ratified`. A sentinel outside the member grammar cannot collide.
 */
export const ABSENT = "<absent>" as const;

export interface Coordinate {
  id: string;
  kind: CoordinateKind;
  /** The leaf this coordinate belongs to (for member pairs, the enum leaf). */
  leaf: string;
  /** Enum members, for `member-pair`. */
  members?: [string, string];
  /** Whether the coordinate lives in evidence (instance) or in the declaration (schema). */
  role: "schema" | "instance";
  /** Enum members of the leaf, when it is an enum. */
  enum?: string[];
}

type Node = Record<string, unknown>;

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_SCHEMA = path.resolve(HERE, "../../../ds-contracts/analytical-fixtures/fixture.schema.json");

const LABEL_RULES: [RegExp, string][] = [
  [/^structure\.relations\.\*\.fields\.\*\./, "field."],
  [/^structure\.relations\.\*\./, "relation."],
  [/^structure\.relationships\[\]\./, "relationship."],
  [/^assertions\[\]\./, "assertion."],
  [/^evidence\.rows\.\*\[\]\.\*\./, "observation."],
  [/^evidence\.rows\.\*\[\]\.\*$/, "observation"],
  [/^evidence\.grainWitness\.\*$/, "evidence.grainWitness"],
];

export function label(rawPath: string): string {
  let p = rawPath;
  for (const [re, rep] of LABEL_RULES) p = p.replace(re, rep);
  return p;
}

/** Name references: an assertion's or relationship's target. Names confer no standing. */
const REFERENCE_RE = /^(assertion(\.[a-z-]+)?\.(relation|field)|relationship\.(from|to)\.(relation|field))$/;

const PRIMITIVE_TYPES = new Set(["string", "number", "integer", "boolean"]);
function isPrimitive(n: Node): boolean {
  const t = n.type;
  const types = Array.isArray(t) ? (t as string[]) : typeof t === "string" ? [t] : [];
  return types.length > 0 && types.every((x) => PRIMITIVE_TYPES.has(x));
}

export function deriveCensus(schema: Node): Coordinate[] {
  const defs = (schema.definitions ?? {}) as Record<string, Node>;
  const resolve = (n: Node): Node => {
    let cur = n;
    for (let i = 0; i < 8; i++) {
      // zod wraps an optional $ref in a single-element allOf; unwrap it
      if (Array.isArray(cur.allOf) && cur.allOf.length === 1 && Object.keys(cur).length === 1) cur = cur.allOf[0] as Node;
      if (typeof cur.$ref !== "string") break;
      const name = (cur.$ref as string).replace("#/definitions/", "");
      const target = defs[name];
      if (!target) throw new Error(`unresolved $ref ${cur.$ref}`);
      cur = target;
    }
    return cur;
  };

  const out: Coordinate[] = [];
  const seen = new Set<string>();
  const role = (p: string): "schema" | "instance" => (p.startsWith("evidence") ? "instance" : "schema");

  const addLeaf = (rawPath: string, enumMembers?: string[], optional = false) => {
    const id = label(rawPath);
    if (id === "id" || seen.has(id)) return;
    seen.add(id);
    if (REFERENCE_RE.test(id)) {
      out.push({ id, kind: "reference", leaf: id, role: role(rawPath) });
      return;
    }
    out.push({ id, kind: "leaf", leaf: id, role: role(rawPath), ...(enumMembers ? { enum: enumMembers } : {}) });
    if (enumMembers) {
      for (let i = 0; i < enumMembers.length; i++) {
        for (let k = i + 1; k < enumMembers.length; k++) {
          out.push({ id: `${id}:${enumMembers[i]}~${enumMembers[k]}`, kind: "member-pair", leaf: id, members: [enumMembers[i], enumMembers[k]], role: role(rawPath) });
        }
      }
      // Absence is only a distinguishable state where the schema admits it. A
      // required leaf cannot be absent, so it has no member-absence coordinate.
      // Nor does a single-member leaf (`z.literal(true).optional()`): there,
      // "the one member vs absent" IS the leaf coordinate — the same erasure
      // under two ids — and emitting both would double-count the distinction
      // and let one id ratify the other.
      if (optional && enumMembers.length > 1) {
        for (const m of enumMembers) {
          out.push({ id: `${id}:${m}~${ABSENT}`, kind: "member-absence", leaf: id, members: [m, ABSENT], role: role(rawPath) });
        }
      }
    }
  };

  const walk = (raw: Node, rawPath: string, optional = false): void => {
    const n = resolve(raw);
    if (Array.isArray(n.enum)) return addLeaf(rawPath, n.enum as string[], optional);
    if (n.const !== undefined) return addLeaf(rawPath, [String(n.const)], optional);
    if (Array.isArray(n.anyOf)) return walkUnion(n.anyOf as Node[], rawPath, optional);
    if (Array.isArray(n.oneOf)) return walkUnion(n.oneOf as Node[], rawPath, optional);
    if (n.type === "array") {
      const items = resolve((n.items ?? {}) as Node);
      if (isPrimitive(items) || Array.isArray(items.enum)) return addLeaf(rawPath, Array.isArray(items.enum) ? (items.enum as string[]) : undefined, optional);
      return walk(items, `${rawPath}[]`);
    }
    if (n.type === "object") {
      if (n.properties) {
        const required = new Set((Array.isArray(n.required) ? n.required : []) as string[]);
        for (const [k, v] of Object.entries(n.properties as Record<string, Node>)) {
          // A property of an optional holder is itself absent whenever the
          // holder is: `additivity.kind` is absent if `additivity` is.
          walk(v, rawPath ? `${rawPath}.${k}` : k, optional || !required.has(k));
        }
        return;
      }
      if (n.additionalProperties && typeof n.additionalProperties === "object") {
        const v = resolve(n.additionalProperties as Node);
        if (isPrimitive(v)) return addLeaf(rawPath);
        return walk(v, `${rawPath}.*`);
      }
      return addLeaf(rawPath);
    }
    if (isPrimitive(n)) return addLeaf(rawPath);
    throw new Error(`census: unhandled schema node at ${rawPath}: ${JSON.stringify(n).slice(0, 80)}`);
  };

  const walkUnion = (branches: Node[], rawPath: string, optional = false): void => {
    const resolved = branches.map(resolve);
    const objects = resolved.filter((b) => b.type === "object" && b.properties);
    const discriminated =
      objects.length === resolved.length && objects.every((b) => (b.properties as Record<string, Node>).kind?.const !== undefined);
    if (discriminated) {
      const kinds = objects.map((b) => String((b.properties as Record<string, Node>).kind.const));
      addLeaf(`${rawPath}.kind`, kinds, optional);
      // Every branch property is qualified by its branch, so a coordinate's id does not
      // depend on which sibling branches happen to exist (removing `rollup` must not rename `op`).
      objects.forEach((b, i) => {
        const req = new Set((Array.isArray(b.required) ? b.required : []) as string[]);
        for (const [k, v] of Object.entries(b.properties as Record<string, Node>)) {
          if (k !== "kind") walk(v, `${rawPath}.${kinds[i]}.${k}`, optional || !req.has(k));
        }
      });
      return;
    }
    // primitive | object (e.g. `whole`): the primitive branch is the leaf itself,
    // the object branch contributes its properties. A bare-scalar observation is
    // sugar for `{ value }` and adds no coordinate of its own.
    const primitives = resolved.filter((b) => isPrimitive(b) || Array.isArray(b.enum) || b.const !== undefined);
    const objectBranch = objects[0];
    const objectHasValue = objectBranch && "value" in (objectBranch.properties as Node);
    if (primitives.length > 0 && !objectHasValue) {
      const consts = resolved.filter((b) => b.const !== undefined).map((b) => String(b.const));
      addLeaf(rawPath, consts.length > 0 && primitives.length === resolved.length ? consts : undefined);
    }
    for (const b of resolved) {
      if (b.type === "object" && b.properties) walk(b, rawPath);
      else if (b.type === "array") walk(b, rawPath);
    }
  };

  walk(schema, "");
  return out;
}

export function loadCensus(schemaPath = FIXTURE_SCHEMA): Coordinate[] {
  return deriveCensus(JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as Node);
}

export interface CensusSnapshot {
  $comment: string;
  /** sha256 of the fixture schema the census was derived from. */
  derivedFrom: string;
  coordinates: Coordinate[];
}

/** A census with the digest of the schema it was walked from, for committing. */
export function snapshotCensus(schemaPath = FIXTURE_SCHEMA): CensusSnapshot {
  const bytes = fs.readFileSync(schemaPath);
  return {
    $comment:
      "Pre-removal coordinate census of the stage-1 kernel, derived by census.ts from the emitted fixture schema at the end of REL-FIELD-ALGEBRA-02 Phase A (derivedFrom = that schema's sha256, which baseline-stage1.json also records). Every coordinate here is dispositioned by necessity.test.ts as ratified (a witness in witnesses.json) or not-yet-admitted (an entry in removals.json).",
    derivedFrom: createHash("sha256").update(bytes).digest("hex"),
    coordinates: deriveCensus(JSON.parse(bytes.toString("utf-8")) as Node),
  };
}
