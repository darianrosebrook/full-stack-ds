// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum TabsOrientation: String, CaseIterable {
    case horizontal
    case vertical
}
public enum TabsAppearance: String, CaseIterable {
    case underline
    case pills
}
public enum TabsActivationMode: String, CaseIterable {
    case automatic
    case manual
}
// @generated:end

// @generated:start component
/// Token scope data for Tabs (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum TabsTokens {
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
            "tabs.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-spacing-gap", name: "tabs.spacing.gap", fallback: .string("8px")),
            "tabs.spacing.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-spacing-padding", name: "tabs.spacing.padding", fallback: .string("8px")),
            "tabs.spacing.pillPadding": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-spacing-pill-padding", name: "tabs.spacing.pillPadding", literal: .string("4px 10px")),
            "tabs.spacing.panelGap": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-spacing-panel-gap", name: "tabs.spacing.panelGap", fallback: .string("16px")),
            "tabs.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-fg", name: "tabs.color.fg", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "tabs.color.disabled-fg": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-disabled-fg", name: "tabs.color.disabled-fg", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "tabs.color.indicator": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-indicator", name: "tabs.color.indicator", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "tabs.shape.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-shape-radius", name: "tabs.shape.radius", fallback: .string("6px")),
            "tabs.motion.indicator": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-motion-indicator", name: "tabs.motion.indicator", fallback: .string("150ms")),
            "tabs.color.hover.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-hover-bg", name: "tabs.color.hover.bg", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "tabs.color.hover.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-hover-fg", name: "tabs.color.hover.fg", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "tabs.color.active-fg": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-active-fg", name: "tabs.color.active-fg", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "tabs.color.active-bg": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-active-bg", name: "tabs.color.active-bg", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "tabs.color.focus": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-focus", name: "tabs.color.focus", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "tabs.color.underline.active": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-color-underline-active", name: "tabs.color.underline.active", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "tabs.size.indicator.thickness": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-size-indicator-thickness", name: "tabs.size.indicator.thickness", literal: .string("2px")),
            "tabs.size.vertical.listWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-tabs-size-vertical-list-width", name: "tabs.size.vertical.listWidth", literal: .string("160px")),
        ],
    ]
}

/// Emitted through the interactive-composite path: the activeTab channel gates content visibility (union channel lowers to its multi member v1).
public struct Tabs<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        TabsTokens.scopes
    }
    @StateObject private var activeTab: ControllableValue<String>
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        activeTab: Binding<String>? = nil,
        defaultActiveTab: String = "",
        onActiveTabChange: ((String) -> Void)? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self._activeTab = StateObject(wrappedValue: ControllableValue(controlled: activeTab, defaultValue: defaultActiveTab, onChange: onActiveTabChange))
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

    private var foreground: Color { colorSlot("color.fg") ?? .primary }
    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }

    public var body: some View {
        VStack(spacing: gap) {
            content
        }
    }
}
// @generated:end
