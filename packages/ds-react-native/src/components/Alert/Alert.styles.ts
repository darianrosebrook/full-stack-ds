// @generated:start imports
import { StyleSheet } from "react-native";
import type { TextStyle } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveAlertTokens } from "./Alert.tokens";
// @generated:end

// @generated:start styles
export function createAlertStyles(theme?: FsdsTheme) {
  const tokens = resolveAlertTokens(theme);
  return StyleSheet.create({
    body: {},
    dismiss: {},
    icon: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["alert.color.border.primary"] as string | undefined), borderRadius: (tokens.root?.["alert.size.radius"] as number | undefined) },
    rootText: definedStyle({ fontSize: (tokens.root?.["alert.text.size"] as number | undefined), fontWeight: (tokens.root?.["alert.text.weight"] as TextStyle["fontWeight"]), color: (tokens.root?.["alert.color.foreground.primary"] as string | undefined) }),
    rootText_variant_danger: definedStyle({ color: (tokens.variant_danger?.["alert.color.foreground.primary"] as string | undefined) }),
    rootText_variant_info: definedStyle({ color: (tokens.variant_info?.["alert.color.foreground.primary"] as string | undefined) }),
    rootText_variant_success: definedStyle({ color: (tokens.variant_success?.["alert.color.foreground.primary"] as string | undefined) }),
    rootText_variant_warning: definedStyle({ color: (tokens.variant_warning?.["alert.color.foreground.primary"] as string | undefined) }),
    root_variant_danger: definedStyle({ backgroundColor: (tokens.variant_danger?.["alert.color.background.primary"] as string | undefined), borderColor: (tokens.variant_danger?.["alert.color.border.primary"] as string | undefined) }),
    root_variant_info: definedStyle({ backgroundColor: (tokens.variant_info?.["alert.color.background.primary"] as string | undefined), borderColor: (tokens.variant_info?.["alert.color.border.primary"] as string | undefined) }),
    root_variant_success: definedStyle({ backgroundColor: (tokens.variant_success?.["alert.color.background.primary"] as string | undefined), borderColor: (tokens.variant_success?.["alert.color.border.primary"] as string | undefined) }),
    root_variant_warning: definedStyle({ backgroundColor: (tokens.variant_warning?.["alert.color.background.primary"] as string | undefined), borderColor: (tokens.variant_warning?.["alert.color.border.primary"] as string | undefined) }),
    title: {},
  });
}

export const styles = createAlertStyles();
// @generated:end
