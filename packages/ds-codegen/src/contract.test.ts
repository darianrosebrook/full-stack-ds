import { resolve as resolvePath } from "node:path";
import { describe, it, expect } from "vitest";
import { normalizeStates } from "./contract.js";
import type { ComponentContract, ContractTextOverflow } from "./contract.js";
import { createContractValidator } from "./validate.js";

// CONTRACT-DIMENSIONAL-STATES-AUTHORITY-01 / A4: normalizeStates derives the
// flat selector-key list from the dimensional form. The derived `flat` must
// carry the active selector keys (hover/focus/disabled/checked) the legacy flat
// arrays produced — NOT the dimension defaults (rest/enabled/unchecked) — so
// generated output is byte-equivalent across the migration.
describe("normalizeStates: dimensional -> flat selector projection", () => {
  it("excludes each dimension's initial (base/absence) value from flat", () => {
    const n = normalizeStates({
      dimensions: {
        pointer: {
          category: "interaction",
          values: ["default", "hover", "active"],
          initial: "default",
          exclusive: true,
        },
        availability: {
          category: "availability",
          values: ["enabled", "disabled"],
          initial: "enabled",
          exclusive: true,
          suppresses: { categories: ["interaction"] },
        },
        selection: {
          category: "selection",
          values: ["unchecked", "checked"],
          initial: "unchecked",
          exclusive: true,
          a11y: { attribute: "aria-checked", values: { unchecked: "false", checked: "true" } },
        },
      },
    });
    // Active selector keys present; dimension defaults absent.
    expect(n.flat).toEqual(["hover", "active", "disabled", "checked"]);
    expect(n.flat).not.toContain("default");
    expect(n.flat).not.toContain("enabled");
    expect(n.flat).not.toContain("unchecked");
  });

  it("excludes channel-derived values from flat (surfaced via channel, not a CSS modifier)", () => {
    // Dialog's openness: fully channel-driven -> contributes nothing to flat,
    // so no .dialog--open modifier is introduced.
    const n = normalizeStates({
      dimensions: {
        openness: {
          category: "visibility",
          values: ["closed", "opening", "open", "closing"],
          initial: "closed",
          exclusive: true,
          derivesFrom: {
            opening: { channel: "openness" },
            open: { channel: "openness" },
            closing: { channel: "openness" },
          },
        },
      },
    });
    expect(n.flat).toEqual([]);
  });

  it("keeps a non-channel-marked value in flat even when the dimension is channel-backed", () => {
    // Sheet's asymmetry: `open` stays a CSS modifier (.sheet--open) while
    // opening/closing are channel-derived — faithfully preserving the
    // pre-existing per-component difference vs Dialog.
    const n = normalizeStates({
      dimensions: {
        openness: {
          category: "visibility",
          values: ["closed", "opening", "open", "closing"],
          initial: "closed",
          exclusive: true,
          derivesFrom: {
            opening: { channel: "openness" },
            closing: { channel: "openness" },
          },
        },
      },
    });
    expect(n.flat).toEqual(["open"]);
  });

  it("dedupes selector keys shared across dimensions, first-seen order", () => {
    const n = normalizeStates({
      dimensions: {
        a: { category: "validation", values: ["valid", "error"], initial: "valid", exclusive: true },
        b: { category: "data", values: ["idle", "error"], initial: "idle", exclusive: true },
      },
    });
    expect(n.flat).toEqual(["error"]);
  });

  it("returns flat:[] and dimensions:null when states are omitted", () => {
    expect(normalizeStates(undefined)).toEqual({ flat: [], dimensions: null });
  });

  it("preserves the dimensions object for downstream emitters", () => {
    const states = {
      dimensions: {
        focus: {
          category: "interaction" as const,
          values: ["unfocused", "focus"],
          initial: "unfocused",
          exclusive: true,
        },
      },
    };
    const n = normalizeStates(states);
    expect(n.dimensions).toBe(states.dimensions);
    expect(n.flat).toEqual(["focus"]);
  });
});

// CODEGEN-RN-EMITTER-IR-AUTHORITY-01 / A3: this is the typed-reachability
// half of the proof. ComponentContract.textOverflow must be a real, named
// field ir.ts can read without an `as any` escape hatch — a schema `$ref`
// alone is not enough if the TS model has no matching field (that gap is
// exactly what made A2/Checkbox's IR-property-binding investigation find
// "typed-model unreachable" as a distinct failure mode from "schema-invalid").
describe("ComponentContract.textOverflow — typed reachability", () => {
  it("accepts a well-formed textOverflow block without a type escape hatch", () => {
    const textOverflow: ContractTextOverflow = {
      kind: "line-clamp",
      line: "prop:maxLines",
    };
    const contract: ComponentContract = {
      name: "Test",
      layer: "compound",
      textOverflow,
    };
    expect(contract.textOverflow?.kind).toBe("line-clamp");
    expect(contract.textOverflow?.line).toBe("prop:maxLines");
  });

  it("textOverflow is optional — a contract without it typechecks", () => {
    const contract: ComponentContract = { name: "Test", layer: "primitive" };
    expect(contract.textOverflow).toBeUndefined();
  });
});

// Schema-level accept/reject, using the real Ajv validator against the real
// component.contract.schema.json (same pattern as validate.test.ts's
// full-corpus pass, scoped down to just the textOverflow $def).
describe("component.contract.schema.json — textOverflow accept/reject", () => {
  const CONTRACTS_ROOT = resolvePath(__dirname, "../../ds-contracts");
  const validator = createContractValidator({ contractsRoot: CONTRACTS_ROOT });

  function minimalContract(textOverflow: unknown): unknown {
    return {
      name: "SchemaTest",
      layer: "compound",
      textOverflow,
    };
  }

  it("accepts a well-formed { kind: line-clamp, line: prop:<name> } block", () => {
    const result = validator.validateComponent(
      minimalContract({ kind: "line-clamp", line: "prop:maxLines" }),
    );
    expect(result.ok).toBe(true);
  });

  it("rejects a textOverflow block missing the required line field", () => {
    const result = validator.validateComponent(
      minimalContract({ kind: "line-clamp" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a textOverflow block missing the required kind field", () => {
    const result = validator.validateComponent(
      minimalContract({ line: "prop:maxLines" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a kind value outside the closed line-clamp enum", () => {
    const result = validator.validateComponent(
      minimalContract({ kind: "ellipsis", line: "prop:maxLines" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a line value that is not a prop:<name> binding", () => {
    const result = validator.validateComponent(
      minimalContract({ kind: "line-clamp", line: "literalValue" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejects an unknown property inside textOverflow (additionalProperties: false)", () => {
    const result = validator.validateComponent(
      minimalContract({ kind: "line-clamp", line: "prop:maxLines", extra: true }),
    );
    expect(result.ok).toBe(false);
  });
});
