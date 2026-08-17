// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum NavListOrientation: String, CaseIterable {
    case vertical
    case horizontal
}
// @generated:end

// @generated:start component
/// Token scope data for NavList (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum NavListTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("16px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "nav-list.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-foreground-default", name: "nav-list.color.foreground.default", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "nav-list.color.foreground.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-foreground-hover", name: "nav-list.color.foreground.hover", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "nav-list.color.foreground.current": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-foreground-current", name: "nav-list.color.foreground.current", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "nav-list.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-background-default", name: "nav-list.color.background.default", fallback: .string("transparent")),
            "nav-list.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-background-hover", name: "nav-list.color.background.hover", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "nav-list.stateLayer.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-state-layer-hover", name: "nav-list.stateLayer.hover", fallback: .string("0.04")),
            "nav-list.stateLayer.selected": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-state-layer-selected", name: "nav-list.stateLayer.selected", fallback: .string("0.08")),
            "nav-list.color.background.current": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-background-current", name: "nav-list.color.background.current", fallback: .adaptive(light: "#95dafb", dark: "#002782")),
            "nav-list.color.outline.focus": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-color-outline-focus", name: "nav-list.color.outline.focus", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "nav-list.size.padding.block": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-padding-block", name: "nav-list.size.padding.block", fallback: .string("2px")),
            "nav-list.size.padding.inline": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-padding-inline", name: "nav-list.size.padding.inline", fallback: .string("8px")),
            "nav-list.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-radius-default", name: "nav-list.size.radius.default", fallback: .string("6px")),
            "nav-list.size.gap.list": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-gap-list", name: "nav-list.size.gap.list", fallback: .string("1px")),
            "nav-list.size.gap.group": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-gap-group", name: "nav-list.size.gap.group", fallback: .string("8px")),
            "nav-list.size.fontSize.item": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-font-size-item", name: "nav-list.size.fontSize.item", fallback: .string("14px")),
            "nav-list.size.fontSize.groupLabel": FsdsComponentTokenDefinition(cssVar: "--fsds-nav-list-size-font-size-group-label", name: "nav-list.size.fontSize.groupLabel", fallback: .string("10px")),
        ],
    ]
}

/// Emitted through the static-content path: passive nav root with a single consumer content region.
public struct NavList<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        NavListTokens.scopes
    }
    private let orientation: NavListOrientation
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        orientation: NavListOrientation = .vertical,
        @ViewBuilder content: () -> Content
    ) {
        self.orientation = orientation
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", "variant_\(orientation.rawValue)"]
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var background: Color { colorSlot("color.background.default") ?? .accentColor }
    private var foreground: Color { colorSlot("color.foreground.default") ?? .primary }
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
