// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const blockquoteTokenScopes = {
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
      ref: "semantic.surface.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.surface.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: 0,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.surface.size.padding-inline",
      fallback: 16,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.surface.size.padding-inline",
      fallback: 16,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.surface.size.gap",
      fallback: 12,
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      literal: "auto",
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      ref: "semantic.surface.size.min-width",
      fallback: 64,
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
    "blockquote.color.foreground.primary": {
      name: "blockquote.color.foreground.primary",
      cssVar: "--fsds-blockquote-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "blockquote.color.background.default": {
      name: "blockquote.color.background.default",
      cssVar: "--fsds-blockquote-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "blockquote.color.border.default": {
      name: "blockquote.color.border.default",
      cssVar: "--fsds-blockquote-color-border-default",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "blockquote.typography.fontStyle": {
      name: "blockquote.typography.fontStyle",
      cssVar: "--fsds-blockquote-typography-fontStyle",
      ref: "semantic.typography.font.style.italic",
      fallback: "italic",
    },
    "blockquote.typography.fontWeight": {
      name: "blockquote.typography.fontWeight",
      cssVar: "--fsds-blockquote-typography-fontWeight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "blockquote.size.padding.default": {
      name: "blockquote.size.padding.default",
      cssVar: "--fsds-blockquote-size-padding-default",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "blockquote.size.radius.default": {
      name: "blockquote.size.radius.default",
      cssVar: "--fsds-blockquote-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "blockquote.size.border.thick": {
      name: "blockquote.size.border.thick",
      cssVar: "--fsds-blockquote-size-border-thick",
      ref: "core.shape.border.width.thick",
      fallback: 2,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveBlockquoteTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(blockquoteTokenScopes, theme);
}
// @generated:end
