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
} from "./projection.js";
import type { AggregateAssertionDecl, Program, TargetInventory } from "./projection.js";
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

  it("states what the retained relation proof does NOT establish", () => {
    expect(RELATION_REFERENCE_NON_CLAIMS.length).toBeGreaterThanOrEqual(6);
    const joined = RELATION_REFERENCE_NON_CLAIMS.join(" ");
    // The scope boundary the broad signature would otherwise hide.
    expect(joined).toContain("MAGNITUDE COMPARISON");
    expect(joined).toContain("composition");
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
