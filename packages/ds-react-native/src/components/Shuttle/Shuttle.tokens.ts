// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const shuttleTokenScopes = {
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
      literal: "0",
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      literal: "0",
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: "0",
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      literal: "0",
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      literal: "0",
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.structure.size.gap",
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
    "shuttle.color.background.default": {
      name: "shuttle.color.background.default",
      cssVar: "--fsds-shuttle-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "shuttle.color.foreground.primary": {
      name: "shuttle.color.foreground.primary",
      cssVar: "--fsds-shuttle-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "shuttle.color.border.default": {
      name: "shuttle.color.border.default",
      cssVar: "--fsds-shuttle-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "shuttle.color.border.accent": {
      name: "shuttle.color.border.accent",
      cssVar: "--fsds-shuttle-color-border-accent",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "shuttle.size.padding.default": {
      name: "shuttle.size.padding.default",
      cssVar: "--fsds-shuttle-size-padding-default",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "shuttle.size.radius.default": {
      name: "shuttle.size.radius.default",
      cssVar: "--fsds-shuttle-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveShuttleTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(shuttleTokenScopes, theme);
}
// @generated:end
