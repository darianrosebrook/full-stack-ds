// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const chipTokenScopes = {
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
    "chip.color.background.default": {
      name: "chip.color.background.default",
      cssVar: "--fsds-chip-color-background-default",
      ref: "semantic.color.action.background.secondary.default",
      fallback: "#fafafa",
    },
    "chip.color.foreground.default": {
      name: "chip.color.foreground.default",
      cssVar: "--fsds-chip-color-foreground-default",
      ref: "semantic.color.action.foreground.secondary.default",
      fallback: "#141414",
    },
    "chip.color.border.default": {
      name: "chip.color.border.default",
      cssVar: "--fsds-chip-color-border-default",
      ref: "semantic.color.action.border.secondary.default",
      fallback: "#a0a0a1",
    },
    "chip.size.radius": {
      name: "chip.size.radius",
      cssVar: "--fsds-chip-size-radius",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "chip.size.border": {
      name: "chip.size.border",
      cssVar: "--fsds-chip-size-border",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "chip.text.size": {
      name: "chip.text.size",
      cssVar: "--fsds-chip-text-size",
      ref: "semantic.typography.body.04",
      fallback: 12,
    },
    "chip.text.weight": {
      name: "chip.text.weight",
      cssVar: "--fsds-chip-text-weight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "chip.color.background.selected": {
      name: "chip.color.background.selected",
      cssVar: "--fsds-chip-color-background-selected",
      ref: "semantic.color.background.info.subtle",
      fallback: "#95dafb",
    },
    "chip.color.foreground.selected": {
      name: "chip.color.foreground.selected",
      cssVar: "--fsds-chip-color-foreground-selected",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#013ab0",
    },
    "chip.color.border.selected": {
      name: "chip.color.border.selected",
      cssVar: "--fsds-chip-color-border-selected",
      ref: "semantic.color.border.info",
      fallback: "#034fd6",
    },
  },
  "variant_selected": {
    "chip.color.background.default": {
      name: "chip.color.background.default",
      cssVar: "--fsds-chip-color-background-default",
      ref: "chip.color.background.selected",
      fallback: "#95dafb",
    },
    "chip.color.foreground.default": {
      name: "chip.color.foreground.default",
      cssVar: "--fsds-chip-color-foreground-default",
      ref: "chip.color.foreground.selected",
      fallback: "#013ab0",
    },
    "chip.color.border.default": {
      name: "chip.color.border.default",
      cssVar: "--fsds-chip-color-border-default",
      ref: "chip.color.border.selected",
      fallback: "#034fd6",
    },
  },
  "variant_small": {
    "chip.text.size": {
      name: "chip.text.size",
      cssVar: "--fsds-chip-text-size",
      ref: "semantic.glyph.badge.size.sm.fontSize",
      fallback: 10,
    },
    "chip.size.gap": {
      name: "chip.size.gap",
      cssVar: "--fsds-chip-size-gap",
      ref: "semantic.glyph.badge.size.sm.gap",
      fallback: 2,
    },
    "chip.size.minHeight": {
      name: "chip.size.minHeight",
      cssVar: "--fsds-chip-size-min-height",
      ref: "semantic.glyph.badge.size.sm.minHeight",
      fallback: 16,
    },
  },
  "variant_medium": {
    "chip.text.size": {
      name: "chip.text.size",
      cssVar: "--fsds-chip-text-size",
      ref: "semantic.glyph.badge.size.md.fontSize",
      fallback: 12,
    },
    "chip.size.gap": {
      name: "chip.size.gap",
      cssVar: "--fsds-chip-size-gap",
      ref: "semantic.glyph.badge.size.md.gap",
      fallback: 4,
    },
    "chip.size.minHeight": {
      name: "chip.size.minHeight",
      cssVar: "--fsds-chip-size-min-height",
      ref: "semantic.glyph.badge.size.md.minHeight",
      fallback: 24,
    },
  },
  "variant_large": {
    "chip.text.size": {
      name: "chip.text.size",
      cssVar: "--fsds-chip-text-size",
      ref: "semantic.glyph.badge.size.lg.fontSize",
      fallback: 14,
    },
    "chip.size.gap": {
      name: "chip.size.gap",
      cssVar: "--fsds-chip-size-gap",
      ref: "semantic.glyph.badge.size.lg.gap",
      fallback: 4,
    },
    "chip.size.minHeight": {
      name: "chip.size.minHeight",
      cssVar: "--fsds-chip-size-min-height",
      ref: "semantic.glyph.badge.size.lg.minHeight",
      fallback: 32,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveChipTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(chipTokenScopes, theme);
}
// @generated:end
