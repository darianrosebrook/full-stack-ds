// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createWalkthroughStyles } from "./Walkthrough.styles";
// @generated:end

// @generated:start types
export type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type WalkthroughStepSpec = { anchor: string; title: string; description?: string };
// @generated:end

// @generated:start props
export interface WalkthroughProps {
  steps?: WalkthroughStepSpec[];
  index?: number;
  defaultIndex?: number;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  label?: string;
  storageKey?: string;
  autoStart?: boolean;
  closeOnOutsideClick?: boolean;
  placement?: WalkthroughPlacement;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Walkthrough({
  steps = [{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}],
  label = "Feature tour",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: WalkthroughProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createWalkthroughStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={styles.content}
      >
        <View
          style={styles.title}
        >
          {typeof children === "string" ? <RNText>{children}</RNText> : children}
        </View>
        <RNText
          style={styles.description}
          accessibilityRole="text"
        >
          {children}
        </RNText>
      </View>
      <View
        style={styles.controls}
      >
        <Pressable
          style={styles.skip}
          accessibilityRole="button"
        />
        <Pressable
          style={styles.prev}
          accessibilityRole="button"
        />
        <View
          style={styles.dots}
        >
          {(steps ?? []).map((item, index) => (
              <Pressable
                key={index}
                style={styles.dot}
                accessibilityLabel={item.title}
                accessibilityRole="button"
              />
            ))}
        </View>
        <View
          style={styles.counter}
        />
        <Pressable
          style={styles.next}
          accessibilityRole="button"
        />
      </View>
    </View>
  );
}
// @generated:end
