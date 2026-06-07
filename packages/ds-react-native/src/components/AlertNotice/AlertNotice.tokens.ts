// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const alertNoticeTokenScopes = {
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
      ref: "semantic.feedback.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.feedback.size.padding-block",
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
      literal: "0",
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
    "alert-notice.color.background.primary": {
      name: "alert-notice.color.background.primary",
      cssVar: "--fsds-alert-notice-color-background-primary",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "alert-notice.color.foreground.primary": {
      name: "alert-notice.color.foreground.primary",
      cssVar: "--fsds-alert-notice-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "alert-notice.color.background.info": {
      name: "alert-notice.color.background.info",
      cssVar: "--fsds-alert-notice-color-background-info",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "alert-notice.color.background.success": {
      name: "alert-notice.color.background.success",
      cssVar: "--fsds-alert-notice-color-background-success",
      ref: "semantic.color.background.success.subtle",
      fallback: "#e4f2e0",
    },
    "alert-notice.color.background.warning": {
      name: "alert-notice.color.background.warning",
      cssVar: "--fsds-alert-notice-color-background-warning",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#ffedcc",
    },
    "alert-notice.color.background.danger": {
      name: "alert-notice.color.background.danger",
      cssVar: "--fsds-alert-notice-color-background-danger",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "alert-notice.color.foreground.info": {
      name: "alert-notice.color.foreground.info",
      cssVar: "--fsds-alert-notice-color-foreground-info",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "alert-notice.color.foreground.success": {
      name: "alert-notice.color.foreground.success",
      cssVar: "--fsds-alert-notice-color-foreground-success",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#234104",
    },
    "alert-notice.color.foreground.warning": {
      name: "alert-notice.color.foreground.warning",
      cssVar: "--fsds-alert-notice-color-foreground-warning",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#593000",
    },
    "alert-notice.color.foreground.danger": {
      name: "alert-notice.color.foreground.danger",
      cssVar: "--fsds-alert-notice-color-foreground-danger",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#7b0000",
    },
    "alert-notice.color.border.info": {
      name: "alert-notice.color.border.info",
      cssVar: "--fsds-alert-notice-color-border-info",
      ref: "semantic.color.border.info",
      fallback: "#0042dc",
    },
    "alert-notice.color.border.success": {
      name: "alert-notice.color.border.success",
      cssVar: "--fsds-alert-notice-color-border-success",
      ref: "semantic.color.border.success",
      fallback: "#336006",
    },
    "alert-notice.color.border.warning": {
      name: "alert-notice.color.border.warning",
      cssVar: "--fsds-alert-notice-color-border-warning",
      ref: "semantic.color.border.warning",
      fallback: "#824500",
    },
    "alert-notice.color.border.danger": {
      name: "alert-notice.color.border.danger",
      cssVar: "--fsds-alert-notice-color-border-danger",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
    "alert-notice.size.padding": {
      name: "alert-notice.size.padding",
      cssVar: "--fsds-alert-notice-size-padding",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "alert-notice.size.radius": {
      name: "alert-notice.size.radius",
      cssVar: "--fsds-alert-notice-size-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "alert-notice.spacing.gap": {
      name: "alert-notice.spacing.gap",
      cssVar: "--fsds-alert-notice-spacing-gap",
      ref: "semantic.spacing.gap.gridSmall",
      fallback: 8,
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
    "alert-notice.icon.size": {
      name: "alert-notice.icon.size",
      cssVar: "--fsds-alert-notice-icon-size",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "alert-notice.typography.title.fontWeight": {
      name: "alert-notice.typography.title.fontWeight",
      cssVar: "--fsds-alert-notice-typography-title-fontWeight",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "alert-notice.typography.title.fontSize": {
      name: "alert-notice.typography.title.fontSize",
      cssVar: "--fsds-alert-notice-typography-title-fontSize",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveAlertNoticeTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(alertNoticeTokenScopes, theme);
}
// @generated:end
