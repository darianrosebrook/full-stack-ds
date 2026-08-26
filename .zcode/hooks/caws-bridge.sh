#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: zcode
# hook_pack_version: 2
# caws_min_major: 11
# lineage_refs: (new in CAWS-ZCODE-AGENT-SURFACE-001)
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting the re-wrap contract to dodge a block instead of fixing the
#   cause. Grow everything else freely.
# ---------------------------------------------------------------------------
# CAWS-BRIDGE-ZCODE (repo-local, hand-authored)
# surface: zcode
# governance: ZCODE-CAWS-BRIDGE-01
# status: prototype — adapts CAWS shared dispatchers for ZCode's strict-JSON
#   hook output contract. Modeled on the opencode bridge (.opencode/plugins/
#   caws.ts): reuses the shared dispatcher tree, does not duplicate handlers.
#
# What this is: ZCode's hook runner parses stdout as JSON against a strict
# schema (extra keys → reject, non-JSON → hook.run.failed). The CAWS shared
# dispatchers produce valid JSON for PreToolUse, PostToolUse, and Stop (via
# emit.sh). The SessionStart dispatcher's session-caws-status.sh handler
# produces plain-text banners (worktree roster, risk briefing, doctor state)
# via echo — valid under Claude Code (free-form text → context), rejected
# by ZCode.
#
# This bridge sits between .zcode/config.json and the CAWS dispatchers:
#   1. Runs the dispatcher with CAWS_AGENT_SURFACE=zcode injected
#   2. Captures stdout and the dispatcher's exit code
#   3. If stdout is empty or already valid JSON → pass through as-is
#   4. If stdout is non-JSON text → re-wrap as a valid additionalContext
#      envelope so ZCode's parser accepts it
#   5. Passes the dispatcher's exit code through (block decisions preserved)
#
# Usage (from .zcode/config.json):
#   caws-bridge.sh <EventName> <dispatcher-path>
#   e.g. caws-bridge.sh SessionStart "${ZCODE_PROJECT_DIR}/.caws/hooks/dispatch/session_start.sh"

set -euo pipefail

EVENT_NAME="${1:-}"
DISPATCHER="${2:-}"

if [[ -z "$DISPATCHER" ]]; then
  echo "[caws-bridge.sh] ERROR: dispatcher path required as second argument" >&2
  exit 1
fi

if [[ ! -x "$DISPATCHER" ]]; then
  echo "[caws-bridge.sh] WARNING: dispatcher not found or not executable: $DISPATCHER" >&2
  exit 0
fi

# Capture stdin (so the dispatcher can consume it once).
STDIN_FILE="$(mktemp)"
trap 'rm -f "$STDIN_FILE"' EXIT
cat > "$STDIN_FILE"

# Run the dispatcher with ZCode surface identity injected.
EXIT_CODE=0
STDOUT_FILE="$(mktemp)"
STDERR_FILE="$(mktemp)"
trap 'rm -f "$STDIN_FILE" "$STDOUT_FILE" "$STDERR_FILE"' EXIT

CAWS_AGENT_SURFACE=zcode \
  ZCODE_PROJECT_DIR="${ZCODE_PROJECT_DIR:-}" \
  bash "$DISPATCHER" < "$STDIN_FILE" \
    > "$STDOUT_FILE" 2> "$STDERR_FILE" || EXIT_CODE=$?

# Relay dispatcher stderr so ZCode logs diagnostics.
if [[ -s "$STDERR_FILE" ]]; then
  cat "$STDERR_FILE" >&2
fi

# Read stdout.
STDOUT="$(cat "$STDOUT_FILE")"
# Trim leading/trailing whitespace.
STDOUT_TRIMMED="${STDOUT#"${STDOUT%%[![:space:]]*}"}"
STDOUT_TRIMMED="${STDOUT_TRIMMED%"${STDOUT_TRIMMED##*[![:space:]]}"}"

# Empty stdout → emit nothing, pass exit code through.
if [[ -z "$STDOUT_TRIMMED" ]]; then
  exit "$EXIT_CODE"
fi

# Detect whether stdout starts with non-JSON text (has content before the
# first '{'). This catches the SessionStart banner case.
_FIRST_BRACE="${STDOUT_TRIMMED%%\{*}"

if [[ -n "${_FIRST_BRACE:-}" ]]; then
  # Non-JSON text before any JSON object — wrap as additionalContext.
  if command -v jq >/dev/null 2>&1; then
    jq -n --arg event "$EVENT_NAME" --arg text "$STDOUT" \
      '{ hookSpecificOutput: { hookEventName: $event, additionalContext: $text } }'
  else
    _escaped="${STDOUT//\\/\\\\}"
    _escaped="${_escaped//\"/\\\"}"
    _escaped="${_escaped//$'\n'/\\n}"
    _escaped="${_escaped//$'\t'/\\t}"
    _escaped="${_escaped//$'\r'/\\r}"
    _event_escaped="${EVENT_NAME//\\/\\\\}"
    _event_escaped="${_event_escaped//\"/\\\"}"
    printf '{ "hookSpecificOutput": { "hookEventName": "%s", "additionalContext": "%s" } }\n' \
      "$_event_escaped" "$_escaped"
  fi
  exit "$EXIT_CODE"
fi

# Stdout starts with '{' — it may be valid JSON (the common case for
# PreToolUse/PostToolUse). The dispatcher may emit multiple concatenated
# JSON objects (one per handler). Priority: decision-bearing objects (block/
# ask) win over advisory (additionalContext). If multiple decisions exist,
# the first one wins (the guard that fired first). This mirrors the opencode
# bridge's parseDecision + lastJsonObject logic.
if command -v jq >/dev/null 2>&1; then
  # Write stdout to a temp file so jq can read it reliably (piping via
  # printf to 'jq inputs' is unreliable; file-based jq is deterministic).
  _JSON_FILE="$(mktemp)"
  printf '%s' "$STDOUT" > "$_JSON_FILE"
  # Extract all JSON objects from the stream, then pick the authoritative one.
  AUTHORITATIVE=$(jq -s '[
      # Collect all objects from concatenated stream
      .[] | select(type == "object")
    ] | (
        # First: any object with a top-level "decision" field (block)
        map(select(.decision)) | first // empty
      ) // (
        # Second: any hookSpecificOutput with permissionDecision (ask/deny)
        map(select(.hookSpecificOutput.permissionDecision)) | first // empty
      ) // (
        # Fallback: the last object (additionalContext wins over earlier context)
        last // empty
      )' "$_JSON_FILE" 2>/dev/null) || true
  rm -f "$_JSON_FILE"
  if [[ -n "$AUTHORITATIVE" ]]; then
    printf '%s\n' "$AUTHORITATIVE"
    exit "$EXIT_CODE"
  fi
  # Had '{' but nothing parsed — treat full output as text, wrap it.
  jq -n --arg event "$EVENT_NAME" --arg text "$STDOUT" \
    '{ hookSpecificOutput: { hookEventName: $event, additionalContext: $text } }'
  exit "$EXIT_CODE"
else
  # No jq — trust stdout starting with '{' is valid JSON.
  printf '%s\n' "$STDOUT"
  exit "$EXIT_CODE"
fi
