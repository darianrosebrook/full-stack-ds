#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 22
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CWD Guard — prevents session crash when working directory is removed
# Mitigates: https://github.com/anthropics/claude-code/issues/34344
#
# When a worktree directory is deleted while Claude is operating inside it,
# any filesystem tool call crashes the session. This hook detects the missing
# CWD before the tool executes and blocks with a recovery suggestion.
#
# Promoted from Sterling per CAWS-HOOK-PACK-PROMOTE-001 +
# docs/reports/sterling_hook_port_audit_001.md.

# Check if CWD still exists on disk
if [ ! -d "$(pwd 2>/dev/null)" ] 2>/dev/null; then
  # Try to find the repo root for a helpful recovery message
  REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$HOME")

  echo "BLOCKED: Working directory no longer exists (likely a removed worktree)." >&2
  echo "" >&2
  echo "Recovery: run 'cd $REPO_ROOT' to return to the repo root." >&2
  exit 2
fi

exit 0
