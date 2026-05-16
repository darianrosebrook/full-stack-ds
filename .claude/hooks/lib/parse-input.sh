#!/bin/bash
# Shared hook input parser for Claude Code hooks.
#
# Handlers source this file and call `parse_hook_input` to get HOOK_* env
# vars populated from the tool-call payload. This replaces the per-handler
# pattern of `INPUT=$(read_hook_input_json)` followed by 3-5 `jq` calls.
#
# Two invocation modes:
#   1. Standalone handler (legacy): reads stdin via read_hook_input_json,
#      parses, exports HOOK_*.
#   2. Via dispatcher (planned Phase 2): HOOK_INPUT_JSON already exported
#      by the router; parse_hook_input just re-extracts scalar fields.
#
# Why one shared parser: before this lib, each of 17 handlers independently
# ran read_hook_input_json + 3-5 jq calls on the same payload. A bug in the
# parser (like the control-char failure fixed in runtime-paths.sh) ripples
# to every handler. One parser, one bug surface, one fix.
#
# Idempotent source: safe to source multiple times.

if [[ -n "${_HOOK_PARSE_INPUT_LOADED:-}" ]]; then
  return 0 2>/dev/null || exit 0
fi
_HOOK_PARSE_INPUT_LOADED=1

_hook_lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../runtime-paths.sh
source "$_hook_lib_dir/../runtime-paths.sh"

parse_hook_input() {
  # Fast path: the dispatcher already parsed the input and exported
  # HOOK_* env vars to the handler's environment. Re-extracting from
  # HOOK_INPUT_JSON would be a wasted python subprocess. HOOK_TOOL_NAME
  # is the canonical "parse completed" marker -- after a completed parse
  # it's always defined (possibly empty for malformed input), so the
  # `${HOOK_TOOL_NAME+set}` test distinguishes "parser ran" from
  # "handler invoked standalone and parser hasn't run yet".
  if [[ -n "${HOOK_TOOL_NAME+set}" ]]; then
    return 0
  fi

  # If HOOK_INPUT_JSON is set but HOOK_TOOL_NAME is not, a caller staged
  # the sanitized payload but didn't run the extractor. Extract now.
  # Otherwise (standalone handler), read stdin via the sanitizer.
  if [[ -z "${HOOK_INPUT_JSON:-}" ]]; then
    HOOK_INPUT_JSON="$(read_hook_input_json)"
    export HOOK_INPUT_JSON
  fi

  # Extract all common scalar fields in ONE python call, emitting
  # shlex-quoted bash assignments. Compared to 3-5 separate `jq` calls,
  # this is one subprocess per handler instead of many. Values are sh-safe
  # via shlex.quote, so `eval` is not a code-injection hazard.
  local assignments
  assignments=$(printf '%s' "$HOOK_INPUT_JSON" | python3 -c '
import json
import shlex
import sys

try:
    data = json.loads(sys.stdin.read() or "{}")
except Exception:
    data = {}
if not isinstance(data, dict):
    data = {}

tool_input = data.get("tool_input")
if not isinstance(tool_input, dict):
    tool_input = {}

tool_response = data.get("tool_response")
if not isinstance(tool_response, dict):
    tool_response = {}

fields = {
    "HOOK_TOOL_NAME": data.get("tool_name") or "",
    "HOOK_FILE_PATH": tool_input.get("file_path") or "",
    "HOOK_COMMAND": tool_input.get("command") or "",
    "HOOK_CWD": data.get("cwd") or "",
    "HOOK_SESSION_ID": data.get("session_id") or "unknown",
    "HOOK_TRANSCRIPT_PATH": data.get("transcript_path") or "",
    "HOOK_EVENT_NAME": data.get("hook_event_name") or "",
    "HOOK_MODEL": data.get("model") or "",
    "HOOK_SOURCE": data.get("source") or "",
    "HOOK_PERMISSION_MODE": data.get("permission_mode") or "default",
    "HOOK_TOOL_USE_ID": data.get("tool_use_id") or "",
    "HOOK_STOP_HOOK_ACTIVE": "1" if data.get("stop_hook_active") else "0",
    # Whole objects as JSON strings -- consumed by audit.sh for log payloads.
    # Always valid JSON ("{}" at minimum) so `jq --argjson` works without
    # a defensive check in every caller.
    "HOOK_TOOL_INPUT_JSON": json.dumps(tool_input),
    "HOOK_TOOL_RESPONSE_JSON": json.dumps(tool_response),
}

for k, v in fields.items():
    print(f"{k}={shlex.quote(str(v))}")
' 2>/dev/null || true)

  # Fail-open: if the python subprocess failed for any reason, leave
  # HOOK_* vars unset/empty. Handlers will see empty tool_name and
  # short-circuit on their own matcher predicate. Guard infrastructure
  # must never block a tool call because its parser crashed.
  if [[ -n "$assignments" ]]; then
    eval "$assignments"
  fi

  export HOOK_TOOL_NAME="${HOOK_TOOL_NAME:-}" \
         HOOK_FILE_PATH="${HOOK_FILE_PATH:-}" \
         HOOK_COMMAND="${HOOK_COMMAND:-}" \
         HOOK_CWD="${HOOK_CWD:-}" \
         HOOK_SESSION_ID="${HOOK_SESSION_ID:-unknown}" \
         HOOK_TRANSCRIPT_PATH="${HOOK_TRANSCRIPT_PATH:-}" \
         HOOK_EVENT_NAME="${HOOK_EVENT_NAME:-}" \
         HOOK_MODEL="${HOOK_MODEL:-}" \
         HOOK_SOURCE="${HOOK_SOURCE:-}" \
         HOOK_PERMISSION_MODE="${HOOK_PERMISSION_MODE:-default}" \
         HOOK_TOOL_USE_ID="${HOOK_TOOL_USE_ID:-}" \
         HOOK_STOP_HOOK_ACTIVE="${HOOK_STOP_HOOK_ACTIVE:-0}" \
         HOOK_TOOL_INPUT_JSON="${HOOK_TOOL_INPUT_JSON:-{\}}" \
         HOOK_TOOL_RESPONSE_JSON="${HOOK_TOOL_RESPONSE_JSON:-{\}}"
}
