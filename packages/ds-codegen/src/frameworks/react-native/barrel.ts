/**
 * Barrel for the (future) `@full-stack-ds/react-native` package — scaffold.
 *
 * Same shape as the React barrel: re-export each component (and any
 * sibling compound parts) from `./components/${Name}/${Name}`. RN bundlers
 * (Metro) resolve `.tsx` without explicit extensions, so the import
 * specifiers match the React convention rather than Lit's `.js`-explicit
 * style.
 */

export function generateReactNativeBarrel(
  _componentNames: string[],
  _componentsRoot?: string,
): string {
  throw new Error(
    "generateReactNativeBarrel: not implemented — React Native emitter is scaffold-only.",
  );
}
