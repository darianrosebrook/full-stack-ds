// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum SkeletonVariant: String, CaseIterable {
    case block
    case text
    case avatar
    case media
    case dataviz
    case actions
}
public enum SkeletonAnimate: String, CaseIterable {
    case shimmer
    case wipe
    case pulse
    case none
}
public enum SkeletonDensity: String, CaseIterable {
    case compact
    case regular
    case spacious
}
public enum SkeletonRadius: String, CaseIterable {
    case sm
    case md
    case lg
}
// @generated:end

// @generated:start component
/// Token scope data for Skeleton (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum SkeletonTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", literal: .string("0")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("1em")),
        ],
    ]
}

/// Emitted through the static-content path: passive div root with a single consumer content region.
public struct Skeleton<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        SkeletonTokens.scopes
    }
    private let variant: SkeletonVariant
    private let animate: SkeletonAnimate
    private let density: SkeletonDensity
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        variant: SkeletonVariant = .block,
        animate: SkeletonAnimate = .shimmer,
        density: SkeletonDensity = .regular,
        @ViewBuilder content: () -> Content = { EmptyView() }
    ) {
        self.variant = variant
        self.animate = animate
        self.density = density
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", "variant_\(variant.rawValue)", "variant_\(animate.rawValue)", "variant_\(density.rawValue)"]
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
    }
}
// @generated:end
