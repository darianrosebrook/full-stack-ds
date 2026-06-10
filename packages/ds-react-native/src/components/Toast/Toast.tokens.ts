// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const toastTokenScopes = {
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
      fallback: 12,
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
    "toast.surface.bg": {
      name: "toast.surface.bg",
      cssVar: "--fsds-toast-surface-bg",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "toast.surface.border": {
      name: "toast.surface.border",
      cssVar: "--fsds-toast-surface-border",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "toast.surface.radius": {
      name: "toast.surface.radius",
      cssVar: "--fsds-toast-surface-radius",
      ref: "core.shape.radius.medium",
      fallback: 8,
    },
    "toast.surface.shadow": {
      name: "toast.surface.shadow",
      cssVar: "--fsds-toast-surface-shadow",
      ref: "semantic.elevation.surface.raised",
      fallback: "none",
    },
    "toast.color.default": {
      name: "toast.color.default",
      cssVar: "--fsds-toast-color-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "toast.accent.default": {
      name: "toast.accent.default",
      cssVar: "--fsds-toast-accent-default",
      ref: "semantic.color.status.info",
      fallback: "#0a65fe",
    },
    "toast.spacing.padding": {
      name: "toast.spacing.padding",
      cssVar: "--fsds-toast-spacing-padding",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "toast.spacing.gap": {
      name: "toast.spacing.gap",
      cssVar: "--fsds-toast-spacing-gap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "toast.spacing.stackGap": {
      name: "toast.spacing.stackGap",
      cssVar: "--fsds-toast-spacing-stackGap",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "toast.size.maxWidth": {
      name: "toast.size.maxWidth",
      cssVar: "--fsds-toast-size-maxWidth",
      literal: 400,
    },
    "toast.motion.enter": {
      name: "toast.motion.enter",
      cssVar: "--fsds-toast-motion-enter",
      ref: "core.motion.duration.short",
      fallback: "150ms",
    },
    "toast.motion.leave": {
      name: "toast.motion.leave",
      cssVar: "--fsds-toast-motion-leave",
      ref: "core.motion.duration.short",
      fallback: "150ms",
    },
    "toast.timing.auto-dismiss": {
      name: "toast.timing.auto-dismiss",
      cssVar: "--fsds-toast-timing-auto-dismiss",
      ref: "semantic.motion.dwell.notification",
      fallback: "6000ms",
    },
  },
  "variant_success": {
    "toast.color.default": {
      name: "toast.color.default",
      cssVar: "--fsds-toast-color-default",
      ref: "semantic.color.foreground.success",
    },
  },
  "variant_warning": {
    "toast.color.default": {
      name: "toast.color.default",
      cssVar: "--fsds-toast-color-default",
      ref: "semantic.color.foreground.warning",
    },
  },
  "variant_error": {
    "toast.color.default": {
      name: "toast.color.default",
      cssVar: "--fsds-toast-color-default",
      ref: "semantic.color.foreground.danger",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveToastTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(toastTokenScopes, theme);
}
// @generated:end
