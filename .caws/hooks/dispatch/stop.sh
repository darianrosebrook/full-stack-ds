#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 10,19,27
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
# Stop dispatcher — shared core (surface-neutral).
#
# Fires at end of session. Same fan-out semantics as the other dispatchers.
# Handlers here finalize session artifacts: audit log closeout, worktree
# cleanup reminder, plan-transcript finalize, session-log handoff.
#
# Stop semantics: none of these handlers should block the user — the
# session is already ending. All non-zero exits are treated as warnings;
# max_exit is reported but no handler short-circuits the chain.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")"

# Export shared lib dir so caws_source_lib knows the shared fallback.
export CAWS_SHARED_LIB_DIR="$HOOKS_DIR/lib"

# Resolve surface-specific env (CAWS_VENDOR_DIR, CAWS_LOG_DIR, etc.)
# Also defines caws_source_lib used below.
# shellcheck source=../lib/agent-surface.sh
source "$HOOKS_DIR/lib/agent-surface.sh" 2>/dev/null || true

# shellcheck source=../lib/parse-input.sh
caws_source_lib parse-input.sh 2>/dev/null || exit 0
parse_hook_input || exit 0

# shellcheck source=../lib/run-handlers.sh
caws_source_lib run-handlers.sh 2>/dev/null || exit 0

HANDLERS=(
  # "audit.sh stop"
  # "stop-worktree-check.sh"
  "plan-transcript-finalize.sh"
  "session-log.sh"
  # MULTI-AGENT-ACTIVITY-REGISTRY-001: mark our lease as stopped so other
  # sessions can distinguish "stopped cleanly" from "went stale and is
  # presumed dead." Non-blocking; refuses silently when HOOK_SESSION_ID
  # is empty or "unknown".
  "agent-stop.sh"
)

run_handlers "${HANDLERS[@]}"
