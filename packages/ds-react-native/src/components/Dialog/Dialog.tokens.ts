// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const dialogTokenScopes = {
  "root": {
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
      fallback: 8,
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      ref: "semantic.surface.size.min-width",
      fallback: 64,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: 0,
    },
    "dialog.color.background.default": {
      name: "dialog.color.background.default",
      cssVar: "--fsds-dialog-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "dialog.color.border.default": {
      name: "dialog.color.border.default",
      cssVar: "--fsds-dialog-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "dialog.size.radius.default": {
      name: "dialog.size.radius.default",
      cssVar: "--fsds-dialog-size-radius-default",
      ref: "semantic.shape.radius.large",
      fallback: 16,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveDialogTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(dialogTokenScopes, theme);
}
// @generated:end
