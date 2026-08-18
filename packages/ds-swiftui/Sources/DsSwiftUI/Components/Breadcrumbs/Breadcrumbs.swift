// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types

// @generated:end

// @generated:start component
/// Token scope data for Breadcrumbs (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum BreadcrumbsTokens {
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
            "breadcrumbs.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-color-foreground-primary", name: "breadcrumbs.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "breadcrumbs.color.background.elevated": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-color-background-elevated", name: "breadcrumbs.color.background.elevated", ref: "semantic.color.background.elevated", fallback: .adaptive(light: "#ffffff", dark: "#141414")),
            "breadcrumbs.color.border.subtle": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-color-border-subtle", name: "breadcrumbs.color.border.subtle", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "breadcrumbs.typography.lineHeight.collapse": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-typography-line-height-collapse", name: "breadcrumbs.typography.lineHeight.collapse", ref: "semantic.typography.line.height.collapse", fallback: .string("1")),
            "breadcrumbs.shape.radius.medium": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-shape-radius-medium", name: "breadcrumbs.shape.radius.medium", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "breadcrumbs.spacing.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-spacing-gap-default", name: "breadcrumbs.spacing.gap.default", ref: "core.spacing.size.04", fallback: .string("8px")),
            "breadcrumbs.spacing.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-spacing-padding-default", name: "breadcrumbs.spacing.padding.default", ref: "core.spacing.size.04", fallback: .string("8px")),
            "breadcrumbs.color.focus": FsdsComponentTokenDefinition(cssVar: "--fsds-breadcrumbs-color-focus", name: "breadcrumbs.color.focus", ref: "semantic.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
        ],
    ]
}

/// Emitted through the static-content path: passive nav root with a single consumer content region.
public struct Breadcrumbs<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        BreadcrumbsTokens.scopes
    }
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        @ViewBuilder content: () -> Content
    ) {
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

    private var foreground: Color { colorSlot("color.foreground.primary") ?? .primary }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .foregroundStyle(foreground)
    }
}
// @generated:end
