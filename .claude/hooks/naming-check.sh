#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 25
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS Naming Convention Check Hook for Claude Code
#
# Advisory-only PostToolUse hook that fires on Write (new file creation
# only). Flags filenames that violate the "no shadow files" doctrine
# stated in CLAUDE.md:
#
#   - Banned modifier suffixes (enhanced, unified, simplified, new,
#     next, final, copy, revamp, improved, alt, tmp, scratch, wip,
#     temp, old, backup, plus test-variant equivalents)
#   - Version suffixes (-v2., _v3., etc.) — git is the version
#     control surface, not filenames
#   - Date stamps (YYYY-MM-DD) — same reason
#
# Test files with canonical extensions (.test.js, .spec.ts, etc.)
# are explicitly exempted from the test-related modifier checks.
#
# Promoted from Sterling per CAWS-HOOK-PACK-PROMOTE-001. The advisory
# messages have been genericized: removed Sterling-era references to
# the v10 `caws naming check` CLI command (which v11 does not ship)
# and to `.caws/canonical-map.yaml` (a v10 artifact). The doctrine
# the hook enforces remains: CLAUDE.md key rule "No shadow files —
# edit in place, never create `*-enhanced.*`, `*-new.*`, `*-v2.*`
# copies".

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/emit.sh
# Canonical PostToolUse additionalContext emitter (HOOK-LIB-CONSOLIDATION-001
# T3a) — replaces fragile inline `echo '{...}'` envelopes that did not
# JSON-escape the interpolated filename.
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
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

    emit_additional_context "Warning: The filename '$FILENAME' contains the modifier '$modifier' which may indicate temporary or non-canonical naming. Per the CAWS doctrine (CLAUDE.md key rule \"No shadow files\"), edit existing files in place rather than creating *-enhanced.*, *-new.*, *-v2.* copies. Consider using a more descriptive, permanent name." "PostToolUse"
    exit 0
  fi
done

# Check for version suffixes (e.g., file-v2.js, file_v3.ts)
if [[ "$FILENAME_LOWER" =~ [-_]v[0-9]+\. ]]; then
  emit_additional_context "Warning: The filename '$FILENAME' contains a version suffix. Version control should be handled by git, not file names. Consider removing the version suffix." "PostToolUse"
  exit 0
fi

# Check for date stamps (e.g., file-2024-01-15.js)
if [[ "$FILENAME_LOWER" =~ [0-9]{4}[-_][0-9]{2}[-_][0-9]{2} ]]; then
  emit_additional_context "Warning: The filename '$FILENAME' contains a date stamp. Version control should be handled by git, not file names. Consider removing the date." "PostToolUse"
  exit 0
fi

# File naming is OK
exit 0
