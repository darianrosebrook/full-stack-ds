#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 11
# caws_min_major: 11
# lineage_refs: 8,16,23
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS Protected Paths Guard for Claude Code
#
# Blocks direct Write/Edit access to:
#   - hook scripts under .claude/hooks/* (no agent-side hook editing)
#   - strike-state files .claude/logs/guard-strikes-*.json (no manual
#     manipulation of progressive-strike counters)
#
# This is the structural enforcement of the doctrine that hooks
# "may not be removed or weakened by an agent's local judgment"
# (templates/hook-packs/claude-code/CLAUDE.md). Promoted from Sterling
# per CAWS-HOOK-PACK-PROMOTE-001.
#
# If you are reading this because a write was blocked, do not edit
# hook files or strike-state files to bypass a guard. Switch into the
# correct worktree, fix the active spec scope, or ask the user if the
# guard itself is wrong.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

case "$HOOK_TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

if [[ -z "$HOOK_FILE_PATH" ]]; then
  exit 0
fi

case "$HOOK_FILE_PATH" in
  */.claude/hooks/*)
    echo "BLOCKED: $HOOK_FILE_PATH is protected." >&2
    echo "Ask the user for permission before editing Claude hook scripts." >&2
    exit 1
    ;;
  */.claude/logs/guard-strikes-*.json)
    echo "BLOCKED: $HOOK_FILE_PATH is protected guard state." >&2
    echo "Do not edit strike counters by hand to bypass enforcement." >&2
    echo "If the scope was legitimately corrected and prior strikes are stale, ask the user to run:" >&2
    echo "  bash .claude/hooks/reset-strikes.sh --current" >&2
    echo "(or --session <uuid> / --worktree <name> / --all --confirm; resets are logged)." >&2
    echo "Otherwise switch into the correct worktree, update the active CAWS spec scope, or ask the user for direction." >&2
    exit 2
    ;;
esac

exit 0
