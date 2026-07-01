# Social feed — spec

A mocked social/media front end: a scrolling feed of posts with author identity, media, reactions, and threaded comments, alongside a composer for new posts, a profile/sidebar surface, and the notification, moderation, and report/hide flows a real feed needs. Framework-agnostic. Every implementation under `examples/social-feed/<framework>/` must satisfy this spec using only the public API of its corresponding `@full-stack-ds/<framework>` package.

This is not a static card list. It is a dense, interactive surface: an authoring composer, optimistic reactions and comments that show pending and error states, per-item overflow menus that open report/hide flows, and a notification/moderation region — the places where avatar/media/display components, nested interactive actions, disclosure, and menu behavior all collide.

## Why this app

**Real consumer pressure.** A feed is the densest composition a consumer app produces: every item nests a header (avatar + identity + timestamp + overflow menu), a body (text + media card), and an action bar (reactions + comment toggle + share), and the comment thread nests another composer and more action bars beneath it. This forces a system to answer hard questions — can interactive controls nest inside interactive cards without role/focus conflicts? does an overflow menu expose a real menu role and keyboard model? can a reaction be optimistic and then reconcile or roll back? — that a flat catalog never asks. Each is a place where a component can swallow an event, fail to expose a controlled posture, or push the consumer toward a private import or a CSS patch.

**Why it is not a toy demo.** A toy demo renders five hard-coded cards. This spec forces *optimistic, reconcilable state*: posting a comment appends it immediately (pending), then confirms or rolls back on a simulated failure; toggling a reaction updates the count optimistically and reverts on error; hiding a post removes it from the feed and offers an undo; reporting a post opens a moderation flow that ends in a toast. The composer must validate (no empty post) and show a pending submit. If any of these can only be wired by leaking renderer internals, the app shape has found a boundary weakness.

**Component families stressed.** Identity and media display (`Avatar`, `Image`, `ProfileFlag`, `Postcard`, `Card`, `AspectRatio`-style media framing via `Image`), dense interactive composition (nested `Button`s, `Chip`, reaction toggles, action bars), disclosure (`Details`/`Accordion` for "show more" comments, `ShowMore`/`Truncate` for long post bodies), menu/overflow behavior (`Popover` + `Command`/`NavList` as a menu surface — see pressure points), feedback and overlays (`Toast`, `Alert`, `AlertNotice`, `Dialog`, `Sheet`, `Tooltip`, `Skeleton`, `Spinner`), and identity/sidebar surfaces (`Stat`, `Badge`, `Status`, `Links`, `Divider`). Layout is owned by `Stack` and `Card`.

**This app shape IS the assembly layer.** The repo's layered methodology (see `src/views/ComponentComplexityView.tsx`) names four layers — primitives, compounds, composers, assemblies — and a *project board* / activity surface sits in the assembly tier alongside the dashboard and checkout: a product-specific surface, owned by the app, **composed from system parts and never forking or re-styling them.** A feed is the densest such assembly. Its purpose as a proving surface is to demonstrate that the lower three layers compose into a deeply nested, optimistic, menu-and-disclosure-heavy product surface **at the app layer** without the assembly anti-patterns the methodology warns against: *pushing product policy (moderation rules, optimistic reconciliation) into the system* and *forking system components inside assemblies*. Those anti-patterns are this spec's falsifiers restated. If a feed item cannot nest its action bar, overflow menu, and comment composer from public exports without re-styling or reaching past the boundary, the system's compounds and composers are not yet expressive enough for the densest assemblies.

## Primary claim

Once the framework lanes exist, this app shape proves a bounded claim: **a dense social-feed assembly — a scrolling feed of nested-action items, a validating composer, optimistic reactions and comments with pending/error reconciliation, per-item overflow menus driving report/hide flows, a profile/sidebar surface, and a notification/moderation region — can be composed from the public exports of each `@full-stack-ds/<framework>` package, with identical consumer-facing semantics across React, Vue, Svelte, Angular, and Lit, without renderer-internal imports or local CSS substituting for package behavior.**

The claim is bounded: it asserts *consumer-app composability and cross-framework semantic parity for this assembly*, not that the feed is production-grade, real-time, virtualized at scale, accessible to a published standard, or visually polished.

## Falsifiers

Any of these is evidence the claim is false (or the boundary is too weak), to be recorded in the findings log — never worked around silently:

- **Private import.** A lane imports from `dist/`, a generated internal path, a source file, or any non-exported package path to obtain a component, type, behavior primitive, or style.
- **Local CSS substituting for package behavior.** A lane uses hand-authored CSS to supply reaction/selected indication, menu open/close behavior, disclosure state, focus styling, overlay layering, optimistic/pending appearance, or any state the package should own. (Minimal page-frame/feed-column layout no package component owns is allowed, but must be noted.)
- **Missing public export.** A surface the assembly legitimately needs (a reaction toggle channel, an overflow-menu role/component, a comment-submit event, a hide/undo affordance, a dialog/sheet open channel, a toast trigger, a truncate/show-more disclosure) is not reachable from public exports.
- **Framework-specific semantic rewrite.** The spec has to be reinterpreted for one framework — e.g. one framework needs a different menu model, a different nested-interaction posture, or a different optimistic-update contract — to make the lane pass.
- **Missing required state or event.** The lane cannot model a required state (pending, optimistic, reverted, hidden, reported, error) or cannot observe a required event (react, comment submit, menu select, report, hide/undo) through the public surface.
- **Inconsistent cross-framework semantics.** The same component requires materially different consumer semantics (event names, channel keys, controlled posture, menu keyboard model, dismissal behavior) across frameworks.
- **Nested-interaction failure.** Interactive controls cannot be nested inside an interactive feed card without role/focus/keyboard conflicts that the package should resolve, and the only fix is a private import or CSS hack.
- **App-spec rewrite to dodge a failure.** A failure is hidden by weakening this spec instead of filing the gap against the contract, IR, emitter, package export map, or runtime behavior.

## Framework-neutral requirements

### Page / screen structure

One page, no routing required. A three-region layout: a left/top **navigation or profile sidebar**, a central **feed column** (composer + post list), and a right **secondary sidebar** (suggestions / trends / notifications). On narrow layouts the sidebars may collapse behind a `Sheet`. Use FSDS components (`Stack`, `Card`, `Postcard`, etc.) for component composition and package-owned behavior. Minimal app-shell layout CSS is allowed for page regions the design system does not claim (the three-column frame, sticky sidebars, responsive shell), but it must not substitute for component behavior, state indication, reaction/menu/disclosure state, focus, overlay, or token/styling surfaces — those must come from the package, and a place where app-shell CSS has to supply one of them is a finding.

### Required regions

1. **Profile / nav sidebar** — the current user's identity (`Avatar` + `ProfileFlag`), a small `Stat` block (e.g. posts / followers), and a `NavList`/`Links` set. Display-only except the nav affordances.
2. **Composer** — a `Card` at the top of the feed column with an `Avatar`, a text input (`Input`/`TextField`; a `Textarea` is a residual — see pressure points), an optional media-attach affordance (mock), and a "Post" `Button` disabled until the text is non-empty. Submitting prepends a new post optimistically.
3. **Feed** — a list of post `Card`/`Postcard` items. Each item has: a header (`Avatar`, author identity, timestamp, an overflow-menu trigger), a body (text with `ShowMore`/`Truncate` for long content, optional media via `Image`), an action bar (a reaction toggle with a count, a comment toggle with a count, a share affordance), and a collapsible comment thread (`Details`/`Accordion`) containing existing comments and an inline comment composer.
4. **Overflow menu** — per-item, opened from the header trigger: a menu surface (`Popover` hosting `Command`/`NavList` — see pressure points) with "Report post", "Hide post", and "Copy link" items.
5. **Report flow** — selecting "Report" opens a `Dialog`/`Sheet` with a reason `Select`/`Checkbox` set and a submit; submitting closes it and raises a `Toast` ("Report received"). The post is marked reported (`Badge`/`Status`).
6. **Notification / moderation region** — a secondary-sidebar or top region listing notifications (`List` of items with `Badge` counts) and any moderation banners (`AlertNotice`) — e.g. "A post you reported was removed."

### Required interactions

- Typing in the composer enables "Post"; submitting prepends an optimistic post (pending), then confirms (mock success) or rolls back with a recoverable `Alert` (mock failure flag).
- Toggling a reaction updates the count optimistically and flips the toggle's pressed state; on a simulated failure it reverts and shows a `Toast`/`Alert`.
- Expanding a post's comment thread reveals existing comments and an inline composer; submitting a comment appends it optimistically (pending), then confirms or rolls back.
- "Show more" / truncate expands a long post body; collapsing restores the truncated view.
- Opening a post's overflow menu shows its items; the menu is keyboard-navigable and dismisses on `Escape`/outside-click per the component's default channels.
- "Hide post" removes the post from the feed and raises a `Toast` with an "Undo" affordance; undo restores the post.
- "Report post" opens the report `Dialog`/`Sheet`; submitting marks the post reported and raises a `Toast`; cancelling closes with no change.

### Data and API layer

No backend (no server, no network, no persistence). The lane structures its data as three separated concerns (see the portfolio README's "Data and API Layer"):

1. **Fixtures** — static `*.json` / `*.jsonl` files in the lane holding posts, comments, authors, the current user, and notifications. JSONL is a natural fit for the feed/comment streams.
2. **Adapter** — a lane-local reader that parses the fixtures into typed domain records (`Post`, `Comment`, `Author`, `Notification`). The adapter may load the static JSON/JSONL fixtures once into memory; the UI calls only the promise-returning API, never the fixture or adapter directly.
3. **Functional API** — a lane-local, typed, **promise-returning** surface the assembly calls: `listFeed()`, `createPost(body)`, `addComment(postId, body)`, `toggleReaction(postId)`, `hidePost(postId)`, `reportPost(postId, reason)`. Each resolves a typed `ApiResult<T>` (resolve-don't-reject for domain failures; see the portfolio README's "Golden data/API template"). The simulated latency and the mock-failure flag live **behind** this API. The assembly never reads the fixture or adapter directly.

#### App-specific decision: the API is the canonical result; the UI owns optimistic state + rollback

This is the feed app's one app-specific data/API decision, pinned here so the framework lanes (and any subagent implementing the seam) do not diverge:

- **Keep the typed `ApiResult<T>` resolve-don't-reject convention** unchanged from the golden template. A mutation that fails for a domain reason (e.g. the mock-failure flag, a rejected report) resolves `{ ok: false, error }`; the API does not throw or reject for domain failures.
- **The API represents the *canonical* async mutation result** — "what the server would have committed." `createPost`/`addComment` resolve the committed record; `toggleReaction` resolves the new canonical reaction state; `hidePost`/`reportPost` resolve the committed outcome. The API has **no** knowledge of optimistic UI.
- **The future assembly/UI lane owns the optimistic store and rollback**, via inverse patches or equivalent app-local state. The flow is: apply the optimistic change to local UI state → `await` the typed API result → on `ok` settle (reconcile local state to the canonical result), on `!ok` roll back (apply the inverse patch and surface the typed error). The rollback machinery is *assembly* state, not API state.
- **No commit handles / transaction tokens in the first feed scaffold.** The API stays a plain promise-returning surface — no `begin()/commit()/abort()`, no optimistic-id reconciliation protocol baked into the API. Keeping it handle-free preserves the golden template's determinism and lets the first scaffold prove the seam before any fancier protocol is justified. (If a later slice needs server-assigned ids reconciled against optimistic placeholders, that is a deliberate future extension, recorded as a finding — not assumed now.)
- **Rollback is tested in the future data/API + assembly scaffold**, not provable by the API tests alone: the seam tests prove the API resolves the right typed result under the failure flag; the rollback behavior (optimistic apply → API failure → UI reverts to the prior state) is an assembly-level test the framework-lane scaffold must add. The feed spec calls this out so the rollback path is not silently skipped.

### Required local / loading / empty / error / pending states

- **Loading** — the feed renders `Skeleton`/`Spinner` placeholders while the functional API's `listFeed` promise is pending (simulated latency over the JSONL fixture; no network).
- **Empty** — the feed shows an empty state when there are no posts (e.g. after hiding all of them), distinct from loading.
- **Pending / optimistic** — a newly posted item, a new comment, and a toggled reaction all show optimistic state immediately, with a pending indicator until the simulated commit resolves.
- **Reverted / error** — on the mock-failure flag, an optimistic post/comment/reaction reverts and surfaces a recoverable `Alert`/`Toast`; retrying succeeds with the flag off.
- **Moderation / display** — reported posts carry a `Badge`/`Status`; the moderation region shows `AlertNotice` banners that are display-only.

### Expected components and pressure-point residuals

Expected (must come from public exports): `Stack`, `Card` (+ parts), `Postcard`, `Avatar`, `ProfileFlag`, `Image`, `Field`, `Input`, `TextField`, `Button`, `Chip`, `Badge`, `Status`, `Stat`, `Divider`, `List`, `NavList`, `Links`, `Details`/`Accordion`, `ShowMore`, `Truncate`, `Popover`, `Command`, `Dialog` (+ parts), `Sheet`, `Toast`, `Alert`/`AlertNotice`, `Skeleton`, `Spinner`, `Tooltip`, `Select`, `Checkbox`.

Pressure-point residuals (the assembly naturally wants these; absence from public exports is a finding, not a reason to hand-roll): a true **Menu / DropdownMenu** with a `menu`/`menuitem` role and roving-tabindex keyboard model for the overflow menu (the spec falls back to `Popover` hosting `Command` or `NavList`, which is a known semantic compromise to record — does it expose the right roles and keyboard behavior?), a **ToggleButton / pressed-state reaction control** (falls back to a `Button` with app-owned pressed state), a **Textarea** for the composer (falls back to `Input`), an **infinite-scroll / pagination** affordance for the feed, and a **relative-time / timestamp** display primitive (falls back to app-formatted text). Each residual the lane cannot satisfy from public exports is recorded below.

## Interaction requirements

These are concrete enough to become future Playwright / runtime checks. Each lane must satisfy all of them.

1. **Composer gate + optimistic post.** With empty composer text, "Post" is disabled; type text → it enables; submit → a new post appears at the top of the feed immediately with a pending indicator, then settles to posted (mock success).
2. **Post failure rollback.** With the mock-failure flag on, submit a post → it appears pending, then is removed and a recoverable `Alert`/`Toast` shows; retry with the flag off → it posts.
3. **Optimistic reaction.** Toggle a post's reaction → the count increments and the control shows pressed immediately; toggle again → it decrements and unpresses. With the failure flag on, the toggle reverts and a `Toast` shows.
4. **Comment thread.** Expand a post's comments → existing comments and an inline composer appear; submit a comment → it appends optimistically (pending), then settles; collapsing hides the thread.
5. **Show more.** A long post body is truncated with a "show more" affordance; activating it reveals the full body; collapsing restores truncation.
6. **Overflow menu + keyboard.** Open a post's overflow menu → its items appear; arrow keys move focus between items; `Escape` closes it; outside-click closes it. Menu role/keyboard semantics match across frameworks.
7. **Hide + undo.** Select "Hide post" → the post leaves the feed and a `Toast` with "Undo" appears; activating "Undo" restores the post to its original position.
8. **Report flow.** Select "Report post" → a `Dialog`/`Sheet` opens with reason controls; cancel closes with no change; submit marks the post reported (`Badge`/`Status`) and raises a `Toast`.
9. **Empty feed.** Hide all posts → the feed shows its empty state (not loading, not a blank column); a posted/undone item restores content.
10. **Overlay focus & dismissal.** The report `Dialog` traps focus; `Escape` and backdrop dismiss it per the component's default channels; the overflow `Popover` and any `Sheet` dismiss per their own channels. Dismissal semantics match across frameworks.

## State model

App-local state only; no backend. Posts, comments, authors, notifications, and the current user are served by the lane's functional API (typed, promise-returning) over static JSON/JSONL fixtures via an adapter (see "Data and API layer"); composer text, disclosure, and optimistic overlay state is held locally by the assembly. No package imports data.

- **User-controlled state:** the composer text and attach selection, each inline comment composer's text, the open/closed state of each post's comment thread and overflow menu (where controlled), each post's truncate-expanded flag, the report-dialog reason selections, and the open/closed state of any controlled overlay (report dialog, mobile sheet).
- **Derived state:** the composer "can post" gate (text non-empty), each post's reaction count and pressed state (derived from the optimistic store), the feed empty condition (visible posts === 0), comment counts, and the reported badge derivation.
- **Pending / optimistic state:** newly posted items (`createPost`), new comments (`addComment`), and toggled reactions (`toggleReaction`) are applied optimistically with a pending marker, then the API promise settles (commit) or, under the failure flag, rejects (rollback / revert).
- **Error state:** the API's mock-failure flag and the recoverable `Alert`/`Toast` raised when an optimistic action's promise rejects; each error has an explicit recovery (retry) transition.
- **Display-only state:** author identity, timestamps, media, sidebar `Stat` blocks, notification list entries, and moderation banners — served by the API from the fixture (and derived in the lane), never edited directly (except the reported-badge, which is derived from a `reportPost` action).

## Public package boundary

Framework implementations may import **only** from public `@full-stack-ds/<framework>` package exports and that package's public CSS/style export (e.g. `import "@full-stack-ds/<framework>/styles.css"`). No reaching into `dist/` internals, generated internals, source files, non-exported package paths, or copying package code into the lane. Behavior primitives (focus trap, menu navigation, dismissal) are consumed only insofar as a public component re-exports them; a lane must not import a renderer-internal hook directly. The fixtures, adapter, functional API, moderation rules, optimistic reconciliation, and timestamp formatting are **lane-local app-layer code** — they live in the lane, not in any package, and are not part of the package boundary; component behavior, reaction/menu/disclosure state, and styling come from the package.

## Acceptance

A future, populated lane is accepted when:

1. **Build acceptance.** The lane builds without errors against the committed workspace package (`pnpm build`), with no type errors that require casts past the public types.
2. **Interaction acceptance.** All ten interaction requirements above pass under a future Playwright/runtime check driven from committed files only.
3. **Cross-framework semantic parity.** The same spec is realized in React, Vue, Svelte, Angular, and Lit with identical consumer-facing semantics (same events observed, same channels, same controlled posture, same menu keyboard model, same dismissal behavior). Divergence is a finding.
4. **No escape-hatch acceptance.** No falsifier above is present: no private imports, no behavior-substituting local CSS, no spec rewrite, no hand-rolled replacement for a component the package should provide, no nested-interaction hack, and no forking/re-styling of a system component inside the assembly.

Until all admitted Web DOM lanes meet 1–4, this app shape remains a partial proving surface, not admitted parity evidence.

## React Native posture

RN is **not** an initial lane for this app shape. The feed is the densest DOM composition in the portfolio (nested interactive cards, hover affordances, overflow menus). Its first proof belongs to the admitted Web DOM family. If an RN follow-on is added later, its first posture is a **typecheck / consumer-transfer fixture** (mirroring `settings/react-native`), not full app parity — it would prove only that the RN package's public exports type-check against this app's component usage (a natural fit, since avatar/media/display components are the RN package's strongest surface), not that the nested-interaction feed reaches visual or interaction parity. Until that fixture exists, this spec makes no RN claim.

## Non-claims

- **Not visual-quality proof.** The feed uses package CSS and stays visually modest. It does not assert design polish, layout taste, or responsive breakpoints beyond what package components provide.
- **Not backend / data / real-time proof.** There is no backend: data is a static JSON/JSONL fixture read through a lane-local adapter and served by a lane-local functional API. The promise-returning API is a real-to-life *shape*, not a real backend — the app proves nothing about real feeds, real-time updates, virtualization at scale, media handling, or persistence. Optimistic reconciliation is simulated against the fixed fixture behind the API.
- **Not standalone accessibility proof.** It exercises shipped component behavior; accessibility adequacy claims (menu roles, nested-interaction focus order, live-region announcements) belong to component contracts, generated behavior primitives, and dedicated a11y rails — not to this example. Where this app *pressures* a11y (the overflow-menu keyboard model), a gap is recorded as a finding, not asserted as a proof.
- **Not generated-artifact admission.** This app shape pressures *consumer-side package consumption*. The governed rail (artifact ↔ contract ↔ codegen ↔ environment binding) remains a separate, independent gate.

## Initial findings log

Reserved for findings surfaced while implementing the framework lanes. Record each consumer-API gap, residual that could not be satisfied from public exports, or cross-framework semantic divergence here. **Do not silently change this spec to make a lane pass — record the gap, then promote it into an issue, contract, IR, emitter, package export, or test.**

| # | Lane(s) | Surface | Finding | Status |
|---|---------|---------|---------|--------|
| _none yet_ | | | | |
