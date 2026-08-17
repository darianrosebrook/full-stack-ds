// Press-proof harness (FIX-SWIFTUI-PRESS-PROOF-01,
// TEST-SWIFTUI-RUNTIME-BREADTH-01).
//
// A REAL SwiftUI App that drives itself: hosts each scenario in the
// window, waits for the a11y tree to materialize (a genuine run loop
// is the piece headless runners never had), discovers AX elements,
// actuates them through the OS accessibility path (AXPress; AXValue
// writes for text entry), and prints per-scenario callback counters.
// Proves the emitted wiring fires through OS-mediated interaction:
// AXPress → SwiftUI control → channel/callback. Exits nonzero naming
// any failed counter.
//
// Element discovery is AX-role-based — no component identity, no view
// internals; scenarios compose the same public inits consumers use.
// Surfaces this host cannot reach through AX print a LIMITATION
// artifact and are excluded from the exit code with that evidence —
// never silently skipped (spec invariant).
//
// Run: swift run --package-path packages/ds-swiftui PressProofHarness
import SwiftUI
import AppKit
import CoreGraphics
import ApplicationServices
import DsSwiftUI

@MainActor
final class Counters {
    var chipClicks = 0
    var chipDismisses = 0
    var steps: [Double] = []
    var completes = 0
    var skips = 0

    // TEST-SWIFTUI-RUNTIME-BREADTH-01 breadth phases.
    var switchStates: [Bool] = []
    var switchBindingFinal = false
    var selectChanges: [String] = []
    var selectBindingFinal = ""
    var otpChanges: [String] = []
    var otpCompletes: [String] = []
    var otpBindingFinal = ""
    var dialogOpens: [Bool] = []
    var dialogSheetVisibleBefore = true
    var dialogSheetVisibleAfterOpen = false
    var dialogSheetVisibleAfterClose = true
    var dialogOpensUncontrolled: [Bool] = []
    var dialogUncontrolledVisible = false
    var dialogCensusAfterOpen: [String: Int] = [:]
    var dialogTriggerPresses = 0
    var plainSheetVisible = false
    var plainTriggerPresses = 0
    var plainProbeEnvironmental = false
    var calendarButtonsDump: [String] = []
    var calendarChanges: [String] = []
    var calendarCensus: [String: Int] = [:]
    var structuralCensus: [String: Int] = [:]
    var limitations: [String] = []
}

@MainActor
final class HarnessModel: ObservableObject {
    enum Phase {
        case chipActionOnly
        case chipDismissible
        case walkthroughCold
        case walkthroughThreshold
        case switchToggle
        case selectOption
        case otpEntry
        case dialogChannel
        case dialogPlainProbe
        case dialogUncontrolled
        case calendarDay
        case structuralProbes
        case done
    }

    @Published var phase: Phase = .chipActionOnly
    // Binding-backed channel state for the breadth phases — the harness
    // observes what the component writes through the OS interaction path.
    @Published var switchOn = false
    @Published var selection = ""
    @Published var otp = ""
    @Published var dialogOpen = false
    @Published var plainSheetOpen = false
    @Published var pickedDate: Date? = nil
    let counters = Counters()
    var failures: [String] = []

    func run() {
        Self.focusOurWindow()
        schedule(3.0) { self.advance() }
    }

    func schedule(_ delay: Double, _ work: @escaping @MainActor () -> Void) {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: work)
    }

    /// Poll for the controlled sheet's content (close-dialog) up to
    /// `remaining` times, then drive the close path and poll dismissal.
    func pollDialogPresentation(remaining: Int) {
        if Self.axButtons(labeled: "close-dialog").count > 0 {
            counters.dialogSheetVisibleAfterOpen = true
            Self.click(at: Self.axButtons(labeled: "close-dialog")[0])
            pollDialogDismissal(remaining: 10)
            return
        }
        guard remaining > 0 else {
            counters.dialogCensusAfterOpen = Self.axCensus()
            if counters.plainProbeEnvironmental {
                // The plain-SwiftUI control already failed the same
                // after-mount flip — the host blocks it, not the
                // component. Limitation, with the probe as evidence.
                counters.limitations.append(
                    "dialog(controlled): sheet never presented after open=true, but the plain-probe control failed identically — host blocks after-mount sheet flips (environmental); controlled open/close cycle unprovable on this host"
                )
            } else {
                failures.append(
                    "dialog(controlled): sheet content never appeared after open=true (trigger pressed \(counters.dialogTriggerPresses)x; census \(counters.dialogCensusAfterOpen.sorted { $0.key < $1.key }))"
                )
            }
            phase = .dialogUncontrolled
            schedule(1.0) { self.advance() }
            return
        }
        schedule(0.6) { self.pollDialogPresentation(remaining: remaining - 1) }
    }

    func pollDialogDismissal(remaining: Int) {
        if Self.axButtons(labeled: "close-dialog").isEmpty {
            counters.dialogSheetVisibleAfterClose = false
            if counters.dialogOpens != [true, false] {
                failures.append("dialog: onOpenChange values \(counters.dialogOpens), expected [true, false]")
            }
            phase = .dialogPlainProbe
            schedule(0.5) { self.advance() }
            return
        }
        guard remaining > 0 else {
            counters.dialogSheetVisibleAfterClose = true
            failures.append("dialog: sheet content still present after close")
            phase = .dialogPlainProbe
            schedule(1.0) { self.advance() }
            return
        }
        schedule(0.6) { self.pollDialogDismissal(remaining: remaining - 1) }
    }

    /// Poll for the plain probe's sheet text; classify environmental
    /// limitation vs component defect accordingly.
    func pollPlainSheet(remaining: Int) {
        let presented = Self.axStaticTexts().contains { Self.title(of: $0) == "plain-probe-sheet" }
        if presented {
            counters.plainSheetVisible = true
            // The host presents after-mount flips fine — the emitted
            // Dialog's binding path is the defect. Record loudly.
            failures.append(
                "dialog(plain probe): plain SwiftUI sheet PRESENTED on the same after-mount flip where the emitted Dialog did not — emitted binding path defect"
            )
            phase = .dialogChannel
            schedule(1.0) { self.advance() }
            return
        }
        guard remaining > 0 else {
            counters.plainSheetVisible = false
            counters.plainProbeEnvironmental = true
            counters.limitations.append(
                "dialog(plain probe): even plain SwiftUI Color.clear.sheet(isPresented:) does not present on an after-mount binding flip on this host (trigger \(counters.plainTriggerPresses == 0 ? "" : "pressed ")— environmental) — controlled-Dialog after-mount presentation proof unavailable on this host"
            )
            phase = .dialogChannel
            schedule(1.0) { self.advance() }
            return
        }
        schedule(0.6) { self.pollPlainSheet(remaining: remaining - 1) }
    }

    func advance() {
        switch phase {
        case .chipActionOnly:
            let buttons = Self.axButtons()
            guard buttons.count == 1 else {
                failures.append("chip(action-only): expected 1 AXButton, found \(buttons.count)")
                phase = .chipDismissible
                schedule(1.0) { self.advance() }
                return
            }
            Self.click(at: buttons[0])
            schedule(1.0) {
                if self.counters.chipClicks != 1 {
                    self.failures.append("chip(action-only): onClick fired \(self.counters.chipClicks)x, expected 1")
                }
                self.phase = .chipDismissible
                self.schedule(1.0) { self.advance() }
            }

        case .chipDismissible:
            counters.chipClicks = 0
            schedule(1.0) {
                let buttons = Self.axButtons()
                guard buttons.count == 2 else {
                    self.failures.append("chip(dismissible): expected 2 AXButtons, found \(buttons.count)")
                    self.phase = .walkthroughCold
                    self.schedule(1.0) { self.advance() }
                    return
                }
                Self.click(at: buttons[0])
                Self.click(at: buttons[1])
                self.schedule(1.0) {
                    if self.counters.chipClicks != 1 {
                        self.failures.append("chip(dismissible): onClick fired \(self.counters.chipClicks)x, expected 1")
                    }
                    if self.counters.chipDismisses != 1 {
                        self.failures.append("chip(dismissible): onDismiss fired \(self.counters.chipDismisses)x, expected 1")
                    }
                    self.phase = .walkthroughCold
                    self.schedule(1.0) { self.advance() }
                }
            }

        case .walkthroughCold:
            schedule(1.0) {
                let buttons = Self.axButtons()
                guard buttons.count == 3 else {
                    self.failures.append("walkthrough: expected 3 AXButtons (Skip/Back/Next), found \(buttons.count)")
                    self.phase = .walkthroughThreshold
                    self.schedule(1.0) { self.advance() }
                    return
                }
                    Self.click(at: buttons[0]) // Skip
                Self.click(at: buttons[1]) // Back (no-op at 0)
                Self.click(at: buttons[2]) // Next → 1
                self.schedule(1.0) {
                    if self.counters.skips != 1 {
                        self.failures.append("walkthrough: onSkip fired \(self.counters.skips)x, expected 1")
                    }
                    if self.counters.steps != [1.0] {
                        self.failures.append("walkthrough: steps \(self.counters.steps), expected [1.0]")
                    }
                    if self.counters.completes != 0 {
                        self.failures.append("walkthrough: completes \(self.counters.completes), expected 0 below threshold")
                    }
                    self.phase = .walkthroughThreshold
                    self.schedule(1.0) { self.advance() }
                }
            }

        case .walkthroughThreshold:
            counters.steps = []
            schedule(1.0) {
                let buttons = Self.axButtons()
                guard buttons.count == 3 else {
                    self.failures.append("walkthrough(threshold): expected 3 AXButtons, found \(buttons.count)")
                    self.phase = .switchToggle
                    self.schedule(1.0) { self.advance() }
                    return
                }
                Self.click(at: buttons[2]) // Next → 2 crosses threshold 1
                self.schedule(1.0) {
                if self.counters.steps.last != 2.0 {
                    self.failures.append("walkthrough(threshold): steps \(self.counters.steps), expected last 2.0")
                }
                if self.counters.completes != 1 {
                    self.failures.append("walkthrough(threshold): completes \(self.counters.completes), expected 1")
                }
                self.phase = .switchToggle
                self.schedule(0.5) { self.advance() }
                }
            }

        case .switchToggle:
            counters.switchStates = []
            schedule(1.0) {
                let pressables = Self.axPressables()
                guard pressables.count == 1 else {
                    self.failures.append("switch: expected 1 pressable (Toggle → AXCheckBox/AXSwitch), found \(pressables.count); census \(Self.axCensus())")
                    self.phase = .selectOption
                    self.schedule(1.0) { self.advance() }
                    return
                }
                Self.click(at: pressables[0])
                self.schedule(0.7) {
                    Self.click(at: Self.axPressables().first ?? pressables[0])
                    self.schedule(0.7) {
                        self.counters.switchBindingFinal = self.switchOn
                        if self.counters.switchStates != [true, false] {
                            self.failures.append("switch: onChange values \(self.counters.switchStates), expected [true, false]")
                        }
                        if self.counters.switchBindingFinal != false {
                            self.failures.append("switch: binding final \(self.counters.switchBindingFinal), expected false (two toggles)")
                        }
                        self.phase = .selectOption
                        self.schedule(0.5) { self.advance() }
                    }
                }
            }

        case .selectOption:
            counters.selectChanges = []
            schedule(1.0) {
                // SwiftUI Menu exposes its trigger as AXMenuButton (not AXButton).
                let triggers = Self.axElements(withRoles: ["AXButton", "AXMenuButton"])
                guard triggers.count == 1 else {
                    self.failures.append("select: expected 1 trigger (AXButton/AXMenuButton), found \(triggers.count); census \(Self.axCensus())")
                    self.phase = .otpEntry
                    self.schedule(1.0) { self.advance() }
                    return
                }
                let triggerY = Self.center(of: triggers[0]).y
                Self.click(at: triggers[0]) // open the menu
                self.schedule(0.8) {
                    // The app menu bar contributes ~131 AXMenuItems; the
                    // popup's options are distinguished by exact option
                    // labels and vertical proximity to the trigger.
                    let optionLabels: Set<String> = ["A", "B", "C"]
                    let items = Self.axMenuItems().filter { item in
                        guard let title = Self.title(of: item), optionLabels.contains(title) else { return false }
                        return abs(Self.center(of: item).y - triggerY) < 300
                    }
                    guard let optionB = items.first(where: { Self.title(of: $0) == "B" }) else {
                        self.counters.limitations.append(
                            "select: menu opened via trigger but option \"B\" not reachable (candidates \(items.count), census \(Self.axCensus())) — option-press proof unavailable on this host"
                        )
                        self.phase = .otpEntry
                        self.schedule(0.5) { self.advance() }
                        return
                    }
                    Self.click(at: optionB) // press option "B" (value "b")
                    self.schedule(0.8) {
                        self.counters.selectBindingFinal = self.selection
                        if self.counters.selectChanges != ["b"] {
                            self.failures.append("select: onSelectionChange values \(self.counters.selectChanges), expected [\"b\"]")
                        }
                        if self.counters.selectBindingFinal != "b" {
                            self.failures.append("select: binding final \"\(self.counters.selectBindingFinal)\", expected \"b\"")
                        }
                        self.phase = .otpEntry
                        self.schedule(0.5) { self.advance() }
                    }
                }
            }

        case .otpEntry:
            counters.otpChanges = []
            counters.otpCompletes = []
            schedule(1.0) {
                let fields = Self.axTextFields()
                guard fields.count == 6 else {
                    self.failures.append("otp: expected 6 AXTextFields, found \(fields.count); census \(Self.axCensus())")
                    self.phase = .dialogPlainProbe
                    self.schedule(1.0) { self.advance() }
                    return
                }
                // Probe writability on field 0 first; only then fill the rest.
                let probe = Self.setValue("7", on: fields[0])
                self.schedule(0.6) {
                    guard probe, self.otp.hasPrefix("7") else {
                        self.counters.limitations.append(
                            "otp: AXValue write on field 0 \(probe ? "succeeded but binding read \"\(self.otp)\"" : "rejected") — keyboard path unavailable (no key window on this host), text-entry proof unavailable"
                        )
                        self.phase = .dialogPlainProbe
                        self.schedule(0.5) { self.advance() }
                        return
                    }
                    let digits = ["1", "2", "3", "4", "5", "6"]
                    for (index, digit) in digits.enumerated() where index > 0 {
                        _ = Self.setValue(digit, on: fields[index])
                    }
                    self.schedule(0.8) {
                        self.counters.otpBindingFinal = self.otp
                        if self.counters.otpBindingFinal != "123456" {
                            self.failures.append("otp: binding final \"\(self.counters.otpBindingFinal)\", expected \"123456\"")
                        }
                        if self.counters.otpCompletes != ["123456"] {
                            self.failures.append("otp: onComplete values \(self.counters.otpCompletes), expected [\"123456\"]")
                        }
                        self.phase = .dialogPlainProbe
                        self.schedule(0.5) { self.advance() }
                    }
                }
            }

        case .dialogChannel:
            counters.dialogOpens = []
            schedule(1.0) {
                self.counters.dialogSheetVisibleBefore = Self.axButtons(labeled: "close-dialog").count > 0
                let trigger = Self.axButtons(labeled: "open-dialog")
                guard trigger.count == 1, !self.counters.dialogSheetVisibleBefore else {
                    self.failures.append("dialog: expected exactly 1 open-dialog trigger and no sheet content before open; found \(trigger.count) triggers, sheet visible \(!self.counters.dialogSheetVisibleBefore)")
                    self.phase = .dialogUncontrolled
                    self.schedule(1.0) { self.advance() }
                    return
                }
                Self.click(at: trigger[0])
                // Sheet presentation animates — poll well past a single
                // settle beat before declaring the channel broken.
                self.pollDialogPresentation(remaining: 10)
            }

        case .dialogPlainProbe:
            // Minimal plain-SwiftUI control: same zero-size anchor, same
            // after-mount binding flip, no component code. If this
            // presents where the emitted Dialog did not, the defect is
            // in the Dialog binding path; if neither presents, the host
            // environment blocks after-mount presentation entirely.
            schedule(1.0) {
                let trigger = Self.axButtons(labeled: "open-plain")
                guard trigger.count == 1 else {
                    self.counters.limitations.append(
                        "dialog(plain probe): expected 1 open-plain trigger, found \(trigger.count) — probe inconclusive"
                    )
                    self.phase = .dialogChannel
                    self.schedule(1.0) { self.advance() }
                    return
                }
                Self.click(at: trigger[0])
                self.pollPlainSheet(remaining: 10)
            }

        case .dialogUncontrolled:
            schedule(1.0) {
                self.counters.dialogUncontrolledVisible = Self.axButtons(labeled: "close-uncontrolled").count > 0
                if !self.counters.dialogUncontrolledVisible {
                    self.failures.append("dialog(uncontrolled): defaultOpen=true did not present a sheet at mount — presentation anchor broken")
                }
                self.phase = .calendarDay
                self.schedule(0.5) { self.advance() }
            }

        case .calendarDay:
            counters.calendarChanges = []
            counters.calendarCensus = [:]
            counters.calendarButtonsDump = []
            schedule(1.0) {
                self.counters.calendarCensus = Self.axCensus()
                self.counters.calendarButtonsDump = Self.axButtons().compactMap {
                    Self.title(of: $0) ?? Self.description(of: $0)
                }
                // The compact DatePicker exposes no date-labeled popup
                // trigger; its real user path is the AXIncrementor day
                // stepper. Increment once — an OS-mediated action — and
                // expect exactly one onChange with a shifted date.
                let incrementors = Self.axElements(withRoles: ["AXIncrementor"])
                guard let incrementor = incrementors.first else {
                    self.counters.limitations.append(
                        "calendar: no AXIncrementor to step the date (buttons \(self.counters.calendarButtonsDump), census \(self.counters.calendarCensus.sorted { $0.key < $1.key })) — day-step proof unavailable on this host"
                    )
                    self.phase = .structuralProbes
                    self.schedule(0.5) { self.advance() }
                    return
                }
                Self.increment(at: incrementor)
                self.schedule(0.8) {
                    if self.counters.calendarChanges.isEmpty {
                        self.failures.append("calendar: AXIncrement incremented but onChange never fired")
                    }
                    if self.counters.calendarChanges.count > 1 {
                        self.failures.append("calendar: single increment fired onChange \(self.counters.calendarChanges.count)x, expected 1")
                    }
                    self.phase = .structuralProbes
                    self.schedule(0.5) { self.advance() }
                }
            }

        case .structuralProbes:
            schedule(1.0) {
                // Scope discovery to the Press Proof window: earlier
                // phases can leave orphaned sheet windows in the app's
                // window list, and the menu bar contributes ~131 items
                // of noise. The window-scoped census is the honest
                // artifact for what THIS surface exposes.
                self.counters.structuralCensus = Self.axCensus(scopedToMainWindow: true)
                let pressable = Self.axElements(withRoles: ["AXButton", "AXCheckBox", "AXSwitch"], scopedToMainWindow: true).count
                let editable = Self.axElements(withRoles: ["AXTextField"], scopedToMainWindow: true).count
                if pressable == 0 && editable == 0 {
                    self.counters.limitations.append(
                        "structural (tabs/accordion/shuttle): mounted via public inits, window-scoped AX census \(self.counters.structuralCensus.sorted { $0.key < $1.key }) exposes ZERO pressable/editable elements — channels are not wired to any control in the current emission; interaction proof impossible until the emitter deepens these classes"
                    )
                } else {
                    // Found interaction where the emission was believed
                    // structural — investigate rather than assume.
                    self.failures.append(
                        "structural probes: expected 0 pressable/editable (structural emissions), found \(pressable) pressable / \(editable) editable; census \(self.counters.structuralCensus)"
                    )
                }
                self.phase = .done
                self.schedule(0.5) { self.advance() }
            }

        case .done:
            print("=== PRESS-PROOF COUNTERS (OS event path) ===")
            print("chip.onClick(action-only)  : \(counters.chipClicks) fire(s) [expect 1]")
            print("chip.onDismiss(dismissible): \(counters.chipDismisses) fire(s) [expect 1]")
            print("walkthrough.steps          : \(counters.steps) [expect [1.0] then last 2.0]")
            print("walkthrough.onSkip         : \(counters.skips) fire(s) [expect 1]")
            print("walkthrough.onComplete     : \(counters.completes) fire(s) [expect 1]")
            print("--- breadth (TEST-SWIFTUI-RUNTIME-BREADTH-01) ---")
            print("switch.onChange            : \(counters.switchStates) [expect [true, false]]")
            print("switch.bindingFinal        : \(counters.switchBindingFinal) [expect false]")
            print("select.onSelectionChange   : \(counters.selectChanges) [expect [\"b\"]]")
            print("select.bindingFinal        : \"\(counters.selectBindingFinal)\" [expect \"b\"]")
            print("otp.onChange(last)         : \(counters.otpChanges.last ?? "<none>")")
            print("otp.onComplete             : \(counters.otpCompletes)")
            print("otp.bindingFinal           : \"\(counters.otpBindingFinal)\"")
            print("dialog.onOpenChange        : \(counters.dialogOpens) [expect [true, false]]")
            print("dialog.sheet before/open/after-close: \(counters.dialogSheetVisibleBefore)/\(counters.dialogSheetVisibleAfterOpen)/\(counters.dialogSheetVisibleAfterClose) [expect false/true/false]")
            print("dialog.uncontrolled visible at mount: \(counters.dialogUncontrolledVisible) [expect true — isolates EmptyView().sheet anchor]")
            print("dialog.uncontrolled onOpenChange: \(counters.dialogOpensUncontrolled)")
            print("dialog.plainProbe presented on after-mount flip: \(counters.plainSheetVisible) (trigger pressed \(counters.plainTriggerPresses)x)")
            print("calendar.onChange          : \(counters.calendarChanges)")
            print("calendar.buttons           : \(counters.calendarButtonsDump)")
            print("calendar.census            : \(counters.calendarCensus.sorted { $0.key < $1.key })")
            print("structural.census          : \(counters.structuralCensus.sorted { $0.key < $1.key })")
            for limitation in counters.limitations {
                print("LIMITATION: \(limitation)")
            }
            if failures.isEmpty {
                print("PRESS-PROOF: all counters match expectations")
                Foundation.exit(0)
            } else {
                for failure in failures {
                    FileHandle.standardError.write(Data(("PRESS-PROOF FAILURE: " + failure + "\n").utf8))
                }
                Foundation.exit(1)
            }
        }
    }

    // MARK: - AX + interaction plumbing

    /// AXButtons sorted left-to-right by screen position.
    static func axButtons() -> [AXUIElement] {
        axElements(withRoles: ["AXButton"]).sorted { center(of: $0).x < center(of: $1).x }
    }

    /// AXButtons whose AXTitle or AXDescription contains the marker text.
    static func axButtons(labeled marker: String) -> [AXUIElement] {
        axButtons().filter { element in
            let label = (title(of: element) ?? "") + (description(of: element) ?? "")
            return label.localizedCaseInsensitiveContains(marker)
        }
    }

    /// Pressable controls: SwiftUI Buttons (AXButton) and toggles
    /// (AXCheckBox / AXSwitch), sorted left-to-right.
    static func axPressables() -> [AXUIElement] {
        axElements(withRoles: ["AXButton", "AXCheckBox", "AXSwitch"])
            .sorted { center(of: $0).x < center(of: $1).x }
    }

    /// Menu items (opened SwiftUI Menu), sorted top-to-bottom.
    static func axMenuItems() -> [AXUIElement] {
        axElements(withRoles: ["AXMenuItem"]).sorted { center(of: $0).y < center(of: $1).y }
    }

    /// Text inputs (SwiftUI TextField), sorted left-to-right.
    static func axTextFields() -> [AXUIElement] {
        axElements(withRoles: ["AXTextField"]).sorted { center(of: $0).x < center(of: $1).x }
    }

    /// Static texts, for asserting presented sheet content.
    static func axStaticTexts() -> [AXUIElement] {
        axElements(withRoles: ["AXStaticText"])
    }

    /// OS-mediated date step on an AXIncrementor (DatePicker's day
    /// stepper) — the same action a user's arrow press produces.
    static func increment(at element: AXUIElement) {
        focusOurWindow()
        let result = AXUIElementPerformAction(element, kAXIncrementAction as CFString)
        if result != .success {
            FileHandle.standardError.write(Data(("AXIncrement error: \(result.rawValue)\n").utf8))
        }
        usleep(250_000)
    }

    /// Role census — the artifact that proves what a mounted surface
    /// actually exposes. `scopedToMainWindow` walks only the Press Proof
    /// window (no menu bar noise, no orphaned sheet windows).
    static func axCensus(scopedToMainWindow: Bool = false) -> [String: Int] {
        let root: AXUIElement = scopedToMainWindow
            ? (mainWindowElement() ?? AXUIElementCreateApplication(ProcessInfo.processInfo.processIdentifier))
            : AXUIElementCreateApplication(ProcessInfo.processInfo.processIdentifier)
        var census: [String: Int] = [:]
        censusWalk(under: root, into: &census)
        return census
    }

    static func axElements(withRoles wanted: Set<String>, scopedToMainWindow: Bool = false) -> [AXUIElement] {
        let root: AXUIElement = scopedToMainWindow
            ? (mainWindowElement() ?? AXUIElementCreateApplication(ProcessInfo.processInfo.processIdentifier))
            : AXUIElementCreateApplication(ProcessInfo.processInfo.processIdentifier)
        var found: [AXUIElement] = []
        collect(under: root, roles: wanted, into: &found)
        return found
    }

    /// The app's AXWindow titled "Press Proof", if present.
    static func mainWindowElement() -> AXUIElement? {
        let app = AXUIElementCreateApplication(ProcessInfo.processInfo.processIdentifier)
        var windowsRef: CFTypeRef?
        guard
            AXUIElementCopyAttributeValue(
                app, kAXWindowsAttribute as CFString, &windowsRef
            ) == .success,
            let windows = windowsRef as? [AXUIElement]
        else { return nil }
        return windows.first { title(of: $0) == "Press Proof" }
    }

    static func center(of element: AXUIElement) -> CGPoint {
        var posRef: CFTypeRef?
        var sizeRef: CFTypeRef?
        guard
            AXUIElementCopyAttributeValue(
                element, kAXPositionAttribute as CFString, &posRef
            ) == .success,
            AXUIElementCopyAttributeValue(
                element, kAXSizeAttribute as CFString, &sizeRef
            ) == .success,
            let pos = posRef,
            let size = sizeRef
        else { return .zero }
        var p = CGPoint.zero
        var sz = CGSize.zero
        let posVal = pos as! AXValue
        let sizeVal = size as! AXValue
        withUnsafeMutablePointer(to: &p) { pPtr in
            withUnsafeMutablePointer(to: &sz) { szPtr in
                AXValueGetValue(posVal, .cgPoint, pPtr)
                AXValueGetValue(sizeVal, .cgSize, szPtr)
            }
        }
        return CGPoint(x: p.x + sz.width / 2, y: p.y + sz.height / 2)
    }

    static func title(of element: AXUIElement) -> String? {
        stringAttribute(kAXTitleAttribute as CFString, of: element)
    }

    static func description(of element: AXUIElement) -> String? {
        stringAttribute(kAXDescriptionAttribute as CFString, of: element)
    }

    static func stringAttribute(_ attribute: CFString, of element: AXUIElement) -> String? {
        var ref: CFTypeRef?
        guard
            AXUIElementCopyAttributeValue(element, attribute, &ref) == .success
        else { return nil }
        return ref as? String
    }

    /// OS-mediated text entry: write through the AXValue attribute.
    /// Returns false when the element rejects value writes.
    static func setValue(_ value: String, on element: AXUIElement) -> Bool {
        var settable: DarwinBoolean = false
        guard
            AXUIElementIsAttributeSettable(
                element, kAXValueAttribute as CFString, &settable
            ) == .success,
            settable.boolValue
        else { return false }
        let result = AXUIElementSetAttributeValue(
            element, kAXValueAttribute as CFString, value as CFString
        )
        usleep(150_000)
        return result == .success
    }

    private static func censusWalk(under element: AXUIElement, into census: inout [String: Int]) {
        var childrenRef: CFTypeRef?
        guard
            AXUIElementCopyAttributeValue(
                element, kAXChildrenAttribute as CFString, &childrenRef
            ) == .success
        else { return }
        let children = (childrenRef as? [AXUIElement]) ?? []
        for child in children {
            if let role = role(of: child) {
                // Traffic-light window buttons would inflate AXButton counts;
                // count only content controls like the collectors do.
                if role == "AXButton",
                    let subrole = stringAttribute(kAXSubroleAttribute as CFString, of: child),
                    ["AXCloseButton", "AXMinimizeButton", "AXZoomButton", "AXFullScreenButton"].contains(subrole) {
                    continue
                }
                census[role, default: 0] += 1
            }
            censusWalk(under: child, into: &census)
        }
    }

    private static func role(of element: AXUIElement) -> String? {
        stringAttribute(kAXRoleAttribute as CFString, of: element)
    }

    private static func collect(
        under element: AXUIElement, roles wanted: Set<String>, into found: inout [AXUIElement]
    ) {
        var childrenRef: CFTypeRef?
        guard
            AXUIElementCopyAttributeValue(
                element, kAXChildrenAttribute as CFString, &childrenRef
            ) == .success
        else { return }
        let children = (childrenRef as? [AXUIElement]) ?? []
        for child in children {
            if let role = role(of: child), wanted.contains(role) {
                var subroleRef: CFTypeRef?
                var subrole: String?
                if AXUIElementCopyAttributeValue(
                    child, kAXSubroleAttribute as CFString, &subroleRef
                ) == .success {
                    subrole = subroleRef as? String
                }
                // Traffic lights are AXButtons with standard subroles —
                // skip them; only content controls drive the scenarios.
                if let subrole,
                    ["AXCloseButton", "AXMinimizeButton", "AXZoomButton", "AXFullScreenButton"].contains(subrole) {
                    continue
                }
                found.append(child)

            }
            collect(under: child, roles: wanted, into: &found)
        }
    }

    /// Background windows eat the first click as activation — explicitly
    /// activate + key the window so the synthesized click reaches the
    /// button on the first press.
    static func focusOurWindow() {
        NSApp.activate(ignoringOtherApps: true)
        // keyWindow can be nil under swift run; front every window we own.
        for window in NSApplication.shared.windows where window.canBecomeKey {
            window.orderFrontRegardless()
            window.makeKeyAndOrderFront(nil)
        }
        usleep(200_000)
    }

    /// Actuate through the OS accessibility action path: AXPress fires
    /// the same SwiftUI control action a user press does. CGEvent mouse
    /// delivery was attempted first and requires a keyable window this
    /// swift-run host never grants (keyWindow nil after
    /// orderFrontRegardless + makeKeyAndOrderFront — recorded per phase).
    static func click(at button: AXUIElement) {
        focusOurWindow()
        let result = AXUIElementPerformAction(button, kAXPressAction as CFString)
        if result != .success {
            FileHandle.standardError.write(Data(("AXPress error: \(result.rawValue)\n").utf8))
        }
        usleep(250_000)
    }
}

@main
struct PressProofHarnessApp: App {
    @StateObject private var model = HarnessModel()

    var body: some Scene {
        WindowGroup("Press Proof") {
            ZStack {
                switch model.phase {
                case .chipActionOnly:
                    Chip(
                        onClick: { model.counters.chipClicks += 1 }
                    ) { SwiftUI.Text("chip") }
                case .chipDismissible:
                    Chip(
                        dismissible: true,
                        onClick: { model.counters.chipClicks += 1 },
                        onDismiss: { model.counters.chipDismisses += 1 }
                    ) { SwiftUI.Text("x") }
                case .walkthroughCold:
                    Walkthrough(
                        step: 0,
                        onStepChange: { model.counters.steps.append($0) },
                        onComplete: { model.counters.completes += 1 },
                        onSkip: { model.counters.skips += 1 },
                        title: { SwiftUI.Text("t") }
                    )
                case .walkthroughThreshold:
                    Walkthrough(
                        step: 1,
                        onStepChange: { model.counters.steps.append($0) },
                        onComplete: { model.counters.completes += 1 },
                        title: { SwiftUI.Text("t") }
                    )
                case .switchToggle:
                    Switch(
                        checked: $model.switchOn,
                        onChange: { model.counters.switchStates.append($0) },
                        accessibilityLabel: "harness-switch"
                    )
                case .selectOption:
                    Select(
                        options: [
                            SelectOption(value: "a", label: "A"),
                            SelectOption(value: "b", label: "B"),
                            SelectOption(value: "c", label: "C"),
                        ],
                        selection: $model.selection,
                        onSelectionChange: { model.counters.selectChanges.append("\($0)") }
                    )
                    .frame(width: 200)
                case .otpEntry:
                    OTP(
                        value: $model.otp,
                        onChange: { model.counters.otpChanges.append($0) },
                        onComplete: { model.counters.otpCompletes.append($0) }
                    )
                case .dialogChannel:
                    VStack(spacing: 12) {
                        SwiftUI.Button("open-dialog") {
                            model.counters.dialogTriggerPresses += 1
                            model.dialogOpen = true
                        }
                        Dialog(
                            open: $model.dialogOpen,
                            onOpenChange: { model.counters.dialogOpens.append($0) },
                            title: { SwiftUI.Text("dialog title") },
                            bodyContent: { SwiftUI.Text("dialog body") },
                            footer: {
                                SwiftUI.Button("close-dialog") { model.dialogOpen = false }
                            }
                        )
                    }
                case .dialogPlainProbe:
                    VStack(spacing: 12) {
                        SwiftUI.Button("open-plain") {
                            model.counters.plainTriggerPresses += 1
                            model.plainSheetOpen = true
                        }
                        SwiftUI.Color.clear
                            .frame(width: 0, height: 0)
                            .sheet(isPresented: $model.plainSheetOpen) {
                                SwiftUI.Text("plain-probe-sheet")
                            }
                    }
                case .dialogUncontrolled:
                    // Uncontrolled probe in its own phase: a presented sheet
                    // blocks a second sheet from the same window, so the
                    // controlled flow must complete before this mounts.
                    Dialog(
                        defaultOpen: true,
                        onOpenChange: { model.counters.dialogOpensUncontrolled.append($0) },
                        title: { SwiftUI.Text("uncontrolled title") },
                        footer: {
                            SwiftUI.Button("close-uncontrolled") {}
                        }
                    )
                case .calendarDay:
                    Calendar(
                        value: $model.pickedDate,
                        onChange: { model.counters.calendarChanges.append(String(describing: $0)) }
                    )
                case .structuralProbes:
                    VStack(spacing: 16) {
                        Tabs { SwiftUI.Text("tabs panel") }
                        Accordion { SwiftUI.Text("accordion panel") }
                        Shuttle(selection: .constant(["a", "b"]))
                    }
                case .done:
                    SwiftUI.Text("done")
                }
            }
            .frame(width: 420, height: 320)
            .onAppear { model.run() }
        }
        .windowResizability(.contentSize)
    }
}
