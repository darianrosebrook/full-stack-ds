// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum NavTreeIconSize: String, CaseIterable {
    case sm
    case md
}
// @generated:end

// @generated:start component
/// Emitted through the glyph-host path: the dom carries iconGlyph, so this component is a registry lookup over the shared glyph substrate — decorative-by-default per catalog semantics.
public struct NavTree: View {
    private let icon: String
    private let iconSize: NavTreeIconSize

    public init(
        icon: String,
        iconSize: NavTreeIconSize = .sm
    ) {
        self.icon = icon
        self.iconSize = iconSize
    }

    private var glyphSize: CGFloat {
        switch iconSize {
        case .sm: return 16
        case .md: return 20
        }
    }

    public var body: some View {
        GlyphCatalog.glyph(named: icon, size: glyphSize)
            .accessibilityHidden(
                GlyphCatalog.decorativeDefaults.contains(icon)
            )
    }
}
// @generated:end
