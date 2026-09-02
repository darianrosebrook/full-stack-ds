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
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { Ajv } from "ajv";

export interface Vocabulary {
  doctrine: string;
  engines: string[];
  namespaces: Record<string, string[]>;
}

export interface FormNames {
  denylist: string[];
}

export type Verdict = "illegal" | "unproven";
export type EvidenceClass = "schema" | "instance";

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
