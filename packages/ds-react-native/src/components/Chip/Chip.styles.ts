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
    root_state_pressed: definedStyle({ backgroundColor: (tokens.root?.["chip.color.background.active"] as string | undefined) }),
    text: {},
  });
}

export const styles = createChipStyles();
// @generated:end
