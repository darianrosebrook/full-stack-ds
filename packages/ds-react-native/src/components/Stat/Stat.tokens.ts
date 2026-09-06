// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const statTokenScopes = {
  "root": {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      literal: 0,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: 0,
    },
    "stat.color.foreground.value": {
      name: "stat.color.foreground.value",
      cssVar: "--fsds-stat-color-foreground-value",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "stat.color.foreground.trend.up": {
      name: "stat.color.foreground.trend.up",
      cssVar: "--fsds-stat-color-foreground-trend-up",
      ref: "semantic.color.feedback.foreground.success.default",
      fallback: "#497f21",
    },
    "stat.color.foreground.trend.down": {
      name: "stat.color.foreground.trend.down",
      cssVar: "--fsds-stat-color-foreground-trend-down",
      ref: "semantic.color.feedback.foreground.danger.default",
      fallback: "#d92d2e",
    },
    "stat.color.foreground.trend.neutral": {
      name: "stat.color.foreground.trend.neutral",
      cssVar: "--fsds-stat-color-foreground-trend-neutral",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "stat.size.value.sm": {
      name: "stat.size.value.sm",
      cssVar: "--fsds-stat-size-value-sm",
      ref: "semantic.typography.heading.04",
      fallback: 18,
    },
    "stat.size.value.md": {
      name: "stat.size.value.md",
      cssVar: "--fsds-stat-size-value-md",
      ref: "semantic.typography.heading.02",
      fallback: 24,
    },
    "stat.size.value.lg": {
      name: "stat.size.value.lg",
      cssVar: "--fsds-stat-size-value-lg",
      ref: "semantic.typography.heading.01",
      fallback: 32,
    },
    "stat.typography.weight.value": {
      name: "stat.typography.weight.value",
      cssVar: "--fsds-stat-typography-weight-value",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveStatTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(statTokenScopes, theme);
}
// @generated:end
