// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const tabsTokenScopes = {
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
    "tabs.spacing.gap": {
      name: "tabs.spacing.gap",
      cssVar: "--fsds-tabs-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "tabs.spacing.padding": {
      name: "tabs.spacing.padding",
      cssVar: "--fsds-tabs-spacing-padding",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "tabs.spacing.pillPadding": {
      name: "tabs.spacing.pillPadding",
      cssVar: "--fsds-tabs-spacing-pillPadding",
      literal: "4px 10px",
    },
    "tabs.spacing.panelGap": {
      name: "tabs.spacing.panelGap",
      cssVar: "--fsds-tabs-spacing-panelGap",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "tabs.color.fg": {
      name: "tabs.color.fg",
      cssVar: "--fsds-tabs-color-fg",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "tabs.color.disabled-fg": {
      name: "tabs.color.disabled-fg",
      cssVar: "--fsds-tabs-color-disabled-fg",
      ref: "semantic.color.foreground.disabled",
      fallback: "#aeaeae",
    },
    "tabs.color.indicator": {
      name: "tabs.color.indicator",
      cssVar: "--fsds-tabs-color-indicator",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
    "tabs.shape.radius": {
      name: "tabs.shape.radius",
      cssVar: "--fsds-tabs-shape-radius",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "tabs.motion.indicator": {
      name: "tabs.motion.indicator",
      cssVar: "--fsds-tabs-motion-indicator",
      ref: "core.motion.duration.short",
      fallback: "150ms",
    },
    "tabs.color.hover.bg": {
      name: "tabs.color.hover.bg",
      cssVar: "--fsds-tabs-color-hover-bg",
      ref: "semantic.color.background.hover",
      fallback: "#cecece",
    },
    "tabs.color.hover.fg": {
      name: "tabs.color.hover.fg",
      cssVar: "--fsds-tabs-color-hover-fg",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "tabs.color.active-fg": {
      name: "tabs.color.active-fg",
      cssVar: "--fsds-tabs-color-active-fg",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "tabs.color.active-bg": {
      name: "tabs.color.active-bg",
      cssVar: "--fsds-tabs-color-active-bg",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "tabs.color.focus": {
      name: "tabs.color.focus",
      cssVar: "--fsds-tabs-color-focus",
      ref: "semantic.color.border.accent",
      fallback: "#d9292b",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTabsTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(tabsTokenScopes, theme);
}
// @generated:end
