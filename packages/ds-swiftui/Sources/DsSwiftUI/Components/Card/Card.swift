// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum CardStatus: String, CaseIterable {
    case completed
    case inProgress = "in-progress"
    case planned
    case deprecated
    case category
    case complexity
}
public enum CardDensity: String, CaseIterable {
    case `default`
    case inset
}
// @generated:end

// @generated:start component
/// Token scope data for Card (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum CardTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", fallback: .string("16px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", fallback: .string("16px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", fallback: .string("16px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", fallback: .string("64px")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "card.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-background-default", name: "card.color.background.default", fallback: .string("#ffffff")),
            "card.color.background.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-background-hover", name: "card.color.background.hover", fallback: .string("#d0d0d0")),
            "card.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-border-default", name: "card.color.border.default", fallback: .string("#b8b8b8")),
            "card.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-foreground-primary", name: "card.color.foreground.primary", fallback: .string("#141414")),
            "card.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-size-padding-default", name: "card.size.padding.default", fallback: .string("16px")),
            "card.size.padding.inset": FsdsComponentTokenDefinition(cssVar: "--fsds-card-size-padding-inset", name: "card.size.padding.inset", fallback: .string("8px")),
            "card.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-size-radius-default", name: "card.size.radius.default", fallback: .string("8px")),
            "card.size.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-size-gap-default", name: "card.size.gap.default", fallback: .string("4px")),
            "card.typography.lineHeight.heading": FsdsComponentTokenDefinition(cssVar: "--fsds-card-typography-line-height-heading", name: "card.typography.lineHeight.heading", fallback: .string("1")),
            "card.typography.lineHeight.normal": FsdsComponentTokenDefinition(cssVar: "--fsds-card-typography-line-height-normal", name: "card.typography.lineHeight.normal", fallback: .string("1.5")),
            "card.color.badge.success.background": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-success-background", name: "card.color.badge.success.background", fallback: .string("#b3dba7")),
            "card.color.badge.success.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-success-foreground", name: "card.color.badge.success.foreground", fallback: .string("#2c4f09")),
            "card.color.badge.warning.background": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-warning-background", name: "card.color.badge.warning.background", fallback: .string("#fdc67f")),
            "card.color.badge.warning.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-warning-foreground", name: "card.color.badge.warning.foreground", fallback: .string("#6c3a00")),
            "card.color.badge.info.background": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-info-background", name: "card.color.badge.info.background", fallback: .string("#95dafb")),
            "card.color.badge.info.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-info-foreground", name: "card.color.badge.info.foreground", fallback: .string("#013ab0")),
            "card.color.badge.error.background": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-error-background", name: "card.color.badge.error.background", fallback: .string("#fac2c2")),
            "card.color.badge.error.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-error-foreground", name: "card.color.badge.error.foreground", fallback: .string("#900909")),
            "card.color.badge.neutral.background": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-neutral-background", name: "card.color.badge.neutral.background", fallback: .string("#d0d0d0")),
            "card.color.badge.neutral.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-neutral-foreground", name: "card.color.badge.neutral.foreground", fallback: .string("#474647")),
            "card.color.badge.accent.background": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-accent-background", name: "card.color.badge.accent.background", fallback: .string("#d92d2e")),
            "card.color.badge.accent.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-badge-accent-foreground", name: "card.color.badge.accent.foreground", fallback: .string("#ffffff")),
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#d0d0d0")),
            "card.size.statusAccent.width": FsdsComponentTokenDefinition(cssVar: "--fsds-card-size-status-accent-width", name: "card.size.statusAccent.width", fallback: .string("2px")),
            "card.elevation.resting": FsdsComponentTokenDefinition(cssVar: "--fsds-card-elevation-resting", name: "card.elevation.resting", fallback: .string("0px 1px 2px #0000000f, 0px 1px 3px #0000001a")),
            "card.elevation.raised": FsdsComponentTokenDefinition(cssVar: "--fsds-card-elevation-raised", name: "card.elevation.raised", fallback: .string("0px 2px 4px #0000000f, 0px 4px 8px #0000001a")),
            "card.color.focus.ring": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-focus-ring", name: "card.color.focus.ring", fallback: .string("#0566fe")),
            "card.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-card-focus-ring-width", name: "card.focus.ring.width", fallback: .string("2px")),
            "card.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-card-focus-ring-offset", name: "card.focus.ring.offset", fallback: .string("2px")),
        ],
        "variant_completed": [
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#3a6614")),
        ],
        "variant_in_progress": [
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#034fd6")),
        ],
        "variant_planned": [
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#d0d0d0")),
        ],
        "variant_deprecated": [
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#b31b1b")),
        ],
        "variant_category": [
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#d92d2e")),
        ],
        "variant_complexity": [
            "card.color.statusAccent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-status-accent-default", name: "card.color.statusAccent.default", fallback: .string("#8b4b00")),
        ],
        "part_description": [
            "card.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-foreground-primary", name: "card.color.foreground.primary", fallback: .string("#474647")),
        ],
        "part_link": [
            "card.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-foreground-primary", name: "card.color.foreground.primary", fallback: .string("#d92d2e")),
        ],
        "part_note": [
            "card.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-card-color-foreground-primary", name: "card.color.foreground.primary", fallback: .string("#474647")),
        ],
    ]
}

/// Emitted through a composer path: passive container root, one content region per named region (compound part or named slot).
public struct Card<Header: View, Content: View, Footer: View, Description: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        CardTokens.scopes
    }
    private let status: CardStatus?
    private let density: CardDensity
    private let header: Header
    private let content: Content
    private let footer: Footer
    private let description: Description
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        status: CardStatus? = nil,
        density: CardDensity = .`default`,
        @ViewBuilder header: () -> Header = { EmptyView() },
        @ViewBuilder content: () -> Content = { EmptyView() },
        @ViewBuilder footer: () -> Footer = { EmptyView() },
        @ViewBuilder description: () -> Description = { EmptyView() }
    ) {
        self.status = status
        self.density = density
        self.header = header()
        self.content = content()
        self.footer = footer()
        self.description = description()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", status.map { "variant_\($0.rawValue)" }, "variant_\(density.rawValue)"].compactMap { $0 }
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
    private var statusAccent: Color { colorSlot("color.statusAccent.default") ?? .clear }
    private var statusAccentWidth: CGFloat { pxSlot("size.statusAccent.width") ?? 0 }

    @ViewBuilder
    private var regions: some View {
        VStack(spacing: gap) {
            header
            content
            footer
            description
        }
    }

    public var body: some View {
        HStack(spacing: 0) {
            Rectangle().fill(statusAccent).frame(width: statusAccentWidth)
            regions
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
