#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 13
# caws_min_major: 11
# lineage_refs: 31
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS LOC-Delta Advisory Check (QG-HOOKS-EXTRACT-001)
#
# Advisory-only PostToolUse hook firing on Edit. Flags a single edit that adds
# more than a configurable number of lines to one file — a refactoring-budget
# signal (CLAUDE.md "Ask first for risky changes ... >300 LOC"). It NEVER
# blocks, NEVER mutates, and does not depend on any quality-gates module.
#
# Delta source (priority order):
#   1. Edit payload — newline-count(new_string) - newline-count(old_string).
#      Exact, synchronous, works on untracked files and in worktrees where a
#      git diff would be misleading. This is the primary source.
#   2. If the payload lacks old_string/new_string (e.g. a Write or a multi-edit
#      batch shape this hook doesn't model), exit 0 silently — an advisory
#      hook must never produce a false positive from missing data.
#
# env:
#   CAWS_LOC_DELTA_WARN_THRESHOLD   added-line threshold (default 300)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
# shellcheck source=lib/emit.sh
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
parse_hook_input || exit 0

FILE_PATH="$HOOK_FILE_PATH"
TOOL_NAME="$HOOK_TOOL_NAME"

# Edit only — the LOC-delta signal is about growing an existing file.
[[ "$TOOL_NAME" != "Edit" ]] && exit 0
[[ -z "$FILE_PATH" ]] && exit 0

# Skip generated / vendored / build output.
case "$FILE_PATH" in
  */node_modules/* | */dist/* | */build/* | */coverage/* | */.next/* | */out/* | */vendor/*)
    exit 0
    ;;
esac
case "$(basename "$FILE_PATH")" in
  *.min.js | *.bundle.js | *.map | *.lock | *-lock.json | package-lock.json)
    exit 0
    ;;
esac

THRESHOLD="${CAWS_LOC_DELTA_WARN_THRESHOLD:-300}"
[[ "$THRESHOLD" =~ ^[0-9]+$ ]] || THRESHOLD=300

# Need jq + the payload to read old_string/new_string.
command -v jq >/dev/null 2>&1 || exit 0
[[ -n "${HOOK_TOOL_INPUT_JSON:-}" ]] || exit 0

# Presence check: only proceed if BOTH fields exist in the payload. A missing
# field => exit silently (priority-2 rule: no false positives from missing data).
HAS_OLD=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r 'has("old_string")' 2>/dev/null || printf 'false')
HAS_NEW=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r 'has("new_string")' 2>/dev/null || printf 'false')
[[ "$HAS_OLD" == "true" && "$HAS_NEW" == "true" ]] || exit 0

# Line counts via jq: number of lines in each string. A string with N
# newlines spans N+1 lines, but for an added-LOC delta the newline count is
# the right comparator (it counts line-breaks introduced).
OLD_LINES=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '(.old_string // "") | (. / "\n" | length) - 1' 2>/dev/null || printf '0')
NEW_LINES=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '(.new_string // "") | (. / "\n" | length) - 1' 2>/dev/null || printf '0')

# Normalize to integers; an empty string yields -1 from the formula above,
# clamp to 0.
[[ "$OLD_LINES" =~ ^-?[0-9]+$ ]] || OLD_LINES=0
[[ "$NEW_LINES" =~ ^-?[0-9]+$ ]] || NEW_LINES=0
(( OLD_LINES < 0 )) && OLD_LINES=0
(( NEW_LINES < 0 )) && NEW_LINES=0

DELTA=$(( NEW_LINES - OLD_LINES ))

if (( DELTA > THRESHOLD )); then
  MSG="LOC-delta advisory: this edit to ${FILE_PATH} adds ~${DELTA} lines (> ${THRESHOLD} threshold). Large single edits are hard to review and often signal that the change should be split into smaller, focused commits or that a new module is warranted. (Advisory only — set CAWS_LOC_DELTA_WARN_THRESHOLD to tune; this never blocks.)"
  emit_additional_context "$MSG" "PostToolUse"
fi

exit 0
