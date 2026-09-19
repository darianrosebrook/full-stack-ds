#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 87
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
#   turn-001.json      — per-turn detailed timeline; the only artifact the
#                        renderer emits. The former aggregates (session.json,
#                        handoff.json, session.txt) were write-only
#                        duplication of these files and are now deleted on
#                        sight by remove_legacy_aggregates().
#   .meta.json         — session-scoped metadata, written at SessionStart and
#                        sealed at SessionEnd with the exit reason and the
#                        session usage total.
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
if [[ -L "$CAWS_ROOT/.caws" || -L "$CAWS_ROOT/.caws/sessions" || -L "$LOG_DIR" ]]; then
  echo "[session-log] symlink session directory refused; no render" >&2
  exit 0
fi
mkdir -p "$LOG_DIR"

META_FILE="$LOG_DIR/.meta.json"
RENDERER="$SCRIPT_DIR/session_log_renderer.py"

resolve_transcript() {
  # An explicitly configured durable store precedes temporary rolling tails.
  # Error/empty receipts are not cache hits; never fall back to an old projection.
  if [[ -n "${CAWS_TRANSCRIPT_DATABASE:-}" && ( "${CAWS_AGENT_SURFACE:-}" == opencode || "${CAWS_AGENT_SURFACE:-}" == zcode ) ]]; then
    local projection="$LOG_DIR/.transcript-projection.jsonl"
    if python3 "$SCRIPT_DIR/lib/transcript-store.py" --surface "$CAWS_AGENT_SURFACE" \
      --database "$CAWS_TRANSCRIPT_DATABASE" --session "$SESSION_ID" --output "$projection" \
      > "$LOG_DIR/.transcript-projection.receipt.json"; then
      printf '%s\n' "$projection"
    else
      echo "[session-log] durable transcript source failed; prior projection is not current" >&2
    fi
    return
  fi
  if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
    printf '%s\n' "$TRANSCRIPT_PATH"
    return
  fi

  local slug candidate
  slug=$(echo "$CWD" | sed 's|/|-|g; s|^-||')

  # CAWS-HOOKPACK-HOME-UNSET-ROOT-AUTHORITY-ALIAS-001: every candidate below
  # is HOME-rooted. No HOME means none of these best-effort surface-specific
  # stores can be located, not a namespace at "/" -- skip the whole tier.
  if [[ -n "${HOME:-}" ]]; then
    # FLAG: transcript discovery path uses CAWS_VENDOR_DIR. For claude-code this
    # resolves to ~/.claude/projects/. Other surfaces may store transcripts
    # differently; an adapter overriding resolve_transcript is the sanctioned
    # extension point.
    candidate="${HOME}/${CAWS_VENDOR_DIR}/projects/${slug}/${SESSION_ID}.jsonl"
    if [[ -f "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return
    fi

    candidate="${HOME}/${CAWS_VENDOR_DIR}/projects/-${slug}/${SESSION_ID}.jsonl"
    if [[ -f "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return
    fi

    # Qwen Code keeps durable transcripts under a chats/ subdir of the project
    # store (CAWS-SESSION-LOG-QWEN-001, verified 0.21.4):
    # ~/.qwen/projects/<slug>/chats/<session-id>.jsonl. The payload's
    # $TRANSCRIPT_PATH usually names it already; this fallback covers hook
    # fires whose payload lacks the path.
    candidate="${HOME}/${CAWS_VENDOR_DIR}/projects/${slug}/chats/${SESSION_ID}.jsonl"
    if [[ -f "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return
    fi

    candidate="${HOME}/${CAWS_VENDOR_DIR}/projects/-${slug}/chats/${SESSION_ID}.jsonl"
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
    index_file="${HOME}/${CAWS_VENDOR_DIR}/session_index.jsonl"
    if [[ -f "$index_file" ]]; then
      session_dir=$(jq -r --arg sid "$SESSION_ID" \
        'select(.sessionId == $sid) | .sessionDir' "$index_file" 2>/dev/null | tail -n 1)
      if [[ -n "$session_dir" ]] && [[ -f "$session_dir/agents/main/wire.jsonl" ]]; then
        printf '%s\n' "$session_dir/agents/main/wire.jsonl"
        return
      fi
    fi
  fi

  printf '\n'
}

render_session_output() {
  local transcript="$1"
  local branch head_sha dirty_count started_at model start_sha

  if cd "$CWD" 2>/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git symbolic-ref --quiet --short HEAD 2>/dev/null) || branch="detached"
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
    "$transcript" \
    "${CAWS_LOG_DIR:-${CAWS_ROOT}/${CAWS_VENDOR_DIR}/logs}/audit.log" \
    "$LOG_DIR/hook-events.jsonl"
}

handle_session_start() {
  local model source branch head_sha dirty_count full_time
  model="${HOOK_MODEL:-unknown}"
  source="${HOOK_SOURCE:-unknown}"
  if cd "$CWD" 2>/dev/null && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    branch=$(git symbolic-ref --quiet --short HEAD 2>/dev/null) || branch="detached"
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

# The harness's own SessionEnd reason, read verbatim. parse-input.sh does not
# extract it (no guard needs it), so it is pulled from the payload here rather
# than by widening the shared scalar extractor for one handler. Both transport
# modes are covered: a large payload lives in HOOK_PAYLOAD_FILE and the inline
# variable is deliberately absent there.
_session_end_reason() {
  local raw=""
  if [[ "${HOOK_PAYLOAD_TRUNCATED:-0}" == "1" && -n "${HOOK_PAYLOAD_FILE:-}" ]]; then
    raw=$(jq -r '.reason // empty' "$HOOK_PAYLOAD_FILE" 2>/dev/null) || raw=""
  elif [[ -n "${HOOK_INPUT_JSON:-}" ]]; then
    raw=$(printf '%s' "$HOOK_INPUT_JSON" | jq -r '.reason // empty' 2>/dev/null) || raw=""
  fi
  printf '%s\n' "${raw:-other}"
}

# SessionEnd SEALS; it never renders. A render here would race the Stop
# handler's final render while the harness is tearing down, and could rewrite
# turn files mid-exit. Every failure path returns 0: the session is already
# ending and a logger must never be what blocks it.
handle_session_end() {
  [[ -f "$META_FILE" ]] || return 0

  local turn_count usage sealed tmp
  turn_count=$(find "$LOG_DIR" -maxdepth 1 -name 'turn-*.json' 2>/dev/null | wc -l | tr -d ' ')

  usage='null'
  if [[ "${turn_count:-0}" -gt 0 ]]; then
    # Session usage is the sum of what was rendered, so it can never
    # contradict the turn files a reader has in front of them. models keeps
    # first-seen order rather than sorting, matching the per-turn contract.
    #
    # "First-seen" is only meaningful against a defined read order, so the
    # turn files are sorted by name before they are concatenated. find(1)
    # returns directory order, which is a property of the filesystem, not of
    # the session: APFS hands back hash order (turn-001, turn-007, turn-011,
    # ...), ext4 another. Without the sort the sealed models list differed
    # between a developer's machine and CI for identical inputs. The token
    # sums are order-independent; models is not. Zero-padded turn numbers make
    # the byte sort the turn order, and this matches the renderer's own
    # sorted(directory.glob("turn-*.json")) in session_log_renderer.py.
    usage=$(find "$LOG_DIR" -maxdepth 1 -name 'turn-*.json' 2>/dev/null \
      | LC_ALL=C sort \
      | while IFS= read -r turn_file; do cat "$turn_file" 2>/dev/null; done \
      | jq -s '
      [ .[] | .usage // empty ]
      | if length == 0 then null
        else {
          requests:    (map(.requests)    | add),
          input:       (map(.input)       | add),
          cache_read:  (map(.cache_read)  | add),
          cache_write: (map(.cache_write) | add),
          output:      (map(.output)      | add),
          models:      ([ .[] | .models[] ]
                        | reduce .[] as $m ([]; if index($m) then . else . + [$m] end))
        }
        end' 2>/dev/null) || usage='null'
  fi
  [[ -n "$usage" ]] || usage='null'

  sealed=$(jq -c \
    --arg reason "$(_session_end_reason)" \
    --arg ts "$TIMESTAMP" \
    --argjson usage "$usage" \
    '. + {ended: {reason: $reason, ts: $ts}}
       + (if $usage == null then {} else {usage: $usage} end)' \
    "$META_FILE" 2>/dev/null) || return 0
  [[ -n "$sealed" ]] || return 0

  # Atomic replace: a reader must never observe a half-written .meta.json.
  tmp="${META_FILE}.tmp.$$"
  printf '%s\n' "$sealed" > "$tmp" 2>/dev/null && mv -f "$tmp" "$META_FILE" 2>/dev/null
  rm -f "$tmp" 2>/dev/null
  return 0
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
  SessionEnd) handle_session_end ;;
  PreCompact) handle_pre_compact ;;
  PostToolUse) handle_post_tool_use ;;
  *) ;;
esac

exit 0
