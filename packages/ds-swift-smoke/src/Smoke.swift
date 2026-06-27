// RAIL-NATIVE-COMPILE-LANE-SWIFT-SMOKE-04 — VALID smoke fixture.
//
// This is a hand-authored minimal Swift fixture, NOT a generated component.
// Its only job is to prove the rail can execute a real Swift compiler (swiftc)
// and bind its exit code as admission evidence. It deliberately uses only the
// Swift LANGUAGE (optionals, nil-coalescing, switch over an enum) — not SwiftUI
// or any Apple UI RUNTIME — so the compile lane needs only `swiftc` (the
// smallest stable Swift surface), no Xcode project, no SwiftPM graph, no
// simulator, no XCUITest.
//
// The shape mirrors what a real SwiftUI emitter would lower a controllable
// channel + size variant to, minus the `View`/`@State` machinery, so the
// toolchain exercises the same language constructs the emitter will emit. It is
// the Swift analogue of packages/ds-compose-smoke/src/Smoke.kt.

enum SwitchSize {
    case sm
    case md
    case lg
}

/// The controlled/uncontrolled resolution a SwiftUI channel lowers to. Uses the
/// Swift nil-coalescing operator `??` — the CORRECT Swift operator (the very
/// operator that is INVALID in Kotlin, where the compose-smoke negative fixture
/// keeps it to fail kotlinc). The Swift negative fixture (src-invalid) instead
/// uses Kotlin's elvis `?:`, which is invalid Swift.
func resolveChecked(_ checked: Bool?, defaultChecked: Bool) -> Bool {
    return checked ?? defaultChecked
}

/// Token-driven sizing, the `switch`-expression a size variant lowers to.
func trackWidthDp(_ size: SwitchSize) -> Int {
    switch size {
    case .sm: return 36
    case .md: return 48
    case .lg: return 60
    }
}

// Exercise both functions so the compiler can't dead-code-eliminate them and a
// future broken edit actually fails the lane.
let checked = resolveChecked(nil, defaultChecked: true)
let width = trackWidthDp(.md)
print("swift-smoke ok: checked=\(checked) trackWidth=\(width)dp")
