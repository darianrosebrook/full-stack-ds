#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 24
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS Secret Scanner for Claude Code
#
# Advisory-only: emits a hookSpecificOutput warning when a tool call
# touches files or directories that commonly contain secrets (.env*,
# *.pem, *.key, SSH keys, cloud-provider config dirs, etc.).
#
# Does NOT block. The agent is responsible for redacting sensitive
# values from its response. Promoted from Sterling per
# CAWS-HOOK-PACK-PROMOTE-001.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/emit.sh
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
parse_hook_input

FILE_PATH="$HOOK_FILE_PATH"

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Get just the filename for pattern matching
FILENAME=$(basename "$FILE_PATH")

# Files that commonly contain secrets
SECRET_FILE_PATTERNS=(
  '.env'
  '.env.local'
  '.env.production'
  '.env.development'
  '.env.*'
  'credentials.json'
  'service-account.json'
  'secrets.yaml'
  'secrets.yml'
  'secrets.json'
  '.netrc'
  '.npmrc'
  '.pypirc'
  'id_rsa'
  'id_ed25519'
  'id_ecdsa'
  '*.pem'
  '*.key'
  '*.p12'
  '*.pfx'
  'htpasswd'
  'shadow'
)

# Directories that commonly contain secrets
SECRET_DIRS=(
  '.ssh'
  '.aws'
  '.azure'
  '.gcloud'
  '.kube'
  '.gnupg'
)

# Check if file matches secret patterns
for pattern in "${SECRET_FILE_PATTERNS[@]}"; do
  if [[ "$FILENAME" == $pattern ]]; then
    emit_additional_context "WARNING: This file may contain secrets. Do not include sensitive values in your response. If you need to reference credentials, use placeholders like <API_KEY> instead of actual values."
    exit 0
  fi
done

# Check if file is in a sensitive directory
for dir in "${SECRET_DIRS[@]}"; do
  if [[ "$FILE_PATH" == *"/$dir/"* ]] || [[ "$FILE_PATH" == *"/$dir" ]]; then
    emit_additional_context "WARNING: This file is in a sensitive directory that may contain secrets. Do not include any sensitive values in your response."
    exit 0
  fi
done

# Allow the read
exit 0
