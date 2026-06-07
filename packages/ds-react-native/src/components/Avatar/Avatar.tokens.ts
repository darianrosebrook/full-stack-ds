// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const avatarTokenScopes = {
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
      literal: 0,
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      ref: "semantic.glyph.size.medium.extent",
      fallback: 16,
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
      ref: "semantic.glyph.size.medium.extent",
      fallback: 16,
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
    "avatar.size.default": {
      name: "avatar.size.default",
      cssVar: "--fsds-avatar-size-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "avatar.size.small": {
      name: "avatar.size.small",
      cssVar: "--fsds-avatar-size-small",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "avatar.size.medium": {
      name: "avatar.size.medium",
      cssVar: "--fsds-avatar-size-medium",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "avatar.size.large": {
      name: "avatar.size.large",
      cssVar: "--fsds-avatar-size-large",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "avatar.size.extra-large": {
      name: "avatar.size.extra-large",
      cssVar: "--fsds-avatar-size-extra-large",
      ref: "core.spacing.size.09",
      fallback: 48,
    },
    "avatar.size.radius.default": {
      name: "avatar.size.radius.default",
      cssVar: "--fsds-avatar-size-radius-default",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
    "avatar.size.border.default": {
      name: "avatar.size.border.default",
      cssVar: "--fsds-avatar-size-border-default",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "avatar.color.background.default": {
      name: "avatar.color.background.default",
      cssVar: "--fsds-avatar-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "avatar.color.background.inverse": {
      name: "avatar.color.background.inverse",
      cssVar: "--fsds-avatar-color-background-inverse",
      ref: "semantic.color.background.inverse",
      fallback: "#141414",
    },
    "avatar.color.foreground.primary": {
      name: "avatar.color.foreground.primary",
      cssVar: "--fsds-avatar-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "avatar.color.border.default": {
      name: "avatar.color.border.default",
      cssVar: "--fsds-avatar-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "avatar.typography.fontWeight.medium": {
      name: "avatar.typography.fontWeight.medium",
      cssVar: "--fsds-avatar-typography-fontWeight-medium",
      ref: "core.typography.weight.medium",
      fallback: "500",
    },
    "avatar.typography.fontFamily.sans": {
      name: "avatar.typography.fontFamily.sans",
      cssVar: "--fsds-avatar-typography-fontFamily-sans",
      ref: "core.typography.font.family.sans",
      fallback: "\"Inter\", sans-serif",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveAvatarTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(avatarTokenScopes, theme);
}
// @generated:end
