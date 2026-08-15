# @full-stack-ds/swiftui

Generated SwiftUI realization of the FSDS component contracts. This is a
SwiftPM package (not a pnpm workspace member): `Package.swift` and this README
are hand-maintained; everything under `Sources/DsSwiftUI/Components/` and
`Sources/DsSwiftUI/primitives/` is generated output and must not be
hand-edited.

## Regenerate

From the repository root:

```bash
pnpm run generate -- --target=swiftui Switch
```

`swiftui` is an **explicit-only** target in this slice: it is not in
`fsds.targets.json`, so `--target=all` and `pnpm run governed:rail` do not
generate it. Corpus-wide (default-rail) admission is a later spec once the
emitter grows past the native-collapse path.

## Build

Requires a local Swift toolchain (macOS):

```bash
swift build --package-path packages/ds-swiftui
```

## What is proven here

| Claim | Status |
|---|---|
| Contracts can emit compiling SwiftUI source through the shared IR | Yes — Switch emits a `Toggle(.switch)` View via the `native-toggle-affordance` collapse intent; `swift build` compiles the module |
| Controlled/uncontrolled channel semantics survive the projection | The `checked` channel lowers to `Binding<Bool>?` + `@State` + `onChange` with controlled-takes-precedence, matching React's `useControllableState` rule |
| Size variants resolve from typed token facts | Yes — `ir.tokenFacts` (FEAT-MOBILE-IR-001), not CSS parsing; `sm`/`lg` fall through to `md` until those tokens are authored |
| The Stack primitive lowers from `PrimitiveIR` like the web targets | Yes — axis (VStack/HStack) from `axisByVariant`, gated on `axisModes` only (native = neutral container, no imposed spacing); emitted via `emitPrimitives` with mutation-pinned gating |

## Non-claims

- Only components whose anatomy declares a collapse intent
  (`native-toggle-affordance`: Switch, ToggleSwitch) can be generated. The
  multi-part anatomy path throws an explicit not-implemented error — by design,
  never a silent fallback.
- Switch's track geometry comes from its authored size token facts
  (32/48/64 px). ToggleSwitch authors none, so it renders at the native
  Toggle's intrinsic size — its size prop has no visual effect on this target
  until its sidecar authors track tokens.
- Anchored surfaces (Tooltip/Popover), compound parts, behavior files
  (`ObservableObject`), and a shared `FsdsTheme` token module are not emitted
  yet. Size values are inlined per component from token facts.
- No XCTest target exists yet; generated tests are deferred until a test
  target lands (test files must not live inside the library target).
- The generated tree is committed but not yet covered by CI's generated-drift
  diff or `governed:rail` — that protection arrives with default-rail
  admission.
- Not published anywhere; workspace-only, consumed via local package path.
