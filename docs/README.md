# docs/

Project documentation for **Full Stack Design System**.

## What goes here

Anything you would expect a future maintainer (or agent) to read to make sense of the project beyond the code itself: design rationale, contracts, ADRs, roadmaps, and reference material.

## Frontmatter is enforced

Every `.md` file in this directory (except this `README.md` and anything under `archive/`) must start with a YAML frontmatter block. The contract is defined in [`specifications/document_governance.md`](specifications/document_governance.md), and the rule is enforced advisory-only by `.claude/hooks/doc-frontmatter-check.sh` on `Write`/`Edit`.

Minimum required fields:

```yaml
---
doc_id: <STABLE-ID>
authority: <canonical|policy|architecture|adr|spec|roadmap|reference|working|ephemeral>
status: <draft|active|implemented|proven|superseded|archived>
title: <human-readable title>
owner: "@<handle>"
updated: YYYY-MM-DD
---
```

Some authority/status combinations require extra fields (`governs`, `verified_at_commit`, `superseded_by`, `caws_specs`). See the governance spec for the full table and examples.

## Layout

```
docs/
  README.md                              # This file (exempt from frontmatter rules)
  hook-wiring-design.md                  # Behavior-primitive design contract
  specifications/
    document_governance.md               # Frontmatter rules (enforced)
  archive/                               # Frozen historical docs (exempt)
```

New top-level docs should pick the right subfolder by authority — e.g., `specifications/` for `authority: spec`, `adrs/` for `authority: adr`, `roadmaps/` for `authority: roadmap`. Create the folder if it does not exist.
