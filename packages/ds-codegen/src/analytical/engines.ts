/**
 * Stage-1 checkability engines over a relational structure.
 *
 * `judge(structure, assertions, evidence)` runs every rule over every
 * assertion and returns an occurrence-bearing, three-valued judgment. Rules
 * only ever ADD occurrences; none reads another's output, so the result is
 * independent of rule order (pinned by test). The diagnostic codes below are
 * the engine's output vocabulary; the engine receives no case, no expected
 * verdict, and nothing from the corpus. Each rule is named by the vocabulary
 * engine it implements, and every occurrence carries that name as provenance.
 *
 * The engine reads the kernel's capability coordinates (transformation,
 * cyclic, proportion, index), never a scale label (D6).
 *
 * What each engine knows (and only that):
 * - meaningfulness: which statistics are invariant under the admissible
 *   transformations of a field (Stevens; Luce/Narens), keys have no
 *   arithmetic standing, instants are interval-scaled in time;
 * - additivity: grain must be declared before rows are combined; a
 *   semi-additive measure cannot be summed along its non-additive dimension;
 *   a rate re-derives rather than sums or averages; proportions of different
 *   wholes do not add;
 * - dimensional: values in incommensurable units are not combinable;
 * - declaration-missing: proportion needs a whole, index needs a base, a
 *   permitted null needs a declared handling before rows are seen;
 * - derivation typing: an aggregate over uncertain values must carry or
 *   declare the loss; a declared null handling is unproven without rows; a
 *   censored value is a bound not a measurement; coercing a missing value to
 *   zero is not a measurement either.
 *
 * Two branches read rows and emit stage-2 catalogue codes (REL_GRAIN_FANOUT,
 * REL_NULL_SUPPRESSED_AS_ZERO). They are instance-evidence behaviour: they
 * confer no stage-1 schema necessity (REL-FIELD-ALGEBRA-02, invariant 9).
 */
import { DIAG, OBLIGATION } from "./codes.js";
import { checkDerivations, inputsOf } from "./derivation.js";
import type { Assertion, Evidence, FieldDecl, RelationDecl, RelationalStructure } from "./relation-model.js";
import { normalizeObservation, type Observation } from "./structure.js";
import {
  assertionKey,
  type DiagnosticOccurrence,
  type Engine,
  type EvidenceClass,
  type Judgment,
  type ObligationOccurrence,
  normalizeJudgment,
} from "./judgment.js";

export { DIAG, OBLIGATION } from "./codes.js";

export interface RuleContext {
  structure: RelationalStructure;
  assertion: Assertion;
  /** `assertionKey(assertion)` — the occurrence's assertion identity. */
  assertionKey: string;
  relationName: string;
  relation: RelationDecl;
  fieldName: string;
  field: FieldDecl;
  /** `rel.field` — the analytical locus; grain findings use `rel`. */
  subject: string;
  rows?: Record<string, Observation>[];
  evidence?: Evidence;
}

export interface Findings {
  diagnostics: DiagnosticOccurrence[];
  obligations: ObligationOccurrence[];
}

export interface Rule {
  name: Engine;
  apply(ctx: RuleContext, out: Findings): void;
}

const diag = (out: Findings, ctx: RuleContext, engine: Engine, code: string, evidenceClass: EvidenceClass, subject = ctx.subject) =>
  out.diagnostics.push({ code, subject, assertion: ctx.assertionKey, engine, evidenceClass });
const oblig = (out: Findings, ctx: RuleContext, engine: Engine, term: string, evidenceClass: EvidenceClass, subject = ctx.subject) =>
  out.obligations.push({ term, subject, assertion: ctx.assertionKey, engine, evidenceClass });

/** How much arithmetic a transformation class preserves. */
const ARITHMETIC_RANK: Record<FieldDecl["transformation"], number> = {
  nominal: 0,
  ordinal: 1,
  interval: 2,
  ratio: 3,
};

/** Does the assertion combine rows (so grain and additivity matter)? */
const combines = (a: Assertion) => a.kind === "aggregate";
/** The op an aggregate performs, if any. */
const opOf = (a: Assertion) => ("op" in a ? a.op : undefined);
/** Does the assertion combine VALUES (not just count rows)? */
const combinesValues = (a: Assertion) => combines(a) && opOf(a) !== "count";
/** Does the result depend on how many rows carry each value? */
const multiplicitySensitive = (a: Assertion) => combines(a) && opOf(a) !== "min";

/**
 * What a join's fan-out does to each field, read from the cardinality alone.
 *
 * The side that does NOT survive at row granularity has each of its rows
 * matched by several rows of the other. `one-to-many` names `from` as that
 * side, `many-to-one` names `with`, `many-to-many` names both, and
 * `one-to-one` names neither. Two different things then go wrong, and they are
 * reached by different fields:
 *
 * - `values`: a measure carried only by the repeated side appears once per
 *   match, so summing or averaging it is taken over the wrong multiset. A
 *   field on both sides is excluded — a join key carries the same value either
 *   way, so nothing about it is manufactured here.
 * - `identity`: a grain column of the repeated side no longer identifies a
 *   row. Counting it counts rows of the SURVIVING side while naming the
 *   repeated side's identity — "orders" that are really order lines. This one
 *   deliberately includes fields present on both sides, because the foreign
 *   key that both carry is exactly the column that gets counted.
 */
function fanOut(
  structure: RelationalStructure,
  relation: RelationDecl,
): { values: Set<string>; identity: Set<string> } | undefined {
  const d = relation.derivedBy;
  if (d?.kind !== "join" || d.cardinality === "one-to-one") return undefined;
  const left = structure.relations[d.from];
  const right = structure.relations[d.with];
  if (!left || !right) return undefined;
  const repeated: RelationDecl[] =
    d.cardinality === "one-to-many" ? [left] : d.cardinality === "many-to-one" ? [right] : [left, right];
  const other = (r: RelationDecl) => (r === left ? right : left);
  const carried = (f: string) => f in relation.fields;
  return {
    values: new Set(repeated.flatMap((r) => Object.keys(r.fields).filter((f) => !(f in other(r).fields) && carried(f)))),
    identity: new Set(repeated.flatMap((r) => (r.grain === "unknown" ? [] : r.grain.filter(carried)))),
  };
}

export const meaningfulness: Rule = {
  name: "meaningfulness",
  apply(ctx, out) {
    const E = "meaningfulness";
    const { assertion: a, field: f } = ctx;
    const rank = ARITHMETIC_RANK[f.transformation];
    if (a.kind === "ratio-comparison") {
      if (rank < 3) diag(out, ctx, E, DIAG.INTERVAL_RATIO, "schema");
      return;
    }
    const op = opOf(a);
    // A key has no arithmetic standing at all; transformation rules are vacuous for it.
    if (f.key) {
      if (op !== "count") diag(out, ctx, E, DIAG.IDENTITY_AGGREGATED, "schema");
      return;
    }
    if (op === "count") return;
    if (op === "mean") {
      if (f.cyclic) diag(out, ctx, E, DIAG.CYCLIC_LINEAR_MEAN, "schema");
      else if (rank < 2) diag(out, ctx, E, DIAG.ORDINAL_MEAN, "schema");
      return;
    }
    if (op === "sum") {
      if (f.temporality?.kind === "instant") diag(out, ctx, E, DIAG.TEMPORAL_INSTANT_SUM, "schema");
      else if (rank < 3) diag(out, ctx, E, DIAG.INTERVAL_SUM, "schema");
      return;
    }
    if (op === "min") {
      if (f.transformation === "nominal") diag(out, ctx, E, DIAG.NOMINAL_ORDER_STAT, "schema");
    }
  },
};

const hasDuplicates = (rows: Record<string, Observation>[], keys: string[]) => {
  const seen = new Set<string>();
  for (const row of rows) {
    const k = JSON.stringify(keys.map((f) => row[f]?.value ?? `null:${row[f]?.null ?? "absent"}`));
    if (seen.has(k)) return true;
    seen.add(k);
  }
  return false;
};

export const additivity: Rule = {
  name: "additivity",
  apply(ctx, out) {
    const E = "additivity";
    const { assertion: a, field: f, relation, relationName } = ctx;
    if (!combines(a)) return;
    if (relation.grain === "unknown") {
      const witness = ctx.evidence?.grainWitness?.[relationName];
      if (!witness) oblig(out, ctx, E, OBLIGATION.GRAIN_DECLARED, "schema", relationName);
      // instance-evidence branch (stage-2 catalogue code)
      else if (ctx.rows && hasDuplicates(ctx.rows, witness)) diag(out, ctx, E, DIAG.GRAIN_FANOUT, "instance", relationName);
    }
    const op = opOf(a);
    // Fan-out is decidable from the DECLARATION once the join says its
    // cardinality — that is what the cardinality coordinate is for. `min` is
    // exempt from both branches because repetition does not move an order
    // statistic.
    const fan = multiplicitySensitive(a) ? fanOut(ctx.structure, relation) : undefined;
    if (fan && (op === "count" ? fan.identity.has(ctx.fieldName) : fan.values.has(ctx.fieldName))) {
      diag(out, ctx, E, DIAG.GRAIN_FANOUT, "schema");
    }
    if (a.kind === "aggregate" && op === "sum" && f.additivity?.kind === "semi-additive") {
      const along = a.along;
      const blocked = f.additivity.nonAdditiveAlong;
      if (!along || along.some((d) => blocked.includes(d))) diag(out, ctx, E, DIAG.SUM_SEMIADDITIVE, "schema");
    }
    // A rate combined by sum or mean is averaged rather than re-derived at the resulting grain.
    if (a.kind === "aggregate" && f.additivity?.kind === "ratio-measure" && (op === "sum" || op === "mean")) {
      diag(out, ctx, E, DIAG.RATIO_MEASURE_AVERAGED, "schema");
    }
    if (a.kind === "aggregate" && op === "sum" && f.proportion && typeof f.whole === "object") {
      const wholeField = f.whole.perRow;
      if (!a.along || a.along.includes(wholeField)) diag(out, ctx, E, DIAG.PROPORTION_SUM_ACROSS_WHOLES, "schema");
    }
  },
};

export const dimensional: Rule = {
  name: "dimensional",
  apply(ctx, out) {
    const E = "dimensional";
    const { assertion: a, field: f, fieldName } = ctx;
    if (!combinesValues(a)) return;
    const u = f.unit;
    if (!u) return;
    // Commensurable when at most one unit lacks a conversion (that one is the base);
    // independent of declaration or row order.
    const convertible = new Set(u.conversions ?? []);
    const covered = (units: string[]) => units.filter((x) => !convertible.has(x)).length <= 1;
    if (u.units && u.units.length > 1 && !covered(u.units)) {
      diag(out, ctx, E, DIAG.UNIT_SUM_INCOMMENSURABLE, "schema");
      return;
    }
    if (u.perRow) {
      if (!ctx.rows) {
        oblig(out, ctx, E, OBLIGATION.UNIT_COMMENSURABLE, "instance");
        return;
      }
      const seen = [...new Set(ctx.rows.map((r) => r[fieldName]?.unit).filter((x): x is string => typeof x === "string"))];
      if (seen.length > 1 && !covered(seen)) diag(out, ctx, E, DIAG.UNIT_SUM_INCOMMENSURABLE, "instance");
    }
  },
};

export const declarationMissing: Rule = {
  name: "declaration-missing",
  apply(ctx, out) {
    const E = "declaration-missing";
    const { assertion: a, field: f } = ctx;
    if (f.proportion && f.whole === undefined) diag(out, ctx, E, DIAG.PROPORTION_WHOLE_UNDECLARED, "schema");
    if (f.index && f.base === undefined) diag(out, ctx, E, DIAG.INDEX_BASE_MISSING, "schema");
    // A permitted null with no declared handling, before any row is seen:
    // whether a row is missing is an instance fact, and the mechanism is undeclared.
    if (!combinesValues(a)) return;
    if (!f.permits?.null) return;
    const handling = a.kind === "aggregate" ? a.nulls : undefined;
    if (handling === undefined && !ctx.rows) oblig(out, ctx, E, OBLIGATION.NULL_MISSING_MECHANISM, "instance");
  },
};

export const derivationTyping: Rule = {
  name: "derivation-typing",
  apply(ctx, out) {
    const E = "derivation-typing";
    const { assertion: a, field: f, fieldName } = ctx;
    if (!combinesValues(a)) return;
    const op = opOf(a);
    if (f.permits?.uncertainty && a.kind === "aggregate" && (op === "sum" || op === "mean") && a.uncertainty === undefined) {
      diag(out, ctx, E, DIAG.UNCERTAINTY_UNPROPAGATED, "schema");
    }
    if (!f.permits?.null) return;
    const handling = a.kind === "aggregate" ? a.nulls : undefined;
    if (handling === "exclude") return;
    if (!ctx.rows) {
      // A declared coercion (as-zero / as-observed) is sound only if no row needs it; unproven without rows.
      if (handling !== undefined) oblig(out, ctx, E, OBLIGATION.NULL_MISSING_MECHANISM, "instance");
      return;
    }
    const present = ctx.rows.map((r) => r[fieldName]?.null).filter((k): k is NonNullable<typeof k> => k !== undefined);
    if (present.length === 0) return;
    // A censored value is a bound; treating it as a number is wrong under any handling but exclusion.
    if (present.includes("censored")) diag(out, ctx, E, DIAG.NULL_CENSORED_AS_OBSERVED, "instance");
    const missing = present.filter((k) => k !== "censored");
    if (missing.length > 0) {
      // instance-evidence branch (stage-2 catalogue code)
      if (handling === "as-zero") diag(out, ctx, E, DIAG.NULL_SUPPRESSED_AS_ZERO, "instance");
      else oblig(out, ctx, E, OBLIGATION.NULL_MISSING_MECHANISM, "instance");
    }
  },
};

export const RULES: readonly Rule[] = [meaningfulness, additivity, dimensional, declarationMissing, derivationTyping];

/** Judge a structure under one or more assertions with the available evidence. */
export function judge(
  structure: RelationalStructure,
  assertions: Assertion[],
  evidence?: Evidence,
  rules: readonly Rule[] = RULES,
): Judgment {
  const out: Findings = { diagnostics: [], obligations: [] };
  // The boundary runs FIRST, and its verdict gates what may be asserted. An
  // assertion over a relation whose derivation was not admitted would be a
  // semantic finding about a result that has no standing yet — downstream
  // meaning acquiring authority before its premise. Evaluating everything and
  // then appending the structural defect prevents laundering only at the
  // headline; the occurrences underneath would still have been manufactured.
  const boundary = checkDerivations(structure, evidence);
  // Only REFUTATION removes standing. An undecided derivation narrows what can
  // be concluded but does not block, so its assertions still evaluate and carry
  // the obligation forward — the doctrine's rule that unproven preconditions
  // narrow rather than block, applied at the new authority boundary.
  const ungrounded = ungroundedRelations(
    structure,
    boundary.filter((b) => b.kind === "diagnostic").map((b) => b.subject),
  );
  for (const a of assertions) {
    // Failure of one derived relation must not silence assertions over
    // relations that are grounded: only this one's premise failed.
    if (ungrounded.has(a.relation)) continue;
    const relation = structure.relations[a.relation];
    if (!relation) throw new Error(`assertion names unknown relation "${a.relation}"`);
    const field = relation.fields[a.field];
    if (!field) throw new Error(`assertion names unknown field "${a.relation}.${a.field}"`);
    const rows = evidence?.rows?.[a.relation]?.map((row) =>
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k, normalizeObservation(v)])),
    );
    const ctx: RuleContext = {
      structure,
      assertion: a,
      assertionKey: assertionKey(a),
      relationName: a.relation,
      relation,
      fieldName: a.field,
      field,
      subject: `${a.relation}.${a.field}`,
      rows,
      evidence,
    };
    for (const r of rules) r.apply(ctx, out);
  }
  // The boundary's findings carry their own engine and evidence class: it is
  // one module but not one engine, and provenance is per rule.
  return normalizeJudgment({ ...out, derivations: boundary });
}

/**
 * Relations with no standing: those whose own derivation was refused, and
 * those derived — transitively — from one that was. A relation reachable only
 * through an unadmitted derivation is not authoritative, however well-formed
 * its own declaration looks.
 */
function ungroundedRelations(structure: RelationalStructure, refused: string[]): Set<string> {
  const out = new Set(refused);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [name, rel] of Object.entries(structure.relations)) {
      if (out.has(name) || !rel.derivedBy) continue;
      if (inputsOf(rel.derivedBy).some((i) => out.has(i))) {
        out.add(name);
        grew = true;
      }
    }
  }
  return out;
}
