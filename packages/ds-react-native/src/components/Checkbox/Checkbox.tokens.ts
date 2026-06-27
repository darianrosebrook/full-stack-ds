// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const checkboxTokenScopes = {
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
      ref: "semantic.input.size.medium.padding-block",
      fallback: 8,
    },
    "box-model.padding-block-end": {
      name: "box-model.padding-block-end",
      cssVar: "--fsds-box-model-padding-block-end",
      ref: "semantic.input.size.medium.padding-block",
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
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.padding-inline-end": {
      name: "box-model.padding-inline-end",
      cssVar: "--fsds-box-model-padding-inline-end",
      ref: "semantic.input.size.medium.padding-inline",
      fallback: 12,
    },
    "box-model.gap": {
      name: "box-model.gap",
      cssVar: "--fsds-box-model-gap",
      ref: "semantic.input.size.medium.gap",
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
      ref: "semantic.input.size.medium.min-height",
      fallback: 36,
    },
    "box-model.max-height": {
      name: "box-model.max-height",
      cssVar: "--fsds-box-model-max-height",
      literal: "none",
    },
    "checkbox.color.background.default": {
      name: "checkbox.color.background.default",
      cssVar: "--fsds-checkbox-color-background-default",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "checkbox.color.border.default": {
      name: "checkbox.color.border.default",
      cssVar: "--fsds-checkbox-color-border-default",
      ref: "semantic.color.border.default",
      fallback: "#aeaeae",
    },
    "checkbox.border.width": {
      name: "checkbox.border.width",
      cssVar: "--fsds-checkbox-border-width",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "checkbox.border.radius": {
      name: "checkbox.border.radius",
      cssVar: "--fsds-checkbox-border-radius",
      ref: "semantic.shape.radius.small",
      fallback: 4,
    },
    "checkbox.transition.duration": {
      name: "checkbox.transition.duration",
      cssVar: "--fsds-checkbox-transition-duration",
      ref: "core.motion.duration.short",
      fallback: 150,
    },
    "checkbox.focus.ring.width": {
      name: "checkbox.focus.ring.width",
      cssVar: "--fsds-checkbox-focus-ring-width",
      ref: "semantic.focus.ring.width",
      fallback: 2,
    },
    "checkbox.focus.ring.color": {
      name: "checkbox.focus.ring.color",
      cssVar: "--fsds-checkbox-focus-ring-color",
      ref: "semantic.focus.ring.color",
      fallback: "#0a65fe",
    },
    "checkbox.focus.ring.style": {
      name: "checkbox.focus.ring.style",
      cssVar: "--fsds-checkbox-focus-ring-style",
      ref: "semantic.focus.ring.style",
      fallback: "solid",
    },
    "checkbox.focus.ring.offset": {
      name: "checkbox.focus.ring.offset",
      cssVar: "--fsds-checkbox-focus-ring-offset",
      ref: "semantic.focus.ring.offset",
      fallback: 2,
    },
  },
  "hover": {
    "checkbox.color.border.default": {
      name: "checkbox.color.border.default",
      cssVar: "--fsds-checkbox-color-border-default",
      ref: "semantic.color.border.hover",
      fallback: "#f29495",
    },
  },
  "checked": {
    "checkbox.color.background.default": {
      name: "checkbox.color.background.default",
      cssVar: "--fsds-checkbox-color-background-default",
      ref: "semantic.color.action.background.primary.default",
      fallback: "#d9292b",
    },
  },
  "disabled": {
    "checkbox.color.background.default": {
      name: "checkbox.color.background.default",
      cssVar: "--fsds-checkbox-color-background-default",
      ref: "semantic.color.background.disabled",
      fallback: "#cecece",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCheckboxTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(checkboxTokenScopes, theme);
}
// @generated:end
