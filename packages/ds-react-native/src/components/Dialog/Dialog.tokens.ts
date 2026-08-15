// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const dialogTokenScopes = {
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
      literal: 0,
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
      literal: 0,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "dialog.color.background.default": {
      name: "dialog.color.background.default",
      cssVar: "--fsds-dialog-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "dialog.color.foreground.default": {
      name: "dialog.color.foreground.default",
      cssVar: "--fsds-dialog-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "dialog.color.border.default": {
      name: "dialog.color.border.default",
      cssVar: "--fsds-dialog-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "dialog.size.radius.default": {
      name: "dialog.size.radius.default",
      cssVar: "--fsds-dialog-size-radius-default",
      ref: "semantic.shape.radius.large",
      fallback: 16,
    },
    "dialog.size.sm.width": {
      name: "dialog.size.sm.width",
      cssVar: "--fsds-dialog-size-sm-width",
      literal: 400,
    },
    "dialog.size.sm.maxWidth": {
      name: "dialog.size.sm.maxWidth",
      cssVar: "--fsds-dialog-size-sm-max-width",
      literal: "90vw",
    },
    "dialog.size.md.width": {
      name: "dialog.size.md.width",
      cssVar: "--fsds-dialog-size-md-width",
      literal: 500,
    },
    "dialog.size.md.maxWidth": {
      name: "dialog.size.md.maxWidth",
      cssVar: "--fsds-dialog-size-md-max-width",
      literal: "90vw",
    },
    "dialog.size.lg.width": {
      name: "dialog.size.lg.width",
      cssVar: "--fsds-dialog-size-lg-width",
      literal: 700,
    },
    "dialog.size.lg.maxWidth": {
      name: "dialog.size.lg.maxWidth",
      cssVar: "--fsds-dialog-size-lg-max-width",
      literal: "90vw",
    },
    "dialog.size.xl.width": {
      name: "dialog.size.xl.width",
      cssVar: "--fsds-dialog-size-xl-width",
      literal: 900,
    },
    "dialog.size.xl.maxWidth": {
      name: "dialog.size.xl.maxWidth",
      cssVar: "--fsds-dialog-size-xl-max-width",
      literal: "95vw",
    },
    "dialog.size.full.width": {
      name: "dialog.size.full.width",
      cssVar: "--fsds-dialog-size-full-width",
      literal: "100vw",
    },
    "dialog.size.full.height": {
      name: "dialog.size.full.height",
      cssVar: "--fsds-dialog-size-full-height",
      literal: "100vh",
    },
    "dialog.size.closeButton.size": {
      name: "dialog.size.closeButton.size",
      cssVar: "--fsds-dialog-size-close-button-size",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "dialog.elevation.default": {
      name: "dialog.elevation.default",
      cssVar: "--fsds-dialog-elevation-default",
      ref: "semantic.elevation.surface.dialog",
      fallback: "0px 12px 16px #0000000f, 0px 25px 50px #00000026",
    },
    "dialog.spacing.header.paddingTop": {
      name: "dialog.spacing.header.paddingTop",
      cssVar: "--fsds-dialog-spacing-header-padding-top",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "dialog.spacing.body.paddingRight": {
      name: "dialog.spacing.body.paddingRight",
      cssVar: "--fsds-dialog-spacing-body-padding-right",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "dialog.spacing.footer.gap": {
      name: "dialog.spacing.footer.gap",
      cssVar: "--fsds-dialog-spacing-footer-gap",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "dialog.typography.title.fontSize": {
      name: "dialog.typography.title.fontSize",
      cssVar: "--fsds-dialog-typography-title-font-size",
      ref: "semantic.typography.heading.04",
      fallback: 18,
    },
    "dialog.typography.title.fontWeight": {
      name: "dialog.typography.title.fontWeight",
      cssVar: "--fsds-dialog-typography-title-font-weight",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "dialog.typography.title.lineHeight": {
      name: "dialog.typography.title.lineHeight",
      cssVar: "--fsds-dialog-typography-title-line-height",
      ref: "semantic.typography.line.height.heading",
      fallback: "1",
    },
  },
  "part_backdrop": {
    "dialog.color.background.default": {
      name: "dialog.color.background.default",
      cssVar: "--fsds-dialog-color-background-default",
      ref: "semantic.color.overlay.scrim",
      fallback: "#00000066",
    },
  },
  "part_body": {
    "dialog.color.foreground.default": {
      name: "dialog.color.foreground.default",
      cssVar: "--fsds-dialog-color-foreground-default",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
  },
  "part_closeButton": {
    "dialog.color.foreground.default": {
      name: "dialog.color.foreground.default",
      cssVar: "--fsds-dialog-color-foreground-default",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
  },
  "hover": {
    "dialog.color.background.default": {
      name: "dialog.color.background.default",
      cssVar: "--fsds-dialog-color-background-default",
      ref: "semantic.color.background.hover",
      fallback: "#b8b8b8",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveDialogTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(dialogTokenScopes, theme);
}
// @generated:end
