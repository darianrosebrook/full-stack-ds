#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 15
# caws_min_major: 11
# lineage_refs: 1,17
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
# CAWS Command Safety Gate for Claude Code
# Delegates to classify_command.py for robust command parsing and classification.
# Falls back to bash pattern matching if Python is unavailable.
#
# The Python classifier handles:
#   - Heredoc-aware parsing (won't false-positive on quoted dangerous commands)
#   - Quoted-region stripping (echo "git reset --hard" is safe)
#   - Pipeline-aware dangers (curl | sh)
#   - Context-aware rm classification (safe prefixes vs dangerous targets)
#   - Proper shell segmentation (&&, ||, ;, |)
#
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/emit.sh
# Canonical Claude Code envelope emitters (HOOK-LIB-CONSOLIDATION-001 T3a).
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
# shellcheck source=lib/caws-state.sh
# sanitize_session — the canonical session-id->filename transform shared with
# reset-danger-latch.sh so the latch WRITER and CLEARER agree on the sentinel
# filename (DANGER-LATCH-UX-001).
source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || true
# shellcheck source=lib/guard-message.sh
# guard_identity (HOOK-GUARD-LEGIBILITY-001) — so latch reasons self-identify
# as "CAWS command-safety". Non-fatal if absent (reasons already name the
# classifier inline). Guard with a file-existence test: under `set -euo
# pipefail`, `source <missing>` is a fatal builtin error `|| true` won't catch.
[[ -f "$SCRIPT_DIR/lib/guard-message.sh" ]] && source "$SCRIPT_DIR/lib/guard-message.sh"

# The sticky-latch carve-out (see the latch-armed branch below) exempts
# read-only commands AND the reset invocation: a latched session can still run
# `git status`, `ls`, `cat`, etc. and the reset itself. So a latch does NOT
# freeze "every Bash call" — only MUTATING / capability-risk commands re-block.
# This phrase is shared by every latch reason so the copy stays accurate and
# does not overstate the blast radius (run-003: the old "every subsequent Bash
# call will be blocked" wording read as a full freeze and misled the agent).
_LATCH_SCOPE_NOTE="subsequent MUTATING / capability-risk Bash commands will block until a human resets the latch; read-only commands (git status, ls, cat, …) and the reset itself still run"

danger_state_dir() {
  local project_dir="${CLAUDE_PROJECT_DIR:-.}"
  local state_dir="$project_dir/.claude/hooks/state"
  mkdir -p "$state_dir"
  printf '%s\n' "$state_dir"
}

# Shared session-id->safe-filename transform. Prefer the lib transform
# (DANGER-LATCH-UX-001) so the latch WRITER, the warn marker, and the
# reset CLEARER all agree on the filename; fall back to the identical
# inline transform if the lib was not sourced.
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
# first occurrence in a session and LATCHES on the second. The reset script
# (reset-danger-latch.sh) already sweeps danger-warn-*.json — this is the writer
# that was missing, which is why every first confirm-ask froze the session.
danger_warn_file() {
  local safe_session
  safe_session=$(_danger_safe_session "$1")
  printf '%s/danger-warn-%s.json\n' "$(danger_state_dir)" "$safe_session"
}

# Thin adapters over the canonical lib/emit.sh primitives. Kept as named
# wrappers so the 8 call-sites below stay unchanged; the envelope JSON
# lives only in lib/emit.sh (HOOK-LIB-CONSOLIDATION-001 T3a).
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
# ("allow" | "ask" | "deny") on stdout. Echoes "unavailable" when the
# classifier or python3 is missing so callers can fail closed. Used both
# by the sticky-latch read-only carve-out and the main classification path.
classify_decision() {
  local cmd="$1"
  local classifier="$SCRIPT_DIR/classify_command.py"
  if [[ ! -f "$classifier" ]] || ! command -v python3 >/dev/null 2>&1; then
    printf 'unavailable'
    return 0
  fi
  local result
  result=$(printf '%s' "$cmd" | python3 "$classifier" \
    --repo-root "${CLAUDE_PROJECT_DIR:-.}" \
    --home "$HOME" \
    --cwd "$(pwd)" 2>/dev/null) || {
    printf 'unavailable'
    return 0
  }
  printf '%s' "$result" | jq -r '.decision // "ask"' 2>/dev/null || printf 'ask'
}

# Does this command INVOKE the pack's own reset-danger-latch.sh escape hatch?
# Narrow match: the script must appear in invocation position — either as the
# command's first token (an optionally-pathed `reset-danger-latch.sh ...`) or
# immediately after a `bash`/`sh`/`.` launcher. It must NOT match the script
# named as an operand of another command (`rm -rf .../reset-danger-latch.sh`)
# or mentioned in a trailing comment (`git push --force # reset-danger-latch.sh`)
# — those are mutating commands smuggling the string, not the escape hatch.
# The leading-anchor is the whole command start (after optional whitespace),
# not any `;|&` separator, so a compound like `rm x; reset-danger-latch.sh`
# is judged by its FIRST (mutating) clause, not exempted by the trailing one.
# The reset is the documented way out of a sticky latch; gating it behind the
# very latch it clears is self-defeating.
is_reset_latch_invocation() {
  local cmd="$1"
  # Strip a leading run of whitespace, then require either:
  #   <optional dir/>reset-danger-latch.sh   at the very start, or
  #   bash|sh|. <optional dir/>reset-danger-latch.sh   at the very start.
  printf '%s' "$cmd" | grep -qE '^[[:space:]]*((bash|sh|\.)[[:space:]]+)?([^[:space:];|&]*/)?reset-danger-latch\.sh([[:space:]]|$)'
}

# Read JSON input from Claude Code
INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(printf '%s' "$INPUT" | jq -r '.tool_name // ""')
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')
# Fallback to "unknown" when no session id is available so the latch still
# engages. Multiple concurrent sessions without an id will share the "unknown"
# latch -- safer than not latching at all.
SESSION_ID=$(printf '%s' "$INPUT" | jq -r '.session_id // env.CLAUDE_SESSION_ID // env.HOOK_SESSION_ID // "unknown"')

# Only check Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

LATCH_FILE="$(danger_latch_file "$SESSION_ID")"
if [[ -f "$LATCH_FILE" ]]; then
  # The latch exists to stop further MUTATION pending a human reset — not to
  # wedge the entire session. Two carve-outs let a latched agent stay useful
  # and reach its own escape hatch:
  #
  #   1. The reset escape hatch itself. A reset-danger-latch.sh invocation is
  #      the documented way out; blocking it behind the very latch it clears
  #      is self-defeating. Let it reach the shell (its --reason audit + the
  #      human running it remain the gate).
  #   2. Read-only commands. If classify_command.py rates the CURRENT command
  #      `allow` (read-only — git log, ls, cat, caws status), let it through.
  #      A read-only command was never the danger; collateral-blocking it
  #      gives a latched agent no way to diagnose. The latch stays sticky for
  #      mutating commands (not cleared here).
  #
  # Fail-closed: if the classifier is unavailable, we do NOT bypass — the
  # command stays blocked by the latch (conservative pre-existing behavior).
  if is_reset_latch_invocation "$COMMAND"; then
    exit 0
  fi
  if [[ "$(classify_decision "$COMMAND")" == "allow" ]]; then
    exit 0
  fi

  # Surface which command FIRST engaged the latch so the agent stops
  # misattributing the block to the command it happens to be running now
  # (the latch is sticky per-session; every later MUTATING Bash call hits
  # this branch). Read the original command + reason from the latch file
  # when jq is available.
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
  REASON="CAWS command-safety: a dangerous command was previously blocked or sent for approval in this Claude session. $TRIGGER_NOTE This is a human-review boundary, not a retryable syntax error. Do not rephrase, wrap, reorder, alias, or indirectly invoke the command. You, the agent, CANNOT clear this in-band: the reset is human-only by design AND a reset run from a latched session resolves no human shell session-id. Ask the USER to run, from their own shell (use --session with THIS session id, not --current): bash .claude/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\"  (or --all to clear every latch). Sentinel: $LATCH_FILE"
  emit_block_json "$REASON"
  exit 0
fi

# --- Protect the write guard itself from shell-based self-modification ---
# (harvested from Sterling/caws-local per HOOK-PACK-DIVERGENCE-RECONCILE-001).
# Keep this narrow: only block obvious mutating commands that target the
# specific guard path, either relatively or absolutely. The classifier does
# not cover "agent rewrites the guard that is about to judge its commands,"
# so this is a dedicated pre-check before classifier delegation.
PROTECTED_HOOK_REL=".claude/hooks/worktree-write-guard.sh"
PROTECTED_HOOK_ABS="${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/worktree-write-guard.sh"
if printf '%s' "$COMMAND" | grep -qF "$PROTECTED_HOOK_REL" || printf '%s' "$COMMAND" | grep -qF "$PROTECTED_HOOK_ABS"; then
  # DANGER-LATCH-TRIGGER-DISCRIMINATION-001: the latch must fire on protected-
  # guard DESTINATION mutation, NOT on the guard merely appearing as a read/copy
  # SOURCE (e.g. `cp <guard> /tmp/fixture` or `node -e '...copyFileSync(<guard>,
  # dest)...'` for diagnostic setup). The prior predicate latched whenever the
  # guard path appeared AND any mutating-utility token appeared anywhere —
  # source-blind — which armed the sticky latch on benign fixture construction.
  #
  # Determine whether the guard is the DESTINATION of the mutation.
  _GUARD_TOKEN=""
  if printf '%s' "$COMMAND" | grep -qF "$PROTECTED_HOOK_ABS"; then
    _GUARD_TOKEN="$PROTECTED_HOOK_ABS"
  else
    _GUARD_TOKEN="$PROTECTED_HOOK_REL"
  fi
  # The guard is the LAST whitespace-delimited token (the cp/mv/install
  # destination position), ignoring a trailing `;`/`&`/`|` separator.
  _LAST_TOKEN="$(printf '%s' "$COMMAND" | sed -E 's/[[:space:]]*[;&|][[:space:]]*$//' | awk '{print $NF}')"
  _GUARD_IS_DEST=0
  [[ "$_LAST_TOKEN" == "$_GUARD_TOKEN" ]] && _GUARD_IS_DEST=1

  if printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(add|commit|status|diff|log|show)\b'; then
    # Checkpoint-oriented git flows that only stage/commit the protected file.
    :
  elif printf '%s' "$COMMAND" | grep -qE '(>>|>)[[:space:]]*'"$_GUARD_TOKEN"; then
    # Output redirect whose TARGET is the guard → in-place write → latch.
    record_danger_latch "$LATCH_FILE" "block" "shell redirect into protected guard (destination)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not redirect output into it. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(rm|tee|touch|truncate|install|chmod)[[:space:]]'; then
    # In-place file mutators that ALWAYS name the operand AS the write target.
    # The guard appearing as an operand of these IS a destination mutation → latch.
    # NOTE: sed/perl are NOT here — they only mutate in place with -i (handled
    # in the next arm). HOOK-CAPABILITY-ENGINE-003: `sed -n 40,90p <guard>` is a
    # READ (print mode) and was the dominant protected-guard false positive.
    record_danger_latch "$LATCH_FILE" "block" "shell edit of protected guard (in-place mutator)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not modify it via the shell. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(sed|perl)[[:space:]]' \
       && printf '%s' "$COMMAND" | grep -qE '(^|[[:space:]])(-i|-pi|-ip|--in-place)([[:space:]]|=|$)'; then
    # sed/perl ONLY with an in-place flag (-i / -pi / --in-place) write the file.
    # Without it (sed -n, sed -e, perl -ne, perl -pe printing to stdout) they
    # READ the guard, which is allowed. Latch only the proven in-place write.
    record_danger_latch "$LATCH_FILE" "block" "shell edit of protected guard (in-place sed/perl)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not modify it in place. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(cp|mv)[[:space:]]' && [[ "$_GUARD_IS_DEST" == "1" ]]; then
    # cp/mv ONLY when the guard is the DESTINATION (last operand). cp/mv with
    # the guard as a SOURCE (copying it OUT to a fixture) is NOT a guard mutation.
    record_danger_latch "$LATCH_FILE" "block" "shell edit of protected guard (copy/move destination)" "$COMMAND"
    emit_block_json "$PROTECTED_HOOK_REL is protected from Bash-based edits — it is the guard that enforces worktree write boundaries. Do not copy/move over it. Ask the user for permission before modifying this hook. Command was: $COMMAND"
    exit 0
  elif printf '%s' "$COMMAND" | grep -qE '(^|[;&|[:space:]])(cp|mv|node|python|python3|ruby)[[:space:]]'; then
    # The guard is referenced by a copy SOURCE or an interpreter (opaque code
    # that most likely reads/copies it OUT). This is NOT a confirmed destination
    # mutation → do NOT arm the sticky latch. ASK so a genuine in-place edit
    # still gets human review, but a diagnostic fixture copy is not punished.
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
  # Fail-closed: an unverifiable command does NOT get the warn-first grace
  # (we cannot prove it is a benign first ask). Latch immediately.
  record_danger_latch "$LATCH_FILE" "ask" "classifier unavailable" "$COMMAND"
  REASON="CAWS command-safety: command classifier unavailable; dangerous-command safety cannot verify Bash semantics. The session danger latch is NOW ARMED (fail-closed). $_LATCH_SCOPE_NOTE — you cannot reset it yourself. Ask the USER to run: bash .claude/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\". Command was: $COMMAND"
  emit_ask_json "$REASON"
  exit 0
fi

REPO_ROOT="${CLAUDE_PROJECT_DIR:-.}"
CLASSIFIER_STDERR=$(mktemp)
RESULT=$(printf '%s' "$COMMAND" | python3 "$CLASSIFIER" \
  --repo-root "$REPO_ROOT" \
  --home "$HOME" \
  --cwd "$(pwd)" 2>"$CLASSIFIER_STDERR") || {
  DIAG=$(head -c 200 "$CLASSIFIER_STDERR" 2>/dev/null || true)
  rm -f "$CLASSIFIER_STDERR"
  # Fail-closed: a classifier crash is a confirm-class ask (cannot prove safe).
  RESULT="{\"decision\":\"ask\",\"reason\":\"command classifier failed: ${DIAG:-unknown error}\",\"source\":\"classifier_error\",\"enforcement\":\"confirm\"}"
}
rm -f "$CLASSIFIER_STDERR"

DECISION=$(printf '%s' "$RESULT" | jq -r '.decision // "ask"')
REASON=$(printf '%s' "$RESULT" | jq -r '.reason // "unknown"')
# HOOK-ASK-ENFORCEMENT-001: enforcement is the wrapper contract; source is
# diagnostic provenance. enforcement is ALWAYS present from a healthy classifier;
# when ABSENT (an older classifier, or a hand-built RESULT), default conservatively
# by decision so this slice never weakens an existing consumer: deny->block,
# allow->pass, ask->advisory (preserves CATASTROPHIC-ONLY-001 for un-tagged asks).
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
    # DANGER-LATCH-APPROVAL-AND-FEEDBACK-001: deny latches IMMEDIATELY on the
    # first occurrence — there is no safe single use of a deny-class command
    # (rm -rf /, force-push), so the warn-first grace does NOT apply.
    record_danger_latch "$LATCH_FILE" "$DECISION" "$REASON" "$COMMAND"
    FULL_REASON="CAWS command-safety: $REASON. This is a HARD BLOCK (catastrophic deny) and the session danger latch is NOW ARMED. $_LATCH_SCOPE_NOTE — you CANNOT reset it yourself. Do not rephrase, wrap, reorder, alias, or indirectly invoke this command (e.g. via 'command git ...', 'env ... git ...', 'bash -lc \"...\"', or 'git --bare init'). Ask the USER to run: bash .claude/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\", then ask for the next step. Command was: $COMMAND"
    emit_block_json "$FULL_REASON"
    exit 0
    ;;
  ask)
    # HOOK-ASK-ENFORCEMENT-001 — ask is no longer uniformly advisory. It splits
    # by ENFORCEMENT (the wrapper contract the classifier emits):
    #
    #   enforcement=confirm  — a CAPABILITY-derived ask (the facet lattice /
    #     opaque-exec produced it; it carries structured semantic evidence:
    #     kind=DESTROY/MUTATE, reversibility, scope) OR a fail-closed
    #     classifier_error/sidecar_error ask. These are operationally meaningful
    #     risk: block the FIRST occurrence with a human-confirmation message and
    #     record the latch. The message is DISTINCT from a catastrophic deny
    #     ("requires confirmation," not "hard block") so operators don't learn to
    #     ignore all friction.
    #
    #   enforcement=advisory — a LEGACY/family/regex ask (unknown git/gh/npm
    #     subcommand, git rebase/cherry-pick/commit --amend, rm/find heuristics).
    #     This is uncertainty, NOT graded capability risk. Preserve CAWS-DANGER-
    #     LATCH-CATASTROPHIC-ONLY-001: surface the reason on stderr as a non-
    #     blocking advisory, then exit 0. No latch, no block.
    #
    # Transition architecture: legacy-family advisory is a compatibility class
    # that shrinks as families are remapped into the capability substrate. The
    # bare `ask -> block` rule is explicitly rejected — it would recreate the
    # over-governance CATASTROPHIC-ONLY-001 correctly removed.
    if [[ "$ENFORCEMENT" == "confirm" ]]; then
      # DANGER-LATCH-APPROVAL-AND-FEEDBACK-001 (restored, HOOK-CAPABILITY-ENGINE-003):
      # warn-first grace for CAPABILITY-derived confirm asks. The first such ask
      # in a session WARNS (non-blocking, exit 0) and drops a session warn
      # marker; the SECOND distinct capability ask LATCHES. Rationale from the
      # field + corpus audit: a single capability ask (kill a dev server, one
      # `docker run`, a read-only `python3 -c` the opacity heuristic can't prove)
      # is routine and was the dominant false-positive freeze. A SECOND capability
      # ask in the same session is the thrash signature the latch exists to stop.
      #
      # Fail-closed asks (classifier_error / sidecar_error) do NOT get the grace —
      # we cannot prove they are safe, so they latch immediately (preserved below).
      if [[ "$SOURCE" == "capability" ]]; then
        WARN_FILE="$(danger_warn_file "$SESSION_ID")"
        if [[ ! -f "$WARN_FILE" ]]; then
          # First capability ask: warn, record the marker, let it run.
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
        # Second (or later) capability ask this session: latch now.
        record_danger_latch "$LATCH_FILE" "ask" "$REASON" "$COMMAND"
        FULL_REASON="CAWS command-safety: $REASON. This is the SECOND capability-risk command this session — the first was a non-blocking warning; this one ARMS the session danger latch. $_LATCH_SCOPE_NOTE — you CANNOT reset it yourself. Do not rephrase, wrap, reorder, alias, or indirectly invoke the command to evade this. Ask the USER to confirm and run: bash .claude/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe / approved>\", then proceed. Command was: $COMMAND"
        emit_block_json "$FULL_REASON"
        exit 0
      fi
      # Non-capability confirm (classifier_error / sidecar_error): fail-closed,
      # no grace — latch on first occurrence.
      record_danger_latch "$LATCH_FILE" "ask" "$REASON" "$COMMAND"
      FULL_REASON="CAWS command-safety: $REASON. This requires USER CONFIRMATION before it runs and the session danger latch is NOW ARMED (fail-closed: the classifier could not verify this command). $_LATCH_SCOPE_NOTE — you CANNOT reset it yourself. Do not rephrase, wrap, reorder, alias, or indirectly invoke the command to evade this. Ask the USER to confirm and run: bash .claude/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe / approved>\", then proceed. Command was: $COMMAND"
      emit_block_json "$FULL_REASON"
      exit 0
    fi
    # advisory (and any non-confirm enforcement): non-blocking, exit 0.
    printf 'caws advisory (non-blocking): %s\n' "$REASON" >&2
    exit 0
    ;;
  *)
    # Unknown decision value -- malformed classifier output. Do NOT fall
    # through to the weaker regex fallback; ask+latch instead so a
    # corrupted classifier cannot silently downgrade safety.
    # Fail-closed: malformed classifier output does NOT get the warn grace.
    record_danger_latch "$LATCH_FILE" "ask" "classifier unknown decision: $DECISION" "$COMMAND"
    FULL_REASON="CAWS command-safety: command classifier returned an unrecognized decision '$DECISION'. The session danger latch is NOW ARMED (fail-closed). $_LATCH_SCOPE_NOTE — you cannot reset it yourself. Ask the USER to run: bash .claude/hooks/reset-danger-latch.sh --session $SESSION_ID --reason \"<why this is safe>\". Command was: $COMMAND"
    emit_ask_json "$FULL_REASON"
    exit 0
    ;;
esac

# Every classifier outcome (allow/deny/ask/unknown) exits inside the case
# above. There is no flat-regex fallback; if classify_command.py cannot run,
# the early-exit at the top of this script ask-latches the command. That
# keeps the dangerous-command decision in a single semantic layer.

# shellcheck disable=SC2317  # Defense-in-depth tail; unreachable on a healthy classifier.
exit 0
