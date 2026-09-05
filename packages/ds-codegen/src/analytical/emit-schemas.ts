/**
 * Emit the consumer-facing JSON Schemas from the zod model, or check that the
 * committed files equal the emission (`--check`). The JSON files are
 * deterministic projections of `relation-model.ts`; a hand edit to them is
 * drift and fails the check.
 *
 *   tsx packages/ds-codegen/src/analytical/emit-schemas.ts          # write
 *   tsx packages/ds-codegen/src/analytical/emit-schemas.ts --check  # verify
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as z from "zod";
import { emitQuotientSchema, QUOTIENT_SCHEMA_FILE } from "./quotient-image.js";
import { Assertion, Fixture, RelationalStructure } from "./relation-model.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CONTRACTS_DIR = path.resolve(HERE, "../../../ds-contracts");

const TARGETS = [
  { file: "relation.contract.schema.json", schema: RelationalStructure },
  { file: "analytical-fixtures/assertion.schema.json", schema: Assertion },
  { file: "analytical-fixtures/fixture.schema.json", schema: Fixture },
] as const;

function render(file: string, schema: z.ZodType): string {
  const json = z.toJSONSchema(schema, { target: "draft-7", reused: "inline", unrepresentable: "throw" }) as Record<string, unknown>;
  const { $schema, ...rest } = json;
  const ordered = { $schema: $schema ?? "http://json-schema.org/draft-07/schema#", $id: path.basename(file), ...rest };
  return JSON.stringify(ordered, null, 2) + "\n";
}

/**
 * Relative path -> emitted bytes.
 *
 * The quotient-image schema is DERIVED from the emitted fixture schema rather
 * than rendered from a second zod type, so the quotient language cannot drift
 * from the source language: a property added to the model appears in both, and
 * nobody maintains the second one. It is emitted last for that reason.
 */
export function emitSchemas(): Record<string, string> {
  const out: Record<string, string> = Object.fromEntries(TARGETS.map((t) => [t.file, render(t.file, t.schema)]));
  out[QUOTIENT_SCHEMA_FILE] = emitQuotientSchema(out["analytical-fixtures/fixture.schema.json"]);
  return out;
}

/** Files whose committed bytes differ from the emission (empty = clean). */
export function checkSchemas(contractsDir = CONTRACTS_DIR): string[] {
  const drift: string[] = [];
  for (const [rel, expected] of Object.entries(emitSchemas())) {
    const target = path.join(contractsDir, rel);
    const actual = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : "";
    if (actual !== expected) drift.push(rel);
  }
  return drift;
}

export function writeSchemas(contractsDir = CONTRACTS_DIR): string[] {
  const written: string[] = [];
  for (const [rel, bytes] of Object.entries(emitSchemas())) {
    fs.writeFileSync(path.join(contractsDir, rel), bytes);
    written.push(rel);
  }
  return written;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--check")) {
    const drift = checkSchemas();
    if (drift.length > 0) {
      console.error(`emit-schemas --check: DRIFT in ${drift.join(", ")} — run analytical:emit-schemas and commit`);
      process.exit(1);
    }
    console.log("emit-schemas --check: OK — committed schemas equal the model emission");
  } else {
    for (const rel of writeSchemas()) console.log(`emit-schemas: wrote ${rel}`);
  }
}
