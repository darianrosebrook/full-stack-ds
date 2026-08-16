// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum BlockquoteVariant: String, CaseIterable {
    case `default`
    case bordered
    case highlighted
}
public enum BlockquoteSize: String, CaseIterable {
    case sm
    case md
    case lg
}
// @generated:end

// @generated:start component
/// Token scope data for Blockquote (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum BlockquoteTokens {
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
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", fallback: .string("64px")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "blockquote.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-foreground-primary", name: "blockquote.color.foreground.primary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "blockquote.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-background-default", name: "blockquote.color.background.default", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "blockquote.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-border-default", name: "blockquote.color.border.default", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "blockquote.typography.fontStyle": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-typography-font-style", name: "blockquote.typography.fontStyle", fallback: .string("italic")),
            "blockquote.typography.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-typography-font-weight", name: "blockquote.typography.fontWeight", fallback: .string("500")),
            "blockquote.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-default", name: "blockquote.size.padding.default", fallback: .string("12px")),
            "blockquote.size.padding.sm": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-sm", name: "blockquote.size.padding.sm", fallback: .string("8px")),
            "blockquote.size.padding.lg": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-lg", name: "blockquote.size.padding.lg", fallback: .string("24px")),
            "blockquote.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-radius-default", name: "blockquote.size.radius.default", fallback: .string("6px")),
            "blockquote.size.border.thick": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-border-thick", name: "blockquote.size.border.thick", fallback: .string("2px")),
            "blockquote.size.fontSize.sm": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-font-size-sm", name: "blockquote.size.fontSize.sm", fallback: .string("0.875rem")),
            "blockquote.size.fontSize.md": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-font-size-md", name: "blockquote.size.fontSize.md", fallback: .string("1rem")),
            "blockquote.size.fontSize.lg": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-font-size-lg", name: "blockquote.size.fontSize.lg", fallback: .string("1.125rem")),
        ],
        "variant_default": [
            "blockquote.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-background-default", name: "blockquote.color.background.default", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
        ],
        "variant_bordered": [
            "blockquote.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-background-default", name: "blockquote.color.background.default", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "blockquote.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-default", name: "blockquote.size.padding.default", fallback: .string("12px")),
        ],
        "variant_highlighted": [
            "blockquote.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-background-default", name: "blockquote.color.background.default", fallback: .adaptive(light: "#95dafb", dark: "#002782")),
            "blockquote.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-color-foreground-primary", name: "blockquote.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
        ],
        "variant_sm": [
            "blockquote.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-default", name: "blockquote.size.padding.default", fallback: .string("8px")),
            "blockquote.size.fontSize.md": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-font-size-md", name: "blockquote.size.fontSize.md", fallback: .string("0.875rem")),
        ],
        "variant_md": [
            "blockquote.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-default", name: "blockquote.size.padding.default", fallback: .string("12px")),
            "blockquote.size.fontSize.md": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-font-size-md", name: "blockquote.size.fontSize.md", fallback: .string("1rem")),
        ],
        "variant_lg": [
            "blockquote.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-padding-default", name: "blockquote.size.padding.default", fallback: .string("24px")),
            "blockquote.size.fontSize.md": FsdsComponentTokenDefinition(cssVar: "--fsds-blockquote-size-font-size-md", name: "blockquote.size.fontSize.md", fallback: .string("1.125rem")),
        ],
    ]
}

/// Emitted through the static-content path: passive blockquote root with a single consumer content region.
public struct Blockquote<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        BlockquoteTokens.scopes
    }
    private let variant: BlockquoteVariant?
    private let size: BlockquoteSize?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        variant: BlockquoteVariant? = nil,
        size: BlockquoteSize? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.variant = variant
        self.size = size
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", variant.map { "variant_\($0.rawValue)" }, size.map { "variant_\($0.rawValue)" }].compactMap { $0 }
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
