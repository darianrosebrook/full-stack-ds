---
doc_id: SPEC-DOC-GOV-001
authority: spec
status: draft
title: Document Governance
owner: "@darianrosebrook"
updated: 2026-05-21
governs:
  - docs/**/*.md
---

# Document Governance

This spec defines the frontmatter contract that documents under `docs/` must follow. It is enforced advisory-only by `.claude/hooks/doc-frontmatter-check.sh`, which warns on `Write`/`Edit` of any non-exempt `docs/**/*.md` file that is missing or misuses these fields.

## Scope

**Applies to:** every `.md` file under `docs/`.

**Exempt:**

- `README.md` at any depth (overview files, no governance needed).
- Anything under `docs/archive/` (frozen historical record).

## Required fields

Every governed doc must start with a YAML frontmatter block delimited by `---` on its own line, containing at minimum:

| Field | Purpose |
|---|---|
| `doc_id` | Stable identifier — never changes once assigned. Use kebab/uppercase per authority (e.g., `SPEC-…`, `ADR-…`, `RFC-…`). |
| `authority` | What kind of authority this doc carries. See enum below. |
| `status` | Lifecycle state. See enum below. |
| `title` | Human-readable title. |
| `owner` | Single point of accountability (typically a GitHub handle like `@darianrosebrook`). |
| `updated` | ISO date (`YYYY-MM-DD`) of last meaningful edit. |

## `authority` enum

Higher authority = harder to change without coordination. Listed roughly highest to lowest:

| Value | Use when… |
|---|---|
| `canonical` | The single source of truth on a topic. All other docs must defer to it. |
| `policy` | A binding rule for how work is done. |
| `architecture` | Cross-cutting structural decision. |
| `adr` | Architecture Decision Record — captures one decision and its context. |
| `spec` | Concrete contract for a component/feature/interface. |
| `roadmap` | Future-facing plan tracking work that has not landed. |
| `reference` | Stable factual lookup material (glossaries, APIs, schemas). |
| `working` | In-flight thinking, design discussion, drafts. |
| `ephemeral` | Short-lived notes that should be deleted or promoted later. |

## Location

The `authority` value determines where the doc lives on disk. The tree is partitioned so consumer-facing surfaces (`docs/`) stay durable, while ephemeral surfaces (roadmaps, working notes, in-flight thinking) live off-tree.

| Authority | Location | Tracked |
|---|---|---|
| `canonical` | `docs/` | yes |
| `policy` | `docs/` | yes |
| `architecture` | `docs/` | yes |
| `adr` | `docs/` | yes |
| `spec` | `docs/` | yes |
| `reference` | `docs/` | yes |
| `roadmap` | `docs/internal/` | no (`.gitignore`) |
| `working` | `docs/internal/` | no (`.gitignore`) |
| `ephemeral` | `docs/internal/` | no (`.gitignore`) |

**Why the partition exists.** Consumer-facing docs are the study surface a reader uses to understand the project. Roadmaps and working notes go stale faster than reference docs, and stale content in `docs/` becomes a trust hazard — readers can't distinguish "this teaches current reality" from "this is in-flight thinking from three weeks ago." Moving the ephemeral surfaces off-tree makes the partition mechanical rather than depending on reader judgment about each file.

**Collaboration.** `docs/internal/` is contributor-local. Teams that need to share roadmaps or working notes do so through an out-of-band surface (a team doc folder, an issue tracker, a wiki) — not through this repository.

**Enforcement.** Currently advisory: the hook (`.claude/hooks/doc-frontmatter-check.sh`) does not yet check authority-vs-location consistency. Contributors are expected to honor the partition on Write. A future hook extension could enforce it mechanically by warning when a `docs/*.md` file declares `authority: roadmap | working | ephemeral`, or when a `docs/internal/*.md` file declares a durable authority.

## `status` enum

| Value | Meaning |
|---|---|
| `draft` | Not yet ratified. Content is provisional. |
| `active` | Ratified and current. The doc represents present intent. |
| `implemented` | The thing described is in code. Requires `verified_at_commit`. |
| `proven` | Implementation is verified by tests/audit. Requires `verified_at_commit`. |
| `superseded` | Replaced by a newer doc. Requires `superseded_by: <doc_id>`. |
| `archived` | Frozen and no longer maintained. |

## Conditional fields

The hook enforces these when the corresponding authority/status applies:

- **`governs:`** — required when `authority` is `canonical`, `architecture`, `adr`, or `spec`. List the modules, schemas, or specs this doc has authority over. May be an inline array (`[mod-a, mod-b]`) or a YAML list.
- **`verified_at_commit:`** — required when `status` is `implemented` or `proven`. A commit SHA where the claims were verified. Update on each verification.
- **`superseded_by:`** — required when `status` is `superseded`. The `doc_id` of the replacement.
- **`caws_specs:`** — required when `authority` is `roadmap`. List the CAWS spec IDs tracking the roadmap items (e.g., `[TC-01, TC-04]`).

## Example: spec authoring a contract

```yaml
---
doc_id: SPEC-STACK-001
authority: spec
status: active
title: Stack Primitive Contract
owner: "@darianrosebrook"
updated: 2026-05-14
governs:
  - packages/ds-contracts/primitives/Stack.primitive.json
  - packages/ds-codegen/src/primitive-contract.ts
---
```

## Example: superseded ADR

```yaml
---
doc_id: ADR-007
authority: adr
status: superseded
title: Direct DOM rendering for Modal
owner: "@darianrosebrook"
updated: 2026-04-02
superseded_by: ADR-012
---
```

## How the hook reports

The hook (`/.claude/hooks/doc-frontmatter-check.sh`) is registered in `post_tool_use.sh` and runs after `Write` or `Edit`. It is advisory: it emits a single `hookSpecificOutput` JSON block with `additionalContext` describing the missing/invalid field. It does **not** block the tool, but the warning is surfaced to the agent on the next turn.

Validation passes are versioned in the script (V1 → V6) so newer rules can be added without breaking older docs that pre-date them.

## Not in scope

This spec governs frontmatter only. It does not prescribe document *structure* (headings, body conventions, code-block style). Those belong in separate style guides if needed.
