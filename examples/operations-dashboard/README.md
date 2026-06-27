# operations-dashboard

A consumer-app proving surface at the **assembly** layer. The authority for this
app shape is [`spec.md`](./spec.md); this README documents only the lane-local
**data / API layer** that has been scaffolded so far.

> Status: **data/API scaffold landed; framework lanes not yet implemented.**
> The `react/`, `vue/`, `svelte/`, `angular/`, `lit/` folders hold only
> `src/.gitkeep` placeholders. No `App.tsx`, `main.tsx`, `package.json`, or Vite
> config exists yet.

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
Vitest `include` does not cover `examples/`, run them with an explicit config
that targets this directory rather than via the root `pnpm test`.

## Intended future use

When the framework lanes are built, each lane's UI imports the functional API
above and renders the dashboard from it — driving its loading/empty/error/
pending/optimistic states off real promise transitions. This data/API seam is
shared in *shape* across lanes (the spec requires identical consumer-facing
semantics), but each lane owns its own copy under its `<framework>/` folder
unless a later slice extracts a shared lane-local module. Materializing the
equivalent seam for `storefront-checkout` and `social-feed` is separate
follow-on work under its own spec.
