// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const showMoreTokenScopes = {
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
      ref: "semantic.action.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.action.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: "0",
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.action.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.action.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.action.size.medium.gap",
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
      ref: "semantic.action.size.medium.min-width",
      fallback: 36,
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
      ref: "semantic.action.size.medium.min-height",
      fallback: 36,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "show-more.color.background.default": {
      name: "show-more.color.background.default",
      cssVar: "--fsds-show-more-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "show-more.color.foreground.primary": {
      name: "show-more.color.foreground.primary",
      cssVar: "--fsds-show-more-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "show-more.color.foreground.secondary": {
      name: "show-more.color.foreground.secondary",
      cssVar: "--fsds-show-more-color-foreground-secondary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "show-more.color.border.default": {
      name: "show-more.color.border.default",
      cssVar: "--fsds-show-more-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "show-more.color.border.accent": {
      name: "show-more.color.border.accent",
      cssVar: "--fsds-show-more-color-border-accent",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "show-more.size.padding.default": {
      name: "show-more.size.padding.default",
      cssVar: "--fsds-show-more-size-padding-default",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "show-more.size.radius.default": {
      name: "show-more.size.radius.default",
      cssVar: "--fsds-show-more-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "show-more.overlay.imageOverlay": {
      name: "show-more.overlay.imageOverlay",
      cssVar: "--fsds-show-more-overlay-imageOverlay",
      ref: "semantic.color.background.image.overlay",
      fallback: "rgba(0, 0, 0, 0.5)",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveShowMoreTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(showMoreTokenScopes, theme);
}
// @generated:end
