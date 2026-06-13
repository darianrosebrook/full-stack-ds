// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const textFieldTokenScopes = {
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
    "text-field.spacing.gap": {
      name: "text-field.spacing.gap",
      cssVar: "--fsds-text-field-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "text-field.field.padding-block": {
      name: "text-field.field.padding-block",
      cssVar: "--fsds-text-field-field-padding-block",
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "text-field.field.padding-inline": {
      name: "text-field.field.padding-inline",
      cssVar: "--fsds-text-field-field-padding-inline",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "text-field.field.min-height": {
      name: "text-field.field.min-height",
      cssVar: "--fsds-text-field-field-min-height",
      ref: "semantic.input.size.medium.min-height",
      fallback: 36,
    },
    "text-field.border.width": {
      name: "text-field.border.width",
      cssVar: "--fsds-text-field-border-width",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "text-field.border.radius": {
      name: "text-field.border.radius",
      cssVar: "--fsds-text-field-border-radius",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "text-field.color.input.background": {
      name: "text-field.color.input.background",
      cssVar: "--fsds-text-field-color-input-background",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "text-field.color.input.text": {
      name: "text-field.color.input.text",
      cssVar: "--fsds-text-field-color-input-text",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "text-field.color.input.placeholder": {
      name: "text-field.color.input.placeholder",
      cssVar: "--fsds-text-field-color-input-placeholder",
      ref: "semantic.color.foreground.tertiary",
      fallback: "#717171",
    },
    "text-field.color.input.border": {
      name: "text-field.color.input.border",
      cssVar: "--fsds-text-field-color-input-border",
      ref: "semantic.color.border.default",
      fallback: "#aeaeae",
    },
    "text-field.color.input.borderHover": {
      name: "text-field.color.input.borderHover",
      cssVar: "--fsds-text-field-color-input-borderHover",
      ref: "semantic.color.border.hover",
      fallback: "#8f8f8f",
    },
    "text-field.color.input.backgroundDisabled": {
      name: "text-field.color.input.backgroundDisabled",
      cssVar: "--fsds-text-field-color-input-backgroundDisabled",
      ref: "semantic.interaction.background.disabled",
      fallback: "#efefef",
    },
    "text-field.color.input.textDisabled": {
      name: "text-field.color.input.textDisabled",
      cssVar: "--fsds-text-field-color-input-textDisabled",
      ref: "semantic.color.foreground.disabled",
      fallback: "#717171",
    },
    "text-field.color.input.borderDisabled": {
      name: "text-field.color.input.borderDisabled",
      cssVar: "--fsds-text-field-color-input-borderDisabled",
      ref: "semantic.color.border.disabled",
      fallback: "#cecece",
    },
    "text-field.color.input.borderError": {
      name: "text-field.color.input.borderError",
      cssVar: "--fsds-text-field-color-input-borderError",
      ref: "semantic.color.status.danger",
      fallback: "#d9292b",
    },
    "text-field.color.error": {
      name: "text-field.color.error",
      cssVar: "--fsds-text-field-color-error",
      ref: "semantic.color.foreground.danger",
      fallback: "#d9292b",
    },
    "text-field.color.supporting.text": {
      name: "text-field.color.supporting.text",
      cssVar: "--fsds-text-field-color-supporting-text",
      ref: "semantic.color.foreground.tertiary",
      fallback: "#717171",
    },
    "text-field.typography.label.size": {
      name: "text-field.typography.label.size",
      cssVar: "--fsds-text-field-typography-label-size",
      ref: "semantic.typography.caption.01",
      fallback: 14,
    },
    "text-field.typography.label.weight": {
      name: "text-field.typography.label.weight",
      cssVar: "--fsds-text-field-typography-label-weight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "text-field.typography.label.line-height": {
      name: "text-field.typography.label.line-height",
      cssVar: "--fsds-text-field-typography-label-line-height",
      ref: "semantic.typography.line.height.normal",
      fallback: "1.5",
    },
    "text-field.typography.field.size": {
      name: "text-field.typography.field.size",
      cssVar: "--fsds-text-field-typography-field-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "text-field.typography.field.line-height": {
      name: "text-field.typography.field.line-height",
      cssVar: "--fsds-text-field-typography-field-line-height",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
    "text-field.typography.supporting.size": {
      name: "text-field.typography.supporting.size",
      cssVar: "--fsds-text-field-typography-supporting-size",
      ref: "semantic.typography.caption.01",
      fallback: 14,
    },
    "text-field.typography.supporting.line-height": {
      name: "text-field.typography.supporting.line-height",
      cssVar: "--fsds-text-field-typography-supporting-line-height",
      ref: "semantic.typography.line.height.normal",
      fallback: "1.5",
    },
    "text-field.opacity.disabled": {
      name: "text-field.opacity.disabled",
      cssVar: "--fsds-text-field-opacity-disabled",
      ref: "semantic.interaction.disabled.opacity",
      fallback: "0.5",
    },
    "text-field.focus.ring.width": {
      name: "text-field.focus.ring.width",
      cssVar: "--fsds-text-field-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "text-field.focus.ring.color": {
      name: "text-field.focus.ring.color",
      cssVar: "--fsds-text-field-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "text-field.focus.ring.style": {
      name: "text-field.focus.ring.style",
      cssVar: "--fsds-text-field-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "text-field.focus.ring.offset": {
      name: "text-field.focus.ring.offset",
      cssVar: "--fsds-text-field-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
    "text-field.motion.duration.fast": {
      name: "text-field.motion.duration.fast",
      cssVar: "--fsds-text-field-motion-duration-fast",
      ref: "core.motion.duration.short",
      fallback: 150,
    },
    "text-field.motion.easing.standard": {
      name: "text-field.motion.easing.standard",
      cssVar: "--fsds-text-field-motion-easing-standard",
      ref: "core.motion.easing.standard",
      fallback: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTextFieldTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(textFieldTokenScopes, theme);
}
// @generated:end
