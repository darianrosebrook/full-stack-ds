# social-feed

A consumer-app proving surface at the **assembly** layer. The authority for this
app shape is [`spec.md`](./spec.md); this README documents only the lane-local
**data / API layer** that has been scaffolded so far. It follows the portfolio
[Golden data/API template](../README.md#golden-dataapi-template) — read that
for the transferable invariants; this README covers only what is feed-specific.

> Status: **data/API scaffold landed; framework lanes not yet implemented.**
> The `react/`, `vue/`, `svelte/`, `angular/`, `lit/` folders hold only
> `src/.gitkeep` placeholders. No `App.tsx`, `main.tsx`, `package.json`, or Vite
> config exists yet.

## No backend

There is no server, no network, and no persistence. Data is static JSON/JSONL
fixtures read through a lane-local adapter and served by a lane-local
**functional API**. The promise-returning API is a real-to-life *shape* — it
makes loading / pending / error states real async transitions — not a real
backend.

## Layers

```
fixtures/*.json(l)  →  src/data/adapter.ts  →  src/api/ (+ index.ts barrel)  →  (future) framework lane UI
   raw fixture shape     parses/joins/indexes/memoizes  promise-returning API         imports the barrel only
```

### 1. Fixtures (`fixtures/`)

| File | Format | Holds |
|---|---|---|
| `authors.json` | JSON | The author roster + `currentUserId` (the viewer). |
| `posts.jsonl` | JSONL (one post/line) | 6 posts spanning text + media, varied reaction counts, an existing viewer reaction, a hidden post (`p-2006`), and a spammy post to report (`p-2005`). |
| `comments.jsonl` | JSONL (one comment/line) | Comments keyed to posts, with author ids. |
| `notifications.jsonl` | JSONL (one entry/line) | Reaction / reply / moderation notifications for the secondary surface. |

### 2. Adapter (`src/data/adapter.ts`)

The **only** module that touches raw fixture shape. It parses the JSONL/JSON,
indexes authors by id, groups comments by post (chronological), validates
(every post author resolves; `currentUserId` is a known author), sorts posts
newest-first, and memoizes the parsed snapshot (loaded **once** into memory).
A malformed fixture throws at load time (authoring error), not as a domain
failure. The snapshot is immutable-by-convention; the API holds the mutable
working copy.

### 3. Functional API (`src/api/`)

Future framework lanes import from `src/api/index.ts` only.

| Function | Returns | Notes |
|---|---|---|
| `createFeedApi(options?)` | `FeedApi` | Factory; loads fixtures via the adapter. |
| `listFeed(query?)` | `Promise<ApiResult<Post[]>>` | Visible posts newest-first with joined author + comments; `includeHidden` opts in. |
| `createPost(input)` | `Promise<ApiResult<Post>>` | Committed post (deterministic `p-new-NNNN` id); typed `EMPTY_BODY`. |
| `addComment(input)` | `Promise<ApiResult<CommentWithAuthor>>` | Committed comment (`c-new-NNNN`); typed `EMPTY_BODY` / `NOT_FOUND`. |
| `toggleReaction(postId, kind)` | `Promise<ApiResult<ReactionState>>` | Canonical reaction state after toggle (add / clear / switch kind). |
| `hidePost(postId)` | `Promise<ApiResult<Post>>` | Committed post; leaves the default feed. |
| `reportPost(input)` | `Promise<ApiResult<Post>>` | Committed post; typed `ALREADY_REPORTED` on re-report. |
| `listNotifications()` | `Promise<ApiResult<Notification[]>>` | Display-only secondary surface. |
| `simulateLoadFailure(enabled)` / `simulateMutationFailure(enabled)` | `void` | Toggle read / mutation failure flags. |

**Determinism.** No wall-clock randomness, no `Math.random`. Latency is a fixed
`options.latencyMs` (default `0`). Failure is explicit (`failLoads` /
`failMutations`, or the runtime toggles). New post/comment ids derive from
per-instance counters; new timestamps from an injectable `clockSeed`. Methods
resolve a discriminated `ApiResult<T>` for domain failures rather than rejecting.

## The feed decision: API is canonical, UI owns optimistic rollback

This is the app-specific data/API decision pinned in [`spec.md`](./spec.md):

- The API is the **canonical async mutation result** — "what the server would
  have committed." `createPost`/`addComment` resolve the committed record;
  `toggleReaction` resolves the new canonical reaction state;
  `hidePost`/`reportPost` resolve the committed outcome. The API has **no**
  knowledge of optimistic UI.
- **No commit handles / transaction tokens.** The API is a plain
  promise-returning surface — no `begin`/`commit`/`abort`, no optimistic-id
  reconciliation protocol. This keeps the seam deterministic and small.
- The **future UI owns the optimistic store and inverse-patch rollback**: apply
  the optimistic change locally → `await` the typed result → settle on `ok`,
  roll back on `!ok`. On a failed mutation the API leaves its own canonical
  state **unchanged** (it never applied, so there is nothing for it to revert);
  reverting the optimistic UI patch is the UI lane's job.
- **Rollback is proven at the future framework-lane scaffold, not here.** These
  API tests prove the failure flag yields the right typed result and that the
  canonical state is untouched; the optimistic-apply → fail → UI-revert loop is
  an assembly-level test the lane scaffold must add. (Two tests in this suite —
  under "API does not own optimistic rollback" — pin the canonical-state-
  unchanged half of that contract.)

## Consumption boundary

```ts
import { createFeedApi, type Post } from "../api";
```

Future lanes import the barrel only — never `src/data/` and never `fixtures/`.
Reaching past the barrel is a finding (the same class as reaching past the
`@full-stack-ds/<fw>` public package exports; see [`spec.md`](./spec.md) →
"Public package boundary").

## Tests

`src/api/feed-api.test.ts` proves fixture parsing + joins/ordering, feed read
(visible vs. hidden, joined author/comments), `createPost`/`addComment`
mutation (deterministic ids, count growth, typed `EMPTY_BODY`/`NOT_FOUND`),
`toggleReaction` (add / clear / switch kind with exact counts),
`hidePost`/`reportPost` (+ `ALREADY_REPORTED`, per-instance isolation), typed
failure (`LOAD_FAILED`, `MUTATION_FAILED`) with recovery, and — per the feed
decision — that **a failed mutation leaves canonical state unchanged** (the API
does not own rollback). Plus a falsifiability probe (corrupting a reaction count
fails the reaction tests).

They run under plain Vitest (Node environment) with `latencyMs: 0`. Because the
root Vitest `include` does not cover `examples/`, run them with an explicit
config that targets this directory (a `vitest.config.ts` with
`root: <this dir>` and `include: ["examples/social-feed/src/**/*.test.ts"]`),
not via the root `pnpm test`.

## Intended future use

When the framework lanes are built, each lane's UI imports the functional API
above, holds its own optimistic store, and renders the feed from it: apply an
optimistic patch, `await` the canonical API result, then settle or inverse-patch
roll back — driving the pending/optimistic/error states off real promise
transitions. The rollback loop is the lane scaffold's to implement and test.
