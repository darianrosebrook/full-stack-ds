// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const cardTokenScopes = {
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
    "card.color.background.default": {
      name: "card.color.background.default",
      cssVar: "--fsds-card-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "card.color.background.hover": {
      name: "card.color.background.hover",
      cssVar: "--fsds-card-color-background-hover",
      ref: "semantic.color.background.hover",
      fallback: "#f7f7f7",
    },
    "card.color.border.default": {
      name: "card.color.border.default",
      cssVar: "--fsds-card-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#b8b8b8",
    },
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "card.size.padding.default": {
      name: "card.size.padding.default",
      cssVar: "--fsds-card-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "card.size.padding.inset": {
      name: "card.size.padding.inset",
      cssVar: "--fsds-card-size-padding-inset",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "card.size.radius.default": {
      name: "card.size.radius.default",
      cssVar: "--fsds-card-size-radius-default",
      ref: "semantic.shape.radius.medium",
      fallback: 8,
    },
    "card.size.gap.default": {
      name: "card.size.gap.default",
      cssVar: "--fsds-card-size-gap-default",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "card.typography.lineHeight.heading": {
      name: "card.typography.lineHeight.heading",
      cssVar: "--fsds-card-typography-line-height-heading",
      ref: "semantic.typography.line.height.heading",
      fallback: "1",
    },
    "card.typography.lineHeight.normal": {
      name: "card.typography.lineHeight.normal",
      cssVar: "--fsds-card-typography-line-height-normal",
      ref: "semantic.typography.line.height.normal",
      fallback: "1.5",
    },
    "card.color.badge.accent.background": {
      name: "card.color.badge.accent.background",
      cssVar: "--fsds-card-color-badge-accent-background",
      ref: "semantic.color.background.accent",
      fallback: "#d92d2e",
    },
    "card.color.badge.accent.foreground": {
      name: "card.color.badge.accent.foreground",
      cssVar: "--fsds-card-color-badge-accent-foreground",
      ref: "semantic.color.foreground.on.brand",
      fallback: "#ffffff",
    },
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.light",
      fallback: "#b8b8b8",
    },
    "card.size.statusAccent.width": {
      name: "card.size.statusAccent.width",
      cssVar: "--fsds-card-size-status-accent-width",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "card.elevation.resting": {
      name: "card.elevation.resting",
      cssVar: "--fsds-card-elevation-resting",
      ref: "semantic.elevation.surface.raised",
      fallback: "0px 1px 2px #0000000f, 0px 1px 3px #0000001a",
    },
    "card.elevation.raised": {
      name: "card.elevation.raised",
      cssVar: "--fsds-card-elevation-raised",
      ref: "semantic.elevation.surface.floating",
      fallback: "0px 2px 4px #0000000f, 0px 4px 8px #0000001a",
    },
    "card.color.focus.ring": {
      name: "card.color.focus.ring",
      cssVar: "--fsds-card-color-focus-ring",
      ref: "semantic.focus.ring.color",
      fallback: "#0566fe",
    },
    "card.focus.ring.width": {
      name: "card.focus.ring.width",
      cssVar: "--fsds-card-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "card.focus.ring.offset": {
      name: "card.focus.ring.offset",
      cssVar: "--fsds-card-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
  "variant_completed": {
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.success",
      fallback: "#3a6614",
    },
  },
  "variant_in_progress": {
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.info",
      fallback: "#034fd6",
    },
  },
  "variant_planned": {
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.subtle",
      fallback: "#d0d0d0",
    },
  },
  "variant_deprecated": {
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.danger",
      fallback: "#b31b1b",
    },
  },
  "variant_category": {
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.accent",
      fallback: "#d92d2e",
    },
  },
  "variant_complexity": {
    "card.color.statusAccent.default": {
      name: "card.color.statusAccent.default",
      cssVar: "--fsds-card-color-status-accent-default",
      ref: "semantic.color.border.warning",
      fallback: "#8b4b00",
    },
  },
  "part_description": {
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
  },
  "part_link": {
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.link",
      fallback: "#d92d2e",
    },
  },
  "part_note": {
    "card.color.foreground.primary": {
      name: "card.color.foreground.primary",
      cssVar: "--fsds-card-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#474647",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCardTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(cardTokenScopes, theme);
}
// @generated:end
