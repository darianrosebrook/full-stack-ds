// @generated:start imports
import { Image as RNImage, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
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
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
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
  aspectRatio,
  objectFit,
  objectPosition,
  loading,
  sizes,
  radius,
  showPlaceholder,
  fallbackSrc,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ImageProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createImageStyles(fsdsTheme), [fsdsTheme]);
  return (
    <RNImage
      testID={testID}
      style={[styles.root, style]}
    />
  );
}
// @generated:end
