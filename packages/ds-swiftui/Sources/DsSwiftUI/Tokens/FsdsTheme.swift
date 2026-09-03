// FsdsTheme — hand-maintained token runtime for the generated DsSwiftUI
// components (the SwiftUI analog of @full-stack-ds/react-native's
// tokens/index.tsx). Generated components ship their token scopes as DATA
// (`ComponentTokenScopes`) and resolve them at render time through whatever
// theme the environment carries — so a consumer can override any slot by
// name without regenerating code.
//
// Resolution semantics mirror the RN module exactly:
//   theme.tokens[name]  →  literal  →  fallback
//
// This file is NOT generated. Do not edit generated component files; edit
// this file only to widen the runtime (new accessors, theme surfaces).

import SwiftUI
import AppKit

/// A token value as authored in the token graph: a number-with-unit or a
/// bare string. Accessors parse target-usable forms; unparsable units
/// (rem, cubic-bezier, …) return nil and callers skip the property.
public enum FsdsTokenValue: Sendable, Equatable {
    case number(Double)
    case string(String)
    /// A theme-aware color pair baked at generation time from the resolved
    /// token graph: light is the contract fallback (the corpus's
    /// collapsed-to-light convention), dark is the graph's dark half.
    case adaptive(light: String, dark: String)

    /// Leading-unitless double for px-like values ("8px" → 8).
    public var px: CGFloat? {
        switch self {
        case .adaptive: return nil
        case .number(let n): return CGFloat(n)
        case .string(let s):
            guard
                let match = s.range(of: #"^(-?\d+(?:\.\d+)?)(px)?$"#, options: .regularExpression),
                let value = Double(s[match].replacingOccurrences(of: "px", with: ""))
            else { return nil }
            return CGFloat(value)
        }
    }

    /// Color for hex values; `.adaptive` returns a dynamic NSColor
    /// provider color that resolves per appearance (dark under darkAqua).
    public var color: Color? {
        switch self {
        case .adaptive(let lightHex, let darkHex):
            guard let dynamic = Self.adaptiveNSColor(light: lightHex, dark: darkHex)
            else { return nil }
            return Color(nsColor: dynamic)
        case .string(let hex):
            return Self.parseHexNSColor(hex).map(Color.init(nsColor:))
        case .number:
            return nil
        }
    }

    /// The dynamic provider backing `.adaptive` colors — internal so the
    /// XCTest regression suite can materialize it per appearance.
    static func adaptiveNSColor(light: String, dark: String) -> NSColor? {
        guard let lightColor = parseHexNSColor(light),
              let darkColor = parseHexNSColor(dark)
        else { return nil }
        return NSColor(name: nil) { appearance in
            Self.adaptivePick(appearance: appearance, light: lightColor, dark: darkColor)
        }
    }

    /// The per-appearance decision the dynamic provider runs — pure and
    /// headless-testable (dark under darkAqua, light otherwise).
    static func adaptivePick(
        appearance: NSAppearance,
        light: NSColor,
        dark: NSColor
    ) -> NSColor {
        appearance.bestMatch(from: [.darkAqua]) != nil ? dark : light
    }

    private static func parseHexNSColor(_ s: String) -> NSColor? {
        guard s.hasPrefix("#") else { return nil }
        var hex: UInt64 = 0
        let digits = String(s.dropFirst())
        guard [3, 6, 8].contains(digits.count),
              Scanner(string: digits).scanHexInt64(&hex)
        else { return nil }
        func color(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat, _ a: CGFloat) -> NSColor {
            NSColor(red: r, green: g, blue: b, alpha: a)
        }
        switch digits.count {
        case 3:
            return color(
                CGFloat((hex >> 8) & 0xF) / 15,
                CGFloat((hex >> 4) & 0xF) / 15,
                CGFloat(hex & 0xF) / 15, 1
            )
        case 6:
            return color(
                CGFloat((hex >> 16) & 0xFF) / 255,
                CGFloat((hex >> 8) & 0xFF) / 255,
                CGFloat(hex & 0xFF) / 255, 1
            )
        default:
            return color(
                CGFloat((hex >> 24) & 0xFF) / 255,
                CGFloat((hex >> 16) & 0xFF) / 255,
                CGFloat((hex >> 8) & 0xFF) / 255,
                CGFloat(hex & 0xFF) / 255
            )
        }
    }
}

/// One slot definition inside a component scope — mirrors the RN
/// `ComponentTokenDefinition` shape the codegen emits.
public struct FsdsComponentTokenDefinition: Sendable {
    public let cssVar: String
    public let name: String
    /// Semantic graph path this slot resolves through (the sidecar's
    /// `resolvesTo`), when the slot is not a literal. A semantic-defaults
    /// table reaches component slots through this arm
    /// (FEAT-SWIFTUI-TOKEN-CARRIER-PARITY-01) — same semantics as the
    /// RN/Compose carriers.
    public let ref: String?
    public let literal: FsdsTokenValue?
    public let fallback: FsdsTokenValue?

    public init(cssVar: String, name: String, ref: String? = nil, literal: FsdsTokenValue? = nil, fallback: FsdsTokenValue? = nil) {
        self.cssVar = cssVar
        self.name = name
        self.ref = ref
        self.literal = literal
        self.fallback = fallback
    }
}

public typealias FsdsComponentTokenScope = [String: FsdsComponentTokenDefinition]
public typealias FsdsComponentTokenScopes = [String: FsdsComponentTokenScope]

/// Consumer-facing override surface: slot name → value. Applied ahead of
/// the authored literal/fallback chain during resolution.
public struct FsdsTheme: Sendable {
    public var tokens: [String: FsdsTokenValue]

    public init(tokens: [String: FsdsTokenValue] = [:]) {
        self.tokens = tokens
    }
}

private struct FsdsThemeKey: EnvironmentKey {
    static let defaultValue = FsdsTheme()
}

extension EnvironmentValues {
    /// Inject overrides with `.environment(\.fsdsTheme, FsdsTheme(tokens: [...]))`.
    public var fsdsTheme: FsdsTheme {
        get { self[FsdsThemeKey.self] }
        set { self[FsdsThemeKey.self] = newValue }
    }
}

/// Resolve one scope: theme override by slot name, then theme override by
/// semantic ref, else literal, else fallback. The ref arm is what lets a
/// semantic-defaults table reach component slots — without it, only
/// slot-name-keyed overrides could (FEAT-SWIFTUI-TOKEN-CARRIER-PARITY-01).
public func resolveFsdsComponentTokens(
    _ scopes: FsdsComponentTokenScopes,
    _ theme: FsdsTheme
) -> [String: [String: FsdsTokenValue?]] {
    var out: [String: [String: FsdsTokenValue?]] = [:]
    for (scopeName, scope) in scopes {
        var resolved: [String: FsdsTokenValue?] = [:]
        for (slotName, definition) in scope {
            // Stage the chain in a local before the subscript assignment:
            // a ?? chain assigned directly into an optional-Value dictionary
            // subscript type-infers at double-optional depth, wrapping a nil
            // literal as .some(nil) and short-circuiting the remaining arms
            // (FIX-SWIFTUI-TOKEN-RESOLVER-01).
            let value: FsdsTokenValue? =
                theme.tokens[definition.name]
                ?? definition.ref.flatMap { theme.tokens[$0] }
                ?? definition.literal
                ?? definition.fallback
            resolved[slotName] = value
        }
        out[scopeName] = resolved
    }
    return out
}

/// Resolve scopes layered in order (e.g. root → variant_medium →
/// variant_primary): later layers override earlier ones per slot. This is
/// the join the RN emitter performs with StyleSheet arrays.
public func resolveFsdsLayeredTokens(
    _ scopes: FsdsComponentTokenScopes,
    _ theme: FsdsTheme,
    layers: [String]
) -> [String: FsdsTokenValue?] {
    var merged: [String: FsdsTokenValue?] = [:]
    for layer in layers {
        guard let scope = scopes[layer] else { continue }
        for (slotName, definition) in scope {
            // Same staged-assignment rule as resolveFsdsComponentTokens.
            let value: FsdsTokenValue? =
                theme.tokens[definition.name]
                ?? definition.literal
                ?? definition.fallback
            merged[slotName] = value
        }
    }
    return merged
}

// MARK: - Conditional accessibility attachment

/// A nil-coalesced `.accessibilityLabel("")` erases a view's intrinsic
/// label from assistive tech; these helpers attach nothing when nil.
extension View {
    @ViewBuilder
    public func fsdsAccessibilityLabel(_ label: String?) -> some View {
        if let label {
            self.accessibilityLabel(label)
        } else {
            self
        }
    }

    @ViewBuilder
    public func fsdsAccessibilityIdentifier(_ identifier: String?) -> some View {
        if let identifier {
            self.accessibilityIdentifier(identifier)
        } else {
            self
        }
    }
}

/// Graph-derived semantic defaults — the theme surface component slots
/// reach through the `ref` arm of `FsdsComponentTokenDefinition`
/// (FEAT-SWIFTUI-SEMANTIC-DEFAULTS-01). Scalars are `.string`/`.number`
/// values; mode-bearing graph tokens carry real `.adaptive(light:dark:)`
/// pairs, so a dark appearance resolves dark halves with no second table.
/// Coverage is exactly the graph-resolvable refs the swift corpus emits;
/// the exhaustive-equality test pins every entry to the committed
/// `resolved.tokens.json`.
public enum FsdsSemanticDefaults {
    // @generated:start semantic-defaults
    public static let light: [String: FsdsTokenValue] = [
        "core.color.mode.transparent": .string("#00000000"),
        "core.dimension.actionMinHeight": .string("36px"),
        "core.dimension.actionMinHeightLarge": .string("48px"),
        "core.dimension.actionMinHeightSmall": .string("28px"),
        "core.layer.dropdown": .string("1000"),
        "core.layer.tooltip": .string("1800"),
        "core.motion.duration.long": .string("400ms"),
        "core.motion.duration.short": .string("150ms"),
        "core.motion.easing.standard": .string("cubic-bezier(0.4, 0, 0.2, 1)"),
        "core.spacing.size.00": .string("0px"),
        "core.spacing.size.01": .string("1px"),
        "core.spacing.size.02": .string("2px"),
        "core.spacing.size.03": .string("4px"),
        "core.spacing.size.04": .string("8px"),
        "core.spacing.size.05": .string("12px"),
        "core.spacing.size.06": .string("16px"),
        "core.spacing.size.07": .string("24px"),
        "core.spacing.size.08": .string("32px"),
        "core.spacing.size.09": .string("48px"),
        "core.typography.font.family.sans": .string("\"Inter\", sans-serif"),
        "core.typography.ramp.11": .string("60px"),
        "core.typography.ramp.2": .string("12px"),
        "core.typography.ramp.3": .string("14px"),
        "core.typography.ramp.4": .string("16px"),
        "core.typography.ramp.5": .string("18px"),
        "core.typography.ramp.6": .string("20px"),
        "core.typography.ramp.7": .string("24px"),
        "core.typography.ramp.8": .string("32px"),
        "core.typography.weight.medium": .string("500"),
        "semantic.action.size.medium.gap": .string("8px"),
        "semantic.action.size.medium.min-height": .string("32px"),
        "semantic.action.size.medium.min-width": .string("32px"),
        "semantic.action.size.medium.padding-block": .string("4px"),
        "semantic.action.size.medium.padding-inline": .string("8px"),
        "semantic.color.action.background.danger.active": .string("#900909"),
        "semantic.color.action.background.danger.default": .string("#d92d2e"),
        "semantic.color.action.background.danger.disabled": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.color.action.background.danger.hover": .string("#b31b1b"),
        "semantic.color.action.background.primary.active": .string("#013ab0"),
        "semantic.color.action.background.primary.default": .string("#0566fe"),
        "semantic.color.action.background.primary.disabled": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.color.action.background.primary.hover": .string("#034fd6"),
        "semantic.color.action.background.secondary.active": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.color.action.background.secondary.default": .adaptive(light: "#fafafa", dark: "#141414"),
        "semantic.color.action.background.secondary.disabled": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.color.action.background.secondary.hover": .adaptive(light: "#d0d0d0", dark: "#313131"),
        "semantic.color.action.foreground.primary.default": .string("#ffffff"),
        "semantic.color.background.accent": .adaptive(light: "#d92d2e", dark: "#d92d2e"),
        "semantic.color.background.accentSubtle": .adaptive(light: "#95dafb", dark: "#002782"),
        "semantic.color.background.danger.softer": .adaptive(light: "#fee4e4", dark: "#440000"),
        "semantic.color.background.danger.strong": .adaptive(light: "#b31b1b", dark: "#d92d2e"),
        "semantic.color.background.danger.subtle": .adaptive(light: "#fac2c2", dark: "#440000"),
        "semantic.color.background.elevated": .adaptive(light: "#ffffff", dark: "#141414"),
        "semantic.color.background.highlight": .adaptive(light: "#f5a2a1", dark: "#900909"),
        "semantic.color.background.hover": .adaptive(light: "#f7f7f7", dark: "#474647"),
        "semantic.color.background.image.overlay": .adaptive(light: "rgba(0, 0, 0, 0.5)", dark: "rgba(0, 0, 0, 0.7)"),
        "semantic.color.background.info.softer": .adaptive(light: "#cfeefe", dark: "#000a69"),
        "semantic.color.background.info.subtle": .adaptive(light: "#95dafb", dark: "#000a69"),
        "semantic.color.background.inverse": .adaptive(light: "#141414", dark: "#fafafa"),
        "semantic.color.background.primary": .adaptive(light: "#ffffff", dark: "#000000"),
        "semantic.color.background.secondary": .adaptive(light: "#f7f7f7", dark: "#313131"),
        "semantic.color.background.subtle": .adaptive(light: "#f7f7f7", dark: "#313131"),
        "semantic.color.background.success.softer": .adaptive(light: "#ddefd8", dark: "#0b2200"),
        "semantic.color.background.success.subtle": .adaptive(light: "#b3dba7", dark: "#0b2200"),
        "semantic.color.background.tertiary": .adaptive(light: "#d0d0d0", dark: "#474647"),
        "semantic.color.background.transparent": .adaptive(light: "transparent", dark: "transparent"),
        "semantic.color.background.warning.softer": .adaptive(light: "#ffe6c8", dark: "#341400"),
        "semantic.color.background.warning.subtle": .adaptive(light: "#fdc67f", dark: "#341400"),
        "semantic.color.border.accent": .adaptive(light: "#d92d2e", dark: "#e55b5a"),
        "semantic.color.border.bold": .adaptive(light: "#888889", dark: "#727272"),
        "semantic.color.border.danger": .adaptive(light: "#b31b1b", dark: "#d92d2e"),
        "semantic.color.border.default": .adaptive(light: "#a0a0a1", dark: "#5c5b5c"),
        "semantic.color.border.disabled": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.color.border.focus": .adaptive(light: "#0566fe", dark: "#0089fe"),
        "semantic.color.border.hover": .adaptive(light: "#888889", dark: "#727272"),
        "semantic.color.border.info": .adaptive(light: "#034fd6", dark: "#0566fe"),
        "semantic.color.border.light": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.color.border.primary": .adaptive(light: "#a0a0a1", dark: "#5c5b5c"),
        "semantic.color.border.subtle": .adaptive(light: "#d0d0d0", dark: "#474647"),
        "semantic.color.border.success": .adaptive(light: "#3a6614", dark: "#497f21"),
        "semantic.color.border.warning": .adaptive(light: "#8b4b00", dark: "#ae5d00"),
        "semantic.color.feedback.border.success": .string("#3a6614"),
        "semantic.color.feedback.foreground.danger.default": .adaptive(light: "#d92d2e", dark: "#e55b5a"),
        "semantic.color.feedback.foreground.success.default": .adaptive(light: "#497f21", dark: "#5b973c"),
        "semantic.color.foreground.danger": .adaptive(light: "#d92d2e", dark: "#e55b5a"),
        "semantic.color.foreground.disabled": .adaptive(light: "#727272", dark: "#888889"),
        "semantic.color.foreground.inverse": .adaptive(light: "#fafafa", dark: "#fafafa"),
        "semantic.color.foreground.link": .adaptive(light: "#d92d2e", dark: "#e55b5a"),
        "semantic.color.foreground.linkHover": .adaptive(light: "#b31b1b", dark: "#ee8181"),
        "semantic.color.foreground.linkVisited": .adaptive(light: "#e55b5a", dark: "#d92d2e"),
        "semantic.color.foreground.on-inverse": .adaptive(light: "#fafafa", dark: "#141414"),
        "semantic.color.foreground.on.brand": .adaptive(light: "#ffffff", dark: "#ffffff"),
        "semantic.color.foreground.on.danger.subtle": .adaptive(light: "#900909", dark: "#ee8181"),
        "semantic.color.foreground.on.info.subtle": .adaptive(light: "#013ab0", dark: "#00a9fb"),
        "semantic.color.foreground.on.success.subtle": .adaptive(light: "#2c4f09", dark: "#6eb157"),
        "semantic.color.foreground.on.warning.subtle": .adaptive(light: "#6c3a00", dark: "#ec8802"),
        "semantic.color.foreground.placeholder": .adaptive(light: "#888889", dark: "#727272"),
        "semantic.color.foreground.primary": .adaptive(light: "#141414", dark: "#fafafa"),
        "semantic.color.foreground.secondary": .adaptive(light: "#474647", dark: "#a0a0a1"),
        "semantic.color.foreground.success": .adaptive(light: "#497f21", dark: "#5b973c"),
        "semantic.color.foreground.syntax.comment.color": .adaptive(light: "#474647", dark: "#a0a0a1"),
        "semantic.color.foreground.syntax.definition": .adaptive(light: "#900909", dark: "#ee8181"),
        "semantic.color.foreground.syntax.keyword": .adaptive(light: "#013ab0", dark: "#00a9fb"),
        "semantic.color.foreground.syntax.plain": .adaptive(light: "#141414", dark: "#fafafa"),
        "semantic.color.foreground.syntax.property": .adaptive(light: "#6c3a00", dark: "#ec8802"),
        "semantic.color.foreground.syntax.punctuation": .adaptive(light: "#013ab0", dark: "#00a9fb"),
        "semantic.color.foreground.syntax.static": .adaptive(light: "#900909", dark: "#ee8181"),
        "semantic.color.foreground.syntax.string": .adaptive(light: "#900909", dark: "#ee8181"),
        "semantic.color.foreground.syntax.tag": .adaptive(light: "#900909", dark: "#ee8181"),
        "semantic.color.foreground.tertiary": .adaptive(light: "#727272", dark: "#888889"),
        "semantic.color.overlay.scrim": .string("#00000066"),
        "semantic.color.status.danger": .adaptive(light: "#d92d2e", dark: "#e55b5a"),
        "semantic.color.status.info": .adaptive(light: "#0566fe", dark: "#0089fe"),
        "semantic.control.size.md.height": .string("32px"),
        "semantic.display.size.gap": .string("4px"),
        "semantic.elevation.surface.dialog": .string("[{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":12,\"unit\":\"px\"},\"blur\":{\"value\":16,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.06}},{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":25,\"unit\":\"px\"},\"blur\":{\"value\":50,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.15}}]"),
        "semantic.elevation.surface.floating": .string("[{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":2,\"unit\":\"px\"},\"blur\":{\"value\":4,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.06}},{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":4,\"unit\":\"px\"},\"blur\":{\"value\":8,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.1}}]"),
        "semantic.elevation.surface.overlay": .string("[{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":4,\"unit\":\"px\"},\"blur\":{\"value\":6,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.05}},{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":10,\"unit\":\"px\"},\"blur\":{\"value\":15,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.1}}]"),
        "semantic.elevation.surface.popover": .string("[{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":8,\"unit\":\"px\"},\"blur\":{\"value\":10,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.04}},{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":20,\"unit\":\"px\"},\"blur\":{\"value\":25,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.1}}]"),
        "semantic.elevation.surface.raised": .string("[{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":1,\"unit\":\"px\"},\"blur\":{\"value\":2,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.06}},{\"offsetX\":{\"value\":0,\"unit\":\"px\"},\"offsetY\":{\"value\":1,\"unit\":\"px\"},\"blur\":{\"value\":3,\"unit\":\"px\"},\"color\":{\"colorSpace\":\"srgb\",\"components\":[0,0,0],\"alpha\":0.1}}]"),
        "semantic.feedback.size.gap": .string("8px"),
        "semantic.feedback.size.padding-block": .string("16px"),
        "semantic.feedback.size.padding-inline": .string("16px"),
        "semantic.focus.ring.color": .adaptive(light: "#0566fe", dark: "#0566fe"),
        "semantic.focus.ring.intent.danger": .string("#b31b1b"),
        "semantic.focus.ring.offset": .string("2px"),
        "semantic.focus.ring.style": .string("solid"),
        "semantic.focus.ring.width": .string("2px"),
        "semantic.glyph.badge.size.lg.fontSize": .string("14px"),
        "semantic.glyph.badge.size.lg.gap": .string("4px"),
        "semantic.glyph.badge.size.lg.minHeight": .string("32px"),
        "semantic.glyph.badge.size.lg.paddingX": .string("12px"),
        "semantic.glyph.badge.size.lg.paddingY": .string("4px"),
        "semantic.glyph.badge.size.md.fontSize": .string("12px"),
        "semantic.glyph.badge.size.md.gap": .string("4px"),
        "semantic.glyph.badge.size.md.minHeight": .string("24px"),
        "semantic.glyph.badge.size.md.paddingX": .string("8px"),
        "semantic.glyph.badge.size.md.paddingY": .string("2px"),
        "semantic.glyph.badge.size.sm.fontSize": .string("10px"),
        "semantic.glyph.badge.size.sm.gap": .string("2px"),
        "semantic.glyph.badge.size.sm.minHeight": .string("16px"),
        "semantic.glyph.badge.size.sm.paddingX": .string("4px"),
        "semantic.glyph.badge.size.sm.paddingY": .string("2px"),
        "semantic.glyph.size.medium.extent": .string("16px"),
        "semantic.input.size.medium.gap": .string("8px"),
        "semantic.input.size.medium.min-height": .string("32px"),
        "semantic.input.size.medium.padding-block": .string("4px"),
        "semantic.input.size.medium.padding-inline": .string("8px"),
        "semantic.interaction.background.active": .adaptive(light: "#d0d0d0", dark: "#474647"),
        "semantic.interaction.background.disabled": .adaptive(light: "#b8b8b8", dark: "#474647"),
        "semantic.interaction.background.hover": .adaptive(light: "#f7f7f7", dark: "#313131"),
        "semantic.interaction.border.hover": .adaptive(light: "#888889", dark: "#727272"),
        "semantic.interaction.disabled.opacity": .string("0.5"),
        "semantic.interaction.stateLayer.hover": .string("0.04"),
        "semantic.interaction.stateLayer.selected": .string("0.08"),
        "semantic.interaction.text.hover": .adaptive(light: "#474647", dark: "#a0a0a1"),
        "semantic.motion.dwell.notification": .string("6000ms"),
        "semantic.overlay.scrim.medium": .adaptive(light: "rgba(0,0,0,0.40)", dark: "rgba(0,0,0,0.60)"),
        "semantic.overlay.scrim.strong": .adaptive(light: "rgba(0,0,0,0.64)", dark: "rgba(0,0,0,0.80)"),
        "semantic.shape.control.border.defaultWidth": .string("1px"),
        "semantic.shape.control.border.focusWidth": .string("2px"),
        "semantic.shape.control.radius.default": .string("6px"),
        "semantic.shape.control.radius.pill": .string("9999px"),
        "semantic.shape.radius.large": .string("16px"),
        "semantic.shape.radius.medium": .string("8px"),
        "semantic.shape.radius.small": .string("4px"),
        "semantic.spacing.density.compact.md": .string("12px"),
        "semantic.spacing.density.compact.sm": .string("8px"),
        "semantic.spacing.gap.gridSmall": .string("8px"),
        "semantic.structure.size.gap": .string("16px"),
        "semantic.surface.size.gap": .string("8px"),
        "semantic.surface.size.min-width": .string("64px"),
        "semantic.surface.size.padding-block": .string("16px"),
        "semantic.surface.size.padding-inline": .string("16px"),
        "semantic.typography.action.01": .string("18px"),
        "semantic.typography.action.02": .string("16px"),
        "semantic.typography.action.03": .string("14px"),
        "semantic.typography.body.01": .string("18px"),
        "semantic.typography.body.02": .string("16px"),
        "semantic.typography.body.03": .string("14px"),
        "semantic.typography.body.04": .string("12px"),
        "semantic.typography.body.small.font.size": .string("14px"),
        "semantic.typography.caption.01": .string("14px"),
        "semantic.typography.caption.02": .string("12px"),
        "semantic.typography.caption.03": .string("10px"),
        "semantic.typography.font.style.italic": .string("italic"),
        "semantic.typography.font.weight.bold": .string("700"),
        "semantic.typography.font.weight.light": .string("300"),
        "semantic.typography.font.weight.medium": .string("500"),
        "semantic.typography.font.weight.regular": .string("400"),
        "semantic.typography.font.weight.semibold": .string("600"),
        "semantic.typography.heading.01": .string("32px"),
        "semantic.typography.heading.02": .string("24px"),
        "semantic.typography.heading.03": .string("20px"),
        "semantic.typography.heading.04": .string("18px"),
        "semantic.typography.heading.06": .string("14px"),
        "semantic.typography.letter.spacing.tight": .string("-0.018rem"),
        "semantic.typography.letter.spacing.wide": .string("0.018rem"),
        "semantic.typography.line.height.body": .string("1.5"),
        "semantic.typography.line.height.collapse": .string("1"),
        "semantic.typography.line.height.heading": .string("1"),
        "semantic.typography.line.height.loose": .string("1.8"),
        "semantic.typography.line.height.normal": .string("1.5"),
        "semantic.typography.line.height.tight": .string("1.2"),
    ]
    // @generated:end
}
