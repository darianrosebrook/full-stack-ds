#!/bin/bash
# Document Frontmatter Check Hook for Claude Code
# Warns when docs/**/*.md files are written/edited without proper frontmatter.
# Advisory only — does not block.
#
# See docs/document_governance.md for the full schema.
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
      "additionalContext": "Doc governance (V1): '"$FILE_PATH"' is missing YAML frontmatter. All docs under docs/ (except README.md) must start with --- delimiters containing doc_id, authority, status, title, owner, and updated fields. See docs/document_governance.md."
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
      "additionalContext": "Doc governance (V2): '"$FILE_PATH"' is missing required frontmatter fields:'"$MISSING"'. See docs/document_governance.md."
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

# V6: Check caws_specs for roadmap docs.
#
# A roadmap doc declares which CAWS specs track its items. The remediation
# must point at the ACTION that makes the linkage real (`caws specs create`),
# never at the field SYNTAX with example IDs — modelling `caws_specs: [TC-01]`
# taught at least one agent to fabricate IDs that satisfy the regex but
# reference specs that do not exist (turn-003 minted four placeholder IDs to
# clear this gate against an uninitialized control plane).
#
# Precondition: the linkage cannot resolve if `.caws/` does not exist. When
# CAWS is not initialized, the only correct first step is `caws init`; demanding
# the field before there is a control plane to create specs in corners the
# author into fabrication. So the remediation branches on `.caws/` presence.
if [[ "$AUTHORITY" == "roadmap" ]]; then
  if ! echo "$FRONTMATTER" | grep -q "^caws_specs:"; then
    REPO_ROOT=$(git -C "$(dirname "$FILE_PATH")" rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-.}")
    if [[ ! -d "$REPO_ROOT/.caws" ]]; then
      # CAWS is not initialized — the caws_specs linkage has no control plane
      # to point at. Do NOT model the field syntax; point at init first.
      echo '{
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "Doc governance (V6): '"$FILE_PATH"' has authority '"'"'roadmap'"'"' but no caws_specs field, and this repo has no '"'"'.caws/'"'"' directory — CAWS is not initialized. Do NOT invent placeholder spec IDs to satisfy this field; that links the roadmap to specs that do not exist. Initialize CAWS first (`caws init`), then author a real spec for each phase (`caws specs create <ID> --title \"...\" --mode <feature|refactor|fix|doc|chore> --risk-tier <1|2|3>`) and list the created IDs in caws_specs."
        }
      }'
    else
      # CAWS is initialized — the field should reference specs that exist.
      # Point at spec creation, not the field syntax.
      echo '{
        "hookSpecificOutput": {
          "hookEventName": "PostToolUse",
          "additionalContext": "Doc governance (V6): '"$FILE_PATH"' has authority '"'"'roadmap'"'"' but no caws_specs field. Roadmap docs must link to CAWS specs that actually track the work. For each phase this roadmap describes, create a spec with `caws specs create <ID> --title \"...\" --mode <feature|refactor|fix|doc|chore> --risk-tier <1|2|3>`, then list the real IDs in caws_specs. Do NOT invent placeholder IDs to clear this check — a caws_specs entry that names a non-existent spec is a broken link, not a tracked item."
        }
      }'
    fi
    exit 0
  fi
fi

# All checks passed
exit 0
