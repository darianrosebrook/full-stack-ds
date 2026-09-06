// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const alertNoticeTokenScopes = {
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
    "alert-notice.color.background.info": {
      name: "alert-notice.color.background.info",
      cssVar: "--fsds-alert-notice-color-background-info",
      ref: "semantic.color.background.info.subtle",
      fallback: "#95dafb",
    },
    "alert-notice.color.background.success": {
      name: "alert-notice.color.background.success",
      cssVar: "--fsds-alert-notice-color-background-success",
      ref: "semantic.color.background.success.subtle",
      fallback: "#b3dba7",
    },
    "alert-notice.color.background.warning": {
      name: "alert-notice.color.background.warning",
      cssVar: "--fsds-alert-notice-color-background-warning",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#fdc67f",
    },
    "alert-notice.color.background.danger": {
      name: "alert-notice.color.background.danger",
      cssVar: "--fsds-alert-notice-color-background-danger",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fac2c2",
    },
    "alert-notice.color.foreground.info": {
      name: "alert-notice.color.foreground.info",
      cssVar: "--fsds-alert-notice-color-foreground-info",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#013ab0",
    },
    "alert-notice.color.foreground.success": {
      name: "alert-notice.color.foreground.success",
      cssVar: "--fsds-alert-notice-color-foreground-success",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#2c4f09",
    },
    "alert-notice.color.foreground.warning": {
      name: "alert-notice.color.foreground.warning",
      cssVar: "--fsds-alert-notice-color-foreground-warning",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#6c3a00",
    },
    "alert-notice.color.foreground.danger": {
      name: "alert-notice.color.foreground.danger",
      cssVar: "--fsds-alert-notice-color-foreground-danger",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#900909",
    },
    "alert-notice.color.border.info": {
      name: "alert-notice.color.border.info",
      cssVar: "--fsds-alert-notice-color-border-info",
      ref: "semantic.color.border.info",
      fallback: "#034fd6",
    },
    "alert-notice.color.border.success": {
      name: "alert-notice.color.border.success",
      cssVar: "--fsds-alert-notice-color-border-success",
      ref: "semantic.color.border.success",
      fallback: "#3a6614",
    },
    "alert-notice.color.border.warning": {
      name: "alert-notice.color.border.warning",
      cssVar: "--fsds-alert-notice-color-border-warning",
      ref: "semantic.color.border.warning",
      fallback: "#8b4b00",
    },
    "alert-notice.color.border.danger": {
      name: "alert-notice.color.border.danger",
      cssVar: "--fsds-alert-notice-color-border-danger",
      ref: "semantic.color.border.danger",
      fallback: "#b31b1b",
    },
    "alert-notice.size.radius": {
      name: "alert-notice.size.radius",
      cssVar: "--fsds-alert-notice-size-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "alert-notice.text.size": {
      name: "alert-notice.text.size",
      cssVar: "--fsds-alert-notice-text-size",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "alert-notice.text.weight": {
      name: "alert-notice.text.weight",
      cssVar: "--fsds-alert-notice-text-weight",
      ref: "semantic.typography.font.weight.regular",
      fallback: "400",
    },
  },
  "variant_inline": {
    "alert-notice.spacing.gap": {
      name: "alert-notice.spacing.gap",
      cssVar: "--fsds-alert-notice-spacing-gap",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "alert-notice.text.size": {
      name: "alert-notice.text.size",
      cssVar: "--fsds-alert-notice-text-size",
      ref: "semantic.typography.body.04",
      fallback: 12,
    },
  },
  "variant_section": {
    "alert-notice.spacing.gap": {
      name: "alert-notice.spacing.gap",
      cssVar: "--fsds-alert-notice-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "alert-notice.text.size": {
      name: "alert-notice.text.size",
      cssVar: "--fsds-alert-notice-text-size",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
  },
  "variant_page": {
    "alert-notice.spacing.gap": {
      name: "alert-notice.spacing.gap",
      cssVar: "--fsds-alert-notice-spacing-gap",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "alert-notice.text.size": {
      name: "alert-notice.text.size",
      cssVar: "--fsds-alert-notice-text-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "alert-notice.color.background.danger": {
      name: "alert-notice.color.background.danger",
      cssVar: "--fsds-alert-notice-color-background-danger",
      ref: "semantic.color.background.danger.softer",
      fallback: "#fee4e4",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveAlertNoticeTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(alertNoticeTokenScopes, theme);
}
// @generated:end
