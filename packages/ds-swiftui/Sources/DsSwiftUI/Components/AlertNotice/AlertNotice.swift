// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum AlertNoticeStatus: String, CaseIterable {
    case info
    case success
    case warning
    case error
}
public enum AlertNoticeLevel: String, CaseIterable {
    case page
    case section
    case inline
}
// @generated:end

// @generated:start component
/// Token scope data for AlertNotice (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum AlertNoticeTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", fallback: .string("16px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", fallback: .string("16px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "alert-notice.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-primary", name: "alert-notice.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "alert-notice.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-foreground-primary", name: "alert-notice.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "alert-notice.color.background.info": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-info", name: "alert-notice.color.background.info", fallback: .adaptive(light: "#95dafb", dark: "#000a69")),
            "alert-notice.color.background.success": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-success", name: "alert-notice.color.background.success", fallback: .adaptive(light: "#b3dba7", dark: "#0b2200")),
            "alert-notice.color.background.warning": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-warning", name: "alert-notice.color.background.warning", fallback: .adaptive(light: "#fdc67f", dark: "#341400")),
            "alert-notice.color.background.danger": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-danger", name: "alert-notice.color.background.danger", fallback: .adaptive(light: "#fac2c2", dark: "#440000")),
            "alert-notice.color.foreground.info": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-foreground-info", name: "alert-notice.color.foreground.info", fallback: .adaptive(light: "#013ab0", dark: "#00a9fb")),
            "alert-notice.color.foreground.success": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-foreground-success", name: "alert-notice.color.foreground.success", fallback: .adaptive(light: "#2c4f09", dark: "#6eb157")),
            "alert-notice.color.foreground.warning": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-foreground-warning", name: "alert-notice.color.foreground.warning", fallback: .adaptive(light: "#6c3a00", dark: "#ec8802")),
            "alert-notice.color.foreground.danger": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-foreground-danger", name: "alert-notice.color.foreground.danger", fallback: .adaptive(light: "#900909", dark: "#ee8181")),
            "alert-notice.color.border.info": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-border-info", name: "alert-notice.color.border.info", fallback: .adaptive(light: "#034fd6", dark: "#0566fe")),
            "alert-notice.color.border.success": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-border-success", name: "alert-notice.color.border.success", fallback: .adaptive(light: "#3a6614", dark: "#497f21")),
            "alert-notice.color.border.warning": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-border-warning", name: "alert-notice.color.border.warning", fallback: .adaptive(light: "#8b4b00", dark: "#ae5d00")),
            "alert-notice.color.border.danger": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-border-danger", name: "alert-notice.color.border.danger", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
            "alert-notice.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-padding", name: "alert-notice.size.padding", fallback: .string("16px")),
            "alert-notice.size.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-radius", name: "alert-notice.size.radius", fallback: .string("6px")),
            "alert-notice.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-spacing-gap", name: "alert-notice.spacing.gap", fallback: .string("8px")),
            "alert-notice.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-text-size", name: "alert-notice.text.size", fallback: .string("14px")),
            "alert-notice.text.weight": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-text-weight", name: "alert-notice.text.weight", fallback: .string("400")),
            "alert-notice.icon.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-icon-size", name: "alert-notice.icon.size", fallback: .string("16px")),
            "alert-notice.typography.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-title-font-weight", name: "alert-notice.typography.title.fontWeight", fallback: .string("700")),
            "alert-notice.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-title-font-size", name: "alert-notice.typography.title.fontSize", fallback: .string("16px")),
            "alert-notice.size.padding.inline": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-padding-inline", name: "alert-notice.size.padding.inline", fallback: .string("8px")),
            "alert-notice.size.padding.page": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-padding-page", name: "alert-notice.size.padding.page", fallback: .string("24px")),
            "alert-notice.typography.page.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-page-font-size", name: "alert-notice.typography.page.fontSize", fallback: .string("16px")),
            "alert-notice.typography.page.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-page-title-font-size", name: "alert-notice.typography.page.title.fontSize", fallback: .string("18px")),
            "alert-notice.typography.inline.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-inline-font-size", name: "alert-notice.typography.inline.fontSize", fallback: .string("12px")),
        ],
        "variant_inline": [
            "alert-notice.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-padding", name: "alert-notice.size.padding", fallback: .string("8px")),
            "alert-notice.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-spacing-gap", name: "alert-notice.spacing.gap", fallback: .string("4px")),
            "alert-notice.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-text-size", name: "alert-notice.text.size", fallback: .string("12px")),
            "alert-notice.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-title-font-size", name: "alert-notice.typography.title.fontSize", fallback: .string("14px")),
        ],
        "variant_section": [
            "alert-notice.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-padding", name: "alert-notice.size.padding", fallback: .string("16px")),
            "alert-notice.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-spacing-gap", name: "alert-notice.spacing.gap", fallback: .string("8px")),
            "alert-notice.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-text-size", name: "alert-notice.text.size", fallback: .string("14px")),
            "alert-notice.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-title-font-size", name: "alert-notice.typography.title.fontSize", fallback: .string("16px")),
        ],
        "variant_page": [
            "alert-notice.size.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-padding", name: "alert-notice.size.padding", fallback: .string("24px")),
            "alert-notice.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-spacing-gap", name: "alert-notice.spacing.gap", fallback: .string("12px")),
            "alert-notice.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-text-size", name: "alert-notice.text.size", fallback: .string("16px")),
            "alert-notice.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-title-font-size", name: "alert-notice.typography.title.fontSize", fallback: .string("18px")),
            "alert-notice.typography.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-typography-title-font-weight", name: "alert-notice.typography.title.fontWeight", fallback: .string("700")),
            "alert-notice.color.background.info": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-info", name: "alert-notice.color.background.info", fallback: .adaptive(light: "#cfeefe", dark: "#000a69")),
            "alert-notice.color.background.success": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-success", name: "alert-notice.color.background.success", fallback: .adaptive(light: "#ddefd8", dark: "#0b2200")),
            "alert-notice.color.background.warning": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-warning", name: "alert-notice.color.background.warning", fallback: .adaptive(light: "#ffe6c8", dark: "#341400")),
            "alert-notice.color.background.danger": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-background-danger", name: "alert-notice.color.background.danger", fallback: .adaptive(light: "#fee4e4", dark: "#440000")),
        ],
    ]
}

/// Emitted through the icon-decorated content path: the icon prop feeds the shared GlyphCatalog registry; content is the consumer's single region.
public struct AlertNotice<IconRegion: View, Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        AlertNoticeTokens.scopes
    }
    private let iconRegion: IconRegion
    private let status: AlertNoticeStatus?
    private let level: AlertNoticeLevel?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        @ViewBuilder icon: () -> IconRegion = { EmptyView() },
        status: AlertNoticeStatus? = nil,
        level: AlertNoticeLevel? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.iconRegion = icon()
        self.status = status
        self.level = level
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", status.map { "variant_\($0.rawValue)" }, level.map { "variant_\($0.rawValue)" }].compactMap { $0 }
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
