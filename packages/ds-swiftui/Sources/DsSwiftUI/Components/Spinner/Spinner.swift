// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start component
/// Emitted through the visual-only leaf path: a decorative affordance realized natively.
public struct Spinner: View {
    private let label: String?

    public init(
        label: String? = nil
    ) {
        self.label = label
    }

    public var body: some View {
        ProgressView()
            .fsdsAccessibilityLabel(label)
    }
}
// @generated:end
