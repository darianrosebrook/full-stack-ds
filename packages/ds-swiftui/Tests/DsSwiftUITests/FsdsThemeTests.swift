// Regression tests for the FsdsTheme token runtime. Born from the deduper
// consumption pilot: every fallback-only slot resolved nil because the ??
// chains were assigned directly into optional-Value dictionary subscripts
// (FIX-SWIFTUI-TOKEN-RESOLVER-01). These tests fail against the unfixed
// resolver and pin the staged-assignment behavior.
import XCTest
@testable import DsSwiftUI

/// Flatten the double-optional produced by optional-Value dictionary reads.
private func flat(_ value: FsdsTokenValue??) -> FsdsTokenValue? {
    value ?? nil
}

final class FsdsThemeTests: XCTestCase {
    private func fallbackOnlyScopes() -> FsdsComponentTokenScopes {
        [
            "root": [
                "card.color.background.default": FsdsComponentTokenDefinition(
                    cssVar: "--x", name: "card.color.background.default",
                    fallback: .string("#ffffff")
                ),
                "box-model.padding-block-start": FsdsComponentTokenDefinition(
                    cssVar: "--y", name: "box-model.padding-block-start",
                    fallback: .string("8px")
                ),
                "button.text.weight": FsdsComponentTokenDefinition(
                    cssVar: "--z", name: "button.text.weight",
                    literal: .string("500")
                ),
            ],
        ]
    }

    func testFallbackOnlySlotResolvesToFallback() {
        // The headline pilot defect: a nil literal must not short-circuit
        // the chain before fallback is evaluated.
        let resolved = resolveFsdsComponentTokens(fallbackOnlyScopes(), FsdsTheme())
        XCTAssertEqual(
            flat(resolved["root"]?["card.color.background.default"]),
            .string("#ffffff")
        )
    }

    func testLiteralSlotResolves() {
        let resolved = resolveFsdsComponentTokens(fallbackOnlyScopes(), FsdsTheme())
        XCTAssertEqual(flat(resolved["root"]?["button.text.weight"]), .string("500"))
    }

    func testThemeOverrideWins() {
        let theme = FsdsTheme(tokens: ["card.color.background.default": .string("#0000ff")])
        let resolved = resolveFsdsComponentTokens(fallbackOnlyScopes(), theme)
        XCTAssertEqual(
            flat(resolved["root"]?["card.color.background.default"]),
            .string("#0000ff")
        )
    }

    func testLayeredResolutionAppliesVariantOverRoot() {
        let scopes: FsdsComponentTokenScopes = [
            "root": [
                "bg": FsdsComponentTokenDefinition(
                    cssVar: "--r", name: "bg", fallback: .string("#ffffff")
                ),
            ],
            "variant_destructive": [
                "bg": FsdsComponentTokenDefinition(
                    cssVar: "--d", name: "bg", fallback: .string("#d92d2e")
                ),
            ],
        ]
        let base = resolveFsdsLayeredTokens(scopes, FsdsTheme(), layers: ["root"])
        let layered = resolveFsdsLayeredTokens(
            scopes, FsdsTheme(), layers: ["root", "variant_destructive"]
        )
        XCTAssertEqual(flat(base["bg"]), .string("#ffffff"))
        XCTAssertEqual(flat(layered["bg"]), .string("#d92d2e"))
    }

    func testValueAccessorsParsePxAndHex() {
        XCTAssertEqual(FsdsTokenValue.string("8px").px, 8)
        XCTAssertEqual(FsdsTokenValue.string("9999px").px, 9999)
        XCTAssertNotNil(FsdsTokenValue.string("#ffffff").color)
        XCTAssertNil(FsdsTokenValue.string("1rem").px)
        XCTAssertNil(FsdsTokenValue.string("cubic-bezier(0.4, 0, 0.2, 1)").color)
    }

    func testAbsentSlotAndMissingLayerStayUnresolved() {
        let resolved = resolveFsdsComponentTokens(fallbackOnlyScopes(), FsdsTheme())
        XCTAssertNil(flat(resolved["root"]?["not-a-slot"]))
        let layered = resolveFsdsLayeredTokens(
            fallbackOnlyScopes(), FsdsTheme(), layers: ["root", "missing-layer"]
        )
        XCTAssertEqual(flat(layered["box-model.padding-block-start"]), .string("8px"))
    }
}

final class FsdsAdaptiveColorTests: XCTestCase {
    func testAdaptivePickResolvesDarkUnderDarkAquaAndLightOtherwise() {
        // Headless decision-logic coverage; per-appearance rendering is
        // verified visually through the deduper pilot's SettingsPreview.
        let light = NSColor.red
        let dark = NSColor.blue
        XCTAssertEqual(
            FsdsTokenValue.adaptivePick(
                appearance: NSAppearance(named: .aqua)!, light: light, dark: dark
            ),
            light
        )
        XCTAssertEqual(
            FsdsTokenValue.adaptivePick(
                appearance: NSAppearance(named: .darkAqua)!, light: light, dark: dark
            ),
            dark
        )
    }

    func testAdaptivePxIsNilAndStringColorStillParses() {
        XCTAssertNil(FsdsTokenValue.adaptive(light: "#ffffff", dark: "#000000").px)
        XCTAssertNotNil(FsdsTokenValue.string("#ffffff").color)
        XCTAssertNil(FsdsTokenValue.adaptive(light: "not-hex", dark: "#000000").color)
    }
}
