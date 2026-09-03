// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum AccordionType: String, CaseIterable {
    case single
    case multiple
}
// @generated:end

// @generated:start component
/// Token scope data for Accordion (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum AccordionTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.structure.size.gap", fallback: .string("16px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "accordion.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-color-background-hover", name: "accordion.color.background.hover", ref: "semantic.interaction.background.hover", fallback: .adaptive(light: "#f7f7f7", dark: "#313131")),
            "accordion.color.text": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-color-text", name: "accordion.color.text", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "accordion.color.textSecondary": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-color-text-secondary", name: "accordion.color.textSecondary", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "accordion.color.icon": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-color-icon", name: "accordion.color.icon", ref: "semantic.color.foreground.tertiary", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "accordion.border.width": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-border-width", name: "accordion.border.width", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "accordion.border.color": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-border-color", name: "accordion.border.color", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "accordion.border.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-border-radius", name: "accordion.border.radius", ref: "semantic.shape.radius.small", fallback: .string("4px")),
            "accordion.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-spacing-gap", name: "accordion.spacing.gap", ref: "core.spacing.size.07", fallback: .string("24px")),
            "accordion.spacing.paddingX": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-spacing-padding-x", name: "accordion.spacing.paddingX", ref: "core.spacing.size.00", fallback: .string("0px")),
            "accordion.spacing.paddingY": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-spacing-padding-y", name: "accordion.spacing.paddingY", ref: "core.spacing.size.04", fallback: .string("8px")),
            "accordion.text.weight": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-text-weight", name: "accordion.text.weight", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
            "accordion.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-text-size", name: "accordion.text.size", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "accordion.text.lineHeight": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-text-line-height", name: "accordion.text.lineHeight", ref: "semantic.typography.line.height.normal", fallback: .string("1.5")),
            "accordion.text.sizeContent": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-text-size-content", name: "accordion.text.sizeContent", ref: "semantic.typography.body.03", fallback: .string("14px")),
            "accordion.text.lineHeightContent": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-text-line-height-content", name: "accordion.text.lineHeightContent", ref: "semantic.typography.line.height.loose", fallback: .string("1.8")),
            "accordion.icon.size": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-icon-size", name: "accordion.icon.size", ref: "core.spacing.size.04", fallback: .string("8px")),
            "accordion.focus.width": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-focus-width", name: "accordion.focus.width", ref: "semantic.shape.control.border.focusWidth", fallback: .string("2px")),
            "accordion.focus.color": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-focus-color", name: "accordion.focus.color", ref: "semantic.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "accordion.focus.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-focus-offset", name: "accordion.focus.offset", ref: "core.spacing.size.01", fallback: .string("1px")),
            "accordion.opacity.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-opacity-disabled", name: "accordion.opacity.disabled", ref: "semantic.interaction.disabled.opacity", fallback: .string("0.5")),
            "accordion.color.textHover": FsdsComponentTokenDefinition(cssVar: "--fsds-accordion-color-text-hover", name: "accordion.color.textHover", ref: "semantic.interaction.text.hover", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
        ],
    ]
}

/// Emitted through the interactive-composite path: the openness channel gates content visibility (union channel lowers to its multi member v1).
public struct Accordion<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        AccordionTokens.scopes
    }
    @StateObject private var openness: ControllableValue<[String]>
    private let disabled: Bool
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        openness: Binding<[String]>? = nil,
        defaultOpenness: [String] = [],
        onOpennessChange: (([String]) -> Void)? = nil,
        disabled: Bool = false,
        @ViewBuilder content: () -> Content
    ) {
        self._openness = StateObject(wrappedValue: ControllableValue(controlled: openness, defaultValue: defaultOpenness, onChange: onOpennessChange))
        self.disabled = disabled
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

    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }

    public var body: some View {
        VStack(spacing: gap) {
            content
        }
            .environmentObject(openness)
    }
}

/// Disclosure item: press toggles `openness` membership for `key`; content visible while contained.
public struct AccordionItem<Trigger: View, Content: View>: View {
    @EnvironmentObject var openness: ControllableValue<[String]>
    private let key: String
    private let trigger: Trigger
    private let content: Content
    public init(key: String, @ViewBuilder trigger: () -> Trigger, @ViewBuilder content: () -> Content) {
        self.key = key
        self.trigger = trigger()
        self.content = content()
    }
    public var body: some View {
        VStack(spacing: 4) {
            Button {
                let next = openness.value.contains(key)
                    ? openness.value.filter { $0 != key }
                    : openness.value + [key]
                openness.set(next)
            } label: {
                trigger
            }
                .buttonStyle(.plain)
            if openness.value.contains(key) {
                content
            } else {
                EmptyView()
            }
        }
    }
}
// @generated:end
