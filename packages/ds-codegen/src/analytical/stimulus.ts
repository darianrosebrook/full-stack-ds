/**
 * Occurrence-bound prediction receipts for closure stimuli (REL-VIEW-ALGEBRA-01).
 *
 * A closure's obligation 3 asks whether two stimuli differ only inside the
 * carrier's holder and require different outcomes. It locates that holder
 * STRUCTURALLY — `relation.derivedBy` addresses every derivation in the
 * fixture at once — so a fixture carrying two derivations satisfies the
 * obligation whichever one was rewritten. Six of the ninety bound fixtures
 * carry two, and the one derivation closure that has stimuli today is built on
 * one of them: its b-side rewrites `flat.derivedBy` while citing a law about a
 * subtotal, and the claim that "the patch changes nothing but `flat.derivedBy`"
 * lives in a prose cause string that nothing evaluates.
 *
 * That is the gap this module closes. Grounding a diagnostic NAME proves the
 * author named an authority the frozen oracle carries; it does not prove the
 * cited cause applies to the slot that moved. A receipt names the occurrence,
 * and the checker establishes containment against it:
 *
 *   1. the named occurrence is one the carrier's holder actually resolves to;
 *   2. it carries the source member before the rewrite and the target member
 *      after it;
 *   3. EVERY path that differs between the two stimuli lies under that one
 *      occurrence — measured with `changedPaths`, not asserted in prose;
 *   4. the rewritten stimulus is schema-valid;
 *   5. both cited authorities are vocabulary the frozen oracle grounds;
 *   6. the target law's preconditions hold on the UNCHANGED surrounding
 *      fixture, and name paths outside the occurrence. A precondition that can
 *      only be met by editing something outside the holder makes that base
 *      INELIGIBLE for this closure — a distinct result from a failed check,
 *      because the honest response is to pick another base, not to widen the
 *      patch.
 *
 * The receipt is FROZEN before the engine runs: `digest` covers every authored
 * field, and the engine's observation is appended beside it, never merged into
 * it. `checkReceipt` recomputes both the digest and the agreement, so a
 * prediction edited to match an engine result is a digest failure rather than a
 * silent success. Disagreement is recorded and blocks promotion; it is never
 * resolved by rewriting the prediction.
 *
 * What a passing receipt does NOT establish: that the cited law is the right
 * law, or that the predicted outcome is correct. It establishes that the author
 * was required to name the occurrence their cause explains, and that the
 * stimulus pair changed that occurrence and nothing else.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { groundedVocabulary, holderLocatorOf, parseCarrier } from "./closure.js";
import { sha256 } from "./corpus-integrity.js";
import {
  applyPatch,
  changedPaths,
  FIXTURES_DIR,
  loadOracle,
  outcomeFrom,
  sameOutcome,
  slotPaths,
  type Outcome,
  type Oracle,
  type PatchOp,
} from "./necessity.js";
import type { Fixture } from "./structure.js";

/**
 * How the receipt came to exist.
 *
 * `authored-before-engine` is the only provenance that can carry a promotion:
 * the prediction was digested before the engine was asked, so agreement is
 * evidence. `retrofit` records the occurrence binding for a stimulus pair that
 * already existed — worth checking, because the containment claim is
 * measurable either way, but it cannot claim the prediction was independent of
 * the engine, and the gate does not let it promote a carrier.
 */
export type ReceiptProvenance = "authored-before-engine" | "retrofit";

/**
 * A precondition of the target law, stated as a structural fact about the
 * fixture the rewrite lands in.
 *
 * `present` asserts the path is declared; `absent` asserts it is not; `equals`
 * asserts a scalar value. All three are evaluated on the a-side — the
 * surrounding context BEFORE the rewrite — because the question is whether the
 * target law can apply here without further edits.
 */
export type Precondition =
  | { path: string; holds: "present" }
  | { path: string; holds: "absent" }
  | { path: string; holds: "equals"; value: unknown };

export interface StimulusPrediction {
  /** The closure carrier this stimulus is built for. */
  carrier: string;
  /** The a-side: an oracle-bound fixture id. */
  base: string;
  /**
   * The concrete holder occurrence being rewritten, e.g.
   * `structure.relations.flat.derivedBy`. Not the carrier's structural holder —
   * the one instance of it whose branch the cause explains.
   */
  targetOccurrence: string;
  /** The carrier member the occurrence spells before the rewrite, and why a is illegal. */
  source: { member: string; authority: string };
  /** The carrier member it spells after, why b is required to differ, and what the law needs. */
  target: { member: string; authority: string; preconditions: Precondition[] };
  /** The rewrite. Every op must land under `targetOccurrence`. */
  patch: PatchOp[];
  /** The outcome the target law requires, derived by hand from that law. */
  expected: Outcome;
  provenance: ReceiptProvenance;
  authoredAt: string;
  /** sha256 over every field above. Recomputed on every check. */
  digest: string;
}

/** What the engine said, recorded after the prediction was frozen. */
export interface EngineObservation {
  ranAt: string;
  observed: Outcome;
}

export interface StimulusReceipt {
  prediction: StimulusPrediction;
  engine?: EngineObservation;
}

export interface ReceiptFile {
  $comment?: string;
  spec?: string;
  receipts: StimulusReceipt[];
}

export const RECEIPTS_FILE = path.join(FIXTURES_DIR, "stimulus-receipts-stage2.json");

export function loadReceipts(file = RECEIPTS_FILE): ReceiptFile {
  if (!fs.existsSync(file)) return { receipts: [] };
  return JSON.parse(fs.readFileSync(file, "utf-8")) as ReceiptFile;
}

/**
 * The digest of the authored fields, in a fixed key order.
 *
 * `digest` itself is excluded, and so is the engine record: the point of the
 * freeze is that adding an observation cannot change the identity of the
 * prediction it is being compared against.
 */
export function predictionDigest(p: StimulusPrediction): string {
  const { digest: _digest, ...authored } = p;
  void _digest;
  const ordered = {
    carrier: authored.carrier,
    base: authored.base,
    targetOccurrence: authored.targetOccurrence,
    source: authored.source,
    target: authored.target,
    patch: authored.patch,
    expected: authored.expected,
    provenance: authored.provenance,
    authoredAt: authored.authoredAt,
  };
  return sha256(JSON.stringify(ordered));
}

/**
 * The path convention `valueMap` and `changedPaths` emit: rooted, so every path
 * begins with a dot. Receipts are authored without it, because a leading dot in
 * a hand-written fixture reads as a typo. One conversion here keeps the
 * comparison against measured paths exact rather than approximately equal.
 */
const rooted = (p: string): string => (p.startsWith(".") ? p : `.${p}`);

/** Read an authored dotted/bracketed path. Navigates; interprets nothing. */
export function readPath(root: unknown, p: string): { found: boolean; value: unknown } {
  let node: unknown = root;
  for (const seg of p.split(/\.|(?=\[)/).filter(Boolean)) {
    const index = seg.match(/^\[(\d+)\]$/);
    if (index) {
      if (!Array.isArray(node) || Number(index[1]) >= node.length) return { found: false, value: undefined };
      node = node[Number(index[1])];
      continue;
    }
    if (typeof node !== "object" || node === null || Array.isArray(node) || !(seg in (node as Record<string, unknown>))) {
      return { found: false, value: undefined };
    }
    node = (node as Record<string, unknown>)[seg];
  }
  return { found: true, value: node };
}

/** Is `p` the occurrence itself, or something inside it? */
export const under = (p: string, occurrence: string): boolean =>
  p === occurrence || p.startsWith(`${occurrence}.`) || p.startsWith(`${occurrence}[`);

export type ReceiptVerdict = "held" | "failed" | "ineligible";

export interface ReceiptCheck {
  carrier: string;
  base: string;
  targetOccurrence: string;
  verdict: ReceiptVerdict;
  /** Every clause, in the order the module documents them, with what it found. */
  clauses: { id: string; held: boolean; detail: string }[];
  /** Present once the engine has been asked. Recomputed here, never read from the file. */
  agreement?: { agrees: boolean; expected: Outcome; observed: Outcome };
  problems: string[];
}

const clause = (id: string, held: boolean, detail: string) => ({ id, held, detail });

export function checkReceipt(receipt: StimulusReceipt, oracle: Oracle = loadOracle()): ReceiptCheck {
  const p = receipt.prediction;
  const clauses: ReceiptCheck["clauses"] = [];
  const problems: string[] = [];
  const fail = (verdict: ReceiptVerdict = "failed"): ReceiptCheck => ({
    carrier: p.carrier,
    base: p.base,
    targetOccurrence: p.targetOccurrence,
    verdict,
    clauses,
    problems,
  });

  // 0. FREEZE. Checked first: every clause below reads authored fields, and a
  //    prediction edited after its engine run must not be readable as evidence
  //    for anything.
  const recomputed = predictionDigest(p);
  clauses.push(clause("0-frozen", recomputed === p.digest, recomputed === p.digest ? `digest ${recomputed.slice(0, 12)}` : `recorded ${p.digest.slice(0, 12)} but the authored fields digest to ${recomputed.slice(0, 12)}`));
  if (recomputed !== p.digest) {
    problems.push(`${p.carrier}: the prediction's digest does not cover its authored fields; it was edited after it was frozen`);
    return fail();
  }

  const parsed = parseCarrier(p.carrier);
  if (!parsed) {
    problems.push(`${p.carrier}: not a member-pair carrier`);
    return fail();
  }
  if (!parsed.members.includes(p.source.member) || !parsed.members.includes(p.target.member) || p.source.member === p.target.member) {
    problems.push(`${p.carrier}: source ${p.source.member} and target ${p.target.member} are not the carrier's two members`);
    return fail();
  }

  const base = oracle.fixtures.get(p.base);
  if (!base) {
    problems.push(`${p.carrier}: unknown base fixture ${p.base}`);
    return fail();
  }

  // 1. The occurrence is one the carrier's holder actually resolves to on this
  //    fixture. The census locates it; this module does not re-read the schema.
  // A locator resolves a slot whether or not the property is DECLARED there, so
  // the sentinel walk reports the parent for a relation that carries no
  // derivation at all. Those are not occurrences of the holder; the census's own
  // final step names the property that has to be present for one to exist.
  const holderLocator = holderLocatorOf(parsed.leaf);
  const last = holderLocator.steps[holderLocator.steps.length - 1];
  const property = last && last.kind === "prop" ? last.name : undefined;
  const occurrences = slotPaths(base, holderLocator).filter((o) => property === undefined || o.endsWith(`.${property}`));
  const known = occurrences.includes(rooted(p.targetOccurrence));
  clauses.push(clause("1-occurrence-is-a-holder-instance", known, known ? `${p.targetOccurrence} is 1 of ${occurrences.length} occurrence(s) of ${parsed.holder}` : `${p.targetOccurrence} is not among the ${occurrences.length} occurrence(s) of ${parsed.holder}: ${occurrences.join(", ")}`));

  // 2. It spells the source member before the rewrite, and the target after.
  const discriminator = parsed.leaf.slice(parsed.holder.length + 1);
  const before = readPath(base, `${p.targetOccurrence}.${discriminator}`);
  const spellsSource = before.found && before.value === p.source.member;
  clauses.push(clause("2a-occurrence-spells-the-source-member", spellsSource, spellsSource ? `${p.targetOccurrence}.${discriminator} = ${p.source.member}` : `${p.targetOccurrence}.${discriminator} = ${JSON.stringify(before.value)}, not ${p.source.member}`));

  const patched = { ...applyPatch(base, p.patch), id: `${base.id}_PATCHED` } as Fixture;
  const after = readPath(patched, `${p.targetOccurrence}.${discriminator}`);
  const spellsTarget = after.found && after.value === p.target.member;
  clauses.push(clause("2b-rewrite-spells-the-target-member", spellsTarget, spellsTarget ? `${p.targetOccurrence}.${discriminator} = ${p.target.member} after the patch` : `${p.targetOccurrence}.${discriminator} = ${JSON.stringify(after.value)} after the patch, not ${p.target.member}`));

  // 3. CONTAINMENT, measured. Every differing path lies under the one named
  //    occurrence. This is the clause the prose claim could not carry: on a
  //    two-derivation fixture the holder erasure masks a rewrite at the OTHER
  //    occurrence, so obligation 3 holds either way and only this clause
  //    distinguishes them.
  // `.id` is the patched stimulus's own marker, not a difference the rewrite made.
  const differing = changedPaths(base, patched).filter((c) => c !== ".id");
  const outside = differing.filter((c) => !under(c, rooted(p.targetOccurrence)));
  clauses.push(clause("3-changes-contained-in-the-occurrence", outside.length === 0, outside.length === 0 ? `${differing.length} differing path(s), all under ${p.targetOccurrence}` : `${outside.length} differing path(s) outside ${p.targetOccurrence}: ${outside.join(", ")}`));

  // 4. The rewritten stimulus is a fixture, not merely a JSON edit.
  const errors = oracle.validate(patched);
  clauses.push(clause("4-rewrite-is-schema-valid", errors.length === 0, errors.length === 0 ? "valid" : errors.join("; ")));

  // 5. Both authorities are vocabulary the frozen oracle grounds.
  const vocabulary = groundedVocabulary(oracle);
  const cites = (s: string) => [...vocabulary].some((v) => s.includes(v));
  const grounded = cites(p.source.authority) && cites(p.target.authority);
  clauses.push(clause("5-authorities-are-grounded", grounded, grounded ? "both sides cite oracle-grounded vocabulary" : `ungrounded: ${[!cites(p.source.authority) ? "source" : "", !cites(p.target.authority) ? "target" : ""].filter(Boolean).join(", ")}`));

  // 6. The target law's preconditions hold on the UNCHANGED surrounding
  //    fixture. A precondition inside the occurrence is not a precondition of
  //    the surroundings, and one that fails makes this base ineligible rather
  //    than making the receipt wrong.
  const inside = p.target.preconditions.filter((c) => under(rooted(c.path), rooted(p.targetOccurrence)));
  if (inside.length > 0) {
    clauses.push(clause("6a-preconditions-are-about-the-surroundings", false, `${inside.length} precondition(s) name paths inside the occurrence: ${inside.map((c) => c.path).join(", ")}`));
    problems.push(`${p.carrier}: a precondition inside ${p.targetOccurrence} states what the rewrite writes, not what the surroundings must already carry`);
    return fail();
  }
  clauses.push(clause("6a-preconditions-are-about-the-surroundings", true, `${p.target.preconditions.length} precondition(s), all outside the occurrence`));

  const unmet = p.target.preconditions.filter((c) => {
    const at = readPath(base, c.path);
    if (c.holds === "present") return !at.found;
    if (c.holds === "absent") return at.found;
    return !at.found || at.value !== c.value;
  });
  clauses.push(clause("6b-preconditions-hold-unmodified", unmet.length === 0, unmet.length === 0 ? "the target law applies to this base as it stands" : `unmet on the unmodified base: ${unmet.map((c) => `${c.path} ${c.holds}`).join(", ")}`));

  const structural = clauses.filter((c) => c.id !== "6b-preconditions-hold-unmodified");
  if (structural.some((c) => !c.held)) {
    problems.push(...structural.filter((c) => !c.held).map((c) => `${p.carrier}: ${c.id} — ${c.detail}`));
    return fail();
  }
  // An unmet precondition is not a defective receipt. It says this base cannot
  // instantiate this closure without edits outside the holder, which is exactly
  // the condition under which the base must be replaced rather than widened.
  if (unmet.length > 0) return fail("ineligible");

  const agreement = receipt.engine
    ? {
        agrees: sameOutcome(outcomeFrom(p.expected.status, p.expected.codes, p.expected.terms), outcomeFrom(receipt.engine.observed.status, receipt.engine.observed.codes, receipt.engine.observed.terms)),
        expected: p.expected,
        observed: receipt.engine.observed,
      }
    : undefined;
  if (agreement && !agreement.agrees) {
    problems.push(`${p.carrier}: the engine observed ${JSON.stringify(agreement.observed)} where the frozen prediction requires ${JSON.stringify(agreement.expected)}; recorded as disagreement`);
  }

  return { carrier: p.carrier, base: p.base, targetOccurrence: p.targetOccurrence, verdict: "held", clauses, agreement, problems };
}

export interface ReceiptGateResult {
  ok: boolean;
  checks: ReceiptCheck[];
  /** Carriers whose receipt held AND whose engine agreed under an independent prediction. */
  promotable: string[];
  problems: string[];
}

/**
 * Only a receipt that held, was authored before the engine ran, and agrees with
 * it can carry a promotion. A retrofit receipt binds the occurrence of a
 * stimulus that already existed; that is worth measuring and is not evidence of
 * independence.
 */
export function checkReceipts(file = RECEIPTS_FILE, oracle: Oracle = loadOracle()): ReceiptGateResult {
  const checks = loadReceipts(file).receipts.map((r) => ({ receipt: r, check: checkReceipt(r, oracle) }));
  const promotable = checks
    .filter(({ receipt, check }) => check.verdict === "held" && receipt.prediction.provenance === "authored-before-engine" && check.agreement?.agrees === true)
    .map(({ check }) => check.carrier);
  const problems = checks.flatMap(({ check }) => check.problems);
  return { ok: checks.every(({ check }) => check.verdict !== "failed"), checks: checks.map(({ check }) => check), promotable, problems };
}

export function summarizeReceipts(result: ReceiptGateResult): string {
  const by = (v: ReceiptVerdict) => result.checks.filter((c) => c.verdict === v).length;
  const lines = [
    `stimulus receipts (REL-VIEW-ALGEBRA-01): ${result.ok ? "OK" : "FAILED"}`,
    `  ${result.checks.length} receipt(s): ${by("held")} held, ${by("ineligible")} ineligible base, ${by("failed")} failed`,
    `  promotable carriers (held + authored before the engine + agreeing): ${result.promotable.length}${result.promotable.length > 0 ? ` — ${result.promotable.join(", ")}` : ""}`,
  ];
  for (const c of result.checks.filter((c) => c.verdict !== "held")) {
    lines.push(`  ${c.verdict}: ${c.carrier} on ${c.base} at ${c.targetOccurrence}`);
    for (const cl of c.clauses.filter((cl) => !cl.held)) lines.push(`      ${cl.id}: ${cl.detail}`);
  }
  for (const p of result.problems) lines.push(`  ! ${p}`);
  return lines.join("\n");
}

if (process.argv[1]?.endsWith("stimulus.ts")) {
  const result = checkReceipts();
  console.log(summarizeReceipts(result));
  if (!result.ok) process.exit(1);
}
