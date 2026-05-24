# Figma Library Setup Agent Skill

This skill guides an agent through setting up a Full Stack DS library in Figma from contract-derived descriptors.

The skill intentionally separates three authority surfaces:

1. Repository authority: contracts and generated Figma descriptors in this repo.
2. Remote Figma MCP: file/team/library metadata, cloud file reads, comments, and publication-adjacent inspection when available.
3. Local Figma MCP: desktop-app inspection and mutation of the currently open file.

Agents must not treat remote or local Figma state as source of truth for component semantics. Figma state is a materialized projection of contracts.

## Inputs

- Repository path or checked-out branch containing `packages/ds-contracts`.
- Generated descriptor registry under `packages/ds-figma-plugin/src/generated/components`.
- Figma file key or URL when remote MCP is available.
- Open Figma desktop file when local MCP mutation is required.

## Required sequence

1. Validate repository state.
   - Confirm the branch and changed files.
   - Run contract validation and Figma descriptor generation when local commands are available.
   - Refuse to mutate Figma if descriptors are missing or stale and generation cannot be run.

2. Read remote Figma state when configured.
   - Locate the target file.
   - Inspect pages, published components, component sets, styles, variables, and library metadata if the remote MCP exposes them.
   - Record existing naming conventions and potential collisions.
   - Do not mutate through the remote surface unless the task explicitly authorizes a remote write and the MCP tool supports it.

3. Read local Figma state when configured.
   - Inspect the currently open file.
   - Confirm the file matches the intended remote file when both surfaces are available.
   - Identify existing Full Stack DS pages, nodes, component sets, plugin data keys, and generated artifacts.

4. Plan the library setup.
   - Produce a bounded change plan naming pages, frames, components, component sets, properties, variables, and documentation frames to create or update.
   - Prefer update-in-place when plugin data keys identify prior generated nodes.
   - Treat destructive operations as explicit-confirmation actions unless the user has already authorized cleanup.

5. Mutate local Figma state.
   - Create or update documentation pages.
   - Create or update component pages.
   - Materialize component placeholders or component sets from descriptors.
   - Set plugin data keys for provenance: `fsds.component`, `fsds.descriptorSchemaVersion`, `fsds.contractPath`, and `fsds.generatedAt` when available.
   - Create component properties only when the local MCP exposes a supported operation for them.

6. Verify.
   - Re-read local Figma state.
   - Report created, updated, skipped, and blocked items.
   - Surface unresolved collisions, unsupported Figma API gaps, and descriptors not materialized.

## Refusal and pause conditions

Pause or refuse mutation when:

- The open local Figma file does not match the intended remote file.
- Descriptor generation is stale and cannot be refreshed.
- A mutation would overwrite user-authored nodes without stable plugin data provenance.
- The requested operation requires publishing a library or changing team-level permissions without explicit authorization.
- Required MCP tools are unavailable.

## Output format

Return:

- Repository evidence: branch, commands run, descriptor count.
- Figma evidence: remote file identity, local file identity, pages inspected.
- Mutations: created, updated, skipped, blocked.
- Follow-up: exact unsupported operations or missing MCP capabilities.
