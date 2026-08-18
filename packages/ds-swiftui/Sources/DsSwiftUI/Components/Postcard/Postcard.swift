// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for Postcard (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum PostcardTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.surface.size.padding-block", fallback: .string("16px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "semantic.surface.size.padding-block", fallback: .string("16px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.surface.size.padding-inline", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "semantic.surface.size.padding-inline", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.surface.size.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", ref: "semantic.surface.size.min-width", fallback: .string("64px")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "postcard.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-background-default", name: "postcard.color.background.default", ref: "semantic.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "postcard.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-background-hover", name: "postcard.color.background.hover", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "postcard.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-border-default", name: "postcard.color.border.default", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "postcard.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-border-hover", name: "postcard.color.border.hover", ref: "semantic.color.border.bold", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "postcard.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-foreground-primary", name: "postcard.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "postcard.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-padding-default", name: "postcard.size.padding.default", ref: "core.spacing.size.06", fallback: .string("16px")),
            "postcard.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-radius-default", name: "postcard.size.radius.default", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "postcard.size.radius.full": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-radius-full", name: "postcard.size.radius.full", ref: "semantic.shape.control.radius.pill", fallback: .string("9999px")),
            "postcard.size.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-gap-default", name: "postcard.size.gap.default", ref: "core.spacing.size.05", fallback: .string("12px")),
            "postcard.size.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-border-default", name: "postcard.size.border.default", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "postcard.typography.displayName.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-typography-display-name-font-size", name: "postcard.typography.displayName.fontSize", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "postcard.typography.displayName.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-typography-display-name-font-weight", name: "postcard.typography.displayName.fontWeight", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "postcard.typography.handle.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-typography-handle-font-size", name: "postcard.typography.handle.fontSize", ref: "semantic.typography.body.03", fallback: .string("14px")),
            "postcard.typography.content.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-typography-content-font-size", name: "postcard.typography.content.fontSize", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "postcard.typography.content.lineHeight": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-typography-content-line-height", name: "postcard.typography.content.lineHeight", ref: "semantic.typography.line.height.body", fallback: .string("1.5")),
            "postcard.typography.footer.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-typography-footer-font-size", name: "postcard.typography.footer.fontSize", ref: "semantic.typography.body.03", fallback: .string("14px")),
        ],
        "part_userInfo": [
            "postcard.size.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-gap-default", name: "postcard.size.gap.default", ref: "core.spacing.size.03", fallback: .string("4px")),
        ],
        "part_handle": [
            "postcard.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-foreground-primary", name: "postcard.color.foreground.primary", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
        ],
        "part_timestamp": [
            "postcard.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-foreground-primary", name: "postcard.color.foreground.primary", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
        ],
        "part_stat": [
            "postcard.size.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-size-gap-default", name: "postcard.size.gap.default", ref: "core.spacing.size.03", fallback: .string("4px")),
            "postcard.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-postcard-color-foreground-primary", name: "postcard.color.foreground.primary", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
        ],
    ]
}

/// Emitted through the static-content path: passive article root with a single consumer content region.
public struct Postcard<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        PostcardTokens.scopes
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
    private var borderWidth: CGFloat { pxSlot("size.border.default") ?? 0 }
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
