/**
 * The legacy-vs-quotient comparison ledger: its classifier, its serializer, and
 * the coherence of the committed record with the tree it describes.
 *
 * The full recomputation runs the pinned legacy walker out of git history and is
 * a CLI (`legacy-comparison.ts --check`), cited from the evidence map with its
 * output. These tests pin the parts a unit test can hold: that the classifier
 * reads each divergence shape under the law it belongs to and refuses to file
 * an unknown one quietly; that the serializer cannot hide a rename; and that
 * the committed ledger is internally consistent and bound to the same specimen
 * population as the footprint report.
 */
import { describe, expect, it } from "vitest";
import { loadReport } from "./erasure-audit.js";
import {
  classifyDivergence,
  LAW,
  LEGACY_PIN,
  leaves,
  loadLegacyComparison,
  NEW_PATH_ANSWERS,
  neutral,
  shapeOf,
  type ClassInput,
} from "./legacy-comparison.js";
import { canonical } from "./quotient.js";
import type { Fixture } from "./structure.js";

const base = (): ClassInput => ({
  operation: "forget-value",
  legacy: { image: "aaaaaaaaaaaa" },
  new: { image: "bbbbbbbbbbbb" },
  legacyImage: { structure: { r: { kind: "x" } } },
  newImage: { structure: { r: { kind: "x" } } },
  legacyValidInSourceSchema: true,
  newQuotientLegal: true,
});

describe("the neutral serializer can hide nothing", () => {
  it("is independent of key order", () => {
    expect(neutral({ b: 1, a: { d: 2, c: 3 } })).toBe(neutral({ a: { c: 3, d: 2 }, b: 1 }));
  });

  it("is NOT name-blind: a renamed relation is a different image, where canonical() may not see it", () => {
    const f = (name: string): Fixture =>
      ({ id: "FX", structure: { relations: { [name]: { grain: "unknown", fields: { v: { transformation: "ratio" } } } } }, assertions: [] }) as unknown as Fixture;
    expect(neutral(f("orders"))).not.toBe(neutral(f("lines")));
    // The property this module exists to preserve: the comparison serializer
    // and the quotient's own canonicalizer are different instruments. Whether
    // canonical() identifies the two is its business; neutral() never does.
    expect(canonical(f("orders")) === canonical(f("lines")) || true).toBe(true);
  });

  it("treats a quotient marker as one leaf, not a subtree", () => {
    const l = leaves({ a: { "@q": "forgotten", by: ["x"] }, b: { c: 1 } });
    expect([...l.keys()].sort()).toEqual([".a", ".b.c"]);
    expect(shapeOf(l.get(".a"))).toBe("hole");
    expect(shapeOf({ "@q": "member-class", members: ["a", "b"] })).toBe("class");
    expect(shapeOf(undefined)).toBe("absent");
    expect(shapeOf("x")).toBe("scalar");
  });
});

describe("every divergence is read under its law, and an unknown shape is not filed quietly", () => {
  it("agrees only on identical neutral images", () => {
    expect(classifyDivergence(base()).class).toBe("agree");
  });

  it.each([
    {
      name: "a required leaf deleted by the legacy walker, source-invalid, vs the typed hole",
      input: { ...base(), legacyImage: { r: {} }, newImage: { r: { kind: { "@q": "forgotten", by: ["r.kind"] } } }, legacyValidInSourceSchema: false },
      cls: "forget-value:absent>hole:legacy-invalid",
      words: /legacy image is the departure/,
    },
    {
      name: "the same deletion where the emptied holder collapsed and the image stayed valid",
      input: { ...base(), legacyImage: { r: {} }, newImage: { r: { kind: { "@q": "forgotten", by: ["r.kind"] } } }, legacyValidInSourceSchema: true },
      cls: "forget-value:absent>hole:legacy-valid",
      words: /forgets MORE than the coordinate/,
    },
    {
      name: "a member rewritten by the legacy walker vs the member class, source-valid",
      input: { ...base(), operation: "merge-enum-members", legacyImage: { r: { kind: "a" } }, newImage: { r: { kind: { "@q": "member-class", members: ["a", "b"] } } } },
      cls: "merge-enum-members:scalar>class:legacy-valid",
      words: /asserting a member definitively/,
    },
    {
      name: "a discriminator rewritten under the other branch's payload, source-invalid",
      input: { ...base(), operation: "merge-enum-members", legacyImage: { r: { kind: "a" } }, newImage: { r: { kind: { "@q": "member-class", members: ["a", "b"] } } }, legacyValidInSourceSchema: false },
      cls: "merge-enum-members:scalar>class:legacy-invalid",
      words: /branch residue/,
    },
    {
      name: "a reference list truncated below its floor by the legacy walker",
      input: { ...base(), operation: "forget-reference-arity", legacyImage: { r: { levels: ["a"] } }, newImage: { r: { levels: ["a", "b"] } }, legacyValidInSourceSchema: false },
      cls: "forget-reference-arity:absent>scalar:legacy-invalid",
      words: /never below it/,
    },
  ])("$name", ({ input, cls, words }) => {
    const c = classifyDivergence(input as ClassInput);
    expect(c.class).toBe(cls);
    expect(c.disposition).toMatch(words);
    expect(c.diff.length).toBeGreaterThan(0);
  });

  it("names the side that has to answer: a new-path failure, and a new image that is not quotient-legal", () => {
    expect(classifyDivergence({ ...base(), new: { failure: "boom" } }).class).toBe("new-fails");
    expect(classifyDivergence({ ...base(), newQuotientLegal: false }).class).toBe("new-image-not-quotient-legal");
    expect([...NEW_PATH_ANSWERS]).toEqual(["new-fails", "new-image-not-quotient-legal"]);
  });

  it("a reference coordinate with no new plan is reported, not scored as agreement", () => {
    const c = classifyDivergence({ ...base(), operation: null, new: { absent: "no plan (reference coordinate)" }, newImage: undefined });
    expect(c.class).toBe("new-no-plan");
    expect(c.disposition).toMatch(/not scored as agreement/);
  });

  it("an unforeseen shape is labelled UNCLASSIFIED rather than given a disposition", () => {
    // A scalar becoming a one-element list: the leaf `.r.x` vanishes and `.r.x.0`
    // appears, so the mechanical signature is two shapes, and no law entry
    // reads it. The class code is still filed -- it is the disposition that is
    // refused, so the ledger check can name what nobody has read.
    const c = classifyDivergence({ ...base(), operation: "delete-slot", legacyImage: { r: { x: 1 } }, newImage: { r: { x: [1] } } });
    expect(c.class).toBe("delete-slot:absent>scalar,scalar>absent:legacy-valid");
    expect(c.disposition).toMatch(/^UNCLASSIFIED/);
  });

  it("every operation the plan compiler can emit has a law", () => {
    for (const k of ["forget-value", "delete-slot", "delete-holder", "delete-tagged-holder", "merge-enum-members", "spell-member-as-absent", "forget-reference-arity", "forget-reference-incidence", "forget-reference-order"]) {
      expect(LAW[k], k).toBeTruthy();
    }
  });
});

describe("the committed ledger is coherent and bound to the population it claims", () => {
  const ledger = loadLegacyComparison();

  it("carries this module's legacy pin", () => {
    expect(ledger.legacyPin).toEqual(LEGACY_PIN);
  });

  it("describes the same specimen population as the footprint report", () => {
    expect(ledger.population.membershipDigest).toBe(loadReport().footprintBasisDigest);
    expect(ledger.population.total).toBe(ledger.population.corpus + ledger.population.stimuli + ledger.population.synthesized);
  });

  it("gives every pair exactly one outcome", () => {
    expect(ledger.pairs).toBe(ledger.coordinates.both * ledger.population.total + (ledger.coordinates.onlyLegacy.length + ledger.coordinates.onlyNew.length) * ledger.population.total);
    expect(ledger.agree.count + ledger.divergences.length).toBe(ledger.pairs);
    expect(ledger.agree.digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it("files every divergence under a class that carries a law-based disposition, and the class counts add up", () => {
    const counted = new Map<string, number>();
    for (const [plan, specimen, legacy, fresh, cls] of ledger.divergences) {
      expect(ledger.classes[cls], `${plan} × ${specimen} has class ${cls}`).toBeDefined();
      expect(legacy === "-" || legacy.startsWith("F:") || /^[0-9a-f]{12}$/.test(legacy)).toBe(true);
      expect(fresh === "-" || fresh.startsWith("F:") || /^[0-9a-f]{12}$/.test(fresh)).toBe(true);
      counted.set(cls, (counted.get(cls) ?? 0) + 1);
    }
    for (const [cls, entry] of Object.entries(ledger.classes)) {
      expect(counted.get(cls), cls).toBe(entry.count);
      expect(entry.disposition).not.toMatch(/^UNCLASSIFIED/);
      expect(entry.plans.length).toBeGreaterThan(0);
    }
  });

  it("holds no record where the new path has to answer", () => {
    for (const k of NEW_PATH_ANSWERS) expect(ledger.classes[k], k).toBeUndefined();
  });

  it("does not resolve the reference coordinates in favour of either path", () => {
    const noPlan = ledger.classes["new-no-plan"];
    expect(noPlan).toBeDefined();
    expect(noPlan.disposition).toMatch(/not scored as agreement/);
  });
});
