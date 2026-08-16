// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Emitted through the glyph-host path: the dom carries iconGlyph, so this component is a registry lookup over the shared glyph substrate — decorative-by-default per catalog semantics.
public enum IconSize: String, CaseIterable {
    case sm
    case md
    case lg
    case xl
}

public struct Icon: View {
    private let name: String
    private let size: IconSize

    public init(
        name: String,
        size: IconSize = .md
    ) {
        self.name = name
        self.size = size
    }

    private var glyphSize: CGFloat {
        switch size {
        case .sm: return 16
        case .md: return 20
        case .lg: return 24
        case .xl: return 32
        }
    }

    public var body: some View {
        GlyphCatalog.glyph(named: name, size: glyphSize)
            .accessibilityHidden(
                GlyphCatalog.decorativeDefaults.contains(name)
            )
    }
}
// @generated:end
