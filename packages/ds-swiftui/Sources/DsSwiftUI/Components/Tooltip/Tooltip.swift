// @generated:start types
public enum TooltipPlacement: String, CaseIterable {
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
/// Token scope data for Tooltip (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum TooltipTokens {
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
            "tooltip.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-color-background-default", name: "tooltip.color.background.default", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "tooltip.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-color-foreground-default", name: "tooltip.color.foreground.default", fallback: .adaptive(light: "#fafafa", dark: "#141414")),
            "tooltip.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-color-border-default", name: "tooltip.color.border.default", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "tooltip.size.padding.y": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-size-padding-y", name: "tooltip.size.padding.y", fallback: .string("4px")),
            "tooltip.size.padding.x": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-size-padding-x", name: "tooltip.size.padding.x", fallback: .string("8px")),
            "tooltip.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-size-radius-default", name: "tooltip.size.radius.default", fallback: .string("4px")),
            "tooltip.size.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-size-max-width", name: "tooltip.size.maxWidth", literal: .string("200px")),
            "tooltip.typography.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-typography-font-size", name: "tooltip.typography.fontSize", fallback: .string("14px")),
            "tooltip.layer.content": FsdsComponentTokenDefinition(cssVar: "--fsds-tooltip-layer-content", name: "tooltip.layer.content", fallback: .string("1800")),
        ],
    ]
}

/// Emitted through the anchored-tooltip surface path: hover on the trigger region drives the open channel (the declared trigger modality on this target), presenting the content region in a popover. Native popover dismissal realizes escape/blur.
public struct Tooltip<Trigger: View, Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        TooltipTokens.scopes
    }
    @StateObject private var open: ControllableValue<Bool>
    private let placement: TooltipPlacement
    private let disabled: Bool
    private let trigger: Trigger
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        placement: TooltipPlacement = .top,
        disabled: Bool = false,
        @ViewBuilder trigger: () -> Trigger,
        @ViewBuilder content: () -> Content = { EmptyView() }
    ) {
        self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))
        self.placement = placement
        self.disabled = disabled
        self.trigger = trigger()
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

    private var background: Color { colorSlot("color.background.default") ?? .accentColor }
    private var foreground: Color { colorSlot("color.foreground.default") ?? .primary }
    private var borderColor: Color { colorSlot("color.border.default") ?? .clear }
    private var radius: CGFloat { pxSlot("size.radius.default") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    @ViewBuilder
    private var panel: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }

    public var body: some View {
        trigger
            .popover(isPresented: Binding(
                get: { open.value },
                set: { open.set($0) }
            ), arrowEdge: placementEdge) {
                panel
            }
            .onHover { hovering in
                if !disabled { open.set(hovering) }
            }
    }

    private var placementEdge: Edge {
        switch placement {
        case .top: return .top
        case .bottom: return .bottom
        case .left: return .leading
        case .right: return .trailing
        case .auto: return .bottom
        }
    }
}
// @generated:end

