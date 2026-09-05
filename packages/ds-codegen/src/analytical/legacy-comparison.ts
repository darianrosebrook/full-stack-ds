/**
 * Legacy erasure path vs the quotient codomain, over the complete bound specimen
 * population, with every divergence recorded individually.
 *
 * The legacy path is the walker at a PINNED commit (`LEGACY_PIN`), materialized
 * from git history into a scratch tree that resolves contracts and dependencies
 * exactly as this tree does. Its `erase` is run beside this tree's `erase` on
 * every (coordinate, specimen) pair, and the two images are compared through a
 * NEUTRAL serializer -- key-sorted JSON with no renaming -- so that neither
 * side's canonicalizer can absorb the very differences the comparison exists to
 * surface.
 *
 * Every pair gets an outcome. Agreement is bound by count and by a digest over
 * the agreeing (plan, specimen, image) triples; every divergence is a record of
 * its own naming the plan, the specimen, both images (or the failure), the
 * operation law it falls under and its disposition. Dispositions are decided by
 * the law table below, never by incumbency: a class in which the legacy image
 * would be the lawful one, or in which the new image is not quotient-legal,
 * carries its own label and is asserted absent by the tests, so its appearance
 * fails the check rather than being averaged away.
 *
 *   tsx legacy-comparison.ts --record   rewrite the ledger from a fresh comparison
 *   tsx legacy-comparison.ts --check    recompute and refuse on any difference
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { footprintBasisDigest } from "./authority.js";
import { loadCensus, type Coordinate } from "./census.js";
import { specimens } from "./erasure-audit.js";
import { CONTRACTS_DIR, FIXTURES_DIR, loadOracle } from "./necessity.js";
import { loadQuotientValidator } from "./quotient-image.js";
import { canonical, erase, planFor } from "./quotient.js";
import type { Fixture } from "./structure.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../..");

export const LEGACY_PIN = {
  commit: "38e37a418d99f1181dca54d01f68af3c64ecaf51",
  /** git blob of packages/ds-codegen/src/analytical/quotient.ts at that commit. */
  quotientBlob: "c90260974682589a0b66a69468eaa70eb16477ad",
  analyticalDir: "packages/ds-codegen/src/analytical",
} as const;

export const LEGACY_COMPARISON_FILE = path.join(FIXTURES_DIR, "legacy-erasure-comparison.json");

/** Key-sorted JSON with no renaming: a serializer that can hide nothing. */
export function neutral(x: unknown): string {
  return JSON.stringify(sortKeys(x));
}
function sortKeys(x: unknown): unknown {
  if (Array.isArray(x)) return x.map(sortKeys);
  if (x !== null && typeof x === "object") {
    return Object.fromEntries(
      Object.keys(x as object)
        .sort()
        .map((k) => [k, sortKeys((x as Record<string, unknown>)[k])]),
    );
  }
  return x;
}
const digest12 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);
const gitBlobSha = (content: Buffer) => createHash("sha1").update(`blob ${content.length}\0`).update(content).digest("hex");

/**
 * Materialize the pinned legacy analytical modules from git history. The
 * quotient module's blob is verified against the pin, so a comparison can
 * never silently run against a different legacy.
 */
export function materializeLegacy(): { dir: string; remove: () => void } {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "legacy-erasure-"));
  const dir = path.join(scratch, LEGACY_PIN.analyticalDir);
  fs.mkdirSync(dir, { recursive: true });
  const files = execFileSync("git", ["ls-tree", "--name-only", LEGACY_PIN.commit, `${LEGACY_PIN.analyticalDir}/`], { cwd: ROOT, encoding: "utf-8" })
    .split("\n")
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
  for (const f of files) {
    const bytes = execFileSync("git", ["show", `${LEGACY_PIN.commit}:${f}`], { cwd: ROOT });
    fs.writeFileSync(path.join(dir, path.basename(f)), bytes);
  }
  const blob = gitBlobSha(fs.readFileSync(path.join(dir, "quotient.ts")));
  if (blob !== LEGACY_PIN.quotientBlob) throw new Error(`legacy quotient.ts blob ${blob} does not match the pin ${LEGACY_PIN.quotientBlob}`);
  fs.symlinkSync(CONTRACTS_DIR, path.join(scratch, "packages/ds-contracts"));
  fs.symlinkSync(path.join(ROOT, "docs"), path.join(scratch, "docs"));
  fs.symlinkSync(path.join(ROOT, "packages/ds-codegen/node_modules"), path.join(scratch, "packages/ds-codegen/node_modules"));
  return { dir, remove: () => fs.rmSync(scratch, { recursive: true, force: true }) };
}

export type Shape = "absent" | "hole" | "class" | "scalar" | "object" | "array";
export function shapeOf(v: unknown): Shape {
  if (v === undefined) return "absent";
  if (v !== null && typeof v === "object" && "@q" in (v as object)) return (v as { "@q": string })["@q"] === "forgotten" ? "hole" : "class";
  if (Array.isArray(v)) return "array";
  return v !== null && typeof v === "object" ? "object" : "scalar";
}
/** Every terminal value by path; a quotient marker is one value, not a subtree. */
export function leaves(node: unknown, p = "", out = new Map<string, unknown>()): Map<string, unknown> {
  if (Array.isArray(node)) {
    node.forEach((v, i) => leaves(v, `${p}.${i}`, out));
    return out;
  }
  if (node !== null && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if ("@q" in o) {
      out.set(p, o);
      return out;
    }
    for (const [k, v] of Object.entries(o)) leaves(v, `${p}.${k}`, out);
    return out;
  }
  out.set(p, node);
  return out;
}

/** The operation laws a divergence is read under, by the NEW plan's operation. */
export const LAW: Record<string, string> = {
  "forget-value": "a required leaf is forgotten by becoming a typed hole (@q forgotten); deleting it departs the source language",
  "delete-slot": "an optional leaf is forgotten by deletion; nothing else moves",
  "delete-holder": "a whole optional declaration is forgotten by deletion; a required declaration cannot be forgotten by deletion",
  "delete-tagged-holder": "a holder is forgotten only where it carries the named member",
  "merge-enum-members": "two members become one member class (@q member-class); rewriting one member as the other asserts a member, it does not forget the distinction",
  "spell-member-as-absent": "the named member is spelled as the declaration's absence",
  "forget-reference-arity": "a reference list is truncated to its declared floor, never below it",
  "forget-reference-incidence": "which referent a slot names is forgotten; that a referent is named is kept",
  "forget-reference-order": "the order of a reference list is forgotten; its members are kept",
};

export type SideOutcome = { image: string } | { failure: string } | { absent: string };
export interface ClassInput {
  operation: string | null;
  legacy: SideOutcome;
  new: SideOutcome;
  /** Neutral-serialized images where both exist, for the shape signature. */
  legacyImage?: unknown;
  newImage?: unknown;
  legacyValidInSourceSchema: boolean | null;
  newQuotientLegal: boolean | null;
}
export interface Classification {
  class: string;
  disposition: string;
  /** Up to four differing leaves, `path: legacy -> new`. */
  diff: string[];
}

const DISPOSITION: Record<string, string> = {
  agree: "identical images under the neutral serializer",
  "new-no-plan":
    "the new census carries this coordinate as a reference with no plan (A5: references are the only no-plan kind) while the legacy walker erased it; there is no new image to compare -- reported, not scored as agreement",
  "only-legacy-coordinate": "the coordinate exists only in the legacy census; nothing on the new side to compare -- reported, not scored",
  "only-new-coordinate": "the coordinate exists only in the new census; nothing on the legacy side to compare -- reported, not scored",
  "both-fail": "neither path yields an image; recorded as a double failure",
  "new-fails": "the NEW path fails where the legacy path yields an image: a defect of the new path until adjudicated otherwise",
  "legacy-fails": "the legacy walker fails where the new path yields an image; the new image stands on its own legality",
  "new-image-not-quotient-legal": "the new image is not quotient-legal: the new path must answer for this record",
  "forget-value:absent>hole:legacy-invalid":
    "legacy deleted a required leaf and left a source-invalid image; the typed hole is the lawful forgetting and the legacy image is the departure",
  "forget-value:absent>hole:legacy-valid":
    "legacy deleted the leaf and its emptied optional holder collapsed, leaving a source-valid image that forgets MORE than the coordinate (the holder's presence); the hole keeps the declaration and forgets only the value -- the holder-presence defect held open in codomain-adjudications.json, quantified",
  "merge-enum-members:scalar>class:legacy-valid":
    "legacy rewrote one member as the other, asserting a member definitively where the law asks for the class; the legacy image is source-valid but says something different; the member class is the lawful image",
  "merge-enum-members:scalar>class:legacy-invalid":
    "legacy rewrote a discriminator member under a payload that belongs to the other branch, leaving a source-invalid image; the member class keeps the payload and is lawful -- the branch residue the closure form exists to normalize",
  "forget-reference-arity:absent>scalar:legacy-invalid":
    "legacy truncated a reference list below its declared floor, leaving a source-invalid image; the new plan truncates to the floor and never below it",
};

export function classifyDivergence(input: ClassInput): Classification {
  const { legacy, new: fresh } = input;
  const done = (cls: string, diff: string[] = []): Classification => ({
    class: cls,
    disposition: DISPOSITION[cls] ?? `UNCLASSIFIED (${cls}): this divergence needs an individual reading before the ledger can carry it`,
    diff,
  });
  if ("absent" in legacy && !("absent" in fresh)) return done("only-new-coordinate");
  if ("absent" in fresh && fresh.absent.startsWith("coordinate")) return done("only-legacy-coordinate");
  if ("failure" in legacy && "failure" in fresh) return done("both-fail");
  if ("failure" in fresh) return done("new-fails");
  if ("absent" in fresh) return done("new-no-plan");
  if ("failure" in legacy) return done("legacy-fails");
  if (input.newQuotientLegal === false) return done("new-image-not-quotient-legal");
  if (neutral(input.legacyImage) === neutral(input.newImage)) return done("agree");
  const a = leaves(input.legacyImage);
  const b = leaves(input.newImage);
  const paths = [...new Set([...a.keys(), ...b.keys()])].filter((k) => neutral(a.get(k)) !== neutral(b.get(k))).sort();
  const signature = [...new Set(paths.map((k) => `${shapeOf(a.get(k))}>${shapeOf(b.get(k))}`))].sort().join(",");
  const validity = input.legacyValidInSourceSchema === false ? "legacy-invalid" : input.legacyValidInSourceSchema === true ? "legacy-valid" : "legacy-validity-unknown";
  const diff = paths.slice(0, 4).map((k) => `${k}: ${neutral(a.get(k)) ?? "(absent)"} -> ${neutral(b.get(k)) ?? "(absent)"}`.slice(0, 200));
  return done(`${input.operation}:${signature}:${validity}`, diff);
}

/** One divergence, as the ledger stores it: [plan, specimen, legacy, new, class]. */
export type Record5 = [plan: string, specimen: string, legacy: string, fresh: string, cls: string];

export interface LegacyComparison {
  $comment: string;
  legacyPin: typeof LEGACY_PIN;
  population: { corpus: number; stimuli: number; synthesized: number; total: number; membershipDigest: string };
  coordinates: { legacy: number; new: number; both: number; onlyLegacy: string[]; onlyNew: string[] };
  pairs: number;
  agree: { count: number; digest: string };
  classes: Record<string, { count: number; plans: string[]; law: string | null; disposition: string; sample: { plan: string; specimen: string; diff: string[] } }>;
  divergences: Record5[];
}

const sideText = (s: SideOutcome): string => ("image" in s ? s.image : "failure" in s ? `F:${s.failure.slice(0, 80)}` : "-");

export async function compare(): Promise<LegacyComparison> {
  const legacy = materializeLegacy();
  try {
    const legacyQuotient = (await import(/* @vite-ignore */ path.join(legacy.dir, "quotient.ts"))) as { erase: (f: Fixture, c: unknown) => Fixture };
    const legacyCensus = (await import(/* @vite-ignore */ path.join(legacy.dir, "census.ts"))) as { loadCensus: () => Coordinate[] };
    const census = loadCensus();
    const oracle = loadOracle();
    const quotientValid = loadQuotientValidator(CONTRACTS_DIR);
    const s = specimens();
    const legacyById = new Map(legacyCensus.loadCensus().map((c) => [c.id, c]));
    const newById = new Map(census.map((c) => [c.id, c]));
    const ids = [...new Set([...legacyById.keys(), ...newById.keys()])].sort();

    const classes: LegacyComparison["classes"] = {};
    const divergences: Record5[] = [];
    const agreeing: string[] = [];
    let pairs = 0;
    for (const id of ids) {
      const lc = legacyById.get(id);
      const nc = newById.get(id);
      const plan = nc ? planFor(nc) : undefined;
      const operation = plan ? plan.operation.kind : null;
      for (const f of s.fixtures) {
        pairs++;
        const input: ClassInput = {
          operation,
          legacy: { absent: "coordinate not in legacy census" },
          new: { absent: "coordinate not in new census" },
          legacyValidInSourceSchema: null,
          newQuotientLegal: null,
        };
        if (lc) {
          try {
            const li = legacyQuotient.erase(f, lc);
            input.legacyImage = li;
            input.legacy = { image: digest12(neutral(li)) };
            input.legacyValidInSourceSchema = oracle.validate(li).length === 0;
          } catch (e) {
            input.legacy = { failure: (e as Error).message };
          }
        }
        if (nc) {
          if (!plan) input.new = { absent: "no plan (reference coordinate)" };
          else {
            try {
              const ni = erase(f, nc);
              input.newImage = ni;
              input.new = { image: digest12(neutral(ni)) };
              input.newQuotientLegal = quotientValid(ni).length === 0;
            } catch (e) {
              input.new = { failure: (e as Error).message };
            }
          }
        }
        const c = classifyDivergence(input);
        if (c.class === "agree") {
          agreeing.push(`${id}|${f.id}|${sideText(input.new)}`);
          continue;
        }
        const entry = (classes[c.class] ??= { count: 0, plans: [], law: operation ? (LAW[operation] ?? null) : null, disposition: c.disposition, sample: { plan: id, specimen: f.id, diff: c.diff } });
        entry.count++;
        if (!entry.plans.includes(id)) entry.plans.push(id);
        divergences.push([id, f.id, sideText(input.legacy), sideText(input.new), c.class]);
      }
    }
    for (const e of Object.values(classes)) e.plans.sort();
    return {
      $comment:
        "Legacy erasure walker (pinned) vs the quotient codomain over the complete bound specimen population. Agreement is bound by count and digest; every divergence is one record [plan, specimen, legacy image digest or F:failure or -, new image digest or F:failure or -, class]; each class carries its law and disposition. Regenerate with `legacy-comparison.ts --record`; verify with `--check`.",
      legacyPin: LEGACY_PIN,
      population: { corpus: s.corpus, stimuli: s.stimuli, synthesized: s.synthesized, total: s.fixtures.length, membershipDigest: footprintBasisDigest(s.fixtures.map(canonical)) },
      coordinates: {
        legacy: legacyById.size,
        new: newById.size,
        both: ids.filter((i) => legacyById.has(i) && newById.has(i)).length,
        onlyLegacy: ids.filter((i) => !newById.has(i)),
        onlyNew: ids.filter((i) => !legacyById.has(i)),
      },
      pairs,
      agree: { count: agreeing.length, digest: createHash("sha256").update(agreeing.sort().join("\n")).digest("hex") },
      classes,
      divergences,
    };
  } finally {
    legacy.remove();
  }
}

export function loadLegacyComparison(file = LEGACY_COMPARISON_FILE): LegacyComparison {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as LegacyComparison;
}

/** Classes whose presence means the new path, not the legacy one, has to answer. */
export const NEW_PATH_ANSWERS = ["new-fails", "new-image-not-quotient-legal"] as const;

export function comparisonProblems(recorded: LegacyComparison, live: LegacyComparison): string[] {
  const problems: string[] = [];
  if (neutral(recorded.legacyPin) !== neutral(LEGACY_PIN)) problems.push("the recorded legacy pin is not this module's pin");
  if (recorded.population.membershipDigest !== live.population.membershipDigest) problems.push(`the specimen population moved: ${recorded.population.total} -> ${live.population.total}, digest ${recorded.population.membershipDigest.slice(0, 12)} -> ${live.population.membershipDigest.slice(0, 12)}`);
  if (recorded.pairs !== live.pairs) problems.push(`pair count ${recorded.pairs} -> ${live.pairs}`);
  if (recorded.agree.count !== live.agree.count || recorded.agree.digest !== live.agree.digest) problems.push(`the agreeing set moved: ${recorded.agree.count} -> ${live.agree.count}`);
  const was = new Set(recorded.divergences.map((r) => r.join("")));
  const is = new Set(live.divergences.map((r) => r.join("")));
  for (const r of was) if (!is.has(r)) problems.push(`divergence gone: ${r.split("").join(" | ")}`);
  for (const r of is) if (!was.has(r)) problems.push(`divergence new: ${r.split("").join(" | ")}`);
  for (const k of Object.keys(recorded.classes)) if (!(k in live.classes)) problems.push(`class gone: ${k}`);
  for (const k of Object.keys(live.classes)) if (!(k in recorded.classes)) problems.push(`class new: ${k}`);
  for (const k of Object.keys(live.classes)) if (recorded.classes[k] && recorded.classes[k].count !== live.classes[k].count) problems.push(`class ${k}: ${recorded.classes[k].count} -> ${live.classes[k].count}`);
  for (const k of NEW_PATH_ANSWERS) if (live.classes[k]) problems.push(`${live.classes[k].count} record(s) where the new path must answer: ${k}`);
  for (const k of Object.keys(live.classes)) if (live.classes[k].disposition.startsWith("UNCLASSIFIED")) problems.push(`unclassified divergence class: ${k}`);
  return problems;
}

const invokedDirectly = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const live = await compare();
  const summary = () => `${live.pairs} pairs over ${live.population.total} specimens and ${live.coordinates.both} coordinates: ${live.agree.count} agree, ${live.divergences.length} divergences in ${Object.keys(live.classes).length} classes`;
  if (process.argv.includes("--record")) {
    fs.writeFileSync(LEGACY_COMPARISON_FILE, `${JSON.stringify(live, null, 1)}\n`);
    console.log(`legacy-comparison --record: wrote ${path.relative(ROOT, LEGACY_COMPARISON_FILE)} -- ${summary()}`);
    for (const [k, v] of Object.entries(live.classes).sort((x, y) => y[1].count - x[1].count)) console.log(`  ${String(v.count).padStart(6)}  ${k}  (${v.plans.length} plan(s))`);
  } else {
    const problems = comparisonProblems(loadLegacyComparison(), live);
    if (problems.length > 0) {
      console.error(`legacy-comparison --check: ${problems.length} problem(s)`);
      for (const p of problems.slice(0, 40)) console.error(`  - ${p}`);
      process.exit(1);
    }
    console.log(`legacy-comparison --check: OK -- ${summary()}; the recorded ledger matches`);
  }
}
