# React Native framework emitter

Status: **experimental opt-in executable target.** React Native is a built-in
target-pack and can be generated with:

```bash
pnpm run generate:react-native
pnpm run typecheck:react-native
pnpm --filter @full-stack-ds/react-native run test
pnpm run governed:rail:react-native
```

It is deliberately not listed in `fsds.targets.json`, so `--target=all` and the
default governed rail still cover only the admitted Web DOM family plus Figma
descriptors. React Native becomes executable for a run when requested explicitly
as `--target=react-native`; its admission rail is likewise opt-in through
`--framework=react-native`.

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
- Participates in the admission rail when invoked with
  `pnpm run governed:rail:react-native`. This binds generated RN artifacts to
  contract bytes, RN emitter source bytes, environment provenance, and the RN
  package typecheck/test commands.
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

- Surface behavior is not admitted. `surface-emit.ts` intentionally keeps
  surfaces on the generic component path until a native `Modal`/`BackHandler`
  substrate is implemented.
- Token realization is native and per-component, but still narrow. The RN
  target consumes `ComponentIR.tokenScopes` and `FsdsTheme` overrides; it does
  not yet project every CSS property into native `ViewStyle`/`TextStyle`.
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
