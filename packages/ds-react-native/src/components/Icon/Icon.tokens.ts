// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const iconTokenScopes = {
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
      literal: 0,
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      ref: "semantic.glyph.size.medium.extent",
      fallback: 16,
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
      ref: "semantic.glyph.size.medium.extent",
      fallback: 16,
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
    "icon.size.sm": {
      name: "icon.size.sm",
      cssVar: "--fsds-icon-size-sm",
      ref: "core.icon.size.sm",
      fallback: 16,
    },
    "icon.size.md": {
      name: "icon.size.md",
      cssVar: "--fsds-icon-size-md",
      ref: "core.icon.size.md",
      fallback: 20,
    },
    "icon.size.lg": {
      name: "icon.size.lg",
      cssVar: "--fsds-icon-size-lg",
      ref: "core.icon.size.lg",
      fallback: 24,
    },
    "icon.size.xl": {
      name: "icon.size.xl",
      cssVar: "--fsds-icon-size-xl",
      ref: "core.icon.size.xl",
      fallback: 32,
    },
    "icon.color.foreground.default": {
      name: "icon.color.foreground.default",
      cssVar: "--fsds-icon-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveIconTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(iconTokenScopes, theme);
}
// @generated:end
