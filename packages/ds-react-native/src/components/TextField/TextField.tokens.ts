// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const textFieldTokenScopes = {
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
    "text-field.spacing.gap": {
      name: "text-field.spacing.gap",
      cssVar: "--fsds-text-field-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
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
  },
} satisfies ComponentTokenScopes;

export function resolveTextFieldTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(textFieldTokenScopes, theme);
}
// @generated:end
