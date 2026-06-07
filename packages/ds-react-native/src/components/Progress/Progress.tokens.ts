// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const progressTokenScopes = {
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
      literal: 0,
    },
    "box-model.width": {
      name: "box-model.width",
      cssVar: "--fsds-box-model-width",
      literal: "100%",
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
      literal: 8,
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
    "progress.color.text.default": {
      name: "progress.color.text.default",
      cssVar: "--fsds-progress-color-text-default",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "progress.spacing.gap": {
      name: "progress.spacing.gap",
      cssVar: "--fsds-progress-spacing-gap",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "progress.motion.duration.indeterminate": {
      name: "progress.motion.duration.indeterminate",
      cssVar: "--fsds-progress-motion-duration-indeterminate",
      ref: "core.motion.duration.extra.long1",
      fallback: "1500ms",
    },
    "progress.color.track.background": {
      name: "progress.color.track.background",
      cssVar: "--fsds-progress-color-track-background",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "progress.color.fill.info": {
      name: "progress.color.fill.info",
      cssVar: "--fsds-progress-color-fill-info",
      ref: "semantic.color.status.info",
      fallback: "#0a65fe",
    },
    "progress.color.fill.success": {
      name: "progress.color.fill.success",
      cssVar: "--fsds-progress-color-fill-success",
      ref: "semantic.color.status.success",
      fallback: "#487e1e",
    },
    "progress.color.fill.warning": {
      name: "progress.color.fill.warning",
      cssVar: "--fsds-progress-color-fill-warning",
      ref: "semantic.color.status.warning",
      fallback: "#ac5c00",
    },
    "progress.color.fill.danger": {
      name: "progress.color.fill.danger",
      cssVar: "--fsds-progress-color-fill-danger",
      ref: "semantic.color.status.danger",
      fallback: "#d9292b",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveProgressTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(progressTokenScopes, theme);
}
// @generated:end
