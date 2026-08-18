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
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.structure.size.gap", fallback: .string("16px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "walkthrough.surface.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-surface-bg", name: "walkthrough.surface.bg", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "walkthrough.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-surface-border", name: "walkthrough.surface.border", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "walkthrough.surface.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-surface-radius", name: "walkthrough.surface.radius", ref: "semantic.shape.radius.large", fallback: .string("16px")),
            "walkthrough.surface.shadow": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-surface-shadow", name: "walkthrough.surface.shadow", ref: "semantic.elevation.surface.floating", fallback: .string("0px 2px 4px #0000000f, 0px 4px 8px #0000001a")),
            "walkthrough.surface.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-surface-padding", name: "walkthrough.surface.padding", ref: "core.spacing.size.08", fallback: .string("32px")),
            "walkthrough.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-title-font-size", name: "walkthrough.title.fontSize", ref: "semantic.typography.heading.03", fallback: .string("20px")),
            "walkthrough.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-title-font-weight", name: "walkthrough.title.fontWeight", ref: "semantic.typography.font.weight.bold", fallback: .string("700")),
            "walkthrough.title.color": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-title-color", name: "walkthrough.title.color", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "walkthrough.description.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-description-font-size", name: "walkthrough.description.fontSize", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "walkthrough.description.color": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-description-color", name: "walkthrough.description.color", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "walkthrough.description.marginTop": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-description-margin-top", name: "walkthrough.description.marginTop", ref: "core.spacing.size.04", fallback: .string("8px")),
            "walkthrough.controls.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-controls-gap", name: "walkthrough.controls.gap", ref: "core.spacing.size.05", fallback: .string("12px")),
            "walkthrough.controls.marginTop": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-controls-margin-top", name: "walkthrough.controls.marginTop", ref: "core.spacing.size.06", fallback: .string("16px")),
            "walkthrough.dots.size": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-dots-size", name: "walkthrough.dots.size", ref: "core.spacing.size.04", fallback: .string("8px")),
            "walkthrough.dots.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-dots-gap", name: "walkthrough.dots.gap", ref: "core.spacing.size.03", fallback: .string("4px")),
            "walkthrough.dots.active": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-dots-active", name: "walkthrough.dots.active", ref: "semantic.color.action.background.primary.default", fallback: .string("#0566fe")),
            "walkthrough.dots.idle": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-dots-idle", name: "walkthrough.dots.idle", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "walkthrough.button.primary.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-button-primary-bg", name: "walkthrough.button.primary.bg", ref: "semantic.color.action.background.primary.default", fallback: .string("#0566fe")),
            "walkthrough.button.primary.color": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-button-primary-color", name: "walkthrough.button.primary.color", ref: "semantic.color.action.foreground.primary.default", fallback: .string("#ffffff")),
            "walkthrough.button.primary.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-button-primary-radius", name: "walkthrough.button.primary.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "walkthrough.button.secondary.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-button-secondary-bg", name: "walkthrough.button.secondary.bg", ref: "core.color.mode.transparent", fallback: .string("#00000000")),
            "walkthrough.button.secondary.color": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-button-secondary-color", name: "walkthrough.button.secondary.color", ref: "semantic.color.foreground.secondary", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "walkthrough.button.secondary.border": FsdsComponentTokenDefinition(cssVar: "--fsds-walkthrough-button-secondary-border", name: "walkthrough.button.secondary.border", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
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
