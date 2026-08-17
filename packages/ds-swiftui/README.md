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
pnpm run generate -- --target=all   # emits the allowlisted set (41 components)
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
| Body-evaluation smoke coverage | Every allowlisted component instantiates and evaluates its body through NSHostingController in the swift test lane — runtime crashes the compiler cannot see fail CI |
| Selection semantics compose the controllable substrate | Yes — SelectionState holds single+multi ControllableValue projections behind the mode-gated apply() (replace vs toggleMembership); Select lowers through it with a contract-alias-derived option struct and Menu iteration |
| Glyph pipeline renders the iconography catalog natively | Yes — hand-maintained SVGPath runtime (arc→cubic conversion, XCTest-pinned on real glyph bounds) + a generated GlyphCatalog substrate; Icon lowers through the iconGlyph class with size hints and catalog-driven decorative defaults; unknown names surface via accessibility, never silent |
| Anchored tooltips emit with hover-driven open channel | Yes — Tooltip's trigger region hosts consumer content; onHover drives the controllable-state open channel into a popover with placement lowered through a grammar table (auto → platform default); anchored popovers still throw |
| Centered-modal surfaces emit as sheets with the openness channel | Yes — Dialog presents a sheet whose native dismissal (Esc/overlay) drives setOpen(false) → onOpenChange; compound regions emit as closures (`body` renames to bodyContent for the View collision); anchored surfaces still throw |
| Value-channel text controls emit with the controllable-state projection | Yes — Input is a SwiftUI TextField whose string channel projects through Binding + @State + onChange (controlled takes precedence), keyed on the IR channel rather than component identity; placeholder/disabled realized, HTML-form props omitted |
| Named-slot composers emit as region closures | Yes — Field is one ViewBuilder region per dom slot (label/control/help/error/validatingIndicator), gated on every dom leaf being a slot (TextField's component-instance leaf and Dialog's surface block stay out); the web value-channel API is omitted, not accepted-and-ignored |

## Known gaps ledgered from the deduper consumption pilot (2026-08-15)

The first real-consumer pilot (deduper's settings window, branch
`fsds/ds-swiftui-integration`) surfaced these beyond the resolver fix:

- **Dark mode**: color fallbacks are light-mode hex (`#ffffff`/`#141414`)
  — components render light boxes on dark windows. Needs appearance-scoped
  token resolution (CSS variables give the web this for free).
- **Override seam is hex-only**: `FsdsTokenValue` cannot express system
  colors (`Color(nsColor: .windowBackgroundColor)`), so consumers cannot
  bridge dark-mode adaptation through the sanctioned channel.
- **Interaction depth**: hover/active slots exist as data but no `onHover`
  applies them; `.buttonStyle(.plain)` drops the focus ring; `9999px`
  radius reads as a pill everywhere it applies.
- **Field row form**: `FsdsField` always paints boxed chrome — no
  horizontal label-value row shape for settings screens (box-in-box when
  nested in Card).
- **Distribution**: path dependencies from sibling repos work, but the
  package cannot be consumed remotely while it lives in this monorepo.

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
