// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum CalendarMode: String, CaseIterable {
    case single
    case range
}
// @generated:end

// @generated:start component

/// Emitted through the date-grid surface path: chrome shell over the value channel; grid realization is a recorded follow-up.
public struct Calendar: View {
    @StateObject private var value: ControllableValue<Date?>
    private let disabled: Bool

    public init(
        value: Binding<Date?>? = nil,
        defaultValue: Date? = nil,
        onChange: ((Date?) -> Void)? = nil,
        disabled: Bool = false
    ) {
        self._value = StateObject(wrappedValue: ControllableValue(controlled: value, defaultValue: defaultValue, onChange: onChange))
        self.disabled = disabled
    }

    public var body: some View {
        VStack(spacing: 8) {
            SwiftUI.DatePicker(
                "",
                selection: Binding(
                    get: { value.value ?? Date() },
                    set: { value.set($0) }
                )
            )
                .disabled(disabled)
        }
    }
}
// @generated:end
