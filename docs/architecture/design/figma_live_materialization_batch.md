---
doc_id: ARCH-FIGMA-LIVE-MATERIALIZATION-BATCH-001
authority: working
status: draft
title: Figma live materialization batch — Button + Chip + Status
owner: "@darianrosebrook"
updated: 2026-05-27
governs:
  - packages/ds-figma-plugin/src/plugin.ts
  - packages/ds-figma-plugin/src/plugin.test.ts
  - scripts/devtools/figma-live-materialization-batch.js
note: |
  Slice FIGMA-LIVE-MATERIALIZATION-BATCH-01. Executes the
  descriptor-driven generic materializer landed in
  FIGMA-COMPONENT-SET-GENERIC-MATERIALIZER-01 against a real Figma
  scratch file via Chrome DevTools `evaluate_script`. Verifies that
  Button (18 cells), Chip (9), Status (5), Stack primitive, and two
  placeholder leaves (Label, Avatar) all materialize through the
  real `figma.*` API and not just the mocked test surface.

  The live run surfaced one real bug invisible to the mocked tests:
  `figma.combineAsVariants(components, parent)` requires components
  and parent on the same page; `createComponent` binds new nodes to
  `figma.currentPage`. Without `setCurrentPageAsync(newPage)` before
  any `createComponent`, every component-set materialization throws.
  Fixed in production `plugin.ts`. Live-only incompatibility — within
  slice scope.
---

# Figma live materialization batch — Button + Chip + Status

## 1. Environment

| Field | Value |
|---|---|
| Figma file | `https://www.figma.com/design/71PInQdHSoeEm8L3JMPXPU/Untitled` |
| Scratch page (created by batch) | `FSDS_LIVE_BATCH` (id `3:148`, removed after capture) |
| Surface | Chrome DevTools `evaluate_script` against the logged-in Figma web app page-script context |
| Figma API | `editorType: "figma"`, `apiVersion: "1.0.0"` |
| Script | `scripts/devtools/figma-live-materialization-batch.js` (descriptor placeholder; see `scripts/devtools/bundle-descriptors.mjs` for the slim descriptor extractor) |
| Run timestamp | 2026-05-27 |
| Evidence (raw) | `tmp/figma-live-batch-evidence.json` (gitignored; reproduced verbatim in §3 below) |

## 2. Expected vs observed

| Subject | Expected | Observed | Result |
|---|---|---|---|
| Stack primitive | component set, 2 children (`variant=vertical`, `variant=horizontal`) | id `3:151`, 2 children, names match | ✅ |
| Button component set | 18 children = 3 sizes × 6 variants, cartesian-named | id `3:188`, 18 children, all 18 names present | ✅ |
| Chip component set | 9 children = 3 variants × 3 sizes | id `3:207`, 9 children, all 9 names present | ✅ |
| Status component set | 5 children = single axis `status` × 5 values | id `3:218`, 5 children, all 5 names present | ✅ |
| Label placeholder leaf | eligibility `placeholder_no_variants`, single FigmaComponentNode | id `3:219`, eligibility correct | ✅ |
| Avatar placeholder leaf | eligibility `placeholder_deferred`, single FigmaComponentNode | id `3:220`, eligibility correct | ✅ |
| Button per-variant geometry | size=small: pad 4/8, minHeight 28, fontSize 14; medium: 8/12/36/16; large: 12/16/48/18 | matched exactly | ✅ |
| Button primary background | #d9292b → rgb(0.851, 0.161, 0.169) | observed (0.8510, 0.1608, 0.1686) | ✅ |
| Button tertiary background | `transparent` → fillsCount 0 (cleared) | fillsCount 0 | ✅ |
| Button primary label color | #fafafa → rgb(0.980, 0.980, 0.980) | observed | ✅ |
| Button tertiary label color | #141414 → rgb(0.078, 0.078, 0.078) | observed | ✅ |
| `componentPropertyDefinitions` (Button) | auto-populated from variant-encoded names | `{size: VARIANT [small,medium,large], variant: VARIANT [primary,...,outline]}` | ✅ |
| `componentPropertyDefinitions` (Chip) | both axes | `{variant: VARIANT [default,selected,dismissible], size: VARIANT [small,medium,large]}` | ✅ |
| `componentPropertyDefinitions` (Status) | single axis | `{status: VARIANT [info,success,warning,danger,error]}` | ✅ |
| `setPluginData` calls | unknown — manifest-ID constraint applies to DevTools | **14/14 failed** with `"Cannot set private plugin data in a plugin without an ID"` | classified |
| Errors (other) | none | `errors: []` | ✅ |

## 3. Live-only incompatibilities surfaced

### 3.1 `combineAsVariants` page-membership (FIXED in this slice)

**Symptom.** First batch attempt failed all three component sets with:

> `in combineAsVariants: Grouped nodes must be in the same page as the parent`

**Cause.** `figma.createComponent()` binds the new component to `figma.currentPage`. When the batch first created a new page (`figma.createPage()` → `page.name = "FSDS_LIVE_BATCH"`) and then immediately called `createComponent()`, the components were bound to the *old* `currentPage` (the user's "Page 1"), not the new one. The subsequent `combineAsVariants(components, page)` rejected the cross-page operation.

**Confirmation.** The synchronous assignment `figma.currentPage = page` is a **no-op** under Figma's dynamic-page documentAccess mode (the prevailing default for the web app); only `await figma.setCurrentPageAsync(page)` actually moves the binding context.

**Fix.** Added `await figma.setCurrentPageAsync(componentsPage)` immediately after `ensurePage(...)` in production `main()` at `packages/ds-figma-plugin/src/plugin.ts`. Second batch run with the fix succeeded across all three component sets (full `expected vs observed` table above).

**Regression guard.** New test in `plugin.test.ts`: asserts `setCurrentPageAsync` is called *before* the first `combineAsVariants`. The test alone doesn't prove the API requirement (that's live evidence); it prevents the production call sequence from regressing.

**Mocked-test gap.** The previous plugin tests mocked `createComponent` as a plain `createNode("component")` factory with no page binding. The mock had no way to model "this component lives on page X". This is a class of bug that mocked Figma tests are structurally bad at catching — the recommendation going forward is to run the live batch as a regression gate on every plugin.ts change, not just on bigger releases.

### 3.2 `setPluginData` manifest-ID constraint (RECONFIRMED, NOT FIXED)

**Symptom.** All 14 `setPluginData` calls in the batch failed identically:

> `in setPluginData: Cannot set private plugin data in a plugin without an ID. Make sure your plugin manifest has a valid "id" field.`

**Cause.** Already documented in `figma_live_determinism_parity_probe.md` §3.3. Private plugin data is plugin-scoped — Figma requires a loaded plugin manifest with an `id` field. DevTools `evaluate_script` runs in the page-script context without a manifest.

**Production impact.** In production (when the plugin is loaded via `manifest.json`), Figma assigns an ID and `setPluginData` works. The probe and this batch confirm the boundary: **mocked tests can't catch a missing manifest.id field**, and DevTools can't verify `setPluginData` round-trips.

**Slice scope.** Out of scope. Migrating from `setPluginData` (plugin-scoped) to `setSharedPluginData(namespace, key, value)` (namespace-scoped) would make metadata work from DevTools and from any plugin reading the same namespace — at the cost of metadata becoming readable by other plugins. That tradeoff is the named successor `FIGMA-METADATA-NAMESPACE-MIGRATION-01`.

## 4. Raw evidence (verbatim from `tmp/figma-live-batch-evidence.json`)

```json
{
  "pageId": "3:148",
  "pageName": "FSDS_LIVE_BATCH",
  "figmaApi": { "editorType": "figma", "apiVersion": "1.0.0" },
  "componentSets": {
    "Stack": { "id": "3:151", "name": "Stack", "childCount": 2,
      "childNames": ["variant=vertical", "variant=horizontal"] },
    "Button": { "id": "3:188", "name": "Button",
      "expectedCellCount": 18, "observedChildCount": 18,
      "componentPropertyDefinitions": {
        "size": { "type": "VARIANT", "defaultValue": "small",
          "variantOptions": ["small", "medium", "large"] },
        "variant": { "type": "VARIANT", "defaultValue": "primary",
          "variantOptions": ["primary", "secondary", "tertiary",
            "ghost", "destructive", "outline"] }
      },
      "samples": {
        "size=small, variant=primary": { "paddingTop": 4, "paddingLeft": 8,
          "minHeight": 28, "cornerRadius": 9999, "fillsCount": 1,
          "firstFillColor": { "r": 0.8510, "g": 0.1608, "b": 0.1686 },
          "labelText": "Button", "labelFontSize": 14,
          "labelFillFirstColor": { "r": 0.9804, "g": 0.9804, "b": 0.9804 } },
        "size=medium, variant=primary": { "paddingTop": 8, "paddingLeft": 12,
          "minHeight": 36, "labelFontSize": 16 },
        "size=large, variant=primary": { "paddingTop": 12, "paddingLeft": 16,
          "minHeight": 48, "labelFontSize": 18 },
        "size=medium, variant=tertiary": { "paddingTop": 8, "paddingLeft": 12,
          "minHeight": 36, "fillsCount": 0, "strokesCount": 0,
          "labelText": "Button",
          "labelFillFirstColor": { "r": 0.0784, "g": 0.0784, "b": 0.0784 } }
      }
    },
    "Chip": { "id": "3:207", "expectedCellCount": 9, "observedChildCount": 9,
      "componentPropertyDefinitions": {
        "variant": { "type": "VARIANT", "variantOptions": ["default", "selected", "dismissible"] },
        "size": { "type": "VARIANT", "variantOptions": ["small", "medium", "large"] }
      } },
    "Status": { "id": "3:218", "expectedCellCount": 5, "observedChildCount": 5,
      "componentPropertyDefinitions": {
        "status": { "type": "VARIANT",
          "variantOptions": ["info", "success", "warning", "danger", "error"] }
      } }
  },
  "placeholders": {
    "Label": { "id": "3:219", "eligibility": "placeholder_no_variants" },
    "Avatar": { "id": "3:220", "eligibility": "placeholder_deferred" }
  },
  "pluginDataSummary": { "total": 14, "ok": 0, "failed": 14 },
  "errors": []
}
```

(Trimmed for brevity; full samples for all variants in the evidence JSON.)

## 5. Cleanup

The probe page `FSDS_LIVE_BATCH` (id `3:148`) was removed via
`page.remove()` after evidence capture. The user's `Page 1` (id `0:1`)
is the only remaining page in the scratch file. The user-promoted
`Frame 1` from the earlier live determinism probe was not present in
this session.

## 6. Acceptance summary

| AC | Result |
|---|---|
| A1. Live Figma run creates Button/Chip/Status sets without relying only on mocked tests | ✅ Component sets created with `figma.combineAsVariants` against real Figma API |
| A2. Live child counts match descriptor-derived cartesian products | ✅ 18/9/5 |
| A3. Live child names preserve deterministic `axis=value` naming | ✅ All cartesian names observed |
| A4. Shallow anatomy: root + label node | ✅ Each variant has 1 TEXT child with `labelText: "<ComponentName>"` |
| A5. Shallow style transfer where claimed | ✅ Paddings/minHeight/cornerRadius/fontSize/fills/strokes all derived correctly; transparent honored as empty fills |
| A6. Metadata behavior classified honestly | ✅ 14/14 `setPluginData` failures recorded with exact error message; not silently bypassed |
| A7. Evidence distinguishes API acceptance from visual fidelity | ✅ This doc + raw JSON record API acceptance facts; design fidelity remains a non-claim |
| A8. No allowlist widening | ✅ Allowlist still `[Button, Chip, Status]` |
| A9. Successor selected based on result | ✅ See §7 |

## 7. Successor selection

The slice directive's rule:

- if live shape fails → fix live incompatibility first
- if metadata fails → `FIGMA-MANIFEST-ID-METADATA-RUNTIME-01`
- if live shape passes but labels are weak → `FIGMA-DESCRIPTOR-LABEL-TEXT-01`
- if live shape passes and metadata is acceptable → `FIGMA-COMPONENT-SET-ALLOWLIST-WIDEN-01`

**Result:** Live shape passed (after the `setCurrentPageAsync` fix landed in this slice). Metadata failed (14/14). Labels are weak (every variant says the literal component name).

**Two paths are now unblocked:**

1. **`FIGMA-METADATA-NAMESPACE-MIGRATION-01`** — Migrate from
   `setPluginData(key, value)` to
   `setSharedPluginData("fsds", key, value)`. The latter is
   namespace-scoped, not plugin-scoped, and works from any context
   (including DevTools). Tradeoff: metadata becomes readable by any
   other plugin reading the same namespace. Probably acceptable for
   our metadata since it's already public-by-design (recipe names,
   variant axes, cssPrefix).

2. **`FIGMA-DESCRIPTOR-LABEL-TEXT-01`** — Replace the literal
   `descriptor.component.name` label with a contract-derived
   designer-facing label string. Touch the contract schema and IR.

3. **`FIGMA-COMPONENT-SET-ALLOWLIST-WIDEN-01`** — Add Badge (48
   cells), Spinner (36 cells), and others to the allowlist. The
   mechanism is now live-proven; widening is incremental.

**Recommended next:** `FIGMA-METADATA-NAMESPACE-MIGRATION-01` — small,
targeted, closes the only remaining failure class from this batch
without requiring a Figma plugin manifest. After that,
`FIGMA-COMPONENT-SET-ALLOWLIST-WIDEN-01` can be live-verified with
the same batch pattern established here.

## 8. Non-claims

- Does NOT prove visual design fidelity. The materializer produces
  recognizable shapes with correct sizes and colors, but Chip and
  Status variants remain visually undifferentiated (their contracts
  carry no per-variant CSS).
- Does NOT prove component library publication. Materializer outputs
  live in a scratch file; nothing is published.
- Does NOT solve the `setPluginData` manifest-ID constraint. 14/14
  metadata writes failed and were classified, not silenced.
- Does NOT extend the materializer to non-allowlisted components.
- Does NOT change any contract, IR, descriptor, or non-Figma emitter.
- Does NOT migrate the plugin to `@figma/plugin-typings`. The dev
  dep was installed (now available in `packages/ds-figma-plugin`),
  but the local `figma.d.ts` minimal declaration is still in use.
  Migration is a separate task (`FIGMA-PLUGIN-TYPINGS-MIGRATION-01`).

## 9. Figma Plugin API findings (from `@figma/plugin-typings@1.127.0`)

A subagent reviewed `@figma/plugin-typings@1.127.0` against the live
behaviors observed in this batch. Confirmations and additional facts
worth recording for future Figma slices:

**Confirmations**

- `figma.createComponent()` is documented to parent under
  `figma.currentPage` by default (plugin-api.d.ts line 1113). The
  fix landed in this slice (`setCurrentPageAsync(componentsPage)`
  before any `createComponent`) is the canonical pattern.
- Direct assignment `figma.currentPage = page` works only when the
  manifest does NOT contain `"documentAccess": "dynamic-page"`. With
  that mode (and in DevTools-from-page-context, which has no
  manifest), `currentPage` becomes read-only and assignment silently
  no-ops. Matches live observation exactly.
- `setPluginData(key, value)` is plugin-scoped (requires manifest
  ID); `setSharedPluginData(namespace, key, value)` is
  namespace-scoped and works from any context (including DevTools).
  Namespace must be at least 3 alphanumeric characters. **This is
  the canonical migration path for the manifest-ID gap.**
- `combineAsVariants(nodes, parent)` requires all nodes on the same
  page as parent. No pre-call validation; the same-page check fires
  at call time.

**Additional behaviors that mocked tests routinely miss**

1. **`layoutMode = "NONE"` silently no-ops auto-layout properties.**
   Setting `paddingTop`, `itemSpacing`, etc. on a frame with no
   layout mode has no effect and throws nothing. Our materializer
   always sets `layoutMode = "HORIZONTAL"` first, so this is
   currently safe — but the failure mode is silent, not a thrown
   error.
2. **Auto-layout toggling is destructive.** `layoutMode = "VERTICAL"`
   then back to `"NONE"` does NOT restore original child positions.
   Relevant if a future materializer conditionally applies layout.
3. **Variant names with spaces work.** The editor parses
   `axis=value, axis=value` as comma-separated; values can contain
   spaces (e.g., `Size=Extra Large`). No validation at
   `combineAsVariants` call time — non-conforming names just render
   oddly in the Figma panel.
4. **`componentPropertyDefinitions` cannot be pre-declared for
   VARIANT axes.** They're auto-populated from
   `combineAsVariants`'s child component names. BOOLEAN, TEXT, and
   INSTANCE_SWAP properties can be added via `addComponentProperty`,
   but VARIANT defaults cannot be set via `editComponentProperty`.
5. **No `description` field on VARIANT/BOOLEAN/TEXT/INSTANCE_SWAP
   properties via the plugin API.** Only SLOT supports it.
6. **`PageNode.loadAsync()` is required in `dynamic-page` mode**
   before accessing `.children` on a non-current page. Our plugin
   manifest doesn't currently declare dynamic-page; if it ever does,
   `loadAsync` becomes mandatory.
7. **100 kB cap per `setPluginData` / `setSharedPluginData` entry.**
   Not currently a constraint.
8. **`figma.createComponent()` and `combineAsVariants` are Figma
   Design only — not FigJam.** Tests stubbing `editorType: "figma"`
   bypass this; real plugin distribution should gate on editorType.

These add 3 future-relevant successor candidates:

- `FIGMA-METADATA-NAMESPACE-MIGRATION-01` — migrate to
  `setSharedPluginData("fsds", ...)` to close the 14/14 metadata
  failure class.
- `FIGMA-PLUGIN-TYPINGS-MIGRATION-01` — replace the local minimal
  `figma.d.ts` with `@figma/plugin-typings`. Dev dep already
  installed in this slice; activation deferred to keep diff bounded.
- `FIGMA-EDITOR-TYPE-GATE-01` — refuse to run in FigJam contexts.

## 10. Files changed in this slice

| Path | Change |
|---|---|
| `packages/ds-figma-plugin/src/plugin.ts` | Added `await figma.setCurrentPageAsync(componentsPage)` before any component creation. Production fix for live-only bug. |
| `packages/ds-figma-plugin/src/figma.d.ts` | Added `setCurrentPageAsync` signature to the minimal local figma typing. |
| `packages/ds-figma-plugin/src/plugin.test.ts` | Added `setCurrentPageAsync` to all test stubs; added regression test asserting call ordering. |
| `packages/ds-figma-plugin/package.json` | Added `@figma/plugin-typings` as dev dep (not yet activated in source). |
| `scripts/devtools/figma-live-materialization-batch.js` | Live batch script template for future runs. |
| `scripts/devtools/bundle-descriptors.mjs` | Helper to extract slim descriptors for embedding. |
| `docs/architecture/design/figma_live_materialization_batch.md` | This doc. |
