/**
 * Stage-1 acceptance: the engine against the frozen oracle. Blocks A1-A11 are
 * REL-FIELD-ALGEBRA-01's criteria; the B blocks are REL-FIELD-ALGEBRA-02
 * Phase A (occurrence identity, engine provenance). The oracle
 * (`analytical-pack/`) is read, never written; expectations for the case
 * fixtures come from the corpus, expectations for the holdout from
 * `holdout.json`, authored by hand against a recorded rule digest.
 */
import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { casesAdjudicableAt, checkFixtureLedger, loadCorpusInput, loadLedgerInput, sha256, type LedgerInput } from "./corpus-integrity.js";
import { DIAG, OBLIGATION, RULES, judge } from "./engines.js";
import { assertionKey, canonicalJudgment, codesOf, termsOf, type Judgment } from "./judgment.js";
import { alphaRename, normalizeObservation, renameSubject, type Fixture, type RelationalStructure } from "./structure.js";

const CONTRACTS = path.resolve(__dirname, "../../../ds-contracts");
const PACK = path.join(CONTRACTS, "analytical-pack");
const DOCTRINE = path.resolve(__dirname, "../../../../docs/architecture/analytical-relation-doctrine.md");
const ENGINE_SOURCE = path.join(__dirname, "engines.ts");
const BLIND_SOURCES = ["relation-model.ts", "structure.ts", "judgment.ts", "engines.ts", "emit-schemas.ts"].map((f) => path.join(__dirname, f));

const corpus = loadCorpusInput(PACK, DOCTRINE);
const stage1Cases = casesAdjudicableAt(corpus.cases, 1);
const ledger = () => loadLedgerInput(CONTRACTS, DOCTRINE, ENGINE_SOURCE, 1);
const live = ledger();
const byId = new Map(live.fixtures.map((f) => [f.id, f]));
const fx = (id: string): Fixture => {
  const f = byId.get(id);
  if (!f) throw new Error(`no fixture ${id}`);
  return f;
};
const judgeFixture = (f: Fixture): Judgment => judge(f.structure, f.assertions, f.evidence);
const ADMISSIBLE = canonicalJudgment({ status: "admissible", diagnostics: [], obligations: [] });

describe("A1 — every stage-1 case yields exactly its expected judgment", () => {
  it("has a non-empty stage-1 case set", () => {
    expect(stage1Cases.length).toBeGreaterThan(0);
  });

  for (const c of stage1Cases) {
    it(`${c.case} → ${c.verdict} ${c.diagnostic ?? c.obligation} (${c.engine})`, () => {
      const j = judgeFixture(fx(live.bindings.cases[c.case]));
      expect(j.status).toBe(c.verdict);
      if (c.verdict === "illegal") {
        // exact singleton: one occurrence, that code, no obligation, the case's evidence class and engine
        expect(j.diagnostics).toHaveLength(1);
        expect(j.diagnostics[0].code).toBe(c.diagnostic);
        expect(j.diagnostics[0].evidenceClass).toBe(c.evidence);
        expect(j.diagnostics[0].engine).toBe(c.engine);
        expect(j.obligations).toEqual([]);
      } else {
        expect(j.obligations).toHaveLength(1);
        expect(j.obligations[0].term).toBe(c.obligation);
        expect(j.obligations[0].evidenceClass).toBe(c.evidence);
        expect(j.obligations[0].engine).toBe(c.engine);
        expect(j.diagnostics).toEqual([]);
      }
    });
  }

  it("partitions the stage-1 cases exactly as the corpus does (pairwise)", () => {
    const expectedKey = (c: (typeof stage1Cases)[number]) => `${c.verdict}:${c.diagnostic ?? c.obligation}`;
    const engineKey = (c: (typeof stage1Cases)[number]) => {
      const j = judgeFixture(fx(live.bindings.cases[c.case]));
      return `${j.status}:${codesOf(j).join(",")}:${termsOf(j).join(",")}`;
    };
    const keys = stage1Cases.map((c) => [expectedKey(c), engineKey(c)] as const);
    for (let i = 0; i < keys.length; i++) {
      for (let k = i + 1; k < keys.length; k++) {
        const sameExpected = keys[i][0] === keys[k][0];
        const sameEngine = keys[i][1] === keys[k][1];
        expect(sameEngine, `${stage1Cases[i].case} vs ${stage1Cases[k].case}`).toBe(sameExpected);
      }
    }
  });

  it("emits exactly the catalogue's stage-1 diagnostics over the stage-1 cases", () => {
    const expected = new Set(stage1Cases.filter((c) => c.verdict === "illegal").map((c) => c.diagnostic));
    const emitted = new Set<string>();
    for (const c of stage1Cases) for (const code of codesOf(judgeFixture(fx(live.bindings.cases[c.case])))) emitted.add(code);
    expect([...emitted].sort()).toEqual([...expected].sort());
    expect(emitted.size).toBe(15);
  });
});

describe("A2 — the binding ledger", () => {
  it("is clean against the live fixtures, bindings, holdout, and engine source", () => {
    expect(checkFixtureLedger(live)).toEqual([]);
  });

  const mutate = (edit: (input: LedgerInput) => void) => {
    const input = ledger();
    edit(input);
    return checkFixtureLedger(input).map((f) => f.code);
  };

  // The kernel's only free strings are unit codes and observation values; a leak has to ride on one of them.
  it("flags a case id smuggled into a string value as an answer leak", () => {
    const codes = mutate((i) => {
      const source = JSON.stringify(fx("FX_SALES_SUM_MIXED_UNITS_DECLARED"));
      expect(source).toContain('"units":["USD","EUR"]');
      const leak = source.replace('"units":["USD","EUR"]', '"units":["CASE_INDEX_WITHOUT_ANCHOR","EUR"]').replace(/"id":"[^"]+"/, '"id":"FX_LEAK_A"');
      i.fixtureLines.push(leak);
      i.fixtures.push(JSON.parse(leak));
      i.bindings.special.leak = "FX_LEAK_A";
    });
    expect(codes).toContain("LEDGER_FIXTURE_ANSWER_LEAK");
  });

  it("flags a form name in a fixture line as an answer leak", () => {
    const codes = mutate((i) => {
      const source = JSON.stringify(fx("FX_T_CURRENCY_ROWS_ONE_UNIT"));
      expect(source).toContain('"unit":"USD"');
      const leak = source.replace('"unit":"USD"', '"unit":"the bar chart total"').replace(/"id":"[^"]+"/, '"id":"FX_LEAK_B"');
      i.fixtureLines.push(leak);
      i.fixtures.push(JSON.parse(leak));
      i.bindings.special.leak = "FX_LEAK_B";
    });
    expect(codes).toContain("LEDGER_FIXTURE_ANSWER_LEAK");
  });

  it("rejects an injected L3 term (a task key) through the closed schema", () => {
    const codes = mutate((i) => {
      const f = { ...fx("FX_N_TEMP_MEAN"), id: "FX_LEAK_C", task: "trend" } as unknown as Fixture;
      i.fixtures.push(f);
      i.fixtureLines.push(JSON.stringify(f));
      i.bindings.special.leak = "FX_LEAK_C";
    });
    expect(codes).toContain("LEDGER_FIXTURE_INVALID");
  });

  it("flags an unbound stage-1 case, a dangling target, and a shared target", () => {
    expect(mutate((i) => delete i.bindings.cases.CASE_TEMPERATURES_SUMMED)).toContain("LEDGER_CASE_UNBOUND");
    expect(mutate((i) => (i.bindings.cases.CASE_TEMPERATURES_SUMMED = "FX_NOPE"))).toContain("LEDGER_BINDING_TARGET_MISSING");
    expect(mutate((i) => (i.bindings.cases.CASE_TEMPERATURES_SUMMED = i.bindings.cases.CASE_SUM_OF_USER_IDS))).toContain(
      "LEDGER_BINDING_NOT_INJECTIVE",
    );
  });

  it("flags a binding to a case that is not adjudicable at stage 1", () => {
    const later = corpus.cases.find((c) => c.stage > 1)!;
    expect(mutate((i) => (i.bindings.cases[later.case] = "FX_N_TEMP_MEAN"))).toContain("LEDGER_BINDING_CASE_UNKNOWN");
  });

  it("flags an orphan fixture and a missing neighbour", () => {
    expect(
      mutate((i) => {
        i.fixtures.push({ ...fx("FX_N_TEMP_MEAN"), id: "FX_ORPHAN" });
      }),
    ).toContain("LEDGER_FIXTURE_ORPHAN");
    expect(mutate((i) => delete i.bindings.neighbours.REL_MEANINGFULNESS_INTERVAL_SUM)).toContain("LEDGER_NEIGHBOUR_MISSING");
    expect(mutate((i) => (i.bindings.neighbours.REL_NOT_A_CAUSE = "FX_N_TEMP_MEAN"))).toContain("LEDGER_NEIGHBOUR_UNKNOWN_DIAGNOSTIC");
  });

  it("flags holdout drift: digest mismatch, unbound item, and a case fixture reused as holdout", () => {
    expect(mutate((i) => (i.ruleSourceDigest = "0".repeat(64)))).toContain("LEDGER_HOLDOUT_RULE_DIGEST_MISMATCH");
    expect(mutate((i) => i.bindings.holdout.pop())).toContain("LEDGER_HOLDOUT_UNBOUND");
    expect(
      mutate((i) => {
        i.holdout.items.push({ fixture: "FX_TEMP_SUM", expected: { status: "illegal", diagnostics: [], obligations: [] } });
        i.bindings.holdout.push("FX_TEMP_SUM");
      }),
    ).toContain("LEDGER_HOLDOUT_CONTAMINATED");
  });
});

describe("A3 — the engine is answer-blind", () => {
  const FORBIDDEN: readonly [string, RegExp][] = [
    ["corpus module import", /corpus-integrity/],
    ["oracle directory", /analytical-pack/],
    ["corpus file", /corpus\.jsonl/],
    ["binding ledger", /bindings\.json|holdout\.json/],
    ["case id", /\bCASE_[A-Z0-9_]+/],
  ];
  const scan = (source: string) => FORBIDDEN.filter(([, re]) => re.test(source)).map(([what]) => what);

  for (const file of BLIND_SOURCES) {
    it(`${path.basename(file)} references no corpus, ledger, or case`, () => {
      expect(scan(fs.readFileSync(file, "utf-8"))).toEqual([]);
    });
  }

  it("the scanner itself catches an injected corpus import and an injected case id", () => {
    expect(scan('import { checkCorpus } from "./corpus-integrity.js";')).toEqual(["corpus module import"]);
    expect(scan('const expected = { CASE_TEMPERATURES_SUMMED: "illegal" };')).toEqual(["case id"]);
  });
});

describe("A4 — judgments are occurrence-bearing", () => {
  it("two independent violations of one cause are two occurrences with distinct subjects", () => {
    const j = judgeFixture(fx(live.bindings.special.occurrences as string));
    expect(j.status).toBe("illegal");
    expect(j.diagnostics.map((d) => d.code)).toEqual([DIAG.UNIT_SUM_INCOMMENSURABLE, DIAG.UNIT_SUM_INCOMMENSURABLE]);
    expect(new Set(j.diagnostics.map((d) => d.subject)).size).toBe(2);
    expect(j.obligations.map((o) => o.term)).toEqual([OBLIGATION.GRAIN_DECLARED, OBLIGATION.GRAIN_DECLARED]);
    expect(new Set(j.obligations.map((o) => o.subject)).size).toBe(2);
  });
});

describe("B3 — occurrence identity carries the assertion; the engine is provenance", () => {
  it("two assertions on one field differing only in collapsed dimensions are two occurrences with one subject", () => {
    const j = judgeFixture(fx(live.bindings.special.alongIdentity as string));
    expect(j.status).toBe("illegal");
    expect(j.diagnostics.map((d) => d.code)).toEqual([DIAG.PROPORTION_SUM_ACROSS_WHOLES, DIAG.PROPORTION_SUM_ACROSS_WHOLES]);
    expect(new Set(j.diagnostics.map((d) => d.subject))).toEqual(new Set(["shares.share"]));
    expect(j.diagnostics.map((d) => d.assertion).sort()).toEqual(["aggregate:sum", "aggregate:sum(along=market,year)"]);
    expect(j.diagnostics.every((d) => d.engine === "additivity")).toBe(true);
  });

  it("assertion identity is order-independent in its set-valued parameters", () => {
    expect(assertionKey({ kind: "aggregate", relation: "r", field: "f", op: "sum", along: ["year", "market"], nulls: "exclude" })).toBe(
      "aggregate:sum(along=market,year;nulls=exclude)",
    );
    expect(assertionKey({ kind: "aggregate", relation: "r", field: "f", op: "count" })).toBe("aggregate:count");
    expect(assertionKey({ kind: "ratio-comparison", relation: "r", field: "f" })).toBe("ratio-comparison");
  });

  it("every stage-1 occurrence names one of the vocabulary's engines", () => {
    const engines = new Set(corpus.vocabulary.engines);
    for (const c of stage1Cases) {
      const j = judgeFixture(fx(live.bindings.cases[c.case]));
      for (const o of [...j.diagnostics, ...j.obligations]) expect(engines.has(o.engine), `${c.case}: ${o.engine}`).toBe(true);
    }
  });
});

describe("A5 — mixed faults and order independence", () => {
  it("an illegal and an unproven fault in one structure report both, status illegal", () => {
    const j = judgeFixture(fx(live.bindings.special.mixedFault as string));
    expect(j.status).toBe("illegal");
    expect(codesOf(j)).toEqual([DIAG.ORDINAL_MEAN]);
    expect(termsOf(j)).toEqual([OBLIGATION.GRAIN_DECLARED]);
  });

  const reverseKeys = <T>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(o).reverse());
  const permute = (s: RelationalStructure): RelationalStructure => ({
    relations: reverseKeys(
      Object.fromEntries(Object.entries(s.relations).map(([n, r]) => [n, { ...r, fields: reverseKeys(r.fields) }])),
    ),
  });

  it("every fixture judges byte-identically under reversed assertions, fields, relations, along, and rules", () => {
    for (const f of live.fixtures) {
      const base = canonicalJudgment(judgeFixture(f));
      const assertions = [...f.assertions].reverse().map((a) => (a.kind === "aggregate" && a.along ? { ...a, along: [...a.along].reverse() } : a));
      const permuted = canonicalJudgment(judge(permute(f.structure), assertions, f.evidence, [...RULES].reverse()));
      expect(permuted, f.id).toBe(base);
    }
  });

  it("is deterministic across repeated runs", () => {
    for (const f of live.fixtures) expect(canonicalJudgment(judgeFixture(f))).toBe(canonicalJudgment(judgeFixture(f)));
  });
});

describe("A6 — every obligation has a discharge triad", () => {
  for (const [term, triad] of Object.entries(live.bindings.triads)) {
    it(`${term}: absent → unproven, satisfying → admissible, hostile → ${triad.hostileDiagnostic}`, () => {
      const absent = judgeFixture(fx(triad.absent));
      expect(absent.status).toBe("unproven");
      expect(termsOf(absent)).toEqual([term]);
      expect(canonicalJudgment(judgeFixture(fx(triad.satisfying)))).toBe(ADMISSIBLE);
      const hostile = judgeFixture(fx(triad.hostile));
      expect(hostile.status).toBe("illegal");
      expect(codesOf(hostile)).toEqual([triad.hostileDiagnostic]);
      expect(hostile.obligations).toEqual([]);
    });
  }

  it("covers the three stage-1 obligations", () => {
    expect(Object.keys(live.bindings.triads).sort()).toEqual([
      OBLIGATION.GRAIN_DECLARED,
      OBLIGATION.NULL_MISSING_MECHANISM,
      OBLIGATION.UNIT_COMMENSURABLE,
    ]);
  });
});

describe("A7 — a legal near-neighbour per diagnostic is admissible", () => {
  it("covers every stage-1 diagnostic", () => {
    expect(Object.keys(live.bindings.neighbours)).toHaveLength(15);
  });
  for (const [code, id] of Object.entries(live.bindings.neighbours)) {
    it(`${code} ← ${id}`, () => {
      expect(canonicalJudgment(judgeFixture(fx(id)))).toBe(ADMISSIBLE);
    });
  }
});

describe("A8 — holdout authored against the recorded rule digest", () => {
  it("the recorded digest is the digest of engines.ts as it is now", () => {
    expect(live.holdout.ruleDigest).toBe(sha256(fs.readFileSync(ENGINE_SOURCE, "utf-8")));
  });
  it("holds out at least six mixed fixtures, none reused from the case set", () => {
    expect(live.holdout.items.length).toBeGreaterThanOrEqual(6);
    const caseFixtures = new Set(Object.values(live.bindings.cases));
    for (const item of live.holdout.items) expect(caseFixtures.has(item.fixture), item.fixture).toBe(false);
  });
  for (const item of live.holdout.items) {
    it(`${item.fixture} → ${item.expected.status}`, () => {
      expect(JSON.parse(canonicalJudgment(judgeFixture(fx(item.fixture))))).toEqual(item.expected);
    });
  }
});

describe("A9 — per-observation heterogeneity survives", () => {
  it("one column carries observed values beside a censored bound and each is judged as itself", () => {
    // Observation-level provenance and uncertainty are not-yet-admitted (stage 3); the
    // heterogeneity the kernel retains is value-vs-null-kind per observation, and the
    // uncertainty finding comes from the field's permission, in the schema evidence class.
    const f = fx(live.bindings.special.heterogeneous as string);
    const rows = f.evidence!.rows!.readings.map((r) => normalizeObservation(r.temp));
    const states = new Set(rows.map((o) => o.null ?? "value"));
    expect(states).toEqual(new Set(["value", "censored"]));
    expect(rows.filter((o) => o.null === undefined).length).toBeGreaterThanOrEqual(2);
    const j = judgeFixture(f);
    expect(codesOf(j)).toEqual([DIAG.NULL_CENSORED_AS_OBSERVED, DIAG.UNCERTAINTY_UNPROPAGATED]);
    expect(j.diagnostics.find((d) => d.code === DIAG.NULL_CENSORED_AS_OBSERVED)?.evidenceClass).toBe("instance");
    expect(j.diagnostics.find((d) => d.code === DIAG.UNCERTAINTY_UNPROPAGATED)?.evidenceClass).toBe("schema");
  });
});

describe("A10 — identifier spelling confers no standing", () => {
  const map = { weather: "w", temperature: "foo", revenue: "bar", customer_id: "measure_7" };

  it("an alpha-renamed fixture validates and judges identically up to subject renaming", () => {
    const original = fx(live.bindings.special.renameOriginal as string);
    const renamed = alphaRename(original, map);
    expect(live.validateFixture(renamed)).toEqual([]);
    // no original identifier survives as a relation, field, or assertion reference
    expect(Object.keys(renamed.structure.relations)).toEqual(["w"]);
    expect(Object.keys(renamed.structure.relations.w.fields).sort()).toEqual(["bar", "foo", "measure_7"]);
    expect(renamed.assertions.map((a) => `${a.relation}.${a.field}`)).toEqual(["w.foo", "w.bar", "w.measure_7"]);
    const j0 = judgeFixture(original);
    const j1 = judgeFixture(renamed);
    expect(j0.status).toBe("illegal");
    expect(j1.status).toBe(j0.status);
    expect(j1.diagnostics.map((d) => [d.code, d.subject, d.assertion, d.engine, d.evidenceClass])).toEqual(
      j0.diagnostics.map((d) => [d.code, renameSubject(d.subject, map), d.assertion, d.engine, d.evidenceClass]),
    );
    expect(j1.obligations).toEqual(j0.obligations);
  });

  it("an ordinal field named revenue is still ordinal; a ratio field named satisfaction_score is still ratio", () => {
    const j = judgeFixture(fx(live.bindings.special.adversarialNames as string));
    expect(j.diagnostics).toEqual([
      { code: DIAG.ORDINAL_MEAN, subject: "kpis.revenue", assertion: "aggregate:mean", engine: "meaningfulness", evidenceClass: "schema" },
    ]);
  });
});

describe("A11 — the five probes express in the closed grammar", () => {
  // The kernel (stage 1.5) carries only witnessed coordinates: value shape, temporal
  // closure and declared relationships are not-yet-admitted, so the probes express
  // through grain, transformation class and per-observation null kind alone.
  const probes = live.bindings.special.probes as string[];
  it("there are five and all validate against the closed schemas", () => {
    expect(probes).toHaveLength(5);
    for (const id of probes) expect(live.validateFixture(fx(id)), id).toEqual([]);
  });
  it("categorical-vs-ratio: a nominal key beside a ratio measure", () => {
    const f = fx("FX_P_CATEGORICAL_VS_RATIO").structure.relations.sales;
    expect(f.fields.region).toMatchObject({ transformation: "nominal", key: true });
    expect(f.fields.amount.transformation).toBe("ratio");
  });
  it("binned distribution: a ratio bucket field beside a ratio count (count is an alias of ratio at stage 1)", () => {
    const f = fx("FX_P_BINNED_INTERVAL").structure.relations.bins;
    expect(f.fields.bucket.transformation).toBe("ratio");
    expect(f.fields.n.transformation).toBe("ratio");
  });
  it("OHLC: one relation at symbol×period grain with an interval-temporality period", () => {
    const f = fx("FX_P_OHLC").structure.relations.candles;
    expect(f.grain).toEqual(["symbol", "period"]);
    expect(f.fields.period).toMatchObject({ temporality: { kind: "interval" } });
    for (const k of ["open", "high", "low", "close"]) expect(f.fields[k].transformation).toBe("ratio");
  });
  it("hierarchy: a relation whose parent field permits a null; the root's parent is absent", () => {
    const f = fx("FX_P_HIERARCHY");
    expect(f.structure.relations.accounts.fields.parent).toMatchObject({ transformation: "nominal", permits: { null: true } });
    const root = f.evidence!.rows!.accounts.find((r) => normalizeObservation(r.parent).null === "absent");
    expect(root).toBeDefined();
  });
  it("graph: node and edge relations; an isolated node is representable and present", () => {
    const f = fx("FX_P_GRAPH_ISOLATED_NODE");
    expect(Object.keys(f.structure.relations).sort()).toEqual(["edges", "nodes"]);
    const nodes = f.evidence!.rows!.nodes.map((r) => normalizeObservation(r.id).value);
    const touched = new Set(f.evidence!.rows!.edges.flatMap((r) => [normalizeObservation(r.src).value, normalizeObservation(r.dst).value]));
    expect(nodes.filter((n) => !touched.has(n))).toEqual(["n3"]);
  });
  it("every probe is admissible under its own assertion", () => {
    for (const id of probes) expect(canonicalJudgment(judgeFixture(fx(id))), id).toBe(ADMISSIBLE);
  });
});
