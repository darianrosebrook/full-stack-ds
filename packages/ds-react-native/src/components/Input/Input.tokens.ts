// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const inputTokenScopes = {
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
    "input.color.bg.default": {
      name: "input.color.bg.default",
      cssVar: "--fsds-input-color-bg-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "input.color.bg.disabled": {
      name: "input.color.bg.disabled",
      cssVar: "--fsds-input-color-bg-disabled",
      ref: "semantic.interaction.background.disabled",
      fallback: "#efefef",
    },
    "input.color.text.default": {
      name: "input.color.text.default",
      cssVar: "--fsds-input-color-text-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "input.color.text.placeholder": {
      name: "input.color.text.placeholder",
      cssVar: "--fsds-input-color-text-placeholder",
      ref: "semantic.color.foreground.placeholder",
      fallback: "#717171",
    },
    "input.color.text.disabled": {
      name: "input.color.text.disabled",
      cssVar: "--fsds-input-color-text-disabled",
      ref: "semantic.color.foreground.disabled",
      fallback: "#717171",
    },
    "input.color.border.default": {
      name: "input.color.border.default",
      cssVar: "--fsds-input-color-border-default",
      ref: "semantic.color.border.default",
      fallback: "#aeaeae",
    },
    "input.color.border.hover": {
      name: "input.color.border.hover",
      cssVar: "--fsds-input-color-border-hover",
      ref: "semantic.color.border.hover",
      fallback: "#8f8f8f",
    },
    "input.color.border.disabled": {
      name: "input.color.border.disabled",
      cssVar: "--fsds-input-color-border-disabled",
      ref: "semantic.color.border.disabled",
      fallback: "#cecece",
    },
    "input.size.height.default": {
      name: "input.size.height.default",
      cssVar: "--fsds-input-size-height-default",
      ref: "semantic.input.size.medium.min-height",
      fallback: 36,
    },
    "input.size.padding-block.default": {
      name: "input.size.padding-block.default",
      cssVar: "--fsds-input-size-padding-block-default",
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "input.size.padding-inline.default": {
      name: "input.size.padding-inline.default",
      cssVar: "--fsds-input-size-padding-inline-default",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "input.size.radius.default": {
      name: "input.size.radius.default",
      cssVar: "--fsds-input-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "input.size.border.default": {
      name: "input.size.border.default",
      cssVar: "--fsds-input-size-border-default",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
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
    "input.typography.size.default": {
      name: "input.typography.size.default",
      cssVar: "--fsds-input-typography-size-default",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "input.typography.line-height.default": {
      name: "input.typography.line-height.default",
      cssVar: "--fsds-input-typography-line-height-default",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
    "input.opacity.disabled": {
      name: "input.opacity.disabled",
      cssVar: "--fsds-input-opacity-disabled",
      ref: "semantic.interaction.disabled.opacity",
      fallback: "0.5",
    },
    "input.focus.ring.width": {
      name: "input.focus.ring.width",
      cssVar: "--fsds-input-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "input.focus.ring.color": {
      name: "input.focus.ring.color",
      cssVar: "--fsds-input-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "input.focus.ring.style": {
      name: "input.focus.ring.style",
      cssVar: "--fsds-input-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "input.focus.ring.offset": {
      name: "input.focus.ring.offset",
      cssVar: "--fsds-input-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
    "input.motion.duration.fast": {
      name: "input.motion.duration.fast",
      cssVar: "--fsds-input-motion-duration-fast",
      ref: "core.motion.duration.short",
      fallback: 150,
    },
    "input.motion.easing.standard": {
      name: "input.motion.easing.standard",
      cssVar: "--fsds-input-motion-easing-standard",
      ref: "core.motion.easing.standard",
      fallback: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveInputTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(inputTokenScopes, theme);
}
// @generated:end
