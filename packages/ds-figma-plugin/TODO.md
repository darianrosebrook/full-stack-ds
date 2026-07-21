# Figma plugin TODO

This package established its boundary from the `figma` codegen target under `packages/ds-codegen/src/frameworks/figma`, then a plan-driven materializer core (component-set/leaf materialization + `planFigmaStateSurface`), and now a Svelte plugin UI + Dev Mode codegen preview surface.

## Materialization

- Map boolean, enum, and text props to Figma component properties where the plugin API supports them (component-property BOOLEAN/VARIANT lowering exists for planner-driven state dimensions; general prop materialization does not).
- Preserve stable node IDs or plugin data keys so reruns update existing artifacts instead of duplicating them.
- Decide the canonical layout algorithm for anatomy parts: Auto Layout frames, nested section frames, or a mixed model.
- Widen `COMPONENT_SET_ALLOWLIST` (`src/eligibility.ts`) beyond `Button`, `Chip`, `Status` after reviewing variant-matrix size and style readiness for more components.

## UI / documentation

- Persist UI-local description and variant-label drafts (`src/FigmaPluginApp.svelte`) back to the contract source or an explicit Figma metadata namespace — currently discarded on UI close.
- Generate richer documentation frames from descriptor sections: anatomy, behavior, accessibility, and token slots (the UI currently surfaces props/variants/audit/metadata tabs, not a documentation-frame materialization).
- Add token swatches once the token package exposes a Figma-facing projection.
- Add component usage examples from `<Name>.usage.jsonl` once those are projected into the Figma descriptor.

## Codegen / governance

- Dev Mode codegen previews (`src/codegen-preview.ts`) are template-rendered from descriptor + variant values, not routed through the real `@full-stack-ds/codegen` emitters — verify whether that's the intended fidelity or should call the actual emitter pipeline.
- Add a Figma admission plan to the generated artifact rail (this package is intentionally excluded from the rail; see repo docs on rail-excluded targets).
- Add fixture tests for representative descriptors: primitive, compound, surface, form control, and table-like native composition.
- Decide whether generated descriptor JSON belongs in source control or should remain a generated local artifact.
- Add an explicit descriptor schema for `*.figma.json`.

## Figma API details

- Verify current desktop-app support for component property APIs before claiming complete prop materialization.
- Verify variant-set mutation behavior for regenerated component sets.
- Confirm plugin relaunch behavior for long-running generation, and for the UI-open/stay-open lifecycle introduced by `openUi()`.
