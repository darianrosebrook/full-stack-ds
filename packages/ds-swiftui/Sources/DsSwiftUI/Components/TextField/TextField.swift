// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for TextField (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum TextFieldTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.input.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "semantic.input.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.input.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "semantic.input.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.input.size.medium.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "semantic.input.size.medium.min-height", fallback: .string("32px")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "text-field.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-spacing-gap", name: "text-field.spacing.gap", ref: "core.spacing.size.04", fallback: .string("8px")),
            "text-field.field.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-field-padding-block", name: "text-field.field.padding-block", ref: "semantic.input.size.medium.padding-block", fallback: .string("4px")),
            "text-field.field.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-field-padding-inline", name: "text-field.field.padding-inline", ref: "semantic.input.size.medium.padding-inline", fallback: .string("8px")),
            "text-field.field.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-field-min-height", name: "text-field.field.min-height", ref: "semantic.input.size.medium.min-height", fallback: .string("32px")),
            "text-field.border.width": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-border-width", name: "text-field.border.width", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "text-field.border.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-border-radius", name: "text-field.border.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "text-field.color.input.background": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-background", name: "text-field.color.input.background", ref: "semantic.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "text-field.color.input.text": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-text", name: "text-field.color.input.text", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "text-field.color.input.placeholder": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-placeholder", name: "text-field.color.input.placeholder", ref: "semantic.color.foreground.tertiary", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "text-field.color.input.border": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-border", name: "text-field.color.input.border", ref: "semantic.color.border.default", fallback: .adaptive(light: "#a0a0a1", dark: "#5c5b5c")),
            "text-field.color.input.borderHover": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-border-hover", name: "text-field.color.input.borderHover", ref: "semantic.color.border.hover", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "text-field.color.input.backgroundDisabled": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-background-disabled", name: "text-field.color.input.backgroundDisabled", ref: "semantic.interaction.background.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "text-field.color.input.textDisabled": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-text-disabled", name: "text-field.color.input.textDisabled", ref: "semantic.color.foreground.disabled", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "text-field.color.input.borderDisabled": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-border-disabled", name: "text-field.color.input.borderDisabled", ref: "semantic.color.border.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "text-field.color.input.borderError": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-input-border-error", name: "text-field.color.input.borderError", ref: "semantic.color.status.danger", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "text-field.color.error": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-error", name: "text-field.color.error", ref: "semantic.color.foreground.danger", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "text-field.color.supporting.text": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-color-supporting-text", name: "text-field.color.supporting.text", ref: "semantic.color.foreground.tertiary", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "text-field.typography.label.size": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-label-size", name: "text-field.typography.label.size", ref: "semantic.typography.caption.01", fallback: .string("0.875rem")),
            "text-field.typography.label.weight": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-label-weight", name: "text-field.typography.label.weight", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "text-field.typography.label.line-height": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-label-line-height", name: "text-field.typography.label.line-height", ref: "semantic.typography.line.height.normal", fallback: .string("1.5")),
            "text-field.typography.field.size": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-field-size", name: "text-field.typography.field.size", ref: "semantic.typography.body.02", fallback: .string("1rem")),
            "text-field.typography.field.line-height": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-field-line-height", name: "text-field.typography.field.line-height", ref: "semantic.typography.line.height.body", fallback: .string("1.5")),
            "text-field.typography.supporting.size": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-supporting-size", name: "text-field.typography.supporting.size", ref: "semantic.typography.caption.01", fallback: .string("0.875rem")),
            "text-field.typography.supporting.line-height": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-typography-supporting-line-height", name: "text-field.typography.supporting.line-height", ref: "semantic.typography.line.height.normal", fallback: .string("1.5")),
            "text-field.opacity.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-opacity-disabled", name: "text-field.opacity.disabled", ref: "semantic.interaction.disabled.opacity", fallback: .string("0.5")),
            "text-field.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-focus-ring-width", name: "text-field.focus.ring.width", ref: "semantic.focus.ring.width", fallback: .string("2px")),
            "text-field.focus.ring.color": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-focus-ring-color", name: "text-field.focus.ring.color", ref: "semantic.focus.ring.color", fallback: .adaptive(light: "#0566fe", dark: "#0566fe")),
            "text-field.focus.ring.style": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-focus-ring-style", name: "text-field.focus.ring.style", ref: "semantic.focus.ring.style", fallback: .string("solid")),
            "text-field.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-focus-ring-offset", name: "text-field.focus.ring.offset", ref: "semantic.focus.ring.offset", fallback: .string("2px")),
            "text-field.motion.duration.fast": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-motion-duration-fast", name: "text-field.motion.duration.fast", ref: "core.motion.duration.short", fallback: .string("150ms")),
            "text-field.motion.easing.standard": FsdsComponentTokenDefinition(cssVar: "--fsds-text-field-motion-easing-standard", name: "text-field.motion.easing.standard", ref: "core.motion.easing.standard", fallback: .string("cubic-bezier(0.4, 0, 0.2, 1)")),
        ],
    ]
}

/// Emitted through the labeled text-control path: the string channel rides ControllableValue<String>; slot regions are consumer closures.
public struct TextField<LabelRegion: View, DescriptionRegion: View, ErrorRegion: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        TextFieldTokens.scopes
    }
    @StateObject private var value: ControllableValue<String>
    private let label: LabelRegion
    private let description: DescriptionRegion
    private let error: ErrorRegion
    private let disabled: Bool
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        value: Binding<String>? = nil,
        defaultValue: String = "",
        onChange: ((String) -> Void)? = nil,
        @ViewBuilder label: () -> LabelRegion = { EmptyView() },
        @ViewBuilder description: () -> DescriptionRegion = { EmptyView() },
        @ViewBuilder error: () -> ErrorRegion = { EmptyView() },
        disabled: Bool = false
    ) {
        self._value = StateObject(wrappedValue: ControllableValue(controlled: value, defaultValue: defaultValue, onChange: onChange))
        self.label = label()
        self.description = description()
        self.error = error()
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

    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }

    public var body: some View {
        VStack(spacing: gap) {
            label
            SwiftUI.TextField("", text: value.binding())
                .disabled(disabled)
            description
            error
        }
    }
}
// @generated:end
