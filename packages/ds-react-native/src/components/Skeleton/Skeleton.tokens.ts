// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const skeletonTokenScopes = {
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
      literal: "auto",
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: "1em",
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "skeleton.color.base": {
      name: "skeleton.color.base",
      cssVar: "--fsds-skeleton-color-base",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "skeleton.color.highlight": {
      name: "skeleton.color.highlight",
      cssVar: "--fsds-skeleton-color-highlight",
      ref: "semantic.color.background.highlight",
      fallback: "#f7c1c2",
    },
    "skeleton.color.static": {
      name: "skeleton.color.static",
      cssVar: "--fsds-skeleton-color-static",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "skeleton.radius.sm": {
      name: "skeleton.radius.sm",
      cssVar: "--fsds-skeleton-radius-sm",
      ref: "core.shape.radius.small",
      fallback: 4,
    },
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "core.shape.radius.03",
      fallback: 8,
    },
    "skeleton.radius.lg": {
      name: "skeleton.radius.lg",
      cssVar: "--fsds-skeleton-radius-lg",
      ref: "core.shape.radius.large",
      fallback: 16,
    },
    "skeleton.radius.full": {
      name: "skeleton.radius.full",
      cssVar: "--fsds-skeleton-radius-full",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
    "skeleton.gap.compact": {
      name: "skeleton.gap.compact",
      cssVar: "--fsds-skeleton-gap-compact",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "skeleton.gap.md": {
      name: "skeleton.gap.md",
      cssVar: "--fsds-skeleton-gap-md",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "skeleton.gap.spacious": {
      name: "skeleton.gap.spacious",
      cssVar: "--fsds-skeleton-gap-spacious",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
    "skeleton.anim.duration": {
      name: "skeleton.anim.duration",
      cssVar: "--fsds-skeleton-anim-duration",
      ref: "core.motion.duration.long",
      fallback: 400,
    },
    "skeleton.anim.easing": {
      name: "skeleton.anim.easing",
      cssVar: "--fsds-skeleton-anim-easing",
      ref: "core.motion.easing.standard",
      fallback: "cubic-bezier(0.4, 0, 0.2, 1)",
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
      ref: "core.shape.radius.03",
      fallback: 8,
    },
  },
  "variant_text": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "core.shape.radius.small",
      fallback: 4,
    },
    "skeleton.shape.height.text": {
      name: "skeleton.shape.height.text",
      cssVar: "--fsds-skeleton-shape-height-text",
      ref: "core.typography.ramp.4",
      fallback: 16,
    },
  },
  "variant_avatar": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
  },
  "variant_media": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "core.shape.radius.03",
      fallback: 8,
    },
  },
  "variant_dataviz": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "core.shape.radius.03",
      fallback: 8,
    },
  },
  "variant_actions": {
    "skeleton.radius.md": {
      name: "skeleton.radius.md",
      cssVar: "--fsds-skeleton-radius-md",
      ref: "core.shape.radius.03",
      fallback: 8,
    },
  },
  "variant_wipe": {
    "skeleton.color.base": {
      name: "skeleton.color.base",
      cssVar: "--fsds-skeleton-color-base",
      ref: "semantic.color.background.tertiary",
      fallback: "#e5e5e5",
    },
  },
  "variant_compact": {
    "skeleton.gap.md": {
      name: "skeleton.gap.md",
      cssVar: "--fsds-skeleton-gap-md",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
  },
  "variant_regular": {
    "skeleton.gap.md": {
      name: "skeleton.gap.md",
      cssVar: "--fsds-skeleton-gap-md",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
  },
  "variant_spacious": {
    "skeleton.gap.md": {
      name: "skeleton.gap.md",
      cssVar: "--fsds-skeleton-gap-md",
      ref: "core.spacing.size.07",
      fallback: 24,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveSkeletonTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(skeletonTokenScopes, theme);
}
// @generated:end
