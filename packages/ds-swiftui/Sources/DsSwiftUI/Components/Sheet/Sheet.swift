// @generated:start types
public enum SheetSide: String, CaseIterable {
    case top
    case right
    case bottom
    case left
}
// @generated:end

// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start component
/// Token scope data for Sheet (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum SheetTokens {
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
            "sheet.color.overlay": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-overlay", name: "sheet.color.overlay", fallback: .string("rgba(0,0,0,0.40)")),
            "sheet.color.background": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-background", name: "sheet.color.background", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "sheet.color.border": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-border", name: "sheet.color.border", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "sheet.color.text": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-text", name: "sheet.color.text", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "sheet.color.textTitle": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-text-title", name: "sheet.color.textTitle", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "sheet.color.textDescription": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-text-description", name: "sheet.color.textDescription", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "sheet.border.width": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-border-width", name: "sheet.border.width", fallback: .string("1px")),
            "sheet.border.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-border-radius", name: "sheet.border.radius", fallback: .string("6px")),
            "sheet.size.width": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-size-width", name: "sheet.size.width", literal: .string("400px")),
            "sheet.size.height": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-size-height", name: "sheet.size.height", literal: .string("300px")),
            "sheet.size.close": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-size-close", name: "sheet.size.close", fallback: .string("16px")),
            "sheet.spacing.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-spacing-padding", name: "sheet.spacing.padding", fallback: .string("16px")),
            "sheet.spacing.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-spacing-gap", name: "sheet.spacing.gap", fallback: .string("8px")),
            "sheet.text.size": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-text-size", name: "sheet.text.size", fallback: .string("16px")),
            "sheet.text.sizeTitle": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-text-size-title", name: "sheet.text.sizeTitle", fallback: .string("14px")),
            "sheet.text.weightTitle": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-text-weight-title", name: "sheet.text.weightTitle", fallback: .string("500")),
            "sheet.shadow": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-shadow", name: "sheet.shadow", fallback: .string("0px 2px 4px #0000000f, 0px 4px 8px #0000001a")),
            "sheet.focus.width": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-focus-width", name: "sheet.focus.width", fallback: .string("2px")),
            "sheet.focus.color": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-focus-color", name: "sheet.focus.color", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "sheet.color.backgroundHover": FsdsComponentTokenDefinition(cssVar: "--fsds-sheet-color-background-hover", name: "sheet.color.backgroundHover", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
        ],
    ]
}

/// Emitted through the centered-modal surface path: presented as a sheet whose native dismissal (Esc, overlay click) drives the openness channel back through onOpenChange — the contract's escape/overlayClick dismissal triggers realized by the platform.
public struct Sheet<Content: View, Header: View, Title: View, Description: View, BodyContent: View, Footer: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        SheetTokens.scopes
    }
    @StateObject private var open: ControllableValue<Bool>
    private let content: Content
    private let header: Header
    private let title: Title
    private let description: Description
    private let bodyContent: BodyContent
    private let footer: Footer
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        @ViewBuilder content: () -> Content = { EmptyView() },
        @ViewBuilder header: () -> Header = { EmptyView() },
        @ViewBuilder title: () -> Title = { EmptyView() },
        @ViewBuilder description: () -> Description = { EmptyView() },
        @ViewBuilder bodyContent: () -> BodyContent = { EmptyView() },
        @ViewBuilder footer: () -> Footer = { EmptyView() }
    ) {
        self._open = StateObject(wrappedValue: ControllableValue(controlled: open, defaultValue: defaultOpen, onChange: onOpenChange))
        self.content = content()
        self.header = header()
        self.title = title()
        self.description = description()
        self.bodyContent = bodyContent()
        self.footer = footer()
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
            content
            header
            title
            description
            bodyContent
            footer
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
    }

    public var body: some View {
        EmptyView()
            .sheet(isPresented: Binding(
                get: { open.value },
                set: { open.set($0) }
            )) {
                panel
            }
    }
}
// @generated:end
