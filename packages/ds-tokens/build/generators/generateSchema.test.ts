import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateCompleteSchema,
  generateSchema,
} from "./generateSchema.mjs";

afterEach(() => {
  vi.restoreAllMocks();
});

const STANDARD_DTCG_TYPES = [
  "color",
  "dimension",
  "fontFamily",
  "fontWeight",
  "duration",
  "cubicBezier",
  "number",
  "border",
  "transition",
  "shadow",
  "gradient",
  "typography",
  "strokeStyle",
];

describe("generateCompleteSchema", () => {
  const schema = generateCompleteSchema();

  it("emits a draft-07 JSON schema with the DTCG header", () => {
    expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#");
    expect(schema.type).toBe("object");
    expect(schema.$id).toContain("designTokens.schema.json");
    expect(schema.title).toBe("Design Tokens Schema");
  });

  it("defines token and group schemas plus every standard type", () => {
    expect(schema.$defs.token).toBeDefined();
    expect(schema.$defs.group).toBeDefined();
    for (const type of STANDARD_DTCG_TYPES) {
      expect(schema.$defs[`${type}Value`], `${type}Value`).toBeDefined();
    }
  });

  it("routes $value through the oneOf value defs", () => {
    const valueRefs = schema.$defs.token.properties.$value.oneOf.map(
      (entry: { $ref?: string }) => entry.$ref,
    );
    expect(valueRefs).toContain("#/$defs/colorValue");
    expect(valueRefs).toContain("#/$defs/dimensionValue");
    expect(valueRefs).toContain("#/$defs/typographyValue");
  });

  it("matches non-$ keys through patternProperties", () => {
    expect(schema.patternProperties["^(?!\\$).*"]).toBeDefined();
    expect(schema.patternProperties["^(?!\\$).*"].anyOf).toHaveLength(3);
  });

  it("is deterministic across calls", () => {
    expect(generateCompleteSchema()).toEqual(schema);
  });
});

describe("generateSchema", () => {
  it("writes the schema JSON and returns it", () => {
    const mkdirSpy = vi.spyOn(fs, "mkdirSync").mockImplementation(() => "");
    const writeSpy = vi
      .spyOn(fs, "writeFileSync")
      .mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const schema = generateSchema();

    expect(schema).toEqual(generateCompleteSchema());
    expect(writeSpy).toHaveBeenCalledOnce();
    expect(
      JSON.parse(writeSpy.mock.calls[0]![1] as string),
    ).toEqual(schema);
    expect(mkdirSpy).toHaveBeenCalledOnce();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `Schema supports ${STANDARD_DTCG_TYPES.length} DTCG 1.0 standard types`,
      ),
    );
  });
});
