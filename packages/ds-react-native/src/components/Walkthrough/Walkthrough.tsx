// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createWalkthroughStyles } from "./Walkthrough.styles";
// @generated:end

// @generated:start types
export type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type WalkthroughStepSpec = unknown;
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
  index: controlledStep,
  defaultIndex = 0,
  onStepChange,
  onComplete,
  onSkip,
  label = "Feature tour",
  storageKey,
  autoStart = false,
  closeOnOutsideClick = false,
  placement = "auto",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: WalkthroughProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createWalkthroughStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledStep, setUncontrolledStep] = useState<number>((defaultIndex ?? 0) as number);
  const step = controlledStep ?? uncontrolledStep;
  const setStepValue = useCallback((next: number) => {
    if (controlledStep === undefined) setUncontrolledStep(next);
    onStepChange?.(next);
  }, [controlledStep, onStepChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={label}
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
                style={styles.dot}
                accessibilityLabel={(item as any).title}
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
