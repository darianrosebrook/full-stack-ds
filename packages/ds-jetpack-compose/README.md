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

## Token runtime (FEAT-COMPOSE-THEME-MODULE-001)

The package ships a hand-authored theme module,
`com.fullstackds.tokens.FsdsTheme` (beside the generated components,
mirroring the React Native normal form): a `LocalFsdsTheme` composition
local, scope-data resolution `literal → theme.tokens[ref] → fallback`,
dp/color accessors, a light-half semantic-defaults table derived from the
token graph, and an `fsdsMaterialColorScheme()` Material 3 bridge. The
emitter ships per-component scope data (`<Name>TokenScopes`), and the
native-toggle path resolves its checked/unchecked track+thumb colors and
default (md) dims through the theme — install
`FsdsThemeProvider(FsdsSemanticDefaults.light)` plus the bridge to render
graph colors (as the settings example lane does).

## Named non-claims (rung 1)

JVM compilation is **not** Android compilation: no Android resource
linking, no AGP validation, no Android Lint, no emulator/device execution,
no runtime behavioral claims, and JVM artifacts are not Android-compiled
artifacts. No generated test source set. Switch sm/lg track dims remain
inline framework-grammar defaults pending token-graph coverage (md
resolves through the theme).
