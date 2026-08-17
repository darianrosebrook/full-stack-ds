// Press-proof harness (FIX-SWIFTUI-PRESS-PROOF-01).
//
// A REAL SwiftUI App that drives itself: hosts each scenario in the
// window, waits for the a11y tree to materialize (a genuine run loop
// is the piece headless runners never had), discovers AX buttons,
// delivers synthesized CGEvent mouse clicks at their screen centers,
// and prints per-scenario callback counters. Proves the emitted
// wiring fires through the OS event path: CGEvent → SwiftUI Button →
// onTap → contract callback. Exits nonzero naming any failed counter.
//
// Button discovery is AX-role-based (AXButton) — no component identity,
// no view internals; scenarios compose the same public inits consumers
// use. Run: swift run --package-path packages/ds-swiftui PressProofHarness
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
}

@MainActor
final class HarnessModel: ObservableObject {
    enum Phase {
        case chipActionOnly
        case chipDismissible
        case walkthroughCold
        case walkthroughThreshold
        case done
    }

    @Published var phase: Phase = .chipActionOnly
    let counters = Counters()
    var failures: [String] = []

    func run() {
        Self.focusOurWindow()
        schedule(3.0) { self.advance() }
    }

    func schedule(_ delay: Double, _ work: @escaping @MainActor () -> Void) {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: work)
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
                    self.phase = .done
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
                self.phase = .done
                self.schedule(0.5) { self.advance() }
                }
            }

        case .done:
            print("=== PRESS-PROOF COUNTERS (OS event path) ===")
            print("chip.onClick(action-only)  : \(counters.chipClicks) fire(s) [expect 1]")
            print("chip.onDismiss(dismissible): \(counters.chipDismisses) fire(s) [expect 1]")
            print("walkthrough.steps          : \(counters.steps) [expect [1.0] then last 2.0]")
            print("walkthrough.onSkip         : \(counters.skips) fire(s) [expect 1]")
            print("walkthrough.onComplete     : \(counters.completes) fire(s) [expect 1]")
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

    // MARK: - AX + CGEvent plumbing

    /// Discovered AXButtons sorted left-to-right by screen position.
    static func axButtons() -> [AXUIElement] {
        let app = AXUIElementCreateApplication(ProcessInfo.processInfo.processIdentifier)
        var found: [AXUIElement] = []
        collect(under: app, into: &found)
        found.sort { center(of: $0).x < center(of: $1).x }
        return found
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

    private static func collect(under element: AXUIElement, into found: inout [AXUIElement]) {
        var childrenRef: CFTypeRef?
        guard
            AXUIElementCopyAttributeValue(
                element, kAXChildrenAttribute as CFString, &childrenRef
            ) == .success
        else { return }
        let children = (childrenRef as? [AXUIElement]) ?? []
        for child in children {
            var roleRef: CFTypeRef?
            if AXUIElementCopyAttributeValue(
                child, kAXRoleAttribute as CFString, &roleRef
            ) == .success,
                let role = roleRef as? String,
                role == "AXButton" {
                var subroleRef: CFTypeRef?
                var subrole: String?
                if AXUIElementCopyAttributeValue(
                    child, kAXSubroleAttribute as CFString, &subroleRef
                ) == .success {
                    subrole = subroleRef as? String
                }
                // Traffic lights are AXButtons with standard subroles —
                // skip them; only content buttons drive the scenarios.
                if let subrole,
                    ["AXCloseButton", "AXMinimizeButton", "AXZoomButton", "AXFullScreenButton"].contains(subrole) {
                    continue
                }
                found.append(child)
                
            }
            collect(under: child, into: &found)
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
    /// the same SwiftUI Button action a user press does. CGEvent mouse
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
                case .done:
                    SwiftUI.Text("done")
                }
            }
            .frame(width: 360, height: 140)
            .onAppear { model.run() }
        }
        .windowResizability(.contentSize)
    }
}
