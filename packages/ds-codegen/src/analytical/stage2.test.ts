/**
 * Stage-2 acceptance: the engine against the frozen oracle (REL-VIEW-ALGEBRA-01).
 *
 * The counterpart of stage1.test.ts, and the same discipline: expectations come
 * from the corpus, the corpus is read and never written, and a fixture is a
 * stimulus that names no answer. What stage 2 adds is a second occurrence
 * domain — a defect of the derivation layer belongs to no assertion — so the
 * singleton claim is made over the UNION of the domains rather than over
 * `diagnostics` alone. A case that produced its diagnostic twice, once in each
 * domain, would pass a per-domain check and fail this one.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import {
  casesAdjudicableAt,
  checkFixtureLedger,
  loadCorpusInput,
  loadLedgerInput,
  type CorpusCase,
} from "./corpus-integrity.js";
import { judge } from "./engines.js";
import { codesOf, termsOf, type Judgment } from "./judgment.js";
import { RULE_SOURCES } from "./necessity.js";
import type { Fixture } from "./structure.js";

const CONTRACTS = path.resolve(__dirname, "../../../ds-contracts");
const PACK = path.join(CONTRACTS, "analytical-pack");
const DOCTRINE = path.resolve(__dirname, "../../../../docs/architecture/analytical-relation-doctrine.md");

const corpus = loadCorpusInput(PACK, DOCTRINE);
const live = loadLedgerInput(CONTRACTS, DOCTRINE, RULE_SOURCES, 2);
const stage1 = new Set(casesAdjudicableAt(corpus.cases, 1).map((c) => c.case));
const stage2Cases = casesAdjudicableAt(corpus.cases, 2).filter((c) => !stage1.has(c.case));
const byId = new Map(live.fixtures.map((f) => [f.id, f]));
const fx = (id: string): Fixture => {
  const f = byId.get(id);
  if (!f) throw new Error(`no fixture ${id}`);
  return f;
};
const judgeFixture = (f: Fixture): Judgment => judge(f.structure, f.assertions, f.evidence);
const forCase = (c: CorpusCase) => judgeFixture(fx(live.bindings.cases[c.case]));

/** Every occurrence a judgment carries, in either domain. */
const occurrencesOf = (j: Judgment) => [
  ...j.diagnostics.map((d) => ({ what: d.code, engine: d.engine, evidenceClass: d.evidenceClass })),
  ...j.obligations.map((o) => ({ what: o.term, engine: o.engine, evidenceClass: o.evidenceClass })),
  ...j.derivations.map((d) => ({ what: d.code ?? d.term!, engine: d.engine, evidenceClass: d.evidenceClass })),
];

describe("every stage-2 case yields exactly its expected judgment", () => {
  it("has a stage-2 case set the stage-1 run does not already cover", () => {
    expect(stage2Cases.length).toBeGreaterThan(0);
    expect(stage2Cases.every((c) => c.stage === 2)).toBe(true);
  });

  for (const c of stage2Cases) {
    it(`${c.case} → ${c.verdict} ${c.diagnostic ?? c.obligation} (${c.engine}, ${c.evidence})`, () => {
      const j = forCase(c);
      const occ = occurrencesOf(j);
      expect(j.status).toBe(c.verdict);
      // One occurrence, in whichever domain owns it: a fixture that also
      // tripped an unrelated rule would be evidence for two things at once.
      expect(occ).toHaveLength(1);
      expect(occ[0].what).toBe(c.diagnostic ?? c.obligation);
      expect(occ[0].engine).toBe(c.engine);
      expect(occ[0].evidenceClass).toBe(c.evidence);
    });
  }

  it("partitions the stage-2 cases exactly as the corpus does (pairwise)", () => {
    // Two cases the corpus distinguishes must be distinguished by the engine,
    // and two it identifies must be identified. This is what keeps a rule from
    // passing by being broad enough to cover several cases at once — the two
    // fan-out cases are deliberately one diagnostic under two stimuli.
    const expectedKey = (c: CorpusCase) => `${c.verdict}:${c.diagnostic ?? c.obligation}`;
    const engineKey = (c: CorpusCase) => {
      const j = forCase(c);
      return `${j.status}:${codesOf(j).join(",")}:${termsOf(j).join(",")}`;
    };
    const keys = stage2Cases.map((c) => [expectedKey(c), engineKey(c)] as const);
    for (let i = 0; i < keys.length; i++) {
      for (let k = i + 1; k < keys.length; k++) {
        expect(keys[i][1] === keys[k][1], `${stage2Cases[i].case} vs ${stage2Cases[k].case}`).toBe(keys[i][0] === keys[k][0]);
      }
    }
  });

  it("emits exactly the stage-2 cases' diagnostics, and no others, over the stage-2 fixtures", () => {
    const expected = [...new Set(stage2Cases.filter((c) => c.verdict === "illegal").map((c) => c.diagnostic!))].sort();
    const emitted = [...new Set(stage2Cases.flatMap((c) => codesOf(forCase(c))))].sort();
    expect(emitted).toEqual(expected);
  });
});

describe("the stage-2 fixture ledger is complete", () => {
  it("has no outstanding finding at stage 2", () => {
    expect(checkFixtureLedger(live)).toEqual([]);
  });

  it("still has none at stage 1, so opening stage 2 did not disturb the earlier view", () => {
    expect(checkFixtureLedger(loadLedgerInput(CONTRACTS, DOCTRINE, RULE_SOURCES, 1))).toEqual([]);
  });

  it("binds every stage-2 case to its own fixture", () => {
    const bound = stage2Cases.map((c) => live.bindings.cases[c.case]);
    expect(bound.every(Boolean)).toBe(true);
    expect(new Set(bound).size).toBe(bound.length);
  });

  it("gives every stage-2 diagnostic a near-neighbour that is admissible", () => {
    for (const c of stage2Cases) {
      if (c.verdict !== "illegal") continue;
      const neighbour = live.bindings.neighbours[c.diagnostic!];
      expect(neighbour, `no neighbour for ${c.diagnostic}`).toBeTruthy();
      const j = judgeFixture(fx(neighbour));
      expect(j.status, `${neighbour} is not admissible`).toBe("admissible");
    }
  });

  it("gives every stage-2 obligation a discharge triad whose three arms behave", () => {
    for (const c of stage2Cases) {
      if (c.verdict !== "unproven") continue;
      const triad = live.bindings.triads[c.obligation!];
      expect(triad, `no triad for ${c.obligation}`).toBeTruthy();
      const absent = judgeFixture(fx(triad.absent));
      expect(absent.status).toBe("unproven");
      expect(termsOf(absent)).toEqual([c.obligation]);
      expect(judgeFixture(fx(triad.satisfying)).status).toBe("admissible");
      const hostile = judgeFixture(fx(triad.hostile));
      expect(hostile.status).toBe("illegal");
      expect(codesOf(hostile)).toEqual([triad.hostileDiagnostic]);
    }
  });
});

describe("the stage-2 fixtures name no answer", () => {
  it("carries no case id, diagnostic code, obligation term, or form name", () => {
    // The leak scan lives in checkFixtureLedger and is asserted above; this
    // states the property in the form a reader can check by eye, and covers
    // the obligation terms the leak scan does not pattern-match.
    const lines = fs.readFileSync(path.join(CONTRACTS, "analytical-fixtures/fixtures.jsonl"), "utf-8").split("\n");
    const stage2Ids = new Set(stage2Cases.map((c) => live.bindings.cases[c.case]));
    for (const line of lines) {
      if (!line.trim()) continue;
      const id = (JSON.parse(line) as { id: string }).id;
      if (!stage2Ids.has(id)) continue;
      expect(line, id).not.toMatch(/CASE_[A-Z]/);
      expect(line, id).not.toMatch(/REL_[A-Z]/);
      for (const term of [...new Set(corpus.cases.map((c) => c.obligation).filter(Boolean))]) {
        expect(line, `${id} names the obligation ${term}`).not.toContain(term as string);
      }
    }
  });
});
