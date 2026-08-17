// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const codeBlockTokenScopes = {
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
    "code-block.color.background.default": {
      name: "code-block.color.background.default",
      cssVar: "--fsds-code-block-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#d0d0d0",
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
    "code-block.size.padding.default": {
      name: "code-block.size.padding.default",
      cssVar: "--fsds-code-block-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
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
    "code-block.typography.lineHeight.default": {
      name: "code-block.typography.lineHeight.default",
      cssVar: "--fsds-code-block-typography-line-height-default",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
    "code-block.token.color.plain": {
      name: "code-block.token.color.plain",
      cssVar: "--fsds-code-block-token-color-plain",
      ref: "semantic.color.foreground.syntax.plain",
      fallback: "#141414",
    },
    "code-block.token.color.comment": {
      name: "code-block.token.color.comment",
      cssVar: "--fsds-code-block-token-color-comment",
      ref: "semantic.color.foreground.syntax.comment.color",
      fallback: "#727272",
    },
    "code-block.token.color.keyword": {
      name: "code-block.token.color.keyword",
      cssVar: "--fsds-code-block-token-color-keyword",
      ref: "semantic.color.foreground.syntax.keyword",
      fallback: "#0566fe",
    },
    "code-block.token.color.definition": {
      name: "code-block.token.color.definition",
      cssVar: "--fsds-code-block-token-color-definition",
      ref: "semantic.color.foreground.syntax.definition",
      fallback: "#d92d2e",
    },
    "code-block.token.color.punctuation": {
      name: "code-block.token.color.punctuation",
      cssVar: "--fsds-code-block-token-color-punctuation",
      ref: "semantic.color.foreground.syntax.punctuation",
      fallback: "#0566fe",
    },
    "code-block.token.color.property": {
      name: "code-block.token.color.property",
      cssVar: "--fsds-code-block-token-color-property",
      ref: "semantic.color.foreground.syntax.property",
      fallback: "#ae5d00",
    },
    "code-block.token.color.static": {
      name: "code-block.token.color.static",
      cssVar: "--fsds-code-block-token-color-static",
      ref: "semantic.color.foreground.syntax.static",
      fallback: "#d92d2e",
    },
    "code-block.token.color.string": {
      name: "code-block.token.color.string",
      cssVar: "--fsds-code-block-token-color-string",
      ref: "semantic.color.foreground.syntax.string",
      fallback: "#900909",
    },
    "code-block.token.color.tag": {
      name: "code-block.token.color.tag",
      cssVar: "--fsds-code-block-token-color-tag",
      ref: "semantic.color.foreground.syntax.tag",
      fallback: "#d92d2e",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCodeBlockTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(codeBlockTokenScopes, theme);
}
// @generated:end
