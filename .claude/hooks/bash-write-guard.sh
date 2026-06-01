#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 11
# caws_min_major: 11
# lineage_refs: 4,8,13,20,32
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS Bash Write-Target Guard for Claude Code (WORKTREE-ISOLATION-HARDENING-001
# Fix 3). The worktree-write-guard only sees Write/Edit; Bash mutations
# (echo >> file, sed -i, rm, mv, git restore, ...) were an UNGUARDED side door
# into worktree-owned payload. This guard self-filters on Bash, extracts write
# TARGETS for a deliberately NARROW set of high-value mutation forms, and routes
# each target through the SAME ownership oracle (lib/worktree-claim-oracle.js)
# that worktree-write-guard uses for Write/Edit — so a Bash mutation and a
# Write/Edit of the same path get the same owner-vs-session answer.
#
# DELIBERATELY NARROW. This does NOT parse arbitrary shell (that is a trap). It
# recognizes only the forms that reproduced or plausibly reproduce the clash
# probe class:
#   redirection      > FILE   >> FILE
#   tee              tee FILE   tee -a FILE
#   in-place editors sed -i ... FILE   perl -pi ... FILE
#   truncate/touch   truncate ... FILE   touch FILE
#   remove/move/copy rm FILE   mv SRC DST   cp SRC DST   dd of=FILE
#   git path-restore git restore FILE   git checkout -- FILE
#                    git reset -- FILE   git clean
# Outcome rule (mirrors worktree-write-guard, fail closed):
#   any extracted target -> oracle block_*  => exit 2 (hard block)
#   any extracted target -> oracle ask/error => ask (degrade to block if the
#                                               harness cannot ask)
#   no claimed/owned target involved          => exit 0 (pass; read-only too)
#
# This is a SEPARATE managed hook from worktree-write-guard.sh (distinct
# responsibility: Bash target authority vs file-tool authority) but shares the
# oracle. Coupling to classify_command.py is intentionally avoided so future
# command-safety changes cannot silently alter isolation behavior.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/caws-state.sh
source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || exit 0
# shellcheck source=lib/emit.sh
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
[[ -f "$SCRIPT_DIR/lib/guard-message.sh" ]] && source "$SCRIPT_DIR/lib/guard-message.sh"
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Self-filter: Bash only. Non-matching tool calls exit cheaply.
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

CAWS_CLAIM_ORACLE="$SCRIPT_DIR/lib/worktree-claim-oracle.js"
# No oracle or no node -> cannot decide ownership; fail OPEN (the enforcement
# claim is only made when the oracle is present). This matches the
# worktree-write-guard payload arm.
[[ -f "$CAWS_CLAIM_ORACLE" ]] || exit 0
command -v node >/dev/null 2>&1 || exit 0

# Resolve canonical root (where .caws/worktrees.json lives). Use the shared
# helper if present; otherwise fall back to CLAUDE_PROJECT_DIR.
if command -v resolve_canonical_dir >/dev/null 2>&1; then
  PROJECT_DIR="$(resolve_canonical_dir "${CLAUDE_PROJECT_DIR:-.}")"
else
  PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
fi

# No registry -> no active worktrees to enforce; the worktree-write-guard and
# oracle both treat this as the unguarded base state. Exit fast.
[[ -f "$PROJECT_DIR/.caws/worktrees.json" ]] || exit 0

AGENT_CWD="${HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}"

# --- target extraction (NARROW) --------------------------------------------
# Emit one candidate path per line for the recognized mutation forms. This is
# intentionally conservative: it favors extracting a few clear targets over
# attempting a full shell parse. Tokens are split on whitespace; option flags
# and obvious non-paths are skipped. False positives are acceptable (they route
# to the oracle, which returns pass for unclaimed paths); the failure we must
# avoid is a missed foreign mutation, so when a mutation verb is present we err
# toward extracting its operands.
extract_targets() {
  local cmd="$1"
  # Normalize: collapse the command into space-separated tokens, preserving the
  # redirection operators as standalone tokens so ">" / ">>" are detectable.
  # Order-safe padding: replace ">>" with a sentinel FIRST so the single-">"
  # rule cannot re-split it (a naive "s/>>/ >> /; s/([^>])>/.../" splits the
  # padded ">>" into "> >" because the inserted space matches [^>]). Pad single
  # ">", then restore the sentinel as a padded ">>".
  local padded
  padded="$(printf '%s' "$cmd" \
    | sed -E 's/>>/ __CAWS_APPEND__ /g; s/>/ > /g; s/__CAWS_APPEND__/>>/g; s/\|/ | /g')"
  # shellcheck disable=SC2206
  local toks=( $padded )
  local n=${#toks[@]}
  local i=0
  while [[ $i -lt $n ]]; do
    local t="${toks[$i]}"
    case "$t" in
      '>'|'>>')
        # next token is the redirection target
        local nx="${toks[$((i+1))]:-}"
        [[ -n "$nx" ]] && printf '%s\n' "$nx"
        i=$((i+2)); continue ;;
      tee)
        # tee [-a] FILE...
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
        # sed -i ... FILE  (only when -i / -i'' present). Last non-flag operand
        # is the file; expression operands typically start with s/ or a quote.
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
        # perl -pi ... FILE  (in-place)
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
        # operands are targets (skip flags)
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
        # all operands are potential targets (the dest is the real write, but a
        # cp/mv onto a claimed path is the mutation we care about; extracting
        # all operands is conservative and the oracle filters unclaimed ones).
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
        # dd of=FILE
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
        # git restore FILE...  |  git checkout -- FILE...  |  git reset -- FILE...
        # |  git clean (whole-tree mutation — extract a sentinel so the oracle
        # is consulted against any claimed path under cwd is overkill; instead
        # we treat git clean as an ask via the dedicated sentinel below).
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
            # only the post-"--" operands are path targets
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
            # whole-tree path mutation; we cannot enumerate its victims cheaply.
            # Emit the cwd sentinel so the decision tail ASKS (never silent).
            printf '%s\n' "$AGENT_CWD"
            i=$((i+2)); continue ;;
        esac
        i=$((i+1)); continue ;;
    esac
    i=$((i+1))
  done
}

# Resolve a candidate to an absolute path (relative to the agent cwd).
abspath() {
  local p="$1"
  case "$p" in
    /*) printf '%s\n' "$p" ;;
    *)  printf '%s\n' "$AGENT_CWD/$p" ;;
  esac
}

# --- decide -----------------------------------------------------------------
WORST="pass"     # pass < ask < block (monotonic escalation)
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
    node "$CAWS_CLAIM_ORACLE" 2>/dev/null || echo "error_fail_closed:oracle-spawn")"
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
      echo "  This is a CAWS governance decision, not a Claude Code harness prompt." >&2
      echo "  To work in worktree '$_OWN_WT', operate from a SESSION rooted there (caws claim '$_OWN_WT' --takeover to take ownership)." >&2
    else
      echo "[$_BG_ID] BLOCKED: this Bash command mutates '$WORST_DETAIL', claimed by an active worktree's scope.in." >&2
      echo "  This is a CAWS governance decision, not a Claude Code harness prompt." >&2
    fi
    echo "  Do NOT edit .claude/hooks/ or guard state to bypass this." >&2
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
