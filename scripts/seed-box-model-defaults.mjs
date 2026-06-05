#!/usr/bin/env node
/**
 * RETIRED — MORPHOLOGY-GEOMETRY-PROFILE-01.
 *
 * This was a one-time migration that read each contract's `category` field and
 * froze category-keyed `box-model.*` defaults into `<Name>.tokens.json`. That
 * seed pass is the ROOT CAUSE of the geometry defect it was meant to bootstrap:
 *
 *   - `glyph`   -> box-model.width/height = 16px  (clamped text components like
 *                 Badge / ProfileFlag into a clipped 16px square)
 *   - `feedback`-> box-model.padding-* = 16px      (collapsed meters/placeholders
 *                 like Progress / Skeleton into a padded square)
 *
 * Those values were frozen into committed sidecars, where codegen faithfully
 * rendered them — so the bug looked like an emitter bug but was contract data.
 *
 * Box-model geometry defaults are now driven by the `morphology` axis: a
 * contract declares an optional `morphology`
 * (packages/ds-contracts/component.contract.schema.json), which selects a
 * StyleProfile (packages/ds-codegen/src/box-model.ts#STYLE_PROFILES) layered
 * BETWEEN the primitive defaults and the component sidecar. The profile is the
 * durable, regenerate-time source of geometry defaults — nothing is frozen into
 * sidecars, and the sidecar still wins when an author genuinely overrides a slot.
 *
 * Re-running the old seed would re-introduce the exact category-keyed residue
 * the migration stripped, so this script is FAIL-CLOSED: it writes nothing and
 * exits non-zero. To change a component's default geometry, set its `morphology`
 * (or add / adjust a StyleProfile) — never seed sidecars by category again.
 */

console.error(
  [
    "seed-box-model-defaults.mjs is RETIRED (MORPHOLOGY-GEOMETRY-PROFILE-01).",
    "",
    "It wrote category-keyed box-model.* defaults into <Name>.tokens.json, which",
    "is the root cause of the glyph/feedback geometry defect. Box-model geometry",
    "defaults are now driven by the contract `morphology` axis + StyleProfiles in",
    "packages/ds-codegen/src/box-model.ts. Re-running this would re-introduce the",
    "bug, so it writes nothing and exits non-zero.",
    "",
    "To change a component's default geometry: set `morphology` on its contract,",
    "or add/adjust a StyleProfile. Do not seed sidecars by category.",
  ].join("\n"),
);
process.exit(1);
