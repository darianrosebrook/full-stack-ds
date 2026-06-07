// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const textTokenScopes = {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
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
      literal: 0,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "text.color.foreground.primary": {
      name: "text.color.foreground.primary",
      cssVar: "--fsds-text-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "text.typography.fontWeight.light": {
      name: "text.typography.fontWeight.light",
      cssVar: "--fsds-text-typography-fontWeight-light",
      ref: "semantic.typography.font.weight.light",
      fallback: "300",
    },
    "text.typography.fontWeight.regular": {
      name: "text.typography.fontWeight.regular",
      cssVar: "--fsds-text-typography-fontWeight-regular",
      ref: "semantic.typography.font.weight.regular",
      fallback: "400",
    },
    "text.typography.fontWeight.medium": {
      name: "text.typography.fontWeight.medium",
      cssVar: "--fsds-text-typography-fontWeight-medium",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "text.typography.fontWeight.bold": {
      name: "text.typography.fontWeight.bold",
      cssVar: "--fsds-text-typography-fontWeight-bold",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "text.typography.lineHeight.heading": {
      name: "text.typography.lineHeight.heading",
      cssVar: "--fsds-text-typography-lineHeight-heading",
      ref: "semantic.typography.line.height.heading",
      fallback: "1",
    },
    "text.typography.lineHeight.body": {
      name: "text.typography.lineHeight.body",
      cssVar: "--fsds-text-typography-lineHeight-body",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTextTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(textTokenScopes, theme);
}
// @generated:end
