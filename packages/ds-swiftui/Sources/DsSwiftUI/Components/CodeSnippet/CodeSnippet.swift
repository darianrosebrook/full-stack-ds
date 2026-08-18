// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum CodeSnippetElement: String, CaseIterable {
    case code
    case kbd
    case samp
}
// @generated:end

// @generated:start component
/// Token scope data for CodeSnippet (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum CodeSnippetTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.surface.size.padding-block", fallback: .string("16px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "semantic.surface.size.padding-block", fallback: .string("16px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.surface.size.padding-inline", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "semantic.surface.size.padding-inline", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.display.size.gap", fallback: .string("4px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "code-snippet.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-color-background-default", name: "code-snippet.color.background.default", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "code-snippet.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-color-foreground-primary", name: "code-snippet.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "code-snippet.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-color-border-default", name: "code-snippet.color.border.default", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "code-snippet.size.padding.inline": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-size-padding-inline", name: "code-snippet.size.padding.inline", ref: "core.spacing.size.02", fallback: .string("2px")),
            "code-snippet.size.padding.block": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-size-padding-block", name: "code-snippet.size.padding.block", ref: "core.spacing.size.01", fallback: .string("1px")),
            "code-snippet.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-size-radius-default", name: "code-snippet.size.radius.default", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "code-snippet.size.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-size-border-default", name: "code-snippet.size.border.default", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "code-snippet.size.fontSize.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-size-font-size-default", name: "code-snippet.size.fontSize.default", ref: "core.typography.ramp.3", fallback: .string("0.875rem")),
            "code-snippet.typography.lineHeight.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-typography-line-height-default", name: "code-snippet.typography.lineHeight.default", ref: "semantic.typography.line.height.body", fallback: .string("1.5")),
            "code-snippet.elevation.kbd": FsdsComponentTokenDefinition(cssVar: "--fsds-code-snippet-elevation-kbd", name: "code-snippet.elevation.kbd", ref: "semantic.elevation.surface.raised", fallback: .string("0px 1px 2px #0000000f, 0px 1px 3px #0000001a")),
        ],
    ]
}

/// Emitted through the prop-text leaf path: the `text` prop is the entire content, rendered as monospaced text.
public struct CodeSnippet: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        CodeSnippetTokens.scopes
    }
    private let text: String

    public init(text: String = "") {
        self.text = text
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
        SwiftUI.Text(text)
            .font(.system(.body, design: .monospaced))
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
