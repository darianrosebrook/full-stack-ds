#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 24
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
#
# CAWS Secrets Scanner
#
# Advisory: scans Write/Edit content for common secret patterns (API keys,
# tokens, passwords). Always exit 0; this is observability, not a blocker.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/agent-surface.sh
# Provides caws_source_lib (used immediately below to load emit.sh). A fatal
# `source <missing>` under `set -euo pipefail` is NOT caught by `|| true`, which
# silently killed this advisory (CAWS-HOOK-SOURCE-GUARD-FAIL-SOFT-001). scan-
# secrets has NO block authority, so it does not fail closed; it fails SOFT but
# LOUD — emits a self-identifying diagnostic and exits 0 so it never turns its
# own broken install into a write block, but the breakage is visible.
if [[ -f "$SCRIPT_DIR/lib/agent-surface.sh" ]]; then
  source "$SCRIPT_DIR/lib/agent-surface.sh"
else
  echo "[scan-secrets] CAWS hook infrastructure incomplete: lib/agent-surface.sh is missing — the secret-scan advisory cannot run. Restore the shared hook libs with: caws init --adopt" >&2
  exit 0
fi
# shellcheck source=lib/emit.sh
caws_source_lib emit.sh 2>/dev/null || true
parse_hook_input

TOOL_NAME="$HOOK_TOOL_NAME"
FILE_PATH="$HOOK_FILE_PATH"

case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

[[ -z "$FILE_PATH" ]] && exit 0

# Skip binary and generated files.
case "$FILE_PATH" in
  */node_modules/*|*/dist/*|*/build/*|*/.git/*) exit 0 ;;
esac
case "$FILE_PATH" in
  *.png|*.jpg|*.jpeg|*.gif|*.ico|*.svg|*.woff|*.woff2|*.ttf|*.eot|*.zip|*.tar|*.gz|*.bin) exit 0 ;;
esac

CONTENT=""
if [[ -n "${HOOK_TOOL_INPUT_JSON:-}" ]] && command -v jq >/dev/null 2>&1; then
  CONTENT=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '.content // .new_string // empty' 2>/dev/null || true)
fi
[[ -z "$CONTENT" ]] && [[ -f "$FILE_PATH" ]] && CONTENT=$(cat "$FILE_PATH" 2>/dev/null || true)
[[ -z "$CONTENT" ]] && exit 0

HITS=""

# High-confidence patterns only (low false-positive rate).
while IFS= read -r line; do
  case "$line" in
    *PRIVATE_KEY*|*private_key*) HITS="${HITS}  • private key material\n" ;;
  esac
  # AWS-style access key: AKIA[0-9A-Z]{16}
  if printf '%s' "$line" | grep -qE 'AKIA[0-9A-Z]{16}'; then
    HITS="${HITS}  • possible AWS access key\n"
  fi
  # GitHub token: ghp_, gho_, ghu_, ghs_, ghr_
  if printf '%s' "$line" | grep -qE 'gh[pousr]_[A-Za-z0-9_]{36,}'; then
    HITS="${HITS}  • possible GitHub token\n"
  fi
done <<< "$CONTENT"

if [[ -n "$HITS" ]]; then
  MSG="scan-secrets: possible secret detected in '$(basename "$FILE_PATH")':
$(printf '%b' "$HITS")
Do not commit credentials. Use environment variables or a secrets manager. (Advisory — allowed.)"
  emit_additional_context "$MSG" "PostToolUse"
fi

exit 0
