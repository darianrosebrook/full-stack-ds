/**
 * The quotient language: that it exists, that it is derived, and that the
 * marker cannot be forged.
 *
 * The load-bearing claim in `quotient-image.ts` is that `@q` is unambiguous BY
 * CONSTRUCTION rather than by convention — every record key in the source
 * language is a `Name`, and `Name` cannot begin with `@`. A claim of that shape
 * is worth exactly as much as its falsifier, so the first block below attacks it
 * from both sides: the model must reject `@q` as a name, and the emitted schema
 * must contain no `@`-prefixed property anywhere.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { loadPlans } from "./census.js";
import { CONTRACTS_DIR, emitSchemas } from "./emit-schemas.js";
import { executePlan } from "./erasure-plan.js";
import { Name, type Fixture, type RelationalStructure } from "./relation-model.js";
import {
  absorb,
  classify,
  forgotten,
  isForgotten,
  isMarker,
  isMemberClass,
  loadQuotientValidator,
  markersIn,
  memberClass,
  Q,
  QUOTIENT_SCHEMA_FILE,
  type QuotientImage,
  relaxToQuotientLanguage,
} from "./quotient-image.js";

describe("the codomain is not the domain, and the compiler is what says so", () => {
  it("a QuotientImage cannot enter an API that requires a source Fixture, while every Fixture is trivially an image", () => {
    // The two directives below are the negative. `pnpm run typecheck` fails if
    // either assignment stops being an error (an unused @ts-expect-error is
    // itself a compile error), so "the executor never hands an image back as a
    // fixture" is a fact the compiler checks rather than a convention a
    // reviewer checks. Nothing here is executed for its value.
    const fixture: Fixture = { id: "FX_CODOMAIN", structure: { relations: { r: { grain: "unknown", fields: { f: { transformation: "ratio" } } } } }, assertions: [] };
    const image = executePlan(fixture, loadPlans().get("field.transformation")!);
    // @ts-expect-error a quotient image is not a source declaration
    const asFixture: Fixture = image;
    // @ts-expect-error the engine judges the source language; an image's structure is not in it
    const asStructure: RelationalStructure = image.structure;
    void asFixture;
    void asStructure;
    // The positive control: a fixture IS an image of itself (zero erasures).
    const trivially: QuotientImage = fixture;
    void trivially;
    // And the value really left the source language: the required leaf is a hole.
    expect(markersIn(image).map((m) => m.path)).toEqual(["structure.relations.r.fields.f.transformation"]);
  });
});

describe("the marker cannot collide with source content", () => {
  it("is not a legal Name, so no record key can spell it", () => {
    expect(Name.safeParse(Q).success).toBe(false);
    expect(Name.safeParse("q").success).toBe(true);
  });

  it("appears nowhere in the emitted source schema, under any key", () => {
    const source = emitSchemas()["analytical-fixtures/fixture.schema.json"];
    // Not a substring search on the rendered bytes: a `@` inside a description
    // would be a false alarm. Property NAMES are what could collide.
    const names: string[] = [];
    const walk = (n: unknown): void => {
      if (Array.isArray(n)) return void n.forEach(walk);
      if (typeof n !== "object" || n === null) return;
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        if (k === "properties" && typeof v === "object" && v !== null) names.push(...Object.keys(v));
        walk(v);
      }
    };
    walk(JSON.parse(source));
    expect(names.filter((n) => n.startsWith("@"))).toEqual([]);
    expect(names.length).toBeGreaterThan(20);
  });

  it("recognises a marker by its tag VALUE, so a record keyed `@q` is not one", () => {
    // `{relations: {...}}` is an object whose keys are arbitrary Names. If
    // recognition were `Q in v`, a relation named `@q` would read as a marker.
    // It cannot be named that — but recognition does not depend on that being
    // true, which is the point of testing both.
    expect(isMarker({ [Q]: { type: "object" } })).toBe(false);
    expect(isMarker({ [Q]: "something-else" })).toBe(false);
    expect(isMarker({ [Q]: "forgotten", by: [] })).toBe(true);
    expect(isMarker({ [Q]: "member-class", members: ["a", "b"] })).toBe(true);
  });
});

describe("the four value kinds stay distinct", () => {
  it("tells absent from forgotten, which the old delete-slot conflated", () => {
    // The distinction the whole module exists for. `{}` says the fact was never
    // declared; `{k: <hole>}` says it was and this quotient suppresses it.
    expect(classify({}, "k")).toBe("absent");
    expect(classify({ k: forgotten(["c"]) }, "k")).toBe("forgotten");
    expect(classify({ k: memberClass(["a", "b"]) }, "k")).toBe("member-class");
    expect(classify({ k: "day" }, "k")).toBe("known");
  });

  it("reads an array element by index, so an emptied slot is absent and not null", () => {
    expect(classify([1], 0)).toBe("known");
    expect(classify([1], 1)).toBe("absent");
  });
});

describe("absorb is a union, so re-erasing a slot is order-independent", () => {
  const attribution = (m: unknown): readonly string[] => (isForgotten(m) ? m.by : []);
  const klass = (m: unknown): readonly string[] => (isMemberClass(m) ? m.members : []);

  it("unions attributions rather than overwriting them", () => {
    const a = forgotten(["x"]);
    const b = forgotten(["y"]);
    expect(attribution(absorb(a, b))).toEqual(["x", "y"]);
    expect(attribution(absorb(b, a))).toEqual(["x", "y"]);
  });

  it("is idempotent: forgetting a hole again leaves the same hole", () => {
    const a = forgotten(["x"]);
    expect(absorb(a, a)).toEqual(a);
  });

  it("unions member classes, which is what makes composed merges confluent", () => {
    // Two merges over the same leaf, applied in either order, must reach the
    // same class. String rewriting could not do this: merging sum->mean then
    // mean->count leaves `sum` spelled `mean` and everything else `count`.
    const one = absorb(memberClass(["sum", "mean"]), memberClass(["mean", "count"]));
    const other = absorb(memberClass(["mean", "count"]), memberClass(["sum", "mean"]));
    expect(one).toEqual(other);
    expect(klass(one)).toEqual(["count", "mean", "sum"]);
  });

  it("lets forgetting absorb a class, because a hole that remembers its class still discriminates", () => {
    expect(absorb(memberClass(["a", "b"]), forgotten(["c"]))).toEqual(forgotten(["c"]));
    expect(absorb(forgotten(["c"]), memberClass(["a", "b"]))).toEqual(forgotten(["c"]));
  });
});

describe("the quotient language is derived, not authored", () => {
  it("is committed exactly as the transform emits it from the source schema", () => {
    const emitted = emitSchemas()[QUOTIENT_SCHEMA_FILE];
    expect(fs.readFileSync(path.join(CONTRACTS_DIR, QUOTIENT_SCHEMA_FILE), "utf-8")).toBe(emitted);
  });

  it("admits a marker at a property, an item, and a record value alike", () => {
    const relaxed = relaxToQuotientLanguage({
      type: "object",
      properties: { a: { type: "string" }, b: { type: "array", items: { type: "string" } } },
      additionalProperties: { type: "number" },
    });
    const p = relaxed.properties as Record<string, { anyOf: unknown[] }>;
    expect(p.a.anyOf[1]).toEqual({ $ref: "#/definitions/quotientMarker" });
    expect((p.b.anyOf[0] as { items: { anyOf: unknown[] } }).items.anyOf[1]).toEqual({ $ref: "#/definitions/quotientMarker" });
    expect((relaxed.additionalProperties as { anyOf: unknown[] }).anyOf[1]).toEqual({ $ref: "#/definitions/quotientMarker" });
  });

  it("does not admit one where a KEY stands, because a marker is never a key", () => {
    const relaxed = relaxToQuotientLanguage({ type: "object", propertyNames: { pattern: "^[a-z]+$" } });
    expect(relaxed.propertyNames).toEqual({ pattern: "^[a-z]+$" });
  });

  it("turns oneOf into anyOf, because forgetting a discriminator is joining branches", () => {
    // Not a convenience. An image whose discriminator is forgotten is
    // consistent with several branches by construction; under `oneOf` it would
    // be rejected for matching two, which reports the erasure working as the
    // erasure failing.
    const relaxed = relaxToQuotientLanguage({ oneOf: [{ const: "a" }, { const: "b" }] });
    expect(relaxed.oneOf).toBeUndefined();
    expect(relaxed.anyOf).toEqual([{ const: "a" }, { const: "b" }]);
  });

  it("leaves required, minItems and additionalProperties with their teeth", () => {
    const relaxed = relaxToQuotientLanguage({
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
      additionalProperties: false,
    });
    expect(relaxed.required).toEqual(["a"]);
    expect(relaxed.additionalProperties).toBe(false);
  });

  it("follows the source language automatically: a new required property appears in both", () => {
    // The reason the quotient schema is derived from the emitted source schema
    // rather than rendered from a second zod type. A second authority would be
    // a second schema reader, which is the defect class this lane exists to end.
    const relaxed = relaxToQuotientLanguage({
      type: "object",
      properties: { brandNew: { type: "string" } },
      required: ["brandNew"],
    });
    expect((relaxed.properties as Record<string, { anyOf: unknown[] }>).brandNew.anyOf).toHaveLength(2);
    expect(relaxed.required).toEqual(["brandNew"]);
  });
});

describe("the emitted validator", () => {
  const validate = loadQuotientValidator(CONTRACTS_DIR);

  const base = () => ({
    id: "FX_T",
    structure: { relations: { survey: { grain: ["respondent"], fields: { respondent: { transformation: "nominal", key: true } } } } },
    assertions: [{ kind: "aggregate", relation: "survey", field: "respondent", op: "mean" }],
  });

  it("is exercised against a shape the SOURCE language accepts, so a failure is about the hole", () => {
    expect(validate(base())).toEqual([]);
  });

  it("accepts a hole in a required leaf and rejects its absence", () => {
    const withHole = base() as unknown as { structure: { relations: { survey: Record<string, unknown> } } };
    withHole.structure.relations.survey.grain = forgotten(["relation.grain"]);
    expect(validate(withHole)).toEqual([]);
    delete withHole.structure.relations.survey.grain;
    expect(validate(withHole).join("; ")).toMatch(/required property 'grain'/);
  });

  it("accepts a member class where a closed vocabulary stood", () => {
    const merged = base() as unknown as { assertions: Record<string, unknown>[] };
    merged.assertions[0].op = memberClass(["mean", "sum"]);
    expect(validate(merged)).toEqual([]);
  });

  it("accepts a forgotten DISCRIMINATOR without demanding the branch it no longer names", () => {
    // The oneOf -> anyOf rule doing its job: with `kind` a hole, the assertion
    // is consistent with more than one branch, which is the content of
    // forgetting it rather than a reason to reject the image.
    const holed = base() as unknown as { assertions: Record<string, unknown>[] };
    holed.assertions[0].kind = forgotten(["assertion.kind"]);
    expect(validate(holed)).toEqual([]);
  });

  it("rejects an array emptied below the floor its declaration requires", () => {
    const image = base() as unknown as { structure: Record<string, unknown> };
    image.structure.peers = [["a"]];
    expect(validate(image).join("; ")).toMatch(/fewer than 2 items/);
  });
});

describe("markersIn", () => {
  it("finds every hole with the path it stands at, and descends no further", () => {
    const found = markersIn({ a: { b: forgotten(["x"]) }, c: [memberClass(["p", "q"])] });
    expect(found.map((m) => m.path)).toEqual(["a.b", "c[0]"]);
    // A marker is a leaf: `by` is an array of strings, not a place to keep looking.
    expect(found[0].marker).toEqual(forgotten(["x"]));
  });
});
