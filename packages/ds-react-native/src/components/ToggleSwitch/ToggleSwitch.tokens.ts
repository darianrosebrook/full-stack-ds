// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const toggleSwitchTokenScopes = {
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
    "toggle-switch.color.background.default": {
      name: "toggle-switch.color.background.default",
      cssVar: "--fsds-toggle-switch-color-background-default",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "toggle-switch.color.foreground.default": {
      name: "toggle-switch.color.foreground.default",
      cssVar: "--fsds-toggle-switch-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "toggle-switch.color.border.default": {
      name: "toggle-switch.color.border.default",
      cssVar: "--fsds-toggle-switch-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "toggle-switch.border.radius.default": {
      name: "toggle-switch.border.radius.default",
      cssVar: "--fsds-toggle-switch-border-radius-default",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "toggle-switch.motion.duration.fast": {
      name: "toggle-switch.motion.duration.fast",
      cssVar: "--fsds-toggle-switch-motion-duration-fast",
      ref: "core.motion.duration.short",
      fallback: 150,
    },
    "toggle-switch.color.background.hover": {
      name: "toggle-switch.color.background.hover",
      cssVar: "--fsds-toggle-switch-color-background-hover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
    "toggle-switch.color.background.checked": {
      name: "toggle-switch.color.background.checked",
      cssVar: "--fsds-toggle-switch-color-background-checked",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#d9292b",
    },
    "toggle-switch.color.background.disabled": {
      name: "toggle-switch.color.background.disabled",
      cssVar: "--fsds-toggle-switch-color-background-disabled",
      ref: "semantic.color.background.disabled",
      fallback: "#cecece",
    },
    "toggle-switch.focus.ring.width": {
      name: "toggle-switch.focus.ring.width",
      cssVar: "--fsds-toggle-switch-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "toggle-switch.focus.ring.color": {
      name: "toggle-switch.focus.ring.color",
      cssVar: "--fsds-toggle-switch-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "toggle-switch.focus.ring.style": {
      name: "toggle-switch.focus.ring.style",
      cssVar: "--fsds-toggle-switch-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "toggle-switch.focus.ring.offset": {
      name: "toggle-switch.focus.ring.offset",
      cssVar: "--fsds-toggle-switch-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveToggleSwitchTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(toggleSwitchTokenScopes, theme);
}
// @generated:end
