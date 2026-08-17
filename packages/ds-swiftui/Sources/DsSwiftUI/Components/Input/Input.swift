// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for Input (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum InputTokens {
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
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", fallback: .string("32px")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "input.color.bg.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-bg-default", name: "input.color.bg.default", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "input.color.bg.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-bg-disabled", name: "input.color.bg.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "input.color.text.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-text-default", name: "input.color.text.default", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "input.color.text.placeholder": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-text-placeholder", name: "input.color.text.placeholder", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "input.color.text.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-text-disabled", name: "input.color.text.disabled", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "input.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-border-default", name: "input.color.border.default", fallback: .adaptive(light: "#a0a0a1", dark: "#5c5b5c")),
            "input.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-border-hover", name: "input.color.border.hover", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "input.color.border.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-border-disabled", name: "input.color.border.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "input.size.height.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-size-height-default", name: "input.size.height.default", fallback: .string("32px")),
            "input.size.padding-block.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-size-padding-block-default", name: "input.size.padding-block.default", fallback: .string("4px")),
            "input.size.padding-inline.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-size-padding-inline-default", name: "input.size.padding-inline.default", fallback: .string("8px")),
            "input.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-size-radius-default", name: "input.size.radius.default", fallback: .string("6px")),
            "input.size.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-size-border-default", name: "input.size.border.default", fallback: .string("1px")),
            "input.space.inline.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-space-inline-default", name: "input.space.inline.default", fallback: .string("12px")),
            "input.color.focus.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-focus-default", name: "input.color.focus.default", fallback: .adaptive(light: "#0566fe", dark: "#0089fe")),
            "input.color.invalid.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-color-invalid-default", name: "input.color.invalid.default", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
            "input.typography.size.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-typography-size-default", name: "input.typography.size.default", fallback: .string("1rem")),
            "input.typography.line-height.default": FsdsComponentTokenDefinition(cssVar: "--fsds-input-typography-line-height-default", name: "input.typography.line-height.default", fallback: .string("1.5")),
            "input.opacity.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-input-opacity-disabled", name: "input.opacity.disabled", fallback: .string("0.5")),
            "input.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-input-focus-ring-width", name: "input.focus.ring.width", fallback: .string("2px")),
            "input.focus.ring.color": FsdsComponentTokenDefinition(cssVar: "--fsds-input-focus-ring-color", name: "input.focus.ring.color", fallback: .adaptive(light: "#0566fe", dark: "#0566fe")),
            "input.focus.ring.style": FsdsComponentTokenDefinition(cssVar: "--fsds-input-focus-ring-style", name: "input.focus.ring.style", fallback: .string("solid")),
            "input.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-input-focus-ring-offset", name: "input.focus.ring.offset", fallback: .string("2px")),
            "input.motion.duration.fast": FsdsComponentTokenDefinition(cssVar: "--fsds-input-motion-duration-fast", name: "input.motion.duration.fast", fallback: .string("150ms")),
            "input.motion.easing.standard": FsdsComponentTokenDefinition(cssVar: "--fsds-input-motion-easing-standard", name: "input.motion.easing.standard", fallback: .string("cubic-bezier(0.4, 0, 0.2, 1)")),
        ],
    ]
}

/// Emitted through the value-channel text-control path: input root whose string channel projects through the controllable-state pattern (controlled Binding takes precedence over @State).
public struct Input: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        InputTokens.scopes
    }
    @StateObject private var text: ControllableValue<String>
    private let placeholder: String?
    private let disabled: Bool
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        value: Binding<String>? = nil,
        defaultValue: String = "",
        onChange: ((String) -> Void)? = nil,
        placeholder: String? = nil,
        disabled: Bool = false
    ) {
        self._text = StateObject(wrappedValue: ControllableValue(controlled: value, defaultValue: defaultValue, onChange: onChange))
        self.placeholder = placeholder
        self.disabled = disabled
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

    private var background: Color { colorSlot("color.bg.default") ?? .accentColor }
    private var foreground: Color { colorSlot("color.text.default") ?? .primary }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        TextField(
            "",
            text: Binding(
                get: { text.value },
                set: { text.set($0) }
            ),
            prompt: placeholder.map(Text.init)
        )
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .frame(minHeight: minHeight)
            .background(background)
            .foregroundStyle(foreground)
            .disabled(disabled)
    }
}
// @generated:end
