// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const tableTokenScopes = {
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
      ref: "semantic.structure.size.gap",
      fallback: 8,
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
    "table.color.text": {
      name: "table.color.text",
      cssVar: "--fsds-table-color-text",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "table.color.textMuted": {
      name: "table.color.textMuted",
      cssVar: "--fsds-table-color-textMuted",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "table.color.border": {
      name: "table.color.border",
      cssVar: "--fsds-table-color-border",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "table.color.background.footer": {
      name: "table.color.background.footer",
      cssVar: "--fsds-table-color-background-footer",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "table.border.width": {
      name: "table.border.width",
      cssVar: "--fsds-table-border-width",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "table.spacing.cellX": {
      name: "table.spacing.cellX",
      cssVar: "--fsds-table-spacing-cellX",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "table.spacing.cellY": {
      name: "table.spacing.cellY",
      cssVar: "--fsds-table-spacing-cellY",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "table.spacing.caption": {
      name: "table.spacing.caption",
      cssVar: "--fsds-table-spacing-caption",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "table.spacing.sortGap": {
      name: "table.spacing.sortGap",
      cssVar: "--fsds-table-spacing-sortGap",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "table.size.cellHeight": {
      name: "table.size.cellHeight",
      cssVar: "--fsds-table-size-cellHeight",
      ref: "semantic.control.size.md.height",
      fallback: 32,
    },
    "table.size.radius": {
      name: "table.size.radius",
      cssVar: "--fsds-table-size-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "table.text.size": {
      name: "table.text.size",
      cssVar: "--fsds-table-text-size",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "table.text.lineHeight": {
      name: "table.text.lineHeight",
      cssVar: "--fsds-table-text-lineHeight",
      ref: "semantic.typography.line.height.normal",
      fallback: "1.5",
    },
    "table.text.sizeCaption": {
      name: "table.text.sizeCaption",
      cssVar: "--fsds-table-text-sizeCaption",
      ref: "semantic.typography.body.04",
      fallback: 12,
    },
    "table.text.weightHead": {
      name: "table.text.weightHead",
      cssVar: "--fsds-table-text-weightHead",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "table.text.weightFooter": {
      name: "table.text.weightFooter",
      cssVar: "--fsds-table-text-weightFooter",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "table.color.background.hover": {
      name: "table.color.background.hover",
      cssVar: "--fsds-table-color-background-hover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
    "table.color.background.selected": {
      name: "table.color.background.selected",
      cssVar: "--fsds-table-color-background-selected",
      ref: "semantic.color.background.accent",
      fallback: "#d9292b",
    },
    "table.focus.width": {
      name: "table.focus.width",
      cssVar: "--fsds-table-focus-width",
      ref: "semantic.shape.control.border.focusWidth",
      fallback: 2,
    },
    "table.focus.color": {
      name: "table.focus.color",
      cssVar: "--fsds-table-focus-color",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "table.focus.offset": {
      name: "table.focus.offset",
      cssVar: "--fsds-table-focus-offset",
      ref: "core.spacing.size.01",
      fallback: 1,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTableTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(tableTokenScopes, theme);
}
// @generated:end
