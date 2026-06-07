// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const statusTokenScopes = {
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
      ref: "semantic.feedback.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.feedback.size.padding-block",
      fallback: 16,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: "0",
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.feedback.size.padding-inline",
      fallback: 16,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.feedback.size.padding-inline",
      fallback: 16,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.feedback.size.gap",
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
    "status.color.background.default": {
      name: "status.color.background.default",
      cssVar: "--fsds-status-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "status.color.foreground.primary": {
      name: "status.color.foreground.primary",
      cssVar: "--fsds-status-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "status.color.border.default": {
      name: "status.color.border.default",
      cssVar: "--fsds-status-color-border-default",
      ref: "semantic.color.border.primary",
      fallback: "#f29495",
    },
    "status.size.radius.default": {
      name: "status.size.radius.default",
      cssVar: "--fsds-status-size-radius-default",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
    "status.size.padding.default": {
      name: "status.size.padding.default",
      cssVar: "--fsds-status-size-padding-default",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "status.size.border.default": {
      name: "status.size.border.default",
      cssVar: "--fsds-status-size-border-default",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "status.typography.lineHeight": {
      name: "status.typography.lineHeight",
      cssVar: "--fsds-status-typography-lineHeight",
      ref: "semantic.typography.line.height.collapse",
      fallback: "1",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveStatusTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(statusTokenScopes, theme);
}
// @generated:end
