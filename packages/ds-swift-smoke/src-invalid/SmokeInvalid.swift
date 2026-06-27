// RAIL-NATIVE-COMPILE-LANE-SWIFT-SMOKE-04 — NEGATIVE smoke fixture.
//
// This file is INTENTIONALLY invalid Swift. It lives in a separate src-invalid/
// directory so it is NEVER part of the valid compile target — the lane compiles
// it ONLY in its negative pass, where a non-zero exit is the REQUIRED outcome.
//
// The bug is the mirror image of the compose-smoke negative fixture. There, the
// `??` operator is C#/Swift and INVALID Kotlin. Here, `?:` is Kotlin's elvis
// operator and INVALID Swift — Swift's nil-coalescing operator is `??`. swiftc
// rejects `?:` with a parse/type error and exits non-zero. git-diff
// byte-stability cannot catch this — only a real compiler can. This fixture is
// the standing proof, for the Swift family, that "the bytes are stable" is not
// "the bytes compile."

func resolveCheckedBroken(_ checked: Bool?, defaultChecked: Bool) -> Bool {
    // Invalid: `?:` is Kotlin's elvis operator, not Swift. swiftc rejects this.
    return checked ?: defaultChecked
}
