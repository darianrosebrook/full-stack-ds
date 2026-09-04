// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for Avatar (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum AvatarTokens {
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
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", ref: "semantic.glyph.size.medium.extent", fallback: .string("16px")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", ref: "semantic.glyph.size.medium.extent", fallback: .string("16px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "avatar.size.default": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-default", name: "avatar.size.default", ref: "core.spacing.size.06", fallback: .string("16px")),
            "avatar.size.small": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-small", name: "avatar.size.small", ref: "core.spacing.size.06", fallback: .string("16px")),
            "avatar.size.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-medium", name: "avatar.size.medium", ref: "core.spacing.size.07", fallback: .string("24px")),
            "avatar.size.large": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-large", name: "avatar.size.large", ref: "core.spacing.size.08", fallback: .string("32px")),
            "avatar.size.extra-large": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-extra-large", name: "avatar.size.extra-large", ref: "core.spacing.size.09", fallback: .string("48px")),
            "avatar.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-radius-default", name: "avatar.size.radius.default", ref: "semantic.shape.control.radius.pill", fallback: .string("9999px")),
            "avatar.size.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-size-border-default", name: "avatar.size.border.default", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "avatar.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-color-background-default", name: "avatar.color.background.default", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#f7f7f7", dark: "#313131")),
            "avatar.color.background.inverse": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-color-background-inverse", name: "avatar.color.background.inverse", ref: "semantic.color.background.inverse", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "avatar.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-color-foreground-primary", name: "avatar.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "avatar.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-color-border-default", name: "avatar.color.border.default", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "avatar.typography.fontWeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-typography-font-weight-medium", name: "avatar.typography.fontWeight.medium", ref: "core.typography.weight.medium", fallback: .string("500")),
            "avatar.typography.fontFamily.sans": FsdsComponentTokenDefinition(cssVar: "--fsds-avatar-typography-font-family-sans", name: "avatar.typography.fontFamily.sans", ref: "core.typography.font.family.sans", fallback: .string("\"Inter\", sans-serif")),
        ],
    ]
}

/// Emitted through the src-or-fallback path: the referenced component renders when src is set; the name prop is the fallback content.
public struct Avatar: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        AvatarTokens.scopes
    }
    private let src: String?
    private let name: String?

    public init(
        src: String? = nil,
        name: String? = nil
    ) {
        self.src = src
        self.name = name
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

    @Environment(\.fsdsTheme) private var fsdsTheme

    public var body: some View {
        Group {
            if let src {
                DsSwiftUI.Image(src: src, alt: name)
            } else {
                SwiftUI.Text(name ?? "")
            }
        }
            .frame(width: 40, height: 40)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .background(background)
    }
}
// @generated:end
