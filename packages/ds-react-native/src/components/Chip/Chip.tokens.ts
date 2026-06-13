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
    "chip.size.minHeight": {
      name: "chip.size.minHeight",
      cssVar: "--fsds-chip-size-minHeight",
      ref: "core.dimension.actionMinHeight",
      fallback: 32,
    },
    "chip.color.background.selected": {
      name: "chip.color.background.selected",
      cssVar: "--fsds-chip-color-background-selected",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "chip.color.foreground.selected": {
      name: "chip.color.foreground.selected",
      cssVar: "--fsds-chip-color-foreground-selected",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "chip.color.border.selected": {
      name: "chip.color.border.selected",
      cssVar: "--fsds-chip-color-border-selected",
      ref: "semantic.color.border.info",
      fallback: "#0042dc",
    },
    "chip.dismiss.size": {
      name: "chip.dismiss.size",
      cssVar: "--fsds-chip-dismiss-size",
      ref: "core.spacing.size.05",
      fallback: 16,
    },
    "chip.dismiss.gap": {
      name: "chip.dismiss.gap",
      cssVar: "--fsds-chip-dismiss-gap",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
  },
  "part_action": {
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "chip.size.gap",
    },
  },
  "part_dismiss": {
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      ref: "chip.dismiss.size",
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      ref: "chip.dismiss.size",
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      ref: "chip.dismiss.size",
    },
    "box-model.height": {
      name: "box-model.height",
      cssVar: "--fsds-box-model-height",
      ref: "chip.dismiss.size",
    },
  },
  "variant_selected": {
    "chip.color.background.default": {
      name: "chip.color.background.default",
      cssVar: "--fsds-chip-color-background-default",
      ref: "semantic.color.background.info.subtle",
      fallback: "#d9f3fe",
    },
    "chip.color.foreground.default": {
      name: "chip.color.foreground.default",
      cssVar: "--fsds-chip-color-foreground-default",
      ref: "semantic.color.foreground.on.info.subtle",
      fallback: "#002d99",
    },
    "chip.color.border.default": {
      name: "chip.color.border.default",
      cssVar: "--fsds-chip-color-border-default",
      ref: "semantic.color.border.info",
      fallback: "#0042dc",
    },
  },
  "variant_dismissible": {
    "chip.size.padding.horizontal": {
      name: "chip.size.padding.horizontal",
      cssVar: "--fsds-chip-size-padding-horizontal",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
  },
  "variant_small": {
    "chip.size.padding.vertical": {
      name: "chip.size.padding.vertical",
      cssVar: "--fsds-chip-size-padding-vertical",
      ref: "semantic.glyph.badge.size.sm.paddingY",
      fallback: 2,
    },
    "chip.size.padding.horizontal": {
      name: "chip.size.padding.horizontal",
      cssVar: "--fsds-chip-size-padding-horizontal",
      ref: "semantic.glyph.badge.size.sm.paddingX",
      fallback: 4,
    },
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
      cssVar: "--fsds-chip-size-minHeight",
      ref: "semantic.glyph.badge.size.sm.minHeight",
      fallback: 24,
    },
  },
  "variant_medium": {
    "chip.size.padding.vertical": {
      name: "chip.size.padding.vertical",
      cssVar: "--fsds-chip-size-padding-vertical",
      ref: "semantic.glyph.badge.size.md.paddingY",
      fallback: 4,
    },
    "chip.size.padding.horizontal": {
      name: "chip.size.padding.horizontal",
      cssVar: "--fsds-chip-size-padding-horizontal",
      ref: "semantic.glyph.badge.size.md.paddingX",
      fallback: 8,
    },
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
      cssVar: "--fsds-chip-size-minHeight",
      ref: "semantic.glyph.badge.size.md.minHeight",
      fallback: 32,
    },
  },
  "variant_large": {
    "chip.size.padding.vertical": {
      name: "chip.size.padding.vertical",
      cssVar: "--fsds-chip-size-padding-vertical",
      ref: "semantic.glyph.badge.size.lg.paddingY",
      fallback: 4,
    },
    "chip.size.padding.horizontal": {
      name: "chip.size.padding.horizontal",
      cssVar: "--fsds-chip-size-padding-horizontal",
      ref: "semantic.glyph.badge.size.lg.paddingX",
      fallback: 12,
    },
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
      cssVar: "--fsds-chip-size-minHeight",
      ref: "semantic.glyph.badge.size.lg.minHeight",
      fallback: 40,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveChipTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(chipTokenScopes, theme);
}
// @generated:end
