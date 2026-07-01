/**
 * Native compile lane (RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03,
 * generalized to a second compiler family by
 * RAIL-NATIVE-COMPILE-LANE-SWIFT-SMOKE-04).
 *
 * A native compile lane is a rail participant whose admission is a NON-pnpm
 * compile command (Kotlin today, Swift today; others later) rather than a
 * `pnpm --filter … run typecheck/test`. It is the slice-3 analogue of a slice-2
 * AdmissionDescriptor, but for a `RailTargetId` that is NOT a `FrameworkId`:
 * the target owns its compile command (in its own package, as data), and the
 * rail core only spawns it and binds the exit code.
 *
 * The load-bearing property this module exists to prove: admitting a non-TS
 * toolchain requires NO compiler-family-specific branch in the rail core. The
 * lane lowers to the SAME `[program, ...args]` argv the web/RN runner already
 * spawns (see run-command.ts: `const [program, ...args] = pc.command`). The
 * compiler executable and source extension are READ from the target's declared
 * facts — not switched on by family. Adding Swift beside Kotlin must therefore
 * grow the lane registry (NATIVE_LANE_IDS), not introduce an `if swift` branch.
 * If a second family needed bespoke runner logic, the toolchain-polymorphic
 * abstraction would be falsified — and that falsification would be visible here.
 */
import { readFileSync } from "node:fs";
import { NATIVE_LANE_IDS, type NativeLaneId, type RailTargetId } from "./types.js";

/**
 * The target-owned compile facts a native lane self-declares (in its package's
 * `compile-lane.json`). Declared data only — no executable policy. The rail
 * core reads this and adjudicates; it does not author it.
 */
export interface NativeCompileLane {
  /** A RailTargetId that is NOT a FrameworkId. */
  readonly railTargetId: NativeLaneId;
  /** Toolchain family label (e.g. "kotlin", "swift"). Diagnostic only. */
  readonly toolchain: string;
  /**
   * The compiler executable the runner spawns (e.g. "kotlinc", "swiftc"). A
   * target-owned fact, so the runner selects the program from DATA rather than
   * a compiler-family branch. A default may still be overridden by the runner's
   * CLI flag (CI provisions a pinned absolute path), but the lane declares the
   * canonical name so the family is never hardcoded in the rail core.
   */
  readonly compiler: string;
  /**
   * The source-file extension (including the dot, e.g. ".kt", ".swift") the
   * runner collects for compilation. Target-owned so the runner never hardcodes
   * `.kt` — it compiles whatever the lane declares its sources to be.
   */
  readonly sourceExtension: string;
  /**
   * The compiler's output flag (e.g. "-d" for kotlinc's output directory, "-o"
   * for swiftc's output executable). Target-owned so the runner appends the
   * right flag from DATA rather than switching on compiler family — a third
   * family declares its own flag, no branch added.
   */
  readonly outputFlag: string;
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
  // Set-membership over the lane registry, NOT a per-family `=== "compose-smoke"`
  // branch: adding a compiler family grows NATIVE_LANE_IDS, nothing here.
  if (typeof id !== "string" || !(NATIVE_LANE_IDS as readonly string[]).includes(id)) {
    throw new Error(
      `native compile lane has unexpected railTargetId "${String(id)}" ` +
        `(known native lanes: ${NATIVE_LANE_IDS.join(", ")})`,
    );
  }
  for (const key of ["validSources", "invalidSources"] as const) {
    if (!Array.isArray(raw[key]) || (raw[key] as unknown[]).length === 0) {
      throw new Error(`native compile lane "${id}" must declare a non-empty ${key}`);
    }
  }
  for (const key of ["compiler", "sourceExtension", "outputFlag"] as const) {
    if (typeof raw[key] !== "string" || (raw[key] as string).length === 0) {
      throw new Error(`native compile lane "${id}" must declare a non-empty ${key}`);
    }
  }
  return {
    railTargetId: id as NativeLaneId,
    toolchain: String(raw.toolchain ?? "unknown"),
    compiler: raw.compiler as string,
    sourceExtension: raw.sourceExtension as string,
    outputFlag: raw.outputFlag as string,
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
 * Checks membership in the lane registry, so a new compiler family is admitted
 * by editing NATIVE_LANE_IDS — never by extending a per-family disjunction here.
 */
export function isNativeLaneId(value: RailTargetId): value is NativeLaneId {
  return (NATIVE_LANE_IDS as readonly string[]).includes(value);
}
