# Swift framework emitter (scaffold)

Status: **scaffold only — not wired into `TargetId`, `registry.ts`, or the
`--target=swift` CLI flag.** Imports compile in isolation; the factory casts
`id` to `TargetId` so the emitter conforms to `FrameworkEmitter` without
touching `emitter.ts`.

## Layout

Two parallel surfaces live side-by-side so the SwiftUI-vs-UIKit decision can
be deferred until contracts and primitives are mapped:

```
swift/
├── swiftui/   # SwiftUI View structs + ObservableObject behavior
│   ├── factory.ts
│   ├── component-source.ts
│   ├── hook-source.ts
│   ├── tests.ts
│   ├── surface-emit.ts
│   ├── surface-tests.ts
│   └── barrel.ts
└── uikit/     # UIView subclasses + imperative state controllers
    ├── factory.ts
    ├── component-source.ts
    ├── hook-source.ts
    ├── tests.ts
    ├── surface-emit.ts
    ├── surface-tests.ts
    └── barrel.ts
```

Each module is a stub: function signatures match the React/Vue/Svelte/Lit
counterparts, bodies throw `NotImplementedError`. Nothing here knows how to
emit Swift source yet.

## Outstanding decisions (not resolved by this scaffold)

- **`TargetId` union.** `"swift"` (or `"swiftui"` / `"uikit"`) must be added
  to `TargetId` and `KNOWN_TARGETS` in `packages/ds-codegen/src/emitter.ts`
  before the CLI can dispatch to these emitters.
- **Workspace package(s).** `packages/ds-swiftui/` and/or
  `packages/ds-uikit/` need to exist (with a `Package.swift` and a
  `Sources/<Module>/Components/` root) before `createDefaultRegistry` can
  bind output paths.
- **Stack primitive port.** `packages/ds-contracts/primitives/Stack.primitive.json`
  needs `implementation.targets.swiftui` / `implementation.targets.uikit`
  entries describing how generated components import the primitive.
- **Behavior primitives.** The six behavior primitives
  (controllable-state, dismissal, focus-trap, scroll-lock, portal,
  anchor-toggle — see root `CLAUDE.md`) need Swift analogues per surface.
  SwiftUI maps reasonably to `@State` / `@Binding` / `ObservableObject`;
  UIKit will likely need explicit controller classes (closer to Lit).
- **CSS analogue.** `emitCss(ir)` produces CSS strings for the web targets.
  Swift has no equivalent — token mapping will need a separate emitter
  (likely a `tokens.swift` per component, or a single shared
  `DesignTokens.swift`).
- **Test runner.** `XCTest` for both surfaces. The `tests.ts` stubs return
  empty strings until the test-plan-to-XCTest translation is designed.
