# Render prop→DOM binding — live rail

`RENDER-PROP-BINDING-PLAYWRIGHT-RAIL-01` — the runtime half of the binding audit.
The audit (`RENDER-PROP-BINDING-BLAST-RADIUS-01`) statically *classifies* each
prop's render obligation; this rail *falsifies* the runtime-observable ones in a
real browser. It does **not** re-infer obligations — it reads the fixed classified
matrix (`render-binding-matrix.json`) as the sole authority, selects only rows
whose `bucket ∈ {native-attr, aria-attr}` and `obligation === bound`, injects
**sentinel prop values** through the preview query seam, and asserts the attribute
materialises in the rendered DOM (queried page-wide, so portaled hosts count).

Spec scope is deliberately narrow: native-attr + aria-attr only. No content,
behavior, state/pseudo styling, screenshots, or accessibility scoring.

## How to run

```bash
# CI / repo dev server (relative base = playwright baseURL):
pnpm exec playwright test e2e/render-binding-rail.spec.ts

# Local, against a worktree dev server (absolute base):
RB_RAIL_BASE=http://localhost:5180 pnpm exec playwright test e2e/render-binding-rail.spec.ts
```

Sentinels: string props → `RAIL-<prop>` (asserted by exact value); boolean/aria
props → `true` (asserted by attribute presence). String injection rides an
explicit `?props=<encoded JSON>` channel added to `parsePropsFromQuery`
(numbers/booleans via bare keys stay narrow; strings only via the typed channel).

## Result (latest run)

**74 passed · 8 skipped (residuals) · 0 failed.**

- **Regression (required, A3):** the five formerly-missing form-control attributes
  are observable in the DOM across **react, vue, svelte, lit** — `Input.placeholder`,
  `Input.name`, `Input.required`, `Checkbox.name`, `Checkbox.value` (20 cases).
- **Coverage (A1/A2):** every other `bound` native/aria obligation that mounts in
  the default preview is observed (Input 5, Checkbox 3, and the rest).
- **False-positive control (A4):** `Input.value/onChange/defaultValue` and
  `Checkbox.checked/onChange` classify as `behavior` in the matrix and are NOT
  selected as DOM-attr obligations.

## Residuals (A5) — documented, not silently passed

| residual | frameworks | why |
|---|---|---|
| **Command** | react, vue, svelte | overlay/trigger host not mounted in the default (closed) preview — its sentinel never lands; needs interaction to observe. Not a binding failure. |
| **Sheet** | react, vue, svelte, lit | same — slide-over host closed by default. |
| **Angular** (whole framework) | angular | props are baked **before** AOT compile; there is no request-carried prop seam (the R/V/S/L query channel does not apply). |

### Finding surfaced by the rail — RESOLVED (`LIT-LABEL-HTMLFOR-DOM-ATTR-01`)

- **`lit.Label.htmlFor`** — the rail's first catch: the Lit emitter emitted `htmlFor=`
  verbatim → the **non-standard `htmlfor`** DOM attribute instead of the standard
  **`for`**, breaking the `<label>` for-association in Lit while React/Vue/Svelte
  produced `for`. **Fixed** by adding a `litDomAttrName` (`htmlFor`→`for`) lowering to
  the Lit emitter (mirroring `vueAttrName` / the Svelte equivalent); the value still
  reads from the `htmlFor` property, only the emitted attribute name is lowered. The
  rail no longer skips this — it now **asserts** `[lit] Label.htmlFor` as `for` in
  live DOM and passes. This is the audit→rail→fix loop closing on a real defect.

## What this proves / does not prove

Proves: the matrix's native/ARIA binding obligations are **actually observable in
rendered DOM** for the mounted, query-seam-reachable surfaces — most importantly
the five attrs fixed by `RENDER-PROP-BINDING-FIX-PRIMITIVES-01`. Does not prove:
content/behavior wiring, state/pseudo styling, visual correctness, or a11y scoring
(later slices), nor anything about interaction-gated overlay hosts or Angular.
