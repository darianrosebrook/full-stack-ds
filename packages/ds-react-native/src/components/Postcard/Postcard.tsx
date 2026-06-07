// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createPostcardStyles } from "./Postcard.styles";
// @generated:end

// @generated:start types
export type PostcardAuthor = unknown;
export type PostcardStats = unknown;
export type PostcardEmbed = unknown;
// @generated:end

// @generated:start props
export interface PostcardProps {
  postId: string;
  author: PostcardAuthor;
  timestamp: string;
  stats: PostcardStats;
  embed?: PostcardEmbed;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Postcard({
  postId,
  author,
  timestamp,
  stats,
  embed,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: PostcardProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createPostcardStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.header}
      >
        <View
          style={styles.userInfo}
        >
          <View
            style={styles.displayName}
          />
          <View
            style={styles.handle}
          />
        </View>
        <View
          style={styles.timestamp}
        />
      </View>
      <View
        style={styles.content}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
      <View
        style={styles.footer}
      >
        <View
          style={styles.stats}
        >
          <View
            style={styles.stat}
          />
        </View>
      </View>
    </View>
  );
}
// @generated:end
