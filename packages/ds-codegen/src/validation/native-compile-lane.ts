/**
 * Native compile lane (RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03).
 *
 * A native compile lane is a rail participant whose admission is a NON-pnpm
 * compile command (Kotlin/Gradle today; Swift/xcodebuild later) rather than a
 * `pnpm --filter … run typecheck/test`. It is the slice-3 analogue of a slice-2
 * AdmissionDescriptor, but for a `RailTargetId` that is NOT a `FrameworkId`:
 * the target owns its compile command (in its own package, as data), and the
 * rail core only spawns it and binds the exit code.
 *
 * The load-bearing property this module exists to prove: admitting a non-TS
 * toolchain requires NO Compose/Gradle-specific branch in the rail core. The
 * lane lowers to the SAME `[program, ...args]` argv the web/RN runner already
 * spawns (see run-command.ts: `const [program, ...args] = pc.command`). If this
 * lane needed bespoke runner logic, the toolchain-polymorphic abstraction would
 * be falsified — and that falsification would be visible here, as a special case.
 */
import { readFileSync } from "node:fs";
import type { NativeLaneId, RailTargetId } from "./types.js";

/**
 * The target-owned compile facts a native lane self-declares (in its package's
 * `compile-lane.json`). Declared data only — no executable policy. The rail
 * core reads this and adjudicates; it does not author it.
 */
export interface NativeCompileLane {
  /** A RailTargetId that is NOT a FrameworkId. */
  readonly railTargetId: NativeLaneId;
  /** Toolchain family label (e.g. "kotlin"). Diagnostic only. */
  readonly toolchain: string;
  /** Source dirs (package-relative) whose compile must SUCCEED. */
  readonly validSources: readonly string[];
  /** Source dirs whose compile must FAIL (the compiler-negative proof). */
  readonly invalidSources: readonly string[];
  /** Honest gap declarations, surfaced verbatim. */
  readonly knownGaps: readonly string[];
}

/** Parse + validate a package's self-declared compile-lane.json. */
export function readNativeCompileLane(absJsonPath: string): NativeCompileLane {
  const raw = JSON.parse(readFileSync(absJsonPath, "utf8")) as Record<string, unknown>;
  const id = raw.railTargetId;
  if (id !== "compose-smoke") {
    throw new Error(
      `native compile lane has unexpected railTargetId "${String(id)}" (only "compose-smoke" exists in this slice)`,
    );
  }
  for (const key of ["validSources", "invalidSources"] as const) {
    if (!Array.isArray(raw[key]) || (raw[key] as unknown[]).length === 0) {
      throw new Error(`native compile lane "${id}" must declare a non-empty ${key}`);
    }
  }
  return {
    railTargetId: id,
    toolchain: String(raw.toolchain ?? "unknown"),
    validSources: raw.validSources as string[],
    invalidSources: raw.invalidSources as string[],
    knownGaps: Array.isArray(raw.knownGaps) ? (raw.knownGaps as string[]) : [],
  };
}

/**
 * Build the NON-pnpm compile argv the rail runner spawns for a native lane.
 * This is the exact `[program, ...args]` shape `PlanCommand.command` carries, so
 * it lowers to the existing runner with no new abstraction — `program` is a
 * Kotlin compiler instead of `pnpm`. `negative` selects the must-fail sources.
 */
export function nativeCompileCommand(
  lane: NativeCompileLane,
  opts: { compiler: string; sources: readonly string[]; outDir: string; negative?: boolean },
): readonly [string, ...string[]] {
  // Tie the command to the lane's DECLARED sources: the rail compiles only the
  // source roots the target self-declared (validSources for the positive pass,
  // invalidSources for the negative). A requested source under no declared root
  // is rejected — the rail won't compile bytes the lane didn't own.
  const roots = opts.negative ? lane.invalidSources : lane.validSources;
  for (const s of opts.sources) {
    if (!roots.some((root) => s.includes(root))) {
      throw new Error(
        `native lane "${lane.railTargetId}" requested source "${s}" outside its declared ` +
          `${opts.negative ? "invalidSources" : "validSources"} (${roots.join(", ")})`,
      );
    }
  }
  return [opts.compiler, ...opts.sources, "-d", opts.outDir];
}

/**
 * A native lane id is, by construction, never a FrameworkId. This guard exists
 * so callers can assert the slice invariant (a native lane is NOT an admitted
 * framework) at runtime, mirroring `isAdmittedFrameworkId` for the web set.
 */
export function isNativeLaneId(value: RailTargetId): value is NativeLaneId {
  return value === "compose-smoke";
}
