#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 8,11,17,19,22,23,24,26
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# PreToolUse dispatcher for Claude Code hooks.
#
# Single entry point invoked from settings.json's PreToolUse block. Reads
# stdin ONCE, sanitizes it via lib/parse-input.sh, then invokes every
# registered handler with HOOK_* env vars inherited and the sanitized
# JSON piped to each handler's stdin.
#
# Handlers self-filter via their own matcher predicate (a case statement
# on $HOOK_TOOL_NAME at the top of the script).
#
# Exit-code aggregation:
#   - First handler exiting 2 short-circuits the remaining handlers and
#     the dispatcher returns 2 (blocking).
#   - Non-zero non-2 exits are warnings; the dispatcher continues and
#     returns the max non-2 code at the end.
#
# Fail-open: if the dispatcher itself errors before any handler runs
# (parser crash, missing lib), it exits 0 rather than blocking the tool.
# Guard infrastructure must not turn its own bugs into tool-call blocks.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")"

# shellcheck source=../lib/parse-input.sh
source "$HOOKS_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

# shellcheck source=../lib/run-handlers.sh
source "$HOOKS_DIR/lib/run-handlers.sh" 2>/dev/null || exit 0

# Registered handlers in execution order. Each handler self-filters
# on $HOOK_TOOL_NAME; non-matching cases return exit 0 cheaply.
#
# MULTI-AGENT-ACTIVITY-REGISTRY-001: agent-heartbeat.sh runs FIRST so the
# lease is refreshed and parallel-agent presence is surfaced even when a
# later guard short-circuits the chain with exit 2 (block). Heartbeat is
# non-blocking and never produces a "block" decision — its stdout is a
# Claude-Code additionalContext envelope (priority 1), so it does not
# outrank a real block from scope-guard / worktree-guard. The dispatcher's
# stdout-priority logic ensures a block from a later handler still wins.
HANDLERS=(
  agent-heartbeat.sh
  cwd-guard.sh
  block-dangerous.sh
  worktree-guard.sh
  scope-guard.sh
  worktree-write-guard.sh
  # WORKTREE-ISOLATION-HARDENING-001 (Fix 3): Bash mutation target authority.
  # Self-filters to Bash; extracts write targets for a narrow set of mutation
  # forms (redirection, tee, sed -i, rm/mv/cp, git restore, ...) and routes each
  # through the same worktree-claim-oracle as worktree-write-guard, so a Bash
  # mutation of a foreign worktree's payload blocks at the same boundary as a
  # foreign Write/Edit. Runs after worktree-write-guard (file-tool authority)
  # since the two cover disjoint tool surfaces.
  bash-write-guard.sh
  protected-paths.sh
  scan-secrets.sh
  # quiet-merge.sh MUST be the last interceptor: it emits
  # updatedInput which replaces any prior hook's updatedInput.
  # The hook itself self-filters to Bash + caws worktree merge|destroy
  # so non-matching tool calls are cheap exits.
  quiet-merge.sh
)

run_handlers --short-circuit-on-block "${HANDLERS[@]}"
