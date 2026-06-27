#!/usr/bin/env node
// RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03 — native compile lane runner.
// Generalized to a second compiler family by
// RAIL-NATIVE-COMPILE-LANE-SWIFT-SMOKE-04.
//
// Executes a native lane package's target-owned compile command (a NON-pnpm
// argv) and binds its exit code as admission evidence — the same exit-code ->
// pass/fail contract the web/RN rail runner uses, but against a native compiler
// (kotlinc, swiftc, …) instead of tsc/vitest. The rail core gains no
// compiler-family branch: this script reads the target's self-declared compile
// facts (compile-lane.json) and spawns whatever compiler/extension the lane
// DECLARES. Adding a compiler family is a new lane package + one NATIVE_LANE_IDS
// entry, NOT an `if kotlin`/`if swift` branch here.
//
//   # generic form (any native lane):
//   node scripts/run-native-compile-lane.mjs --lane <id> --compiler <path>            # positive: lane passes iff valid sources compile
//   node scripts/run-native-compile-lane.mjs --lane <id> --compiler <path> --negative  # negative: lane passes iff invalid sources FAIL to compile
//
//   # back-compat alias (kept so the slice-3 compose-smoke CI step is unchanged):
//   node scripts/run-native-compile-lane.mjs --kotlinc <path> [--negative]            # defaults --lane compose-smoke
//
// The compiler path may also come from the COMPILER (or, for the alias, KOTLINC)
// env var, else falls back to the lane's declared `compiler`. Exit 0 = lane passed.

import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function arg(flag) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return undefined;
}
const negative = process.argv.includes("--negative");

// Lane selection. `--lane <id>` is the general form. `--kotlinc` (or KOTLINC) is
// a back-compat alias that both names the compose-smoke lane AND supplies its
// compiler path — so the slice-3 CI step keeps working verbatim. The alias is
// NOT a Kotlin special case in the dispatch: it only sets defaults; everything
// downstream reads the lane's declared facts.
const kotlincAlias = arg("--kotlinc") || process.env.KOTLINC;
const laneId = arg("--lane") || (kotlincAlias ? "compose-smoke" : undefined);
if (!laneId) {
  console.error(
    "[native-compile-lane] no lane selected. Pass --lane <id> (e.g. compose-smoke, swift-smoke), " +
      "or the --kotlinc alias for compose-smoke.",
  );
  process.exit(2);
}

const PKG = join(REPO_ROOT, "packages", `ds-${laneId}`);
let lane;
try {
  lane = JSON.parse(readFileSync(join(PKG, "compile-lane.json"), "utf8"));
} catch (e) {
  console.error(`[native-compile-lane] cannot read packages/ds-${laneId}/compile-lane.json: ${e.message}`);
  process.exit(2);
}

// The compiler executable: --compiler flag > COMPILER env > the --kotlinc alias
// (compose-smoke only) > the lane's DECLARED compiler. The lane's declaration is
// the family-neutral default; CI overrides it with a pinned absolute path.
const compiler =
  arg("--compiler") || process.env.COMPILER || kotlincAlias || lane.compiler;
const sourceExt = lane.sourceExtension; // target-owned; never hardcoded here
const srcDirs = negative ? lane.invalidSources : lane.validSources;

// Collect the source files to compile (the target-owned source set), filtered
// by the lane's DECLARED extension — not a hardcoded `.kt`/`.swift`.
const sources = [];
for (const d of srcDirs) {
  const abs = join(PKG, d);
  for (const f of readdirSync(abs)) {
    if (f.endsWith(sourceExt)) sources.push(join(abs, f));
  }
}
if (sources.length === 0) {
  console.error(
    `[native-compile-lane] no ${sourceExt} sources found in ${srcDirs.join(", ")} for lane ${laneId}`,
  );
  process.exit(2);
}

const outDir = mkdtempSync(join(tmpdir(), `${laneId}-`));
// The output flag + path are themselves target-owned facts: kotlinc writes to a
// directory with `-d`, swiftc writes an executable with `-o`. The runner reads
// the flag from the lane declaration rather than switching on compiler family —
// so a third family supplies its own `outputFlag`, no branch added here. The
// path is a fresh temp (a dir for `-d`, a file basename for `-o`); both compilers
// accept a path argument after their flag.
const outputFlag = lane.outputFlag;
if (typeof outputFlag !== "string" || outputFlag.length === 0) {
  console.error(`[native-compile-lane] lane ${laneId} must declare a non-empty outputFlag (e.g. "-d", "-o")`);
  process.exit(2);
}
const outputPath = outputFlag === "-d" ? outDir : join(outDir, "out");
// The target-owned compile command: a NON-pnpm argv. This is exactly the
// PlanCommand.command shape the rail runner already spawns — only the program is
// a native compiler, not pnpm.
const command = [compiler, ...sources, outputFlag, outputPath];

console.error(
  `[native-compile-lane] railTargetId=${lane.railTargetId} toolchain=${lane.toolchain} ` +
    `pass=${negative ? "negative(expect-fail)" : "positive(expect-pass)"}`,
);
// Display the command with absolute paths shortened to package-relative for a
// stable, readable log line (the actual spawn uses the full argv above).
const compilerName = compiler.split("/").pop();
const shownCmd = [compilerName, ...sources.map((s) => s.replace(`${PKG}/`, "")), outputFlag, "<out>"];
console.error(`[native-compile-lane] $ ${shownCmd.join(" ")}`);

const started = Date.now();
const res = spawnSync(command[0], command.slice(1), { encoding: "utf8" });
const durationMs = Date.now() - started;

if (res.error && res.error.code === "ENOENT") {
  console.error(
    `[native-compile-lane] compiler not found at "${compiler}" for lane ${laneId}. ` +
      `Provide --compiler <path> or set COMPILER. (CI provisions it; locally, point at an install.)`,
  );
  process.exit(2);
}

const compileExit = res.status;
const compiled = compileExit === 0;
// Lane disposition: positive pass wants a clean compile; negative pass wants a
// compile FAILURE (that is how we prove the compiler is genuinely active and
// catches invalid source the byte-diff cannot).
const lanePassed = negative ? !compiled : compiled;

// Capture a few diagnostic lines, like the web rail runner does.
const diag = (res.stderr || "").split("\n").filter((l) => /error:|warning:/.test(l)).slice(0, 5);

console.error(
  `[native-compile-lane] compile exit=${compileExit} (${durationMs}ms) -> lane ${lanePassed ? "PASS" : "FAIL"}`,
);
for (const l of diag) console.error(`[native-compile-lane]   ${l}`);

if (!lanePassed) {
  if (negative) {
    console.error(
      `[native-compile-lane] FAIL: the invalid ${lane.toolchain} fixture compiled — the compiler did not reject it. ` +
        "The toolchain is not genuinely active, or the fixture was repaired.",
    );
  } else {
    console.error(`[native-compile-lane] FAIL: valid ${lane.toolchain} smoke fixture did not compile.`);
  }
  process.exit(1);
}
console.error(
  `[native-compile-lane] OK (${negative ? `compiler rejected invalid ${lane.toolchain} as required` : "valid fixture compiled"})`,
);
process.exit(0);
