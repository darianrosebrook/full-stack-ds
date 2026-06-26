#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 1
# caws_min_major: 11
# lineage_refs: 28
# do_not_edit_directly: update via `caws init`
#
# CAWS God-Object Check
#
# Advisory: flags a written/edited file whose SLOC exceeds CAWS_GOD_OBJECT_LOC
# (default 2000). Edit-time analogue of the `god_object` gate. Always exit 0.

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

# Count non-blank, non-comment lines (approximate SLOC).
SLOC=$(grep -cE '^[[:space:]]*[^[:space:]#/]' "$FILE_PATH" 2>/dev/null || wc -l < "$FILE_PATH" 2>/dev/null || echo 0)

if [[ "$SLOC" -gt "$THRESHOLD" ]]; then
  MSG="god-object-check: '$(basename "$FILE_PATH")' has ~${SLOC} source lines (threshold: ${THRESHOLD}). Large files accumulate responsibilities and become hard to test. Consider splitting into focused modules. (Advisory — allowed. Set CAWS_GOD_OBJECT_LOC to adjust.)"
  emit_additional_context "$MSG" "PostToolUse"
fi

exit 0
