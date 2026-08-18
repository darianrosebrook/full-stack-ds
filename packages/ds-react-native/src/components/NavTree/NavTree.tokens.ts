// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const navTreeTokenScopes = {
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
    "nav-tree.color.foreground.default": {
      name: "nav-tree.color.foreground.default",
      cssVar: "--fsds-nav-tree-color-foreground-default",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "nav-tree.color.foreground.hover": {
      name: "nav-tree.color.foreground.hover",
      cssVar: "--fsds-nav-tree-color-foreground-hover",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "nav-tree.color.foreground.current": {
      name: "nav-tree.color.foreground.current",
      cssVar: "--fsds-nav-tree-color-foreground-current",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "nav-tree.color.foreground.heading": {
      name: "nav-tree.color.foreground.heading",
      cssVar: "--fsds-nav-tree-color-foreground-heading",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
    "nav-tree.color.foreground.headingHover": {
      name: "nav-tree.color.foreground.headingHover",
      cssVar: "--fsds-nav-tree-color-foreground-heading-hover",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "nav-tree.color.connector": {
      name: "nav-tree.color.connector",
      cssVar: "--fsds-nav-tree-color-connector",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
    "nav-tree.color.outline.focus": {
      name: "nav-tree.color.outline.focus",
      cssVar: "--fsds-nav-tree-color-outline-focus",
      ref: "semantic.color.border.accent",
      fallback: "#d92d2e",
    },
    "nav-tree.size.indent": {
      name: "nav-tree.size.indent",
      cssVar: "--fsds-nav-tree-size-indent",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "nav-tree.size.margin.group": {
      name: "nav-tree.size.margin.group",
      cssVar: "--fsds-nav-tree-size-margin-group",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "nav-tree.size.padding.block": {
      name: "nav-tree.size.padding.block",
      cssVar: "--fsds-nav-tree-size-padding-block",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "nav-tree.size.padding.inline": {
      name: "nav-tree.size.padding.inline",
      cssVar: "--fsds-nav-tree-size-padding-inline",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "nav-tree.size.fontSize.heading": {
      name: "nav-tree.size.fontSize.heading",
      cssVar: "--fsds-nav-tree-size-font-size-heading",
      ref: "semantic.typography.caption.03",
      fallback: 10,
    },
    "nav-tree.size.fontSize.item": {
      name: "nav-tree.size.fontSize.item",
      cssVar: "--fsds-nav-tree-size-font-size-item",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "nav-tree.size.radius.default": {
      name: "nav-tree.size.radius.default",
      cssVar: "--fsds-nav-tree-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 6,
    },
    "nav-tree.size.gap.heading": {
      name: "nav-tree.size.gap.heading",
      cssVar: "--fsds-nav-tree-size-gap-heading",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "nav-tree.size.gap.item": {
      name: "nav-tree.size.gap.item",
      cssVar: "--fsds-nav-tree-size-gap-item",
      ref: "core.spacing.size.01",
      fallback: 1,
    },
    "nav-tree.stateLayer.hover": {
      name: "nav-tree.stateLayer.hover",
      cssVar: "--fsds-nav-tree-state-layer-hover",
      ref: "semantic.interaction.stateLayer.hover",
      fallback: "0.04",
    },
    "nav-tree.stateLayer.selected": {
      name: "nav-tree.stateLayer.selected",
      cssVar: "--fsds-nav-tree-state-layer-selected",
      ref: "semantic.interaction.stateLayer.selected",
      fallback: "0.08",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveNavTreeTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(navTreeTokenScopes, theme);
}
// @generated:end
