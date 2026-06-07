// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Image as RNImage, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createAvatarStyles } from "./Avatar.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface AvatarProps {
  src?: string;
  name: string;
  priority?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Avatar({
  src,
  name,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: AvatarProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createAvatarStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel ?? name}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {src ? (
      <RNImage
        style={styles.image}
        source={src ? { uri: String(src) } : undefined}
        accessibilityLabel={""}
      />
      ) : null}
    </View>
  );
}
// @generated:end
