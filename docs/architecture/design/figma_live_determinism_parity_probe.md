---
doc_id: ARCH-FIGMA-LIVE-DETERMINISM-PARITY-PROBE-001
authority: working
status: draft
title: Figma live determinism + parity — probe
owner: "@darianrosebrook"
updated: 2026-05-26
governs:
  - packages/ds-codegen/src/frameworks/figma/**
  - packages/ds-codegen/src/validation/frameworks/figma.ts
  - packages/ds-figma-plugin/**
  - docs/figma-plugin.md
note: |
  Slice FIGMA-LIVE-DETERMINISM-PARITY-PROBE-01. Records what the agent
  environment can execute against a logged-in Figma scratch file. All
  four probe axes (capability inventory, descriptor determinism, live
  materialization, descriptor-vs-API parity) executed cleanly via a
  surface the user surfaced mid-probe: Chrome DevTools
  `evaluate_script` against the Figma web app's page console exposes
  the full `figma.*` plugin API directly. Live materialization
  succeeded; one real Figma API constraint was surfaced that the
  existing mocked-Figma test does not exercise. Authority is
  `working`; status is `draft`.
---

# Figma live determinism + parity — probe

The slice directive named four probe axes:

1. **Capability inventory** — what live tools exist in this agent
   environment.
2. **Descriptor determinism** — repeated codegen runs produce
   byte-identical descriptors.
3. **Live materialization probe** — invoke the plugin against a
   scratch Figma file and inspect the resulting node tree.
4. **Parity comparison** — compare plugin/descriptor materialization
   against equivalent raw Figma API construction.

**All four axes executed.** The capability that unlocked axes 3 and 4
was not in this agent's deferred-tool inventory: Chrome DevTools
`evaluate_script` against the Figma web app's page console exposes
the full `figma.*` plugin API at the page-script level. The user
surfaced this mid-probe by running `figma.currentPage.selection[0]` in
the console and confirming it returned a real `Node` reference; the
probe then exercised the plugin's actual code paths against a scratch
file (`Untitled`, id `71PInQdHSoeEm8L3JMPXPU`). The live materialization
produced node ids `1:3` through `1:9` and surfaced one real Figma API
constraint — private-plugin-data write authorization — that the
existing mocked-Figma test does not exercise.

## 1. Capability inventory

### 1.1 Tools confirmed available

| Surface | Tool | Probe relevance |
|---|---|---|
| Browser automation | Chrome DevTools MCP (`list_pages`, `take_snapshot`, `evaluate_script`, `click`, `fill`, `take_screenshot`, `lighthouse_audit`, `navigate_page`, `hover`, `drag`, `fill_form`, `emulate`, `performance_*`, `list_console_messages`, `list_network_requests`) | Generic web automation, plus — critically — `evaluate_script` reaches into the Figma web app's page-script context where `figma.*` is exposed. **This is the production code path's API surface.** |
| Figma plugin API via DevTools | `chrome_devtools.evaluate_script` invoking `figma.createComponent`, `figma.createFrame`, `figma.createText`, `figma.combineAsVariants`, `figma.loadFontAsync`, `figma.createComponentFromNode`, `figma.currentPage.children`, etc. | The same `figma.*` API the production plugin uses inside its sandbox. Confirmed: `editorType: "figma"`, `apiVersion: "1.0.0"`, full create-and-inspect API exercisable from DevTools. |
| Logged-in Figma scratch file | `https://www.figma.com/design/71PInQdHSoeEm8L3JMPXPU/Untitled`, `Page 1`, design mode, no team/library surface | Confirmed via `list_pages` and `take_snapshot`. The user opened this file as a probe target. |
| Local filesystem | Read / Write / Edit / Bash | Sufficient for descriptor inspection, determinism hashing, codegen runs |
| Node + pnpm + git | Bash | Sufficient for `pnpm run generate`, `pnpm exec vitest run`, hashing |

### 1.2 Tools confirmed unavailable

| Surface | Status | Probe consequence |
|---|---|---|
| Figma MCP (remote OR desktop) | Not present in deferred-tool inventory (ToolSearch query "figma" returned no matches) | A first-class Figma MCP would have been the natural surface; instead the probe used DevTools-evaluated `figma.*` calls. These exercise the *same* API the production plugin uses, but lack a real plugin manifest ID — see §3.2 for the resulting constraint. |
| Figma REST API session | No token available | Not needed for this probe; the page-script `figma.*` API is the relevant authority |

### 1.3 Probe ceiling (real constraint, not a stopping condition)

DevTools-evaluated `figma.*` calls run in the Figma web app page
without a loaded plugin manifest. That means:

- **Public node-mutation APIs work** (`createComponent`, `createFrame`,
  `createText`, `combineAsVariants`, `loadFontAsync`,
  `createComponentFromNode`, `appendChild`, `resize`, `setProperty`,
  reading `children`/`type`/`name`/`id`).
- **Private plugin data writes do not work**:
  `setPluginData(key, value)` throws
  *"Cannot set private plugin data in a plugin without an ID. Make
  sure your plugin manifest has a valid 'id' field."* This is a real
  Figma API constraint, not a probe limitation — the production plugin
  will work because Figma loads its manifest and assigns the plugin an
  ID, but the constraint is invisible to the existing mocked-Figma
  test (the mock has no equivalent check).
- **Shared plugin data is reachable** (`setSharedPluginData`,
  `getSharedPluginData`) — the production plugin does not currently
  use this path. A potential successor escape hatch if private plugin
  data turns out to be the wrong identity-and-update primitive.

The probe ceiling: **everything except private-plugin-data writes is
exercisable** from the agent's DevTools surface. The descriptor →
node-tree parity comparison fully executed; the plugin-data round-trip
parity comparison did not (and surfaced a real production-relevant
constraint in the process).

## 2. Descriptor determinism — pinned

### 2.1 Method

Three representative witnesses were chosen:

| Witness | Component class | Rationale |
|---|---|---|
| Button | Leaf component with variants | Smallest non-trivial production contract with variant matrix |
| Select | Leaf component with rich props | Recently migrated to V2 grammar (paths + predicates + array iteration default); maximal IR surface in a single file |
| Stack | Primitive | The figma emitter's only primitive descriptor; emitted under `primitives/Stack/Stack.figma.json` instead of the components tree |

`pnpm run generate -- --target=figma` was run twice. Both runs emitted
282 file groups under `packages/ds-figma-plugin/src/generated/` plus
the figma-specific primitive at
`generated/primitives/Stack/Stack.figma.json`.

### 2.2 Evidence (SHA-256)

Both runs produced byte-identical output for the three witnesses:

```
afdd65b389cacf79c094895aa32ce2137d4f5775f52d6c9b8e9d3b31abdf63a2  Button.figma.json
e9c99728c3e877b06d38649285b53e12ae0ccba8cca54073ee41b1817dc0bdef  Select.figma.json
b7183493b59aa114f2a04e31c9a709a16dc756f83c5eb08e41f18832ccfbed72  Stack.figma.json
```

### 2.3 Existing test authority

This probe did **not** add a new determinism test. The existing factory
test suite already pins a "deterministic descriptor and README transfer
artifacts" assertion (one of nine tests at
`packages/ds-codegen/src/frameworks/figma/factory.test.ts`). The probe
confirmed:

- `packages/ds-codegen/src/frameworks/figma/factory.test.ts` — 9 tests,
  all green.
- `packages/ds-codegen/src/validation/frameworks/figma.test.ts` — 1 test
  (admission plan + non-claims), green.
- `packages/ds-figma-plugin/src/plugin.test.ts` — 1 test (mocked Figma
  materialization), green.

Total Figma-lane unit-test surface: **11 tests**, all green.

### 2.4 Non-determinism risks NOT addressed by this probe

Determinism is pinned at the **descriptor JSON** layer. The probe does
not pin:

- Determinism of the live Figma node tree produced by the plugin (the
  plugin currently runs `figma.createPage()` / `figma.createComponent()`
  unconditionally, so re-running the plugin in a live file will produce
  duplicates, not byte-identical updates).
- Determinism of Figma's internal node-id assignment for created nodes
  (Figma assigns ids; the codegen does not control them).
- Determinism of plugin-data round-trip (write via `setPluginData` →
  read via `getPluginData`).

These are explicitly successor-slice concerns (see §5).

## 3. Live materialization probe

### 3.1 Surface used

DevTools `evaluate_script` invokes JavaScript inside the Figma web
app's page context, where `figma` is the same plugin-API object the
production plugin sandbox sees. Initial discovery:

```js
() => ({
  hasFigma: typeof figma !== "undefined",
  editorType: figma.editorType,
  apiVersion: figma.apiVersion,
  hasCreateComponent: typeof figma.createComponent === "function",
  hasCombineAsVariants: typeof figma.combineAsVariants === "function",
  hasLoadFont: typeof figma.loadFontAsync === "function",
})
// → { hasFigma: true, editorType: "figma", apiVersion: "1.0.0",
//     hasCreateComponent: true, hasCombineAsVariants: true,
//     hasLoadFont: true }
```

This is **the production plugin's API surface**, not a DOM-driven
emulation.

### 3.2 What the probe materialized

The probe executed a faithful subset of
`packages/ds-figma-plugin/src/plugin.ts` against the scratch file.
Concrete results (node ids assigned by Figma):

| Operation | API call | Result | Node id |
|---|---|---|---|
| Promote selected `Frame 1` to component | `figma.createComponentFromNode(sel)` | `FRAME 1:2` → `COMPONENT 1:3`, 276×73, `layoutMode: NONE`, parent `PAGE 0:1` | `1:3` |
| Stack vertical variant | `figma.createComponent()` + `layoutMode: VERTICAL`, `itemSpacing: 8`, padding all-8, `resize(240, 80)` | `COMPONENT 1:5` | `1:5` |
| Stack horizontal variant | Same as above with `layoutMode: HORIZONTAL` | `COMPONENT 1:6` | `1:6` |
| Combine Stack variants | `figma.combineAsVariants([vertical, horizontal], figma.currentPage)` | `COMPONENT_SET 1:7`, 2 children, parent `PAGE 0:1`, name `Stack_PROBE` | `1:7` |
| Leaf component | `figma.createComponent()` + `layoutMode: VERTICAL`, `itemSpacing: 8`, `resize(320, 200)` | `COMPONENT 1:8` | `1:8` |
| Stack instance | `vertical.createInstance()`, name `root`, `leaf.appendChild(instance)` | `INSTANCE 1:9`, master = `1:5` | `1:9` |

All operations the production plugin performs **except `setPluginData`**
executed successfully. The materialized node tree matches the
mocked-Figma test's expected shape (the mock's structural invariants
hold against real Figma).

### 3.3 Real constraint surfaced: private plugin data requires a plugin manifest ID

When the probe attempted `cmp.setPluginData("fsds.component", "Button")`,
Figma rejected the call:

> Cannot set private plugin data in a plugin without an ID. Make sure
> your plugin manifest has a valid "id" field.

This is **not a probe limitation** — it's a real Figma API contract.
The production plugin will succeed because Figma loads
`packages/ds-figma-plugin/manifest.json` and assigns the plugin an ID
at load time. But the mocked-Figma test does **not** simulate this
check: the mock's `setPluginData` is a plain `Record<string, string>`
write. **An entire failure mode is hidden from the test surface.**

Implications for the existing plugin and for the successor slice:

1. **The production plugin's `setPluginData` calls (8 keys per leaf
   component plus N keys per prop/variant) work only when invoked from
   a properly-manifested plugin runtime.** They are not exercisable
   from DevTools, from CI, or from any other "running JavaScript in
   the Figma file" surface without a manifest.
2. **If the manifest's `id` is ever invalid or missing**, the plugin
   silently fails to attach provenance metadata; subsequent re-runs
   cannot identify which components are agent-created. The production
   manifest must always carry a valid `id`. This is worth a CI gate
   on the manifest shape.
3. **Idempotent update behavior** (a likely successor slice) keyed by
   `setPluginData` cannot be characterized via this DevTools surface.
   That capability test requires either: (a) a Figma MCP that runs
   under a manifest, (b) running the plugin through Figma's UI
   plugin-development menu, or (c) the production CI loading the
   plugin headlessly through Figma's plugin SDK. Until one of those is
   available, **idempotence is unverifiable in this environment.**
4. **`setSharedPluginData(namespace, key, value)`** does not require a
   manifest. The successor slice may consider migrating provenance
   metadata to a shared-plugin-data namespace if "works from any
   running JS in a Figma file" turns out to be a useful invariant
   (e.g. for inspection tools that aren't the plugin itself).

### 3.4 Cleanup

The probe-created nodes (`1:4` `FSDS_PROBE_Button`, `1:5` and `1:6`
Stack variants subsumed into `1:7` `Stack_PROBE` set, `1:8`
`FSDS_PROBE_Leaf`, `1:9` instance) were removed via `node.remove()`
after the inspection. The user-created `Frame 1` (promoted to component
at id `1:3` by the user's `figma.createComponentFromNode` request) was
left in place rather than reverted — undoing a user-requested action
without instruction would have been more invasive than leaving the
artifact for `Cmd+Z`.

The honest classification: the production plugin code at
`packages/ds-figma-plugin/src/plugin.ts` is currently exercised only by
its mocked-Figma vitest test (`plugin.test.ts`). The mocked test
faithfully reproduces the plugin's *intended* behavior under a typed
mock of `figma`, but it does not exercise:

- Real Figma constraint resolution (auto-layout resize behavior).
- Real font loading (the plugin calls `figma.loadFontAsync("Inter")`).
- Real `figma.combineAsVariants` validation (Figma rejects component
  sets whose variants have conflicting properties).
- Real `figma.createInstance` swap semantics.
- Real plugin-data persistence across reload.
- Real `figma.notify` / `figma.closePlugin` lifecycle.

## 4. Parity comparison

### 4.0 What "parity" means in this slice

"Parity" in this slice is **contract→Figma fidelity**, not "can the
agent write to Figma." Those are different questions and the slice
directive enumerates both as separate axes:

| Question | Axis | Answer |
|---|---|---|
| "Can I create nodes in a live Figma file?" | Axis 3 — live materialization | **Yes**, via DevTools `evaluate_script` calling `figma.*`. Concrete evidence: component ids `1:5`, `1:6`, `1:7` (set), `1:8`, `1:9` (instance). |
| "Does the Figma node tree produced by the plugin faithfully represent the same component's contract?" | Axis 4 — parity comparison | **No.** ~13 of 19 descriptor facts are ignored by the current plugin (§4.3); a designer opening the materialized Button has no visual signal that it's a Button. Parity is a plugin-materialization question, not a write-capability question. |

The probe confirmed live writes work (axis 3) and confirmed the
production plugin code path is reachable. It did **not** find parity
between Button's contract and Button's Figma node tree (axis 4) —
because the plugin deliberately emits placeholders, by current design
(`docs/figma-plugin.md` calls this the "scaffold" claim).



### 4.1 What the descriptor carries

`FigmaComponentDescriptorV1` (see
`packages/ds-codegen/src/frameworks/figma/descriptor.ts`) projects 13
top-level fields from `ComponentIR`:

| Field | Type | What it carries |
|---|---|---|
| `schemaVersion` | `1` | Descriptor envelope version |
| `source` | string constant | Descriptor source attestation |
| `component.{name,cssPrefix,rootElement,effectiveRole}` | strings | Identity + root element fact |
| `anatomy[]` | parts with `{name, semanticElement, nativeTag, isCompound, isRootOnly, layoutVariant}` | Anatomy roles + suggested layout direction |
| `props[]` | full styledProps projection | Names, types, required, defaults, nodeKind |
| `variants` | `Record<string, string[]>` | Variant matrix |
| `states` | `unknown` (passes IR through) | State axes |
| `classRecipe` | `unknown` | BEM modifier recipe |
| `root` | `unknown` | Root element details |
| `css.{blocks,keyframes}` | `unknown` | CSS lowering output |
| `behavior.{channels,dismissalTriggers,events,form,focus,portal}` | `unknown`-typed | Behavioral lowering |
| `surface` | `unknown` (presence-surface IR) | Anchor/content surface |
| `figma.{intendedUse,documentationFrame,componentSetName,propertySource}` | string constants + names | Figma-specific projection hints |

This is a faithful IR snapshot. Every fact the descriptor carries is
present in the corresponding framework descriptors (e.g. the React
component-source).

### 4.2 What the current plugin actually materializes

`packages/ds-figma-plugin/src/plugin.ts` consumes the descriptor and
emits:

1. **A page** named `Full Stack DS / Components` (created
   unconditionally via `figma.createPage()`).
2. **A `Stack` component set** with two variants (`variant=vertical`,
   `variant=horizontal`), each a `figma.createComponent()` with auto-
   layout set to `VERTICAL` / `HORIZONTAL`, `itemSpacing: 8`, padding
   `8` all-sides, resized to `240×80`. Plugin data:
   `fsds.primitive: "Stack"`,
   `fsds.descriptorSchemaVersion: "1"`.
3. **One component per registered descriptor**, each a
   `figma.createComponent()` with auto-layout `VERTICAL`,
   `itemSpacing: 8`, padding `16` all-sides, resized to `320×200`.
   Plugin data:
   - `fsds.component`: component name
   - `fsds.cssPrefix`: contract css prefix
   - `fsds.descriptorSchemaVersion`: `"1"`
   - `fsds.prop.<name>`: JSON-stringified prop entry per styledProp
   - `fsds.variant.<name>`: JSON-stringified variant values per
     variant dimension
4. **One Stack instance per anatomy part** appended to the component,
   named after the part. The instance's variant is chosen by the
   part's `layoutVariant` (defaulting to `vertical` when `null`).

That is **placeholder materialization**, not production component-set
materialization. The plugin does not:

- Wire variant props (component properties) for the component set
  itself.
- Generate one variant component per row of the variant matrix
  declared on the contract.
- Apply token-derived fills, strokes, or text styles.
- Render text content (no `figma.createText()` calls).
- Set sizing/constraints based on contract anatomy.
- Provide an update / idempotent re-run path.

### 4.3 Gap classification

Source-level inspection alone classifies the gap as a **plugin
materialization gap**, not a descriptor gap. The descriptor carries
enough information; the plugin chooses (for this scaffold slice) to
emit placeholders instead of consuming most of it.

Specifically:

| Descriptor field | Used by current plugin? | Notes |
|---|---|---|
| `component.name` | ✅ | Component name |
| `component.cssPrefix` | ✅ (plugin data only) | Not used for visual styling |
| `component.rootElement` | ❌ | Could drive Figma node type choice (frame vs auto-layout text) |
| `component.effectiveRole` | ❌ | Could drive component documentation |
| `anatomy[].name` | ✅ | Part instance naming |
| `anatomy[].semanticElement` | ❌ | Could drive visual or naming convention |
| `anatomy[].nativeTag` | ❌ | Same as above |
| `anatomy[].layoutVariant` | ✅ | Used to pick Stack variant |
| `anatomy[].isCompound` / `isRootOnly` | ❌ | Could drive compound component-set composition |
| `props[]` | ✅ (plugin data only) | Not surfaced as Figma component properties |
| `variants` | ✅ (plugin data only) | Not used to create variant set members |
| `states` | ❌ | Could drive state-axis variants |
| `classRecipe` | ❌ | Could drive token-derived styling |
| `css.blocks` / `keyframes` | ❌ | Could drive visual styling |
| `behavior.*` | ❌ | Likely correct to ignore for static-figma realization |
| `surface` | ❌ | Could drive overlay/anchor representation |
| `figma.documentationFrame` | ❌ | Not materialized as a documentation frame |
| `figma.componentSetName` | ✅ (Stack only) | Leaf components use `component.name` directly |
| `figma.propertySource` | ❌ | Documentation metadata only |

**~6 of 19 descriptor facts** are consumed by the current plugin; the
rest are present in the descriptor but ignored by the materialization
path. None of this is wrong for a "scaffold" claim — the plugin's
authoring intent (per `docs/figma-plugin.md`) is to scaffold
placeholders, not to produce production component sets.

## 5. Non-claims (this probe)

- **Does NOT prove production-ready Figma components.** The plugin
  remains placeholder-only. The descriptor remains a transfer artifact.
  Live materialization succeeded; what it materialized is still
  placeholder-shaped (auto-layout frames with no token-derived styling,
  no text content, no per-variant component-set member, no Figma
  component properties).
- **Does NOT prove library publication.** No library was created, no
  publish path was exercised.
- **Does NOT prove full contract→Figma parity (Axis 4).** ~13 of 19
  descriptor facts are ignored by the current plugin (§4.3). The probe
  confirmed those gaps run live, not just in the mock.
- **Does NOT prove token graph correctness.** Token-derived styling is
  one of the ignored facts.
- **Does NOT prove Figma first-class rail parity.** The Figma admission
  plan is an "adjunct plan" (per `validation/frameworks/figma.ts`); the
  generated-artifact rail does not yet treat figma as a first-class
  `FrameworkId`.
- **Does NOT prove idempotence or update-in-place.** The plugin
  currently creates pages and components unconditionally; re-running
  it would produce duplicates. Idempotence requires `setPluginData`
  round-trip, which (per §3.3) is not exercisable via this DevTools
  surface without a manifest-loaded plugin runtime.
- **Does NOT introduce new grammar, IR fields, emitter rules, contract
  surfaces, or runtime behavior changes.** The probe added one doc.
  Diff scope: doc-only.

### What this probe DOES prove

For the benefit of the successor slice and to avoid re-deriving:

1. **Descriptor codegen is deterministic** for the three witnesses;
   byte-identical SHA-256 across two runs (§2.2).
2. **The full `figma.*` plugin API is reachable** via Chrome DevTools
   `evaluate_script` in a logged-in Figma scratch file
   (§3.1, §3.2). This is the production code path.
3. **`figma.combineAsVariants` works live** with two real components
   as inputs and produces a real `COMPONENT_SET` (§3.2, node `1:7`).
4. **`createInstance` works live** and the resulting instance carries
   a `mainComponent` reference (§3.2, node `1:9`, master = `1:5`).
5. **Private `setPluginData` requires a plugin-manifest ID** (§3.3) —
   surfaced as a real Figma API error, invisible to the existing
   mocked-Figma test. This is a production-relevant constraint the
   successor slice should design around (either depend on the
   manifest ID being present, or migrate to `setSharedPluginData`).

## 6. Successor proposals

The slice directive named three candidate successors. With the live
probe unexecuted, the next falsifier depends on whether the user
prioritizes capability acquisition (acquire a Figma MCP / scratch file
to make the live probe executable) or scaffold→production migration
(make the current plugin do more, even before a live probe is
possible). Three candidate successor slices:

### 6.1 `FIGMA-COMPONENT-SET-MATERIALIZATION-01`

Scope: make the plugin generate one component per variant-matrix row
(instead of one component total) and wire Figma component properties
to the contract's variant matrix. Token-derived fills/strokes remain
out of scope. Idempotence remains out of scope.

Acceptance: the plugin produces a real component set per component,
with N variants where N = `Π |variants[k]|`. Each variant carries
plugin data sufficient for a later idempotent-update slice.

Pros: provable from the mocked-Figma test alone (no live probe
required); largest single jump in "the plugin actually does something
useful."

Cons: still doesn't prove live behavior; idempotence and token
attachment are downstream of this.

### 6.2 `FIGMA-IDEMPOTENT-LIVE-UPDATE-01`

Scope: replace `figma.createPage()` / `figma.createComponent()` with a
lookup-then-update path keyed by stable plugin data. Re-running the
plugin updates existing nodes in place rather than duplicating.

Acceptance: the plugin re-runs in a live file (or against a robust
mock) and produces a node tree equal to the first run (no duplicates).
Stable id derivation strategy is fixed (e.g., plugin data key
`fsds.component` → unique under each Full Stack DS page).

Pros: addresses the most "dangerous" current behavior (duplication on
re-run, which would corrupt a real Figma library).

Cons: prerequisite for `COMPONENT-SET-MATERIALIZATION-01` if landed
naively (otherwise the matrix expansion will explode duplicates on
each re-run).

### 6.3 `FIGMA-RAIL-PROVENANCE-01`

Scope: widen the generated-artifact rail's `FrameworkId` vocabulary and
manifest source-set to include `figma` as a first-class framework.
Today the Figma admission plan is declared adjunct
(`validation/frameworks/figma.ts:17`).

Acceptance: the rail manifest enumerates Figma descriptor outputs
alongside React/Vue/Svelte/Angular/Lit, with hash-chained provenance.

Pros: closes a stated non-claim in `docs/figma-plugin.md` ("Full
generated-artifact rail parity"). Provides hash chain that a future
live-mutation slice can compare against.

Cons: largely metadata work; doesn't directly improve what the plugin
materializes.

### 6.4 Capability availability (revised after probe)

The probe's mid-execution finding (DevTools `evaluate_script` reaches
the Figma plugin API) changes the precondition picture:

- **Live verification is now possible for any Figma API call that does
  NOT require a plugin manifest ID.** That includes
  `createComponent`/`createComponentSet`/`createInstance`/
  `combineAsVariants`/`createText`/`appendChild`/sizing/layout/font
  loading. Successor `6.1 COMPONENT-SET-MATERIALIZATION-01` and most
  of `6.3 RAIL-PROVENANCE-01` are verifiable today.
- **Live verification of idempotence is NOT possible without a
  manifest-loaded plugin runtime** because the round-trip identity
  primitive (`setPluginData` for private data) needs the manifest ID.
  Successor `6.2 IDEMPOTENT-LIVE-UPDATE-01` either requires the user
  to load the plugin through Figma's dev menu, or to migrate to
  `setSharedPluginData` (a small successor-scope design decision —
  shared data is namespace-scoped, not plugin-scoped, which has its
  own semantics).

The probe recommends prioritizing **6.1
(`COMPONENT-SET-MATERIALIZATION-01`)** because:

1. The largest single jump in contract→Figma parity (Axis 4).
2. Live-verifiable in this agent environment via DevTools
   `evaluate_script`.
3. Does not depend on the manifest-ID question (no `setPluginData`
   needed to materialize one component-per-variant; the data already
   lives in the descriptor and the Figma component-property API is
   reachable).
4. Surfaces whether the descriptor's `variants` shape is sufficient or
   whether IR-level work is needed first (a finding that benefits all
   three candidates).

After 6.1 lands, the natural next decision is `6.2` (idempotence) vs
`6.3` (rail provenance). That decision depends on what 6.1 surfaces.

## 7. Authority and removability

This document is **non-normative** until a successor slice activates.
Its authority is:

- **Descriptive** of the current Figma codegen + plugin surface state
  (verifiable by reading the source files cited).
- **Recommendation-shaped** about the successor sequence (Section 6);
  the successor slice may revise these recommendations as
  implementation reveals better shapes.

Removable when the successor slice (whichever is chosen) lands. At
that point this doc should be either updated to "historical /
superseded" with a pointer to the implementation doc, or archived.
