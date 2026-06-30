#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 19,27
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
#
# PreCompact dispatcher — shared core (surface-neutral).
#
# Some agent harnesses support a PreCompact event (e.g. Codex). The CAWS
# shared pack uses it as a lightweight lifecycle checkpoint: it refreshes
# the session lease and records a session-log entry, but does not block
# compaction.
#
# Claude Code routes PreCompact through a direct session-log.sh invocation
# in its settings.json (not through this dispatcher). When the vendor wiring
# moves to the shared dispatcher, both surfaces will use this file.

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
  agent-heartbeat.sh
  "session-log.sh pre-compact"
)

run_handlers "${HANDLERS[@]}"
