// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum CodeBlockLanguage: String, CaseIterable {
    case bash
    case css
    case html
    case javascript
    case json
    case jsx
    case markdown
    case plaintext
    case tsx
    case typescript
}
// @generated:end

// @generated:start component
/// Token scope data for CodeBlock (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum CodeBlockTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", fallback: .string("16px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", fallback: .string("16px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("4px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "code-block.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-color-background-default", name: "code-block.color.background.default", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "code-block.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-color-foreground-primary", name: "code-block.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "code-block.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-color-border-default", name: "code-block.color.border.default", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "code-block.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-size-padding-default", name: "code-block.size.padding.default", fallback: .string("16px")),
            "code-block.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-size-radius-default", name: "code-block.size.radius.default", fallback: .string("6px")),
            "code-block.size.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-size-border-default", name: "code-block.size.border.default", fallback: .string("1px")),
            "code-block.size.fontSize.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-size-font-size-default", name: "code-block.size.fontSize.default", fallback: .string("0.875rem")),
            "code-block.typography.lineHeight.default": FsdsComponentTokenDefinition(cssVar: "--fsds-code-block-typography-line-height-default", name: "code-block.typography.lineHeight.default", fallback: .string("1.5")),
        ],
    ]
}

/// Emitted through the prop-text leaf path: the `code` prop is the entire content, rendered as monospaced text.
public struct CodeBlock: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        CodeBlockTokens.scopes
    }
    private let code: String

    public init(code: String = "") {
        self.code = code
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
        Text(code)
            .font(.system(.body, design: .monospaced))
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
