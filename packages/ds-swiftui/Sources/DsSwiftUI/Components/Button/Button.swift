// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum ButtonSize: String, CaseIterable {
    case small
    case medium
    case large
}
public enum ButtonVariant: String, CaseIterable {
    case primary
    case secondary
    case tertiary
    case ghost
    case destructive
    case outline
}
public enum ButtonType: String, CaseIterable {
    case button
    case submit
    case reset
}
// @generated:end

// @generated:start component
/// Token scope data for FsdsButton (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum ButtonTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.action.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "semantic.action.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.action.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "semantic.action.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.action.size.medium.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", ref: "semantic.action.size.medium.min-width", fallback: .string("32px")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "semantic.action.size.medium.min-height", fallback: .string("32px")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", ref: "semantic.color.action.background.primary.default", fallback: .string("#0566fe")),
            "button.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-hover", name: "button.color.background.hover", ref: "semantic.interaction.background.hover", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "button.color.background.active": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-active", name: "button.color.background.active", ref: "semantic.interaction.background.active", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.background.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-disabled", name: "button.color.background.disabled", ref: "semantic.color.action.background.primary.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.inverse", fallback: .adaptive(light: "#fafafa", dark: "#fafafa")),
            "button.color.foreground.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-disabled", name: "button.color.foreground.disabled", ref: "semantic.color.foreground.disabled", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-hover", name: "button.color.border.hover", ref: "semantic.interaction.border.hover", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "button.color.border.focus": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-focus", name: "button.color.border.focus", ref: "semantic.focus.ring.color", fallback: .adaptive(light: "#0566fe", dark: "#0566fe")),
            "button.size.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-gap-default", name: "button.size.gap.default", ref: "semantic.action.size.medium.gap", fallback: .string("8px")),
            "button.size.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-radius", name: "button.size.radius", ref: "semantic.shape.control.radius.pill", fallback: .string("9999px")),
            "button.size.border": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-border", name: "button.size.border", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "button.text.weight": FsdsComponentTokenDefinition(cssVar: "--fsds-button-text-weight", name: "button.text.weight", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "button.motion.duration.fast": FsdsComponentTokenDefinition(cssVar: "--fsds-button-motion-duration-fast", name: "button.motion.duration.fast", ref: "core.motion.duration.short", fallback: .string("150ms")),
            "button.motion.easing.standard": FsdsComponentTokenDefinition(cssVar: "--fsds-button-motion-easing-standard", name: "button.motion.easing.standard", ref: "core.motion.easing.standard", fallback: .string("cubic-bezier(0.4, 0, 0.2, 1)")),
            "button.size.padding-block.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-block-medium", name: "button.size.padding-block.medium", ref: "core.spacing.size.04", fallback: .string("8px")),
            "button.size.padding-inline.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-inline-medium", name: "button.size.padding-inline.medium", ref: "core.spacing.size.05", fallback: .string("12px")),
            "button.size.minHeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-min-height-medium", name: "button.size.minHeight.medium", ref: "core.dimension.actionMinHeight", fallback: .string("36px")),
            "button.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-font-size-medium", name: "button.size.fontSize.medium", ref: "semantic.typography.action.02", fallback: .string("1rem")),
        ],
        "variant_small": [
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "core.spacing.size.03", fallback: .string("4px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "core.spacing.size.03", fallback: .string("4px")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "core.spacing.size.04", fallback: .string("8px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "core.spacing.size.04", fallback: .string("8px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "core.dimension.actionMinHeightSmall", fallback: .string("28px")),
            "button.size.padding-block.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-block-medium", name: "button.size.padding-block.medium", ref: "core.spacing.size.03", fallback: .string("4px")),
            "button.size.padding-inline.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-inline-medium", name: "button.size.padding-inline.medium", ref: "core.spacing.size.04", fallback: .string("8px")),
            "button.size.minHeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-min-height-medium", name: "button.size.minHeight.medium", ref: "core.dimension.actionMinHeightSmall", fallback: .string("28px")),
            "button.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-font-size-medium", name: "button.size.fontSize.medium", ref: "semantic.typography.action.03", fallback: .string("0.875rem")),
        ],
        "variant_medium": [
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "core.spacing.size.04", fallback: .string("8px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "core.spacing.size.04", fallback: .string("8px")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "core.spacing.size.05", fallback: .string("12px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "core.spacing.size.05", fallback: .string("12px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "core.dimension.actionMinHeight", fallback: .string("36px")),
            "button.size.padding-block.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-block-medium", name: "button.size.padding-block.medium", ref: "core.spacing.size.04", fallback: .string("8px")),
            "button.size.padding-inline.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-inline-medium", name: "button.size.padding-inline.medium", ref: "core.spacing.size.05", fallback: .string("12px")),
            "button.size.minHeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-min-height-medium", name: "button.size.minHeight.medium", ref: "core.dimension.actionMinHeight", fallback: .string("36px")),
            "button.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-font-size-medium", name: "button.size.fontSize.medium", ref: "semantic.typography.action.02", fallback: .string("1rem")),
        ],
        "variant_large": [
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "core.spacing.size.05", fallback: .string("12px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "core.spacing.size.05", fallback: .string("12px")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "core.spacing.size.06", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "core.spacing.size.06", fallback: .string("16px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "core.dimension.actionMinHeightLarge", fallback: .string("48px")),
            "button.size.padding-block.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-block-medium", name: "button.size.padding-block.medium", ref: "core.spacing.size.05", fallback: .string("12px")),
            "button.size.padding-inline.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-padding-inline-medium", name: "button.size.padding-inline.medium", ref: "core.spacing.size.06", fallback: .string("16px")),
            "button.size.minHeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-min-height-medium", name: "button.size.minHeight.medium", ref: "core.dimension.actionMinHeightLarge", fallback: .string("48px")),
            "button.size.fontSize.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-button-size-font-size-medium", name: "button.size.fontSize.medium", ref: "semantic.typography.action.01", fallback: .string("1.125rem")),
        ],
        "variant_primary": [
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", ref: "semantic.color.action.background.primary.default", fallback: .string("#0566fe")),
            "button.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-hover", name: "button.color.background.hover", ref: "semantic.color.action.background.primary.hover", fallback: .string("#034fd6")),
            "button.color.background.active": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-active", name: "button.color.background.active", ref: "semantic.color.action.background.primary.active", fallback: .string("#013ab0")),
            "button.color.background.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-disabled", name: "button.color.background.disabled", ref: "semantic.color.action.background.primary.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.inverse", fallback: .adaptive(light: "#fafafa", dark: "#fafafa")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", ref: "semantic.color.action.background.primary.default", fallback: .string("#0566fe")),
            "button.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-hover", name: "button.color.border.hover", ref: "semantic.color.action.background.primary.hover", fallback: .string("#034fd6")),
        ],
        "variant_secondary": [
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", ref: "semantic.color.action.background.secondary.default", fallback: .adaptive(light: "#fafafa", dark: "#141414")),
            "button.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-hover", name: "button.color.background.hover", ref: "semantic.color.action.background.secondary.hover", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "button.color.background.active": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-active", name: "button.color.background.active", ref: "semantic.color.action.background.secondary.active", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.background.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-disabled", name: "button.color.background.disabled", ref: "semantic.color.action.background.secondary.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", ref: "semantic.color.border.default", fallback: .adaptive(light: "#a0a0a1", dark: "#5c5b5c")),
        ],
        "variant_tertiary": [
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", literal: .string("transparent")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", literal: .string("transparent")),
        ],
        "variant_destructive": [
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", ref: "semantic.color.action.background.danger.default", fallback: .string("#d92d2e")),
            "button.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-hover", name: "button.color.background.hover", ref: "semantic.color.action.background.danger.hover", fallback: .string("#b31b1b")),
            "button.color.background.active": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-active", name: "button.color.background.active", ref: "semantic.color.action.background.danger.active", fallback: .string("#900909")),
            "button.color.background.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-disabled", name: "button.color.background.disabled", ref: "semantic.color.action.background.danger.disabled", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.inverse", fallback: .adaptive(light: "#fafafa", dark: "#fafafa")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", ref: "semantic.color.action.background.danger.default", fallback: .string("#d92d2e")),
            "button.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-hover", name: "button.color.border.hover", ref: "semantic.color.action.background.danger.hover", fallback: .string("#b31b1b")),
            "button.color.border.focus": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-focus", name: "button.color.border.focus", ref: "semantic.focus.ring.intent.danger", fallback: .string("#b31b1b")),
        ],
        "variant_ghost": [
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", literal: .string("transparent")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", literal: .string("transparent")),
        ],
        "variant_outline": [
            "button.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-background-default", name: "button.color.background.default", literal: .string("transparent")),
            "button.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-foreground-default", name: "button.color.foreground.default", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "button.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-button-color-border-default", name: "button.color.border.default", ref: "semantic.color.border.default", fallback: .adaptive(light: "#a0a0a1", dark: "#5c5b5c")),
        ],
    ]
}

/// Emitted through the projected-children action path: interactive button root with a single consumer content region.
/// SwiftUI reserves the `Button` type name; this target exports it as `FsdsButton`.
public struct FsdsButton<Label: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        ButtonTokens.scopes
    }
    private let size: ButtonSize
    private let variant: ButtonVariant
    private let disabled: Bool
    private let loading: Bool
    private let accessibilityLabel: String?
    private let onTap: (() -> Void)?
    private let label: Label
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        size: ButtonSize = .medium,
        variant: ButtonVariant = .primary,
        disabled: Bool = false,
        loading: Bool = false,
        accessibilityLabel: String? = nil,
        onTap: (() -> Void)? = nil,
        @ViewBuilder label: () -> Label
    ) {
        self.size = size
        self.variant = variant
        self.disabled = disabled
        self.loading = loading
        self.accessibilityLabel = accessibilityLabel
        self.onTap = onTap
        self.label = label()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", "variant_\(size.rawValue)", "variant_\(variant.rawValue)"]
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
    private var borderColor: Color { colorSlot("color.border.default") ?? .clear }
    private var borderWidth: CGFloat { pxSlot("size.border") ?? 0 }
    private var radius: CGFloat { pxSlot("size.radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    @ViewBuilder
    private var labelContent: some View {
        if loading {
            ProgressView().controlSize(.small)
        } else {
            label
        }
    }

    public var body: some View {
        Button(action: { onTap?() }) {
            labelContent
                .padding(.vertical, blockPadding)
                .padding(.horizontal, inlinePadding)
                .frame(minHeight: minHeight)
                .background(background)
                .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: radius, style: .continuous).stroke(borderColor, lineWidth: borderWidth))
        }
        .buttonStyle(.plain)
        .foregroundStyle(foreground)
        .disabled(disabled || loading)
        .fsdsAccessibilityLabel(accessibilityLabel)
    }
}
// @generated:end
