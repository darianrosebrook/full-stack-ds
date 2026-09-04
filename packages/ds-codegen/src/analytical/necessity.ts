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
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { decodeScale, type ScaleLabel } from "./capabilities.js";
import type { Coordinate } from "./census.js";
import { type Bindings, type Holdout, loadCorpusInput } from "./corpus-integrity.js";
import { DERIVATION_DIAG } from "./codes.js";
import { checkDerivations } from "./derivation.js";
import { canonical, collides, erase, eraseAll } from "./quotient.js";
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

export type Disposition =
  | { state: "ratified"; via: string[] }
  | { state: "not-yet-admitted"; reason: string; reintroducibleAt?: number }
  | { state: "reference" };

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
  | "ERASURE_NOT_ISOLATED";

export interface WitnessCheck {
  ok: boolean;
  failures: { code: WitnessFailure; detail: string }[];
  a: ResolvedSide;
  b: ResolvedSide;
}

/**
 * Check one witness against the census: both stimuli validate, outcomes
 * differ, erasing the named coordinate(s) makes them collide, and for a 2-set
 * neither single coordinate suffices (invariant 7).
 */
export function checkWitness(w: Witness, census: Coordinate[], oracle: Oracle): WitnessCheck {
  const a = resolveSide(w.a, oracle);
  const b = resolveSide(w.b, oracle);
  const failures: WitnessCheck["failures"] = [];
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
  if (failures.length > 0 || coords.length !== w.coordinates.length) return { ok: false, failures, a, b };
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
      const violation = isolationViolation(side.fixture, c);
      if (violation) failures.push({ code: "ERASURE_NOT_ISOLATED", detail: `${label}/${c.id}: ${violation}` });
    }
  }
  return { ok: failures.length === 0, failures, a, b };
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

export function isolationViolation(fixture: Fixture, c: Coordinate): string | undefined {
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
  const structureOf = (f: Record<string, unknown>) => f.structure as RelationalStructure | undefined;
  const sBefore = structureOf(before);
  const sAfter = structureOf(after);
  if (sBefore && sAfter) {
    const wellFormedness = new Set<string>(Object.values(DERIVATION_DIAG));
    const semanticIsThePoint = c.kind === "member-pair" && c.leaf.endsWith(".kind");
    const relevant = (d: { code?: string }) => !semanticIsThePoint || (d.code !== undefined && wellFormedness.has(d.code));
    const codesBefore = checkDerivations(sBefore).filter(relevant).map((d) => `${d.code}@${d.subject}`).sort();
    const codesAfter = checkDerivations(sAfter).filter(relevant).map((d) => `${d.code}@${d.subject}`).sort();
    const introduced = codesAfter.filter((x) => !codesBefore.includes(x));
    if (introduced.length > 0) {
      return `erasure introduced derivation defect(s) ${introduced.join(", ")}, so any collision may be that defect rather than the coordinate`;
    }
  }

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
      return `erasing ${c.id} also removed ${collateral.join(", ")}; the quotient is holder presence, not "${
        c.members?.[0] ?? "the member"
      } versus absent", so a collision may be attributable to the removed payload`;
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
      return `erasure changed the arity of ${path} (${bArr.length} -> ${aArr.length}) but the target facet is ${c.facet ?? c.kind}`;
    }
    if (c.facet === "incidence" && bArr.length !== aArr.length) {
      return `incidence erasure changed the arity of ${path} (${bArr.length} -> ${aArr.length}); it must preserve how many positions there are`;
    }
  }
  return undefined;
}

export function loadWitnesses(file = WITNESSES_FILE): WitnessFile {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as WitnessFile;
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
export function disposition(c: Coordinate, ratified: Set<string>, kernelIds: Set<string>, removals: RemovalsFile): Disposition {
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
