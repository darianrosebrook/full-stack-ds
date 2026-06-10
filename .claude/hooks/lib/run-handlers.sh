#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 15
# caws_min_major: 11
# lineage_refs: 8,16
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
# Shared handler-dispatch loop for Claude Code hook dispatchers.
#
# Source this file from a dispatcher script, then call:
#
#   run_handlers [--short-circuit-on-block] <handler-entry>...
#
# Each handler-entry is a whitespace-separated string whose first token is
# the handler script filename (relative to HOOKS_DIR) and whose remaining
# tokens are positional arguments forwarded to that script. Example:
#
#   run_handlers "cwd-guard.sh" "audit.sh tool-use" "session-log.sh"
#
# The caller must set HOOKS_DIR before sourcing this file (the dispatcher
# boilerplate does this already).
#
# Environment variables consumed:
#   HOOK_INPUT_JSON       — the sanitized JSON payload piped to every handler.
#                           If not yet set, parse_hook_input is called to
#                           populate it along with all HOOK_* scalar vars.
#   CLAUDE_HOOK_DRY_RUN   — if non-empty and non-zero, still invoke every
#                           handler but always return 0 from run_handlers and
#                           emit "[DRY-RUN] <handler>.sh would have exited <N>"
#                           to stderr for any non-zero exit.
#   CLAUDE_HOOK_TIMING    — if non-empty and non-zero, emit
#                           "[timing] <handler>.sh: <N>ms" to stderr after
#                           each handler invocation. Does not affect exit codes
#                           or stdout behavior.
#
# Stdout: the last non-empty buffer written to a handler's stdout is forwarded
#         to run_handlers' caller's stdout ("last wins").
#
# Return value: the maximum exit code across all handlers (or 2 immediately if
#               --short-circuit-on-block is set and any handler exits 2). When
#               CLAUDE_HOOK_DRY_RUN is set the effective return is always 0.
#
# Idempotent source: safe to source multiple times.

if [[ -n "${_HOOK_RUN_HANDLERS_LOADED:-}" ]]; then
  return 0 2>/dev/null || exit 0
fi
_HOOK_RUN_HANDLERS_LOADED=1

# ---------------------------------------------------------------------------
# _rh_is_truthy <value>
# Returns 0 (true) when value is non-empty and not "0".
# ---------------------------------------------------------------------------
_rh_is_truthy() {
  local val="${1:-}"
  [[ -n "$val" && "$val" != "0" ]]
}

# ---------------------------------------------------------------------------
# _rh_ms_now
# Prints current Unix time in milliseconds (integer).
# Uses date +%s%N if available, falls back to python3.
# ---------------------------------------------------------------------------
_rh_ms_now() {
  local ns
  ns=$(date +%s%N 2>/dev/null)
  # macOS date does not support %N; it prints literally "%N"
  if [[ "$ns" == *%N* ]]; then
    python3 -c 'import time; print(int(time.time() * 1000))'
  else
    printf '%d\n' "$(( ns / 1000000 ))"
  fi
}

_rh_stdout_priority() {
  local payload="$1"
  local decision
  decision=$(printf '%s' "$payload" | jq -r '.decision // .hookSpecificOutput.permissionDecision // ""' 2>/dev/null || true)
  case "$decision" in
    block) printf '3\n' ;;
    ask) printf '2\n' ;;
    *) printf '1\n' ;;
  esac
}

# ---------------------------------------------------------------------------
# run_handlers [--short-circuit-on-block] <handler-entry>...
# ---------------------------------------------------------------------------
run_handlers() {
  local short_circuit=0
  if [[ "${1:-}" == "--short-circuit-on-block" ]]; then
    short_circuit=1
    shift
  fi

  # Ensure the input is parsed and HOOK_INPUT_JSON is available.
  # parse-input.sh is idempotent (guarded by _HOOK_PARSE_INPUT_LOADED).
  if [[ -z "${HOOK_INPUT_JSON:-}" ]]; then
    # HOOKS_DIR must be set by the caller (dispatcher boilerplate).
    # shellcheck source=parse-input.sh
    source "${HOOKS_DIR}/lib/parse-input.sh" 2>/dev/null || return 0
    parse_hook_input || return 0
  fi

  local dry_run=0
  _rh_is_truthy "${CLAUDE_HOOK_DRY_RUN:-}" && dry_run=1

  local timing=0
  _rh_is_truthy "${CLAUDE_HOOK_TIMING:-}" && timing=1

  local max_exit=0
  local last_stdout=""
  local last_stdout_priority=0

  # Snapshot the outer $@ into an array so `set --` inside the loop can safely
  # clobber positional params without breaking iteration. Using "$@" directly
  # with `for entry in "$@"` captures at loop start on modern bash, but this
  # is safer across shells and makes the intent explicit.
  local entries
  entries=("$@")

  local entry
  for entry in "${entries[@]}"; do
    # Split on whitespace: first token = script, rest = positional args.
    # shellcheck disable=SC2086
    set -- $entry
    local handler="$1"
    shift
    # "$@" now holds the handler's positional args (may be empty). Use it
    # directly rather than stashing into a local array -- bash 3.2 (macOS
    # default) has quirky ${arr[@]+"${arr[@]}"} expansion behavior for
    # empty arrays under set -u in certain command-substitution contexts.
    # "$@" has no such quirks: empty positional params under set -u is a
    # normal, non-error case.

    local handler_path="${HOOKS_DIR}/${handler}"
    if [[ ! -x "$handler_path" ]]; then
      continue
    fi

    local t_start=0
    if (( timing )); then
      t_start=$(_rh_ms_now)
    fi

    local stderr_file
    stderr_file=$(mktemp)
    local stdout_buf
    stdout_buf=$(printf '%s' "$HOOK_INPUT_JSON" \
                  | "$handler_path" "$@" 2>"$stderr_file")
    local exit_code=$?

    local t_elapsed=0
    if (( timing )); then
      local t_end
      t_end=$(_rh_ms_now)
      t_elapsed=$(( t_end - t_start ))
    fi

    # Re-emit handler stderr prefixed with handler name.
    if [[ -s "$stderr_file" ]]; then
      while IFS= read -r line; do
        printf '[%s] %s\n' "$handler" "$line" >&2
      done < "$stderr_file"
    fi
    rm -f "$stderr_file"

    # Timing annotation (after handler stderr so they don't interleave).
    if (( timing )); then
      printf '[timing] %s: %dms\n' "$handler" "$t_elapsed" >&2
    fi

    # Dry-run annotation for non-zero exits.
    if (( dry_run )) && (( exit_code != 0 )); then
      printf '[DRY-RUN] %s would have exited %d\n' "$handler" "$exit_code" >&2
      exit_code=0
    fi

    # Accumulate stdout. Structured block/ask decisions outrank lower-priority
    # hook context so a later handler cannot accidentally erase a safety
    # boundary emitted by an earlier handler.
    if [[ -n "$stdout_buf" ]]; then
      local stdout_priority
      stdout_priority=$(_rh_stdout_priority "$stdout_buf")
      if [[ "$stdout_priority" -eq 3 ]]; then
        printf '%s\n' "$stdout_buf"
        return 2
      fi
      if [[ "$stdout_priority" -ge "$last_stdout_priority" ]]; then
        last_stdout="$stdout_buf"
        last_stdout_priority="$stdout_priority"
      fi
    fi

    # Short-circuit on blocking exit (exit 2), unless dry-run zeroed it.
    if (( short_circuit )) && [[ "$exit_code" -eq 2 ]]; then
      [[ -n "$last_stdout" ]] && printf '%s\n' "$last_stdout"
      return 2
    fi

    if [[ "$exit_code" -gt "$max_exit" ]]; then
      max_exit="$exit_code"
    fi
  done

  [[ -n "$last_stdout" ]] && printf '%s\n' "$last_stdout"

  if (( dry_run )); then
    return 0
  fi
  return "$max_exit"
}
