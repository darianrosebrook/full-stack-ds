// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for ProfileFlag (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum ProfileFlagTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("2px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("2px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("4px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("4px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", literal: .string("0")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "semantic.glyph.size.medium.extent", fallback: .string("16px")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "profile-flag.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-color-background-default", name: "profile-flag.color.background.default", ref: "semantic.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "profile-flag.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-color-border-default", name: "profile-flag.color.border.default", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "profile-flag.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-color-foreground-primary", name: "profile-flag.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "profile-flag.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-size-radius-default", name: "profile-flag.size.radius.default", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "profile-flag.spacing.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-spacing-gap-default", name: "profile-flag.spacing.gap.default", ref: "core.spacing.size.03", fallback: .string("4px")),
            "profile-flag.spacing.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-spacing-padding-default", name: "profile-flag.spacing.padding.default", ref: "core.spacing.size.04", fallback: .string("8px")),
            "profile-flag.spacing.padding.right": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-spacing-padding-right", name: "profile-flag.spacing.padding.right", ref: "core.spacing.size.06", fallback: .string("16px")),
            "profile-flag.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-profile-flag-color-border-hover", name: "profile-flag.color.border.hover", ref: "semantic.color.border.bold", fallback: .adaptive(light: "#888889", dark: "#727272")),
        ],
    ]
}

/// Emitted through the static-content path: passive div root with a single consumer content region.
public struct ProfileFlag<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        ProfileFlagTokens.scopes
    }
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root"]
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var background: Color { colorSlot("color.background.default") ?? .accentColor }
    private var foreground: Color { colorSlot("color.foreground.primary") ?? .primary }
    private var borderColor: Color { colorSlot("color.border.default") ?? .clear }
    private var radius: CGFloat { pxSlot("size.radius.default") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
