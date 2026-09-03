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
    "walkthrough.surface.bg": {
      name: "walkthrough.surface.bg",
      cssVar: "--fsds-walkthrough-surface-bg",
      ref: "semantic.color.background.secondary",
      fallback: "#f7f7f7",
    },
    "walkthrough.surface.border": {
      name: "walkthrough.surface.border",
      cssVar: "--fsds-walkthrough-surface-border",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "walkthrough.surface.radius": {
      name: "walkthrough.surface.radius",
      cssVar: "--fsds-walkthrough-surface-radius",
      ref: "semantic.shape.radius.large",
      fallback: 16,
    },
    "walkthrough.surface.shadow": {
      name: "walkthrough.surface.shadow",
      cssVar: "--fsds-walkthrough-surface-shadow",
      ref: "semantic.elevation.surface.floating",
      fallback: "0px 2px 4px #0000000f, 0px 4px 8px #0000001a",
    },
    "walkthrough.surface.padding": {
      name: "walkthrough.surface.padding",
      cssVar: "--fsds-walkthrough-surface-padding",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "walkthrough.title.fontSize": {
      name: "walkthrough.title.fontSize",
      cssVar: "--fsds-walkthrough-title-font-size",
      ref: "semantic.typography.heading.03",
      fallback: 20,
    },
    "walkthrough.title.fontWeight": {
      name: "walkthrough.title.fontWeight",
      cssVar: "--fsds-walkthrough-title-font-weight",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "walkthrough.title.color": {
      name: "walkthrough.title.color",
      cssVar: "--fsds-walkthrough-title-color",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "walkthrough.description.fontSize": {
      name: "walkthrough.description.fontSize",
      cssVar: "--fsds-walkthrough-description-font-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "walkthrough.description.color": {
      name: "walkthrough.description.color",
      cssVar: "--fsds-walkthrough-description-color",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "walkthrough.description.marginTop": {
      name: "walkthrough.description.marginTop",
      cssVar: "--fsds-walkthrough-description-margin-top",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "walkthrough.controls.gap": {
      name: "walkthrough.controls.gap",
      cssVar: "--fsds-walkthrough-controls-gap",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "walkthrough.controls.marginTop": {
      name: "walkthrough.controls.marginTop",
      cssVar: "--fsds-walkthrough-controls-margin-top",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "walkthrough.dots.size": {
      name: "walkthrough.dots.size",
      cssVar: "--fsds-walkthrough-dots-size",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "walkthrough.dots.gap": {
      name: "walkthrough.dots.gap",
      cssVar: "--fsds-walkthrough-dots-gap",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "walkthrough.dots.active": {
      name: "walkthrough.dots.active",
      cssVar: "--fsds-walkthrough-dots-active",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#0566fe",
    },
    "walkthrough.dots.idle": {
      name: "walkthrough.dots.idle",
      cssVar: "--fsds-walkthrough-dots-idle",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "walkthrough.button.primary.bg": {
      name: "walkthrough.button.primary.bg",
      cssVar: "--fsds-walkthrough-button-primary-bg",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#0566fe",
    },
    "walkthrough.button.primary.color": {
      name: "walkthrough.button.primary.color",
      cssVar: "--fsds-walkthrough-button-primary-color",
      ref: "semantic.color.action.foreground.primary.default",
      fallback: "#ffffff",
    },
    "walkthrough.button.primary.radius": {
      name: "walkthrough.button.primary.radius",
      cssVar: "--fsds-walkthrough-button-primary-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "walkthrough.button.secondary.bg": {
      name: "walkthrough.button.secondary.bg",
      cssVar: "--fsds-walkthrough-button-secondary-bg",
      ref: "core.color.mode.transparent",
      fallback: "#00000000",
    },
    "walkthrough.button.secondary.color": {
      name: "walkthrough.button.secondary.color",
      cssVar: "--fsds-walkthrough-button-secondary-color",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "walkthrough.button.secondary.border": {
      name: "walkthrough.button.secondary.border",
      cssVar: "--fsds-walkthrough-button-secondary-border",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveWalkthroughTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(walkthroughTokenScopes, theme);
}
// @generated:end
