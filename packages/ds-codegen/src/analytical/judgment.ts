/**
 * The stage-1 judgment: occurrence-bearing, three-valued, canonical.
 *
 * A judgment is a set of diagnostic occurrences and a set of obligation
 * occurrences; the status is DERIVED from those sets after every rule has
 * run, so no rule's position in the evaluation order can decide the headline.
 * Occurrences carry a subject (a stable path into the relational structure)
 * so two independent violations of one cause remain two findings, and an
 * evidence class so a consumer knows whether rows were needed.
 */
export type EvidenceClass = "schema" | "instance";
export type Status = "admissible" | "illegal" | "unproven";

export interface DiagnosticOccurrence {
  code: string;
  subject: string;
  evidenceClass: EvidenceClass;
}

export interface ObligationOccurrence {
  term: string;
  subject: string;
  evidenceClass: EvidenceClass;
}

export interface Judgment {
  status: Status;
  diagnostics: DiagnosticOccurrence[];
  obligations: ObligationOccurrence[];
}

/** Any proven illegality wins; otherwise any outstanding premise; otherwise admissible. */
export function deriveStatus(diagnostics: readonly DiagnosticOccurrence[], obligations: readonly ObligationOccurrence[]): Status {
  if (diagnostics.length > 0) return "illegal";
  if (obligations.length > 0) return "unproven";
  return "admissible";
}

const key = (o: { subject: string; evidenceClass: string } & ({ code: string } | { term: string })) =>
  `${"code" in o ? o.code : o.term}|${o.subject}|${o.evidenceClass}`;

/** Sort and dedupe occurrences so the serialization is order-independent. */
export function normalizeJudgment(j: { diagnostics: DiagnosticOccurrence[]; obligations: ObligationOccurrence[] }): Judgment {
  const dedupe = <T extends { subject: string; evidenceClass: EvidenceClass }>(xs: T[]): T[] => {
    const seen = new Map<string, T>();
    for (const x of xs) seen.set(key(x as never), x);
    return [...seen.values()].sort((a, b) => key(a as never).localeCompare(key(b as never)));
  };
  const diagnostics = dedupe(j.diagnostics);
  const obligations = dedupe(j.obligations);
  return { status: deriveStatus(diagnostics, obligations), diagnostics, obligations };
}

/** Byte-stable form for digests and permutation tests. */
export function canonicalJudgment(j: Judgment): string {
  const n = normalizeJudgment(j);
  return JSON.stringify({
    status: n.status,
    diagnostics: n.diagnostics.map((d) => [d.code, d.subject, d.evidenceClass]),
    obligations: n.obligations.map((o) => [o.term, o.subject, o.evidenceClass]),
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
