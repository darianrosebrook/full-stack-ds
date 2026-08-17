# ds-jetpack-compose

Generated Jetpack Compose package — the Android counterpart of
`packages/ds-swiftui`. Emits from the same contract corpus via
`pnpm run generate -- --target=jetpack-compose` (explicit-only target;
the `fsds.targets.json` components allowlist currently gates full-corpus
runs to `Switch` and `ToggleSwitch`, lowered through the
`native-toggle-affordance` collapse path onto Material 3's `Switch`).

Not a pnpm workspace package: this is a Gradle build. The components root
is `library/src/main/kotlin/com/fullstackds/components`.

## Declared Android ladder (FEAT-COMPOSE-EMITTER-WIRING-001)

| Rung | Claim | Status |
|---|---|---|
| 1 | Gradle + Compose Multiplatform (JVM) compilation against the **real** `androidx.compose`-compatible runtime — no hand-authored stubs | this slice |
| 2 | Full Android SDK + Gradle compile lane (AGP validation, resource linking, Android Lint) | reserved follow-up |
| 3 | Runtime admission — Robolectric or instrumented `compose.ui.test` | reserved follow-up |

Compile: `./gradlew :library:compileKotlin --no-daemon` (first run
bootstraps the Gradle distribution and Maven artifacts — network required).

## Named non-claims (rung 1)

JVM compilation is **not** Android compilation: no Android resource
linking, no AGP validation, no Android Lint, no emulator/device execution,
no runtime behavioral claims, and JVM artifacts are not Android-compiled
artifacts. No generated test source set. No shared Compose theme/token
module — size values are inline (md contract-token-shaped; sm/lg
framework-grammar defaults pending token-graph coverage).
