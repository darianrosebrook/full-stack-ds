/**
 * The Stage-2 erasure freeze holds, and can fail for the right reasons.
 *
 * The freeze exists because the two other conservation gates are blind to the
 * quotient: `analytical:check-baseline` compares ENGINE judgments, which a walk
 * that stops reaching a label leaves untouched, and the subtraction gate reads a
 * ledger rather than the corpus. Between them, a locator regression is invisible
 * — which is exactly how eleven coordinates spent this experiment un-erasable
 * for a walk reason that was read as a semantic one.
 */
import { describe, expect, it } from "vitest";
import { loadCensus } from "./census.js";
import { checkFreeze, computeFreeze, corpus, loadFreeze, supersessionOf, type Stage2Freeze } from "./freeze.js";

const frozen = loadFreeze();
// Scoped to the fixtures the freeze was taken over. Unscoped, a later fixture
// would move every erasure record and the freeze would fire on work that
// neither caused nor could discharge it.
const live = computeFreeze({}, frozen.fixtures);

/**
 * Every coordinate whose erasure changes nothing anywhere in the corpus, minus
 * the `reference` kind, whose no-op is the alpha-renaming invariant rather than
 * a gap. Named exactly and in both directions: a coordinate leaving this list
 * is a corpus gaining a distinction, and one joining it is a distinction the
 * corpus lost or a locator that stopped arriving.
 *
 * WHAT REACH MEANS FOR A MERGE CHANGED, and the list moved with it. A merge now
 * writes a member CLASS wherever EITHER member appears, so it is corpus-dead
 * only when neither member is present anywhere — where it used to be dead
 * whenever the `from` member was absent. Three cardinality and closure pairs
 * left the list for that reason and not because the corpus grew a distinction.
 * Reach for a merge is therefore "the corpus carries one of these members", not
 * "the corpus separates them"; the separating question is measured by
 * `erasure-audit`, over specimens, and is deliberately not asked here.
 *
 * BOTH ARITY COORDINATES ARE NOW DEAD, which is a real loss of corpus coverage
 * and is recorded as one. Arity truncates to the declaration's own `minItems`,
 * and every corpus occurrence of `nest.levels` and `structure.peers[]` is
 * already AT its floor — so there is nothing to truncate. That is a fact about
 * the corpus, not about the coordinate: the synthesized separating pairs in
 * `erasure-specimens.ts` build a pair astride the floor and do exercise it.
 * Truncating to one element instead, as before, moved four fixtures and
 * produced images the representation cannot express.
 */
const CORPUS_DEAD = [
  "assertion.aggregate.along#order",
  "evidence.grainWitness#arity",
  "evidence.grainWitness#order",
  "field.additivity.semi-additive.nonAdditiveAlong#arity",
  "field.additivity.semi-additive.nonAdditiveAlong#order",
  "relation.derivedBy.aggregate-to-grain.toGrain#arity",
  "relation.derivedBy.aggregate-to-grain.toGrain#order",
  "relation.derivedBy.bin.closure:right-closed~<absent>",
  "relation.derivedBy.join.cardinality:many-to-one~many-to-many",
  "relation.derivedBy.join.cardinality:one-to-one~many-to-many",
  "relation.derivedBy.join.cardinality:one-to-one~many-to-one",
  "relation.derivedBy.nest.levels#arity",
  "relation.derivedBy.nest.levels#order",
  "structure.peers[]#arity",
  "structure.peers[]#order",
];

describe("stage-2 erasure freeze", () => {
  it("holds: every erasure and every verdict matches the recorded freeze", () => {
    const r = checkFreeze(frozen, live);
    expect(r.message).toContain("OK");
    expect(r.divergences.filter((d) => !frozen.adjudicated[d.key])).toEqual([]);
    expect(r.stale).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("freezes the population the erasure-plan refactor must not move: 1 witnessed / 29 representation-artifact / 96 unresolved", () => {
    expect(Object.fromEntries(Object.entries(frozen.verdicts).map(([d, ids]) => [d, ids.length]))).toEqual({
      unresolved: 96,
      witnessed: 1,
      "required-derived-vocabulary": 0,
      "representation-artifact": 29,
      "not-yet-admitted": 0,
    });
  });

  it("a reference coordinate's erasure is a no-op everywhere, which is the alpha-renaming invariant and not a gap", () => {
    const references = loadCensus().filter((c) => c.kind === "reference");
    expect(references.length).toBeGreaterThan(0);
    expect(references.filter((c) => live.erasure[c.id].reach !== 0).map((c) => c.id)).toEqual([]);
  });

  it("names every corpus-dead coordinate exactly, in both directions", () => {
    const byId = new Map(loadCensus().map((c) => [c.id, c]));
    const dead = Object.entries(live.erasure)
      .filter(([id, f]) => f.reach === 0 && byId.get(id)?.kind !== "reference")
      .map(([id]) => id)
      .sort();
    expect(dead).toEqual([...CORPUS_DEAD].sort());
  });

  it("every other coordinate reaches at least one fixture, so an unwitnessed verdict is about the corpus and not the walk", () => {
    const dead = new Set(CORPUS_DEAD);
    const byId = new Map(loadCensus().map((c) => [c.id, c]));
    for (const [id, fact] of Object.entries(live.erasure)) {
      if (dead.has(id) || byId.get(id)?.kind === "reference") continue;
      expect(fact.reach, `${id} erases nothing anywhere in the corpus`).toBeGreaterThan(0);
    }
  });

  it("reports a changed erasure even when reach is unchanged, because reach alone cannot see WHAT was erased", () => {
    const tampered: Stage2Freeze = structuredClone(live);
    tampered.erasure["assertion.aggregate.op"] = { reach: live.erasure["assertion.aggregate.op"].reach, digest: "0".repeat(64) };
    const r = checkFreeze({ ...frozen, erasure: tampered.erasure, adjudicated: {} }, live);
    expect(r.ok).toBe(false);
    expect(r.divergences.map((d) => d.key)).toContain("assertion.aggregate.op");
    expect(r.message).toContain("a different erased representation");
  });

  it("reports a coordinate that left or entered the census as a census divergence, not as an erasure one", () => {
    const { "assertion.aggregate.op": _dropped, ...without } = live.erasure;
    void _dropped;
    const r = checkFreeze({ ...frozen, erasure: without, adjudicated: {} }, live);
    expect(r.divergences.map((d) => d.key)).toContain("census:assertion.aggregate.op");
    expect(r.divergences.find((d) => d.key === "census:assertion.aggregate.op")?.detail).toContain("entered the census");
  });

  it("reports a moved verdict", () => {
    const moved = structuredClone(live.verdicts);
    const id = moved["representation-artifact"][0];
    moved["representation-artifact"] = moved["representation-artifact"].slice(1);
    moved.unresolved = [...moved.unresolved, id].sort();
    const r = checkFreeze({ ...frozen, verdicts: moved, adjudicated: {} }, live);
    expect(r.ok).toBe(false);
    expect(r.divergences.map((d) => `${d.key}: ${d.detail}`)).toContain(`verdict:${id}: unresolved -> representation-artifact`);
  });

  it("accepts a divergence only against a written reason, and refuses a reason with nothing to adjudicate", () => {
    const tampered = { ...live.erasure, "assertion.aggregate.op": { reach: 0, digest: "0".repeat(64) } };
    const accepted = checkFreeze({ ...frozen, erasure: tampered, adjudicated: { "assertion.aggregate.op": "corrected locator" } }, live);
    expect(accepted.ok).toBe(true);
    expect(accepted.accepted.map((a) => a.reason)).toEqual(["corrected locator"]);

    const stale = checkFreeze({ ...frozen, adjudicated: { "field.key": "nothing diverges here" } }, live);
    expect(stale.ok).toBe(false);
    expect(stale.stale).toEqual(["field.key"]);
  });

  it("attributes a moved input, so a divergence can be traced to what changed", () => {
    const r = checkFreeze({ ...frozen, digests: { ...frozen.digests, "fixtures.jsonl": "0".repeat(64) } }, live);
    expect(r.movedInputs).toContain("fixtures.jsonl");
  });

  /**
   * A moved AUTHORITY and a moved DATA INPUT are reported separately, and the
   * authority names its cause.
   *
   * This replaces an assertion that `census.ts` and `quotient.ts` appeared in
   * `movedInputs` while no erasure digest moved — the erasure-plan refactor's
   * claim, which that record could make because it predated the refactor. The
   * record has since been superseded under a different erasure authority, so
   * the comparison no longer exists to be asserted. What survives it is the
   * property it was protecting: attribution. Source modules are no longer named
   * one at a time in `digests` — a per-file list under-claims, and
   * `erasure-plan.ts` was never in it — so the check has to distinguish "the
   * corpus changed" from "what an erasure does changed", and say which.
   */
  it("attributes a moved AUTHORITY by cause, and does not confuse it with a moved data input", () => {
    const tampered: Stage2Freeze = { ...frozen, authority: { ...frozen.authority, erasureAuthorityDigest: "0".repeat(64) } };
    const r = checkFreeze(tampered, live);
    expect(r.movedAuthority.map((m) => m.identity)).toEqual(["erasureAuthorityDigest"]);
    expect(r.movedAuthority[0].invalidates).toContain("what an erasure does");
    expect(r.movedInputs).toEqual([]);
    expect(r.message).toContain("recorded under a different authority");
  });

  it("names each of the four causes apart, so re-recording is never one undifferentiated act", () => {
    const named = (patch: Partial<Stage2Freeze["authority"]>) =>
      checkFreeze({ ...frozen, authority: { ...frozen.authority, ...patch } }, live).movedAuthority.map((m) => m.identity);
    expect(named({ coordinateBasisDigest: "0".repeat(64) })).toEqual(["coordinateBasisDigest"]);
    expect(named({ witnessAuthorityDigest: "0".repeat(64) })).toEqual(["witnessAuthorityDigest"]);
    expect(named({ ruleDigest: "0".repeat(64) })).toEqual(["ruleDigest"]);
    expect(named({ quotientSchemaVersion: 99 })).toEqual(["quotientSchemaVersion"]);
    expect(checkFreeze(frozen, live).movedAuthority).toEqual([]);
  });

  it("records what it supersedes: the classes that changed, counted, each with an authored effect", () => {
    // The old record's numbers are not lost, they are in git. What must stay
    // HERE is the statement of what changed, because a re-record with no such
    // statement is indistinguishable from a re-record that absorbed a defect.
    const s = frozen.supersedes;
    expect(s, "the record was re-taken under a new erasure authority and says nothing about it").toBeDefined();
    expect(s!.divergences.map((d) => `${d.operation}=${d.coordinates}`)).toEqual([
      "forget-reference-arity=2",
      "forget-value=8",
      "merge-enum-members=52",
    ]);
    for (const d of s!.divergences) expect(d.effect.length, `${d.operation} is superseded with no authored effect`).toBeGreaterThan(120);
  });

  it("refuses to supersede a divergence class nobody has explained", () => {
    // The ratchet on the supersession mechanism itself. Without it, a re-record
    // would absorb any future change as easily as this one.
    const invented = { ...live.erasure, "field.key": { reach: 0, digest: "0".repeat(64) } };
    expect(() => supersessionOf({ ...frozen, erasure: invented }, checkFreeze({ ...frozen, erasure: invented }, live))).toThrow(
      /refusing to supersede/,
    );
  });

  it("is recorded over a named fixture scope, and covers every coordinate in it", () => {
    // 84 fixtures: the whole corpus AS OF the freeze. The corpus has grown
    // since — holdout items reaching the derivation boundary — and the scope is
    // what keeps that growth from reading as a walker regression.
    expect(frozen.fixtures.length).toBe(84);
    expect(corpus().length).toBeGreaterThanOrEqual(frozen.fixtures.length);
    expect(Object.keys(frozen.erasure).length).toBe(loadCensus().length);
  });

  it("reports a fixture that LEAVES the scope, which is a finding rather than growth", () => {
    const r = checkFreeze({ ...frozen, fixtures: [...frozen.fixtures, "FX_NEVER_EXISTED"] }, live);
    expect(r.divergences.map((d) => d.key)).toContain("fixture:FX_NEVER_EXISTED");
  });
});
