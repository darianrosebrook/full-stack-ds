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
