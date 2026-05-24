# Library Setup Runbook

This runbook is the operational path for an agent setting up a Full Stack DS Figma library for a user.

Remote Figma MCP is the preferred path when available. Desktop Figma MCP is a fallback or organization-specific path.

## 1. Repository grounding

Validate or inspect the repository before touching Figma:

- Build the codegen package when command execution is available.
- Generate Figma descriptors from contracts when command execution is available.
- Build the Figma plugin package when command execution is available.
- If commands cannot run, inspect the descriptor registry and report that validation was not run.

Required repository evidence:

- Current branch.
- Descriptor registry path.
- Descriptor count.
- Whether descriptors were generated in this session.
- Whether plugin build or typecheck ran.

## 2. Remote Figma MCP read

When remote Figma MCP is configured:

- Resolve the file from URL or key.
- Read file metadata.
- Inventory pages, components, component sets, styles, and variables where supported.
- Record naming collisions against descriptor component names.

If remote MCP is unavailable, continue only when the user has configured another Figma MCP surface and accepts the weaker path.

## 3. Plan before mutation

Produce a bounded plan before making Figma changes:

- Pages to create or reuse.
- Documentation frames to create or update.
- Components or component placeholders to create or update.
- Component sets and variant properties to create when supported.
- Variables or styles to create when supported.
- Collisions and skipped items.

## 4. Remote MCP mutation

When the remote MCP exposes canvas write tools and the user requested setup, prefer this order:

1. Create or reuse `Full Stack DS / Documentation`.
2. Create or reuse `Full Stack DS / Components`.
3. Create documentation frame per descriptor.
4. Create component placeholder, component, or component set per descriptor depending on tool support.
5. Create variables and styles from token projections when descriptor inputs include them and tools support them.
6. Attach provenance metadata when the MCP exposes a supported mechanism.

Publishing, permission changes, deleting user-authored nodes, and overwriting non-generated same-name nodes require explicit authorization.

## 5. Desktop MCP fallback

Use desktop MCP only when:

- The user explicitly selected it.
- The organization requires desktop-server usage.
- Remote MCP is unavailable or lacks a required capability.

The same planning, provenance, and verification requirements apply.

## 6. Verify and report

After mutation:

- Re-read Figma state through the strongest available MCP surface.
- Confirm expected pages exist.
- Confirm expected descriptor names are represented.
- Report created, updated, skipped, and blocked items.
- Report exact MCP gaps that prevented stronger materialization.
