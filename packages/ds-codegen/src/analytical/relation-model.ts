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
    z.strictObject({ kind: z.literal("semi-additive"), nonAdditiveAlong: z.array(Name).min(1) }),
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
    z.strictObject({ kind: z.literal("aggregate-to-grain"), from: Name, toGrain: z.array(Name).min(1) }),
    /**
     * Declared relationship between two relations. The cardinality is the
     * re-earned coordinate: it makes fan-out decidable from the declaration
     * instead of only from rows.
     */
    z.strictObject({ kind: z.literal("join"), from: Name, with: Name, cardinality: JoinCardinality }),
    /** Impose a hierarchy. `levels` is the membership every later projection needs. */
    z.strictObject({ kind: z.literal("nest"), from: Name, levels: z.array(Name).min(2) }),
    /** Partition a field's range into intervals. Closure says which side each interval owns. */
    z.strictObject({ kind: z.literal("bin"), from: Name, field: Name, closure: z.enum(["left-closed", "right-closed"]).optional() }),
    /** Rescale a field against a whole. */
    z.strictObject({ kind: z.literal("normalize"), from: Name, field: Name }),
    /** Relational projection: keep these fields. What is dropped is derived, not declared. */
    z.strictObject({ kind: z.literal("project"), from: Name, keep: z.array(Name).min(1) }),
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
    z.strictObject({ kind: z.literal("graph"), from: Name, edgeFrom: Name, edgeTo: Name, value: Name.optional(), requiresConservation: z.literal(true).optional() }),
  ])
  .meta({ id: "derivation" });

export const Relation = z
  .strictObject({
    grain: z.union([z.literal("unknown"), z.array(Name).min(1)]),
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
    peers: z.array(z.array(Name).min(2)).min(1).optional(),
  })
  .meta({
    id: "relationalStructure",
    title: "Relational structure (L0-L2 kernel)",
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
  along: z.array(Name).min(1).optional(),
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
    grainWitness: z.record(Name, z.array(Name).min(1)).optional(),
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
