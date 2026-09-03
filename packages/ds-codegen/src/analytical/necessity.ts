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
export function isolationViolation(fixture: Fixture, c: Coordinate): string | undefined {
  const before = fixture as unknown as Record<string, unknown>;
  const after = erase(fixture, c) as unknown as Record<string, unknown>;

  // Erasure may not manufacture a derivation-boundary defect.
  const structureOf = (f: Record<string, unknown>) => f.structure as RelationalStructure | undefined;
  const sBefore = structureOf(before);
  const sAfter = structureOf(after);
  if (sBefore && sAfter) {
    const codesBefore = checkDerivations(sBefore).map((d) => `${d.code}@${d.subject}`).sort();
    const codesAfter = checkDerivations(sAfter).map((d) => `${d.code}@${d.subject}`).sort();
    const introduced = codesAfter.filter((x) => !codesBefore.includes(x));
    if (introduced.length > 0) {
      return `erasure introduced derivation defect(s) ${introduced.join(", ")}, so any collision may be that defect rather than the coordinate`;
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

/** Kernel coordinates ratified by the given (already checked) witnesses. */
export function ratifiedSet(witnesses: Witness[]): Set<string> {
  const out = new Set<string>();
  for (const w of witnesses) for (const c of w.coordinates) out.add(c);
  return out;
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
