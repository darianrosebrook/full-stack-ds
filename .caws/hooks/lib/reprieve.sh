#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 43
# caws_min_major: 11
# lineage_refs: (new — CAWS-GUARD-REPRIEVE-SESSION-SCOPED-001)
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
# Session-scoped guard reprieve consult (CAWS-GUARD-REPRIEVE-SESSION-SCOPED-001).
#
# A reprieve is a governed, per-session, expiring, machine-checkable way to SKIP a
# PreToolUse guard for exactly one agent session. It replaces the anti-pattern of
# commenting a guard out of the dispatcher's HANDLERS array (which disables it for
# EVERY agent, forever, with no reason/approver/expiry).
#
# Record (written by `caws reprieve grant`, read here):
#   ${CAWS_PROJECT_DIR}/${CAWS_VENDOR_DIR}/hooks/state/guard-reprieve-<sanitized-session>.json
#   {
#     "session_id": "...", "created_at": "...", "expires_at": "...",
#     "approved_by": "...", "reason": "...", "handlers": ["protected-paths.sh", ...]
#   }
#
# This lib mirrors the danger-latch substrate (block-dangerous.sh:73-103):
#   - same state dir (hooks/state/), same sanitize_session transform, same
#     per-session keying, same gitignored-operational-cache posture.
#   - the writer (caws reprieve grant) and this reader both route through
#     resolve_caws_session_id + sanitize_session so the same session id resolves
#     to the same filename in every context (the DANGER-LATCH-UX-001 lesson).
#
# The one addition over the latch model: an `expires_at` field. An expired
# reprieve is treated as ABSENT (derived on read, never mutated).
#
# IDEMPOTENT: safe to source multiple times.

if [[ -n "${_CAWS_REPRIEVE_SH_LOADED:-}" ]]; then
  return 0 2>/dev/null || exit 0
fi
_CAWS_REPRIEVE_SH_LOADED=1

# Resolve the reprieve state directory. Mirrors danger_state_dir
# (block-dangerous.sh:73-78): ${CAWS_PROJECT_DIR}/${CAWS_VENDOR_DIR}/hooks/state,
# BUT resolves the CANONICAL project dir (not the cwd/worktree root) so a
# reprieve granted in one context is honored in every worktree of the same
# repo. CAWS-GUARD-REPRIEVE-LOCATION-COUPLING-001: without this, an agent that
# grants from the canonical checkout then enters a worktree finds the
# dispatcher's CAWS_PROJECT_DIR points at the worktree, the reprieve file is
# absent there, and the guard re-blocks — defeating the feature in the exact
# multi-worktree workflow CAWS is for. Same lesson guard-strikes.sh applies
# (it moves strike state OUT of the worktree entirely). Resolution:
#   1. git rev-parse --git-common-dir → <canonical>/.git; parent = canonical root
#   2. fall back to CAWS_PROJECT_DIR when not in a linked worktree or git fails
# Creates the dir if missing (mkdir -p is idempotent; a read consult that has to
# create the dir is harmless — the file simply won't exist in it).
caws_reprieve_state_dir() {
  # CAWS-LATCH-CANONICAL-STATE-DIR-001: delegate to the shared canonical-root
  # walk in lib/caws-state.sh (caws_canonical_state_dir) instead of inlining an
  # equivalent walk here. The helper reproduces this function's exact semantics
  # (git-common-dir -> canonical root, relative-common resolved absolute via
  # pwd -P, no .caws/ requirement, fail-open to the start dir). Falls back to
  # the inline walk if the helper is unavailable (caws-state.sh not yet sourced
  # in this shell) so reprieve never depends on source order.
  local state_dir
  if declare -F caws_canonical_state_dir >/dev/null 2>&1; then
    state_dir="$(caws_canonical_state_dir "${CAWS_PROJECT_DIR:-.}" "${CAWS_VENDOR_DIR:-.claude}")"
  else
    # Inline fallback identical to the pre-refactor walk (and to the helper).
    local project_dir="${CAWS_PROJECT_DIR:-.}"
    local common
    common="$(cd "$project_dir" 2>/dev/null && git rev-parse --git-common-dir 2>/dev/null)" || common=""
    if [[ -n "$common" ]]; then
      case "$common" in
        /*) : ;;
        *)  common="$project_dir/$common" ;;
      esac
      local canon_root
      canon_root="$(cd "$common/.." 2>/dev/null && pwd -P)" || canon_root=""
      if [[ -n "$canon_root" ]]; then
        project_dir="$canon_root"
      fi
    fi
    state_dir="$project_dir/${CAWS_VENDOR_DIR:-.claude}/hooks/state"
  fi
  mkdir -p "$state_dir" 2>/dev/null || true
  printf '%s\n' "$state_dir"
}

# Filename for a session's reprieve record. Uses the shared sanitize_session
# (lib/caws-state.sh) with an inline fallback identical to block-dangerous's
# _danger_safe_session, so writer/reader share one transform.
caws_reprieve_file() {
  local session_id="${1:-}"
  local safe_session
  if command -v sanitize_session >/dev/null 2>&1; then
    safe_session="$(sanitize_session "$session_id")"
  else
    safe_session="$(printf '%s' "$session_id" | tr -c 'A-Za-z0-9._-' '_')"
  fi
  printf '%s/guard-reprieve-%s.json\n' "$(caws_reprieve_state_dir)" "$safe_session"
}

# caws_is_handler_reprieved <handler-basename> [<session-id>]
#
# Returns 0 (true) if the named handler should be SKIPPED for the given session
# because of an active (non-expired) reprieve that names it in its `handlers`
# array. Returns 1 (false) otherwise — including: no reprieve file, expired,
# malformed, the handler not in the array, or the session id is "unknown".
#
# The session id defaults to the resolved operating identity
# (resolve_caws_session_id_with_payload), so the dispatcher can call this with
# just the handler basename and get the boundary-crossing identity for free.
#
# Sets the globals CAWS_REPRIEVE_SESSION_ID / CAWS_REPRIEVE_EXPIRES_AT /
# CAWS_REPRIEVE_REASON on a positive match so the caller can log WHY the skip
# happened (the spec's observability invariant — a silent skip is forbidden).
caws_is_handler_reprieved() {
  local handler="$1"
  local session_id="${2:-}"
  # Reset caller-facing globals on every call so a stale match can't bleed.
  CAWS_REPRIEVE_SESSION_ID=""
  CAWS_REPRIEVE_EXPIRES_AT=""
  CAWS_REPRIEVE_REASON=""

  # Resolve the session id if the caller didn't pass one explicitly. Best-effort:
  # if session-id.sh isn't sourced, fall back to HOOK_SESSION_ID, then "unknown".
  if [[ -z "$session_id" || "$session_id" == "unknown" ]]; then
    if declare -F resolve_caws_session_id_with_payload >/dev/null 2>&1; then
      session_id="$(resolve_caws_session_id_with_payload "${HOOK_SESSION_ID:-}")"
    else
      session_id="${HOOK_SESSION_ID:-unknown}"
    fi
  fi
  # Never admit a reprieve for an unresolved ("unknown") session — that would
  # alias every broken-context invocation into one shared skip.
  if [[ -z "$session_id" || "$session_id" == "unknown" ]]; then
    return 1
  fi

  local reprieve_file
  reprieve_file="$(caws_reprieve_file "$session_id")"
  if [[ ! -f "$reprieve_file" ]]; then
    return 1
  fi

  # Read + expiry-check + handler-match in ONE python call (the hook pack's
  # established JSON tool — mirrors parse-input.sh / block-dangerous.sh usage).
  # Emits "ADMIT <expires_at> <reason>" on a positive match, nothing otherwise.
  # A malformed or unreadable file is treated as no-reprieve (fail-open, like
  # the latch reader — never block a tool call because the reprieve cache broke).
  local verdict
  verdict="$(python3 -c '
import json, sys
try:
    with open(sys.argv[1]) as f:
        rec = json.load(f)
except Exception:
    sys.exit(1)
if not isinstance(rec, dict):
    sys.exit(1)
expires_at = rec.get("expires_at")
if not isinstance(expires_at, str) or not expires_at:
    sys.exit(1)
# Derived expiry. CAWS-GUARD-REPRIEVE-NAIVE-EXPIRY-001: a user may pass a
# timezone-less --expires-at (e.g. "2026-07-19T04:00:00"); the writer is
# supposed to reject those, but the reader must be robust to legacy/inert
# files already on disk. Assume UTC for a naive datetime (the only sane
# default for a tool whose now=UTC) so the compare does not TypeError on
# naive-vs-aware -- which would silently disable the reprieve with no error
# surfaced (the worst failure class: reports success while doing nothing).
# A past expiry means absent. Never mutate the file on read.
import datetime
try:
    exp = datetime.datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
except Exception:
    sys.exit(1)
if exp.tzinfo is None:
    exp = exp.replace(tzinfo=datetime.timezone.utc)
now = datetime.datetime.now(datetime.timezone.utc)
if exp < now:
    sys.exit(1)
handlers = rec.get("handlers")
if not isinstance(handlers, list):
    sys.exit(1)
target = sys.argv[2]
if target not in handlers:
    sys.exit(1)
# Positive match. Emit expires_at + reason for the caller to log.
reason = rec.get("reason", "")
print("ADMIT\t" + expires_at + "\t" + str(reason))
' "$reprieve_file" "$handler" 2>/dev/null)" || return 1

  if [[ "$verdict" == ADMIT* ]]; then
    # Parse the tab-delimited ADMIT line into the caller-facing globals.
    local _exp _reason
    _exp="$(printf '%s' "$verdict" | cut -f2)"
    _reason="$(printf '%s' "$verdict" | cut -f3-)"
    CAWS_REPRIEVE_SESSION_ID="$session_id"
    CAWS_REPRIEVE_EXPIRES_AT="$_exp"
    CAWS_REPRIEVE_REASON="$_reason"
    return 0
  fi
  return 1
}
