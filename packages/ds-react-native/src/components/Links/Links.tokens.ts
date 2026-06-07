// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const linksTokenScopes = {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
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
    "links.color.foreground.default": {
      name: "links.color.foreground.default",
      cssVar: "--fsds-links-color-foreground-default",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "links.color.foreground.hover": {
      name: "links.color.foreground.hover",
      cssVar: "--fsds-links-color-foreground-hover",
      ref: "semantic.interaction.text.hover",
      fallback: "#555555",
    },
    "links.color.foreground.visited": {
      name: "links.color.foreground.visited",
      cssVar: "--fsds-links-color-foreground-visited",
      ref: "semantic.color.foreground.secondary",
      fallback: "#555555",
    },
    "links.color.foreground.disabled": {
      name: "links.color.foreground.disabled",
      cssVar: "--fsds-links-color-foreground-disabled",
      ref: "semantic.color.foreground.disabled",
      fallback: "#aeaeae",
    },
    "links.color.underline.default": {
      name: "links.color.underline.default",
      cssVar: "--fsds-links-color-underline-default",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "links.spacing.gap.default": {
      name: "links.spacing.gap.default",
      cssVar: "--fsds-links-spacing-gap-default",
      ref: "core.spacing.size.02",
      fallback: 2,
    },
    "links.motion.duration.fast": {
      name: "links.motion.duration.fast",
      cssVar: "--fsds-links-motion-duration-fast",
      ref: "core.motion.duration.short",
      fallback: "150ms",
    },
    "links.focus.ring.width": {
      name: "links.focus.ring.width",
      cssVar: "--fsds-links-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "links.focus.ring.color": {
      name: "links.focus.ring.color",
      cssVar: "--fsds-links-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "links.focus.ring.style": {
      name: "links.focus.ring.style",
      cssVar: "--fsds-links-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "links.focus.ring.offset": {
      name: "links.focus.ring.offset",
      cssVar: "--fsds-links-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
    "links.focus.ring.radius": {
      name: "links.focus.ring.radius",
      cssVar: "--fsds-links-focus-ring-radius",
      ref: "core.shape.radius.small",
      fallback: 2,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveLinksTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(linksTokenScopes, theme);
}
// @generated:end
