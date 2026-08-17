// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum SelectSize: String, CaseIterable {
    case sm
    case md
    case lg
}
// @generated:end

// @generated:start component
public struct SelectOption: Identifiable {
    public var id: String { value }
    public let value: String
    public let label: String
    public let disabled: Bool?
    public init(
        value: String,        label: String,        disabled: Bool? = nil
    ) {
        self.value = value
        self.label = label
        self.disabled = disabled
    }
}

/// Emitted through the selection-control path: the union channel lowers to SelectionState (mode-gated replace/toggle — the channelUpdate grammar); Menu realizes the combobox substrate; the channelCall binding is a Menu item action.
public struct Select: View {
    private let options: [SelectOption]
    @StateObject private var selection: SelectionState
    @StateObject private var open: ControllableValue<Bool>
    private let size: SelectSize
    private let disabled: Bool

    public init(
        options: [SelectOption] = [],
        selection: Binding<String>? = nil,
        defaultSelection: String = "",
        multipleSelection: Binding<[String]>? = nil,
        defaultMultipleSelection: [String] = [],
        multiple: Bool = false,
        onSelectionChange: ((Any) -> Void)? = nil,
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        size: SelectSize = .md,
        disabled: Bool = false
    ) {
        self.options = options
        self._selection = StateObject(wrappedValue: SelectionState(
            selection: selection,
            defaultSelection: defaultSelection,
            multipleSelection: multipleSelection,
            defaultMultipleSelection: defaultMultipleSelection,
            multiple: multiple,
            onSelectionChange: onSelectionChange
        ))
        self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))
        self.size = size
        self.disabled = disabled
    }

    private var triggerLabel: String {
        selection.multiple
            ? options.filter { selection.isSelected($0.value) }.map(\.label).joined(separator: ", ")
            : (options.first { selection.isSelected($0.value) }?.label ?? selection.single)
    }

    public var body: some View {
        Menu {
            ForEach(options) { option in
                Button {
                    selection.apply(option.value)
                } label: {
                    if selection.isSelected(option.value) {
                        SwiftUI.Image(systemName: "checkmark")
                    }
                    Text(option.label)
                }
                .disabled(option.disabled ?? false)
            }
        } label: {
            HStack {
                Text(triggerLabel)
                SwiftUI.Image(systemName: "chevron.up.and.down")
            }
        }
        .disabled(disabled)
    }
}
// @generated:end
