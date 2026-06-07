// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const fieldTokenScopes = {
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
    "field.gap.y": {
      name: "field.gap.y",
      cssVar: "--fsds-field-gap-y",
      ref: "semantic.spacing.density.compact.sm",
      fallback: 8,
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
      fallback: 8,
    },
    "field.pad.x": {
      name: "field.pad.x",
      cssVar: "--fsds-field-pad-x",
      ref: "semantic.spacing.density.compact.md",
      fallback: 12,
    },
    "field.pad.y": {
      name: "field.pad.y",
      cssVar: "--fsds-field-pad-y",
      ref: "semantic.spacing.density.compact.sm",
      fallback: 8,
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
      fallback: "#cecece",
    },
    "field.color.borderBold": {
      name: "field.color.borderBold",
      cssVar: "--fsds-field-color-borderBold",
      ref: "semantic.color.border.bold",
      fallback: "#8f8f8f",
    },
    "field.color.focus-border": {
      name: "field.color.focus-border",
      cssVar: "--fsds-field-color-focus-border",
      ref: "semantic.color.border.focus",
      fallback: "#d9292b",
    },
    "field.color.invalid-border": {
      name: "field.color.invalid-border",
      cssVar: "--fsds-field-color-invalid-border",
      ref: "semantic.color.border.danger",
      fallback: "#ae0001",
    },
    "field.color.invalid-text": {
      name: "field.color.invalid-text",
      cssVar: "--fsds-field-color-invalid-text",
      ref: "semantic.color.foreground.danger",
      fallback: "#d9292b",
    },
    "field.color.valid-border": {
      name: "field.color.valid-border",
      cssVar: "--fsds-field-color-valid-border",
      ref: "semantic.color.feedback.border.success",
      fallback: "#336006",
    },
    "field.spacing.indicator": {
      name: "field.spacing.indicator",
      cssVar: "--fsds-field-spacing-indicator",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "field.label.fontSize": {
      name: "field.label.fontSize",
      cssVar: "--fsds-field-label-fontSize",
      ref: "semantic.typography.body.small.font.size",
      fallback: 14,
    },
    "field.label.color": {
      name: "field.label.color",
      cssVar: "--fsds-field-label-color",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "field.focus.ring.width": {
      name: "field.focus.ring.width",
      cssVar: "--fsds-field-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "field.focus.ring.color": {
      name: "field.focus.ring.color",
      cssVar: "--fsds-field-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "field.focus.ring.style": {
      name: "field.focus.ring.style",
      cssVar: "--fsds-field-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "field.focus.ring.offset": {
      name: "field.focus.ring.offset",
      cssVar: "--fsds-field-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveFieldTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(fieldTokenScopes, theme);
}
// @generated:end
