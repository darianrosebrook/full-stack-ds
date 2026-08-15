# Swift framework emitter

Status: **swiftui is a registered explicit-only builtin target** (`--target=swiftui`),
emitting into the SwiftPM package `packages/ds-swiftui`. It is not in
`fsds.targets.json`, so `--target=all` and `pnpm run governed:rail` do not
generate it, and it carries no `railFrameworkId` (outside the admission rail)
until the emitter covers the corpus. `uikit/` remains scaffold-only.

## What is implemented (swiftui)

- `component-source.ts` — the native-collapse path: contracts whose anatomy
  declares `native-toggle-affordance` (Switch, ToggleSwitch) emit a SwiftUI
  `Toggle(.switch)` View with the full controllable-state channel projection
  (`Binding<Bool>?` + `@State` + `onChange`, controlled-takes-precedence),
  union types as Swift enums, a11y modifiers, and size variants resolved from
  typed `ir.tokenFacts`. The size default comes from the contract's
  `props[].default` fact (never a hardcoded member); when no track-geometry
  token facts are authored the `.frame` modifier is omitted and the native
  control keeps its intrinsic size.
- `factory.ts` — full `FrameworkEmitter` conformance. Tests return `[]`
  (XCTest emission is deferred until a SwiftPM test target exists — test
  files must not live inside the library target). Hooks return no file
  (controllable-state lives inside the View struct until a component needs
  focus-trap/portal/dismissal behavior).
- `barrel.ts` + `discoverComponentIds` — SwiftPM auto-exports target sources,
  so the barrel is a comment-only generation stamp.

## What still throws (fail-loud, by design)

- Multi-part anatomy (any contract without a collapse intent, e.g. Button).
- Anchored surfaces (`surface-emit.ts`: Tooltip/Popover `.popover`/overlay
  lowering).
- `tests.ts` — deferred, see above.

## Layout

```
swift/
├── swiftui/   # SwiftUI View structs (registered, explicit-only)
│   ├── factory.ts
│   ├── component-source.ts (+ .test.ts)
│   ├── hook-source.ts      # returns null for now — see file docstring
│   ├── tests.ts            # deferred — throws if wired prematurely
│   ├── surface-emit.ts     # scaffold — throws
│   ├── surface-tests.ts    # scaffold — throws
│   └── barrel.ts
└── uikit/     # UIView subclasses — scaffold only, all stubs throw
```

## History

- Round 1 (paper traceability) and round 2 (Switch emitter, byte-identical
  to a stripped golden) are documented in
  `docs/internal/non-web-generation.md` (machine-local) and pinned by
  `__golden__/Switch/` + `component-source.test.ts`.
- `FEAT-SWIFTUI-EMITTER-WIRING-01` registered the target, created the
  SwiftPM output package, and fixed the hardcoded `.md` default the
  ToggleSwitch contract exposed.
