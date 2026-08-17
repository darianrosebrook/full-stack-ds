// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Emitted through the bare-rule leaf path (hr root).
public enum DividerOrientation: String, CaseIterable {
    case horizontal
    case vertical
}

/// SwiftUI reserves the `Divider` type name; this target exports it as `FsdsDivider`.
public struct FsdsDivider: View {
    private let orientation: DividerOrientation?

    public init(
        orientation: DividerOrientation? = nil
    ) {
        self.orientation = orientation
    }

    public var body: some View {
        if orientation == .vertical {
            Rectangle()
                .fill(.separator)
                .frame(width: 1)
        } else {
            Divider()
        }
    }
}
// @generated:end
