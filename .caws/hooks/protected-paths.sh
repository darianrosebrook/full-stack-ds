#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 1
# caws_min_major: 11
# lineage_refs: 8,16,23
# do_not_edit_directly: update via `caws init`
#
# CAWS Protected Paths Guard
#
# Blocks direct Write/Edit access to:
#   - hook SCRIPTS under the vendor hooks dir (no agent-side hook editing):
#     *.sh, *.py, *.cjs — the executable guard artifacts
#   - strike-state files in vendor logs (no manual manipulation of
#     progressive-strike counters)
#
# Documentation under the hooks dir (*.md — e.g. the installer-managed
# CLAUDE.md, or a hand-authored README.md) is NOT a guard artifact and is
# explicitly ADMITTED. The doctrine this hook enforces protects the
# executable guards from being removed or weakened, not the docs that
# describe them (CAWS-PROTECTED-PATHS-DOCS-NOT-SCRIPTS-001). Blocking a
# legitimate doc edit was the over-match defect: it refused the very
# CLAUDE.md `caws init` itself ships and re-writes, pushing the agent
# toward a bypass — the exact failure mode CAWS exists to prevent.
#
# The match keys on the artifact CLASS, not the directory: docs are
# allowlisted, every other extension under the hooks dir stays blocked
# (fail-closed — an unrecognized extension defaults to protected).
#
# SECURITY NOTE: case patterns in bash cannot expand variables, so the
# vendor-dir pattern is written as a conditional using [[ == ]] with
# CAWS_VENDOR_DIR. This is structurally equivalent to the literal patterns
# in the claude-code original but works for any vendor dir value.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/agent-surface.sh
# Provides CAWS_VENDOR_DIR for path matching.
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true
parse_hook_input

case "$HOOK_TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

if [[ -z "$HOOK_FILE_PATH" ]]; then
  exit 0
fi

FILE_PATH="$HOOK_FILE_PATH"

# Match against vendor-dir hooks directory using conditional expressions
# (case patterns cannot expand variables — CAWS-PROTECTED-PATHS-DOCS-NOT-SCRIPTS-001
# original used literal .claude/hooks/; we generalize via CAWS_VENDOR_DIR).
# Pattern: */${CAWS_VENDOR_DIR}/hooks/

_hooks_prefix_match() {
  # Returns 0 (true) if FILE_PATH is under any vendor hooks dir.
  [[ "$FILE_PATH" == */"${CAWS_VENDOR_DIR}"/hooks/* ]] || \
  [[ "$FILE_PATH" == "${CAWS_VENDOR_DIR}/hooks/"* ]]
}

_strikes_match() {
  # Returns 0 (true) if FILE_PATH is a guard-strikes JSON file.
  [[ "$FILE_PATH" == */"${CAWS_VENDOR_DIR}"/logs/guard-strikes-*.json ]] || \
  [[ "$FILE_PATH" == "${CAWS_VENDOR_DIR}/logs/guard-strikes-"*.json ]]
}

if _hooks_prefix_match; then
  # Check if it's a doc (*.md) — docs are admitted.
  case "$FILE_PATH" in
    *.md)
      # Documentation under the hooks dir (CLAUDE.md, README.md, ...) is not a
      # guard artifact. Admit it — the doctrine protects executable guards, not
      # the docs describing them (CAWS-PROTECTED-PATHS-DOCS-NOT-SCRIPTS-001).
      exit 0
      ;;
    *)
      # Everything else under the hooks dir is a guard artifact (*.sh, *.py,
      # *.cjs, lib/, caws_dispatch/, or an unrecognized extension). Fail closed.
      echo "BLOCKED: $FILE_PATH is protected." >&2
      echo "Ask the user for permission before editing CAWS hook scripts." >&2
      exit 1
      ;;
  esac
fi

if _strikes_match; then
  echo "BLOCKED: $FILE_PATH is protected guard state." >&2
  echo "Do not edit strike counters by hand to bypass enforcement." >&2
  echo "If the scope was legitimately corrected and prior strikes are stale, ask the user to run:" >&2
  echo "  bash ${CAWS_VENDOR_DIR}/hooks/reset-strikes.sh --current" >&2
  echo "(or --session <uuid> / --worktree <name> / --all --confirm; resets are logged)." >&2
  echo "Otherwise switch into the correct worktree, update the active CAWS spec scope, or ask the user for direction." >&2
  exit 2
fi

exit 0
