# React Native framework emitter

Status: **default rail target** (FEAT-MOBILE-RN-001). React Native is a
built-in target-pack listed in `fsds.targets.json`, so `--target=all`, the
default `governed:rail`, and the CI/pre-push generated-tree drift checks all
cover `packages/ds-react-native/`. Targeted runs remain available:

```bash
pnpm run generate:react-native
pnpm run typecheck:react-native
pnpm run test:react-native
pnpm run governed:rail:react-native
```

## Current slice

- Emits all 47 current component contracts into `packages/ds-react-native/`.
- Typechecks against real React Native package types; the old local
  `declare module "react-native"` shim is not part of the rail.
- Emits Vitest suites for every component. Non-admitted components keep type
  surface smokes; the first primitive/form slice gets focused host-render
  assertions through `react-test-renderer`.
- Emits per-component sibling `.tokens.ts` files that mirror the web
  `<Component>.tokens.css` artifact as typed native token scopes.
- Emits per-component sibling `.styles.ts` factories with `StyleSheet.create`.
  Structural style factories consume the typed token scopes through the RN
  theme context rather than hardcoded CSS fallbacks.
- Realizes variant styling from IR facts: per-variant StyleSheet entries are
  joined from root `cssBlocks` declarations × `variant_*` token scopes (the
  Button/Alert token-re-declaration pattern), or dereferenced through the
  owning scope when the variant block declares CSS properties directly (the
  Avatar/Text pattern). Variant axes without a contract prop get a
  synthesized union-typed prop from the class recipe, mirroring web. Text
  props land on a `rootText` style applied to the root text wrapper.
- Participates in the default admission rail (`pnpm run governed:rail`). This
  binds generated RN artifacts to contract bytes, RN emitter source bytes,
  environment provenance, and the RN package typecheck/test commands.
- Collapses contracts that declare `native-toggle-affordance` to RN's native
  `Switch` primitive.
- Walks `ComponentIR.dom` for the rest of the corpus, lowering common HTML-ish
  hosts to `View`, `Pressable`, `TextInput`, `RNText`, and `RNImage`.
- Keeps channel state inside the generated component body for now; no separate
  RN behavior hooks are emitted yet.
- `examples/settings/react-native` is a public-export consumer typecheck lane
  for the first slice. It intentionally avoids overlays while surfaces remain
  unadmitted.

## Known gaps

- Non-anchored presence surfaces are admitted through the generic path
  (`rnSurfaceLowering` in `surface-emit.ts`): blocking surfaces (Dialog,
  Sheet) render an RN `Modal` host with escape → `onRequestClose` and
  outside-click → overlay Pressable, both gated by the contract's enabledBy
  props; non-blocking surfaces (Toast) render an in-tree live region.
  Anchored kinds (Tooltip, Popover, coachmark) still need an
  anchor-measurement substrate and remain unadmitted.
- Token realization is native and per-component, but still narrow. The RN
  target consumes `ComponentIR.tokenScopes` and `FsdsTheme` overrides; it does
  not yet project every CSS property into native `ViewStyle`/`TextStyle`.
- Variant realization covers root-scoped value modifiers only. Part-scoped
  variant styling (Toast intents, Tabs pills), boolean modifiers (Card
  `--inset`), interactive state styling (pressed/disabled scopes), and
  em-relative sizing (Spinner's font-size trick) are not yet realized.
- Contract object aliases are emitted as `unknown` when no native data shape is
  available. This preserves typecheck without inventing schema semantics.
- `aria-labelledby` maps to `accessibilityLabelledBy`, which is Android-only in
  React Native. Cross-platform label derivation remains a follow-up.
- Runtime tests use a Vitest-only host shim for `View`/`Text`/`Pressable` etc.
  because Vite does not parse React Native's Flow runtime entrypoint directly.
  Type admission still resolves the real `react-native` package types.
- RN rail admission does not prove simulator/device execution, native visual
  parity, or platform accessibility parity.

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
