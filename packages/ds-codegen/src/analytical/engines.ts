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
 * What each engine knows (and only that):
 * - meaningfulness: which statistics are invariant under the admissible
 *   transformations of a scale (Stevens; Luce/Narens), keys have no
 *   arithmetic standing, instants are interval-scaled in time;
 * - additivity: grain must be declared before rows are combined; a
 *   semi-additive measure cannot be summed along its non-additive dimension;
 *   a rate re-derives from numerator and denominator; proportions of
 *   different wholes do not add;
 * - dimensional: values in incommensurable units are not combinable;
 * - declaration-missing: proportion needs a whole, index needs a base, a
 *   permitted null kind needs a declared handling before rows are seen;
 * - derivation typing: an aggregate over uncertain values must carry or
 *   declare the loss; a declared null handling is unproven without rows; a
 *   censored value is a bound not a measurement; coercing a missing value to
 *   zero is not a measurement either.
 *
 * Two branches read rows and emit stage-2 catalogue codes (REL_GRAIN_FANOUT,
 * REL_NULL_SUPPRESSED_AS_ZERO). They are instance-evidence behaviour: they
 * confer no stage-1 schema necessity (REL-FIELD-ALGEBRA-02, invariant 9).
 */
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

export const DIAG = {
  ORDINAL_MEAN: "REL_MEANINGFULNESS_ORDINAL_MEAN",
  INTERVAL_RATIO: "REL_MEANINGFULNESS_INTERVAL_RATIO",
  INTERVAL_SUM: "REL_MEANINGFULNESS_INTERVAL_SUM",
  NOMINAL_ORDER_STAT: "REL_MEANINGFULNESS_NOMINAL_ORDER_STAT",
  CYCLIC_LINEAR_MEAN: "REL_MEANINGFULNESS_CYCLIC_LINEAR_MEAN",
  IDENTITY_AGGREGATED: "REL_IDENTITY_AGGREGATED",
  TEMPORAL_INSTANT_SUM: "REL_TEMPORAL_INSTANT_SUM",
  SUM_SEMIADDITIVE: "REL_ADDITIVITY_SUM_SEMIADDITIVE",
  RATIO_MEASURE_AVERAGED: "REL_RATIO_MEASURE_AVERAGED",
  GRAIN_FANOUT: "REL_GRAIN_FANOUT",
  PROPORTION_SUM_ACROSS_WHOLES: "REL_PROPORTION_SUM_ACROSS_WHOLES",
  UNIT_SUM_INCOMMENSURABLE: "REL_UNIT_SUM_INCOMMENSURABLE",
  PROPORTION_WHOLE_UNDECLARED: "REL_PROPORTION_WHOLE_UNDECLARED",
  INDEX_BASE_MISSING: "REL_INDEX_BASE_MISSING",
  UNCERTAINTY_UNPROPAGATED: "REL_UNCERTAINTY_UNPROPAGATED",
  NULL_CENSORED_AS_OBSERVED: "REL_NULL_CENSORED_AS_OBSERVED",
  NULL_SUPPRESSED_AS_ZERO: "REL_NULL_SUPPRESSED_AS_ZERO",
} as const;

export const OBLIGATION = {
  GRAIN_DECLARED: "grain:declared",
  UNIT_COMMENSURABLE: "unit:commensurable",
  NULL_MISSING_MECHANISM: "null:missing-mechanism",
} as const;

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

/** How much arithmetic a scale's admissible transformations preserve. */
const ARITHMETIC_RANK: Record<FieldDecl["scale"], number> = {
  nominal: 0,
  ordinal: 1,
  cyclic: 1,
  interval: 2,
  ratio: 3,
  count: 3,
  proportion: 3,
  index: 3,
};

/** Does the assertion combine rows (so grain and additivity matter)? */
const combines = (a: Assertion) => a.kind === "aggregate" || a.kind === "rollup";
/** The op an aggregate or rollup performs, if any. */
const opOf = (a: Assertion) => ("op" in a ? a.op : undefined);
/** Does the assertion combine VALUES (not just count rows)? */
const combinesValues = (a: Assertion) => {
  const op = opOf(a);
  return combines(a) && op !== "count" && op !== "rederive";
};

export const meaningfulness: Rule = {
  name: "meaningfulness",
  apply(ctx, out) {
    const E = "meaningfulness";
    const { assertion: a, field: f } = ctx;
    const rank = ARITHMETIC_RANK[f.scale];
    if (a.kind === "ratio-comparison") {
      if (rank < 3) diag(out, ctx, E, DIAG.INTERVAL_RATIO, "schema");
      return;
    }
    const op = opOf(a);
    if (op === "rederive") return;
    // A key has no arithmetic standing at all; scale rules are vacuous for it.
    if (f.key) {
      if (op !== "count") diag(out, ctx, E, DIAG.IDENTITY_AGGREGATED, "schema");
      return;
    }
    if (op === "count") return;
    if (op === "mean") {
      if (f.scale === "cyclic") diag(out, ctx, E, DIAG.CYCLIC_LINEAR_MEAN, "schema");
      else if (rank < 2) diag(out, ctx, E, DIAG.ORDINAL_MEAN, "schema");
      return;
    }
    if (op === "sum") {
      if (f.temporality?.kind === "instant") diag(out, ctx, E, DIAG.TEMPORAL_INSTANT_SUM, "schema");
      else if (rank < 3) diag(out, ctx, E, DIAG.INTERVAL_SUM, "schema");
      return;
    }
    if (op === "min" || op === "max") {
      if (f.scale === "nominal") diag(out, ctx, E, DIAG.NOMINAL_ORDER_STAT, "schema");
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
    if (a.kind === "aggregate" && op === "sum" && f.additivity?.kind === "semi-additive") {
      const along = a.along;
      const blocked = f.additivity.nonAdditiveAlong;
      if (!along || along.some((d) => blocked.includes(d))) diag(out, ctx, E, DIAG.SUM_SEMIADDITIVE, "schema");
    }
    if (a.kind === "rollup" && f.additivity?.kind === "ratio-measure" && op !== "rederive") {
      diag(out, ctx, E, DIAG.RATIO_MEASURE_AVERAGED, "schema");
    }
    if (a.kind === "aggregate" && op === "sum" && f.scale === "proportion" && typeof f.whole === "object") {
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
    // Commensurable when at most one unit has no conversion (that one is the base);
    // independent of declaration or row order.
    const covered = (units: string[]) => units.filter((x) => u.conversions?.[x] === undefined).length <= 1;
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
    if (f.scale === "proportion" && f.whole === undefined) diag(out, ctx, E, DIAG.PROPORTION_WHOLE_UNDECLARED, "schema");
    if (f.scale === "index" && f.base === undefined) diag(out, ctx, E, DIAG.INDEX_BASE_MISSING, "schema");
    // A permitted null kind with no declared handling, before any row is seen:
    // whether a row is missing is an instance fact, and the mechanism is undeclared.
    if (!combinesValues(a)) return;
    if ((f.permits?.null ?? []).length === 0) return;
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
    const uncertain = (f.permits?.uncertainty ?? []).some((k) => k !== "none");
    if (uncertain && a.kind === "aggregate" && (op === "sum" || op === "mean") && a.uncertainty === undefined) {
      diag(out, ctx, E, DIAG.UNCERTAINTY_UNPROPAGATED, "schema");
    }
    if ((f.permits?.null ?? []).length === 0) return;
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
  for (const a of assertions) {
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
  return normalizeJudgment(out);
}
