// @generated:start imports
import { StyleSheet } from "react-native";
import type { ViewStyle } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveSkeletonTokens } from "./Skeleton.tokens";
// @generated:end

// @generated:start styles
export function createSkeletonStyles(theme?: FsdsTheme) {
  const tokens = resolveSkeletonTokens(theme);
  return StyleSheet.create({
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderRadius: (tokens.root?.["skeleton.radius.sm"] as number | undefined) },
    root_variant_actions: definedStyle({ borderRadius: (tokens.variant_actions?.["skeleton.radius.md"] as number | undefined), height: 36, minWidth: 80 }),
    root_variant_avatar: definedStyle({ borderRadius: (tokens.variant_avatar?.["skeleton.radius.md"] as number | undefined) }),
    root_variant_block: definedStyle({ borderRadius: (tokens.variant_block?.["skeleton.radius.md"] as number | undefined) }),
    root_variant_dataviz: definedStyle({ borderRadius: (tokens.variant_dataviz?.["skeleton.radius.md"] as number | undefined), width: "100%" }),
    root_variant_media: definedStyle({ borderRadius: (tokens.variant_media?.["skeleton.radius.md"] as number | undefined), width: "100%" }),
    root_variant_text: definedStyle({ borderRadius: (tokens.variant_text?.["skeleton.radius.md"] as number | undefined), height: (tokens.root?.["skeleton.shape.height.text"] as ViewStyle["height"]) }),
    root_variant_wipe: definedStyle({ backgroundColor: (tokens.variant_wipe?.["skeleton.color.base"] as string | undefined) }),
    row: {},
    shape: {},
    stack: {},
  });
}

export const styles = createSkeletonStyles();
// @generated:end
