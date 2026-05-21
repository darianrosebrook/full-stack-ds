# docs/

Project documentation for **Full Stack Design System**.

## What goes here

Durable reference for a reader trying to understand the project — design rationale, architectural doctrine, contracts, ADRs, specs, reference material. Everything in this tree should still teach current reality six months from now.

In-flight thinking, roadmaps, and working notes do NOT go here. They live in `docs/internal/` (gitignored, per-contributor). See [`specifications/document_governance.md`](specifications/document_governance.md) — "Location" section — for the authority→directory partition rule and the rationale (stale ephemeral content in a consumer-facing tree becomes a trust hazard).

## Frontmatter is enforced

Every `.md` file in this directory (except this `README.md` and anything under `archive/`) must start with a YAML frontmatter block. The contract is defined in [`specifications/document_governance.md`](specifications/document_governance.md), and the rule is enforced advisory-only by `.claude/hooks/doc-frontmatter-check.sh` on `Write`/`Edit`.

Minimum required fields:

```yaml
---
doc_id: <STABLE-ID>
authority: <canonical|policy|architecture|adr|spec|reference>
status: <draft|active|implemented|proven|superseded|archived>
title: <human-readable title>
owner: "@<handle>"
updated: YYYY-MM-DD
---
```

The `roadmap | working | ephemeral` authority values are valid in the enum but require the doc to live under `docs/internal/` (gitignored).

Some authority/status combinations require extra fields (`governs`, `verified_at_commit`, `superseded_by`, `caws_specs`). See the governance spec for the full table and examples.

## Layout

```
docs/
  README.md                              # This file (exempt from frontmatter rules)
  admission-rail.md                      # Generated artifact admission rail (concept)
  manifest-schema.md                     # Emission manifest schema (reference)
  governed-ci.md                         # Rail operator workflow + CI integration
  codegen-authority.md                   # Codegen layer authority doctrine
  normal-form.md                         # The seven properties of compositional systems
  presence-surfaces.md                   # Tooltips/popovers/dialogs/menus family doctrine
  states-to-css.md                       # Contract states → CSS selectors
  specifications/
    document_governance.md               # Frontmatter + location rules (enforced advisory)
  archive/                               # Frozen historical docs (exempt)

docs/internal/                            # gitignored — per-contributor ephemera
  <roadmaps, working notes, in-flight thinking>
```

New top-level docs should pick the right subfolder by authority — e.g., `specifications/` for `authority: spec` reference material, `adrs/` for `authority: adr`. Create the folder if it does not exist. Do NOT create `roadmaps/` or `working/` under `docs/`; those authorities partition into `docs/internal/`.
