#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 10,11,19
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
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
  # "session-caws-status.sh session-start"
  "session-log.sh"
  # MULTI-AGENT-ACTIVITY-REGISTRY-001: self-register into the leases
  # substrate so other sessions can see this one. Non-blocking; refuses
  # silently when HOOK_SESSION_ID is empty or "unknown".
  "agent-register.sh"
)

run_handlers "${HANDLERS[@]}"
