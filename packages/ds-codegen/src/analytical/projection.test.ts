/**
 * The projection BINDING (REL-PROJECTION-BINDING-01).
 *
 * The predecessor experiment earned a repeatable, constraint-filtered topology
 * enumeration. It did not earn the stronger conclusion that every retained
 * program preserves the analytical claims attributed to it, because a `Program`
 * carried no analytical operation: the same topology can display a sum over one
 * dimension, a sum over another, or the raw observations. This file tests the
 * binding that closes that gap, the premise handling that was demonstrated to
 * take the favorable branch, and two consumers that recover the bound values
 * from the operation rather than from a claim label.
 *
 * THE NUMBERS BELOW ARE ARITHMETIC, NOT ENGINE OUTPUT. For the supplied
 * population, summing over `product` at each `date` gives 30 and 105; summing
 * over `date` for each `product` gives 110 and 25, the direction the
 * semi-additivity declaration forbids. Those four values are the discriminator.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { judge } from "./engines.js";
import { canonicalJudgment } from "./judgment.js";
import { loadOracle } from "./necessity.js";
import { extractDoctrineDiagnostics, extractDoctrineVocabulary } from "./corpus-integrity.js";
import {
  BASIS,
  BASIS_FIXTURE,
  CAPACITY,
  CONSUMER_POPULATION,
  EXPERIMENT_TARGET,
  FORM_ALIASES,
  LEDGER,
  NON_CLAIMS,
  PRECOMMITTED,
  TASK_INVARIANTS,
  basisFacts,
  bindOperation,
  bindingObserver,
  compositionKindProbe,
  compositionProbe,
  declarationObserver,
  enumerate,
  evaluateOperation,
  ledgerOf,
  matchesAdmitted,
  metricConsumer,
  programObserver,
  readbackConsumer,
  runExperiment,
} from "./projection.js";
import type { AggregateAssertionDecl, Program, Row } from "./projection.js";
import type { RelationalStructure } from "./relation-model.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DOCTRINE = path.resolve(HERE, "../../../../docs/architecture/analytical-relation-doctrine.md");
const DENYLIST = JSON.parse(
  fs.readFileSync(path.resolve(HERE, "../../../ds-contracts/analytical-pack/form-names.json"), "utf-8"),
) as { denylist: string[] };

const fixture = loadOracle().fixtures.get(BASIS_FIXTURE)!;
const structure = fixture.structure as RelationalStructure;
const aggregate = fixture.assertions.find((a) => a.kind === "aggregate")! as AggregateAssertionDecl;
const admitted = bindOperation(structure, aggregate);
const facts = basisFacts(structure, BASIS.relation, BASIS.dimension, BASIS.measure);
const enumeration = enumerate({
  facts,
  task: "magnitude-comparison",
  inventory: EXPERIMENT_TARGET,
  operation: admitted,
  partitionDimension: BASIS.partitionDimension,
});
const result = runExperiment();
const programKey = (p: Program) => `${p.coordinate}|${p.dimension}|${p.measure}`;
const allowedCauses = extractDoctrineDiagnostics(fs.readFileSync(DOCTRINE, "utf-8"));
const vocabulary = extractDoctrineVocabulary(fs.readFileSync(DOCTRINE, "utf-8"));
const readbackProgram = enumeration.retained.find((p) => CAPACITY[p.measure].valueReadback)!;
const metricProgram = enumeration.retained.find((p) => !CAPACITY[p.measure].valueReadback)!;

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

describe("A1 — every retained program displays the admitted operation", () => {
  it("binds the fixture's OWN assertion: sum of on_hand over product, grain [date]", () => {
    expect(admitted).toEqual({ relation: "stock", field: "on_hand", op: "sum", along: ["product"], resultGrain: ["date"] });
  });

  it("retains at least two structurally different programs, each carrying that binding", () => {
    expect(enumeration.retained.length).toBeGreaterThanOrEqual(2);
    expect(new Set(enumeration.retained.map(programKey)).size).toBeGreaterThanOrEqual(2);
    for (const p of enumeration.retained) {
      expect(matchesAdmitted(p.operation, admitted), `${programKey(p)} does not display the admitted operation`).toBe(true);
    }
  });

  it("does NOT retain a candidate whose binding does not RESOLVE against the structure", () => {
    // A binding naming a field the relation does not declare, and one summing
    // over a dimension the grain does not contain: neither has an established
    // result grain, so neither is admitted on a favorable branch.
    for (const bad of [{ ...admitted, field: "reserved" }, { ...admitted, along: ["warehouse"] }]) {
      const e = enumerate({ facts, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET, operation: bad });
      expect(e.retained, `${JSON.stringify(bad)} was retained`).toEqual([]);
      expect(e.undecided.length).toBeGreaterThan(0);
      expect(e.undecided.every((u) => u.obligation === "grain:declared")).toBe(true);
      // Nothing is silently dropped: every disposed candidate carries a reason.
      expect(e.refused.length + e.undecided.length).toBe(e.population.disposed);
      expect(e.undecided.every((u) => u.detail.length > 0)).toBe(true);
    }
  });

  it("carries an ABSENT binding as an obligation instead of taking the favorable branch", () => {
    const unbound = enumerate({ facts, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET, operation: undefined as never });
    expect(unbound.retained).toEqual([]);
    expect(unbound.undecided.length).toBeGreaterThan(0);
    expect(unbound.undecided.every((u) => u.obligation === "grain:declared")).toBe(true);
    expect(unbound.undecided.every((u) => u.detail.length > 0)).toBe(true);
  });

  it("names its POST-EXCLUSION population, so the closure claim is not about the whole product", () => {
    const { considered, excluded, disposed } = enumeration.population;
    expect(considered).toBe(168);
    expect(excluded).toBe(69);
    expect(disposed).toBe(considered - excluded);
    expect(enumeration.retained.length + enumeration.refused.length + enumeration.undecided.length).toBe(disposed);
  });

  it("keeps a form name out of the enumeration path", () => {
    const src = fs.readFileSync(path.resolve(HERE, "projection.ts"), "utf-8");
    const withoutAliases = src.slice(0, src.indexOf("export const FORM_ALIASES"));
    const withoutComments = withoutAliases.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
    const hits = DENYLIST.denylist.filter((name) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(withoutComments));
    expect(hits, `form names reached the module: ${hits.join(", ")}`).toEqual([]);
    expect(Object.keys(FORM_ALIASES).length).toBeGreaterThan(0);
  });

  it("emits only causes the doctrine's catalogue names", () => {
    const emitted = new Set([...enumeration.refused.map((r) => r.cause), ...result.refused.map((r) => r.cause)]);
    expect(emitted.size).toBeGreaterThan(0);
    for (const cause of emitted) expect(allowedCauses.has(cause), `${cause} is not a catalogue cause`).toBe(true);
  });
});

describe("A2 — a relevant premise is carried, and an established contradiction is refused", () => {
  it("does NOT resolve an omitted composition partition to the favorable completion", () => {
    const probe = compositionProbe();
    expect(probe.lawful.retained).toBeGreaterThan(0);
    expect(probe.omitted.retained).toBe(0);
    expect(probe.omitted.undecided).toBeGreaterThan(0);
    expect(probe.omitted.obligations).toEqual(["invariant:exhaustive"]);
    // The decisive comparison: the omitted input and the favorable completion
    // are DIFFERENT populations, which is exactly what the defect made identical.
    expect(probe.omitted.retained).not.toBe(probe.lawful.retained);
  });

  it("carries that obligation under a term the doctrine's vocabulary lists", () => {
    expect(vocabulary.namespaces.invariant).toBeDefined();
    expect(vocabulary.namespaces.invariant).toContain("exhaustive");
  });

  it("still refuses the declared illegal partition under the corpus's own cause", () => {
    const probe = compositionProbe();
    expect(probe.unlawful.retained).toBe(0);
    expect(probe.unlawful.causes).toContain("REL_ADDITIVITY_SUM_SEMIADDITIVE");
  });

  it("refuses a composition over a measure whose KIND contradicts it, not only a listed dimension", () => {
    // The demonstrated defect: `nonAdditiveAlong` is empty for `non-additive`,
    // so reading only that array left the kind unconstrained and retained 43.
    const probe = compositionKindProbe();
    expect(probe["non-additive"].retained).toBe(0);
    expect(probe["non-additive"].causes).toContain("REL_ADDITIVITY_SUM_SEMIADDITIVE");
    expect(probe["ratio-measure"].retained).toBe(0);
    expect(probe["ratio-measure"].causes).toContain("REL_RATIO_MEASURE_AVERAGED");
  });

  it("admits no candidate for a task whose preconditions this experiment does not implement", () => {
    const notImplemented = (Object.entries(TASK_INVARIANTS) as Array<[string, unknown]>).filter(([, v]) => "notEnumerated" in (v as object));
    expect(notImplemented.length).toBe(8);
    for (const [task, v] of notImplemented) {
      const e = enumerate({ facts, task: task as never, inventory: EXPERIMENT_TARGET, operation: admitted });
      expect(e.retained, `${task} must admit nothing while ${JSON.stringify((v as { notEnumerated: string }).notEnumerated)} is unimplemented`).toEqual([]);
    }
  });
});

describe("A3 — two structurally different consumers recover the same bound operation", () => {
  it("evaluates the bound operation independently of any classification function", () => {
    const bound = evaluateOperation(admitted, CONSUMER_POPULATION);
    expect(bound.grain).toEqual(["date"]);
    expect(bound.groups).toEqual([
      { key: "day1", value: 30 },
      { key: "day2", value: 105 },
    ]);
  });

  it("recovers those values through a readback program AND through a metric program", () => {
    expect(programKey(readbackProgram)).not.toBe(programKey(metricProgram));
    const a = readbackConsumer(readbackProgram, admitted, CONSUMER_POPULATION);
    const b = metricConsumer(metricProgram, admitted, CONSUMER_POPULATION);
    expect(a.channel).toBe("text");
    expect(b.channel).toBe("length");
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(a.recovered).toEqual([
      { key: "day1", value: 30 },
      { key: "day2", value: 105 },
    ]);
    expect(b.recovered).toEqual(a.recovered);
    expect(result.consumers.readback.recovered).toEqual(result.consumers.metric.recovered);
  });

  it("distinguishes them from the aggregation direction the declaration forbids", () => {
    const forbidden = evaluateOperation({ ...admitted, along: ["date"], resultGrain: ["product"] }, CONSUMER_POPULATION);
    expect(forbidden.groups).toEqual([
      { key: "A", value: 110 },
      { key: "B", value: 25 },
    ]);
    expect(forbidden.groups).not.toEqual(evaluateOperation(admitted, CONSUMER_POPULATION).groups);
    expect(readbackConsumer(readbackProgram, { ...admitted, along: ["date"], resultGrain: ["product"] }, CONSUMER_POPULATION).ok).toBe(false);
    expect(result.consumers.forbiddenDirection.readbackRejects).toBe(true);
  });

  it("will not let a consumer pass on a topology that cannot carry the value", () => {
    // Agreement between two spellings of one consumer is not the claim: each
    // declines the other's channel.
    expect(readbackConsumer(metricProgram, admitted, CONSUMER_POPULATION).reason).toBe("not-a-readback-channel");
    expect(metricConsumer(readbackProgram, admitted, CONSUMER_POPULATION).reason).toBe("not-a-metric-channel");
  });

  it("recovers the values from the operation, not from the claim classifier", () => {
    // `result`'s induced claims are identical for both programs at the level
    // that matters here; the recovered VALUES come from evaluateOperation. A
    // consumer passing on labels alone would not produce these numbers.
    const rows: readonly Row[] = CONSUMER_POPULATION;
    expect(evaluateOperation(admitted, rows).total).toBe(135);
    expect(evaluateOperation({ ...admitted, along: ["date"], resultGrain: ["product"] }, rows).total).toBe(135);
    // Same total, different partition: only the VALUES distinguish them.
    expect(result.consumers.readback.recovered).not.toEqual(result.consumers.forbiddenDirection.result.groups);
  });
});

describe("A4 — a changed analytical binding is detected without trusting the explanation", () => {
  it("rejects a mutated bound FIELD before consumption, and observes the value disagreement", () => {
    const mutated: Program = { ...readbackProgram, operation: { ...admitted, field: "reserved" }, claims: [...readbackProgram.claims] };
    const report = readbackConsumer(mutated, admitted, CONSUMER_POPULATION);
    expect(report.reason).toBe("binding-mismatch");
    expect(report.recovered).toEqual([
      { key: "day1", value: 3 },
      { key: "day2", value: 7 },
    ]);
    expect(report.recovered).not.toEqual(report.expected);
    expect(result.bindingMutation.rejectedBeforeConsumption).toBe(true);
    expect(result.bindingMutation.valueDisagreement).toBe(true);
  });

  it("rejects a mutated GROUPING even when the declared explanation is untouched", () => {
    const mutated: Program = { ...readbackProgram, operation: { ...admitted, along: ["date"], resultGrain: ["product"] }, claims: ["ratio-comparability"] };
    expect(declarationObserver(mutated).ok).toBe(true); // the certificate still says fine
    const observed = bindingObserver(mutated, admitted, CONSUMER_POPULATION);
    expect(observed.ok).toBe(false);
    expect(observed.reason).toBe("binding-mismatch");
  });

  it("rejects a mutated AGGREGATE, which the topology cannot tell apart", () => {
    const mutated: Program = { ...metricProgram, operation: { ...admitted, op: "mean" as never }, claims: ["ratio-comparability"] };
    expect(programObserver(mutated, facts).ok).toBe(true); // the old observer sees nothing wrong
    expect(bindingObserver(mutated, admitted, CONSUMER_POPULATION).ok).toBe(false);
  });

  it("accepts the unmutated pair through the same observer", () => {
    const observed = bindingObserver(readbackProgram, admitted, CONSUMER_POPULATION);
    expect(observed.ok).toBe(true);
    expect(observed.channel).toBe("text");
    expect(observed.recovered).toEqual(observed.expected);
    expect(bindingObserver(metricProgram, admitted, CONSUMER_POPULATION).channel).toBe("length");
  });
});

describe("A5 — the predecessor's all-pass interpretation is corrected in the record", () => {
  it("records the precommit's concrete readback prediction as REFUTED, not vacuous", () => {
    const account = ledgerOf(result).correctedAccount as Record<string, string>;
    expect(account.readbackPrediction).toMatch(/^REFUTED/);
    expect(account.readbackPrediction).toContain("none survived");
  });

  it("states the closure population, the loss-label meaning and the unmeasured residue", () => {
    const account = ledgerOf(result).correctedAccount as Record<string, string>;
    expect(account.closurePopulation).toContain("POST-EXCLUSION");
    expect(account.lossLabels).toContain("absent property NAME");
    expect(account.residue).toContain("UNMEASURED");
    expect((ledgerOf(result).population as { disposed: number }).disposed).toBe(99);
  });

  it("keeps the corrected account beside the non-claims that bound it", () => {
    expect(NON_CLAIMS.some((n) => n.includes("ALL-PASS INTERPRETATION IS CORRECTED"))).toBe(true);
    expect(NON_CLAIMS.some((n) => n.includes("REFUTED"))).toBe(true);
  });
});

describe("the inherited controls still hold, and the ledger still matches a fresh computation", () => {
  for (const control of result.controls) {
    it(control.control, () => {
      // The general requirement and the concrete prediction are different
      // claims, and the record keeps them apart.
      expect(control.requirementMet, `expected ${control.expected}; actual ${control.actual}`).toBe(true);
      expect(control.ok).toBe(control.requirementMet && !control.predictionRefuted);
    });
  }

  it("records the two refuted concrete predictions as refutations, with what they taught", () => {
    const refuted = result.controls.filter((c) => c.predictionRefuted);
    expect(refuted.map((c) => c.control).sort()).toEqual(["declared->unknown", "ratio->ordinal"]);
    for (const c of refuted) expect(c.correction ?? "", `${c.control} has no correction recorded`).toMatch(/REFUTED|wrong|not selective/);
  });

  it("keeps the grain refutation visible in the corrected account", () => {
    const account = ledgerOf(result).correctedAccount as Record<string, string>;
    expect(account.grainPrediction).toMatch(/REFUTED/);
    expect(account.grainPrediction).toContain("EVERY topology");
  });

  it("still records the four precommitted perturbations", () => {
    expect(Object.keys(PRECOMMITTED).sort()).toEqual(["declared->unknown", "irrelevant-perturbation", "non-cyclic->cyclic", "ratio->ordinal"]);
  });

  it("matches a fresh computation, so a stale ledger is drift", () => {
    expect(fs.existsSync(LEDGER), "run: tsx packages/ds-codegen/src/analytical/projection.ts --record").toBe(true);
    const committed = JSON.parse(fs.readFileSync(LEDGER, "utf-8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(ledgerOf(runExperiment()))));
  });
});
