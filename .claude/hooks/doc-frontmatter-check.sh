#!/bin/bash
# Document Frontmatter Check Hook for Claude Code
# Warns when docs/**/*.md files are written/edited without proper frontmatter.
# Advisory only — does not block.
#
# See docs/specifications/document_governance.md for the full schema.
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

FILE_PATH="$HOOK_FILE_PATH"
TOOL_NAME="$HOOK_TOOL_NAME"

# Only check Write and Edit tools
if [[ "$TOOL_NAME" != "Write" ]] && [[ "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only check .md files under docs/
if [[ ! "$FILE_PATH" =~ docs/.*\.md$ ]]; then
  exit 0
fi

# Skip README.md files (exempt from frontmatter)
BASENAME=$(basename "$FILE_PATH")
if [[ "$BASENAME" == "README.md" ]]; then
  exit 0
fi

# Skip archive
if [[ "$FILE_PATH" =~ docs/archive/ ]]; then
  exit 0
fi

# Check if file exists (Write creates it, Edit modifies it)
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# --- Frontmatter validation ---

# V1: Check for frontmatter delimiters
FIRST_LINE=$(head -1 "$FILE_PATH" 2>/dev/null || echo "")
if [[ "$FIRST_LINE" != "---" ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Doc governance (V1): '"$FILE_PATH"' is missing YAML frontmatter. All docs under docs/ (except README.md) must start with --- delimiters containing doc_id, authority, status, title, owner, and updated fields. See docs/specifications/document_governance.md."
    }
  }'
  exit 0
fi

# Extract frontmatter block (between first and second ---)
FRONTMATTER=$(awk 'NR==1 && /^---$/{found=1; next} found && /^---$/{exit} found{print}' "$FILE_PATH")

if [[ -z "$FRONTMATTER" ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Doc governance (V1): '"$FILE_PATH"' has opening --- but no closing --- for frontmatter block."
    }
  }'
  exit 0
fi

# V2: Check required fields
MISSING=""
for field in doc_id authority status title owner updated; do
  if ! echo "$FRONTMATTER" | grep -q "^${field}:"; then
    MISSING="${MISSING} ${field}"
  fi
done

if [[ -n "$MISSING" ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Doc governance (V2): '"$FILE_PATH"' is missing required frontmatter fields:'"$MISSING"'. See docs/specifications/document_governance.md."
    }
  }'
  exit 0
fi

# V2: Check authority value
AUTHORITY=$(echo "$FRONTMATTER" | grep "^authority:" | head -1 | sed 's/^authority: *//' | tr -d '"' | tr -d "'")
case "$AUTHORITY" in
  canonical|policy|architecture|adr|spec|roadmap|reference|working|ephemeral)
    ;;
  *)
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "Doc governance (V2): '"$FILE_PATH"' has invalid authority '"'"''"$AUTHORITY"''"'"'. Must be one of: canonical, policy, architecture, adr, spec, roadmap, reference, working, ephemeral."
      }
    }'
    exit 0
    ;;
esac

# V2: Check status value
STATUS=$(echo "$FRONTMATTER" | grep "^status:" | head -1 | sed 's/^status: *//' | tr -d '"' | tr -d "'")
case "$STATUS" in
  draft|active|implemented|proven|superseded|archived)
    ;;
  *)
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "Doc governance (V2): '"$FILE_PATH"' has invalid status '"'"''"$STATUS"''"'"'. Must be one of: draft, active, implemented, proven, superseded, archived."
      }
    }'
    exit 0
    ;;
esac

# V3: Check governs for high-authority docs
case "$AUTHORITY" in
  canonical|architecture|adr|spec)
    if ! echo "$FRONTMATTER" | grep -q "^governs:"; then
      echo '{
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "Doc governance (V3): '"$FILE_PATH"' has authority '"'"''"$AUTHORITY"''"'"' but no governs section. Docs with authority >= spec must declare what they govern (modules, schemas, or specs)."
        }
      }'
      exit 0
    fi
    ;;
esac

# V4: Check verified_at_commit for implementation-state claims
case "$STATUS" in
  implemented|proven)
    if ! echo "$FRONTMATTER" | grep -q "^verified_at_commit:"; then
      echo '{
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "Doc governance (V4): '"$FILE_PATH"' has status '"'"''"$STATUS"''"'"' but no verified_at_commit. Docs claiming implementation state must declare the commit SHA where claims were verified."
        }
      }'
      exit 0
    fi
    ;;
esac

# V5: Check superseded_by for superseded docs
if [[ "$STATUS" == "superseded" ]]; then
  if ! echo "$FRONTMATTER" | grep -q "^superseded_by:"; then
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "Doc governance (V5): '"$FILE_PATH"' has status '"'"'superseded'"'"' but no superseded_by. Superseded docs must declare their replacement doc_id."
      }
    }'
    exit 0
  fi
fi

# V6: Check caws_specs for roadmap docs
if [[ "$AUTHORITY" == "roadmap" ]]; then
  if ! echo "$FRONTMATTER" | grep -q "^caws_specs:"; then
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "Doc governance (V6): '"$FILE_PATH"' has authority '"'"'roadmap'"'"' but no caws_specs field. Roadmap docs should declare which CAWS specs track their items (e.g., caws_specs: [TC-01, TC-04])."
      }
    }'
    exit 0
  fi
fi

# All checks passed
exit 0
