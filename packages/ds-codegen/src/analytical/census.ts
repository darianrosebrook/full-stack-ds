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

export type CoordinateKind = "leaf" | "member-pair" | "member-absence" | "reference-topology" | "reference";

/**
 * Identity-free structure of a name reference. Reference SPELLING confers no
 * standing — that is the alpha-renaming invariant — but reference STRUCTURE
 * can: `toGrain=[region]` and `toGrain=[region, product]` are not equivalent
 * under any consistent renaming, nor are `levels=[country, state]` and
 * `levels=[state, country]`, nor is a graph with `edgeFrom`/`edgeTo` bound one
 * way versus the other. Each facet names an erasure that destroys exactly that
 * structure while leaving the representation schema-valid.
 */
export type ReferenceFacet =
  /** How many names the reference carries. Erased by truncating to one. */
  | "arity"
  /** Whether their sequence is semantic. Erased by sorting. */
  | "order"
  /**
   * Which OTHER references this one shares names with — the incidence of the
   * reference graph. Erased by rewriting every name at this path to one
   * reserved token, so all sharing through this slot becomes unobservable
   * while every other reference keeps its identity.
   *
   * This is the facet the stage-1 witnesses actually needed: two fixtures that
   * sum along `date` versus along `product`, against a measure declared
   * non-additive along `date`, differ in nothing but whether the assertion's
   * reference set MEETS the declaration's. No renaming makes them equal, and
   * neither arity nor order sees it.
   */
  | "incidence";

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
  /** For `reference-topology`, which identity-free structure it isolates. */
  facet?: ReferenceFacet;
  /** For `binding`, the sibling reference slots whose assignment is at stake. */
  slots?: string[];
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

/**
 * A name reference is detected STRUCTURALLY — a property whose value type is
 * the `name` definition — rather than matched by a hand-maintained path
 * pattern. A new Name-valued property therefore joins the census with no hand
 * edit, which is the same property the leaf walk already guarantees, and the
 * old regex could not: it had to be extended by hand for every derivation
 * operand and would silently misclassify the next one.
 *
 * The spelling of a reference confers no standing. Its structure may:
 * `reference-topology` coordinates carry arity, order and slot binding, and
 * the reference itself is listed for exhaustiveness. Presence is separate
 * again — an OPTIONAL reference also gets a `leaf` coordinate, because whether
 * it is declared at all is a degree of freedom its spelling is not.
 */
const NAME_REF = "#/definitions/name";
function nameRefOf(raw: Node): boolean {
  let cur = raw;
  for (let i = 0; i < 4; i++) {
    if (Array.isArray(cur.allOf) && cur.allOf.length === 1 && Object.keys(cur).length === 1) {
      cur = cur.allOf[0] as Node;
      continue;
    }
    return cur.$ref === NAME_REF;
  }
  return false;
}

const PRIMITIVE_TYPES = new Set(["string", "number", "integer", "boolean"]);
function isPrimitive(n: Node): boolean {
  const t = n.type;
  const types = Array.isArray(t) ? (t as string[]) : typeof t === "string" ? [t] : [];
  return types.length > 0 && types.every((x) => PRIMITIVE_TYPES.has(x));
}

/**
 * The REQUIRED payload of each branch of a discriminated union, keyed by
 * member, with `kind` excluded because every branch carries it.
 *
 * This is a fact about the SCHEMA's branch topology, not about any judgment.
 * It is recorded during the census walk rather than by a second reading of the
 * schema so that "which properties does branch m require" has one authority: a
 * separate walk would be free to disagree with the one the coordinate ids come
 * from, and the closure checker's normalization set is derived from exactly
 * this.
 */
export interface BranchSignatures {
  /** Required property names per branch member, `kind` excluded, sorted. */
  required: Record<string, string[]>;
}

export interface CensusDerivation {
  coordinates: Coordinate[];
  /** Keyed by discriminator leaf id, e.g. `relation.derivedBy.kind`. */
  signatures: Map<string, BranchSignatures>;
}

export function deriveCensus(schema: Node): Coordinate[] {
  return deriveCensusWithSignatures(schema).coordinates;
}

export function deriveCensusWithSignatures(schema: Node): CensusDerivation {
  const defs = (schema.definitions ?? {}) as Record<string, Node>;
  const signatures = new Map<string, BranchSignatures>();
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

  /**
   * `self`: the leaf may be omitted from its immediate parent.
   * `holder`: that parent may itself be absent.
   * They are not the same permission and the difference decides whether a
   * member-absence coordinate exists at all — see `addLeaf`.
   */
  type Opt = {
    self: boolean;
    holder: boolean;
    /**
     * Id of the coordinate that already carries the nearest optional ancestor's
     * EXISTENCE, when one is emitted. A required child of such a holder cannot
     * vary independently of it, so its own presence proposition is a derived
     * conjunction rather than a degree of freedom.
     *
     * Absent when nothing carries that existence — then the child's presence IS
     * the carrier and must be emitted.
     */
    carrier?: string;
  };
  const OPT_REQUIRED: Opt = { self: false, holder: false };

  /**
   * A Name-valued property. Its spelling is not a coordinate; its structure is.
   * `list` decides which facets apply: a single slot has no arity or order to
   * vary, only which sibling slot binds it.
   */
  const addReference = (rawPath: string, list: boolean, optional: Opt) => {
    const id = label(rawPath);
    if (id === "id" || seen.has(id)) return;
    seen.add(id);
    const r = role(rawPath);
    out.push({ id, kind: "reference", leaf: id, role: r });
    // Presence is a degree of freedom the spelling is not — but only where it
    // can vary INDEPENDENTLY. For a reference required by its holder,
    //
    //   present(p) = present(H)                     required by every branch
    //   present(p) = present(H) AND branch(H) = k   required by branch k
    //
    // and neither is a third degree of freedom: there is no valid state where
    // the holder exists as branch k while its required property is absent. So
    // the coordinate is emitted when the reference is optional IN its holder,
    // or when the holder's existence is carried by nothing else. `carrier` is
    // what distinguishes the two — not the bare fact that some ancestor was
    // optional, which is how sixteen synthetic presence propositions arose.
    //
    // (The previous rationale here cited `field.whole.perRow#present` as
    // forcing the inherited disjunct. That coordinate is not emitted and never
    // was: `walkUnion`'s NON-discriminated path re-enters `walk` without the
    // holder's optionality, so `perRow` is walked as required-of-required. The
    // example did not hold up the rule it was cited for.)
    if (optional.self || (optional.holder && !optional.carrier)) {
      out.push({ id: `${id}#present`, kind: "leaf", leaf: id, role: r });
    }
    const facets: ReferenceFacet[] = list ? ["arity", "order", "incidence"] : ["incidence"];
    for (const facet of facets) {
      out.push({ id: `${id}#${facet}`, kind: "reference-topology", leaf: id, role: r, facet });
    }
  };

  /**
   * Existence of an optional TAGGED holder — the degree of freedom the
   * discriminator's member-absence cross-terms were standing in for. Emitted
   * once per holder rather than once per branch.
   */
  const addHolderPresence = (rawPath: string, optional: Opt): string | undefined => {
    if (!(optional.self || optional.holder)) return undefined;
    const id = `${label(rawPath)}#present`;
    if (seen.has(id)) return id;
    seen.add(id);
    out.push({ id, kind: "leaf", leaf: label(rawPath), role: role(rawPath) });
    return id;
  };

  const addLeaf = (rawPath: string, enumMembers?: string[], optional: Opt = OPT_REQUIRED) => {
    const id = label(rawPath);
    if (id === "id" || seen.has(id)) return;
    seen.add(id);
    out.push({ id, kind: "leaf", leaf: id, role: role(rawPath), ...(enumMembers ? { enum: enumMembers } : {}) });
    if (enumMembers) {
      for (let i = 0; i < enumMembers.length; i++) {
        for (let k = i + 1; k < enumMembers.length; k++) {
          out.push({ id: `${id}:${enumMembers[i]}~${enumMembers[k]}`, kind: "member-pair", leaf: id, members: [enumMembers[i], enumMembers[k]], role: role(rawPath) });
        }
      }
      // Absence must be a state the representation can actually reach, or the
      // coordinate is unwitnessable by construction and only ever yields
      // SCHEMA_INVALID. Two exclusions, each load-bearing:
      //
      // - a single-member leaf (`z.literal(true).optional()`): "the one member
      //   vs absent" IS the leaf coordinate — the same erasure under two ids,
      //   each able to ratify the other;
      // - a DISCRIMINATOR, always. This once read "deleting `additivity.kind`
      //   drops the whole (optional) declaration, which is exactly what absence
      //   means" — which is what HOLDER absence means, not what "this member
      //   versus absent" means. An optional tagged holder has two independent
      //   degrees of freedom, existence (`holder#present`) and branch identity
      //   (`kind:A~B`); "member vs absent" is their cross-term. On a tag-only
      //   branch it merely duplicates the presence coordinate, and on a
      //   payload-carrying branch it erases presence and payload together, so
      //   it cannot isolate the distinction it claims (isolationViolation
      //   refuses exactly that). Neither is a semantic coordinate.
      const isDiscriminator = rawPath.endsWith(".kind");
      const absenceReachable = optional.self && !isDiscriminator;
      if (absenceReachable && enumMembers.length > 1) {
        for (const m of enumMembers) {
          out.push({ id: `${id}:${m}~${ABSENT}`, kind: "member-absence", leaf: id, members: [m, ABSENT], role: role(rawPath) });
        }
      }
    }
  };

  const walk = (raw: Node, rawPath: string, optional: Opt = OPT_REQUIRED): void => {
    // Detected BEFORE resolution: after it a name is just a patterned string.
    if (nameRefOf(raw)) return addReference(rawPath, false, optional);
    const n = resolve(raw);
    if (n.type === "array" && nameRefOf((n.items ?? {}) as Node)) return addReference(rawPath, true, optional);
    if (Array.isArray(n.enum)) return addLeaf(rawPath, n.enum as string[], optional);
    if (n.const !== undefined) return addLeaf(rawPath, [String(n.const)], optional);
    if (Array.isArray(n.anyOf)) return walkUnion(n.anyOf as Node[], rawPath, optional);
    if (Array.isArray(n.oneOf)) return walkUnion(n.oneOf as Node[], rawPath, optional);
    if (n.type === "array") {
      const items = resolve((n.items ?? {}) as Node);
      if (isPrimitive(items) || Array.isArray(items.enum)) return addLeaf(rawPath, Array.isArray(items.enum) ? (items.enum as string[]) : undefined, optional);
      // An optional array of composites carries one fact its elements cannot:
      // whether the declaration is made at all. `structure.peers` is the case
      // — its elements are name references whose arity and membership are
      // their own coordinates, but "there is a peer claim here" is not.
      if (optional.self || optional.holder) {
        const id = label(rawPath);
        if (!seen.has(`${id}#present`)) {
          seen.add(`${id}#present`);
          out.push({ id: `${id}#present`, kind: "leaf", leaf: id, role: role(rawPath) });
        }
      }
      return walk(items, `${rawPath}[]`, { self: false, holder: optional.self || optional.holder });
    }
    if (n.type === "object") {
      if (n.properties) {
        const required = new Set((Array.isArray(n.required) ? n.required : []) as string[]);
        // Tagged but not a union (`temporality`): its `kind` reaches addLeaf
        // directly, so its holder needs the presence coordinate here.
        const kindProp = (n.properties as Record<string, Node>).kind;
        const carrier = kindProp && Array.isArray(resolve(kindProp).enum) ? addHolderPresence(rawPath, optional) : optional.carrier;
        for (const [k, v] of Object.entries(n.properties as Record<string, Node>)) {
          // A property of an optional holder is itself absent whenever the
          // holder is: `additivity.kind` is absent if `additivity` is. That is
          // exactly why a REQUIRED one gets no presence coordinate of its own
          // once `carrier` names what already says so.
          walk(v, rawPath ? `${rawPath}.${k}` : k, { self: !required.has(k), holder: optional.self || optional.holder, carrier });
        }
        return;
      }
      if (n.additionalProperties && typeof n.additionalProperties === "object") {
        // A record's entries are absent whenever the record is, so its
        // optionality has to reach them — dropping it here left
        // `evidence.grainWitness` with no presence coordinate for its own
        // witness to name.
        const inner: Opt = { self: false, holder: optional.self || optional.holder };
        const v = resolve(n.additionalProperties as Node);
        if (isPrimitive(v)) return addLeaf(rawPath, undefined, inner);
        if (nameRefOf(n.additionalProperties as Node)) return addReference(rawPath, false, inner);
        return walk(v, `${rawPath}.*`, inner);
      }
      return addLeaf(rawPath);
    }
    if (isPrimitive(n)) return addLeaf(rawPath);
    throw new Error(`census: unhandled schema node at ${rawPath}: ${JSON.stringify(n).slice(0, 80)}`);
  };

  const walkUnion = (branches: Node[], rawPath: string, optional: Opt = OPT_REQUIRED): void => {
    const resolved = branches.map(resolve);
    const objects = resolved.filter((b) => b.type === "object" && b.properties);
    const discriminated =
      objects.length === resolved.length && objects.every((b) => (b.properties as Record<string, Node>).kind?.const !== undefined);
    if (discriminated) {
      const kinds = objects.map((b) => String((b.properties as Record<string, Node>).kind.const));
      // Existence is carried here, alternative identity by the `kind` member
      // pairs below. A property required by branch k is present exactly when
      // both hold, so it contributes no third degree of freedom.
      const carrier = addHolderPresence(rawPath, optional) ?? optional.carrier;
      addLeaf(`${rawPath}.kind`, kinds, optional);
      signatures.set(label(`${rawPath}.kind`), {
        required: Object.fromEntries(
          objects.map((b, i) => [kinds[i], ((Array.isArray(b.required) ? b.required : []) as string[]).filter((k) => k !== "kind").sort()]),
        ),
      });
      // Every branch property is qualified by its branch, so a coordinate's id does not
      // depend on which sibling branches happen to exist (removing `rollup` must not rename `op`).
      objects.forEach((b, i) => {
        const req = new Set((Array.isArray(b.required) ? b.required : []) as string[]);
        for (const [k, v] of Object.entries(b.properties as Record<string, Node>)) {
          if (k !== "kind") {
            walk(v, `${rawPath}.${kinds[i]}.${k}`, { self: !req.has(k), holder: optional.self || optional.holder, carrier });
          }
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
  return { coordinates: out, signatures };
}

export function loadCensus(schemaPath = FIXTURE_SCHEMA): Coordinate[] {
  return deriveCensus(JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as Node);
}

/** Branch payload signatures for every discriminated union in the schema. */
export function loadBranchSignatures(schemaPath = FIXTURE_SCHEMA): Map<string, BranchSignatures> {
  return deriveCensusWithSignatures(JSON.parse(fs.readFileSync(schemaPath, "utf-8")) as Node).signatures;
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
