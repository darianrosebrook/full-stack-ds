// @generated:start imports
import { StyleSheet } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveCardTokens } from "./Card.tokens";
// @generated:end

// @generated:start styles
export function createCardStyles(theme?: FsdsTheme) {
  const tokens = resolveCardTokens(theme);
  return StyleSheet.create({
    actions: {},
    badge: {},
    content: {},
    description: {},
    footer: {},
    header: {},
    link: {},
    media: {},
    note: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["card.color.background.default"] as string | undefined), borderColor: (tokens.root?.["card.color.border.default"] as string | undefined), borderRadius: (tokens.root?.["card.size.radius.default"] as number | undefined), borderLeftWidth: (tokens.root?.["card.size.statusAccent.width"] as number | undefined), borderLeftColor: (tokens.root?.["card.color.statusAccent.default"] as string | undefined) },
    rootText: definedStyle({ color: (tokens.root?.["card.color.foreground.primary"] as string | undefined) }),
    root_variant_category: definedStyle({ borderLeftColor: (tokens.variant_category?.["card.color.statusAccent.default"] as string | undefined) }),
    root_variant_completed: definedStyle({ borderLeftColor: (tokens.variant_completed?.["card.color.statusAccent.default"] as string | undefined) }),
    root_variant_complexity: definedStyle({ borderLeftColor: (tokens.variant_complexity?.["card.color.statusAccent.default"] as string | undefined) }),
    root_variant_deprecated: definedStyle({ borderLeftColor: (tokens.variant_deprecated?.["card.color.statusAccent.default"] as string | undefined) }),
    root_variant_in_progress: definedStyle({ borderLeftColor: (tokens.variant_in_progress?.["card.color.statusAccent.default"] as string | undefined) }),
    root_variant_planned: definedStyle({ borderLeftColor: (tokens.variant_planned?.["card.color.statusAccent.default"] as string | undefined) }),
  });
}

export const styles = createCardStyles();
// @generated:end
