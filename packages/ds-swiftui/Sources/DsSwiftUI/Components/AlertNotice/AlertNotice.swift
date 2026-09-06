// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum AlertNoticeStatus: String, CaseIterable {
    case info
    case success
    case warning
    case error
}
public enum AlertNoticeLevel: String, CaseIterable {
    case page
    case section
    case inline
}
// @generated:end

// @generated:start component
/// Token scope data for AlertNotice (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum AlertNoticeTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.feedback.size.padding-block", fallback: .string("16px")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.feedback.size.padding-inline", fallback: .string("16px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.feedback.size.gap", fallback: .string("8px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "alert-notice.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-color-foreground-primary", name: "alert-notice.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "alert-notice.size.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-alert-notice-size-radius", name: "alert-notice.size.radius", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
        ],
    ]
}

/// Emitted through the icon-decorated content path: the icon prop feeds the shared GlyphCatalog registry; content is the consumer's single region.
public struct AlertNotice<IconRegion: View, Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        AlertNoticeTokens.scopes
    }
    private let iconRegion: IconRegion
    private let status: AlertNoticeStatus?
    private let level: AlertNoticeLevel?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        @ViewBuilder icon: () -> IconRegion = { EmptyView() },
        status: AlertNoticeStatus? = nil,
        level: AlertNoticeLevel? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.iconRegion = icon()
        self.status = status
        self.level = level
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", status.map { "variant_\($0.rawValue)" }, level.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var foreground: Color { colorSlot("color.foreground.primary") ?? .primary }
    private var radius: CGFloat { pxSlot("size.radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        HStack(spacing: gap) {
            iconRegion
            content
        }
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
