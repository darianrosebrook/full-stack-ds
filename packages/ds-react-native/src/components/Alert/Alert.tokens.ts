// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const alertTokenScopes = {
  "root": {
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      ref: "semantic.feedback.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.feedback.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.feedback.size.padding-inline",
      fallback: 16,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.feedback.size.padding-inline",
      fallback: 16,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.feedback.size.gap",
      fallback: 8,
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
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.primary",
      fallback: "#a0a0a1",
    },
    "alert.size.radius": {
      name: "alert.size.radius",
      cssVar: "--fsds-alert-size-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "alert.text.size": {
      name: "alert.text.size",
      cssVar: "--fsds-alert-text-size",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "alert.text.weight": {
      name: "alert.text.weight",
      cssVar: "--fsds-alert-text-weight",
      ref: "semantic.typography.font.weight.regular",
      fallback: "400",
    },
  },
  "variant_info": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.info.subtle",
      fallback: "#95dafb",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#013ab0",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.info",
      fallback: "#034fd6",
    },
  },
  "variant_success": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.success.subtle",
      fallback: "#b3dba7",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#2c4f09",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.success",
      fallback: "#3a6614",
    },
  },
  "variant_warning": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#fdc67f",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#6c3a00",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.warning",
      fallback: "#8b4b00",
    },
  },
  "variant_danger": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fac2c2",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#900909",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.danger",
      fallback: "#b31b1b",
    },
  },
  "variant_inline": {
    "alert.spacing.gap": {
      name: "alert.spacing.gap",
      cssVar: "--fsds-alert-spacing-gap",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "alert.text.size": {
      name: "alert.text.size",
      cssVar: "--fsds-alert-text-size",
      ref: "semantic.typography.body.04",
      fallback: 12,
    },
  },
  "variant_section": {
    "alert.spacing.gap": {
      name: "alert.spacing.gap",
      cssVar: "--fsds-alert-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "alert.text.size": {
      name: "alert.text.size",
      cssVar: "--fsds-alert-text-size",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
  },
  "variant_page": {
    "alert.spacing.gap": {
      name: "alert.spacing.gap",
      cssVar: "--fsds-alert-spacing-gap",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "alert.text.size": {
      name: "alert.text.size",
      cssVar: "--fsds-alert-text-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveAlertTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(alertTokenScopes, theme);
}
// @generated:end
