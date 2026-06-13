// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const statusTokenScopes = {
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
      ref: "semantic.glyph.badge.size.md.paddingY",
      fallback: 2,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.glyph.badge.size.md.paddingY",
      fallback: 2,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: 0,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.glyph.badge.size.md.paddingX",
      fallback: 8,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.glyph.badge.size.md.paddingX",
      fallback: 8,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.glyph.badge.size.md.gap",
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
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "status.size.radius.default": {
      name: "status.size.radius.default",
      cssVar: "--fsds-status-size-radius-default",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
    "status.size.minHeight": {
      name: "status.size.minHeight",
      cssVar: "--fsds-status-size-minHeight",
      ref: "semantic.glyph.badge.size.md.minHeight",
      fallback: 24,
    },
    "status.size.fontSize": {
      name: "status.size.fontSize",
      cssVar: "--fsds-status-size-fontSize",
      ref: "semantic.glyph.badge.size.md.fontSize",
      fallback: 12,
    },
    "status.size.border.default": {
      name: "status.size.border.default",
      cssVar: "--fsds-status-size-border-default",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "status.text.weight": {
      name: "status.text.weight",
      cssVar: "--fsds-status-text-weight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "status.typography.lineHeight": {
      name: "status.typography.lineHeight",
      cssVar: "--fsds-status-typography-lineHeight",
      ref: "semantic.typography.line.height.collapse",
      fallback: "1",
    },
  },
  "variant_info": {
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.info",
      fallback: "#0042dc",
    },
  },
  "variant_success": {
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.success.subtle",
      fallback: "#e4f2e0",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#234104",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.success",
      fallback: "#336006",
    },
  },
  "variant_warning": {
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#ffedcc",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#593000",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.warning",
      fallback: "#824500",
    },
  },
  "variant_danger": {
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#7b0000",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
  },
  "variant_error": {
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#7b0000",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveStatusTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(statusTokenScopes, theme);
}
// @generated:end
