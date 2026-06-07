// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const postcardTokenScopes = {
  "root": {
    "box-model.padding": {
      name: "box-model.padding",
      cssVar: "--fsds-box-model-padding",
      literal: "0",
    },
    "box-model.padding-block": {
      name: "box-model.padding-block",
      cssVar: "--fsds-box-model-padding-block",
      literal: "0",
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
      literal: "0",
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
      literal: "0",
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "postcard.color.background.default": {
      name: "postcard.color.background.default",
      cssVar: "--fsds-postcard-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "postcard.color.background.hover": {
      name: "postcard.color.background.hover",
      cssVar: "--fsds-postcard-color-background-hover",
      ref: "semantic.color.background.secondary",
      fallback: "#efefef",
    },
    "postcard.color.border.default": {
      name: "postcard.color.border.default",
      cssVar: "--fsds-postcard-color-border-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "postcard.color.border.hover": {
      name: "postcard.color.border.hover",
      cssVar: "--fsds-postcard-color-border-hover",
      ref: "semantic.color.border.bold",
      fallback: "#8f8f8f",
    },
    "postcard.color.foreground.primary": {
      name: "postcard.color.foreground.primary",
      cssVar: "--fsds-postcard-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "postcard.size.padding.default": {
      name: "postcard.size.padding.default",
      cssVar: "--fsds-postcard-size-padding-default",
      ref: "core.spacing.size.06",
      fallback: 16,
    },
    "postcard.size.radius.default": {
      name: "postcard.size.radius.default",
      cssVar: "--fsds-postcard-size-radius-default",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "postcard.size.radius.full": {
      name: "postcard.size.radius.full",
      cssVar: "--fsds-postcard-size-radius-full",
      ref: "core.shape.radius.full",
      fallback: 9999,
    },
    "postcard.size.gap.default": {
      name: "postcard.size.gap.default",
      cssVar: "--fsds-postcard-size-gap-default",
      ref: "core.spacing.size.05",
      fallback: 12,
    },
    "postcard.size.border.default": {
      name: "postcard.size.border.default",
      cssVar: "--fsds-postcard-size-border-default",
      ref: "core.shape.border.width.hairline",
      fallback: 1,
    },
    "postcard.typography.displayName.fontSize": {
      name: "postcard.typography.displayName.fontSize",
      cssVar: "--fsds-postcard-typography-displayName-fontSize",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "postcard.typography.displayName.fontWeight": {
      name: "postcard.typography.displayName.fontWeight",
      cssVar: "--fsds-postcard-typography-displayName-fontWeight",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "postcard.typography.handle.fontSize": {
      name: "postcard.typography.handle.fontSize",
      cssVar: "--fsds-postcard-typography-handle-fontSize",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
    "postcard.typography.content.fontSize": {
      name: "postcard.typography.content.fontSize",
      cssVar: "--fsds-postcard-typography-content-fontSize",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "postcard.typography.content.lineHeight": {
      name: "postcard.typography.content.lineHeight",
      cssVar: "--fsds-postcard-typography-content-lineHeight",
      ref: "semantic.typography.line.height.body",
      fallback: "1.5",
    },
    "postcard.typography.footer.fontSize": {
      name: "postcard.typography.footer.fontSize",
      cssVar: "--fsds-postcard-typography-footer-fontSize",
      ref: "semantic.typography.body.03",
      fallback: 14,
    },
  },
  "part_userInfo": {
    "postcard.size.gap.default": {
      name: "postcard.size.gap.default",
      cssVar: "--fsds-postcard-size-gap-default",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
  },
  "part_handle": {
    "postcard.color.foreground.primary": {
      name: "postcard.color.foreground.primary",
      cssVar: "--fsds-postcard-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
  },
  "part_timestamp": {
    "postcard.color.foreground.primary": {
      name: "postcard.color.foreground.primary",
      cssVar: "--fsds-postcard-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
  },
  "part_stat": {
    "postcard.size.gap.default": {
      name: "postcard.size.gap.default",
      cssVar: "--fsds-postcard-size-gap-default",
      ref: "core.spacing.size.03",
      fallback: 4,
    },
    "postcard.color.foreground.primary": {
      name: "postcard.color.foreground.primary",
      cssVar: "--fsds-postcard-color-foreground-primary",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
  },
} satisfies ComponentTokenScopes;

export function resolvePostcardTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(postcardTokenScopes, theme);
}
// @generated:end
