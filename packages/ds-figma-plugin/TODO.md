# Figma plugin TODO

This package is intentionally a scaffold. The first slice establishes the package boundary and the `figma` codegen target from `packages/ds-codegen/src/frameworks/figma`.

## Materialization

- Replace placeholder component frames with true Figma component nodes via `figma.createComponent`.
- Map contract variants to Figma component sets and variant properties.
- Map boolean, enum, and text props to Figma component properties where the plugin API supports them.
- Preserve stable node IDs or plugin data keys so reruns can update existing artifacts instead of duplicating them.
- Decide the canonical layout algorithm for anatomy parts: Auto Layout frames, nested section frames, or a mixed model.

## Documentation

- Generate richer documentation frames from descriptor sections: anatomy, props, variants, states, behavior, accessibility, and token slots.
- Add token swatches once the token package exposes a Figma-facing projection.
- Add component usage examples from `<Name>.usage.jsonl` once those are projected into the Figma descriptor.

## Codegen / governance

- Add a Figma admission plan to the generated artifact rail once the package has a stable build command.
- Add fixture tests for representative descriptors: primitive, compound, surface, form control, and table-like native composition.
- Decide whether generated descriptor JSON belongs in source control or should remain a generated local artifact.
- Add an explicit descriptor schema for `*.figma.json`.

## Figma API details

- Verify current desktop-app support for component property APIs before claiming complete prop materialization.
- Verify variant-set mutation behavior for regenerated component sets.
- Confirm plugin relaunch behavior for long-running generation.
