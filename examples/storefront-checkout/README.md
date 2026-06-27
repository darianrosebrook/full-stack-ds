# storefront-checkout

A consumer-app proving surface at the **assembly** layer. The authority for this
app shape is [`spec.md`](./spec.md); this README documents only the lane-local
**data / API layer** that has been scaffolded so far. It follows the portfolio
[Golden data/API template](../README.md#golden-dataapi-template) — read that
for the transferable invariants; this README covers only what is checkout-specific.

> Status: **data/API scaffold landed; framework lanes not yet implemented.**
> The `react/`, `vue/`, `svelte/`, `angular/`, `lit/` folders hold only
> `src/.gitkeep` placeholders. No `App.tsx`, `main.tsx`, `package.json`, or Vite
> config exists yet.

## No backend

There is no server, no network, and no persistence. Data is static JSON/JSONL
fixtures read through a lane-local adapter and served by a lane-local
**functional API**. The promise-returning API is a real-to-life *shape* — it
makes loading / validating / pending / error states real async transitions —
not a real backend. Card/payment data is mock and never leaves the bundle.

## Layers

```
fixtures/*.json(l)  →  src/data/adapter.ts  →  src/api/ (+ index.ts barrel)  →  (future) framework lane UI
   raw fixture shape     parses/indexes/memoizes    promise-returning API           imports the barrel only
```

### 1. Fixtures (`fixtures/`)

| File | Format | Holds |
|---|---|---|
| `products.jsonl` | JSONL (one product/line) | 5 products, each with one or more variants (price in cents, stock). Includes out-of-stock variants (`tee-black-m`, `socks-one`). |
| `promo-codes.json` | JSON | Promo rules: `SAVE10` (10% off), `TENOFF` ($10 off over $40), `HALFOFF` (50% off over $100). |
| `shipping-methods.json` | JSON | `standard` (free), `expedited` ($8), `overnight` ($25). |
| `tax-rules.json` | JSON | Per-region rates in basis points (CA 8.25%, NY 8%, TX 6.25%, OR 0%) + a default. |

All money is integer **minor units (cents)** to avoid floating-point drift.

### 2. Adapter (`src/data/adapter.ts`)

The **only** module that touches raw fixture shape. It parses the JSONL/JSON,
builds the lookup indexes the API needs (a `variantId → {product, variant}`
index for O(1) price/label resolution; promo/shipping/tax maps), validates
(every product has ≥1 variant), and memoizes the parsed snapshot (loaded
**once** into memory). A malformed fixture throws at load time (authoring
error), not as a domain failure.

### 3. Functional API (`src/api/`)

Future framework lanes import from `src/api/index.ts` only.

| Function | Returns | Notes |
|---|---|---|
| `createCheckoutApi(options?)` | `CheckoutApi` | Factory; loads fixtures via the adapter. |
| `listProducts()` | `Promise<ApiResult<Product[]>>` | Catalog; returns a clone callers cannot use to mutate the snapshot. |
| `quoteCart(request)` | `Promise<ApiResult<Quote>>` | **Owns the money pipeline** (see below). Typed `EMPTY_CART` / `OUT_OF_STOCK` errors. |
| `validatePromo(code, request)` | `Promise<ApiResult<PromoValidation>>` | Surfaces a recoverable `INVALID_PROMO` (unknown code or unmet minimum). |
| `submitPayment(payload)` | `Promise<ApiResult<PaymentResult>>` | Mock auth; typed `PAYMENT_INVALID` (malformed) vs `PAYMENT_DECLINED` (flag). |
| `placeOrder(request)` | `Promise<ApiResult<OrderConfirmation>>` | Deterministic monotonic order id (`ORD-0001`, `ORD-0002`, …). |
| `simulateLoadFailure(enabled)` / `simulatePaymentFailure(enabled)` | `void` | Toggle the read / payment failure flags. |

**Determinism.** No wall-clock randomness, no `Math.random`. Latency is a fixed
`options.latencyMs` (default `0`). Failure is explicit (`failLoads` /
`failPayments` options, or the runtime toggles). The order id derives from a
per-instance counter. Methods resolve a discriminated `ApiResult<T>`
(`{ ok: true; value } | { ok: false; error }`) for domain failures rather than
rejecting.

## The checkout decision: totals live behind the API

This is the app-specific data/API decision pinned in [`spec.md`](./spec.md):
**`quoteCart` is the single owner of the money pipeline** —
subtotal → discount → shipping → tax → total — and returns already-computed
integer-cent numbers. Future framework lanes consume those numbers and may only
**display-format** them (currency symbol, locale, rounding presentation). They
must **not** recompute the math; five hand-written totals calculators would
drift, and the point of the shared API is that the policy is computed once.

The future UI owns **cart / form / step** state (line items, form fields, the
`contact → shipping → payment → review → confirmation` step machine) and calls
the API for every derived money value. This does not move product policy into
FSDS packages — the API is *lane-local app code*, exactly where the assembly
methodology says product policy belongs. The boundary protected is
"FSDS package vs. app", not "UI vs. data layer".

`quoteCart` deliberately does **not** hard-fail on an unknown/ineligible promo
(it simply applies no discount); the UI uses `validatePromo` to surface "that
code is invalid" as a recoverable error distinct from quoting.

## Consumption boundary

```ts
import { createCheckoutApi, type Quote } from "../api";
```

Future lanes import the barrel only — never `src/data/` and never `fixtures/`.
Reaching past the barrel, or recomputing totals in the UI, is a finding (the
same class as reaching past the `@full-stack-ds/<fw>` public package exports;
see [`spec.md`](./spec.md) → "Public package boundary").

## Tests

`src/api/checkout-api.test.ts` proves fixture parsing, catalog reads (+ snapshot
isolation), the exact `quoteCart` money pipeline (subtotal/discount/shipping/tax/
total with pinned cent values), promo validation (valid / unknown / below
minimum), payment + order mutation (deterministic order ids, amount-match
guard), and typed failure (`LOAD_FAILED`, `PAYMENT_DECLINED`) with recovery —
plus a falsifiability probe (corrupting a fixture price fails the math tests).

They run under plain Vitest (Node environment) with `latencyMs: 0`. Because the
root Vitest `include` does not cover `examples/`, run them with an explicit
config that targets this directory (a `vitest.config.ts` with
`root: <this dir>` and `include: ["examples/storefront-checkout/src/**/*.test.ts"]`),
not via the root `pnpm test`.

## Intended future use

When the framework lanes are built, each lane's UI imports the functional API
above, holds cart/form/step state locally, and renders the checkout from it —
driving loading/validating/pending/error states off real promise transitions
and display-formatting the API's quote numbers. Materializing the equivalent
seam for `social-feed` is separate follow-on work under its own spec.
