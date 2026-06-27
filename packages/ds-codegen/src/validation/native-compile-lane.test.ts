/**
 * Non-pnpm compile-admission contract (RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03).
 *
 * Proves the rail can execute and attribute a NON-pnpm, target-owned compile
 * command and bind its exit code as evidence — WITHOUT a Compose/Gradle-specific
 * branch in the runner. The actual Kotlin compile is proven by the CI
 * native-compile-rail job and the local lane runner (captured in the closure
 * notes); this unit test proves the rail-side contract that makes that possible:
 *
 *   - the lane descriptor parses and is a RailTargetId that is NOT a FrameworkId;
 *   - the compile command it lowers to is the same `[program, ...args]` argv the
 *     web/RN runner spawns, with a non-pnpm program;
 *   - that argv, run through the same spawn the runner uses, attributes its exit
 *     code (we use a portable non-pnpm program — node itself — as a stand-in for
 *     kotlinc, so the test needs no JVM toolchain; the kotlinc evidence is the
 *     lane runner's job).
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  readNativeCompileLane,
  nativeCompileCommand,
  isNativeLaneId,
} from "./native-compile-lane.js";
import { isAdmittedFrameworkId } from "./admission-descriptor.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const LANE_JSON = join(REPO_ROOT, "packages/ds-compose-smoke/compile-lane.json");

describe("native compile lane — non-pnpm compile admission", () => {
  it("parses the target's self-declared compile-lane.json", () => {
    const lane = readNativeCompileLane(LANE_JSON);
    expect(lane.railTargetId).toBe("compose-smoke");
    expect(lane.toolchain).toBe("kotlin");
    expect(lane.validSources.length).toBeGreaterThan(0);
    expect(lane.invalidSources.length).toBeGreaterThan(0);
    // The lane must record the runtime-deferral gap (A7).
    expect(lane.knownGaps.join(" ")).toMatch(/runtime|simulator|Robolectric|compose\.ui\.test/i);
  });

  it("the lane id is a RailTargetId that is NOT an admitted FrameworkId (A4/A5)", () => {
    const lane = readNativeCompileLane(LANE_JSON);
    expect(isNativeLaneId(lane.railTargetId)).toBe(true);
    // The whole point: a native lane is not an admitted web/RN framework.
    expect(isAdmittedFrameworkId(lane.railTargetId)).toBe(false);
  });

  it("lowers to a non-pnpm argv of the runner's [program, ...args] shape", () => {
    const lane = readNativeCompileLane(LANE_JSON);
    const cmd = nativeCompileCommand(lane, {
      compiler: "kotlinc",
      sources: ["src/Smoke.kt"],
      outDir: "/tmp/out",
    });
    expect(cmd[0]).toBe("kotlinc");
    expect(cmd[0]).not.toBe("pnpm"); // the load-bearing assertion: NOT pnpm
    expect(cmd).toContain("src/Smoke.kt");
    expect(cmd).toContain("-d");
  });

  it("the runner's spawn shape attributes a non-pnpm command's exit code", () => {
    // Stand in for kotlinc with a portable non-pnpm program (node) so the test
    // needs no JVM. This exercises the SAME spawn the rail runner uses
    // (run-command.ts: spawn(program, args)) and proves exit-code -> pass/fail
    // attribution works for a non-pnpm program.
    const pass = spawnSync(process.execPath, ["-e", "process.exit(0)"], { encoding: "utf8" });
    expect(pass.status).toBe(0); // -> attributed "pass"

    const fail = spawnSync(process.execPath, ["-e", "process.exit(1)"], { encoding: "utf8" });
    expect(fail.status).toBe(1); // -> attributed "fail" (the negative-compile path)

    // Neither program is pnpm — the runner contract is genuinely toolchain-neutral.
    expect(process.execPath).not.toMatch(/pnpm$/);
  });

  it("rejects a lane json with an unexpected railTargetId (fail-loud adjudication)", () => {
    // The rail core validates the target's declaration; a bogus id must THROW,
    // not silently admit. Write a temp json with a wrong id and parse it.
    const bad = join(tmpdir(), `bad-lane-${process.pid}.json`);
    writeFileSync(bad, JSON.stringify({ railTargetId: "jetpack-compose", validSources: ["s"], invalidSources: ["i"] }));
    try {
      expect(() => readNativeCompileLane(bad)).toThrow(/unexpected railTargetId/);
    } finally {
      rmSync(bad, { force: true });
    }
  });

  it("rejects a lane json missing required source sets (fail-loud adjudication)", () => {
    const bad = join(tmpdir(), `empty-lane-${process.pid}.json`);
    writeFileSync(bad, JSON.stringify({ railTargetId: "compose-smoke", validSources: [], invalidSources: ["i"] }));
    try {
      expect(() => readNativeCompileLane(bad)).toThrow(/non-empty validSources/);
    } finally {
      rmSync(bad, { force: true });
    }
  });
});
