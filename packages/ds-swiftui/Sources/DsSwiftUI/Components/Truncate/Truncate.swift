// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for Truncate (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum TruncateTokens {
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
            "truncate.color.foreground.link": FsdsComponentTokenDefinition(cssVar: "--fsds-truncate-color-foreground-link", name: "truncate.color.foreground.link", ref: "semantic.color.foreground.link", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "truncate.color.background.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-truncate-color-background-primary", name: "truncate.color.background.primary", ref: "semantic.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "truncate.typography.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-truncate-typography-font-weight", name: "truncate.typography.fontWeight", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "truncate.spacing.toggle": FsdsComponentTokenDefinition(cssVar: "--fsds-truncate-spacing-toggle", name: "truncate.spacing.toggle", ref: "core.spacing.size.02", fallback: .string("2px")),
            "truncate.color.foreground.linkHover": FsdsComponentTokenDefinition(cssVar: "--fsds-truncate-color-foreground-link-hover", name: "truncate.color.foreground.linkHover", ref: "semantic.color.foreground.linkHover", fallback: .adaptive(light: "#b31b1b", dark: "#ee8181")),
        ],
    ]
}

/// Emitted through the expandable-content path: the expanded channel (ControllableValue substrate) gates the line limit; the disclosure toggle appears when the contract authors one.
public struct Truncate<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        TruncateTokens.scopes
    }
    @StateObject private var expanded: ControllableValue<Bool>
    private let expandable: Bool
    private let lines: Int
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        expanded: Binding<Bool>? = nil,
        defaultExpanded: Bool = false,
        onExpandedChange: ((Bool) -> Void)? = nil,
        expandable: Bool = true,
        lines: Int = 3,
        @ViewBuilder content: () -> Content
    ) {
        self._expanded = StateObject(wrappedValue: ControllableValue(controlled: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange))
        self.expandable = expandable
        self.lines = lines
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

    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }

    public var body: some View {
        VStack(spacing: 4) {
            content
                .lineLimit(expanded.value ? nil : lines)
            if expandable {
                Button(expanded.value ? "Show less" : "Show more") {
                    expanded.toggle()
                }
                .buttonStyle(.plain)
            }
        }
    }
}
// @generated:end
