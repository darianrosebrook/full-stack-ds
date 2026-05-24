# Local Figma MCP Skill Surface

Use this surface for desktop-app inspection and mutation of the currently open Figma file.

## Purpose

The local Figma MCP is the preferred mutation surface for setting up the library because it operates against the user's open desktop file and can be verified immediately after changes.

## Required preflight

Before mutation:

1. Confirm a local Figma file is open.
2. Inspect pages and top-level nodes.
3. Search for existing Full Stack DS provenance keys:
   - `fsds.component`
   - `fsds.cssPrefix`
   - `fsds.descriptorSchemaVersion`
   - `fsds.contractPath`
   - `fsds.generatedAt`
4. Compare against remote file identity if remote MCP is available.
5. Count generated descriptors from the repo.

## Mutation policy

Allowed by default after user asks to set up the library:

- Create pages for documentation and components.
- Create frames for component documentation.
- Create placeholder component frames or component nodes from descriptors.
- Attach plugin data for provenance.
- Update generated nodes when stable plugin data indicates they were previously generated.

Requires explicit confirmation:

- Delete existing user-authored nodes.
- Rename existing non-generated pages or components.
- Overwrite same-name nodes without provenance.
- Publish a library.
- Change team, file, or library permissions.

## Preferred page model

- `Full Stack DS / Documentation`
- `Full Stack DS / Components`
- Future optional pages:
  - `Full Stack DS / Tokens`
  - `Full Stack DS / Usage Examples`
  - `Full Stack DS / Audit`

## Provenance keys

Every generated or updated node should carry enough plugin data to support idempotent reruns:

- `fsds.kind`: `documentation-frame`, `component-placeholder`, `component`, `component-set`, `variant`, or `token-swatch`.
- `fsds.component`: component name.
- `fsds.cssPrefix`: CSS prefix.
- `fsds.descriptorSchemaVersion`: descriptor schema version.
- `fsds.contractPath`: source contract path when available.
- `fsds.generatedAt`: ISO timestamp when available.

## Verification

After mutation, re-read the file and report:

- Pages created or reused.
- Nodes created.
- Nodes updated.
- Nodes skipped because of collisions.
- Unsupported operations because the MCP lacks an API.
- Descriptor names not found in the Figma file after mutation.

## Failure handling

If the local MCP cannot perform an intended operation, do not silently degrade to an untracked manual approximation. Either use a lower-strength placeholder and label it as such, or report the operation as blocked.
