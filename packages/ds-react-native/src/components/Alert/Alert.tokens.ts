// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const alertTokenScopes = {
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
      literal: 0,
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
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
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
      fallback: "#f29495",
    },
    "alert.size.padding": {
      name: "alert.size.padding",
      cssVar: "--fsds-alert-size-padding",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "alert.size.radius": {
      name: "alert.size.radius",
      cssVar: "--fsds-alert-size-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "alert.spacing.gap": {
      name: "alert.spacing.gap",
      cssVar: "--fsds-alert-spacing-gap",
      ref: "semantic.spacing.gap.gridSmall",
      fallback: 8,
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
    "alert.icon.size": {
      name: "alert.icon.size",
      cssVar: "--fsds-alert-icon-size",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "alert.typography.title.fontWeight": {
      name: "alert.typography.title.fontWeight",
      cssVar: "--fsds-alert-typography-title-fontWeight",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "alert.typography.title.fontSize": {
      name: "alert.typography.title.fontSize",
      cssVar: "--fsds-alert-typography-title-fontSize",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "alert.size.padding.inline": {
      name: "alert.size.padding.inline",
      cssVar: "--fsds-alert-size-padding-inline",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "alert.size.padding.page": {
      name: "alert.size.padding.page",
      cssVar: "--fsds-alert-size-padding-page",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "alert.typography.page.fontSize": {
      name: "alert.typography.page.fontSize",
      cssVar: "--fsds-alert-typography-page-fontSize",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "alert.typography.page.title.fontSize": {
      name: "alert.typography.page.title.fontSize",
      cssVar: "--fsds-alert-typography-page-title-fontSize",
      ref: "semantic.typography.body.01",
      fallback: 18,
    },
    "alert.typography.inline.fontSize": {
      name: "alert.typography.inline.fontSize",
      cssVar: "--fsds-alert-typography-inline-fontSize",
      ref: "semantic.typography.body.04",
      fallback: 12,
    },
  },
  "variant_info": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.info",
      fallback: "#0042dc",
    },
  },
  "variant_success": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.success.subtle",
      fallback: "#e4f2e0",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.success.subtle",
      fallback: "#234104",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.success",
      fallback: "#336006",
    },
  },
  "variant_warning": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.warning.subtle",
      fallback: "#ffedcc",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.warning.subtle",
      fallback: "#593000",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.warning",
      fallback: "#824500",
    },
  },
  "variant_danger": {
    "alert.color.background.primary": {
      name: "alert.color.background.primary",
      cssVar: "--fsds-alert-color-background-primary",
      ref: "semantic.color.background.danger.subtle",
      fallback: "#fceaea",
    },
    "alert.color.foreground.primary": {
      name: "alert.color.foreground.primary",
      cssVar: "--fsds-alert-color-foreground-primary",
      ref: "semantic.color.foreground.on.danger.subtle",
      fallback: "#7b0000",
    },
    "alert.color.border.primary": {
      name: "alert.color.border.primary",
      cssVar: "--fsds-alert-color-border-primary",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
  },
  "variant_inline": {
    "alert.size.padding": {
      name: "alert.size.padding",
      cssVar: "--fsds-alert-size-padding",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
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
    "alert.typography.title.fontSize": {
      name: "alert.typography.title.fontSize",
      cssVar: "--fsds-alert-typography-title-fontSize",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
  },
  "variant_section": {
    "alert.size.padding": {
      name: "alert.size.padding",
      cssVar: "--fsds-alert-size-padding",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
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
    "alert.typography.title.fontSize": {
      name: "alert.typography.title.fontSize",
      cssVar: "--fsds-alert-typography-title-fontSize",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
  },
  "variant_page": {
    "alert.size.padding": {
      name: "alert.size.padding",
      cssVar: "--fsds-alert-size-padding",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
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
    "alert.typography.title.fontSize": {
      name: "alert.typography.title.fontSize",
      cssVar: "--fsds-alert-typography-title-fontSize",
      ref: "semantic.typography.body.01",
      fallback: 18,
    },
    "alert.typography.title.fontWeight": {
      name: "alert.typography.title.fontWeight",
      cssVar: "--fsds-alert-typography-title-fontWeight",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveAlertTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(alertTokenScopes, theme);
}
// @generated:end
