#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 43
# caws_min_major: 11
# lineage_refs: 10
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
# Session Logger — lean structured session capture.
#
# Canonical artifacts:
#   session.json       — session index + aggregated refs + git snapshot
#   turn-001.json      — per-turn detailed timeline
#   handoff.json       — compact continuation view for follow-on agents
#   session.txt        — human-readable summary pointing at the JSON artifacts
#
# Output: <canonical-repo-root>/.caws/sessions/<session-id>/
# (CAWS-SESSION-LOG-RELOCATE-001: per-session state lives under .caws/sessions/
# — gitignored, provenance-adjacent — NOT repo-root tmp/, which is user-owned
# scratch that bloats and gets committed.)
#
# Transcript discovery: resolve_transcript tries the payload's
# transcript_path first, then surface-specific stores — the claude-code
# $HOME/${CAWS_VENDOR_DIR}/projects/<slug>/<sid>.jsonl layout, qwen's
# projects/<slug>/chats/ subdir (CAWS-SESSION-LOG-QWEN-001), and kimi's
# session_index.jsonl -> agents/main/wire.jsonl lookup
# (CAWS-SESSION-LOG-KIMI-001). The session output (turn-NNN.json files) is
# surface-neutral.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/agent-surface.sh
# Provides CAWS_VENDOR_DIR for transcript path construction.
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true
parse_hook_input

SESSION_ID="$HOOK_SESSION_ID"
HOOK_EVENT="${HOOK_EVENT_NAME:-unknown}"
CWD="${HOOK_CWD:-.}"
TRANSCRIPT_PATH="$HOOK_TRANSCRIPT_PATH"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Resolve the CANONICAL repo root so a linked worktree's session logs land in
# the canonical .caws/sessions/, not a per-worktree copy. git-common-dir's
# parent is the canonical checkout (for the main checkout it equals the repo
# root). Fall back to CWD if git is unavailable.
_session_canonical_root() {
  local common parent
  common=$(cd "$CWD" 2>/dev/null && git rev-parse --git-common-dir 2>/dev/null) || { printf '%s\n' "$CWD"; return; }
  [[ -z "$common" ]] && { printf '%s\n' "$CWD"; return; }
  case "$common" in
    /*) : ;;
    *)  common="$CWD/$common" ;;
  esac
  parent=$(cd "$common/.." 2>/dev/null && pwd -P) || { printf '%s\n' "$CWD"; return; }
  if [[ -n "$parent" ]] && [[ -d "$parent/.caws" ]]; then
    printf '%s\n' "$parent"
  else
    printf '%s\n' "$CWD"
  fi
}
CAWS_ROOT="$(_session_canonical_root)"

LOG_DIR="${CAWS_ROOT}/.caws/sessions/${SESSION_ID}"
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

  # FLAG: transcript discovery path uses CAWS_VENDOR_DIR. For claude-code this
  # resolves to ~/.claude/projects/. Other surfaces may store transcripts
  # differently; an adapter overriding resolve_transcript is the sanctioned
  # extension point.
  candidate="$HOME/${CAWS_VENDOR_DIR}/projects/${slug}/${SESSION_ID}.jsonl"
  if [[ -f "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return
  fi

  candidate="$HOME/${CAWS_VENDOR_DIR}/projects/-${slug}/${SESSION_ID}.jsonl"
  if [[ -f "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return
  fi

  # Qwen Code keeps durable transcripts under a chats/ subdir of the project
  # store (CAWS-SESSION-LOG-QWEN-001, verified 0.21.4):
  # ~/.qwen/projects/<slug>/chats/<session-id>.jsonl. The payload's
  # $TRANSCRIPT_PATH usually names it already; this fallback covers hook
  # fires whose payload lacks the path.
  candidate="$HOME/${CAWS_VENDOR_DIR}/projects/${slug}/chats/${SESSION_ID}.jsonl"
  if [[ -f "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return
  fi

  candidate="$HOME/${CAWS_VENDOR_DIR}/projects/-${slug}/chats/${SESSION_ID}.jsonl"
  if [[ -f "$candidate" ]]; then
    printf '%s\n' "$candidate"
    return
  fi

  # Kimi Code keeps durable transcripts as per-session wire logs:
  # ~/.kimi-code/session_index.jsonl maps sessionId -> sessionDir, and the
  # transcript is <sessionDir>/agents/main/wire.jsonl
  # (CAWS-SESSION-LOG-KIMI-001, wire protocol 1.4 verified against kimi-code
  # 0.31.x). Kimi's hook payload carries no transcript_path, so this index
  # lookup is the primary resolution path on that surface. Harmless on other
  # surfaces: session_index.jsonl exists only under .kimi-code.
  local index_file session_dir
  index_file="$HOME/${CAWS_VENDOR_DIR}/session_index.jsonl"
  if [[ -f "$index_file" ]]; then
    session_dir=$(jq -r --arg sid "$SESSION_ID" \
      'select(.sessionId == $sid) | .sessionDir' "$index_file" 2>/dev/null | tail -n 1)
    if [[ -n "$session_dir" ]] && [[ -f "$session_dir/agents/main/wire.jsonl" ]]; then
      printf '%s\n' "$session_dir/agents/main/wire.jsonl"
      return
    fi
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

  # Vendor-neutral CAWS plan dir (always matched, any surface).
  case "$file_path" in
    */.caws/plans/*.md) return 0 ;;
  esac

  # Harness plan dir: $HOME/<vendor>/plans/ or <vendor>/plans/ — derived from
  # CAWS_VENDOR_DIR because case patterns cannot expand shell variables.
  # (CAWS-WORKTREE-WRITE-GUARD-VENDOR-GENERALIZE-001: was hardcoded .claude/.)
  # NOTE on quoting: the glob metacharacters (* and the leading */ for the
  # relative form) MUST sit OUTSIDE the double quotes, or bash treats them as
  # literals and the match silently fails. Only ${HOME}/${CAWS_VENDOR_DIR} are
  # quoted (they're path values, not patterns).
  [[ $file_path == ${HOME:-}/${CAWS_VENDOR_DIR}/plans/*.md ]] && return 0
  [[ $file_path == */${CAWS_VENDOR_DIR}/plans/*.md ]] && return 0
  return 1
}

handle_post_tool_use() {
  local tool_name file_path
  tool_name="$HOOK_TOOL_NAME"
  file_path="${HOOK_FILE_PATH:-}"
  case "$tool_name" in
    Write|Edit|write_file|edit)
      # qwen-code runtime tool ids reach this hook unnormalized (the shared
      # parse-input.sh is sourced directly above, not via caws_source_lib),
      # so the qwen names are matched alongside the canonical ones
      # (CAWS-SESSION-LOG-QWEN-001).
      if is_plan_file_path "$file_path"; then
        render_session_output "$(resolve_transcript)"
      fi
      ;;
    ExitPlanMode|exit_plan_mode)
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
