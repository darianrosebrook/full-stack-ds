#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 8,16
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
# Shared Claude Code hook-output envelope emitters.
#
# Claude Code reads a hook's stdout as JSON to decide block / ask /
# inject-context. Before HOOK-LIB-CONSOLIDATION-001 T3a, 12 hooks each
# hand-rolled these envelopes under 5+ different function names
# (emit_block_json/emit_ask_json, guard_emit_block/guard_emit_permission_ask/
# guard_emit_warning_allow, emit_post_context, plus raw inline jq -n /
# printf). That is the same envelope copy-pasted with cosmetic naming
# drift; if Claude Code's hook-output contract ever changes, it would be
# a 12-file edit. This file is the single place those envelopes live.
#
# There are exactly THREE envelope shapes the pack emits:
#
#   1. block            { "decision": "block", "reason": <msg> }
#                       PreToolUse hard block. Pair with `exit 2`.
#
#   2. ask              { "hookSpecificOutput": {
#                           "hookEventName": "PreToolUse",
#                           "permissionDecision": "ask",
#                           "permissionDecisionReason": <msg> } }
#                       PreToolUse user-approval prompt.
#
#   3. additionalContext { "hookSpecificOutput": {
#                            "hookEventName": <event>,
#                            "additionalContext": <msg> } }
#                       Inject advisory text without blocking. Used by
#                       both PreToolUse (warn/allow) and PostToolUse.
#
# Functions:
#   emit_block <reason>
#       Print the block envelope. Caller still controls the exit code
#       (Claude Code honors `decision: block` regardless, but the pack
#       convention is to follow with `exit 2`).
#
#   emit_ask <reason>
#       Print the PreToolUse permission-ask envelope.
#
#   emit_additional_context <message> [event]
#       Print the additionalContext envelope. <event> defaults to
#       "PreToolUse"; pass "PostToolUse" from PostToolUse hooks.
#
# Implementation: jq when available (canonical), with a pure-bash
# JSON-string-escaping printf fallback so the envelopes still emit valid
# JSON on a runner without jq. The fallback escapes the five JSON string
# metacharacters (\ " newline tab carriage-return) — sufficient for the
# message strings these hooks produce.

# Guard against double-sourcing.
if [[ -n "${_CAWS_EMIT_SH_LOADED:-}" ]]; then
  return 0 2>/dev/null || exit 0
fi
_CAWS_EMIT_SH_LOADED=1

# _emit_json_escape <string>
#   Escape a string for embedding in a JSON double-quoted value. Used by
#   the printf fallback path only (jq does its own escaping).
_emit_json_escape() {
  local s="${1:-}"
  s="${s//\\/\\\\}"   # backslash first
  s="${s//\"/\\\"}"   # double quote
  s="${s//$'\n'/\\n}" # newline
  s="${s//$'\t'/\\t}" # tab
  s="${s//$'\r'/\\r}" # carriage return
  printf '%s' "$s"
}

emit_block() {
  local reason="${1:-}"
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg msg "$reason" '{ decision: "block", reason: $msg }'
  else
    printf '{ "decision": "block", "reason": "%s" }\n' "$(_emit_json_escape "$reason")"
  fi
}

emit_ask() {
  local reason="${1:-}"
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg msg "$reason" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: $msg
      }
    }'
  else
    printf '{ "hookSpecificOutput": { "hookEventName": "PreToolUse", "permissionDecision": "ask", "permissionDecisionReason": "%s" } }\n' \
      "$(_emit_json_escape "$reason")"
  fi
}

emit_additional_context() {
  local message="${1:-}"
  local event="${2:-PreToolUse}"
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg msg "$message" --arg ev "$event" '{
      hookSpecificOutput: {
        hookEventName: $ev,
        additionalContext: $msg
      }
    }'
  else
    printf '{ "hookSpecificOutput": { "hookEventName": "%s", "additionalContext": "%s" } }\n' \
      "$(_emit_json_escape "$event")" "$(_emit_json_escape "$message")"
  fi
}
