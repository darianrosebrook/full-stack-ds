// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum ImageAspectRatio: String, CaseIterable {
    case square
    case video
    case photo
    case wide
    case portrait
}
public enum ImageObjectFit: String, CaseIterable {
    case cover
    case contain
    case fill
    case scaleDown = "scale-down"
    case none
}
public enum ImageLoading: String, CaseIterable {
    case lazy
    case eager
}
public enum ImageRadius: String, CaseIterable {
    case none
    case sm
    case md
    case lg
    case full
}
// @generated:end

// @generated:start component
/// Emitted through the media-leaf path: src drives an AsyncImage; alt lowers through the conditional a11y helper.
public struct Image: View {
    private let src: String
    private let alt: String?
    private let width: CGFloat?
    private let height: CGFloat?

    public init(
        src: String,
        alt: String? = nil,
        width: CGFloat? = nil,
        height: CGFloat? = nil
    ) {
        self.src = src
        self.alt = alt
        self.width = width
        self.height = height
    }

    public var body: some View {
        AsyncImage(url: URL(string: src)) { phase in
            if let image = phase.image {
                image.resizable().scaledToFit()
            } else if phase.error != nil {
                SwiftUI.Image(systemName: "photo")
            } else {
                ProgressView()
            }
        }
            .frame(
                width: width, height: height
            )
            .fsdsAccessibilityLabel(alt)
    }
}
// @generated:end
