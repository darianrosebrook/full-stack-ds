#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 44
# caws_min_major: 11
# lineage_refs: 22,26
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
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
# Provides resolve_canonical_dir (HOOK-LIB-CONSOLIDATION-001 T2a). Guard the
# source: a fatal `source <missing>` under `set -euo pipefail` is NOT caught by
# `|| true` (CAWS-HOOK-SOURCE-GUARD-FAIL-SOFT-001). quiet-merge is a cosmetic
# output rewriter with NO block authority, so a missing lib fails SOFT but LOUD
# (diagnostic + exit 0) rather than silently dying or blocking the merge.
if ! { [[ -f "$SCRIPT_DIR/lib/caws-state.sh" ]] && source "$SCRIPT_DIR/lib/caws-state.sh"; }; then
  echo "[quiet-merge] CAWS hook infrastructure incomplete: lib/caws-state.sh is missing — merge-output quieting is skipped. Restore the shared hook libs with: caws init --adopt" >&2
  exit 0
fi
# shellcheck source=lib/agent-surface.sh
if ! { [[ -f "$SCRIPT_DIR/lib/agent-surface.sh" ]] && source "$SCRIPT_DIR/lib/agent-surface.sh"; }; then
  echo "[quiet-merge] CAWS hook infrastructure incomplete: lib/agent-surface.sh is missing — merge-output quieting is skipped. Restore the shared hook libs with: caws init --adopt" >&2
  exit 0
fi
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Only intercept Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Resolve repo root (may differ from CAWS_PROJECT_DIR in worktrees).
# Shared helper — HOOK-LIB-CONSOLIDATION-001 T2a.
PROJECT_DIR="$(resolve_canonical_dir "${CAWS_PROJECT_DIR:-.}")"

# Match: caws worktree merge|destroy <name> [options]
# Skip if already piped/redirected (user already handling output)
if echo "$COMMAND" | grep -qE 'caws\s+worktree\s+(merge|destroy)\b' && ! echo "$COMMAND" | grep -qE '[|>]'; then
  # Surfaces without an updatedInput contract (kimi-code: none documented)
  # cannot rewrite the command — pass it through unrewritten. quiet-merge is
  # an output-quieting optimization, not a guard; skipping it loses nothing.
  if [[ "${CAWS_SUPPORTS_UPDATED_INPUT:-1}" != "1" ]]; then
    exit 0
  fi
  # Always prepend cd to repo root for CWD safety (critical for subagents
  # whose CWD is inside the worktree being destroyed)
  QUIET_CMD="cd \"$PROJECT_DIR\" && $COMMAND 2>/dev/null | tail -3; echo '---'; git log --oneline -1"
  # Hosts that enforce the updatedInput contract (observed live: "PreToolUse
  # hook returned updatedInput without permissionDecision:allow") reject a
  # rewrite that carries no explicit decision. The rewrite is an allow-with-
  # modification by construction, so say so.
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"quiet-merge: rewrite merge/destroy for CWD safety and output quieting","updatedInput":{"command":%s}}}' "$(printf '%s' "$QUIET_CMD" | jq -Rs .)"
  exit 0
fi

exit 0
