// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const spinnerTokenScopes = {
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
    "spinner.size.xs": {
      name: "spinner.size.xs",
      cssVar: "--fsds-spinner-size-xs",
      ref: "semantic.glyph.size.small.extent",
      fallback: 12,
    },
    "spinner.size.sm": {
      name: "spinner.size.sm",
      cssVar: "--fsds-spinner-size-sm",
      ref: "core.icon.size.sm",
      fallback: 16,
    },
    "spinner.size.md": {
      name: "spinner.size.md",
      cssVar: "--fsds-spinner-size-md",
      ref: "core.icon.size.md",
      fallback: 20,
    },
    "spinner.size.lg": {
      name: "spinner.size.lg",
      cssVar: "--fsds-spinner-size-lg",
      ref: "core.icon.size.lg",
      fallback: 24,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSpinnerTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(spinnerTokenScopes, theme);
}
// @generated:end
