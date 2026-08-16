// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum DetailsVariant: String, CaseIterable {
    case `default`
    case inline
    case compact
}
public enum DetailsIcon: String, CaseIterable {
    case left
    case right
    case none
}
// @generated:end

// @generated:start component
/// Token scope data for Details (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum DetailsTokens {
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
            "details.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-padding-default", name: "details.size.padding.default", fallback: .string("16px")),
            "details.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-radius-default", name: "details.size.radius.default", fallback: .string("6px")),
            "details.size.icon": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-icon", name: "details.size.icon", fallback: .string("12px")),
            "details.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-background-default", name: "details.color.background.default", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "details.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-background-hover", name: "details.color.background.hover", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "details.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-foreground-primary", name: "details.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "details.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-border-default", name: "details.color.border.default", fallback: .adaptive(light: "#a0a0a1", dark: "#5c5b5c")),
            "details.color.border.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-border-hover", name: "details.color.border.hover", fallback: .adaptive(light: "#888889", dark: "#727272")),
            "details.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-details-focus-ring-width", name: "details.focus.ring.width", fallback: .string("2px")),
            "details.focus.ring.color": FsdsComponentTokenDefinition(cssVar: "--fsds-details-focus-ring-color", name: "details.focus.ring.color", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "details.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-details-focus-ring-offset", name: "details.focus.ring.offset", fallback: .string("2px")),
            "details.spacing.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-spacing-gap-default", name: "details.spacing.gap.default", fallback: .string("2px")),
            "details.typography.lineHeight.body": FsdsComponentTokenDefinition(cssVar: "--fsds-details-typography-line-height-body", name: "details.typography.lineHeight.body", fallback: .string("1.5")),
            "details.typography.fontWeight.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-details-typography-font-weight-medium", name: "details.typography.fontWeight.medium", fallback: .string("500")),
            "details.size.padding.compact": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-padding-compact", name: "details.size.padding.compact", fallback: .string("8px")),
            "details.size.padding.page": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-padding-page", name: "details.size.padding.page", fallback: .string("24px")),
            "details.typography.fontSize.body": FsdsComponentTokenDefinition(cssVar: "--fsds-details-typography-font-size-body", name: "details.typography.fontSize.body", fallback: .string("14px")),
            "details.typography.fontSize.compact": FsdsComponentTokenDefinition(cssVar: "--fsds-details-typography-font-size-compact", name: "details.typography.fontSize.compact", fallback: .string("12px")),
        ],
        "hover": [
            "details.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-background-default", name: "details.color.background.default", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
        ],
        "variant_compact": [
            "details.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-padding-default", name: "details.size.padding.default", fallback: .string("8px")),
            "details.typography.lineHeight.body": FsdsComponentTokenDefinition(cssVar: "--fsds-details-typography-line-height-body", name: "details.typography.lineHeight.body", fallback: .string("16px")),
        ],
        "variant_inline": [
            "details.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-size-padding-default", name: "details.size.padding.default", fallback: .string("24px")),
            "details.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-background-default", name: "details.color.background.default", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "details.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-details-color-border-default", name: "details.color.border.default", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
        ],
    ]
}

/// Emitted through the native-disclosure collapse path: SwiftUI DisclosureGroup realizes the summary + expandable content anatomy.
public struct Details<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        DetailsTokens.scopes
    }
    @StateObject private var open: ControllableValue<Bool>
    private let summary: String?
    private let disabled: Bool
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        summary: String? = nil,
        disabled: Bool = false,
        @ViewBuilder content: () -> Content
    ) {
        self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))
        self.summary = summary
        self.disabled = disabled
        self.content = content()
    }


    public var body: some View {
        DisclosureGroup(isExpanded: Binding(
            get: { open.value },
            set: { open.set($0) }
        )) {
            content
        } label: {
            if let summary {
                Text(summary)
            } else {
                EmptyView()
            }
        }
            .disabled(disabled)
    }
}
// @generated:end
