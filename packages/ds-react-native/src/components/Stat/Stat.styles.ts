// @generated:start imports
import { StyleSheet } from "react-native";
import type { TextStyle } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveStatTokens } from "./Stat.tokens";
// @generated:end

// @generated:start styles
export function createStatStyles(theme?: FsdsTheme) {
  const tokens = resolveStatTokens(theme);
  return StyleSheet.create({
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined) },
    rootText: definedStyle({ color: (tokens.root?.["stat.color.foreground.value"] as string | undefined), fontSize: (tokens.root?.["stat.size.value.md"] as number | undefined), fontWeight: (tokens.root?.["stat.typography.weight.value"] as TextStyle["fontWeight"]) }),
    rootText_variant_down: definedStyle({ color: (tokens.root?.["stat.color.foreground.trend.down"] as string | undefined) }),
    rootText_variant_lg: definedStyle({ fontSize: (tokens.root?.["stat.size.value.lg"] as number | undefined) }),
    rootText_variant_neutral: definedStyle({ color: (tokens.root?.["stat.color.foreground.trend.neutral"] as string | undefined) }),
    rootText_variant_sm: definedStyle({ fontSize: (tokens.root?.["stat.size.value.sm"] as number | undefined) }),
    rootText_variant_up: definedStyle({ color: (tokens.root?.["stat.color.foreground.trend.up"] as string | undefined) }),
  });
}

export const styles = createStatStyles();
// @generated:end
