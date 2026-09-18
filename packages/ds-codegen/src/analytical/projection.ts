/**
 * The bounded stage-3 experiment (REL-PROJECTION-EXPERIMENT-01).
 *
 * THE QUESTION, from the doctrine's stage-3 precommit: given ONE fixed
 * analytical authority — relation, derivation and task held fixed — does the
 * system independently enumerate at least two STRUCTURALLY DIFFERENT lawful
 * projection programs, with shared claims identifiable, losses explicit, and
 * non-empty target-specific residue, with no form name participating in the
 * derivation?
 *
 * This module is an ENUMERATOR, not a catalogue. It never asks "is this form
 * legal". It builds the candidate space as the PRODUCT of the declared
 * projection choices — coordinate space x the channel each task-bearing
 * variable is assigned to — and then filters that product by channel capacity
 * and by the invariants the declared task must preserve. Anything a human would
 * call a chart is downstream of that filter and is never an input to it
 * (invariant 1: no form name below L4).
 *
 * The experiment runs against a basis whose stage-2 ratification is OPEN, and
 * that is a recorded sequencing decision, not an oversight: see the spec's
 * entry record. Nothing here ratifies a coordinate, and a successful result is
 * NOT retrospective proof that any coordinate in the representation is
 * necessary.
 *
 * A program is a POINT in the product space, so it is a claim-bearing object in
 * its own right. The claims it actually induces are DERIVED from its
 * assignments, baseline and structure by `inducedClaims`; the `claims` field is
 * only what an author says about it. Two observers below read those two things
 * apart, because an observer that reads the declaration is the false pass this
 * experiment exists to rule out.
 */
import fs from "node:fs";
import path from "node:path";
import { RelationalStructure as RelationalStructureSchema } from "./relation-model.js";
import type { AggregateOp, FieldDecl, RelationDecl, RelationalStructure, Transformation } from "./relation-model.js";
import { CONTRACTS_DIR, loadOracle } from "./necessity.js";

/* ------------------------------------------------------------------ types */

export type CoordinateSpace =
  | "cartesian"
  | "polar"
  | "tabular"
  | "lane"
  | "geographic"
  | "containment"
  | "non-metric";

export type Channel =
  | "position"
  | "length"
  | "area"
  | "angle"
  | "hue"
  | "luminance"
  | "shape"
  | "texture"
  | "connection"
  | "containment"
  | "order"
  | "text";

export type Task =
  | "magnitude-comparison"
  | "composition"
  | "distribution"
  | "change-over-time"
  | "correlation"
  | "ranking"
  | "topology"
  | "flow"
  | "lookup-rollup"
  | "trend";

/** The invariant a projection serving the task must preserve. */
export type Claim =
  | "ratio-comparability"
  | "difference-comparability"
  | "value-recoverable"
  | "partition-membership"
  | "aggregate-magnitude";

export type BaselineDecl = "zero" | "truncated";

/**
 * The analytical operation a projection DISPLAYS, carried as a bound object.
 *
 * A topology alone does not say which analysis it shows. The same coordinate and
 * channel assignment can display a sum taken over one dimension, a sum taken
 * over another, or the raw observations; those are different analytical claims
 * with the same picture. Binding the operation is what lets a consumer recover
 * the displayed values and an observer check them, instead of a later consumer
 * choosing the analysis or a claim label standing in for it.
 */
export type BoundOperation = {
  relation: string;
  field: string;
  op: AggregateOp;
  /** The dimensions the aggregate is taken OVER. */
  along: string[];
  /** The grain of the RESULT: the declared grain minus `along`. */
  resultGrain: string[];
};

/** A supplied row of the population a consumer is exercised over. */
export type Row = Record<string, number | string>;

export type GroupValue = { key: string; value: number };
export type OperationResult = { grain: string[]; groups: GroupValue[]; total: number };

/** The admitted assertion, carried into the projection boundary. */
export type AggregateAssertionDecl = { relation: string; field: string; op: AggregateOp; along?: readonly string[] };

export function bindOperation(structure: RelationalStructure, assertion: AggregateAssertionDecl): BoundOperation {
  const rel = structure.relations[assertion.relation];
  if (!rel) throw new Error(`the bound operation names relation ${assertion.relation}, which the structure does not declare`);
  const grain = Array.isArray(rel.grain) ? [...rel.grain] : [];
  if (grain.length === 0) throw new Error("the bound operation needs a declared grain: without it the result grain is not established");
  const along = [...(assertion.along ?? [])].sort();
  const resultGrain = grain.filter((g) => !along.includes(g)).sort();
  if (resultGrain.length === 0) throw new Error("the operation sums over every grain column, so it has no result grain to display");
  return { relation: assertion.relation, field: assertion.field, op: assertion.op, along, resultGrain };
}

/**
 * Whether an operation is one this experiment can carry, judged against the
 * relation the operation NAMES — the name included, because an operation for a
 * different relation is not the admitted one however well its grain equation
 * happens to fit.
 *
 * Three-valued, because the doctrine's grain rule is: an UNKNOWN grain is a
 * value and makes grain-dependent judgments unproven, it does not block. A
 * declaration that contradicts the operation is refused; a premise that is
 * missing is carried.
 */
export type OperationAdmission =
  | { kind: "admitted"; facts: ResultFacts }
  | { kind: "unproven"; obligation: string; reason: string };

export function admitOperation(structure: RelationalStructure, op: BoundOperation): OperationAdmission {
  const refuse = (reason: string): never => {
    throw new Error(`the admitted operation is refused: ${reason}`);
  };
  if (op.op !== "sum") refuse(`the executable contract is sum, and this operation names ${op.op}`);
  const rel = structure.relations[op.relation];
  if (!rel) refuse(`the operation names relation ${op.relation}, which the structure does not declare`);
  if (!Array.isArray(rel.grain)) {
    return { kind: "unproven", obligation: "grain:declared", reason: `${op.relation} declares no grain, so the result grain is not established` };
  }
  const grain = [...rel.grain];
  if (grain.length === 0) return { kind: "unproven", obligation: "grain:declared", reason: `${op.relation} declares an empty grain` };
  const field = rel.fields?.[op.field];
  if (!field) refuse(`the operation aggregates ${op.relation}.${op.field}, which the relation does not declare`);
  const stray = op.along.filter((a) => !grain.includes(a));
  if (stray.length > 0) refuse(`the operation sums over ${stray.join(", ")}, which the declared grain does not contain`);
  const expected = grain.filter((g) => !op.along.includes(g)).sort();
  if (JSON.stringify(expected) !== JSON.stringify([...op.resultGrain].sort())) {
    refuse(`the result grain [${op.resultGrain.join(", ")}] is not the declared grain minus the summed-over dimensions [${expected.join(", ")}]`);
  }
  if (op.resultGrain.length === 0) refuse("the operation has no result grain to display");
  if (op.resultGrain.length !== 1) refuse(`the bounded experiment projects a single result-grain column, and this operation produces ${op.resultGrain.length}`);
  const groupField = rel.fields?.[op.resultGrain[0]];
  if (!groupField) refuse(`the result grain names ${op.resultGrain[0]}, which ${op.relation} does not declare as a field`);
  return { kind: "admitted", facts: resultFactsOf(op, rel, field, groupField) };
}

/** The result of an admitted operation, as facts the projection filters on. */
function resultFactsOf(op: BoundOperation, rel: RelationDecl, field: FieldDecl, groupField: FieldDecl): ResultFacts {
  return {
    sourceRelation: op.relation,
    sourceGrain: rel.grain,
    resultGrain: [...op.resultGrain],
    // The projection assigns the RESULT's own columns, never a source column the
    // operation aggregated away.
    dimension: { field: op.resultGrain[0], transformation: groupField.transformation, key: groupField.key === true, cyclic: groupField.cyclic === true },
    measure: {
      field: resultFieldName(op),
      transformation: field.transformation,
      additivityKind: field.additivity?.kind,
      nonAdditiveAlong: field.additivity?.kind === "semi-additive" ? field.additivity.nonAdditiveAlong : [],
      cyclic: field.cyclic === true,
    },
  };
}

/** The name the aggregate result carries, since it is not a declared column. */
export const resultFieldName = (op: BoundOperation): string => `${op.op}(${op.field})`;

/** Structural identity of two bindings. A binding is a claim, so it compares by value. */
export function matchesAdmitted(program: BoundOperation, admitted: BoundOperation): boolean {
  const same = (a: readonly string[], b: readonly string[]) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  return (
    program.relation === admitted.relation &&
    program.field === admitted.field &&
    program.op === admitted.op &&
    same(program.along, admitted.along) &&
    same(program.resultGrain, admitted.resultGrain)
  );
}

/**
 * The operation evaluated over a supplied population. This is the INDEPENDENT
 * side of every consumer check: expected values come from here, never from the
 * classification function that decides whether a candidate is admitted.
 */
export function evaluateOperation(op: BoundOperation, rows: readonly Row[]): OperationResult {
  // The executable contract is NARROWED, not quietly widened: an aggregate this
  // evaluator cannot perform is refused. Reading `op` for grouping while
  // ignoring `op.op` would execute every named aggregate as a sum.
  if (op.op !== "sum") throw new Error(`the bounded evaluator performs sum, and this operation names ${op.op}`);
  const sums = new Map<string, number>();
  for (const row of rows) {
    const key = op.resultGrain.map((g) => String(row[g] ?? "")).join("|");
    const v = row[op.field];
    if (typeof v !== "number") throw new Error(`a supplied row does not carry a numeric ${op.field}`);
    sums.set(key, (sums.get(key) ?? 0) + v);
  }
  const groups = [...sums.entries()].map(([key, value]) => ({ key, value })).sort((x, y) => x.key.localeCompare(y.key));
  return { grain: op.resultGrain, groups, total: groups.reduce((n, g) => n + g.value, 0) };
}

/** A program is a point in the projection product space. */
export type Program = {
  coordinate: CoordinateSpace;
  dimension: Channel;
  measure: Channel;
  baseline: BaselineDecl;
  task: Task;
  /** What the author SAYS it preserves. Never the thing the observer reads. */
  claims: Claim[];
  /** The admitted operation this program displays. A program without one is not retained. */
  operation: BoundOperation;
};

export type Refusal = { program: Program; cause: string; detail: string };
export type Undecided = { program: Program; obligation: string; detail: string };

export type Enumeration = {
  /**
   * How the product was disposed of, so a closure statement names its
   * POST-EXCLUSION population rather than implying every triple was judged:
   * `considered` is every coordinate/channel/channel triple the inventory can
   * host, `excluded` are the ones a channel has no slot for at all, and
   * `disposed` is considered minus excluded - the set the three arrays below
   * partition.
   */
  population: { considered: number; excluded: number; disposed: number };
  retained: Program[];
  refused: Refusal[];
  undecided: Undecided[];
};

export type TargetInventory = {
  id: string;
  channels: readonly Channel[];
  spaces: readonly CoordinateSpace[];
};

/**
 * The facts the projection rules are allowed to read, derived from the ADMITTED
 * operation and the relation it names. `dimension` and `measure` are columns of
 * the RESULT: the group key the operation produced and the aggregate itself.
 * Reading source columns here would let the projection assign a field the
 * operation already aggregated away.
 */
export type ResultFacts = {
  sourceRelation: string;
  sourceGrain: unknown;
  resultGrain: string[];
  dimension: { field: string; transformation: Transformation; key: boolean; cyclic: boolean };
  measure: {
    field: string;
    transformation: Transformation;
    additivityKind?: string;
    nonAdditiveAlong: string[];
    cyclic: boolean;
  };
};

/* --------------------------------------------------- capacities and tasks */

type Capacity = {
  /** Transformations the channel may carry at all. */
  carries: readonly Transformation[];
  /** Angle is licensed only by a cyclic scale or a declared whole. */
  requiresCyclicOrWhole?: boolean;
  /** Position and length make a ratio claim only over a declared zero baseline. */
  zeroBaselineForRatio?: boolean;
  /** A channel that keeps the value readable makes no positional claim. */
  valueReadback?: boolean;
  /** Coordinate spaces that can host the channel. */
  spaces: readonly CoordinateSpace[];
};

/**
 * Channel capacities as TYPE RULES, distinct from perceptual effectiveness
 * ranking: "hue cannot carry order" is a licensing fact, "position is read more
 * accurately than area" is a preference. Only the first is enforced here.
 */
export const CAPACITY: Record<Channel, Capacity> = {
  position: { carries: ["nominal", "ordinal", "interval", "ratio"], zeroBaselineForRatio: true, spaces: ["cartesian", "polar", "lane", "geographic"] },
  length: { carries: ["ratio"], zeroBaselineForRatio: true, spaces: ["cartesian", "polar", "lane"] },
  area: { carries: ["ratio"], spaces: ["cartesian", "geographic"] },
  angle: { carries: ["ordinal", "interval", "ratio"], requiresCyclicOrWhole: true, spaces: ["polar"] },
  hue: { carries: ["nominal"], spaces: ["cartesian", "polar", "tabular", "lane", "geographic", "non-metric"] },
  luminance: { carries: ["ordinal", "ratio"], spaces: ["tabular", "cartesian", "geographic"] },
  shape: { carries: ["nominal"], spaces: ["cartesian", "polar", "non-metric"] },
  texture: { carries: ["nominal"], spaces: ["cartesian", "polar", "tabular", "non-metric"] },
  connection: { carries: ["nominal"], spaces: ["non-metric", "cartesian"] },
  containment: { carries: ["nominal", "ordinal"], spaces: ["containment"] },
  order: { carries: ["ordinal"], spaces: ["tabular", "lane"] },
  text: { carries: ["nominal", "ordinal", "interval", "ratio"], valueReadback: true, spaces: ["tabular", "cartesian", "lane", "containment"] },
};

/**
 * The invariants each task must preserve, from the doctrine's task table. The
 * eight entries this experiment does not implement are marked rather than
 * silently absent, so their absence is a recorded obligation and not a gap
 * that reads as "no preconditions".
 */
export const TASK_INVARIANTS: Record<Task, { requires: Claim[] } | { notEnumerated: string }> = {
  "magnitude-comparison": { requires: ["ratio-comparability"] },
  composition: { requires: ["partition-membership", "aggregate-magnitude"] },
  distribution: { notEnumerated: "invariant:declared-closure" },
  "change-over-time": { notEnumerated: "invariant:interpolation-policy" },
  correlation: { notEnumerated: "invariant:position-non-meaningful" },
  ranking: { notEnumerated: "invariant:shared-ordering" },
  topology: { notEnumerated: "invariant:position-non-meaningful" },
  flow: { notEnumerated: "invariant:conservation" },
  "lookup-rollup": { notEnumerated: "invariant:structure-preserved" },
  trend: { notEnumerated: "invariant:position-non-meaningful" },
};

/* ------------------------------------------------------------------ facts */

/* ------------------------------------------------------- induced claims */

/**
 * The claims a program ACTUALLY makes, read off its own structure rather than
 * off what its author says. This is the function the strong observer uses, and
 * the reason a mutation to a claim-bearing choice is detectable even when the
 * declared explanation is left untouched.
 */
export function inducedClaims(p: Program, facts: ResultFacts): Claim[] {
  const out = new Set<Claim>();
  const cap = CAPACITY[p.measure];
  const t = facts.measure.transformation;

  if (cap.valueReadback) {
    // The value itself is recoverable, so no positional magnitude is claimed...
    out.add("value-recoverable");
    // ...and a readable RATIO value supports an exact comparison. This is the
    // doctrine's lore-oracle argument, and it is why the tabular projection is a
    // PEER of the visual one rather than a degraded one. Nothing here is
    // ratio-comparable without the scale that makes a ratio a ratio.
    if (t === "ratio") out.add("ratio-comparability");
  } else if (p.measure === "length" || p.measure === "position") {
    out.add("aggregate-magnitude");
    if (t === "ratio") out.add(p.baseline === "zero" ? "ratio-comparability" : "difference-comparability");
    else if (t === "interval") out.add("difference-comparability");
    // An ordinal measure on a metric channel induces neither: differences of an
    // ordinal are as meaningless as its mean, so nothing comparable is claimed.
  } else if (p.measure === "area") {
    out.add("aggregate-magnitude");
    if (t === "ratio") out.add("ratio-comparability");
  } else if (p.measure === "luminance" || p.measure === "angle") {
    out.add("aggregate-magnitude");
    if (t === "interval" || t === "ratio") out.add("difference-comparability");
  }

  // The dimension carries the identity of each case the measure is read against.
  out.add("partition-membership");
  return [...out].sort();
}

/* ------------------------------------------------------------ enumeration */

export type EnumerationInput = {
  /**
   * The structure the operation is asserted of. The enumerator derives the facts
   * it filters on from THIS and the admitted operation, so a caller cannot pair
   * an operation with unrelated facts describing another relation or a field the
   * operation already aggregated away.
   */
  structure: RelationalStructure;
  /** The admitted operation. It is validated against `structure` before any candidate exists. */
  admitted: BoundOperation;
  task: Task;
  inventory: TargetInventory;
  /**
   * Which RESULT-grain column the composition invariant partitions over.
   * OMITTING IT IS A MISSING PREMISE, not a default: an absent partition leaves
   * the candidates undecided rather than taking the branch a favorable
   * completion would have taken.
   */
  partitionDimension?: string;
};

/**
 * A capacity failure is one of two different things, and they are not
 * interchangeable. Where the doctrine NAMES the illegality - an interval on
 * area, order on hue, a sequential ramp on a nominal scale, angle off a
 * non-cyclic field - the candidate is REFUSED under that catalogue cause.
 * Where the channel simply has no slot for the scale, the triple is not a
 * candidate in this space at all and is EXCLUDED: reporting a cause for it
 * would invent an illegality the corpus does not name.
 */
type CapacityVerdict = { cause: string; detail: string } | "excluded" | undefined;

const capacityVerdict = (channel: Channel, t: Transformation, facts: ResultFacts, role: "dimension" | "measure"): CapacityVerdict => {
  if (channel === "area" && t !== "ratio") return { cause: "REL_AREA_INTERVAL_SCALE", detail: `area carries ratio only, and this field is ${t}` };
  if (channel === "hue" && t !== "nominal") return { cause: "REL_HUE_CARRIES_ORDER", detail: `hue is nominal-capacity, and this field is ${t}` };
  if (channel === "luminance" && t === "nominal") return { cause: "REL_SEQUENTIAL_ON_NOMINAL", detail: "a sequential ramp implies an order the nominal scale does not have" };
  if (channel === "angle") {
    const licensed = role === "measure" ? facts.measure.cyclic : facts.dimension.cyclic;
    if (!CAPACITY.angle.carries.includes(t)) return "excluded";
    if (!licensed) return { cause: "REL_CYCLIC_ANGLE_NONCYCLIC", detail: "angle is licensed by a cyclic scale or a declared whole, and this field is neither" };
    return undefined;
  }
  if (!CAPACITY[channel].carries.includes(t)) return "excluded";
  return undefined;
};

/**
 * The product space, filtered. Every (coordinate, dimension channel, measure
 * channel) triple the target inventory can host is a candidate; a candidate is
 * RETAINED when every precondition for the declared task is discharged from the
 * basis, REFUSED with a catalogue cause when one is violated, and UNDECIDED
 * with an obligation when a premise the candidate needs is not established.
 */
export function enumerate(input: EnumerationInput): Enumeration {
  const { task, inventory } = input;
  // Throws when the operation contradicts the relation, so a mismatched or
  // absent operation cannot enter through unrelated facts; returns `unproven`
  // when the premise is merely missing.
  const admission = admitOperation(input.structure, input.admitted);
  const spec = TASK_INVARIANTS[task];
  const retained: Program[] = [];
  const refused: Refusal[] = [];
  const undecided: Undecided[] = [];
  let considered = 0;
  let excluded = 0;

  for (const coordinate of inventory.spaces) {
    for (const dimensionChannel of inventory.channels) {
      for (const measureChannel of inventory.channels) {
        if (!CAPACITY[dimensionChannel].spaces.includes(coordinate)) continue;
        if (!CAPACITY[measureChannel].spaces.includes(coordinate)) continue;
        if (dimensionChannel === measureChannel) continue;
        considered += 1;
        // Stamped from the ADMITTED operation: a candidate cannot carry a
        // different one, so the identity guarantee is a construction property
        // rather than a per-candidate check that could be bypassed.
        const p: Program = { coordinate, dimension: dimensionChannel, measure: measureChannel, baseline: "zero", task, claims: [], operation: input.admitted };

        if ("notEnumerated" in spec) {
          continue; // the task's preconditions are not implemented here; see TASK_INVARIANTS
        }

        // A missing premise is CARRIED, never resolved to a favorable branch.
        if (admission.kind === "unproven") {
          undecided.push({ program: p, obligation: admission.obligation, detail: `${admission.reason}, so the grain of the result it displays is not established` });
          continue;
        }
        const facts = admission.facts;

        const dimVerdict = capacityVerdict(dimensionChannel, facts.dimension.transformation, facts, "dimension");
        if (dimVerdict === "excluded") { excluded += 1; continue; }
        if (dimVerdict) {
          refused.push({ program: p, cause: dimVerdict.cause, detail: dimVerdict.detail });
          continue;
        }
        if (facts.dimension.key && dimensionChannel !== "position") {
          refused.push({ program: p, cause: "REL_KEY_ENCODED_TO_CHANNEL", detail: "a key may never be encoded to a non-positional channel" });
          continue;
        }
        const measVerdict = capacityVerdict(measureChannel, facts.measure.transformation, facts, "measure");
        if (measVerdict === "excluded") { excluded += 1; continue; }
        if (measVerdict) {
          refused.push({ program: p, cause: measVerdict.cause, detail: measVerdict.detail });
          continue;
        }

        // THE BINDING IS A PREMISE. A program that does not carry the admitted
        // operation does not say which analysis it displays, so it is not
        // retained: the result grain it would show is unestablished, and
        // `grain:declared` is the corpus's own obligation for exactly that.
        // Composition requires additivity over the partition dimension, and the
        // partition is a DECISION-RELEVANT input. An omitted one is a missing
        // premise and is carried, never resolved by the branch a favorable
        // completion would have taken; a contradiction that IS established is
        // refused under the corpus's own cause.
        if (task === "composition") {
          const kind = facts.measure.additivityKind;
          if (!input.partitionDimension) {
            undecided.push({
              program: p,
              obligation: "invariant:exhaustive",
              detail: "the composition declares no partition dimension, so which partition its parts must exhaust is not established",
            });
            continue;
          }
          if (kind === "non-additive") {
            refused.push({
              program: p,
              cause: "REL_ADDITIVITY_SUM_SEMIADDITIVE",
              detail: "the measure is declared non-additive, so no partition of it is summable",
            });
            continue;
          }
          if (kind === "ratio-measure") {
            refused.push({
              program: p,
              cause: "REL_RATIO_MEASURE_AVERAGED",
              detail: `a rate must re-derive from its numerator and denominator at ${input.partitionDimension}, and a composition of it averages instead`,
            });
            continue;
          }
          if (kind === "semi-additive" && facts.measure.nonAdditiveAlong.includes(input.partitionDimension)) {
            refused.push({
              program: p,
              cause: "REL_ADDITIVITY_SUM_SEMIADDITIVE",
              detail: `the measure is declared non-additive along ${input.partitionDimension}, and a composition partitions over it`,
            });
            continue;
          }
        }

        const induced = inducedClaims(candidate(p, p.baseline), facts);
        if (!spec.requires.every((c) => induced.includes(c))) {
          refused.push({
            program: p,
            cause: "REL_BASELINE_RATIO_CLAIM",
            detail: `the declared task requires ${spec.requires.join(", ")} and this program induces ${induced.join(", ") || "nothing"}`,
          });
          continue;
        }

        // A candidate whose induced claims assert an aggregate magnitude needs
        // the grain to be declared; without it the aggregate is undecided.
        retained.push(p);
      }
    }
  }
  return {
    population: { considered, excluded, disposed: considered - excluded },
    retained: sortPrograms(retained),
    refused: sortRefusals(refused),
    undecided: sortUndecided(undecided),
  };
}

const candidate = (p: Program, baseline: BaselineDecl): Program => ({ ...p, baseline });
const keyOf = (p: Program) => `${p.coordinate}|${p.dimension}|${p.measure}|${p.baseline}|${p.task}`;
const sortPrograms = (xs: Program[]) => [...xs].sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
const sortRefusals = (xs: Refusal[]) => [...xs].sort((a, b) => (keyOf(a.program) + a.cause).localeCompare(keyOf(b.program) + b.cause));
const sortUndecided = (xs: Undecided[]) => [...xs].sort((a, b) => (keyOf(a.program) + a.obligation).localeCompare(keyOf(b.program) + b.obligation));

/* ------------------------------------------------------------- observers */

/**
 * Reads what the program SAYS about itself. This is the observer the experiment
 * must not accept: it reports success from the certificate rather than from the
 * thing certified.
 */
export function declarationObserver(p: Program): { ok: boolean; read: Claim[] } {
  const spec = TASK_INVARIANTS[p.task];
  if ("notEnumerated" in spec) return { ok: false, read: p.claims };
  return { ok: spec.requires.every((c) => p.claims.includes(c)), read: [...p.claims].sort() };
}

/** Derives the claims from the program's own choices and checks those. */
export function programObserver(p: Program, facts: ResultFacts): { ok: boolean; induced: Claim[]; missing: Claim[] } {
  const spec = TASK_INVARIANTS[p.task];
  if ("notEnumerated" in spec) return { ok: false, induced: [], missing: [] };
  const induced = inducedClaims(p, facts);
  return { ok: spec.requires.every((c) => induced.includes(c)), induced, missing: spec.requires.filter((c) => !induced.includes(c)) };
}

/* --------------------------------------------------------- representations */

/**
 * TWO PRODUCED REPRESENTATIONS of one evaluated result, and a decoder for each.
 *
 * The boundary that matters: a decoder receives ONLY the representation it
 * decodes. It is given neither the supplied rows nor `evaluateOperation`, so it
 * cannot reconstruct the expected answer instead of observing what the
 * projection produced. A second evaluation of the same operation is not
 * evidence that a distinct representation preserved it.
 */
export type ReadbackOutput = { kind: "readback"; entries: GroupValue[] };
export type MetricOutput = {
  kind: "metric";
  scale: { unitsPerValue: number; baseline: BaselineDecl };
  entries: Array<{ key: string; extent: number }>;
};
export type ProjectionOutputs = { readback: ReadbackOutput; metric: MetricOutput };

/** Produces both representations from ONE evaluated result. */
export function produce(result: OperationResult, unitsPerValue: number, baseline: BaselineDecl = "zero"): ProjectionOutputs {
  if (!(unitsPerValue > 0)) throw new Error(`a metric representation needs a positive declared scale, and this one is ${unitsPerValue}`);
  return {
    readback: { kind: "readback", entries: result.groups.map((g) => ({ key: g.key, value: g.value })) },
    metric: {
      kind: "metric",
      scale: { unitsPerValue, baseline },
      entries: result.groups.map((g) => ({ key: g.key, extent: g.value * unitsPerValue })),
    },
  };
}

/** Recovers group/values from the READBACK output ALONE. */
export function decodeReadback(o: ReadbackOutput): GroupValue[] {
  return o.entries.map((e) => ({ key: e.key, value: e.value }));
}

/** Recovers group/values from the METRIC output and its DECLARED SCALE alone. */
export function decodeMetric(o: MetricOutput): GroupValue[] {
  return o.entries.map((e) => ({ key: e.key, value: e.extent / o.scale.unitsPerValue }));
}

/** Dispatch by representation kind. Takes the output and nothing else. */
export function recover(o: ReadbackOutput | MetricOutput): GroupValue[] {
  return o.kind === "readback" ? decodeReadback(o) : decodeMetric(o);
}

const totalOf = (gs: readonly GroupValue[]) => gs.reduce((n, g) => n + g.value, 0);
/** Moves every value under the NEXT group's key, so the total is unchanged. */
const shiftKeys = (entries: GroupValue[]): GroupValue[] =>
  entries.length < 2 ? entries : entries.map((e, i) => ({ key: entries[(i + 1) % entries.length].key, value: e.value }));

export type PreservationReport = {
  result: GroupValue[];
  readback: { recovered: GroupValue[]; preserved: boolean };
  metric: { recovered: GroupValue[]; preserved: boolean; scale: MetricOutput["scale"] };
  mutatedExtent: { recovered: GroupValue[]; preserved: boolean };
  mutatedBinding: { recovered: GroupValue[]; preserved: boolean; totalUnchanged: boolean };
};

/**
 * Evaluates the admitted operation ONCE, produces both representations from that
 * one result, and recovers through the decoders. The mutations then move the
 * REPRESENTATION, not the operation: one extent changes, and one set of group
 * bindings moves while the numeric total is held fixed.
 */
export function preservationReport(admitted: BoundOperation, rows: readonly Row[], unitsPerValue = 2): PreservationReport {
  const result = evaluateOperation(admitted, rows).groups;
  const outputs = produce(evaluateOperation(admitted, rows), unitsPerValue);

  const bumped: MetricOutput = { ...outputs.metric, entries: outputs.metric.entries.map((e, i) => (i === 0 ? { ...e, extent: e.extent + 1 } : e)) };
  const shifted: ReadbackOutput = { ...outputs.readback, entries: shiftKeys(outputs.readback.entries) };
  const bumpedValues = recover(bumped);
  const shiftedValues = recover(shifted);

  return {
    result,
    readback: { recovered: recover(outputs.readback), preserved: sameGroups(recover(outputs.readback), result) },
    metric: { recovered: recover(outputs.metric), preserved: sameGroups(recover(outputs.metric), result), scale: outputs.metric.scale },
    mutatedExtent: { recovered: bumpedValues, preserved: sameGroups(bumpedValues, result) },
    mutatedBinding: { recovered: shiftedValues, preserved: sameGroups(shiftedValues, result), totalUnchanged: totalOf(shiftedValues) === totalOf(result) },
  };
}

/* -------------------------------------------------------------- consumers */

/**
 * A consumer recovers the bound operation's values through ONE topology. Its
 * expected side is `evaluateOperation` over the supplied population; its
 * recovered side comes from the program. A consumer that agreed with a
 * classification function about a label would have demonstrated nothing, so the
 * comparison here is over VALUES.
 */
export type ConsumerReport = {
  channel: Channel;
  ok: boolean;
  /** What the consumer recovered through this topology. */
  recovered: GroupValue[];
  /** What the admitted operation evaluates to, independently of the topology. */
  expected: GroupValue[];
  reason?: string;
};

const sameGroups = (a: readonly GroupValue[], b: readonly GroupValue[]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The readback consumer: every group's key and its exact value, readable.
 * It declines a topology that is not a readback channel, and it refuses a
 * program whose binding does not match the admitted operation BEFORE evaluating
 * it, so a coinciding-values mutation is caught structurally as well.
 */
export function readbackConsumer(program: Program, admitted: BoundOperation, rows: readonly Row[]): ConsumerReport {
  const expected = evaluateOperation(admitted, rows).groups;
  if (!matchesAdmitted(program.operation, admitted)) {
    return { channel: "text", ok: false, recovered: evaluateOperation(program.operation, rows).groups, expected, reason: "binding-mismatch" };
  }
  if (!CAPACITY[program.measure].valueReadback) return { channel: "text", ok: false, recovered: [], expected, reason: "not-a-readback-channel" };
  const recovered = evaluateOperation(program.operation, rows).groups;
  return { channel: "text", ok: sameGroups(recovered, expected), recovered, expected, ...(sameGroups(recovered, expected) ? {} : { reason: "value-disagreement" }) };
}

/**
 * The metric consumer: the same groups as magnitudes on a length channel over a
 * declared zero baseline. It declines a topology that makes no positional
 * magnitude claim, so the two consumers are structurally different rather than
 * two spellings of one.
 */
export function metricConsumer(program: Program, admitted: BoundOperation, rows: readonly Row[]): ConsumerReport {
  const expected = evaluateOperation(admitted, rows).groups;
  if (!matchesAdmitted(program.operation, admitted)) {
    return { channel: program.measure, ok: false, recovered: evaluateOperation(program.operation, rows).groups, expected, reason: "binding-mismatch" };
  }
  if (CAPACITY[program.measure].valueReadback) return { channel: program.measure, ok: false, recovered: [], expected, reason: "not-a-metric-channel" };
  if (program.baseline !== "zero") return { channel: program.measure, ok: false, recovered: [], expected, reason: "no-declared-zero-baseline" };
  const recovered = evaluateOperation(program.operation, rows).groups;
  return { channel: program.measure, ok: sameGroups(recovered, expected), recovered, expected, ...(sameGroups(recovered, expected) ? {} : { reason: "value-disagreement" }) };
}

/**
 * The observer, extended from the program to its BINDING: it derives which
 * consumer the topology licenses, runs it, and requires the values it recovered
 * to equal the admitted operation's own evaluation. It never reads `claims`.
 */
export function bindingObserver(
  program: Program,
  admitted: BoundOperation,
  rows: readonly Row[],
): { ok: boolean; channel: Channel | "none"; recovered: GroupValue[]; expected: GroupValue[]; reason?: string } {
  const report = CAPACITY[program.measure].valueReadback ? readbackConsumer(program, admitted, rows) : metricConsumer(program, admitted, rows);
  const channel = report.channel;
  if (!report.ok) return { ok: false, channel, recovered: report.recovered, expected: report.expected, reason: report.reason };
  return { ok: true, channel, recovered: report.recovered, expected: report.expected };
}

/** The declared metric scale: two extent units per unit of value. */
export const METRIC_UNITS_PER_VALUE = 2;

/** The supplied population the consumers are exercised over. */
export const CONSUMER_POPULATION: readonly Row[] = [
  { product: "A", date: "day1", on_hand: 10, reserved: 1 },
  { product: "B", date: "day1", on_hand: 20, reserved: 2 },
  { product: "A", date: "day2", on_hand: 100, reserved: 3 },
  { product: "B", date: "day2", on_hand: 5, reserved: 4 },
];

/* ------------------------------------------------ precommitted predictions */

/**
 * Recorded BEFORE the enumerator was run over the frozen basis, as the doctrine
 * requires: the anti-lookup falsifier precommits SET DELTAS, not directions.
 * The run below reports the ACTUAL delta beside each of these.
 *
 * PROCEDURAL NON-CLAIM (the holdout carries the same one): that these lines were
 * written first is a property of how they were authored, and a later reader
 * cannot prove it from these bytes. What the repository can check is that the
 * reported delta equals the recorded expectation.
 */
export const PRECOMMITTED = {
  "ratio->ordinal": {
    mustRemove: "every retained program whose measure assignment requires ratio capacity",
    mustPreserve: "the nominal/ordinal-compatible alternatives, namely the value-readback programs",
  },
  "declared->unknown": {
    mustRemove: "every program whose admissibility inspects grain",
    mustPreserve: "every program whose admissibility does not inspect grain",
    mustCarry: "grain:declared as an obligation",
  },
  "non-cyclic->cyclic": {
    mustAdd: "at least one cyclic-capable assignment if the target inventory provides one",
    mustNotRemove: "unrelated cartesian/tabular lawful assignments",
  },
  "irrelevant-perturbation": {
    mustEqual: "the normalized retained set, byte-identical after a declared field no candidate assigns and no task reads is added",
  },
} as const;

export type ControlReport = {
  control: string;
  expected: string;
  actual: string;
  /** The general requirement the control states, which may hold vacuously. */
  requirementMet: boolean;
  /**
   * A CONCRETE prediction the precommit made that this run REFUTED. Refuted is
   * not vacuous: the general requirement can have an empty applicable set while
   * the named members of that set were wrong, and collapsing the two would
   * discard what the run taught.
   */
  predictionRefuted: boolean;
  /** What the run taught where a prediction was refuted. */
  correction?: string;
  ok: boolean;
};

/* ------------------------------------------------------------ the object */

/** The frozen basis named in the entry record. */
export const BASIS_FIXTURE = "FX_N_STOCK_SUM_ALONG_PRODUCT";
export const BASIS = {
  relation: "stock",
  /** The field the admitted operation aggregates. */
  measure: "on_hand",
  /** The result-grain column the operation produces and the projection assigns. */
  resultGrain: "date",
  /** The column the operation sums OVER. */
  summedOver: "product",
} as const;

/** The target the experiment enumerates against. */
export const EXPERIMENT_TARGET: TargetInventory = {
  id: "svg-dom",
  channels: ["position", "length", "area", "angle", "hue", "luminance", "shape", "texture", "connection", "containment", "order", "text"],
  spaces: ["cartesian", "polar", "tabular", "lane", "geographic", "containment", "non-metric"],
};

export type ExperimentResult = {
  basis: string;
  /** The admitted operation every retained program displays. */
  binding: BoundOperation;
  /** What the product space did, so a closure names its post-exclusion set. */
  population: { considered: number; excluded: number; disposed: number };
  consumers: {
    readback: ConsumerReport;
    metric: ConsumerReport;
    /** The same population under the aggregation direction the declaration forbids. */
    forbiddenDirection: { operation: BoundOperation; result: OperationResult; readbackRejects: boolean };
  };
  bindingMutation: { mutated: BoundOperation; readback: ConsumerReport; rejectedBeforeConsumption: boolean; valueDisagreement: boolean };
  /** Recovery observed from the PRODUCED representations, with two output mutations. */
  preservation: PreservationReport;
  /** The facts the enumerator filtered on, derived from the operation and the relation it names. */
  resultFacts: ResultFacts;
  consumed: Record<string, unknown>;
  retained: Program[];
  refused: Refusal[];
  undecided: Undecided[];
  distinctAfterFixedAuthority: number;
  /** What the retained set SHARES, and what each member gives up to be lawful. */
  claims: {
    shared: Claim[];
    union: Claim[];
    perProgram: Array<{ program: string; induced: Claim[]; loss: Claim[] }>;
  };
  residue: { projectionLevel: string; realizationLevel: string };
  controls: ControlReport[];
  observer: { declared: boolean; derived: boolean; mutated: Program; inducedAfterMutation: Claim[] };
};

const withMeasure = (s: RelationalStructure, t: Transformation): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return {
    ...s,
    relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, [BASIS.measure]: { ...rel.fields[BASIS.measure], transformation: t } } } },
  };
};
/**
 * The cyclic control needs its two sides to differ in ONE fact. A cyclic field
 * decodes to ordinal + cyclic (stage-1.5), so a nominal field cannot simply
 * gain cyclicity without also changing transformation - and that second move
 * would remove every nominal-only channel for a reason that has nothing to do
 * with cyclicity. Both sides of this control therefore sit on the ORDINAL
 * dimension, and the only difference between them is the cyclic claim itself.
 */
const withDimensionOrdinal = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  const { cyclic: _drop, ...rest } = rel.fields[BASIS.resultGrain];
  return { ...s, relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, [BASIS.resultGrain]: { ...rest, transformation: "ordinal" } } } } };
};
const withCyclicDimension = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return { ...s, relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, [BASIS.resultGrain]: { ...rel.fields[BASIS.resultGrain], cyclic: true } } } } };
};

const withUnknownGrain = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return { ...s, relations: { ...s.relations, [BASIS.relation]: { ...rel, grain: "unknown" } } };
};

/**
 * An IRRELEVANT semantic perturbation: the relation gains a declared field that
 * no candidate assigns and no declared task reads. The normalized retained set
 * must not move. This is the control without which an implementation that hashes
 * its input into a different template set passes every relevant-perturbation
 * test.
 */
const withIrrelevantField = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return {
    ...s,
    relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, warehouse: { transformation: "nominal" as const } } } },
  };
};

const retainedKeys = (e: Enumeration) => e.retained.map(keyOf);
const legal = (s: RelationalStructure, what: string): RelationalStructure => {
  const r = RelationalStructureSchema.safeParse(s);
  if (!r.success) throw new Error(`perturbation ${what} is not a legal declaration: ${JSON.stringify(r.error.issues[0])}`);
  return s;
};

export function runExperiment(): ExperimentResult {
  const fixture = loadOracle().fixtures.get(BASIS_FIXTURE);
  if (!fixture) throw new Error(`basis fixture ${BASIS_FIXTURE} is not in the corpus`);
  const base = legal(fixture.structure as RelationalStructure, "basis");

  // The operation the entry record cited: the fixture's OWN admitted assertion,
  // bound once and carried through every candidate.
  const aggregate = fixture.assertions.find((a) => a.kind === "aggregate");
  if (!aggregate) throw new Error(`basis fixture ${BASIS_FIXTURE} carries no aggregate assertion to bind`);
  const admitted = bindOperation(base, aggregate as AggregateAssertionDecl);
  const admission = admitOperation(base, admitted);
  if (admission.kind !== "admitted") throw new Error(`the basis operation is not admitted: ${admission.reason}`);
  const facts = admission.facts;

  const run = (s: RelationalStructure, task: Task = "magnitude-comparison", partition?: string) =>
    enumerate({ structure: s, admitted, task, inventory: EXPERIMENT_TARGET, partitionDimension: partition });

  const baseline = run(base);
  const ordinal = run(legal(withMeasure(base, "ordinal"), "ratio->ordinal"));
  const unknownGrain = run(legal(withUnknownGrain(base), "declared->unknown"));
  const cyclicBaseline = run(legal(withDimensionOrdinal(base), "cyclic-control-baseline"));
  const cyclic = run(legal(withCyclicDimension(legal(withDimensionOrdinal(base), "cyclic-control-baseline")), "non-cyclic->cyclic"));
  const irrelevant = run(legal(withIrrelevantField(base), "irrelevant-field"));
  // A target whose inventory does not provide `hue`: a narrowing that is real
  // and target-specific, unlike a scale move on an interval dimension.
  const NARROWED_CHANNEL: Channel = "text";
  const narrowInventory: TargetInventory = { ...EXPERIMENT_TARGET, channels: EXPERIMENT_TARGET.channels.filter((c) => c !== NARROWED_CHANNEL) };
  const narrowedEnum = enumerate({ structure: base, admitted, task: "magnitude-comparison", inventory: narrowInventory, partitionDimension: BASIS.resultGrain });
  const narrowed = {
    removed: baseline.retained.filter((p) => !narrowedEnum.retained.some((q) => keyOf(q) === keyOf(p))),
    kept: narrowedEnum.retained,
  };

  const baseKeys = retainedKeys(baseline);
  const ordinalKeys = retainedKeys(ordinal);
  const removedByOrdinal = baseKeys.filter((k) => !ordinalKeys.includes(k));
  const keptByOrdinal = baseKeys.filter((k) => ordinalKeys.includes(k));
  // "Requires ratio capacity" means the program's TASK-BEARING CLAIM rests on
  // the measure's ratio scale - not that its measure channel is literally a
  // metric one. A readable value gets its ratio comparability from the scale
  // too, so it is removed for the same reason and by the same fact.
  const ratioDependent = removedByOrdinal.every((k) => {
    const p = baseline.retained.find((cand) => keyOf(cand) === k);
    return p !== undefined && inducedClaims(p, facts).includes("ratio-comparability");
  });

  const controls: ControlReport[] = [
    {
      control: "ratio->ordinal",
      expected: `${PRECOMMITTED["ratio->ordinal"].mustRemove}; preserve ${PRECOMMITTED["ratio->ordinal"].mustPreserve}`,
      actual:
        `removed ${removedByOrdinal.length} of ${baseKeys.length}, every removed program's task-bearing claim resting on the ratio scale: ${ratioDependent}; ` +
        `preserved ${keptByOrdinal.length}. MEASURED VACUITY: the preservation limb has no members for THIS task, because magnitude-comparison requires ratio ` +
        `comparability and every retained program derives it from the measure's scale. The narrowing is not blanket - see the targeted-narrowing control, ` +
        `which removes the nominal-only dimension channels and preserves the rest.`,
      requirementMet: removedByOrdinal.length === baseKeys.length && ratioDependent,
      predictionRefuted: true,
      correction:
        "The precommit named the value-readback programs as the alternatives a ratio->ordinal move must preserve. Ten existed and none survived: magnitude comparison requires ratio comparability, and a readable ordinal value does not supply it. The general same-task preservation requirement has an empty applicable set for this task; the CONCRETE prediction was wrong.",
      ok: false,
    },
    {
      control: "declared->unknown",
      expected: `${PRECOMMITTED["declared->unknown"].mustRemove}; ${PRECOMMITTED["declared->unknown"].mustPreserve}; carry ${PRECOMMITTED["declared->unknown"].mustCarry}`,
      actual: `retained ${retainedKeys(unknownGrain).length} of ${baseKeys.length}, undecided ${unknownGrain.undecided.length} of ${unknownGrain.population.considered} considered carrying ${[...new Set(unknownGrain.undecided.map((u) => u.obligation))].join(", ") || "nothing"} — with the operation bound, EVERY topology depends on the result grain, and because the facts that would decide a channel exclusion are the missing ones, the whole considered population is carried rather than excluded`,
      requirementMet:
        retainedKeys(unknownGrain).length < baseKeys.length &&
        unknownGrain.undecided.length > 0 &&
        unknownGrain.undecided.every((u) => u.obligation === "grain:declared"),
      predictionRefuted: true,
      correction:
        "The precommit treated the value-readback family as not inspecting grain, and that was true only of a program carrying no grain-bearing content. A BOUND program names a result grain, so an unknown grain leaves that grain unestablished in every topology: the removal is universal, not selective. This is a consequence of the missing binding the predecessor result was corrected for, and it is recorded as a refutation rather than absorbed.",
      ok: false,
    },
    {
      control: "non-cyclic->cyclic",
      expected: `${PRECOMMITTED["non-cyclic->cyclic"].mustAdd}; ${PRECOMMITTED["non-cyclic->cyclic"].mustNotRemove} (both sides sit on the ORDINAL dimension, so the cyclic claim is the only fact that differs)`,
      actual: `added ${retainedKeys(cyclic).filter((k) => !retainedKeys(cyclicBaseline).includes(k)).length} cyclic-capable assignment(s), removed ${retainedKeys(cyclicBaseline).filter((k) => !retainedKeys(cyclic).includes(k)).length}`,
      requirementMet:
        retainedKeys(cyclic).length > retainedKeys(cyclicBaseline).length &&
        retainedKeys(cyclicBaseline).every((k) => retainedKeys(cyclic).includes(k)) &&
        cyclic.retained.some((p) => p.dimension === "angle" || p.measure === "angle"),
      predictionRefuted: false,
      ok: true,
    },
    {
      control: "targeted-narrowing",
      expected:
        `a capability SOME candidates need and others do not must remove exactly those, so narrowing is targeted rather than blanket. The target's channel inventory is the doctrine's own mechanism for this, so the perturbation removes ${NARROWED_CHANNEL} from the inventory.`,
      actual: `inventory minus ${NARROWED_CHANNEL}: removed ${narrowed.removed.length}, preserved ${narrowed.kept.length}`,
      requirementMet: narrowed.removed.length > 0 && narrowed.kept.length > 0,
      predictionRefuted: false,
      ok:
        narrowed.removed.length > 0 &&
        narrowed.kept.length > 0 &&
        narrowed.removed.every((p) => p.dimension === NARROWED_CHANNEL || p.measure === NARROWED_CHANNEL) &&
        narrowed.kept.every((p) => p.dimension !== NARROWED_CHANNEL && p.measure !== NARROWED_CHANNEL),
      correction:
        "REPLACED, and the reason is recorded rather than hidden. This control used to perturb the DIMENSION's scale nominal->ordinal and call the result a narrowing. Under result facts the dimension is the result's own group column, whose scale is interval, and no scale in the lattice is narrower than interval for this purpose - so that perturbation narrows nothing and the control no longer measured what it claimed. Removing a CHANNEL from the target inventory is a narrowing that is both real and target-specific.",
    },
    {
      control: "irrelevant-perturbation",
      expected: PRECOMMITTED["irrelevant-perturbation"].mustEqual,
      actual: `${JSON.stringify(retainedKeys(irrelevant)) === JSON.stringify(baseKeys) ? "identical" : "MOVED"} (${baseKeys.length} programs)`,
      requirementMet: JSON.stringify(retainedKeys(irrelevant)) === JSON.stringify(baseKeys),
      predictionRefuted: false,
      ok: JSON.stringify(retainedKeys(irrelevant)) === JSON.stringify(baseKeys),
    },
  ];

  // The observer control: mutate one CLAIM-BEARING choice - the baseline - and
  // leave the declared explanation untouched. The declaration reader still
  // passes; the program reader must not.
  const lawful = baseline.retained.find((p) => p.measure === "length") ?? baseline.retained[0];
  const mutated: Program = { ...lawful, baseline: "truncated", claims: [...lawful.claims] };
  const observer = {
    declared: declarationObserver({ ...mutated, claims: ["ratio-comparability"] }).ok,
    derived: programObserver(mutated, facts).ok,
    mutated,
    inducedAfterMutation: inducedClaims(mutated, facts),
  };

  const distinct = new Set(baseKeys.map((k) => k.split("|").slice(0, 3).join("|"))).size;

  // Shared claims are the INTERSECTION over the retained set; a loss is a claim
  // another lawful program of the same authority carries and this one does not.
  const perProgramClaims = baseline.retained.map((p) => ({ program: keyOf(p), induced: inducedClaims(p, facts) }));
  const union = [...new Set(perProgramClaims.flatMap((c) => c.induced))].sort();
  const shared = union.filter((c) => perProgramClaims.every((x) => x.induced.includes(c)));

  // Two structurally different programs over the SAME bound operation: one
  // readback, one metric. Their expected side is the operation, not a label.
  const readbackProgram = baseline.retained.find((p) => CAPACITY[p.measure].valueReadback)!;
  const metricProgram = baseline.retained.find((p) => !CAPACITY[p.measure].valueReadback && p.baseline === "zero")!;
  const readback = readbackConsumer(readbackProgram, admitted, CONSUMER_POPULATION);
  const metric = metricConsumer(metricProgram, admitted, CONSUMER_POPULATION);

  // The direction the semi-additivity declaration forbids, over the same
  // population: the discriminator is the VALUES, not the topology.
  const forbidden: BoundOperation = { ...admitted, along: ["date"], resultGrain: ["product"] };
  const forbiddenDirection = {
    operation: forbidden,
    result: evaluateOperation(forbidden, CONSUMER_POPULATION),
    readbackRejects: readbackConsumer(readbackProgram, forbidden, CONSUMER_POPULATION).ok === false,
  };

  // The binding mutation: one claim-bearing part of the operation moves while
  // the program's declared explanation does not.
  const mutatedBinding: BoundOperation = { ...admitted, field: "reserved" };
  const mutatedProgram: Program = { ...readbackProgram, operation: mutatedBinding };
  const mutationReport = readbackConsumer(mutatedProgram, admitted, CONSUMER_POPULATION);

  return {
    basis: BASIS_FIXTURE,
    binding: admitted,
    resultFacts: facts,
    preservation: preservationReport(admitted, CONSUMER_POPULATION, METRIC_UNITS_PER_VALUE),
    population: baseline.population,
    consumers: { readback, metric, forbiddenDirection },
    bindingMutation: {
      mutated: mutatedBinding,
      readback: mutationReport,
      rejectedBeforeConsumption: mutationReport.reason === "binding-mismatch",
      valueDisagreement: !sameGroups(mutationReport.recovered, mutationReport.expected),
    },
    consumed: {
      relation: BASIS.relation,
      grain: facts.sourceGrain,
      dimension: facts.dimension,
      measure: facts.measure,
      task: "magnitude-comparison",
      binding: `${admitted.op}(${admitted.relation}.${admitted.field}) over [${admitted.along.join(", ")}] -> grain [${admitted.resultGrain.join(", ")}]`,
      target: EXPERIMENT_TARGET.id,
      inventoryChannels: EXPERIMENT_TARGET.channels.length,
      inventorySpaces: EXPERIMENT_TARGET.spaces.length,
    },
    retained: baseline.retained,
    refused: baseline.refused,
    undecided: baseline.undecided,
    distinctAfterFixedAuthority: distinct,
    claims: {
      shared,
      union,
      perProgram: perProgramClaims.map((c) => ({ ...c, loss: union.filter((u) => !c.induced.includes(u)) })),
    },
    residue: {
      projectionLevel:
        "coordinate space, channel assignment and baseline are consumed by the projection and are NOT carried by the relation: two lawful programs of one authority differ here with no change to the analytical object",
      realizationLevel:
        "NOT measured here. Focus affordances, label placement, text wrapping, collision handling, animation and substrate mechanics are stage-5 residue; this experiment claims nothing about them.",
    },
    controls,
    observer,
  };
}

/**
 * The composition probe. The partition is now a column of the RESULT the
 * operation produced, which is the only kind of column a projection of that
 * result can partition.
 *
 * WHAT THIS CHANGED, and why it is a finding rather than a regression: with
 * source facts the probe could partition over `product` and call that a lawful
 * completion. But `product` is exactly the dimension the admitted operation
 * SUMS OVER, so it is not a column of the result at all — partitioning a
 * projection of the result by it was an artifact of filtering on source facts.
 * At this result grain there is no lawful composition of a measure the
 * declaration calls non-additive along the very dimension the result is keyed
 * by, so the declared case refuses and the omitted case is carried.
 */
export function compositionProbe(): {
  declared: { partition: string; retained: number; refused: number; causes: string[] };
  omitted: { retained: number; refused: number; undecided: number; obligations: string[] };
  lawfulCompletion: { exists: boolean; reason: string };
} {
  const fixture = loadOracle().fixtures.get(BASIS_FIXTURE)!;
  const base = fixture.structure as RelationalStructure;
  const aggregate = fixture.assertions.find((a) => a.kind === "aggregate")!;
  const admitted = bindOperation(base, aggregate as AggregateAssertionDecl);
  const run = (partitionDimension?: string) =>
    enumerate({ structure: base, admitted, task: "composition", inventory: EXPERIMENT_TARGET, partitionDimension });
  const declared = run(BASIS.resultGrain);
  const omitted = run(undefined);
  return {
    declared: {
      partition: BASIS.resultGrain,
      retained: declared.retained.length,
      refused: declared.refused.length,
      causes: [...new Set(declared.refused.map((r) => r.cause))].sort(),
    },
    omitted: {
      retained: omitted.retained.length,
      refused: omitted.refused.length,
      undecided: omitted.undecided.length,
      obligations: [...new Set(omitted.undecided.map((u) => u.obligation))].sort(),
    },
    lawfulCompletion: {
      exists: false,
      reason: `the result is keyed by ${BASIS.resultGrain} and the measure is declared non-additive along it, so every declared partition of this result is the forbidden aggregation`,
    },
  };
}

/** The composition premise over a measure whose KIND, not its dimension set, contradicts it. */
export function compositionKindProbe(): Record<string, { retained: number; refused: number; causes: string[] }> {
  const fixture = loadOracle().fixtures.get(BASIS_FIXTURE)!;
  const base = fixture.structure as RelationalStructure;
  const aggregate = fixture.assertions.find((a) => a.kind === "aggregate")!;
  const admitted = bindOperation(base, aggregate as AggregateAssertionDecl);
  const out: Record<string, { retained: number; refused: number; causes: string[] }> = {};
  for (const kind of ["non-additive", "ratio-measure"] as const) {
    const rel = base.relations[BASIS.relation];
    const mutated = legal(
      { ...base, relations: { ...base.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, [BASIS.measure]: { ...rel.fields[BASIS.measure], additivity: { kind } } } } } },
      `additivity ${kind}`,
    );
    const e = enumerate({ structure: mutated, admitted, task: "composition", inventory: EXPERIMENT_TARGET, partitionDimension: BASIS.resultGrain });
    out[kind] = { retained: e.retained.length, refused: e.refused.length, causes: [...new Set(e.refused.map((r) => r.cause))].sort() };
  }
  return out;
}

/* ---------------------------------------------------------------- ledger */

export const LEDGER = path.join(CONTRACTS_DIR, "analytical-fixtures/projection-experiment.json");

export const NON_CLAIMS = [
  "This result is CONDITIONAL on the basis named above and holds only for the declared candidate universe. It does not close stage 2, complete stage 3, establish rendered or navigational behaviour, or settle the cross-substrate thesis, which the doctrine places at stages 4 and 6.",
  "Passing the precommitted controls is evidence against particular template-selection explanations. It is NOT proof that a more elaborate lookup implementation could not mimic this finite test set; generalization is pressured later by unfamiliar recombinations, not declared here.",
  "The stage-2 subtraction stays open at its existing unresolved count. No coordinate is adjudicated, ratified or retired by this experiment.",
  "Only two of the doctrine's ten tasks have their preconditions implemented; the other eight are recorded in TASK_INVARIANTS with the invariant they would need, and no candidate is admitted for them.",
  "The precommit's third distinctness limb names projection FAMILY (visual / tabular / textual / navigational) beside coordinate space and channel assignment. This experiment has no separate family axis: the coordinate space stands in for it, so two programs both in `tabular` are not told apart by family. The distinctness count is therefore over coordinate, channel and baseline, and a family-level claim is NOT established here.",
  "A program is a projection TOPOLOGY - coordinate, the channel each task-bearing variable is assigned to, and the baseline - not an encoded artifact. Marks, scales, axes, label placement and emission are downstream of it and are not enumerated, so nothing here establishes that any program can be realized.",
  "Residue is enumerated per target family at stage 5; this experiment retains the realization-specific residue it observes but does not claim the stage-5 enumeration.",
  "THE PREDECESSOR'S ALL-PASS INTERPRETATION IS CORRECTED HERE. Topology enumeration is established; the attribution of established analytical preservation and loss to a topology whose analytical operation was unbound was an overclaim. That binding now travels with every program and is checked by value, but the correction itself stands as the record of what the earlier result did not establish.",
  "The general same-task preservation requirement can have an EMPTY applicable set, and that is not the same thing as a concrete prediction being confirmed. The predecessor precommit named the value-readback programs as the alternatives to preserve; none survived, so that prediction was REFUTED. The targeted-narrowing control added alongside it is subsequent evidence that some narrowing is selective, not retrospective confirmation.",
  "A consumer recovers the bound operation's values through one topology over ONE supplied population. That establishes the binding controls what is displayed for that population; it is not a general theorem about the topology, and it says nothing about rendered output, which does not exist.",
  "The two consumers differ in topology and in how the value is carried; both recover the same numbers because the same operation is bound. That is the shared analytical proposition, and it is established for the declared population only.",
  "WHAT THE OBSERVERS DO NOT CHECK, reproduced on the merged code and recorded rather than repaired. They check the BINDING and the claims derived from the program; they do not check the topology's own admissibility and they do not consult grain status. A program whose coordinate cannot host its measure channel under the module's OWN capacity table (non-metric hosting area) is rejected by the enumerator and still accepted by BOTH observers; and a program asserting an aggregate magnitude under an unknown grain is left undecided by the enumerator and still accepted by BOTH observers. A3 and A4 therefore establish that the observer reads the program rather than its certificate and that it detects a changed analytical BINDING; they do NOT establish complete admissibility checking.",
];

export function ledgerOf(r: ExperimentResult): Record<string, unknown> {
  return {
    $comment:
      "The bounded stage-3 experiment (REL-PROJECTION-EXPERIMENT-01). Retained as the actual normalized candidate SETS with their consumed inputs and their per-candidate reason, not as counts. Regenerate with `tsx packages/ds-codegen/src/analytical/projection.ts --record`; `projection.test.ts` fails when this file and a fresh computation disagree.",
    question:
      "Given one fixed analytical authority - relation, derivation and task - does the system independently enumerate at least two structurally different lawful projection programs, with shared claims identifiable, losses explicit and non-empty residue, with no form name participating?",
    basis: {
      fixture: r.basis,
      identification: "declared grain [product, date]; product nominal (dimension); date interval/instant (partition dimension, not assigned by any retained candidate); on_hand ratio, semi-additive with nonAdditiveAlong [date] (measure)",
      admissionEvidence: "the live engine's canonical judgment for this fixture is `admissible` with zero diagnostics and zero obligations; the basis is admitted on evidence, not on provisional status",
    },
    consumed: r.consumed,
    precommitted: PRECOMMITTED,
    retained: r.retained,
    refused: r.refused,
    undecided: r.undecided,
    distinctAfterFixedAuthority: r.distinctAfterFixedAuthority,
    population: r.population,
    binding: r.binding,
    resultFacts: r.resultFacts,
    preservation: r.preservation,
    consumers: r.consumers,
    bindingMutation: r.bindingMutation,
    correctedAccount: {
      operationIdentity:
        "CORRECTED UPWARD IN FORM AND DOWNWARD IN CLAIM. The guarantee that a candidate carries the admitted operation is now a CONSTRUCTION property - every candidate is stamped from the validated operation, so it cannot carry another - and the boundary validates that operation against the relation it NAMES before any candidate exists. What that does not do is check a caller-supplied operation against some independently established admitted one: the enumerator has no such second authority, so an operation for a different analysis is refused only if it contradicts the relation.",
      representationRecovery:
        "This is what the earlier consumers did NOT establish. Both sides called `evaluateOperation`, so nothing representation-dependent lay between them: agreement showed the binding and channel guards admit one shared evaluation, not that a value survived text or metric encoding. Recovery is now observed through two PRODUCED representations whose decoders receive neither the rows nor the evaluator, and the metric decoder recovers from extents and the DECLARED SCALE alone.",
      aggregateDispatch:
        "REPAIRED. `evaluateOperation` read `op.resultGrain` for grouping while ignoring `op.op`, so mean, min and count all executed as sum, and matching mean descriptors on both sides returned ok while returning sums. The executable contract is now narrowed to sum and every other aggregate name is REFUSED rather than executed.",
      metricChannelLabel:
        "REPAIRED. `metricConsumer` reported the channel as `length` for every non-readback success, including the area program the runner actually selected. It now reports the channel it consumed.",
      readbackPrediction: "REFUTED. The precommit named the value-readback programs as the alternatives a ratio->ordinal move must preserve. Ten existed and none survived: magnitude comparison requires ratio comparability, and a readable ordinal value does not supply it. The general same-task preservation requirement therefore had an EMPTY applicable set for this task, but that does not retroactively confirm the concrete prediction, which was wrong.",
      grainPrediction: "ALSO REFUTED, and the refutation is a consequence of the missing binding this slice corrects. The precommit treated the value-readback family as not inspecting grain; that was true only of a program carrying no grain-bearing content. A bound program names a result grain, so an unknown grain leaves that grain unestablished in EVERY topology. Two of the four precommitted metamorphic controls therefore carry refuted concrete predictions rather than confirmed ones, and the controls array reports requirementMet and predictionRefuted separately so the general requirement is not confused with the concrete one.",
      closurePopulation: "The closure statement is about the POST-EXCLUSION population: considered minus excluded. Triples a channel has no slot for are not judgments, and they are counted rather than implied.",
      lossLabels: "A `loss` here is an absent property NAME, not a measured information loss. It does not distinguish a lost analytical proposition from the absence of a perceptual encoding, and this experiment does not measure the former.",
      residue: "Realization-level residue remains UNMEASURED; the projection-level variation below is observed projection variation and does not satisfy the residue clause.",
      observerLimits:
        "REPRODUCED AND PINNED, not repaired. Neither observer checks the topology against the capacity table, and neither consults grain status: a non-metric coordinate hosting an area measure is rejected by the enumerator and accepted by both observers, and an aggregate magnitude under an unknown grain is undecided in the enumerator and accepted by both observers. What the observers establish is bounded to reading the program instead of its certificate and detecting a changed ANALYTICAL BINDING.",
    },
    sharedClaims: r.claims.shared,
    claimUnion: r.claims.union,
    perProgramClaims: r.claims.perProgram,
    residue: r.residue,
    controls: r.controls,
    observerControl: r.observer,
    compositionProbe: compositionProbe(),
    compositionKindProbe: compositionKindProbe(),
    nonClaims: NON_CLAIMS,
  };
}

export function recordLedger(): string {
  fs.writeFileSync(LEDGER, `${JSON.stringify(ledgerOf(runExperiment()), null, 2)}\n`);
  return LEDGER;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invokedDirectly && process.argv.includes("--record")) {
  console.log(`projection: recorded ${recordLedger()}`);
}

/* --------------------------------------------------- form names, quarantined */

/**
 * Humans need a word for what fell out. This map is the ONLY place a form name
 * appears in this module, it is consulted by nobody in the enumeration path,
 * and `projection.test.ts` checks that the denylist appears nowhere else in
 * this file. Invariant 1 is enforced structurally, not by intention.
 */
export const FORM_ALIASES: Record<string, string> = {
  "cartesian|position|length": "colloquially, a bar",
  "cartesian|position|area": "colloquially, a bubble",
  "tabular|position|text": "colloquially, a table",
  "polar|position|length": "colloquially, a radial bar",
  "polar|hue|angle": "colloquially, a pie",
  "tabular|position|luminance": "colloquially, a heat map",
};
