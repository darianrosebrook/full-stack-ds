# ds-swift-smoke

A minimal Swift smoke package whose **only** purpose is to prove the admission
rail carries a **second** non-pnpm, target-owned compile command — a different
compiler family (Swift) than the first native lane (Kotlin), through the **same**
abstraction (RAIL-NATIVE-COMPILE-LANE-SWIFT-SMOKE-04, slice 4 of the
toolchain-polymorphic rail arc).

This is **not** a SwiftUI framework target. It admits no component, emits
nothing, registers in no `fsds.targets.json`, and is **not** a `FrameworkId`. It
is a `RailTargetId` compile lane and nothing more. Its existence is the
falsification test for slice 3: if admitting Swift required a Kotlin-vs-Swift
branch anywhere in the rail core or the runner, the abstraction would be
Kotlin-accommodating, not native-compile-polymorphic. It does not — the lane
registry (`NATIVE_LANE_IDS`) grew by one id; no compiler-family branch was added.

## What it proves

| Claim | Fixture | Expected |
|---|---|---|
| The Swift toolchain is genuinely active (compile-positive) | `src/Smoke.swift` | compiles, exit 0 |
| Compile-admission catches what byte-stability cannot (compile-negative) | `src-invalid/SmokeInvalid.swift` | **fails**, exit 1 |

The negative fixture is the **mirror image** of the compose-smoke negative. There,
`??` is C#/Swift null-coalescing and invalid Kotlin. Here, `?:` is Kotlin's elvis
operator and **invalid Swift** (Swift's nil-coalescing operator is `??`). `swiftc`
rejects it with `error: expected expression after '?' in ternary expression`.
`git diff --exit-code` over a `.swift` tree would pass that bug; a real compiler
rejects it. That is the whole point — **byte-stability is not compilation** — now
proven for a second compiler family.

## Smallest stable surface

The lane needs only the Swift compiler (`swiftc`) — **no** Xcode project, **no**
SwiftPM dependency graph, **no** simulator, **no** XCUITest. The valid fixture
uses only Swift **language** constructs (optionals, nil-coalescing, `enum`
`switch`) that a real SwiftUI emitter lowers to — not the SwiftUI **runtime**.
Runtime admission (simulator / XCUITest / SwiftUI `View` evaluation) and a
generated SwiftUI emitter are explicitly deferred to later slices.

Because `swiftc` requires macOS, this lane runs in its own `native-compile-rail-swift`
CI job on a `macos-*` runner. The Kotlin lane (`native-compile-rail`) stays on
`ubuntu-latest` and does **not** depend on macOS.

## How the rail runs it

The compile command is declared as target-owned data in `compile-lane.json` (a
non-pnpm argv, including the `compiler` executable and `sourceExtension`) and
executed by `scripts/run-native-compile-lane.mjs` through the same spawn-based
rail runner the web/RN plans use — the rail core gains no Swift/Xcode-specific
branch. The runner selects the package, compiler, and source extension from the
lane's declared facts, so it is family-neutral.

```
node scripts/run-native-compile-lane.mjs --lane swift-smoke --compiler <path-to-swiftc>            # positive: exit 0
node scripts/run-native-compile-lane.mjs --lane swift-smoke --compiler <path-to-swiftc> --negative  # negative: exit 0 IFF the compile failed
```

In CI the `native-compile-rail-swift` job provisions Swift on macOS and runs both
passes.
