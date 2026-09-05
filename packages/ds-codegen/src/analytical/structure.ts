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
  Evidence,
  FieldDecl,
  Fixture,
  Name,
  NullKind,
  ObservationInput,
  ObservationRecord,
  PermitsDecl,
  RelationDecl,
  RelationalStructure,
  TemporalityDecl,
  Transformation,
  UnitDecl,
} from "./relation-model.js";

export type {
  AdditivityDecl,
  AggregateOp,
  Assertion,
  Evidence,
  FieldDecl,
  Fixture,
  Name,
  NullKind,
  ObservationInput,
  ObservationRecord,
  PermitsDecl,
  RelationDecl,
  RelationalStructure,
  TemporalityDecl,
  Transformation,
  UnitDecl,
};

/** An observation after normalization: what it HAS, in record form. */
export type Observation = ObservationRecord;

/** A bare value is an observed scalar; an object carries what it has. */
export function normalizeObservation(o: ObservationInput): Observation {
  if (o === null || typeof o !== "object") return { value: o };
  return {
    ...(o.value !== undefined ? { value: o.value } : {}),
    ...(o.unit !== undefined ? { unit: o.unit } : {}),
    ...(o.null !== undefined ? { null: o.null } : {}),
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

