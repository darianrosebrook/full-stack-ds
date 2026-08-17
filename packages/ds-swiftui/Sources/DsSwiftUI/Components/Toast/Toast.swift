// @generated:start types
public enum ToastVariant: String, CaseIterable {
    case info
    case success
    case warning
    case error
}
public enum ToastPoliteness: String, CaseIterable {
    case polite
    case assertive
}
// @generated:end

// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start component
/// Token scope data for Toast (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum ToastTokens {
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
            "toast.surface.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-bg", name: "toast.surface.bg", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "toast.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-border", name: "toast.surface.border", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "toast.surface.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-radius", name: "toast.surface.radius", fallback: .string("6px")),
            "toast.surface.shadow": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-shadow", name: "toast.surface.shadow", fallback: .string("0px 4px 6px #0000000d, 0px 10px 15px #0000001a")),
            "toast.color.default": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-default", name: "toast.color.default", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "toast.accent.default": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-accent-default", name: "toast.accent.default", fallback: .adaptive(light: "#0566fe", dark: "#0089fe")),
            "toast.color.intent.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-intent-bg", name: "toast.color.intent.bg", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "toast.color.intent.border": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-intent-border", name: "toast.color.intent.border", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "toast.spacing.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-spacing-padding", name: "toast.spacing.padding", fallback: .string("12px")),
            "toast.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-spacing-gap", name: "toast.spacing.gap", fallback: .string("8px")),
            "toast.spacing.stackGap": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-spacing-stack-gap", name: "toast.spacing.stackGap", fallback: .string("8px")),
            "toast.size.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-size-max-width", name: "toast.size.maxWidth", literal: .string("400px")),
            "toast.motion.enter": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-motion-enter", name: "toast.motion.enter", fallback: .string("150ms")),
            "toast.motion.leave": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-motion-leave", name: "toast.motion.leave", fallback: .string("150ms")),
            "toast.timing.auto-dismiss": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-timing-auto-dismiss", name: "toast.timing.auto-dismiss", fallback: .string("6000ms")),
        ],
        "variant_info": [
            "toast.surface.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-bg", name: "toast.surface.bg", fallback: .adaptive(light: "#95dafb", dark: "#000a69")),
            "toast.color.default": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-default", name: "toast.color.default", fallback: .adaptive(light: "#013ab0", dark: "#00a9fb")),
            "toast.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-border", name: "toast.surface.border", fallback: .adaptive(light: "#034fd6", dark: "#0566fe")),
        ],
        "variant_success": [
            "toast.surface.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-bg", name: "toast.surface.bg", fallback: .adaptive(light: "#b3dba7", dark: "#0b2200")),
            "toast.color.default": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-default", name: "toast.color.default", fallback: .adaptive(light: "#2c4f09", dark: "#6eb157")),
            "toast.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-border", name: "toast.surface.border", fallback: .adaptive(light: "#3a6614", dark: "#497f21")),
        ],
        "variant_warning": [
            "toast.surface.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-bg", name: "toast.surface.bg", fallback: .adaptive(light: "#fdc67f", dark: "#341400")),
            "toast.color.default": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-default", name: "toast.color.default", fallback: .adaptive(light: "#6c3a00", dark: "#ec8802")),
            "toast.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-border", name: "toast.surface.border", fallback: .adaptive(light: "#8b4b00", dark: "#ae5d00")),
        ],
        "variant_error": [
            "toast.surface.bg": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-bg", name: "toast.surface.bg", fallback: .adaptive(light: "#fac2c2", dark: "#440000")),
            "toast.color.default": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-color-default", name: "toast.color.default", fallback: .adaptive(light: "#900909", dark: "#ee8181")),
            "toast.surface.border": FsdsComponentTokenDefinition(cssVar: "--fsds-toast-surface-border", name: "toast.surface.border", fallback: .adaptive(light: "#b31b1b", dark: "#d92d2e")),
        ],
    ]
}

/// Emitted through the toast surface path: an overlay presentation over the open channel (the shared ControllableValue substrate); ephemeral presence auto-dismisses after the dwell token (150ms).
public struct Toast<Item: View, Title: View, Description: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        ToastTokens.scopes
    }
    @StateObject private var open: ControllableValue<Bool>
    private let item: Item
    private let title: Title
    private let description: Description
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        @ViewBuilder item: () -> Item = { EmptyView() },
        @ViewBuilder title: () -> Title = { EmptyView() },
        @ViewBuilder description: () -> Description = { EmptyView() }
    ) {
        self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))
        self.item = item()
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
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    @ViewBuilder
    private var panel: some View {
        VStack(spacing: gap) {
            item
            title
            description
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }

    public var body: some View {
        ZStack(alignment: .topTrailing) {
            Color.clear
            if open.value {
                panel
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
            .task(id: open.value) {
                if open.value {
                    try? await Task.sleep(for: .milliseconds(150))
                    open.set(false)
                }
            }
    }
}
// @generated:end
