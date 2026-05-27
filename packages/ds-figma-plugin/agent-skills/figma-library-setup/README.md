# Figma Library Setup Agent Skill

This skill guides an agent through setting up a Full Stack DS library in Figma from contract-derived descriptors.

The skill separates three authority surfaces:

1. Repository authority: contracts and generated Figma descriptors in this repo.
2. Remote Figma MCP: preferred Figma MCP surface for file/design inspection and, when exposed by the connected client/server, write-to-canvas setup of native Figma content.
3. Desktop Figma MCP: fallback or organization-specific desktop-server surface when the environment requires it. Do not assume it is the primary mutation path.

Agents must not treat Figma state as source of truth for component semantics. Figma state is a materialized projection of contracts. Agent skills also do not add new MCP capabilities; they only instruct the agent how to use available MCP tools safely.

## Inputs

- Repository path or checked-out branch containing `packages/ds-contracts`.
- Generated descriptor registry under `packages/ds-figma-plugin/src/generated/components`.
- Figma file key or URL for the target library file.
- Remote Figma MCP connection when available.
- Desktop Figma MCP connection only when explicitly configured or required by the user's environment.

## Required sequence

1. Validate repository state.
   - Confirm the branch and changed files.
   - Run contract validation and Figma descriptor generation when local commands are available.
   - Refuse to mutate Figma if descriptors are missing or stale and generation cannot be run.

2. Inspect Figma state through the remote MCP when available.
   - Locate the target file.
   - Inspect pages, components, component sets, styles, variables, and library metadata if the MCP exposes them.
   - Record existing naming conventions and potential collisions.
   - Treat unsupported reads as evidence gaps, not as proof of absence.

3. Use write-to-canvas tools when the connected MCP exposes them and the user has requested setup.
   - Create or update documentation pages.
   - Create or update component pages.
   - Materialize component placeholders, components, component sets, variables, and auto layout when supported by the MCP tools.
   - Set provenance metadata when the MCP exposes a supported mechanism for plugin data, annotations, or equivalent node metadata.

4. Use desktop MCP only as a configured fallback or special-case surface.
   - Inspect or mutate through desktop MCP only when the remote MCP is unavailable, the org requires desktop server usage, or the user explicitly selected that path.
   - Do not describe desktop MCP as inherently stronger or as the default mutation lane.

5. Plan the library setup before mutation.
   - Produce a bounded change plan naming pages, frames, components, component sets, properties, variables, and documentation frames to create or update.
   - Prefer update-in-place when stable provenance identifies prior generated nodes.
   - Treat destructive operations as explicit-confirmation actions unless the user has already authorized cleanup.

6. Verify.
   - Re-read Figma state through the strongest available MCP surface.
   - Report created, updated, skipped, and blocked items.
   - Surface unresolved collisions, unsupported Figma MCP gaps, and descriptors not materialized.

## Refusal and pause conditions

Pause or refuse mutation when:

- The target file identity is ambiguous.
- Descriptor generation is stale and cannot be refreshed.
- A mutation would overwrite user-authored nodes without stable generated provenance.
- The requested operation requires publishing a library or changing team-level permissions without explicit authorization.
- Required MCP tools are unavailable.

## Output format

Return:

- Repository evidence: branch, commands run, descriptor count.
- Figma evidence: file identity, MCP surface used, pages inspected.
- Mutations: created, updated, skipped, blocked.
- Follow-up: exact unsupported operations or missing MCP capabilities.
