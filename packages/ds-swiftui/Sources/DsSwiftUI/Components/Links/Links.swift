// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum LinkTarget: String, CaseIterable {
    case _self
    case _blank
    case _parent
    case _top
}
public enum LinkSize: String, CaseIterable {
    case small
    case medium
    case large
}
// @generated:end

// @generated:start component
/// Token scope data for Links (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum LinksTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("4px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "links.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-links-color-foreground-default", name: "links.color.foreground.default", fallback: .string("#d92d2e")),
            "links.color.foreground.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-links-color-foreground-hover", name: "links.color.foreground.hover", fallback: .string("#b31b1b")),
            "links.color.foreground.visited": FsdsComponentTokenDefinition(cssVar: "--fsds-links-color-foreground-visited", name: "links.color.foreground.visited", fallback: .string("#e55b5a")),
            "links.color.foreground.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-links-color-foreground-disabled", name: "links.color.foreground.disabled", fallback: .string("#727272")),
            "links.color.underline.default": FsdsComponentTokenDefinition(cssVar: "--fsds-links-color-underline-default", name: "links.color.underline.default", fallback: .string("#b8b8b8")),
            "links.spacing.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-links-spacing-gap-default", name: "links.spacing.gap.default", fallback: .string("2px")),
            "links.motion.duration.fast": FsdsComponentTokenDefinition(cssVar: "--fsds-links-motion-duration-fast", name: "links.motion.duration.fast", fallback: .string("150ms")),
            "links.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-links-focus-ring-width", name: "links.focus.ring.width", fallback: .string("2px")),
            "links.focus.ring.color": FsdsComponentTokenDefinition(cssVar: "--fsds-links-focus-ring-color", name: "links.focus.ring.color", fallback: .string("#0566fe")),
            "links.focus.ring.style": FsdsComponentTokenDefinition(cssVar: "--fsds-links-focus-ring-style", name: "links.focus.ring.style", fallback: .string("solid")),
            "links.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-links-focus-ring-offset", name: "links.focus.ring.offset", fallback: .string("2px")),
            "links.focus.ring.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-links-focus-ring-radius", name: "links.focus.ring.radius", fallback: .string("4px")),
            "links.size.fontSize.small": FsdsComponentTokenDefinition(cssVar: "--fsds-links-size-font-size-small", name: "links.size.fontSize.small", fallback: .string("0.875rem")),
            "links.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-links-size-font-size-medium", name: "links.size.fontSize.medium", fallback: .string("1rem")),
            "links.size.fontSize.large": FsdsComponentTokenDefinition(cssVar: "--fsds-links-size-font-size-large", name: "links.size.fontSize.large", fallback: .string("1.125rem")),
        ],
        "variant_small": [
            "links.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-links-size-font-size-medium", name: "links.size.fontSize.medium", fallback: .string("0.875rem")),
        ],
        "variant_medium": [
            "links.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-links-size-font-size-medium", name: "links.size.fontSize.medium", fallback: .string("1rem")),
        ],
        "variant_large": [
            "links.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-links-size-font-size-medium", name: "links.size.fontSize.medium", fallback: .string("1.125rem")),
        ],
    ]
}

/// Emitted through the static-content path: passive a root with a single consumer content region.
public struct Links<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        LinksTokens.scopes
    }
    private let size: LinkSize?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        size: LinkSize? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.size = size
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", size.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var foreground: Color { colorSlot("color.foreground.default") ?? .primary }
    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
