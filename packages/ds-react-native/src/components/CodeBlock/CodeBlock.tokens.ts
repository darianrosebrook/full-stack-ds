// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const codeBlockTokenScopes = {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      literal: 0,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: 0,
    },
    "code-block.color.background.default": {
      name: "code-block.color.background.default",
      cssVar: "--fsds-code-block-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#f7f7f7",
    },
    "code-block.color.foreground.primary": {
      name: "code-block.color.foreground.primary",
      cssVar: "--fsds-code-block-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "code-block.color.border.default": {
      name: "code-block.color.border.default",
      cssVar: "--fsds-code-block-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "code-block.size.radius.default": {
      name: "code-block.size.radius.default",
      cssVar: "--fsds-code-block-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "code-block.size.border.default": {
      name: "code-block.size.border.default",
      cssVar: "--fsds-code-block-size-border-default",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "code-block.size.fontSize.default": {
      name: "code-block.size.fontSize.default",
      cssVar: "--fsds-code-block-size-font-size-default",
      ref: "core.typography.ramp.3",
      fallback: 14,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCodeBlockTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(codeBlockTokenScopes, theme);
}
// @generated:end
