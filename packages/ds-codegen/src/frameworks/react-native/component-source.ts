/**
 * React Native component emission — scaffold.
 *
 * Target shape (two files per component):
 *
 *   ${Name}.tsx
 *     // @generated:start imports
 *     import { View, Pressable, Text } from 'react-native';
 *     import { Stack } from '@full-stack-ds/react-native/primitives';
 *     import { use${Name} } from './use${Name}';
 *     import { styles } from './${Name}.styles';
 *     // @generated:end
 *     // @custom:start imports
 *     // @custom:end
 *
 *     // @generated:start types
 *     export type ButtonSize = 'small' | 'medium' | 'large';
 *     // @generated:end
 *
 *     // @generated:start component
 *     export function Button({ ... }: ButtonProps) {
 *       return (
 *         <Pressable
 *           accessibilityRole="button"
 *           style={[styles.root, ...]}>
 *           ...
 *         </Pressable>
 *       );
 *     }
 *     // @generated:end
 *
 *   ${Name}.styles.ts
 *     // @generated:start
 *     import { StyleSheet } from 'react-native';
 *     export const styles = StyleSheet.create({
 *       root: { ... },
 *       ...
 *     });
 *     // @generated:end
 *
 * IR projection rules (deferred — must be added to ir.ts or a sibling
 * `non-rn-types.ts`, NOT branched on in this emitter):
 *   - Tag → RN component: `button` → `Pressable`, `input` → `TextInput`,
 *     `div`/`span` → `View`, text leaves → `<Text>`.
 *   - ARIA → `accessibility*` props.
 *   - Channel value strategy: same `prop:` / `channel:` parsing as React,
 *     no DOM-specific assumptions.
 *
 * Returns both files so the factory can emit them together.
 */
import type { ComponentIR } from "../../ir.js";

export interface ReactNativeComponentFiles {
  componentFile: string;
  stylesFile: string;
}

export function generateReactNativeComponentSource(
  _ir: ComponentIR,
): ReactNativeComponentFiles {
  throw new Error(
    "generateReactNativeComponentSource: not implemented — React Native emitter is scaffold-only.",
  );
}
