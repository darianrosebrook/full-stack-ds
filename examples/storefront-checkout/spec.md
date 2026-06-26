# Storefront → checkout — spec

A storefront that leads into a multi-step checkout: a customer browses a small product catalog, selects options, builds a cart, applies a promo code, and walks a contact → shipping → payment → review → confirmation flow with real validation and recovery from bad input. Framework-agnostic. Every implementation under `examples/storefront-checkout/<framework>/` must satisfy this spec using only the public API of its corresponding `@full-stack-ds/<framework>` package.

This is not an isolated checkout form. It is the whole arc: a browse surface with product cards and option selection, a cart that derives totals, and a stepper-driven checkout where each step gates progress on validation, errors are recoverable, and a final review confirms before a simulated commit. No backend; all state is in-memory.

## Why this app

**Real consumer pressure.** Checkout is the canonical "assembly" — and it is where component systems are most often forked. It demands choice controls under validation (quantity, variant, shipping method, payment), a cart whose totals are *derived* (subtotal → discount → shipping → tax → total), a multi-step flow whose Continue buttons are *disabled until valid*, promo and error messaging that must appear at the right altitude, and recovery from invalid input (a rejected promo, a malformed card field, a failed payment) without losing prior steps. Each is a place where an input can fail to expose validation state, a button can fail to reflect a disabled/pending posture, or a step can force the consumer into a private import or a CSS patch.

**Why it is not a toy demo.** A toy demo renders a single form and posts it. This spec forces a *state machine* with coupled derived state: the cart drives the order summary, the order summary persists across steps, each step validates before advancing, and the back button must let the customer edit a prior step without discarding later input. The promo code path must reject an invalid code with a recoverable error and recompute totals when a valid one is applied. The payment step must reach a *pending* state and then either confirm or surface a recoverable failure. If any of this can only be wired by leaking renderer internals, the app shape has found a boundary weakness.

**Component families stressed.** Inputs and form composition under validation (`Field`, `Input`, `TextField`, `Label`, `OTP`), choice controls (`Select`, `Checkbox`, `Switch`/`ToggleSwitch`), data display and status (`Card`, `Badge`, `Stat`, `Image`, `Divider`, `List`), progress and stepper-like flow (`Progress`, `Tabs`, `Walkthrough`), feedback and overlays (`Toast`, `Alert`, `AlertNotice`, `Dialog`, `Sheet`, `Tooltip`, `Spinner`, `Skeleton`), and layout owned by `Stack` and `Card`.

**This app shape IS the assembly layer.** The repo's layered methodology (see `src/views/ComponentComplexityView.tsx`) uses a *checkout flow* as its single worked example of an assembly: a product-specific state machine (`cart → shipping → payment → review → confirmation`), owned by the app, **composed from system parts and never forking or re-styling them.** This example is that assembly made executable across five frameworks. The methodology's assembly pitfalls — *pushing product policy (tax math, promo rules) into the system*, *forking system components inside assemblies*, and *hiding the state machine* — are exactly this spec's discipline: product policy and the explicit step machine live in the lane; the visual surface is unmodified system compounds and composers. If the checkout cannot be assembled from public exports without re-styling a `Button` or rewriting a `Field`, the system's composer/compound layer is not yet expressive enough to support assemblies.

## Primary claim

Once the framework lanes exist, this app shape proves a bounded claim: **a storefront-to-checkout assembly — product browsing with option selection, a derived-total cart, promo/error messaging, a validated multi-step checkout with disabled/validating/pending states and invalid-input recovery, and a review/confirmation step — can be composed from the public exports of each `@full-stack-ds/<framework>` package, with identical consumer-facing semantics across React, Vue, Svelte, Angular, and Lit, without renderer-internal imports or local CSS substituting for package behavior.**

The claim is bounded: it asserts *consumer-app composability and cross-framework semantic parity for this assembly*, not that the checkout is production-grade, secure, payment-compliant, accessible to a published standard, or visually polished.

## Falsifiers

Any of these is evidence the claim is false (or the boundary is too weak), to be recorded in the findings log — never worked around silently:

- **Private import.** A lane imports from `dist/`, a generated internal path, a source file, or any non-exported package path to obtain a component, type, behavior primitive, or style.
- **Local CSS substituting for package behavior.** A lane uses hand-authored CSS to supply validation indication (invalid/error styling), disabled/pending appearance, step-progress indication, focus styling, overlay layering, or any state the package should own. (Minimal page-frame layout no package component owns is allowed, but must be noted.)
- **Missing public export.** A surface the assembly legitimately needs (an input validation/error channel, a button disabled/pending posture, a step-change event, a promo-apply affordance, a dialog/sheet open channel, a toast trigger) is not reachable from public exports.
- **Framework-specific semantic rewrite.** The spec has to be reinterpreted for one framework — e.g. one framework needs a different validation model, a different controlled-input posture, or a different step-advance contract — to make the lane pass.
- **Missing required state or event.** The lane cannot model a required state (validating, invalid, disabled, pending, error, confirmed) or cannot observe a required event (input change, blur/validate, step advance, promo apply, submit) through the public surface.
- **Inconsistent cross-framework semantics.** The same component requires materially different consumer semantics (event names, channel keys, controlled/uncontrolled posture, validation timing, dismissal behavior) across frameworks.
- **App-spec rewrite to dodge a failure.** A failure is hidden by weakening this spec instead of filing the gap against the contract, IR, emitter, package export map, or runtime behavior.

## Framework-neutral requirements

### Page / screen structure

A two-phase app, no routing library required (an in-app view/step switch is sufficient): a **storefront** phase (catalog + cart) and a **checkout** phase (a stepper through contact → shipping → payment → review → confirmation). A persistent **order summary** is visible throughout checkout. Use FSDS components (`Stack`, `Card`, etc.) for component composition and package-owned behavior. Minimal app-shell layout CSS is allowed for page regions the design system does not claim (the catalog grid frame, the checkout/summary columns, sticky regions, responsive shell), but it must not substitute for component behavior, state indication, validation/disabled/pending appearance, focus, overlay, or token/styling surfaces — those must come from the package, and a place where app-shell CSS has to supply one of them is a finding.

### Required regions

1. **Catalog** — a grid/list of product `Card`s. Each shows an `Image`, title, price, an option `Select` (e.g. size/variant), a quantity control, and an "Add to cart" `Button`. Out-of-stock products render a disabled add affordance and a `Badge`/`Status`.
2. **Cart** — a `Card`/`Sheet` listing added line items (variant, quantity, unit price, line total), each with quantity edit and a remove affordance. A promo-code `Field`/`Input` with an "Apply" `Button`. An order summary showing subtotal, discount (if a promo is applied), shipping, tax, and total — all derived.
3. **Checkout stepper** — a step indicator (`Progress`, `Tabs`, or `Walkthrough` — see pressure points) over five steps: **Contact** (email + name), **Shipping** (address + shipping-method choice), **Payment** (card fields; `OTP` may stand in for a verification code), **Review** (read-only recap of all entered data + cart), **Confirmation** (success state with an order id). Each step's "Continue" is disabled until that step validates; a "Back" affordance returns to the prior step without discarding entered data.
4. **Feedback / overlays** — an `Alert`/`AlertNotice` region for step-level errors (invalid promo, payment failure), a `Toast` region for transient acknowledgements (item added, promo applied), an optional confirm `Dialog` (e.g. "Remove last item?" or "Cancel checkout?"), and a `Sheet` for the cart on smaller layouts. `Tooltip` carries secondary affordances (e.g. explaining the CVV field).

### Required interactions

- Selecting a product option updates that product's selection; "Add to cart" creates or increments a cart line and raises a `Toast`.
- Editing a line-item quantity updates the line total and the order summary; removing a line updates both (and may require a confirm `Dialog` for the last item).
- Applying a valid promo code reduces the discount and recomputes totals + raises a `Toast`; applying an invalid promo shows a recoverable `Alert` error and leaves totals unchanged.
- Advancing the stepper requires the current step to validate; an invalid field shows its error and keeps "Continue" disabled until corrected.
- "Back" returns to the prior step with all previously entered data intact.
- The payment step's submit enters a pending state (`Spinner`/disabled), then either advances to Review (mock success) or shows a recoverable payment-failure `Alert` (mock failure flag) that lets the customer retry.
- Review shows a read-only recap; "Place order" enters a pending state, then advances to Confirmation with a generated order id and a success `Alert`/`Toast`.
- Starting checkout with an empty cart is blocked (the "Checkout" affordance is disabled until the cart has at least one line).

### Data and API layer

No backend (no server, no network, no persistence). The lane structures its data as three separated concerns (see the portfolio README's "Data and API Layer"):

1. **Fixtures** — static `*.json` / `*.jsonl` files in the lane holding the product catalog, promo codes, shipping methods, and tax/shipping rules.
2. **Adapter** — a lane-local reader that parses the fixtures into typed domain records (`Product`, `PromoCode`, `ShippingMethod`). The adapter may load the static JSON/JSONL fixtures once into memory; the UI calls only the promise-returning API, never the fixture or adapter directly.
3. **Functional API** — a lane-local, typed, **promise-returning** surface the assembly calls: e.g. `listProducts(): Promise<Product[]>`, `validatePromo(code): Promise<PromoResult>`, `submitPayment(payload): Promise<PaymentResult>`, `placeOrder(order): Promise<{ orderId: string }>`. The simulated load latency, the promo validity rule, and the mock payment-failure flag live **behind** this API, so the validating/pending/error states below are real async transitions, not synchronous fakes. Totals math and product policy may live in the lane (assembly-owned) or behind the API, but the assembly never reads the fixture or adapter directly.

### Required local / loading / empty / error / pending states

- **Loading** — the catalog renders `Skeleton`/`Spinner` placeholders while the functional API's `listProducts` promise is pending (simulated latency over the JSON fixture; no network).
- **Empty** — the cart shows an empty state when it has no lines, distinct from loading; the catalog shows an empty state if a (future) catalog filter matches nothing.
- **Validating / invalid** — each form field can be in validating (on blur) and invalid (with an error message) states; "Continue" reflects the aggregate validity as a disabled posture.
- **Pending / optimistic** — adding to cart is optimistic (line appears immediately); the payment and place-order submits are pending (disabled + `Spinner`) until the simulated commit resolves.
- **Error** — invalid promo and mock payment failure render recoverable `Alert`/`AlertNotice` errors with a retry/correct path; correcting and re-submitting clears the error.

### Expected components and pressure-point residuals

Expected (must come from public exports): `Stack`, `Card` (+ parts), `Image`, `Field`, `Input`, `TextField`, `Label`, `Select`, `Checkbox`, `Switch`/`ToggleSwitch`, `Button`, `Badge`, `Status`, `Stat`, `Divider`, `List`, `Progress`, `Tabs`, `Dialog` (+ parts), `Sheet`, `Toast`, `Alert`/`AlertNotice`, `Spinner`, `Skeleton`, `Tooltip`, `OTP`.

Pressure-point residuals (the assembly naturally wants these; absence from public exports is a finding, not a reason to hand-roll): a dedicated **Stepper / Steps** component owning step state and the progress indicator (the spec falls back to `Progress` + `Tabs` or `Walkthrough` and app-owned step state), a **RadioGroup** for shipping-method and payment-method choice (the spec falls back to `Select` or a `Checkbox`-styled single-select, which is a known semantic compromise to record), a **Textarea** for an order note (falls back to `Input`), a **NumberField / quantity stepper** for line quantities (falls back to `Input type=number` plus increment/decrement `Button`s), and a **form-level validation composer** binding field errors to a submit gate (falls back to app-owned validation state). Each residual the lane cannot satisfy from public exports is recorded below.

## Interaction requirements

These are concrete enough to become future Playwright / runtime checks. Each lane must satisfy all of them.

1. **Add to cart.** Choose a product option, set quantity 2, activate "Add to cart" → a cart line appears with quantity 2 and the correct line total; a `Toast` acknowledges; the cart count badge increments.
2. **Out-of-stock block.** An out-of-stock product's "Add to cart" is disabled and shows an out-of-stock `Badge`/`Status`.
3. **Quantity & remove.** Increase a line's quantity → line total and order summary recompute; remove a line → it disappears and totals recompute; removing the last line shows the cart empty state.
4. **Valid promo.** Apply a known-good promo code → discount appears in the summary, total decreases, a `Toast` acknowledges.
5. **Invalid promo recovery.** Apply a bad promo code → a recoverable `Alert` error appears, totals are unchanged; entering a valid code afterward clears the error and applies the discount.
6. **Empty-cart gate.** With an empty cart, the "Checkout" affordance is disabled; after adding a line it becomes enabled.
7. **Step validation gate.** On the Contact step, leave email blank/malformed → "Continue" stays disabled and the field shows its error; entering a valid email enables "Continue".
8. **Back preserves data.** Advance to Shipping, fill it, advance to Payment, then go "Back" twice → Contact and Shipping retain everything entered.
9. **Payment pending + failure recovery.** Submit payment with the mock-failure flag on → a pending state shows, then a recoverable payment `Alert`; retry with the flag off → advances to Review.
10. **Review → confirmation.** On Review, all entered data and the cart are shown read-only; "Place order" shows a pending state, then Confirmation appears with a generated order id and a success `Alert`/`Toast`.
11. **Overlay focus & dismissal.** A confirm `Dialog` (e.g. "Cancel checkout?") traps focus; `Escape` and backdrop dismiss it per the component's default channels; the cart `Sheet` dismisses per its own channel. Dismissal semantics match across frameworks.

## State model

App-local state only; no backend. Product, promo, and shipping data is served by the lane's functional API (typed, promise-returning) over static JSON/JSONL fixtures via an adapter (see "Data and API layer"); cart, form, and step state is held locally by the assembly. No package imports data. The checkout step machine is an explicit tagged value (`contact | shipping | payment | review | confirmation`), per the assembly methodology's "make the state machine explicit" rule.

- **User-controlled state:** per-product option selection and quantity, cart line quantities, promo-code input, every checkout form field (email, name, address, shipping method, payment fields, order note), the accepted-terms toggle, and the open/closed state of each controlled overlay (cart sheet, confirm dialog).
- **Derived state:** the cart line totals, the order summary (subtotal → discount → shipping → tax → total — product policy owned by the lane), the cart count badge, the per-step validity (derived from field validation), the aggregate "can advance" gate per step, and the "can checkout" gate (cart length > 0).
- **Pending / optimistic state:** add-to-cart (optimistic line insertion), the payment submit (`submitPayment` promise), and the place-order submit (`placeOrder` promise) — both pending → resolved via the API, with disabled + `Spinner`.
- **Error state:** the invalid-promo error (from `validatePromo`), per-field validation errors, and the API's mock payment-failure flag and its `Alert`; each error has an explicit recovery transition.
- **Display-only state:** product metadata (image, description), price formatting, the confirmation order id (from `placeOrder`) and recap, and any informational copy — served/derived from the API and lane state, never edited directly.

## Public package boundary

Framework implementations may import **only** from public `@full-stack-ds/<framework>` package exports and that package's public CSS/style export (e.g. `import "@full-stack-ds/<framework>/styles.css"`). No reaching into `dist/` internals, generated internals, source files, non-exported package paths, or copying package code into the lane. Behavior primitives (focus trap, dismissal, validation) are consumed only insofar as a public component re-exports them; a lane must not import a renderer-internal hook directly. The fixtures, adapter, functional API, totals math, promo rules, validation rules, and the step machine are **lane-local app-layer code** — they live in the lane, not in any package, and are not part of the package boundary; component behavior, validation/error indication, and styling come from the package.

## Acceptance

A future, populated lane is accepted when:

1. **Build acceptance.** The lane builds without errors against the committed workspace package (`pnpm build`), with no type errors that require casts past the public types.
2. **Interaction acceptance.** All eleven interaction requirements above pass under a future Playwright/runtime check driven from committed files only.
3. **Cross-framework semantic parity.** The same spec is realized in React, Vue, Svelte, Angular, and Lit with identical consumer-facing semantics (same events observed, same channels, same controlled posture, same validation timing, same dismissal behavior). Divergence is a finding.
4. **No escape-hatch acceptance.** No falsifier above is present: no private imports, no behavior-substituting local CSS, no spec rewrite, no hand-rolled replacement for a component the package should provide, and no forking/re-styling of a system component inside the assembly.

Until all admitted Web DOM lanes meet 1–4, this app shape remains a partial proving surface, not admitted parity evidence.

## React Native posture

RN is **not** an initial lane for this app shape. The checkout assembly's first proof belongs to the admitted Web DOM family, where the form/overlay/stepper composition is exercised end to end. If an RN follow-on is added later, its first posture is a **typecheck / consumer-transfer fixture** (mirroring `settings/react-native`), not full app parity — it would prove only that the RN package's public exports type-check against this app's component usage, not that the multi-step flow reaches visual or interaction parity. Until that fixture exists, this spec makes no RN claim.

## Non-claims

- **Not visual-quality proof.** The storefront uses package CSS and stays visually modest. It does not assert design polish, layout taste, or responsive breakpoints beyond what package components provide.
- **Not backend / data / payment proof.** There is no backend: data is a static JSON/JSONL fixture read through a lane-local adapter and served by a lane-local functional API. The promise-returning API is a real-to-life *shape*, not a real backend — the app proves nothing about real catalogs, real payment processing, PCI compliance, fraud handling, or persistence. The card/OTP fields are mock UI only.
- **Not standalone accessibility proof.** It exercises shipped component behavior; accessibility adequacy claims belong to component contracts, generated behavior primitives, and dedicated a11y rails — not to this example.
- **Not generated-artifact admission.** This app shape pressures *consumer-side package consumption*. The governed rail (artifact ↔ contract ↔ codegen ↔ environment binding) remains a separate, independent gate.

## Initial findings log

Reserved for findings surfaced while implementing the framework lanes. Record each consumer-API gap, residual that could not be satisfied from public exports, or cross-framework semantic divergence here. **Do not silently change this spec to make a lane pass — record the gap, then promote it into an issue, contract, IR, emitter, package export, or test.**

| # | Lane(s) | Surface | Finding | Status |
|---|---------|---------|---------|--------|
| _none yet_ | | | | |
