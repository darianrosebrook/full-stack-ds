// @generated:start imports
import { StyleSheet } from "react-native";
import type { TextStyle } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveAlertNoticeTokens } from "./AlertNotice.tokens";
// @generated:end

// @generated:start styles
export function createAlertNoticeStyles(theme?: FsdsTheme) {
  const tokens = resolveAlertNoticeTokens(theme);
  return StyleSheet.create({
    body: {},
    dismiss: {},
    icon: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["alert-notice.color.border.info"] as string | undefined), borderRadius: (tokens.root?.["alert-notice.size.radius"] as number | undefined) },
    rootText: { color: (tokens.root?.["alert-notice.color.foreground.danger"] as string | undefined), fontSize: (tokens.root?.["alert-notice.text.size"] as number | undefined), fontWeight: (tokens.root?.["alert-notice.text.weight"] as TextStyle["fontWeight"]) },
    rootText_variant_error: { color: (tokens.root?.["alert-notice.color.foreground.danger"] as string | undefined) },
    rootText_variant_info: { color: (tokens.root?.["alert-notice.color.foreground.info"] as string | undefined) },
    rootText_variant_success: { color: (tokens.root?.["alert-notice.color.foreground.success"] as string | undefined) },
    rootText_variant_warning: { color: (tokens.root?.["alert-notice.color.foreground.warning"] as string | undefined) },
    root_variant_error: { backgroundColor: (tokens.root?.["alert-notice.color.background.danger"] as string | undefined), borderColor: (tokens.root?.["alert-notice.color.border.danger"] as string | undefined) },
    root_variant_info: { backgroundColor: (tokens.root?.["alert-notice.color.background.info"] as string | undefined), borderColor: (tokens.root?.["alert-notice.color.border.info"] as string | undefined) },
    root_variant_success: { backgroundColor: (tokens.root?.["alert-notice.color.background.success"] as string | undefined), borderColor: (tokens.root?.["alert-notice.color.border.success"] as string | undefined) },
    root_variant_warning: { backgroundColor: (tokens.root?.["alert-notice.color.background.warning"] as string | undefined), borderColor: (tokens.root?.["alert-notice.color.border.warning"] as string | undefined) },
    title: {},
  });
}

export const styles = createAlertNoticeStyles();
// @generated:end
