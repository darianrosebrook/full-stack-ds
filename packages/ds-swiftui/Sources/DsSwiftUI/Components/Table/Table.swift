// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for FsdsTable (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum TableTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.structure.size.gap", fallback: .string("16px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "table.color.text": FsdsComponentTokenDefinition(cssVar: "--fsds-table-color-text", name: "table.color.text", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "table.color.textMuted": FsdsComponentTokenDefinition(cssVar: "--fsds-table-color-text-muted", name: "table.color.textMuted", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "table.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-table-color-border", name: "table.color.border", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "table.color.background.footer": FsdsComponentTokenDefinition(cssVar: "--fsds-table-color-background-footer", name: "table.color.background.footer", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#f7f7f7", dark: "#313131")),
            "table.border.width": FsdsComponentTokenDefinition(cssVar: "--fsds-table-border-width", name: "table.border.width", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "table.spacing.cellX": FsdsComponentTokenDefinition(cssVar: "--fsds-table-spacing-cell-x", name: "table.spacing.cellX", ref: "core.spacing.size.03", fallback: .string("4px")),
            "table.spacing.cellY": FsdsComponentTokenDefinition(cssVar: "--fsds-table-spacing-cell-y", name: "table.spacing.cellY", ref: "core.spacing.size.02", fallback: .string("2px")),
            "table.spacing.caption": FsdsComponentTokenDefinition(cssVar: "--fsds-table-spacing-caption", name: "table.spacing.caption", ref: "core.spacing.size.04", fallback: .string("8px")),
            "table.spacing.sortGap": FsdsComponentTokenDefinition(cssVar: "--fsds-table-spacing-sort-gap", name: "table.spacing.sortGap", ref: "core.spacing.size.02", fallback: .string("2px")),
            "table.size.cellHeight": FsdsComponentTokenDefinition(cssVar: "--fsds-table-size-cell-height", name: "table.size.cellHeight", ref: "semantic.control.size.md.height", fallback: .string("32px")),
            "table.size.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-table-size-radius", name: "table.size.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "table.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-table-text-size", name: "table.text.size", ref: "semantic.typography.body.03", fallback: .string("14px")),
            "table.text.lineHeight": FsdsComponentTokenDefinition(cssVar: "--fsds-table-text-line-height", name: "table.text.lineHeight", ref: "semantic.typography.line.height.normal", fallback: .string("1.5")),
            "table.text.sizeCaption": FsdsComponentTokenDefinition(cssVar: "--fsds-table-text-size-caption", name: "table.text.sizeCaption", ref: "semantic.typography.body.04", fallback: .string("12px")),
            "table.text.weightHead": FsdsComponentTokenDefinition(cssVar: "--fsds-table-text-weight-head", name: "table.text.weightHead", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
            "table.text.weightFooter": FsdsComponentTokenDefinition(cssVar: "--fsds-table-text-weight-footer", name: "table.text.weightFooter", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "table.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-table-color-background-hover", name: "table.color.background.hover", ref: "semantic.interaction.background.hover", fallback: .adaptive(light: "#f7f7f7", dark: "#313131")),
            "table.color.background.selected": FsdsComponentTokenDefinition(cssVar: "--fsds-table-color-background-selected", name: "table.color.background.selected", ref: "semantic.color.background.accentSubtle", fallback: .adaptive(light: "#95dafb", dark: "#002782")),
            "table.focus.width": FsdsComponentTokenDefinition(cssVar: "--fsds-table-focus-width", name: "table.focus.width", ref: "semantic.shape.control.border.focusWidth", fallback: .string("2px")),
            "table.focus.color": FsdsComponentTokenDefinition(cssVar: "--fsds-table-focus-color", name: "table.focus.color", ref: "semantic.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "table.focus.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-table-focus-offset", name: "table.focus.offset", ref: "core.spacing.size.01", fallback: .string("1px")),
        ],
    ]
}

/// Emitted through the static-content path: passive div root with a single consumer content region.
/// SwiftUI reserves the `Table` type name; this target exports it as `FsdsTable`.
public struct FsdsTable<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        TableTokens.scopes
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

    private var borderColor: Color { colorSlot("color.border") ?? .clear }
    private var radius: CGFloat { pxSlot("size.radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }
}
// @generated:end
