// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const switchTokenScopes = {
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
    "switch.motion.duration": {
      name: "switch.motion.duration",
      cssVar: "--fsds-switch-motion-duration",
      ref: "semantic.motion.interaction.press.duration",
      fallback: 100,
    },
    "switch.motion.easing": {
      name: "switch.motion.easing",
      cssVar: "--fsds-switch-motion-easing",
      ref: "semantic.motion.interaction.press.easing",
      fallback: "ease-out",
    },
    "switch.color.track.background.default": {
      name: "switch.color.track.background.default",
      cssVar: "--fsds-switch-color-track-background-default",
      ref: "semantic.color.background.tertiary",
      fallback: "#cecece",
    },
    "switch.color.track.border.default": {
      name: "switch.color.track.border.default",
      cssVar: "--fsds-switch-color-track-border-default",
      ref: "semantic.color.border.subtle",
      fallback: "#aeaeae",
    },
    "switch.color.thumb.background.default": {
      name: "switch.color.thumb.background.default",
      cssVar: "--fsds-switch-color-thumb-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "switch.color.thumb.shadow.default": {
      name: "switch.color.thumb.shadow.default",
      cssVar: "--fsds-switch-color-thumb-shadow-default",
      ref: "semantic.elevation.surface.raised",
      fallback: "0 1px 2px rgba(0, 0, 0, 0.1)",
    },
    "switch.color.input.outline.focus": {
      name: "switch.color.input.outline.focus",
      cssVar: "--fsds-switch-color-input-outline-focus",
      ref: "semantic.color.border.focus",
      fallback: "#d9292b",
    },
    "switch.size.md.track.width": {
      name: "switch.size.md.track.width",
      cssVar: "--fsds-switch-size-md-track-width",
      ref: "core.spacing.size.09",
      fallback: 48,
    },
    "switch.size.md.track.height": {
      name: "switch.size.md.track.height",
      cssVar: "--fsds-switch-size-md-track-height",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "switch.size.md.track.radius": {
      name: "switch.size.md.track.radius",
      cssVar: "--fsds-switch-size-md-track-radius",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "switch.size.md.track.padding": {
      name: "switch.size.md.track.padding",
      cssVar: "--fsds-switch-size-md-track-padding",
      ref: "core.spacing.size.01",
      fallback: 2,
    },
    "switch.size.md.thumb.size": {
      name: "switch.size.md.thumb.size",
      cssVar: "--fsds-switch-size-md-thumb-size",
      ref: "core.spacing.size.06",
      fallback: 20,
    },
    "switch.size.md.thumb.height": {
      name: "switch.size.md.thumb.height",
      cssVar: "--fsds-switch-size-md-thumb-height",
      ref: "core.spacing.size.06",
      fallback: 20,
    },
    "switch.size.sm.track.width": {
      name: "switch.size.sm.track.width",
      cssVar: "--fsds-switch-size-sm-track-width",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "switch.size.sm.track.height": {
      name: "switch.size.sm.track.height",
      cssVar: "--fsds-switch-size-sm-track-height",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "switch.size.sm.track.radius": {
      name: "switch.size.sm.track.radius",
      cssVar: "--fsds-switch-size-sm-track-radius",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "switch.size.sm.track.padding": {
      name: "switch.size.sm.track.padding",
      cssVar: "--fsds-switch-size-sm-track-padding",
      ref: "core.spacing.size.01",
      fallback: 2,
    },
    "switch.size.sm.thumb.size": {
      name: "switch.size.sm.thumb.size",
      cssVar: "--fsds-switch-size-sm-thumb-size",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "switch.size.sm.thumb.height": {
      name: "switch.size.sm.thumb.height",
      cssVar: "--fsds-switch-size-sm-thumb-height",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "switch.size.lg.track.width": {
      name: "switch.size.lg.track.width",
      cssVar: "--fsds-switch-size-lg-track-width",
      ref: "core.spacing.size.10",
      fallback: 64,
    },
    "switch.size.lg.track.height": {
      name: "switch.size.lg.track.height",
      cssVar: "--fsds-switch-size-lg-track-height",
      ref: "core.spacing.size.08",
      fallback: 32,
    },
    "switch.size.lg.track.radius": {
      name: "switch.size.lg.track.radius",
      cssVar: "--fsds-switch-size-lg-track-radius",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
    "switch.size.lg.track.padding": {
      name: "switch.size.lg.track.padding",
      cssVar: "--fsds-switch-size-lg-track-padding",
      ref: "core.spacing.size.01",
      fallback: 2,
    },
    "switch.size.lg.thumb.size": {
      name: "switch.size.lg.thumb.size",
      cssVar: "--fsds-switch-size-lg-thumb-size",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "switch.size.lg.thumb.height": {
      name: "switch.size.lg.thumb.height",
      cssVar: "--fsds-switch-size-lg-thumb-height",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "switch.size.sm.thumb.translate.off": {
      name: "switch.size.sm.thumb.translate.off",
      cssVar: "--fsds-switch-size-sm-thumb-translate-off",
      literal: 0,
    },
    "switch.size.sm.thumb.translate.on": {
      name: "switch.size.sm.thumb.translate.on",
      cssVar: "--fsds-switch-size-sm-thumb-translate-on",
      literal: 16,
    },
    "switch.size.md.thumb.translate.off": {
      name: "switch.size.md.thumb.translate.off",
      cssVar: "--fsds-switch-size-md-thumb-translate-off",
      literal: 0,
    },
    "switch.size.md.thumb.translate.on": {
      name: "switch.size.md.thumb.translate.on",
      cssVar: "--fsds-switch-size-md-thumb-translate-on",
      literal: 24,
    },
    "switch.size.lg.thumb.translate.off": {
      name: "switch.size.lg.thumb.translate.off",
      cssVar: "--fsds-switch-size-lg-thumb-translate-off",
      literal: 0,
    },
    "switch.size.lg.thumb.translate.on": {
      name: "switch.size.lg.thumb.translate.on",
      cssVar: "--fsds-switch-size-lg-thumb-translate-on",
      literal: 36,
    },
  },
  "checked": {
    "switch.color.track.background.default": {
      name: "switch.color.track.background.default",
      cssVar: "--fsds-switch-color-track-background-default",
      ref: "semantic.color.foreground.accent",
      fallback: "#d9292b",
    },
    "switch.color.thumb.background.default": {
      name: "switch.color.thumb.background.default",
      cssVar: "--fsds-switch-color-thumb-background-default",
      ref: "semantic.color.foreground.on.brand",
      fallback: "#ffffff",
    },
  },
  "disabled": {
    "switch.color.track.background.default": {
      name: "switch.color.track.background.default",
      cssVar: "--fsds-switch-color-track-background-default",
      ref: "semantic.color.background.disabled",
      fallback: "#efefef",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSwitchTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(switchTokenScopes, theme);
}
// @generated:end
