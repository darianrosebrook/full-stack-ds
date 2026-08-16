# Compose Settings Example

A desktop (JVM) Compose consumer lane for the generated
`packages/ds-jetpack-compose` package. It realizes the framework-neutral
`../spec.md` against whatever the jetpack-compose target currently emits,
and is the consumer-side falsification surface for the package boundary:
the app compiles only through `import com.fullstackds.components.*` public
exports, reached via Gradle composite-build substitution
(`includeBuild("../../../packages/ds-jetpack-compose")`).

This lane is the Compose twin of `../swift/` (compile-only consumer
evidence escalated one rung: CI compiles the full Gradle graph including
the generated package — the `native-compile-rail` job's settings-lane
step — and it is locally runnable: `./gradlew run` opens the settings
window for visual inspection).

## Claim

A desktop Compose app can consume the generated ds-jetpack-compose package
via composite build and compose the settings spec's Preferences rows — both
toggle rows through the generated `Switch` (controlled `checked` +
`onChange` per the contract channel; defaults false/true per spec, the
tooltip hint carried via the public `contentDescription` prop).

## Partial-realization ledger (NOT FSDS regions)

Only `Switch`/`ToggleSwitch` exist on the jetpack-compose target today
(`FEAT-COMPOSE-EMITTER-WIRING-001`, rung 1 of the declared Android
ladder). Every other spec region is composed from plain Compose and marked
`NOT FSDS` in source so the boundary stays visible:

| Spec region | Realized through | Status |
|---|---|---|
| Preferences rows | `com.fullstackds.components.switch.Switch` | **FSDS** |
| Profile form (Field/Input/Button) | material3 `OutlinedTextField`/`Button` | NOT FSDS — inputs/actions not yet emitted |
| Tooltip hint | `contentDescription` prop on FSDS Switch | degraded — Tooltip not yet emitted |
| Danger zone (Dialog) | material3 `AlertDialog` | NOT FSDS — surface class not yet emitted |
| Card section chrome | material3 `Card` | NOT FSDS — composer path not yet emitted |
| Stack layout | Compose `Column`/`Row` | NOT FSDS — Stack primitive not yet ported |

## Commands

- Compile (the CI admission): `./gradlew compileKotlin --no-daemon`
- Run (local visual inspection): `./gradlew run`

## Non-claims

Compile-only consumer evidence on the JVM rung: no Android device or
emulator, no runtime UI assertions, no screenshot baselines, and JVM
artifacts are not Android artifacts. The `NOT FSDS` regions are fallbacks,
not parity claims.
