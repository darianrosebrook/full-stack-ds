#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 28
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
#
# CAWS God-Object Check
#
# Advisory: flags a written/edited file whose SLOC exceeds CAWS_GOD_OBJECT_LOC
# (default 2000). Edit-time analogue of the `god_object` gate. Always exit 0.
#
# HYSTERESIS (CAWS-GOD-OBJECT-CHECK-HYSTERESIS-001): the advisory fires only
# when an edit is itself SIGNAL, not on every edit to an already-over file. A
# 2-line edit that leaves a 2004-line file at 2006 is noise; re-warning on it
# trains the agent to ignore the advisory. So for an Edit, the hook warns only
# when EITHER (a) this edit CROSSES the threshold (the file was at-or-under it
# before this edit, and is over it after), OR (b) this edit adds a LARGE delta
# (>= CAWS_GOD_OBJECT_DELTA SLOC, default 100). An Edit that leaves an already-
# over file roughly the same size — or shrinks it — is silent. A Write of a
# whole file IS its own delta, so a Write warns whenever the result is over
# threshold (unchanged). The prior size is derived from the Edit payload
# (old_string/new_string), keeping the hook STATELESS — no on-disk sentinel —
# consistent with loc-delta-check.sh. Always exit 0.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/agent-surface.sh
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true
# shellcheck source=lib/emit.sh
caws_source_lib emit.sh 2>/dev/null || true
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
FILE_PATH="$HOOK_FILE_PATH"
THRESHOLD="${CAWS_GOD_OBJECT_LOC:-2000}"
DELTA_THRESHOLD="${CAWS_GOD_OBJECT_DELTA:-100}"

case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

[[ -z "$FILE_PATH" ]] && exit 0
[[ -f "$FILE_PATH" ]] || exit 0

case "$FILE_PATH" in
  */node_modules/*|*/dist/*|*/build/*|*/coverage/*) exit 0 ;;
esac

case "$FILE_PATH" in
  *.js|*.ts|*.jsx|*.tsx|*.mjs|*.cjs|*.py|*.go|*.rs|*.java|*.rb|*.php|*.c|*.cpp|*.h) ;;
  *) exit 0 ;;
esac

# Count non-blank, non-comment lines (approximate SLOC) in a file.
sloc_of_file() {
  grep -cE '^[[:space:]]*[^[:space:]#/]' "$1" 2>/dev/null || wc -l < "$1" 2>/dev/null || echo 0
}

# Count SLOC in a literal string (same heuristic, applied to stdin).
sloc_of_string() {
  printf '%s' "$1" | grep -cE '^[[:space:]]*[^[:space:]#/]' 2>/dev/null || echo 0
}

SLOC=$(sloc_of_file "$FILE_PATH")

# Below (or at) threshold after the change: never a god-object signal.
if [[ "$SLOC" -le "$THRESHOLD" ]]; then
  exit 0
fi

# Over threshold. Decide whether THIS edit is signal (hysteresis). Default to
# warning — this covers Write, and covers an Edit whose payload delta cannot be
# derived (the safe-but-noisier fallback; it never MISSES a real crossing).
SHOULD_WARN=1

if [[ "$TOOL_NAME" == "Edit" ]] \
   && [[ -n "${HOOK_TOOL_INPUT_JSON:-}" ]] \
   && command -v jq >/dev/null 2>&1; then
  NEW_STRING=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '.new_string // empty' 2>/dev/null || true)
  OLD_STRING=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '.old_string // empty' 2>/dev/null || true)

  # Only apply hysteresis when the payload carries a non-empty replacement. A
  # delete (empty new_string) or an unreadable payload falls through to the
  # default warn.
  if [[ -n "$NEW_STRING" ]]; then
    NEW_SLOC=$(sloc_of_string "$NEW_STRING")
    OLD_SLOC=$(sloc_of_string "$OLD_STRING")
    DELTA=$(( NEW_SLOC - OLD_SLOC ))
    # SLOC of the file BEFORE this edit landed.
    PRE_SLOC=$(( SLOC - DELTA ))

    # Signal iff the edit CROSSED the threshold (pre at-or-under, now over) OR
    # added a LARGE delta. Otherwise the file was already over and this edit
    # barely moved it — stay silent.
    if [[ "$PRE_SLOC" -le "$THRESHOLD" ]] || [[ "$DELTA" -ge "$DELTA_THRESHOLD" ]]; then
      SHOULD_WARN=1
    else
      SHOULD_WARN=0
    fi
  fi
fi

if [[ "$SHOULD_WARN" -eq 1 ]]; then
  MSG="god-object-check: '$(basename "$FILE_PATH")' has ~${SLOC} source lines (threshold: ${THRESHOLD}). Large files accumulate responsibilities and become hard to test. Consider splitting into focused modules. (Advisory — allowed. Set CAWS_GOD_OBJECT_LOC to adjust.)"
  emit_additional_context "$MSG" "PostToolUse"
fi

exit 0
