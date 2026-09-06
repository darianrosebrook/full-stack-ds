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
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.input.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.input.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.input.size.medium.gap", fallback: .string("8px")),
            "field.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-field-radius", name: "field.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "field.color.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-bg", name: "field.color.bg", ref: "semantic.color.background.elevated", fallback: .adaptive(light: "#ffffff", dark: "#141414")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
        ],
        "variant_idle": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
        ],
        "variant_validating": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", ref: "semantic.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
        ],
        "variant_valid": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", ref: "semantic.color.feedback.border.success", fallback: .string("#3a6614")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", ref: "semantic.color.foreground.success", fallback: .adaptive(light: "#497f21", dark: "#5b973c")),
        ],
        "variant_invalid": [
            "field.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-border", name: "field.color.border", ref: "semantic.color.border.danger", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
            "field.color.fg": FsdsComponentTokenDefinition(cssVar: "--fsds-field-color-fg", name: "field.color.fg", ref: "semantic.color.foreground.danger", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
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
