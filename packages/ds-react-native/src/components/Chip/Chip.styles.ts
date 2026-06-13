// @generated:start imports
import { StyleSheet } from "react-native";
import type { TextStyle } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveChipTokens } from "./Chip.tokens";
// @generated:end

// @generated:start styles
export function createChipStyles(theme?: FsdsTheme) {
  const tokens = resolveChipTokens(theme);
  return StyleSheet.create({
    icon: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["chip.color.background.default"] as string | undefined), borderColor: (tokens.root?.["chip.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["chip.size.border"] as number | undefined), borderRadius: (tokens.root?.["chip.size.radius"] as number | undefined), alignItems: "center", justifyContent: "center" },
    rootText: definedStyle({ color: (tokens.root?.["chip.color.foreground.default"] as string | undefined), fontSize: (tokens.root?.["chip.text.size"] as number | undefined), fontWeight: (tokens.root?.["chip.text.weight"] as TextStyle["fontWeight"]) }),
    rootText_variant_large: definedStyle({ fontSize: (tokens.variant_large?.["chip.text.size"] as number | undefined) }),
    rootText_variant_medium: definedStyle({ fontSize: (tokens.variant_medium?.["chip.text.size"] as number | undefined) }),
    rootText_variant_selected: definedStyle({ color: (tokens.variant_selected?.["chip.color.foreground.default"] as string | undefined) }),
    rootText_variant_small: definedStyle({ fontSize: (tokens.variant_small?.["chip.text.size"] as number | undefined) }),
    root_state_pressed: definedStyle({ backgroundColor: (tokens.root?.["chip.color.background.active"] as string | undefined) }),
    root_variant_large: definedStyle({ gap: (tokens.variant_large?.["chip.size.gap"] as number | undefined), minHeight: (tokens.variant_large?.["chip.size.minHeight"] as number | undefined) }),
    root_variant_medium: definedStyle({ gap: (tokens.variant_medium?.["chip.size.gap"] as number | undefined), minHeight: (tokens.variant_medium?.["chip.size.minHeight"] as number | undefined) }),
    root_variant_selected: definedStyle({ backgroundColor: (tokens.variant_selected?.["chip.color.background.default"] as string | undefined), borderColor: (tokens.variant_selected?.["chip.color.border.default"] as string | undefined) }),
    root_variant_small: definedStyle({ gap: (tokens.variant_small?.["chip.size.gap"] as number | undefined), minHeight: (tokens.variant_small?.["chip.size.minHeight"] as number | undefined) }),
    text: {},
  });
}

export const styles = createChipStyles();
// @generated:end
