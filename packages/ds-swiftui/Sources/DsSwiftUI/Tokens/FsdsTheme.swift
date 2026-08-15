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

/// A token value as authored in the token graph: a number-with-unit or a
/// bare string. Accessors parse target-usable forms; unparsable units
/// (rem, cubic-bezier, …) return nil and callers skip the property.
public enum FsdsTokenValue: Sendable {
    case number(Double)
    case string(String)

    /// Leading-unitless double for px-like values ("8px" → 8).
    public var px: CGFloat? {
        switch self {
        case .number(let n): return CGFloat(n)
        case .string(let s):
            guard
                let match = s.range(of: #"^(-?\d+(?:\.\d+)?)(px)?$"#, options: .regularExpression),
                let value = Double(s[match].replacingOccurrences(of: "px", with: ""))
            else { return nil }
            return CGFloat(value)
        }
    }

    /// Hex color for #rgb / #rrggbb / #rrggbbaa values; nil otherwise.
    public var color: Color? {
        guard case .string(let s) = self, s.hasPrefix("#") else { return nil }
        var hex: UInt64 = 0
        let digits = String(s.dropFirst())
        guard [3, 6, 8].contains(digits.count),
              Scanner(string: digits).scanHexInt64(&hex)
        else { return nil }
        switch digits.count {
        case 3:
            let r = CGFloat((hex >> 8) & 0xF) / 15
            let g = CGFloat((hex >> 4) & 0xF) / 15
            let b = CGFloat(hex & 0xF) / 15
            return Color(red: r, green: g, blue: b)
        case 6:
            let r = CGFloat((hex >> 16) & 0xFF) / 255
            let g = CGFloat((hex >> 8) & 0xFF) / 255
            let b = CGFloat(hex & 0xFF) / 255
            return Color(red: r, green: g, blue: b)
        default:
            let r = CGFloat((hex >> 24) & 0xFF) / 255
            let g = CGFloat((hex >> 16) & 0xFF) / 255
            let b = CGFloat((hex >> 8) & 0xFF) / 255
            let a = CGFloat(hex & 0xFF) / 255
            return Color(red: r, green: g, blue: b, opacity: a)
        }
    }
}

/// One slot definition inside a component scope — mirrors the RN
/// `ComponentTokenDefinition` shape the codegen emits.
public struct FsdsComponentTokenDefinition: Sendable {
    public let cssVar: String
    public let name: String
    public let literal: FsdsTokenValue?
    public let fallback: FsdsTokenValue?

    public init(cssVar: String, name: String, literal: FsdsTokenValue? = nil, fallback: FsdsTokenValue? = nil) {
        self.cssVar = cssVar
        self.name = name
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

/// Resolve one scope: theme override by slot name, else literal, else fallback.
public func resolveFsdsComponentTokens(
    _ scopes: FsdsComponentTokenScopes,
    _ theme: FsdsTheme
) -> [String: [String: FsdsTokenValue?]] {
    var out: [String: [String: FsdsTokenValue?]] = [:]
    for (scopeName, scope) in scopes {
        var resolved: [String: FsdsTokenValue?] = [:]
        for (slotName, definition) in scope {
            resolved[slotName] =
                theme.tokens[definition.name]
                ?? definition.literal
                ?? definition.fallback
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
            merged[slotName] =
                theme.tokens[definition.name]
                ?? definition.literal
                ?? definition.fallback
        }
    }
    return merged
}
