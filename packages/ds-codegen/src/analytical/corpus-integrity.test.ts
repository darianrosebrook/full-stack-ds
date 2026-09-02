/**
 * Pins the analytical corpus contract (stage 0.5 of ARCH-ANALYTICAL-RELATION-001).
 *
 * Three layers:
 * 1. The live pack is clean and is the doctrine: every case validates, every
 *    declared reference resolves, no form name leaks, every engine is
 *    exercised, the illegal diagnostics equal the catalogue, and the
 *    vocabulary equals the doctrine appendix.
 * 2. The corpus has the shape the stage-1 engine needs: case identity is
 *    separate from diagnostic identity (shared diagnostics exist), stage-1
 *    cases are a non-empty selectable subset, and unproven cases carry a
 *    resolvable obligation.
 * 3. The checker can fail for the right reason. Each finding code is reached
 *    by mutating the live input, so a checker that silently stopped checking
 *    would be caught here rather than by the corpus staying green.
 */
import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import {
  casesAdjudicableAt,
  checkCorpus,
  extractDoctrineDiagnostics,
  extractDoctrineVocabulary,
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

describe("analytical corpus (live pack)", () => {
  it("is clean: validates, resolves every reference, leaks no form name, exercises every engine, equals the doctrine", () => {
    const input = live();
    expect(checkCorpus(input)).toEqual([]);
    expect(input.cases.length).toBeGreaterThanOrEqual(50);
    expect(input.doctrine.diagnostics.size).toBeGreaterThanOrEqual(40);
  });

  it("case identity is not diagnostic identity: cases outnumber diagnostics and several diagnostics are shared", () => {
    const input = live();
    const illegal = input.cases.filter((c) => c.verdict === "illegal");
    const per = new Map<string, string[]>();
    for (const c of illegal) {
      per.set(c.diagnostic!, [...(per.get(c.diagnostic!) ?? []), c.case]);
    }
    const shared = [...per.entries()].filter(([, cs]) => cs.length > 1);
    expect(illegal.length).toBeGreaterThan(per.size);
    expect(shared.length).toBeGreaterThanOrEqual(5);
    // the two reviewer-named collapses are real: one causal diagnostic, independent observations
    expect(per.get("REL_UNIT_INCOMMENSURABLE_SHARED_SCALE")?.length).toBe(2);
    expect(per.get("REL_ADDITIVITY_SUM_SEMIADDITIVE")?.length).toBe(2);
  });

  it("stage-1 cases are a non-empty subset decidable from L0-L2, and include an unproven case with a resolvable obligation", () => {
    const input = live();
    const s1 = casesAdjudicableAt(input.cases, 1);
    expect(s1.length).toBeGreaterThanOrEqual(15);
    expect(s1.every((c) => c.stage === 1)).toBe(true);
    const unproven = s1.filter((c) => c.verdict === "unproven");
    expect(unproven.length).toBeGreaterThanOrEqual(2);
    for (const c of unproven) {
      const [ns, name] = c.obligation!.split(":");
      expect(input.vocabulary.namespaces[ns], c.case).toContain(name);
    }
    // a stage-1 engine is never judged on a projection-level case
    expect(s1.some((c) => c.terms.some((t) => t.startsWith("channel:")))).toBe(
      true,
    ); // INTERVAL_RATIO mentions length, and that is fine: the FACT is L0
    expect(s1.some((c) => c.terms.some((t) => t.startsWith("combinator:")))).toBe(
      false,
    );
  });

  it("the stage selector is cumulative: stage 3 includes stages 1 and 2, stage 6 includes everything", () => {
    const input = live();
    const s3 = casesAdjudicableAt(input.cases, 3);
    expect(s3.every((c) => c.stage <= 3)).toBe(true);
    expect(s3.length).toBeGreaterThan(casesAdjudicableAt(input.cases, 2).length);
    expect(casesAdjudicableAt(input.cases, 6).length).toBe(input.cases.length);
  });

  it("every case declares an evidence class, and instance-evidence cases exist for both verdicts", () => {
    const input = live();
    const instance = input.cases.filter((c) => c.evidence === "instance");
    expect(instance.some((c) => c.verdict === "illegal")).toBe(true);
    expect(instance.some((c) => c.verdict === "unproven")).toBe(true);
  });

  it("attributes at least one case to each of the doctrine's checkability engines", () => {
    const input = live();
    const perEngine = new Map<string, number>();
    for (const c of input.cases) {
      perEngine.set(c.engine, (perEngine.get(c.engine) ?? 0) + 1);
    }
    for (const engine of input.vocabulary.engines) {
      expect(perEngine.get(engine) ?? 0, `engine ${engine}`).toBeGreaterThan(0);
    }
  });
});

describe("corpus-integrity can fail for the right reason", () => {
  it("a duplicated case id is CORPUS_CASE_DUPLICATE", () => {
    const f = mutate((c) => c.cases.push({ ...c.cases[0] }));
    expect(codes(f)).toContain("CORPUS_CASE_DUPLICATE");
  });

  it("two cases sharing a diagnostic is NOT a finding; every diagnostic having exactly one case IS", () => {
    const f = mutate((c) => {
      const seen = new Set<string>();
      c.cases = c.cases.filter((k) => {
        if (k.verdict !== "illegal") return true;
        if (seen.has(k.diagnostic!)) return false;
        seen.add(k.diagnostic!);
        return true;
      });
    });
    const hit = f.find((x) => x.code === "CORPUS_CASE_DIAGNOSTIC_BIJECTION");
    expect(hit?.detail).toContain("exactly one case");
    expect(codes(checkCorpus(live()))).not.toContain(
      "CORPUS_CASE_DIAGNOSTIC_BIJECTION",
    );
  });

  it("an illegal case without a diagnostic, or an unproven case with one, fails the schema", () => {
    const noDiag = mutate((c) => {
      delete c.cases[0].diagnostic;
    });
    expect(codes(noDiag)).toContain("CORPUS_SCHEMA_INVALID");
    const both = mutate((c) => {
      const u = c.cases.find((k) => k.verdict === "unproven")!;
      u.diagnostic = "REL_SHOULD_NOT_BE_HERE";
    });
    expect(codes(both)).toContain("CORPUS_SCHEMA_INVALID");
  });

  it("an unproven case whose obligation is not vocabulary is CORPUS_TERM_UNKNOWN naming the obligation", () => {
    const f = mutate((c) => {
      const u = c.cases.find((k) => k.verdict === "unproven")!;
      u.obligation = "grain:vibes";
    });
    const hit = f.find((x) => x.code === "CORPUS_TERM_UNKNOWN");
    expect(hit?.detail).toContain('obligation "grain:vibes"');
  });

  it("a stage outside 1..6 or a non-integer stage fails the schema", () => {
    expect(codes(mutate((c) => { c.cases[0].stage = 7; }))).toContain("CORPUS_SCHEMA_INVALID");
    expect(codes(mutate((c) => { c.cases[0].stage = 1.5; }))).toContain("CORPUS_SCHEMA_INVALID");
  });

  it("an engine outside vocabulary.engines is CORPUS_ENGINE_UNKNOWN (and fails the schema enum)", () => {
    const f = mutate((c) => {
      c.cases[0].engine = "vibes";
    });
    expect(codes(f)).toContain("CORPUS_ENGINE_UNKNOWN");
    expect(codes(f)).toContain("CORPUS_SCHEMA_INVALID");
  });

  it("a term the vocabulary lacks is CORPUS_TERM_UNKNOWN and the finding names the term and the case", () => {
    const f = mutate((c) => c.cases[0].terms.push("scale:vibes"));
    const hit = f.find((x) => x.code === "CORPUS_TERM_UNKNOWN");
    expect(hit?.detail).toContain('"scale:vibes"');
    expect(hit?.case).toBe("CASE_AVERAGE_SATISFACTION_SCORE");
  });

  it("an unnamespaced term is CORPUS_TERM_UNKNOWN even if the bare word exists somewhere", () => {
    const f = mutate((c) => c.cases[0].terms.push("ordinal"));
    expect(codes(f)).toContain("CORPUS_TERM_UNKNOWN");
  });

  it("a form name in `cause` is CORPUS_FORM_NAME_LEAK naming the phrase and the field", () => {
    const f = mutate((c) => {
      c.cases[0].cause = "this is just a bad bar chart";
    });
    const hits = f.filter((x) => x.code === "CORPUS_FORM_NAME_LEAK");
    expect(hits.map((h) => h.detail)).toContain(
      'form name "bar chart" appears in cause',
    );
  });

  it("a form name in `asserted` is CORPUS_FORM_NAME_LEAK", () => {
    const f = mutate((c) => {
      c.cases[0].asserted = "a histogram of scores";
    });
    expect(
      f.some(
        (x) => x.code === "CORPUS_FORM_NAME_LEAK" && x.detail.includes("asserted"),
      ),
    ).toBe(true);
  });

  it("a form name in `colloquial` is NOT a leak — that field exists to carry the downstream name", () => {
    const f = mutate((c) => {
      c.cases[0].colloquial = "a pie chart, a bar chart, a candlestick";
    });
    expect(codes(f)).not.toContain("CORPUS_FORM_NAME_LEAK");
  });

  it("form-name matching is whole-word: 'barrier' does not match 'bar'", () => {
    const f = mutate((c) => {
      c.cases[0].cause = "a barrier to interpretation";
    });
    expect(codes(f)).not.toContain("CORPUS_FORM_NAME_LEAK");
  });

  it("a diagnostic in the doctrine catalogue with no illegal case is CORPUS_DOC_DRIFT", () => {
    const f = mutate((c) => c.doctrine.diagnostics.add("REL_ONLY_IN_DOC"));
    const hit = f.find((x) => x.code === "CORPUS_DOC_DRIFT");
    expect(hit?.detail).toContain("REL_ONLY_IN_DOC");
    expect(hit?.detail).toContain("no illegal case carries it");
  });

  it("a diagnostic carried by a case but absent from the catalogue is CORPUS_DOC_DRIFT", () => {
    const f = mutate((c) =>
      c.cases.push({
        ...c.cases[0],
        case: "CASE_ONLY_IN_CORPUS",
        diagnostic: "REL_ONLY_IN_CORPUS",
      }),
    );
    const hit = f.find((x) => x.code === "CORPUS_DOC_DRIFT");
    expect(hit?.detail).toContain("REL_ONLY_IN_CORPUS");
    expect(hit?.detail).toContain("not in the doctrine catalogue");
  });

  it("a vocabulary term with no doctrine-appendix entry is CORPUS_VOCABULARY_DOC_DRIFT, and vice versa", () => {
    const added = mutate((c) => c.vocabulary.namespaces.scale.push("vibes"));
    expect(
      added.find((x) => x.code === "CORPUS_VOCABULARY_DOC_DRIFT")?.detail,
    ).toContain('"scale:vibes" is in vocabulary.json but not in the doctrine appendix');
    const removed = mutate((c) => {
      c.vocabulary.namespaces.scale = c.vocabulary.namespaces.scale.filter(
        (t) => t !== "cyclic",
      );
    });
    expect(
      removed.find((x) => x.code === "CORPUS_VOCABULARY_DOC_DRIFT")?.detail,
    ).toContain('"scale:cyclic" is in the doctrine appendix but not in vocabulary.json');
    const ns = mutate((c) => {
      c.vocabulary.namespaces.vibes = ["a"];
    });
    expect(codes(ns)).toContain("CORPUS_VOCABULARY_DOC_DRIFT");
  });

  it("an engine with no case is CORPUS_ENGINE_UNEXERCISED — a decorative engine is a finding", () => {
    const f = mutate((c) => {
      c.vocabulary.engines.push("perceptual-effectiveness");
      c.doctrine.vocabulary.engines.push("perceptual-effectiveness");
      const props = c.schema.properties as Record<string, { enum: string[] }>;
      props.engine.enum = [...c.vocabulary.engines];
    });
    expect(codes(f)).toContain("CORPUS_ENGINE_UNEXERCISED");
    expect(codes(f)).not.toContain("CORPUS_SCHEMA_ENGINE_DRIFT");
    expect(codes(f)).not.toContain("CORPUS_VOCABULARY_DOC_DRIFT");
  });

  it("schema engine enum diverging from vocabulary.engines is CORPUS_SCHEMA_ENGINE_DRIFT", () => {
    const f = mutate((c) => {
      const props = c.schema.properties as Record<string, { enum: string[] }>;
      props.engine.enum = props.engine.enum.slice(1);
    });
    expect(codes(f)).toContain("CORPUS_SCHEMA_ENGINE_DRIFT");
  });

  it("an unknown property on a case is CORPUS_SCHEMA_INVALID (additionalProperties: false)", () => {
    const f = mutate((c) => {
      (c.cases[0] as unknown as Record<string, unknown>).chartType = "bar";
    });
    const hit = f.find((x) => x.code === "CORPUS_SCHEMA_INVALID");
    expect(hit?.detail).toContain("additional properties");
  });

  it("a malformed case id fails the schema pattern", () => {
    const f = mutate((c) => {
      c.cases[0].case = "case_lowercase";
    });
    expect(codes(f)).toContain("CORPUS_SCHEMA_INVALID");
  });

  it("a non-kebab vocabulary term is CORPUS_VOCABULARY_MALFORMED", () => {
    const f = mutate((c) => {
      c.vocabulary.namespaces.scale.push("Bad Term");
      c.doctrine.vocabulary.namespaces.scale.push("Bad Term");
    });
    expect(codes(f)).toContain("CORPUS_VOCABULARY_MALFORMED");
  });
});

describe("doctrine extraction", () => {
  it("reads diagnostic ids only from table rows, not REL_ codes mentioned in prose", () => {
    const md = [
      "Averaging a ratio is `REL_RATIO_MEASURE_AVERAGED`, not a rendering choice.",
      "| Diagnostic | Engine | Stage | Cause | Colloquially |",
      "|---|---|---|---|---|",
      "| `REL_A` | x | 1 | y | z |",
      "| `REL_B_2` | x | 1 | y | z |",
      "  | `REL_INDENTED` | not a row at line start |",
    ].join("\n");
    expect([...extractDoctrineDiagnostics(md)]).toEqual(["REL_A", "REL_B_2"]);
  });

  it("reads the vocabulary appendix table, stops at the next heading, and treats the `engines` row as the engine list", () => {
    const md = [
      "## Vocabulary appendix",
      "",
      "| Namespace | Terms |",
      "|---|---|",
      "| `engines` | meaningfulness · additivity |",
      "| `scale` | nominal · ordinal · `cyclic` |",
      "| `shape` | scalar |",
      "",
      "## Falsification conditions",
      "",
      "| `scale` | not-part-of-the-appendix |",
    ].join("\n");
    expect(extractDoctrineVocabulary(md)).toEqual({
      engines: ["meaningfulness", "additivity"],
      namespaces: { scale: ["nominal", "ordinal", "cyclic"], shape: ["scalar"] },
    });
    expect(extractDoctrineVocabulary("no appendix here")).toEqual({
      engines: [],
      namespaces: {},
    });
  });
});

describe("parseJsonl", () => {
  it("skips blank lines and names the failing line on bad JSON", () => {
    expect(
      parseJsonl('{"case":"CASE_X"}\n\n{"case":"CASE_Y"}\n').map((e) => e.case),
    ).toEqual(["CASE_X", "CASE_Y"]);
    expect(() => parseJsonl('{"case":"CASE_X"}\n{not json}')).toThrow(/line 2/);
  });
});
