// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const chipTokenScopes = {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
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
    "chip.color.background.default": {
      name: "chip.color.background.default",
      cssVar: "--fsds-chip-color-background-default",
      ref: "semantic.color.action.background.secondary.default",
      fallback: "#fafafa",
    },
    "chip.color.background.hover": {
      name: "chip.color.background.hover",
      cssVar: "--fsds-chip-color-background-hover",
      ref: "semantic.color.action.background.secondary.hover",
      fallback: "#efefef",
    },
    "chip.color.background.active": {
      name: "chip.color.background.active",
      cssVar: "--fsds-chip-color-background-active",
      ref: "semantic.color.action.background.secondary.active",
      fallback: "#cecece",
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
      fallback: "#aeaeae",
    },
    "chip.size.padding.horizontal": {
      name: "chip.size.padding.horizontal",
      cssVar: "--fsds-chip-size-padding-horizontal",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "chip.size.padding.vertical": {
      name: "chip.size.padding.vertical",
      cssVar: "--fsds-chip-size-padding-vertical",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "chip.size.gap": {
      name: "chip.size.gap",
      cssVar: "--fsds-chip-size-gap",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "chip.size.radius": {
      name: "chip.size.radius",
      cssVar: "--fsds-chip-size-radius",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
    "chip.size.border": {
      name: "chip.size.border",
      cssVar: "--fsds-chip-size-border",
      ref: "core.shape.border.width.hairline",
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
    "chip.motion.duration.fast": {
      name: "chip.motion.duration.fast",
      cssVar: "--fsds-chip-motion-duration-fast",
      ref: "core.motion.duration.short",
      fallback: 150,
    },
    "chip.focus.ring.width": {
      name: "chip.focus.ring.width",
      cssVar: "--fsds-chip-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "chip.focus.ring.color": {
      name: "chip.focus.ring.color",
      cssVar: "--fsds-chip-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "chip.focus.ring.style": {
      name: "chip.focus.ring.style",
      cssVar: "--fsds-chip-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "chip.focus.ring.offset": {
      name: "chip.focus.ring.offset",
      cssVar: "--fsds-chip-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveChipTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(chipTokenScopes, theme);
}
// @generated:end
