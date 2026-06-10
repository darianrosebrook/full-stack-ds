#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 13
# caws_min_major: 11
# lineage_refs: 27
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# Plan Transcript Snapshot — capture conversation context at the moment
# the agent presents a plan via ExitPlanMode.
#
# Wired into: PostToolUse with matcher "ExitPlanMode" (self-filters on
# $HOOK_TOOL_NAME at the top).
#
# At hook time:
#   - The agent has finished building the plan (Write/Edit calls done).
#   - ExitPlanMode has just been called to present the plan to the user.
#   - The transcript at $TRANSCRIPT_PATH contains everything up to this
#     moment: exploration, design, tool results, the plan-write itself,
#     and the ExitPlanMode tool_use record.
#   - The user's approval/rejection and any subsequent reasoning are NOT
#     yet in the transcript — those come later in the turn and are
#     captured by plan-transcript-finalize.sh on Stop.
#
# Output:
#   - <plan-path>.transcript.jsonl  — co-located transcript snapshot.
#   - $HOME/.claude/.pending-plan-snapshots — newline-separated list of
#     snapshot paths awaiting Stop-hook finalization (overwrite with
#     the final transcript at turn end).
#
# Privacy note: The transcript is unfiltered. It includes Bash command
# outputs, Read results, and any content that crossed the conversation.
# Sharing the .transcript.jsonl file is equivalent to sharing your full
# session for the turns leading up to the plan. Treat accordingly.
#
# Companion: plan-transcript-finalize.sh (Stop hook) drains the pending
# list and finalizes each snapshot with the turn-end transcript.
# Promoted from Sterling per CAWS-HOOK-PACK-PROMOTE-001.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

# Hook gates — bail silently if anything is wrong rather than fail visibly.
# A snapshot hook should never block the agent's flow.
TOOL_NAME="$HOOK_TOOL_NAME"
[ "$TOOL_NAME" = "ExitPlanMode" ] || exit 0

TRANSCRIPT_PATH="$HOOK_TRANSCRIPT_PATH"
[ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ] || exit 0

# Find the most recent plan file Write in the transcript. The transcript
# is a JSONL stream of conversation events; grep is cheaper and more
# robust than jq for this lookup since field nesting can vary across
# Claude Code versions. Match: "file_path":"/.../.claude/plans/<name>.md"
#
# `|| true` swallows grep's exit-1 on no-match so set -e doesn't abort
# the script before our bail-out check runs.
PLAN_FILE=$(grep -oE '"file_path":"[^"]*/\.claude/plans/[^"]*\.md"' "$TRANSCRIPT_PATH" 2>/dev/null \
    | tail -1 \
    | sed -E 's/^"file_path":"//; s/"$//' \
    || true)

[ -n "$PLAN_FILE" ] && [ -f "$PLAN_FILE" ] || exit 0

# Snapshot at this moment (plan finalized + presented).
SNAPSHOT="${PLAN_FILE%.md}.transcript.jsonl"
cp "$TRANSCRIPT_PATH" "$SNAPSHOT" 2>/dev/null || exit 0

# Mark for Stop-hook finalization. The finalize hook will overwrite the
# snapshot with the FINAL turn-end transcript (which includes user
# approval, any subsequent reasoning, and the rest of the turn).
PENDING="$HOME/.claude/.pending-plan-snapshots"
mkdir -p "$(dirname "$PENDING")" 2>/dev/null || true

# Idempotent append: don't duplicate if already pending. Multiple
# ExitPlanMode calls in one session targeting the same plan file
# overwrite the snapshot but only register the snapshot path once.
if [ ! -f "$PENDING" ] || ! grep -qxF "$SNAPSHOT" "$PENDING" 2>/dev/null; then
    echo "$SNAPSHOT" >> "$PENDING"
fi

exit 0
