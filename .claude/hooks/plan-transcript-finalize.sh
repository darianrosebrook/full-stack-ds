#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 13
# caws_min_major: 11
# lineage_refs: 27
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# Plan Transcript Finalize — overwrite each pending plan-transcript
# snapshot with the final turn-end transcript.
#
# Wired into: Stop dispatch.
#
# At hook time:
#   - The agent's turn is ending. The transcript at $TRANSCRIPT_PATH
#     now includes everything that happened: the agent's plan,
#     ExitPlanMode presentation, user approval/rejection, and any
#     subsequent reasoning or tool calls.
#   - $HOME/.claude/.pending-plan-snapshots lists snapshot paths that
#     plan-transcript-snapshot.sh registered earlier in this turn.
#   - For each pending snapshot, overwrite with the final transcript
#     so the file co-located next to the plan represents the FULL
#     conversation context that produced + reviewed the plan.
#   - Drain the pending list (the snapshots are now finalized; future
#     plan presentations in future turns get fresh entries).
#
# Idempotency: this hook is safe to run multiple times. If the pending
# list is empty or doesn't exist, the hook is a no-op.
#
# Companion: plan-transcript-snapshot.sh (PostToolUse on ExitPlanMode)
# is the producer. Both ship together per CAWS-HOOK-PACK-PROMOTE-001.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

TRANSCRIPT_PATH="$HOOK_TRANSCRIPT_PATH"
[ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ] || exit 0

PENDING="$HOME/.claude/.pending-plan-snapshots"
[ -f "$PENDING" ] || exit 0

# Process each pending snapshot. Order doesn't matter — each is just
# a file copy. Skip empty lines defensively.
while IFS= read -r snapshot; do
    [ -z "$snapshot" ] && continue
    snapshot_dir=$(dirname "$snapshot")
    [ -d "$snapshot_dir" ] || continue
    cp "$TRANSCRIPT_PATH" "$snapshot" 2>/dev/null || true
done < "$PENDING"

# Drain the pending list. New ExitPlanMode calls in subsequent turns
# will re-populate it via plan-transcript-snapshot.sh.
> "$PENDING" 2>/dev/null || true

exit 0
