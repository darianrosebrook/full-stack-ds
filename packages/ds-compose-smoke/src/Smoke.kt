// RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03 — VALID smoke fixture.
//
// This is a hand-authored minimal Kotlin fixture, NOT a generated component.
// Its only job is to prove the rail can execute a real Kotlin compiler and bind
// its exit code as admission evidence. It deliberately uses only the Kotlin
// LANGUAGE (controlled/uncontrolled state hoisting shape, elvis operator,
// nullable handling) — not the Compose/Android RUNTIME — so the compile lane
// needs only `kotlinc` (the smallest stable JVM surface), no Android SDK, no
// emulator, no Compose Material3 artifact resolution.
//
// The shape mirrors what a real Compose emitter would lower a controllable
// channel to (see __golden__/Switch/Switch.compose.kt), minus the @Composable
// annotation and androidx imports, so the toolchain exercises the same language
// constructs the emitter will emit.
package com.fullstackds.smoke

enum class SwitchSize { Sm, Md, Lg }

/**
 * The controlled/uncontrolled resolution a Compose channel lowers to. Uses the
 * Kotlin elvis operator `?:` — the CORRECT operator. The golden uses `??`
 * (C#/Swift null-coalescing), which is invalid Kotlin; the negative fixture
 * (SmokeInvalid.kt) keeps that bug to prove the compiler rejects it.
 */
fun resolveChecked(checked: Boolean?, defaultChecked: Boolean): Boolean {
    return checked ?: defaultChecked
}

/** Token-driven sizing, the `when`-expression a size variant lowers to. */
fun trackWidthDp(size: SwitchSize): Int =
    when (size) {
        SwitchSize.Sm -> 36
        SwitchSize.Md -> 48
        SwitchSize.Lg -> 60
    }

fun main() {
    // Exercise both functions so the compiler can't dead-code-eliminate them
    // and a future broken edit actually fails the lane.
    val checked = resolveChecked(null, defaultChecked = true)
    val width = trackWidthDp(SwitchSize.Md)
    println("compose-smoke ok: checked=$checked trackWidth=${width}dp")
}
