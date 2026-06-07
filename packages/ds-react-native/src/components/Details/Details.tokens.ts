// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const detailsTokenScopes = {
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
    "details.size.padding.default": {
      name: "details.size.padding.default",
      cssVar: "--fsds-details-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "details.size.radius.default": {
      name: "details.size.radius.default",
      cssVar: "--fsds-details-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "details.size.icon": {
      name: "details.size.icon",
      cssVar: "--fsds-details-size-icon",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "details.color.background.default": {
      name: "details.color.background.default",
      cssVar: "--fsds-details-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "details.color.background.hover": {
      name: "details.color.background.hover",
      cssVar: "--fsds-details-color-background-hover",
      ref: "semantic.color.background.hover",
      fallback: "#cecece",
    },
    "details.color.foreground.primary": {
      name: "details.color.foreground.primary",
      cssVar: "--fsds-details-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "details.color.border.default": {
      name: "details.color.border.default",
      cssVar: "--fsds-details-color-border-default",
      ref: "semantic.color.border.primary",
      fallback: "#f29495",
    },
    "details.color.border.hover": {
      name: "details.color.border.hover",
      cssVar: "--fsds-details-color-border-hover",
      ref: "semantic.color.border.bold",
      fallback: "#8f8f8f",
    },
    "details.focus.ring.width": {
      name: "details.focus.ring.width",
      cssVar: "--fsds-details-focus-ring-width",
      ref: "core.shape.border.width.thick",
      fallback: 2,
    },
    "details.focus.ring.color": {
      name: "details.focus.ring.color",
      cssVar: "--fsds-details-focus-ring-color",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "details.focus.ring.offset": {
      name: "details.focus.ring.offset",
      cssVar: "--fsds-details-focus-ring-offset",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "details.spacing.gap.default": {
      name: "details.spacing.gap.default",
      cssVar: "--fsds-details-spacing-gap-default",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "details.typography.lineHeight.body": {
      name: "details.typography.lineHeight.body",
      cssVar: "--fsds-details-typography-lineHeight-body",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
    "details.typography.fontWeight.medium": {
      name: "details.typography.fontWeight.medium",
      cssVar: "--fsds-details-typography-fontWeight-medium",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
  },
  "hover": {
    "details.color.background.default": {
      name: "details.color.background.default",
      cssVar: "--fsds-details-color-background-default",
      ref: "semantic.color.background.hover",
      fallback: "#cecece",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveDetailsTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(detailsTokenScopes, theme);
}
// @generated:end
