// @generated:start types
public enum PopoverPlacement: String, CaseIterable {
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
/// Token scope data for Popover (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum PopoverTokens {
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
            "popover.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-size-padding-default", name: "popover.size.padding.default", fallback: .string("16px")),
            "popover.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-size-radius-default", name: "popover.size.radius.default", fallback: .string("6px")),
            "popover.size.gap.default": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-size-gap-default", name: "popover.size.gap.default", fallback: .string("8px")),
            "popover.color.background.content": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-color-background-content", name: "popover.color.background.content", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "popover.color.border.accent": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-color-border-accent", name: "popover.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "popover.elevation.default": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-elevation-default", name: "popover.elevation.default", fallback: .string("0px 8px 10px #0000000a, 0px 20px 25px #0000001a")),
            "popover.layer.content": FsdsComponentTokenDefinition(cssVar: "--fsds-popover-layer-content", name: "popover.layer.content", fallback: .string("1000")),
        ],
    ]
}

/// Emitted through the anchored-tooltip surface path: hover on the trigger region drives the open channel (the declared trigger modality on this target), presenting the content region in a popover. Native popover dismissal realizes escape/blur.
public struct Popover<Trigger: View, Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        PopoverTokens.scopes
    }
    @StateObject private var open: ControllableValue<Bool>
    private let placement: PopoverPlacement
    private let disabled: Bool
    private let trigger: Trigger
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        placement: PopoverPlacement = .top,
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
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }

    public var body: some View {
        trigger
            .popover(isPresented: Binding(
                get: { open.value },
                set: { open.set($0) }
            ), arrowEdge: placementEdge) {
                panel
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

