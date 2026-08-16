import XCTest
import SwiftUI
@testable import DsSwiftUI

final class GlyphTests: XCTestCase {
    // Real path data from packages/ds-iconography/icons/Alarm (24px variant).
    let alarm24: [(String, CGFloat)] = [
        ("M12 5A8 8 0 1 1 12 21A8 8 0 1 1 12 5", 1.5),
        ("M12 9V13L14 15", 1.5),
        ("M5 3L2 6M19 3L22 6M6.38 18.7L4 21M17.64 18.67L20 21", 1.5),
    ]

    func testAlarmGlyphParsesWithCorrectBounds() {
        for (d, _) in alarm24 {
            let path = SVGPath.parse(d)
            let bounds = path.boundingRect
            XCTAssertFalse(bounds.isEmpty, "path for \(d) should not be empty")
            XCTAssertGreaterThanOrEqual(bounds.minX, -1, "within viewBox tolerance")
            XCTAssertLessThanOrEqual(bounds.maxX, 25, "within viewBox tolerance")
            XCTAssertGreaterThanOrEqual(bounds.minY, -1)
            XCTAssertLessThanOrEqual(bounds.maxY, 25)
        }
    }

    func testCircleArcClosesBackOnStart() {
        // The clock face is two half arcs starting/ending at (12,5) — the
        // converted Béziers should return the pen to the start point.
        let path = SVGPath.parse("M12 5A8 8 0 1 1 12 21A8 8 0 1 1 12 5")
        let bounds = path.boundingRect
        XCTAssertEqual(bounds.width, 16, accuracy: 0.35, "8pt radius circle ⇒ ~16 wide")
        XCTAssertEqual(bounds.height, 16, accuracy: 0.35, "8pt radius circle ⇒ ~16 tall")
        XCTAssertEqual(bounds.midX, 12, accuracy: 0.2)
        XCTAssertEqual(bounds.midY, 13, accuracy: 0.2)
    }

    func testRelativeAndHorizontalVerticalForms() {
        let path = SVGPath.parse("m2 2h4v4h-4z")
        let b = path.boundingRect
        XCTAssertEqual(b.width, 4, accuracy: 0.001)
        XCTAssertEqual(b.height, 4, accuracy: 0.001)
    }
}

final class GlyphCatalogTests: XCTestCase {
    func testCatalogContainsAlarmWithBothGrids() {
        let grids = GlyphCatalog.variants["alarm"]?.keys.sorted()
        XCTAssertEqual(grids, [16, 24])
        let variant = GlyphCatalog.variants["alarm"]?[24]
        XCTAssertEqual(variant?.viewBox, 24)
        XCTAssertEqual(variant?.paths.count, 3)
    }

    func testDecorativeDefaultsCarryCatalogSemantics() {
        // decorativeDefault: true is the corpus convention — spot-check a
        // known glyph and the flag's existence as a set.
        XCTAssertTrue(GlyphCatalog.decorativeDefaults.contains("alarm"))
        XCTAssertFalse(GlyphCatalog.decorativeDefaults.isEmpty)
    }
}
