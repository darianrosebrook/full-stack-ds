#!/bin/bash
# SessionStart dispatcher for Claude Code hooks.
#
# Fires once per session. Same fan-out semantics as pre_tool_use.sh and
# post_tool_use.sh: reads stdin once, exports HOOK_* env vars, invokes
# each registered handler with stdin piped and stderr prefixed.
#
# HANDLERS entries may carry a positional argument (e.g. "audit.sh
# session-start" -- audit.sh's event type is an argv, not a field in
# the stdin payload). Entries are split on whitespace and passed as argv.
#
# SessionStart semantics: these hooks inform the agent about session
# state (CAWS briefing, audit log bootstrap, session-log meta file).
# None should block. Exit 2 is treated the same as exit 1 here --
# recorded as max_exit but does not short-circuit.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")"

# shellcheck source=../lib/parse-input.sh
source "$HOOKS_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

# shellcheck source=../lib/run-handlers.sh
source "$HOOKS_DIR/lib/run-handlers.sh" 2>/dev/null || exit 0

HANDLERS=(
  "audit.sh session-start"
  "session-caws-status.sh session-start"
  "session-log.sh"
)

run_handlers "${HANDLERS[@]}"
