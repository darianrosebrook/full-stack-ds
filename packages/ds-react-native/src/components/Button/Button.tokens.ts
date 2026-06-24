// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const buttonTokenScopes = {
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
      ref: "semantic.action.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.action.size.medium.padding-block",
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
      ref: "semantic.action.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.action.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.action.size.medium.gap",
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
      ref: "semantic.action.size.medium.min-width",
      fallback: 36,
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
      ref: "semantic.action.size.medium.min-height",
      fallback: 36,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#d9292b",
    },
    "button.color.background.hover": {
      name: "button.color.background.hover",
      cssVar: "--fsds-button-color-background-hover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
    "button.color.background.active": {
      name: "button.color.background.active",
      cssVar: "--fsds-button-color-background-active",
      ref: "semantic.interaction.background.active",
      fallback: "#cecece",
    },
    "button.color.background.disabled": {
      name: "button.color.background.disabled",
      cssVar: "--fsds-button-color-background-disabled",
      ref: "semantic.color.action.background.primary.disabled",
      fallback: "#cecece",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.inverse",
      fallback: "#fafafa",
    },
    "button.color.foreground.disabled": {
      name: "button.color.foreground.disabled",
      cssVar: "--fsds-button-color-foreground-disabled",
      ref: "semantic.color.foreground.disabled",
      fallback: "#aeaeae",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "button.color.border.hover": {
      name: "button.color.border.hover",
      cssVar: "--fsds-button-color-border-hover",
      ref: "semantic.interaction.border.hover",
      fallback: "#8f8f8f",
    },
    "button.color.border.focus": {
      name: "button.color.border.focus",
      cssVar: "--fsds-button-color-border-focus",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "button.size.gap.default": {
      name: "button.size.gap.default",
      cssVar: "--fsds-button-size-gap-default",
      ref: "semantic.action.size.medium.gap",
      fallback: 8,
    },
    "button.size.radius": {
      name: "button.size.radius",
      cssVar: "--fsds-button-size-radius",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "button.size.border": {
      name: "button.size.border",
      cssVar: "--fsds-button-size-border",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "button.text.weight": {
      name: "button.text.weight",
      cssVar: "--fsds-button-text-weight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "button.motion.duration.fast": {
      name: "button.motion.duration.fast",
      cssVar: "--fsds-button-motion-duration-fast",
      ref: "core.motion.duration.short",
      fallback: 150,
    },
    "button.motion.easing.standard": {
      name: "button.motion.easing.standard",
      cssVar: "--fsds-button-motion-easing-standard",
      ref: "core.motion.easing.standard",
      fallback: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    "button.size.padding-block.medium": {
      name: "button.size.padding-block.medium",
      cssVar: "--fsds-button-size-padding-block-medium",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "button.size.padding-inline.medium": {
      name: "button.size.padding-inline.medium",
      cssVar: "--fsds-button-size-padding-inline-medium",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "button.size.minHeight.medium": {
      name: "button.size.minHeight.medium",
      cssVar: "--fsds-button-size-minHeight-medium",
      ref: "core.dimension.actionMinHeight",
      fallback: 36,
    },
    "button.size.fontSize.medium": {
      name: "button.size.fontSize.medium",
      cssVar: "--fsds-button-size-fontSize-medium",
      ref: "semantic.typography.action.02",
      fallback: 16,
    },
  },
  "variant_small": {
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      ref: "core.dimension.actionMinHeightSmall",
      fallback: 28,
    },
    "button.size.padding-block.medium": {
      name: "button.size.padding-block.medium",
      cssVar: "--fsds-button-size-padding-block-medium",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "button.size.padding-inline.medium": {
      name: "button.size.padding-inline.medium",
      cssVar: "--fsds-button-size-padding-inline-medium",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "button.size.minHeight.medium": {
      name: "button.size.minHeight.medium",
      cssVar: "--fsds-button-size-minHeight-medium",
      ref: "core.dimension.actionMinHeightSmall",
      fallback: 28,
    },
    "button.size.fontSize.medium": {
      name: "button.size.fontSize.medium",
      cssVar: "--fsds-button-size-fontSize-medium",
      ref: "semantic.typography.action.03",
      fallback: 14,
    },
  },
  "variant_medium": {
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      ref: "core.dimension.actionMinHeight",
      fallback: 36,
    },
    "button.size.padding-block.medium": {
      name: "button.size.padding-block.medium",
      cssVar: "--fsds-button-size-padding-block-medium",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "button.size.padding-inline.medium": {
      name: "button.size.padding-inline.medium",
      cssVar: "--fsds-button-size-padding-inline-medium",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "button.size.minHeight.medium": {
      name: "button.size.minHeight.medium",
      cssVar: "--fsds-button-size-minHeight-medium",
      ref: "core.dimension.actionMinHeight",
      fallback: 36,
    },
    "button.size.fontSize.medium": {
      name: "button.size.fontSize.medium",
      cssVar: "--fsds-button-size-fontSize-medium",
      ref: "semantic.typography.action.02",
      fallback: 16,
    },
  },
  "variant_large": {
    "box-model.padding-block-start": {
      name: "box-model.padding-block-start",
      cssVar: "--fsds-box-model-padding-block-start",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "box-model.padding-inline-start": {
      name: "box-model.padding-inline-start",
      cssVar: "--fsds-box-model-padding-inline-start",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      ref: "core.dimension.actionMinHeightLarge",
      fallback: 48,
    },
    "button.size.padding-block.medium": {
      name: "button.size.padding-block.medium",
      cssVar: "--fsds-button-size-padding-block-medium",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "button.size.padding-inline.medium": {
      name: "button.size.padding-inline.medium",
      cssVar: "--fsds-button-size-padding-inline-medium",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "button.size.minHeight.medium": {
      name: "button.size.minHeight.medium",
      cssVar: "--fsds-button-size-minHeight-medium",
      ref: "core.dimension.actionMinHeightLarge",
      fallback: 48,
    },
    "button.size.fontSize.medium": {
      name: "button.size.fontSize.medium",
      cssVar: "--fsds-button-size-fontSize-medium",
      ref: "semantic.typography.action.01",
      fallback: 18,
    },
  },
  "variant_primary": {
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      ref: "semantic.color.action.background.primary.default",
    },
    "button.color.background.hover": {
      name: "button.color.background.hover",
      cssVar: "--fsds-button-color-background-hover",
      ref: "semantic.color.action.background.primary.hover",
    },
    "button.color.background.active": {
      name: "button.color.background.active",
      cssVar: "--fsds-button-color-background-active",
      ref: "semantic.color.action.background.primary.active",
    },
    "button.color.background.disabled": {
      name: "button.color.background.disabled",
      cssVar: "--fsds-button-color-background-disabled",
      ref: "semantic.color.action.background.primary.disabled",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.inverse",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      ref: "semantic.color.action.background.primary.default",
    },
    "button.color.border.hover": {
      name: "button.color.border.hover",
      cssVar: "--fsds-button-color-border-hover",
      ref: "semantic.color.action.background.primary.hover",
    },
  },
  "variant_secondary": {
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      ref: "semantic.color.action.background.secondary.default",
    },
    "button.color.background.hover": {
      name: "button.color.background.hover",
      cssVar: "--fsds-button-color-background-hover",
      ref: "semantic.color.action.background.secondary.hover",
    },
    "button.color.background.active": {
      name: "button.color.background.active",
      cssVar: "--fsds-button-color-background-active",
      ref: "semantic.color.action.background.secondary.active",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.primary",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      ref: "semantic.color.border.default",
    },
  },
  "variant_tertiary": {
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      literal: "transparent",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      literal: "transparent",
    },
  },
  "variant_destructive": {
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      ref: "semantic.color.action.background.danger.default",
    },
    "button.color.background.hover": {
      name: "button.color.background.hover",
      cssVar: "--fsds-button-color-background-hover",
      ref: "semantic.color.action.background.danger.hover",
    },
    "button.color.background.active": {
      name: "button.color.background.active",
      cssVar: "--fsds-button-color-background-active",
      ref: "semantic.color.action.background.danger.active",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.inverse",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      ref: "semantic.color.action.background.danger.default",
    },
    "button.color.border.hover": {
      name: "button.color.border.hover",
      cssVar: "--fsds-button-color-border-hover",
      ref: "semantic.color.action.background.danger.hover",
    },
  },
  "variant_ghost": {
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      literal: "transparent",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      literal: "transparent",
    },
  },
  "variant_outline": {
    "button.color.background.default": {
      name: "button.color.background.default",
      cssVar: "--fsds-button-color-background-default",
      literal: "transparent",
    },
    "button.color.foreground.default": {
      name: "button.color.foreground.default",
      cssVar: "--fsds-button-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "button.color.border.default": {
      name: "button.color.border.default",
      cssVar: "--fsds-button-color-border-default",
      ref: "semantic.color.border.default",
      fallback: "#8f8f8f",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveButtonTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(buttonTokenScopes, theme);
}
// @generated:end
