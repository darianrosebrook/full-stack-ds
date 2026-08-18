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
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", literal: .string("0")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("100%")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("1em")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "skeleton.color.base": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-color-base", name: "skeleton.color.base", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "skeleton.color.highlight": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-color-highlight", name: "skeleton.color.highlight", ref: "semantic.color.background.highlight", fallback: .adaptive(light: "#f5a2a1", dark: "#900909")),
            "skeleton.color.static": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-color-static", name: "skeleton.color.static", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "skeleton.radius.sm": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-sm", name: "skeleton.radius.sm", ref: "semantic.shape.radius.small", fallback: .string("4px")),
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.radius.medium", fallback: .string("8px")),
            "skeleton.radius.lg": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-lg", name: "skeleton.radius.lg", ref: "semantic.shape.radius.large", fallback: .string("16px")),
            "skeleton.radius.full": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-full", name: "skeleton.radius.full", ref: "semantic.shape.control.radius.pill", fallback: .string("9999px")),
            "skeleton.gap.compact": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-gap-compact", name: "skeleton.gap.compact", ref: "core.spacing.size.03", fallback: .string("4px")),
            "skeleton.gap.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-gap-md", name: "skeleton.gap.md", ref: "core.spacing.size.05", fallback: .string("12px")),
            "skeleton.gap.spacious": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-gap-spacious", name: "skeleton.gap.spacious", ref: "core.spacing.size.07", fallback: .string("24px")),
            "skeleton.anim.duration": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-anim-duration", name: "skeleton.anim.duration", ref: "core.motion.duration.long", fallback: .string("400ms")),
            "skeleton.anim.easing": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-anim-easing", name: "skeleton.anim.easing", ref: "core.motion.easing.standard", fallback: .string("cubic-bezier(0.4, 0, 0.2, 1)")),
            "skeleton.shape.height.text": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-shape-height-text", name: "skeleton.shape.height.text", ref: "core.typography.ramp.4", fallback: .string("1rem")),
        ],
        "variant_block": [
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.radius.medium", fallback: .string("8px")),
        ],
        "variant_text": [
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.radius.small", fallback: .string("4px")),
            "skeleton.shape.height.text": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-shape-height-text", name: "skeleton.shape.height.text", ref: "core.typography.ramp.4", fallback: .string("1rem")),
        ],
        "variant_avatar": [
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.control.radius.pill", fallback: .string("9999px")),
        ],
        "variant_media": [
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.radius.medium", fallback: .string("8px")),
        ],
        "variant_dataviz": [
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.radius.medium", fallback: .string("8px")),
        ],
        "variant_actions": [
            "skeleton.radius.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-radius-md", name: "skeleton.radius.md", ref: "semantic.shape.radius.medium", fallback: .string("8px")),
        ],
        "variant_wipe": [
            "skeleton.color.base": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-color-base", name: "skeleton.color.base", ref: "semantic.color.background.tertiary", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
        ],
        "variant_compact": [
            "skeleton.gap.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-gap-md", name: "skeleton.gap.md", ref: "skeleton.gap.compact", fallback: .string("4px")),
        ],
        "variant_regular": [
            "skeleton.gap.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-gap-md", name: "skeleton.gap.md", ref: "core.spacing.size.05", fallback: .string("12px")),
        ],
        "variant_spacious": [
            "skeleton.gap.md": FsdsComponentTokenDefinition(cssVar: "--fsds-skeleton-gap-md", name: "skeleton.gap.md", ref: "skeleton.gap.spacious", fallback: .string("24px")),
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
