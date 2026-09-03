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
 * directory is read as one. A CLOSED experiment stays registered and is inert
 * by construction — every candidate it adjudicated is either ratified (so
 * accounted anyway) or no longer in the kernel — so nothing has to remember to
 * deregister it.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { loadCensus } from "./census.js";
import { checkWitness, FIXTURES_DIR, loadOracle, loadWitnesses, ratifiedSet } from "./necessity.js";

export interface ExperimentBasis {
  /** The file the basis was read from, for a failure message that names its owner. */
  file: string;
  /** The slice that opened the obligation. */
  spec: string;
  frozenAt: string;
  candidates: string[];
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
      };
      return {
        file: f,
        spec: raw.spec ?? f,
        frozenAt: raw.basis?.frozenAt ?? "",
        candidates: raw.basis?.candidates ?? [],
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
 */
export function orphanedCoordinates(bases: ExperimentBasis[] = loadBases()): Orphan[] {
  const kernel = loadCensus();
  const oracle = loadOracle();
  const ratified = ratifiedSet(loadWitnesses().witnesses.filter((w) => checkWitness(w, kernel, oracle).ok));
  const owned = new Set(bases.flatMap((b) => b.candidates));
  return kernel
    .filter((c) => c.kind !== "reference")
    .filter((c) => !ratified.has(c.id) && !owned.has(c.id))
    .map((c) => ({
      coordinate: c.id,
      detail: `no necessity witness ratifies it and no open experimental basis owns it (${
        bases.length === 0 ? "none registered" : bases.map((b) => b.spec).join(", ")
      }); the slice that admitted it must open a basis that adjudicates it`,
    }))
    .sort((a, b) => a.coordinate.localeCompare(b.coordinate));
}
