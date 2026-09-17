/**
 * The bounded stage-3 experiment (REL-PROJECTION-EXPERIMENT-01).
 *
 * What is being tested is NOT "did the enumerator return more than one answer".
 * That is satisfiable by a lookup table. What is tested is:
 *
 *  - the candidate space is the PRODUCT of declared projection choices filtered
 *    by capacity and task invariants, and no form name reaches it;
 *  - the four metamorphic controls the doctrine precommitted produce the
 *    predicted SET DELTAS, not merely "something changed";
 *  - the observer reads the claims the program INDUCES rather than the ones it
 *    declares, which a sensitivity control separates;
 *  - the same authority refuses the task the measure cannot serve, under the
 *    corpus's own cause.
 *
 * The expectations in `PRECOMMITTED` were authored before the run. That is a
 * procedural guarantee, not a repository-verifiable one; what the repository
 * CAN check is that the reported delta equals the recorded expectation.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { judge } from "./engines.js";
import { canonicalJudgment } from "./judgment.js";
import { loadOracle } from "./necessity.js";
import { extractDoctrineDiagnostics } from "./corpus-integrity.js";
import {
  BASIS,
  BASIS_FIXTURE,
  CAPACITY,
  EXPERIMENT_TARGET,
  FORM_ALIASES,
  LEDGER,
  NON_CLAIMS,
  PRECOMMITTED,
  TASK_INVARIANTS,
  basisFacts,
  compositionProbe,
  declarationObserver,
  enumerate,
  inducedClaims,
  ledgerOf,
  programObserver,
  runExperiment,
} from "./projection.js";
import type { Program } from "./projection.js";
import type { RelationalStructure } from "./relation-model.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DOCTRINE = path.resolve(HERE, "../../../../docs/architecture/analytical-relation-doctrine.md");
const DENYLIST = JSON.parse(
  fs.readFileSync(path.resolve(HERE, "../../../ds-contracts/analytical-pack/form-names.json"), "utf-8"),
) as { denylist: string[] };

const fixture = loadOracle().fixtures.get(BASIS_FIXTURE)!;
const structure = fixture.structure as RelationalStructure;
const facts = basisFacts(structure, BASIS.relation, BASIS.dimension, BASIS.measure);
const enumeration = enumerate({
  facts,
  task: "magnitude-comparison",
  inventory: EXPERIMENT_TARGET,
  partitionDimension: BASIS.partitionDimension,
});

const result = runExperiment();
const programKey = (p: Program) => `${p.coordinate}|${p.dimension}|${p.measure}`;

describe("the entered basis is admitted on evidence, not on provisional status", () => {
  it("carries an admissible canonical judgment with no diagnostics and no obligations", () => {
    const j = JSON.parse(canonicalJudgment(judge(structure, fixture.assertions, fixture.evidence))) as {
      status: string;
      diagnostics: unknown[];
      obligations: unknown[];
    };
    expect(j.status).toBe("admissible");
    expect(j.diagnostics).toEqual([]);
    expect(j.obligations).toEqual([]);
  });

  it("names the facts the projection rules consume, and each one is declared", () => {
    expect(facts.grain).toEqual(["product", "date"]);
    expect(facts.dimension).toEqual({ transformation: "nominal", key: false, cyclic: false });
    expect(facts.measure.transformation).toBe("ratio");
    expect(facts.measure.additivityKind).toBe("semi-additive");
    expect(facts.measure.nonAdditiveAlong).toEqual(["date"]);
  });
});

describe("A1 — the candidate space arises from declared choices, not from a catalogue", () => {
  it("retains at least two structurally different lawful programs from the SAME authority", () => {
    expect(enumeration.retained.length).toBeGreaterThanOrEqual(2);
    const distinct = new Set(enumeration.retained.map(programKey));
    expect(distinct.size).toBeGreaterThanOrEqual(2);
    // Structural distinctness per the precommit: two programs differing only in
    // orientation are one proof, so the pairs must differ in coordinate family,
    // in a channel assignment, or in both.
    const [a, b] = enumeration.retained;
    expect(programKey(a)).not.toBe(programKey(b));
  });

  it("holds relation, derivation and task fixed across every retained program", () => {
    for (const p of enumeration.retained) {
      expect(p.task).toBe("magnitude-comparison");
      expect(CAPACITY[p.dimension].carries).toContain("nominal");
      expect(CAPACITY[p.measure].carries).toContain("ratio");
      expect(CAPACITY[p.dimension].spaces).toContain(p.coordinate);
      expect(CAPACITY[p.measure].spaces).toContain(p.coordinate);
    }
  });

  it("keeps a form name out of the enumeration path", () => {
    // The alias table is the only place a form name may appear, and it is
    // downstream of the filter. Strip it and strip comments, then check the
    // denylist: an implementation that grew a form-shaped input fails here.
    const src = fs.readFileSync(path.resolve(HERE, "projection.ts"), "utf-8");
    const withoutAliases = src.slice(0, src.indexOf("export const FORM_ALIASES"));
    const withoutComments = withoutAliases.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
    const hits = DENYLIST.denylist.filter((name) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(withoutComments));
    expect(hits, `form names reached the module: ${hits.join(", ")}`).toEqual([]);
    expect(Object.keys(FORM_ALIASES).length).toBeGreaterThan(0);
  });

  it("emits only causes the doctrine's catalogue names", () => {
    const catalogue = extractDoctrineDiagnostics(fs.readFileSync(DOCTRINE, "utf-8"));
    const emitted = new Set([...enumeration.refused.map((r) => r.cause), ...result.refused.map((r) => r.cause)]);
    expect(emitted.size).toBeGreaterThan(0);
    for (const cause of emitted) expect(catalogue.has(cause), `${cause} is not a catalogue cause`).toBe(true);
  });

  it("refuses rather than silently drops, and records a reason per candidate", () => {
    expect(enumeration.refused.length).toBeGreaterThan(0);
    for (const r of enumeration.refused) expect(r.detail.length).toBeGreaterThan(0);
  });
});

describe("A2 — the four precommitted metamorphic controls", () => {
  for (const control of result.controls) {
    it(`${control.control}: ${control.expected}`, () => {
      expect(control.actual.length).toBeGreaterThan(0);
      expect(control.ok, `expected ${control.expected}; actual ${control.actual}`).toBe(true);
    });
  }

  it("ratio -> ordinal removes every program whose task-bearing claim rests on the ratio scale", () => {
    const ordinal = enumerate({
      facts: { ...facts, measure: { ...facts.measure, transformation: "ordinal" } },
      task: "magnitude-comparison",
      inventory: EXPERIMENT_TARGET,
    });
    // The measured result is EMPTY, and that is the honest one: magnitude
    // comparison requires ratio comparability, and every retained program
    // derived it from the scale that just went away. Nothing survives by
    // weakening the declared task, which is the escape this control forbids.
    expect(ordinal.retained).toEqual([]);
    // The removal is ratio-caused rather than blanket - proved by the
    // targeted-narrowing control, which removes only nominal-only dimension
    // channels and preserves thirteen programs.
    const narrow = result.controls.find((c) => c.control === "targeted-narrowing")!;
    expect(narrow.ok).toBe(true);
    expect(narrow.actual).toMatch(/removed [1-9]\d*, preserved [1-9]\d*/);
  });

  it("declared -> unknown moves the aggregate claims to an obligation and keeps the readback ones", () => {
    const unknown = enumerate({
      facts: { ...facts, grain: "unknown" },
      task: "magnitude-comparison",
      inventory: EXPERIMENT_TARGET,
    });
    expect(unknown.retained.every((p) => !inducedClaims(p, facts).includes("aggregate-magnitude"))).toBe(true);
    expect(unknown.undecided.length).toBeGreaterThan(0);
    expect(unknown.undecided.every((u) => u.obligation === "grain:declared")).toBe(true);
  });

  it("non-cyclic -> cyclic adds an angular assignment and removes nothing", () => {
    // Both sides sit on the ORDINAL dimension, so the cyclic claim is the only
    // fact that differs; comparing against the nominal baseline would move two
    // facts and blame the wrong one.
    const ordinalFacts = { ...facts, dimension: { ...facts.dimension, transformation: "ordinal" as const, cyclic: false } };
    const before = enumerate({ facts: ordinalFacts, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET });
    const after = enumerate({
      facts: { ...ordinalFacts, dimension: { ...ordinalFacts.dimension, cyclic: true } },
      task: "magnitude-comparison",
      inventory: EXPERIMENT_TARGET,
    });
    expect(after.retained.some((p) => p.dimension === "angle")).toBe(true);
    const beforeKeys = before.retained.map(programKey);
    const afterKeys = after.retained.map(programKey);
    for (const k of beforeKeys) expect(afterKeys).toContain(k);
    expect(afterKeys.length).toBeGreaterThan(beforeKeys.length);
  });

  it("the precommit records set deltas rather than directions", () => {
    expect(Object.keys(PRECOMMITTED).sort()).toEqual(["declared->unknown", "irrelevant-perturbation", "non-cyclic->cyclic", "ratio->ordinal"]);
    // The three relevant perturbations precommit BOTH a removal and a
    // preservation; the irrelevant one precommits equality, which is one fact.
    expect(PRECOMMITTED["ratio->ordinal"]).toMatchObject({ mustRemove: expect.any(String), mustPreserve: expect.any(String) });
    expect(PRECOMMITTED["declared->unknown"]).toMatchObject({ mustRemove: expect.any(String), mustPreserve: expect.any(String), mustCarry: expect.any(String) });
    expect(PRECOMMITTED["non-cyclic->cyclic"]).toMatchObject({ mustAdd: expect.any(String), mustNotRemove: expect.any(String) });
    expect(PRECOMMITTED["irrelevant-perturbation"]).toMatchObject({ mustEqual: expect.any(String) });
  });
});

describe("A3 — the observer reads the program, not its certificate", () => {
  it("the strong observer derives claims from the program's own choices", () => {
    const lawful = enumeration.retained.find((p) => p.measure === "length")!;
    expect(programObserver({ ...lawful, baseline: "zero" }, facts).ok).toBe(true);
    // The same program with a truncated baseline still DECLARES ratio
    // comparability, and no longer induces it.
    const mutated: Program = { ...lawful, baseline: "truncated", claims: ["ratio-comparability"] };
    expect(inducedClaims(mutated, facts)).toContain("difference-comparability");
    expect(inducedClaims(mutated, facts)).not.toContain("ratio-comparability");
    expect(programObserver(mutated, facts).ok).toBe(false);
  });

  it("the declaration-reading observer passes the mutation, which is the false pass", () => {
    const lawful = enumeration.retained.find((p) => p.measure === "length")!;
    const mutated: Program = { ...lawful, baseline: "truncated", claims: ["ratio-comparability"] };
    expect(declarationObserver(mutated).ok).toBe(true);
    expect(programObserver(mutated, facts).ok).toBe(false);
    expect(result.observer.declared).toBe(true);
    expect(result.observer.derived).toBe(false);
  });

  it("detects a channel swap that keeps the declared explanation", () => {
    const lawful = enumeration.retained.find((p) => p.measure === "length")!;
    const swapped: Program = { ...lawful, measure: "luminance", claims: ["ratio-comparability"] };
    expect(declarationObserver(swapped).ok).toBe(true);
    expect(programObserver(swapped, facts).ok).toBe(false);
  });
});

describe("the unlawful side: the same authority, a task the measure cannot serve", () => {
  it("refuses a composition that partitions over the dimension the measure is not additive along", () => {
    const probe = compositionProbe();
    expect(probe.causes).toContain("REL_ADDITIVITY_SUM_SEMIADDITIVE");
    expect(probe.refused).toBeGreaterThan(0);
  });

  it("admits no candidate for a task whose preconditions this experiment does not implement", () => {
    const notImplemented = (Object.entries(TASK_INVARIANTS) as Array<[string, unknown]>).filter(([, v]) => "notEnumerated" in (v as object));
    expect(notImplemented.length).toBe(8);
    for (const [task, v] of notImplemented) {
      const e = enumerate({ facts, task: task as never, inventory: EXPERIMENT_TARGET });
      expect(e.retained, `${task} must admit nothing while ${JSON.stringify((v as { notEnumerated: string }).notEnumerated)} is unimplemented`).toEqual([]);
    }
  });
});

describe("A4 — the retained ledger", () => {
  it("records the actual normalized candidate sets with their reasons, not counts", () => {
    const ledger = ledgerOf(result);
    expect(Array.isArray(ledger.retained)).toBe(true);
    expect((ledger.retained as unknown[]).length).toBe(enumeration.retained.length);
    expect((ledger.refused as unknown[]).length).toBe(enumeration.refused.length);
    expect(ledger.consumed).toMatchObject({ relation: "stock", task: "magnitude-comparison", target: "svg-dom" });
    expect(ledger.basis).toMatchObject({ fixture: BASIS_FIXTURE });
    expect((ledger.nonClaims as string[]).length).toBe(NON_CLAIMS.length);
    const controls = ledger.controls as Array<{ control: string; ok: boolean; actual: string }>;
    expect(controls.map((c) => c.control)).toEqual(["ratio->ordinal", "declared->unknown", "non-cyclic->cyclic", "targeted-narrowing", "irrelevant-perturbation"]);
    for (const c of controls) expect(c.ok, `${c.control}: ${c.actual}`).toBe(true);
    expect(ledger.observerControl).toMatchObject({ declared: true, derived: false });
    // Shared claims are the INTERSECTION over the retained set, and every loss
    // is a claim another lawful program of the SAME authority carries.
    expect(ledger.sharedClaims).toEqual(["partition-membership", "ratio-comparability"]);
    const perProgram = ledger.perProgramClaims as Array<{ program: string; induced: string[]; loss: string[] }>;
    expect(perProgram.length).toBe(enumeration.retained.length);
    expect(perProgram.every((c) => c.induced.includes("ratio-comparability"))).toBe(true);
    expect(perProgram.some((c) => c.loss.includes("value-recoverable"))).toBe(true);
    expect(perProgram.some((c) => c.loss.includes("aggregate-magnitude"))).toBe(true);
    expect(ledger.residue).toMatchObject({ projectionLevel: expect.any(String), realizationLevel: expect.any(String) });
  });

  it("matches a fresh computation, so a stale ledger is drift", () => {
    expect(fs.existsSync(LEDGER), `run: tsx packages/ds-codegen/src/analytical/projection.ts --record`).toBe(true);
    const committed = JSON.parse(fs.readFileSync(LEDGER, "utf-8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(ledgerOf(runExperiment()))));
  });
});
