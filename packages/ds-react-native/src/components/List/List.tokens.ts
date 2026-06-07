// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const listTokenScopes = {
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
    "list.color.foreground.primary": {
      name: "list.color.foreground.primary",
      cssVar: "--fsds-list-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "list.color.border.default": {
      name: "list.color.border.default",
      cssVar: "--fsds-list-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "list.size.padding.default": {
      name: "list.size.padding.default",
      cssVar: "--fsds-list-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "list.size.sm": {
      name: "list.size.sm",
      cssVar: "--fsds-list-size-sm",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "list.size.md": {
      name: "list.size.md",
      cssVar: "--fsds-list-size-md",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "list.size.lg": {
      name: "list.size.lg",
      cssVar: "--fsds-list-size-lg",
      ref: "semantic.typography.body.01",
      fallback: 18,
    },
    "list.spacing.none": {
      name: "list.spacing.none",
      cssVar: "--fsds-list-spacing-none",
      ref: "core.spacing.size.00",
      fallback: 0,
    },
    "list.spacing.sm": {
      name: "list.spacing.sm",
      cssVar: "--fsds-list-spacing-sm",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "list.spacing.md": {
      name: "list.spacing.md",
      cssVar: "--fsds-list-spacing-md",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "list.spacing.lg": {
      name: "list.spacing.lg",
      cssVar: "--fsds-list-spacing-lg",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveListTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(listTokenScopes, theme);
}
// @generated:end
