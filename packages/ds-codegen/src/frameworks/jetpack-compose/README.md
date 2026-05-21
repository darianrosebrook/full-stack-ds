# Jetpack Compose framework emitter (scaffold)

Status: **scaffold only — not wired into `TargetId`, `registry.ts`, or the
`--target=jetpack-compose` CLI flag.** Imports compile in isolation; the
factory casts `id` to `TargetId` so the emitter conforms to
`FrameworkEmitter` without touching `emitter.ts`.

## Layout

```
jetpack-compose/
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

## How Compose maps to the contract model

Compose's primary surface is `@Composable` functions — declarative, like
React/SwiftUI, but with a different state model (`MutableState<T>` /
`remember { mutableStateOf(...) }`) and no return value (composables emit
UI as side effects of the call). The contract → IR → emitter pipeline
adapts as follows:

- **Components emit `.kt` files.** Each component becomes a top-level
  `@Composable fun ${Name}(...)`. Compound parts are sibling
  composables in the same file (e.g. `DialogHeader`, `DialogBody`).
- **Stack primitive.** Maps to `Row` / `Column` / `Box` with a thin
  `Stack(axis = ..., gap = ...)` wrapper composable in the workspace
  package. The wrapper resolves contract `axis`/`gap` to Compose's
  `Arrangement.spacedBy(...)` and `Modifier.padding(...)`.
- **Channels.** `useControllableState` analogue is the Compose
  controlled/uncontrolled state pattern: an optional `value: T?` +
  `onValueChange: ((T) -> Unit)?` param pair, with
  `remember { mutableStateOf(defaultValue) }` as the uncontrolled
  fallback. This is the established Material 3 idiom — no custom hook
  primitive is required.
- **Behavior primitives.** Most translate to Compose effects:
  - Focus trap → `Modifier.focusGroup()` + `FocusRequester`
  - Scroll lock → `Modifier.scrollable(enabled = false)` on the
    background, or a `Dialog` host (which traps both)
  - Portal → `Dialog` / `Popup` composables (built-in to Compose UI)
  - Dismissal → `Modifier.onKeyEvent { ... }` for escape, `Modifier.clickable`
    on a scrim for outside-press, `BackHandler` for the system back gesture
  - Anchor toggle → `Modifier.onGloballyPositioned` + `Popup` with a
    custom `PopupPositionProvider`
- **ARIA → semantics.** `Modifier.semantics { role = ...; contentDescription = ...; stateDescription = ... }`. The IR's normalized ARIA projection feeds this directly; no Compose-specific re-interpretation in the emitter.
- **Tokens.** No CSS analogue. Tokens compile to a generated
  `Theme.kt` exposing a `MaterialTheme`-compatible `Colors` / `Typography` /
  `Shapes` set, consumed via `MaterialTheme.colorScheme.*` inside the
  component bodies.

## Outstanding decisions (not resolved by this scaffold)

- **`TargetId` union.** `"jetpack-compose"` (or `"compose"`) must be added
  to `TargetId` and `KNOWN_TARGETS` in `packages/ds-codegen/src/emitter.ts`
  before the CLI can dispatch.
- **Workspace package.** Compose lives in a Gradle/Android module, not a
  pnpm workspace. Output likely lands in
  `packages/ds-jetpack-compose/library/src/main/kotlin/com/fullstackds/...`
  with a `build.gradle.kts` and a `Package.kt` per component. The
  registry binding needs to special-case non-pnpm workspaces, or the
  output root needs to live under `packages/` with a manual Gradle
  bridge.
- **Stack primitive port.** `Stack.primitive.json` needs an
  `implementation.targets.jetpack-compose` entry.
- **Behavior primitives.** Most are Compose-stdlib (`Dialog`, `Popup`,
  `BackHandler`, `FocusRequester`); the `useControllableState` analogue is
  inline state hoisting and doesn't need a separate primitive.
- **Test runner.** `androidx.compose.ui.test.junit4` + JUnit. Behavioral
  tests consume `buildComponentTestPlan` output; assertions go through
  `composeTestRule.onNodeWithTag(...)` / `assertIsDisplayed()` /
  `performClick()`. Accessibility coverage uses the semantics tree
  (`onNodeWithContentDescription`, `assert(hasContentDescription(...))`).
- **Compound-state-container components (Tabs-shaped).** Same convention
  as the other emitters: smoke + a11y in `@generated`, behavioral
  coverage in `@custom`.
- **Surface family.** Tooltip → `TooltipBox` (Material 3); Popover →
  `Popup` with a custom positioner. Anchor adoption uses
  `Modifier.onGloballyPositioned` rather than slot composition — Compose
  doesn't have a slot model in the same sense as Vue/Svelte.
