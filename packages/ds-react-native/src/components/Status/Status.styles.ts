// @generated:start imports
import { StyleSheet } from "react-native";
import type { TextStyle } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveStatusTokens } from "./Status.tokens";
// @generated:end

// @generated:start styles
export function createStatusStyles(theme?: FsdsTheme) {
  const tokens = resolveStatusTokens(theme);
  return StyleSheet.create({
    icon: {},
    label: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["status.color.background.default"] as string | undefined), borderColor: (tokens.root?.["status.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["status.size.border.default"] as number | undefined), borderRadius: (tokens.root?.["status.size.radius.default"] as number | undefined) },
    rootText: definedStyle({ color: (tokens.root?.["status.color.foreground.primary"] as string | undefined), fontSize: (tokens.root?.["status.size.fontSize"] as number | undefined), fontWeight: (tokens.root?.["status.text.weight"] as TextStyle["fontWeight"]) }),
    rootText_variant_danger: definedStyle({ color: (tokens.variant_danger?.["status.color.foreground.primary"] as string | undefined) }),
    rootText_variant_error: definedStyle({ color: (tokens.variant_error?.["status.color.foreground.primary"] as string | undefined) }),
    rootText_variant_info: definedStyle({ color: (tokens.variant_info?.["status.color.foreground.primary"] as string | undefined) }),
    rootText_variant_success: definedStyle({ color: (tokens.variant_success?.["status.color.foreground.primary"] as string | undefined) }),
    rootText_variant_warning: definedStyle({ color: (tokens.variant_warning?.["status.color.foreground.primary"] as string | undefined) }),
    root_variant_danger: definedStyle({ backgroundColor: (tokens.variant_danger?.["status.color.background.default"] as string | undefined), borderColor: (tokens.variant_danger?.["status.color.border.default"] as string | undefined) }),
    root_variant_error: definedStyle({ backgroundColor: (tokens.variant_error?.["status.color.background.default"] as string | undefined), borderColor: (tokens.variant_error?.["status.color.border.default"] as string | undefined) }),
    root_variant_info: definedStyle({ backgroundColor: (tokens.variant_info?.["status.color.background.default"] as string | undefined), borderColor: (tokens.variant_info?.["status.color.border.default"] as string | undefined) }),
    root_variant_success: definedStyle({ backgroundColor: (tokens.variant_success?.["status.color.background.default"] as string | undefined), borderColor: (tokens.variant_success?.["status.color.border.default"] as string | undefined) }),
    root_variant_warning: definedStyle({ backgroundColor: (tokens.variant_warning?.["status.color.background.default"] as string | undefined), borderColor: (tokens.variant_warning?.["status.color.border.default"] as string | undefined) }),
  });
}

export const styles = createStatusStyles();
// @generated:end
