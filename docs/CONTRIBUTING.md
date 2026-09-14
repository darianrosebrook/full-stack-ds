---
doc_id: POLICY-CONTRIBUTING-001
authority: policy
status: active
title: Contributing
owner: "@darianrosebrook"
updated: 2026-09-14
---

# Contributing

How to set up, work, and land changes in this repository. This is a policy
doc: the workflow rules here bind contributors and coding agents alike. For
what the repository *is*, start at the [README](../README.md); for what is
currently proven, the authority order begins with the
[implementation snapshot](current-implementation-snapshot.md).

## Setup

```bash
pnpm install            # pnpm@10.14.0 is enforced; Node 22 in CI
pnpm run tokens:build   # materialize gitignored token outputs the gates read
```

`pnpm install` runs the `prepare` script, which wires `core.hooksPath` to
`.githooks` so the pre-push gate activates. Worktrees do not inherit
gitignored build outputs — rebuild them inside the worktree before running
gates (the walkthrough below includes the step).

## Validate as you go

- `pnpm run lint` and `pnpm run typecheck` are the fast loops while editing.
- `pnpm test` is the root suite; framework packages carry their own runners.
- The pre-push hook is **change-scoped**: it skips gate families whose inputs
  did not change, so a green pre-push proves your touched lanes passed, not
  that CI will pass. CI is authoritative.
- Never bypass a failing gate to proceed — fix the underlying issue.

## Work happens under a CAWS spec

Non-trivial work is governed by a CAWS spec so its provenance is recorded
and concurrent sessions cannot clobber each other. Plain feature branches
bypass scope enforcement and are not the path.

1. **Create the spec before any work.** Give it a descriptive ID, mode, risk
   tier, concrete `scope.in` paths, and falsifiable given/when/then
   acceptance criteria. Inspect a candidate first with `--plan --json`:

   ```bash
   caws specs create <SPEC-ID> --title "…" --mode feature --risk-tier 2 \
     --scope-in <paths…> \
     --acceptance 'given…; when…; then…'
   ```

2. **Create a bound worktree and claim it.** All work happens inside the
   worktree — the binding enforces `scope.in`:

   ```bash
   caws worktree create <name> --spec <SPEC-ID>
   caws claim
   caws scope check <path>   # verify a path is admitted before editing
   ```

3. **Prepare the worktree.** Shared `node_modules` symlinks make vitest
   resolve duplicate module instances; replace them once, then rebuild the
   gitignored outputs gates read:

   ```bash
   pnpm run worktree:install
   pnpm run tokens:build
   ```

4. **Commit in logical units** with conventional, scoped messages
   (`feat(…)`, `fix(…)`, `docs(…)`). Do not edit files outside the spec's
   scope; widen scope the governed way with `caws specs amend-scope`.

5. **Run the gates inside the worktree** before considering the slice done:
   at minimum `pnpm test`, `pnpm run lint`, `pnpm run typecheck`, plus the
   gate families your paths touch.

## Landing work: merge autonomy

**The rule.** Work performed under an active CAWS spec may merge to `main`
without human approval when **all** of the following hold:

- every acceptance criterion has recorded evidence (`caws specs evidence`,
  status `pass` or an explicitly reasoned `waived`) — a closed badge alone
  is not proof, because warn-mode closure can succeed with unsatisfied
  evidence;
- the required gates pass inside the worktree;
- the lane is clean, owned, and spec-bound, and
  `caws worktree merge <name> --dry-run` succeeds against a quiet `main`.

That merge uses `--no-close` so evidence can be recorded while the spec is
still active, then closes explicitly:

```bash
caws worktree merge <name> --no-close
caws specs evidence <SPEC-ID> --ac A1 --status pass --evidence-ref "…"
caws specs close <SPEC-ID> --resolution completed \
  --merge-commit <merge-sha> --reason "one line"
```

**Everything outside that boundary requires human coordination**: work not
covered by an active spec, acceptance criteria that are unmet or unrecorded,
taking over another session's lane or dirt, weakening a gate, and any push
to `origin`. `origin` only ever receives `main`, and pushing is a
human-governed act — a local merge never pushes.

## Writing and editing documentation

- Every tracked doc under `docs/` carries governed frontmatter — the
  contract is [Document Governance](document_governance.md). `authority:
  policy` belongs in `docs/`; roadmaps and working notes are untracked
  `docs/internal/` material.
- The docs site in the showcase derives from **git-tracked markdown only**.
  A new doc appears in the reader and the dependency graph once it is
  tracked (`git add -N docs/your-doc.md` in dev); nothing else is wired by
  hand, so the site cannot drift from the corpus.
- Mark governed numbers instead of writing bare counts in prose: write the
  marker (`<!-- component-count -->` or any other from the claims table)
  followed by the derived value, and `pnpm run docs:check-claims` enforces
  it — `:fix` rewrites stale ones. A marker followed by no shape-compatible
  value is ignored, which is how the markers can be named in prose safely.
- Relative `.md` links must resolve: `pnpm run docs:check-links` gates
  tracked-doc to tracked-doc links.

## Conventions

- Conventional commits with scopes naming the area (`fix(e2e): …`).
- No shadow files (`*-v2.*`, `*-copy.*`); edit the authoritative surface.
- Generated artifacts, caches, and gitignored regenerables
  (`composed.tokens.json`, the emission manifest) are never committed.
- Do not over-claim: say what a check exercised and what it did not.
