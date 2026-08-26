#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 47
# caws_min_major: 11
# lineage_refs: 19
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
#
# Stop handler — marks the current session's lease stopped via
# `caws agents stop` (MULTI-AGENT-ACTIVITY-REGISTRY-001).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
# shellcheck source=lib/agent-surface.sh
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true
parse_hook_input || exit 0

if [[ -z "${HOOK_SESSION_ID:-}" || "$HOOK_SESSION_ID" == "unknown" ]]; then
  exit 0
fi

CAWS_BIN="${CAWS_BIN:-caws}"
if ! command -v "$CAWS_BIN" >/dev/null 2>&1; then
  exit 0
fi

caws_run_cli agents stop \
  --session-id "$HOOK_SESSION_ID" \
  --platform "$CAWS_PLATFORM_FLAG" \
  2>/dev/null || true

exit 0
