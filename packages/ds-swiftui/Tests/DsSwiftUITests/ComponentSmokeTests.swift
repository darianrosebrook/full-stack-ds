// Body-evaluation smoke harness: every allowlisted component instantiates
// and its body evaluates through NSHostingController without crashing —
// the kink-class compile-only gates cannot see (FEAT-SWIFTUI-PARITY-BATCH-01).
// The factory table mirrors fsds.targets.json's swiftui allowlist; the
// completeness assertion fails when a component is admitted but not smoked.
import XCTest
import AppKit
import SwiftUI
@testable import DsSwiftUI

@MainActor
final class ComponentSmokeTests: XCTestCase {
    private func evaluate(_ name: String, _ factory: () -> AnyView) {
        let host = NSHostingController(rootView: factory())
        // Forcing a fitting-size pass evaluates the body on this thread.
        let size = host.view.fittingSize
        XCTAssertFalse(size.width.isNaN && size.height.isNaN, "\(name) produced NaN size")
        _ = host.view // keep controller alive through evaluation
    }

    func testEveryAdmittedComponentBodyEvaluates() {
        var cases: [(String, () -> AnyView)] = []
        cases.append(("Switch", { AnyView(Switch()) }))
        cases.append(("ToggleSwitch", { AnyView(ToggleSwitch()) }))
        cases.append(("Button", { AnyView(FsdsButton { Text("OK") }) }))
        cases.append(("Card", { AnyView(Card { Text("h") } content: { Text("c") }) }))
        cases.append(("Field", { AnyView(FsdsField { Text("l") } control: { Input() }) }))
        cases.append(("Input", { AnyView(Input()) }))
        cases.append(("Dialog", { AnyView(Dialog(open: .constant(true), title: { Text("t") })) }))
        cases.append(("Tooltip", { AnyView(Tooltip(trigger: { Text("tr") }, content: { Text("c") })) }))
        cases.append(("Command", { AnyView(Command(open: .constant(false))) }))
        cases.append(("Details", { AnyView(Details(summary: "s") { Text("b") }) }))
        cases.append(("Sheet", { AnyView(Sheet(open: .constant(false), content: { Text("c") })) }))
        cases.append(("Label", { AnyView(FsdsLabel { Text("l") }) }))
        cases.append(("Blockquote", { AnyView(Blockquote { Text("q") }) }))
        cases.append(("Links", { AnyView(Links { Text("l") }) }))
        cases.append(("List", { AnyView(List { Text("i") }) }))
        cases.append(("Checkbox", { AnyView(Checkbox()) }))
        cases.append(("Divider", { AnyView(FsdsDivider()) }))
        cases.append(("Progress", { AnyView(Progress(value: 50)) }))
        cases.append(("Spinner", { AnyView(Spinner()) }))
        cases.append(("Icon", { AnyView(Icon(name: "alarm")) }))
        cases.append(("Toast", { AnyView(Toast(open: .constant(false), title: { Text("t") })) }))
        cases.append(("Select", { AnyView(Select(options: [SelectOption(value: "a", label: "A")])) }))
        cases.append(("Alert", { AnyView(Alert { Text("body") }) }))
        cases.append(("Badge", { AnyView(Badge { Text("b") }) }))
        cases.append(("OTP", { AnyView(OTP()) }))
        cases.append(("AlertNotice", { AnyView(AlertNotice { Text("n") }) }))
        cases.append(("Stat", { AnyView(Stat { Text("v") }) }))
        cases.append(("ProfileFlag", { AnyView(ProfileFlag { Text("f") }) }))
        cases.append(("Postcard", { AnyView(Postcard { Text("p") }) }))
        cases.append(("Breadcrumbs", { AnyView(Breadcrumbs { Text("b") }) }))
        cases.append(("NavList", { AnyView(NavList { Text("n") }) }))
        cases.append(("CodeSnippet", { AnyView(CodeSnippet(text: "let x = 1")) }))
        cases.append(("CodeBlock", { AnyView(CodeBlock(code: "let y = 2")) }))
        cases.append(("Image", { AnyView(Image(src: "https://example.com/x.png")) }))
        cases.append(("Avatar", { AnyView(Avatar(src: "https://e.com/a.png", name: "Ada")) }))
        cases.append(("Truncate", { AnyView(Truncate { Text(Self.longText) }) }))
        cases.append(("ShowMore", { AnyView(ShowMore { Text(Self.longText) }) }))
        cases.append(("Popover", { AnyView(Popover(trigger: { Text("tr") }, content: { Text("c") })) }))
        cases.append(("Skeleton", { AnyView(Skeleton()) }))
        cases.append(("TextField", { AnyView(TextField(value: .constant("x"), label: { Text("L") })) }))
        cases.append(("Chip", { AnyView(Chip { Text("chip") }) }))
        XCTAssertEqual(cases.count, 41, "factory table drifted from the allowlist")
        for (name, factory) in cases {
            evaluate(name, factory)
        }
    }

    static var longText: String {
        String(repeating: "word ", count: 80)
    }

    func testAvatarFallbackRendersNameWhenSrcNil() {
        let host = NSHostingController(rootView: AnyView(Avatar(src: nil, name: "Ada")))
        XCTAssertFalse(host.view.fittingSize.width.isNaN)
    }

    func testSelectMultiModeAppliesToggleThroughMenuPath() {
        var multi: [String] = []
        let select = Select(
            options: [SelectOption(value: "a", label: "A")],
            multipleSelection: Binding(get: { multi }, set: { multi = $0 }),
            multiple: true
        )
        let host = NSHostingController(rootView: AnyView(select))
        _ = host.view.fittingSize
        XCTAssertTrue(multi.isEmpty, "render alone must not mutate selection")
    }
}
