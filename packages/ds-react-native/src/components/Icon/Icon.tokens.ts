// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const iconTokenScopes = {
  "root": {
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
  },
} satisfies ComponentTokenScopes;

export function resolveIconTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(iconTokenScopes, theme);
}
// @generated:end
