// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for ShowMore (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum ShowMoreTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", fallback: .string("4px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", fallback: .string("4px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", fallback: .string("8px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", fallback: .string("8px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", fallback: .string("32px")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", fallback: .string("32px")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "show-more.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-color-background-default", name: "show-more.color.background.default", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "show-more.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-color-foreground-primary", name: "show-more.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "show-more.color.foreground.secondary": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-color-foreground-secondary", name: "show-more.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "show-more.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-color-border-default", name: "show-more.color.border.default", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "show-more.color.border.accent": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-color-border-accent", name: "show-more.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "show-more.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-size-padding-default", name: "show-more.size.padding.default", fallback: .string("24px")),
            "show-more.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-size-radius-default", name: "show-more.size.radius.default", fallback: .string("6px")),
            "show-more.overlay.imageOverlay": FsdsComponentTokenDefinition(cssVar: "--fsds-show-more-overlay-image-overlay", name: "show-more.overlay.imageOverlay", fallback: .string("rgba(0, 0, 0, 0.5)")),
        ],
    ]
}

/// Emitted through the expandable-content path: the expanded channel (ControllableValue substrate) gates the line limit; the disclosure toggle appears when the contract authors one.
public struct ShowMore<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        ShowMoreTokens.scopes
    }
    @StateObject private var expanded: ControllableValue<Bool>
    private let maxLines: Int
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        expanded: Binding<Bool>? = nil,
        defaultExpanded: Bool = false,
        onExpandedChange: ((Bool) -> Void)? = nil,
        maxLines: Int = 3,
        @ViewBuilder content: () -> Content
    ) {
        self._expanded = StateObject(wrappedValue: ControllableValue(controlled: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange))
        self.maxLines = maxLines
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
    private var radius: CGFloat { pxSlot("size.radius.default") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }

    public var body: some View {
        VStack(spacing: 4) {
            content
                .lineLimit(expanded.value ? nil : maxLines)
            if true {
                Button(expanded.value ? "Show less" : "Show more") {
                    expanded.toggle()
                }
                .buttonStyle(.plain)
            }
        }
            .foregroundStyle(foreground)
    }
}
// @generated:end
