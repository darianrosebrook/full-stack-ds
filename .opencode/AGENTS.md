<!--
# CAWS-MANAGED-HOOK
# hook_pack: opencode
# hook_pack_version: 5
# caws_min_major: 11
# lineage_refs: 1,4,6,8,11,12,13,16,17,19,22,23,24,25,26,27,28,29,30,31
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — caws init refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
-->

# CAWS opencode Hook Pack

This directory is the **opencode vendor adapter** for the CAWS hook pack. It
contains the opencode-specific wiring (a TypeScript plugin shim) and this
surface doc. All shared hook logic lives in the CAWS shared core, installed at
`.caws/hooks/` in the consumer repo.

opencode (https://opencode.ai) differs from the claude-code and codex adapters
in **how** it interposes on the agent lifecycle. claude-code and codex fire
hooks by invoking an external bash command named in a config file
(`.claude/settings.json`, `.codex/hooks.json`). opencode has no such config
field — its lifecycle interposition is an **in-process TypeScript plugin
surface** (`.opencode/plugins/*.ts`, auto-discovered at startup). So this
adapter ships a TS shim rather than a JSON wiring file.

## Layout

```
.caws/hooks/            # shared core — event dispatchers + all guard/check hooks
  dispatch/             # pre_tool_use.sh, post_tool_use.sh, session_start.sh, stop.sh, pre_compact.sh
  lib/                  # parse-input.sh, run-handlers.sh, emit.sh, agent-surface.sh, ...
  <shared hooks>.sh     # scope-guard, block-dangerous, worktree-guard, god-object-check, ...

.opencode/              # opencode adapter (this directory when installed)
  plugins/caws.ts       # the shim — translates opencode plugin callbacks → shared dispatchers
  AGENTS.md             # this file
```

The shim contains **zero CAWS guard logic**. It is a translator: it maps
opencode's `tool.execute.before` / `tool.execute.after` callbacks and session
bus events onto the shared bash dispatchers, and converts a dispatcher block
decision into opencode's block primitive (`throw new Error(reason)` inside
`tool.execute.before`). Every guard — scope, dangerous-command, worktree,
god-object, shortcut-language, the four advisory quality checks — runs from the
shared core unchanged. There is no duplicated logic and no opencode-specific
guard code.

## How the shim works

| opencode callback             | Routes to                               | Effect                                                                                                                                                                                                           |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tool.execute.before`         | `.caws/hooks/dispatch/pre_tool_use.sh`  | Runs the guard chain. On a `block` decision (or `ask`, degraded), `throw new Error(reason)` — opencode blocks the tool and surfaces `reason` to the agent. Otherwise stashes any `additionalContext` (peer notice / messages / advisories) for the next `system.transform` to inject. Applies `updatedInput` (quiet-merge) by mutating `output.args`. |
| `tool.execute.after`          | `.caws/hooks/dispatch/post_tool_use.sh` | Audit + advisory quality checks (god-object, loc-delta, duplicate-export). Never blocks.                                                                                                                         |
| `event` (`session.created`)   | `.caws/hooks/dispatch/session_start.sh` | Lease registration / session log open. Best-effort.                                                                                                                                                              |
| `event` (`session.idle`)      | `.caws/hooks/dispatch/stop.sh`          | Session log finalize / lease stop. Best-effort.                                                                                                                                                                  |
| `event` (`session.compacted`) | `.caws/hooks/dispatch/pre_compact.sh`   | Compact-context snapshot. Best-effort.                                                                                                                                                                           |

Tool-name and arg normalization: opencode uses lowercase tool names
(`bash`/`write`/`edit`/`read`/`glob`/`grep`) and camelCase args
(`filePath`/`oldString`/`newString`); the shim maps these to the CAWS dispatcher
vocabulary (`Bash`/`Write`/`Edit`, `file_path`/`old_string`/`new_string`) that
the shared guards were written against. This is the opencode analogue of the
codex `parse-input.sh` override that normalizes `apply_patch`.

Path resolution: the shim resolves the repo root at **runtime** by walking up
from the plugin ctx (`worktree` / `directory` / `project.path`) to the nearest
`.caws/`, then sets `CAWS_AGENT_SURFACE=opencode` and `CAWS_PROJECT_DIR=<root>`
on every dispatcher invocation. There is no install-time token substitution.

## Blocking semantics

opencode's only PreToolUse block primitive is `throw new Error(msg)` inside
`tool.execute.before`; the message becomes the tool-failure reason the agent
sees. opencode has **no native PreToolUse `ask`**. Per the codex adapter
precedent (`.codex/hooks/lib/emit.sh` degrades ask → deny), ask-level
escalations degrade to block here as well, so governance never silently allows
an operation because an unsupported ask field was ignored.

## Context surfacing: heartbeat, message delivery, advisories

The shared core PRODUCES context for the agent — the multi-agent peer notice
(`agent-heartbeat.sh`), inter-agent message delivery (`caws message poll`),
and advisory quality findings — as `hookSpecificOutput.additionalContext` on
the dispatcher's stdout. claude-code injects that natively; opencode does not,
so the shim surfaces it via opencode's `experimental.chat.system.transform`
hook — the type-confirmed injection point
(`Hooks["experimental.chat.system.transform"]` mutates `output.system[]`).
`tool.execute.before` stashes the `additionalContext`; `system.transform`
appends it to the system prompt on the next model call, so the model sees the
peer notice / message / advisory when it processes the tool result. This is
the single mechanism for heartbeat, message delivery, and advisory surfacing
in opencode; any `additionalContext` a shared handler emits falls out of it
for free.

Why not `client.session.prompt({noReply:true})`: that API is documented for
injecting context, but calling it from *inside* a `tool.execute.before` hook
silently no-ops (sending a prompt from within a tool hook is disallowed /
re-entrant). `system.transform` is fired by the chat loop itself, so it has no
such constraint.

Two load-bearing details:

- **Session id.** The opencode session id is captured from the `sessionID`
  field on the hook inputs (and from `session.*` bus events) and passed in the
  dispatcher payload as `session_id`. Without it, `parse_hook_input` resolves
  `HOOK_SESSION_ID="unknown"` and `agent-register`/`agent-heartbeat` exit
  early — no lease, no peer notice, no message delivery.
- **Change-detection cadence.** `agent-heartbeat.sh` emits the peer notice
  only when the active peer set changes (and at most once per ~60s), so
  injection is rare and non-spammy. Message delivery is one-per-tool-call
  (poll is deliver-once).

If `system.transform` does not fire (an opencode build that doesn't wire this
experimental hook), the stashed context is simply not injected — it never
blocks a tool call. The shared core still produces the context; only the
surfacing depends on the hook firing.

## Fail posture

If `.caws/hooks/dispatch/` is absent (CAWS not installed for this repo), the
shim fails **OPEN** — it logs once and allows every tool — it never blocks all
work over a missing install. Run `caws init --agent-surface opencode` to install
the shared core. Once the dispatchers exist, their own fail posture takes over:
transient payload errors fail open (exit 0), while a missing core lib fails
loud-and-safe (exit 2 → block) so a broken install surfaces as a recoverable
refusal rather than silent loss of enforcement.

## This pack is a starting point, not an end state

CAWS cannot anticipate every situation your repository will run into as it
grows. The shipped hook pack is the **governance floor** — a baseline you start
from and grow as your project matures. The division of authority is deliberate:

- **CAWS owns the WHY and the WHAT** — the hard adjudication and the mechanisms.
  _Why_ a guard exists (the failure class it prevents), and _what_ invariant it
  enforces, are CAWS's contribution. Those are the load-bearing parts you
  should not silently weaken or delete.
- **Your repo owns the HOW** — the specific behavior, thresholds, and added
  rules. These hooks are installed templates the repo is **meant to shape**:
  tune them via env (`CAWS_GOD_OBJECT_LOC`, `CAWS_LOC_DELTA_WARN_THRESHOLD`),
  add repo-specific checks, and let the governance surface evolve with the
  shape of your codebase.

There is exactly **one** edit that is out of bounds: editing a hook to
**bypass, delete, or locally weaken a guard** in order to dodge a block. That
crosses into the WHY/WHAT that CAWS owns. Growing a hook (tuning thresholds,
adding repo-specific checks, extending coverage) is the opposite of that and
needs no apology.

**Your edits are preserved — `caws init` will not clobber them.** As long as a
hook keeps its `CAWS-MANAGED-HOOK` header, an edited hook is classified as
_drift_ and `caws init` **refuses to overwrite it**. On a re-init you choose:
do nothing / `--adopt` (keep yours, the default), or `--overwrite` (pull the
upstream template).

## Activation

opencode loads plugins once at startup from `.opencode/plugins/` (and
`~/.config/opencode/plugins/`). Installing the pack mid-session does NOT
activate it until opencode is restarted. After `caws init --agent-surface
opencode`, quit and restart opencode so the shim loads. The plugin is
auto-discovered — no `opencode.json` `plugin:` entry is required.

## Managed file headers

Every managed file in this pack carries a header like:

```
# CAWS-MANAGED-HOOK
# hook_pack: opencode
# hook_pack_version: <N>
# caws_min_major: 11
# lineage_refs: <comma-separated entries>
# edit_stance: this repo OWNS and may grow this hook. ...
```

The header is what `caws init` uses to distinguish managed files (safe to
update on re-install under a documented policy) from local user files (refused
without explicit `--adopt` or `--overwrite`).
