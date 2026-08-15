// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum ProgressVariant: String, CaseIterable {
    case linear
    case circular
}
public enum ProgressSize: String, CaseIterable {
    case sm
    case md
    case lg
}
public enum ProgressIntent: String, CaseIterable {
    case info
    case success
    case warning
    case danger
}
// @generated:end

// @generated:start component
/// Emitted through the progressbar path: the contract's 0-100 value prop drives a native progress indicator; nil renders indeterminate.
public struct Progress: View {
    private let value: Double?
    private let label: String?

    public init(
        value: Double? = nil,
        label: String? = nil
    ) {
        self.value = value
        self.label = label
    }

    public var body: some View {
        Group {
            if let value {
                ProgressView(value: value / 100)
            } else {
                ProgressView()
            }
        }
            .fsdsAccessibilityLabel(label)
    }
}
// @generated:end
