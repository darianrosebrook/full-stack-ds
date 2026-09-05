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
import { carriedSupersession, checkFreeze, computeFreeze, corpus, loadFreeze, supersessionOf, type Stage2Freeze } from "./freeze.js";

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
    // The reason is keyed by the TRANSITION, not the class — see the
    // A->B->C test below for what the class-only key permitted.
    const tampered = { ...live.erasure, "assertion.aggregate.op": { reach: 0, digest: "0".repeat(64) } };
    const key = `assertion.aggregate.op@${"0".repeat(64)}->${live.erasure["assertion.aggregate.op"].digest}`;
    const accepted = checkFreeze({ ...frozen, erasure: tampered, adjudicated: { [key]: "corrected locator" } }, live);
    expect(accepted.ok).toBe(true);
    expect(accepted.accepted.map((a) => a.reason)).toEqual(["corrected locator"]);

    const stale = checkFreeze({ ...frozen, adjudicated: { "field.key@a->b": "nothing diverges here" } }, live);
    expect(stale.ok).toBe(false);
    expect(stale.stale).toEqual(["field.key@a->b"]);
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

  it("REFUSES to certify a record taken under a different acceptance authority", () => {
    // THE STALE-CONCLUSION TEST. `movedAuthority` used to be computed, printed
    // in the message, and then dropped before `ok` was decided — so this
    // consumer returned `ok: true` for a record whose acceptance authority no
    // longer existed. Every programmatic caller reads `ok`.
    //
    // Reproduced against the real path before it was repaired: weakening
    // `checkWitness` so an unevaluated isolation obligation stopped failing a
    // witness — an acceptance change touching no stimulus and no erasure image
    // — left `checkFreeze(loadFreeze())` reporting ok=true, divergences=[],
    // movedAuthority=[witnessAuthorityDigest].
    const moved = checkFreeze({ ...frozen, authority: { ...frozen.authority, witnessAuthorityDigest: "0".repeat(64) } }, live);
    expect(moved.ok, "a record certified under an authority that has moved").toBe(false);
    expect(moved.divergences.map((d) => d.key)).toContain("authority:witnessAuthorityDigest");

    // The erasures and verdicts still match — the refusal is ABOUT the
    // authority, not a side effect of something else diverging.
    expect(moved.divergences.filter((d) => !d.key.startsWith("authority:")), "nothing else diverged").toEqual([]);

    // And it runs through the ordinary ratchet: adjudicable with a reason...
    const excuse = `authority:witnessAuthorityDigest@${"0".repeat(64)}->${live.authority.witnessAuthorityDigest}`;
    const adjudicated = checkFreeze(
      { ...frozen, authority: { ...frozen.authority, witnessAuthorityDigest: "0".repeat(64) }, adjudicated: { [excuse]: "the witness surface gained a comment only" } },
      live,
    );
    expect(adjudicated.ok).toBe(true);
    expect(adjudicated.accepted.map((a) => a.key)).toEqual(["authority:witnessAuthorityDigest"]);

    // ...and an adjudication left behind after a re-record is itself a finding,
    // so the acceptance cannot silently outlive the move it excused.
    const leftover = checkFreeze({ ...frozen, adjudicated: { [excuse]: "stale" } }, live);
    expect(leftover.ok).toBe(false);
    expect(leftover.stale).toEqual([excuse]);
  });

  /**
   * THE EXCEPTION PATH, in four independently executed tests.
   *
   * They were one test, and that was a methodology defect: the positive
   * control ran first, so any mutant that broke the KEY FORMAT failed there
   * and the negative assertions were never reached. Four such mutants were
   * reported as kills of this boundary; none of them demonstrated that the
   * boundary detects over-authorisation. A permissive mutant -- one that keeps
   * the reviewed transition working and also accepts a different one -- is the
   * regression this must catch, and it can only be caught by a test that runs.
   */
  const A = frozen.authority.witnessAuthorityDigest;
  const [B, C, D] = ["b".repeat(64), "c".repeat(64), "d".repeat(64)];
  const at = (recorded: string, current: string, adjudicated: Record<string, string> = {}) =>
    checkFreeze(
      { ...frozen, authority: { ...frozen.authority, witnessAuthorityDigest: recorded }, adjudicated },
      { ...live, authority: { ...live.authority, witnessAuthorityDigest: current } },
    );
  // Full values, not a truncated display digest: a prefix is a different claim.
  const reviewed = `authority:witnessAuthorityDigest@${A}->${B}`;
  const excuse = { [reviewed]: "reviewed: the witness surface gained a comment only" };

  it("accepts the authority transition that was actually reviewed", () => {
    const good = at(A, B, excuse);
    expect(good.ok).toBe(true);
    expect(good.accepted.map((x) => x.reason)).toEqual(["reviewed: the witness surface gained a comment only"]);
  });

  it("refuses a LATER movement of the same identity under that same review", () => {
    // Record under A, review a comment-only change to B, then move acceptance
    // behaviour to C without re-recording. The class-only matcher accepted it.
    const r = at(A, C, excuse);
    // `ok` alone is too weak an assertion here, and two surviving mutants
    // proved it: a matcher that WRONGLY ACCEPTS the A->B reason for A->C still
    // reports ok=false, because the now-unmatched adjudication lands in
    // `stale`. Both branches make `ok` false, and only one of them is correct.
    // So the acceptance path is asserted directly.
    expect(r.accepted, "the A->B review excused a transition it did not review").toEqual([]);
    expect(r.divergences.map((d) => d.key), "the A->C divergence must remain unaccounted").toContain("authority:witnessAuthorityDigest");
    expect(r.ok).toBe(false);
    expect(r.stale, "the unmatched review must be reported, not silently unused").toEqual([reviewed]);
  });

  it("refuses a different starting point under that same review", () => {
    const r = at(D, B, excuse);
    expect(r.accepted, "the A->B review excused a different starting point").toEqual([]);
    expect(r.ok).toBe(false);
    expect(r.stale).toEqual([reviewed]);
  });

  it("refuses a reason written for the CLASS rather than a transition", () => {
    const r = at(A, B, { "authority:witnessAuthorityDigest": "a standing permission for this identity" });
    expect(r.accepted, "a class-wide reason excused a specific transition").toEqual([]);
    expect(r.ok).toBe(false);
    expect(r.stale).toEqual(["authority:witnessAuthorityDigest"]);
  });

  it("binds erasure divergences to their transition too, since one matcher serves them all", () => {
    // The shared seam, exercised on a different divergence class. If the repair
    // had been an authority-only exception, this would still accept a stale
    // excuse — and erasure digests are the record's primary subject.
    const id = Object.keys(frozen.erasure)[0];
    const A = frozen.erasure[id].digest;
    const [B, C] = ["b".repeat(64), "c".repeat(64)];
    const at = (current: string, adjudicated: Record<string, string> = {}) =>
      checkFreeze({ ...frozen, adjudicated }, { ...live, erasure: { ...live.erasure, [id]: { ...live.erasure[id], digest: current } } });
    const reviewed = `${id}@${A}->${B}`;
    const excuse = { [reviewed]: "reviewed: the hole gained an attribution field" };
    expect(at(B, excuse).ok).toBe(true);
    expect(at(C, excuse).ok, "a review of one erased representation authorised a different one").toBe(false);
    expect(at(C, excuse).stale).toEqual([reviewed]);
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
    // would absorb any future change as easily as this one. The erasure
    // authority is moved here so the refusal is for the CLASS, not for the
    // precondition tested below.
    const invented = { ...live.erasure, "field.key": { reach: 0, digest: "0".repeat(64) } };
    const prior = { ...frozen, erasure: invented, authority: { ...frozen.authority, erasureAuthorityDigest: "0".repeat(64) } };
    expect(() => supersessionOf(prior, checkFreeze(prior, live))).toThrow(/no authored effect: delete-slot/);
  });

  it("a moved erasure authority is the supersession's SUBJECT, not an unexplained class", () => {
    // `--supersede` exists for exactly this divergence, and since a moved
    // authority became a divergence every genuine supersession carries it. It
    // was classified by plan lookup, found no plan, and was refused as
    // "(no plan)" -- the mechanism refusing its own use case.
    // One explained image class rides along, so the block has something to
    // state; the subject itself must not appear beside it.
    const moved = { ...live.erasure, "relation.grain": { ...live.erasure["relation.grain"], digest: "0".repeat(64) } };
    const prior = { ...frozen, erasure: moved, authority: { ...frozen.authority, erasureAuthorityDigest: "0".repeat(64) } };
    const check = checkFreeze(prior, live);
    expect(check.divergences.map((d) => d.key).sort()).toEqual(["authority:erasureAuthorityDigest", "relation.grain"]);
    let s: ReturnType<typeof supersessionOf> | undefined;
    expect(() => { s = supersessionOf(prior, check); }).not.toThrow();
    expect(s?.erasureAuthorityDigest, "the block must name the authority it replaces").toBe("0".repeat(64));
    expect(s?.divergences.map((d) => `${d.operation}=${d.coordinates}`), "the subject is not also a counted class").toEqual(["forget-value=1"]);
  });

  it("refuses to supersede an IMAGE-PRESERVING authority move: an empty block would delete the last behavioural statement", () => {
    // An ordering rule or a certificate helper moves the erasure authority and
    // changes no recorded image. There is no new behaviour for a supersession to
    // state, and recording one with no classes is indistinguishable from a
    // re-record that absorbed a defect -- which is exactly what the test above
    // ("records what it supersedes") exists to catch.
    const prior = { ...frozen, authority: { ...frozen.authority, erasureAuthorityDigest: "0".repeat(64) } };
    const check = checkFreeze(prior, live);
    expect(check.divergences.map((d) => d.key)).toEqual(["authority:erasureAuthorityDigest"]);
    expect(() => supersessionOf(prior, check)).toThrow(/image-preserving move supersedes nothing/);
  });

  it("a plain re-record carries the supersession forward when the erasure authority is unmoved OR moved without changing an image, and drops it only when images changed", () => {
    // Unmoved: the committed record against the live tree.
    expect(carriedSupersession(frozen, checkFreeze(frozen, live))).toEqual(frozen.supersedes);
    // Image-preserving move: the authority digest differs, nothing else does.
    const preserving = { ...frozen, authority: { ...frozen.authority, erasureAuthorityDigest: "0".repeat(64) } };
    expect(carriedSupersession(preserving, checkFreeze(preserving, live))).toEqual(frozen.supersedes);
    // A witness-authority move is not the erasure authority moving: carried too.
    const witnessMoved = { ...frozen, authority: { ...frozen.authority, witnessAuthorityDigest: "0".repeat(64) } };
    expect(carriedSupersession(witnessMoved, checkFreeze(witnessMoved, live))).toEqual(frozen.supersedes);
    // Moved WITH an image change: nothing is carried; that record must supersede or refuse.
    const changed = { ...preserving, erasure: { ...live.erasure, "relation.grain": { ...live.erasure["relation.grain"], digest: "0".repeat(64) } } };
    expect(carriedSupersession(changed, checkFreeze(changed, live))).toBeUndefined();
    expect(frozen.supersedes, "the committed record has a statement to carry").toBeDefined();
  });

  it("refuses to supersede when the erasure authority has not moved", () => {
    // A supersession states what a NEW erasure behaviour replaced. With the
    // authority unmoved there is nothing to state, and a block recorded anyway
    // would name the current behaviour as its own predecessor.
    const invented = { ...live.erasure, "field.key": { reach: 0, digest: "0".repeat(64) } };
    const prior = { ...frozen, erasure: invented };
    expect(() => supersessionOf(prior, checkFreeze(prior, live))).toThrow(/erasure authority has not moved/);
  });

  it("refuses to fold a moved WITNESS authority into an erasure supersession", () => {
    // One cause per supersession: a re-record taken for an erasure change must
    // not carry an unreviewed acceptance change with it.
    const prior = { ...frozen, authority: { ...frozen.authority, erasureAuthorityDigest: "0".repeat(64), witnessAuthorityDigest: "1".repeat(64) } };
    expect(() => supersessionOf(prior, checkFreeze(prior, live))).toThrow(/authority:witnessAuthorityDigest moved as well/);
  });

  it("names a record with no authority block as coming from nowhere, not from 'undefined'", () => {
    // `(absent)` is the vocabulary for a missing endpoint everywhere else in
    // this consumer; `authority:x@undefined->...` is a stringified JS artefact,
    // not a transition anyone reviewed.
    const { authority: _a, ...legacy } = frozen;
    void _a;
    const r = checkFreeze(legacy as unknown as Stage2Freeze, live);
    const auth = r.divergences.filter((d) => d.key.startsWith("authority:"));
    expect(auth.length).toBeGreaterThan(0);
    for (const d of auth) expect(d.transition.from, d.key).toBe("(absent)");
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
