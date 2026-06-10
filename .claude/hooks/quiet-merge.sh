#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 15
# caws_min_major: 11
# lineage_refs: 22,26
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
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
# IMPORTANT: This hook MUST be the last PreToolUse hook for Bash commands
# that intercepts input. It emits updatedInput which replaces any prior
# hook's updatedInput. Order in dispatch/pre_tool_use.sh: after the
# blocking guards (so a real refusal still fires), before scan-secrets
# (which is advisory-only and emits additionalContext, not updatedInput).
#
# Promoted from Sterling per CAWS-HOOK-PACK-PROMOTE-001 and
# docs/reports/sterling_hook_port_audit_001.md. Companion to cwd-guard.sh
# (entry 22) for the worktree-destroyed-while-inside class.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/caws-state.sh
# Provides resolve_canonical_dir (HOOK-LIB-CONSOLIDATION-001 T2a).
source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || true
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Only intercept Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Resolve repo root (may differ from CLAUDE_PROJECT_DIR in worktrees).
# Shared helper — HOOK-LIB-CONSOLIDATION-001 T2a.
PROJECT_DIR="$(resolve_canonical_dir "${CLAUDE_PROJECT_DIR:-.}")"

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
