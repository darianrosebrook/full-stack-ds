import XCTest
import SwiftUI
@testable import DsSwiftUI

final class SelectionStateTests: XCTestCase {
    func testSingleModeAppliesReplace() {
        var seen: String?
        let state = SelectionState(defaultSelection: "a", onSelectionChange: { seen = $0 as? String })
        state.apply("b")
        XCTAssertEqual(state.single, "b")
        XCTAssertEqual(seen, "b")
        XCTAssertTrue(state.isSelected("b"))
        XCTAssertFalse(state.isSelected("a"))
    }

    func testMultiModeTogglesMembership() {
        var seen: [String]?
        let state = SelectionState(
            defaultMultipleSelection: ["a"], multiple: true,
            onSelectionChange: { seen = $0 as? [String] }
        )
        state.apply("b")
        XCTAssertEqual(Set(state.multi), Set(["a", "b"]))
        state.apply("a")
        XCTAssertEqual(state.multi, ["b"])
        XCTAssertEqual(seen, ["b"])
        XCTAssertTrue(state.isSelected("b"))
        XCTAssertFalse(state.isSelected("a"))
    }

    func testControlledSelectionsWriteThrough() {
        var upstreamSingle = "old"
        var upstreamMulti: [String] = []
        let state = SelectionState(
            selection: Binding(get: { upstreamSingle }, set: { upstreamSingle = $0 }),
            multipleSelection: Binding(get: { upstreamMulti }, set: { upstreamMulti = $0 }),
            multiple: true
        )
        state.apply("x")
        XCTAssertEqual(upstreamMulti, ["x"])
        state.apply("x")
        XCTAssertEqual(upstreamMulti, [])
    }
}
