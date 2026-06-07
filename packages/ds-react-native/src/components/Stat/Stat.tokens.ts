// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const statTokenScopes = {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
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
    "stat.color.foreground.value": {
      name: "stat.color.foreground.value",
      cssVar: "--fsds-stat-color-foreground-value",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "stat.color.foreground.label": {
      name: "stat.color.foreground.label",
      cssVar: "--fsds-stat-color-foreground-label",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "stat.color.foreground.trend.up": {
      name: "stat.color.foreground.trend.up",
      cssVar: "--fsds-stat-color-foreground-trend-up",
      ref: "semantic.color.feedback.foreground.success.default",
      fallback: "#1f8a4c",
    },
    "stat.color.foreground.trend.down": {
      name: "stat.color.foreground.trend.down",
      cssVar: "--fsds-stat-color-foreground-trend-down",
      ref: "semantic.color.feedback.foreground.danger.default",
      fallback: "#d9292b",
    },
    "stat.color.foreground.trend.neutral": {
      name: "stat.color.foreground.trend.neutral",
      cssVar: "--fsds-stat-color-foreground-trend-neutral",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
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
    "stat.size.label": {
      name: "stat.size.label",
      cssVar: "--fsds-stat-size-label",
      ref: "semantic.typography.caption.02",
      fallback: 12,
    },
    "stat.size.gap": {
      name: "stat.size.gap",
      cssVar: "--fsds-stat-size-gap",
      ref: "core.spacing.size.02",
      fallback: 4,
    },
    "stat.typography.lineHeight.value": {
      name: "stat.typography.lineHeight.value",
      cssVar: "--fsds-stat-typography-lineHeight-value",
      literal: "1.1",
    },
    "stat.typography.weight.value": {
      name: "stat.typography.weight.value",
      cssVar: "--fsds-stat-typography-weight-value",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "stat.typography.weight.label": {
      name: "stat.typography.weight.label",
      cssVar: "--fsds-stat-typography-weight-label",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveStatTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(statTokenScopes, theme);
}
// @generated:end
