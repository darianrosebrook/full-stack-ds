# ds-compose-smoke

A minimal Gradle/Kotlin smoke package whose **only** purpose is to prove the
admission rail can execute and attribute a **non-pnpm, target-owned compile
command** under CI (RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03, slice 3 of the
toolchain-polymorphic rail arc).

This is **not** a Jetpack Compose framework target. It admits no component, emits
nothing, registers in no `fsds.targets.json`, and is **not** a `FrameworkId`. It
is a `RailTargetId` compile lane and nothing more.

## What it proves

| Claim | Fixture | Expected |
|---|---|---|
| The Kotlin toolchain is genuinely active (compile-positive) | `src/Smoke.kt` | compiles, exit 0 |
| Compile-admission catches what byte-stability cannot (compile-negative) | `src-invalid/SmokeInvalid.kt` | **fails**, exit 1 |

The negative fixture carries the exact bug in the hand-authored golden
`packages/ds-codegen/__golden__/Switch/Switch.compose.kt` line 67: the `??`
operator (C#/Swift null-coalescing), which is invalid Kotlin (`?:` is the elvis
operator). `git diff --exit-code` over a `.kt` tree would pass that bug; a real
compiler rejects it. That is the whole point — **byte-stability is not
compilation.**

## Smallest stable surface

The lane needs only the Kotlin compiler (`kotlinc`) and a JDK — **no** Android
SDK, **no** emulator, **no** Compose Material3 artifact resolution, **no**
runtime UI test harness. The valid fixture uses only Kotlin **language**
constructs (the controlled/uncontrolled state-hoisting shape, `when` size
mapping, the elvis operator) that a real Compose emitter lowers to — not the
`androidx.compose.*` **runtime**. Runtime admission (Robolectric /
`compose.ui.test`) is explicitly deferred to a later slice.

## How the rail runs it

The compile command is declared as target-owned data in
`compile-lane.json` (a non-pnpm argv) and executed by
`scripts/run-native-compile-lane.mjs` through the same spawn-based rail runner
the web/RN plans use — the rail core gains no Compose/Gradle-specific branch.

```
node scripts/run-native-compile-lane.mjs --kotlinc <path-to-kotlinc>            # positive: exit 0
node scripts/run-native-compile-lane.mjs --kotlinc <path-to-kotlinc> --negative  # negative: exit 0 IFF the compile failed
```

In CI the `native-compile-rail` job provisions a pinned JDK + Kotlin compiler and
runs both passes.
