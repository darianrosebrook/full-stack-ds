#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 17
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
# reset-strikes.sh — manual reset for CAWS/Claude guard strike counters.
#
# Strikes are per-(session, guard) counters that accumulate when an agent edits
# files outside its declared CAWS scope (see guard-strikes.sh). They never
# auto-decrement, so once an agent's scope.in is legitimately corrected, strikes
# from before the correction can permanently corner the session at strike 3+
# (hard block). This tool is the user-in-the-loop escape hatch: review state,
# decide strikes are stale, reset them. Every reset is logged to
# .claude/logs/strike-resets.log for audit.
#
# --- FUTURE: auto-reset (not implemented) --------------------------------
# The mechanical version would live in scope-guard.sh, BEFORE guard_record_strike,
# with the strict predicate "file-now-matches-scope" (not just "spec-was-touched"):
#   1. Load the active spec's scope.in.
#   2. Evaluate the glob against the current REL_PATH using the same globToRegExp
#      logic as worktree-write-guard.sh.
#   3. If it matches AND the spec's mtime > strike-file mtime, zero out the
#      scope_guard counter for this session before recording a new strike.
# Loophole to avoid: resetting on bare spec edits would let an agent drift, edit
# the spec to silence warnings, then drift further. The match-predicate anchors
# resets to actual scope correctness.
# Only layer this on if strike-resets.log shows daily/repeated manual use.
# -------------------------------------------------------------------------
#
# @author reset-strikes (Sterling / CAWS)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_FILE="$PROJECT_DIR/.claude/logs/strike-resets.log"

MODE="list"
SESSION=""
GUARD=""
WORKTREE=""
OLDER_THAN_DAYS=7
DRY_RUN=0
CONFIRM=0

usage() {
  cat <<EOF
reset-strikes.sh — inspect and reset CAWS guard strike counters.

Default (no args): list current strike state across all sessions/worktrees.

Modes (mutually exclusive):
  --session <uuid>       Reset strikes for one session
  --worktree <name>      Reset strikes stored inside one worktree's tmp/
  --current              Reset the most-recently-modified strike file
  --all                  Reset every strike file (requires --confirm)
  --stale                Delete strike files older than N days (see --older-than)

Modifiers:
  --guard <name>         Restrict reset to one guard key (e.g. scope_guard)
                         Used with --session / --worktree / --current.
  --older-than <days>    For --stale. Default: 7.
  --dry-run              Print what would change; don't modify files.
  --confirm              Required for --all.
  -h, --help             Show this help.

Examples:
  $(basename "$0")                                  # list state only
  $(basename "$0") --current                        # reset most-recent session
  $(basename "$0") --session abc --guard scope_guard
  $(basename "$0") --stale --older-than 14 --dry-run
  $(basename "$0") --all --confirm

Log of resets: $LOG_FILE
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --session)    MODE="session";  SESSION="$2"; shift 2 ;;
    --worktree)   MODE="worktree"; WORKTREE="$2"; shift 2 ;;
    --current)    MODE="current"; shift ;;
    --all)        MODE="all"; shift ;;
    --stale)      MODE="stale"; shift ;;
    --guard)      GUARD="$2"; shift 2 ;;
    --older-than) OLDER_THAN_DAYS="$2"; shift 2 ;;
    --dry-run)    DRY_RUN=1; shift ;;
    --confirm)    CONFIRM=1; shift ;;
    -h|--help)    usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage >&2; exit 1 ;;
  esac
done

mkdir -p "$(dirname "$LOG_FILE")"

# Collect strike files from every location guard-strikes.sh may write to:
#   - the canonical main-repo log dir (.claude/logs)
#   - the current out-of-tree per-worktree location under each linked
#     worktree's gitdir (.git/worktrees/<name>/caws-guard-strikes/) — where
#     guard-strikes.sh writes since CAWS-GUARD-STRIKE-FILE-OUT-OF-TREE-001, so
#     strike state never lands in a worktree working tree
#   - the legacy in-tree location (.caws/worktrees/<name>/tmp/) for any strike
#     files written by a pre-relocation hook still on disk
collect_strike_files() {
  {
    find "$PROJECT_DIR/.claude/logs" -maxdepth 1 -name 'guard-strikes-*.json' 2>/dev/null || true
    find "$PROJECT_DIR/.git/worktrees" -maxdepth 3 -name 'guard-strikes-*.json' 2>/dev/null || true
    find "$PROJECT_DIR/.caws/worktrees" -maxdepth 3 -name 'guard-strikes-*.json' 2>/dev/null || true
  } | sort -u
}

# macOS and Linux disagree on stat flags. Try BSD first, fall back to GNU.
file_mtime() {
  stat -f '%Sm' -t '%Y-%m-%d %H:%M' "$1" 2>/dev/null \
    || stat -c '%y' "$1" 2>/dev/null | cut -d'.' -f1 \
    || echo "unknown"
}

describe_file() {
  local f="$1"
  local mtime sid content
  mtime=$(file_mtime "$f")
  sid=$(basename "$f" | sed 's/^guard-strikes-//; s/\.json$//')
  content=$(cat "$f" 2>/dev/null || echo '{}')
  printf '  %s  session=%s\n    strikes=%s\n    path=%s\n\n' \
    "$mtime" "$sid" "$content" "$f"
}

log_reset() {
  local action="$1" target="$2" before="$3"
  # Flatten the JSON payload to one line so the log stays greppable.
  local before_flat
  before_flat=$(printf '%s' "$before" | jq -c . 2>/dev/null || printf '%s' "$before" | tr -d '\n')
  printf '%s  action=%s  guard=%s  dry_run=%s  before=%s  target=%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$action" "${GUARD:-*}" "$DRY_RUN" "$before_flat" "$target" \
    >> "$LOG_FILE"
}

reset_file() {
  local f="$1"
  [[ -z "$f" ]] && return 0
  [[ ! -f "$f" ]] && { echo "skip (not a file): $f" >&2; return 0; }

  local before
  before=$(cat "$f" 2>/dev/null || echo '{}')

  if [[ -z "$GUARD" ]]; then
    if [[ "$DRY_RUN" == 1 ]]; then
      echo "[dry-run] would delete $f (was: $before)"
      log_reset "dry-run-delete" "$f" "$before"
    else
      rm -f "$f"
      log_reset "delete" "$f" "$before"
      echo "deleted: $f"
    fi
  else
    if [[ "$DRY_RUN" == 1 ]]; then
      echo "[dry-run] would clear guard '$GUARD' in $f (was: $before)"
      log_reset "dry-run-clear" "$f" "$before"
    else
      jq --arg g "$GUARD" 'del(.[$g])' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
      # If no guard keys remain, remove the file entirely.
      if [[ "$(jq 'length' "$f" 2>/dev/null || echo 1)" == "0" ]]; then
        rm -f "$f"
        echo "cleared guard '$GUARD' and removed empty file: $f"
      else
        echo "cleared guard '$GUARD' in: $f"
      fi
      log_reset "clear-guard" "$f" "$before"
    fi
  fi
}

case "$MODE" in
  list)
    files=$(collect_strike_files)
    if [[ -z "$files" ]]; then
      echo "No strike files found."
      exit 0
    fi
    echo "Current strike state:"
    echo
    while IFS= read -r f; do
      [[ -z "$f" ]] && continue
      describe_file "$f"
    done <<< "$files"
    echo "To reset: use --current, --session <uuid>, --worktree <name>, --stale, or --all --confirm."
    ;;

  current)
    files=$(collect_strike_files)
    # Most-recently-modified first. Handles spaces in paths defensively.
    target=""
    latest=0
    while IFS= read -r f; do
      [[ -z "$f" ]] && continue
      mt=$(stat -f '%m' "$f" 2>/dev/null || stat -c '%Y' "$f" 2>/dev/null || echo 0)
      if (( mt > latest )); then
        latest=$mt
        target="$f"
      fi
    done <<< "$files"
    [[ -z "$target" ]] && { echo "No strike files found." >&2; exit 1; }
    echo "Most-recently-modified: $target"
    reset_file "$target"
    ;;

  session)
    [[ -z "$SESSION" ]] && { echo "--session requires a uuid" >&2; exit 1; }
    matches=$(collect_strike_files | grep "guard-strikes-${SESSION}\.json$" || true)
    [[ -z "$matches" ]] && { echo "No strike file found for session: $SESSION" >&2; exit 1; }
    while IFS= read -r f; do reset_file "$f"; done <<< "$matches"
    ;;

  worktree)
    [[ -z "$WORKTREE" ]] && { echo "--worktree requires a name" >&2; exit 1; }
    wt_dir="$PROJECT_DIR/.caws/worktrees/$WORKTREE/tmp"
    if [[ ! -d "$wt_dir" ]]; then
      echo "Worktree tmp dir not found: $wt_dir" >&2
      exit 1
    fi
    matches=$(find "$wt_dir" -maxdepth 1 -name 'guard-strikes-*.json' 2>/dev/null || true)
    [[ -z "$matches" ]] && { echo "No strike files in worktree: $WORKTREE" >&2; exit 1; }
    while IFS= read -r f; do reset_file "$f"; done <<< "$matches"
    ;;

  all)
    if [[ "$CONFIRM" != 1 ]]; then
      echo "--all requires --confirm (safety interlock)." >&2
      exit 1
    fi
    files=$(collect_strike_files)
    [[ -z "$files" ]] && { echo "No strike files found."; exit 0; }
    while IFS= read -r f; do reset_file "$f"; done <<< "$files"
    ;;

  stale)
    files=$(find \
              "$PROJECT_DIR/.claude/logs" \
              "$PROJECT_DIR/.caws/worktrees" \
              -name 'guard-strikes-*.json' -mtime "+$OLDER_THAN_DAYS" 2>/dev/null || true)
    if [[ -z "$files" ]]; then
      echo "No strike files older than $OLDER_THAN_DAYS days."
      exit 0
    fi
    echo "Pruning strike files older than $OLDER_THAN_DAYS days:"
    while IFS= read -r f; do reset_file "$f"; done <<< "$files"
    ;;
esac
