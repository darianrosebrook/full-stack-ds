<!--
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 8,11,16,17,19,22,23,24,27
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
-->

# CAWS Claude Code Hook Pack — Inventory

Human-facing inventory of the v11 Claude Code hook pack. For the **agent
doctrine** (managed-file rules, spec-authoring traps, v10/v11 state model,
`settings.json` wiring) see [`CLAUDE.md`](./CLAUDE.md) in this directory —
that file is authoritative for behavior; this README is the at-a-glance map.

These are CAWS-managed files. **Do not hand-edit them.** Update the pack with
`caws init --agent-surface claude-code`. Hand-editing a managed file turns it
into an unmanaged snowflake the installer will then refuse to touch.

## How the pack runs

Claude Code reads `.claude/settings.json` at session start and invokes four
dispatchers under `caws_dispatch/`. Each reads stdin once via
`lib/parse-input.sh`, then fans out to a registered handler list via
`lib/run-handlers.sh`.

| Dispatcher | Claude Code event | Matcher | Timeout |
|---|---|---|---|
| `caws_dispatch/pre_tool_use.sh` | `PreToolUse` | Bash, Read, Write, Edit, Glob, Grep, NotebookEdit | 45 s |
| `caws_dispatch/post_tool_use.sh` | `PostToolUse` | Write, Edit, Bash, ExitPlanMode | 60 s |
| `caws_dispatch/session_start.sh` | `SessionStart` | — | 30 s |
| `caws_dispatch/stop.sh` | `Stop` | — | 30 s |

`session-log.sh` is additionally wired on `PreCompact` so transcripts survive
context compaction.

**Exit-code contract** (per handler, aggregated by the dispatcher): `2` =
hard block (short-circuits remaining handlers, tool call refused); `1` =
non-blocking warning (message shown, dispatcher continues, returns the max
non-2 code); `0` = pass. The dispatcher itself fails **open** — if it errors
before any handler runs, it exits 0 rather than turning its own bug into a
block.

## PreToolUse handlers (in dispatch order)

Handlers self-filter on `$HOOK_TOOL_NAME`; a non-matching tool is a cheap exit 0.

| Handler | Self-filters to | What it does |
|---|---|---|
| `agent-heartbeat.sh` | all | Heartbeats the session lease; surfaces parallel-agent presence via `additionalContext` when more than one agent is active. Never blocks. |
| `cwd-guard.sh` | all | Blocks (exit 2) when the working directory no longer exists on disk (e.g. a worktree was deleted while the session was inside it), with a recovery hint. |
| `block-dangerous.sh` + `classify_command.py` | Bash | Classifies catastrophic git ops, tokenized-argv bypasses, pipe-to-shell, and the protected-guard self-mod set; arms a per-session **danger latch** that blocks all subsequent Bash until a human runs `reset-danger-latch.sh`. |
| `worktree-guard.sh` | Bash | When worktrees are active: blocks amend/stash/reset/force-push, canonical-checkout mutating git, `git sparse-checkout` (any subcommand — points to `caws worktree repair-sparse`), and the path-restore family (`git restore <path>`, `git checkout -- <path>`, `git clean`). |
| `scope-guard.sh` | Write, Edit, Bash | Blocks edits outside the bound spec's `scope.in`; in union mode (no binding) checks all active specs. Applies progressive strikes via the `guard-strikes.sh` library. |
| `worktree-write-guard.sh` | Write, Edit | Blocks base-branch writes when worktrees are active; refuses `<worktree>/.caws/specs/*` writes (canonical authority); routes `.caws/worktrees/<name>/*` payload writes through `lib/worktree-claim-oracle.cjs` so a foreign session's write hard-blocks. |
| `bash-write-guard.sh` | Bash | Extracts mutation targets (redirection, `tee`, `sed -i`, `perl -pi`, `truncate`, `touch`, `rm`, `mv`, `cp`, `dd of=`, git path-restore) and routes each through the same `worktree-claim-oracle.cjs` — a Bash mutation of a foreign worktree's payload blocks at the same boundary as a foreign Write/Edit. |
| `protected-paths.sh` | Write, Edit | Blocks hook **scripts** under `.claude/hooks/` (`*.sh`/`*.py`/`*.cjs`, exit 1) and strike-state `.claude/logs/guard-strikes-*.json` (exit 2). Documentation (`*.md`) under `.claude/hooks/` is admitted; every other extension stays blocked (fail-closed). |
| `scan-secrets.sh` | Write, Edit, Bash | Advisory (exit 0): warns via `additionalContext` when a target path matches common secret-bearing patterns (`.env*`, `*.pem`, `*.key`, SSH/cloud config dirs). Does not block. |
| `quiet-merge.sh` | Bash | Must run **last** — emits `updatedInput`. Rewrites `caws worktree merge`/`destroy` to `cd <repo-root> && <cmd> 2>/dev/null | tail -3` so the CWD survives the directory being destroyed mid-command, and trims verbose output. |

## PostToolUse handlers

| Handler | Self-filters to | What it does |
|---|---|---|
| `naming-check.sh` | Write (new files) | Advisory (exit 0): flags shadow-file naming — banned modifier suffixes (`-new`, `-enhanced`, `-v2`, `-final`, `-copy`, …), version suffixes, date stamps. Test files with canonical extensions are exempted. |
| `god-object-check.sh` | Write, Edit | Advisory (exit 0): flags a file whose SLOC exceeds `CAWS_GOD_OBJECT_LOC` (default 2000). |
| `shortcut-language-check.sh` | Write, Edit | Progressive (warn→ask→block via the `guard-strikes.sh` library): flags TODO/FIXME/XXX/placeholder/"not implemented" stub language in non-test source. |
| `duplicate-export-check.sh` | Write (new JS/TS) | Advisory (exit 0): flags an exported symbol whose exact name already exists in the enclosing package's src tree (generic-name allowlist). |
| `loc-delta-check.sh` | Edit | Advisory (exit 0): flags an added-line delta over `CAWS_LOC_DELTA_WARN_THRESHOLD` (default 300) from the new/old payload diff. |
| `plan-transcript-snapshot.sh` | ExitPlanMode | Snapshots the conversation transcript next to the plan when a plan is presented; companion to `plan-transcript-finalize.sh`. |

`quality-check.sh` and `validate-spec.sh` exist in the pack but are **commented
out** of the PostToolUse handler list (opt-in). Wire them in
`caws_dispatch/post_tool_use.sh` if you want them.

## SessionStart / Stop handlers

| Handler | Event | What it does |
|---|---|---|
| `session-caws-status.sh` | SessionStart | Surfaces inherited dirty-state collision, foreign-claim soft-block, and CLI/pack version skew. Warnings only. |
| `agent-register.sh` | SessionStart | Registers the session into the `.caws/leases/` liveness substrate via `caws agents register`. Non-blocking. |
| `agent-stop.sh` | Stop | Marks the lease stopped on clean exit via `caws agents stop`. Best-effort — a crashed session never reaches Stop; heartbeat TTL is the primary liveness signal. |
| `plan-transcript-finalize.sh` | Stop | Overwrites each pending plan snapshot with the final turn-end transcript. |

`audit.sh` runs on both PreToolUse and PostToolUse, appending a per-tool-call
audit entry. `session-log.sh` runs on PostToolUse and `PreCompact`, writing the
per-turn narrative and structured transcripts via `session_log_renderer.py`.

## Shared libraries (`lib/`) — sourced, not wired

These are **not** handlers in any dispatcher list. Other hooks `source` them.

| Library | Sourced by | Provides |
|---|---|---|
| `lib/parse-input.sh` | every handler / dispatcher | parses the tool-call JSON into `HOOK_*` env vars |
| `lib/run-handlers.sh` | the four dispatchers | the handler fan-out loop + exit-code aggregation |
| `lib/caws-state.sh` | state-reading hooks | v10/v11 dual-shape registry + canonical-root resolution |
| `lib/emit.sh` | hooks that emit envelopes | the three Claude Code hook-output envelope shapes |
| `lib/guard-message.sh` | the write/exec guards | stable, greppable guard-identity + remediation strings |
| `lib/worktree-claim-oracle.cjs` | `worktree-write-guard.sh`, `bash-write-guard.sh` | the single owner-vs-session ownership answer (`.cjs` so it loads as CommonJS under `"type":"module"`) |

`guard-strikes.sh` is likewise a **sourced library** (used by `scope-guard.sh`
and `shortcut-language-check.sh`), not a standalone handler — it implements the
strike-1-warn → strike-3-block progression and writes per-checkout strike state.

## Human-run escape hatches (not hooks)

These are invoked by a human at the terminal, never by the agent:

| Script | Purpose |
|---|---|
| `reset-strikes.sh` | Reset accumulated guard strikes: `--current` / `--session <uuid>` / `--worktree <name>` / `--all --confirm`. Resets are logged. |
| `reset-danger-latch.sh` | Clear the danger latch armed by `block-dangerous.sh`. |

## If a hook blocks you

1. Read the block message — it names the guard and the remediation.
2. Do not bypass by deleting/editing hook files or using `--no-verify`.
3. If the scope is wrong, widen it with `caws specs amend-scope <id> --add <path>`.
4. If strikes are stale after a legitimate scope fix, ask the user to run
   `bash .claude/hooks/reset-strikes.sh --current`.
5. See [`CLAUDE.md`](./CLAUDE.md) for the full doctrine.
