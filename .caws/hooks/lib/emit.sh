#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 8,16
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
# Shared hook-output envelope emitters (surface-neutral default).
#
# This is the shared/default version of emit.sh, derived from the Claude Code
# baseline. It implements the "ask" permission vocabulary. Vendor adapters that
# need different behavior (e.g. codex maps "ask" -> "deny") install an override
# at $CAWS_PROJECT_DIR/$CAWS_VENDOR_DIR/hooks/lib/emit.sh. The override is
# resolved by caws_source_lib (defined in lib/agent-surface.sh).
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
#       (the harness honors `decision: block` regardless, but the pack
#       convention is to follow with `exit 2`).
#
#   emit_ask <reason>
#       Print the PreToolUse permission-ask envelope.
#       NOTE: surfaces where "ask" is not supported (e.g. Codex) install
#       a vendor override that maps this to "deny". See codex adapter.
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
