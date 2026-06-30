#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 1,17
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
# CAWS Command Safety Gate (shared).
# Delegates to classify_command.py for robust command parsing and classification.
# Falls back to bash pattern matching if Python is unavailable.
#
# The Python classifier handles:
#   - Heredoc-aware parsing (won't false-positive on quoted dangerous commands)
#   - Quoted-region stripping (echo "git reset --hard" is safe)
#   - Pipeline-aware dangers (curl | sh)
#   - Context-aware rm classification (safe prefixes vs dangerous targets)
#   - Proper shell segmentation (&&, ||, ;, |)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/agent-surface.sh
# Provides CAWS_VENDOR_DIR and caws_source_lib — LOAD-BEARING for the latch
# (the latch-state path and the emit helper below both need it). Under
# `set -euo pipefail` a bare `source <missing>` is a fatal builtin error that a
# trailing `|| true` does NOT catch, so guard with an existence test and fail
# LOUD if absent (CAWS-HOOK-SOURCE-GUARD-FAIL-SOFT-001). A missing lib must NOT
# silently disarm the danger latch — emit a block so the safety boundary holds.
if [[ -f "$SCRIPT_DIR/lib/agent-surface.sh" ]]; then
  source "$SCRIPT_DIR/lib/agent-surface.sh"
else
  echo "[block-dangerous] CAWS hook infrastructure incomplete: lib/agent-surface.sh is missing — the danger-latch path cannot resolve. Failing SAFE (blocking). Restore the shared hook libs with: caws init --adopt" >&2
  printf '{"decision":"block","reason":"CAWS command-safety: the block-dangerous guard cannot load lib/agent-surface.sh, so it cannot evaluate command safety or arm the danger latch. Failing safe. Restore the hook pack: caws init --adopt"}\n'
  exit 2
fi
# shellcheck source=lib/emit.sh
# Canonical envelope emitters (HOOK-LIB-CONSOLIDATION-001 T3a).
# Use caws_source_lib so a vendor override is preferred over the shared default.
caws_source_lib emit.sh 2>/dev/null || true
# shellcheck source=lib/caws-state.sh
# sanitize_session — the canonical session-id->filename transform shared with
# reset-danger-latch.sh so the latch WRITER and CLEARER agree on the sentinel
# filename (DANGER-LATCH-UX-001). Optional here (a `command -v sanitize_session`
# fallback follows below), but guard the source with an existence test so a
# missing file does not abort under `set -euo pipefail` — `|| true` does NOT
# catch a fatal `source <missing>` (CAWS-HOOK-SOURCE-GUARD-FAIL-SOFT-001).
[[ -f "$SCRIPT_DIR/lib/caws-state.sh" ]] && source "$SCRIPT_DIR/lib/caws-state.sh"
# shellcheck source=lib/guard-message.sh
# guard_identity (HOOK-GUARD-LEGIBILITY-001) — so latch reasons self-identify
# as "CAWS command-safety". Non-fatal if absent.
[[ -f "$SCRIPT_DIR/lib/guard-message.sh" ]] && source "$SCRIPT_DIR/lib/guard-message.sh"

# The sticky-latch carve-out (see the latch-armed branch below) exempts
# read-only commands AND the reset invocation: a latched session can still run
# `git status`, `ls`, `cat`, etc. and the reset itself. So a latch does NOT
# freeze "every Bash call" — only MUTATING / capability-risk commands re-block.
_LATCH_SCOPE_NOTE="subsequent MUTATING / capability-risk Bash commands will block until a human resets the latch; read-only commands (git status, ls, cat, …) and the reset itself still run"

danger_state_dir() {
  local project_dir="${CAWS_PROJECT_DIR:-.}"
  local state_dir="$project_dir/${CAWS_VENDOR_DIR}/hooks/state"
  mkdir -p "$state_dir"
  printf '%s\n' "$state_dir"
}

# Shared session-id->safe-filename transform.
_danger_safe_session() {
  local session_id="$1"
  if command -v sanitize_session >/dev/null 2>&1; then
    sanitize_session "$session_id"
  else
    printf '%s' "$session_id" | tr -c 'A-Za-z0-9._-' '_'
  fi
}

danger_latch_file() {
  local safe_session
  safe_session=$(_danger_safe_session "$1")
  printf '%s/danger-latch-%s.json\n' "$(danger_state_dir)" "$safe_session"
}

# Warn-marker sibling of the latch file. DANGER-LATCH-APPROVAL-AND-FEEDBACK-001
# (restored in HOOK-CAPABILITY-ENGINE-003): a confirm-class ask WARNS on its
# first occurrence in a session and LATCHES on the second.
danger_warn_file() {
  local safe_session
  safe_session=$(_danger_safe_session "$1")
  printf '%s/danger-warn-%s.json\n' "$(danger_state_dir)" "$safe_session"
}

# Thin adapters over the canonical lib/emit.sh primitives.
emit_block_json() { emit_block "$1"; }
emit_ask_json() { emit_ask "$1"; }

record_danger_latch() {
  local file="$1"
  local decision="$2"
  local reason="$3"
  local command="$4"

  mkdir -p "$(dirname "$file")"
  jq -n \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg hook "block-dangerous.sh" \
    --arg decision "$decision" \
    --arg reason "$reason" \
    --arg command "$command" \
    '{
      ts: $ts,
      hook: $hook,
      decision: $decision,
      reason: $reason,
      command: $command,
      message: "Dangerous command boundary engaged. User reset required before more Bash commands may run in this session."
    }' > "$file"
}

# Classify a command via classify_command.py, echoing the decision
# ("allow" | "ask" | "deny") on stdout.
classify_decision() {
  local cmd="$1"
  local classifier="$SCRIPT_DIR/classify_command.py"
  if [[ ! -f "$classifier" ]] || ! command -v python3 >/dev/null 2>&1; then
    printf 'unavailable'
    return 0
  fi
  local result
  result=$(printf '%s' "$cmd" | python3 "$classifier" \
    --repo-root "${CAWS_PROJECT_DIR:-.}" \
    --home "$HOME" \
    --cwd "$(pwd)" 2>/dev/null) || {
    printf 'unavailable'
    return 0
  }
  printf '%s' "$result" | jq -r '.decision // "ask"' 2>/dev/null || printf 'ask'
}

# Does this command INVOKE the pack's own reset-danger-latch.sh escape hatch?
is_reset_latch_invocation() {
  local cmd="$1"
  printf '%s' "$cmd" | grep -qE '^[[:space:]]*((bash|sh|\.)[[:space:]]+)?([^[:space:];|&]*/)?reset-danger-latch\.sh([[:space:]]|$)'
}

# Read JSON input from the agent harness
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.tool_name // ""')
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')
SESSION_ID=$(printf '%s' "$INPUT" | jq -r '.session_id // env.CAWS_SESSION_ID // env.CLAUDE_SESSION_ID // env.HOOK_SESSION_ID // "unknown"')

# Only check Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

LATCH_FILE="$(danger_latch_file "$SESSION_ID")"
if [[ -f "$LATCH_FILE" ]]; then
  if is_reset_latch_invocation "$COMMAND"; then
    exit 0
  fi
  if [[ "$(classify_decision "$COMMAND")" == "allow" ]]; then
    exit 0
  fi

  ORIG_CMD=""
  ORIG_WHY=""
  if command -v jq >/dev/null 2>&1; then
    ORIG_CMD=$(jq -r '.command // ""' "$LATCH_FILE" 2>/dev/null)
    ORIG_WHY=$(jq -r '.reason // ""' "$LATCH_FILE" 2>/dev/null)
  fi
  TRIGGER_NOTE="The latch was engaged earlier in this session"
  if [[ -n "$ORIG_CMD" ]]; then
    TRIGGER_NOTE="$TRIGGER_NOTE by this command: \`${ORIG_CMD%%$'\n'*}\`"
    [[ -n "$ORIG_WHY" ]] && TRIGGER_NOTE="$TRIGGER_NOTE (reason: $ORIG_WHY)"
    TRIGGER_NOTE="$TRIGGER_NOTE — NOT by the command you just ran. The latch is sticky for mutating commands, so they block until it is cleared (read-only commands and the reset itself are exempt)."
  fi
  REASON="CAWS command-safety: a dangerous command was previously blocked or sent for approval in this session. $TRIGGER_NOTE This is a human-review boundary, not a retryable syntax error. Do not rephrase, wrap, reorder, alias, or indirectly invoke the command. You, the agent, CANNOT clear this in-band: the reset is human-only by design. Ask the USER to run, from their own shell (use --session with THIS session id, not --current): bash ${CAWS_VENDOR_DIR}/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\"  (or --all to clear every latch). Sentinel: $LATCH_FILE"
  emit_block_json "$REASON"
  exit 0
fi

# --- Protect the write guard itself from shell-based self-modification ---
# FLAG: PROTECTED_HOOK_REL / PROTECTED_HOOK_ABS use CAWS_VENDOR_DIR from
# lib/agent-surface.sh so the protection path matches the installed location.
# CAWS_VENDOR_DIR is exported by agent-surface.sh (sourced above).
PROTECTED_HOOK_REL="${CAWS_VENDOR_DIR}/hooks/worktree-write-guard.sh"
PROTECTED_HOOK_ABS="${CAWS_PROJECT_DIR:-.}/${CAWS_VENDOR_DIR}/hooks/worktree-write-guard.sh"
if printf '%s' "$COMMAND" | grep -qF "$PROTECTED_HOOK_REL" || printf '%s' "$COMMAND" | grep -qF "$PROTECTED_HOOK_ABS"; then
  # DANGER-LATCH-TRIGGER-DISCRIMINATION-001
  _GUARD_TOKEN=""
  if printf '%s' "$COMMAND" | grep -qF "$PROTECTED_HOOK_ABS"; then
    _GUARD_TOKEN="$PROTECTED_HOOK_ABS"
  else
    _GUARD_TOKEN="$PROTECTED_HOOK_REL"
  fi
  _LAST_TOKEN="$(printf '%s' "$COMMAND" | sed -E 's/[[:space:]]*[;&|][[:space:]]*$//' | awk '{print $NF}')"
  _GUARD_IS_DEST=0
  [[ "$_LAST_TOKEN" == "$_GUARD_TOKEN" ]] && _GUARD_IS_DEST=1

  if printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(add|commit|status|diff|log|show)\b'; then
    :
  elif printf '%s' "$COMMAND" | grep -qE '(>>|>)[[:space:]]*'"$_GUARD_TOKEN"; then
    record_danger_latch "$LATCH_FILE" "block" "shell redirect into protected guard (destination)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not redirect output into it. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(rm|tee|touch|truncate|install|chmod)[[:space:]]'; then
    record_danger_latch "$LATCH_FILE" "block" "shell edit of protected guard (in-place mutator)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not modify it via the shell. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(sed|perl)[[:space:]]' \
       && printf '%s' "$COMMAND" | grep -qE '(^|[[:space:]])(-i|-pi|-ip|--in-place)([[:space:]]|=|$)'; then
    record_danger_latch "$LATCH_FILE" "block" "shell edit of protected guard (in-place sed/perl)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not modify it in place. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(cp|mv)[[:space:]]' && [[ "$_GUARD_IS_DEST" == "1" ]]; then
    record_danger_latch "$LATCH_FILE" "block" "shell edit of protected guard (copy/move destination)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not copy/move over it. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(cp|mv|node|python|python3|ruby)[[:space:]]'; then
    REASON="CAWS command-safety: this command references the protected guard $PROTECTED_HOOK_REL but does not appear to write INTO it (guard is a copy source or an interpreter argument, not the destination). If you are reading/copying it out for a fixture, that is allowed once approved; if you intend to modify the guard in place, that requires explicit human approval. This did NOT arm the danger latch. Command was: $COMMAND"
    if command -v emit_ask_json >/dev/null 2>&1; then
      emit_ask_json "$REASON"
    else
      printf '%s\n' "$REASON" >&2
    fi
    exit 0
  fi
fi

# --- Python classifier (preferred path) ---
CLASSIFIER="$SCRIPT_DIR/classify_command.py"
if [[ ! -f "$CLASSIFIER" ]] || ! command -v python3 >/dev/null 2>&1; then
  record_danger_latch "$LATCH_FILE" "ask" "classifier unavailable" "$COMMAND"
  REASON="CAWS command-safety: command classifier unavailable; dangerous-command safety cannot verify Bash semantics. The session danger latch is NOW ARMED (fail-closed). $_LATCH_SCOPE_NOTE — you cannot reset it yourself. Ask the USER to run: bash ${CAWS_VENDOR_DIR}/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\". Command was: $COMMAND"
  emit_ask_json "$REASON"
  exit 0
fi

REPO_ROOT="${CAWS_PROJECT_DIR:-.}"
CLASSIFIER_STDERR=$(mktemp)
RESULT=$(printf '%s' "$COMMAND" | python3 "$CLASSIFIER" \
  --repo-root "$REPO_ROOT" \
  --home "$HOME" \
  --cwd "$(pwd)" 2>"$CLASSIFIER_STDERR") || {
  DIAG=$(head -c 200 "$CLASSIFIER_STDERR" 2>/dev/null || true)
  rm -f "$CLASSIFIER_STDERR"
  RESULT="{\"decision\":\"ask\",\"reason\":\"command classifier failed: ${DIAG:-unknown error}\",\"source\":\"classifier_error\",\"enforcement\":\"confirm\"}"
}
rm -f "$CLASSIFIER_STDERR"

DECISION=$(printf '%s' "$RESULT" | jq -r '.decision // "ask"')
REASON=$(printf '%s' "$RESULT" | jq -r '.reason // "unknown"')
SOURCE=$(printf '%s' "$RESULT" | jq -r '.source // "unknown"')
ENFORCEMENT=$(printf '%s' "$RESULT" | jq -r '.enforcement // ""')
if [[ -z "$ENFORCEMENT" ]]; then
  case "$DECISION" in
    deny) ENFORCEMENT="block" ;;
    allow) ENFORCEMENT="pass" ;;
    *) ENFORCEMENT="advisory" ;;
  esac
fi

case "$DECISION" in
  allow)
    exit 0
    ;;
  deny)
    record_danger_latch "$LATCH_FILE" "$DECISION" "$REASON" "$COMMAND"
    FULL_REASON="CAWS command-safety: $REASON. This is a HARD BLOCK (catastrophic deny) and the session danger latch is NOW ARMED. $_LATCH_SCOPE_NOTE — you CANNOT reset it yourself. Do not rephrase, wrap, reorder, alias, or indirectly invoke this command (e.g. via 'command git ...', 'env ... git ...', 'bash -lc \"...\"', or 'git --bare init'). Ask the USER to run: bash ${CAWS_VENDOR_DIR}/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\", then ask for the next step. Command was: $COMMAND"
    emit_block_json "$FULL_REASON"
    exit 0
    ;;
  ask)
    if [[ "$ENFORCEMENT" == "confirm" ]]; then
      # Opaque-exec carve-out (CAWS-CLASSIFY-LITERAL-OPAQUE-EXEC-READONLY-001):
      # an inline interpreter payload the classifier cannot prove (python3/node
      # -c/-e with $VAR / $() / backtick expansion) is REFUSED with an actionable
      # remediation — modeled on protected-paths.sh: block THIS command and tell
      # the agent the sanctioned alternative — but it does NOT arm the sticky
      # session latch. Recall is unchanged (the command still never runs); only
      # the session-wide freeze + human-reset round-trip is removed, because the
      # safe fix (write the probe to a file by path, or use the Read tool) is
      # entirely in the agent's own hands. Keyed to the exact classifier reason
      # so it cannot swallow any other capability ask or a deny.
      if [[ "$SOURCE" == "capability" && "$REASON" == "opaque execution — cannot prove payload"* ]]; then
        FULL_REASON="CAWS command-safety: $REASON. This inline payload cannot be verified, so it is refused — but the session danger latch was NOT armed and you can proceed immediately by rewriting it. Do this instead: (1) write the probe to a script file in your scope (e.g. a .py or .js file) and run it by path — file payloads are inspectable and are not opaque; or (2) for read-only inspection, use the Read tool / cat / jq against the file directly; or (3) if the payload is genuinely a literal with no \$VAR/\$()/backtick, inline it without shell interpolation. Do NOT rephrase the same opaque -c/-e to evade this. Command was: $COMMAND"
        emit_block_json "$FULL_REASON"
        exit 0
      fi
      if [[ "$SOURCE" == "capability" ]]; then
        WARN_FILE="$(danger_warn_file "$SESSION_ID")"
        if [[ ! -f "$WARN_FILE" ]]; then
          mkdir -p "$(dirname "$WARN_FILE")"
          jq -n \
            --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            --arg reason "$REASON" \
            --arg command "$COMMAND" \
            '{ts: $ts, hook: "block-dangerous.sh", kind: "capability-warn", reason: $reason, command: $command}' \
            > "$WARN_FILE" 2>/dev/null || true
          printf 'caws command-safety (WARN, first capability ask — not blocked): %s\n' "$REASON" >&2
          printf '  A SECOND capability-risk command this session will ARM the danger latch. Command was: %s\n' "$COMMAND" >&2
          exit 0
        fi
        record_danger_latch "$LATCH_FILE" "ask" "$REASON" "$COMMAND"
        FULL_REASON="CAWS command-safety: $REASON. This is the SECOND capability-risk command this session — the first was a non-blocking warning; this one ARMS the session danger latch. $_LATCH_SCOPE_NOTE — you CANNOT reset it yourself. Do not rephrase, wrap, reorder, alias, or indirectly invoke the command to evade this. Ask the USER to confirm and run: bash ${CAWS_VENDOR_DIR}/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe / approved>\", then proceed. Command was: $COMMAND"
        emit_block_json "$FULL_REASON"
        exit 0
      fi
      record_danger_latch "$LATCH_FILE" "ask" "$REASON" "$COMMAND"
      FULL_REASON="CAWS command-safety: $REASON. This requires USER CONFIRMATION before it runs and the session danger latch is NOW ARMED (fail-closed: the classifier could not verify this command). $_LATCH_SCOPE_NOTE — you CANNOT reset it yourself. Do not rephrase, wrap, reorder, alias, or indirectly invoke the command to evade this. Ask the USER to confirm and run: bash ${CAWS_VENDOR_DIR}/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe / approved>\", then proceed. Command was: $COMMAND"
      emit_block_json "$FULL_REASON"
      exit 0
    fi
    # advisory (and any non-confirm enforcement): non-blocking, exit 0.
    printf 'caws advisory (non-blocking): %s\n' "$REASON" >&2
    exit 0
    ;;
  *)
    record_danger_latch "$LATCH_FILE" "ask" "classifier unknown decision: $DECISION" "$COMMAND"
    FULL_REASON="CAWS command-safety: command classifier returned an unrecognized decision '$DECISION'. The session danger latch is NOW ARMED (fail-closed). $_LATCH_SCOPE_NOTE — you cannot reset it yourself. Ask the USER to run: bash ${CAWS_VENDOR_DIR}/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\". Command was: $COMMAND"
    emit_ask_json "$FULL_REASON"
    exit 0
    ;;
esac

# shellcheck disable=SC2317
exit 0
