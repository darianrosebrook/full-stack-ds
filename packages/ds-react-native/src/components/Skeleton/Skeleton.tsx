// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createSkeletonStyles } from "./Skeleton.styles";
// @generated:end

// @generated:start types
export type SkeletonVariant = "block" | "text" | "avatar" | "media" | "dataviz" | "actions";
export type SkeletonAnimate = "shimmer" | "wipe" | "pulse" | "none";
export type SkeletonDensity = "compact" | "regular" | "spacious";
export type SkeletonRadius = "sm" | "md" | "lg";
export type SkeletonLines = number | { min: number; max: number };
// @generated:end

// @generated:start props
export interface SkeletonProps {
  variant?: SkeletonVariant;
  animate?: SkeletonAnimate;
  density?: SkeletonDensity;
  aspectRatio?: string;
  lines?: SkeletonLines;
  radius?: SkeletonRadius;
  decorative?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Skeleton({
  variant = "block",
  animate = "shimmer",
  ariaLabel,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SkeletonProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createSkeletonStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForVariant = variant !== undefined ? ({ "block": styles.root_variant_block, "text": styles.root_variant_text, "avatar": styles.root_variant_avatar, "media": styles.root_variant_media, "dataviz": styles.root_variant_dataviz, "actions": styles.root_variant_actions } as Record<string, ViewStyle | undefined>)[variant] : undefined;
  const variantStyleForAnimate = animate !== undefined ? ({ "wipe": styles.root_variant_wipe } as Record<string, ViewStyle | undefined>)[animate] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForVariant, variantStyleForAnimate, style]}
      accessibilityLabel={accessibilityLabel ?? ariaLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </View>
  );
}
// @generated:end
