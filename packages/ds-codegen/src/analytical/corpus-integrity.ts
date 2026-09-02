/**
 * Integrity checker for the analytical pack's illegal-form corpus.
 *
 * Stage 0 of `docs/architecture/analytical-relation-doctrine.md`
 * (ARCH-ANALYTICAL-RELATION-001). This is NOT the admissibility engine — no
 * relation is typed and no projection is judged here. It checks the pack
 * against itself and against the doctrine so the corpus cannot drift from the
 * vocabulary it claims to be written in:
 *
 * - every entry validates against `illegal-form.schema.json`;
 * - ids are unique and match the doctrine's corpus table (two-directional);
 * - every `terms` entry resolves in `vocabulary.json` — the mechanical form of
 *   the stage-0 falsifier ("can every entry be described in L0–L3 vocabulary
 *   without a form name?");
 * - no denylisted form name appears in `asserted` or `cause` (`colloquial` is
 *   exempt by design);
 * - every declared engine is exercised by at least one entry, so no engine is
 *   decorative;
 * - the schema's engine enum equals the vocabulary's engine list.
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

export interface IllegalFormEntry {
  id: string;
  engine: string;
  asserted: string;
  cause: string;
  terms: string[];
  colloquial?: string;
}

export type CorpusFindingCode =
  | "CORPUS_VOCABULARY_MALFORMED"
  | "CORPUS_SCHEMA_ENGINE_DRIFT"
  | "CORPUS_SCHEMA_INVALID"
  | "CORPUS_ID_DUPLICATE"
  | "CORPUS_ENGINE_UNKNOWN"
  | "CORPUS_ENGINE_UNEXERCISED"
  | "CORPUS_TERM_UNKNOWN"
  | "CORPUS_FORM_NAME_LEAK"
  | "CORPUS_DOC_DRIFT";

export interface CorpusFinding {
  code: CorpusFindingCode;
  /** The entry id the finding is about, when there is one. */
  id?: string;
  detail: string;
}

export interface CorpusInput {
  vocabulary: Vocabulary;
  formNames: FormNames;
  /** The parsed `illegal-form.schema.json`. */
  schema: Record<string, unknown>;
  entries: IllegalFormEntry[];
  /** Ids extracted from the doctrine's corpus table. */
  doctrineIds: Set<string>;
}

const NAMESPACE_RE = /^[a-z-]+$/;
const TERM_NAME_RE = /^[a-z0-9-]+$/;
/**
 * A corpus row in the doctrine is a table line whose first cell is a
 * backticked REL_ id. Anchored to line start so a REL_ code mentioned in prose
 * (the doctrine cites several) is not read as a corpus row.
 */
const DOCTRINE_ROW_RE = /^\| `(REL_[A-Z0-9_]+)` \|/gm;

/** Parse a JSONL file into entries, naming the line on a parse failure. */
export function parseJsonl(text: string): IllegalFormEntry[] {
  const entries: IllegalFormEntry[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    try {
      entries.push(JSON.parse(line) as IllegalFormEntry);
    } catch (err) {
      throw new Error(
        `illegal-forms.jsonl line ${i + 1}: ${(err as Error).message}`,
      );
    }
  }
  return entries;
}

/** Ids of the doctrine's corpus table rows. */
export function extractDoctrineIds(markdown: string): Set<string> {
  const ids = new Set<string>();
  for (const match of markdown.matchAll(DOCTRINE_ROW_RE)) {
    ids.add(match[1]);
  }
  return ids;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function schemaEngineEnum(schema: Record<string, unknown>): string[] | null {
  const props = schema.properties as Record<string, unknown> | undefined;
  const engine = props?.engine as { enum?: unknown } | undefined;
  return Array.isArray(engine?.enum) ? (engine!.enum as string[]) : null;
}

function sameSet(a: string[], b: string[]): boolean {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const x of sa) if (!sb.has(x)) return false;
  return true;
}

/** Run every integrity check and return the findings (empty = clean). */
export function checkCorpus(input: CorpusInput): CorpusFinding[] {
  const out: CorpusFinding[] = [];
  const { vocabulary, formNames, schema, entries, doctrineIds } = input;

  checkVocabulary(vocabulary, out);

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
    (phrase) => [phrase, new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i")] as const,
  );

  const seen = new Set<string>();
  for (const entry of entries) {
    const id = typeof entry.id === "string" ? entry.id : "<no id>";

    if (!validate(entry)) {
      const msg = (validate.errors ?? [])
        .map((er) => `${er.instancePath || "/"} ${er.message ?? ""}`.trim())
        .join("; ");
      out.push({ code: "CORPUS_SCHEMA_INVALID", id, detail: msg });
    }

    if (seen.has(id)) {
      out.push({ code: "CORPUS_ID_DUPLICATE", id, detail: `duplicate id ${id}` });
    }
    seen.add(id);

    if (!engines.has(entry.engine)) {
      out.push({
        code: "CORPUS_ENGINE_UNKNOWN",
        id,
        detail: `engine "${entry.engine}" is not in vocabulary.engines`,
      });
    } else {
      exercised.set(entry.engine, (exercised.get(entry.engine) ?? 0) + 1);
    }

    for (const term of entry.terms ?? []) {
      const sep = typeof term === "string" ? term.indexOf(":") : -1;
      const ns = sep > 0 ? term.slice(0, sep) : "";
      const name = sep > 0 ? term.slice(sep + 1) : "";
      const known = ns !== "" && vocabulary.namespaces[ns]?.includes(name);
      if (!known) {
        out.push({
          code: "CORPUS_TERM_UNKNOWN",
          id,
          detail: `term "${term}" does not resolve in vocabulary.json`,
        });
      }
    }

    for (const field of ["asserted", "cause"] as const) {
      const text = entry[field];
      if (typeof text !== "string") continue;
      for (const [phrase, re] of denyPatterns) {
        if (re.test(text)) {
          out.push({
            code: "CORPUS_FORM_NAME_LEAK",
            id,
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
        detail: `engine "${engine}" has no corpus entry`,
      });
    }
  }

  for (const id of doctrineIds) {
    if (!seen.has(id)) {
      out.push({
        code: "CORPUS_DOC_DRIFT",
        id,
        detail: `${id} is in the doctrine table but not in illegal-forms.jsonl`,
      });
    }
  }
  for (const id of seen) {
    if (!doctrineIds.has(id)) {
      out.push({
        code: "CORPUS_DOC_DRIFT",
        id,
        detail: `${id} is in illegal-forms.jsonl but not in the doctrine table`,
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
    schema: JSON.parse(read("illegal-form.schema.json")) as Record<
      string,
      unknown
    >,
    entries: parseJsonl(read("illegal-forms.jsonl")),
    doctrineIds: extractDoctrineIds(fs.readFileSync(doctrinePath, "utf-8")),
  };
}
