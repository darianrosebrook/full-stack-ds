// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const sheetTokenScopes = {
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
      ref: "semantic.surface.size.gap",
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
      ref: "semantic.surface.size.min-width",
      fallback: 64,
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
    "sheet.color.overlay": {
      name: "sheet.color.overlay",
      cssVar: "--fsds-sheet-color-overlay",
      ref: "semantic.overlay.scrim.medium",
      fallback: "rgba(0,0,0,0.40)",
    },
    "sheet.color.background": {
      name: "sheet.color.background",
      cssVar: "--fsds-sheet-color-background",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "sheet.color.border": {
      name: "sheet.color.border",
      cssVar: "--fsds-sheet-color-border",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "sheet.color.text": {
      name: "sheet.color.text",
      cssVar: "--fsds-sheet-color-text",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "sheet.color.textTitle": {
      name: "sheet.color.textTitle",
      cssVar: "--fsds-sheet-color-textTitle",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "sheet.color.textDescription": {
      name: "sheet.color.textDescription",
      cssVar: "--fsds-sheet-color-textDescription",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "sheet.border.width": {
      name: "sheet.border.width",
      cssVar: "--fsds-sheet-border-width",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "sheet.border.radius": {
      name: "sheet.border.radius",
      cssVar: "--fsds-sheet-border-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "sheet.size.width": {
      name: "sheet.size.width",
      cssVar: "--fsds-sheet-size-width",
      literal: 400,
    },
    "sheet.size.height": {
      name: "sheet.size.height",
      cssVar: "--fsds-sheet-size-height",
      literal: 300,
    },
    "sheet.size.close": {
      name: "sheet.size.close",
      cssVar: "--fsds-sheet-size-close",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "sheet.spacing.padding": {
      name: "sheet.spacing.padding",
      cssVar: "--fsds-sheet-spacing-padding",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "sheet.spacing.gap": {
      name: "sheet.spacing.gap",
      cssVar: "--fsds-sheet-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "sheet.text.size": {
      name: "sheet.text.size",
      cssVar: "--fsds-sheet-text-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "sheet.text.sizeTitle": {
      name: "sheet.text.sizeTitle",
      cssVar: "--fsds-sheet-text-sizeTitle",
      ref: "semantic.typography.heading.06",
      fallback: 14,
    },
    "sheet.text.weightTitle": {
      name: "sheet.text.weightTitle",
      cssVar: "--fsds-sheet-text-weightTitle",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "sheet.shadow": {
      name: "sheet.shadow",
      cssVar: "--fsds-sheet-shadow",
      ref: "semantic.elevation.surface.floating",
      fallback: "0 4px 24px rgba(0,0,0,0.12)",
    },
    "sheet.focus.width": {
      name: "sheet.focus.width",
      cssVar: "--fsds-sheet-focus-width",
      ref: "semantic.shape.control.border.focusWidth",
      fallback: 2,
    },
    "sheet.focus.color": {
      name: "sheet.focus.color",
      cssVar: "--fsds-sheet-focus-color",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "sheet.color.backgroundHover": {
      name: "sheet.color.backgroundHover",
      cssVar: "--fsds-sheet-color-backgroundHover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSheetTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(sheetTokenScopes, theme);
}
// @generated:end
