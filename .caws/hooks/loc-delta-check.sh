#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 31
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
#
# CAWS LOC-Delta Check
#
# Advisory: on Edit, flags an added-line delta over
# CAWS_LOC_DELTA_WARN_THRESHOLD (default 300) via the new_string/old_string
# payload diff. Always exit 0.

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
THRESHOLD="${CAWS_LOC_DELTA_WARN_THRESHOLD:-300}"

[[ "$TOOL_NAME" == "Edit" ]] || exit 0
[[ -z "$FILE_PATH" ]] && exit 0

# Skip generated / vendored / build output — a large edit to those is not a
# review-burden signal. Matches the dir-skip convention shared by
# god-object-check.sh, duplicate-export-check.sh, and shortcut-language-check.sh.
case "$FILE_PATH" in
  */node_modules/*|*/dist/*|*/build/*|*/coverage/*) exit 0 ;;
esac

if [[ -n "${HOOK_TOOL_INPUT_JSON:-}" ]] && command -v jq >/dev/null 2>&1; then
  NEW_STRING=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '.new_string // empty' 2>/dev/null || true)
  OLD_STRING=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '.old_string // empty' 2>/dev/null || true)

  if [[ -n "$NEW_STRING" ]] && [[ -n "$OLD_STRING" ]]; then
    NEW_LINES=$(printf '%s' "$NEW_STRING" | wc -l | tr -d ' ')
    OLD_LINES=$(printf '%s' "$OLD_STRING" | wc -l | tr -d ' ')
    DELTA=$(( NEW_LINES - OLD_LINES ))

    if [[ "$DELTA" -gt "$THRESHOLD" ]]; then
      MSG="loc-delta-check: this Edit added ~${DELTA} lines to '$(basename "$FILE_PATH")' (threshold: ${THRESHOLD}). Large single edits are harder to review. Consider breaking the change into smaller logical steps. (Advisory — allowed. Set CAWS_LOC_DELTA_WARN_THRESHOLD to adjust.)"
      emit_additional_context "$MSG" "PostToolUse"
    fi
  fi
fi

exit 0
