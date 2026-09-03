/**
 * The stage-1 judgment: occurrence-bearing, three-valued, canonical.
 *
 * A judgment is a set of diagnostic occurrences and a set of obligation
 * occurrences; the status is DERIVED from those sets after every rule has
 * run, so no rule's position in the evaluation order can decide the headline.
 *
 * An occurrence carries:
 * - `subject`: the analytical locus (`rel` or `rel.field`);
 * - `assertion`: the complete identity of the assertion that exposed it
 *   (`assertionKey`), so two assertions on one field that differ only in
 *   their collapsed dimensions or handling remain two occurrences;
 * - `engine`: which checkability engine emitted it (provenance, testable
 *   against the corpus's engine attribution);
 * - `evidenceClass`: whether rows were needed.
 * The occurrence key is the tuple of all of these; `subject` alone is never
 * the key.
 */
import type { Assertion } from "./relation-model.js";

export type EvidenceClass = "schema" | "instance";
export type Status = "admissible" | "illegal" | "unproven";
/** The vocabulary's engine names that stage 1 implements. */
export type Engine =
  | "meaningfulness"
  | "additivity"
  | "dimensional"
  | "declaration-missing"
  | "derivation-typing"
  | "task-invariant";

export interface OccurrenceBase {
  subject: string;
  assertion: string;
  engine: Engine;
  evidenceClass: EvidenceClass;
}

export interface DiagnosticOccurrence extends OccurrenceBase {
  code: string;
}

export interface ObligationOccurrence extends OccurrenceBase {
  term: string;
}

/**
 * A finding about the DERIVATION LAYER, not about an assertion.
 *
 * A malformed join is a defect whether or not any assertion reads it, so it
 * cannot borrow an assertion's identity: forcing it through one would make a
 * fixture invent an assertion just to run a structural rule, and would emit the
 * same structural defect once per reader. `derivation` is its own stable key
 * (`derivationKey`), the analogue of `assertionKey`.
 *
 * The domain covers findings ABOUT derivations as well as findings about a
 * single one — two peers whose derivations aggregate to different target grains
 * is a defect of the derivation layer with no assertion and no single owning
 * operator, and it is keyed by the peer set's structural key for the same
 * reason.
 */
export interface DerivationOccurrence {
  /** `diagnostic`: the declared result is refuted. `obligation`: undecided. */
  kind: "diagnostic" | "obligation";
  code?: string;
  term?: string;
  subject: string;
  derivation: string;
  engine: Engine;
  evidenceClass: EvidenceClass;
  detail: string;
}

export interface Judgment {
  status: Status;
  diagnostics: DiagnosticOccurrence[];
  obligations: ObligationOccurrence[];
  /** Findings from the derivation boundary. Empty for a structure with no derivations. */
  derivations: DerivationOccurrence[];
}

/**
 * The complete identity of an assertion, order-independent: kind and op, then
 * every parameter in a fixed order with set-valued parameters sorted.
 */
export function assertionKey(a: Assertion): string {
  if (a.kind === "ratio-comparison") return "ratio-comparison";
  const params: string[] = [];
  if (a.kind === "aggregate") {
    if (a.along) params.push(`along=${[...a.along].sort().join(",")}`);
    if (a.nulls) params.push(`nulls=${a.nulls}`);
    if (a.uncertainty) params.push(`uncertainty=${a.uncertainty}`);
  }
  return `${a.kind}:${a.op}${params.length ? `(${params.join(";")})` : ""}`;
}

/** Any proven illegality wins; otherwise any outstanding premise; otherwise admissible. */
export function deriveStatus(
  diagnostics: readonly DiagnosticOccurrence[],
  obligations: readonly ObligationOccurrence[],
  derivations: readonly DerivationOccurrence[] = [],
): Status {
  // A REFUTED derivation is a proven illegality: the declared result is one
  // the operator cannot produce. An UNDECIDED one is a missing premise and
  // narrows rather than blocks, exactly like every other obligation — which is
  // why the boundary must distinguish the two rather than treating silence as
  // certification.
  if (diagnostics.length > 0 || derivations.some((d) => d.kind === "diagnostic")) return "illegal";
  if (obligations.length > 0 || derivations.some((d) => d.kind === "obligation")) return "unproven";
  return "admissible";
}

const key = (o: OccurrenceBase & ({ code: string } | { term: string })) =>
  `${"code" in o ? o.code : o.term}|${o.subject}|${o.assertion}|${o.engine}|${o.evidenceClass}`;

/** Sort and dedupe occurrences so the serialization is order-independent. */
export function normalizeJudgment(j: {
  diagnostics: DiagnosticOccurrence[];
  obligations: ObligationOccurrence[];
  derivations?: DerivationOccurrence[];
}): Judgment {
  const dedupe = <T extends OccurrenceBase & ({ code: string } | { term: string })>(xs: T[]): T[] => {
    const seen = new Map<string, T>();
    for (const x of xs) seen.set(key(x), x);
    return [...seen.values()].sort((a, b) => key(a).localeCompare(key(b)));
  };
  const diagnostics = dedupe(j.diagnostics);
  const obligations = dedupe(j.obligations);
  // A derivation occurrence is keyed by its own identity, so one malformed
  // join referenced by three assertions is one finding, not three.
  const dkey = (d: DerivationOccurrence) =>
    `${d.kind}|${d.code ?? d.term}|${d.subject}|${d.derivation}|${d.engine}|${d.evidenceClass}`;
  const seenD = new Map<string, DerivationOccurrence>();
  for (const d of j.derivations ?? []) seenD.set(dkey(d), d);
  const derivations = [...seenD.values()].sort((a, b) => dkey(a).localeCompare(dkey(b)));
  return { status: deriveStatus(diagnostics, obligations, derivations), diagnostics, obligations, derivations };
}

/**
 * Byte-stable form for digests, ledgers, and permutation tests.
 *
 * Every domain appears. A canonical form that omitted one would make the
 * ledger and the permutation test blind to it: a rule that emitted only into
 * the missing domain could change its output, or depend on declaration order,
 * without moving a single recorded byte.
 */
export function canonicalJudgment(j: Judgment): string {
  const n = normalizeJudgment(j);
  return JSON.stringify({
    status: n.status,
    diagnostics: n.diagnostics.map((d) => [d.code, d.subject, d.assertion, d.engine, d.evidenceClass]),
    obligations: n.obligations.map((o) => [o.term, o.subject, o.assertion, o.engine, o.evidenceClass]),
    derivations: n.derivations.map((d) => [d.kind, d.code ?? d.term, d.subject, d.derivation, d.engine, d.evidenceClass]),
  });
}

/** The distinct diagnostic codes in a judgment. */
export function codesOf(j: Judgment): string[] {
  // Both domains normalise into one answer: a caller asking what is wrong with
  // a structure should not have to know whether the defect was exposed by an
  // assertion or by the derivation boundary.
  return [
    ...new Set([
      ...j.diagnostics.map((d) => d.code),
      ...j.derivations.filter((d) => d.kind === "diagnostic").map((d) => d.code!),
    ]),
  ].sort();
}

/** The distinct obligation terms in a judgment. */
export function termsOf(j: Judgment): string[] {
  return [
    ...new Set([
      ...j.obligations.map((o) => o.term),
      ...j.derivations.filter((d) => d.kind === "obligation").map((d) => d.term!),
    ]),
  ].sort();
}
