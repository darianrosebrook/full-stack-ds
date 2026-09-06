// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum LinkTarget: String, CaseIterable {
    case _self
    case _blank
    case _parent
    case _top
}
public enum LinkSize: String, CaseIterable {
    case small
    case medium
    case large
}
// @generated:end

// @generated:start component
/// Token scope data for Links (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum LinksTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.display.size.gap", fallback: .string("4px")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "links.color.foreground.default": FsdsComponentTokenDefinition(cssVar: "--fsds-links-color-foreground-default", name: "links.color.foreground.default", ref: "semantic.color.foreground.link", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "links.focus.ring.radius": FsdsComponentTokenDefinition(cssVar: "--fsds-links-focus-ring-radius", name: "links.focus.ring.radius", ref: "semantic.shape.radius.small", fallback: .string("4px")),
        ],
    ]
}

/// Emitted through the static-content path: passive a root with a single consumer content region.
public struct Links<Content: View>: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        LinksTokens.scopes
    }
    private let size: LinkSize?
    private let content: Content
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        size: LinkSize? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.size = size
        self.content = content()
    }

    private var layered: [String: FsdsTokenValue?] {
        resolveFsdsLayeredTokens(
            fsdsScopes,
            fsdsTheme,
            layers: ["root", size.map { "variant_\($0.rawValue)" }].compactMap { $0 }
        )
    }

    private func colorSlot(_ suffix: String) -> Color? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.color
    }

    private func pxSlot(_ suffix: String) -> CGFloat? {
        layered.first { $0.key.hasSuffix(suffix) }?.value?.px
    }

    private var foreground: Color { colorSlot("color.foreground.default") ?? .primary }
    private var radius: CGFloat { pxSlot("radius") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        content
            .padding(.vertical, blockPadding)
            .padding(.horizontal, inlinePadding)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .foregroundStyle(foreground)
    }
}
// @generated:end
