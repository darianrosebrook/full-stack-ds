// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveCheckboxTokens } from "./Checkbox.tokens";
// @generated:end

// @generated:start styles
export function createCheckboxStyles(theme?: FsdsTheme) {
  const tokens = resolveCheckboxTokens(theme);
  return StyleSheet.create({
    indicator: { alignItems: "center", height: 20, justifyContent: "center", width: 20, backgroundColor: (tokens.root?.["checkbox.color.background.default"] as string | undefined), borderColor: (tokens.root?.["checkbox.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["checkbox.border.width"] as number | undefined), borderRadius: (tokens.root?.["checkbox.border.radius"] as number | undefined) },
    indicatorMark: { color: "#ffffff", fontSize: 12, fontWeight: "700", lineHeight: 16 },
    indicator_checked: { backgroundColor: (tokens.root?.["checkbox.color.border.default"] as string | undefined) },
    input: { paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), alignItems: "center", flexDirection: "row" },
    label: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["checkbox.color.background.default"] as string | undefined), borderColor: (tokens.root?.["checkbox.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["checkbox.border.width"] as number | undefined), borderRadius: (tokens.root?.["checkbox.border.radius"] as number | undefined), alignItems: "center", justifyContent: "center" },
  });
}

export const styles = createCheckboxStyles();
// @generated:end
