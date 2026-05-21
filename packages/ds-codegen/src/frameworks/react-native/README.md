# React Native framework emitter (scaffold)

Status: **scaffold only — not wired into `TargetId`, `registry.ts`, or the
`--target=react-native` CLI flag.** Imports compile in isolation; the factory
casts `id` to `TargetId` so the emitter conforms to `FrameworkEmitter` without
touching `emitter.ts`.

## Layout

```
react-native/
├── factory.ts
├── component-source.ts
├── hook-source.ts
├── tests.ts
├── surface-emit.ts
├── surface-tests.ts
└── barrel.ts
```

Each module is a stub: function signatures match the React/Vue/Svelte/Lit
counterparts, bodies throw `NotImplementedError`.

## Why this isn't just "React with different imports"

React Native shares the React component model (functional components, hooks,
JSX, controlled state), so the React emitter is the closest analogue. But the
output surface diverges enough that copying React verbatim won't work:

- **No DOM, no CSS.** `<div>` / `<button>` / `<input>` become `<View>` /
  `<Pressable>` / `<TextInput>`. There is no `className`; styles are JS
  objects passed via `style={...}`. The `emitCss(ir)` path used by the web
  targets is replaced by a per-component `StyleSheet.create({ ... })` block.
- **Stack ≠ flexbox-with-CSS.** RN's layout engine is flexbox-only and lives
  in JS — Stack maps to a `<View style={{ flexDirection, gap, ... }}>`
  wrapper, not a styled element.
- **Accessibility API is different.** `role` → `accessibilityRole`,
  `aria-*` → `accessibility*` props (`accessibilityLabel`,
  `accessibilityState`, `accessibilityValue`). ARIA projection happens at IR
  consumption time, not in the contract.
- **Behavior primitives.** `useControllableState` ports cleanly (it's
  framework-agnostic React). `useDismissal`, `useFocusTrap`, `usePortal`,
  `useScrollLock`, `useAnchorToggle` all need RN-native rewrites — there
  is no `document`, no real portal, no global focus model. Modal /
  Popover surfaces likely use RN's built-in `<Modal>` for the portal layer
  and `BackHandler` for Android escape.
- **No `<head>`, no global styles.** Theme tokens flow through a
  `ThemeProvider` context or are resolved at codegen time into the
  per-component `StyleSheet`.

## Outstanding decisions (not resolved by this scaffold)

- **`TargetId` union.** `"react-native"` must be added to `TargetId` and
  `KNOWN_TARGETS` in `packages/ds-codegen/src/emitter.ts` before the CLI can
  dispatch.
- **Workspace package.** `packages/ds-react-native/` needs to exist with
  `src/components/` and a peer `react-native` dep before
  `createDefaultRegistry` can bind output paths.
- **Stack primitive port.** `Stack.primitive.json` needs an
  `implementation.targets.react-native` entry — RN's Stack is a `<View>`
  wrapper with flexbox style props, not a CSS-driven element.
- **Behavior primitives.** Port `useControllableState` (works as-is) and
  rewrite the rest for RN. Likely lives in `packages/ds-react-native/src/primitives/`.
- **CSS analogue.** `emitCss(ir)` does not apply. Either:
  - emit `StyleSheet.create({ ... })` per component in the same `.tsx` file, or
  - emit a sibling `${Name}.styles.ts` for token + style separation.
- **Test runner.** `@testing-library/react-native` + jest. Behavioral tests
  consume the same `buildComponentTestPlan` output; channel/escape/a11y
  coverage stays in sync with the web targets where the semantics overlap
  (e.g. there is no "Escape closes" on iOS — that surface is
  platform-conditional).
- **Surface family.** Tooltip has no native RN equivalent; Popover maps to
  `<Modal transparent>`. `surface-emit.ts` will need to branch on platform
  more aggressively than the web emitters do.
