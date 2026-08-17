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

## Runtime verification findings (2026-08-16, manual run)

First execution of the lane (`./gradlew run`, ~22-minute session, clean
exit 0, zero exceptions in the terminal; interaction log captured
`settings: save profile` ×14 and `settings: delete account` ×1). This run
is the first runtime tier the Compose target has ever had.

**Confirmed working:**

- Controlled toggle round-trip: both FSDS Switch rows flip, fill, and
  persist state across repeated clicks — the controlled `checked`/`onChange`
  hoisting holds at runtime (the exact bug class compilation cannot see).
- Component interaction state is stable: no resetting of already-set state
  when other components change or dialogs open/close.
- Stress-resilient: rapid toggling, rapid dialog open/close, and rapid
  delete-clicking produced no crash or error across the session.
- Keyboard traversal (Tab / Shift-Tab) moves forward and backward across
  all controls.
- Form fields accept input and grow with content without viewport overflow.

**Findings:**

1. ~~Body did not scroll — content below the fold was unreachable when the
   window was smaller than the content (had to enlarge the window to see
   the danger zone).~~ **Fixed by `FIX-EXAMPLES-COMPOSE-SETTINGS-SCROLL-001`**
   (root `Column` now wraps in `verticalScroll`, mirroring the swift lane's
   `ScrollView`).
2. **Open — colors diverge from the other lanes**: FSDS components render
   Material 3 purple defaults (vs. e.g. the react lane's blue primary).
   Root cause: the jetpack-compose package has no theme/token module yet —
   the generated Switch falls back to `SwitchDefaults.colors()`, and the web
   lanes' equivalent fidelity comes from `@full-stack-ds/*/styles.css`, swift
   from its `FsdsTheme` runtime. This is the reserved compose-theme slice
   (the rung-1 non-claim made visible); not to be worked around in the lane.
3. **Open — stock Material chrome throughout**: the `NOT FSDS` regions are
   plain material3 by design (ledgered above), and the FSDS regions' untokened
   surfaces share that stock appearance for the same root cause as finding 2.

**Expectation note**: the "Dark mode" switch updates local state only — it
does not re-theme the app. Theming is out of scope in `../spec.md` (same
behavior as the react lane).
