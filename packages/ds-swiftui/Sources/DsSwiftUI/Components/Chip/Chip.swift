// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum ChipType: String, CaseIterable {
    case button
    case submit
    case reset
}
public enum ChipVariant: String, CaseIterable {
    case `default`
    case selected
    case dismissible
}
public enum ChipSize: String, CaseIterable {
    case small
    case medium
    case large
}
// @generated:end

// @generated:start component
/// Emitted through the dual-action chip path: the owned Button components compose the action/dismiss pair (same-module FsdsButton).
public struct Chip<Text: View, IconRegion: View>: View {
    private let disabled: Bool
    private let dismissible: Bool
    private let onClick: (() -> Void)?
    private let onDismiss: (() -> Void)?
    private let accessibilityLabel: String?
    private let iconRegion: IconRegion
    private let text: Text

    public init(
        disabled: Bool = false,
        dismissible: Bool = false,
        onClick: (() -> Void)? = nil,
        onDismiss: (() -> Void)? = nil,
        accessibilityLabel: String? = nil,
        @ViewBuilder icon: () -> IconRegion = { EmptyView() },
        @ViewBuilder text: () -> Text
    ) {
        self.disabled = disabled
        self.dismissible = dismissible
        self.onClick = onClick
        self.onDismiss = onDismiss
        self.accessibilityLabel = accessibilityLabel
        self.iconRegion = icon()
        self.text = text()
    }

    public var body: some View {
        HStack(spacing: 4) {
            FsdsButton(
                disabled: disabled,
                onTap: onClick
            ) {
                iconRegion
                text
            }
            .fsdsAccessibilityLabel(accessibilityLabel)
            if dismissible {
                FsdsButton(
                    disabled: disabled,
                    onTap: onDismiss
                ) {
                    SwiftUI.Image(systemName: "xmark")
                }
                .fsdsAccessibilityLabel("Dismiss")
            }
        }
    }
}
// @generated:end
