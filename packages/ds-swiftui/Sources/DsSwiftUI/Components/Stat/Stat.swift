// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum StatSize: String, CaseIterable {
    case sm
    case md
    case lg
}
public enum StatTrend: String, CaseIterable {
    case up
    case down
    case neutral
}
// @generated:end

// @generated:start component
/// Token scope data for Stat (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum StatTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.display.size.gap", fallback: .string("4px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "stat.color.foreground.value": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-color-foreground-value", name: "stat.color.foreground.value", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "stat.color.foreground.label": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-color-foreground-label", name: "stat.color.foreground.label", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "stat.color.foreground.trend.up": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-color-foreground-trend-up", name: "stat.color.foreground.trend.up", ref: "semantic.color.feedback.foreground.success.default", fallback: .adaptive(light: "#497f21", dark: "#5b973c")),
            "stat.color.foreground.trend.down": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-color-foreground-trend-down", name: "stat.color.foreground.trend.down", ref: "semantic.color.feedback.foreground.danger.default", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "stat.color.foreground.trend.neutral": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-color-foreground-trend-neutral", name: "stat.color.foreground.trend.neutral", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "stat.size.value.sm": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-size-value-sm", name: "stat.size.value.sm", ref: "semantic.typography.heading.04", fallback: .string("18px")),
            "stat.size.value.md": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-size-value-md", name: "stat.size.value.md", ref: "semantic.typography.heading.02", fallback: .string("24px")),
            "stat.size.value.lg": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-size-value-lg", name: "stat.size.value.lg", ref: "semantic.typography.heading.01", fallback: .string("32px")),
            "stat.size.label": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-size-label", name: "stat.size.label", ref: "semantic.typography.caption.02", fallback: .string("12px")),
            "stat.size.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-size-gap", name: "stat.size.gap", ref: "core.spacing.size.02", fallback: .string("2px")),
            "stat.typography.lineHeight.value": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-typography-line-height-value", name: "stat.typography.lineHeight.value", literal: .string("1.1")),
            "stat.typography.weight.value": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-typography-weight-value", name: "stat.typography.weight.value", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
            "stat.typography.weight.label": FsdsComponentTokenDefinition(cssVar: "--fsds-stat-typography-weight-label", name: "stat.typography.weight.label", ref: "semantic.typography.font.weight.medium", fallback: .string("500")),
        ],
    ]
}

/// Emitted through the static-content path: passive div root with a single consumer content region.
public struct Stat<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        StatTokens.scopes
    }
    private let size: StatSize
    private let trend: StatTrend?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        size: StatSize = .md,
        trend: StatTrend? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.size = size
        self.trend = trend
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", "variant_\(size.rawValue)", trend.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
    }
}
// @generated:end
