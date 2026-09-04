/**
 * The codomain of the quotient: what an erased representation IS.
 *
 * An erasure is a map `q_c : X -> Q_c`. Nothing requires `Q_c` to be a subset of
 * `X`, and this system had been assuming it was: the executor mutated a deep
 * clone of a `Fixture` and handed the result back typed as a `Fixture`. When 34
 * erasures produced objects the source schema rejects, that looked like an
 * erasure defect. It was a missing type. A compiler IR is not invalid because it
 * cannot be parsed as source code; a quotient image is not invalid because it
 * cannot be parsed as an unmodified analytical declaration. It must be valid in
 * the language of quotient images — and until this module there was no such
 * language to be valid in.
 *
 * Four distinctions have to survive at every slot, and collapsing any two of
 * them is how a quotient starts certifying its own encoding as semantics:
 *
 *   known         the fact survives unchanged
 *   forgotten     the fact WAS there and this quotient suppresses its value
 *   member-class  several source values have been identified with each other
 *   absent        the source declaration never carried the fact
 *
 * `forgotten` versus `absent` is the pair that was actually being conflated, and
 * not only on required leaves. `delete-slot` on an OPTIONAL leaf deletes the key,
 * which makes "the null policy is exclude" and "no null policy is declared" the
 * same image — but those are two different propositions, and the census emits
 * both (`observation.null` and `observation.null:absent~<absent>`). Ten leaf
 * plans were destroying a presence coordinate at their own leaf this way, and the
 * witness audit could not see it: it classifies a destroyed coordinate as a
 * REFINEMENT when it shares a leaf label, and a member-absence coordinate shares
 * the leaf label of the value coordinate without being a refinement of it.
 *
 * ENCODING. `known` is a bare JSON value and `absent` is a missing key, so only
 * the two suppressing kinds need a marker. The marker key is `@q`, and it is
 * unambiguous by construction rather than by convention: every record key in the
 * source language is a `Name`, `Name` is `/^[a-z][a-z0-9_]*$/`, and every fixed
 * property in the model is lowercase alphanumeric. No valid source document can
 * carry an `@`-prefixed key, so no source value can be mistaken for a marker.
 * `quotient-image.test.ts` pins that rather than trusting it.
 *
 * `by` records which erasures opened a hole. It is diagnostic only and
 * `canonical` strips it, because WHICH erasure made a hole confers no analytical
 * standing — only that there is a hole does. Keeping it out of the collision
 * oracle is what lets it be a set that unions on re-erasure without the union
 * order becoming a semantic fact.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { Ajv, type ValidateFunction } from "ajv";

/** The marker key. Not a legal `Name`, so it cannot collide with a record key. */
export const Q = "@q" as const;

/** Bumped when the shape of a quotient image changes; part of the evidence identity. */
export const QUOTIENT_SCHEMA_VERSION = 1;

/**
 * A value in a quotient image.
 *
 * A marker is a member of this union rather than something layered over it: a
 * hole IS a value in this language, and typing it as an intruder into JSON is
 * how the codomain went unnoticed in the first place.
 */
export type QJson = string | number | boolean | null | readonly QJson[] | { readonly [key: string]: QJson } | QuotientMarker;

/** The fact was there; this quotient suppresses its value. */
export interface Forgotten {
  readonly [Q]: "forgotten";
  /** Which erasures opened this hole. Diagnostic; stripped by `canonical`. */
  readonly by: readonly string[];
}

/** Several source values have been identified with one another. */
export interface MemberClass {
  readonly [Q]: "member-class";
  /** The identified values, sorted and deduplicated. Semantic: canonical keeps it. */
  readonly members: readonly string[];
}

export type QuotientMarker = Forgotten | MemberClass;

/**
 * A source fixture after zero or more erasures.
 *
 * Deliberately an index-signature object rather than a branded `Fixture`. A
 * `Fixture` is assignable TO this (every fixture is a trivial image of itself),
 * and this is NOT assignable to `Fixture` — which is the direction that matters,
 * and which makes "the executor never casts an image back to a fixture" a fact
 * the compiler checks rather than a convention a reviewer checks.
 */
export interface QuotientImage {
  readonly [key: string]: QJson;
}

export type QuotientValueKind = "known" | "forgotten" | "member-class" | "absent";

const isObj = (v: unknown): v is Record<string, QJson> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Is this value a marker? Checked on the tag VALUE, so a record cannot fake one. */
export function isMarker(v: unknown): v is QuotientMarker {
  if (!isObj(v)) return false;
  const tag = v[Q];
  return tag === "forgotten" || tag === "member-class";
}

export const isForgotten = (v: unknown): v is Forgotten => isMarker(v) && v[Q] === "forgotten";
export const isMemberClass = (v: unknown): v is MemberClass => isMarker(v) && v[Q] === "member-class";

const sortedSet = (xs: Iterable<string>): string[] => [...new Set(xs)].sort();

/** A hole, attributed to the erasures that opened it. */
export const forgotten = (by: Iterable<string>): Forgotten => ({ [Q]: "forgotten", by: sortedSet(by) });

/** An identification of source values. */
export const memberClass = (members: Iterable<string>): MemberClass => ({ [Q]: "member-class", members: sortedSet(members) });

/**
 * Fold a new suppression into whatever is already at the slot.
 *
 * Union, so that re-erasing an already-erased slot is idempotent and
 * order-independent — the algebra's confluence requirement showing up in the
 * value representation rather than being asserted about it afterwards. Forgetting
 * absorbs a member class: once the value is gone, which class it was in is not
 * observable, and keeping the class would leave a hole that still discriminates.
 */
export function absorb(existing: unknown, incoming: QuotientMarker): QuotientMarker {
  if (isForgotten(incoming) || isForgotten(existing)) {
    const by = [...(isForgotten(existing) ? existing.by : []), ...(isForgotten(incoming) ? incoming.by : [])];
    return forgotten(by);
  }
  if (isMemberClass(existing) && isMemberClass(incoming)) return memberClass([...existing.members, ...incoming.members]);
  return incoming;
}

/** What kind of value stands at `key` in `container`. */
export function classify(container: Record<string, QJson> | QJson[], key: string | number): QuotientValueKind {
  const present = Array.isArray(container) ? (key as number) < container.length : (key as string) in container;
  if (!present) return "absent";
  const v = Array.isArray(container) ? container[key as number] : container[key as string];
  if (isForgotten(v)) return "forgotten";
  if (isMemberClass(v)) return "member-class";
  return "known";
}

/** Every marker in the image, with the JSON path it stands at. */
export function markersIn(image: unknown, at = ""): { path: string; marker: QuotientMarker }[] {
  if (isMarker(image)) return [{ path: at, marker: image }];
  if (Array.isArray(image)) return image.flatMap((v, i) => markersIn(v, `${at}[${i}]`));
  if (isObj(image)) return Object.entries(image).flatMap(([k, v]) => markersIn(v, at === "" ? k : `${at}.${k}`));
  return [];
}

// ---------------------------------------------------------------------------
// The quotient language, DERIVED from the source language
// ---------------------------------------------------------------------------

type Schema = Record<string, unknown>;

const MARKER_DEFINITION: Schema = {
  type: "object",
  // anyOf, not oneOf: the two branches are already disjoint on their `@q`
  // const, and `oneOf` would only make a validator error read "must match
  // exactly one schema" where the real problem is a malformed marker.
  anyOf: [
    {
      properties: { [Q]: { const: "forgotten" }, by: { type: "array", items: { type: "string" } } },
      required: [Q, "by"],
      additionalProperties: false,
    },
    {
      properties: { [Q]: { const: "member-class" }, members: { type: "array", minItems: 2, items: { type: "string" } } },
      required: [Q, "members"],
      additionalProperties: false,
    },
  ],
  title: "A suppressed value in a quotient image",
};

const MARKER_REF = { $ref: "#/definitions/quotientMarker" } as const;

/**
 * The quotient language is the source language with a marker admitted at every
 * value position. It is DERIVED, never authored beside the source schema: a
 * field added to the zod model appears in both without anyone maintaining the
 * second one, which is the whole point of not having a second schema reader.
 *
 * Two rules and no more:
 *
 *   every VALUE position (a property, an array item, a record value) becomes
 *   `anyOf: [<original>, marker]`
 *
 *   `oneOf` becomes `anyOf`
 *
 * The second is required by the semantics rather than convenient for the
 * implementation. Forgetting a discriminator is precisely making the image
 * consistent with more than one branch; under `oneOf` a discriminator-forgotten
 * image would be rejected for matching two branches, which would report the
 * erasure working as the erasure failing.
 *
 * `required`, `minItems` and `additionalProperties` are NOT relaxed. They are
 * what still has teeth: a deleted required leaf, an array emptied to `[]`, a
 * hole left by `delete` that serializes as `null`, and a slot written into
 * existence all fail here, and each of those has actually happened.
 */
export function relaxToQuotientLanguage(source: Schema): Schema {
  const relaxed = relax(source) as Schema;
  const definitions = { ...((relaxed.definitions as Schema) ?? {}), quotientMarker: MARKER_DEFINITION };
  return {
    $schema: source.$schema ?? "http://json-schema.org/draft-07/schema#",
    $id: "quotient-image.schema.json",
    $comment:
      `Derived from fixture.schema.json by admitting a quotient marker at every value position. ` +
      `Quotient schema version ${QUOTIENT_SCHEMA_VERSION}. Do not edit by hand.`,
    ...Object.fromEntries(Object.entries(relaxed).filter(([k]) => k !== "$schema" && k !== "$id" && k !== "definitions")),
    definitions,
  };
}

/**
 * Rewrite one subschema.
 *
 * The document root is not wrapped: a whole fixture is never a marker, because
 * no plan locates the root. Wrapping it would admit an image no erasure can
 * produce, which is a weaker invariant for nothing.
 */
function relax(node: unknown): unknown {
  if (Array.isArray(node)) return node.map((n) => relax(n));
  if (!isObj(node)) return node;
  const out: Schema = {};
  for (const [key, value] of Object.entries(node as Schema)) {
    switch (key) {
      case "properties":
      case "patternProperties":
        // Each named property is a value position.
        out[key] = Object.fromEntries(Object.entries(value as Schema).map(([k, v]) => [k, admitMarker(relax(v))]));
        break;
      case "items":
        out[key] = Array.isArray(value) ? value.map((v) => admitMarker(relax(v))) : admitMarker(relax(value));
        break;
      case "additionalProperties":
        // A record's values are value positions; the `false` form is a constraint.
        out[key] = typeof value === "boolean" ? value : admitMarker(relax(value));
        break;
      case "oneOf":
        out.anyOf = (value as unknown[]).map((v) => relax(v));
        break;
      case "definitions":
        // A definition is reached THROUGH a value position, which is already
        // wrapped; wrapping here too would only add a redundant alternative.
        out[key] = Object.fromEntries(Object.entries(value as Schema).map(([k, v]) => [k, relax(v)]));
        break;
      case "propertyNames":
        // Constrains KEYS, not values. A marker never stands where a key does.
        out[key] = value;
        break;
      default:
        out[key] = relax(value);
    }
  }
  return out;
}

/** `S` becomes `anyOf: [S, marker]` — unless it already admits one. */
function admitMarker(schema: unknown): unknown {
  if (isObj(schema) && Array.isArray(schema.anyOf) && schema.anyOf.some((s) => isObj(s) && s.$ref === MARKER_REF.$ref)) return schema;
  return { anyOf: [schema, MARKER_REF] };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export const QUOTIENT_SCHEMA_FILE = "quotient-image.schema.json";

/**
 * The quotient schema as bytes, from the emitted source schema.
 *
 * Takes the source schema rather than a directory so the emission is a pure
 * function of the model: the same chain that produces `fixture.schema.json` from
 * `relation-model.ts` produces this from that, and `--check` compares the whole
 * chain rather than a file against a file.
 */
export function emitQuotientSchema(sourceSchemaJson: string): string {
  return JSON.stringify(relaxToQuotientLanguage(JSON.parse(sourceSchemaJson) as Schema), null, 2) + "\n";
}

/**
 * Validate against the QUOTIENT language: errors here are always defects.
 *
 * Distinct from `loadFixtureValidator`, which validates against the SOURCE
 * language. An image failing the source validator is a `sourceLanguageDeparture`
 * and is usually expected; an image failing this one is `quotientLanguageInvalid`
 * and never is. The terminal invariant is the second count at zero, not the first.
 */
export function loadQuotientValidator(contractsDir: string): (image: unknown) => string[] {
  const schema = JSON.parse(fs.readFileSync(path.join(contractsDir, QUOTIENT_SCHEMA_FILE), "utf-8")) as object;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate: ValidateFunction = ajv.compile(schema);
  return (image) => (validate(image) ? [] : (validate.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`.trim()));
}
