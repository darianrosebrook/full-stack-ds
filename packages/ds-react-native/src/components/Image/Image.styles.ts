// @generated:start imports
import { StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveImageTokens } from "./Image.tokens";
// @generated:end

// @generated:start styles
export function createImageStyles(theme?: FsdsTheme) {
  const tokens = resolveImageTokens(theme);
  return StyleSheet.create({
    errorState: {},
    img: {},
    placeholder: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["image.color.background.default"] as string | undefined), borderRadius: (tokens.root?.["image.radius.none"] as number | undefined) },
    rootText: { color: (tokens.root?.["image.color.foreground.primary"] as string | undefined) },
    root_variant_radius_full: { borderRadius: (tokens.root?.["image.radius.full"] as number | undefined) },
    root_variant_radius_lg: { borderRadius: (tokens.root?.["image.radius.lg"] as number | undefined) },
    root_variant_radius_md: { borderRadius: (tokens.root?.["image.radius.md"] as number | undefined) },
    root_variant_radius_none: { borderRadius: (tokens.root?.["image.radius.none"] as number | undefined) },
    root_variant_radius_sm: { borderRadius: (tokens.root?.["image.radius.sm"] as number | undefined) },
    root_variant_size_full: { width: "100%", height: "auto" },
    root_variant_size_lg: { width: (tokens.root?.["image.size.lg"] as ViewStyle["width"]), height: (tokens.root?.["image.size.lg"] as ViewStyle["height"]) },
    root_variant_size_md: { width: (tokens.root?.["image.size.md"] as ViewStyle["width"]), height: (tokens.root?.["image.size.md"] as ViewStyle["height"]) },
    root_variant_size_sm: { width: (tokens.root?.["image.size.sm"] as ViewStyle["width"]), height: (tokens.root?.["image.size.sm"] as ViewStyle["height"]) },
    root_variant_size_xl: { width: (tokens.root?.["image.size.xl"] as ViewStyle["width"]), height: (tokens.root?.["image.size.xl"] as ViewStyle["height"]) },
    root_variant_size_xs: { width: (tokens.root?.["image.size.xs"] as ViewStyle["width"]), height: (tokens.root?.["image.size.xs"] as ViewStyle["height"]) },
  });
}

export const styles = createImageStyles();
// @generated:end
