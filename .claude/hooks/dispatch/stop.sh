#!/bin/bash
# Stop dispatcher for Claude Code hooks.
#
# Fires at end of session. Same fan-out semantics as the other dispatchers.
# Handlers here finalize session artifacts: audit log closeout, worktree
# cleanup reminder, plan-transcript finalize, session-log handoff.
#
# Stop semantics: none of these handlers should block the user -- the
# session is already ending. All non-zero exits are treated as warnings;
# max_exit is reported but no handler short-circuits the chain.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")"

# shellcheck source=../lib/parse-input.sh
source "$HOOKS_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

# shellcheck source=../lib/run-handlers.sh
source "$HOOKS_DIR/lib/run-handlers.sh" 2>/dev/null || exit 0

HANDLERS=(
  "audit.sh stop"
  "stop-worktree-check.sh"
  "plan-transcript-finalize.sh"
  "session-log.sh"
)

run_handlers "${HANDLERS[@]}"
