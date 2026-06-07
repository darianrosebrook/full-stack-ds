// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const selectTokenScopes = {
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
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-inline": {
      name: "box-model.padding-inline",
      cssVar: "--fsds-box-model-padding-inline",
      literal: 0,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.input.size.medium.gap",
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
      ref: "semantic.input.size.medium.min-height",
      fallback: 36,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "select.color.background.default": {
      name: "select.color.background.default",
      cssVar: "--fsds-select-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "select.color.foreground.default": {
      name: "select.color.foreground.default",
      cssVar: "--fsds-select-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "select.color.border.default": {
      name: "select.color.border.default",
      cssVar: "--fsds-select-color-border-default",
      ref: "semantic.color.border.primary",
      fallback: "#f29495",
    },
    "select.color.icon.default": {
      name: "select.color.icon.default",
      cssVar: "--fsds-select-color-icon-default",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "select.color.placeholder.default": {
      name: "select.color.placeholder.default",
      cssVar: "--fsds-select-color-placeholder-default",
      ref: "semantic.color.foreground.placeholder",
      fallback: "#8f8f8f",
    },
    "select.size.padding.default": {
      name: "select.size.padding.default",
      cssVar: "--fsds-select-size-padding-default",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "select.size.radius.default": {
      name: "select.size.radius.default",
      cssVar: "--fsds-select-size-radius-default",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "select.size.border.default": {
      name: "select.size.border.default",
      cssVar: "--fsds-select-size-border-default",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "select.size.sm.height": {
      name: "select.size.sm.height",
      cssVar: "--fsds-select-size-sm-height",
      ref: "semantic.control.size.sm.height",
      fallback: 24,
    },
    "select.size.md.height": {
      name: "select.size.md.height",
      cssVar: "--fsds-select-size-md-height",
      ref: "semantic.control.size.md.height",
      fallback: 32,
    },
    "select.size.lg.height": {
      name: "select.size.lg.height",
      cssVar: "--fsds-select-size-lg-height",
      ref: "semantic.control.size.lg.height",
      fallback: 48,
    },
    "select.font.size.default": {
      name: "select.font.size.default",
      cssVar: "--fsds-select-font-size-default",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "select.font.lineHeight.default": {
      name: "select.font.lineHeight.default",
      cssVar: "--fsds-select-font-lineHeight-default",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
    "select.color.icon.isOpen": {
      name: "select.color.icon.isOpen",
      cssVar: "--fsds-select-color-icon-isOpen",
      ref: "semantic.color.foreground.accent",
      fallback: "#d9292b",
    },
    "select.focus.ring.width": {
      name: "select.focus.ring.width",
      cssVar: "--fsds-select-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "select.focus.ring.color": {
      name: "select.focus.ring.color",
      cssVar: "--fsds-select-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "select.focus.ring.style": {
      name: "select.focus.ring.style",
      cssVar: "--fsds-select-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "select.focus.ring.offset": {
      name: "select.focus.ring.offset",
      cssVar: "--fsds-select-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
  "focus": {
    "select.color.border.default": {
      name: "select.color.border.default",
      cssVar: "--fsds-select-color-border-default",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
  },
  "hover": {
    "select.color.border.default": {
      name: "select.color.border.default",
      cssVar: "--fsds-select-color-border-default",
      ref: "semantic.color.border.bold",
      fallback: "#8f8f8f",
    },
    "select.color.background.default": {
      name: "select.color.background.default",
      cssVar: "--fsds-select-color-background-default",
      ref: "semantic.color.background.hover",
      fallback: "#cecece",
    },
    "select.color.foreground.default": {
      name: "select.color.foreground.default",
      cssVar: "--fsds-select-color-foreground-default",
      ref: "semantic.color.foreground.hover",
      fallback: "#3a3a3a",
    },
  },
  "variant_open": {
    "select.color.border.default": {
      name: "select.color.border.default",
      cssVar: "--fsds-select-color-border-default",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
  },
  "variant_disabled": {
    "select.color.background.default": {
      name: "select.color.background.default",
      cssVar: "--fsds-select-color-background-default",
      ref: "semantic.color.background.disabled",
      fallback: "#cecece",
    },
    "select.color.foreground.default": {
      name: "select.color.foreground.default",
      cssVar: "--fsds-select-color-foreground-default",
      ref: "semantic.color.foreground.disabled",
      fallback: "#aeaeae",
    },
    "select.color.border.default": {
      name: "select.color.border.default",
      cssVar: "--fsds-select-color-border-default",
      ref: "semantic.color.border.disabled",
      fallback: "#cecece",
    },
  },
  "part_option": {
    "select.color.background.default": {
      name: "select.color.background.default",
      cssVar: "--fsds-select-color-background-default",
      ref: "semantic.color.background.highlight",
      fallback: "#f7c1c2",
    },
    "select.color.foreground.default": {
      name: "select.color.foreground.default",
      cssVar: "--fsds-select-color-foreground-default",
      ref: "semantic.color.foreground.accent",
      fallback: "#d9292b",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSelectTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(selectTokenScopes, theme);
}
// @generated:end
