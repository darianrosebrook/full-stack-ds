# @full-stack-ds/swiftui

Generated SwiftUI realization of the FSDS component contracts. This is a
SwiftPM package (not a pnpm workspace member): `Package.swift` and this README
are hand-maintained, as is the token runtime
`Sources/DsSwiftUI/Tokens/FsdsTheme.swift`; everything under
`Sources/DsSwiftUI/Components/` and `Sources/DsSwiftUI/primitives/` is
generated output and must not be hand-edited.

## Regenerate

From the repository root:

```bash
pnpm run generate -- --target=swiftui Switch ToggleSwitch Button Card Field Input Dialog Tooltip
```

`swiftui` is registered in `fsds.targets.json` with a **declared-admission
allowlist** (the eight realized components): `--target=all` and
`pnpm run governed:rail` emit exactly that set and skip the rest by
declaration. Explicit single-component requests bypass the allowlist and
surface the emitter's own fail-loud errors. The target remains outside the
admission rail (no railFrameworkId, not in CI's generated-driff diff) —
registration governs generation scope only.

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
| Multi-part anatomy emits with theme-driven styling | Yes — the projected-children action path (root button + single content region) emits `FsdsButton`; styling comes from `ir.tokenScopes` shipped as data and resolved through the hand-authored `FsdsTheme` (RN normal form), layering root + variant_<size> + variant_<intent> |
| SwiftUI type collisions are handled grammatically | Yes — a reserved-type table exports colliding names with an `Fsds` prefix (`Button` → `FsdsButton`), the SwiftUI analog of Lit's `StackElement` rename |
| Compound-part composers emit as region closures | Yes — Card is one ViewBuilder region per compound part (header/content/footer/description), chrome presence-driven through FsdsTheme; axes without authored defaults are optional parameters whose layer applies only when set; keyword union members (`default`) are backtick-escaped |
| Anchored tooltips emit with hover-driven open channel | Yes — Tooltip's trigger region hosts consumer content; onHover drives the controllable-state open channel into a popover with placement lowered through a grammar table (auto → platform default); anchored popovers still throw |
| Centered-modal surfaces emit as sheets with the openness channel | Yes — Dialog presents a sheet whose native dismissal (Esc/overlay) drives setOpen(false) → onOpenChange; compound regions emit as closures (`body` renames to bodyContent for the View collision); anchored surfaces still throw |
| Value-channel text controls emit with the controllable-state projection | Yes — Input is a SwiftUI TextField whose string channel projects through Binding + @State + onChange (controlled takes precedence), keyed on the IR channel rather than component identity; placeholder/disabled realized, HTML-form props omitted |
| Named-slot composers emit as region closures | Yes — Field is one ViewBuilder region per dom slot (label/control/help/error/validatingIndicator), gated on every dom leaf being a slot (TextField's component-instance leaf and Dialog's surface block stay out); the web value-channel API is omitted, not accepted-and-ignored |

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
