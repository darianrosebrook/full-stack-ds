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
export type Engine = "meaningfulness" | "additivity" | "dimensional" | "declaration-missing" | "derivation-typing";

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

export interface Judgment {
  status: Status;
  diagnostics: DiagnosticOccurrence[];
  obligations: ObligationOccurrence[];
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
export function deriveStatus(diagnostics: readonly DiagnosticOccurrence[], obligations: readonly ObligationOccurrence[]): Status {
  if (diagnostics.length > 0) return "illegal";
  if (obligations.length > 0) return "unproven";
  return "admissible";
}

const key = (o: OccurrenceBase & ({ code: string } | { term: string })) =>
  `${"code" in o ? o.code : o.term}|${o.subject}|${o.assertion}|${o.engine}|${o.evidenceClass}`;

/** Sort and dedupe occurrences so the serialization is order-independent. */
export function normalizeJudgment(j: { diagnostics: DiagnosticOccurrence[]; obligations: ObligationOccurrence[] }): Judgment {
  const dedupe = <T extends OccurrenceBase & ({ code: string } | { term: string })>(xs: T[]): T[] => {
    const seen = new Map<string, T>();
    for (const x of xs) seen.set(key(x), x);
    return [...seen.values()].sort((a, b) => key(a).localeCompare(key(b)));
  };
  const diagnostics = dedupe(j.diagnostics);
  const obligations = dedupe(j.obligations);
  return { status: deriveStatus(diagnostics, obligations), diagnostics, obligations };
}

/** Byte-stable form for digests, ledgers, and permutation tests. */
export function canonicalJudgment(j: Judgment): string {
  const n = normalizeJudgment(j);
  return JSON.stringify({
    status: n.status,
    diagnostics: n.diagnostics.map((d) => [d.code, d.subject, d.assertion, d.engine, d.evidenceClass]),
    obligations: n.obligations.map((o) => [o.term, o.subject, o.assertion, o.engine, o.evidenceClass]),
  });
}

/** The distinct diagnostic codes in a judgment. */
export function codesOf(j: Judgment): string[] {
  return [...new Set(j.diagnostics.map((d) => d.code))].sort();
}

/** The distinct obligation terms in a judgment. */
export function termsOf(j: Judgment): string[] {
  return [...new Set(j.obligations.map((o) => o.term))].sort();
}
