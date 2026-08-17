// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum FieldStatus: String, CaseIterable {
    case idle
    case validating
    case valid
    case invalid
}
// @generated:end

// @generated:start component
/// Token scope data for FsdsField (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum FieldTokens {
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
            "field.gap.y": FsdsComponentTokenDefinition(cssVar: "--fsds-field-gap-y", name: "field.gap.y", fallback: .string("8px")),
            "field.gap.meta": FsdsComponentTokenDefinition(cssVar: "--fsds-field-gap-meta", name: "field.gap.meta", fallback: .string("4px")),
            "field.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-field-radius", name: "field.radius", fallback: .string("6px")),
            "field.pad.x": FsdsComponentTokenDefinition(cssVar: "--fsds-field-pad-x", name: "field.pad.x", fallback: .string("12px")),
            "field.pad.y": FsdsComponentTokenDefinition(cssVar: "--fsds-field-pad-y", name: "field.pad.y", fallback: .string("8px")),
            "field.color.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-bg", name: "field.color.bg", fallback: .adaptive(light: "#ffffff", dark: "#141414")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "field.color.borderBold": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border-bold", name: "field.color.borderBold", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "field.color.focus-border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-focus-border", name: "field.color.focus-border", fallback: .adaptive(light: "#0566fe", dark: "#0089fe")),
            "field.color.invalid-border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-invalid-border", name: "field.color.invalid-border", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
            "field.color.invalid-text": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-invalid-text", name: "field.color.invalid-text", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "field.color.valid-border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-valid-border", name: "field.color.valid-border", fallback: .string("#3a6614")),
            "field.color.validating-border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-validating-border", name: "field.color.validating-border", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "field.color.validating-text": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-validating-text", name: "field.color.validating-text", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "field.color.valid-text": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-valid-text", name: "field.color.valid-text", fallback: .adaptive(light: "#497f21", dark: "#5b973c")),
            "field.spacing.indicator": FsdsComponentTokenDefinition(cssVar: "--fsds-field-spacing-indicator", name: "field.spacing.indicator", fallback: .string("4px")),
            "field.label.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-field-label-font-size", name: "field.label.fontSize", fallback: .string("14px")),
            "field.label.color": FsdsComponentTokenDefinition(cssVar: "--fsds-field-label-color", name: "field.label.color", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "field.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-field-focus-ring-width", name: "field.focus.ring.width", fallback: .string("2px")),
            "field.focus.ring.color": FsdsComponentTokenDefinition(cssVar: "--fsds-field-focus-ring-color", name: "field.focus.ring.color", fallback: .adaptive(light: "#0566fe", dark: "#0566fe")),
            "field.focus.ring.style": FsdsComponentTokenDefinition(cssVar: "--fsds-field-focus-ring-style", name: "field.focus.ring.style", fallback: .string("solid")),
            "field.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-field-focus-ring-offset", name: "field.focus.ring.offset", fallback: .string("2px")),
        ],
        "variant_idle": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
        ],
        "variant_validating": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
        ],
        "variant_valid": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", fallback: .string("#3a6614")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", fallback: .adaptive(light: "#497f21", dark: "#5b973c")),
        ],
        "variant_invalid": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
        ],
    ]
}

/// Emitted through a composer path: passive container root, one content region per named region (compound part or named slot).
/// SwiftUI reserves the `Field` type name; this target exports it as `FsdsField`.
public struct FsdsField<Label: View, Control: View, Help: View, Error: View, ValidatingIndicator: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        FieldTokens.scopes
    }
    private let status: FieldStatus?
    private let label: Label
    private let control: Control
    private let help: Help
    private let error: Error
    private let validatingIndicator: ValidatingIndicator
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        status: FieldStatus? = nil,
        @ViewBuilder label: () -> Label = { EmptyView() },
        @ViewBuilder control: () -> Control = { EmptyView() },
        @ViewBuilder help: () -> Help = { EmptyView() },
        @ViewBuilder error: () -> Error = { EmptyView() },
        @ViewBuilder validatingIndicator: () -> ValidatingIndicator = { EmptyView() }
    ) {
        self.status = status
        self.label = label()
        self.control = control()
        self.help = help()
        self.error = error()
        self.validatingIndicator = validatingIndicator()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", status.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var background: Color { colorSlot("color.bg") ?? .accentColor }
    private var foreground: Color { colorSlot("color.fg") ?? .primary }
    private var borderColor: Color { colorSlot("color.border") ?? .clear }
    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }

    @ViewBuilder
    private var regions: some View {
        VStack(spacing: gap) {
            label
            control
            help
            error
            validatingIndicator
        }
    }

    public var body: some View {
        regions
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
