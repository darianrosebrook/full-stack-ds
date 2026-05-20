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
6. **`Button` has no `onClick` (and no other event handlers, `id`, `aria-*` raw attrs).** `ButtonProps` declares only the contract-emitted props. The component spreads `...rest` to the DOM `<button>` at runtime, but TypeScript blocks consumers from passing handlers. This is the single largest blocker — a Button without `onClick` is unusable. The fix is to have `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>` (or equivalent in the IR).
7. **`Input`, `Switch`, `Field` have the same prop-narrowing problem** as `Button` (no `id`, no `onFocus`/`onBlur`, no `aria-*` raw attrs). `Field` provides a `label` but has no way to associate it with a child `Input`'s `id` because neither one accepts `id` on the public surface. WCAG label association is currently impossible through the public API.
8. **`Field.onChange` is typed `(value: unknown) => void`.** Consumers can't type-narrow without casts. Should be generic over the child's value type, or at minimum `string`/`boolean` per common case.

**Status:** the example currently fails `tsc --noEmit` with 4 errors (all `Button` missing `onClick`) but **builds and runs via Vite** (which doesn't typecheck). It surfaces the actual `Button.onClick` gap exactly the way a consumer would hit it.

(Items 1-4, 6-8 are component/contract surface issues. Item 5 was a packaging-config issue, now fixed for React.)
