// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const codeSnippetTokenScopes = {
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
    "code-snippet.color.background.default": {
      name: "code-snippet.color.background.default",
      cssVar: "--fsds-code-snippet-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#f7f7f7",
    },
    "code-snippet.color.foreground.primary": {
      name: "code-snippet.color.foreground.primary",
      cssVar: "--fsds-code-snippet-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "code-snippet.color.border.default": {
      name: "code-snippet.color.border.default",
      cssVar: "--fsds-code-snippet-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "code-snippet.size.radius.default": {
      name: "code-snippet.size.radius.default",
      cssVar: "--fsds-code-snippet-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "code-snippet.size.border.default": {
      name: "code-snippet.size.border.default",
      cssVar: "--fsds-code-snippet-size-border-default",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "code-snippet.size.fontSize.default": {
      name: "code-snippet.size.fontSize.default",
      cssVar: "--fsds-code-snippet-size-font-size-default",
      ref: "core.typography.ramp.3",
      fallback: 14,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCodeSnippetTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(codeSnippetTokenScopes, theme);
}
// @generated:end
