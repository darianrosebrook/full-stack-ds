// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum TextElement: String, CaseIterable {
    case p
    case span
    case div
    case h1
    case h2
    case h3
    case h4
    case h5
    case h6
}
public enum TextVariant: String, CaseIterable {
    case display
    case headline
    case title
    case body
    case caption
    case overline
    case code
}
public enum TextSize: String, CaseIterable {
    case xs
    case sm
    case md
    case lg
    case xl
    case `2xl`
    case `3xl`
}
public enum TextWeight: String, CaseIterable {
    case light
    case normal
    case medium
    case semibold
    case bold
}
public enum TextAlign: String, CaseIterable {
    case left
    case center
    case right
    case justify
}
public enum TextTransform: String, CaseIterable {
    case none
    case uppercase
    case lowercase
    case capitalize
}
// @generated:end

// @generated:start component
/// Token scope data for Text (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum TextTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.display.size.gap", fallback: .string("4px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "text.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-text-color-foreground-primary", name: "text.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "text.typography.fontWeight.light": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-light", name: "text.typography.fontWeight.light", ref: "semantic.typography.font.weight.light", fallback: .string("300")),
            "text.typography.fontWeight.regular": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-regular", name: "text.typography.fontWeight.regular", ref: "semantic.typography.font.weight.regular", fallback: .string("400")),
            "text.typography.fontWeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-medium", name: "text.typography.fontWeight.medium", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "text.typography.fontWeight.bold": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-bold", name: "text.typography.fontWeight.bold", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
            "text.typography.lineHeight.heading": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-line-height-heading", name: "text.typography.lineHeight.heading", ref: "semantic.typography.line.height.heading", fallback: .string("1")),
            "text.typography.lineHeight.body": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-line-height-body", name: "text.typography.lineHeight.body", ref: "semantic.typography.line.height.body", fallback: .string("1.5")),
            "text.typography.lineHeight.tight": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-line-height-tight", name: "text.typography.lineHeight.tight", ref: "semantic.typography.line.height.tight", fallback: .string("1.2")),
            "text.typography.letterSpacing.wide": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-letter-spacing-wide", name: "text.typography.letterSpacing.wide", ref: "semantic.typography.letter.spacing.wide", fallback: .string("0.018rem")),
            "text.typography.letterSpacing.tight": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-letter-spacing-tight", name: "text.typography.letterSpacing.tight", ref: "semantic.typography.letter.spacing.tight", fallback: .string("-0.018rem")),
            "text.size.xs": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-xs", name: "text.size.xs", ref: "core.typography.ramp.2", fallback: .string("0.75rem")),
            "text.size.sm": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-sm", name: "text.size.sm", ref: "core.typography.ramp.3", fallback: .string("0.875rem")),
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.4", fallback: .string("1rem")),
            "text.size.lg": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-lg", name: "text.size.lg", ref: "core.typography.ramp.5", fallback: .string("1.125rem")),
            "text.size.xl": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-xl", name: "text.size.xl", ref: "core.typography.ramp.6", fallback: .string("1.25rem")),
            "text.size.2xl": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-2xl", name: "text.size.2xl", ref: "core.typography.ramp.7", fallback: .string("1.5rem")),
            "text.size.3xl": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-3xl", name: "text.size.3xl", ref: "core.typography.ramp.8", fallback: .string("2rem")),
        ],
        "variant_display": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.11", fallback: .string("3.75rem")),
            "text.typography.fontWeight.bold": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-bold", name: "text.typography.fontWeight.bold", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
        ],
        "variant_headline": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.8", fallback: .string("2rem")),
            "text.typography.fontWeight.bold": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-bold", name: "text.typography.fontWeight.bold", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
        ],
        "variant_title": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.6", fallback: .string("1.25rem")),
            "text.typography.fontWeight.bold": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-bold", name: "text.typography.fontWeight.bold", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
        ],
        "variant_body": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.4", fallback: .string("1rem")),
            "text.typography.fontWeight.regular": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-regular", name: "text.typography.fontWeight.regular", ref: "semantic.typography.font.weight.regular", fallback: .string("400")),
        ],
        "variant_caption": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.2", fallback: .string("0.75rem")),
            "text.typography.fontWeight.regular": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-regular", name: "text.typography.fontWeight.regular", ref: "semantic.typography.font.weight.regular", fallback: .string("400")),
        ],
        "variant_overline": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.2", fallback: .string("0.75rem")),
            "text.typography.fontWeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-medium", name: "text.typography.fontWeight.medium", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
        ],
        "variant_code": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.3", fallback: .string("0.875rem")),
        ],
        "variant_xs": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "text.size.xs", fallback: .string("0.75rem")),
        ],
        "variant_sm": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "text.size.sm", fallback: .string("0.875rem")),
        ],
        "variant_md": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "core.typography.ramp.4", fallback: .string("1rem")),
        ],
        "variant_lg": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "text.size.lg", fallback: .string("1.125rem")),
        ],
        "variant_xl": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "text.size.xl", fallback: .string("1.25rem")),
        ],
        "variant_2xl": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "text.size.2xl", fallback: .string("1.5rem")),
        ],
        "variant_3xl": [
            "text.size.md": FsdsComponentTokenDefinition(cssVar: "--fsds-text-size-md", name: "text.size.md", ref: "text.size.3xl", fallback: .string("2rem")),
        ],
        "variant_light": [
            "text.typography.fontWeight.light": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-light", name: "text.typography.fontWeight.light", ref: "semantic.typography.font.weight.light", fallback: .string("300")),
        ],
        "variant_normal": [
            "text.typography.fontWeight.regular": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-regular", name: "text.typography.fontWeight.regular", ref: "semantic.typography.font.weight.regular", fallback: .string("400")),
        ],
        "variant_medium": [
            "text.typography.fontWeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-medium", name: "text.typography.fontWeight.medium", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
        ],
        "variant_semibold": [
            "text.typography.fontWeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-medium", name: "text.typography.fontWeight.medium", ref: "semantic.typography.font.weight.semibold", fallback: .string("600")),
        ],
        "variant_bold": [
            "text.typography.fontWeight.bold": FsdsComponentTokenDefinition(cssVar: "--fsds-text-typography-font-weight-bold", name: "text.typography.fontWeight.bold", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
        ],
    ]
}

/// Emitted through the static-content path: passive p root with a single consumer content region.
public struct Text<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        TextTokens.scopes
    }
    private let variant: TextVariant?
    private let size: TextSize?
    private let weight: TextWeight?
    private let align: TextAlign?
    private let transform: TextTransform?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        variant: TextVariant? = nil,
        size: TextSize? = nil,
        weight: TextWeight? = nil,
        align: TextAlign? = nil,
        transform: TextTransform? = nil,
        @ViewBuilder content: () -> Content = { EmptyView() }
    ) {
        self.variant = variant
        self.size = size
        self.weight = weight
        self.align = align
        self.transform = transform
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", variant.map { "variant_\($0.rawValue)" }, size.map { "variant_\($0.rawValue)" }, weight.map { "variant_\($0.rawValue)" }, align.map { "variant_\($0.rawValue)" }, transform.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var foreground: Color { colorSlot("color.foreground.primary") ?? .primary }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .foregroundStyle(foreground)
    }
}
// @generated:end
