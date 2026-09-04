/**
 * The registry of open proof obligations over the analytical kernel.
 *
 * This module exists to hold ONE invariant, and to hold it above any single
 * experiment:
 *
 *   Every live kernel coordinate is either ratified by a necessity witness, or
 *   owned by an explicitly open experiment that has taken responsibility for
 *   adjudicating it.
 *
 * That is a correctness invariant, not a population pin. It never says the
 * kernel must contain a particular set of coordinates, and it survives growth
 * by construction: a later stage may admit whatever coordinates its authority
 * demands, provided the same bounded change opens a candidate basis that owns
 * them. What it refuses is an ORPHANED CLAIM — an unexplained degree of freedom
 * smuggled into the model with neither a proof nor a burden of proof attached.
 *
 * It lived inside the stage-2 subtraction gate first, which was wrong in a way
 * worth recording: a stage-3 coordinate would have failed a stage-2 assertion,
 * making a closed experiment fire against work that neither caused it nor could
 * discharge it. The invariant is right; its owner was not.
 *
 * A basis is registered by existing: any `subtraction-*.json` in the fixtures
 * directory is read as one. What a basis OWNS, though, is not its candidate
 * list — it is the subset of that list still carrying an `unresolved` verdict.
 * The difference is the whole invariant:
 *
 *   Ownership is unresolved responsibility, never historical membership.
 *
 * Under the membership reading, a coordinate a closed experiment ruled
 * `not-yet-admitted` stayed "owned" forever, so a later stage could reintroduce
 * it with no basis at all and the invariant would see an owner that had already
 * finished deciding. Under this reading a closed basis owns nothing by
 * construction (its verdicts are all recorded), and an already-adjudicated
 * coordinate inside a still-open experiment owns nothing either — if either one
 * reappears in the kernel, someone must explicitly take responsibility again.
 * Nothing has to remember to deregister anything.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { loadCensus } from "./census.js";
import { checkWitness, FIXTURES_DIR, loadOracle, loadWitnesses, primitiveRatified } from "./necessity.js";
import { RETAINING } from "./subtraction.js";

export interface ExperimentBasis {
  /** The file the basis was read from, for a failure message that names its owner. */
  file: string;
  /** The slice that opened the obligation. */
  spec: string;
  frozenAt: string;
  candidates: string[];
  /**
   * The candidates this basis has NOT yet decided. A missing verdict entry
   * reads as `unresolved`, matching `checkSubtraction`.
   */
  unresolved: string[];
  /**
   * Candidates it HAS decided, where the decision says the coordinate stays in
   * the kernel without independent standing (`required-derived-vocabulary`).
   * A third accounting mode: not owed a proof, not an orphan either, because an
   * adjudicated verdict already explains why it is there.
   */
  retained: string[];
}

const BASIS_FILE = /^subtraction-.+\.json$/;

/** Every registered experimental basis, in file order. */
export function loadBases(dir = FIXTURES_DIR): ExperimentBasis[] {
  return fs
    .readdirSync(dir)
    .filter((f) => BASIS_FILE.test(f))
    .sort()
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as {
        spec?: string;
        basis?: { frozenAt?: string; candidates?: string[] };
        verdicts?: Record<string, { disposition?: string }>;
      };
      const candidates = raw.basis?.candidates ?? [];
      const verdicts = raw.verdicts ?? {};
      return {
        file: f,
        spec: raw.spec ?? f,
        frozenAt: raw.basis?.frozenAt ?? "",
        candidates,
        unresolved: candidates.filter((id) => (verdicts[id]?.disposition ?? "unresolved") === "unresolved"),
        retained: candidates.filter((id) => RETAINING.has(verdicts[id]?.disposition ?? "")),
      };
    });
}

export interface Orphan {
  coordinate: string;
  detail: string;
}

/**
 * Live kernel coordinates with neither a ratification nor an owner.
 *
 * The remedy a failure names is always the same and is never "delete it":
 * whichever slice admitted the coordinate opens a basis that takes
 * responsibility for adjudicating it.
 *
 * Ratification here means PRIMITIVE ratification — a holding single-coordinate
 * witness. A coordinate supported only by a minimal multi-coordinate witness has
 * had the opposite established about it (neither member separates alone), so it
 * is not ratified and must be owned by an experiment like anything else.
 *
 * Three accounting modes, not two: ratified by a witness, owed a decision, or
 * decided as required derived vocabulary — a name external authority governs
 * that carries no independent semantic degree of freedom. The third is the only
 * decided verdict under which a coordinate legitimately stays in the kernel.
 */
export function orphanedCoordinates(bases: ExperimentBasis[] = loadBases()): Orphan[] {
  const kernel = loadCensus();
  const oracle = loadOracle();
  const ratified = primitiveRatified(loadWitnesses().witnesses.filter((w) => checkWitness(w, kernel, oracle).ok));
  // Ownership is unresolved responsibility. A basis that has already decided a
  // coordinate is not on the hook for it a second time, so its reappearance in
  // the kernel is an orphan until some experiment reopens it.
  const owned = new Set(bases.flatMap((b) => [...b.unresolved, ...b.retained]));
  return kernel
    .filter((c) => c.kind !== "reference")
    .filter((c) => !ratified.has(c.id) && !owned.has(c.id))
    .map((c) => ({
      coordinate: c.id,
      detail: `no necessity witness ratifies it and no experiment holds an unresolved verdict for it (${
        bases.length === 0 ? "none registered" : bases.map((b) => `${b.spec}: ${b.unresolved.length} unresolved`).join(", ")
      }); the slice that admitted it must open a basis that adjudicates it`,
    }))
    .sort((a, b) => a.coordinate.localeCompare(b.coordinate));
}
