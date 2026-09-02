/**
 * Single schema authority (REL-FIELD-ALGEBRA-02, invariant 3): the committed
 * JSON Schemas are deterministic projections of the zod model. This test is
 * the CI drift gate; `analytical:check-schemas` is the pre-push one.
 */
import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { CONTRACTS_DIR, checkSchemas, emitSchemas, writeSchemas } from "./emit-schemas.js";

describe("emitted schemas are the model's projection", () => {
  it("committed files equal the emission byte-for-byte", () => {
    expect(checkSchemas()).toEqual([]);
  });

  it("emission is deterministic and draft-07 with closed objects throughout", () => {
    const a = emitSchemas();
    const b = emitSchemas();
    expect(a).toEqual(b);
    for (const [file, text] of Object.entries(a)) {
      const json = JSON.parse(text) as { $schema: string; $id: string };
      expect(json.$schema, file).toBe("http://json-schema.org/draft-07/schema#");
      expect(json.$id).toBe(path.basename(file));
      // every object schema is closed: no "type":"object" without additionalProperties
      const objects = text.match(/"type": "object"/g)?.length ?? 0;
      const closed = text.match(/"additionalProperties": (false|\{)/g)?.length ?? 0;
      expect(closed, `${file}: open object schema`).toBeGreaterThanOrEqual(objects);
    }
  });

  it("a hand edit to a committed schema is reported as drift", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-schemas-"));
    fs.mkdirSync(path.join(dir, "analytical-fixtures"));
    writeSchemas(dir);
    expect(checkSchemas(dir)).toEqual([]);
    const target = path.join(dir, "relation.contract.schema.json");
    fs.writeFileSync(target, fs.readFileSync(target, "utf-8").replace('"additionalProperties": false', '"additionalProperties": true'));
    expect(checkSchemas(dir)).toEqual(["relation.contract.schema.json"]);
    expect(CONTRACTS_DIR.endsWith("ds-contracts")).toBe(true);
  });
});
