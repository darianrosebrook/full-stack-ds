#!/usr/bin/env node
// RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03 — native compile lane runner.
//
// Executes the ds-compose-smoke package's target-owned compile command (a
// NON-pnpm argv) and binds its exit code as admission evidence — the same
// exit-code -> pass/fail contract the web/RN rail runner uses, but against a
// Kotlin compiler instead of tsc/vitest. The rail core gains no Compose/Gradle
// branch: this script reads the target's self-declared compile facts
// (compile-lane.json) and spawns the compiler.
//
//   node scripts/run-native-compile-lane.mjs --kotlinc <path>            # positive: lane passes iff valid sources compile
//   node scripts/run-native-compile-lane.mjs --kotlinc <path> --negative  # negative: lane passes iff invalid sources FAIL to compile
//
// --kotlinc may also come from the KOTLINC env var. Exit 0 = lane passed.

import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = join(REPO_ROOT, "packages/ds-compose-smoke");

function arg(flag) {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return undefined;
}
const negative = process.argv.includes("--negative");
const kotlinc = arg("--kotlinc") || process.env.KOTLINC || "kotlinc";

const lane = JSON.parse(readFileSync(join(PKG, "compile-lane.json"), "utf8"));
const srcDirs = negative ? lane.invalidSources : lane.validSources;

// Collect the .kt files to compile (the target-owned source set).
const sources = [];
for (const d of srcDirs) {
  const abs = join(PKG, d);
  for (const f of readdirSync(abs)) {
    if (f.endsWith(".kt")) sources.push(join(abs, f));
  }
}
if (sources.length === 0) {
  console.error(`[native-compile-lane] no .kt sources found in ${srcDirs.join(", ")}`);
  process.exit(2);
}

const outDir = mkdtempSync(join(tmpdir(), "compose-smoke-"));
// The target-owned compile command: a NON-pnpm argv. This is exactly the
// PlanCommand.command shape the rail runner already spawns — only the program
// is a Kotlin compiler, not pnpm.
const command = [kotlinc, ...sources, "-d", outDir];

console.error(
  `[native-compile-lane] railTargetId=${lane.railTargetId} toolchain=${lane.toolchain} ` +
    `pass=${negative ? "negative(expect-fail)" : "positive(expect-pass)"}`,
);
// Display the command with absolute paths shortened to basenames for a stable,
// readable log line (the actual spawn uses the full argv above).
const shownCmd = ["kotlinc", ...sources.map((s) => s.replace(`${PKG}/`, "")), "-d", "<out>"];
console.error(`[native-compile-lane] $ ${shownCmd.join(" ")}`);

const started = Date.now();
const res = spawnSync(command[0], command.slice(1), { encoding: "utf8" });
const durationMs = Date.now() - started;

if (res.error && res.error.code === "ENOENT") {
  console.error(
    `[native-compile-lane] kotlinc not found at "${kotlinc}". Provide --kotlinc <path> or set KOTLINC. ` +
      `(CI provisions it; locally, point at a kotlin-compiler install.)`,
  );
  process.exit(2);
}

const compileExit = res.status;
const compiled = compileExit === 0;
// Lane disposition: positive pass wants a clean compile; negative pass wants a
// compile FAILURE (that is how we prove the compiler is genuinely active and
// catches invalid Kotlin the byte-diff cannot).
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
      "[native-compile-lane] FAIL: invalid Kotlin fixture compiled — the compiler did not reject `??`. " +
        "The toolchain is not genuinely active, or the fixture was repaired.",
    );
  } else {
    console.error("[native-compile-lane] FAIL: valid smoke fixture did not compile.");
  }
  process.exit(1);
}
console.error(`[native-compile-lane] OK (${negative ? "compiler rejected invalid Kotlin as required" : "valid fixture compiled"})`);
process.exit(0);
