// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum ToggleSwitchSize: String, CaseIterable {
    case small
    case medium
    case large
}
// @generated:end

// @generated:start component
public struct ToggleSwitch: View {
    private let controlledChecked: Binding<Bool>?
    @State private var uncontrolledChecked: Bool
    private let onChange: ((Bool) -> Void)?
    private let size: ToggleSwitchSize
    private let disabled: Bool
    private let name: String?
    private let value: String?
    private let accessibilityLabel: String?

    public init(
        checked: Binding<Bool>? = nil,
        defaultChecked: Bool = false,
        onChange: ((Bool) -> Void)? = nil,
        size: ToggleSwitchSize = .medium,
        disabled: Bool = false,
        name: String? = nil,
        value: String? = nil,
        accessibilityLabel: String? = nil
    ) {
        self.controlledChecked = checked
        self._uncontrolledChecked = State(initialValue: defaultChecked)
        self.onChange = onChange
        self.size = size
        self.disabled = disabled
        self.name = name
        self.value = value
        self.accessibilityLabel = accessibilityLabel
    }

    private var checked: Bool {
        controlledChecked?.wrappedValue ?? uncontrolledChecked
    }

    private func setChecked(_ next: Bool) {
        if let binding = controlledChecked {
            binding.wrappedValue = next
        } else {
            uncontrolledChecked = next
        }
        onChange?(next)
    }

    public var body: some View {
        Toggle(isOn: Binding(
            get: { checked },
            set: { setChecked($0) }
        )) {
            EmptyView()
        }
        .toggleStyle(.switch)
        .disabled(disabled)
        .accessibilityLabel(accessibilityLabel ?? "")
        .accessibilityValue(checked ? "on" : "off")
    }

}
// @generated:end
