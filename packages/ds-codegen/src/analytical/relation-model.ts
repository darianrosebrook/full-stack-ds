/**
 * The single authority for the L0-L2 relational structure, the stage-1
 * assertion grammar, and the fixture shape (REL-FIELD-ALGEBRA-02, invariant 3).
 *
 * Everything else is derived from this file:
 * - TypeScript types are inferred (`structure.ts` re-exports them);
 * - `relation.contract.schema.json`, `assertion.schema.json` and
 *   `fixture.schema.json` are EMITTED from it by `emit-schemas.ts` and
 *   drift-gated; consumers read the JSON and never import zod;
 * - the coordinate census (`census.ts`) is walked from it.
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

export const Scale = z.enum(["nominal", "ordinal", "cyclic", "interval", "ratio", "count", "proportion", "index"]);
export const Shape = z.enum(["scalar", "interval", "set", "distribution", "point"]);
export const NullKind = z.enum(["absent", "not-applicable", "censored", "suppressed", "unknown", "missing-after-join"]);
export const Provenance = z.enum(["observed", "derived", "imputed", "layout-generated"]);
export const UncertaintyKind = z.enum(["none", "interval", "distribution", "measurement-error", "rounded"]);
export const Dimension = z.enum(["currency", "time", "length", "mass", "temperature", "dimensionless"]).meta({ id: "dimension" });

export const Unit = z
  .strictObject({
    dimension: Dimension,
    unit: z.string().min(1).optional(),
    units: z.array(z.string().min(1)).min(1).optional(),
    perRow: z.boolean().optional(),
    conversions: z.record(z.string().regex(/^[A-Za-z][A-Za-z0-9]*$/), z.number().positive()).optional(),
    rate: z.strictObject({ numerator: Dimension, denominator: Dimension }).optional(),
  })
  .meta({ id: "unit" });

export const Temporality = z
  .strictObject({
    kind: z.enum(["instant", "interval", "duration"]),
    closure: z.enum(["half-open", "closed", "open"]).optional(),
    grain: z.enum(["second", "minute", "hour", "day", "week", "month", "quarter", "year"]).optional(),
    calendar: z.string().min(1).optional(),
  })
  .meta({ id: "temporality" });

export const Additivity = z
  .discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("additive") }),
    z.strictObject({ kind: z.literal("semi-additive"), nonAdditiveAlong: z.array(Name).min(1) }),
    z.strictObject({ kind: z.literal("non-additive") }),
    z.strictObject({ kind: z.literal("ratio-measure"), numerator: Name, denominator: Name }),
  ])
  .meta({ id: "additivity" });

export const Permits = z
  .strictObject({
    null: z.array(NullKind).optional(),
    provenance: z.array(Provenance).optional(),
    uncertainty: z.array(UncertaintyKind).optional(),
  })
  .meta({ id: "permits" });

export const Field = z
  .strictObject({
    scale: Scale,
    shape: Shape.optional(),
    key: z.boolean().optional(),
    unit: Unit.optional(),
    temporality: Temporality.optional(),
    order: z
      .strictObject({
        kind: z.enum(["total", "partial"]),
        values: z.array(z.union([z.string(), z.number()])).min(2).optional(),
      })
      .optional(),
    period: z.number().positive().optional(),
    whole: z.union([z.string().min(1), z.strictObject({ perRow: Name })]).optional(),
    base: z.string().min(1).optional(),
    additivity: Additivity.optional(),
    permits: Permits.optional(),
  })
  .meta({ id: "field" });

export const Relation = z
  .strictObject({
    grain: z.union([z.literal("unknown"), z.array(Name).min(1)]),
    fields: z.record(Name, Field),
  })
  .meta({ id: "relation" });

export const Ref = z.strictObject({ relation: Name, field: Name }).meta({ id: "ref" });

export const Relationship = z
  .strictObject({
    from: Ref,
    to: Ref,
    cardinality: z.enum(["one-to-one", "one-to-many", "many-to-one", "many-to-many"]),
  })
  .meta({ id: "relationship" });

export const RelationalStructure = z
  .strictObject({
    relations: z.record(Name, Relation),
    relationships: z.array(Relationship).optional(),
  })
  .meta({
    id: "relationalStructure",
    title: "Relational structure (L0-L2)",
    description:
      "The authoritative analytical object of ARCH-ANALYTICAL-RELATION-001: one or more named relations, each with a declared grain and typed fields, plus declared relationships between them. A single relation is the degenerate structure. Emitted from packages/ds-codegen/src/analytical/relation-model.ts; do not edit by hand.",
  });

export const AggregateAssertion = z.strictObject({
  kind: z.literal("aggregate"),
  relation: Name,
  field: Name,
  op: z.enum(["sum", "mean", "count", "min", "max"]),
  along: z.array(Name).min(1).optional(),
  nulls: z.enum(["exclude", "as-zero", "as-observed"]).optional(),
  uncertainty: z.enum(["propagate", "drop"]).optional(),
});

export const RatioComparisonAssertion = z.strictObject({
  kind: z.literal("ratio-comparison"),
  relation: Name,
  field: Name,
});

export const RollupAssertion = z.strictObject({
  kind: z.literal("rollup"),
  relation: Name,
  field: Name,
  toGrain: z.array(Name),
  op: z.enum(["sum", "mean", "rederive"]),
});

export const Assertion = z
  .discriminatedUnion("kind", [AggregateAssertion, RatioComparisonAssertion, RollupAssertion])
  .meta({
    id: "assertion",
    title: "Stage-1 analytical assertion (L0-L2 grammar)",
    description:
      "The closed set of operations a stage-1 engine can be asked to judge over a relational structure. Emitted from packages/ds-codegen/src/analytical/relation-model.ts; do not edit by hand.",
  });

export const Uncertainty = z
  .strictObject({
    kind: UncertaintyKind,
    error: z.number().min(0).optional(),
    low: z.number().optional(),
    high: z.number().optional(),
    level: z.number().gt(0).max(1).optional(),
  })
  .meta({ id: "uncertainty" });

export const Scalar = z.union([z.number(), z.string(), z.boolean()]);

export const ObservationRecord = z
  .strictObject({
    value: Scalar.optional(),
    unit: z.string().min(1).optional(),
    null: NullKind.optional(),
    provenance: Provenance.optional(),
    uncertainty: Uncertainty.optional(),
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
export type Scale = z.infer<typeof Scale>;
export type Shape = z.infer<typeof Shape>;
export type NullKind = z.infer<typeof NullKind>;
export type Provenance = z.infer<typeof Provenance>;
export type UncertaintyKind = z.infer<typeof UncertaintyKind>;
export type Dimension = z.infer<typeof Dimension>;
export type UnitDecl = z.infer<typeof Unit>;
export type TemporalityDecl = z.infer<typeof Temporality>;
export type AdditivityDecl = z.infer<typeof Additivity>;
export type PermitsDecl = z.infer<typeof Permits>;
export type FieldDecl = z.infer<typeof Field>;
export type RelationDecl = z.infer<typeof Relation>;
export type RelationshipDecl = z.infer<typeof Relationship>;
export type RelationalStructure = z.infer<typeof RelationalStructure>;
export type AggregateOp = z.infer<typeof AggregateAssertion>["op"];
export type Assertion = z.infer<typeof Assertion>;
export type ObservationRecord = z.infer<typeof ObservationRecord>;
export type ObservationInput = z.infer<typeof ObservationInput>;
export type Evidence = z.infer<typeof Evidence>;
export type Fixture = z.infer<typeof Fixture>;
