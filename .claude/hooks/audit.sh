#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 11
# caws_min_major: 11
# lineage_refs: 9
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
# CAWS Audit Hook for Claude Code
# Logs agent actions for compliance and debugging
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"

# --- CWD resilience ---
# PostToolUse hooks fire AFTER the command runs. If the command destroyed
# the working directory (e.g., caws worktree merge deletes the worktree),
# the hook process inherits a nonexistent CWD and most commands will fail.
# Recover to a safe directory before doing anything else.
if ! pwd >/dev/null 2>&1 || [ ! -d "$(pwd 2>/dev/null || echo __gone__)" ]; then
  cd "${CLAUDE_PROJECT_DIR:-$HOME}" 2>/dev/null || cd "$HOME"
fi

parse_hook_input

# Get event type from argument or input
EVENT_TYPE="${1:-tool-use}"

# Back-compat aliases. HOOK_CWD can be "" when stdin lacks a cwd field;
# audit.sh always wants a non-empty placeholder so jq --arg stays happy.
SESSION_ID="$HOOK_SESSION_ID"
CWD="${HOOK_CWD:-.}"
HOOK_EVENT="${HOOK_EVENT_NAME:-unknown}"
TOOL_NAME="$HOOK_TOOL_NAME"
PERMISSION_MODE="$HOOK_PERMISSION_MODE"

# Ensure log directory exists
LOG_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/logs"
mkdir -p "$LOG_DIR"

# Log file path
LOG_FILE="$LOG_DIR/audit.log"
DATE_LOG_FILE="$LOG_DIR/audit-$(date +%Y-%m-%d).log"

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build log entry based on event type
case "$EVENT_TYPE" in
  session-start)
    SOURCE="${HOOK_SOURCE:-unknown}"
    MODEL="${HOOK_MODEL:-unknown}"
    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "session_start" \
      --arg source "$SOURCE" \
      --arg model "$MODEL" \
      --arg cwd "$CWD" \
      '{timestamp: $ts, session_id: $sid, event: $event, source: $source, model: $model, cwd: $cwd}')
    ;;

  stop)
    # HOOK_STOP_HOOK_ACTIVE is "0" or "1"; jq --argjson needs true/false.
    if [[ "$HOOK_STOP_HOOK_ACTIVE" == "1" ]]; then
      STOP_HOOK_ACTIVE="true"
    else
      STOP_HOOK_ACTIVE="false"
    fi
    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "session_stop" \
      --arg cwd "$CWD" \
      --argjson hook_active "$STOP_HOOK_ACTIVE" \
      '{timestamp: $ts, session_id: $sid, event: $event, cwd: $cwd, stop_hook_active: $hook_active}')
    ;;

  tool-use)
    # Tool-specific info lifted from HOOK_* env vars set by parse_hook_input.
    # HOOK_TOOL_INPUT_JSON and HOOK_TOOL_RESPONSE_JSON are pre-serialized
    # JSON strings, always valid (empty "{}" at minimum), so jq --argjson
    # below never trips on missing fields.
    TOOL_INPUT="$HOOK_TOOL_INPUT_JSON"
    TOOL_RESPONSE="$HOOK_TOOL_RESPONSE_JSON"
    TOOL_USE_ID="$HOOK_TOOL_USE_ID"
    FILE_PATH="$HOOK_FILE_PATH"
    COMMAND="$HOOK_COMMAND"

    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "tool_use" \
      --arg tool "$TOOL_NAME" \
      --arg file "$FILE_PATH" \
      --arg cmd "$COMMAND" \
      --arg cwd "$CWD" \
      --arg mode "$PERMISSION_MODE" \
      '{timestamp: $ts, session_id: $sid, event: $event, tool: $tool, file: $file, command: $cmd, cwd: $cwd, permission_mode: $mode}')
    ;;

  *)
    LOG_ENTRY=$(jq -n \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg event "$EVENT_TYPE" \
      --arg hook "$HOOK_EVENT" \
      --arg cwd "$CWD" \
      '{timestamp: $ts, session_id: $sid, event: $event, hook_event: $hook, cwd: $cwd}')
    ;;
esac

# Append to log files
echo "$LOG_ENTRY" >> "$LOG_FILE"
echo "$LOG_ENTRY" >> "$DATE_LOG_FILE"

# Success - allow operation to continue
exit 0
