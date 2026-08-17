// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for Shuttle (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum ShuttleTokens {
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
            "shuttle.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-shuttle-color-background-default", name: "shuttle.color.background.default", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "shuttle.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-shuttle-color-foreground-primary", name: "shuttle.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "shuttle.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-shuttle-color-border-default", name: "shuttle.color.border.default", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "shuttle.color.border.accent": FsdsComponentTokenDefinition(cssVar: "--fsds-shuttle-color-border-accent", name: "shuttle.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "shuttle.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-shuttle-size-padding-default", name: "shuttle.size.padding.default", fallback: .string("24px")),
            "shuttle.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-shuttle-size-radius-default", name: "shuttle.size.radius.default", fallback: .string("6px")),
        ],
    ]
}

/// Emitted through the array-iterated list path: the selection channel rides ControllableValue<[String]>; ForEach renders each item.
public struct Shuttle: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        ShuttleTokens.scopes
    }
    @StateObject private var selection: ControllableValue<[String]>
    private let accessibilityLabel: String?
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        selection: Binding<[String]>? = nil,
        defaultSelection: [String] = [],
        onSelectionChange: (([String]) -> Void)? = nil,
        accessibilityLabel: String? = nil
    ) {
        self._selection = StateObject(wrappedValue: ControllableValue(controlled: selection, defaultValue: defaultSelection, onChange: onSelectionChange))
        self.accessibilityLabel = accessibilityLabel
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
        VStack(spacing: gap) {
            ForEach(selection.value, id: \.self) { item in
                SwiftUI.Text(item)
            }
        }
            .fsdsAccessibilityLabel(accessibilityLabel)
            .foregroundStyle(foreground)
    }
}
// @generated:end
