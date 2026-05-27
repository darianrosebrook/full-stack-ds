# Desktop Figma MCP Skill Surface

Use this surface only when the user's environment explicitly configures the desktop Figma MCP or when the remote MCP is unavailable or insufficient for the requested setup task.

## Purpose

The desktop Figma MCP is a fallback or organization-specific surface. It must not be described as the default mutation lane. Prefer the remote Figma MCP for file/design inspection and write-to-canvas setup when available.

## Required preflight

Before using the desktop MCP:

1. Confirm the user or environment requires the desktop MCP path.
2. Confirm a local Figma file is open if the desktop MCP operates against the open file.
3. Inspect pages and top-level nodes when the MCP exposes inspection tools.
4. Search for existing Full Stack DS provenance keys when metadata reads are supported:
   - `fsds.component`
   - `fsds.cssPrefix`
   - `fsds.descriptorSchemaVersion`
   - `fsds.contractPath`
   - `fsds.generatedAt`
5. Compare against remote file identity if remote MCP evidence is available.
6. Count generated descriptors from the repo.

## Mutation policy

Allowed after user asks to set up the library and the desktop MCP exposes the required operation:

- Create pages for documentation and components.
- Create frames for component documentation.
- Create placeholder component frames or native components from descriptors.
- Attach provenance metadata when supported.
- Update generated nodes when stable provenance indicates they were previously generated.

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

Every generated or updated node should carry enough metadata to support idempotent reruns when the MCP exposes such metadata writes:

- `fsds.kind`: `documentation-frame`, `component-placeholder`, `component`, `component-set`, `variant`, or `token-swatch`.
- `fsds.component`: component name.
- `fsds.cssPrefix`: CSS prefix.
- `fsds.descriptorSchemaVersion`: descriptor schema version.
- `fsds.contractPath`: source contract path when available.
- `fsds.generatedAt`: ISO timestamp when available.

## Verification

After mutation, re-read Figma state and report:

- Pages created or reused.
- Nodes created.
- Nodes updated.
- Nodes skipped because of collisions.
- Unsupported operations because the MCP lacks an API.
- Descriptor names not found in the Figma file after mutation.

## Failure handling

If the desktop MCP cannot perform an intended operation, do not silently degrade to an untracked manual approximation. Either use a lower-strength placeholder and label it as such, switch to remote MCP when available, or report the operation as blocked.
