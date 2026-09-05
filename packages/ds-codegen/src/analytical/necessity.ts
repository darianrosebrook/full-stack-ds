/**
 * Necessity-witness harness (REL-FIELD-ALGEBRA-02 Phase B, invariants 5-8).
 *
 * External to the engine by construction: nothing here imports `engines.ts`
 * or `judgment.ts`. A witness's required outcomes come from the frozen oracle
 * (corpus cases, their admissible neighbours, obligation triads), from the
 * pre-harness holdout expectations, or from a hand adjudication that cites its
 * cause; never from engine output. What the harness proves is a property of
 * the REPRESENTATION: two structures the oracle must tell apart become
 * indistinguishable once a coordinate is erased.
 *
 * Coordinate states are exactly two (invariant 4): `ratified` (a witness in
 * `witnesses.json` holds for it) or `not-yet-admitted` (an entry in
 * `removals.json`). Stage-1 coordinates the kernel carries under another name
 * (the D6 factorization, merged enum members) are mapped to the kernel
 * coordinate that witnesses them; the map is data in `removals.json`.
 */
import * as fs from "node:fs";
import { Ajv } from "ajv";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeScale, type ScaleLabel } from "./capabilities.js";
import type { Coordinate } from "./census.js";
import { type Bindings, type Holdout, loadCorpusInput } from "./corpus-integrity.js";
import { DERIVATION_DIAG } from "./codes.js";
import { type BoundaryFinding, checkDerivations } from "./derivation.js";
import { type ErasurePlan, resolveSlots, type StructuralLocator } from "./erasure-plan.js";
import { canonical, collides, erase, eraseAll, planFor } from "./quotient.js";
import { loadQuotientValidator, markersIn } from "./quotient-image.js";
import type { RelationalStructure } from "./relation-model.js";
import { type Fixture, loadFixtureValidator, parseFixtures } from "./structure.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CONTRACTS_DIR = path.resolve(HERE, "../../../ds-contracts");
export const FIXTURES_DIR = path.join(CONTRACTS_DIR, "analytical-fixtures");
export const WITNESSES_FILE = path.join(FIXTURES_DIR, "witnesses.json");
export const REMOVALS_FILE = path.join(FIXTURES_DIR, "removals.json");
export const CENSUS_STAGE1_FILE = path.join(FIXTURES_DIR, "census-stage1.json");
const DOCTRINE = path.resolve(HERE, "../../../../docs/architecture/analytical-relation-doctrine.md");

/**
 * Every module that can move a judgment, in the order the holdout's rule
 * digest concatenates them.
 *
 * One list, exported, because the holdout guarantee is only as wide as this
 * array: a rule that lives in a module absent from it can change while the
 * holdout still claims to have been authored against the current rules. Adding
 * a rule module here is part of adding the module, not a follow-up.
 *
 * The order is append-only, so the digest's history reads as a sequence of
 * widenings rather than a sequence of reorderings.
 *
 * This is a CLOSED declaration, not a bounded attribution: experiments.test.ts
 * walks the local import graph from these entry points and requires every
 * module a judgment can reach to be either listed here or named in an explicit
 * non-rule list with the reason it cannot move a judgment. A helper extracted
 * out of `engines.ts` into a new file is reached through its import and
 * reported, where a hand-maintained list would have silently under-claimed.
 */
export const RULE_SOURCES: readonly string[] = [
  path.join(HERE, "engines.ts"),
  path.join(HERE, "derivation.ts"),
  path.join(HERE, "codes.ts"),
  // `deriveStatus` decides what a set of occurrences MEANS, and
  // `normalizeObservation` decides what a row says. Both move judgments as
  // surely as a rule does. `relation-model.ts` is deliberately absent: it
  // decides which structures are well-formed, not what any of them yields.
  path.join(HERE, "judgment.ts"),
  path.join(HERE, "structure.ts"),
];

/** The oracle-required outcome of a stimulus: status and the set of codes/terms. */
export interface Outcome {
  status: "admissible" | "unproven" | "illegal";
  codes: string[];
  terms: string[];
}

export type PatchOp = { set: string; value: unknown } | { delete: string };

/** One side of a witness: an oracle-adjudicated fixture, or a patched one with a hand adjudication. */
export type Side = { fixture: string } | { base: string; patch: PatchOp[]; outcome: Outcome; cause: string };

export interface Witness {
  /** One coordinate id, or two for a minimal 2-set (invariant 7: never more). */
  coordinates: string[];
  a: Side;
  b: Side;
  note?: string;
}

export interface WitnessFile {
  $comment?: string;
  witnesses: Witness[];
}

export interface RemovalEntry {
  coordinate: string;
  reason: string;
  /** The stage that can re-earn it with its own witness. */
  reintroducibleAt: number;
}

export interface RemovalsFile {
  $comment?: string;
  /** Stage-1 coordinates absent from the kernel. */
  removed: RemovalEntry[];
  /** Stage-1 leaves the kernel carries under another id. */
  leafMap: Record<string, string>;
  /** Stage-1 enum members merged into a kernel member (`null` = the leaf's absence). */
  memberMap: Record<string, Record<string, string | null>>;
  /** Stage-1 coordinates factorized into kernel coordinates (D6). */
  factorized: Record<string, { into: string[]; aliases: [string, string][] }>;
  /** Assertion-key rewrites the removals imply for the frozen Phase-A ledger. */
  keyRewrites: [string, string][];
}

/**
 * What a COMPLETED experiment concluded, under the erasure authority it was
 * bound to. Historical, and therefore closed to revision.
 *
 * Stage 1 accounted 81 coordinates as ratified under its then-current
 * instrument. That the instrument has since been corrected does not retroject
 * onto what the completed experiment concluded, and rewriting the tally to 77
 * would be editing a finished record to match a later measurement. The
 * distinction is not equivocation: `Disposition` says what was concluded, and
 * `EvidenceStanding` below says what is currently supported.
 */
export type Disposition =
  | { state: "ratified"; via: string[] }
  | { state: "not-yet-admitted"; reason: string; reintroducibleAt?: number }
  | { state: "reference" };

/**
 * What evidence CURRENTLY supports, under the authority in force now.
 *
 * `suspended` is deliberately not a fourth semantic disposition. A coordinate
 * whose witness stopped holding because the instrument changed has not been
 * adjudicated and has not left the kernel — its supporting evidence was
 * invalidated, which is a statement about the evidence and not about the
 * coordinate. Naming it here keeps it out of the semantic taxonomy, where it
 * would authorize an outcome alongside ratified and not-yet-admitted that
 * nobody decided.
 */
export type EvidenceStanding =
  | { state: "holding"; via: "primitive" | "interaction-only" | "closure-accounted"; evidence: string[] }
  | { state: "suspended"; experiment: string; reason: string; invalidatedEvidence: string[] }
  | { state: "unsupported" };

export interface Oracle {
  fixtures: Map<string, Fixture>;
  outcomeOf(fixtureId: string): { outcome: Outcome; source: string } | undefined;
  validate(fixture: unknown): string[];
}

export function outcomeFrom(status: Outcome["status"], codes: string[] = [], terms: string[] = []): Outcome {
  return { status, codes: [...new Set(codes)].sort(), terms: [...new Set(terms)].sort() };
}

/** The frozen oracle as a map from fixture id to its required outcome and provenance. */
export function loadOracle(contractsDir = CONTRACTS_DIR, doctrinePath = DOCTRINE): Oracle {
  const read = (rel: string) => fs.readFileSync(path.join(contractsDir, rel), "utf-8");
  const corpus = loadCorpusInput(path.join(contractsDir, "analytical-pack"), doctrinePath);
  const bindings = JSON.parse(read("analytical-fixtures/bindings.json")) as Bindings;
  const holdout = JSON.parse(read("analytical-fixtures/holdout.json")) as Holdout;
  const fixtures = new Map(parseFixtures(read("analytical-fixtures/fixtures.jsonl")).map((f) => [f.id, f]));
  const table = new Map<string, { outcome: Outcome; source: string }>();
  for (const [caseId, fx] of Object.entries(bindings.cases)) {
    const c = corpus.cases.find((x) => x.case === caseId);
    if (!c) throw new Error(`bindings.cases names unknown case ${caseId}`);
    const outcome = c.verdict === "illegal" ? outcomeFrom("illegal", [c.diagnostic!]) : outcomeFrom("unproven", [], [c.obligation!]);
    table.set(fx, { outcome, source: `corpus:${caseId}` });
  }
  for (const [code, fx] of Object.entries(bindings.neighbours)) {
    table.set(fx, { outcome: outcomeFrom("admissible"), source: `neighbour:${code}` });
  }
  for (const [term, t] of Object.entries(bindings.triads)) {
    table.set(t.absent, { outcome: outcomeFrom("unproven", [], [term]), source: `triad:${term}:absent` });
    table.set(t.satisfying, { outcome: outcomeFrom("admissible"), source: `triad:${term}:satisfying` });
    table.set(t.hostile, { outcome: outcomeFrom("illegal", [t.hostileDiagnostic]), source: `triad:${term}:hostile` });
  }
  for (const item of holdout.items) {
    table.set(item.fixture, {
      outcome: outcomeFrom(
        item.expected.status,
        item.expected.diagnostics.map((d) => d[0]),
        item.expected.obligations.map((o) => o[0]),
      ),
      source: `holdout:${item.fixture}`,
    });
  }
  return { fixtures, outcomeOf: (id) => table.get(id), validate: loadFixtureValidator(contractsDir) };
}

type Json = Record<string, unknown>;

/** Apply dotted-path set/delete ops to a deep copy; numeric segments index arrays. */
export function applyPatch(fixture: Fixture, ops: PatchOp[]): Fixture {
  const copy = JSON.parse(JSON.stringify(fixture)) as Json;
  for (const op of ops) {
    const pathStr = "set" in op ? op.set : op.delete;
    const segs = pathStr.split(".");
    let node: unknown = copy;
    for (const seg of segs.slice(0, -1)) {
      if (typeof node !== "object" || node === null) throw new Error(`patch path ${pathStr}: ${seg} is not an object`);
      const n = node as Json;
      if (n[seg] === undefined) n[seg] = {};
      node = n[seg];
    }
    const last = segs[segs.length - 1];
    if (typeof node !== "object" || node === null) throw new Error(`patch path ${pathStr}: parent is not an object`);
    if ("set" in op) (node as Json)[last] = op.value;
    else delete (node as Json)[last];
  }
  return copy as unknown as Fixture;
}

export interface ResolvedSide {
  fixture: Fixture;
  outcome: Outcome;
  source: string;
}

/** Resolve a side to a concrete stimulus and its oracle-required outcome. */
export function resolveSide(side: Side, oracle: Oracle): ResolvedSide {
  if ("fixture" in side) {
    const fixture = oracle.fixtures.get(side.fixture);
    if (!fixture) throw new Error(`witness names unknown fixture ${side.fixture}`);
    const o = oracle.outcomeOf(side.fixture);
    if (!o) throw new Error(`fixture ${side.fixture} has no oracle-adjudicated outcome; use a patch with a hand adjudication`);
    return { fixture, ...o };
  }
  const base = oracle.fixtures.get(side.base);
  if (!base) throw new Error(`witness names unknown base fixture ${side.base}`);
  const fixture = { ...applyPatch(base, side.patch), id: `${base.id}_PATCHED` };
  return {
    fixture,
    outcome: outcomeFrom(side.outcome.status, side.outcome.codes, side.outcome.terms),
    source: `adjudicated:${side.cause}`,
  };
}

export const sameOutcome = (x: Outcome, y: Outcome) => JSON.stringify(x) === JSON.stringify(y);

export type WitnessFailure =
  | "SAME_OUTCOME"
  | "SCHEMA_INVALID"
  | "NO_COLLISION"
  | "NOT_MINIMAL"
  | "TOO_MANY_COORDINATES"
  | "UNKNOWN_COORDINATE"
  | "IDENTICAL_STIMULI"
  | "ERASURE_NOT_ISOLATED"
  /**
   * The isolation obligation could not be evaluated at all.
   *
   * Distinct from `ERASURE_NOT_ISOLATED`, which says the erasure was shown to
   * damage something. This says nothing was shown either way, and it is a
   * failure because a witness rests on the claim that its collision is
   * attributable to its coordinate — an unevaluated obligation leaves that
   * claim unsupported rather than supported by default.
   */
  | "ERASURE_ISOLATION_UNEVALUATED";

export interface WitnessCheck {
  ok: boolean;
  failures: { code: WitnessFailure; detail: string }[];
  /**
   * Every isolation obligation this witness carries, and how each was settled.
   *
   * Part of the RESULT, not a module-level tally. Two things follow. Admission
   * can see the difference between a discharged obligation and an unevaluated
   * one — which it could not while the check returned `string | undefined` and
   * an inapplicable comparison read as a clean one. And the record identifies
   * the witness, the side, the stimulus and the proof, where a set of
   * coordinate ids identified none of them.
   */
  isolation: IsolationRecord[];
  a: ResolvedSide;
  b: ResolvedSide;
}

/**
 * Check one witness against the census: both stimuli validate, outcomes
 * differ, erasing the named coordinate(s) makes them collide, and for a 2-set
 * neither single coordinate suffices (invariant 7).
 */
export function checkWitness(
  w: Witness,
  census: Coordinate[],
  oracle: Oracle,
  isolate: (fixture: Fixture, c: Coordinate) => IsolationResult = (f, c) => checkIsolation(f, c),
  combine: (fixture: Fixture, cs: readonly Coordinate[]) => IsolationResult = (f, cs) => checkCombinedIsolation(f, cs),
): WitnessCheck {
  const a = resolveSide(w.a, oracle);
  const b = resolveSide(w.b, oracle);
  const failures: WitnessCheck["failures"] = [];
  const isolation: IsolationRecord[] = [];
  const byId = new Map(census.map((c) => [c.id, c]));
  if (w.coordinates.length > 2) {
    failures.push({ code: "TOO_MANY_COORDINATES", detail: `${w.coordinates.length} coordinates; the stop condition is 2` });
  }
  const coords: Coordinate[] = [];
  for (const id of w.coordinates) {
    const c = byId.get(id);
    if (!c) failures.push({ code: "UNKNOWN_COORDINATE", detail: id });
    else coords.push(c);
  }
  for (const [label, side] of [["a", a], ["b", b]] as const) {
    const errors = oracle.validate(side.fixture);
    if (errors.length > 0) failures.push({ code: "SCHEMA_INVALID", detail: `${label}: ${errors.join("; ")}` });
  }
  if (canonical(a.fixture) === canonical(b.fixture)) {
    failures.push({ code: "IDENTICAL_STIMULI", detail: "the two stimuli are the same representation" });
  }
  if (sameOutcome(a.outcome, b.outcome)) failures.push({ code: "SAME_OUTCOME", detail: JSON.stringify(a.outcome) });
  if (failures.length > 0 || coords.length !== w.coordinates.length) return { ok: false, failures, isolation, a, b };
  if (canonical(eraseAll(a.fixture, coords)) !== canonical(eraseAll(b.fixture, coords))) {
    failures.push({ code: "NO_COLLISION", detail: `erasing ${w.coordinates.join(" + ")} does not identify the stimuli` });
  }
  if (coords.length === 2) {
    for (const c of coords) {
      if (collides(a.fixture, b.fixture, c)) failures.push({ code: "NOT_MINIMAL", detail: `${c.id} alone already identifies the stimuli` });
    }
  }
  for (const [label, side] of [["a", a], ["b", b]] as const) {
    for (const c of coords) {
      const result = isolate(side.fixture, c);
      isolation.push({ side: label, coordinate: c.id, fixture: side.fixture.id, result });
      // An UNEVALUATED obligation fails the witness. It is not a refutation of
      // the erasure and it is not evidence of damage — it is the absence of the
      // support the witness claims to have, and admitting it would be exactly
      // the collapse this record exists to end.
      if (result.state === "violated") failures.push({ code: "ERASURE_NOT_ISOLATED", detail: `${label}/${c.id}: ${result.detail}` });
      if (result.state === "unevaluated") failures.push({ code: "ERASURE_ISOLATION_UNEVALUATED", detail: `${label}/${c.id}: ${result.reason}` });
    }
    // AND THE IMAGE THE COLLISION IS ABOUT. Above, each coordinate is erased
    // alone against the original stimulus; the collision is decided by
    // `eraseAll`, whose saturated execution is not two independent runs. A 2-set
    // whose members are each fine apart can compose into something neither of
    // them is, and nothing looked at that until now.
    if (coords.length > 1) {
      const combined = combine(side.fixture, coords);
      isolation.push({ side: label, coordinate: coords.map((c) => c.id).join(" + "), fixture: side.fixture.id, result: combined, composed: true });
      if (combined.state === "violated") failures.push({ code: "ERASURE_NOT_ISOLATED", detail: `${label}/combined: ${combined.detail}` });
      if (combined.state === "unevaluated") failures.push({ code: "ERASURE_ISOLATION_UNEVALUATED", detail: `${label}/combined: ${combined.reason}` });
    }
  }
  return { ok: failures.length === 0, failures, isolation, a, b };
}

/**
 * A quotient must remove ONE degree of freedom. If erasing a coordinate also
 * changes arity, or reorders, or manufactures a defect that was not there, a
 * collision proves nothing about the coordinate it claims to be about: the
 * stimuli may have been identified by the collateral damage.
 *
 * The specific trap this closes: replacing a resolvable reference with a token
 * can create a dangling reference, and a witness would then "hold" because
 * erasure introduced REL_DERIVATION_INPUT_MISSING, not because the incidence
 * relation was necessary.
 *
 * Returns a description of the violation, or undefined when the erasure is
 * isolated.
 */
/** Every path in a fixture that holds a non-object value, for set-difference. */
function terminalPaths(node: unknown, path = "", out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(node) || node === null || typeof node !== "object") {
    if (path) out.add(path);
    return out;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) terminalPaths(v, `${path}.${k}`, out);
  return out;
}

/**
 * How the isolation obligation was DISCHARGED, named rather than inferred.
 *
 * The obligation is that erasing a coordinate removes one degree of freedom.
 * There is more than one way to establish that, and which one was used is part
 * of the result — an empty failure list is not a proof, it is the absence of a
 * refutation, and the two were indistinguishable while this returned
 * `string | undefined`.
 *
 * THESE ARE NOT RANKED. They establish different propositions, and admission is
 * justified by the combination an operation requires, never by preferring a
 * label. Reading one as a universal substitute for another is how a side
 * condition gets mistaken for a definition.
 *
 * - `unchanged`: the erasure is a no-op on this stimulus, so there is nothing
 *   it could have damaged. The `reference` kind is defined this way.
 * - `engine-comparison`: both structures are source-representable, the
 *   derivation boundary was asked about each, and the erasure introduced no
 *   finding. This is the only route that can see a MANUFACTURED semantic
 *   defect — the dangling input that gave this check its reason to exist — and
 *   it sees nothing about WHERE the mutation happened.
 * - `quotient-legal-slot-local`: the image introduced no quotient-language
 *   error and every value the erasure changed lies at or beneath a slot the
 *   coordinate's own locator resolves to. This is the only route that bounds
 *   the mutation, and it says nothing about the semantics of the result.
 *
 * WHAT NONE OF THEM ESTABLISHES: that the operation performed the forgetting it
 * names. Legality and locality are side conditions — a merge writing the WRONG
 * member class at exactly the right slot satisfies both — and the operation's
 * own law is proved separately, over the finite operation vocabulary, in
 * `erasure-plan.test.ts` and `quotient-image.test.ts`. Nothing here should be
 * read as a substitute for that.
 */
export type IsolationProof = "unchanged" | "no-introduced-finding" | "quotient-legal" | "slot-local";

/**
 * What one isolation obligation yielded, for one stimulus and one coordinate.
 *
 * `unevaluated` is the state whose absence let an unasked question read as an
 * answered one. It is neither a discharge nor a refutation, and a witness
 * carrying one must not reach standing — the obligation simply has not been
 * met yet. It is also the state of an obligation the engine WAS asked and could
 * not settle: a structure that still carries a finding after the erasure can
 * hide a different cause behind the same key, and a discharge used to carry
 * that as a `limitation` nothing at admission read (see the masking block in
 * `checkIsolation`). An unexpected exception from the instrument is none of
 * these three: it propagates.
 */
export type IsolationResult =
  | {
      state: "discharged";
      /**
       * EVERY proposition established, not the best-sounding one.
       *
       * A single label invited exactly the reading the names were meant to
       * prevent: that one proof substitutes for another. It does not. The
       * engine route sees only the `structure`, so it discharged an
       * assertion-side erasure without anything bounding where the change
       * landed — a ranking hiding a gap. Discharge now requires the
       * combination an operation needs, and the set says which parts held.
       */
      by: IsolationProof[];
    }
  | { state: "violated"; detail: string }
  | { state: "unevaluated"; reason: string };

/**
 * One isolation evaluation, identified well enough to be an admission record.
 *
 * A coordinate id alone was not: it named neither the witness, nor which
 * stimulus, nor what proof discharged the obligation, so a set of ids could
 * report that SOMETHING was inapplicable somewhere and nothing more.
 */
export interface IsolationRecord {
  side: "a" | "b";
  /** One coordinate id, or the joined set when this is the composed obligation. */
  coordinate: string;
  /** The stimulus it was evaluated on. */
  fixture: string;
  result: IsolationResult;
  /** True where this is the obligation on the image the collision is decided by. */
  composed?: boolean;
}

/**
 * Validate a `RelationalStructure` against the EMITTED contract for it.
 *
 * The contract for the argument the derivation checker actually takes. Not a
 * parallel hand-written schema — `relation.contract.schema.json` is the same
 * projection of `relation-model.ts` that every other consumer reads, so this
 * cannot drift from the model or disagree with the fixture validator about what
 * a structure is.
 */
let quotientValidatorCache: ((image: unknown) => string[]) | undefined;
function quotientValidator(): (image: unknown) => string[] {
  quotientValidatorCache ??= loadQuotientValidator(CONTRACTS_DIR);
  return quotientValidatorCache;
}

let structureValidatorCache: ((s: unknown) => string[]) | undefined;
function structureValidator(): (s: unknown) => string[] {
  if (structureValidatorCache) return structureValidatorCache;
  const schema = JSON.parse(fs.readFileSync(path.join(CONTRACTS_DIR, "relation.contract.schema.json"), "utf-8")) as object;
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  structureValidatorCache = (s) => (validate(s) ? [] : (validate.errors ?? []).map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`.trim()));
  return structureValidatorCache;
}


/**
 * The instrument the isolation check runs, injectable so its FAILURE is
 * falsifiable.
 *
 * A default parameter, invisible to every real caller. It exists because the
 * property that matters here cannot be observed from outside otherwise: that a
 * throw from the checker, on an argument already shown to be in the checker's
 * domain, propagates as an instrument failure. A test can hand in a checker
 * that throws and watch what happens; without the seam the only way to assert
 * that is to trust the absence of a `catch`, which is exactly the thing that
 * was wrong before and would be wrong again silently.
 */
export type DerivationChecker = (structure: RelationalStructure) => BoundaryFinding[];

/** The plan lookup, injectable for the same reason: `unevaluated` must be observable. */
export type PlanLookup = (c: Coordinate) => ErasurePlan | undefined;

/**
 * Every path in a representation, with a token that identifies what is AT it.
 *
 * A token per NODE, not per scalar leaf. The earlier version recorded a value
 * only when the walk reached a scalar, so a container with no scalar descendant
 * contributed nothing and four kinds of real change were invisible: emptying an
 * array then dropping its holder, deleting an empty object, an array becoming
 * an object, and an array of empty objects growing. Each of those is a genuine
 * mutation, and holder presence, empty evidence collections and absent
 * declarations are exactly the distinctions this apparatus keeps having to
 * recover — so an equality that cannot see them is the wrong equality.
 *
 * The token carries kind and arity, so container existence, container kind and
 * array length are all observed; scalar values are carried directly. Two
 * representations have equal maps if and only if they are equal, because object
 * key sets are witnessed by their children's presence together with the
 * parent's arity.
 */
export function valueMap(node: unknown, path = "", out: Map<string, string> = new Map()): Map<string, string> {
  if (node === null || typeof node !== "object") {
    out.set(path, JSON.stringify(node));
    return out;
  }
  if (Array.isArray(node)) {
    out.set(path, `array:${node.length}`);
    node.forEach((v, i) => valueMap(v, `${path}[${i}]`, out));
    return out;
  }
  const entries = Object.entries(node as Record<string, unknown>);
  out.set(path, `object:${entries.length}`);
  for (const [k, v] of entries) valueMap(v, `${path}.${k}`, out);
  return out;
}

/**
 * A finding's STABLE identity, and how many times it occurs.
 *
 * `${code}@${subject}` was a lossy projection of a `BoundaryFinding`, and the
 * loss was load-bearing three ways: an obligation carries `term` and no `code`,
 * so two different obligations at one subject both read `undefined@subject`; a
 * second occurrence of the same key vanished into a set; and `derivation`,
 * `engine` and `evidenceClass` — which say WHICH occurrence and under what
 * authority — were dropped entirely.
 *
 * `detail` is deliberately excluded. It is prose that legitimately moves when
 * the erasure changes a value it quotes, so including it would report a
 * manufactured defect wherever the erasure worked as intended.
 */
export function findingId(d: BoundaryFinding): string {
  return `${d.kind} ${d.code ?? d.term ?? "(unnamed)"}@${d.subject} via ${d.derivation} [${d.engine}/${d.evidenceClass}]`;
}

function tally(findings: readonly BoundaryFinding[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const d of findings) out.set(findingId(d), (out.get(findingId(d)) ?? 0) + 1);
  return out;
}

/** Every path at which two representations disagree, in either direction. */
export function changedPaths(before: unknown, after: unknown): string[] {
  const b = valueMap(before);
  const a = valueMap(after);
  return [...new Set([...b.keys(), ...a.keys()])].filter((k) => b.get(k) !== a.get(k)).sort();
}

/**
 * The paths a locator resolves to on this stimulus, found by writing a sentinel
 * and observing where it lands.
 *
 * `resolveSlots` hands back parent/key pairs, which is what an executor needs
 * and not what a locality proof needs. Rather than widen that signature — it
 * belongs to the erasure authority, and this is a witness-side question — the
 * slots are located by overwriting each with one scalar and reading off the
 * minimal paths that changed. Minimal, because overwriting an object slot also
 * removes every path beneath it, and it is the slot itself that bounds the
 * erasure.
 */
const SENTINEL = "\u0000slot";
function slotPaths(fixture: Fixture, locator: StructuralLocator): string[] {
  const marked = JSON.parse(JSON.stringify(fixture)) as Fixture;
  for (const s of resolveSlots(marked, locator)) (s.parent as Record<string, unknown>)[s.key as string] = SENTINEL;
  const changed = changedPaths(fixture, marked);
  return changed.filter((p) => !changed.some((q) => q !== p && p.startsWith(`${q}.`)) && !changed.some((q) => q !== p && p.startsWith(`${q}[`)));
}

const structureOf = (f: Record<string, unknown> | undefined) => f?.structure as RelationalStructure | undefined;

/** Is this something the SOURCE engine can be asked about, as it stands? */
const inDomain = (s: RelationalStructure | undefined): s is RelationalStructure =>
  s !== undefined && markersIn(s).length === 0 && structureValidator()(s).length === 0;

/**
 * The obligation on the image `checkWitness` ACTUALLY COMPARES.
 *
 * A 2-set witness collides under `eraseAll`, but isolation was only ever
 * evaluated one coordinate at a time against the ORIGINAL stimulus. That leaves
 * the composed erasure — the thing the collision is about — unexamined:
 * two operations individually within their slots can interact through a
 * discriminator, a branch locator, a member class or a holder deletion, and
 * saturated execution does not have the semantics of two independent runs.
 *
 * WHAT THIS COVERS, and no more: the combined image is legal in the quotient
 * language, and the combined change lies inside the UNION of the coordinates'
 * own locators. The per-coordinate refusals — holder presence, arity and order
 * preservation — remain per-coordinate claims and are evaluated there; applying
 * them to a combined image would fire on paths the OTHER coordinate legitimately
 * removed. What the combined check cannot do is establish that the composition
 * partitions as intended; that is the operation algebra's question, settled by
 * the composition work rather than here.
 */
export function checkCombinedIsolation(
  fixture: Fixture,
  coords: readonly Coordinate[],
  check: DerivationChecker = checkDerivations,
  lookup: PlanLookup = planFor,
): IsolationResult {
  const before = fixture as unknown as Record<string, unknown>;
  const after = eraseAll(fixture, coords) as unknown as Record<string, unknown>;
  const changed = changedPaths(before, after);
  if (changed.length === 0) return { state: "discharged", by: ["unchanged"] };

  const by: IsolationProof[] = [];
  let engineInconclusive: string | undefined;
  const sBefore = structureOf(before);
  const sAfter = structureOf(after);
  if (inDomain(sBefore) && inDomain(sAfter)) {
    const findingsBefore = tally(check(sBefore));
    const introduced = [...tally(check(sAfter))].filter(([k, n]) => n > (findingsBefore.get(k) ?? 0)).map(([k]) => k);
    if (introduced.length > 0) {
      return { state: "violated", detail: `the combined erasure introduced ${introduced.join(", ")}, so the collision may be that defect rather than the coordinates` };
    }
    void findingsBefore;
    // Same rule as the per-coordinate route (see the masking block in
    // `checkIsolation`): a finding still present after the erasure can hide an
    // introduced cause, so the comparison is unsettled, not a caveat.
    const findingsAfter = tally(check(sAfter));
    engineInconclusive =
      findingsAfter.size === 0
        ? undefined
        : `the after-structure still carries ${[...findingsAfter.keys()].join(", ")}; a first-refutation checker cannot show that no different cause appeared behind it`;
    if (engineInconclusive === undefined) by.push("no-introduced-finding");
  }

  const legal = quotientValidator();
  const wasIllegal = legal(before);
  const introduced = legal(after).filter((e) => !wasIllegal.includes(e));
  if (introduced.length > 0) {
    return { state: "violated", detail: `the combined erasure makes the image illegal in the quotient language: ${introduced.slice(0, 3).join("; ")}` };
  }
  // Named, as the per-coordinate route names it: the set says which parts
  // held. This route had established legality and then reported only locality.
  by.push("quotient-legal");

  const plans = coords.map(lookup);
  const unplanned = coords.filter((_, i) => plans[i] === undefined);
  if (unplanned.length > 0 && changed.length > 0) {
    return { state: "unevaluated", reason: `${unplanned.map((c) => c.id).join(", ")} has no erasure plan, so the union of locators does not bound the combined change` };
  }
  const slots = plans.flatMap((p) => (p ? slotPaths(fixture, p.locator) : []));
  const within = (p: string) => slots.some((sl) => p === sl || p.startsWith(`${sl}.`) || p.startsWith(`${sl}[`));
  const inside = changed.filter(within);
  const impliedBy = (p: string) => inside.some((q) => q !== p && (q.startsWith(`${p}.`) || q.startsWith(`${p}[`)));
  const outside = changed.filter((p) => !within(p) && !impliedBy(p));
  if (outside.length > 0) {
    return {
      state: "violated",
      detail: `the combined erasure changed ${outside.join(", ")}, which no locator in ${coords.map((c) => c.id).join(" + ")} reaches`,
    };
  }
  by.push("slot-local");
  if (engineInconclusive !== undefined) {
    return { state: "unevaluated", reason: `${engineInconclusive}; ${by.join(" and ")} held, and neither speaks to a defect introduced inside the slot` };
  }
  return { state: "discharged", by };
}

export function checkIsolation(
  fixture: Fixture,
  c: Coordinate,
  check: DerivationChecker = checkDerivations,
  lookup: PlanLookup = planFor,
): IsolationResult {
  const before = fixture as unknown as Record<string, unknown>;
  const after = erase(fixture, c) as unknown as Record<string, unknown>;

  // Erasure may not manufacture a derivation-boundary defect.
  //
  // With one exception that is not a loophole. For a member pair on a
  // DISCRIMINATOR, changing which operator applies is the entire content of the
  // coordinate, and the substitution touches nothing but the tag — so a
  // SEMANTIC finding that appears is the distinction under test, not collateral
  // damage. Refusing it would make every discriminator pair unwitnessable by
  // construction, which is the instrument deciding the outcome.
  //
  // The boundary's own WELL-FORMEDNESS refusals stay collateral for every class
  // including this one: a dangling input or an underivable result means the
  // erasure broke the structure, and a collision would be that break. That is
  // the named trap, and it is the line `codes.ts` already draws between
  // `DERIVATION_DIAG` and the doctrine catalogue.
  // THE ENGINE IS ASKED ABOUT A SOURCE DOCUMENT, NEVER ABOUT AN IMAGE.
  //
  // `erase` returns a quotient image, and the engine reads the source language:
  // `OPERATOR_LAWS[d.kind]` is a lookup on a string, and a forgotten
  // discriminator is not one. Teaching the engine to read holes would make it a
  // consumer of the erasure encoding, so the comparison runs only where the
  // image's structure IS a source structure, exactly as it stands.
  //
  // APPLICABILITY IS DECIDED BY THE CONTRACT FOR THE ACTUAL ARGUMENT, which is
  // a `RelationalStructure` and not a `Fixture`. Two earlier attempts were both
  // wrong at this seam, in opposite directions:
  //
  //   validating the whole FIXTURE disabled the check for every hand-built
  //   probe, because those carry no assertions — an envelope requirement
  //   deciding whether a STRUCTURAL check applies;
  //
  //   catching every exception turned an instrument failure into "no opinion",
  //   so a `TypeError` anywhere in the checker would have read as "this erasure
  //   introduced no defect". Three situations have to stay distinct: outside
  //   the declared domain, inside it and clean, and broken while running. An
  //   unexpected throw is evidence of the third and never the first.
  //
  // Nothing is projected, dropped, or substituted to make an image runnable.
  // `sourceProjection` would delete markers to force a fit, and "the source
  // document that asserts least" is an extra semantic claim with no law behind
  // it: removing a forgotten discriminator's marker leaves a malformed holder,
  // removing the holder changes existence, and choosing a member invents
  // information. So a structure carrying a marker is simply out of domain.
  //
  // Where it is out of domain the comparison is INAPPLICABLE: it neither
  // refutes nor discharges isolation, and the obligation is left unevaluated
  // and recorded in `inapplicableIsolationChecks` rather than turned into `[]`.
  const sBefore = structureOf(before);
  const sAfter = structureOf(after);

  // Decided before anything else is asked: an erasure that changed nothing has
  // nothing to have damaged, and running a comparison over it would attribute a
  // proof to a check with no subject.
  const changed = changedPaths(before, after);
  if (changed.length === 0) return { state: "discharged", by: ["unchanged"] };

  /** What was established here. Discharge is the conjunction, never one member. */
  const by: IsolationProof[] = [];
  /** Why the engine route could not contribute, when it could not. */

  // A member-absence erasure must remove ONLY the leaf it names.
  //
  // `erase` empties the whole holder for a discriminator, because a branch
  // stripped of its tag is neither absence nor schema-valid. When the branch
  // carries payload, that also deletes the payload, and the quotient stops
  // being "member m versus absent" — it becomes "this declaration exists versus
  // it does not". A collision then witnesses holder presence, a degree of
  // freedom the census never gave its own coordinate, and the seven
  // `derivedBy.kind:X~<absent>` ids are seven spellings of that one fact.
  //
  // Measured per stimulus, not assumed per coordinate: against `{kind}` alone
  // the erasure is isolated; against `{kind, from}` it is not.
  if (c.kind === "member-absence") {
    const tag = c.leaf.split(".").pop();
    const bp = terminalPaths(before);
    const ap = terminalPaths(after);
    const collateral = [...bp].filter((p) => !ap.has(p) && p.split(".").pop() !== tag);
    if (collateral.length > 0) {
      return {
        state: "violated",
        detail: `erasing ${c.id} also removed ${collateral.join(", ")}; the quotient is holder presence, not "${
          c.members?.[0] ?? "the member"
        } versus absent", so a collision may be attributable to the removed payload`,
      };
    }
  }

  // Arity and order of every reference list must survive unless they ARE the target.
  const listsOf = (f: Record<string, unknown>): Map<string, string> => {
    const out = new Map<string, string>();
    const walk = (node: unknown, path: string): void => {
      if (Array.isArray(node)) {
        if (node.every((x) => typeof x === "string")) out.set(path, JSON.stringify(node));
        else node.forEach((x, i) => walk(x, `${path}[${i}]`));
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) walk(v, `${path}.${k}`);
      }
    };
    walk(f, "");
    return out;
  };
  const lb = listsOf(before);
  const la = listsOf(after);
  for (const [path, bJson] of lb) {
    const aJson = la.get(path);
    if (aJson === undefined) continue; // the list was legitimately removed
    const bArr = JSON.parse(bJson) as string[];
    const aArr = JSON.parse(aJson) as string[];
    if (bArr.length !== aArr.length && c.facet !== "arity" && c.kind !== "leaf" && c.kind !== "member-absence") {
      return { state: "violated", detail: `erasure changed the arity of ${path} (${bArr.length} -> ${aArr.length}) but the target facet is ${c.facet ?? c.kind}` };
    }
    if (c.facet === "incidence" && bArr.length !== aArr.length) {
      return {
        state: "violated",
        detail: `incidence erasure changed the arity of ${path} (${bArr.length} -> ${aArr.length}); it must preserve how many positions there are`,
      };
    }
  }

  // NOTHING WAS REFUTED. That is where the collapse used to happen: an empty
  // failure list was returned as `undefined` and every caller read it as a
  // discharge, whether or not any check had been able to run. So the obligation
  // is now discharged by a NAMED proof or by none.

  // The image is out of the source engine's domain. That must not by itself
  // refuse the witness — letting the source language decide which legal
  // quotient images may support evidence is the confusion this whole slice
  // exists to end. What it does mean is that a DIFFERENT proof has to be
  // identified, and the two halves of it are legality and locality.
  let engineInconclusive: string | undefined;
  const engineApplicable = inDomain(sBefore) && inDomain(sAfter);
  if (engineApplicable) {
    const wellFormedness = new Set<string>(Object.values(DERIVATION_DIAG));
    const semanticIsThePoint = c.kind === "member-pair" && c.leaf.endsWith(".kind");
    const relevant = (d: { code?: string }) => !semanticIsThePoint || (d.code !== undefined && wellFormedness.has(d.code));
    // No try/catch: an exception here is an instrument failure and must
    // propagate. Both arguments have already been shown to be in the checker's
    // declared domain, so there is nothing left for a throw to mean.
    const findings = (s: RelationalStructure) => tally(check(s).filter(relevant));
    const findingsBefore = findings(sBefore as RelationalStructure);
    const findingsAfter = findings(sAfter as RelationalStructure);
    const introduced = [...findingsAfter].filter(([k, n]) => n > (findingsBefore.get(k) ?? 0)).map(([k]) => k);
    if (introduced.length > 0) {
      return {
        state: "violated",
        detail: `erasure introduced derivation defect(s) ${introduced.join(", ")}, so any collision may be that defect rather than the coordinate`,
      };
    }
    // WHERE THE COMPARISON CANNOT ESTABLISH WHAT IT WOULD CLAIM.
    //
    // A finding is reported through a catalogue code, and `checkDerivations`
    // returns at its first refutation, so a structure that STILL carries one
    // after the erasure can hide a DIFFERENT cause the erasure introduced
    // behind the same identity. No richer key recovers that: the second cause
    // was never computed. Detail cannot close it either — detail legitimately
    // moves when the erasure changes a value it displays.
    //
    // Demonstrated on the real fixture rather than argued. Over
    // FX_H_ORDERS_FLATTENED_REINTERPRETS_AMOUNT, forgetting keep#incidence
    // leaves `REL_DERIVATION_RESULT_NOT_DERIVABLE@flat via project(keep=2)` as
    // the one finding before and after, while the cause behind it moves from
    // "retains amount by name but redeclares it" to "a projection keeping
    // [zz_erased_reference_0, zz_erased_reference_1] cannot yield fields" — a
    // keep-set defect the erasure introduced. The SAME erasure on a clean
    // stimulus is refused as violated. Here the engine cannot see it.
    //
    // So where the after-structure still carries a finding, the obligation is
    // UNEVALUATED. It used to be discharged by the structural proofs below with
    // the limitation attached, and nothing at admission read the limitation —
    // a witness over a stimulus already carrying a finding was admitted with a
    // possibly introduced defect hidden behind it. The structural proofs still
    // run: they bound where the change landed and that the image is legal, and
    // a definite refutation from them outranks an unsettled comparison. What
    // they cannot speak to is a semantic defect inside the slot, which is
    // exactly what the engine was asked. Where the after-structure carries
    // NOTHING, the engine has answered: there is no finding to hide behind.
    engineInconclusive =
      findingsAfter.size === 0
        ? undefined
        : `the after-structure still carries ${[...findingsAfter.keys()].join(", ")}; a first-refutation checker cannot show that no different cause appeared behind it`;
    if (engineInconclusive === undefined) by.push("no-introduced-finding");
  }

  // DIFFERENTIAL, for the same reason the engine comparison is: what is under
  // test is what the ERASURE did, not what its input already was. A hand-built
  // probe carrying an id the corpus pattern rejects is invalid before anything
  // is erased, and attributing that to the erasure would be the envelope
  // deciding a structural question all over again.
  const legal = quotientValidator();
  const wasIllegal = legal(before);
  const introduced = legal(after).filter((e) => !wasIllegal.includes(e));
  if (introduced.length > 0) {
    return { state: "violated", detail: `erasing ${c.id} makes the image illegal in the quotient language: ${introduced.slice(0, 3).join("; ")}` };
  }
  by.push("quotient-legal");
  const plan = lookup(c);
  if (plan === undefined) {
    return {
      state: "unevaluated",
      reason: `${c.id} changed ${changed.length} path(s) and has no erasure plan, so no locator bounds where the change was allowed to reach`,
    };
  }
  const slots = slotPaths(fixture, plan.locator);
  const within = (p: string) => slots.some((s) => p === s || p.startsWith(`${s}.`) || p.startsWith(`${s}[`));
  const inside = changed.filter(within);
  // A container's ARITY token moves when a child is added or removed, so a
  // legitimate deletion inside a slot also shows the enclosing holder as
  // changed. That is a consequence of the change, not a second one — but only
  // where the change beneath it is itself inside a slot. An unrelated empty
  // container deleted elsewhere has no such descendant and is still reported.
  const impliedBy = (p: string) => inside.some((q) => q !== p && (q.startsWith(`${p}.`) || q.startsWith(`${p}[`)));
  const outside = changed.filter((p) => !within(p) && !impliedBy(p));
  if (outside.length > 0) {
    return {
      state: "violated",
      detail: `erasing ${c.id} changed ${outside.join(", ")}, which its own locator does not reach, so a collision may be attributable to the change outside the slot`,
    };
  }
  by.push("slot-local");
  if (engineInconclusive !== undefined) {
    return { state: "unevaluated", reason: `${engineInconclusive}; ${by.join(" and ")} held, and neither speaks to a defect introduced inside the slot` };
  }
  return { state: "discharged", by };
}

export function loadWitnesses(file = WITNESSES_FILE): WitnessFile {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as WitnessFile;
}

export const CODOMAIN_ADJUDICATIONS_FILE = path.join(FIXTURES_DIR, "codomain-adjudications.json");

/**
 * A witness whose evidence changed when the quotient gained a codomain, held
 * open for the user to adjudicate rather than decided here.
 *
 * `reason` is the measured divergence class, not a narrative. Both classes are
 * the same defect seen twice: A HOLE IS OBSERVABLE WHERE AN ABSENCE WAS NOT.
 * Deleting a required discriminator used to destroy the evidence that betrays
 * its branch; holing it leaves that evidence standing, which is what the
 * erasure should have been doing all along and is why neither entry is a
 * regression to be reverted.
 */
export interface CodomainAdjudication {
  /** The witness's coordinate set, joined — witnesses carry no ids. */
  witness: string;
  /**
   * Every coordinate the lapsed witness NAMES.
   *
   * Distinct from what it costs. A witness covers its whole coordinate set, so
   * this is the audit surface — no coordinate the witness touched can go
   * unmentioned — while the two loss fields below say what standing actually
   * moved. Reading coverage as loss is how `assertion.aggregate.op` came to be
   * recorded as suspended while its own primitive witness was still holding.
   */
  declares: string[];
  /** Each declared coordinate's class in the recovered stage-1 record. */
  historicalStanding: Record<string, "primitive" | "interaction-only" | "closure-accounted" | "none">;
  /** Coordinates that lose PRIMITIVE ratification while this stays open. */
  lost: string[];
  /**
   * Coordinates that lose only INTERACTION-ONLY standing.
   *
   * Kept separate because the two are different claims and collapsing them
   * would overstate the loss: a 2-set witness never ratified either member, it
   * established that neither separates alone. What lapses when it stops holding
   * is that weaker statement, not a ratification.
   */
  interactionOnlyLost?: string[];
  /**
   * What `checkWitness` reports for this witness TODAY.
   *
   * The other end of the pointer. A suspension has to run from an identified
   * historical standing to an actual current reevaluation failure, or it is an
   * assertion that something broke with nothing tying it to the break.
   */
  currentFailure: { codes: string[] };
  reason: "branch-residue" | "holder-presence";
  detail: string;
  /** What would settle it. Named so the ledger cannot become a parking lot. */
  repair: string;
}

export interface CodomainAdjudicationFile {
  $comment: string;
  awaiting: CodomainAdjudication[];
}

export function loadCodomainAdjudications(file = CODOMAIN_ADJUDICATIONS_FILE): CodomainAdjudicationFile {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as CodomainAdjudicationFile;
}

/** Coordinate id -> the open adjudication that suspended its evidence. */
export function codomainHolds(file = CODOMAIN_ADJUDICATIONS_FILE): Map<string, CodomainAdjudication> {
  const out = new Map<string, CodomainAdjudication>();
  for (const a of loadCodomainAdjudications(file).awaiting) {
    for (const id of [...a.lost, ...(a.interactionOnlyLost ?? [])]) out.set(id, a);
  }
  return out;
}

export const HISTORICAL_ACCOUNTING_FILE = path.join(FIXTURES_DIR, "stage1-historical-accounting.json");

/**
 * What the COMPLETED stage-1 experiment accounted for, recovered from the tree
 * that concluded it.
 *
 * AN INPUT, NEVER AN OUTPUT. This used to be `live ∪ suspended` — the present
 * support set widened by the present exception ledger — and that is not a
 * historical authority at all. It breaks in both directions: settle a
 * suspension and the coordinate leaves history it did in fact belong to; admit
 * a new witness today and the coordinate enters a history it never belonged to.
 * A present-day exception ledger cannot author the past.
 *
 * The three evidence classes are recorded APART. A primitive ratification, an
 * interaction-only 2-set, and representation in a not-refuted closure are three
 * different claims of three different strengths; their union is an accounting
 * figure and confers no standing, so collapsing them here would let the weakest
 * of them be reported with the authority of the strongest.
 */
export interface HistoricalAccounting {
  $comment: string;
  recoveredFrom: {
    /** The tree the recovery was run at, and the digests of what it read. */
    commit: string;
    /** What the checkpoint IS — read with `nonClaim`, which says what it is not. */
    what: string;
    /**
     * The bound on the claim, carried in the artifact rather than in a commit
     * message. Reproducing a tally is agreement, not proof that two epochs are
     * interchangeable, and the artifact must not be quotable as the latter.
     */
    nonClaim: string;
    procedure: string;
    /**
     * The dependency environment the historical source RAN UNDER.
     *
     * Recorded because the extracted tree ships no `node_modules`: `ajv` and
     * `zod` were resolved from the current worktree. What was reproduced is
     * historical source and data under a present-day dependency environment,
     * and the artifact says so rather than claiming a fully historical runtime.
     */
    dependencyEnvironment: { node: string; ajv: string; zod: string };
    inputs: Record<string, string>;
  };
  byEvidenceClass: {
    /** A holding single-coordinate witness: the only class that ratifies. */
    primitive: string[];
    /** A minimal 2-set: the distinction is proven, the factorization is not. */
    interactionOnly: string[];
    /** Carried by a closure that is not refuted — provisional, and not standing. */
    closureAccounted: string[];
  };
  /** The union of the three, which is what the stage-1 dispositioner was given. */
  accounted: string[];
  /** The kernel that dispositioner was given. An input to it, so it is recorded. */
  kernelIds: string[];
  /**
   * WHAT THE HISTORICAL INTERPRETER CONCLUDED, per coordinate.
   *
   * The distinction this field exists to hold. `accounted` is the support the
   * interpreter was given; this is the verdict it reached. Recomputing the
   * verdict from the support through today's `disposition`, `removals` and
   * kernel would leave the conclusion at the mercy of a present-day mapping: an
   * edit to `leafMap`, a member map or a factorization can move which original
   * coordinate reads as ratified, or change its `via`, while every recovered
   * input stays byte-identical. History has to be read, not re-derived.
   */
  dispositions: (Disposition & { coordinate: string })[];
  stage1Dispositions: Record<string, number>;
}

export function loadHistoricalAccounting(file = HISTORICAL_ACCOUNTING_FILE): HistoricalAccounting {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as HistoricalAccounting;
}

/** The historical accounting set, read from the artifact and nothing else. */
export function historicallyAccounted(record: HistoricalAccounting = loadHistoricalAccounting()): Set<string> {
  return new Set(record.accounted);
}

/**
 * The historical DISPOSITIONS, read from the artifact and nothing else.
 *
 * The counterpart to `historicallyAccounted`, and the one a reader should quote
 * when asking what stage 1 concluded. Neither `disposition` nor `removals` nor
 * the live kernel appears in this path, which is the point: a present-day
 * mapping may reconcile against the historical conclusion, never rewrite it.
 */
export function historicalDispositions(
  record: HistoricalAccounting = loadHistoricalAccounting(),
): Map<string, Disposition> {
  return new Map(record.dispositions.map(({ coordinate, ...d }) => [coordinate, d as Disposition]));
}

/**
 * Where the CURRENT interpreter disagrees with the historical conclusion.
 *
 * Both are legitimate readings and they answer different questions:
 * `D_then(coordinate, support_then, kernel_then, mappings_then)` is what was
 * concluded, `D_now(coordinate, support_then, kernel_now, mappings_now)` is what
 * today's mappings make of that same support. A difference is a mapping change
 * to be reported, not a historical revision to be adopted.
 */
export interface DispositionDrift {
  coordinate: string;
  then: Disposition;
  now: Disposition;
}

export function reinterpretHistorically(
  record: HistoricalAccounting,
  stage1: Coordinate[],
  kernelIds: Set<string>,
  removals: RemovalsFile,
): DispositionDrift[] {
  const then = historicalDispositions(record);
  const support = historicallyAccounted(record);
  const out: DispositionDrift[] = [];
  for (const c of stage1) {
    const was = then.get(c.id);
    if (was === undefined) continue;
    const now = disposition(c, support, kernelIds, removals);
    if (JSON.stringify(was) !== JSON.stringify(now)) out.push({ coordinate: c.id, then: was, now });
  }
  return out;
}

/**
 * What moved between the recorded history and current support, and whether the
 * ledger accounts for it.
 *
 * Reconciliation is the whole point of holding history separately. With the
 * historical set derived from the live one, every difference was true by
 * construction and there was nothing to reconcile — a coordinate that silently
 * appeared or vanished could not be detected, because the derivation absorbed
 * it. Here a difference is a finding until an adjudication names it.
 */
export interface HistoryReconciliation {
  /** Historical, not currently supported, and named in the codomain ledger. */
  suspended: string[];
  /** Historical, not currently supported, and NOT named anywhere. */
  unexplainedLoss: string[];
  /** Currently supported and absent from the recorded history. */
  unexplainedGain: string[];
}

export function reconcileHistory(
  live: ReadonlySet<string>,
  historical: ReadonlySet<string> = historicallyAccounted(),
  holds: Map<string, CodomainAdjudication> = codomainHolds(),
): HistoryReconciliation {
  const lost = [...historical].filter((id) => !live.has(id)).sort();
  return {
    suspended: lost.filter((id) => holds.has(id)),
    unexplainedLoss: lost.filter((id) => !holds.has(id)),
    unexplainedGain: [...live].filter((id) => !historical.has(id)).sort(),
  };
}

/**
 * Current support, kept in its three classes rather than unioned.
 *
 * The union is an ACCOUNTING figure: it answers "is this coordinate carried by
 * the experiment at all", which is the question the stage-1 dispositioner asks.
 * It is not a standing figure, and passing it where a standing figure belongs
 * is how "n coordinates hold" gets said about a set that includes provisional
 * closures. The classes travel together so the answer always names which one.
 */
export interface CurrentSupport {
  /** A holding single-coordinate witness. The only class that RATIFIES. */
  primitive: ReadonlySet<string>;
  /** A holding minimal 2-set: the distinction is proven, the factorization is not. */
  interactionOnly: ReadonlySet<string>;
  /** Carried by a not-refuted closure. Provisional; confers no standing. */
  closureAccounted: ReadonlySet<string>;
}

/** The accounting union, which is what the stage-1 dispositioner is given. */
export function accountedBy(s: CurrentSupport): Set<string> {
  return new Set([...s.primitive, ...s.interactionOnly, ...s.closureAccounted]);
}

/**
 * What currently supports this coordinate, under the authority in force now.
 *
 * Separate from `disposition` on purpose — see `EvidenceStanding`. This one may
 * move whenever the instrument does; `disposition` may not.
 *
 * `via` is not decoration. Without it a caller can only report "holding", and
 * the three classes become synonyms at the point of reporting even when they
 * were kept apart everywhere else.
 */
export function evidenceStanding(
  id: string,
  support: CurrentSupport,
  holds: Map<string, CodomainAdjudication> = codomainHolds(),
): EvidenceStanding {
  // SUPPORT IS CHECKED BEFORE THE LEDGER, and the order is the claim.
  //
  // A ledger entry records which WITNESS lapsed, and a witness covers every
  // coordinate it names. `assertion.aggregate.op` appears in the lapsed 2-set
  // and also holds a primitive witness of its own; reading the ledger first
  // reported it suspended, which says its evidence is gone when only one of two
  // independent supports is. Evidence that is still standing cannot be
  // suspended — so suspension is what is left when nothing supports it.
  //
  // Strongest class first: a coordinate with a primitive witness is reported as
  // ratified even when a closure also carries it, because that is the claim
  // with the most behind it.
  if (support.primitive.has(id)) return { state: "holding", via: "primitive", evidence: [id] };
  if (support.interactionOnly.has(id)) return { state: "holding", via: "interaction-only", evidence: [id] };
  if (support.closureAccounted.has(id)) return { state: "holding", via: "closure-accounted", evidence: [id] };
  const open = holds.get(id);
  if (open) {
    return {
      state: "suspended",
      experiment: "ANALYTICAL-QUOTIENT-CODOMAIN-AUTHORITY-01",
      reason: open.reason,
      invalidatedEvidence: [open.witness],
    };
  }
  return { state: "unsupported" };
}
export function loadRemovals(file = REMOVALS_FILE): RemovalsFile {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as RemovalsFile;
}
export function loadCensusSnapshot(file = CENSUS_STAGE1_FILE): { derivedFrom: string; coordinates: Coordinate[] } {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as { derivedFrom: string; coordinates: Coordinate[] };
}

/**
 * Coordinates a holding SINGLE-coordinate witness ratifies.
 *
 * This is the only evidence that meets the retention criterion as written:
 * erasing exactly this coordinate destroys a distinction an independently
 * grounded cause requires. Nothing else confers primitive standing.
 */
export function primitiveRatified(witnesses: Witness[]): Set<string> {
  const out = new Set<string>();
  for (const w of witnesses) if (w.coordinates.length === 1) out.add(w.coordinates[0]);
  return out;
}

/**
 * Minimal separating SETS of more than one coordinate, and the coordinates in
 * them — a strictly weaker claim that must not be mistaken for the above.
 *
 * A holding 2-set is guaranteed minimal: `checkWitness` raises NOT_MINIMAL when
 * either coordinate alone already collides the stimuli. So such a witness
 * proves that the semantic distinction is real AND that neither coordinate
 * carries it alone. What remains open is the factorization: whether each is
 * separately primitive, whether one is derivable from the other, or whether the
 * schema split one irreducible semantic object across two mutually dependent
 * coordinates.
 *
 * A semantic distinction can be irreducible while every coordinate in its
 * current encoding is reducible. That is the inverse of the cross-term problem,
 * and this function is what keeps the two apart.
 */
export function interactionProven(witnesses: Witness[]): { sets: string[][]; coordinates: Set<string> } {
  const sets = witnesses.filter((w) => w.coordinates.length > 1).map((w) => [...w.coordinates]);
  const coordinates = new Set<string>();
  for (const s of sets) for (const c of s) coordinates.add(c);
  return { sets, coordinates };
}

export type WitnessClass =
  | "single"
  /** Conditions 1-5 all hold: one coordinate carries the distinction, the rest erase residue. */
  | "quotient-hygiene"
  /** A condition genuinely failed: the members really do participate jointly. */
  | "interaction"
  /**
   * Conditions 1-4 hold but no control EXISTS. A discriminator with two members
   * whose payload shapes differ admits no compatible-shape pair, so condition 5
   * is unsatisfiable by construction rather than false. Reporting that as
   * `interaction` would manufacture a conclusion from the size of the
   * vocabulary instead of from the witness.
   */
  | "indeterminate";

export interface WitnessClassification {
  klass: WitnessClass;
  /** For hygiene: the coordinate that carries the candidate distinction. */
  carrier?: string;
  /** For hygiene: the coordinates present only to erase conditional residue. */
  residue?: string[];
  /** Why the classification does or does not hold, condition by condition. */
  conditions: { id: string; held: boolean; detail: string }[];
}

/**
 * Classify a holding witness as single, quotient-hygiene, or true interaction.
 *
 * The hygiene conditions, all required:
 *
 *  1. one member is a discriminator substitution (a `kind` member pair);
 *  2. every auxiliary member lies in payload structurally CONDITIONAL on one
 *     side of that discriminator;
 *  3. the discriminator-only substitution fails to collide SOLELY because that
 *     conditional payload remains;
 *  4. erasing the auxiliary payload alone does not supply the outcome
 *     difference being cited;
 *  5. a CONTROL within the same enum — two members with compatible payload
 *     shape — separates on a single coordinate, showing discriminator
 *     differences can.
 *
 * Condition 5 is what makes this an empirical classification rather than an
 * excuse: without a control, "the payload got in the way" is unfalsifiable.
 */
export function classifyWitness(
  w: Witness,
  census: Coordinate[],
  oracle: Oracle,
  singleWitnessed: ReadonlySet<string>,
): WitnessClassification {
  const conditions: WitnessClassification["conditions"] = [];
  if (w.coordinates.length === 1) return { klass: "single", conditions };

  const byId = new Map(census.map((c) => [c.id, c]));
  const discriminators = w.coordinates.filter((id) => byId.get(id)?.kind === "member-pair" && byId.get(id)?.leaf.endsWith(".kind"));
  const auxiliaries = w.coordinates.filter((id) => !discriminators.includes(id));

  const c1 = discriminators.length === 1;
  conditions.push({
    id: "1-one-discriminator-substitution",
    held: c1,
    detail: c1 ? `${discriminators[0]}` : `${discriminators.length} discriminator member pairs among ${w.coordinates.join(" + ")}`,
  });
  if (!c1) return { klass: "interaction", conditions };

  const carrier = discriminators[0];
  const holder = byId.get(carrier)!.leaf.replace(/\.kind$/, "");
  const members = byId.get(carrier)!.members ?? [];
  // 2. Auxiliaries must live under `<holder>.<member>.` — payload that exists
  //    only on one side of this discriminator.
  const branchPrefixes = members.map((m) => `${holder}.${m}.`);
  const misplaced = auxiliaries.filter((id) => !branchPrefixes.some((p) => id.startsWith(p)));
  conditions.push({
    id: "2-auxiliaries-are-branch-conditional-payload",
    held: misplaced.length === 0,
    detail: misplaced.length === 0 ? `all under ${branchPrefixes.join(" or ")}` : `outside the branch payload: ${misplaced.join(", ")}`,
  });
  if (misplaced.length > 0) return { klass: "interaction", conditions };

  // 3. The discriminator alone must fail to collide, and 4. the auxiliaries
  //    alone must fail too — otherwise the witness was not minimal and
  //    checkWitness would have said so. Re-derived here rather than assumed.
  const a = resolveSide(w.a, oracle).fixture;
  const b = resolveSide(w.b, oracle).fixture;
  const carrierAlone = collides(a, b, byId.get(carrier)!);
  const auxAlone = auxiliaries.some((id) => byId.has(id) && collides(a, b, byId.get(id)!));
  conditions.push({
    id: "3-discriminator-alone-does-not-collide",
    held: !carrierAlone,
    detail: carrierAlone ? "it does collide alone, so the set is not minimal" : "residue remains after the tag is rewritten",
  });
  conditions.push({
    id: "4-auxiliary-alone-does-not-supply-the-difference",
    held: !auxAlone,
    detail: auxAlone ? "an auxiliary alone already collides the stimuli" : "no auxiliary separates on its own",
  });
  if (carrierAlone || auxAlone) return { klass: "interaction", conditions };

  // 5. A control from the same enum: a member pair on this discriminator that
  //    IS ratified by a single-coordinate witness.
  const control = [...singleWitnessed].find((id) => id.startsWith(`${holder}.kind:`) && id !== carrier);
  // A control must be POSSIBLE before its absence can mean anything. With two
  // members the pair under test is the only one the enum has.
  const siblingPairs = census.filter((c) => c.kind === "member-pair" && c.leaf === `${holder}.kind` && c.id !== carrier);
  const controlPossible = siblingPairs.length > 0;
  conditions.push({
    id: "5-control-pair-separates-on-one-coordinate",
    held: control !== undefined,
    detail: control
      ? control
      : controlPossible
        ? `${siblingPairs.length} sibling pair(s) exist on ${holder}.kind but none has a single-coordinate witness`
        : `UNAVAILABLE: ${holder}.kind has no sibling member pair, so no control can exist`,
  });
  // `indeterminate` means conditions 1-4 HELD, so the carrier and its residue
  // are known and reporting them costs nothing. Withholding them made the
  // classification unusable by anything downstream that wants to ask what the
  // witness was about — including the closure cross-check, which could then
  // only compare the two hygiene witnesses and silently skipped this one.
  if (!control) {
    return controlPossible
      ? { klass: "interaction", conditions }
      : { klass: "indeterminate", carrier, residue: auxiliaries, conditions };
  }

  return { klass: "quotient-hygiene", carrier, residue: auxiliaries, conditions };
}

/**
 * Coordinates whose ONLY support is membership in a multi-coordinate witness.
 *
 * Not ratified, and not unaccounted either: their distinction is proven, only
 * its factorization is open. They are the population an interaction audit owns.
 */
export function interactionOnly(witnesses: Witness[]): string[] {
  const primitive = primitiveRatified(witnesses);
  return [...interactionProven(witnesses).coordinates].filter((c) => !primitive.has(c)).sort();
}

const pairId = (leaf: string, a: string, b: string) => `${leaf}:${a}~${b}`;

/** The kernel pair coordinate for two members, in either order. */
function kernelPair(kernelIds: Set<string>, leaf: string, a: string, b: string): string | undefined {
  if (kernelIds.has(pairId(leaf, a, b))) return pairId(leaf, a, b);
  if (kernelIds.has(pairId(leaf, b, a))) return pairId(leaf, b, a);
  return undefined;
}

/**
 * Disposition of a stage-1 coordinate: ratified through a kernel coordinate a
 * witness holds for, or not-yet-admitted through `removals.json`.
 */
export function disposition(c: Coordinate, ratified: ReadonlySet<string>, kernelIds: Set<string>, removals: RemovalsFile): Disposition {
  if (c.kind === "reference") return { state: "reference" };
  // a removed leaf takes every member pair under it with it
  const removed = removals.removed.find((r) => r.coordinate === c.id || r.coordinate === c.leaf);
  if (removed) return { state: "not-yet-admitted", reason: removed.reason, reintroducibleAt: removed.reintroducibleAt };
  const fact = removals.factorized[c.leaf];
  if (fact) {
    if (c.kind === "leaf") {
      const via = fact.into.filter((k) => ratified.has(k));
      return via.length > 0 ? { state: "ratified", via } : { state: "not-yet-admitted", reason: `no factor of ${c.leaf} is ratified` };
    }
    const [a, b] = c.members!;
    const da = decodeScale(a as ScaleLabel) as unknown as Record<string, unknown>;
    const db = decodeScale(b as ScaleLabel) as unknown as Record<string, unknown>;
    const via: string[] = [];
    for (const k of new Set([...Object.keys(da), ...Object.keys(db)])) {
      if (da[k] === db[k]) continue;
      if (k === "transformation") {
        const p = kernelPair(kernelIds, "field.transformation", String(da[k]), String(db[k]));
        if (p && ratified.has(p)) via.push(p);
      } else if (ratified.has(`field.${k}`)) via.push(`field.${k}`);
    }
    if (via.length > 0) return { state: "ratified", via };
    const alias = fact.aliases.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    return alias
      ? { state: "not-yet-admitted", reason: `${a} and ${b} decode to the same capability state (alias)`, reintroducibleAt: 2 }
      : { state: "not-yet-admitted", reason: `${a} and ${b} differ only on unratified factors` };
  }
  const leaf = removals.leafMap[c.leaf] ?? c.leaf;
  const map = removals.memberMap[c.leaf] ?? {};
  const m = (x: string): string | null => (x in map ? map[x] : x);
  if (c.kind === "leaf") {
    return ratified.has(leaf) ? { state: "ratified", via: [leaf] } : { state: "not-yet-admitted", reason: `${leaf} carries no witness` };
  }
  const [a, b] = c.members!;
  const ma = m(a);
  const mb = m(b);
  if (ma === mb) return { state: "not-yet-admitted", reason: `${a} and ${b} are merged in the kernel`, reintroducibleAt: 2 };
  if (ma === null || mb === null) {
    // one member is the leaf's absence: the distinction is the leaf's own presence
    return ratified.has(leaf) ? { state: "ratified", via: [leaf] } : { state: "not-yet-admitted", reason: `${leaf} carries no witness` };
  }
  const p = kernelPair(kernelIds, leaf, ma, mb);
  if (p && ratified.has(p)) return { state: "ratified", via: [p] };
  return { state: "not-yet-admitted", reason: `${c.id} maps to ${p ?? "no kernel pair"}, which carries no witness` };
}
