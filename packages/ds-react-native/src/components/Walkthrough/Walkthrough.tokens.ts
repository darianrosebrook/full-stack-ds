// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const walkthroughTokenScopes = {
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
      fallback: 16,
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
    "walkthrough.color.surface.background": {
      name: "walkthrough.color.surface.background",
      cssVar: "--fsds-walkthrough-color-surface-background",
      ref: "semantic.color.background.secondary",
      fallback: "#d0d0d0",
    },
    "walkthrough.color.surface.border": {
      name: "walkthrough.color.surface.border",
      cssVar: "--fsds-walkthrough-color-surface-border",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "walkthrough.size.surface.radius": {
      name: "walkthrough.size.surface.radius",
      cssVar: "--fsds-walkthrough-size-surface-radius",
      ref: "semantic.shape.radius.large",
      fallback: 16,
    },
    "walkthrough.color.surface.shadow": {
      name: "walkthrough.color.surface.shadow",
      cssVar: "--fsds-walkthrough-color-surface-shadow",
      ref: "semantic.elevation.surface.floating",
      fallback: "0px 2px 4px #0000000f, 0px 4px 8px #0000001a",
    },
    "walkthrough.size.surface.padding": {
      name: "walkthrough.size.surface.padding",
      cssVar: "--fsds-walkthrough-size-surface-padding",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "walkthrough.size.title.fontSize": {
      name: "walkthrough.size.title.fontSize",
      cssVar: "--fsds-walkthrough-size-title-font-size",
      ref: "semantic.typography.heading.03",
      fallback: 20,
    },
    "walkthrough.typography.title.fontWeight": {
      name: "walkthrough.typography.title.fontWeight",
      cssVar: "--fsds-walkthrough-typography-title-font-weight",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "walkthrough.color.title.foreground": {
      name: "walkthrough.color.title.foreground",
      cssVar: "--fsds-walkthrough-color-title-foreground",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "walkthrough.size.description.fontSize": {
      name: "walkthrough.size.description.fontSize",
      cssVar: "--fsds-walkthrough-size-description-font-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "walkthrough.color.description.foreground": {
      name: "walkthrough.color.description.foreground",
      cssVar: "--fsds-walkthrough-color-description-foreground",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "walkthrough.spacing.description.marginTop": {
      name: "walkthrough.spacing.description.marginTop",
      cssVar: "--fsds-walkthrough-spacing-description-margin-top",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "walkthrough.spacing.controls.gap": {
      name: "walkthrough.spacing.controls.gap",
      cssVar: "--fsds-walkthrough-spacing-controls-gap",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "walkthrough.spacing.controls.marginTop": {
      name: "walkthrough.spacing.controls.marginTop",
      cssVar: "--fsds-walkthrough-spacing-controls-margin-top",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "walkthrough.size.dots.default": {
      name: "walkthrough.size.dots.default",
      cssVar: "--fsds-walkthrough-size-dots-default",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "walkthrough.spacing.dots.gap": {
      name: "walkthrough.spacing.dots.gap",
      cssVar: "--fsds-walkthrough-spacing-dots-gap",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "walkthrough.color.dots.active": {
      name: "walkthrough.color.dots.active",
      cssVar: "--fsds-walkthrough-color-dots-active",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#0566fe",
    },
    "walkthrough.color.dots.idle": {
      name: "walkthrough.color.dots.idle",
      cssVar: "--fsds-walkthrough-color-dots-idle",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "walkthrough.color.button.primary.background": {
      name: "walkthrough.color.button.primary.background",
      cssVar: "--fsds-walkthrough-color-button-primary-background",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#0566fe",
    },
    "walkthrough.color.button.primary.foreground": {
      name: "walkthrough.color.button.primary.foreground",
      cssVar: "--fsds-walkthrough-color-button-primary-foreground",
      ref: "semantic.color.action.foreground.primary.default",
      fallback: "#ffffff",
    },
    "walkthrough.size.button.primary.radius": {
      name: "walkthrough.size.button.primary.radius",
      cssVar: "--fsds-walkthrough-size-button-primary-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "walkthrough.color.button.secondary.background": {
      name: "walkthrough.color.button.secondary.background",
      cssVar: "--fsds-walkthrough-color-button-secondary-background",
      ref: "core.color.mode.transparent",
      fallback: "#00000000",
    },
    "walkthrough.color.button.secondary.foreground": {
      name: "walkthrough.color.button.secondary.foreground",
      cssVar: "--fsds-walkthrough-color-button-secondary-foreground",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "walkthrough.color.button.secondary.border": {
      name: "walkthrough.color.button.secondary.border",
      cssVar: "--fsds-walkthrough-color-button-secondary-border",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveWalkthroughTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(walkthroughTokenScopes, theme);
}
// @generated:end
