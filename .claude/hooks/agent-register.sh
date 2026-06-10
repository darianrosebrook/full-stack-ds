#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 13
# caws_min_major: 11
# lineage_refs: 19
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# SessionStart handler — agent self-registration into the .caws/leases/
# liveness substrate (MULTI-AGENT-ACTIVITY-REGISTRY-001).
#
# Sourcing: invoked by dispatch/session_start.sh after parse-input.sh has
# populated HOOK_SESSION_ID. Reads HOOK_INPUT_JSON from stdin (unused for
# this handler beyond the parse-input contract).
#
# Behavior:
#   - Refuses to run when HOOK_SESSION_ID is empty or "unknown" (the
#     parse-input.sh fallback). A lease whose filename is "unknown.json"
#     would collide across every session that hits the same fallback.
#   - Invokes `caws agents register --session-id <id> --platform claude-code
#     --reason session_start` to write the lease through the CLI.
#   - Non-blocking. Any failure of the CLI surfaces as stderr only;
#     SessionStart never fails on hook errors.
#
# IO boundary: this script is the only place that knows about Claude Code's
# SessionStart payload. The CLI receives explicit flags and returns
# CAWS-native JSON. The hook script does not produce additionalContext
# at SessionStart — the parallel-agent surfacing happens at PreToolUse
# via agent-heartbeat.sh.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

# Refuse on empty/unknown session id. Writing a lease at "unknown.json"
# would collide across every session that hits the parse-input fallback.
if [[ -z "${HOOK_SESSION_ID:-}" || "$HOOK_SESSION_ID" == "unknown" ]]; then
  exit 0
fi

# Locate caws binary. Prefer a project-local install (consistent with the
# repo's installed CLI version); fall back to PATH.
CAWS_BIN="${CAWS_BIN:-caws}"
if ! command -v "$CAWS_BIN" >/dev/null 2>&1; then
  # No CAWS binary on PATH — silent skip. Liveness is best-effort.
  exit 0
fi

# Invoke register. Send stderr to a buffer; we may want to attribute it
# in dispatcher output (prefixed by run-handlers).
"$CAWS_BIN" agents register \
  --session-id "$HOOK_SESSION_ID" \
  --platform claude-code \
  --reason session_start \
  >/dev/null 2>&1 || true

# Never block SessionStart.
exit 0
