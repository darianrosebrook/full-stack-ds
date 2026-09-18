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
import type { AggregateOp, FieldDecl, RelationalStructure, Transformation } from "./relation-model.js";
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
 * Why a binding does not resolve against the structure it is asserted of, or
 * `undefined` when it does. A binding that names a field the relation does not
 * declare, or sums over a dimension the declared grain does not contain, has no
 * established result grain — which is the corpus's `grain:declared` obligation,
 * not a favorable branch.
 */
export function operationResolves(op: BoundOperation | undefined, facts: BasisFacts): string | undefined {
  if (!op) return "the program carries no operation";
  if (!facts.fieldNames.includes(op.field)) return `the operation aggregates ${op.field}, which the relation does not declare`;
  const grain = Array.isArray(facts.grain) ? (facts.grain as string[]) : [];
  const stray = op.along.filter((a) => !grain.includes(a));
  if (stray.length > 0) return `the operation sums over ${stray.join(", ")}, which the declared grain does not contain`;
  const expected = grain.filter((g) => !op.along.includes(g)).sort();
  if (JSON.stringify(expected) !== JSON.stringify([...op.resultGrain].sort())) {
    return `the result grain [${op.resultGrain.join(", ")}] is not the declared grain minus the summed-over dimensions [${expected.join(", ")}]`;
  }
  if (op.resultGrain.length === 0) return "the operation has no result grain to display";
  return undefined;
}

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

/** The analytical facts the projection rules are allowed to read. */
export type BasisFacts = {
  /** Every field the relation declares, so a binding can be resolved against it. */
  fieldNames: string[];
  dimension: { transformation: Transformation; key: boolean; cyclic: boolean };
  measure: {
    transformation: Transformation;
    additivityKind?: string;
    nonAdditiveAlong: string[];
    cyclic: boolean;
  };
  grain: unknown;
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

export function basisFacts(structure: RelationalStructure, relation: string, dimension: string, measure: string): BasisFacts {
  const rel = structure.relations[relation];
  if (!rel) throw new Error(`relation ${relation} is not declared`);
  const f = (name: string): FieldDecl => {
    const decl = rel.fields?.[name];
    if (!decl) throw new Error(`field ${relation}.${name} is not declared`);
    return decl;
  };
  const m = f(measure);
  return {
    fieldNames: Object.keys(rel.fields ?? {}).sort(),
    dimension: { transformation: f(dimension).transformation, key: f(dimension).key === true, cyclic: f(dimension).cyclic === true },
    measure: {
      transformation: m.transformation,
      additivityKind: m.additivity?.kind,
      // `nonAdditiveAlong` exists on the semi-additive variant alone, so the
      // dimension set is read from the variant that carries it rather than
      // defaulted off a union member that never had it.
      nonAdditiveAlong: m.additivity?.kind === "semi-additive" ? m.additivity.nonAdditiveAlong : [],
      // `cyclic` is a capability claim on the field, per the stage-1.5 decoding.
      cyclic: m.cyclic === true,
    },
    grain: rel.grain,
  };
}

/* ------------------------------------------------------- induced claims */

/**
 * The claims a program ACTUALLY makes, read off its own structure rather than
 * off what its author says. This is the function the strong observer uses, and
 * the reason a mutation to a claim-bearing choice is detectable even when the
 * declared explanation is left untouched.
 */
export function inducedClaims(p: Program, facts: BasisFacts): Claim[] {
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
  facts: BasisFacts;
  task: Task;
  inventory: TargetInventory;
  /** The admitted operation every retained program must display. */
  operation: BoundOperation;
  /**
   * Which dimension the composition invariant partitions over. OMITTING IT IS A
   * MISSING PREMISE, not a default: the composition task's partition is a
   * decision-relevant input, and an absent one leaves the candidates undecided
   * rather than taking the branch a favorable completion would have taken.
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

const capacityVerdict = (channel: Channel, t: Transformation, facts: BasisFacts, role: "dimension" | "measure"): CapacityVerdict => {
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
  const { facts, task, inventory } = input;
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
        const p: Program = { coordinate, dimension: dimensionChannel, measure: measureChannel, baseline: "zero", task, claims: [], operation: input.operation };

        if ("notEnumerated" in spec) {
          continue; // the task's preconditions are not implemented here; see TASK_INVARIANTS
        }

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
        const bindingProblem = operationResolves(p.operation, facts);
        if (bindingProblem) {
          undecided.push({
            program: p,
            obligation: "grain:declared",
            detail: `${bindingProblem}, so the grain of the result it displays is not established`,
          });
          continue;
        }

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
        if (induced.includes("aggregate-magnitude") && facts.grain === "unknown") {
          undecided.push({ program: p, obligation: "grain:declared", detail: "an aggregate magnitude is claimed and the relation declares no grain" });
          continue;
        }
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
export function programObserver(p: Program, facts: BasisFacts): { ok: boolean; induced: Claim[]; missing: Claim[] } {
  const spec = TASK_INVARIANTS[p.task];
  if ("notEnumerated" in spec) return { ok: false, induced: [], missing: [] };
  const induced = inducedClaims(p, facts);
  return { ok: spec.requires.every((c) => induced.includes(c)), induced, missing: spec.requires.filter((c) => !induced.includes(c)) };
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
  channel: "text" | "length";
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
    return { channel: "length", ok: false, recovered: evaluateOperation(program.operation, rows).groups, expected, reason: "binding-mismatch" };
  }
  if (CAPACITY[program.measure].valueReadback) return { channel: "length", ok: false, recovered: [], expected, reason: "not-a-metric-channel" };
  if (program.baseline !== "zero") return { channel: "length", ok: false, recovered: [], expected, reason: "no-declared-zero-baseline" };
  const recovered = evaluateOperation(program.operation, rows).groups;
  return { channel: "length", ok: sameGroups(recovered, expected), recovered, expected, ...(sameGroups(recovered, expected) ? {} : { reason: "value-disagreement" }) };
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
): { ok: boolean; channel: "text" | "length" | "none"; recovered: GroupValue[]; expected: GroupValue[]; reason?: string } {
  const report = CAPACITY[program.measure].valueReadback ? readbackConsumer(program, admitted, rows) : metricConsumer(program, admitted, rows);
  const channel = CAPACITY[program.measure].valueReadback ? ("text" as const) : ("length" as const);
  if (!report.ok) return { ok: false, channel, recovered: report.recovered, expected: report.expected, reason: report.reason };
  return { ok: true, channel, recovered: report.recovered, expected: report.expected };
}

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
    mustEqual: "the normalized retained set, byte-identical",
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
export const BASIS = { relation: "stock", dimension: "product", measure: "on_hand", partitionDimension: "date" } as const;

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
  const { cyclic: _drop, ...rest } = rel.fields[BASIS.dimension];
  return { ...s, relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, [BASIS.dimension]: { ...rest, transformation: "ordinal" } } } } };
};
const withCyclicDimension = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return { ...s, relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, [BASIS.dimension]: { ...rel.fields[BASIS.dimension], cyclic: true } } } } };
};

const withUnknownGrain = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return { ...s, relations: { ...s.relations, [BASIS.relation]: { ...rel, grain: "unknown" } } };
};

/**
 * An IRRELEVANT semantic perturbation: `date`'s temporality kind moves from
 * instant to interval. No candidate in this universe assigns `date`, and no
 * declared task reads it, so the normalized retained set must not move. This is
 * the control without which an implementation that hashes its input into a
 * different template set passes every relevant-perturbation test.
 */
const withIrrelevantTemporality = (s: RelationalStructure): RelationalStructure => {
  const rel = s.relations[BASIS.relation];
  return {
    ...s,
    relations: { ...s.relations, [BASIS.relation]: { ...rel, fields: { ...rel.fields, date: { ...rel.fields.date, temporality: { kind: "interval" as const } } } } },
  };
};

const retainedKeys = (e: Enumeration) => e.retained.map(keyOf);
/** Coordinate|dimension|measure only: the part a scale perturbation may move. */
const dimensionKeys = (e: Enumeration) => e.retained.map((p) => `${p.coordinate}|${p.dimension}|${p.measure}`);

/** Channels whose capacity is nominal and nothing else. */
const NOMINAL_ONLY: Channel[] = ["hue", "shape", "texture", "connection"];

/**
 * A perturbation that produces an ILLEGAL declaration proves nothing: the
 * candidate set would move because the input stopped being a structure, not
 * because the semantic fact moved. Each perturbed structure is therefore
 * re-parsed through the same schema authority the corpus uses.
 */
const legal = (s: RelationalStructure, what: string): RelationalStructure => {
  const r = RelationalStructureSchema.safeParse(s);
  if (!r.success) throw new Error(`perturbation ${what} is not a legal declaration: ${JSON.stringify(r.error.issues[0])}`);
  return s;
};

export function runExperiment(): ExperimentResult {
  const fixture = loadOracle().fixtures.get(BASIS_FIXTURE);
  if (!fixture) throw new Error(`basis fixture ${BASIS_FIXTURE} is not in the corpus`);
  const base = legal(fixture.structure as RelationalStructure, "basis");
  const facts = basisFacts(base, BASIS.relation, BASIS.dimension, BASIS.measure);

  // The operation the entry record cited: the fixture's OWN admitted assertion,
  // bound once and carried through every candidate.
  const aggregate = fixture.assertions.find((a) => a.kind === "aggregate");
  if (!aggregate) throw new Error(`basis fixture ${BASIS_FIXTURE} carries no aggregate assertion to bind`);
  const admitted = bindOperation(base, aggregate as AggregateAssertionDecl);

  const run = (s: RelationalStructure, task: Task = "magnitude-comparison") =>
    enumerate({
      facts: basisFacts(s, BASIS.relation, BASIS.dimension, BASIS.measure),
      task,
      inventory: EXPERIMENT_TARGET,
      operation: admitted,
      partitionDimension: BASIS.partitionDimension,
    });

  const baseline = run(base);
  const dimOrdinal = run(legal(withDimensionOrdinal(base), "dimension nominal->ordinal"));
  const ordinal = run(legal(withMeasure(base, "ordinal"), "ratio->ordinal"));
  const unknownGrain = run(legal(withUnknownGrain(base), "declared->unknown"));
  const cyclicBaseline = run(legal(withDimensionOrdinal(base), "cyclic-control-baseline"));
  const cyclic = run(legal(withCyclicDimension(legal(withDimensionOrdinal(base), "cyclic-control-baseline")), "non-cyclic->cyclic"));
  const irrelevant = run(legal(withIrrelevantTemporality(base), "irrelevant-temporality"));

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
      actual: `retained ${retainedKeys(unknownGrain).length} of ${baseKeys.length}, undecided ${unknownGrain.undecided.length} carrying ${[...new Set(unknownGrain.undecided.map((u) => u.obligation))].join(", ") || "nothing"} — with the operation bound, EVERY topology depends on the result grain`,
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
      expected: "a perturbation that removes a capability SOME candidates need and others do not must remove exactly those, so the narrowing is targeted rather than blanket",
      actual: `dimension nominal->ordinal: removed ${dimensionKeys(baseline).filter((k) => !dimensionKeys(dimOrdinal).includes(k)).length}, preserved ${dimensionKeys(baseline).filter((k) => dimensionKeys(dimOrdinal).includes(k)).length}`,
      ok: (() => {
        const before = dimensionKeys(baseline);
        const after = dimensionKeys(dimOrdinal);
        const removed = before.filter((k) => !after.includes(k));
        const kept = before.filter((k) => after.includes(k));
        // Every removal is a dimension channel whose capacity is nominal only,
        // and something positional or readable survives: the narrowing is
        // targeted, not blanket, which is the property a hash-to-template
        // implementation cannot exhibit.
        return (
          removed.length > 0 &&
          kept.length > 0 &&
          removed.every((k) => NOMINAL_ONLY.includes(k.split("|")[1] as Channel)) &&
          kept.some((k) => ["position", "text"].includes(k.split("|")[1]))
        );
      })(),
      requirementMet: true,
      predictionRefuted: false,
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
      grain: facts.grain,
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
 * The composition probe: the same authority, a task the measure can and cannot
 * serve — and the case where the DECISION-RELEVANT partition is simply absent.
 *
 * The three populations are the point. `product` is the lawful completion,
 * `date` is the contradiction the semi-additivity declaration establishes, and
 * the OMITTED case must resolve to neither: an absent premise is carried as an
 * obligation, because treating it as the favorable completion is exactly the
 * fault this probe exists to catch.
 */
export function compositionProbe(): {
  lawful: { partition: string; retained: number; refused: number };
  unlawful: { partition: string; retained: number; refused: number; causes: string[] };
  omitted: { retained: number; refused: number; undecided: number; obligations: string[] };
} {
  const fixture = loadOracle().fixtures.get(BASIS_FIXTURE)!;
  const base = fixture.structure as RelationalStructure;
  const aggregate = fixture.assertions.find((a) => a.kind === "aggregate")!;
  const admitted = bindOperation(base, aggregate as AggregateAssertionDecl);
  const facts = basisFacts(base, BASIS.relation, BASIS.dimension, BASIS.measure);
  const run = (partitionDimension?: string) =>
    enumerate({ facts, task: "composition", inventory: EXPERIMENT_TARGET, operation: admitted, partitionDimension });
  const lawful = run("product");
  const unlawful = run(BASIS.partitionDimension);
  const omitted = run(undefined);
  return {
    lawful: { partition: "product", retained: lawful.retained.length, refused: lawful.refused.length },
    unlawful: {
      partition: BASIS.partitionDimension,
      retained: unlawful.retained.length,
      refused: unlawful.refused.length,
      causes: [...new Set(unlawful.refused.map((r) => r.cause))].sort(),
    },
    omitted: {
      retained: omitted.retained.length,
      refused: omitted.refused.length,
      undecided: omitted.undecided.length,
      obligations: [...new Set(omitted.undecided.map((u) => u.obligation))].sort(),
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
    const e = enumerate({
      facts: basisFacts(mutated, BASIS.relation, BASIS.dimension, BASIS.measure),
      task: "composition",
      inventory: EXPERIMENT_TARGET,
      operation: admitted,
      partitionDimension: "product",
    });
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
    consumers: r.consumers,
    bindingMutation: r.bindingMutation,
    correctedAccount: {
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
