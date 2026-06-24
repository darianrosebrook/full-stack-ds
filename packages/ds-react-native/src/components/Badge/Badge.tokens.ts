// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const badgeTokenScopes = {
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
      literal: 2,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      literal: 2,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: 0,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      literal: 8,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      literal: 8,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      literal: 0,
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
      ref: "semantic.glyph.size.medium.extent",
      fallback: 16,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "badge.color.background.default": {
      name: "badge.color.background.default",
      cssVar: "--fsds-badge-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "badge.color.background.hover": {
      name: "badge.color.background.hover",
      cssVar: "--fsds-badge-color-background-hover",
      ref: "semantic.interaction.background.hover",
      fallback: "#e4e4e4",
    },
    "badge.color.foreground.primary": {
      name: "badge.color.foreground.primary",
      cssVar: "--fsds-badge-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "badge.color.border.default": {
      name: "badge.color.border.default",
      cssVar: "--fsds-badge-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "badge.spacing.gap": {
      name: "badge.spacing.gap",
      cssVar: "--fsds-badge-spacing-gap",
      ref: "semantic.glyph.badge.size.md.gap",
      fallback: 4,
    },
    "badge.size.radius": {
      name: "badge.size.radius",
      cssVar: "--fsds-badge-size-radius",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "badge.size.border": {
      name: "badge.size.border",
      cssVar: "--fsds-badge-size-border",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "badge.size.paddingX": {
      name: "badge.size.paddingX",
      cssVar: "--fsds-badge-size-paddingX",
      ref: "semantic.glyph.badge.size.md.paddingX",
      fallback: 8,
    },
    "badge.size.paddingY": {
      name: "badge.size.paddingY",
      cssVar: "--fsds-badge-size-paddingY",
      ref: "semantic.glyph.badge.size.md.paddingY",
      fallback: 2,
    },
    "badge.size.fontSize": {
      name: "badge.size.fontSize",
      cssVar: "--fsds-badge-size-fontSize",
      ref: "semantic.glyph.badge.size.md.fontSize",
      fallback: 12,
    },
    "badge.size.minHeight": {
      name: "badge.size.minHeight",
      cssVar: "--fsds-badge-size-minHeight",
      ref: "semantic.glyph.badge.size.md.minHeight",
      fallback: 24,
    },
    "badge.text.weight": {
      name: "badge.text.weight",
      cssVar: "--fsds-badge-text-weight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
  },
  "variant_sm": {
    "badge.size.paddingX": {
      name: "badge.size.paddingX",
      cssVar: "--fsds-badge-size-paddingX",
      ref: "semantic.glyph.badge.size.sm.paddingX",
      fallback: 4,
    },
    "badge.size.paddingY": {
      name: "badge.size.paddingY",
      cssVar: "--fsds-badge-size-paddingY",
      ref: "semantic.glyph.badge.size.sm.paddingY",
      fallback: 2,
    },
    "badge.size.fontSize": {
      name: "badge.size.fontSize",
      cssVar: "--fsds-badge-size-fontSize",
      ref: "semantic.glyph.badge.size.sm.fontSize",
      fallback: 10,
    },
    "badge.size.minHeight": {
      name: "badge.size.minHeight",
      cssVar: "--fsds-badge-size-minHeight",
      ref: "semantic.glyph.badge.size.sm.minHeight",
      fallback: 16,
    },
    "badge.spacing.gap": {
      name: "badge.spacing.gap",
      cssVar: "--fsds-badge-spacing-gap",
      ref: "semantic.glyph.badge.size.sm.gap",
      fallback: 2,
    },
  },
  "variant_md": {
    "badge.size.paddingX": {
      name: "badge.size.paddingX",
      cssVar: "--fsds-badge-size-paddingX",
      ref: "semantic.glyph.badge.size.md.paddingX",
      fallback: 8,
    },
    "badge.size.paddingY": {
      name: "badge.size.paddingY",
      cssVar: "--fsds-badge-size-paddingY",
      ref: "semantic.glyph.badge.size.md.paddingY",
      fallback: 2,
    },
    "badge.size.fontSize": {
      name: "badge.size.fontSize",
      cssVar: "--fsds-badge-size-fontSize",
      ref: "semantic.glyph.badge.size.md.fontSize",
      fallback: 12,
    },
    "badge.size.minHeight": {
      name: "badge.size.minHeight",
      cssVar: "--fsds-badge-size-minHeight",
      ref: "semantic.glyph.badge.size.md.minHeight",
      fallback: 24,
    },
    "badge.spacing.gap": {
      name: "badge.spacing.gap",
      cssVar: "--fsds-badge-spacing-gap",
      ref: "semantic.glyph.badge.size.md.gap",
      fallback: 4,
    },
  },
  "variant_lg": {
    "badge.size.paddingX": {
      name: "badge.size.paddingX",
      cssVar: "--fsds-badge-size-paddingX",
      ref: "semantic.glyph.badge.size.lg.paddingX",
      fallback: 12,
    },
    "badge.size.paddingY": {
      name: "badge.size.paddingY",
      cssVar: "--fsds-badge-size-paddingY",
      ref: "semantic.glyph.badge.size.lg.paddingY",
      fallback: 4,
    },
    "badge.size.fontSize": {
      name: "badge.size.fontSize",
      cssVar: "--fsds-badge-size-fontSize",
      ref: "semantic.glyph.badge.size.lg.fontSize",
      fallback: 14,
    },
    "badge.size.minHeight": {
      name: "badge.size.minHeight",
      cssVar: "--fsds-badge-size-minHeight",
      ref: "semantic.glyph.badge.size.lg.minHeight",
      fallback: 32,
    },
    "badge.spacing.gap": {
      name: "badge.spacing.gap",
      cssVar: "--fsds-badge-spacing-gap",
      ref: "semantic.glyph.badge.size.lg.gap",
      fallback: 4,
    },
  },
  "variant_info": {
    "badge.color.background.default": {
      name: "badge.color.background.default",
      cssVar: "--fsds-badge-color-background-default",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "badge.color.background.hover": {
      name: "badge.color.background.hover",
      cssVar: "--fsds-badge-color-background-hover",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "badge.color.foreground.primary": {
      name: "badge.color.foreground.primary",
      cssVar: "--fsds-badge-color-foreground-primary",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "badge.color.border.default": {
      name: "badge.color.border.default",
      cssVar: "--fsds-badge-color-border-default",
      ref: "semantic.color.border.info",
      fallback: "#0042dc",
    },
  },
  "variant_success": {
    "badge.color.background.default": {
      name: "badge.color.background.default",
      cssVar: "--fsds-badge-color-background-default",
      ref: "semantic.color.background.success.subtle",
      fallback: "#e4f2e0",
    },
    "badge.color.background.hover": {
      name: "badge.color.background.hover",
      cssVar: "--fsds-badge-color-background-hover",
      ref: "semantic.color.background.success.subtle",
      fallback: "#e4f2e0",
    },
    "badge.color.foreground.primary": {
      name: "badge.color.foreground.primary",
      cssVar: "--fsds-badge-color-foreground-primary",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#234104",
    },
    "badge.color.border.default": {
      name: "badge.color.border.default",
      cssVar: "--fsds-badge-color-border-default",
      ref: "semantic.color.border.success",
      fallback: "#336006",
    },
  },
  "variant_warning": {
    "badge.color.background.default": {
      name: "badge.color.background.default",
      cssVar: "--fsds-badge-color-background-default",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#ffedcc",
    },
    "badge.color.background.hover": {
      name: "badge.color.background.hover",
      cssVar: "--fsds-badge-color-background-hover",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#ffedcc",
    },
    "badge.color.foreground.primary": {
      name: "badge.color.foreground.primary",
      cssVar: "--fsds-badge-color-foreground-primary",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#593000",
    },
    "badge.color.border.default": {
      name: "badge.color.border.default",
      cssVar: "--fsds-badge-color-border-default",
      ref: "semantic.color.border.warning",
      fallback: "#824500",
    },
  },
  "variant_danger": {
    "badge.color.background.default": {
      name: "badge.color.background.default",
      cssVar: "--fsds-badge-color-background-default",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "badge.color.background.hover": {
      name: "badge.color.background.hover",
      cssVar: "--fsds-badge-color-background-hover",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "badge.color.foreground.primary": {
      name: "badge.color.foreground.primary",
      cssVar: "--fsds-badge-color-foreground-primary",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#7b0000",
    },
    "badge.color.border.default": {
      name: "badge.color.border.default",
      cssVar: "--fsds-badge-color-border-default",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
  },
  "variant_counter": {
    "badge.color.background.default": {
      name: "badge.color.background.default",
      cssVar: "--fsds-badge-color-background-default",
      ref: "semantic.color.background.danger.strong",
      fallback: "#d9292b",
    },
    "badge.color.foreground.primary": {
      name: "badge.color.foreground.primary",
      cssVar: "--fsds-badge-color-foreground-primary",
      ref: "semantic.color.foreground.inverse",
      fallback: "#fafafa",
    },
    "badge.color.border.default": {
      name: "badge.color.border.default",
      cssVar: "--fsds-badge-color-border-default",
      ref: "semantic.color.background.danger.strong",
      fallback: "#d9292b",
    },
  },
  "variant_tag": {
    "badge.size.radius": {
      name: "badge.size.radius",
      cssVar: "--fsds-badge-size-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveBadgeTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(badgeTokenScopes, theme);
}
// @generated:end
