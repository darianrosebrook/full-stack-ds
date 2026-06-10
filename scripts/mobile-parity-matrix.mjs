#!/usr/bin/env node
// @ts-check
/**
 * mobile-parity-matrix.mjs — MOBILE-PARITY-QUALITY-RECON-01
 *
 * MEASUREMENT ONLY. This script reads the repository and emits a
 * framework-by-framework parity matrix across eight dimensions. It is a
 * pure read-only function of the repo state: filesystem reads only, no
 * clock, no network, no randomness, so re-running it on an unchanged tree
 * reproduces the same matrix byte-for-byte (modulo the JSON's stable key
 * order). It changes NOTHING — it does not register targets, write package
 * roots, touch emitters, the rail, the IR, or any contract.
 *
 * Derivation discipline (the whole point of the slice):
 *   - Machine-derivable cells are computed by walking the codebase the way
 *     the authoritative loaders do — NOT from a hardcoded list:
 *       * component coverage  -> the contracts-fs component walk
 *         (components/<Name>/<Name>.contract.json, dir-per-component)
 *       * target admission    -> the BuiltinTargetId union in emitter.ts
 *                                (the admitted set; TargetId = string is open)
 *       * emitter-file shape  -> existence of files under
 *                                frameworks/<target>/ (and swift sub-targets)
 *       * rail provenance     -> validation/frameworks/<target>.ts existence
 *       * package roots       -> packages/ds-<target>/src existence
 *   - Cells the script CANNOT honestly derive (emitter *completeness*,
 *     *surface* support depth, native *token realization* depth, behavior/
 *     controller support depth) are emitted as the literal string
 *     "unmeasured" with an EVIDENCE ANCHOR (a file path or a prior-sweep
 *     commit/category). "unmeasured" means "this script does not measure it,"
 *     NOT "absent" — the doc must preserve that distinction.
 *
 * Prior-sweep anchors (cited, not re-derived here):
 *   - docs/successor-work-mobile-rail-sweep.md @ 8c19a4d: role-loss 0/47;
 *     A=21 (IR-sufficient), C=17 (composite/collapse), D=9 (runtime/surface).
 *   - docs/successor-work-mobile-collapse-triage.md @ 7fee739:
 *     C1=Details, C2=ShowMore/Truncate/TextField, C3=11, C4=Badge.
 *
 * Usage:
 *   node scripts/mobile-parity-matrix.mjs            # human matrix to stdout
 *   node scripts/mobile-parity-matrix.mjs --json     # machine JSON to stdout
 *   node scripts/mobile-parity-matrix.mjs --json out.json   # JSON to a file
 *   node scripts/mobile-parity-matrix.mjs --check    # self-check exit code
 *
 * --check verifies the derivations are internally consistent (e.g. the
 * derived component count equals the contracts-fs count and the sweep
 * category counts sum to the corpus). Exit 0 = consistent, 1 = drift.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");

const UNMEASURED = "unmeasured";

// ---------------------------------------------------------------------------
// The eight parity dimensions, in the order the spec (A1) enumerates them.
// `derivable` marks which the script computes from the repo vs. which stay
// evidence-anchored "unmeasured".
// ---------------------------------------------------------------------------
const DIMENSIONS = [
  { key: "componentCoverage", label: "Component coverage", derivable: true },
  { key: "emitterCompleteness", label: "Emitter completeness", derivable: false },
  { key: "compileAdmission", label: "Compile / admission", derivable: true },
  { key: "tokenRealization", label: "Token realization", derivable: false },
  { key: "behaviorController", label: "Behavior / controller", derivable: false },
  { key: "surfaceSupport", label: "Surface support", derivable: false },
  { key: "preservation", label: "Preservation", derivable: true },
  { key: "railProvenance", label: "Rail provenance", derivable: true },
];

// The eight targets under evaluation: five web, three native. figma is the
// repo's sixth admitted target but is not a web-or-native UI framework, so it
// is excluded from the parity comparison (the spec scopes the comparison to
// react/vue/svelte/angular/lit | swiftui/react-native/jetpack-compose).
const WEB_TARGETS = ["react", "vue", "svelte", "angular", "lit"];
const NATIVE_TARGETS = ["swiftui", "react-native", "jetpack-compose"];
const TARGETS = [...WEB_TARGETS, ...NATIVE_TARGETS];

// Map a parity-target id to its emitter directory under frameworks/. swiftui
// is a sub-target of the swift family; the rest are top-level.
const EMITTER_DIR = {
  react: "react",
  vue: "vue",
  svelte: "svelte",
  angular: "angular",
  lit: "lit",
  swiftui: "swift/swiftui",
  "react-native": "react-native",
  "jetpack-compose": "jetpack-compose",
};

// Map a parity-target id to its generated package root.
const PACKAGE_ROOT = {
  react: "packages/ds-react/src",
  vue: "packages/ds-vue/src",
  svelte: "packages/ds-svelte/src",
  angular: "packages/ds-angular/src",
  lit: "packages/ds-lit/src",
  // React Native generates into a real package root and sits in the default
  // rail (FEAT-MOBILE-RN-001). SwiftUI/Compose remain recon: null = "no
  // generated package root."
  "react-native": "packages/ds-react-native/src",
  swiftui: null,
  "jetpack-compose": null,
};

// Rail per-framework admission plan id (validation/frameworks/<id>.ts).
const RAIL_PLAN_ID = {
  react: "react",
  vue: "vue",
  svelte: "svelte",
  angular: "angular",
  lit: "lit",
  // The rail keys swift via the "swift" family, but no swift plan file exists;
  // probe both the family and the sub-target to avoid a false negative.
  swiftui: "swiftui",
  "react-native": "react-native",
  "jetpack-compose": "jetpack-compose",
};

// ---------------------------------------------------------------------------
// Evidence anchors for the non-derivable dimensions. These are the citations
// the doc reproduces; the script attaches them so a reader of the JSON sees
// WHY a cell is unmeasured and where to look.
// ---------------------------------------------------------------------------
const SWEEP_DOC = "docs/successor-work-mobile-rail-sweep.md";
const SWEEP_SHA = "8c19a4d";
const TRIAGE_DOC = "docs/successor-work-mobile-collapse-triage.md";
const TRIAGE_SHA = "7fee739";

// Prior-sweep category counts (cited from SWEEP_SHA — NOT re-derived here).
// A = IR-sufficient single shapes; C = composite/collapse; D = runtime/surface.
const SWEEP_CATEGORIES = {
  A: 21,
  C: 17,
  D: 9,
  roleLoss: 0,
  source: `${SWEEP_DOC} @ ${SWEEP_SHA}`,
};

// ---------------------------------------------------------------------------
// Derivation helpers — each mirrors an authoritative loader.
// ---------------------------------------------------------------------------

/**
 * Component coverage: walk components/<Name>/<Name>.contract.json exactly as
 * packages/ds-codegen/src/contracts-fs.ts loadComponentEntries does — one
 * entry per directory that contains <Name>.contract.json, sorted by name.
 */
function deriveComponentCount() {
  const dir = path.join(REPO, "packages/ds-contracts/components");
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    const folder = path.join(dir, name);
    if (!fs.statSync(folder).isDirectory()) continue;
    const contract = path.join(folder, `${name}.contract.json`);
    if (fs.existsSync(contract)) count += 1;
  }
  return count;
}

/**
 * Admitted-target set: parse the BuiltinTargetId union from emitter.ts. This
 * is the authoritative admitted set (a target absent from this union cannot be
 * invoked through --target= regardless of whether emitter code exists).
 */
function deriveAdmittedTargets() {
  const file = path.join(REPO, "packages/ds-codegen/src/emitter.ts");
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(/export\s+type\s+BuiltinTargetId\s*=\s*([^;]+);/);
  if (!m) return [];
  // Extract the quoted string-literal members of the union.
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** Does this target have an emitter directory with at least one source file? */
function deriveEmitterFiles(target) {
  const rel = EMITTER_DIR[target];
  const dir = path.join(REPO, "packages/ds-codegen/src/frameworks", rel);
  if (!fs.existsSync(dir)) return { present: false, files: [] };
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .sort();
  return { present: files.length > 0, files };
}

/** Does a generated package root exist (the web-style ds-<x>/src tree)? */
function derivePackageRoot(target) {
  const rel = PACKAGE_ROOT[target];
  if (!rel) return { present: false, path: null };
  const abs = path.join(REPO, rel);
  return { present: fs.existsSync(abs), path: rel };
}

/** Does a rail per-framework admission plan file exist? */
function deriveRailPlan(target) {
  const dir = path.join(REPO, "packages/ds-codegen/src/validation/frameworks");
  if (!fs.existsSync(dir)) return { present: false, path: null };
  // Probe both the sub-target id and the swift family id.
  const candidates = [`${RAIL_PLAN_ID[target]}.ts`];
  if (target === "swiftui") candidates.push("swift.ts");
  for (const c of candidates) {
    const abs = path.join(dir, c);
    if (fs.existsSync(abs)) {
      return { present: true, path: `packages/ds-codegen/src/validation/frameworks/${c}` };
    }
  }
  return { present: false, path: null };
}

/**
 * Preservation: the @custom:start/@custom:end region machinery is a single
 * shared module (preserve.ts) consumed by emitters that write to package
 * roots. A target "has preservation" in the generated-system sense iff it
 * has a generated package root the regions can live in. The mechanism itself
 * is target-neutral; what differs is whether a target produces preserved
 * files at all. So we derive this from package-root presence (a structural
 * fact), and the doc notes preserve.ts is shared, not per-target.
 */
function derivePreservation(target, packageRoot) {
  return packageRoot.present;
}

// ---------------------------------------------------------------------------
// Build one target's row.
// ---------------------------------------------------------------------------
function buildRow(target, admitted) {
  const isAdmitted = admitted.includes(target);
  const emitter = deriveEmitterFiles(target);
  const packageRoot = derivePackageRoot(target);
  const railPlan = deriveRailPlan(target);
  const isNative = NATIVE_TARGETS.includes(target);

  // compileAdmission is derivable: a target is compile-admitted iff it is in
  // the BuiltinTargetId union AND has a rail plan AND a package root. We report
  // the three component facts so the doc can be precise.
  const compileAdmission = {
    admittedTarget: isAdmitted,
    railPlan: railPlan.present,
    packageRoot: packageRoot.present,
    // The summary verdict the matrix prints.
    verdict: isAdmitted && railPlan.present && packageRoot.present ? "admitted" : "not-admitted",
  };

  return {
    target,
    family: isNative ? "native" : "web",
    cells: {
      componentCoverage: {
        derivable: true,
        // Web targets generate the full corpus; this is verified by the
        // package-root presence + the rail/diff discipline. For native, the
        // sweep categorized the corpus but no target generates it — coverage
        // is 0 generated even though emitter code exists. We report the
        // structural fact (does a package root hold generated output?) and
        // cite the sweep for the *potential* split.
        generatedCorpus: packageRoot.present ? "full" : "none",
        evidence: packageRoot.present
          ? packageRoot.path
          : `${SWEEP_CATEGORIES.source} (A=${SWEEP_CATEGORIES.A} IR-sufficient, C=${SWEEP_CATEGORIES.C} composite, D=${SWEEP_CATEGORIES.D} runtime; potential, not generated)`,
      },
      emitterCompleteness: {
        derivable: false,
        value: UNMEASURED,
        // What IS derivable: whether emitter source files exist at all.
        emitterFilesPresent: emitter.present,
        emitterFileCount: emitter.files.length,
        evidence: emitter.present
          ? `packages/ds-codegen/src/frameworks/${EMITTER_DIR[target]}/ (${emitter.files.length} .ts files present; completeness not measured here)`
          : `no emitter directory at packages/ds-codegen/src/frameworks/${EMITTER_DIR[target]}/`,
      },
      compileAdmission: {
        derivable: true,
        ...compileAdmission,
      },
      tokenRealization: {
        derivable: false,
        value: UNMEASURED,
        evidence: isNative
          ? `typed token FACTS available in IR (FEAT-MOBILE-IR-001, closed); native realization (Swift Color/CGFloat, Kotlin Color/Dp, RN style surfaces) not measured here`
          : `web token output verified via tokens:* gates + rail diff; depth not scored by this script`,
      },
      behaviorController: {
        derivable: false,
        value: UNMEASURED,
        evidence: isNative
          ? `${SWEEP_CATEGORIES.source} (D=${SWEEP_CATEGORIES.D} runtime/controller components); native controller support not measured here`
          : `behavior primitives mirrored across web frameworks (useFocusTrap etc.); depth not scored here`,
      },
      surfaceSupport: {
        derivable: false,
        value: UNMEASURED,
        evidence: isNative
          ? `surface-emit.ts present under frameworks/${EMITTER_DIR[target]}/; SurfaceIR substrate-neutrality unproven for native (Tooltip/Popover/Dialog/Menu host-adoption) — not measured here`
          : `web surface support via DOM slots/events/focus/positioning; depth not scored here`,
      },
      preservation: {
        derivable: true,
        // preserve.ts is a shared, target-neutral module; a target produces
        // preserved files only if it has a generated package root.
        hasGeneratedFilesToPreserve: derivePreservation(target, packageRoot),
        evidence:
          "packages/ds-codegen/src/preserve.ts is shared/target-neutral; preserved output exists only where a generated package root does",
      },
      railProvenance: {
        derivable: true,
        railPlanPresent: railPlan.present,
        railPlanPath: railPlan.path,
        evidence: railPlan.present
          ? railPlan.path
          : `no validation/frameworks/ plan for ${target}`,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Self-check: internal consistency of the derivations.
// ---------------------------------------------------------------------------
function selfCheck(result) {
  const problems = [];
  // The derived component count must equal the contracts-fs count. We re-walk
  // here independently and compare to the value baked into the matrix.
  const recount = deriveComponentCount();
  if (recount !== result.componentCount) {
    problems.push(
      `component count drift: matrix=${result.componentCount} re-walk=${recount}`
    );
  }
  // The cited sweep categories must partition the corpus (A + C + D == count).
  const sum = SWEEP_CATEGORIES.A + SWEEP_CATEGORIES.C + SWEEP_CATEGORIES.D;
  if (sum !== result.componentCount) {
    problems.push(
      `sweep categories A+C+D=${sum} != corpus ${result.componentCount} ` +
        `(cited from ${SWEEP_CATEGORIES.source}; reconcile if the corpus changed)`
    );
  }
  // Every target must have all eight dimensions present (no silent omission).
  for (const row of result.rows) {
    for (const dim of DIMENSIONS) {
      if (!(dim.key in row.cells)) {
        problems.push(`${row.target} missing dimension ${dim.key}`);
      }
    }
  }
  // Every web target must be admitted. React Native graduated into the
  // default rail (FEAT-MOBILE-RN-001); SwiftUI/Compose remain recon and must
  // NOT be admitted. If either side flips, the matrix is stale.
  const ADMITTED_NATIVE = new Set(["react-native"]);
  for (const row of result.rows) {
    const adm = row.cells.compileAdmission.verdict === "admitted";
    if (row.family === "web" && !adm) {
      problems.push(`web target ${row.target} unexpectedly not admitted`);
    }
    if (row.family === "native" && adm && !ADMITTED_NATIVE.has(row.target)) {
      problems.push(`native target ${row.target} unexpectedly admitted (asymmetry changed)`);
    }
    if (row.family === "native" && !adm && ADMITTED_NATIVE.has(row.target)) {
      problems.push(`native target ${row.target} expected admitted (FEAT-MOBILE-RN-001) but is not`);
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// Assemble the matrix.
// ---------------------------------------------------------------------------
function buildMatrix() {
  const admitted = deriveAdmittedTargets();
  const componentCount = deriveComponentCount();
  const rows = TARGETS.map((t) => buildRow(t, admitted));
  return {
    componentCount,
    admittedTargets: admitted,
    sweep: SWEEP_CATEGORIES,
    triage: { source: `${TRIAGE_DOC} @ ${TRIAGE_SHA}`, C1: "Details", C2: ["ShowMore", "Truncate", "TextField"], C4: "Badge" },
    dimensions: DIMENSIONS.map((d) => ({ key: d.key, label: d.label, derivable: d.derivable })),
    rows,
  };
}

// ---------------------------------------------------------------------------
// Rendering.
// ---------------------------------------------------------------------------
function cellSummary(dimKey, cell) {
  switch (dimKey) {
    case "componentCoverage":
      return cell.generatedCorpus === "full" ? "full (generated)" : "none generated";
    case "emitterCompleteness":
      return cell.emitterFilesPresent ? `${UNMEASURED} (${cell.emitterFileCount} files)` : `${UNMEASURED} (no emitter)`;
    case "compileAdmission":
      return cell.verdict;
    case "tokenRealization":
      return UNMEASURED;
    case "behaviorController":
      return UNMEASURED;
    case "surfaceSupport":
      return UNMEASURED;
    case "preservation":
      return cell.hasGeneratedFilesToPreserve ? "yes (generated files)" : "n/a (no generated output)";
    case "railProvenance":
      return cell.railPlanPresent ? "plan present" : "no plan";
    default:
      return UNMEASURED;
  }
}

function renderHuman(matrix) {
  const lines = [];
  lines.push(`Mobile-vs-web parity matrix — MOBILE-PARITY-QUALITY-RECON-01`);
  lines.push(`corpus: ${matrix.componentCount} components (contracts-fs walk)`);
  lines.push(`admitted targets (BuiltinTargetId): ${matrix.admittedTargets.join(", ")}`);
  lines.push(`sweep ${matrix.sweep.source}: A=${matrix.sweep.A} C=${matrix.sweep.C} D=${matrix.sweep.D} role-loss=${matrix.sweep.roleLoss}/${matrix.componentCount}`);
  lines.push("");
  for (const dim of matrix.dimensions) {
    lines.push(`## ${dim.label}${dim.derivable ? "" : "  (non-derivable → unmeasured + evidence)"}`);
    for (const row of matrix.rows) {
      const cell = row.cells[dim.key];
      lines.push(`  ${row.target.padEnd(16)} ${row.family.padEnd(7)} ${cellSummary(dim.key, cell)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------
function main() {
  const argv = process.argv.slice(2);
  const matrix = buildMatrix();

  if (argv.includes("--check")) {
    const problems = selfCheck(matrix);
    if (problems.length === 0) {
      process.stdout.write(`OK: ${matrix.componentCount} components, ${matrix.rows.length} targets, ${matrix.dimensions.length} dimensions; derivations consistent.\n`);
      process.exit(0);
    }
    process.stdout.write(`DRIFT:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`);
    process.exit(1);
  }

  if (argv.includes("--json")) {
    const json = JSON.stringify(matrix, null, 2) + "\n";
    const outIdx = argv.indexOf("--json") + 1;
    const outArg = argv[outIdx];
    if (outArg && !outArg.startsWith("--")) {
      fs.writeFileSync(path.resolve(process.cwd(), outArg), json);
      process.stdout.write(`wrote ${outArg}\n`);
    } else {
      process.stdout.write(json);
    }
    return;
  }

  process.stdout.write(renderHuman(matrix) + "\n");
}

main();
