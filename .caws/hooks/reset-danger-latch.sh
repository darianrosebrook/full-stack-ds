#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 17
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
# Human-authorized reset for the dangerous-command latch written by
# block-dangerous.sh. Clears latch sentinel(s) under
# ${CAWS_VENDOR_DIR}/hooks/state/ and records each reset (with a mandatory
# reason) to ${CAWS_VENDOR_DIR}/logs/danger-latch-resets.log.

set -euo pipefail

# --- Resolve project + state locations -------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/agent-surface.sh
# Provides CAWS_VENDOR_DIR, CAWS_PROJECT_DIR.
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true

PROJECT_DIR="${CAWS_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
STATE_DIR="$PROJECT_DIR/${CAWS_VENDOR_DIR}/hooks/state"
LOG_FILE="$PROJECT_DIR/${CAWS_VENDOR_DIR}/logs/danger-latch-resets.log"

usage() {
  cat >&2 <<USAGE
Usage: reset-danger-latch.sh (--current | --all | --session <id>) --reason "<why this is safe>"

Clears the dangerous-command latch(es) written by block-dangerous.sh so that
Bash tool calls may resume. A reason is mandatory and is recorded to the
audit log at:
  $LOG_FILE

Modes (exactly one required):
  --current            Clear the latch for the current session
                       (resolved from CAWS_SESSION_ID / CLAUDE_SESSION_ID / HOOK_SESSION_ID).
  --all                Clear every latch in this project.
  --session <id>       Clear the latch for a specific session id.

Required:
  --reason "<text>"    Human-supplied justification, recorded to the log.
USAGE
}

# --- Parse arguments --------------------------------------------------------
MODE=""
SESSION_ARG=""
REASON=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --current)  MODE="current"; shift ;;
    --all)      MODE="all"; shift ;;
    --session)  MODE="session"; SESSION_ARG="${2:-}"; shift 2 ;;
    --reason)   REASON="${2:-}"; shift 2 ;;
    -h|--help)  usage; exit 0 ;;
    *)          echo "reset-danger-latch.sh: unknown argument: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$MODE" ]]; then
  echo "reset-danger-latch.sh: one of --current, --all, or --session <id> is required." >&2
  usage
  exit 2
fi

if [[ -z "$REASON" ]]; then
  echo "reset-danger-latch.sh: --reason \"<why this is safe>\" is required." >&2
  echo "The latch is a human-review boundary; clearing it must be justified and is logged." >&2
  exit 2
fi

if [[ "$MODE" == "session" && -z "$SESSION_ARG" ]]; then
  echo "reset-danger-latch.sh: --session requires a session id." >&2
  exit 2
fi

# sanitize_session comes from lib/caws-state.sh so the clearer's filename
# transform is byte-identical to block-dangerous.sh's writer transform
# (DANGER-LATCH-UX-001). If the lib is somehow absent, fall back to a local
# copy of the identical transform rather than failing the reset.
if ! source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || ! command -v sanitize_session >/dev/null 2>&1; then
  sanitize_session() {
    printf '%s' "${1:-}" | tr -c 'A-Za-z0-9._-' '_'
  }
fi

# --- Resolve the set of latch files to clear --------------------------------
declare -a LATCH_FILES=()
# DANGER-LATCH-APPROVAL-AND-FEEDBACK-001: the reset ALSO clears the per-session
# WARN MARKER so a post-reset session starts with a fresh first-strike grace.
# A warn marker with no latch is per-session advisory state, not authority — it
# is cleared too (so clearing the grace is never a no-op when only a warn
# exists). Populated alongside LATCH_FILES per mode.
declare -a WARN_FILES=()

case "$MODE" in
  current)
    SESSION_ID="${CAWS_SESSION_ID:-${CLAUDE_SESSION_ID:-${HOOK_SESSION_ID:-unknown}}}"
    CANDIDATE="$STATE_DIR/danger-latch-$(sanitize_session "$SESSION_ID").json"
    # The warn sibling for this session (cleared even if no latch exists).
    WARN_FILES+=("$STATE_DIR/danger-warn-$(sanitize_session "$SESSION_ID").json")
    if [[ -f "$CANDIDATE" ]]; then
      LATCH_FILES+=("$CANDIDATE")
    else
      # DANGER-LATCH-UX-001: --current is usually run by a HUMAN from a shell
      # that has no session id in its env, so SESSION_ID resolves to
      # "unknown" and the computed filename does not match the sentinel the
      # agent's session actually wrote (keyed to the stdin session id). When
      # the resolved candidate is absent but EXACTLY ONE latch sentinel
      # exists, clear that one — "the current latch" almost always means
      # "the one latch that exists". With 0 or 2+, fall through (the
      # not-found path below prints guidance to use --session <id>).
      declare -a _found=()
      if [[ -d "$STATE_DIR" ]]; then
        while IFS= read -r f; do
          [[ -n "$f" ]] && _found+=("$f")
        done < <(find "$STATE_DIR" -maxdepth 1 -type f -name 'danger-latch-*.json' 2>/dev/null)
      fi
      if [[ "${#_found[@]}" -eq 1 ]]; then
        echo "reset-danger-latch.sh: no latch for resolved session '$SESSION_ID'," >&2
        echo "  but exactly one latch exists — clearing it: ${_found[0]}" >&2
        LATCH_FILES+=("${_found[0]}")
        # Clear that latch's warn sibling too (danger-latch-X -> danger-warn-X).
        WARN_FILES+=("${_found[0]/danger-latch-/danger-warn-}")
      else
        # Record the candidate so the not-found branch reports it; if 2+
        # latches exist, the guidance below tells the human to use --session.
        LATCH_FILES+=("$CANDIDATE")
        if [[ "${#_found[@]}" -gt 1 ]]; then
          echo "reset-danger-latch.sh: ${#_found[@]} latches exist and --current cannot" >&2
          echo "  disambiguate (no session id in this shell). Use --all, or --session <id>" >&2
          echo "  with the id from the block message. Latches:" >&2
          for f in "${_found[@]}"; do echo "    - $f" >&2; done
        fi
      fi
    fi
    ;;
  session)
    LATCH_FILES+=("$STATE_DIR/danger-latch-$(sanitize_session "$SESSION_ARG").json")
    WARN_FILES+=("$STATE_DIR/danger-warn-$(sanitize_session "$SESSION_ARG").json")
    ;;
  all)
    if [[ -d "$STATE_DIR" ]]; then
      while IFS= read -r f; do
        [[ -n "$f" ]] && LATCH_FILES+=("$f")
      done < <(find "$STATE_DIR" -maxdepth 1 -type f -name 'danger-latch-*.json' 2>/dev/null)
      # Sweep every warn marker too.
      while IFS= read -r f; do
        [[ -n "$f" ]] && WARN_FILES+=("$f")
      done < <(find "$STATE_DIR" -maxdepth 1 -type f -name 'danger-warn-*.json' 2>/dev/null)
    fi
    ;;
esac

if [[ "${#LATCH_FILES[@]}" -eq 0 && "${#WARN_FILES[@]}" -eq 0 ]]; then
  echo "No danger latches found to clear (state dir: $STATE_DIR)."
  exit 0
fi

# --- Clear latches + append audit records -----------------------------------
mkdir -p "$(dirname "$LOG_FILE")"
RESET_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
CLEARED=0
MISSING=0
WARNS_CLEARED=0

# Guard the array expansion: under `set -u`, "${arr[@]}" on an EMPTY array
# is an unbound-variable error in older bash. An --all reset that finds only
# warn markers (no latches) leaves LATCH_FILES empty — skip the loop then.
for LATCH in ${LATCH_FILES[@]+"${LATCH_FILES[@]}"}; do
  if [[ ! -f "$LATCH" ]]; then
    MISSING=$((MISSING + 1))
    continue
  fi

  ORIGINAL="$(cat "$LATCH" 2>/dev/null || printf '{}')"

  if command -v jq >/dev/null 2>&1; then
    jq -c -n \
      --arg ts "$RESET_TS" \
      --arg latch "$LATCH" \
      --arg mode "$MODE" \
      --arg reason "$REASON" \
      --argjson original "$ORIGINAL" \
      '{ts: $ts, action: "reset", mode: $mode, latch_file: $latch, reason: $reason, cleared_latch: $original}' \
      >> "$LOG_FILE"
  else
    printf '{"ts":"%s","action":"reset","mode":"%s","latch_file":"%s","reason":%s}\n' \
      "$RESET_TS" "$MODE" "$LATCH" "$(printf '%s' "$REASON" | sed 's/\\/\\\\/g; s/"/\\"/g; s/^/"/; s/$/"/')" \
      >> "$LOG_FILE"
  fi

  rm -f "$LATCH"
  CLEARED=$((CLEARED + 1))
  echo "Cleared danger latch: $LATCH"
done

# DANGER-LATCH-APPROVAL-AND-FEEDBACK-001: clear the warn markers too, so the
# next flagged ask in a post-reset session gets a fresh first-strike warning.
for WARN in ${WARN_FILES[@]+"${WARN_FILES[@]}"}; do
  if [[ -f "$WARN" ]]; then
    rm -f "$WARN"
    WARNS_CLEARED=$((WARNS_CLEARED + 1))
  fi
done

if [[ "$MODE" != "all" && "$CLEARED" -eq 0 && "$WARNS_CLEARED" -eq 0 && "$MISSING" -gt 0 ]]; then
  echo "No active latch or warn marker for the requested session (nothing to clear)."
  exit 0
fi

echo "Reset $CLEARED danger latch(es) and $WARNS_CLEARED warn marker(s). Reason recorded to $LOG_FILE"
echo "Bash tool calls may now resume in this session (first-strike warning grace reset)."
