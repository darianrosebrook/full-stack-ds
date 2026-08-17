// @generated:start imports
import SwiftUI
// @generated:end

// @generated:start types
public enum CalendarMode: String, CaseIterable {
    case single
    case range
}
// @generated:end

// @generated:start component
/// Token scope data for Calendar (ir.tokenScopes → RN normal form: data consumed through FsdsTheme at render, never resolved constants). A caseless enum namespace because generic types cannot hold static stored properties.
enum CalendarTokens {
    public static let scopes: FsdsComponentTokenScopes = [
        "root": [
            "box-model.padding": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding", name: "box-model.padding", literal: .string("0")),
            "box-model.padding-block": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block", name: "box-model.padding-block", literal: .string("0")),
            "box-model.padding-block-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-start", name: "box-model.padding-block-start", literal: .string("0")),
            "box-model.padding-block-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-block-end", name: "box-model.padding-block-end", literal: .string("0")),
            "box-model.padding-inline": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline", name: "box-model.padding-inline", literal: .string("0")),
            "box-model.padding-inline-start": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-start", name: "box-model.padding-inline-start", literal: .string("0")),
            "box-model.padding-inline-end": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-padding-inline-end", name: "box-model.padding-inline-end", literal: .string("0")),
            "box-model.gap": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-gap", name: "box-model.gap", fallback: .string("16px")),
            "box-model.width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-width", name: "box-model.width", literal: .string("auto")),
            "box-model.min-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-width", name: "box-model.min-width", literal: .string("0")),
            "box-model.max-width": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-width", name: "box-model.max-width", literal: .string("none")),
            "box-model.height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-height", name: "box-model.height", literal: .string("auto")),
            "box-model.min-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-min-height", name: "box-model.min-height", literal: .string("0")),
            "box-model.max-height": FsdsComponentTokenDefinition(cssVar: "--fsds-box-model-max-height", name: "box-model.max-height", literal: .string("none")),
            "calendar.color.background.default": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-background-default", name: "calendar.color.background.default", fallback: .adaptive(light: "#ffffff", dark: "#000000")),
            "calendar.color.foreground.primary": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-foreground-primary", name: "calendar.color.foreground.primary", fallback: .adaptive(light: "#141414", dark: "#fafafa")),
            "calendar.color.foreground.muted": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-foreground-muted", name: "calendar.color.foreground.muted", fallback: .adaptive(light: "#474647", dark: "#a0a0a1")),
            "calendar.color.border.default": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-border-default", name: "calendar.color.border.default", fallback: .adaptive(light: "#d0d0d0", dark: "#474647")),
            "calendar.color.border.accent": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-border-accent", name: "calendar.color.border.accent", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "calendar.color.day.hover": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-day-hover", name: "calendar.color.day.hover", fallback: .adaptive(light: "#d0d0d0", dark: "#313131")),
            "calendar.color.day.selected.background": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-day-selected-background", name: "calendar.color.day.selected.background", fallback: .adaptive(light: "#d92d2e", dark: "#d92d2e")),
            "calendar.color.day.selected.foreground": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-day-selected-foreground", name: "calendar.color.day.selected.foreground", fallback: .adaptive(light: "#fafafa", dark: "#fafafa")),
            "calendar.color.day.range.background": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-day-range-background", name: "calendar.color.day.range.background", fallback: .adaptive(light: "#95dafb", dark: "#002782")),
            "calendar.color.today.ring": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-today-ring", name: "calendar.color.today.ring", fallback: .adaptive(light: "#d92d2e", dark: "#e55b5a")),
            "calendar.color.focus.ring": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-color-focus-ring", name: "calendar.color.focus.ring", fallback: .adaptive(light: "#0566fe", dark: "#0566fe")),
            "calendar.size.padding.default": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-size-padding-default", name: "calendar.size.padding.default", fallback: .string("16px")),
            "calendar.size.cell": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-size-cell", name: "calendar.size.cell", fallback: .string("32px")),
            "calendar.size.nav": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-size-nav", name: "calendar.size.nav", fallback: .string("24px")),
            "calendar.size.radius.default": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-size-radius-default", name: "calendar.size.radius.default", fallback: .string("6px")),
            "calendar.size.radius.day": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-size-radius-day", name: "calendar.size.radius.day", fallback: .string("4px")),
            "calendar.typography.caption.size": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-typography-caption-size", name: "calendar.typography.caption.size", fallback: .string("16px")),
            "calendar.typography.day.size": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-typography-day-size", name: "calendar.typography.day.size", fallback: .string("14px")),
            "calendar.typography.weekday.size": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-typography-weekday-size", name: "calendar.typography.weekday.size", fallback: .string("12px")),
            "calendar.focus.ring.width": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-focus-ring-width", name: "calendar.focus.ring.width", fallback: .string("2px")),
            "calendar.focus.ring.offset": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-focus-ring-offset", name: "calendar.focus.ring.offset", fallback: .string("2px")),
            "calendar.elevation.default": FsdsComponentTokenDefinition(cssVar: "--fsds-calendar-elevation-default", name: "calendar.elevation.default", fallback: .string("0px 4px 6px #0000000d, 0px 10px 15px #0000001a")),
        ],
    ]
}

/// Emitted through the date-grid surface path: chrome shell over the value channel; grid realization is a recorded follow-up.
public struct Calendar: View {
    private var fsdsScopes: FsdsComponentTokenScopes {
        CalendarTokens.scopes
    }
    @StateObject private var value: ControllableValue<Date?>
    private let disabled: Bool
    @Environment(\.fsdsTheme) private var fsdsTheme

    public init(
        value: Binding<Date?>? = nil,
        defaultValue: Date? = nil,
        onChange: ((Date?) -> Void)? = nil,
        disabled: Bool = false
    ) {
        self._value = StateObject(wrappedValue: ControllableValue(controlled: value, defaultValue: defaultValue, onChange: onChange))
        self.disabled = disabled
    }

    public var body: some View {
        VStack(spacing: 8) {
            SwiftUI.DatePicker(
                "",
                selection: Binding(
                    get: { value.value ?? Date() },
                    set: { value.set($0) }
                )
            )
                .disabled(disabled)
        }
    }
}
// @generated:end
