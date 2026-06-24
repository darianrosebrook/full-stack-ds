// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const commandTokenScopes = {
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
    "command.color.overlay": {
      name: "command.color.overlay",
      cssVar: "--fsds-command-color-overlay",
      ref: "semantic.overlay.scrim.strong",
      fallback: "rgba(0,0,0,0.64)",
    },
    "command.color.background": {
      name: "command.color.background",
      cssVar: "--fsds-command-color-background",
      ref: "semantic.color.background.primary",
      fallback: "#ffffff",
    },
    "command.color.border": {
      name: "command.color.border",
      cssVar: "--fsds-command-color-border",
      ref: "semantic.color.border.light",
      fallback: "#fceaea",
    },
    "command.color.borderLight": {
      name: "command.color.borderLight",
      cssVar: "--fsds-command-color-borderLight",
      ref: "semantic.color.border.subtle",
      fallback: "#cecece",
    },
    "command.color.text": {
      name: "command.color.text",
      cssVar: "--fsds-command-color-text",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "command.color.textMuted": {
      name: "command.color.textMuted",
      cssVar: "--fsds-command-color-textMuted",
      ref: "semantic.color.foreground.tertiary",
      fallback: "#717171",
    },
    "command.border.width": {
      name: "command.border.width",
      cssVar: "--fsds-command-border-width",
      ref: "semantic.shape.control.border.defaultWidth",
      fallback: 1,
    },
    "command.border.radius": {
      name: "command.border.radius",
      cssVar: "--fsds-command-border-radius",
      ref: "semantic.shape.control.radius.default",
      fallback: 8,
    },
    "command.size.maxWidth": {
      name: "command.size.maxWidth",
      cssVar: "--fsds-command-size-maxWidth",
      literal: 640,
    },
    "command.size.maxHeight": {
      name: "command.size.maxHeight",
      cssVar: "--fsds-command-size-maxHeight",
      literal: 400,
    },
    "command.size.topOffset": {
      name: "command.size.topOffset",
      cssVar: "--fsds-command-size-topOffset",
      literal: "10vh",
    },
    "command.size.icon": {
      name: "command.size.icon",
      cssVar: "--fsds-command-size-icon",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "command.spacing.dialogPadding": {
      name: "command.spacing.dialogPadding",
      cssVar: "--fsds-command-spacing-dialogPadding",
      ref: "core.spacing.size.04",
      fallback: 8,
    },
    "command.text.size": {
      name: "command.text.size",
      cssVar: "--fsds-command-text-size",
      ref: "semantic.typography.body.02",
      fallback: 16,
    },
    "command.text.sizeSmall": {
      name: "command.text.sizeSmall",
      cssVar: "--fsds-command-text-sizeSmall",
      ref: "semantic.typography.body.04",
      fallback: 12,
    },
    "command.shadow": {
      name: "command.shadow",
      cssVar: "--fsds-command-shadow",
      ref: "semantic.elevation.surface.floating",
      fallback: "0 4px 24px rgba(0,0,0,0.12)",
    },
    "command.opacity.disabled": {
      name: "command.opacity.disabled",
      cssVar: "--fsds-command-opacity-disabled",
      ref: "semantic.interaction.disabled.opacity",
      fallback: "0.5",
    },
    "command.color.backgroundHover": {
      name: "command.color.backgroundHover",
      cssVar: "--fsds-command-color-backgroundHover",
      ref: "semantic.interaction.background.hover",
      fallback: "#efefef",
    },
  },
} satisfies ComponentTokenScopes;

export function resolveCommandTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(commandTokenScopes, theme);
}
// @generated:end
