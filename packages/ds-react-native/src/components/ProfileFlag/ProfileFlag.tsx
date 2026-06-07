// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createProfileFlagStyles } from "./ProfileFlag.styles";
// @generated:end

// @generated:start types
export type ProfileFlagData = unknown;
// @generated:end

// @generated:start props
export interface ProfileFlagProps {
  profile?: ProfileFlagData;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function ProfileFlag({
  profile,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ProfileFlagProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createProfileFlagStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </View>
  );
}
// @generated:end
