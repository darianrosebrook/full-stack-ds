/**
 * Stage-1 relational structure: the L0-L2 representation the engine consumes.
 *
 * The types are INFERRED from `relation-model.ts` (the single authority) and
 * re-exported here; the JSON Schemas consumers read are emitted from the same
 * model. Nothing here knows about the corpus, cases, or expected verdicts;
 * nothing here names a task, channel, coordinate, projection, combinator, or
 * form.
 *
 * Type-level vs observation-level: a field's `permits` declares which
 * qualifiers its observations MAY carry; each observation carries which it
 * HAS (`normalizeObservation`). That split is doctrine, not convenience.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { Ajv, type ValidateFunction } from "ajv";
import type {
  AdditivityDecl,
  AggregateOp,
  Assertion,
  Dimension,
  Evidence,
  FieldDecl,
  Fixture,
  Name,
  NullKind,
  ObservationInput,
  ObservationRecord,
  PermitsDecl,
  Provenance,
  RelationDecl,
  RelationalStructure,
  RelationshipDecl,
  Scale,
  Shape,
  TemporalityDecl,
  UncertaintyKind,
  UnitDecl,
} from "./relation-model.js";

export type {
  AdditivityDecl,
  AggregateOp,
  Assertion,
  Dimension,
  Evidence,
  FieldDecl,
  Fixture,
  Name,
  NullKind,
  ObservationInput,
  ObservationRecord,
  PermitsDecl,
  Provenance,
  RelationDecl,
  RelationalStructure,
  RelationshipDecl,
  Scale,
  Shape,
  TemporalityDecl,
  UncertaintyKind,
  UnitDecl,
};

/** An observation after normalization: what it HAS, with defaults made explicit. */
export type Observation = Omit<ObservationRecord, "provenance" | "uncertainty"> & {
  provenance: Provenance;
  uncertainty: NonNullable<ObservationRecord["uncertainty"]>;
};

/** A bare value is an observed, certain scalar; an object carries what it has. */
export function normalizeObservation(o: ObservationInput): Observation {
  if (o === null || typeof o !== "object") {
    return { value: o, provenance: "observed", uncertainty: { kind: "none" } };
  }
  return {
    ...(o.value !== undefined ? { value: o.value } : {}),
    ...(o.unit !== undefined ? { unit: o.unit } : {}),
    ...(o.null !== undefined ? { null: o.null } : {}),
    provenance: o.provenance ?? "observed",
    uncertainty: o.uncertainty ?? { kind: "none" },
  };
}

/** Parse fixtures.jsonl, naming the line on a parse failure. */
export function parseFixtures(text: string): Fixture[] {
  const out: Fixture[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      out.push(JSON.parse(line) as Fixture);
    } catch (err) {
      throw new Error(`fixtures.jsonl line ${i + 1}: ${(err as Error).message}`);
    }
  }
  return out;
}

/**
 * Compile the fixture validator from the EMITTED fixture schema (self-contained;
 * a projection of the model). Returns a function yielding Ajv error strings
 * (empty = valid). Consumers validate against the JSON, never against zod.
 */
export function loadFixtureValidator(contractsDir: string): (fixture: unknown) => string[] {
  const schema = JSON.parse(fs.readFileSync(path.join(contractsDir, "analytical-fixtures/fixture.schema.json"), "utf-8")) as object;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate: ValidateFunction = ajv.compile(schema);
  return (fixture) =>
    validate(fixture)
      ? []
      : (validate.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`.trim());
}

const rn = (map: Record<string, string>) => (s: string) => map[s] ?? s;

/**
 * Rename relations and fields everywhere they are referenced. Used to prove
 * that identifier spelling confers no analytical standing: the judgment of a
 * renamed fixture must equal the original's up to `renameSubject`.
 */
export function alphaRename(fixture: Fixture, map: Record<string, string>): Fixture {
  const r = rn(map);
  const relations: Record<string, RelationDecl> = {};
  for (const [name, rel] of Object.entries(fixture.structure.relations)) {
    const fields: Record<string, FieldDecl> = {};
    for (const [fname, f] of Object.entries(rel.fields)) {
      const g: FieldDecl = { ...f };
      if (f.additivity?.kind === "semi-additive") {
        g.additivity = { kind: "semi-additive", nonAdditiveAlong: f.additivity.nonAdditiveAlong.map(r) };
      } else if (f.additivity?.kind === "ratio-measure") {
        g.additivity = { kind: "ratio-measure", numerator: r(f.additivity.numerator), denominator: r(f.additivity.denominator) };
      }
      if (typeof f.whole === "object") g.whole = { perRow: r(f.whole.perRow) };
      fields[r(fname)] = g;
    }
    relations[r(name)] = { grain: rel.grain === "unknown" ? "unknown" : rel.grain.map(r), fields };
  }
  const relationships = fixture.structure.relationships?.map((x) => ({
    from: { relation: r(x.from.relation), field: r(x.from.field) },
    to: { relation: r(x.to.relation), field: r(x.to.field) },
    cardinality: x.cardinality,
  }));
  const assertions = fixture.assertions.map((a) => {
    const base = { ...a, relation: r(a.relation), field: r(a.field) };
    if (a.kind === "aggregate" && a.along) return { ...base, along: a.along.map(r) } as Assertion;
    if (a.kind === "rollup") return { ...base, toGrain: a.toGrain.map(r) } as Assertion;
    return base as Assertion;
  });
  let evidence: Evidence | undefined;
  if (fixture.evidence) {
    evidence = {};
    if (fixture.evidence.rows) {
      evidence.rows = {};
      for (const [rel, rows] of Object.entries(fixture.evidence.rows)) {
        evidence.rows[r(rel)] = rows.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [r(k), v])));
      }
    }
    if (fixture.evidence.grainWitness) {
      evidence.grainWitness = Object.fromEntries(
        Object.entries(fixture.evidence.grainWitness).map(([rel, keys]) => [r(rel), keys.map(r)]),
      );
    }
  }
  return { id: fixture.id, structure: { relations, ...(relationships ? { relationships } : {}) }, assertions, ...(evidence ? { evidence } : {}) };
}

/** Apply a rename map to a judgment subject (`rel`, `rel.field`). */
export function renameSubject(subject: string, map: Record<string, string>): string {
  const r = rn(map);
  return subject.split(".").map(r).join(".");
}
