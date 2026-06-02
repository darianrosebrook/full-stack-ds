# CAWS Claude-Code hooks — what governs a session here

This directory is the **CAWS claude-code hook pack** (`hook_pack_version: 11`).
Every file with a `# CAWS-MANAGED-HOOK` header is installed and maintained by
`caws init --agent-surface claude-code` and carries `do_not_edit_directly`.
**Do not hand-edit hook scripts** — `protected-paths.sh` hard-blocks
`Write`/`Edit` under `.claude/hooks/*`, and `block-dangerous.sh` arms a sticky
latch if a `Bash` command mutates a guard file. To change hook behavior, re-run
`caws init` or ask the user; do not weaken a guard by local judgment.

This README is **reference documentation**, derived by reading the code at the
current commit. It is not itself a hook. If a hook's behavior and this doc
disagree, the code wins — update this doc.

## How the wiring works

`.claude/settings.json` registers exactly **one dispatcher per event**, all
under `caws_dispatch/`:

| Event | Dispatcher | Tool matcher |
|---|---|---|
| `PreToolUse` | `caws_dispatch/pre_tool_use.sh` | `Bash\|Read\|Write\|Edit\|Glob\|Grep\|NotebookEdit` |
| `PostToolUse` | `caws_dispatch/post_tool_use.sh` | `Write\|Edit\|Bash\|ExitPlanMode` |
| `SessionStart` | `caws_dispatch/session_start.sh` | (all) |
| `Stop` | `caws_dispatch/stop.sh` | (all) |
| `PreCompact` | `session-log.sh` (direct) | (all) |

> The sibling `dispatch/` directory is an **inactive copy** — not referenced by
> `settings.json` or any active dispatcher. Only `caws_dispatch/` runs.

Each dispatcher reads stdin once (`lib/parse-input.sh`), then fans out to an
ordered `HANDLERS` array (`lib/run-handlers.sh`). Every handler **self-filters**
on `$HOOK_TOOL_NAME` and returns a cheap `exit 0` when it doesn't apply.

**Aggregation rules (`lib/run-handlers.sh`):**

- `PreToolUse` runs `--short-circuit-on-block`: the first handler exiting **2**
  stops the chain and the dispatcher returns 2 (the tool call is **blocked**).
- A handler can also block via **structured stdout**: JSON with
  `decision: "block"` (priority 3) wins over `ask` (2) over plain
  `additionalContext` (1) — a later advisory handler cannot erase an earlier
  block.
- Non-2 non-zero exits are **warnings**; the dispatcher continues and returns
  the max.
- `PostToolUse`/`SessionStart`/`Stop`: exit 2 still short-circuits + propagates
  stderr, but the tool already ran — so these are effectively non-blocking for
  the *current* call (PostToolUse blocks surface as guidance/strikes, not undo).
- **Fail-open:** if the dispatcher or a lib errors before handlers run, it exits
  0. Guard infrastructure must not turn its own bugs into tool blocks.

`HOOK_*` env vars (e.g. `HOOK_TOOL_NAME`, `HOOK_FILE_PATH`, `HOOK_SESSION_ID`)
are exported by the parser from the sanitized payload.

---

## PreToolUse handlers (these can BLOCK a tool call before it runs)

Order matters — listed as they run. `agent-heartbeat.sh` runs first (so peer
presence is refreshed even if a later guard blocks); `quiet-merge.sh` runs last
(it rewrites input and must not be clobbered).

### Blocking / asking guards

| Hook | Fires on | What it does | Outcome | Escape hatch |
|---|---|---|---|---|
| **cwd-guard.sh** | all | Blocks if `$(pwd)` no longer exists (e.g. you were inside a worktree that got destroyed). | **BLOCK** (exit 2) | `cd $(git rev-parse --show-toplevel)` or `cd $HOME`; clears automatically |
| **block-dangerous.sh** | `Bash` | Routes the command through `classify_command.py`. `deny` → block; `ask`+`confirm` → block + **arms a sticky per-session danger latch**; `ask`+`advisory` → stderr warning only. Also blocks any command that mutates `worktree-write-guard.sh`. Once latched, **all mutating commands block** until reset. | **BLOCK** + latch / **ASK** / advisory | `bash .claude/hooks/reset-danger-latch.sh --current --reason "…"` (or `--session <id>` / `--all`) |
| **worktree-guard.sh** | `Bash` | When active CAWS worktrees exist (or cwd is the canonical checkout): blocks history-rewriting / cross-worktree git (`commit --amend`, `stash`, `reset --hard`, `restore`, `checkout -- <path>`, `clean`, `push --force`, base-branch push, `checkout`/`switch`/`branch -f`/`reset` from canonical). Always blocks `--scope` worktree creation and `git sparse-checkout`. Advises (non-block) on base-branch `git merge`/`git commit`. | **BLOCK** (exit 2) | None; clears when worktrees are destroyed or you move into a worktree |
| **scope-guard.sh** | `Write`,`Edit` | Checks the target path against the active spec's `scope.in`/`scope.out` (via `caws scope check`, falling back to inline spec parse). Out-of-scope edits **escalate by strike**: 1st = advise, 2nd = ask, 3rd+ = block. Always-allowed: `.caws/`, `.claude/`, `docs/`, `tests/`, `scripts/`, `tmp/`, `.archive/`, root-level files, and `non_governed_zones` from `.caws/policy.yaml`. | **strike → ADVISE/ASK/BLOCK** | Fix scope: `caws specs amend-scope <id> --add <path>`; clear stale strikes: `bash .claude/hooks/reset-strikes.sh --current` |
| **worktree-write-guard.sh** | `Write`,`Edit` | Base-branch write isolation via the shared **claim oracle** (`lib/worktree-claim-oracle.cjs`). Hard-blocks writing a linked worktree's own `.caws/specs/`. For `.caws/worktrees/*` payloads: `block_foreign_worktree`/`block_claimed` → block, `pass` → allow. For other base-branch paths claimed by another active spec's `scope.in` → block. Allowlist passes `.claude/*`, `.caws/*` (non-worktree), `docs/*`, `CLAUDE.md`, `.githooks/*`, `.github/*`, etc. Bypassed while a merge is in progress (`MERGE_HEAD`). | **BLOCK** / **ASK** | `CAWS_GUARD_NO_ASK=1` forces ask→block; use `caws specs amend-scope` to claim the path in your own worktree |
| **bash-write-guard.sh** | `Bash` | The `Bash` counterpart to the write guard: extracts write targets from recognized mutation forms (`>`/`>>`, `tee`, `sed -i`, `perl -pi`, `truncate`, `touch`, `rm`, `mv`, `cp`, `dd of=`, `git restore/checkout/reset/clean`) and routes each through the same oracle. Worst outcome across targets wins. | **BLOCK** / **ASK** | `CAWS_GUARD_NO_ASK=1` forces ask→block |
| **protected-paths.sh** | `Write`,`Edit` | Pure path match. Blocks any write under `*/.claude/hooks/*` (exit 1) and to `*/.claude/logs/guard-strikes-*.json` (exit 2). | **BLOCK** | None programmatic; ask the user / re-run `caws init` for hook changes |

### Non-blocking PreToolUse handlers

| Hook | Fires on | What it does | Outcome |
|---|---|---|---|
| **agent-heartbeat.sh** | all | Refreshes this session's CAWS lease (`caws agents heartbeat`); emits a **MULTI-AGENT NOTICE** when other live sessions are detected and the peer set changes. | ADVISE (never blocks). Tune with `HEARTBEAT_EMIT_MIN_INTERVAL_MS` (default 60000) |
| **scan-secrets.sh** | any tool w/ `file_path` | Advises if the path looks secret-prone (`.env*`, `*.pem`, `*.key`, `id_rsa`, `credentials.json`, `.ssh/`, `.aws/`, `.kube/`, …). | ADVISE only |
| **quiet-merge.sh** | `Bash` | Rewrites bare `caws worktree merge\|destroy <name>` to `cd <root> && <cmd> 2>/dev/null \| tail -3; echo '---'; git log --oneline -1` — moving cwd out of the worktree before it's destroyed so PostToolUse hooks don't ENOENT. | **MUTATES input** (`updatedInput`) |

---

## The shared claim oracle (`lib/worktree-claim-oracle.cjs`)

Both write guards delegate the ownership decision to one CommonJS oracle (it's
`.cjs` by design — no TypeScript/build dependency in installed hooks). It emits
one of a closed outcome set to stdout (exit always 0; the caller decides):

| Outcome | Meaning |
|---|---|
| `pass` | unclaimed path, or you own the worktree payload, or no active worktrees |
| `block_claimed` | canonical-root write to a path another **active** spec claims via `scope.in` (session-independent) |
| `block_foreign_worktree` | write into `.caws/worktrees/<name>/…` whose owner session ≠ yours |
| `ask_uncertain` | looks like worktree payload but no live owner stamped → caller asks |
| `error_fail_closed` | registry/yaml unreadable → caller asks (never silent-allow) |

Reads `.caws/worktrees.json` and `.caws/specs/<id>.yaml`; only `lifecycle_state: active` specs confer a claim, and only `scope.in` (never `scope.out`/`scope.support`).

---

## PostToolUse handlers (after Write/Edit/Bash — advisory + strikes)

These cannot undo the tool. Most emit `additionalContext`; one escalates by
strike. Active handlers, in order:

| Hook | Fires on | What it checks | Outcome | Threshold env |
|---|---|---|---|---|
| **naming-check.sh** | `Write` | Shadow/throwaway filenames: banned modifiers (`enhanced`, `v2`-style, `new`, `final`, `copy`, `wip`, `tmp`, `old`, `backup`, …, word-boundary), version suffix `-v<N>.`, datestamp `YYYY-MM-DD`. | ADVISE | — |
| **god-object-check.sh** | `Write`,`Edit` | Warns if file SLOC ≥ threshold (comments/blanks stripped). | ADVISE | `CAWS_GOD_OBJECT_LOC` (default 2000) |
| **shortcut-language-check.sh** | `Write`,`Edit` | Flags `TODO`/`FIXME`/`XXX`/`HACK`/`TBD`, "not implemented / coming soon / placeholder", and `throw new Error("not implemented")` in non-doc/non-test source. Has a determiner filter to skip "the TODO" prose. | **strike → ADVISE/ASK/BLOCK** | — (3-strike threshold fixed) |
| **duplicate-export-check.sh** | `Write` | Warns if an exported symbol name already exists elsewhere in the (scoped) package tree. Allowlists generic names (`main`, `init`, `render`, …). | ADVISE | — |
| **loc-delta-check.sh** | `Edit` | Warns if a single Edit adds more than the threshold of net lines. | ADVISE | `CAWS_LOC_DELTA_WARN_THRESHOLD` (default 300) |
| **plan-transcript-snapshot.sh** | `ExitPlanMode` | Snapshots the transcript next to the plan file for later finalization. | non-blocking |
| **session-log.sh** | all | Re-renders session artifacts (also runs on SessionStart/Stop/PreCompact). | non-blocking |

---

## SessionStart / Stop / PreCompact (session-state, never block)

| Hook | Event | What it does | State written |
|---|---|---|---|
| **audit.sh session-start** | SessionStart | Appends a session-start record. (`tool-use`/`stop` argv variants exist but are **commented out**.) | `.claude/logs/audit.log`, `audit-YYYY-MM-DD.log` |
| **session-log.sh** | SessionStart, Stop, PreCompact, PostToolUse | Writes `.meta.json` + renders session/turn/handoff artifacts via `session_log_renderer.py`. | `.caws/sessions/<session-id>/` |
| **agent-register.sh** | SessionStart | `caws agents register` — adds this session to the liveness lease substrate. | `.caws/leases/` (via CLI) |
| **agent-stop.sh** | Stop | `caws agents stop` — marks the lease stopped (not deleted; `caws agents prune` removes). Does not fire on crash/SIGKILL. | `.caws/leases/` (via CLI) |
| **plan-transcript-finalize.sh** | Stop | Overwrites each pending plan-transcript snapshot with the final transcript, then drains the pending list. | `$HOME/.claude/.pending-plan-snapshots` |

---

## Present but DORMANT (commented out in dispatchers)

These ship in the pack but are **not wired** right now. Listed so we know they
exist and what flipping them on (via the dispatcher HANDLERS arrays) would do.
None except `quality-check.sh` would block.

| Hook | Would fire on | If re-enabled |
|---|---|---|
| **quality-check.sh** | PostToolUse | Runs `caws gates run --spec <id>` on source edits; **blocks** on real gate violations (advisory on bootstrap errors). The only dormant hook that can block. |
| **validate-spec.sh** | PostToolUse | Advises on `.caws/**/*.yaml` syntax errors and terminal-state specs whose ACs lack `test_nodeids`/`evidence`. Non-blocking. |
| **doc-frontmatter-check.sh** | PostToolUse | V1–V6 frontmatter validation on `docs/**/*.md` (required fields, authority/status enums, `governs`, `verified_at_commit`, `superseded_by`, `caws_specs` on roadmap docs). Non-blocking advisory. |
| **session-caws-status.sh** | SessionStart | Prints active-worktree warnings, a risk briefing, CLI/repo version-skew check, and `caws status`. Non-blocking. |
| **stop-worktree-check.sh** | Stop | Reminds about leftover active worktrees or the lack of one. Non-blocking. |

Manual-only utilities (never dispatcher-wired) — invoked by the user from a
shell:

- **reset-danger-latch.sh** — clears the `block-dangerous.sh` sticky latch
  (`danger-latch-<session>.json` + `danger-warn-<session>.json` under
  `.claude/hooks/state/`). Modes: `--current` / `--session <id>` / `--all`,
  plus mandatory `--reason`. Resets logged to `.claude/logs/danger-latch-resets.log`.
- **reset-strikes.sh** — clears `scope-guard` / `shortcut-language` strike
  counters (`guard-strikes-<session>.json`). Modes: `--current` /
  `--session <uuid>` / `--worktree <name>` / `--all --confirm` /
  `--stale --older-than <days>`, optional `--guard <name>`, `--dry-run`.
  Default (no args) lists state. Resets logged to `.claude/logs/strike-resets.log`.

---

## State & log locations (all gitignored regenerable runtime)

| Path | Written by | Contents |
|---|---|---|
| `.claude/hooks/state/danger-latch-<session>.json` | block-dangerous.sh | armed danger latch (currently empty dir = no latch) |
| `.claude/logs/guard-strikes-<session>.json` | guard-strikes.sh (canonical) | per-(session,guard) strike counts |
| `.git/worktrees/<name>/caws-guard-strikes/…` | guard-strikes.sh (in-worktree) | strikes kept **outside** the tree so `git add -A` can't commit them |
| `.claude/logs/audit*.log` | audit.sh | session-start audit records |
| `.claude/logs/*-resets.log` | reset-*.sh | latch/strike reset audit trail |
| `.caws/sessions/<id>/` | session-log.sh | session/turn/handoff render artifacts |
| `.caws/leases/` | agent-register/stop, heartbeat | multi-agent liveness leases |
| `.caws/cache/risk-<branch>.txt` | worktree-write-guard.sh | throttled risk-line cache (`CAWS_RISK_THROTTLE_SECS`, default 30s) |

---

## Quick reference: "I'm blocked — what do I do?"

- **"CWD does not exist"** → `cd $(git rev-parse --show-toplevel)`.
- **Danger latch armed / mutating commands all blocked** → ask the user to run
  `bash .claude/hooks/reset-danger-latch.sh --current --reason "…"`. Do **not**
  edit the latch file.
- **Out-of-scope Write/Edit (strike 2/3)** → widen the spec with
  `caws specs amend-scope <id> --add <path>` and work in your worktree; if the
  strikes are stale, ask the user to run `bash .claude/hooks/reset-strikes.sh --current`.
- **Foreign-worktree / claimed-path write blocked** → you're writing a path
  owned by another session/spec. Claim it in your own spec or coordinate; don't
  force it.
- **Write to `.claude/hooks/*` blocked** → hooks are managed; re-run `caws init`
  or ask the user. Never edit a guard to weaken it.

Never use `--no-verify`, never edit a hook or strike/latch file to get past a
guard. If a guard is genuinely wrong, say so and ask the user.
