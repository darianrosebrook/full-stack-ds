// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const fieldTokenScopes = {
  "root": {
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      ref: "semantic.input.size.medium.padding-block",
      fallback: 4,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.input.size.medium.padding-block",
      fallback: 4,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 8,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 8,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.input.size.medium.gap",
      fallback: 8,
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      literal: 0,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      ref: "semantic.input.size.medium.min-height",
      fallback: 32,
    },
    "field.gap.meta": {
      name: "field.gap.meta",
      cssVar: "--fsds-field-gap-meta",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "field.radius": {
      name: "field.radius",
      cssVar: "--fsds-field-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "field.color.bg": {
      name: "field.color.bg",
      cssVar: "--fsds-field-color-bg",
      ref: "semantic.color.background.elevated",
      fallback: "#ffffff",
    },
    "field.color.fg": {
      name: "field.color.fg",
      cssVar: "--fsds-field-color-fg",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "field.color.border": {
      name: "field.color.border",
      cssVar: "--fsds-field-color-border",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "field.color.invalid-text": {
      name: "field.color.invalid-text",
      cssVar: "--fsds-field-color-invalid-text",
      ref: "semantic.color.foreground.danger",
      fallback: "#d92d2e",
    },
    "field.label.color": {
      name: "field.label.color",
      cssVar: "--fsds-field-label-color",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveFieldTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(fieldTokenScopes, theme);
}
// @generated:end
