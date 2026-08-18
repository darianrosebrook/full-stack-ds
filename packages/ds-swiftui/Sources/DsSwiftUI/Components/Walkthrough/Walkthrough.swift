// @generated:start types
public enum WalkthroughPlacement: String, CaseIterable {
    case top
    case bottom
    case left
    case right
    case auto
}
// @generated:end

// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start component
/// Token scope data for Walkthrough (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum WalkthroughTokens {
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
            "walkthrough.color.surface.background": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-surface-background", name: "walkthrough.color.surface.background", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "walkthrough.color.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-surface-border", name: "walkthrough.color.surface.border", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "walkthrough.size.surface.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-size-surface-radius", name: "walkthrough.size.surface.radius", fallback: .string("16px")),
            "walkthrough.color.surface.shadow": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-surface-shadow", name: "walkthrough.color.surface.shadow", fallback: .string("0px 2px 4px #0000000f, 0px 4px 8px #0000001a")),
            "walkthrough.size.surface.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-size-surface-padding", name: "walkthrough.size.surface.padding", fallback: .string("32px")),
            "walkthrough.size.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-size-title-font-size", name: "walkthrough.size.title.fontSize", fallback: .string("20px")),
            "walkthrough.typography.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-typography-title-font-weight", name: "walkthrough.typography.title.fontWeight", fallback: .string("700")),
            "walkthrough.color.title.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-title-foreground", name: "walkthrough.color.title.foreground", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "walkthrough.size.description.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-size-description-font-size", name: "walkthrough.size.description.fontSize", fallback: .string("16px")),
            "walkthrough.color.description.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-description-foreground", name: "walkthrough.color.description.foreground", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "walkthrough.spacing.description.marginTop": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-spacing-description-margin-top", name: "walkthrough.spacing.description.marginTop", fallback: .string("8px")),
            "walkthrough.spacing.controls.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-spacing-controls-gap", name: "walkthrough.spacing.controls.gap", fallback: .string("12px")),
            "walkthrough.spacing.controls.marginTop": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-spacing-controls-margin-top", name: "walkthrough.spacing.controls.marginTop", fallback: .string("16px")),
            "walkthrough.size.dots.default": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-size-dots-default", name: "walkthrough.size.dots.default", fallback: .string("8px")),
            "walkthrough.spacing.dots.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-spacing-dots-gap", name: "walkthrough.spacing.dots.gap", fallback: .string("4px")),
            "walkthrough.color.dots.active": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-dots-active", name: "walkthrough.color.dots.active", fallback: .string("#0566fe")),
            "walkthrough.color.dots.idle": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-dots-idle", name: "walkthrough.color.dots.idle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "walkthrough.color.button.primary.background": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-button-primary-background", name: "walkthrough.color.button.primary.background", fallback: .string("#0566fe")),
            "walkthrough.color.button.primary.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-button-primary-foreground", name: "walkthrough.color.button.primary.foreground", fallback: .string("#ffffff")),
            "walkthrough.size.button.primary.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-size-button-primary-radius", name: "walkthrough.size.button.primary.radius", fallback: .string("6px")),
            "walkthrough.color.button.secondary.background": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-button-secondary-background", name: "walkthrough.color.button.secondary.background", fallback: .string("#00000000")),
            "walkthrough.color.button.secondary.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-button-secondary-foreground", name: "walkthrough.color.button.secondary.foreground", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "walkthrough.color.button.secondary.border": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-color-button-secondary-border", name: "walkthrough.color.button.secondary.border", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
        ],
    ]
}

/// Emitted through the coachmark surface path: an overlay panel on the step channel with prev/next navigation and the contract's completion/skip callbacks.
public struct Walkthrough<TitleRegion: View, DescriptionRegion: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        WalkthroughTokens.scopes
    }
    @StateObject private var step: ControllableValue<Double>
    private let stepCount: Int
    private let onComplete: (() -> Void)?
    private let onSkip: (() -> Void)?
    private let title: TitleRegion
    private let description: DescriptionRegion
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        step: Double = 0,
        stepCount: Int = 3,
        onStepChange: ((Double) -> Void)? = nil,
        onComplete: (() -> Void)? = nil,
        onSkip: (() -> Void)? = nil,
        @ViewBuilder title: () -> TitleRegion = { EmptyView() },
        @ViewBuilder description: () -> DescriptionRegion = { EmptyView() }
    ) {
        self._step = StateObject(wrappedValue: ControllableValue(controlled: nil, defaultValue: step, onChange: onStepChange))
        self.stepCount = stepCount
        self.onComplete = onComplete
        self.onSkip = onSkip
        self.title = title()
        self.description = description()
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
            title
            description
            HStack {
                Button("Skip") { onSkip?() }
                    .buttonStyle(.plain)
                Spacer()
                Button("Back") { if step.value > 0 { step.set(step.value - 1) } }
                    .buttonStyle(.plain)
                Button("Next") {
                    step.set(step.value + 1)
                    if Int(step.value) >= stepCount - 1 { onComplete?() }
                }
                .buttonStyle(.borderedProminent)
            }
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }
}
// @generated:end
