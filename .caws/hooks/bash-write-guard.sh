#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 1
# caws_min_major: 11
# lineage_refs: 4,8,13,20,32
# do_not_edit_directly: update via `caws init`
#
# CAWS Bash Write-Target Guard (shared, WORKTREE-ISOLATION-HARDENING-001 Fix 3).
# Self-filters on Bash, extracts write targets for a narrow set of mutation
# forms, routes each through lib/worktree-claim-oracle.cjs — same oracle as
# worktree-write-guard.sh so a Bash mutation and a Write/Edit get the same
# owner-vs-session answer.
#
# Recognized mutation forms:
#   redirection      > FILE   >> FILE
#   tee              tee FILE   tee -a FILE
#   in-place editors sed -i ... FILE   perl -pi ... FILE
#   truncate/touch   truncate ... FILE   touch FILE
#   remove/move/copy rm FILE   mv SRC DST   cp SRC DST   dd of=FILE
#   git path-restore git restore FILE   git checkout -- FILE
#                    git reset -- FILE   git clean

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/caws-state.sh
source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || exit 0
# shellcheck source=lib/agent-surface.sh
# Provides CAWS_PROJECT_DIR and caws_source_lib. Must come before caws_source_lib calls.
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true
# shellcheck source=lib/emit.sh
# Use caws_source_lib so a vendor override is preferred over the shared default.
caws_source_lib emit.sh 2>/dev/null || true
[[ -f "$SCRIPT_DIR/lib/guard-message.sh" ]] && source "$SCRIPT_DIR/lib/guard-message.sh"
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Self-filter: Bash only.
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

CAWS_CLAIM_ORACLE="$SCRIPT_DIR/lib/worktree-claim-oracle.cjs"
[[ -f "$CAWS_CLAIM_ORACLE" ]] || exit 0
command -v node >/dev/null 2>&1 || exit 0

# Resolve canonical root.
if command -v resolve_canonical_dir >/dev/null 2>&1; then
  PROJECT_DIR="$(resolve_canonical_dir "${CAWS_PROJECT_DIR:-.}")"
else
  PROJECT_DIR="${CAWS_PROJECT_DIR:-.}"
fi

[[ -f "$PROJECT_DIR/.caws/worktrees.json" ]] || exit 0

AGENT_CWD="${HOOK_CWD:-${CAWS_PROJECT_DIR:-.}}"

# --- target extraction (NARROW) --------------------------------------------
extract_targets() {
  local cmd="$1"
  # BASH-WRITE-GUARD-FD-REDIRECT-FP-001: neutralize fd-redirections before
  # splitting so `2>&1`, `>&2`, `N>&M` are not tokenized as file targets.
  local padded
  padded="$(printf '%s' "$cmd" \
    | sed -E 's/[0-9]*>&[0-9-]+/ /g; s/&>>?[0-9]*/ /g' \
    | sed -E 's/>>/ __CAWS_APPEND__ /g; s/>/ > /g; s/__CAWS_APPEND__/>>/g; s/\|/ | /g')"
  # shellcheck disable=SC2206
  local toks=( $padded )
  local n=${#toks[@]}
  local i=0
  while [[ $i -lt $n ]]; do
    local t="${toks[$i]}"
    case "$t" in
      '>'|'>>')
        local nx="${toks[$((i+1))]:-}"
        [[ -n "$nx" ]] && printf '%s\n' "$nx"
        i=$((i+2)); continue ;;
      tee)
        local j=$((i+1))
        while [[ $j -lt $n ]]; do
          local tj="${toks[$j]}"
          case "$tj" in
            -a|--append) ;;
            -*) ;;
            '|'|';'|'&&') break ;;
            *) printf '%s\n' "$tj" ;;
          esac
          j=$((j+1))
        done
        i=$j; continue ;;
      sed)
        local has_inplace=0 j=$((i+1)) last=""
        while [[ $j -lt $n ]]; do
          local tj="${toks[$j]}"
          case "$tj" in
            '|'|';'|'&&') break ;;
            -i|-i''|--in-place|-i*) has_inplace=1 ;;
            -*) ;;
            *) last="$tj" ;;
          esac
          j=$((j+1))
        done
        [[ "$has_inplace" == "1" ]] && [[ -n "$last" ]] && printf '%s\n' "$last"
        i=$j; continue ;;
      perl)
        local has_pi=0 j=$((i+1)) last=""
        while [[ $j -lt $n ]]; do
          local tj="${toks[$j]}"
          case "$tj" in
            '|'|';'|'&&') break ;;
            -*i*) has_pi=1 ;;
            -*) ;;
            *) last="$tj" ;;
          esac
          j=$((j+1))
        done
        [[ "$has_pi" == "1" ]] && [[ -n "$last" ]] && printf '%s\n' "$last"
        i=$j; continue ;;
      truncate|touch|rm)
        local j=$((i+1))
        while [[ $j -lt $n ]]; do
          local tj="${toks[$j]}"
          case "$tj" in
            '|'|';'|'&&') break ;;
            -*) ;;
            *) printf '%s\n' "$tj" ;;
          esac
          j=$((j+1))
        done
        i=$j; continue ;;
      mv|cp)
        local j=$((i+1))
        while [[ $j -lt $n ]]; do
          local tj="${toks[$j]}"
          case "$tj" in
            '|'|';'|'&&') break ;;
            -*) ;;
            *) printf '%s\n' "$tj" ;;
          esac
          j=$((j+1))
        done
        i=$j; continue ;;
      dd)
        local j=$((i+1))
        while [[ $j -lt $n ]]; do
          local tj="${toks[$j]}"
          case "$tj" in
            '|'|';'|'&&') break ;;
            of=*) printf '%s\n' "${tj#of=}" ;;
          esac
          j=$((j+1))
        done
        i=$j; continue ;;
      git)
        local sub="${toks[$((i+1))]:-}"
        case "$sub" in
          restore)
            local j=$((i+2))
            while [[ $j -lt $n ]]; do
              local tj="${toks[$j]}"
              case "$tj" in
                '|'|';'|'&&') break ;;
                --) ;;
                -*) ;;
                *) printf '%s\n' "$tj" ;;
              esac
              j=$((j+1))
            done
            i=$j; continue ;;
          checkout|reset)
            local j=$((i+2)) seen_dashdash=0
            while [[ $j -lt $n ]]; do
              local tj="${toks[$j]}"
              case "$tj" in
                '|'|';'|'&&') break ;;
                --) seen_dashdash=1 ;;
                -*) ;;
                *) [[ "$seen_dashdash" == "1" ]] && printf '%s\n' "$tj" ;;
              esac
              j=$((j+1))
            done
            i=$j; continue ;;
          clean)
            printf '%s\n' "$AGENT_CWD"
            i=$((i+2)); continue ;;
        esac
        i=$((i+1)); continue ;;
    esac
    i=$((i+1))
  done
}

abspath() {
  local p="$1"
  case "$p" in
    /*) printf '%s\n' "$p" ;;
    *)  printf '%s\n' "$AGENT_CWD/$p" ;;
  esac
}

# --- decide -----------------------------------------------------------------
WORST="pass"
WORST_DETAIL=""
WORST_KIND=""

escalate() {
  local rank_new rank_cur
  case "$1" in pass) rank_new=0 ;; ask) rank_new=1 ;; block) rank_new=2 ;; esac
  case "$WORST" in pass) rank_cur=0 ;; ask) rank_cur=1 ;; block) rank_cur=2 ;; esac
  if [[ "$rank_new" -gt "$rank_cur" ]]; then
    WORST="$1"; WORST_DETAIL="$2"; WORST_KIND="$3"
  fi
}

while IFS= read -r cand; do
  [[ -z "$cand" ]] && continue
  abs="$(abspath "$cand")"
  out="$(CAWS_ORACLE_PROJECT_DIR="$PROJECT_DIR" \
    CAWS_ORACLE_CURRENT_BRANCH="" \
    CAWS_ORACLE_REL_PATH="$abs" \
    CAWS_ORACLE_SESSION_ID="${HOOK_SESSION_ID:-}" \
    node "$CAWS_CLAIM_ORACLE" 2>&1 || true)"
  _first="${out%%$'\n'*}"
  case "${_first%%:*}" in
    pass|block_foreign_worktree|block_claimed|ask_uncertain|error_fail_closed)
      out="$_first" ;;
    *)
      _reason="$(printf '%s' "$_first" | cut -c1-200)"
      out="error_fail_closed:oracle-spawn (${_reason:-no output})" ;;
  esac
  outcome="${out%%:*}"
  detail="${out#*:}"
  case "$outcome" in
    pass) ;;
    block_foreign_worktree|block_claimed) escalate block "$detail" "$outcome" ;;
    ask_uncertain|error_fail_closed)      escalate ask "$detail" "$outcome" ;;
  esac
done < <(extract_targets "$COMMAND")

_BG_ID="CAWS bash-write-guard"
command -v guard_identity >/dev/null 2>&1 && _BG_ID="$(guard_identity bash-write-guard)"

case "$WORST" in
  block)
    if [[ "$WORST_KIND" == "block_foreign_worktree" ]]; then
      _OWN_WT="$(printf '%s' "$WORST_DETAIL" | cut -d: -f1)"
      echo "[$_BG_ID] BLOCKED: this Bash command mutates worktree '$_OWN_WT''s payload (.caws/worktrees/$_OWN_WT/...), owned by a DIFFERENT session." >&2
      echo "  A Bash mutation of another session's worktree files is the same isolation breach as a foreign Write/Edit — it is blocked at the same boundary." >&2
      echo "  This is a CAWS governance decision." >&2
      echo "  To work in worktree '$_OWN_WT', operate from a SESSION rooted there (caws claim '$_OWN_WT' --takeover to take ownership)." >&2
    else
      IFS=',' read -ra _CLAIM_PAIRS <<< "$WORST_DETAIL"
      _LEAD_WT="${_CLAIM_PAIRS[0]%%:*}"
      _LEAD_PAT="${_CLAIM_PAIRS[0]#*:}"
      echo "[$_BG_ID] BLOCKED: this Bash command mutates '$_LEAD_WT:$_LEAD_PAT', claimed by an active worktree's scope.in." >&2
      _CLAIMANT_COUNT=${#_CLAIM_PAIRS[@]}
      if [[ "$_CLAIMANT_COUNT" -gt 1 ]]; then
        echo "  This path is claimed via scope.in by $_CLAIMANT_COUNT active worktrees:" >&2
        for _pair in "${_CLAIM_PAIRS[@]}"; do
          [[ -z "$_pair" ]] && continue
          _cw="${_pair%%:*}"
          _cp="${_pair#*:}"
          echo "    - worktree '$_cw' via scope.in '$_cp'" >&2
        done
        echo "  Route the edit through whichever single worktree should own it." >&2
      fi
      echo "  This is a CAWS governance decision." >&2
    fi
    echo "  Do NOT edit ${CAWS_VENDOR_DIR}/hooks/ or guard state to bypass this." >&2
    exit 2 ;;
  ask)
    _REASON="[$_BG_ID] This Bash command targets a worktree-claimed or worktree-payload path and ownership could not be confirmed ($WORST_KIND:$WORST_DETAIL). Approve only if you own the target worktree; otherwise route the mutation through the owning worktree's session."
    if [[ "${CAWS_GUARD_NO_ASK:-0}" == "1" ]] || ! command -v emit_ask >/dev/null 2>&1; then
      echo "$_REASON" >&2
      echo "  (ask-incapable harness — degraded to block; no silent allow)" >&2
      exit 2
    fi
    emit_ask "$_REASON"
    exit 0 ;;
  *)
    exit 0 ;;
esac
