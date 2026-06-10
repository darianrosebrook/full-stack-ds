// @generated:start imports
import type { ImageStyle, StyleProp } from "react-native";
import { Image as RNImage } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createImageStyles } from "./Image.styles";
// @generated:end

// @generated:start types
export type ImageAspectRatio = "square" | "video" | "photo" | "wide" | "portrait";
export type ImageObjectFit = "cover" | "contain" | "fill" | "scale-down" | "none";
export type ImageLoading = "lazy" | "eager";
export type ImageRadius = "none" | "sm" | "md" | "lg" | "full";
// @generated:end

// @generated:start props
export interface ImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: ImageAspectRatio;
  objectFit?: ImageObjectFit;
  objectPosition?: string;
  loading?: ImageLoading;
  sizes?: string;
  radius?: ImageRadius;
  showPlaceholder?: boolean;
  fallbackSrc?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  children?: ReactNode;
  style?: StyleProp<ImageStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Image({
  src,
  alt,
  width,
  height,
  radius,
  size,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ImageProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createImageStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForRadius = radius !== undefined ? ({ "none": styles.root_variant_radius_none, "sm": styles.root_variant_radius_sm, "md": styles.root_variant_radius_md, "lg": styles.root_variant_radius_lg, "full": styles.root_variant_radius_full } as Record<string, ImageStyle | undefined>)[radius] : undefined;
  const variantStyleForSize = size !== undefined ? ({ "xs": styles.root_variant_size_xs, "sm": styles.root_variant_size_sm, "md": styles.root_variant_size_md, "lg": styles.root_variant_size_lg, "xl": styles.root_variant_size_xl, "full": styles.root_variant_size_full } as Record<string, ImageStyle | undefined>)[size] : undefined;
  return (
    <RNImage
      testID={testID}
      style={[styles.root, variantStyleForRadius, variantStyleForSize, { width: Number(width ?? 0) || undefined, height: Number(height ?? 0) || undefined }, style]}
      source={src ? { uri: String(src) } : undefined}
      accessibilityLabel={accessibilityLabel ?? alt}
      accessibilityLabelledBy={accessibilityLabelledBy}
    />
  );
}
// @generated:end
