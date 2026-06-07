// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const breadcrumbsTokenScopes = {
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
    "breadcrumbs.color.foreground.primary": {
      name: "breadcrumbs.color.foreground.primary",
      cssVar: "--fsds-breadcrumbs-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "breadcrumbs.color.background.elevated": {
      name: "breadcrumbs.color.background.elevated",
      cssVar: "--fsds-breadcrumbs-color-background-elevated",
      ref: "semantic.color.background.elevated",
      fallback: "#ffffff",
    },
    "breadcrumbs.color.border.subtle": {
      name: "breadcrumbs.color.border.subtle",
      cssVar: "--fsds-breadcrumbs-color-border-subtle",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "breadcrumbs.typography.lineHeight.collapse": {
      name: "breadcrumbs.typography.lineHeight.collapse",
      cssVar: "--fsds-breadcrumbs-typography-lineHeight-collapse",
      ref: "semantic.typography.line.height.collapse",
      fallback: "1",
    },
    "breadcrumbs.shape.radius.medium": {
      name: "breadcrumbs.shape.radius.medium",
      cssVar: "--fsds-breadcrumbs-shape-radius-medium",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "breadcrumbs.spacing.gap.default": {
      name: "breadcrumbs.spacing.gap.default",
      cssVar: "--fsds-breadcrumbs-spacing-gap-default",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "breadcrumbs.spacing.padding.default": {
      name: "breadcrumbs.spacing.padding.default",
      cssVar: "--fsds-breadcrumbs-spacing-padding-default",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "breadcrumbs.color.focus": {
      name: "breadcrumbs.color.focus",
      cssVar: "--fsds-breadcrumbs-color-focus",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveBreadcrumbsTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(breadcrumbsTokenScopes, theme);
}
// @generated:end
