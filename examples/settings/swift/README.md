# Swift Settings Example

A macOS SwiftUI consumer lane for the generated `packages/ds-swiftui` package.
It realizes the framework-neutral `../spec.md` against whatever the swiftui
target currently emits, and is the consumer-side falsification surface for the
package boundary: the app compiles only through `import DsSwiftUI` public
exports, reached via a local package-path dependency.

This lane is the Swift analog of the `react-native/` settings lane
(typecheck-only consumer evidence), escalated one rung: it **compiles the full
SwiftPM dependency graph** in CI (`native-compile-rail-swift` job), and it is
**runnable locally** — `swift run` opens the settings window for visual
inspection, which no other non-web lane offers today.

## Claim

A macOS SwiftUI app can consume the generated DsSwiftUI package via
`.package(path:)` and compose the settings spec's switch rows — laid out with
the FSDS `Stack` primitive — its primary/destructive action buttons
(`FsdsButton`, styled from token scopes through `FsdsTheme`), its
section chrome (`Card`, the compound-part composer with header/content/
footer/description regions), its
form rows (`FsdsField`, the named-slot composer: label/control/help/
error/validatingIndicator regions), and its text controls (`Input`, the
value-channel text-control class: controlled Binding + @State + onChange
through the Switch-proven projection) from public exports, with controlled-channel state (`Binding` + `onChange`) surviving the
package boundary.

## Falsifier

- Removing, renaming, or privatizing any public symbol the app uses from
  `DsSwiftUI` fails this lane's `swift build` — this lane is currently the
  only CI surface that compiles the generated Swift tree as a *consumed
  dependency* (the smoke lane compiles hand-authored fixtures with bare
  `swiftc`, no SwiftPM graph).
- Any edit here that reaches past the package boundary (importing from
  `packages/ds-swiftui/Sources` paths, re-declaring generated symbols) is a
  boundary failure to fix in the package, not the consumer.

## Non-claims

- **Partial realization.** `Switch` (and `ToggleSwitch`), the `Stack`
  primitive, `FsdsButton` (the projected-children action path), and `Card`
  (the compound-part composer; header/content/footer/description realize
  as region closures rather than separate subcomponent exports), and
  `FsdsField` (the named-slot composer), and `Input` (the value-channel
  text control, `value`/`defaultValue`/`onChange`/`placeholder`/`disabled`
  realized) are emitted for swiftui today.
  The web Field's value-channel/control-association API is NOT part of
  the Swift surface — the consumer's control owns state (documented
  omission, not accepted-and-ignored). Input's HTML-form props (type/required/
  name/invalid) are likewise omitted. Dialog and Tooltip do not
  exist on this target; those regions of the spec are composed from plain SwiftUI and
  marked `NOT FSDS` in the app source. This lane does not claim parity with
  the react/vue lanes.
- **Compile + manual run only.** CI compiles; it does not run the app, take
  screenshots, or execute XCUITest. Local visual check: `swift run` (opens a
  macOS window). No automated visual or interaction proof exists.
- Not a pnpm workspace member (no `package.json`); it joins no JS gates.
- The lane pins macOS 14 / Swift tools 6.0, matching the generated package
  and the target consumer app.

## Build & run

From the repository root:

```bash
swift build --package-path examples/settings/swift   # CI parity
swift run --package-path examples/settings/swift     # opens the window (local)
```

After regenerating the package:

```bash
pnpm run generate -- --target=swiftui Switch ToggleSwitch
```
