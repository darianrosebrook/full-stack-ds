// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const spinnerTokenScopes = {
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
    "spinner.thickness.hairline": {
      name: "spinner.thickness.hairline",
      cssVar: "--fsds-spinner-thickness-hairline",
      literal: 2,
    },
    "spinner.thickness.regular": {
      name: "spinner.thickness.regular",
      cssVar: "--fsds-spinner-thickness-regular",
      literal: 3,
    },
    "spinner.thickness.bold": {
      name: "spinner.thickness.bold",
      cssVar: "--fsds-spinner-thickness-bold",
      literal: 4,
    },
    "spinner.color.accent": {
      name: "spinner.color.accent",
      cssVar: "--fsds-spinner-color-accent",
      ref: "semantic.color.background.accent",
      fallback: "#d9292b",
    },
    "spinner.color.track": {
      name: "spinner.color.track",
      cssVar: "--fsds-spinner-color-track",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "spinner.anim.duration": {
      name: "spinner.anim.duration",
      cssVar: "--fsds-spinner-anim-duration",
      literal: 800,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSpinnerTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(spinnerTokenScopes, theme);
}
// @generated:end
