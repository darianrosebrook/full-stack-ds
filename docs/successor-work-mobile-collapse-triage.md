---
doc_id: TRIAGE-MOBILE-COLLAPSE-001
authority: reference
status: draft
title: MOBILE-COLLAPSE-INTENT-TRIAGE-01 — splitting the C bucket (collapse vs native layout)
owner: "@darianrosebrook"
updated: 2026-06-01
verified_at_commit: 8c19a4d
governs:
  - packages/ds-codegen/src/ir.ts
  - packages/ds-contracts/components/**/*.contract.json
---

# MOBILE-COLLAPSE-INTENT-TRIAGE-01

Measurement / spec-shaping only. Splits the **17 category-C** components from
[`successor-work-mobile-rail-sweep.md`](./successor-work-mobile-rail-sweep.md)
(SWEEP-01) so "native composite layout" stops being one undifferentiated
pile. **No `collapsibleTo` added, no contracts edited, no emitters
implemented.** Dispositions are derived by reading each contract's `anatomy`
(parts + DOM tree + channels), not from compound-count heuristics — the
count alone can't tell a decorative part from a structural one.

Outcomes:

- **C1 — cheap native primitive collapse.** Honestly collapses to ONE native
  host control with no semantic content left outside it. Gets a
  `collapsibleTo` intent (Phase 0.3, contract-level).
- **C2 — partial collapse + native layout.** One part collapses to a native
  primitive, but durable surrounding anatomy (label/help/content/slot) still
  needs layout. A `collapsibleTo` on the inner part helps, but the component
  still needs a native layout path.
- **C3 — true native composite layout.** Durable multi-part structure that
  must stay visible natively. No collapse intent helps; needs Native View IR
  layout work (Phase 1).
- **C4 — not a collapse problem.** Blocker is naming, child policy, a11y
  placement, or token/style projection — not primitive collapse.

## Disposition table (17 C components)

| component | cc | ch | root role / notable parts | native primitive candidate | collapse loses content? | collapse loses interaction? | required new fact | disposition | phase target |
|---|---|---|---|---|---|---|---|---|---|
| **ShowMore** | 2 | 1 | button; parts: content(slot)+trigger(button) | Button (trigger only) | **yes** — `content` slot holds user children | no | `collapsibleTo` on `trigger` | **C2** | Phase 0.3 (intent) + Phase 1 layout for content |
| **Truncate** | 1 | 1 | (none); content+toggle | Button (toggle) | **yes** — `content` is the truncated body | no | `collapsibleTo` on `toggle` | **C2** | Phase 0.3 + Phase 1 layout |
| **Details** | 1 | 1 | group; summary/icon/content, native `<details>` | DisclosureGroup / expandable | no — native disclosure holds both | no | `collapsibleTo: native-disclosure` (new intent) | **C1** | Phase 0.3 (new intent) |
| **TextField** | 1 | 1 | (none); label+field(input)+description+error | TextField (field only) | **yes** — label/description/error durable | no | `collapsibleTo` on `field` | **C2** | Phase 0.3 + Phase 1 layout |
| **Field** | 1 | 1 | group; label/header/control(slot)/help/error/meta | none — `control` is a slot | n/a — no single primitive | n/a | none (it's a layout container) | **C3** | Phase 1 layout |
| **OTP** | 1 | 1 | group; group + `field` iterated ×length | segmented field / N TextFields | partial — N inputs, not one | yes if collapsed to 1 | iteration-aware native fact | **C3** | Phase 1 layout (iteration) |
| **Shuttle** | 1 | 1 | listbox; root + `item` (selection channel) | List w/ selection | partial — many items | yes if collapsed | none — list layout | **C3** | Phase 1 layout |
| **Badge** | 1 | 0 | (none); icon+content | Label-with-icon | maybe — icon decorative | no | none — styling/layout | **C4** | defer (token/style projection) |
| **Breadcrumbs** | 1 | 0 | navigation; list/link/current/separator/overflow | none — nav structure | yes — multiple links | no | `separator` is decorative (C4 sub-issue) | **C3** | Phase 1 layout |
| **NavList** | 2 | 0 | navigation; nav structure | none | yes | no | none | **C3** | Phase 1 layout |
| **Accordion** | 4 | 1 | region; item/trigger/header/chevron/content | repeating DisclosureGroup | yes — repeating structure | yes | per-item disclosure (compose C1 ×N) | **C3** | Phase 1 layout (may reuse Details' C1 intent per item) |
| **Tabs** | 3 | 1 | (none); list/tab/indicator/panel | TabView | yes — panels are slots | yes | none — tab structure | **C3** | Phase 1 layout |
| **Card** | 4 | 0 | group; header/body/footer/media slots | none — container | yes | no | none | **C3** | Phase 1 layout |
| **Postcard** | 3 | 0 | article; multi-slot article | none — container | yes | no | none | **C3** | Phase 1 layout |
| **Table** | 7 | 0 | (none); table/thead/tbody/tr/th/td/caption | native table/grid | yes — full table structure | no | table-composition native fact | **C3** | Phase 1 layout (heaviest) |
| **Alert** | 2 | 0 | alert; icon+content | banner/label | maybe — icon decorative | no | none | **C4→C3** | Phase 1 layout (light) |
| **AlertNotice** | 2 | 0 | alert; icon+content | banner/label | maybe | no | none | **C4→C3** | Phase 1 layout (light) |

cc = compoundCount, ch = channelCount (from SWEEP-01).

## Disposition counts

| Outcome | Count | Components |
|---|---|---|
| **C1** cheap collapse | **1** | Details |
| **C2** partial collapse + layout | **3** | ShowMore, Truncate, TextField |
| **C3** true composite layout | **11** | Field, OTP, Shuttle, Breadcrumbs, NavList, Accordion, Tabs, Card, Postcard, Table, Alert/AlertNotice |
| **C4** not a collapse problem | **1** | Badge (Alert/AlertNotice fold into C3 once the icon is treated as decorative) |

## Key corrections to priors

- **ShowMore is NOT C1.** The prior (sweep + your brief) guessed ShowMore as
  the cleanest C1. The anatomy refutes it: `trigger` is a button but
  `content` is a `children` slot holding arbitrary user content that stays
  visible. Collapsing only the trigger leaves real layout — it is **C2**.
  The trigger *does* pressure the collapse-intent machinery (a button-shaped
  inner part), so it's still the right machinery test — just not a
  whole-component collapse.

- **Details is the actual cleanest C1.** It maps to a real native disclosure
  primitive (SwiftUI `DisclosureGroup`, Android expandable) that holds both
  summary and content — nothing is left outside. It needs a NEW intent
  (`native-disclosure`), which is exactly the "does the collapse-intent
  machinery generalize past `native-toggle-affordance`?" test, without
  dragging in overlay/controller work.

## Answering the charter questions

**Which contracts deserve a new `collapsibleTo` intent?**
- **Details** → `native-disclosure` (whole-component C1). Cleanest.
- **ShowMore, Truncate, TextField** → an intent on the *inner* part
  (trigger / toggle / field), but each still needs surrounding layout (C2).
- Everything else (11 C3 + Badge C4) should **force Native View IR layout
  work**, not gain a collapse intent — adding one would be the "escape the
  primitive instead of fixing the abstraction" anti-pattern the normal-form
  doc warns against.

**First implementation candidate after typed tokens (Phase 0.2) land?**

Revised recommendation: **Details, not ShowMore.** Rationale:
- It's the only true **C1** — a clean whole-component collapse that proves
  the intent machinery generalizes from 1 intent to 2
  (`native-toggle-affordance` → `native-disclosure`) with zero layout or
  controller work bleeding in.
- ShowMore (your prior) is a good *second* — it pressures the same machinery
  on the inner-part case (C2) and surfaces the "collapse + surrounding slot
  layout" pattern that 3 components share. Do it right after Details to
  validate the C2 path.
- Sequence: **Details (C1) → ShowMore (C2) → Tabs or Table (C3, the layout
  cost center).**

## Caveats / where a reviewer may disagree

- **Alert / AlertNotice** are marked C4→C3: their only compound parts are an
  icon (decorative) + content, so the "blocker" is really styling/layout, not
  collapse. If the icon is treated as a token/style concern they're nearly
  A-class; kept in C3 because they still need a two-part native layout.
- **Accordion** is C3 but composes the **Details C1 intent per item** — once
  `native-disclosure` exists, Accordion is "a list of disclosures," which may
  drop its layout cost. Worth re-checking after Details lands.
- Dispositions for **OTP** (iteration) and **Table** (7-part grid) are the
  least certain — both may need their own native facts (segmented-input,
  table-composition) that this triage names but does not design.
- This triage reads anatomy at commit 8c19a4d. It does not run the native
  emitters (none exist past SwiftUI's Switch path), so "would collapse lose
  content?" is judged from the contract's part roles + DOM tree, not from
  observed native output.
