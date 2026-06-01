#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 11
# caws_min_major: 11
# lineage_refs: 8,16
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
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

  # CAWS-SESSION-ID-DURABLE-HOOK-ENVELOPE-001: write/refresh the
  # durable session envelope so agent-Bash CLI invocations (which
  # don't inherit HOOK_SESSION_ID) can recover the harness session id
  # via the on-disk bridge. Skipped when session id is missing/unknown
  # (the resolver refuses literal "unknown" anyway). Non-fatal on any
  # error — the hook must never block on this cache write.
  _write_durable_session_envelope
}

# CAWS-SESSION-ID-DURABLE-HOOK-ENVELOPE-001
# Write/refresh `<repo_root>/tmp/<session_id>/.session-envelope.json`.
# Called from parse_hook_input after exports are set. Idempotent.
# Preserves created_at across refreshes; updates last_seen_at to now.
# All failures are silently swallowed; hooks MUST NOT block on cache.
_write_durable_session_envelope() {
  # Refuse missing/unknown/empty session id. The resolver refuses the
  # literal "unknown" so writing it would just produce a stale file
  # that gets skipped on read.
  local sid="${HOOK_SESSION_ID:-}"
  if [[ -z "$sid" || "$sid" == "unknown" ]]; then
    return 0
  fi

  # CANONICAL repo root via git. CAWS-SESSION-LOG-RELOCATE-001: per-session
  # state lives under <canonical>/.caws/sessions/, not repo-root tmp/. We
  # resolve git-common-dir's parent (the canonical checkout) so a linked
  # worktree writes to the canonical .caws/sessions/, and so the envelope's
  # repo_root FIELD matches the resolver's canonical repoRoot
  # (path.dirname(cawsDir)). If HOOK_CWD is empty or git fails, skip.
  local cwd="${HOOK_CWD:-$PWD}"
  local repo_root common
  common=$(cd "$cwd" 2>/dev/null && git rev-parse --git-common-dir 2>/dev/null) || return 0
  [[ -z "$common" ]] && return 0
  case "$common" in
    /*) : ;;
    *)  common="$cwd/$common" ;;
  esac
  repo_root=$(cd "$common/.." 2>/dev/null && pwd -P) || return 0
  [[ -z "$repo_root" ]] && return 0
  # Only write where a .caws/ exists (a real CAWS project).
  [[ -d "$repo_root/.caws" ]] || return 0

  local envelope_dir="$repo_root/.caws/sessions/$sid"
  local envelope_path="$envelope_dir/.session-envelope.json"
  mkdir -p "$envelope_dir" 2>/dev/null || return 0

  # Preserve created_at from existing envelope (refresh semantics).
  # Use python for JSON read; if parse fails, treat as new envelope.
  local now created_at
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  created_at="$now"
  if [[ -f "$envelope_path" ]]; then
    local existing_created
    existing_created=$(python3 -c '
import json, sys
try:
    with open(sys.argv[1]) as f:
        d = json.load(f)
    v = d.get("created_at")
    if isinstance(v, str) and v:
        print(v)
except Exception:
    pass
' "$envelope_path" 2>/dev/null)
    if [[ -n "$existing_created" ]]; then
      created_at="$existing_created"
    fi
  fi

  # Atomic write: temp file + rename. tmpfile is in the same dir to
  # guarantee same-filesystem rename atomicity.
  local tmpfile="$envelope_dir/.session-envelope.tmp.$$"
  python3 -c '
import json, sys
payload = {
    "session_id": sys.argv[1],
    "repo_root": sys.argv[2],
    "created_at": sys.argv[3],
    "last_seen_at": sys.argv[4],
    "hook_event": sys.argv[5],
}
with open(sys.argv[6], "w") as f:
    json.dump(payload, f)
    f.write("\n")
' "$sid" "$repo_root" "$created_at" "$now" "${HOOK_EVENT_NAME:-unknown}" "$tmpfile" 2>/dev/null || {
    rm -f "$tmpfile" 2>/dev/null
    return 0
  }
  mv -f "$tmpfile" "$envelope_path" 2>/dev/null || {
    rm -f "$tmpfile" 2>/dev/null
    return 0
  }

  # CAWS-WORKTREE-OWNERSHIP-HARNESS-ID-001: also write/refresh the per-repo
  # caller-session pointer at `<repo_root>/.caws/sessions/.caller-session.json`
  # (CAWS-SESSION-LOG-RELOCATE-001 moved it out of repo-root tmp/). In
  # agent-Bash, HOOK_SESSION_ID is not in the env, so the resolver cannot
  # tell which of several fresh sibling envelopes is the caller's. This
  # pointer names the session that most recently fired a hook in this repo
  # — the actively-working caller — so the resolver can disambiguate the
  # >=2-fresh-envelope case to the caller's own envelope. Evidence only:
  # the resolver treats absent/stale/non-matching pointers as "refuse",
  # never as a guess. Reuses sid / repo_root / now from above.
  local pointer_dir="$repo_root/.caws/sessions"
  local pointer_path="$pointer_dir/.caller-session.json"
  local pointer_tmp="$pointer_dir/.caller-session.tmp.$$"
  mkdir -p "$pointer_dir" 2>/dev/null || return 0
  python3 -c '
import json, sys
payload = {
    "session_id": sys.argv[1],
    "repo_root": sys.argv[2],
    "last_seen_at": sys.argv[3],
}
with open(sys.argv[4], "w") as f:
    json.dump(payload, f)
    f.write("\n")
' "$sid" "$repo_root" "$now" "$pointer_tmp" 2>/dev/null || {
    rm -f "$pointer_tmp" 2>/dev/null
    return 0
  }
  mv -f "$pointer_tmp" "$pointer_path" 2>/dev/null || {
    rm -f "$pointer_tmp" 2>/dev/null
    return 0
  }
  return 0
}
