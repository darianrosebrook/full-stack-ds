// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const calendarTokenScopes = {
  "root": {
    "box-model.padding": {
      name: "box-model.padding",
      cssVar: "--fsds-box-model-padding",
      literal: 0,
    },
    "box-model.padding-block": {
      name: "box-model.padding-block",
      cssVar: "--fsds-box-model-padding-block",
      literal: 0,
    },
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      literal: 0,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      literal: 0,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: 0,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      literal: 0,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      literal: 0,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.structure.size.gap",
      fallback: 8,
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      literal: "auto",
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      literal: 0,
    },
    "box-model.max-width": {
      name: "box-model.max-width",
      cssVar: "--fsds-box-model-max-width",
      literal: "none",
    },
    "box-model.height": {
      name: "box-model.height",
      cssVar: "--fsds-box-model-height",
      literal: "auto",
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: 0,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "calendar.color.background.default": {
      name: "calendar.color.background.default",
      cssVar: "--fsds-calendar-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "calendar.color.foreground.primary": {
      name: "calendar.color.foreground.primary",
      cssVar: "--fsds-calendar-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "calendar.color.foreground.muted": {
      name: "calendar.color.foreground.muted",
      cssVar: "--fsds-calendar-color-foreground-muted",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "calendar.color.border.default": {
      name: "calendar.color.border.default",
      cssVar: "--fsds-calendar-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "calendar.color.border.accent": {
      name: "calendar.color.border.accent",
      cssVar: "--fsds-calendar-color-border-accent",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "calendar.color.day.hover": {
      name: "calendar.color.day.hover",
      cssVar: "--fsds-calendar-color-day-hover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
    "calendar.color.day.selected.background": {
      name: "calendar.color.day.selected.background",
      cssVar: "--fsds-calendar-color-day-selected-background",
      ref: "semantic.color.background.accent",
      fallback: "#d9292b",
    },
    "calendar.color.day.selected.foreground": {
      name: "calendar.color.day.selected.foreground",
      cssVar: "--fsds-calendar-color-day-selected-foreground",
      ref: "semantic.color.foreground.inverse",
      fallback: "#fafafa",
    },
    "calendar.color.day.range.background": {
      name: "calendar.color.day.range.background",
      cssVar: "--fsds-calendar-color-day-range-background",
      ref: "semantic.color.background.accentSubtle",
      fallback: "#fceaea",
    },
    "calendar.color.today.ring": {
      name: "calendar.color.today.ring",
      cssVar: "--fsds-calendar-color-today-ring",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "calendar.color.focus.ring": {
      name: "calendar.color.focus.ring",
      cssVar: "--fsds-calendar-color-focus-ring",
      ref: "semantic.focus.ring.color",
      fallback: "#d9292b",
    },
    "calendar.size.padding.default": {
      name: "calendar.size.padding.default",
      cssVar: "--fsds-calendar-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "calendar.size.cell": {
      name: "calendar.size.cell",
      cssVar: "--fsds-calendar-size-cell",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "calendar.size.nav": {
      name: "calendar.size.nav",
      cssVar: "--fsds-calendar-size-nav",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "calendar.size.radius.default": {
      name: "calendar.size.radius.default",
      cssVar: "--fsds-calendar-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "calendar.size.radius.day": {
      name: "calendar.size.radius.day",
      cssVar: "--fsds-calendar-size-radius-day",
      ref: "core.shape.radius.small",
      fallback: 4,
    },
    "calendar.typography.caption.size": {
      name: "calendar.typography.caption.size",
      cssVar: "--fsds-calendar-typography-caption-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "calendar.typography.day.size": {
      name: "calendar.typography.day.size",
      cssVar: "--fsds-calendar-typography-day-size",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "calendar.typography.weekday.size": {
      name: "calendar.typography.weekday.size",
      cssVar: "--fsds-calendar-typography-weekday-size",
      ref: "semantic.typography.caption.02",
      fallback: 12,
    },
    "calendar.focus.ring.width": {
      name: "calendar.focus.ring.width",
      cssVar: "--fsds-calendar-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "calendar.focus.ring.offset": {
      name: "calendar.focus.ring.offset",
      cssVar: "--fsds-calendar-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
    "calendar.elevation.default": {
      name: "calendar.elevation.default",
      cssVar: "--fsds-calendar-elevation-default",
      ref: "semantic.elevation.surface.overlay",
      fallback: "0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCalendarTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(calendarTokenScopes, theme);
}
// @generated:end
