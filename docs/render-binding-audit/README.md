# Render prop→DOM binding obligation audit

`RENDER-PROP-BINDING-BLAST-RADIUS-01` — a **read-only**, deterministic audit of
whether every declared component prop's *render obligation* is satisfied across
all five framework targets. It classifies and measures; it makes **no** changes
to contracts, IR, emitters, or generated artifacts. This is the missing
semantic/render proof layer: the box-model/geometry audit proves layout, but is
structurally blind to "is this prop actually wired to the DOM?".

## Outputs

- `render-binding-matrix.json` — machine-readable matrix (component × prop ×
  bucket × per-framework status) + `failingClasses`.
- `render-binding-matrix.md` — the same as human-readable tables.
- Tool: `scripts/render-binding-audit/audit.mjs` (re-run: `node scripts/render-binding-audit/audit.mjs`).
- Locked test: `scripts/render-binding-audit/binding.test.mjs` (`node …/binding.test.mjs`).

## How an obligation is derived (no component-name lore)

Each prop's obligation is read from the contract's **own declared structure**,
never from the component name:

| bucket | meaning | derived from |
|---|---|---|
| `native-attr` | bind to a host element attribute | `anatomy.dom.bindings` (non-aria key) · `passthrough` · `form.name/required` · host-capability of `anatomy.dom.tag` |
| `aria-attr` | accessibility attribute, often DERIVED (`invalid`→`aria-invalid`) | `anatomy.dom.bindings` (aria-* key) |
| `class-state` | class / data-state selector | `variants` |
| `content` | visible text / node content | `propType.kind==='node'` · `anatomy.dom.content`/`iteration` |
| `behavior` | event/channel logic, NOT a DOM attr | `channels` · `propType.kind==='callback'` · `anatomy.dom.events` |
| `no-render` | legitimate surface, no direct DOM projection | none of the above |

The classifier walks the **full `anatomy.dom` tree** (so nested form controls —
e.g. `TextField` `div>input`, `Switch` `label>input` — are captured, not just
the root). The host-capability rule (`fixtures/host-capabilities.json`) is the
**only** name-based step and is deliberately restricted to **element-specific**
native attributes (`placeholder`, `name`, `required`, `type`, `src`, `href`,
`value`, …). Global ambiguous attributes (`title`, `id`, `role`) are **excluded**
from native-attr inference because a prop named `title` is far more often visible
content than the HTML `title` tooltip attribute — inferring native-attr from a
global name is the overcorrection that mis-flags content props.

Each `native-attr`/`aria-attr` row is then **verified against the generated
artifacts** of all five frameworks (does the attribute actually appear bound on
the element?), so a "missing" verdict is corroborated, not just inferred.

## Findings (commit-stable)

47 components · 305 declared prop rows. Bucket distribution:
`no-render 95 · behavior 75 · class-state 60 · native-attr 35 · aria-attr 27 · content 11 · css-var 2`.

### Failing class A — native-attr declared but NOT bound (confirmed absent in all 5 frameworks): **5**

| component | prop | expected host binding |
|---|---|---|
| Input | `placeholder` | `input[placeholder]` |
| Input | `name` | `input[name]` |
| Input | `required` | `input[required]` |
| Checkbox | `name` | `input[name]` |
| Checkbox | `value` | `input[value]` |

### Failing class B — aria-attr expected but absent in all 5: **0**

### Root cause

The gap is confined to the **primitive** form controls (`Input`, `Checkbox`,
both root `<input>`). They declare these native form attributes as `designed`
props (and via the `form` block) but **omit them from `anatomy.dom.bindings`** —
the realization map the emitter walks. The emitter binds only what the map lists,
so these props are declared, typed, destructured, and **dropped** in every
framework. The **compound** controls did it correctly: `TextField` and `Switch`
both bind `name`/`value`/`type` on their nested `<input>` node, and `Image` binds
`src`/`alt` — verified, not flagged. So this is incomplete per-component binding
maps on two primitives, not a systemic emitter failure.

## Smallest source-level fix slice (proposal — NOT applied here)

**Recommended (smallest that closes the measured gap): complete the binding maps
on the two primitive contracts.** Add the five missing `prop:` entries to
`anatomy.dom.bindings`:

- `Input`: `placeholder: "prop:placeholder"`, `name: "prop:name"`, `required: "prop:required"`
- `Checkbox`: `name: "prop:name"`, `value: "prop:value"`

then regenerate all five frameworks and re-run this audit + the runtime rail.
This is **in-pattern** (exactly how `TextField`/`Switch` already declare their
nested-input bindings — no new lore), touches **2 contracts / 5 lines**, and is
fully covered by the regression lock in `binding.test.mjs`.

**Durable follow-up (your slice 2, optional): a generic IR rule** that auto-binds
a `designed` prop to the host element when the prop name is an element-specific
native attribute of `anatomy.dom.tag` and it is not already bound. This would
prevent *future* omissions corpus-wide. It is larger (touches the IR/emitter and
must be guarded against over-binding) and is **not required** to close today's
gap, since the audit shows only two primitives are affected. Sequence it after
the contract fix if recurrence is a concern; the Playwright prop-binding rail
(slice 3) can then assert the classified obligations directly.

## Residuals & limitations (for follow-up slices)

- **Host-capability list is conservative.** `fixtures/host-capabilities.json`
  lists high-signal form/media/link attributes, not every HTML attribute. An
  exotic native attribute declared-but-unbound could be a false negative. Widen
  the list as needed; the regression lock will catch additions.
- **String-typed content props land in `no-render`.** Content is recognized only
  via `propType.kind==='node'` or an `anatomy.dom.content`/`iteration` binding.
  A `label`/`title`/`description` declared as a plain `string` (rendered by the
  component's own template logic, not a declared binding) is bucketed `no-render`
  rather than `content`. This inflates `no-render` and under-counts `content`,
  but is **benign for the failing classes** (it never produces a false
  native-attr miss). Tightening content classification is a slice-4 concern.
- **Per-framework verification is a binding-pattern grep**, not a parse. It
  corroborates the contract-level verdict; a genuinely novel binding syntax could
  read as absent. The five confirmed misses were absent across all five.
- **State/pseudo styling not in scope here.** `::placeholder` colour, and
  hover/focus/disabled/invalid/checked visual states (Failing class B/C in the
  broader plan) are a later slice; this pass covers prop→DOM binding obligations.
