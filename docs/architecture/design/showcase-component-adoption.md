# Showcase component adoption

`SHOWCASE-COMPONENT-ADOPTION-02` inventories and replaces showcase-owned UI that
already has a suitable generated component. This is a source-site census for
this slice, not a count of runtime instances or distinct component types.

## Inventory and replacements

The starting guard recorded 24 raw control sites. Inspecting CodeViewer added
its untracked `pre`, bringing the comparable baseline to 25. After adoption,
8 remain. The TypeScript AST guard ignores documentation snippets and asserts
the exact remaining sites, including inverse checks when an allowance becomes
obsolete. The separate panel/pill census started at 14 and ends at zero.

| Source | Before | After | Realization |
|---|---:|---:|---|
| JsonTreeViewer raw disclosure elements | 4 | 0 | Controlled Details; selected trace paths open ancestors, including arrays |
| PropertySection raw toggle | 1 | 0 | Accordion composition; hidden controls leave keyboard navigation |
| TokenPicker controls | 3 | 0 | Input and Button; existing typed filtering and binding callbacks |
| TokenValueControl controls | 6 | 1 | Button and Input; native color well retained |
| PropertiesPanel controls | 7 | 3 | Button and Input; native select, number and color retained |
| Header brand input | 1 | 1 | Native radio retained |
| TokensView brand button | 1 | 1 | Existing single-choice control retained |
| CodeViewer source and trace controls | 2 | 2 | Specialized annotated source retained |
| App panel class sites | 13 | 0 | Twelve Card compositions; the existing Popover.Content no longer borrows panel CSS |
| App pill class site | 1 | 0 | Badge |

Panel and pill CSS is retired. Scoped appearance choices use generated design
and box-model properties. App layout, data processing, trace navigation and
native HTML structure are not automatically component duplication.

CodeViewer still owns annotated source rendering. Its CSS now uses
`source-viewer__code`, removing the bare `.code-block` rules that also styled
generated CodeBlock examples. This is collision removal, not a claim that the
annotated viewer has been replaced. Both raw source elements remain explicit
in the guard; no compatibility selector is kept.

## Findings and remaining capabilities

| Severity | Source | Expected | Observed / next repair |
|---|---|---|---|
| Warning | CodeBlock contract; CodeViewer | Shared source rendering with numbered lines and annotated ranges | CodeBlock supplies literal source and syntax tokens, but no line/range rendering contract. Add that capability upstream, keeping trace navigation in the showcase. |
| Warning | Select contract/generated selected-value part | Selected option label visible in the closed control | `.select__text` is empty in the generated React output. The attempted inspector replacement was rejected; selected-label resolution needs a contract/IR realization. |
| Warning | Input contract | Type-appropriate native accessibility semantics | The contract supplies `role=textbox` for every type. Native number/color controls remain until type-dependent roles are modeled or implicit roles preserved upstream. |
| Warning | Header and TokensView brand controls | Shared single-choice selection and keyboard behavior | No generated RadioGroup family is available. Existing brand controls remain; wrapping them in Button would not supply that contract. |
| Resolved | PropertySection | Closed regions hide interactive descendants | The old CSS animation left controls discoverable. Accordion supplies the hidden region behavior; the editor test now opens the section before editing. |
| Resolved | Showcase Card / usage preview | App appearance does not change the subject being demonstrated | Inheritable Card overrides leaked into nested Card examples. The usage-preview boundary resets this app-owned appearance scope while allowing inline inspector overrides to win. |

The existing generated primitives cover a substantial portion of the remaining
showcase UI. Annotated code, selected-option text, type-dependent input
semantics and single-choice groups are concrete upstream work; their absence
is not evidence that every custom showcase composition needs a new primitive.

## Evidence boundary

- `src/consumption/dogfooding-guard.test.ts`: exact AST inventory and retired
  class checks; no raw-site allowance can grow or remain stale silently.
- `src/consumption/consumption-guard.test.ts`: source-viewer CSS cannot reclaim
  the generated CodeBlock selector.
- `src/components/showcase-compositions.test.tsx`: independent section actions,
  hidden controls, array trace revelation, manual collapse, literal stepping,
  invalid stepping, token filtering and binding through real components.
- `e2e/showcase-adoption.spec.ts`: desktop/narrow migrated surfaces, Card preview
  isolation, keyboard disclosure, and generated JSON Details.
- `e2e/editor-binding-rail.spec.ts`: edit/clear still changes actual preview CSS.
- `e2e/showcase-usability.spec.ts`: prior palette, shell, Card and overlay behavior.

These browser cases use Chromium. They do not establish all-browser visual
parity, complete accessibility conformance or replacement of the remaining
native/specialized controls. Screenshots and local gate logs remain ignored
runtime evidence rather than committed artifacts.
