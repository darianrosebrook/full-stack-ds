// @generated:start types
public enum DialogSize: String, CaseIterable {
    case sm
    case md
    case lg
    case xl
    case full
}
// @generated:end

// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start component
/// Token scope data for Dialog (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum DialogTokens {
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
            "dialog.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-background-default", name: "dialog.color.background.default", fallback: .string("#ffffff")),
            "dialog.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-foreground-default", name: "dialog.color.foreground.default", fallback: .string("#141414")),
            "dialog.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-border-default", name: "dialog.color.border.default", fallback: .string("#d0d0d0")),
            "dialog.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-radius-default", name: "dialog.size.radius.default", fallback: .string("16px")),
            "dialog.size.sm.width": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-sm-width", name: "dialog.size.sm.width", literal: .string("400px")),
            "dialog.size.sm.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-sm-max-width", name: "dialog.size.sm.maxWidth", literal: .string("90vw")),
            "dialog.size.md.width": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-md-width", name: "dialog.size.md.width", literal: .string("500px")),
            "dialog.size.md.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-md-max-width", name: "dialog.size.md.maxWidth", literal: .string("90vw")),
            "dialog.size.lg.width": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-lg-width", name: "dialog.size.lg.width", literal: .string("700px")),
            "dialog.size.lg.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-lg-max-width", name: "dialog.size.lg.maxWidth", literal: .string("90vw")),
            "dialog.size.xl.width": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-xl-width", name: "dialog.size.xl.width", literal: .string("900px")),
            "dialog.size.xl.maxWidth": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-xl-max-width", name: "dialog.size.xl.maxWidth", literal: .string("95vw")),
            "dialog.size.full.width": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-full-width", name: "dialog.size.full.width", literal: .string("100vw")),
            "dialog.size.full.height": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-full-height", name: "dialog.size.full.height", literal: .string("100vh")),
            "dialog.size.closeButton.size": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-size-close-button-size", name: "dialog.size.closeButton.size", fallback: .string("32px")),
            "dialog.elevation.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-elevation-default", name: "dialog.elevation.default", fallback: .string("0 12px 16px rgba(0,0,0,0.06), 0 25px 50px rgba(0,0,0,0.15)")),
            "dialog.spacing.header.paddingTop": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-spacing-header-padding-top", name: "dialog.spacing.header.paddingTop", fallback: .string("16px")),
            "dialog.spacing.body.paddingRight": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-spacing-body-padding-right", name: "dialog.spacing.body.paddingRight", fallback: .string("24px")),
            "dialog.spacing.footer.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-spacing-footer-gap", name: "dialog.spacing.footer.gap", fallback: .string("4px")),
            "dialog.typography.title.fontSize": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-typography-title-font-size", name: "dialog.typography.title.fontSize", fallback: .string("18px")),
            "dialog.typography.title.fontWeight": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-typography-title-font-weight", name: "dialog.typography.title.fontWeight", fallback: .string("700")),
            "dialog.typography.title.lineHeight": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-typography-title-line-height", name: "dialog.typography.title.lineHeight", fallback: .string("1")),
        ],
        "part_backdrop": [
            "dialog.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-background-default", name: "dialog.color.background.default", fallback: .string("#000000")),
        ],
        "part_body": [
            "dialog.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-foreground-default", name: "dialog.color.foreground.default", fallback: .string("#5c5b5c")),
        ],
        "part_closeButton": [
            "dialog.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-foreground-default", name: "dialog.color.foreground.default", fallback: .string("#5c5b5c")),
        ],
        "hover": [
            "dialog.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-dialog-color-background-default", name: "dialog.color.background.default", fallback: .string("#b8b8b8")),
        ],
    ]
}

/// Emitted through the centered-modal surface path: presented as a sheet whose native dismissal (Esc, overlay click) drives the openness channel back through onOpenChange — the contract's escape/overlayClick dismissal triggers realized by the platform.
public struct Dialog<Header: View, Title: View, BodyContent: View, Footer: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        DialogTokens.scopes
    }
    private let controlledOpen: Binding<Bool>?
    @State private var uncontrolledOpen: Bool
    private let onOpenChange: ((Bool) -> Void)?
    private let header: Header
    private let title: Title
    private let bodyContent: BodyContent
    private let footer: Footer
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        open: Binding<Bool>? = nil,
        defaultOpen: Bool = false,
        onOpenChange: ((Bool) -> Void)? = nil,
        @ViewBuilder header: () -> Header = { EmptyView() },
        @ViewBuilder title: () -> Title = { EmptyView() },
        @ViewBuilder bodyContent: () -> BodyContent = { EmptyView() },
        @ViewBuilder footer: () -> Footer = { EmptyView() }
    ) {
        self.controlledOpen = open
        self._uncontrolledOpen = State(initialValue: defaultOpen)
        self.onOpenChange = onOpenChange
        self.header = header()
        self.title = title()
        self.bodyContent = bodyContent()
        self.footer = footer()
    }

    private var isOpen: Bool {
        controlledOpen?.wrappedValue ?? uncontrolledOpen
    }

    private func setOpen(_ next: Bool) {
        if let binding = controlledOpen {
            binding.wrappedValue = next
        } else {
            uncontrolledOpen = next
        }
        onOpenChange?(next)
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
        VStack(spacing: gap) {
            header
            title
            bodyContent
            footer
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }

    public var body: some View {
        EmptyView()
            .sheet(isPresented: Binding(
                get: { isOpen },
                set: { setOpen($0) }
            )) {
                panel
            }
    }
}
// @generated:end
