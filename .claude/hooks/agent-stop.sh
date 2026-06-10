#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 19
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# Stop handler — marks the current session's lease as stopped on clean
# session exit (MULTI-AGENT-ACTIVITY-REGISTRY-001).
#
# Sourcing: invoked by dispatch/stop.sh after parse-input.sh has populated
# HOOK_SESSION_ID.
#
# Behavior:
#   - Refuses on empty/unknown HOOK_SESSION_ID.
#   - Invokes `caws agents stop --session-id <id> --platform claude-code`
#     which writes a mark_stopped LeasePatch (status: stopped, stopped_at
#     timestamp). The lease file is preserved as evidence; hard deletion
#     happens only via explicit `caws agents prune`.
#   - Non-blocking. Stop semantics already require all handlers to be
#     best-effort; a Stop failure is a warn, not a block.
#
# Note: Stop is NOT a guaranteed signal. A SIGKILL'd or crashed Claude
# Code session never reaches Stop. The primary liveness mechanism is
# heartbeat — Stop is the clean-exit optimization that lets observers
# distinguish "stopped cleanly" from "went stale and is presumed dead."

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

if [[ -z "${HOOK_SESSION_ID:-}" || "$HOOK_SESSION_ID" == "unknown" ]]; then
  exit 0
fi

CAWS_BIN="${CAWS_BIN:-caws}"
if ! command -v "$CAWS_BIN" >/dev/null 2>&1; then
  exit 0
fi

"$CAWS_BIN" agents stop \
  --session-id "$HOOK_SESSION_ID" \
  --platform claude-code \
  >/dev/null 2>&1 || true

exit 0
