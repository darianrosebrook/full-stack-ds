import SwiftUI

// Hand-maintained runtime (alongside ControllableValue) — NOT generated.
// The selection semantics substrate: a union (string | string[]) channel
// lowers to single + multi ControllableValue projections behind one
// mode-gated apply — the channelUpdate grammar's replace-vs-
// toggleMembership dispatch, authored by the contract's `multiple` prop
// (FEAT-SWIFTUI-SELECTION-SUBSTRATE-01). No second state machine: both
// halves compose ControllableValue.
public final class SelectionState: ObservableObject {
    @Published private var uncontrolledSingle: String
    @Published private var uncontrolledMulti: [String]
    private let controlledSingle: Binding<String>?
    private let controlledMulti: Binding<[String]>?
    private let onSelectionChange: ((Any) -> Void)?
    let multiple: Bool

    public init(
        selection: Binding<String>? = nil,
        defaultSelection: String = "",
        multipleSelection: Binding<[String]>? = nil,
        defaultMultipleSelection: [String] = [],
        multiple: Bool = false,
        onSelectionChange: ((Any) -> Void)? = nil
    ) {
        self.controlledSingle = selection
        self.uncontrolledSingle = defaultSelection
        self.controlledMulti = multipleSelection
        self.uncontrolledMulti = defaultMultipleSelection
        self.multiple = multiple
        self.onSelectionChange = onSelectionChange
    }

    public var single: String {
        controlledSingle?.wrappedValue ?? uncontrolledSingle
    }

    public var multi: [String] {
        controlledMulti?.wrappedValue ?? uncontrolledMulti
    }

    public func isSelected(_ value: String) -> Bool {
        multiple ? multi.contains(value) : single == value
    }

    /// The channelCall lowering target: apply(option.value) from a menu
    /// item action. Dispatches replace (single mode) or toggleMembership
    /// (multi mode) — the contract-authored mode gate.
    public func apply(_ value: String) {
        if multiple {
            var next = multi
            if let index = next.firstIndex(of: value) {
                next.remove(at: index)
            } else {
                next.append(value)
            }
            if let binding = controlledMulti {
                binding.wrappedValue = next
            } else {
                uncontrolledMulti = next
            }
            onSelectionChange?(next)
        } else {
            if let binding = controlledSingle {
                binding.wrappedValue = value
            } else {
                uncontrolledSingle = value
            }
            onSelectionChange?(value)
        }
    }
}
