// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const tooltipTokenScopes = {
  "root": {
    "box-model.padding": {
      name: "box-model.padding",
      cssVar: "--fsds-box-model-padding",
      literal: "0",
    },
    "box-model.padding-block": {
      name: "box-model.padding-block",
      cssVar: "--fsds-box-model-padding-block",
      literal: "0",
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
      literal: "0",
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
      literal: "0",
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "tooltip.color.background.default": {
      name: "tooltip.color.background.default",
      cssVar: "--fsds-tooltip-color-background-default",
      ref: "semantic.color.background.inverse",
      fallback: "#141414",
    },
    "tooltip.color.foreground.default": {
      name: "tooltip.color.foreground.default",
      cssVar: "--fsds-tooltip-color-foreground-default",
      ref: "semantic.color.foreground.inverse",
      fallback: "#fafafa",
    },
    "tooltip.color.border.default": {
      name: "tooltip.color.border.default",
      cssVar: "--fsds-tooltip-color-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "tooltip.size.padding.y": {
      name: "tooltip.size.padding.y",
      cssVar: "--fsds-tooltip-size-padding-y",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "tooltip.size.padding.x": {
      name: "tooltip.size.padding.x",
      cssVar: "--fsds-tooltip-size-padding-x",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "tooltip.size.radius.default": {
      name: "tooltip.size.radius.default",
      cssVar: "--fsds-tooltip-size-radius-default",
      ref: "core.shape.radius.small",
      fallback: 4,
    },
    "tooltip.size.maxWidth": {
      name: "tooltip.size.maxWidth",
      cssVar: "--fsds-tooltip-size-maxWidth",
      literal: 200,
    },
    "tooltip.typography.fontSize": {
      name: "tooltip.typography.fontSize",
      cssVar: "--fsds-tooltip-typography-fontSize",
      ref: "semantic.typography.caption.01",
      fallback: 14,
    },
    "tooltip.layer.content": {
      name: "tooltip.layer.content",
      cssVar: "--fsds-tooltip-layer-content",
      ref: "core.layer.tooltip",
      fallback: "1800",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTooltipTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(tooltipTokenScopes, theme);
}
// @generated:end
