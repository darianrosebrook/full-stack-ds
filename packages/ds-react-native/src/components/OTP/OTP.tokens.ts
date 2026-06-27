// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const otpTokenScopes = {
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
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: 0,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.input.size.medium.gap",
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
      ref: "semantic.input.size.medium.min-height",
      fallback: 36,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "otp.color.background.default": {
      name: "otp.color.background.default",
      cssVar: "--fsds-otp-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "otp.color.foreground.primary": {
      name: "otp.color.foreground.primary",
      cssVar: "--fsds-otp-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "otp.color.border.default": {
      name: "otp.color.border.default",
      cssVar: "--fsds-otp-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "otp.size.padding.default": {
      name: "otp.size.padding.default",
      cssVar: "--fsds-otp-size-padding-default",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "otp.size.radius.default": {
      name: "otp.size.radius.default",
      cssVar: "--fsds-otp-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "otp.color.border.accent": {
      name: "otp.color.border.accent",
      cssVar: "--fsds-otp-color-border-accent",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "otp.focus.ring.width": {
      name: "otp.focus.ring.width",
      cssVar: "--fsds-otp-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "otp.focus.ring.color": {
      name: "otp.focus.ring.color",
      cssVar: "--fsds-otp-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "otp.focus.ring.style": {
      name: "otp.focus.ring.style",
      cssVar: "--fsds-otp-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "otp.focus.ring.offset": {
      name: "otp.focus.ring.offset",
      cssVar: "--fsds-otp-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveOTPTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(otpTokenScopes, theme);
}
// @generated:end
