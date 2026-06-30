# Settings app — spec

A single-page settings UI. Framework-agnostic. Every implementation under `examples/settings/<framework>/` must satisfy this spec using only the public API of its corresponding `@full-stack-ds/<framework>` package.

## Why this app

This spec exercises **forms, overlays, and basic layout** — the most common slice of any consumer app. It deliberately stays small (~150-300 LoC per implementation) so parity bugs are easy to find.

Components covered: `Stack`, `Card` (+ `CardHeader`, `CardContent`, `CardFooter`), `Field`, `Input`, `Switch`, `Button`, `Dialog` (+ `DialogHeader`, `DialogTitle`, `DialogBody`, `DialogFooter`), `Tooltip` (+ `Tooltip.Trigger`, `Tooltip.Content`).

## Layout

One page. Three vertically-stacked sections, each a `Card`:

1. **Profile** — form with two `Field`s (display name, email).
2. **Preferences** — two rows, each a label + `Switch` (dark mode, email notifications).
3. **Danger zone** — a single destructive `Button` that opens a confirm `Dialog`.

Use `Stack` for all multi-child layout. No hand-rolled `<div>` wrappers. `Stack` exposes only `as` and `variant: "vertical" | "horizontal"` — spacing comes from the component CSS that ships with the package.

## Section: Profile

A `Card` containing:

- `CardHeader` with heading text "Profile".
- `CardContent` with two `Field`s. Each `Field` takes its label via the `label` prop and wraps an `Input`:
  - Display name (`<Field name="displayName" label="Display name" required>` with `<Input>` inside, default value `"Ada Lovelace"`).
  - Email (`<Field name="email" label="Email" required>` with `<Input type="email">`, default value `"ada@example.com"`).
- `CardFooter` with one `Button` (`variant="primary"`, label "Save profile").

Interactions:

- Editing either `Input` updates local state.
- Clicking "Save profile" is a no-op (logs to console). No actual persistence.

## Section: Preferences

A `Card` containing:

- `CardHeader` with heading text "Preferences".
- `CardContent` with two horizontal rows. Each row is a `<Stack variant="horizontal">` containing a label and a `Switch`:
  - Row 1: text "Dark mode" + `Switch` (default `false`).
  - Row 2: `Tooltip` wrapping the text "Email notifications", followed by a `Switch` (default `true`). The `Tooltip.Content` reads "Product announcements and security alerts only."

Interactions:

- Toggling either `Switch` updates local state.
- Hovering or focusing the "Email notifications" label shows the tooltip; moving away or pressing `Escape` dismisses it.

## Section: Danger zone

A `Card` containing:

- `CardHeader` with heading text "Danger zone".
- `CardContent` with explanatory text: "Permanently delete your account. This cannot be undone."
- `CardFooter` with one `Button` (`variant="destructive"`, label "Delete account").

Interactions:

- Clicking "Delete account" opens a `Dialog` (`modal`, `dismissible`):
  - `DialogHeader` with `DialogTitle` "Delete account?"
  - `DialogBody` with text "This will permanently remove your account. Type DELETE to confirm."
  - An `Input` inside the body (`name="confirmation"`).
  - `DialogFooter` with two `Button`s:
    - "Cancel" (`variant="secondary"`) — closes the dialog.
    - "Delete" (`variant="destructive"`) — disabled until the input value equals exactly `"DELETE"`. When enabled and clicked, closes the dialog and logs to console. No actual persistence.
- Pressing `Escape` closes the dialog (since `closeOnEscape` defaults to true).
- Clicking the backdrop closes the dialog (since `closeOnBackdropClick` defaults to true).
- Focus is trapped inside the dialog while open.

## Out of scope

- Routing. Single page only.
- Persistence. Submitting any form logs to console.
- Theming beyond what `@full-stack-ds/<framework>/dist/index.css` ships with.
- Responsive design beyond what `Stack` provides for free.
- Accessibility beyond what the components ship with. (If something is missing, that's a component bug, not an example bug — file it.)

## Acceptance

A working implementation:

1. Builds without errors (`pnpm build`).
2. Renders all three sections.
3. All seven interactions above work as described.
4. Uses only components and types from the public `@full-stack-ds/<framework>` exports. No reaching into `dist/` internals, no copying source.

If any of these requires an escape hatch (a hand-rolled component, a styling override, a private import), that gap is a bug in the framework package — open an issue, do not work around it in the example.

## Findings from the first implementation (React)

Recording the consumer-API gaps surfaced while scaffolding `settings/react/`. Each is a real bug the example would never have caught while the showcase wasn't dogfooding.

1. **`Stack` has no spacing/alignment props.** Only `as` and `variant: "vertical" | "horizontal"`. Real consumers will reach for `gap`, `justify`, `align`. The shipped component CSS dictates spacing entirely, which is fine for single-purpose layouts but rules out the "row with space-between" pattern in row 1/row 2 of Preferences without inline styling.
2. **`CardTitle` is not exported (and not in source).** `Card` ships with `CardHeader`, `CardContent`, `CardFooter`, `CardDescription`, but no title primitive — inconsistent with `Dialog`, which exports `DialogTitle`.
3. **`Tooltip` uses dot notation (`Tooltip.Trigger`, `Tooltip.Content`) instead of sibling exports** like every other compound component in the system. The barrel exports `TooltipTriggerProps`/`TooltipContentProps` types but not the components themselves. Either the export is incomplete or the convention is inconsistent.
4. **`Field` exports a `FieldHeader` part but also takes `label`/`helpText`/`error` as props on `Field` itself.** Both patterns exist; the example uses the prop form since it's strictly simpler. The redundancy is worth resolving.
5. ~~**Bundled CSS path requires reaching past the package root.**~~ **Fixed during scaffold** — added `"./styles.css"` to `@full-stack-ds/react`'s `exports` map. Consumers now `import "@full-stack-ds/react/styles.css"`. The Vue/Svelte/Angular/Lit packages need the same patch.
6. ~~**`Button` has no `onClick`** (and no other event handlers, `id`, `aria-*` raw attrs).~~ **Fixed in codegen.** The React emitter now derives the host element type from the IR's `anatomy.dom.tag` and emits `<Name>Props extends Omit<XxxHTMLAttributes<HTMLXxxElement>, ...>` for every component with a known host tag. Contract-declared prop names are scrubbed via `Omit` to keep contract narrowings authoritative. See `packages/ds-codegen/src/frameworks/react/component-source.ts` (`HOST_TAG_TO_REACT_ATTRS`, `buildHostAttrsExtendsClause`). Settings example now has 0 `Button.onClick` errors under `tsc --noEmit`.
7. ~~**`Input`, `Switch`, `Field` have the same prop-narrowing problem**~~ **Fixed by the same codegen change.** All three now inherit the host element's raw attribute surface (`id`, `onFocus`/`onBlur`, raw `aria-*`, etc.). Vue/Svelte/Angular/Lit emitters still need the equivalent treatment — port the rule from React's emitter when bringing those examples online.
8. **`Field.onChange` is typed `(value: unknown) => void`.** Consumers can't type-narrow without casts. Should be generic over the child's value type, or at minimum `string`/`boolean` per common case.

**Status:** the example **builds via Vite** and **typechecks against the React package with only one residual error**: `src/main.tsx(3,8): error TS2882: Cannot find module or type declarations for side-effect import of '@full-stack-ds/react/styles.css'`. That's a packaging-side ambient-declaration gap, not a consumer-API gap.

(Items 1-4, 8 remain as component/contract surface issues. Item 5 was packaging-config, fixed for React. Items 6-7 were resolved via codegen on 2026-05-20 — see commit history.)

## Findings from the Vue implementation

Recording the consumer-API gaps surfaced while scaffolding `settings/vue/`.

1. ~~**Vue package root exported primitives only.**~~ **Fixed during scaffold** — `@full-stack-ds/vue` now re-exports generated components from `src/components/index.ts`, so consumers can import `Card`, `Field`, `Dialog`, `TooltipTrigger`, and the rest from the package root.
2. ~~**Bundled CSS path was not exported.**~~ **Fixed during scaffold** — added `@full-stack-ds/vue/styles.css` backed by the package build's `dist/vue.css`.
3. ~~**The CSS export had no TypeScript declaration.**~~ **Fixed during scaffold** — added a typed CSS export declaration source so `vue-tsc` accepts side-effect imports of `@full-stack-ds/vue/styles.css`.
4. **Vue compound-component convention differs from React.** React uses `Tooltip.Trigger` / `Tooltip.Content`; Vue exports sibling components `TooltipTrigger` / `TooltipContent`. The app can satisfy the same spec, but consumers have to learn framework-specific compound naming.
5. **Dialog parts are exported but not structurally consumed by `Dialog.vue`.** The Vue app renders `DialogHeader`, `DialogTitle`, `DialogBody`, and `DialogFooter` as children to match the spec, but `Dialog.vue` itself also emits its own internal header/body/footer scaffold. That is a framework-package behavior/structure gap worth auditing before treating the Vue dialog lane as runtime-complete.

**Status:** the Vue example **typechecks** with `packages/ds-vue/node_modules/.bin/vue-tsc --noEmit -p examples/settings/vue/tsconfig.json` and **builds** with `pnpm --filter @full-stack-ds/example-settings-vue run build`.
