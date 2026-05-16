#!/bin/bash
# Quiet merge hook: suppress verbose output AND fix CWD safety
#
# Two problems solved:
# 1. `caws worktree merge` produces verbose output that can overflow context.
# 2. When a subagent's CWD is inside the worktree being destroyed, the process
#    loses its CWD and crashes (posix_spawn ENOENT on PostToolUse hooks).
#
# The fix: rewrite merge/destroy commands to:
#   cd <repo-root> && <command> 2>/dev/null | tail -3
# This moves CWD to safety BEFORE the directory is destroyed, and suppresses
# verbose output.
#
# IMPORTANT: This hook MUST be the last PreToolUse hook for Bash commands.
# It emits updatedInput which replaces any prior hook's updatedInput.
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Only intercept Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Resolve repo root (may differ from CLAUDE_PROJECT_DIR in worktrees)
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
if command -v git >/dev/null 2>&1; then
  GIT_COMMON_DIR=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
  if [[ -n "$GIT_COMMON_DIR" ]] && [[ "$GIT_COMMON_DIR" != ".git" ]]; then
    CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON_DIR/.." 2>/dev/null && pwd || echo "")
    if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
      PROJECT_DIR="$CANDIDATE"
    fi
  fi
fi

# Match: caws worktree merge|destroy <name> [options]
# Skip if already piped/redirected (user already handling output)
if echo "$COMMAND" | grep -qE 'caws\s+worktree\s+(merge|destroy)\b' && ! echo "$COMMAND" | grep -qE '[|>]'; then
  # Always prepend cd to repo root for CWD safety (critical for subagents
  # whose CWD is inside the worktree being destroyed)
  QUIET_CMD="cd \"$PROJECT_DIR\" && $COMMAND 2>/dev/null | tail -3; echo '---'; git log --oneline -1"
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","updatedInput":{"command":%s}}}' "$(printf '%s' "$QUIET_CMD" | jq -Rs .)"
  exit 0
fi

exit 0
