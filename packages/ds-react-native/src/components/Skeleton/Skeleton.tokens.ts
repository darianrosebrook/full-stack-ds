// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const skeletonTokenScopes = {
  "root": {
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
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      literal: 0,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: "1em",
    },
    "skeleton.radius.sm": {
      name: "skeleton.radius.sm",
      cssVar: "--fsds-skeleton-radius-sm",
      ref: "semantic.shape.radius.small",
      fallback: 4,
    },
    "skeleton.shape.height.text": {
      name: "skeleton.shape.height.text",
      cssVar: "--fsds-skeleton-shape-height-text",
      ref: "core.typography.ramp.4",
      fallback: 16,
    },
  },
  "variant_block": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "semantic.shape.radius.medium",
      fallback: 8,
    },
  },
  "variant_text": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "semantic.shape.radius.small",
      fallback: 4,
    },
  },
  "variant_avatar": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "semantic.shape.control.radius.pill",
      fallback: 9999,
    },
  },
  "variant_media": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "semantic.shape.radius.medium",
      fallback: 8,
    },
  },
  "variant_dataviz": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "semantic.shape.radius.medium",
      fallback: 8,
    },
  },
  "variant_actions": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "semantic.shape.radius.medium",
      fallback: 8,
    },
  },
  "variant_wipe": {
    "skeleton.color.base": {
      name: "skeleton.color.base",
      cssVar: "--fsds-skeleton-color-base",
      ref: "semantic.color.background.tertiary",
      fallback: "#d0d0d0",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSkeletonTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(skeletonTokenScopes, theme);
}
// @generated:end
