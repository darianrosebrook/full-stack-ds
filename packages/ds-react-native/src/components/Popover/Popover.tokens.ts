// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const popoverTokenScopes = {
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
    "popover.size.padding.default": {
      name: "popover.size.padding.default",
      cssVar: "--fsds-popover-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "popover.size.radius.default": {
      name: "popover.size.radius.default",
      cssVar: "--fsds-popover-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "popover.size.gap.default": {
      name: "popover.size.gap.default",
      cssVar: "--fsds-popover-size-gap-default",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "popover.color.background.content": {
      name: "popover.color.background.content",
      cssVar: "--fsds-popover-color-background-content",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "popover.color.border.accent": {
      name: "popover.color.border.accent",
      cssVar: "--fsds-popover-color-border-accent",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "popover.elevation.default": {
      name: "popover.elevation.default",
      cssVar: "--fsds-popover-elevation-default",
      ref: "semantic.elevation.default",
      fallback: "0 2px 8px rgba(0,0,0,0.12)",
    },
    "popover.layer.content": {
      name: "popover.layer.content",
      cssVar: "--fsds-popover-layer-content",
      ref: "core.layer.dropdown",
      fallback: "1000",
    },
  },
} satisfies ComponentTokenScopes;

export function resolvePopoverTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(popoverTokenScopes, theme);
}
// @generated:end
