// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const inputTokenScopes = {
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
      literal: "0",
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
      ref: "semantic.input.size.medium.min-height",
      fallback: 36,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "input.color.bg.default": {
      name: "input.color.bg.default",
      cssVar: "--fsds-input-color-bg-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "input.color.text.default": {
      name: "input.color.text.default",
      cssVar: "--fsds-input-color-text-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "input.color.border.default": {
      name: "input.color.border.default",
      cssVar: "--fsds-input-color-border-default",
      ref: "semantic.color.border.default",
      fallback: "#aeaeae",
    },
    "input.size.height.default": {
      name: "input.size.height.default",
      cssVar: "--fsds-input-size-height-default",
      ref: "semantic.control.size.lg.height",
      fallback: 48,
    },
    "input.size.radius.default": {
      name: "input.size.radius.default",
      cssVar: "--fsds-input-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "input.space.inline.default": {
      name: "input.space.inline.default",
      cssVar: "--fsds-input-space-inline-default",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "input.color.focus.default": {
      name: "input.color.focus.default",
      cssVar: "--fsds-input-color-focus-default",
      ref: "semantic.color.border.focus",
      fallback: "#d9292b",
    },
    "input.color.invalid.default": {
      name: "input.color.invalid.default",
      cssVar: "--fsds-input-color-invalid-default",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveInputTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(inputTokenScopes, theme);
}
// @generated:end
