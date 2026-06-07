// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const accordionTokenScopes = {
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
    "accordion.color.background.hover": {
      name: "accordion.color.background.hover",
      cssVar: "--fsds-accordion-color-background-hover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
    "accordion.color.text": {
      name: "accordion.color.text",
      cssVar: "--fsds-accordion-color-text",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "accordion.color.textSecondary": {
      name: "accordion.color.textSecondary",
      cssVar: "--fsds-accordion-color-textSecondary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "accordion.color.icon": {
      name: "accordion.color.icon",
      cssVar: "--fsds-accordion-color-icon",
      ref: "semantic.color.foreground.tertiary",
      fallback: "#717171",
    },
    "accordion.border.width": {
      name: "accordion.border.width",
      cssVar: "--fsds-accordion-border-width",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "accordion.border.color": {
      name: "accordion.border.color",
      cssVar: "--fsds-accordion-border-color",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "accordion.border.radius": {
      name: "accordion.border.radius",
      cssVar: "--fsds-accordion-border-radius",
      ref: "core.shape.radius.small",
      fallback: 4,
    },
    "accordion.spacing.gap": {
      name: "accordion.spacing.gap",
      cssVar: "--fsds-accordion-spacing-gap",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "accordion.spacing.paddingX": {
      name: "accordion.spacing.paddingX",
      cssVar: "--fsds-accordion-spacing-paddingX",
      ref: "core.spacing.size.00",
      fallback: 0,
    },
    "accordion.spacing.paddingY": {
      name: "accordion.spacing.paddingY",
      cssVar: "--fsds-accordion-spacing-paddingY",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "accordion.text.weight": {
      name: "accordion.text.weight",
      cssVar: "--fsds-accordion-text-weight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "accordion.text.size": {
      name: "accordion.text.size",
      cssVar: "--fsds-accordion-text-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "accordion.text.lineHeight": {
      name: "accordion.text.lineHeight",
      cssVar: "--fsds-accordion-text-lineHeight",
      ref: "semantic.typography.line.height.normal",
      fallback: "1.5",
    },
    "accordion.text.sizeContent": {
      name: "accordion.text.sizeContent",
      cssVar: "--fsds-accordion-text-sizeContent",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "accordion.text.lineHeightContent": {
      name: "accordion.text.lineHeightContent",
      cssVar: "--fsds-accordion-text-lineHeightContent",
      ref: "semantic.typography.line.height.loose",
      fallback: "1.8",
    },
    "accordion.icon.size": {
      name: "accordion.icon.size",
      cssVar: "--fsds-accordion-icon-size",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "accordion.focus.width": {
      name: "accordion.focus.width",
      cssVar: "--fsds-accordion-focus-width",
      ref: "core.shape.border.width.thick",
      fallback: 2,
    },
    "accordion.focus.color": {
      name: "accordion.focus.color",
      cssVar: "--fsds-accordion-focus-color",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "accordion.focus.offset": {
      name: "accordion.focus.offset",
      cssVar: "--fsds-accordion-focus-offset",
      ref: "core.spacing.size.01",
      fallback: 1,
    },
    "accordion.opacity.disabled": {
      name: "accordion.opacity.disabled",
      cssVar: "--fsds-accordion-opacity-disabled",
      ref: "semantic.interaction.disabled.opacity",
      fallback: "0.5",
    },
    "accordion.color.textHover": {
      name: "accordion.color.textHover",
      cssVar: "--fsds-accordion-color-textHover",
      ref: "semantic.interaction.text.hover",
      fallback: "#555555",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveAccordionTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(accordionTokenScopes, theme);
}
// @generated:end
