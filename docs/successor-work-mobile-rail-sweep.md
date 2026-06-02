---
doc_id: SWEEP-MOBILE-IR-PARITY-001
authority: reference
status: draft
title: MOBILE-IR-FACT-PARITY-SWEEP-01 — corpus classification for mobile rail parity
owner: "@darianrosebrook"
updated: 2026-06-02
verified_at_commit: 5103447
governs:
  - packages/ds-codegen/src/ir.ts
---

# MOBILE-IR-FACT-PARITY-SWEEP-01

Measurement-only sweep. Builds the framework-neutral IR for all 47 component
contracts (via `scripts/mobile-ir-fact-parity-sweep.mjs`, mirroring the CLI
load order: contract + tokens/styles sidecars → `buildComponentIR`) and
classifies what blocks a minimal native realization (SwiftUI / Jetpack
Compose / React Native). No targets registered, no `TargetId` widened, no
packages created, no emitters implemented. Reproduce:

```bash
pnpm exec turbo run build --filter=@full-stack-ds/codegen
node scripts/mobile-ir-fact-parity-sweep.mjs --csv tmp/sweep.csv
```

UIKit is excluded from the estimate (working assumption: drop UIKit for
admission parity, keep as reference scaffold). The sweep found no UIKit-only
semantic requirement that would change the IR design, so the assumption
holds.

## Headline: the prior survey's load-bearing blocker is empirically refuted

The earlier emitter survey claimed the IR "destroys" the semantic role fact
for non-DOM targets because `root.effectiveRole` elides roles implicit on
the HTML element (e.g. `<button>` → `effectiveRole = undefined`). **The
mechanism is real, but the corpus impact is zero.** Measured across all 47:

- **True role loss: 0/47.** There is no contract where the element implies a
  role, the contract fails to restate it, and the IR elides it.
- **7 components have an element-implied root role** (Button, Chip, ShowMore,
  Postcard, Breadcrumbs, NavList, Accordion). **All 7 also declare the role
  explicitly** in the contract, so `root.explicitRole` retains the fact a
  native emitter reads. The elision only drops the *redundant*
  `effectiveRole`; the semantic fact survives in `explicitRole`.

Evidence — `Button`: `element=button, explicitRole=button,
implicitRole=button, effectiveRole=(elided)`. A native emitter reads
`explicitRole = "button"` directly. Same shape for all 7.

**Consequence:** Phase 0.1 as originally scoped (repair role elision) is
**near-empty work**. The defensive authoring convention (always restate
implicit roles explicitly) already protects non-DOM consumers. This is worth
*encoding as an invariant* — a contract lint that requires an explicit
`a11y.role` whenever the root element carries an implicit one — so the
property that makes the elision harmless cannot silently regress. That lint
is the actual Phase 0.1, and it is small.

There is a *different* role finding (below): 15 components carry no root role
fact at all.

> **Forward reconciliation (2026-06-02).** This sweep is preserved unchanged as
> the historical measurement record (corpus at `5103447`). What it named has
> since moved: the **Phase 0.2 typed-token gap** it identified closed via
> `FEAT-MOBILE-IR-001` (closed `eb933df`); the **C1/Details collapse
> candidate** it flagged was proven via `FEAT-MOBILE-DISCLOSURE-001` (closed
> `f00110c`, `native-disclosure` intent); and the structural web↔native
> asymmetry is now measured in the parity matrix
> `REF-MOBILE-PARITY-MATRIX-001` (`docs/successor-work-mobile-parity-matrix.md`,
> `MOBILE-PARITY-QUALITY-RECON-01` closed `2788873`). The A=21 / C=17 / D=9
> split and role-loss 0/47 below are the original sweep numbers and are **not**
> revised here.

## Category distribution (47 contracts)

| Cat | Meaning | Count | Members |
|---|---|---|---|
| **A** | Renderable from existing semantic IR facts now | **21** | Avatar, Blockquote, Button, Checkbox, Chip, Divider, Icon, Image, Input, Label, Links, List, ProfileFlag, Progress, Skeleton, Spinner, Stat, Status, Switch, Text, ToggleSwitch |
| **B** | Renderable after known Phase 0 IR fact repair (role elision) | **0** | — (refuted; see headline) |
| **C** | Blocked by missing collapse intent / native-layout decision | **17** | Accordion, Alert, AlertNotice, Badge, Breadcrumbs, Card, Details, Field, NavList, OTP, Postcard, ShowMore, Shuttle, Table, Tabs, TextField, Truncate |
| **D** | Blocked by runtime controller / surface work | **9** | Calendar, Command, Dialog, Popover, Select, Sheet, Toast, Tooltip, Walkthrough |
| **E** | Non-visual / form-serialization residual | **0** | — |

Full per-component table with all 18 columns: `tmp/sweep.csv` (regenerate as
above; `tmp/` is gitignored scratch). The CSV columns are: component,
category, phaseBucket, element, explicitRole, effectiveRole, implicitRole,
roleLost, collapseIntents, nativeCandidate, channelCount, labelingCount,
compoundCount, surfaceKind, controllerDep, tokenDep, blockingMissingFact,
upstreamHome.

### Reading the categories

**A (21) — IR-sufficient single shapes.** These map to a single native
primitive or plain view with facts already on the IR. Includes the 4
interactive single-shape components (Checkbox, Input, Switch, ToggleSwitch),
all `compoundCount=0`. Switch is the proven case — it declares
`collapsibleTo: native-toggle-affordance` and SwiftUI already emits it.
These are **Phase 1 emitter-only** work: no IR change needed, just write the
per-target emission for the shape.

**C (17) — multi-part anatomy, no collapse intent.** Each has ≥1 compound
part and no declared `collapsibleTo`. Two sub-shapes:
- *Genuine composite layout* (compound ≥ 2): Accordion(4), Card(4), Table(7),
  Postcard(3), Tabs(3), Alert(2), AlertNotice(2), NavList(2). A native
  emitter must lay out multiple parts — no single primitive collapses them.
- *Collapse candidates* (compound = 1, or button-shaped): Badge, Breadcrumbs,
  Details, Field, OTP, Shuttle, TextField, Truncate, **ShowMore**. ShowMore
  is notable — `nativeCandidate=Button, role=button`, so like Switch it
  *could* gain a `collapsibleTo` intent and drop to category A. These are the
  components that decide whether Phase 0.3 is small (add a few collapse
  intents) or large (build a general native-layout path).

**D (9) — runtime controller / surface.** Overlay/portal components with a
real `portal.enabled`, dismissal triggers, or a presence surface (Popover,
Tooltip). These need a native controller (presentation, focus, dismissal),
not just a view projection — the heaviest Phase 1 work, and the place mobile
genuinely diverges from web (no portal/DOM-overlay equivalent; iOS sheets,
Android dialogs, RN modals are different controllers).

## The collapse split (Phase 0.3 / Phase 1 sizing)

| Collapse bucket | Count | Components |
|---|---|---|
| 1. Existing `native-toggle-affordance` | **1** | Switch |
| 2. Primitive candidate, no intent (A-class) | 0 | (the A interactives already render without an intent) |
| 3. Multi-part needing native layout | **7+** | Accordion, Card, Table, Postcard, Tabs, NavList, Alert(Notice) |
| 4. Surface needing controller | **9** | the D category |

The actionable Phase 0.3 question is the C *collapse candidates* (9
single-compound or button-shaped): how many gain a `collapsibleTo` intent
(small, contract-level change) vs. force a general native-layout emitter
path. ShowMore is the clearest "add an intent" case.

## The role finding that IS real: 15 components carry no root role

Distinct from the (refuted) elision claim. 15 of 47 have `element=div` with
no explicit, implicit, or effective role:

> Badge, Blockquote, Icon, Label, Links, List, ProfileFlag, Stat, Status,
> Switch, Table, Tabs, Text, TextField, Truncate

Most are correctly role-less (Text, Badge, Icon, Label → plain native View).
But **4 are interactive** (Switch, Tabs, TextField, Truncate have channels)
yet expose no root role. For those the native accessibility role lives at the
part level or is implied by the native primitive choice — a native emitter
needs a rule for where to read it. This is a **native-a11y-parity** question
(decision #4 in the parent roadmap), not a blocker for visual rendering.

## Revised phase sizing (replaces the parent roadmap's Phase 0 estimate)

- **Phase 0.1 (role):** NOT "repair elision" (zero impact). Instead: add a
  contract lint asserting explicit `a11y.role` when the root element implies
  one, to lock the invariant that makes elision harmless. Small.
- **Phase 0.2 (typed tokens):** Real and universal — `tokenDep` is true for
  47/47; every native emitter would otherwise mine token values out of
  `cssBlocks` CSS strings (the SwiftUI `findSizeToken` hack). Expose typed
  token facts on the IR. This is the single highest-leverage IR change
  because it unblocks every category including A. Medium, one-time.
- **Phase 0.3 (collapse intents):** Bounded — ~9 C-class collapse candidates
  to triage; ShowMore-style cases are cheap contract additions, the rest fall
  to Phase 1 native layout.
- **Phase 1 (emitters):** 21 A-class are emitter-only (no IR dependency once
  0.2 lands). 17 C-class need native layout. 9 D-class need native
  controllers — the real cost center and the genuine non-DOM divergence.

## Acceptance check

This sweep answers the chartered question: of 47 contracts —
- **21 are already IR-sufficient** (category A; Phase 1 emitter-only).
- **0 need semantic-role repair** (the feared blocker; refuted with evidence).
- **All 47 need typed token facts** (Phase 0.2 — the real universal IR gap).
- **~9 need collapse-intent triage** (Phase 0.3; ShowMore-style cheap, rest → layout).
- **17 need native composite layout, 9 need native controllers** (Phase 1
  emitter/runtime, not IR facts).

So the incompleteness is overwhelmingly **emitter + native-controller work
(Phase 1)** plus **one universal IR fact gap (typed tokens, Phase 0.2)** —
NOT the semantic-role-fact loss the prior survey led with. The parent
roadmap's Phase 0.1 should be rewritten from "repair role elision" to
"lock the explicit-role invariant with a lint," and Phase 0.2 (typed tokens)
should be promoted to the critical-path IR change.

## Sweep method caveats (where this could be wrong)

- The classifier is heuristic on `nativeCandidate` and the A/C boundary for
  single-compound components — a reviewer may reclassify a few C↔A. The
  category *counts* are robust; the borderline 1-compound members are the
  soft cases (flagged inline above).
- `controllerDep` deliberately ignores `focus.model: "auto"` (defers to
  platform) and `portal.enabled: false` — both are IR defaults, not real
  dependencies. Without that correction the D count inflates from 9 to ~25
  (the first sweep pass did exactly this before the fix).
- "Role loss = 0" is a fact about *this* corpus at commit 5103447. It is the
  authoring convention, not an IR guarantee — which is exactly why Phase 0.1
  should encode it as a lint rather than assume it persists.
