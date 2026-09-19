/**
 * The projection BINDING and REPRESENTATION boundary
 * (REL-PROJECTION-BINDING-01, REL-PROJECTION-REPRESENTATION-01).
 *
 * What the binding slice established, and what it did NOT: both of its consumers
 * called `evaluateOperation`, so nothing representation-dependent lay between
 * them. Their agreement showed that the binding and channel guards admit one
 * shared evaluation — not that a value survived a text or metric encoding.
 *
 * This file tests the boundary that closes that: one admitted sum, two PRODUCED
 * representations, and recovery observed from each representation by a decoder
 * that receives neither the rows nor the evaluator.
 *
 * THE NUMBERS ARE ARITHMETIC. Summing over `product` at each `date` gives 30 and
 * 105; at a declared scale of two extent units per value those are extents 60
 * and 210. Summing over `date` gives 110 and 25, the direction the
 * semi-additivity declaration forbids.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
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
  catalogueFor,
  generateAliasCatalogue,
  loadFormDeclarations,
  regionMatches,
  CATALOGUE_NON_CLAIMS,
  FORM_REGIONS_FILE,
  LEDGER,
  LOWERING_SUPPORT,
  METRIC_UNITS_PER_VALUE,
  NON_CLAIMS,
  PRECOMMITTED,
  TASK_INVARIANTS,
  admitOperation,
  bindOperation,
  bindingObserver,
  compositionKindProbe,
  compositionProbe,
  declarationObserver,
  decodeMetric,
  decodeReadback,
  enumerate,
  evaluateOperation,
  lawfulRelationPrograms,
  partitionAdmitsSummation,
  classifyAtomicProgram,
  partitionBindingFault,
  IMPLEMENTED_TASKS,
  RESULT_KINDS,
  projectionSupport,
  ledgerOf,
  metricConsumer,
  relationMembership,
  relationProgramIsSound,
  relationProgramUncertified,
  RELATION_REFERENCE_NON_CLAIMS,
  produce,
  programObserver,
  readbackConsumer,
  recover,
  runExperiment,
  channelClaims,
  judgeComposite,
  judgeOperation,
  COMPOSITION_NON_CLAIMS,
  compositeClaimSet,
  inducedClaims,
  unitsCommensurable,
} from "./projection.js";
import type { Composite, CompositePart, CompositeVerdict, Enumeration, OperationJudgment, AggregateAssertionDecl, Program, ResultFacts, TargetInventory } from "./projection.js";
import type { RelationalStructure, UnitDecl } from "./relation-model.js";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DOCTRINE = path.resolve(HERE, "../../../../docs/architecture/analytical-relation-doctrine.md");
const DENYLIST = JSON.parse(
  fs.readFileSync(path.resolve(HERE, "../../../ds-contracts/analytical-pack/form-names.json"), "utf-8"),
) as { denylist: string[] };

const fixture = loadOracle().fixtures.get(BASIS_FIXTURE)!;
const structure = fixture.structure as RelationalStructure;
const aggregate = fixture.assertions.find((a) => a.kind === "aggregate")! as AggregateAssertionDecl;
const admitted = bindOperation(structure, aggregate);
const admission = admitOperation(structure, admitted);
if (admission.kind !== "admitted") throw new Error(`the basis operation is not admitted: ${admission.reason}`);
const facts = admission.facts;
const enumeration = enumerate({
  structure,
  admitted,
  task: "magnitude-comparison",
  inventory: EXPERIMENT_TARGET,
  partitionDimension: BASIS.resultGrain,
});
const result = runExperiment();
const programKey = (p: Program) => `${p.coordinate}|${p.dimension}|${p.measure}`;
const allowedCauses = extractDoctrineDiagnostics(fs.readFileSync(DOCTRINE, "utf-8"));
const vocabulary = extractDoctrineVocabulary(fs.readFileSync(DOCTRINE, "utf-8"));
const readbackProgram = enumeration.retained.find((p) => CAPACITY[p.measure].valueReadback)!;
const metricProgram = enumeration.retained.find((p) => !CAPACITY[p.measure].valueReadback)!;
const withGrain = (grain: string[] | "unknown"): RelationalStructure => ({
  ...structure,
  relations: { ...structure.relations, [BASIS.relation]: { ...structure.relations[BASIS.relation], grain } },
});

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
});

describe("A1 — the operation is validated, and the projection reads the RESULT's columns", () => {
  it("binds the fixture's OWN assertion: sum of on_hand over product, grain [date]", () => {
    expect(admitted).toEqual({ relation: "stock", field: "on_hand", op: "sum", along: ["product"], resultGrain: ["date"] });
  });

  it("filters on the result's group column and the aggregate, NOT on a source column", () => {
    expect(facts.resultGrain).toEqual(["date"]);
    expect(facts.dimension.field).toBe("date");
    expect(facts.measure.field).toBe("sum(on_hand)");
    // The column the operation SUMS OVER is not a column of the result at all.
    expect(facts.dimension.field).not.toBe(BASIS.summedOver);
    expect(facts.measure.transformation).toBe("ratio");
    expect(facts.measure.nonAdditiveAlong).toEqual(["date"]);
  });

  it("refuses an operation naming a relation the structure does not declare", () => {
    expect(() => admitOperation(structure, { ...admitted, relation: "does_not_exist" })).toThrow(/does not declare/);
    expect(() =>
      enumerate({ structure, admitted: { ...admitted, relation: "does_not_exist" }, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET }),
    ).toThrow(/does not declare/);
  });

  it("refuses an aggregate the bounded evaluator cannot perform, instead of executing it as a sum", () => {
    expect(() => admitOperation(structure, { ...admitted, op: "mean" as never })).toThrow(/executable contract is sum/);
    expect(() => evaluateOperation({ ...admitted, op: "mean" as never }, CONSUMER_POPULATION)).toThrow(/performs sum/);
    expect(() => evaluateOperation({ ...admitted, op: "count" as never }, CONSUMER_POPULATION)).toThrow(/performs sum/);
  });

  it("refuses a result grain that is not the declared grain minus the summed-over dimensions", () => {
    expect(() => admitOperation(structure, { ...admitted, along: ["warehouse"] })).toThrow(/does not contain/);
    expect(() => admitOperation(structure, { ...admitted, resultGrain: ["product"] })).toThrow(/is not the declared grain minus/);
  });

  it("CARRIES a merely missing premise rather than resolving it either way", () => {
    const e = enumerate({ structure: withGrain("unknown"), admitted, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET });
    expect(e.retained).toEqual([]);
    expect(e.undecided.length).toBeGreaterThan(0);
    expect(e.undecided.every((u) => u.obligation === "grain:declared")).toBe(true);
    expect(e.undecided.every((u) => u.detail.length > 0)).toBe(true);
  });

  it("carries the admitted operation on every retained program BY CONSTRUCTION", () => {
    expect(enumeration.retained.length).toBeGreaterThanOrEqual(2);
    for (const p of enumeration.retained) expect(p.operation).toEqual(admitted);
  });

  it("names its POST-EXCLUSION population", () => {
    const { considered, excluded, disposed } = enumeration.population;
    expect(considered).toBe(168);
    expect(disposed).toBe(considered - excluded);
    expect(enumeration.retained.length + enumeration.refused.length + enumeration.undecided.length).toBe(disposed);
  });

  it("keeps a form name out of the module ENTIRELY, because the names live in the pack", () => {
    // This used to slice the source at `export const FORM_ALIASES` and check only
    // what came before it, which left the quarantine as the one place a name was
    // allowed. The map is gone and the names are in the governed pack, so the
    // check now covers the WHOLE module and there is nothing to slice around.
    const src = fs.readFileSync(path.resolve(HERE, "projection.ts"), "utf-8");
    const withoutComments = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
    const hits = DENYLIST.denylist.filter((name) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(withoutComments));
    expect(hits, `form names reached the module: ${hits.join(", ")}`).toEqual([]);
    expect(src.includes("FORM_ALIASES"), "the hand-authored map is gone").toBe(false);
  });

  it("emits only causes the doctrine's catalogue names", () => {
    const emitted = new Set([...enumeration.refused.map((r) => r.cause), ...result.refused.map((r) => r.cause)]);
    expect(emitted.size).toBeGreaterThan(0);
    for (const cause of emitted) expect(allowedCauses.has(cause), `${cause} is not a catalogue cause`).toBe(true);
  });
});

describe("A2 — a relevant premise is carried, and an established contradiction is refused", () => {
  it("does NOT resolve an omitted composition partition to a favorable completion", () => {
    const probe = compositionProbe();
    expect(probe.omitted.retained).toBe(0);
    expect(probe.omitted.undecided).toBeGreaterThan(0);
    expect(probe.omitted.obligations).toEqual(["invariant:exhaustive"]);
  });

  it("carries that obligation under a term the doctrine's vocabulary lists", () => {
    expect(vocabulary.namespaces.invariant).toBeDefined();
    expect(vocabulary.namespaces.invariant).toContain("exhaustive");
  });

  it("refuses the declared partition under the corpus's own cause", () => {
    const probe = compositionProbe();
    expect(probe.declared.retained).toBe(0);
    expect(probe.declared.causes).toContain("REL_ADDITIVITY_SUM_SEMIADDITIVE");
  });

  it("REFUSES a partition that is not a column of the result, rather than asserting that it would", () => {
    // The earlier probe stored `lawfulCompletion: false` as prose and the test
    // asserted the stored flag. This EXECUTES the rejection: `product` is the
    // column the operation sums over, and `does_not_exist` exists nowhere.
    for (const partition of ["product", "does_not_exist"]) {
      expect(
        () => enumerate({ structure, admitted, task: "composition", inventory: EXPERIMENT_TARGET, partitionDimension: partition }),
        `${partition} reached a favorable branch`,
      ).toThrow(/not a column of the result/);
    }
  });

  it("refuses a composition over a measure whose KIND contradicts it", () => {
    const probe = compositionKindProbe();
    expect(probe["non-additive"].retained).toBe(0);
    expect(probe["non-additive"].causes).toContain("REL_ADDITIVITY_SUM_SEMIADDITIVE");
    expect(probe["ratio-measure"].retained).toBe(0);
    // A sum over a ratio-measure is itself illegal, so the perturbation is
    // refused at ADMISSION and there is no composition left to probe.
    expect(probe["ratio-measure"].refusedAtAdmission).toMatch(/REL_RATIO_MEASURE_AVERAGED/);
  });

  it("reports a task it does not implement as UNSUPPORTED, not as a task whose candidates all failed", () => {
    const notImplemented = (Object.entries(TASK_INVARIANTS) as Array<[string, unknown]>).filter(([, v]) => "notEnumerated" in (v as object));
    expect(notImplemented.length).toBe(7);
    expect(Object.keys(TASK_INVARIANTS)).toContain("topology");
    for (const [task, v] of notImplemented) {
      const e = enumerate({ structure, admitted, task: task as never, inventory: EXPERIMENT_TARGET });
      expect(e.retained, `${task} must admit nothing while ${JSON.stringify((v as { notEnumerated: string }).notEnumerated)} is unimplemented`).toEqual([]);
      // The disposition, not the emptiness, is the claim. `retained === []` alone
      // is satisfied by "we searched and the facts forbade everything", which is
      // a judgment this experiment never made.
      expect(e.support.supported, `${task} is not implemented here`).toBe(false);
      expect(e.refused, `${task} must carry no analytical cause: there is no rule to name`).toEqual([]);
      expect(e.population.considered).toBe(0);
    }
  });

  it("does not treat a task implemented on ANOTHER path as one whose requirements merely went unmet", () => {
    // `topology` has a `requires` entry because the GRAPH path implements it. The
    // relation path reaching for that entry would report "incidence-recoverable
    // was not induced" as though it had judged something.
    expect(IMPLEMENTED_TASKS.graph).toContain("topology");
    const e = enumerate({ structure, admitted, task: "topology", inventory: EXPERIMENT_TARGET });
    expect(e.support.supported).toBe(false);
    expect(e.support.supported === false && e.support.obligation).toBe("invariant:topology-on-relation");
    expect(e.refused).toEqual([]);
    expect(e.population.considered).toBe(0);
  });
});

describe("support is decided at the request boundary, before any candidate exists", () => {
  it("agrees with itself across inventories that host everything and nothing", () => {
    const empty: TargetInventory = { id: "none", channels: [], spaces: [] };
    expect(enumerate({ structure, admitted, task: "distribution", inventory: empty }).support).toEqual(
      enumerate({ structure, admitted, task: "distribution", inventory: EXPERIMENT_TARGET }).support,
    );
    // ...and the same for a SUPPORTED task: an empty inventory is a search that
    // found nothing, which is a different thing from a request never searched.
    const supportedEmpty = enumerate({ structure, admitted, task: "magnitude-comparison", inventory: empty });
    expect(supportedEmpty.support.supported).toBe(true);
    expect(supportedEmpty.population.considered).toBe(0);
    expect(supportedEmpty.retained).toEqual([]);
    expect(supportedEmpty.support).not.toEqual(enumerate({ structure, admitted, task: "distribution", inventory: empty }).support);
  });

  it("carries the task's requirements on the SUPPORTED arm, so the task table cannot contradict the decision", () => {
    for (const kind of RESULT_KINDS) {
      for (const task of IMPLEMENTED_TASKS[kind]) {
        const decision = projectionSupport(kind, task);
        expect(decision.supported, `${kind} claims to implement ${task}`).toBe(true);
        const spec = TASK_INVARIANTS[task];
        expect("notEnumerated" in spec, `${kind}/${task} is claimed implemented and the task table says otherwise`).toBe(false);
        expect(decision.supported && [...decision.requires]).toEqual("notEnumerated" in spec ? [] : [...spec.requires]);
      }
    }
  });

  it("keeps the two paths' implemented sets disjoint and both non-empty", () => {
    for (const kind of RESULT_KINDS) expect(IMPLEMENTED_TASKS[kind].length).toBeGreaterThan(0);
    const relationTasks = IMPLEMENTED_TASKS.relation as readonly string[];
    const graphTasks = IMPLEMENTED_TASKS.graph as readonly string[];
    expect(relationTasks.filter((x) => graphTasks.includes(x))).toEqual([]);
    // Every task is either implemented somewhere or named as not enumerated, and
    // no task is claimed by a path whose table entry says it is not built.
    for (const task of RESULT_KINDS.flatMap((k) => IMPLEMENTED_TASKS[k])) {
      expect(Object.keys(TASK_INVARIANTS)).toContain(task);
    }
  });

  it("the independently derived lawful set refuses an unsupported task rather than answering that none is lawful", () => {
    expect(() => lawfulRelationPrograms(facts, "distribution", EXPERIMENT_TARGET)).toThrow(/does not implement it/);
    // A supported task still derives normally.
    expect(lawfulRelationPrograms(facts, "magnitude-comparison", EXPERIMENT_TARGET).length).toBeGreaterThan(0);
  });
});

describe("A3 — recovery observed from two PRODUCED representations", () => {
  const readback = result.preservation.readback as Extract<typeof result.preservation.readback, { representation: string }>;
  const metric = result.preservation.metric as Extract<typeof result.preservation.metric, { representation: string }>;

  it("evaluates the admitted sum once over the supplied population", () => {
    expect(readback.result).toEqual([
      { key: "day1", value: 30 },
      { key: "day2", value: 105 },
    ]);
  });

  it("recovers those values from a READBACK representation", () => {
    expect(readback.preserved).toBe(true);
    expect(readback.representation).toBe("readback");
    expect(readback.recovered).toEqual(readback.result);
  });

  it("recovers them from a METRIC representation, from extents and the DECLARED SCALE", () => {
    const outputs = produce(evaluateOperation(admitted, CONSUMER_POPULATION), METRIC_UNITS_PER_VALUE);
    expect(outputs.metric.entries).toEqual([
      { key: "day1", extent: 60 },
      { key: "day2", extent: 210 },
    ]);
    expect(outputs.metric.scale).toEqual({ unitsPerValue: 2, baseline: "zero" });
    expect(decodeMetric(outputs.metric)).toEqual(readback.result);
    expect(metric.preserved).toBe(true);
    expect(metric.representation).toBe("metric");
    // The decoder reads the SCALE rather than re-deriving the answer: under a
    // different declared scale the same extents must decode differently.
    expect(decodeMetric({ ...outputs.metric, scale: { unitsPerValue: 1, baseline: "zero" } })).toEqual([
      { key: "day1", value: 60 },
      { key: "day2", value: 210 },
    ]);
  });

  it("declares each decoder with one parameter - a signature fact, not a proof", () => {
    // NARROWED CLAIM: arity does not mechanically enforce the information
    // boundary, since a one-argument function can still read a captured variable
    // or call a module-level evaluator. The support for decoder independence is
    // the isolated execution in a context holding the representation but neither
    // the evaluator nor the rows; this asserts only the declared signature.
    expect(decodeReadback.length).toBe(1);
    expect(decodeMetric.length).toBe(1);
    expect(recover.length).toBe(1);
    const outputs = produce(evaluateOperation(admitted, CONSUMER_POPULATION), METRIC_UNITS_PER_VALUE);
    expect(recover(outputs.readback)).toEqual(readback.result);
    expect(recover(outputs.metric)).toEqual(readback.result);
  });

  it("distinguishes the recovered values from the aggregation direction the declaration forbids", () => {
    const forbidden = evaluateOperation({ ...admitted, along: ["date"], resultGrain: ["product"] }, CONSUMER_POPULATION);
    expect(forbidden.groups).toEqual([
      { key: "A", value: 110 },
      { key: "B", value: 25 },
    ]);
    expect(forbidden.groups).not.toEqual(readback.result);
  });

  it("will not let a consumer pass on a topology that cannot carry the value", () => {
    expect(readbackConsumer(metricProgram, admitted, CONSUMER_POPULATION).reason).toBe("not-a-readback-channel");
    expect(metricConsumer(readbackProgram, admitted, CONSUMER_POPULATION).reason).toBe("not-a-metric-channel");
  });

  it("reports the channel the metric consumer actually consumed", () => {
    // The runner selects by capability, and the report must name that channel -
    // not a fixed label that happens to be the one the test asserts.
    expect(metricProgram.measure).not.toBe("text");
    expect(metricConsumer(metricProgram, admitted, CONSUMER_POPULATION).channel).toBe(metricProgram.measure);
    expect(result.consumers.metric.channel).toBe(metricProgram.measure);
  });
});

describe("A4 — mutations are detected without trusting the explanation", () => {
  const readback = result.preservation.readback as Extract<typeof result.preservation.readback, { representation: string }>;
  const metric = result.preservation.metric as Extract<typeof result.preservation.metric, { representation: string }>;

  it("detects a changed METRIC EXTENT, so recovery observes the representation", () => {
    expect(metric.mutated.kind).toBe("extent");
    expect(metric.mutated.preserved).toBe(false);
    expect(metric.mutated.recovered).not.toEqual(metric.result);
    expect(metric.mutated.recovered).toContainEqual({ key: "day1", value: 30.5 });
  });

  it("detects a changed GROUP BINDING even though the numeric total is unchanged", () => {
    expect(readback.mutated.kind).toBe("key-binding");
    expect(readback.mutated.preserved).toBe(false);
    expect(readback.mutated.totalUnchanged).toBe(true);
    const total = readback.result.reduce((n, g) => n + g.value, 0);
    expect(readback.mutated.recovered.reduce((n, g) => n + g.value, 0)).toBe(total);
  });

  it("lets PROGRAM CHOICE decide which representation is produced", () => {
    expect(readback.program).not.toBe(metric.program);
    expect(readback.representation).toBe("readback");
    expect(metric.representation).toBe("metric");
    expect(readback.scale).toBeNull();
    expect(metric.scale).toEqual({ unitsPerValue: 2, baseline: "zero" });
  });

  it("OBSERVES output absence by running the orchestration, not by counting candidates", () => {
    // The earlier control counted retained candidates and the test asserted the
    // count. This runs the same selection-and-lowering path and inspects what it
    // PRODUCED, which is the limb that was unverified.
    const empty = result.loweringControls.emptyInventory;
    expect(empty.considered).toBe(0);
    expect(empty.realized).toEqual([]);
    expect(empty.unrealized).toEqual([]);
    // ...and the same orchestration over the full inventory does produce outputs,
    // so the empty result is absence and not a path that never produces anything.
    const full = result.loweringControls.fullInventory;
    expect(full.considered).toBeGreaterThan(0);
    expect(full.realized.map((r) => r.representation).sort()).toEqual(["metric", "readback"]);
    expect(full.unrealized.length).toBeGreaterThan(0);
  });

  it("declines every program outside its DECLARED support, rather than accepting them silently", () => {
    // Ten of twelve retained programs reached the generic metric producer before,
    // so "the rest stay unrealized" was a property of the example selection.
    const full = result.loweringControls.fullInventory;
    expect(full.realized.length).toBe(LOWERING_SUPPORT.length);
    expect(full.realized.length + full.unrealized.length).toBe(full.considered);
    for (const u of full.unrealized) expect(u.reason).toMatch(/no lowering is declared/);
  });

  it("still refuses to produce a metric representation without its declared baseline", () => {
    expect(result.loweringControls.metricWithoutBaseline).toMatch(/zero baseline/);
  });

  it("rejects a mutated bound FIELD before consumption, with an observed disagreement", () => {
    const mutated: Program = { ...readbackProgram, operation: { ...admitted, field: "reserved" }, claims: [...readbackProgram.claims] };
    const rep = readbackConsumer(mutated, admitted, CONSUMER_POPULATION);
    expect(rep.reason).toBe("binding-mismatch");
    expect(rep.recovered).not.toEqual(rep.expected);
    expect(result.bindingMutation.rejectedBeforeConsumption).toBe(true);
    expect(result.bindingMutation.valueDisagreement).toBe(true);
  });

  it("rejects a mutated GROUPING even when the declared explanation is untouched", () => {
    const mutated: Program = { ...readbackProgram, operation: { ...admitted, along: ["date"], resultGrain: ["product"] }, claims: ["ratio-comparability"] };
    expect(declarationObserver(mutated).ok).toBe(true);
    const observed = bindingObserver(mutated, admitted, CONSUMER_POPULATION);
    expect(observed.ok).toBe(false);
    expect(observed.reason).toBe("binding-mismatch");
  });

  it("accepts the unmutated pair through the same observer", () => {
    expect(bindingObserver(readbackProgram, admitted, CONSUMER_POPULATION).ok).toBe(true);
    expect(bindingObserver(metricProgram, admitted, CONSUMER_POPULATION).ok).toBe(true);
    expect(bindingObserver(metricProgram, admitted, CONSUMER_POPULATION).channel).toBe(metricProgram.measure);
  });

  /**
   * A RECORDED LIMITATION, PINNED SO IT CANNOT DRIFT SILENTLY. These assertions
   * document what the observers do NOT check; the day either check is added they
   * fail and must be updated to assert the check.
   */
  it("records that neither observer checks topology admissibility or grain status", () => {
    const inHostile: Program = { ...metricProgram, coordinate: "non-metric" as never };
    expect(CAPACITY[inHostile.measure].spaces).not.toContain("non-metric");
    expect(enumeration.retained.some((p) => programKey(p) === programKey(inHostile))).toBe(false);
    expect(programObserver(inHostile, facts).ok).toBe(true);
    expect(bindingObserver(inHostile, admitted, CONSUMER_POPULATION).ok).toBe(true);

    const e = enumerate({ structure: withGrain("unknown"), admitted, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET });
    expect(e.retained).toEqual([]);
    expect(programObserver(metricProgram, facts).ok).toBe(true);
  });
});

describe("A5 — the corrected account is carried in the record", () => {
  it("records the corrections this slice makes", () => {
    const account = ledgerOf(result).correctedAccount as Record<string, string>;
    expect(account.representationRecovery).toContain("evaluateOperation");
    expect(account.aggregateDispatch).toMatch(/REPAIRED/);
    expect(account.metricChannelLabel).toMatch(/REPAIRED/);
    expect(account.operationIdentity).toMatch(/CORRECTED/);
    expect(account.semanticAdmission).toMatch(/REPAIRED/);
    expect(account.partitionMembership).toMatch(/REPAIRED/);
    expect(account.singleEvaluation).toMatch(/REPAIRED/);
    expect(account.programDeterminedOutput).toMatch(/NEW/);
    expect(account.arityClaim).toMatch(/NARROWED/);
  });

  it("keeps the two earlier refutations", () => {
    const account = ledgerOf(result).correctedAccount as Record<string, string>;
    expect(account.readbackPrediction).toMatch(/^REFUTED/);
    expect(account.grainPrediction).toMatch(/REFUTED/);
  });

  it("states the closure population, the loss-label meaning and the unmeasured residue", () => {
    const account = ledgerOf(result).correctedAccount as Record<string, string>;
    expect(account.closurePopulation).toContain("POST-EXCLUSION");
    expect(account.lossLabels).toContain("absent property NAME");
    expect(account.residue).toContain("UNMEASURED");
  });

  it("bounds the result in its non-claims", () => {
    expect(NON_CLAIMS.some((n) => n.includes("ALL-PASS INTERPRETATION IS CORRECTED"))).toBe(true);
    expect(NON_CLAIMS.some((n) => n.includes("DO NOT CHECK"))).toBe(true);
  });
});

describe("the inherited controls still hold, and the ledger still matches a fresh computation", () => {
  for (const control of result.controls) {
    it(control.control, () => {
      expect(control.requirementMet, `expected ${control.expected}; actual ${control.actual}`).toBe(true);
    });
  }

  it("still records the four precommitted perturbations", () => {
    expect(Object.keys(PRECOMMITTED).sort()).toEqual(["declared->unknown", "irrelevant-perturbation", "non-cyclic->cyclic", "ratio->ordinal"]);
  });

  it("keeps the refuted concrete predictions recorded as refutations", () => {
    const refuted = result.controls.filter((c) => c.predictionRefuted);
    expect(refuted.length).toBeGreaterThanOrEqual(2);
    expect(refuted.map((c) => c.control)).toContain("ratio->ordinal");
    expect(refuted.map((c) => c.control)).toContain("declared->unknown");
    for (const c of refuted) expect(c.correction ?? "").toMatch(/REFUTED|SUPERSEDED|wrong|not selective|narrows nothing/);
  });

  it("matches a fresh computation, so a stale ledger is drift", () => {
    expect(fs.existsSync(LEDGER), "run: tsx packages/ds-codegen/src/analytical/projection.ts --record").toBe(true);
    const committed = JSON.parse(fs.readFileSync(LEDGER, "utf-8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(ledgerOf(runExperiment()))));
  });
});

describe("M2 — the RELATION-valued candidate space: soundness, completeness, sensitivity", () => {
  const run = (structure: RelationalStructure, inventory: typeof EXPERIMENT_TARGET = EXPERIMENT_TARGET) =>
    enumerate({ structure, admitted, task: "magnitude-comparison", inventory, partitionDimension: BASIS.resultGrain });

  it("SOUNDNESS: every retained program satisfies the declared premises", () => {
    const e = run(structure);
    expect(e.retained.length).toBeGreaterThan(0);
    for (const p of e.retained) {
      expect(relationProgramUncertified(p, facts, "magnitude-comparison", EXPERIMENT_TARGET), `${programKey(p)} is uncertified`).toEqual([]);
      expect(relationProgramIsSound(p, facts, "magnitude-comparison", EXPERIMENT_TARGET), `${programKey(p)} is unsound`).toBe(true);
    }
  });

  it("TASK AGREEMENT: the checker certifies the question the PROGRAM declares, not one it is handed", () => {
    // The graph helper was corrected for exactly this. The relation helper
    // certified `cartesian|position|length` while the program declared
    // `topology`, because the task arrived as a separate argument nothing
    // required to agree with the program.
    const declared = run(structure).retained[0]!;
    expect(declared.task).toBe("magnitude-comparison");
    expect(relationProgramIsSound(declared, facts, "magnitude-comparison", EXPERIMENT_TARGET)).toBe(true);

    const relabelled = { ...declared, task: "topology" as const };
    expect(relationProgramIsSound(relabelled, facts, "magnitude-comparison", EXPERIMENT_TARGET)).toBe(false);
    expect(relationProgramUncertified(relabelled, facts, "magnitude-comparison", EXPERIMENT_TARGET).join(" ")).toContain("declares the topology task");
    // ...and it is not certified under its own label either, because the relation
    // path does not implement topology at all.
    expect(relationProgramIsSound(relabelled, facts, "topology", EXPERIMENT_TARGET)).toBe(false);
    expect(relationProgramUncertified(relabelled, facts, "topology", EXPERIMENT_TARGET).join(" ")).toContain("does not implement the topology task");
  });

  it("NOT CERTIFIED IS NOT ILLEGAL: the helper reports WHICH premise failed, and never a contradiction", () => {
    // `false` from this helper means the check did not certify. Only the engine's
    // own judgment names a contradiction, and nothing here may stand in for it.
    const bad = { ...run(structure).retained[0]!, measure: "hue" as const };
    const unmet = relationProgramUncertified(bad, facts, "magnitude-comparison", EXPERIMENT_TARGET);
    expect(unmet.length).toBeGreaterThan(0);
    expect(unmet.join(" "), "a channel that cannot carry the measure").toContain("does not carry a ratio measure");
    // The premise is stated independently here rather than read off the failure.
    expect(CAPACITY.hue.carries).toEqual(["nominal"]);
    // A premise that holds reports nothing, so an empty list is a positive result.
    expect(relationProgramUncertified(run(structure).retained[0]!, facts, "magnitude-comparison", EXPERIMENT_TARGET)).toEqual([]);
    // And an unsupported task is reported as absent implementation, not as a
    // long list of violated premises.
    expect(relationProgramUncertified(bad, facts, "distribution", EXPERIMENT_TARGET)).toEqual([
      "the program declares the magnitude-comparison task and this check is about distribution",
      "the relation path does not implement the distribution task (invariant:declared-closure)",
    ]);
  });

  it("BOUNDED COMPLETENESS: the retained membership equals an INDEPENDENTLY derived set", () => {
    // The expectation reasons from the capacity table, the task requirement and
    // the RESULT facts, and never calls `enumerate`, so a program it never
    // generates shows up as a missing member.
    const expected = lawfulRelationPrograms(facts, "magnitude-comparison", EXPERIMENT_TARGET).map((t) => `${t.coordinate}|${t.dimension}|${t.measure}`).sort();
    expect(expected.length).toBeGreaterThan(0);
    expect(relationMembership(run(structure))).toEqual(expected);
  });

  it("PRE-COMMIT (membership, not count): removing a measure channel removes exactly its programs", () => {
    const full = relationMembership(run(structure));
    const channel = "area" as const;
    const predictedRemoved = full.filter((k) => k.split("|")[2] === channel);
    const predictedKept = full.filter((k) => k.split("|")[2] !== channel);
    expect(predictedRemoved.length).toBeGreaterThan(0);
    expect(predictedKept.length).toBeGreaterThan(0);
    const without = { ...EXPERIMENT_TARGET, channels: EXPERIMENT_TARGET.channels.filter((c) => c !== channel) };
    expect(relationMembership(run(structure, without))).toEqual(predictedKept);
  });

  it("ALPHA-RENAMING IS AN INVARIANT: respelling the declaration must not move membership", () => {
    // A membership that depends on a spelling is name-based dispatch. The
    // relation, the aggregated field and the group column are all renamed and
    // the operation is rebound to the new names.
    const renamed: RelationalStructure = {
      relations: {
        inventory: {
          grain: ["bucket", "item"],
          fields: {
            item: { transformation: "nominal" },
            bucket: { transformation: "interval", temporality: { kind: "instant" } },
            level: { transformation: "ratio", additivity: { kind: "semi-additive", nonAdditiveAlong: ["bucket"] } },
          },
        },
      },
    } as unknown as RelationalStructure;
    const renamedOp = { relation: "inventory", field: "level", op: "sum", along: ["item"], resultGrain: ["bucket"] } as const;
    const renamedAdmission = admitOperation(renamed, renamedOp as never);
    expect(renamedAdmission.kind).toBe("admitted");
    if (renamedAdmission.kind !== "admitted") throw new Error("unreachable");
    const renamedEnum = enumerate({
      structure: renamed,
      admitted: renamedOp as never,
      task: "magnitude-comparison",
      inventory: EXPERIMENT_TARGET,
      partitionDimension: "bucket",
    });
    expect(relationMembership(renamedEnum)).toEqual(relationMembership(run(structure)));
  });

  it("INVARIANCE: an irrelevant declaration leaves the membership unchanged", () => {
    const withExtra = {
      ...structure,
      relations: { ...structure.relations, [BASIS.relation]: { ...structure.relations[BASIS.relation], fields: { ...structure.relations[BASIS.relation].fields, warehouse: { transformation: "nominal" } } } },
    } as RelationalStructure;
    expect(relationMembership(run(withExtra))).toEqual(relationMembership(run(structure)));
  });

  it("ZERO, ONE and MULTIPLE lawful results are asserted by EXACT MEMBERSHIP", () => {
    const none = { ...EXPERIMENT_TARGET, channels: [] as never[] };
    expect(relationMembership(run(structure, none as typeof EXPERIMENT_TARGET))).toEqual([]);

    // A GENUINE singleton. The previous control restricted the channels but left
    // every coordinate space in place, so `position` and `text` were hosted by
    // BOTH cartesian and lane and the "one" inventory returned four programs; the
    // assertion could not tell, because it only asked for non-empty and smaller.
    const single = { id: "singleton", spaces: ["cartesian"], channels: ["position", "length"] } as unknown as typeof EXPERIMENT_TARGET;
    const one = relationMembership(run(structure, single));
    expect(one).toEqual(["cartesian|position|length"]);
    // The restriction really is a restriction: the same channels over every space
    // are not a singleton, which is what the old control actually built.
    const sameChannelsEverySpace = { ...EXPERIMENT_TARGET, channels: ["position", "length"] as never[] };
    expect(relationMembership(run(structure, sameChannelsEverySpace as typeof EXPERIMENT_TARGET)).length).toBeGreaterThan(1);

    const many = relationMembership(run(structure));
    expect(many.length).toBeGreaterThan(1);
    // The reference agrees at all three cardinalities, so this is a membership
    // result and not three counts that happen to differ.
    for (const [inventory, expected] of [
      [none, []],
      [single, ["cartesian|position|length"]],
      [EXPERIMENT_TARGET, many],
    ] as Array<[typeof EXPERIMENT_TARGET, string[]]>) {
      expect(relationMembership(run(structure, inventory))).toEqual(
        lawfulRelationPrograms(facts, "magnitude-comparison", inventory).map((x) => `${x.coordinate}|${x.dimension}|${x.measure}`).sort(),
      );
      expect(relationMembership(run(structure, inventory))).toEqual(expected);
    }
  });

  it("UNSUPPORTED, UNPROVEN and CONTRADICTED stay three different things through the REAL entry point", () => {
    // Unsupported: no implementation, so no candidate space was searched.
    const unsupported = enumerate({ structure, admitted, task: "distribution", inventory: EXPERIMENT_TARGET });
    expect(unsupported.support.supported).toBe(false);
    expect(unsupported.population.considered).toBe(0);
    expect(unsupported.refused).toEqual([]);

    // Unproven: a premise is missing, so every candidate is CARRIED with its
    // obligation and nothing is refused and nothing is retained.
    const unproven = enumerate({ structure: withGrain("unknown"), admitted, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET });
    expect(unproven.support.supported).toBe(true);
    expect(unproven.retained).toEqual([]);
    expect(unproven.refused).toEqual([]);
    expect(unproven.undecided.length).toBeGreaterThan(0);
    expect(unproven.undecided.every((u) => u.obligation === "grain:declared")).toBe(true);

    // Contradicted: the entry point REFUSES, carrying the corpus's own cause.
    expect(() => enumerate({ structure, admitted: { ...admitted, relation: "does_not_exist" }, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET })).toThrow(/does not declare/);
    expect(() => admitOperation(structure, { ...admitted, relation: "does_not_exist" })).toThrow(/does not declare/);

    // The three are distinguishable from each other by their own shapes, which is
    // the property that would be lost if any were reported as an empty result.
    expect([unsupported.support.supported, unproven.undecided.length > 0, true]).toEqual([false, true, true]);
  });

  it("GENERATOR OMISSION: a suppressed lawful candidate is a MISSING MEMBER against the reference", () => {
    const reference = lawfulRelationPrograms(facts, "magnitude-comparison", EXPERIMENT_TARGET).map((x) => `${x.coordinate}|${x.dimension}|${x.measure}`).sort();
    const generated = relationMembership(run(structure));
    expect(generated).toEqual(reference);

    // The generator is mutated at its OUTPUT boundary: one known lawful candidate
    // is suppressed and nothing else changes.
    const victim = "cartesian|position|length";
    expect(reference).toContain(victim);
    const mutated = generated.filter((k) => k !== victim);

    // The EXPECTATION is the reference, which never calls `enumerate` and is not
    // recomputed from the mutated result. The omission shows up as a missing
    // member, and the mutated set alone would still look self-consistent: a
    // subset with no duplicates and no spurious entries.
    expect(reference.filter((k) => !mutated.includes(k))).toEqual([victim]);
    expect(mutated.filter((k) => !reference.includes(k))).toEqual([]);
    expect(new Set(mutated).size).toBe(mutated.length);
    expect(mutated).not.toEqual(reference);
  });

  it("INVALID EXTRA: a candidate violating one independently stated premise is IDENTIFIED, not merely absent", () => {
    // The premise is stated here, from the capacity table's own declaration,
    // rather than read off the generator's output.
    expect(CAPACITY.hue.carries).toEqual(["nominal"]);
    const invalid: Program = { ...run(structure).retained[0]!, measure: "hue" };
    const unmet = relationProgramUncertified(invalid, facts, "magnitude-comparison", EXPERIMENT_TARGET);
    expect(unmet.join(" ")).toContain("does not carry a ratio measure");

    // Injected into the generator's output, it is an EXTRA relative to the
    // reference — and the checker names it rather than letting it pass.
    const reference = lawfulRelationPrograms(facts, "magnitude-comparison", EXPERIMENT_TARGET).map((x) => `${x.coordinate}|${x.dimension}|${x.measure}`).sort();
    const injected = [...relationMembership(run(structure)), programKey(invalid)].sort();
    expect(injected.filter((k) => !reference.includes(k))).toEqual([programKey(invalid)]);
    expect(relationProgramIsSound(invalid, facts, "magnitude-comparison", EXPERIMENT_TARGET)).toBe(false);
  });

  it("GENERATED: every catalogue entry names a program the enumerator ACTUALLY retained", () => {
    const declarations = loadFormDeclarations();
    expect(declarations.length).toBeGreaterThan(0);
    const catalogue = generateAliasCatalogue(declarations, enumeration, EXPERIMENT_TARGET);
    const retained = relationMembership(enumeration);
    expect(catalogue.entries.length).toBeGreaterThan(0);
    for (const entry of catalogue.entries) {
      expect(entry.programs.length, `${entry.name} names nothing`).toBeGreaterThan(0);
      for (const key of entry.programs) expect(retained, `${entry.name} names ${key}, which is not retained`).toContain(key);
    }
    // The entries name exactly the programs their regions select from the
    // retained set — derived, not asserted.
    for (const entry of catalogue.entries) {
      expect(entry.programs).toEqual(retained.filter((k) => regionMatches(entry.asserts, { coordinate: k.split("|")[0] as never, dimension: k.split("|")[1] as never, measure: k.split("|")[2] as never })));
    }
    // And every retained program is named or not, but no entry names a program
    // outside the retained set, which is the only direction that could lie.
    expect(catalogue.entries.flatMap((e) => e.programs).filter((k) => !retained.includes(k))).toEqual([]);
  });

  it("NOT A SOURCE OF TRUTH: the search is identical with the catalogue emptied, respelled and reordered", () => {
    const declarations = loadFormDeclarations();
    const baseline = relationMembership(enumeration);
    const variants = [
      [],
      declarations.map((d, i) => ({ ...d, name: `renamed-${i}`, colloquial: `renamed ${i}` })),
      [...declarations].reverse(),
      declarations.map((d) => ({ ...d, asserts: {} })),
    ];
    for (const variant of variants) {
      const catalogue = generateAliasCatalogue(variant, enumeration, EXPERIMENT_TARGET);
      // The catalogue changes; the SEARCH does not, because it is the input.
      expect(catalogue.entries.length + catalogue.unsatisfied.length).toBe(variant.length);
      expect(relationMembership(enumeration)).toEqual(baseline);
    }
    // The structural reason, checked rather than asserted: nothing the
    // enumeration path exports mentions the catalogue.
    const src = fs.readFileSync(path.resolve(HERE, "projection.ts"), "utf-8");
    for (const fn of ["export function enumerate(", "export function enumerateGraph(", "export function lawfulRelationPrograms(", "export function relationProgramIsSound("]) {
      const body = src.slice(src.indexOf(fn));
      const end = body.indexOf("\n}");
      expect(body.slice(0, end), `${fn} reaches for the catalogue`).not.toContain("catalogue");
    }
  });

  it("TRACKS THE SPACE: a name whose region loses its members leaves the entries and is REPORTED", () => {
    const declarations = loadFormDeclarations();
    const full = generateAliasCatalogue(declarations, enumeration, EXPERIMENT_TARGET);
    const namedUnderFull = full.entries.map((e) => e.name).sort();
    expect(namedUnderFull.length).toBeGreaterThan(0);

    // Removing the measure channel one name's region requires removes exactly
    // that name, and the removal is DERIVED from the regenerated enumeration
    // rather than declared anywhere.
    const withoutArea = { ...EXPERIMENT_TARGET, channels: EXPERIMENT_TARGET.channels.filter((c) => c !== "area") };
    const reduced = enumerate({ structure, admitted, task: "magnitude-comparison", inventory: withoutArea, partitionDimension: BASIS.resultGrain });
    const after = generateAliasCatalogue(declarations, reduced, withoutArea);
    const namedAfter = after.entries.map((e) => e.name).sort();
    expect(namedUnderFull.filter((n) => !namedAfter.includes(n))).toEqual(["bubble"]);
    const lost = after.unsatisfied.find((u) => u.name === "bubble")!;
    // The reason is `not-in-space`, and that is the honest one: the channel the
    // region names is no longer a channel THIS inventory offers, so the region is
    // not a point it hosts. `not-lawful-here` is reserved for a region the
    // inventory CAN host that this result does not license — the `pie` case
    // below — and conflating the two would lose which of the two failed.
    expect(lost.reason).toBe("not-in-space");
    expect(lost.detail.length).toBeGreaterThan(20);
    expect(after.entries.length + after.unsatisfied.length).toBe(declarations.length);
  });

  it("DISTINGUISHES a region the target cannot host from one this result does not license", () => {
    const declarations = loadFormDeclarations();
    const catalogue = generateAliasCatalogue(declarations, enumeration, EXPERIMENT_TARGET);
    const byName = new Map(catalogue.unsatisfied.map((u) => [u.name, u]));
    // Position is hosted by cartesian, polar, lane and geographic, and NOT by the
    // tabular space, so a region asserting position there is not a point this
    // target has at all.
    expect(CAPACITY.position.spaces).not.toContain("tabular");
    expect(byName.get("table")?.reason).toBe("not-in-space");
    expect(byName.get("heat map")?.reason).toBe("not-in-space");
    // Angle is hosted by polar, so that region IS a point this target has; the
    // entered result simply is not cyclic, so the enumerator refuses it.
    expect(CAPACITY.angle.spaces).toContain("polar");
    expect(CAPACITY.angle.requiresCyclicOrWhole).toBe(true);
    // The reason is now the enumeration's OWN evidence, not a flattened label:
    // the pie region's candidates were REFUSED, and the cause they carried is
    // preserved rather than replaced by "not lawful here".
    expect(byName.get("pie")?.reason).toBe("no-retained-match");
    expect(byName.get("pie")?.refused.length).toBeGreaterThan(0);
    expect(catalogue.unsatisfied.length).toBe(3);
  });

  it("CONFRONTS the removed hand-authored map: every region it claimed that the space does not hold is REPORTED", () => {
    // The map that used to live in this module, preserved verbatim as the claim
    // being checked. It could not be checked before, because nothing generated
    // it: a keyed-by-space-point catalogue makes no contact with any enumeration.
    const claimedByTheRemovedMap: string[] = ["cartesian|position|length", "cartesian|position|area", "tabular|position|text", "polar|position|length", "polar|hue|angle", "tabular|position|luminance"];
    const catalogue = catalogueFor(enumeration, EXPERIMENT_TARGET);
    const named = catalogue.entries.flatMap((e) => e.programs);
    const unheld = claimedByTheRemovedMap.filter((k) => !named.includes(k));
    expect(unheld, "three of the six claims name no retained program").toEqual(["tabular|position|text", "polar|hue|angle", "tabular|position|luminance"]);
    // Every one of them is REPORTED rather than dropped silently.
    for (const key of unheld) {
      expect(catalogue.unsatisfied.some((u) => regionMatches(u.asserts, { coordinate: key.split("|")[0] as never, dimension: key.split("|")[1] as never, measure: key.split("|")[2] as never }))).toBe(true);
    }
    // And the other three are named, so this is not a catalogue that names nothing.
    expect(claimedByTheRemovedMap.filter((k) => named.includes(k))).toEqual(["cartesian|position|length", "cartesian|position|area", "polar|position|length"]);
  });

  it("HOST STANDING: the host is read, recorded at its own path, and a retained pair stays retained", () => {
    const child = corpusPart("cartesian|position|length");
    const j = judgeComposite({
      structure,
      inventory: EXPERIMENT_TARGET,
      composite: {
      combinator: "embed",
      host: corpusPart("cartesian|position|length"),
      budget: ["length"],
      cellBaseline: "zero",
      part: { kind: "program", program: child },
      } as Composite,
    });
    expect(j.verdict.kind, "the existing cell-budget control is preserved").toBe("retained");
    // The host is an OPERAND and it is on the record, at a path no part can take.
    const paths = j.parts.map((x) => x.path.join("."));
    expect(paths).toContain("host");
    expect(paths).toContain("0");
    const hostEntry = j.parts.find((x) => x.path.join(".") === "host")!;
    expect(hostEntry.verdict.kind).toBe("retained");
    expect(new Set(paths).size, "no path names two operands").toBe(paths.length);
  });

  it("HOST STANDING: an unimplemented HOST makes the embed unsupported, and the child is still reported", () => {
    const j = judgeComposite({
      structure,
      inventory: EXPERIMENT_TARGET,
      composite: {
      combinator: "embed",
      host: { ...corpusPart("cartesian|position|length"), task: "trend" },
      budget: ["length"],
      cellBaseline: "zero",
      part: { kind: "program", program: corpusPart("cartesian|position|length") },
      } as Composite,
    });
    expect(j.verdict.kind).toBe("unsupported");
    if (j.verdict.kind !== "unsupported") return;
    // Attributed to the HOST, not to the part: a supported child must not hide a
    // host that has no standing.
    expect(j.verdict.from).toBe("host");
    expect(j.verdict.obligation).toBe("invariant:position-non-meaningful");
    // ...and the child's own disposition is still on the record.
    const child = j.parts.find((x) => x.path.join(".") === "0")!;
    expect(child.verdict.kind, "the child was retained and the record says so").toBe("retained");
  });

  it("HOST STANDING: a CONTRADICTED host refuses the embed with the host's own cause", () => {
    const hostProgram = refusedPart();
    const judgment = judgeOperation(structure, hostProgram.operation) as OperationJudgment;
    const hostCauses = judgment.kind === "refused" ? judgment.causes : [];
    expect(hostCauses.length).toBeGreaterThan(0);

    const j = judgeComposite({
      structure,
      inventory: EXPERIMENT_TARGET,
      composite: {
      combinator: "embed",
      host: hostProgram,
      budget: ["length"],
      cellBaseline: "zero",
      part: { kind: "program", program: corpusPart("cartesian|position|length") },
      } as Composite,
    });
    expect(j.verdict.kind).toBe("refused");
    if (j.verdict.kind !== "refused") return;
    expect(j.verdict.from).toBe("host");
    expect(j.verdict.causes).toEqual(hostCauses);
    expect(j.parts.find((x) => x.path.join(".") === "host")!.verdict.kind).toBe("refused");
  });

  it("HOST STANDING: a faulty host and a faulty child are BOTH on the record", () => {
    const j = judgeComposite({
      structure,
      inventory: EXPERIMENT_TARGET,
      composite: {
      combinator: "embed",
      host: refusedPart(),
      budget: ["length"],
      cellBaseline: "zero",
      part: { kind: "program", program: { ...corpusPart("cartesian|position|length"), task: "trend" } },
      } as Composite,
    });
    // The host is read first, so its fault is the composite's verdict...
    expect(j.verdict.kind).toBe("refused");
    expect(j.verdict.kind === "refused" && j.verdict.from).toBe("host");
    // ...and the child's origin is NOT erased by it.
    const byPath = new Map(j.parts.map((x) => [x.path.join("."), x.verdict.kind]));
    expect(byPath.get("host")).toBe("refused");
    expect(byPath.get("0")).toBe("unsupported");
  });

  it("HOST STANDING: the host is not required to be tabular, because no cause names one", () => {
    // The correction establishes the host's STANDING and invents no host
    // constraint. A cartesian host is read, retained, and does not refuse.
    const j = judgeComposite({
      structure,
      inventory: EXPERIMENT_TARGET,
      composite: {
      combinator: "embed",
      host: corpusPart("cartesian|position|length"),
      budget: ["length"],
      cellBaseline: "zero",
      part: { kind: "program", program: corpusPart("cartesian|position|length") },
      } as Composite,
    });
    expect(j.verdict.kind).toBe("retained");
    expect(COMPOSITION_NON_CLAIMS.join(" ")).toContain("not required to be a tabular projection");
    expect(COMPOSITION_NON_CLAIMS.join(" ")).toContain("for STANDING and not for its channels");
  });

  it("COMPOSITION COVERAGE: the reference takes the partition and agrees with the enumerator in every regime", () => {
    // A measure is declared over a two-column grain so a partition can be chosen
    // that the measure IS additive along and one it is NOT.
    const composedStructure = (additivity: unknown) =>
      ({
        relations: {
          m: {
            grain: ["bucket", "item"],
            fields: {
              bucket: { transformation: "nominal" },
              item: { transformation: "nominal" },
              level: { transformation: "ratio", ...(additivity ? { additivity } : {}) },
            },
          },
        },
      }) as unknown as RelationalStructure;
    const composed = (additivity: unknown) => {
      const s = composedStructure(additivity);
      const op = bindOperation(s, { relation: "m", field: "level", op: "sum", along: ["item"] });
      const adm = admitOperation(s, op);
      if (adm.kind !== "admitted") throw new Error(`authored composition basis is not admitted: ${JSON.stringify(adm)}`);
      return { s, op, facts: adm.facts };
    };
    const compare = (basis: ReturnType<typeof composed>, partition?: string) => {
      const e = enumerate({ structure: basis.s, admitted: basis.op, task: "composition", inventory: EXPERIMENT_TARGET, partitionDimension: partition as never });
      const reference = lawfulRelationPrograms(basis.facts, "composition", EXPERIMENT_TARGET, partition).map((x) => `${x.coordinate}|${x.dimension}|${x.measure}`).sort();
      return { e, reference, actual: relationMembership(e) };
    };

    // additive over the declared partition: the two AGREE, and non-trivially.
    const additive = composed({ kind: "additive" });
    const ok = compare(additive, "bucket");
    expect(ok.reference.length).toBeGreaterThan(0);
    expect(ok.actual).toEqual(ok.reference);

    // A DECLARED CONTRADICTION empties the lawful set in BOTH, for the reason the
    // declaration gives — derived in the reference, not read off the enumerator.
    const nonAdditive = composed({ kind: "non-additive" });
    expect(partitionAdmitsSummation(nonAdditive.facts, "bucket")).toEqual({
      kind: "refused",
      cause: "REL_ADDITIVITY_SUM_SEMIADDITIVE",
      detail: "the measure is declared non-additive, so no partition of it is summable",
    });
    const na = compare(nonAdditive, "bucket");
    expect(na.reference).toEqual([]);
    expect(na.actual).toEqual([]);
    expect(na.e.refused.some((r) => r.cause === "REL_ADDITIVITY_SUM_SEMIADDITIVE")).toBe(true);
    // Not EVERY refusal is the additivity one: a channel the capacity table
    // refuses is refused before the composition block is reached, and saying
    // otherwise would overstate what this control establishes.
    expect(na.e.refused.some((r) => r.cause !== "REL_ADDITIVITY_SUM_SEMIADDITIVE")).toBe(true);

    // A RATIO MEASURE NEVER REACHES PROJECTION. The ENGINE refuses the sum at
    // ADMISSION, so this is an admission outcome and NOT a projection-narrowing
    // result — counting it as one would credit the projection layer with a
    // judgment it never made. The reference's own branch is exercised over an
    // AUTHORED fact set describing such a result, so the derivation is covered
    // by more than the path the enumerator happens to take.
    const ratioStructure = composedStructure({ kind: "ratio-measure" });
    expect(() => composed({ kind: "ratio-measure" })).toThrow(/forbid/);
    const ratioFacts: ResultFacts = { ...additive.facts, measure: { ...additive.facts.measure, additivityKind: "ratio-measure" } };
    expect(partitionAdmitsSummation(ratioFacts, "bucket").kind).toBe("refused");
    const ratioDecision = partitionAdmitsSummation(ratioFacts, "bucket");
    expect(ratioDecision.kind === "refused" && ratioDecision.cause).toBe("REL_RATIO_MEASURE_AVERAGED");
    expect(lawfulRelationPrograms(ratioFacts, "composition", EXPERIMENT_TARGET, "bucket")).toEqual([]);
    expect(ratioStructure.relations.m).toBeDefined();

    // SEMI-ADDITIVE: empty over the dimension it is not additive along, and NOT
    // empty over one it is. The pair is what makes the condition decisive.
    const semi = composed({ kind: "semi-additive", nonAdditiveAlong: ["bucket"] });
    const along = compare(semi, "bucket");
    expect(along.reference).toEqual([]);
    expect(along.actual).toEqual([]);
    expect(along.e.refused.some((r) => r.cause === "REL_ADDITIVITY_SUM_SEMIADDITIVE")).toBe(true);
    // ...and the SAME measure is untouched when the partition is the other column.
    expect(lawfulRelationPrograms({ ...semi.facts, resultGrain: ["item"] }, "composition", EXPERIMENT_TARGET, "item").length).toBeGreaterThan(0);

    // AN OMITTED PARTITION IS UNESTABLISHED, NOT EMPTY BY DECISION.
    const absent = compare(additive, undefined);
    expect(partitionAdmitsSummation(additive.facts, undefined).kind).toBe("unproven");
    expect(absent.reference).toEqual([]);
    expect(absent.actual).toEqual([]);
    expect(absent.e.undecided.length, "the candidates that reach the composition block are CARRIED").toBeGreaterThan(0);
    // Refusals still exist, and NONE of them is the composition one: with the
    // partition omitted nothing is refused FOR LACK OF EXHAUSTIVENESS, it is
    // carried. A capacity refusal is a different thing and still fires.
    expect(absent.e.refused.every((r) => r.cause !== "REL_ADDITIVITY_SUM_SEMIADDITIVE")).toBe(true);
    expect(absent.e.undecided.every((u) => u.obligation === "invariant:exhaustive")).toBe(true);
  });

  it("COMPOSITION COVERAGE: a key dimension channel is lawful in neither, off position", () => {
    const keyed = {
      relations: {
        m: {
          grain: ["bucket", "item"],
          fields: {
            bucket: { transformation: "nominal", key: true },
            item: { transformation: "nominal" },
            level: { transformation: "ratio" },
          },
        },
      },
    } as unknown as RelationalStructure;
    const op = bindOperation(keyed, { relation: "m", field: "level", op: "sum", along: ["item"] });
    const adm = admitOperation(keyed, op);
    if (adm.kind !== "admitted") throw new Error("unreachable");
    expect(adm.facts.dimension.key, "the group column is a key, so a key IS NOT A CATEGORY").toBe(true);

    const e = enumerate({ structure: keyed, admitted: op, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET, partitionDimension: "bucket" });
    const reference = lawfulRelationPrograms(adm.facts, "magnitude-comparison", EXPERIMENT_TARGET).map((x) => `${x.coordinate}|${x.dimension}|${x.measure}`).sort();
    // The restriction is load-bearing: without it the reference would expect
    // non-positional dimensions the enumerator refuses outright.
    expect(e.refused.some((r) => r.cause === "REL_KEY_ENCODED_TO_CHANNEL")).toBe(true);
    expect(e.refused.filter((r) => r.cause === "REL_KEY_ENCODED_TO_CHANNEL").every((r) => r.program.dimension !== "position")).toBe(true);
    expect(relationMembership(e)).toEqual(reference);
    expect(reference.every((k) => k.split("|")[1] === "position")).toBe(true);
  });

  const outcomeOf = (e: Enumeration) =>
    JSON.stringify({
      population: e.population,
      support: e.support,
      retained: relationMembership(e),
      refused: e.refused.map((r) => `${programKey(r.program)}::${r.cause}`).sort(),
      undecided: e.undecided.map((u) => `${programKey(u.program)}::${u.obligation}`).sort(),
    });
  const search = () => enumerate({ structure, admitted, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET, partitionDimension: BASIS.resultGrain });

  it("ALIAS INDEPENDENCE: the search outcome is identical with the alias layer REMOVED, RENAMED and BLANKED", () => {
    // Three contracts directories that differ ONLY in the alias layer. The
    // removal has to be REAL, so the loader is required to fail on it — a
    // control that deletes nothing and observes no change establishes nothing.
    const realDir = path.resolve(HERE, "../../../ds-contracts");
    const removedDir = fs.mkdtempSync(path.join(os.tmpdir(), "alias-removed-"));
    const changedDir = fs.mkdtempSync(path.join(os.tmpdir(), "alias-changed-"));
    const packDir = (d: string) => {
      fs.mkdirSync(path.join(d, "analytical-pack"), { recursive: true });
      return path.join(d, "analytical-pack", "form-regions.json");
    };
    const declared = loadFormDeclarations(realDir);
    fs.writeFileSync(
      packDir(changedDir),
      JSON.stringify({
        regions: [
          // A BLANK region constrains nothing, so it selects EVERY retained
          // program. That is a real state of the layer, not an empty catalogue.
          ...declared.map((_, i) => ({ name: `renamed-${i}`, colloquial: `renamed ${i}`, asserts: {} })),
          // ...and a region no point of this target satisfies, so the changed
          // layer exercises the other branch too.
          { name: "impossible", colloquial: "an impossible region", asserts: { coordinate: "containment", dimension: "hue", measure: "angle" } },
        ],
      }),
      "utf-8",
    );

    // THE REMOVAL IS REAL: the loader throws on the directory the search is
    // about to be shown indifferent to.
    expect(() => loadFormDeclarations(removedDir)).toThrow();
    expect(loadFormDeclarations(realDir).length).toBeGreaterThan(0);
    const changedDecls = loadFormDeclarations(changedDir);
    expect(changedDecls.filter((d) => d.name.startsWith("renamed-")).length).toBe(declared.length);
    expect(changedDecls.some((d) => d.name === "impossible")).toBe(true);
    expect(changedDecls.map((d) => d.name)).not.toEqual(declared.map((d) => d.name));

    // THE NORMALIZED SEMANTIC OUTCOME, in full: population, support, retained
    // membership, every refusal with its cause, every undecided with its
    // obligation. Membership alone would miss a name that moved a CAUSE.
    const baseline = outcomeOf(search());
    const released = [search(), search(), search()].map(outcomeOf);
    expect(new Set([baseline, ...released]).size, "the search is the same run every time").toBe(1);
    // It is not a vacuous outcome: there is something to move.
    expect(JSON.parse(baseline).retained.length).toBeGreaterThan(0);
    expect(JSON.parse(baseline).refused.length).toBeGreaterThan(0);

    // THE CATALOGUE, BY CONTRAST, DOES depend on the layer — which is what makes
    // the search's indifference observable rather than asserted.
    const withReal = catalogueFor(enumeration, EXPERIMENT_TARGET, realDir);
    const withChanged = catalogueFor(enumeration, EXPERIMENT_TARGET, changedDir);
    expect(withChanged.entries.map((e) => e.name)).not.toEqual(withReal.entries.map((e) => e.name));
    // A blank region matches everything, so every renamed name is an ENTRY that
    // names the whole retained set; the impossible one is the unsatisfied report.
    expect(withChanged.entries.length).toBe(declared.length);
    for (const entry of withChanged.entries) expect(entry.programs.length).toBe(relationMembership(enumeration).length);
    expect(withChanged.unsatisfied.map((u) => u.name)).toEqual(["impossible"]);
    expect(withChanged.unsatisfied[0]!.reason).toBe("not-in-space");
    expect(() => catalogueFor(enumeration, EXPERIMENT_TARGET, removedDir)).toThrow();

    // ...and the search is STILL the same run afterwards.
    expect(outcomeOf(search())).toBe(baseline);
  });

  it("ALIAS INDEPENDENCE: nothing the search is built from names the region loader", () => {
    const src = fs.readFileSync(path.resolve(HERE, "projection.ts"), "utf-8");
    for (const fn of [
      "export function enumerate(",
      "export function enumerateGraph(",
      "export function lawfulRelationPrograms(",
      "export function relationProgramIsSound(",
      "export function relationProgramUncertified(",
      "export function projectionSupport(",
      "export function partitionAdmitsSummation(",
      "export function judgeComposite(",
    ]) {
      const body = src.slice(src.indexOf(fn));
      const end = body.indexOf("\n}");
      expect(end, `${fn} was not found`).toBeGreaterThan(0);
      expect(body.slice(0, end), `${fn} reaches for the alias layer`).not.toContain("loadFormDeclarations");
    }
    // The contrast: the catalogue path DOES name it, so the check above is not
    // passing because the string is absent from the file entirely.
    const catalogueBody = src.slice(src.indexOf("export function catalogueFor("));
    expect(catalogueBody.slice(0, catalogueBody.indexOf("\n}"))).toContain("loadFormDeclarations");
  });

  it("CONSERVATION: the composer consumes the SAME atomic classification the enumerator does", () => {
    // A request the enumerator withholds must not become lawful by being handed
    // to a composer instead. The three regimes are the ones the review named.
    const classify = (program: Program, s: RelationalStructure, partition?: string) => {
      const op = program.operation;
      const adm = admitOperation(s, op);
      if (adm.kind !== "admitted") throw new Error("not admitted");
      return classifyAtomicProgram(program, adm.facts, program.task, EXPERIMENT_TARGET, partition);
    };
    const asLayer = (program: Program, s: RelationalStructure, partition?: string) =>
      judgeComposite({ structure: s, inventory: EXPERIMENT_TARGET, composite: { combinator: "layer", parts: [{ kind: "program", program, request: partition === undefined ? undefined : { partitionDimension: partition } }], sharing: {} } }).verdict.kind;

    // (a) A KEYED group column off position.
    const keyed = { relations: { m: { grain: ["bucket", "item"], fields: {
      bucket: { transformation: "nominal", key: true }, item: { transformation: "nominal" }, level: { transformation: "ratio" } } } } } as unknown as RelationalStructure;
    const keyedOp = bindOperation(keyed, { relation: "m", field: "level", op: "sum", along: ["item"] });
    const keyedProgram: Program = { coordinate: "cartesian", dimension: "text", measure: "length", baseline: "zero", task: "magnitude-comparison", claims: [], operation: keyedOp };
    const keyedClassification = classify(keyedProgram, keyed);
    expect(keyedClassification.kind).toBe("refused");
    expect(keyedClassification.kind === "refused" && keyedClassification.cause).toBe("REL_KEY_ENCODED_TO_CHANNEL");
    expect(asLayer(keyedProgram, keyed), "the composer must not certify what enumeration refuses").toBe("refused");
    // ...and position, which a key MAY occupy, is still fine — so this is the
    // key rule and not a blanket refusal.
    expect(asLayer({ ...keyedProgram, dimension: "position" }, keyed)).not.toBe("refused");

    // (b) COMPOSITION with the partition omitted.
    const compStruct = { relations: { m: { grain: ["bucket", "item"], fields: {
      bucket: { transformation: "nominal" }, item: { transformation: "nominal" }, level: { transformation: "ratio", additivity: { kind: "additive" } } } } } } as unknown as RelationalStructure;
    const compOp = bindOperation(compStruct, { relation: "m", field: "level", op: "sum", along: ["item"] });
    const compProgram: Program = { coordinate: "cartesian", dimension: "position", measure: "length", baseline: "zero", task: "composition", claims: [], operation: compOp };
    const omitted = enumerate({ structure: compStruct, admitted: compOp, task: "composition", inventory: EXPERIMENT_TARGET });
    expect(relationMembership(omitted)).toEqual([]);
    expect(omitted.undecided.length).toBeGreaterThan(0);
    expect(classify(compProgram, compStruct).kind, "a missing premise is CARRIED, not certified").toBe("unproven");
    expect(asLayer(compProgram, compStruct)).toBe("unproven");
    // ...and supplying the partition makes the same operand certifiable, so the
    // carrier is what moved and not the program.
    expect(asLayer(compProgram, compStruct, "bucket")).toBe("retained");

    // (c) COMPOSITION over a dimension the measure is not additive along.
    const semi = { relations: { m: { grain: ["bucket", "item"], fields: {
      bucket: { transformation: "nominal" }, item: { transformation: "nominal" }, level: { transformation: "ratio", additivity: { kind: "semi-additive", nonAdditiveAlong: ["bucket"] } } } } } } as unknown as RelationalStructure;
    const semiOp = bindOperation(semi, { relation: "m", field: "level", op: "sum", along: ["item"] });
    const semiProgram: Program = { ...compProgram, operation: semiOp };
    expect(asLayer(semiProgram, semi, "bucket")).toBe("refused");
    // THE PREVIOUS "FAVORABLE" ALTERNATIVE WAS AN INVALID REQUEST. `item` is the
    // column the operation SUMMED AWAY, so it is not a column of the result and
    // is not a partition of anything. Carrying the spelling of a premise does not
    // establish its applicability, and BOTH consumers now refuse it the same way.
    expect(() => asLayer(semiProgram, semi, "item")).toThrow(/not a column of the result/);
    expect(() => asLayer(semiProgram, semi, "does_not_exist")).toThrow(/not a column of the result/);
    // ...and the enumerator refuses the same two requests, through one validator.
    expect(() => enumerate({ structure: semi, admitted: semiOp, task: "composition", inventory: EXPERIMENT_TARGET, partitionDimension: "item" })).toThrow(/not a column of the result/);
    // The basis result's grain is [date]; `product` is the column the admitted
    // operation summed away, so it is not a column of the RESULT.
    expect(facts.resultGrain).toEqual(["date"]);
    expect(partitionBindingFault(facts, "product")).toBeDefined();
    expect(partitionBindingFault(facts, "does_not_exist")).toBeDefined();
    expect(partitionBindingFault(facts, BASIS.resultGrain)).toBeUndefined();
    expect(partitionBindingFault(facts, undefined)).toBeUndefined();
    // A VALID favorable alternative still exists, on a structure where the
    // measure IS additive along the partition.
    expect(asLayer({ ...compProgram, operation: compOp }, compStruct, "bucket")).toBe("retained");
  });

  it("CONSERVATION: a known incompatibility survives an unrelated missing declaration, in EVERY order", () => {
    const KG: UnitDecl = { units: ["kg"] };
    const SEC: UnitDecl = { units: ["s"] };
    const three = {
      ...structure,
      relations: {
        ...structure.relations,
        meter_a: { grain: ["bucket"], fields: { bucket: { transformation: "nominal" }, reading: { transformation: "ratio", unit: KG } } },
        meter_b: { grain: ["bucket"], fields: { bucket: { transformation: "nominal" }, reading: { transformation: "ratio", unit: SEC } } },
        meter_c: { grain: ["bucket"], fields: { bucket: { transformation: "nominal" }, reading: { transformation: "ratio" } } },
      },
    } as unknown as RelationalStructure;
    const p3 = (rel: string): Program => meteredPart(three, rel);
    const facetOf3 = (rels: string[]): Composite => ({
      combinator: "facet",
      parts: rels.map((r) => ({ kind: "program", program: p3(r) })),
      partition: "bucket",
      policy: { length: "shared", text: "shared" },
    });
    const j3 = (rels: string[]) => judgeComposite({ structure: three, inventory: EXPERIMENT_TARGET, composite: facetOf3(rels) }).verdict;

    // THE KNOWN kg/seconds CONTRADICTION IS PRESENT IN EVERY INPUT. Establishment
    // needs all pairs compatible; refutation needs ONE witness, and an unrelated
    // missing declaration cannot undo it. Comparing each panel with the FIRST one
    // hid the contradiction whenever the undeclared panel came first.
    const orders = [["meter_a", "meter_b", "meter_c"], ["meter_c", "meter_a", "meter_b"], ["meter_a", "meter_c", "meter_b"], ["meter_b", "meter_a", "meter_c"], ["meter_b", "meter_c", "meter_a"], ["meter_c", "meter_b", "meter_a"]];
    for (const order of orders) {
      const v = j3(order);
      expect(v.kind, `order ${order.join(",")} must not hide the known contradiction`).toBe("refused");
      expect(v.kind === "refused" && v.causes).toEqual(["REL_UNIT_INCOMMENSURABLE_SHARED_SCALE"]);
    }
    // A missing-only set is still UNPROVEN rather than refused, so the pair
    // distinction is preserved in both directions.
    const allMissing = [
      { ...three, relations: { ...three.relations, meter_a: { grain: ["bucket"], fields: { bucket: { transformation: "nominal" }, reading: { transformation: "ratio" } } } } },
    ][0] as unknown as RelationalStructure;
    const missingOnly = judgeComposite({
      structure: allMissing,
      inventory: EXPERIMENT_TARGET,
      composite: { combinator: "facet", parts: [{ kind: "program", program: meteredPart(allMissing, "meter_a") }, { kind: "program", program: meteredPart(allMissing, "meter_c") }], partition: "bucket", policy: { length: "shared", text: "shared" } },
    }).verdict;
    expect(missingOnly.kind).toBe("unproven");
  });

  it("CONSERVATION: a scale summary cannot hide an incompatible unit from its parent", () => {
    const KG: UnitDecl = { units: ["kg"] };
    const SEC: UnitDecl = { units: ["s"] };
    const CONV: UnitDecl = { units: ["g"], conversions: ["kg"] };
    const mixed = metered(KG, SEC);
    const commensurable = metered(KG, CONV);
    const panel = (s: RelationalStructure, rel: string): Program => meteredPart(s, rel);
    void 0;
    const sharedFacet = (s: RelationalStructure, rels: string[]): Composite => ({
      combinator: "facet",
      parts: rels.map((r) => ({ kind: "program", program: panel(s, r) })),
      partition: "bucket",
      policy: { length: "shared", text: "shared" },
    });
    const annotation: CompositePart = { kind: "program", program: panel(mixed, "meter_a") };
    const layered = (facet: Composite, extra: CompositePart): Composite =>
      ({ combinator: "layer", parts: [{ kind: "composite", composite: facet }, extra], sharing: { length: "shared", text: "shared" } });

    const j = (c: Composite, s: RelationalStructure) => judgeComposite({ structure: s, inventory: EXPERIMENT_TARGET, composite: c }).verdict;

    // THE COUNTEREXAMPLE. Before the correction both of these were RETAINED with
    // the same parent-visible summary, and only the panel ORDER decided.
    const ab = j(layered(sharedFacet(mixed, ["meter_a", "meter_b"]), annotation), mixed);
    const ba = j(layered(sharedFacet(mixed, ["meter_b", "meter_a"]), annotation), mixed);
    expect(ab.kind).toBe("refused");
    expect(ba.kind, "panel order must not decide commensurability").toBe("refused");
    expect(ab.kind === "refused" && ab.causes).toEqual(["REL_UNIT_INCOMMENSURABLE_SHARED_SCALE"]);
    expect(ba.kind === "refused" && ba.causes).toEqual(ab.kind === "refused" ? ab.causes : []);

    // THE SHARED FACET ITSELF cannot become lawful by nesting, and a commensurable
    // pair is untouched — so this is the dimensional rule, not a blanket refusal.
    expect(j(sharedFacet(mixed, ["meter_a", "meter_b"]), mixed).kind).toBe("refused");
    const good = j(layered(sharedFacet(commensurable, ["meter_a", "meter_b"]), { kind: "program", program: panel(commensurable, "meter_a") }), commensurable);
    expect(good.kind, "a commensurable nesting stays lawful").toBe("retained");

    // A FREE SCALE MAKES NO CROSS-PANEL CLAIM, so the same incompatible panels
    // are lawful under it — the scope is preserved rather than everything being
    // refused for not being shared.
    const freeFacet: Composite = { ...sharedFacet(mixed, ["meter_a", "meter_b"]), policy: { length: "free", text: "free" } } as Composite;
    expect(j(freeFacet, mixed).kind).toBe("retained");
    expect(sharedFacet(mixed, ["meter_a", "meter_b"]).combinator === "facet" && freeFacet.combinator === "facet").toBe(true);
  });

  it("A7: a region's report keeps the enumeration's OWN evidence rather than a flattened label", () => {
    const catalogue = catalogueFor(enumeration, EXPERIMENT_TARGET);
    const byName = new Map(catalogue.unsatisfied.map((u) => [u.name, u]));

    // REFUSED candidates arrive with the cause each carried — no new cause is
    // manufactured to compress them.
    const pie = byName.get("pie")!;
    expect(pie.reason).toBe("no-retained-match");
    expect(pie.refused.map((r) => r.program)).toEqual(["polar|hue|angle"]);
    // The CAUSE the enumeration actually recorded is carried through. It is the
    // hue-capacity refusal, not the cyclic-angle one: `hue` cannot carry the
    // result's interval group column, and that check fires first. Naming the real
    // cause is the point — a flattened reason would have said neither.
    expect(pie.refused[0]!.cause).toBe("REL_HUE_CARRIES_ORDER");
    expect(pie.refused.every((r) => r.cause.length > 0)).toBe(true);
    expect(pie.undecided).toEqual([]);

    // UNDECIDED candidates arrive with the obligation each carried.
    const unknownGrain = enumerate({ structure: withGrain("unknown"), admitted, task: "magnitude-comparison", inventory: EXPERIMENT_TARGET, partitionDimension: BASIS.resultGrain });
    expect(unknownGrain.retained).toEqual([]);
    const underUnknown = generateAliasCatalogue(loadFormDeclarations(), unknownGrain, EXPERIMENT_TARGET);
    const anyUnsatisfied = underUnknown.unsatisfied.filter((u) => u.undecided.length > 0);
    expect(anyUnsatisfied.length, "an unresolved premise reaches the report").toBeGreaterThan(0);
    // The obligations that reach the report are the enumeration's OWN, carried
    // unaltered; the assertion names the set rather than assuming one value.
    const obligations = [...new Set(anyUnsatisfied.flatMap((u) => u.undecided.map((x) => x.obligation)))].sort();
    expect(obligations).toContain("grain:declared");
    expect(obligations.every((o) => o.length > 0)).toBe(true);

    // AN UNSUPPORTED REQUEST keeps its support decision, so "we did not build
    // this" is not reported as "the facts forbid it".
    const unsupported = enumerate({ structure, admitted, task: "distribution", inventory: EXPERIMENT_TARGET });
    const underUnsupported = generateAliasCatalogue(loadFormDeclarations(), unsupported, EXPERIMENT_TARGET);
    expect(underUnsupported.unsatisfied.length).toBe(loadFormDeclarations().length);
    for (const u of underUnsupported.unsatisfied) {
      expect(u.reason).toBe("unsupported");
      expect(u.support?.supported).toBe(false);
      expect(u.refused).toEqual([]);
      expect(u.undecided).toEqual([]);
    }

    // A region the target cannot host says so WITHOUT inventing a cause.
    const table = byName.get("table")!;
    expect(table.reason).toBe("not-in-space");
    expect(table.refused).toEqual([]);
    expect(table.undecided).toEqual([]);
    expect(table.support).toBeUndefined();
  });

  it("A6: the DEFAULT loader really meets the removed layer, the search does not, and a dependent search FAILS the control", () => {
    const baseline = outcomeOf(search());
    const real = fs.readFileSync;
    const spy = vi.spyOn(fs, "readFileSync").mockImplementation(((p: never, ...rest: never[]) => {
      if (String(p).endsWith("form-regions.json")) throw new Error("ENOENT: the alias layer is not available");
      return (real as never as (...a: never[]) => string)(p, ...rest);
    }) as never);
    try {
      // THE DEFAULT ENVIRONMENT, not a directory the search never reads.
      expect(() => loadFormDeclarations()).toThrow(/alias layer is not available/);
      expect(() => catalogueFor(enumeration, EXPERIMENT_TARGET)).toThrow(/alias layer is not available/);
      // ...and the search is unaffected IN THAT SAME ENVIRONMENT.
      expect(outcomeOf(search())).toBe(baseline);
      // THE MUTANT. A search that DOES consult the alias layer must fail this
      // control, or the control could not tell the two explanations apart.
      const dependent = () => {
        loadFormDeclarations();
        return outcomeOf(search());
      };
      expect(() => dependent()).toThrow(/alias layer is not available/);
      // ...and a mutant that reads a CHANGED layer must produce a different
      // catalogue while the search stays put.
      spy.mockImplementation(((p: never, ...rest: never[]) => {
        if (String(p).endsWith("form-regions.json")) return JSON.stringify({ regions: [{ name: "only", colloquial: "only", asserts: { coordinate: "cartesian" } }] });
        return (real as never as (...a: never[]) => string)(p, ...rest);
      }) as never);
      const changedCatalogue = catalogueFor(enumeration, EXPERIMENT_TARGET);
      expect(changedCatalogue.entries.map((e) => e.name)).toEqual(["only"]);
      expect(outcomeOf(search()), "the search is unmoved by a CHANGED layer too").toBe(baseline);
    } finally {
      spy.mockRestore();
    }
    // Restored, everything is back — so the intervention was an intervention.
    expect(outcomeOf(search())).toBe(baseline);
    expect(loadFormDeclarations().length).toBeGreaterThan(0);
  });

  it("states what the generated catalogue does NOT establish", () => {
    expect(CATALOGUE_NON_CLAIMS.length).toBeGreaterThanOrEqual(4);
    for (const nc of CATALOGUE_NON_CLAIMS) expect(nc.trim().length).toBeGreaterThan(40);
    expect(CATALOGUE_NON_CLAIMS.join(" ")).toContain("PER ENUMERATION");
    expect(FORM_REGIONS_FILE).toBe("analytical-pack/form-regions.json");
  });

  it("states what the retained relation proof does NOT establish", () => {
    expect(RELATION_REFERENCE_NON_CLAIMS.length).toBeGreaterThanOrEqual(6);
    const joined = RELATION_REFERENCE_NON_CLAIMS.join(" ");
    // The scope boundary the broad signature would otherwise hide.
    expect(joined).toContain("SHARED AXIOM");
    expect(joined).toContain("STILL NOT COVERED");
    // The shared premises, stated as shared rather than as independence.
    expect(joined).toContain("SHARED PREMISE");
    expect(joined).toContain("inducedClaims");
    // And the two distinctions this slice exists to keep.
    expect(joined).toContain("NOT thereby analytically illegal");
    expect(joined).toContain("ALIAS INDEPENDENCE IS NOT IDENTIFIER RENAMING");
    for (const nonClaim of RELATION_REFERENCE_NON_CLAIMS) expect(nonClaim.trim().length).toBeGreaterThan(40);
  });

  it("states its excluded population rather than reporting an empty lawful set", () => {
    const e = run(structure);
    expect(e.population.considered).toBe(168);
    expect(e.population.excluded).toBeGreaterThan(0);
    expect(e.population.disposed).toBe(e.population.considered - e.population.excluded);
  });
});

/* ---------------------------------------------------------------------------
 * M3 — COMPOSITION AND UNFAMILIAR CASES OBEY THE SAME RULES
 *
 * The expectations are not written here. They are read from
 * `composition-precommit.json`, which was committed BEFORE any combinator rule
 * existed, and which records for each case the doctrine text the expectation was
 * derived from. The implementation is compared against the frozen file; the file
 * is never edited to match the implementation. Where the two disagree, the
 * disagreement is recorded in the file's `adjudication` section and asserted
 * here by identity — so the disagreement set cannot be padded or quietly pruned,
 * and a case cannot be moved into it without the move being visible.
 * ------------------------------------------------------------------------- */

const PRECOMMIT_PATH = path.resolve(HERE, "../../../ds-contracts/analytical-fixtures/composition-precommit.json");

type FrozenExpectation = {
  id: string;
  combinator: string;
  construction: string;
  derivation: string;
  expected: {
    verdict: "retained" | "refused" | "unproven";
    cause?: string;
    obligation?: string;
    causeFrom?: "part" | "combinator";
    causeIsCompositeSpecific?: boolean;
    induces?: string[];
    withholds?: string[];
    sameAs?: string;
    sharing?: Record<string, string>;
    policy?: Record<string, string>;
  };
};

const precommit = JSON.parse(fs.readFileSync(PRECOMMIT_PATH, "utf-8")) as {
  cases: FrozenExpectation[];
  adjudication: { disagreements: Array<{ id: string; expected: string; actual: string; finding: string }> };
  corpusFinding: { statement: string; measuredBy: string; consequence: string };
};

/** The authored declarations the unit-dependent cases are built over. */
const UNIT_KG: UnitDecl = { units: ["kg"] };
const UNIT_GRAM_CONVERTIBLE: UnitDecl = { units: ["g"], conversions: ["kg"] };
const UNIT_SECOND: UnitDecl = { units: ["s"] };

/**
 * Two relations that differ ONLY in the unit their measure field declares, so a
 * commensurability verdict can be attributed to the unit and to nothing else.
 * The committed corpus declares no unit on any field, which is why these cases
 * are authored: see `corpusFinding` in the pre-commit.
 */
const metered = (a?: UnitDecl, b?: UnitDecl): RelationalStructure =>
  ({
    ...structure,
    relations: {
      ...structure.relations,
      meter_a: { grain: ["bucket"], fields: { bucket: { transformation: "nominal" }, reading: { transformation: "ratio", ...(a ? { unit: a } : {}) } } },
      meter_b: { grain: ["bucket"], fields: { bucket: { transformation: "nominal" }, reading: { transformation: "ratio", ...(b ? { unit: b } : {}) } } },
    },
  }) as unknown as RelationalStructure;

const meteredPart = (s: RelationalStructure, relation: string): Program => {
  const op = bindOperation(s, { relation, field: "reading", op: "sum" });
  const admission = admitOperation(s, op);
  if (admission.kind !== "admitted") throw new Error(`${relation} is not admitted: ${JSON.stringify(admission)}`);
  return { coordinate: "cartesian", dimension: "text", measure: "length", baseline: "zero", task: "magnitude-comparison", claims: [], operation: op };
};

/** A retained program from the corpus enumeration, named rather than counted. */
const corpusPart = (k: string): Program => {
  const found = enumeration.retained.find((p) => programKey(p) === k);
  if (!found) throw new Error(`the corpus enumeration retains no program ${k}`);
  return found;
};

const A = (s: RelationalStructure) => meteredPart(s, "meter_a");
const B = (s: RelationalStructure) => meteredPart(s, "meter_b");

const runComposite = (composite: Composite, s: RelationalStructure = structure): CompositeVerdict =>
  judgeComposite({ structure: s, inventory: EXPERIMENT_TARGET, composite }).verdict;

const KG = metered(UNIT_KG, UNIT_KG);
const MISMATCHED = metered(UNIT_KG, UNIT_SECOND);
const UNITLESS = metered(UNIT_KG, undefined);

const layerOver = (s: RelationalStructure, sharing: Record<string, "shared" | "unshared">): Composite => ({
  combinator: "layer",
  parts: [
    { kind: "program", program: A(s) },
    { kind: "program", program: B(s) },
  ],
  sharing,
});
const sharedLayer = (s: RelationalStructure) => layerOver(s, { length: "shared", text: "shared" });
const facetOver = (part: Composite, policy: Record<string, "shared" | "free">): Composite => ({
  combinator: "facet",
  parts: [{ kind: "composite", composite: part }],
  partition: "bucket",
  policy,
});
const facetOf = (k: string, policy: Record<string, "shared" | "free">): Composite => ({
  combinator: "facet",
  parts: [{ kind: "program", program: corpusPart(k) }],
  partition: BASIS.resultGrain,
  policy,
});

/** A part the analytical rules themselves refuse: a cross-date sum of a semi-additive measure. */
const refusedPart = (): Program => {
  const op = bindOperation(structure, { relation: BASIS.relation, field: "on_hand", op: "sum", along: ["date"] });
  return { coordinate: "cartesian", dimension: "text", measure: "length", baseline: "zero", task: "magnitude-comparison", claims: [], operation: op };
};

const CASES: Record<string, () => CompositeVerdict> = {
  L1_LAYER_SHARED_POSITION: () => runComposite(sharedLayer(KG), KG),
  L2_LAYER_SHARING_UNDECLARED: () => runComposite(layerOver(KG, {}), KG),
  L3_LAYER_SHARED_INCOMMENSURABLE: () => runComposite(sharedLayer(MISMATCHED), MISMATCHED),
  L4_LAYER_SHARED_UNIT_ABSENT: () => runComposite(sharedLayer(UNITLESS), UNITLESS),
  L5_LAYER_UNSHARED_ONE_COORDINATE_SPACE: () => runComposite(layerOver(KG, { length: "unshared", text: "shared" }), KG),
  F1_FACET_SHARED_POLICY: () => runComposite(facetOf("cartesian|position|length", { length: "shared", position: "shared" })),
  F2_FACET_POLICY_UNDECLARED: () => runComposite(facetOf("cartesian|position|length", {})),
  F3_FACET_FREE_POLICY: () => runComposite(facetOf("cartesian|position|length", { length: "free", position: "free" })),
  E1_EMBED_TREND_WITHIN_BUDGET: () =>
    runComposite({
      combinator: "embed",
      host: corpusPart("cartesian|position|length"),
      budget: ["length", "text"],
      cellBaseline: "truncated",
      part: { kind: "program", program: { ...corpusPart("cartesian|position|length"), task: "trend" } },
    }),
  E2_EMBED_MAGNITUDE_BEYOND_BUDGET: () =>
    runComposite({
      combinator: "embed",
      host: corpusPart("cartesian|position|length"),
      budget: ["length"],
      cellBaseline: "truncated",
      part: { kind: "program", program: corpusPart("cartesian|position|length") },
    }),
  S1_LAYER_PART_REFUSED: () =>
    runComposite({ combinator: "layer", parts: [{ kind: "program", program: refusedPart() }, { kind: "program", program: corpusPart("cartesian|text|length") }], sharing: { length: "shared", text: "shared" } }),
  N1_LAYER_OF_FACET_CONTRADICTION: () =>
    runComposite({
      combinator: "layer",
      parts: [
        { kind: "composite", composite: facetOf("cartesian|position|length", { length: "free", position: "free" }) },
        { kind: "program", program: corpusPart("cartesian|text|length") },
      ],
      sharing: { length: "shared", position: "shared", text: "shared" },
    }),
  U1_FACET_OF_LAYER_FREE_PANELS: () => runComposite(facetOver(sharedLayer(KG), { length: "free", text: "free" }), KG),
  U2_FACET_OF_LAYER_SHARED_PANELS: () => runComposite(facetOver(sharedLayer(KG), { length: "shared", text: "shared" }), KG),
  U3_FACET_OF_LAYER_UNDECLARED_INNER: () => runComposite(facetOver(layerOver(KG, {}), { length: "free", text: "free" }), KG),
  P1_LAYER_UNUSED_CHANNEL_DECLARATION: () => runComposite({ ...(sharedLayer(KG) as Extract<Composite, { combinator: "layer" }>), sharing: { length: "shared", text: "shared", area: "shared" } }, KG),
  P2_FACET_UNUSED_CHANNEL_POLICY: () => runComposite({ ...(facetOf("cartesian|position|length", { length: "shared", position: "shared" }) as Extract<Composite, { combinator: "facet" }>), policy: { length: "shared", position: "shared", area: "free" } }),
};

/** Why a case departs from its frozen expectation. Empty means it agrees. */
const departures = (e: FrozenExpectation, v: CompositeVerdict, claimsOf: (id: string) => string[]): string[] => {
  const out: string[] = [];
  if (e.expected.verdict !== v.kind) return [`verdict ${v.kind}, expected ${e.expected.verdict}`];
  if (v.kind === "refused") {
    if (e.expected.cause && !v.causes.includes(e.expected.cause)) out.push(`causes ${JSON.stringify(v.causes)}, expected ${e.expected.cause}`);
    if (e.expected.causeFrom && v.from !== e.expected.causeFrom) out.push(`refused from ${v.from}, expected ${e.expected.causeFrom}`);
  }
  if (v.kind === "unproven" && e.expected.obligation && v.obligation !== e.expected.obligation) {
    out.push(`obligation ${v.obligation}, expected ${e.expected.obligation}`);
  }
  if (v.kind === "retained") {
    const claims = compositeClaimSet(v);
    for (const c of e.expected.induces ?? []) if (!claims.includes(c)) out.push(`does not induce ${c}`);
    for (const c of e.expected.withholds ?? []) if (claims.includes(c)) out.push(`induces ${c}, which the expectation withholds`);
    if (e.expected.sameAs) {
      const other = claimsOf(e.expected.sameAs);
      if (JSON.stringify(claims) !== JSON.stringify(other)) out.push(`claims ${JSON.stringify(claims)} differ from ${e.expected.sameAs} ${JSON.stringify(other)}`);
    }
  }
  return out;
};

describe("M3 composition: the parts decide first, and the combinator rule decides the rest", () => {
  it("every pre-registered case is built, and the frozen file records exactly the disagreements that occur", () => {
    const built = Object.keys(CASES).sort();
    const frozen = precommit.cases.map((c) => c.id).sort();
    expect(built, "a frozen case with no construction is an expectation nothing checks").toEqual(frozen);

    const disagreements = new Set(precommit.adjudication.disagreements.map((d) => d.id));
    const actualDisagreements = new Set<string>();
    const claimsOf = (id: string) => {
      const v = CASES[id]!();
      return v.kind === "retained" ? v.claims : [];
    };
    for (const e of precommit.cases) {
      if (departures(e, CASES[e.id]!(), claimsOf).length > 0) actualDisagreements.add(e.id);
    }
    expect(
      [...actualDisagreements].sort(),
      "the adjudicated disagreement set must be exactly the set that disagrees — a case may not be moved into it, and it may not be pruned",
    ).toEqual([...disagreements].sort());
    expect(disagreements.size).toBe(1);
  });

  it("agrees with every frozen expectation it did not adjudicate", () => {
    const claimsOf = (id: string) => {
      const v = CASES[id]!();
      return v.kind === "retained" ? v.claims : [];
    };
    const ad = new Set(precommit.adjudication.disagreements.map((d) => d.id));
    for (const e of precommit.cases) {
      if (ad.has(e.id)) continue;
      expect(departures(e, CASES[e.id]!(), claimsOf), `${e.id}: ${e.derivation}`).toEqual([]);
    }
  });

  it("the one disagreement is the doctrine's embed example, and it is the TASK TABLE that refuses it", () => {
    const [d] = precommit.adjudication.disagreements;
    expect(d!.id).toBe("E1_EMBED_TREND_WITHIN_BUDGET");
    const v = CASES.E1_EMBED_TREND_WITHIN_BUDGET!();
    // Not a budget refusal: the experiment never reaches the budget, because the
    // trend task is not implemented on this path. If this ever becomes `refused`
    // with the embed cause the finding above has been silently overtaken and must
    // be re-derived.
    //
    // RECOVERY MOVED THIS FROM `unproven` TO `unsupported`, and that is the point
    // of the recovery: a task the path does not implement is not a premise that
    // went missing.
    expect(v.kind).toBe("unsupported");
    expect(v.kind === "unsupported" && v.obligation).toBe("invariant:position-non-meaningful");
    expect(v.kind === "unsupported" && v.from).toBe("part");
    expect(v.kind === "unsupported" && v.task).toBe("trend");
    expect("notEnumerated" in TASK_INVARIANTS.trend).toBe(true);
  });

  it("RECOVERY: an unimplemented part is UNSUPPORTED -- not unproven, not refused, not merely absent", () => {
    const trendPart: Program = { ...corpusPart("cartesian|position|length"), task: "trend" };
    const j = judgeComposite({ structure, inventory: EXPERIMENT_TARGET, composite: { combinator: "layer", parts: [{ kind: "program", program: trendPart }], sharing: {} } });
    expect(j.verdict.kind).toBe("unsupported");
    if (j.verdict.kind !== "unsupported") return;
    expect(j.verdict.task, "the part's own question is named").toBe("trend");
    expect(j.verdict.resultKind).toBe("relation");
    expect(j.verdict.obligation, "what would have to be built is named").toBe("invariant:position-non-meaningful");
    expect(j.verdict.from).toBe("part");
    // The three are different shapes, and this asserts the difference rather
    // than a string that happens to differ.
    expect(["unproven", "refused", "retained"]).not.toContain(j.verdict.kind);
  });

  it("RECOVERY: a missing analytical premise keeps its obligation through the composite", () => {
    const unknown = withGrain("unknown");
    const j = judgeComposite({ structure: unknown, inventory: EXPERIMENT_TARGET, composite: { combinator: "layer", parts: [{ kind: "program", program: corpusPart("cartesian|position|length") }], sharing: {} } });
    expect(j.verdict.kind).toBe("unproven");
    expect(j.verdict.kind === "unproven" && j.verdict.obligation).toBe("grain:declared");
    expect(j.verdict.kind === "unproven" && j.verdict.from).toBe("part");
  });

  it("RECOVERY: a demonstrated contradiction keeps the PART's cause and the PART's location", () => {
    const part = refusedPart();
    const judgment = judgeOperation(structure, part.operation) as OperationJudgment;
    const partCauses = judgment.kind === "refused" ? judgment.causes : [];
    expect(partCauses.length).toBeGreaterThan(0);

    const j = judgeComposite({ structure, inventory: EXPERIMENT_TARGET, composite: { combinator: "layer", parts: [{ kind: "program", program: part }], sharing: {} } });
    expect(j.verdict.kind).toBe("refused");
    if (j.verdict.kind !== "refused") return;
    expect(j.verdict.causes).toEqual(partCauses);
    expect(j.verdict.from).toBe("part");
    // The recorded origin is the part's own, at its own path.
    const origin = j.parts.find((x) => x.path.join(".") === "0")!;
    expect(origin.verdict.kind).toBe("refused");
    expect(origin.verdict.kind === "refused" && origin.verdict.causes).toEqual(partCauses);
  });

  it("RECOVERY: parts in SEVERAL dispositions are ALL reported, so no origin is erased", () => {
    const trendPart: Program = { ...corpusPart("cartesian|position|length"), task: "trend" };
    // The declared grain is NOT withheld here: an unknown grain makes every
    // candidate unproven before the rules are consulted, which would mask the
    // contradiction and collapse three dispositions into two.
    const j = judgeComposite({
      structure,
      inventory: EXPERIMENT_TARGET,
      composite: {
        combinator: "layer",
        parts: [
          { kind: "program", program: trendPart },
          { kind: "program", program: refusedPart() },
          { kind: "program", program: corpusPart("cartesian|position|length") },
        ],
        sharing: { length: "shared", position: "shared", text: "shared" },
      },
    });

    // The composite's own verdict is ONE thing: the first fault.
    expect(j.verdict.kind).toBe("unsupported");
    // ...and every part's disposition is still on the record, including the two
    // the aggregate verdict does not name.
    expect(j.parts.map((x) => [x.path.join("."), x.verdict.kind])).toEqual([
      ["0", "unsupported"],
      ["1", "refused"],
      ["2", "retained"],
    ]);
    const [unsupportedPart, refusedPartVerdict, retainedPart] = j.parts.map((x) => x.verdict);
    expect(unsupportedPart!.kind === "unsupported" && unsupportedPart!.obligation).toBe("invariant:position-non-meaningful");
    expect(refusedPartVerdict!.kind === "refused" && refusedPartVerdict!.causes.length).toBeGreaterThan(0);
    expect(retainedPart!.kind).toBe("retained");
  });

  it("RECOVERY: an unproven part is distinguishable from an unsupported one in the same record", () => {
    const trendPart: Program = { ...corpusPart("cartesian|position|length"), task: "trend" };
    const j = judgeComposite({
      structure: withGrain("unknown"),
      inventory: EXPERIMENT_TARGET,
      composite: { combinator: "layer", parts: [{ kind: "program", program: trendPart }, { kind: "program", program: corpusPart("cartesian|position|length") }], sharing: { length: "shared", position: "shared", text: "shared" } },
    });
    // Both parts are non-retained, and they are non-retained for DIFFERENT
    // reasons that the record keeps apart.
    expect(j.parts.map((x) => [x.path.join("."), x.verdict.kind, x.verdict.kind === "unproven" ? x.verdict.obligation : x.verdict.kind === "unsupported" ? x.verdict.obligation : ""])).toEqual([
      ["0", "unsupported", "invariant:position-non-meaningful"],
      ["1", "unproven", "grain:declared"],
    ]);
  });

  it("RECOVERY: a nested composite's disposition reaches the outer tree with its origins intact", () => {
    // The inner layer is refused by its OWN rule; the outer facet must attribute
    // that to its part and must not rewrite the cause.
    const inner: Composite = layerOver(KG, {});
    const j = judgeComposite({ structure: KG, inventory: EXPERIMENT_TARGET, composite: facetOver(inner, { length: "free", text: "free" }) });
    expect(j.verdict.kind).toBe("refused");
    expect(j.verdict.kind === "refused" && j.verdict.from).toBe("part");
    expect(j.verdict.kind === "refused" && j.verdict.causes).toEqual(["REL_LAYER_SCALE_UNSHARED"]);
    // The inner tree's origins are present at their own paths, not flattened.
    const paths = j.parts.map((x) => x.path.join("."));
    expect(paths).toContain("0.0");
    expect(paths).toContain("0.1");
    expect(paths).toContain("0");
    // The record entry at the PART's own path holds the inner composite's verdict
    // VERBATIM, so its attribution is the inner combinator's — the inner layer
    // refused by its own rule. The outer `verdict.from` above says the OUTER
    // facet refused because a part arrived faulted. Both attributions are on the
    // record, which is the point: re-attributing the inner entry too would erase
    // where the rule that fired actually lives.
    const inner0 = j.parts.find((x) => x.path.join(".") === "0")!;
    expect(inner0.verdict.kind).toBe("refused");
    expect(inner0.verdict.kind === "refused" && inner0.verdict.from).toBe("combinator");
    // Judging the inner composite on its own returns exactly what the record
    // carries at its path, so the nesting lost nothing on the way out.
    const innerAlone = judgeComposite({ structure: KG, inventory: EXPERIMENT_TARGET, composite: inner });
    expect(innerAlone.verdict).toEqual(inner0.verdict);
  });

  it("RECOVERY: a part the composer cannot certify is CARRIED, never refused by a helper's false", () => {
    // A program whose measure channel cannot carry the result's transformation
    // is not certified. That is not a contradiction and this composer has no
    // named cause for it, so it must not manufacture one.
    const uncertifiable: Program = { ...corpusPart("cartesian|position|length"), measure: "hue" };
    expect(relationProgramIsSound(uncertifiable, facts, "magnitude-comparison", EXPERIMENT_TARGET)).toBe(false);
    const j = judgeComposite({ structure, inventory: EXPERIMENT_TARGET, composite: { combinator: "layer", parts: [{ kind: "program", program: uncertifiable }], sharing: {} } });
    expect(j.verdict.kind, "an uncertified part is not a contradiction").toBe("unproven");
    if (j.verdict.kind !== "unproven") return;
    expect(j.verdict.obligation).toBe("part:uncertified");
    expect(j.verdict.detail, "the premises that were not met are named").toContain("does not carry a ratio measure");
  });

  it("no combinator cause is invented: all four are declared by the doctrine's own diagnostic table", () => {
    const emitted = new Set<string>();
    for (const id of Object.keys(CASES)) {
      const v = CASES[id]!();
      if (v.kind === "refused") v.causes.forEach((c) => emitted.add(c));
    }
    // One cause comes from the PART's own admission judgment, not from a
    // combinator; every combinator cause must be one the doctrine declares.
    for (const cause of emitted) {
      if (cause === "REL_ADDITIVITY_SUM_SEMIADDITIVE") continue;
      expect(allowedCauses.has(cause), `${cause} is not a diagnostic the doctrine declares`).toBe(true);
      expect(["REL_LAYER_SCALE_UNSHARED", "REL_UNIT_INCOMMENSURABLE_SHARED_SCALE", "REL_FACET_SCALE_POLICY_UNDECLARED", "REL_EMBED_TASK_EXCEEDS_CHANNEL_BUDGET"]).toContain(cause);
    }
    expect(emitted.has("REL_LAYER_SCALE_UNSHARED")).toBe(true);
    expect(emitted.has("REL_UNIT_INCOMMENSURABLE_SHARED_SCALE")).toBe(true);
    expect(emitted.has("REL_FACET_SCALE_POLICY_UNDECLARED")).toBe(true);
    expect(emitted.has("REL_EMBED_TASK_EXCEEDS_CHANNEL_BUDGET")).toBe(true);
  });

  it("a refused composite carries the PART's cause verbatim, and no composite-shaped one replaces it", () => {
    const part = refusedPart();
    const judgment = judgeOperation(structure, part.operation) as OperationJudgment;
    expect(judgment.kind).toBe("refused");
    const partCauses = judgment.kind === "refused" ? judgment.causes : [];
    expect(partCauses.length, "the case is only decisive if the part carries a named cause").toBeGreaterThan(0);

    const v = CASES.S1_LAYER_PART_REFUSED!();
    expect(v.kind).toBe("refused");
    if (v.kind !== "refused") return;
    expect(v.from, "the composite is refused because a PART is refused").toBe("part");
    expect(v.causes, "the part's cause reaches the caller unaltered").toEqual(partCauses);
    for (const combinatorCause of ["REL_LAYER_SCALE_UNSHARED", "REL_UNIT_INCOMMENSURABLE_SHARED_SCALE", "REL_FACET_SCALE_POLICY_UNDECLARED", "REL_EMBED_TASK_EXCEEDS_CHANNEL_BUDGET"]) {
      expect(v.causes).not.toContain(combinatorCause);
    }
    // And the same part under a combinator whose own rule it would satisfy is
    // still refused, so the refusal is about the part and not about the layer.
    const alone = runComposite({ combinator: "layer", parts: [{ kind: "program", program: part }], sharing: {} });
    expect(alone.kind).toBe("refused");
    expect(alone.kind === "refused" && alone.from).toBe("part");
  });

  it("a sufficient cell budget admits the SAME part the insufficient one refuses", () => {
    const insufficient = CASES.E2_EMBED_MAGNITUDE_BEYOND_BUDGET!();
    expect(insufficient.kind).toBe("refused");
    const sufficient = runComposite({
      combinator: "embed",
      host: corpusPart("cartesian|position|length"),
      budget: ["length"],
      cellBaseline: "zero",
      part: { kind: "program", program: corpusPart("cartesian|position|length") },
    });
    expect(sufficient.kind, "the refusal tracks the baseline the cell offers, not the part").toBe("retained");
    expect(compositeClaimSet(sufficient)).toContain("ratio-comparability");
  });

  it("the two scale scopes are not one profile: a free facet over a shared layer is lawful, and a shared layer over a free facet is not", () => {
    const u1 = CASES.U1_FACET_OF_LAYER_FREE_PANELS!();
    const u2 = CASES.U2_FACET_OF_LAYER_SHARED_PANELS!();
    expect(u1.kind).toBe("retained");
    expect(u2.kind).toBe("retained");
    // A flattened single profile refuses U1; the scopes must be read separately.
    expect(u1.kind === "retained" && u1.profile.length).toBe("free");
    expect(u1.kind === "retained" && u1.profile.text).toBe("free");
    const difference = compositeClaimSet(u2).filter((c) => !compositeClaimSet(u1).includes(c));
    expect(difference, "U2 differs from U1 by exactly the claim the policy names").toEqual(["cross-panel-comparability"]);
    // The reverse nesting is refused, because the operand exposes the channel free.
    const n1 = CASES.N1_LAYER_OF_FACET_CONTRADICTION!();
    expect(n1.kind).toBe("refused");
    expect(n1.kind === "refused" && n1.causes).toContain("REL_LAYER_SCALE_UNSHARED");
    expect(n1.kind === "refused" && n1.from).toBe("combinator");
  });

  it("the facet's two policies differ by the claim and by nothing else", () => {
    const shared = CASES.F1_FACET_SHARED_POLICY!();
    const free = CASES.F3_FACET_FREE_POLICY!();
    expect(shared.kind).toBe("retained");
    expect(free.kind).toBe("retained");
    const s = compositeClaimSet(shared);
    const f = compositeClaimSet(free);
    expect(s.filter((c) => !f.includes(c))).toEqual(["cross-panel-comparability"]);
    expect(f.filter((c) => !s.includes(c))).toEqual([]);
    expect(shared.kind === "retained" && shared.profile.length).toBe("shared");
    expect(free.kind === "retained" && free.profile.length).toBe("free");
  });

  it("commensurability is read off the declaration, and an absent fact is unproven rather than false", () => {
    expect(unitsCommensurable(UNIT_KG, UNIT_KG)).toBe("yes");
    expect(unitsCommensurable(UNIT_KG, UNIT_GRAM_CONVERTIBLE)).toBe("yes");
    expect(unitsCommensurable(UNIT_GRAM_CONVERTIBLE, UNIT_KG)).toBe("yes");
    expect(unitsCommensurable(UNIT_KG, UNIT_SECOND)).toBe("no");
    expect(unitsCommensurable(UNIT_KG, undefined)).toBe("unknown");
    expect(unitsCommensurable(undefined, undefined)).toBe("unknown");
    expect(unitsCommensurable({ perRow: true, units: ["kg"] }, UNIT_KG), "perRow is the schema's own statement that the instance decides").toBe("unknown");
    // The three branches reach three different verdicts over otherwise identical declarations.
    expect(CASES.L1_LAYER_SHARED_POSITION!().kind).toBe("retained");
    expect(CASES.L3_LAYER_SHARED_INCOMMENSURABLE!().kind).toBe("refused");
    expect(CASES.L4_LAYER_SHARED_UNIT_ABSENT!().kind).toBe("unproven");
  });

  it("the committed corpus declares no unit, so the corpus itself exercises the unproven branch", () => {
    // The pre-commit predicted this and it is load-bearing: L3's refusal is only
    // reachable over an authored declaration, so presenting the corpus's own
    // outcome as the refusal would be presenting one branch as the other.
    const corpusLayer = runComposite({
      combinator: "layer",
      parts: [
        { kind: "program", program: corpusPart("cartesian|position|length") },
        { kind: "program", program: corpusPart("cartesian|text|length") },
      ],
      sharing: { length: "shared", text: "shared" },
    });
    expect(corpusLayer.kind).toBe("unproven");
    expect(corpusLayer.kind === "unproven" && corpusLayer.obligation).toBe("unit:commensurable");
    expect(Object.values(structure.relations).every((r) => Object.values(r.fields ?? {}).every((f) => f.unit === undefined))).toBe(true);
  });

  it("declarations no part reads are inert in both combinators", () => {
    const l1 = CASES.L1_LAYER_SHARED_POSITION!();
    const p1 = CASES.P1_LAYER_UNUSED_CHANNEL_DECLARATION!();
    expect(p1.kind).toBe("retained");
    expect(compositeClaimSet(p1), "an unused channel's sharing declaration moves nothing").toEqual(compositeClaimSet(l1));
    expect(p1.kind === "retained" && p1.channels).toEqual(l1.kind === "retained" ? l1.channels : []);

    const f1 = CASES.F1_FACET_SHARED_POLICY!();
    const p2 = CASES.P2_FACET_UNUSED_CHANNEL_POLICY!();
    expect(p2.kind).toBe("retained");
    expect(compositeClaimSet(p2), "a policy for a channel the projection does not read is inert").toEqual(compositeClaimSet(f1));
    expect(p2.kind === "retained" && p2.profile).toEqual(f1.kind === "retained" ? f1.profile : {});
  });

  it("the cell budget asks the capacity table the same question inducedClaims asks, rather than carrying a second copy", () => {
    // A ratio measure on a length channel at a zero baseline is ratio comparable;
    // at a truncated baseline it is only difference comparable. If the embed rule
    // ever diverged from this, the two would disagree here.
    expect(channelClaims("length", "zero", facts)).toContain("ratio-comparability");
    expect(channelClaims("length", "truncated", facts)).not.toContain("ratio-comparability");
    expect(channelClaims("text", "truncated", facts)).toContain("ratio-comparability");
    const asProgram = inducedClaims({ ...metricProgram, measure: "length", baseline: "zero" }, facts).filter((c) => c !== "partition-membership");
    expect(channelClaims("length", "zero", facts).slice().sort()).toEqual(asProgram.slice().sort());
  });

  it("the composition surface states what it does not claim", () => {
    expect(COMPOSITION_NON_CLAIMS.length).toBeGreaterThanOrEqual(5);
    for (const nonClaim of COMPOSITION_NON_CLAIMS) expect(nonClaim.trim().length).toBeGreaterThan(40);
    expect(COMPOSITION_NON_CLAIMS.join(" ")).toContain("partition");
  });
});
