/**
 * Pins the illegal-form corpus (stage 0 of ARCH-ANALYTICAL-RELATION-001).
 *
 * Two layers:
 * 1. The live pack is clean and is the doctrine's table — every entry
 *    validates, resolves every term, leaks no form name, exercises every
 *    engine, and matches the doctrine row-for-row.
 * 2. The checker can fail for the right reason. Each finding code is reached
 *    by mutating the live input, so a checker that silently stopped checking
 *    would be caught here rather than by the corpus staying green.
 */
import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import {
  checkCorpus,
  extractDoctrineIds,
  loadCorpusInput,
  parseJsonl,
  type CorpusInput,
} from "./corpus-integrity.js";

const PACK_DIR = resolve(__dirname, "../../../ds-contracts/analytical-pack");
const DOCTRINE = resolve(
  __dirname,
  "../../../../docs/architecture/analytical-relation-doctrine.md",
);

const live = (): CorpusInput => loadCorpusInput(PACK_DIR, DOCTRINE);

const mutate = (fn: (c: CorpusInput) => void) => {
  const c = live();
  fn(c);
  return checkCorpus(c);
};

const codes = (findings: ReturnType<typeof checkCorpus>) =>
  findings.map((f) => f.code);

describe("illegal-form corpus (live pack)", () => {
  it("is clean: validates, resolves every term, leaks no form name, exercises every engine, matches the doctrine", () => {
    const input = live();
    const findings = checkCorpus(input);
    expect(findings).toEqual([]);
    // the corpus is the doctrine's table, not a subset of it
    expect(input.entries.length).toBe(input.doctrineIds.size);
    expect(input.entries.length).toBeGreaterThanOrEqual(36);
  });

  it("attributes at least one entry to each of the doctrine's checkability engines", () => {
    const input = live();
    const perEngine = new Map<string, number>();
    for (const e of input.entries) {
      perEngine.set(e.engine, (perEngine.get(e.engine) ?? 0) + 1);
    }
    for (const engine of input.vocabulary.engines) {
      expect(perEngine.get(engine) ?? 0, `engine ${engine}`).toBeGreaterThan(0);
    }
  });

  it("every corpus term is namespaced and every namespace it uses is declared", () => {
    const input = live();
    const used = new Set<string>();
    for (const e of input.entries) for (const t of e.terms) used.add(t.split(":")[0]);
    for (const ns of used) {
      expect(Object.keys(input.vocabulary.namespaces), `namespace ${ns}`).toContain(ns);
    }
  });
});

describe("corpus-integrity can fail for the right reason", () => {
  it("a duplicated id is CORPUS_ID_DUPLICATE", () => {
    const f = mutate((c) => c.entries.push({ ...c.entries[0] }));
    expect(codes(f)).toContain("CORPUS_ID_DUPLICATE");
  });

  it("an engine outside vocabulary.engines is CORPUS_ENGINE_UNKNOWN (and fails the schema enum)", () => {
    const f = mutate((c) => {
      c.entries[0].engine = "vibes";
    });
    expect(codes(f)).toContain("CORPUS_ENGINE_UNKNOWN");
    expect(codes(f)).toContain("CORPUS_SCHEMA_INVALID");
  });

  it("a term the vocabulary lacks is CORPUS_TERM_UNKNOWN and the finding names the term", () => {
    const f = mutate((c) => c.entries[0].terms.push("scale:vibes"));
    const hit = f.find((x) => x.code === "CORPUS_TERM_UNKNOWN");
    expect(hit?.detail).toContain('"scale:vibes"');
    expect(hit?.id).toBe("REL_MEANINGFULNESS_ORDINAL_MEAN");
  });

  it("an unnamespaced term is CORPUS_TERM_UNKNOWN even if the bare word exists somewhere", () => {
    const f = mutate((c) => c.entries[0].terms.push("ordinal"));
    expect(codes(f)).toContain("CORPUS_TERM_UNKNOWN");
  });

  it("a form name in `cause` is CORPUS_FORM_NAME_LEAK naming the phrase and the field", () => {
    const f = mutate((c) => {
      c.entries[0].cause = "this is just a bad bar chart";
    });
    const hits = f.filter((x) => x.code === "CORPUS_FORM_NAME_LEAK");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.map((h) => h.detail)).toContain('form name "bar chart" appears in cause');
  });

  it("a form name in `asserted` is CORPUS_FORM_NAME_LEAK", () => {
    const f = mutate((c) => {
      c.entries[0].asserted = "a histogram of scores";
    });
    expect(f.some((x) => x.code === "CORPUS_FORM_NAME_LEAK" && x.detail.includes("asserted"))).toBe(true);
  });

  it("a form name in `colloquial` is NOT a leak — that field exists to carry the downstream name", () => {
    const f = mutate((c) => {
      c.entries[0].colloquial = "a pie chart, a bar chart, a candlestick";
    });
    expect(codes(f)).not.toContain("CORPUS_FORM_NAME_LEAK");
  });

  it("form-name matching is whole-word: 'barrier' does not match 'bar'", () => {
    const f = mutate((c) => {
      c.entries[0].cause = "a barrier to interpretation";
    });
    expect(codes(f)).not.toContain("CORPUS_FORM_NAME_LEAK");
  });

  it("an id in the doctrine table but not in the corpus is CORPUS_DOC_DRIFT", () => {
    const f = mutate((c) => c.doctrineIds.add("REL_ONLY_IN_DOC"));
    const hit = f.find((x) => x.code === "CORPUS_DOC_DRIFT");
    expect(hit?.id).toBe("REL_ONLY_IN_DOC");
    expect(hit?.detail).toContain("not in illegal-forms.jsonl");
  });

  it("an id in the corpus but not in the doctrine table is CORPUS_DOC_DRIFT", () => {
    const f = mutate((c) =>
      c.entries.push({ ...c.entries[0], id: "REL_ONLY_IN_CORPUS" }),
    );
    const hit = f.find((x) => x.code === "CORPUS_DOC_DRIFT");
    expect(hit?.id).toBe("REL_ONLY_IN_CORPUS");
    expect(hit?.detail).toContain("not in the doctrine table");
  });

  it("an engine with no entry is CORPUS_ENGINE_UNEXERCISED — a decorative engine is a finding", () => {
    const f = mutate((c) => {
      c.vocabulary.engines.push("perceptual-effectiveness");
      // schema enum must follow, or the drift check fires first
      const props = c.schema.properties as Record<string, { enum: string[] }>;
      props.engine.enum = [...c.vocabulary.engines];
    });
    expect(codes(f)).toContain("CORPUS_ENGINE_UNEXERCISED");
    expect(codes(f)).not.toContain("CORPUS_SCHEMA_ENGINE_DRIFT");
  });

  it("schema engine enum diverging from vocabulary.engines is CORPUS_SCHEMA_ENGINE_DRIFT", () => {
    const f = mutate((c) => {
      const props = c.schema.properties as Record<string, { enum: string[] }>;
      props.engine.enum = props.engine.enum.slice(1);
    });
    expect(codes(f)).toContain("CORPUS_SCHEMA_ENGINE_DRIFT");
  });

  it("an unknown property on an entry is CORPUS_SCHEMA_INVALID (additionalProperties: false)", () => {
    const f = mutate((c) => {
      (c.entries[0] as unknown as Record<string, unknown>).chartType = "bar";
    });
    const hit = f.find((x) => x.code === "CORPUS_SCHEMA_INVALID");
    expect(hit?.detail).toContain("additional properties");
  });

  it("a malformed id fails the schema pattern", () => {
    const f = mutate((c) => {
      c.entries[0].id = "rel_lowercase";
    });
    expect(codes(f)).toContain("CORPUS_SCHEMA_INVALID");
  });

  it("a non-kebab vocabulary term is CORPUS_VOCABULARY_MALFORMED", () => {
    const f = mutate((c) => c.vocabulary.namespaces.scale.push("Bad Term"));
    expect(codes(f)).toContain("CORPUS_VOCABULARY_MALFORMED");
  });
});

describe("doctrine id extraction", () => {
  it("reads only table rows, not REL_ codes mentioned in prose", () => {
    const md = [
      "Averaging a ratio is `REL_RATIO_MEASURE_AVERAGED`, not a rendering choice.",
      "| Id | Asserted | Because | Colloquially |",
      "|---|---|---|---|",
      "| `REL_A` | x | y | z |",
      "| `REL_B_2` | x | y | z |",
      "  | `REL_INDENTED` | not a row at line start |",
    ].join("\n");
    expect([...extractDoctrineIds(md)]).toEqual(["REL_A", "REL_B_2"]);
  });
});

describe("parseJsonl", () => {
  it("skips blank lines and names the failing line on bad JSON", () => {
    expect(parseJsonl('{"id":"REL_X"}\n\n{"id":"REL_Y"}\n').map((e) => e.id)).toEqual([
      "REL_X",
      "REL_Y",
    ]);
    expect(() => parseJsonl('{"id":"REL_X"}\n{not json}')).toThrow(/line 2/);
  });
});
