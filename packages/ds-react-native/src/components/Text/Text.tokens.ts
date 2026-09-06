// @generated:start imports
import { resolveComponentTokens, type ComponentTokenScopes, type FsdsTheme } from "../../tokens";
// @generated:end

// @generated:start tokens
export const textTokenScopes = {
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
      ref: "semantic.display.size.gap",
      fallback: 4,
    },
    "box-model.min-width": {
      name: "box-model.min-width",
      cssVar: "--fsds-box-model-min-width",
      literal: 0,
    },
    "box-model.min-height": {
      name: "box-model.min-height",
      cssVar: "--fsds-box-model-min-height",
      literal: 0,
    },
    "text.color.foreground.primary": {
      name: "text.color.foreground.primary",
      cssVar: "--fsds-text-color-foreground-primary",
      ref: "semantic.color.foreground.primary",
      fallback: "#141414",
    },
    "text.typography.fontWeight.light": {
      name: "text.typography.fontWeight.light",
      cssVar: "--fsds-text-typography-font-weight-light",
      ref: "semantic.typography.font.weight.light",
      fallback: "300",
    },
    "text.typography.fontWeight.regular": {
      name: "text.typography.fontWeight.regular",
      cssVar: "--fsds-text-typography-font-weight-regular",
      ref: "semantic.typography.font.weight.regular",
      fallback: "400",
    },
    "text.typography.fontWeight.medium": {
      name: "text.typography.fontWeight.medium",
      cssVar: "--fsds-text-typography-font-weight-medium",
      ref: "semantic.typography.font.weight.medium",
      fallback: "500",
    },
    "text.typography.fontWeight.bold": {
      name: "text.typography.fontWeight.bold",
      cssVar: "--fsds-text-typography-font-weight-bold",
      ref: "semantic.typography.font.weight.bold",
      fallback: "700",
    },
    "text.size.xs": {
      name: "text.size.xs",
      cssVar: "--fsds-text-size-xs",
      ref: "core.typography.ramp.2",
      fallback: 12,
    },
    "text.size.sm": {
      name: "text.size.sm",
      cssVar: "--fsds-text-size-sm",
      ref: "core.typography.ramp.3",
      fallback: 14,
    },
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.4",
      fallback: 16,
    },
    "text.size.lg": {
      name: "text.size.lg",
      cssVar: "--fsds-text-size-lg",
      ref: "core.typography.ramp.5",
      fallback: 18,
    },
    "text.size.xl": {
      name: "text.size.xl",
      cssVar: "--fsds-text-size-xl",
      ref: "core.typography.ramp.6",
      fallback: 20,
    },
    "text.size.2xl": {
      name: "text.size.2xl",
      cssVar: "--fsds-text-size-2xl",
      ref: "core.typography.ramp.7",
      fallback: 24,
    },
    "text.size.3xl": {
      name: "text.size.3xl",
      cssVar: "--fsds-text-size-3xl",
      ref: "core.typography.ramp.8",
      fallback: 32,
    },
  },
  "variant_display": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.11",
      fallback: 60,
    },
  },
  "variant_headline": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.8",
      fallback: 32,
    },
  },
  "variant_title": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.6",
      fallback: 20,
    },
  },
  "variant_body": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.4",
      fallback: 16,
    },
  },
  "variant_caption": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.2",
      fallback: 12,
    },
  },
  "variant_overline": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.2",
      fallback: 12,
    },
  },
  "variant_code": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.3",
      fallback: 14,
    },
  },
  "variant_xs": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "text.size.xs",
      fallback: 12,
    },
  },
  "variant_sm": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "text.size.sm",
      fallback: 14,
    },
  },
  "variant_md": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "core.typography.ramp.4",
      fallback: 16,
    },
  },
  "variant_lg": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "text.size.lg",
      fallback: 18,
    },
  },
  "variant_xl": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "text.size.xl",
      fallback: 20,
    },
  },
  "variant_2xl": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "text.size.2xl",
      fallback: 24,
    },
  },
  "variant_3xl": {
    "text.size.md": {
      name: "text.size.md",
      cssVar: "--fsds-text-size-md",
      ref: "text.size.3xl",
      fallback: 32,
    },
  },
} satisfies ComponentTokenScopes;

export function resolveTextTokens(theme?: FsdsTheme) {
  return resolveComponentTokens(textTokenScopes, theme);
}
// @generated:end
