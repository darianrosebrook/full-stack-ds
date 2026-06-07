// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const cardTokenScopes = {
  "root": {
    "box-model.padding": {
      name: "box-model.padding",
      cssVar: "--fsds-box-model-padding",
      literal: "0",
    },
    "box-model.padding-block": {
      name: "box-model.padding-block",
      cssVar: "--fsds-box-model-padding-block",
      literal: "0",
    },
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      ref: "semantic.surface.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.surface.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: "0",
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.surface.size.padding-inline",
      fallback: 16,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.surface.size.padding-inline",
      fallback: 16,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.surface.size.gap",
      fallback: 12,
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      literal: "auto",
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      ref: "semantic.surface.size.min-width",
      fallback: 64,
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
      literal: "0",
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "card.color.background.default": {
      name: "card.color.background.default",
      cssVar: "--fsds-card-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "card.color.background.hover": {
      name: "card.color.background.hover",
      cssVar: "--fsds-card-color-background-hover",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "card.color.border.default": {
      name: "card.color.border.default",
      cssVar: "--fsds-card-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "card.size.padding.default": {
      name: "card.size.padding.default",
      cssVar: "--fsds-card-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "card.size.padding.inset": {
      name: "card.size.padding.inset",
      cssVar: "--fsds-card-size-padding-inset",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "card.size.radius.default": {
      name: "card.size.radius.default",
      cssVar: "--fsds-card-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "card.size.gap.default": {
      name: "card.size.gap.default",
      cssVar: "--fsds-card-size-gap-default",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "card.typography.lineHeight.heading": {
      name: "card.typography.lineHeight.heading",
      cssVar: "--fsds-card-typography-lineHeight-heading",
      ref: "semantic.typography.line.height.heading",
      fallback: "1",
    },
    "card.typography.lineHeight.normal": {
      name: "card.typography.lineHeight.normal",
      cssVar: "--fsds-card-typography-lineHeight-normal",
      ref: "semantic.typography.line.height.normal",
      fallback: "1.5",
    },
    "card.color.badge.success.background": {
      name: "card.color.badge.success.background",
      cssVar: "--fsds-card-color-badge-success-background",
      ref: "semantic.color.background.success.subtle",
      fallback: "#e4f2e0",
    },
    "card.color.badge.success.foreground": {
      name: "card.color.badge.success.foreground",
      cssVar: "--fsds-card-color-badge-success-foreground",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#234104",
    },
    "card.color.badge.warning.background": {
      name: "card.color.badge.warning.background",
      cssVar: "--fsds-card-color-badge-warning-background",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#ffedcc",
    },
    "card.color.badge.warning.foreground": {
      name: "card.color.badge.warning.foreground",
      cssVar: "--fsds-card-color-badge-warning-foreground",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#593000",
    },
    "card.color.badge.info.background": {
      name: "card.color.badge.info.background",
      cssVar: "--fsds-card-color-badge-info-background",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "card.color.badge.info.foreground": {
      name: "card.color.badge.info.foreground",
      cssVar: "--fsds-card-color-badge-info-foreground",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "card.color.badge.error.background": {
      name: "card.color.badge.error.background",
      cssVar: "--fsds-card-color-badge-error-background",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "card.color.badge.error.foreground": {
      name: "card.color.badge.error.foreground",
      cssVar: "--fsds-card-color-badge-error-foreground",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#7b0000",
    },
    "card.color.badge.neutral.background": {
      name: "card.color.badge.neutral.background",
      cssVar: "--fsds-card-color-badge-neutral-background",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "card.color.badge.neutral.foreground": {
      name: "card.color.badge.neutral.foreground",
      cssVar: "--fsds-card-color-badge-neutral-foreground",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "card.color.badge.accent.background": {
      name: "card.color.badge.accent.background",
      cssVar: "--fsds-card-color-badge-accent-background",
      ref: "semantic.color.background.accent",
      fallback: "#d9292b",
    },
    "card.color.badge.accent.foreground": {
      name: "card.color.badge.accent.foreground",
      cssVar: "--fsds-card-color-badge-accent-foreground",
      ref: "semantic.color.foreground.on.brand",
      fallback: "#ffffff",
    },
  },
  "part_description": {
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
  },
  "part_link": {
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.link",
      fallback: "#d9292b",
    },
  },
  "part_note": {
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCardTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(cardTokenScopes, theme);
}
// @generated:end
