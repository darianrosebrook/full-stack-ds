// @generated:start types

// @generated:end

// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start component
/// Token scope data for Command (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum CommandTokens {
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
            "command.color.overlay": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-overlay", name: "command.color.overlay", ref: "semantic.overlay.scrim.strong", fallback: .string("rgba(0,0,0,0.64)")),
            "command.color.background": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-background", name: "command.color.background", ref: "semantic.color.background.primary", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "command.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-border", name: "command.color.border", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "command.color.borderLight": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-border-light", name: "command.color.borderLight", ref: "semantic.color.border.subtle", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "command.color.text": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-text", name: "command.color.text", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "command.color.textMuted": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-text-muted", name: "command.color.textMuted", ref: "semantic.color.foreground.tertiary", fallback: .adaptive(light: "#727272", dark: "#888889")),
            "command.border.width": FsdsComponentTokenDefinition(cssVar: "--fsds-command-border-width", name: "command.border.width", ref: "semantic.shape.control.border.defaultWidth", fallback: .string("1px")),
            "command.border.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-command-border-radius", name: "command.border.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "command.size.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-command-size-max-width", name: "command.size.maxWidth", literal: .string("640px")),
            "command.size.maxHeight": FsdsComponentTokenDefinition(cssVar: "--fsds-command-size-max-height", name: "command.size.maxHeight", literal: .string("400px")),
            "command.size.topOffset": FsdsComponentTokenDefinition(cssVar: "--fsds-command-size-top-offset", name: "command.size.topOffset", literal: .string("10vh")),
            "command.size.icon": FsdsComponentTokenDefinition(cssVar: "--fsds-command-size-icon", name: "command.size.icon", ref: "core.spacing.size.04", fallback: .string("8px")),
            "command.spacing.dialogPadding": FsdsComponentTokenDefinition(cssVar: "--fsds-command-spacing-dialog-padding", name: "command.spacing.dialogPadding", ref: "core.spacing.size.04", fallback: .string("8px")),
            "command.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-command-text-size", name: "command.text.size", ref: "semantic.typography.body.02", fallback: .string("16px")),
            "command.text.sizeSmall": FsdsComponentTokenDefinition(cssVar: "--fsds-command-text-size-small", name: "command.text.sizeSmall", ref: "semantic.typography.body.04", fallback: .string("12px")),
            "command.shadow": FsdsComponentTokenDefinition(cssVar: "--fsds-command-shadow", name: "command.shadow", ref: "semantic.elevation.surface.floating", fallback: .string("0px 2px 4px #0000000f, 0px 4px 8px #0000001a")),
            "command.opacity.disabled": FsdsComponentTokenDefinition(cssVar: "--fsds-command-opacity-disabled", name: "command.opacity.disabled", ref: "semantic.interaction.disabled.opacity", fallback: .string("0.5")),
            "command.color.backgroundHover": FsdsComponentTokenDefinition(cssVar: "--fsds-command-color-background-hover", name: "command.color.backgroundHover", ref: "semantic.interaction.background.hover", fallback: .adaptive(light: "#f7f7f7", dark: "#313131")),
        ],
    ]
}

/// Emitted through the centered-modal surface path: presented as a sheet whose native dismissal (Esc, overlay click) drives the openness channel back through onOpenChange — the contract's escape/overlayClick dismissal triggers realized by the platform.
public struct Command<List: View, Group: View, GroupHeading: View, GroupItems: View, Item: View, ItemIcon: View, ItemContent: View, ItemLabel: View, ItemDescription: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        CommandTokens.scopes
    }
    @StateObject private var open: ControllableValue<Bool>
    private let openControlled: Binding<Bool>?
    @StateObject private var search: ControllableValue<String>
    private let list: List
    private let group: Group
    private let groupHeading: GroupHeading
    private let groupItems: GroupItems
    private let item: Item
    private let itemIcon: ItemIcon
    private let itemContent: ItemContent
    private let itemLabel: ItemLabel
    private let itemDescription: ItemDescription
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        search: Binding<String>? = nil,
        defaultSearch: String = "",
        onSearchChange: ((String) -> Void)? = nil,
        @ViewBuilder list: () -> List = { EmptyView() },
        @ViewBuilder group: () -> Group = { EmptyView() },
        @ViewBuilder groupHeading: () -> GroupHeading = { EmptyView() },
        @ViewBuilder groupItems: () -> GroupItems = { EmptyView() },
        @ViewBuilder item: () -> Item = { EmptyView() },
        @ViewBuilder itemIcon: () -> ItemIcon = { EmptyView() },
        @ViewBuilder itemContent: () -> ItemContent = { EmptyView() },
        @ViewBuilder itemLabel: () -> ItemLabel = { EmptyView() },
        @ViewBuilder itemDescription: () -> ItemDescription = { EmptyView() }
    ) {
        self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))
        self.openControlled = open
        self._search = StateObject(wrappedValue: ControllableValue(controlled: search, defaultValue: defaultSearch, onChange: onSearchChange))
        self.list = list()
        self.group = group()
        self.groupHeading = groupHeading()
        self.groupItems = groupItems()
        self.item = item()
        self.itemIcon = itemIcon()
        self.itemContent = itemContent()
        self.itemLabel = itemLabel()
        self.itemDescription = itemDescription()
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

    private var borderColor: Color { colorSlot("color.border") ?? .clear }
    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    @ViewBuilder
    private var panel: some View {
        VStack(spacing: gap) {
            SwiftUI.TextField(
                "",
                text: Binding(
                    get: { search.value },
                    set: { search.set($0) }
                ),
                prompt: SwiftUI.Text("Search...")
            )
            list
            group
            groupHeading
            groupItems
            item
            itemIcon
            itemContent
            itemLabel
            itemDescription
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }

    private var presentationBinding: Binding<Bool> {
        if let controlled = openControlled {
            return Binding(
                get: { controlled.wrappedValue },
                set: { open.set($0) }
            )
        }
        return Binding(
            get: { open.value },
            set: { open.set($0) }
        )
    }

    public var body: some View {
        SwiftUI.Color.clear.frame(width: 0, height: 0)
            .sheet(isPresented: presentationBinding) {
                panel
            }
    }
}
// @generated:end
