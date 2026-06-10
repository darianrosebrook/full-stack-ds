#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 16
# caws_min_major: 11
# lineage_refs: 30
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS Duplicate-Export Advisory Check (QG-HOOKS-EXTRACT-001)
#
# Advisory-only PostToolUse hook firing on Write (new-file creation). Flags a
# newly-written file that exports a symbol whose name already exists as an
# export elsewhere in the local project tree — the edit-time analogue of the
# quality-gates functional-duplication "name/shape collision" signal
# (packages/quality-gates/check-functional-duplication.mjs nameDuplication).
# It re-implements the practical 80%: the most common shadow-export incident
# is the agent CREATING a new file whose export collides with an existing one
# (the "*-v2 / *-enhanced re-export" failure mode the naming-check covers by
# filename; this covers it by symbol).
#
# v1 limitation (documented, acceptable): fires on Write only, not Edit. An
# Edit that adds a new colliding export to an existing file is NOT caught;
# that requires diffing the pre/post export set. The common incident is the
# new-file create, which Write covers.
#
# NEVER blocks (always exit 0). NEVER mutates. NEVER imports a quality-gates
# module. Matching is exact symbol name, not heuristic similarity.
#
# Lookup is bounded: the enclosing package's src tree
# (packages/<pkg>/src or packages/<pkg>) when the file is inside a package,
# else repo-root src/, else repo root. ripgrep when available, grep -r
# fallback. node_modules is always excluded.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
# shellcheck source=lib/emit.sh
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
parse_hook_input || exit 0

FILE_PATH="$HOOK_FILE_PATH"
TOOL_NAME="$HOOK_TOOL_NAME"

# Write only (new-file create) per the documented v1 scope.
[[ "$TOOL_NAME" != "Write" ]] && exit 0
[[ -z "$FILE_PATH" ]] && exit 0

# Only JS/TS source files carry the export shapes we match.
case "$(basename "$FILE_PATH")" in
  *.js | *.jsx | *.ts | *.tsx | *.mjs | *.cjs) ;;
  *) exit 0 ;;
esac

# Skip generated / vendored / build output and test files.
case "$FILE_PATH" in
  */node_modules/* | */dist/* | */build/* | */coverage/* | */.next/* | */out/* | */vendor/*)
    exit 0
    ;;
  *.test.* | *.spec.* | */tests/* | */__tests__/* | */test/*)
    exit 0
    ;;
esac
case "$(basename "$FILE_PATH")" in
  *.min.js | *.bundle.js) exit 0 ;;
esac

# Content to scan for new exports: prefer the Write payload .content.
CONTENT=""
if [[ -n "${HOOK_TOOL_INPUT_JSON:-}" ]] && command -v jq >/dev/null 2>&1; then
  CONTENT=$(printf '%s' "$HOOK_TOOL_INPUT_JSON" | jq -r '.content // empty' 2>/dev/null || printf '')
fi
if [[ -z "$CONTENT" ]] && [[ -f "$FILE_PATH" ]]; then
  CONTENT=$(cat "$FILE_PATH" 2>/dev/null || printf '')
fi
[[ -z "$CONTENT" ]] && exit 0

# Extract exported symbol names. Matches:
#   export function NAME       export class NAME
#   export const NAME          export default function NAME
#   export async function NAME
NAMES=$(printf '%s' "$CONTENT" | grep -oE 'export[[:space:]]+(default[[:space:]]+)?(async[[:space:]]+)?(function|class|const|let|var)[[:space:]]+[A-Za-z_$][A-Za-z0-9_$]*' 2>/dev/null \
  | awk '{print $NF}' | sort -u)

[[ -z "$NAMES" ]] && exit 0

# Generic allowlist: names too common to be meaningful collisions.
is_allowlisted() {
  case "$1" in
    main | init | setup | run | handle | render | index | default) return 0 ;;
    *) return 1 ;;
  esac
}

# Determine the bounded search root from the file path.
# packages/<pkg>/... -> packages/<pkg>/src (or packages/<pkg>)
SEARCH_ROOT=""
if [[ "$FILE_PATH" =~ (^|/)(packages/[^/]+)/ ]]; then
  pkg="${BASH_REMATCH[2]}"
  # Resolve relative to repo root if FILE_PATH is absolute or cwd-relative.
  if [[ -d "$pkg/src" ]]; then
    SEARCH_ROOT="$pkg/src"
  elif [[ -d "$pkg" ]]; then
    SEARCH_ROOT="$pkg"
  fi
fi
if [[ -z "$SEARCH_ROOT" ]]; then
  if [[ -d "src" ]]; then SEARCH_ROOT="src"; else SEARCH_ROOT="."; fi
fi

# Picker: ripgrep if available, else grep -r. Always exclude node_modules,
# dist, build, and the file just written.
search_export() {
  local name="$1"
  local pat="export[[:space:]]+(default[[:space:]]+)?(async[[:space:]]+)?(function|class|const|let|var)[[:space:]]+${name}([^A-Za-z0-9_$]|\$)"
  if command -v rg >/dev/null 2>&1; then
    rg --no-messages -l -e "$pat" "$SEARCH_ROOT" \
      --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!coverage' 2>/dev/null
  else
    grep -rlE "$pat" "$SEARCH_ROOT" \
      --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build --exclude-dir=coverage 2>/dev/null
  fi
}

# The basename of the file just written, to exclude self-matches (the search
# root may already contain the written file on disk).
SELF_BASENAME="$(basename "$FILE_PATH")"

COLLISIONS=""
while IFS= read -r name; do
  [[ -z "$name" ]] && continue
  is_allowlisted "$name" && continue
  while IFS= read -r match_file; do
    [[ -z "$match_file" ]] && continue
    # Skip self (compare basenames; the written file may appear under the root).
    [[ "$(basename "$match_file")" == "$SELF_BASENAME" ]] && continue
    # Skip if the match is literally the same path as the written file.
    [[ "$match_file" == "$FILE_PATH" ]] && continue
    COLLISIONS="${COLLISIONS}  • ${name} also exported in ${match_file}"$'\n'
  done < <(search_export "$name")
done <<< "$NAMES"

[[ -z "$COLLISIONS" ]] && exit 0

MSG="Duplicate-export advisory: ${FILE_PATH} exports symbol name(s) that already exist elsewhere in this project:
${COLLISIONS}If this is an intentional re-export or distinct concept, ignore. Otherwise consider editing the existing module in place rather than creating a parallel implementation (CAWS \"No shadow files\" doctrine). (Advisory only — never blocks.)"

emit_additional_context "$MSG" "PostToolUse"

exit 0
