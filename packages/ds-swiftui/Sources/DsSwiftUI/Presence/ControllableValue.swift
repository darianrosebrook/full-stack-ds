import SwiftUI
import Combine

// Hand-maintained runtime (alongside FsdsTheme) — NOT generated.
// The single state machine every controllable channel lowers onto:
// controlled Binding takes precedence over the uncontrolled default, and
// every write fires onChange — the React useControllableState rule the
// per-component projections encoded before this substrate existed
// (FEAT-SWIFTUI-PRESENCE-COMPOSITION-01). Generic over the channel's
// value type: presence is ControllableValue<Bool>, a text channel is
// ControllableValue<String>.
//
// ObservableObject + @StateObject (not a State-holding struct): the
// uncontrolled default must drive view re-renders and must work wherever
// SwiftUI installs it — and stay unit-testable headless.
public final class ControllableValue<Value>: ObservableObject {
    @Published private var uncontrolled: Value
    private let controlled: Binding<Value>?
    private let onChange: ((Value) -> Void)?

    public init(
        controlled: Binding<Value>? = nil,
        defaultValue: Value,
        onChange: ((Value) -> Void)? = nil
    ) {
        self.controlled = controlled
        self.uncontrolled = defaultValue
        self.onChange = onChange
    }

    public var value: Value {
        controlled?.wrappedValue ?? uncontrolled
    }

    public func set(_ next: Value) {
        if let binding = controlled {
            binding.wrappedValue = next
        } else {
            uncontrolled = next
        }
        onChange?(next)
    }

    /// A Binding view of the channel for presenters and controls
    /// (.sheet(isPresented:), Toggle(isOn:), TextField(text:)) — writes
    /// route through set(), so onChange always fires.
    public func binding() -> Binding<Value> {
        Binding(
            get: { self.value },
            set: { self.set($0) }
        )
    }

    /// Toggle for boolean channels.
    public func toggle() where Value == Bool {
        set(!value)
    }
}
