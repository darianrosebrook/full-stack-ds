// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum AlertIntent: String, CaseIterable {
    case info
    case success
    case warning
    case danger
}
public enum AlertLevel: String, CaseIterable {
    case inline
    case section
    case page
}
// @generated:end

// @generated:start component
/// Token scope data for Alert (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum AlertTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.feedback.size.padding-block", fallback: .string("16px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "semantic.feedback.size.padding-block", fallback: .string("16px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.feedback.size.padding-inline", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "semantic.feedback.size.padding-inline", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.feedback.size.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "alert.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-background-primary", name: "alert.color.background.primary", ref: "semantic.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "alert.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-foreground-primary", name: "alert.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "alert.color.border.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-border-primary", name: "alert.color.border.primary", ref: "semantic.color.border.primary", fallback: .adaptive(light: "#a0a0a1", dark: "#5c5b5c")),
            "alert.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-padding", name: "alert.size.padding", ref: "core.spacing.size.06", fallback: .string("16px")),
            "alert.size.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-radius", name: "alert.size.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "alert.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-spacing-gap", name: "alert.spacing.gap", ref: "semantic.spacing.gap.gridSmall", fallback: .string("8px")),
            "alert.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-text-size", name: "alert.text.size", ref: "semantic.typography.body.03", fallback: .string("14px")),
            "alert.text.weight": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-text-weight", name: "alert.text.weight", ref: "semantic.typography.font.weight.regular", fallback: .string("400")),
            "alert.icon.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-icon-size", name: "alert.icon.size", ref: "core.spacing.size.06", fallback: .string("16px")),
            "alert.typography.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-title-font-weight", name: "alert.typography.title.fontWeight", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
            "alert.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-title-font-size", name: "alert.typography.title.fontSize", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "alert.size.padding.inline": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-padding-inline", name: "alert.size.padding.inline", ref: "core.spacing.size.04", fallback: .string("8px")),
            "alert.size.padding.page": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-padding-page", name: "alert.size.padding.page", ref: "core.spacing.size.07", fallback: .string("24px")),
            "alert.typography.page.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-page-font-size", name: "alert.typography.page.fontSize", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "alert.typography.page.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-page-title-font-size", name: "alert.typography.page.title.fontSize", ref: "semantic.typography.body.01", fallback: .string("18px")),
            "alert.typography.inline.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-inline-font-size", name: "alert.typography.inline.fontSize", ref: "semantic.typography.body.04", fallback: .string("12px")),
        ],
        "variant_info": [
            "alert.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-background-primary", name: "alert.color.background.primary", ref: "semantic.color.background.info.subtle", fallback: .adaptive(light: "#95dafb", dark: "#000a69")),
            "alert.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-foreground-primary", name: "alert.color.foreground.primary", ref: "semantic.color.foreground.on.info.subtle", fallback: .adaptive(light: "#013ab0", dark: "#00a9fb")),
            "alert.color.border.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-border-primary", name: "alert.color.border.primary", ref: "semantic.color.border.info", fallback: .adaptive(light: "#034fd6", dark: "#0566fe")),
        ],
        "variant_success": [
            "alert.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-background-primary", name: "alert.color.background.primary", ref: "semantic.color.background.success.subtle", fallback: .adaptive(light: "#b3dba7", dark: "#0b2200")),
            "alert.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-foreground-primary", name: "alert.color.foreground.primary", ref: "semantic.color.foreground.on.success.subtle", fallback: .adaptive(light: "#2c4f09", dark: "#6eb157")),
            "alert.color.border.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-border-primary", name: "alert.color.border.primary", ref: "semantic.color.border.success", fallback: .adaptive(light: "#3a6614", dark: "#497f21")),
        ],
        "variant_warning": [
            "alert.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-background-primary", name: "alert.color.background.primary", ref: "semantic.color.background.warning.subtle", fallback: .adaptive(light: "#fdc67f", dark: "#341400")),
            "alert.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-foreground-primary", name: "alert.color.foreground.primary", ref: "semantic.color.foreground.on.warning.subtle", fallback: .adaptive(light: "#6c3a00", dark: "#ec8802")),
            "alert.color.border.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-border-primary", name: "alert.color.border.primary", ref: "semantic.color.border.warning", fallback: .adaptive(light: "#8b4b00", dark: "#ae5d00")),
        ],
        "variant_danger": [
            "alert.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-background-primary", name: "alert.color.background.primary", ref: "semantic.color.background.danger.subtle", fallback: .adaptive(light: "#fac2c2", dark: "#440000")),
            "alert.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-foreground-primary", name: "alert.color.foreground.primary", ref: "semantic.color.foreground.on.danger.subtle", fallback: .adaptive(light: "#900909", dark: "#ee8181")),
            "alert.color.border.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-color-border-primary", name: "alert.color.border.primary", ref: "semantic.color.border.danger", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
        ],
        "variant_inline": [
            "alert.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-padding", name: "alert.size.padding", ref: "core.spacing.size.04", fallback: .string("8px")),
            "alert.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-spacing-gap", name: "alert.spacing.gap", ref: "core.spacing.size.03", fallback: .string("4px")),
            "alert.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-text-size", name: "alert.text.size", ref: "semantic.typography.body.04", fallback: .string("12px")),
            "alert.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-title-font-size", name: "alert.typography.title.fontSize", ref: "semantic.typography.body.03", fallback: .string("14px")),
        ],
        "variant_section": [
            "alert.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-padding", name: "alert.size.padding", ref: "core.spacing.size.06", fallback: .string("16px")),
            "alert.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-spacing-gap", name: "alert.spacing.gap", ref: "core.spacing.size.04", fallback: .string("8px")),
            "alert.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-text-size", name: "alert.text.size", ref: "semantic.typography.body.03", fallback: .string("14px")),
            "alert.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-title-font-size", name: "alert.typography.title.fontSize", ref: "semantic.typography.body.02", fallback: .string("16px")),
        ],
        "variant_page": [
            "alert.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-size-padding", name: "alert.size.padding", ref: "core.spacing.size.07", fallback: .string("24px")),
            "alert.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-spacing-gap", name: "alert.spacing.gap", ref: "core.spacing.size.05", fallback: .string("12px")),
            "alert.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-text-size", name: "alert.text.size", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "alert.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-title-font-size", name: "alert.typography.title.fontSize", ref: "semantic.typography.body.01", fallback: .string("18px")),
            "alert.typography.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-typography-title-font-weight", name: "alert.typography.title.fontWeight", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
        ],
    ]
}

/// Emitted through the icon-decorated content path: the icon prop feeds the shared GlyphCatalog registry; content is the consumer's single region.
public struct Alert<IconRegion: View, Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        AlertTokens.scopes
    }
    private let iconRegion: IconRegion
    private let intent: AlertIntent?
    private let level: AlertLevel?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        @ViewBuilder icon: () -> IconRegion = { EmptyView() },
        intent: AlertIntent? = nil,
        level: AlertLevel? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.iconRegion = icon()
        self.intent = intent
        self.level = level
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", intent.map { "variant_\($0.rawValue)" }, level.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var foreground: Color { colorSlot("color.foreground.primary") ?? .primary }
    private var radius: CGFloat { pxSlot("size.radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        HStack(spacing: gap) {
            iconRegion
            content
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
