#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 15
# caws_min_major: 11
# lineage_refs: 28
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS God-Object Advisory Check (QG-HOOKS-EXTRACT-001)
#
# Advisory-only PostToolUse hook firing on Write/Edit. Flags source files
# whose source-lines-of-code (SLOC) exceed a configurable threshold, the
# edit-time analogue of the quality-gates `god_object` gate
# (packages/quality-gates/check-god-objects.mjs, which classifies at
# warning=1750/critical=2000/severe=3000 SLOC). This hook uses a single
# configurable warn threshold (default 2000, the critical tier) for advisory
# simplicity — it NEVER blocks, NEVER mutates, and does NOT import or invoke
# any quality-gates module. It re-implements the intent (large modules are a
# refactoring signal) in self-contained bash.
#
# SLOC = non-blank, non-comment lines. The counter is deliberately simple
# (strips // and # line comments and blank lines); it is an advisory signal,
# not a precise multi-language SLOC engine.
#
# env:
#   CAWS_GOD_OBJECT_LOC   warn threshold in SLOC (default 2000)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
# shellcheck source=lib/emit.sh
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
parse_hook_input || exit 0

FILE_PATH="$HOOK_FILE_PATH"
TOOL_NAME="$HOOK_TOOL_NAME"

# Only act on file-mutating tools.
case "$TOOL_NAME" in
  Write | Edit) ;;
  *) exit 0 ;;
esac

[[ -z "$FILE_PATH" ]] && exit 0

# Skip generated / vendored / build output. Advisory hooks must never fire
# on files the agent did not author.
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

# Only inspect real source files. If the file doesn't exist on disk (e.g. the
# tool payload races the hook), exit silently.
[[ -f "$FILE_PATH" ]] || exit 0

THRESHOLD="${CAWS_GOD_OBJECT_LOC:-2000}"
# Defensive: a non-numeric override falls back to the default.
[[ "$THRESHOLD" =~ ^[0-9]+$ ]] || THRESHOLD=2000

# SLOC: drop blank lines and whole-line // or # comments. awk is single-pass
# and bounded to this one file (no whole-repo scan).
SLOC=$(awk '
  {
    line = $0
    sub(/^[ \t]+/, "", line)        # left-trim
    if (line == "") next            # blank
    if (line ~ /^\/\//) next        # // comment
    if (line ~ /^#/) next           # # comment (sh/py/yaml)
    if (line ~ /^\*/) next          # block-comment continuation
    if (line ~ /^\/\*/) next        # /* comment open
    count++
  }
  END { print count + 0 }
' "$FILE_PATH" 2>/dev/null || echo 0)

[[ "$SLOC" =~ ^[0-9]+$ ]] || exit 0

if (( SLOC >= THRESHOLD )); then
  REL="$FILE_PATH"
  MSG="God-object advisory: ${REL} is ${SLOC} SLOC (>= ${THRESHOLD} threshold). Large single-responsibility-overloaded modules are hard to test and review. Consider splitting it into focused units. (Advisory only — set CAWS_GOD_OBJECT_LOC to tune; this never blocks.)"
  # PostToolUse advisory: surface via additionalContext, exit 0.
  emit_additional_context "$MSG" "PostToolUse"
fi

exit 0
