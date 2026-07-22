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

1. ~~**`Stack` has no spacing/alignment props.**~~ **Spacing resolved via tokens, not a prop (FEAT-STACK-PRIMITIVE-CODEGEN-01).** `Stack` now carries a token-driven inter-child `gap` bound to `spacing.gap.stack` (`--fsds-semantic-spacing-gap-stack`), authored in the primitive *contract* and lowered into all five framework primitives by codegen — the Stack primitive is now generated from `Stack.primitive.json`, not hand-authored. Consumers get consistent rhythm from package CSS with no `gap` prop and no inline styling. The `justify`/`align` (distribution) need is deliberately *not* a free-form prop either — the remaining "row with space-between" pattern is tracked separately as a candidate enumerated `layoutVariant` (distribution is a layout mode, not spacing).
2. **`CardTitle` is not exported (and not in source).** `Card` ships with `CardHeader`, `CardContent`, `CardFooter`, `CardDescription`, but no title primitive — inconsistent with `Dialog`, which exports `DialogTitle`.
3. **`Tooltip` uses dot notation (`Tooltip.Trigger`, `Tooltip.Content`) instead of sibling exports** like every other compound component in the system. The barrel exports `TooltipTriggerProps`/`TooltipContentProps` types but not the components themselves. Either the export is incomplete or the convention is inconsistent.
4. **`Field` exports a `FieldHeader` part but also takes `label`/`helpText`/`error` as props on `Field` itself.** Both patterns exist; the example uses the prop form since it's strictly simpler. The redundancy is worth resolving.
5. ~~**Bundled CSS path requires reaching past the package root.**~~ **Fixed during scaffold** — added `"./styles.css"` to `@full-stack-ds/react`'s `exports` map. Consumers now `import "@full-stack-ds/react/styles.css"`. The Vue/Svelte/Angular/Lit packages need the same patch.
6. ~~**`Button` has no `onClick`** (and no other event handlers, `id`, `aria-*` raw attrs).~~ **Fixed in codegen.** The React emitter now derives the host element type from the IR's `anatomy.dom.tag` and emits `<Name>Props extends Omit<XxxHTMLAttributes<HTMLXxxElement>, ...>` for every component with a known host tag. Contract-declared prop names are scrubbed via `Omit` to keep contract narrowings authoritative. See `packages/ds-codegen/src/frameworks/react/component-source.ts` (`HOST_TAG_TO_REACT_ATTRS`, `buildHostAttrsExtendsClause`). Settings example now has 0 `Button.onClick` errors under `tsc --noEmit`.
7. ~~**`Input`, `Switch`, `Field` have the same prop-narrowing problem**~~ **Fixed by the same codegen change.** All three now inherit the host element's raw attribute surface (`id`, `onFocus`/`onBlur`, raw `aria-*`, etc.). Vue/Svelte/Angular/Lit emitters still need the equivalent treatment — port the rule from React's emitter when bringing those examples online.
8. **`Field.onChange` is typed `(value: unknown) => void`.** Consumers can't type-narrow without casts. Should be generic over the child's value type, or at minimum `string`/`boolean` per common case.

**Status:** the example **builds via Vite** and **typechecks against the React package with only one residual error**: `src/main.tsx(3,8): error TS2882: Cannot find module or type declarations for side-effect import of '@full-stack-ds/react/styles.css'`. That's a packaging-side ambient-declaration gap, not a consumer-API gap.

(Items 2-4, 8 remain as component/contract surface issues. Item 1 was resolved by FEAT-STACK-PRIMITIVE-CODEGEN-01 — Stack is now a contract-generated primitive with a token-driven gap. Item 5 was packaging-config, fixed for React. Items 6-7 were resolved via codegen on 2026-05-20 — see commit history.)

## Findings from the Vue implementation

Recording the consumer-API gaps surfaced while scaffolding `settings/vue/`.

1. ~~**Vue package root exported primitives only.**~~ **Fixed during scaffold** — `@full-stack-ds/vue` now re-exports generated components from `src/components/index.ts`, so consumers can import `Card`, `Field`, `Dialog`, `TooltipTrigger`, and the rest from the package root.
2. ~~**Bundled CSS path was not exported.**~~ **Fixed during scaffold** — added `@full-stack-ds/vue/styles.css` backed by the package build's `dist/vue.css`.
3. ~~**The CSS export had no TypeScript declaration.**~~ **Fixed during scaffold** — added a typed CSS export declaration source so `vue-tsc` accepts side-effect imports of `@full-stack-ds/vue/styles.css`.
4. **Vue compound-component convention differs from React.** React uses `Tooltip.Trigger` / `Tooltip.Content`; Vue exports sibling components `TooltipTrigger` / `TooltipContent`. The app can satisfy the same spec, but consumers have to learn framework-specific compound naming.
5. **Dialog parts are exported but not structurally consumed by `Dialog.vue`.** The Vue app renders `DialogHeader`, `DialogTitle`, `DialogBody`, and `DialogFooter` as children to match the spec, but `Dialog.vue` itself also emits its own internal header/body/footer scaffold. That is a framework-package behavior/structure gap worth auditing before treating the Vue dialog lane as runtime-complete.
6. **Vue `Input` state updates are blur-timed.** DevTools runtime smoke showed typing `DELETE` into the confirm input leaves the destructive button disabled until focus leaves the input. The generated Vue input emits `onChange` from the native `change` event, not the input event, so keystroke-time validation does not satisfy the spec yet.
7. **Generated `Field` labels are not associated with their inputs.** Chrome DevTools reported "No label associated with a form field" and "A form field element should have an id or name attribute" for the profile inputs. The app is using the public `Field label` prop and `Input` exports as intended, so this is a package/component wiring gap rather than an example escape hatch.

**Status:** the Vue example **typechecks** with `packages/ds-vue/node_modules/.bin/vue-tsc --noEmit -p examples/settings/vue/tsconfig.json` and **builds** with `pnpm --filter @full-stack-ds/example-settings-vue run build`. Runtime smoke through Chrome DevTools confirmed the page renders the three sections, the dark-mode switch toggles, the email-notifications tooltip appears on hover, and the dialog opens/closes. It also confirmed findings 5-7 above.
