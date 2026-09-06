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
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.display.size.gap", fallback: .string("4px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "text.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-text-color-foreground-primary", name: "text.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
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
