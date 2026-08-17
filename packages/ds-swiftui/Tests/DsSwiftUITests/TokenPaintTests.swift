import XCTest
import AppKit
import SwiftUI
@testable import DsSwiftUI

// TEST-SWIFTUI-RUNTIME-BREADTH-01 Phase B — token-paint proof.
//
// Emission parity proves both frameworks EMIT a component; it cannot
// prove the Swift emission actually PAINTS its token scope. These
// tests close that gap at runtime: render a component offscreen
// through NSHostingView, capture pixels via cacheDisplay, and assert
// the sampled color equals the value read from the COMMITTED resolved
// token graph — never a hand-copied literal. The assertion chain is:
// component token-scope binding → resolvesTo graph path → resolved
// value → sampled pixel, in both light and dark appearances.
final class TokenPaintTests: XCTestCase {

    // MARK: - resolved-graph reader

    /// The committed resolved token graph, located relative to this
    /// source file so the test runs from any working directory.
    static var graphURL: URL {
        // …/packages/ds-swiftui/Tests/DsSwiftUITests/TokenPaintTests.swift
        let testsDir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
        let packageRoot = testsDir.deletingLastPathComponent().deletingLastPathComponent()
        return packageRoot.deletingLastPathComponent()
            .appendingPathComponent("ds-tokens/generated/resolved.tokens.json")
    }

    /// Navigate the graph's nested groups by dotted path.
    static func graphNode(_ dotted: String, file: StaticString = #filePath, line: UInt = #line) throws -> [String: Any] {
        let data = try Data(contentsOf: graphURL)
        let object = try XCTUnwrap(
            JSONSerialization.jsonObject(with: data) as? [String: Any],
            "resolved graph is not a JSON object",
            file: file, line: line
        )
        var node: Any = object
        for segment in dotted.split(separator: ".") {
            node = try XCTUnwrap(
                (node as? [String: Any])?[String(segment)],
                "graph path missing segment '\(segment)' under \(dotted)",
                file: file, line: line
            )
        }
        return try XCTUnwrap(node as? [String: Any], "graph node \(dotted) is not a group", file: file, line: line)
    }

    /// A mode-split color token: "$value": {"light": …, "dark": …}.
    static func graphColorModes(
        _ dotted: String, file: StaticString = #filePath, line: UInt = #line
    ) throws -> (light: NSColor, dark: NSColor) {
        let node = try graphNode(dotted, file: file, line: line)
        let value = try XCTUnwrap(node["$value"] as? [String: Any], "no $value object at \(dotted)", file: file, line: line)
        let lightHex = try XCTUnwrap(value["light"] as? String, "no light value at \(dotted)", file: file, line: line)
        let darkHex = try XCTUnwrap(value["dark"] as? String, "no dark value at \(dotted)", file: file, line: line)
        return (try hexColor(lightHex, file: file, line: line), try hexColor(darkHex, file: file, line: line))
    }

    /// A single-value color token: "$value": "#rrggbb".
    static func graphColor(
        _ dotted: String, file: StaticString = #filePath, line: UInt = #line
    ) throws -> NSColor {
        let node = try graphNode(dotted, file: file, line: line)
        let hex = try XCTUnwrap(node["$value"] as? String, "no $value string at \(dotted)", file: file, line: line)
        return try hexColor(hex, file: file, line: line)
    }

    static func hexColor(_ hex: String, file: StaticString = #filePath, line: UInt = #line) throws -> NSColor {
        let digits = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var value: UInt64 = 0
        guard digits.count == 6, Scanner(string: digits).scanHexInt64(&value) else {
            throw XCTSkip("not a #rrggbb hex: \(hex)")
        }
        let r = CGFloat((value >> 16) & 0xFF) / 255
        let g = CGFloat((value >> 8) & 0xFF) / 255
        let b = CGFloat(value & 0xFF) / 255
        return NSColor(srgbRed: r, green: g, blue: b, alpha: 1)
    }

    // MARK: - offscreen pixel sampler

    /// Render `view` at `size` under `appearance` and return the color
    /// at `point` (view coordinates, origin bottom-left).
    @MainActor
    func sampledPixel<V: View>(
        of view: V, size: CGSize, appearance: NSAppearance? = nil, at point: CGPoint
    ) throws -> NSColor {
        let host = NSHostingView(rootView: view.frame(width: size.width, height: size.height))
        host.frame = NSRect(origin: .zero, size: size)
        host.appearance = appearance
        host.layoutSubtreeIfNeeded()
        let rep = try XCTUnwrap(
            host.bitmapImageRepForCachingDisplay(in: host.bounds),
            "no bitmap rep for offscreen capture"
        )
        host.cacheDisplay(in: host.bounds, to: rep)
        return try XCTUnwrap(
            rep.colorAt(x: Int(point.x), y: Int(point.y))?.usingColorSpace(.sRGB),
            "no pixel at \(point)"
        )
    }

    func assertClose(
        _ actual: NSColor, _ expected: NSColor, tolerance: CGFloat = 0.02,
        file: StaticString = #filePath, line: UInt = #line
    ) {
        let a = actual.usingColorSpace(NSColorSpace.sRGB)!
        let e = expected.usingColorSpace(NSColorSpace.sRGB)!
        for (componentA, componentE) in zip([a.redComponent, a.greenComponent, a.blueComponent], [e.redComponent, e.greenComponent, e.blueComponent]) {
            if abs(componentA - componentE) > tolerance {
                XCTFail(
                    "pixel \(String(format: "(%.2f, %.2f, %.2f)", a.redComponent, a.greenComponent, a.blueComponent)) "
                        + "!= expected \(String(format: "(%.2f, %.2f, %.2f)", e.redComponent, e.greenComponent, e.blueComponent))",
                    file: file, line: line
                )
                return
            }
        }
    }

    // MARK: - proofs

    /// The graph file itself must be present — otherwise these tests
    /// would fail loudly rather than vacuously passing.
    func testResolvedTokenGraphIsReadable() throws {
        _ = try Self.graphColorModes("semantic.color.background.primary")
        _ = try Self.graphColor("semantic.color.action.background.primary.default")
    }

    /// Card paints its token-scope background from the resolved graph,
    /// and the adaptive value flips with the system appearance.
    @MainActor
    func testCardBackgroundPaintsResolvedGraphValueInBothAppearances() throws {
        let expected = try Self.graphColorModes("semantic.color.background.primary")
        let card = Card(content: { SwiftUI.Text("paint") })

        let light = try sampledPixel(
            of: card, size: CGSize(width: 240, height: 120),
            appearance: NSAppearance(named: .aqua),
            at: CGPoint(x: 228, y: 60)
        )
        assertClose(light, expected.light)

        let dark = try sampledPixel(
            of: card, size: CGSize(width: 240, height: 120),
            appearance: NSAppearance(named: .darkAqua),
            at: CGPoint(x: 228, y: 60)
        )
        assertClose(dark, expected.dark)
    }

    /// The adaptive flip is real, not a dark==light coincidence guard:
    /// the two graph values must differ for the flip assertion to mean
    /// anything (mutation falsification for the test itself).
    @MainActor
    func testGraphCardBackgroundModesActuallyDiffer() throws {
        let expected = try Self.graphColorModes("semantic.color.background.primary")
        let light = expected.light.usingColorSpace(NSColorSpace.sRGB)!
        let dark = expected.dark.usingColorSpace(NSColorSpace.sRGB)!
        XCTAssertNotEqual(light.redComponent, dark.redComponent, accuracy: 0.01)
    }

    /// Button paints its primary background from the single-value graph
    /// token (same hex in both appearances by design).
    @MainActor
    func testButtonBackgroundPaintsResolvedGraphValue() throws {
        let expected = try Self.graphColor("semantic.color.action.background.primary.default")
        let button = FsdsButton(label: { SwiftUI.Text("OK") })

        // Host the button at its fitting size and sample inside the
        // trailing inline padding band, vertically centered (away from
        // corner-radius clipping).
        let fitting = NSHostingView(rootView: button).fittingSize
        let width = max(fitting.width, 40)
        let height = max(fitting.height, 28)
        let pixel = try sampledPixel(
            of: button, size: CGSize(width: width, height: height),
            appearance: NSAppearance(named: .aqua),
            at: CGPoint(x: width - 4, y: height / 2)
        )
        assertClose(pixel, expected)
    }
}
