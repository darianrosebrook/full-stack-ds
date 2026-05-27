#!/bin/bash
# Session Logger for Claude Code — lean structured session capture.
#
# Canonical artifacts:
#   session.json       — session index + aggregated refs + git snapshot
#   turn-001.json      — per-turn detailed timeline
#   handoff.json       — compact continuation view for follow-on agents
#   session.txt        — human-readable summary pointing at the JSON artifacts
#
# Output: ./tmp/<session-id>/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

SESSION_ID="$HOOK_SESSION_ID"
HOOK_EVENT="${HOOK_EVENT_NAME:-unknown}"
CWD="${HOOK_CWD:-.}"
TRANSCRIPT_PATH="$HOOK_TRANSCRIPT_PATH"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

LOG_DIR="${CWD}/tmp/${SESSION_ID}"
mkdir -p "$LOG_DIR"

META_FILE="$LOG_DIR/.meta.json"
RENDERER="$SCRIPT_DIR/session_log_renderer.py"

resolve_transcript() {
  if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
    printf '%s\n' "$TRANSCRIPT_PATH"
    return
  fi

  local slug candidate
  slug=$(echo "$CWD" | sed 's|/|-|g; s|^-||')

  candidate="$HOME/.claude/projects/${slug}/${SESSION_ID}.jsonl"
  if [[ -f "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return
  fi

  candidate="$HOME/.claude/projects/-${slug}/${SESSION_ID}.jsonl"
  if [[ -f "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return
  fi

  printf '\n'
}

render_session_output() {
  local transcript="$1"
  local branch head_sha dirty_count started_at model start_sha

  if cd "$CWD" 2>/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    head_sha=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    dirty_count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  else
    branch="unknown"
    head_sha="unknown"
    dirty_count="0"
  fi

  if [[ -f "$META_FILE" ]]; then
    started_at=$(jq -r '.local_time // "unknown"' "$META_FILE")
    model=$(jq -r '.model // "unknown"' "$META_FILE")
    start_sha=$(jq -r '.head_sha // ""' "$META_FILE")
  else
    started_at="(resumed session)"
    model="unknown"
    start_sha=""
  fi

  python3 "$RENDERER" \
    "$LOG_DIR" \
    "$CWD" \
    "$SESSION_ID" \
    "$started_at" \
    "$model" \
    "$branch" \
    "$head_sha" \
    "$dirty_count" \
    "$start_sha" \
    "$transcript"
}

handle_session_start() {
  local model source branch head_sha dirty_count full_time
  model="${HOOK_MODEL:-unknown}"
  source="${HOOK_SOURCE:-unknown}"
  if cd "$CWD" 2>/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    head_sha=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    dirty_count=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  else
    branch="unknown"
    head_sha="unknown"
    dirty_count="0"
  fi
  full_time=$(date +"%Y-%m-%d %H:%M:%S %Z")

  jq -cn \
    --arg sid "$SESSION_ID" \
    --arg ts "$TIMESTAMP" \
    --arg lt "$full_time" \
    --arg model "$model" \
    --arg source "$source" \
    --arg branch "$branch" \
    --arg head "$head_sha" \
    --arg dirty "$dirty_count" \
    --arg project "$(basename "$CWD")" \
    --arg transcript "$TRANSCRIPT_PATH" \
    '{session_id: $sid, started_at: $ts, local_time: $lt, model: $model, source: $source, branch: $branch, head_sha: $head, dirty_files: $dirty, project: $project, transcript_path: $transcript}' \
    > "$META_FILE"

  render_session_output "$(resolve_transcript)"
}

handle_stop() {
  render_session_output "$(resolve_transcript)"
}

handle_pre_compact() {
  render_session_output "$(resolve_transcript)"
}

is_plan_file_path() {
  local file_path
  file_path="${1:-}"

  [[ -n "$file_path" ]] || return 1

  case "$file_path" in
    "$HOME"/.claude/plans/*.md|*/.claude/plans/*.md)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

handle_post_tool_use() {
  local tool_name file_path
  tool_name="$HOOK_TOOL_NAME"
  file_path="${HOOK_FILE_PATH:-}"
  case "$tool_name" in
    Write|Edit)
      if is_plan_file_path "$file_path"; then
        render_session_output "$(resolve_transcript)"
      fi
      ;;
    ExitPlanMode)
      render_session_output "$(resolve_transcript)"
      ;;
    *)
      ;;
  esac
}

case "$HOOK_EVENT" in
  SessionStart) handle_session_start ;;
  Stop) handle_stop ;;
  PreCompact) handle_pre_compact ;;
  PostToolUse) handle_post_tool_use ;;
  *) ;;
esac

exit 0
