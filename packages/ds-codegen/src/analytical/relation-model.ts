/**
 * The single authority for the L0-L2 relational structure, the stage-1
 * assertion grammar, and the fixture shape (REL-FIELD-ALGEBRA-02, invariant 3).
 *
 * Everything else is derived from this file:
 * - TypeScript types are inferred (`structure.ts` re-exports them);
 * - `relation.contract.schema.json`, `assertion.schema.json` and
 *   `fixture.schema.json` are EMITTED from it by `emit-schemas.ts` and
 *   drift-gated; consumers read the JSON and never import zod;
 * - the coordinate census (`census.ts`) is walked from its emission.
 *
 * This is the stage-1.5 KERNEL: every coordinate here is ratified by a
 * necessity witness (`witnesses.json`); every coordinate the stage-1 draft
 * carried without one was removed (`removals.json`) and may be re-earned by
 * a later stage with its own witness. In particular:
 * - a field's measurement standing is factorized (D6): `transformation` is the
 *   admissible-transformation class, and `cyclic`, `proportion`, `index` are
 *   independent capability claims. The eight scale labels are derived aliases
 *   (`capabilities.ts`); `count` decodes to `ratio` (discreteness unwitnessed);
 * - declared relationships, shape, order, period, unit dimension/rate, temporal
 *   closure/grain/calendar, provenance, and observation-level uncertainty are
 *   not yet admitted.
 *
 * Recursively closed: every object is `strictObject`, no metadata bags, no
 * free semantic strings. A field's `permits` declares which observation-level
 * qualifiers its observations MAY carry; each observation carries which it
 * HAS. Nothing here names a task, channel, coordinate, projection, combinator,
 * or form.
 */
import * as z from "zod";

export const Name = z
  .string()
  .regex(/^[a-z][a-z0-9_]*$/)
  .meta({ id: "name" });

/**
 * Whether the ORDER of a name list is part of its meaning.
 *
 * A JSON array is the only way this model can spell a collection of names, so
 * the emitted schema cannot tell a SET from a SEQUENCE: `keep`, `along`,
 * `nonAdditiveAlong`, `peers`, `grainWitness` and `grain` are compared by
 * membership or set-equality by every rule that reads them, while `levels` is
 * compared positionally by `isDeclaredNestGrain` and `toGrain` is compared
 * against `levels` the same way. The necessity census derives its coordinates
 * from the emitted schema alone, so without this fact it emits an `#order`
 * facet for both kinds — a degree of freedom for one, an artifact of the
 * encoding for the other.
 *
 * The keyword is carried through `z.toJSONSchema` like any other `.meta()`
 * field and is ignored by every validator this repo runs (all use
 * `strict: false`). `census.ts` REFUSES a name list that declares neither
 * value, so a new list arrives failing rather than silently gaining an order
 * facet that nothing can adjudicate.
 */
export const SEQUENCE_KEY = "x-fsds-sequence" as const;

/**
 * Which DECLARED namespace a derivation operand ranges over.
 *
 * The incidence facet's erasure has to leave the operand RESOLVABLE, or the
 * image is not a declaration and the boundary refuses it. To rebind instead of
 * tokenize, the walk needs to know whether the slot names a relation or a field
 * — a declaration fact, stated here, read by `census.ts`, and carried onto the
 * locator so the executor never infers it from a path.
 *
 * It is deliberately NOT on `Name` itself: only the derivation operands are
 * bound, and a reference that carries no namespace keeps the tokenizing erasure
 * unchanged.
 */
export const OPERANDS_KEY = "x-fsds-operands" as const;
export type OperandNamespace = "field" | "relation";

/**
 * An operand's namespace plus the LAW facts its binding must satisfy.
 *
 * `distinctFrom` names the SIBLING operand this one's binding must differ from
 * — a join takes two distinct relations, an edge two distinct endpoint fields
 * — so the canonical rebinding skips the sibling's own binding instead of
 * landing on it (a self-join, a degenerate edge are not declarations the law
 * admits). The pick stays a function of the DECLARATIONS alone: it reads the
 * sibling's current value, never the slot's own, so two stimuli differing only
 * in the slot still reach one image.
 *
 * `mirrors` names the RESULT-side spelling the law says this operand equals
 * (`sameSet(out.grain, d.toGrain)`, `sameSet(fieldNames(out), d.keep)`) — one
 * degree of freedom written TWICE. The canonical rebinding takes the mirror
 * itself as the pool, so the image satisfies the equation by construction
 * instead of searching the input's namespace for a name the law would accept.
 * The mirror is the identity on every declaration that already agrees with
 * itself (the corpus's do, unlawful ones included — their illegality lives in
 * other rules), and a REPAIR on one that does not: no two admissible fixtures
 * can differ only in a mirrored operand, because the law slaves it to the
 * other side. The arity facet truncates to the mirror's length — a runtime
 * fact — instead of the static minItems floor.
 */
export type OperandMirror = "result.grain" | "result.fields";

export interface OperandBinding {
  namespace: OperandNamespace;
  distinctFrom?: string;
  mirrors?: OperandMirror;
}

/** The shorthand a plain namespace still admits, normalized by one reader. */
export type OperandDecl = OperandNamespace | OperandBinding;
export const operandOf = (decl: OperandDecl): OperandBinding => (typeof decl === "string" ? { namespace: decl } : decl);

/**
 * The operands each derivation branch binds, and the namespace each ranges over.
 *
 * Stated ONCE on the branch rather than wrapping each `Name`: a reader that only
 * looks at `properties` — the pinned legacy erasure walker does exactly that —
 * still sees the branch it always saw, so adding this fact cannot make a
 * historical reader unable to parse the current schema.
 */
export const DERIVATION_OPERANDS: Record<string, Record<string, OperandDecl>> = {
  "aggregate-to-grain": { from: "relation", toGrain: { namespace: "field", mirrors: "result.grain" } },
  join: { from: "relation", with: { namespace: "relation", distinctFrom: "from" } },
  nest: { from: "relation", levels: "field" },
  bin: { from: "relation", field: "field" },
  normalize: { from: "relation", field: "field" },
  project: { from: "relation", keep: { namespace: "field", mirrors: "result.fields" } },
  graph: { from: "relation", edgeFrom: "field", edgeTo: { namespace: "field", distinctFrom: "edgeFrom" }, value: "field" },
};

/**
 * The name-bearing properties the STRUCTURE itself binds, and the namespace
 * each ranges over. The same key and the same rule as the branch map: the
 * holder states which of its properties name declared things, the walk reads
 * it where it reads every other namespace fact, and a name list with no
 * namespace keeps the tokenizing erasure unchanged.
 *
 * `peers` is the case: its elements name RELATIONS — the peer-projection
 * conservation law reads them as relations — so forgetting which relations a
 * peer set binds has to rebind to declared relation names or the image stops
 * resolving and the boundary reports inputs it cannot find. The map sits on
 * the structure rather than on a derivation branch because that is where the
 * property lives; nothing about the reader changes.
 */
export const STRUCTURE_OPERANDS: Record<string, OperandDecl> = {
  peers: "relation",
};
export type SequenceFact = "set" | "ordered";
/** A collection whose order no rule reads: erasing `#order` destroys nothing. */
const Set_ = { [SEQUENCE_KEY]: "set" } as const;
/** A collection whose order a rule reads positionally. */
const Ordered = { [SEQUENCE_KEY]: "ordered" } as const;

/** Admissible-transformation class (Stevens): what arithmetic the values license. */
export const Transformation = z.enum(["nominal", "ordinal", "interval", "ratio"]);

export const Unit = z
  .strictObject({
    /** Units the field's values may be expressed in; more than one needs conversions. */
    units: z.array(z.string().min(1)).min(1).optional(),
    /** Each observation carries its own unit (instance evidence decides commensurability). */
    perRow: z.boolean().optional(),
    /** Units convertible into the field's base unit. */
    conversions: z.array(z.string().min(1)).min(1).optional(),
  })
  .meta({ id: "unit" });

export const Temporality = z
  .strictObject({
    kind: z.enum(["instant", "interval"]),
    /**
     * The temporal grain the field's values are resolved to. Members are earned
     * per case, not enumerated from the calendar: the only stage-2 case needing
     * this asks whether two fields resolved to DIFFERENT grains may share an
     * axis, so what the kernel must express is inequality. A third member
     * arrives when a case distinguishes it. This cannot ride on
     * `aggregate-to-grain.toGrain`, whose members are field NAMES and therefore
     * confer no standing under alpha-renaming.
     */
    grain: z.enum(["day", "month"]).optional(),
  })
  .meta({ id: "temporality" });

export const Additivity = z
  .discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("additive") }),
    z.strictObject({ kind: z.literal("semi-additive"), nonAdditiveAlong: z.array(Name).min(1).meta(Set_) }),
    /** Admits no summation along any dimension; re-earned by the normalize case. */
    z.strictObject({ kind: z.literal("non-additive") }),
    z.strictObject({ kind: z.literal("ratio-measure") }),
  ])
  .meta({ id: "additivity" });

export const Permits = z
  .strictObject({
    /** Observations may be missing (any null kind). */
    null: z.literal(true).optional(),
    /** Observations may carry uncertainty. */
    uncertainty: z.literal(true).optional(),
  })
  .meta({ id: "permits" });

export const Field = z
  .strictObject({
    transformation: Transformation,
    /** Values wrap around (angle, hour, weekday): a linear mean is meaningless. */
    cyclic: z.literal(true).optional(),
    /** Claims to be a proportion of a whole; the whole must be declared. */
    proportion: z.literal(true).optional(),
    /** Claims to be an index rebased to a base; the base must be declared. */
    index: z.literal(true).optional(),
    key: z.boolean().optional(),
    unit: Unit.optional(),
    temporality: Temporality.optional(),
    /** The declared whole: fixed for the field, or the row's value of another field. */
    whole: z.union([z.literal("fixed"), z.strictObject({ perRow: Name })]).optional(),
    /**
     * A declared field-to-field BOUNDS relationship: this field's value lies
     * between the named sibling fields' values, row by row. Generic over any
     * three fields of the relation; nothing names a form. Adjudicated as
     * INSTANCE evidence — supplied rows that violate it carry the
     * `bounds:row-consistent` obligation, and absent rows carry nothing.
     */
    bounds: z.strictObject({ lower: Name, upper: Name }).optional(),
    base: z.literal(true).optional(),
    additivity: Additivity.optional(),
    permits: Permits.optional(),
  })
  .meta({ id: "field" });

/**
 * L3: a derivation is a typed operator whose result is itself a relation
 * (REL-VIEW-ALGEBRA-01 A1). Closure is structural rather than asserted: a
 * derived relation is carried in `relations` like any other and names the
 * derivation that produced it, so an assertion cannot tell a base relation
 * from a derived one and no rule needs to.
 *
 * Every kind here is demanded by a stage-2 corpus case; nothing is admitted
 * because a view algebra "should" have it. `filter`, `window`, `rank`,
 * `pivot`, `unpivot`, `sort` and `domain` are in the doctrine's vocabulary and
 * are deliberately absent: no case at stage <= 2 requires them, and a
 * derivation with no case cannot carry a necessity witness.
 */
export const JoinCardinality = z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]);

export const Derivation = z
  .discriminatedUnion("kind", [
    /** Combine rows to a named coarser grain. `toGrain` is the re-earned target. */
    z.strictObject({ kind: z.literal("aggregate-to-grain"), from: Name, toGrain: z.array(Name).min(1).meta(Ordered) }).meta({ "x-fsds-operands": DERIVATION_OPERANDS["aggregate-to-grain"] }),
    /**
     * Declared relationship between two relations. The cardinality is the
     * re-earned coordinate: it makes fan-out decidable from the declaration
     * instead of only from rows.
     */
    z.strictObject({ kind: z.literal("join"), from: Name, with: Name, cardinality: JoinCardinality }).meta({ "x-fsds-operands": DERIVATION_OPERANDS.join }),
    /** Impose a hierarchy. `levels` is the membership every later projection needs. */
    z.strictObject({ kind: z.literal("nest"), from: Name, levels: z.array(Name).min(2).meta(Ordered) }).meta({ "x-fsds-operands": DERIVATION_OPERANDS.nest }),
    /** Partition a field's range into intervals. Closure says which side each interval owns. */
    z.strictObject({ kind: z.literal("bin"), from: Name, field: Name, closure: z.enum(["left-closed", "right-closed"]).optional() }).meta({ "x-fsds-operands": DERIVATION_OPERANDS.bin }),
    /** Rescale a field against a whole. */
    z.strictObject({ kind: z.literal("normalize"), from: Name, field: Name }).meta({ "x-fsds-operands": DERIVATION_OPERANDS.normalize }),
    /** Relational projection: keep these fields. What is dropped is derived, not declared. */
    z.strictObject({ kind: z.literal("project"), from: Name, keep: z.array(Name).min(1).meta(Set_) }).meta({ "x-fsds-operands": DERIVATION_OPERANDS.project }),
    /**
     * Read a relation as edges.
     *
     * `requiresConservation` is a REQUIREMENT, never a finding: it says this
     * graph claims flow is conserved, not that anything has checked. The two
     * cannot share a field. The corpus depends on exactly this split — one
     * case expects `REL_FLOW_NOT_CONSERVED` once rows show a leak, and its twin
     * expects `unproven` with the `invariant:conservation` obligation while the
     * edge values are unseen. A boolean that meant "observed to conserve" could
     * not produce the second, and a declaration that were treated as evidence
     * would silently discharge it.
     *
     * It is an invariant on the derivation, NOT a perceptual task — the task
     * table is L3.5 and stays out of stage 2.
     */
    z.strictObject({ kind: z.literal("graph"), from: Name, edgeFrom: Name, edgeTo: Name, value: Name.optional(), requiresConservation: z.literal(true).optional() }).meta({ "x-fsds-operands": DERIVATION_OPERANDS.graph }),
  ])
  .meta({ id: "derivation" });

export const Relation = z
  .strictObject({
    grain: z.union([z.literal("unknown"), z.array(Name).min(1).meta(Set_)]),
    fields: z.record(Name, Field),
    /** Present iff this relation is the result of a derivation. */
    derivedBy: Derivation.optional(),
  })
  .meta({ id: "relation" });

export const RelationalStructure = z
  .strictObject({
    relations: z.record(Name, Relation),
    /**
     * Sets of relations declared to carry the SAME claim about one authority.
     * Demanded by two stage-2 cases (daily and monthly resolved together; a
     * peer totalling at a different target grain) which are only decidable once
     * the structure can say two derived relations are meant to be read as one.
     *
     * This is view substrate, not projection: no channel, coordinate space,
     * task or realization appears here, and stage 3 owns all four. It says only
     * that two derivations claim to speak for the same thing — which is exactly
     * what makes a divergence between them a defect rather than a choice.
     */
    peers: z.array(z.array(Name).min(2).meta(Set_)).min(1).optional(),
  })
  .meta({
    id: "relationalStructure",
    title: "Relational structure (L0-L2 kernel)",
    [OPERANDS_KEY]: STRUCTURE_OPERANDS,
    description:
      "The authoritative analytical object of ARCH-ANALYTICAL-RELATION-001 at stage 1.5: one or more named relations, each with a declared grain and typed fields. Every coordinate carries a necessity witness. Emitted from packages/ds-codegen/src/analytical/relation-model.ts; do not edit by hand.",
  });

/**
 * Combining rows, at whatever grain results. A rollup (combining to a named
 * coarser grain) is not distinguishable from an aggregate at stage 1: the
 * target grain and the rate's numerator/denominator are not-yet-admitted, and
 * `rederive` (always admissible without them) is an alias of `count`.
 */
export const AggregateAssertion = z.strictObject({
  kind: z.literal("aggregate"),
  relation: Name,
  field: Name,
  /** `min` stands for any order statistic (max is its alias at stage 1). */
  op: z.enum(["sum", "mean", "count", "min"]),
  along: z.array(Name).min(1).meta(Set_).optional(),
  nulls: z.enum(["exclude", "as-zero", "as-observed"]).optional(),
  /** Uncertainty handling is declared (propagate); dropping is its alias at stage 1. */
  uncertainty: z.literal("propagate").optional(),
});

export const RatioComparisonAssertion = z.strictObject({
  kind: z.literal("ratio-comparison"),
  relation: Name,
  field: Name,
});

export const Assertion = z
  .discriminatedUnion("kind", [AggregateAssertion, RatioComparisonAssertion])
  .meta({
    id: "assertion",
    title: "Stage-1 analytical assertion (L0-L2 grammar)",
    description:
      "The closed set of operations a stage-1 engine can be asked to judge over a relational structure. Emitted from packages/ds-codegen/src/analytical/relation-model.ts; do not edit by hand.",
  });

export const Scalar = z.union([z.number(), z.string(), z.boolean()]);

export const ObservationRecord = z
  .strictObject({
    value: Scalar.optional(),
    unit: z.string().min(1).optional(),
    /**
     * censored: a bound, not a measurement; suppressed: withheld by policy, so
     * a value EXISTS and is not zero; absent: any other missing kind.
     */
    null: z.enum(["absent", "censored", "suppressed"]).optional(),
  })
  .meta({ id: "observationRecord" });

/** A bare scalar is an observed, certain value; an object carries what it has. */
export const ObservationInput = z.union([Scalar, ObservationRecord]).meta({ id: "observation" });

export const Evidence = z
  .strictObject({
    rows: z.record(Name, z.array(z.record(Name, ObservationInput))).optional(),
    grainWitness: z.record(Name, z.array(Name).min(1).meta(Set_)).optional(),
  })
  .meta({ id: "evidence" });

export const Fixture = z
  .strictObject({
    id: z.string().regex(/^FX_[A-Z0-9_]+$/),
    structure: RelationalStructure,
    assertions: z.array(Assertion).min(1),
    evidence: Evidence.optional(),
  })
  .meta({
    id: "fixture",
    title: "Analytical fixture (one JSONL line of fixtures.jsonl)",
    description:
      "A stimulus for the stage-1 engine: a relational structure, one or more assertions, and optional evidence. Answer-free by construction: no place for a case id, verdict, diagnostic, obligation, or form name. Emitted from packages/ds-codegen/src/analytical/relation-model.ts; do not edit by hand.",
  });

export type Name = z.infer<typeof Name>;
export type Transformation = z.infer<typeof Transformation>;
export type UnitDecl = z.infer<typeof Unit>;
export type TemporalityDecl = z.infer<typeof Temporality>;
export type AdditivityDecl = z.infer<typeof Additivity>;
export type PermitsDecl = z.infer<typeof Permits>;
export type FieldDecl = z.infer<typeof Field>;
export type RelationDecl = z.infer<typeof Relation>;
export type DerivationDecl = z.infer<typeof Derivation>;
export type JoinCardinalityDecl = z.infer<typeof JoinCardinality>;
export type RelationalStructure = z.infer<typeof RelationalStructure>;
export type AggregateOp = z.infer<typeof AggregateAssertion>["op"];
export type Assertion = z.infer<typeof Assertion>;
export type NullKind = NonNullable<z.infer<typeof ObservationRecord>["null"]>;
export type ObservationRecord = z.infer<typeof ObservationRecord>;
export type ObservationInput = z.infer<typeof ObservationInput>;
export type Evidence = z.infer<typeof Evidence>;
export type Fixture = z.infer<typeof Fixture>;
