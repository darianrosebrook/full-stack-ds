import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { listComponentContracts } from "./contracts-fs.js";
import { createContractValidator } from "./validate.js";

// This test schema-validates every contract on disk through the same Ajv
// validator the codegen uses at generation time. It is the single canonical
// check that the repo's contracts are all well-formed.
//
// Why it lives here (in ds-codegen) rather than in the showcase: the validator
// + schema are owned by ds-codegen, and adding a contract is a codegen-side
// activity. Keeping the test next to the validator means a regen-pipeline
// change can't silently regress contract validity.

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");

const validator = createContractValidator({ contractsRoot: CONTRACTS_ROOT });

function listPrimitiveFiles(): string[] {
  return readdirSync(resolve(CONTRACTS_ROOT, "primitives"))
    .filter((f) => f.endsWith(".primitive.json"))
    .filter(
      // BoxModel is a slot-pool primitive validated by its own schema
      // (box-model.primitive.schema.json), not by the Stack-style
      // primitive.contract.schema.json that this loop checks.
      (f) => f !== "BoxModel.primitive.json",
    )
    .sort();
}

describe("contract schema validation", () => {
  const contractEntries = listComponentContracts(CONTRACTS_ROOT);
  const primitiveFiles = listPrimitiveFiles();

  it("finds at least one contract and one primitive on disk", () => {
    // Sanity guard so this test can't silently pass-by-being-empty if the
    // contracts directory is ever misconfigured in CI.
    expect(contractEntries.length).toBeGreaterThan(0);
    expect(primitiveFiles.length).toBeGreaterThan(0);
  });

  it.each(contractEntries.map((c) => [c.filename, c.absPath] as const))(
    "%s validates against component.contract.schema.json",
    (file, absPath) => {
      const raw = readFileSync(absPath, "utf8");
      const json: unknown = JSON.parse(raw);
      const result = validator.validateComponent(json);
      if (!result.ok) {
        // Build a readable error message — Ajv error pointers + messages.
        const detail = result.issues.map((i) => `  ${i.pointer}: ${i.message}`).join("\n");
        expect.fail(`${file} failed schema validation:\n${detail}`);
      }
      expect(result.ok).toBe(true);
    },
  );

  it.each(primitiveFiles)("%s validates against primitive.contract.schema.json", (file) => {
    const raw = readFileSync(resolve(CONTRACTS_ROOT, "primitives", file), "utf8");
    const json: unknown = JSON.parse(raw);
    const result = validator.validatePrimitive(json);
    if (!result.ok) {
      const detail = result.issues.map((i) => `  ${i.pointer}: ${i.message}`).join("\n");
      expect.fail(`${file} failed schema validation:\n${detail}`);
    }
    expect(result.ok).toBe(true);
  });
});

describe("validator error reporting", () => {
  // Spot-check that invalid inputs are caught — guards against an empty-pass
  // validator (e.g., schema accidentally loaded as `true` allowing anything).
  it("rejects a contract missing the required `name` field", () => {
    const result = validator.validateComponent({ layer: "primitive" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => /name/.test(i.message + i.pointer))).toBe(true);
    }
  });

  it("rejects a contract with an unknown `layer` enum value", () => {
    const result = validator.validateComponent({ name: "Bogus", layer: "imaginary" });
    expect(result.ok).toBe(false);
  });

  it("rejects a contract with a non-PascalCase `name`", () => {
    const result = validator.validateComponent({ name: "lowercaseName", layer: "primitive" });
    expect(result.ok).toBe(false);
  });
});

// CODEGEN-PROPTYPE-DEFAULTS-BUILTINREF-01 A1: designed/constrained members may
// carry array defaults (matching the legacy propMember default schema), so
// real corpus props like Select.options ([{value,label}…]) and Shuttle.value
// (["a","b"]) can move to `designed` without dropping their emitted defaults.
describe("designed-member array defaults (Batch C enabler)", () => {
  it("accepts a designed member with an array-of-objects default + a builtin Date ref", () => {
    const result = validator.validateComponent({
      name: "ProbeDefaults",
      layer: "primitive",
      props: {
        designed: {
          members: [
            {
              name: "options",
              propType: { kind: "array", items: { kind: "ref", to: "OptItem" } },
              description: "Available options.",
              default: [
                { value: "alpha", label: "Alpha" },
                { value: "beta", label: "Beta" },
              ],
            },
            {
              name: "tags",
              propType: { kind: "array", items: { kind: "string" } },
              description: "Selected tags.",
              default: ["alpha", "beta"],
            },
            {
              name: "when",
              propType: { kind: "ref", to: "Date" },
              description: "Reference date.",
            },
          ],
        },
      },
      types: { OptItem: { kind: "alias", alias: "{ value: string; label: string }" } },
    });
    if (!result.ok) {
      const detail = result.issues.map((i) => `  ${i.pointer}: ${i.message}`).join("\n");
      expect.fail(`expected valid, got:\n${detail}`);
    }
    expect(result.ok).toBe(true);
  });
});
