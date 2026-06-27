// RAIL-NATIVE-COMPILE-LANE-COMPOSE-SMOKE-03 — NEGATIVE smoke fixture.
//
// This file is INTENTIONALLY invalid Kotlin. It lives in a separate src-invalid/
// directory so it is NEVER part of the valid compile target — the lane compiles
// it ONLY in its negative pass, where a non-zero exit is the REQUIRED outcome.
//
// The bug is the exact one in the hand-authored golden
// __golden__/Switch/Switch.compose.kt line 67: the `??` null-coalescing
// operator. `??` is C#/Swift; Kotlin's operator is the elvis `?:`. git-diff
// byte-stability cannot catch this — only a real compiler can. This fixture is
// the standing proof that "the bytes are stable" is not "the bytes compile."
package com.fullstackds.smoke

fun resolveCheckedBroken(checked: Boolean?, defaultChecked: Boolean): Boolean {
    // Invalid: `??` is not a Kotlin operator. kotlinc rejects this with a
    // syntax error ("Unexpected tokens"), exit code 1.
    return checked ?? defaultChecked
}
