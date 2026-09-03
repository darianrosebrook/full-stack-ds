/**
 * Integrity checker for the analytical pack's corpus.
 *
 * Stage 0 / 0.5 of `docs/architecture/analytical-relation-doctrine.md`
 * (ARCH-ANALYTICAL-RELATION-001). This is NOT the admissibility engine — no
 * relation is typed and no projection is judged here. It checks the pack
 * against itself and against the doctrine so the corpus cannot drift from the
 * contract it claims to satisfy:
 *
 * - every case validates against `corpus-case.schema.json`;
 * - case ids are unique; case identity is separate from diagnostic identity,
 *   and a corpus in which every diagnostic has exactly one case is a finding
 *   (a bijection would let row count masquerade as the engine's
 *   distinct-diagnostic count);
 * - the set of illegal diagnostics equals the doctrine's diagnostic catalogue
 *   in both directions;
 * - every declared vocabulary reference (`terms`, `obligation`) resolves in
 *   `vocabulary.json` — this proves the declared references resolve, not that
 *   the prose is exhausted by them;
 * - `vocabulary.json` equals the doctrine's vocabulary appendix in both
 *   directions, so neither surface can grow silently;
 * - no denylisted form name appears in `asserted` or `cause` (`colloquial` is
 *   exempt by design);
 * - every declared engine is exercised by at least one case;
 * - the schema's engine enum equals the vocabulary's engine list.
 *
 * `casesAdjudicableAt(stage)` is the selector a stage-N engine is judged on:
 * cases whose `stage` is at most N. Later cases are not-yet-adjudicable, not
 * pass or fail.
 *
 * Findings are data, not throws, so a caller can ledger them the way the other
 * realization audits do.
 *
 * Stage 1 adds the fixture ledger (`checkFixtureLedger`): fixtures validate
 * against the closed schemas, carry no answer (no case id, diagnostic code, or
 * form name anywhere in the line), bind 1:1 to the stage-adjudicable cases
 * with no orphans, and the holdout's recorded rule digest matches the engine
 * source it was authored against. The engine never imports this module.
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { Ajv } from "ajv";
import type { EvidenceClass } from "./judgment.js";
import { type Fixture, loadFixtureValidator, parseFixtures } from "./structure.js";

export type { EvidenceClass };

export interface Vocabulary {
  doctrine: string;
  engines: string[];
  namespaces: Record<string, string[]>;
}

export interface FormNames {
  denylist: string[];
}

export type Verdict = "illegal" | "unproven";

/**
 * An external standard that licenses a case's obligation. Evidence, never
 * vocabulary: `standard` names who requires it and `status` whether that
 * requirement is normative (a WCAG success criterion, an ARIA attribute
 * definition) or advisory (the ARIA Authoring Practices Guide, which is
 * explicitly non-normative). A guidance-only obligation is weaker evidence and
 * is marked as such rather than excluded.
 */
export interface CaseSource {
  standard: "wcag" | "aria" | "apg";
  status: "normative" | "guidance";
  ref: string;
  url?: string;
}

export interface CorpusCase {
  case: string;
  verdict: Verdict;
  diagnostic?: string;
  obligation?: string;
  engine: string;
  stage: number;
  evidence: EvidenceClass;
  asserted: string;
  cause: string;
  terms: string[];
  colloquial?: string;
  source?: CaseSource[];
}

export type CorpusFindingCode =
  | "CORPUS_VOCABULARY_MALFORMED"
  | "CORPUS_VOCABULARY_DOC_DRIFT"
  | "CORPUS_SCHEMA_ENGINE_DRIFT"
  | "CORPUS_SCHEMA_INVALID"
  | "CORPUS_CASE_DUPLICATE"
  | "CORPUS_ENGINE_UNKNOWN"
  | "CORPUS_ENGINE_UNEXERCISED"
  | "CORPUS_TERM_UNKNOWN"
  | "CORPUS_FORM_NAME_LEAK"
  | "CORPUS_SOURCE_UNCITED"
  | "CORPUS_DOC_DRIFT"
  | "CORPUS_CASE_DIAGNOSTIC_BIJECTION";

export interface CorpusFinding {
  code: CorpusFindingCode;
  /** The case id the finding is about, when there is one. */
  case?: string;
  detail: string;
}

/** The doctrine's machine-readable surfaces. */
export interface DoctrineFacts {
  /** Ids of the diagnostic catalogue rows. */
  diagnostics: Set<string>;
  /** The vocabulary appendix, parsed. */
  vocabulary: { engines: string[]; namespaces: Record<string, string[]> };
}

export interface CorpusInput {
  vocabulary: Vocabulary;
  formNames: FormNames;
  /** The parsed `corpus-case.schema.json`. */
  schema: Record<string, unknown>;
  cases: CorpusCase[];
  doctrine: DoctrineFacts;
}

const NAMESPACE_RE = /^[a-z-]+$/;
const TERM_NAME_RE = /^[a-z0-9-]+$/;
/**
 * A catalogue row in the doctrine is a table line whose first cell is a
 * backticked REL_ id. Anchored to line start so a REL_ code mentioned in prose
 * (the doctrine cites several) is not read as a catalogue row.
 */
const DOCTRINE_DIAGNOSTIC_ROW_RE = /^\| `(REL_[A-Z0-9_]+)` \|/gm;
/** A vocabulary appendix row: `| \`namespace\` | term · term · term |`. */
const DOCTRINE_VOCAB_ROW_RE = /^\| `([a-z-]+)` \| (.+?) \|$/gm;
const VOCAB_APPENDIX_HEADING = "## Vocabulary appendix";

/** Parse a JSONL file into cases, naming the line on a parse failure. */
export function parseJsonl(text: string): CorpusCase[] {
  const cases: CorpusCase[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      cases.push(JSON.parse(line) as CorpusCase);
    } catch (err) {
      throw new Error(`corpus.jsonl line ${i + 1}: ${(err as Error).message}`);
    }
  }
  return cases;
}

/** Ids of the doctrine's diagnostic catalogue rows. */
export function extractDoctrineDiagnostics(markdown: string): Set<string> {
  const ids = new Set<string>();
  for (const match of markdown.matchAll(DOCTRINE_DIAGNOSTIC_ROW_RE)) {
    ids.add(match[1]);
  }
  return ids;
}

/**
 * The doctrine's vocabulary appendix: the table under `## Vocabulary appendix`,
 * one row per namespace, terms separated by ` · `. The row named `engines` is
 * the engine list. Parsing stops at the next heading.
 */
export function extractDoctrineVocabulary(
  markdown: string,
): DoctrineFacts["vocabulary"] {
  const start = markdown.indexOf(VOCAB_APPENDIX_HEADING);
  if (start < 0) return { engines: [], namespaces: {} };
  const rest = markdown.slice(start + VOCAB_APPENDIX_HEADING.length);
  const nextHeading = rest.search(/^## /m);
  const section = nextHeading < 0 ? rest : rest.slice(0, nextHeading);

  const engines: string[] = [];
  const namespaces: Record<string, string[]> = {};
  for (const match of section.matchAll(DOCTRINE_VOCAB_ROW_RE)) {
    const name = match[1];
    const terms = match[2]
      .split("·")
      .map((t) => t.trim().replace(/^`|`$/g, ""))
      .filter((t) => t !== "");
    if (name === "engines") engines.push(...terms);
    else namespaces[name] = terms;
  }
  return { engines, namespaces };
}

export function extractDoctrineFacts(markdown: string): DoctrineFacts {
  return {
    diagnostics: extractDoctrineDiagnostics(markdown),
    vocabulary: extractDoctrineVocabulary(markdown),
  };
}

/** Cases a stage-N engine is judged on. */
export function casesAdjudicableAt(
  cases: CorpusCase[],
  stage: number,
): CorpusCase[] {
  return cases.filter((c) => Number.isInteger(c.stage) && c.stage <= stage);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sameSet(a: string[], b: string[]): boolean {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
}

function checkVocabulary(v: Vocabulary, out: CorpusFinding[]): void {
  if (!Array.isArray(v.engines) || v.engines.length === 0) {
    out.push({
      code: "CORPUS_VOCABULARY_MALFORMED",
      detail: "vocabulary.engines must be a non-empty array",
    });
  }
  for (const [ns, terms] of Object.entries(v.namespaces ?? {})) {
    if (!NAMESPACE_RE.test(ns)) {
      out.push({
        code: "CORPUS_VOCABULARY_MALFORMED",
        detail: `namespace "${ns}" is not kebab-case`,
      });
    }
    if (!Array.isArray(terms) || terms.length === 0) {
      out.push({
        code: "CORPUS_VOCABULARY_MALFORMED",
        detail: `namespace "${ns}" must be a non-empty array`,
      });
      continue;
    }
    for (const t of terms) {
      if (typeof t !== "string" || !TERM_NAME_RE.test(t)) {
        out.push({
          code: "CORPUS_VOCABULARY_MALFORMED",
          detail: `namespace "${ns}" term ${JSON.stringify(t)} is not kebab-case`,
        });
      }
    }
  }
}

function checkVocabularyAgainstDoctrine(
  v: Vocabulary,
  doc: DoctrineFacts["vocabulary"],
  out: CorpusFinding[],
): void {
  if (!sameSet(v.engines, doc.engines)) {
    out.push({
      code: "CORPUS_VOCABULARY_DOC_DRIFT",
      detail: `engines: vocabulary.json ${JSON.stringify(v.engines)} != doctrine appendix ${JSON.stringify(doc.engines)}`,
    });
  }
  const all = new Set([
    ...Object.keys(v.namespaces ?? {}),
    ...Object.keys(doc.namespaces),
  ]);
  for (const ns of all) {
    const a = v.namespaces?.[ns];
    const b = doc.namespaces[ns];
    if (!a) {
      out.push({
        code: "CORPUS_VOCABULARY_DOC_DRIFT",
        detail: `namespace "${ns}" is in the doctrine appendix but not in vocabulary.json`,
      });
      continue;
    }
    if (!b) {
      out.push({
        code: "CORPUS_VOCABULARY_DOC_DRIFT",
        detail: `namespace "${ns}" is in vocabulary.json but not in the doctrine appendix`,
      });
      continue;
    }
    for (const t of a) {
      if (!b.includes(t)) {
        out.push({
          code: "CORPUS_VOCABULARY_DOC_DRIFT",
          detail: `term "${ns}:${t}" is in vocabulary.json but not in the doctrine appendix`,
        });
      }
    }
    for (const t of b) {
      if (!a.includes(t)) {
        out.push({
          code: "CORPUS_VOCABULARY_DOC_DRIFT",
          detail: `term "${ns}:${t}" is in the doctrine appendix but not in vocabulary.json`,
        });
      }
    }
  }
}

function schemaEngineEnum(schema: Record<string, unknown>): string[] | null {
  const props = schema.properties as Record<string, unknown> | undefined;
  const engine = props?.engine as { enum?: unknown } | undefined;
  return Array.isArray(engine?.enum) ? (engine!.enum as string[]) : null;
}

function termResolves(v: Vocabulary, term: unknown): boolean {
  if (typeof term !== "string") return false;
  const sep = term.indexOf(":");
  if (sep <= 0) return false;
  const ns = term.slice(0, sep);
  const name = term.slice(sep + 1);
  return v.namespaces[ns]?.includes(name) ?? false;
}

/** Run every integrity check and return the findings (empty = clean). */
export function checkCorpus(input: CorpusInput): CorpusFinding[] {
  const out: CorpusFinding[] = [];
  const { vocabulary, formNames, schema, cases, doctrine } = input;

  checkVocabulary(vocabulary, out);
  checkVocabularyAgainstDoctrine(vocabulary, doctrine.vocabulary, out);

  const enumEngines = schemaEngineEnum(schema);
  if (enumEngines === null || !sameSet(enumEngines, vocabulary.engines)) {
    out.push({
      code: "CORPUS_SCHEMA_ENGINE_DRIFT",
      detail: `schema engine enum ${JSON.stringify(enumEngines)} != vocabulary.engines ${JSON.stringify(vocabulary.engines)}`,
    });
  }

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const engines = new Set(vocabulary.engines);
  const exercised = new Map<string, number>();
  for (const e of vocabulary.engines) exercised.set(e, 0);

  const denyPatterns = formNames.denylist.map(
    (phrase) =>
      [phrase, new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i")] as const,
  );

  const seenCases = new Set<string>();
  const casesPerDiagnostic = new Map<string, number>();

  for (const c of cases) {
    const id = typeof c.case === "string" ? c.case : "<no case>";

    if (!validate(c)) {
      const msg = (validate.errors ?? [])
        .map((er) => `${er.instancePath || "/"} ${er.message ?? ""}`.trim())
        .join("; ");
      out.push({ code: "CORPUS_SCHEMA_INVALID", case: id, detail: msg });
    }

    if (seenCases.has(id)) {
      out.push({
        code: "CORPUS_CASE_DUPLICATE",
        case: id,
        detail: `duplicate case ${id}`,
      });
    }
    seenCases.add(id);

    if (!engines.has(c.engine)) {
      out.push({
        code: "CORPUS_ENGINE_UNKNOWN",
        case: id,
        detail: `engine "${c.engine}" is not in vocabulary.engines`,
      });
    } else {
      exercised.set(c.engine, (exercised.get(c.engine) ?? 0) + 1);
    }

    for (const term of c.terms ?? []) {
      if (!termResolves(vocabulary, term)) {
        out.push({
          code: "CORPUS_TERM_UNKNOWN",
          case: id,
          detail: `term "${String(term)}" does not resolve in vocabulary.json`,
        });
      }
    }
    if (c.obligation !== undefined && !termResolves(vocabulary, c.obligation)) {
      out.push({
        code: "CORPUS_TERM_UNKNOWN",
        case: id,
        detail: `obligation "${String(c.obligation)}" does not resolve in vocabulary.json`,
      });
    }

    if (c.verdict === "illegal" && typeof c.diagnostic === "string") {
      casesPerDiagnostic.set(
        c.diagnostic,
        (casesPerDiagnostic.get(c.diagnostic) ?? 0) + 1,
      );
    }

    // A peer-projection conservation obligation is an external claim: it says
    // one projection of a relation must preserve what another carries. We did
    // not derive it from measurement theory, so the corpus must name who did.
    // Without this the family degenerates into obligations we invented and
    // then satisfied — the failure the whole answer-key discipline exists to
    // prevent. Terms are semantic on purpose; the standard is evidence, which
    // is why it lives here and not in vocabulary.json.
    if ((c.terms ?? []).some((t) => String(t).startsWith("projection:"))) {
      const cited = Array.isArray(c.source) ? c.source.length : 0;
      if (cited === 0) {
        out.push({
          code: "CORPUS_SOURCE_UNCITED",
          case: id,
          detail:
            "declares a projection: term but cites no external source; a projection-conservation obligation must name the standard that licenses it",
        });
      }
    }

    for (const field of ["asserted", "cause"] as const) {
      const text = c[field];
      if (typeof text !== "string") continue;
      for (const [phrase, re] of denyPatterns) {
        if (re.test(text)) {
          out.push({
            code: "CORPUS_FORM_NAME_LEAK",
            case: id,
            detail: `form name "${phrase}" appears in ${field}`,
          });
        }
      }
    }
  }

  for (const [engine, n] of exercised) {
    if (n === 0) {
      out.push({
        code: "CORPUS_ENGINE_UNEXERCISED",
        detail: `engine "${engine}" has no corpus case`,
      });
    }
  }

  // Case identity must not be a renaming of diagnostic identity. If every
  // diagnostic has exactly one case, the corpus cannot tell an engine that
  // partitions causes from one that names a diagnostic per row.
  if (
    casesPerDiagnostic.size > 0 &&
    [...casesPerDiagnostic.values()].every((n) => n === 1)
  ) {
    out.push({
      code: "CORPUS_CASE_DIAGNOSTIC_BIJECTION",
      detail: `every one of ${casesPerDiagnostic.size} diagnostics has exactly one case; at least one diagnostic must be shared by independent cases`,
    });
  }

  for (const d of doctrine.diagnostics) {
    if (!casesPerDiagnostic.has(d)) {
      out.push({
        code: "CORPUS_DOC_DRIFT",
        detail: `${d} is in the doctrine catalogue but no illegal case carries it`,
      });
    }
  }
  for (const d of casesPerDiagnostic.keys()) {
    if (!doctrine.diagnostics.has(d)) {
      out.push({
        code: "CORPUS_DOC_DRIFT",
        detail: `${d} is carried by a corpus case but is not in the doctrine catalogue`,
      });
    }
  }

  return out;
}

/** Load the pack directory and the doctrine into a `CorpusInput`. */
export function loadCorpusInput(
  packDir: string,
  doctrinePath: string,
): CorpusInput {
  const read = (name: string) =>
    fs.readFileSync(path.join(packDir, name), "utf-8");
  return {
    vocabulary: JSON.parse(read("vocabulary.json")) as Vocabulary,
    formNames: JSON.parse(read("form-names.json")) as FormNames,
    schema: JSON.parse(read("corpus-case.schema.json")) as Record<
      string,
      unknown
    >,
    cases: parseJsonl(read("corpus.jsonl")),
    doctrine: extractDoctrineFacts(fs.readFileSync(doctrinePath, "utf-8")),
  };
}

// ---------------------------------------------------------------------------
// Stage 1: the fixture ledger.
// ---------------------------------------------------------------------------

export type LedgerFindingCode =
  | "LEDGER_FIXTURE_INVALID"
  | "LEDGER_FIXTURE_DUPLICATE"
  | "LEDGER_FIXTURE_ANSWER_LEAK"
  | "LEDGER_FIXTURE_ORPHAN"
  | "LEDGER_BINDING_TARGET_MISSING"
  | "LEDGER_CASE_UNBOUND"
  | "LEDGER_BINDING_CASE_UNKNOWN"
  | "LEDGER_BINDING_NOT_INJECTIVE"
  | "LEDGER_NEIGHBOUR_UNKNOWN_DIAGNOSTIC"
  | "LEDGER_NEIGHBOUR_MISSING"
  | "LEDGER_HOLDOUT_UNBOUND"
  | "LEDGER_HOLDOUT_CONTAMINATED"
  | "LEDGER_HOLDOUT_RULE_DIGEST_MISMATCH";

export interface LedgerFinding {
  code: LedgerFindingCode;
  /** The fixture id the finding is about, when there is one. */
  fixture?: string;
  detail: string;
}

export interface TriadBinding {
  absent: string;
  satisfying: string;
  hostile: string;
  hostileDiagnostic: string;
}

export interface Bindings {
  cases: Record<string, string>;
  neighbours: Record<string, string>;
  triads: Record<string, TriadBinding>;
  special: Record<string, string | string[]>;
  holdout: string[];
}

/** A judgment in canonical tuple form (see `canonicalJudgment`): [code|term, subject, assertion, engine, evidenceClass]. */
export interface HoldoutExpectation {
  status: "admissible" | "illegal" | "unproven";
  diagnostics: [string, string, string, string, string][];
  obligations: [string, string, string, string, string][];
}

export interface Holdout {
  /** sha256 of the engine rule source at the time the expectations were authored. */
  ruleDigest: string;
  items: { fixture: string; expected: HoldoutExpectation }[];
}

export interface LedgerInput {
  stage: number;
  cases: CorpusCase[];
  doctrine: DoctrineFacts;
  formNames: FormNames;
  /** Raw lines of fixtures.jsonl, for the answer-leak scan. */
  fixtureLines: string[];
  fixtures: Fixture[];
  validateFixture: (fixture: unknown) => string[];
  bindings: Bindings;
  holdout: Holdout;
  /** sha256 of the engine rule source as it is now. */
  ruleSourceDigest: string;
}

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** What may never appear in a fixture line: an answer in any spelling. */
const ANSWER_LEAK_PATTERNS: readonly [string, RegExp][] = [
  ["case id", /\bCASE_[A-Z0-9_]+/],
  ["diagnostic code", /\bREL_[A-Z0-9_]+/],
];

/** Run every ledger check and return the findings (empty = clean). */
export function checkFixtureLedger(input: LedgerInput): LedgerFinding[] {
  const out: LedgerFinding[] = [];
  const { bindings, holdout, stage } = input;

  const ids = new Set<string>();
  for (const f of input.fixtures) {
    const errs = input.validateFixture(f);
    if (errs.length > 0) {
      out.push({ code: "LEDGER_FIXTURE_INVALID", fixture: f.id, detail: errs.join("; ") });
    }
    if (ids.has(f.id)) {
      out.push({ code: "LEDGER_FIXTURE_DUPLICATE", fixture: f.id, detail: `duplicate fixture ${f.id}` });
    }
    ids.add(f.id);
  }

  const deny = input.formNames.denylist.map(
    (phrase) => [phrase, new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i")] as const,
  );
  input.fixtureLines.forEach((line, i) => {
    if (line.trim() === "") return;
    const fixture = /"id":"(FX_[A-Z0-9_]+)"/.exec(line)?.[1];
    for (const [what, re] of ANSWER_LEAK_PATTERNS) {
      const m = re.exec(line);
      if (m) out.push({ code: "LEDGER_FIXTURE_ANSWER_LEAK", fixture, detail: `${what} "${m[0]}" on line ${i + 1}` });
    }
    for (const [phrase, re] of deny) {
      if (re.test(line)) out.push({ code: "LEDGER_FIXTURE_ANSWER_LEAK", fixture, detail: `form name "${phrase}" on line ${i + 1}` });
    }
  });

  const refs = new Map<string, string[]>();
  const ref = (id: string, where: string) => refs.set(id, [...(refs.get(id) ?? []), where]);
  for (const [c, f] of Object.entries(bindings.cases)) ref(f, `cases.${c}`);
  for (const [d, f] of Object.entries(bindings.neighbours)) ref(f, `neighbours.${d}`);
  for (const [t, tri] of Object.entries(bindings.triads)) {
    ref(tri.absent, `triads.${t}.absent`);
    ref(tri.satisfying, `triads.${t}.satisfying`);
    ref(tri.hostile, `triads.${t}.hostile`);
  }
  for (const [k, v] of Object.entries(bindings.special)) {
    for (const f of Array.isArray(v) ? v : [v]) ref(f, `special.${k}`);
  }
  for (const f of bindings.holdout) ref(f, "holdout");
  for (const [f, where] of refs) {
    if (!ids.has(f)) {
      out.push({ code: "LEDGER_BINDING_TARGET_MISSING", fixture: f, detail: `${where.join(", ")} references missing fixture ${f}` });
    }
  }
  for (const id of ids) {
    if (!refs.has(id)) out.push({ code: "LEDGER_FIXTURE_ORPHAN", fixture: id, detail: `fixture ${id} is referenced by no ledger section` });
  }

  const adjudicable = new Map(casesAdjudicableAt(input.cases, stage).map((c) => [c.case, c] as const));
  for (const id of adjudicable.keys()) {
    if (!(id in bindings.cases)) out.push({ code: "LEDGER_CASE_UNBOUND", detail: `stage-${stage} case ${id} has no fixture binding` });
  }
  const targets = new Map<string, string[]>();
  for (const [c, f] of Object.entries(bindings.cases)) {
    if (!adjudicable.has(c)) {
      out.push({ code: "LEDGER_BINDING_CASE_UNKNOWN", fixture: f, detail: `${c} is not a corpus case adjudicable at stage ${stage}` });
    }
    targets.set(f, [...(targets.get(f) ?? []), c]);
  }
  for (const [f, cs] of targets) {
    if (cs.length > 1) out.push({ code: "LEDGER_BINDING_NOT_INJECTIVE", fixture: f, detail: `${cs.join(", ")} all bind to ${f}` });
  }

  const carried = new Set<string>();
  for (const c of adjudicable.values()) {
    if (c.verdict === "illegal" && typeof c.diagnostic === "string") carried.add(c.diagnostic);
  }
  for (const d of Object.keys(bindings.neighbours)) {
    if (!input.doctrine.diagnostics.has(d)) {
      out.push({ code: "LEDGER_NEIGHBOUR_UNKNOWN_DIAGNOSTIC", detail: `neighbour key ${d} is not in the doctrine catalogue` });
    }
  }
  for (const d of carried) {
    if (!(d in bindings.neighbours)) out.push({ code: "LEDGER_NEIGHBOUR_MISSING", detail: `${d} has no legal near-neighbour fixture` });
  }

  const items = new Set(holdout.items.map((i) => i.fixture));
  const bound = new Set(bindings.holdout);
  for (const f of items) {
    if (!bound.has(f)) out.push({ code: "LEDGER_HOLDOUT_UNBOUND", fixture: f, detail: `holdout.json item ${f} is not listed in bindings.holdout` });
    if (targets.has(f)) out.push({ code: "LEDGER_HOLDOUT_CONTAMINATED", fixture: f, detail: `holdout fixture ${f} is also a case fixture` });
  }
  for (const f of bound) {
    if (!items.has(f)) out.push({ code: "LEDGER_HOLDOUT_UNBOUND", fixture: f, detail: `bindings.holdout lists ${f} but holdout.json has no expectation for it` });
  }
  if (holdout.ruleDigest !== input.ruleSourceDigest) {
    out.push({
      code: "LEDGER_HOLDOUT_RULE_DIGEST_MISMATCH",
      detail: `holdout authored against rule digest ${holdout.ruleDigest}; engine source is now ${input.ruleSourceDigest} — re-verify every expectation by hand and re-record`,
    });
  }

  return out;
}

/** Load the fixture ledger, the corpus it binds to, and the engine source digest. */
export function loadLedgerInput(
  contractsDir: string,
  doctrinePath: string,
  ruleSourcePath: string,
  stage = 1,
): LedgerInput {
  const read = (rel: string) => fs.readFileSync(path.join(contractsDir, rel), "utf-8");
  const fixtureText = read("analytical-fixtures/fixtures.jsonl");
  return {
    stage,
    cases: parseJsonl(read("analytical-pack/corpus.jsonl")),
    doctrine: extractDoctrineFacts(fs.readFileSync(doctrinePath, "utf-8")),
    formNames: JSON.parse(read("analytical-pack/form-names.json")) as FormNames,
    fixtureLines: fixtureText.split("\n"),
    fixtures: parseFixtures(fixtureText),
    validateFixture: loadFixtureValidator(contractsDir),
    bindings: JSON.parse(read("analytical-fixtures/bindings.json")) as Bindings,
    holdout: JSON.parse(read("analytical-fixtures/holdout.json")) as Holdout,
    ruleSourceDigest: sha256(fs.readFileSync(ruleSourcePath, "utf-8")),
  };
}
