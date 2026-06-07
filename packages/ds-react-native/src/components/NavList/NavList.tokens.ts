// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const navListTokenScopes = {
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
    "nav-list.color.foreground.default": {
      name: "nav-list.color.foreground.default",
      cssVar: "--fsds-nav-list-color-foreground-default",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "nav-list.color.foreground.hover": {
      name: "nav-list.color.foreground.hover",
      cssVar: "--fsds-nav-list-color-foreground-hover",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "nav-list.color.foreground.current": {
      name: "nav-list.color.foreground.current",
      cssVar: "--fsds-nav-list-color-foreground-current",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "nav-list.color.background.default": {
      name: "nav-list.color.background.default",
      cssVar: "--fsds-nav-list-color-background-default",
      ref: "semantic.color.background.transparent",
      fallback: "transparent",
    },
    "nav-list.color.background.hover": {
      name: "nav-list.color.background.hover",
      cssVar: "--fsds-nav-list-color-background-hover",
      ref: "semantic.color.background.subtle",
      fallback: "#f5f5f5",
    },
    "nav-list.color.background.current": {
      name: "nav-list.color.background.current",
      cssVar: "--fsds-nav-list-color-background-current",
      ref: "semantic.color.background.accentSubtle",
      fallback: "#fceaea",
    },
    "nav-list.color.outline.focus": {
      name: "nav-list.color.outline.focus",
      cssVar: "--fsds-nav-list-color-outline-focus",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "nav-list.size.padding.block": {
      name: "nav-list.size.padding.block",
      cssVar: "--fsds-nav-list-size-padding-block",
      ref: "core.spacing.size.02",
      fallback: 4,
    },
    "nav-list.size.padding.inline": {
      name: "nav-list.size.padding.inline",
      cssVar: "--fsds-nav-list-size-padding-inline",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "nav-list.size.radius.default": {
      name: "nav-list.size.radius.default",
      cssVar: "--fsds-nav-list-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "nav-list.size.gap.list": {
      name: "nav-list.size.gap.list",
      cssVar: "--fsds-nav-list-size-gap-list",
      ref: "core.spacing.size.01",
      fallback: 2,
    },
    "nav-list.size.gap.group": {
      name: "nav-list.size.gap.group",
      cssVar: "--fsds-nav-list-size-gap-group",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "nav-list.size.fontSize.item": {
      name: "nav-list.size.fontSize.item",
      cssVar: "--fsds-nav-list-size-fontSize-item",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "nav-list.size.fontSize.groupLabel": {
      name: "nav-list.size.fontSize.groupLabel",
      cssVar: "--fsds-nav-list-size-fontSize-groupLabel",
      ref: "semantic.typography.caption.03",
      fallback: 11,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveNavListTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(navListTokenScopes, theme);
}
// @generated:end
