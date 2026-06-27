# operations-dashboard

A consumer-app proving surface at the **assembly** layer. The authority for this
app shape is [`spec.md`](./spec.md); this README documents the lane-local
**data / API layer** and the first framework lane (**React**).

> Status: **data/API scaffold landed; React lane implemented; Vue/Svelte/Angular/Lit
> lanes not yet implemented.** The `react/` folder is a real Vite + React app
> consuming the data/API seam through public `@full-stack-ds/react` exports. The
> `vue/`, `svelte/`, `angular/`, `lit/` folders hold only `src/.gitkeep`
> placeholders.

## No backend

There is no server, no network, and no persistence. Data is static
JSON/JSONL fixtures read through a lane-local adapter and served by a lane-local
**functional API**. The promise-returning API is a real-to-life *shape* — it
makes loading / empty / error / pending / optimistic states real async
transitions — not a real backend. Nothing leaves the bundle.

## Layers

```
fixtures/*.json(l)   →   src/data/adapter.ts   →   src/api/   →   (future) framework lane UI
  raw fixture shape       parses + joins + memoizes   promise API     imports the API only
```

### 1. Fixtures (`fixtures/`)

| File | Format | Holds |
|---|---|---|
| `incidents.jsonl` | JSONL (one row/line) | The work-queue rows — 10 incidents spanning critical/high/low severity, prod/staging/dev environments, assigned and unassigned. |
| `timeline-events.jsonl` | JSONL (one event/line) | Per-incident timeline events for the selected-detail surface. |
| `incident-descriptions.json` | JSON lookup (id → text) | Long-form incident descriptions, kept out of the compact queue rows. |
| `service-health.json` | JSON | Per-service health for the summary band — covers healthy/degraded/down. |

The fixtures deliberately exercise: every service status, every severity, every
environment, assigned vs. unassigned items, an incident with a rich multi-event
timeline (`INC-1042`), a no-match filter (empty-state path), and — via the API's
failure flag — the simulated load-failure path.

### 2. Adapter (`src/data/adapter.ts`)

The **only** module that touches the raw fixture file shape. It reads and parses
the JSONL/JSON, joins descriptions and timelines onto incidents, sorts each
timeline chronologically, and memoizes the parsed snapshot (the static fixtures
are loaded **once** into memory). A malformed fixture throws at load time
(authoring error), rather than surfacing as a domain error to the UI.

### 3. Functional API (`src/api/`)

The surface future framework lanes import — from `src/api/index.ts` only. It is
promise-returning and owns its own mutable in-memory copy of the incident set
(seeded from the adapter snapshot), so mutations stay inside the API and never
touch the fixtures.

| Function | Returns | Notes |
|---|---|---|
| `createOperationsApi(options?)` | `OperationsApi` | Factory; loads fixtures via the adapter. |
| `listIncidents(filters?)` | `Promise<ApiResult<Incident[]>>` | Active incidents; filters by `search` (id/title/service, case-insensitive), `environment`, and `severities` (union within axis, intersection across axes). |
| `getIncident(id)` | `Promise<ApiResult<IncidentDetail>>` | Detail + ordered timeline; typed `NOT_FOUND` for unknown/resolved ids. |
| `listServiceHealth()` | `Promise<ApiResult<ServiceHealth[]>>` | Summary-band data. |
| `assignIncident(id, assignee)` | `Promise<ApiResult<Incident>>` | Mutates API state. |
| `resolveIncident(id)` | `Promise<ApiResult<Incident>>` | Removes from active queue; typed `ALREADY_RESOLVED` on re-resolve. |
| `simulateLoadFailure(enabled)` | `void` | Toggles the read-failure flag (drives error → retry). |

**Determinism.** No wall-clock randomness. Latency is a fixed
`options.latencyMs` (default `0`, so tests run instantly; a lane can pass e.g.
`400` to exercise loading states). Failure is an explicit flag
(`options.failLoads` or `simulateLoadFailure(true)`), never chance. Methods
resolve a discriminated `ApiResult<T>` (`{ ok: true, value } | { ok: false, error }`)
for domain failures rather than rejecting, so UI lanes model error states
without `try/catch` around every call.

## Consumption boundary

Future framework lanes import from **`src/api/index.ts` only**:

```ts
import { createOperationsApi, type Incident } from "../api";
```

They must **not** import the adapter (`src/data/`) or the raw `fixtures/`
directly. Fixture-shape knowledge lives in the adapter; the API is the contract
the UI codes against. Reaching past the API into the adapter or fixtures is a
boundary violation, the same class as reaching past the `@full-stack-ds/<fw>`
public package exports (see [`spec.md`](./spec.md) → "Public package boundary").

## Tests

`src/api/operations-api.test.ts` proves fixture parsing, search/environment/
severity filtering (and cross-axis intersection), detail + timeline joins,
`assignIncident`/`resolveIncident` state mutation (and per-instance isolation),
and that the simulated failure produces typed errors with recovery. They run
under plain Vitest (Node environment) with `latencyMs: 0`. Because the root
Vitest `include` does not cover `examples/`, this suite runs through the
committed examples data/API test lane — `pnpm run test:examples:data-api` from
the repo root (backed by `vitest.examples.config.ts`) — not via the root
`pnpm test`. That command runs all three example data/API suites together. It
proves the data/API seam only — not framework app parity, not visual proof, not
backend proof, and not generated-artifact admission. Whether `examples/` joins
CI is a separate future slice.

## React lane (`react/`)

A real Vite + React 19 app that assembles the dashboard from public
`@full-stack-ds/react` exports and consumes the data/API seam through the
app-local API barrel (`../../src/api`) — never the adapter or fixtures. State
lives in `src/useDashboard.ts` (the only module that calls the API); `src/App.tsx`
renders the regions; `src/format.ts` maps domain values to component props;
`src/app-shell.css` covers page-frame layout only.

```bash
# From the repo root (commands run against the workspace package):
pnpm --filter @full-stack-ds/example-operations-dashboard-react run dev
pnpm --filter @full-stack-ds/example-operations-dashboard-react run build
pnpm --filter @full-stack-ds/example-operations-dashboard-react run typecheck
```

The lane implements the spec's required regions (header summary band, filter
rail, dense incident `Table`, selection-driven detail pane, timeline disclosure
via `Details`, assign `Sheet`, resolve confirm `Dialog`, `Toast` feedback) and
the required states (loading via `Skeleton`, list success, selected detail,
search/environment/severity filters, empty result, simulated load-failure +
retry via `AlertNotice`, assign pending/success, resolve pending/success that
removes the item and clears the selection). Filtering and detail are driven off
the promise-returning API, so every state is a real async transition.

### Non-claims

This lane proves *consumer-app composability for the React target only*. It is
**not** framework parity (Vue/Svelte/Angular/Lit lanes do not exist yet), **not**
visual proof (no screenshot or visual-regression baseline), **not** backend
proof (the API is a fixture-backed shape, not a server), and **not**
generated-artifact admission (this app is hand-written consumer code, outside the
codegen rail). The spec's ten interaction requirements are implemented but not
yet pinned by an automated Playwright/runtime check — that is a future slice.

### Findings (boundary observations)

These are recorded per the spec's falsifier discipline — gaps surfaced while
assembling the lane, **not** silently worked around:

1. **`Field` renders only `slots`, never `children`; `Text` omits `children`
   from its public type.** `FieldProps`/`TextProps` both `Omit<…, "children">`
   without re-adding it, and `Field`'s implementation renders `slots.label` /
   `slots.control` only (no `{children}`). So the idiomatic
   `<Field><Input/></Field>` pattern (used by `examples/settings/react`) silently
   drops the control at runtime *and* would fail a strict typecheck — that
   reference example simply has no `typecheck` script to catch it. This lane uses
   the typed `slots={{ label, control }}` surface for `Field`, and native
   semantic elements (`<h1>/<p>/<span>/<legend>`) for text runs, which pick up
   design-system typography from the package stylesheet cascade. **No cast past
   the public types is used.** *Gap: `Text`/`Field` are not usable as typed
   children containers; `Field`'s slot-only contract is undocumented in the
   export surface.*

2. **`Table`/`TableRow` expose no row-selection channel.** There is no
   `selected`/`onRowClick`/`aria-selected` prop and no package-owned selected-row
   styling. The lane drives selection with an in-cell `Button` (package-owned
   focus/press, `ariaPressed`) and tracks the id in app state, but the **visual**
   selected-row indication is app CSS (`.ops-row-selected` in `app-shell.css`) —
   the one place this lane's CSS crosses from page-frame into state indication.
   *Gap: package-owned row selection (state + indication) is missing on `Table`.*

3. **The data/API seam is node-only and cannot be imported unmodified by a
   browser app's runtime load path.** `src/data/adapter.ts` loads fixtures with
   `readFileSync` from `node:fs` at `loadFixtures()` time, so `createOperationsApi()`
   reads from disk synchronously. The Vite build *bundles* this without error, but
   the code path is node-targeted; a browser lane that needs live fixture loading
   would require the adapter to become isomorphic (e.g. fixtures imported as
   modules / fetched), which is **out of scope for this lane** (the seam's
   `src/{types,data,api}` is owned elsewhere). *Gap recorded against the seam, not
   worked around here: the canonical adapter assumes a node filesystem.*

4. **`tsc` follows the API import graph into the seam's adapter**, which uses
   `node:` specifiers, so the React lane's `tsconfig.json` adds
   `"types": ["node", "vite/client"]` and `@types/node` to type-check cleanly.
   This is a consequence of finding 3 — consuming a node-targeted seam pulls node
   types into the browser lane's type graph.

## Intended future use

When the remaining framework lanes are built, each lane's UI imports the
functional API above and renders the dashboard from it — driving its
loading/empty/error/pending/optimistic states off real promise transitions. This
data/API seam is shared in *shape* across lanes (the spec requires identical
consumer-facing semantics), but each lane owns its own copy under its
`<framework>/` folder unless a later slice extracts a shared lane-local module.
Materializing the equivalent seam for `storefront-checkout` and `social-feed` is
separate follow-on work under its own spec.
