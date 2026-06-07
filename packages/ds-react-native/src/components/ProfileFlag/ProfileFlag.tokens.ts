// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const profileFlagTokenScopes = {
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
      literal: 2,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      literal: 2,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: "0",
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      literal: 4,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      literal: 4,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      literal: "0",
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
      ref: "semantic.glyph.size.medium.extent",
      fallback: 16,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "profile-flag.color.background.default": {
      name: "profile-flag.color.background.default",
      cssVar: "--fsds-profile-flag-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "profile-flag.color.border.default": {
      name: "profile-flag.color.border.default",
      cssVar: "--fsds-profile-flag-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "profile-flag.color.foreground.primary": {
      name: "profile-flag.color.foreground.primary",
      cssVar: "--fsds-profile-flag-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "profile-flag.size.radius.default": {
      name: "profile-flag.size.radius.default",
      cssVar: "--fsds-profile-flag-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "profile-flag.spacing.gap.default": {
      name: "profile-flag.spacing.gap.default",
      cssVar: "--fsds-profile-flag-spacing-gap-default",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "profile-flag.spacing.padding.default": {
      name: "profile-flag.spacing.padding.default",
      cssVar: "--fsds-profile-flag-spacing-padding-default",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "profile-flag.spacing.padding.right": {
      name: "profile-flag.spacing.padding.right",
      cssVar: "--fsds-profile-flag-spacing-padding-right",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "profile-flag.color.border.hover": {
      name: "profile-flag.color.border.hover",
      cssVar: "--fsds-profile-flag-color-border-hover",
      ref: "semantic.color.border.bold",
      fallback: "#8f8f8f",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveProfileFlagTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(profileFlagTokenScopes, theme);
}
// @generated:end
