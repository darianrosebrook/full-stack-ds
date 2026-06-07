// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const truncateTokenScopes = {
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
    "truncate.color.foreground.link": {
      name: "truncate.color.foreground.link",
      cssVar: "--fsds-truncate-color-foreground-link",
      ref: "semantic.color.foreground.link",
      fallback: "#d9292b",
    },
    "truncate.color.background.primary": {
      name: "truncate.color.background.primary",
      cssVar: "--fsds-truncate-color-background-primary",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "truncate.typography.fontWeight": {
      name: "truncate.typography.fontWeight",
      cssVar: "--fsds-truncate-typography-fontWeight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "truncate.spacing.toggle": {
      name: "truncate.spacing.toggle",
      cssVar: "--fsds-truncate-spacing-toggle",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "truncate.color.foreground.linkHover": {
      name: "truncate.color.foreground.linkHover",
      cssVar: "--fsds-truncate-color-foreground-linkHover",
      ref: "semantic.color.foreground.linkHover",
      fallback: "#ae0001",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTruncateTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(truncateTokenScopes, theme);
}
// @generated:end
