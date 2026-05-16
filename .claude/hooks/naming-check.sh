#!/bin/bash
# CAWS Naming Convention Check Hook for Claude Code
# Validates file naming against CAWS conventions
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

FILE_PATH="$HOOK_FILE_PATH"
TOOL_NAME="$HOOK_TOOL_NAME"

# Only check Write tool (new files)
if [[ "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Get filename
FILENAME=$(basename "$FILE_PATH")

# Banned modifiers that indicate incomplete/temporary naming
BANNED_MODIFIERS=(
  "enhanced"
  "unified"
  "simplified"
  "better"
  "new"
  "next"
  "final"
  "copy"
  "revamp"
  "improved"
  "alt"
  "tmp"
  "scratch"
  "wip"
  "test-"
  "-test"
  "_test"
  "temp"
  "old"
  "backup"
)

# Convert filename to lowercase for checking
FILENAME_LOWER=$(echo "$FILENAME" | tr '[:upper:]' '[:lower:]')

# Check for banned modifiers (word-boundary aware)
for modifier in "${BANNED_MODIFIERS[@]}"; do
  # Use word-boundary matching to avoid false positives (e.g., "old" in "gold_oracle")
  # Match modifier preceded by start-of-string, hyphen, or underscore
  # and followed by end-of-string, hyphen, underscore, or dot
  if [[ "$FILENAME_LOWER" =~ (^|[-_.])"$modifier"([-_.]|$) ]]; then
    # Special case: allow test files that follow conventions
    if [[ "$modifier" == "test-" ]] || [[ "$modifier" == "-test" ]] || [[ "$modifier" == "_test" ]]; then
      if [[ "$FILENAME_LOWER" =~ \.(test|spec)\.(js|ts|jsx|tsx|py|go|rs)$ ]]; then
        continue
      fi
    fi

    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "Warning: The filename '\'''"$FILENAME"''\'' contains the modifier '\'''"$modifier"''\'' which may indicate temporary or non-canonical naming. Consider using a more descriptive, permanent name. See CAWS naming conventions in .caws/canonical-map.yaml or run '\''caws naming check'\''."
      }
    }'
    exit 0
  fi
done

# Check for version suffixes (e.g., file-v2.js, file_v3.ts)
if [[ "$FILENAME_LOWER" =~ [-_]v[0-9]+\. ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Warning: The filename '\'''"$FILENAME"''\'' contains a version suffix. Version control should be handled by git, not file names. Consider removing the version suffix."
    }
  }'
  exit 0
fi

# Check for date stamps (e.g., file-2024-01-15.js)
if [[ "$FILENAME_LOWER" =~ [0-9]{4}[-_][0-9]{2}[-_][0-9]{2} ]]; then
  echo '{
    "hookSpecificOutput": {
      "hookEventName": "PostToolUse",
      "additionalContext": "Warning: The filename '\'''"$FILENAME"''\'' contains a date stamp. Version control should be handled by git, not file names. Consider removing the date."
    }
  }'
  exit 0
fi

# File naming is OK
exit 0
