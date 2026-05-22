// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum SwitchSize: String, CaseIterable {
    case sm
    case md
    case lg
}
// @generated:end

// @generated:start component
public struct Switch: View {
    private let controlledChecked: Binding<Bool>?
    @State private var uncontrolledChecked: Bool
    private let onChange: ((Bool) -> Void)?
    private let size: SwitchSize
    private let disabled: Bool
    private let name: String?
    private let value: String?
    private let accessibilityLabel: String?

    public init(
        checked: Binding<Bool>? = nil,
        defaultChecked: Bool = false,
        onChange: ((Bool) -> Void)? = nil,
        size: SwitchSize = .md,
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
        .frame(width: trackWidth, height: trackHeight)
    }

    private var trackWidth: CGFloat {
        switch size {
        case .sm: return 48
        case .md: return 48
        case .lg: return 48
        }
    }

    private var trackHeight: CGFloat {
        switch size {
        case .sm: return 24
        case .md: return 24
        case .lg: return 24
        }
    }
}
// @generated:end
