// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum OTPMode: String, CaseIterable {
    case numeric
    case alphanumeric
}
// @generated:end

// @generated:start component
/// Token scope data for OTP (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum OTPTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", ref: "semantic.input.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", ref: "semantic.input.size.medium.padding-block", fallback: .string("4px")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", ref: "semantic.input.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", ref: "semantic.input.size.medium.padding-inline", fallback: .string("8px")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", ref: "semantic.input.size.medium.gap", fallback: .string("8px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", ref: "semantic.input.size.medium.min-height", fallback: .string("32px")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "otp.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-color-background-default", name: "otp.color.background.default", ref: "semantic.color.background.secondary", fallback: .adaptive(light: "#f7f7f7", dark: "#313131")),
            "otp.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-color-foreground-primary", name: "otp.color.foreground.primary", ref: "semantic.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "otp.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-color-border-default", name: "otp.color.border.default", ref: "semantic.color.border.light", fallback: .adaptive(light: "#b8b8b8", dark: "#474647")),
            "otp.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-size-padding-default", name: "otp.size.padding.default", ref: "core.spacing.size.07", fallback: .string("24px")),
            "otp.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-size-radius-default", name: "otp.size.radius.default", ref: "semantic.shape.control.radius.default", fallback: .string("6px")),
            "otp.color.border.accent": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-color-border-accent", name: "otp.color.border.accent", ref: "semantic.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "otp.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-focus-ring-width", name: "otp.focus.ring.width", ref: "semantic.focus.ring.width", fallback: .string("2px")),
            "otp.focus.ring.color": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-focus-ring-color", name: "otp.focus.ring.color", ref: "semantic.focus.ring.color", fallback: .adaptive(light: "#0566fe", dark: "#0566fe")),
            "otp.focus.ring.style": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-focus-ring-style", name: "otp.focus.ring.style", ref: "semantic.focus.ring.style", fallback: .string("solid")),
            "otp.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-otp-focus-ring-offset", name: "otp.focus.ring.offset", ref: "semantic.focus.ring.offset", fallback: .string("2px")),
        ],
    ]
}

/// Emitted through the count-iterated field-group path: the string channel distributes over N single-character fields (setCharAt semantics — the last character of a multi-char payload wins); onComplete fires when every field is filled.
public struct OTP: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        OTPTokens.scopes
    }
    @StateObject private var value: ControllableValue<String>
    private let length: Int
    private let disabled: Bool
    private let onComplete: ((String) -> Void)?
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        value: Binding<String>? = nil,
        defaultValue: String = "",
        onChange: ((String) -> Void)? = nil,
        length: Int = 6,
        disabled: Bool = false,
        onComplete: ((String) -> Void)? = nil
    ) {
        self._value = StateObject(wrappedValue: ControllableValue(controlled: value, defaultValue: defaultValue, onChange: onChange))
        self.length = length
        self.disabled = disabled
        self.onComplete = onComplete
    }

    private func character(at index: Int) -> String {
        guard index < value.value.count else { return "" }
        return String(Array(value.value)[index])
    }

    /// setCharAt: write the payload's last character at the index, 
    /// padding with spaces so the index always exists.
    private func setCharacter(_ raw: String, at index: Int) {
        var chars = Array(value.value.padding(toLength: length, withPad: " ", startingAt: 0))
        guard index < chars.count else { return }
        let payload = raw.count > 0 ? Array(raw) : [" "]
        chars[index] = payload[payload.count - 1]
        let next = String(chars).trimmingCharacters(in: .whitespaces)
        value.set(next)
        if next.count == length {
            onComplete?(next)
        }
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
    private var foreground: Color { colorSlot("color.foreground.primary") ?? .primary }
    private var borderColor: Color { colorSlot("color.border.default") ?? .clear }
    private var radius: CGFloat { pxSlot("size.radius.default") ?? 0 }
    private var blockPadding: CGFloat { pxSlot("padding-block-start") ?? 0 }
    private var inlinePadding: CGFloat { pxSlot("padding-inline-start") ?? 0 }
    private var gap: CGFloat { pxSlot("box-model.gap") ?? 0 }
    private var minHeight: CGFloat { pxSlot("min-height") ?? 0 }

    public var body: some View {
        HStack(spacing: gap) {
            ForEach(0..<length, id: \.self) { index in
                SwiftUI.TextField("", text: Binding(
                    get: { character(at: index) },
                    set: { setCharacter($0, at: index) }
                ))
                    .frame(width: 32)
                    .disabled(disabled)
            }
        }
    }
}
// @generated:end
