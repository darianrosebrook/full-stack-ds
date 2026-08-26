#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 44
# caws_min_major: 11
# lineage_refs: 8,16,23
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
#
# CAWS Protected Paths Guard
#
# Blocks direct Write/Edit access to:
#   - hook SCRIPTS under the shared pack's install directory (.caws/hooks/)
#     and any vendor-surface hooks dir (no agent-side hook editing):
#     *.sh, *.py, *.cjs — the executable guard artifacts
#   - strike-state files in vendor logs (no manual manipulation of
#     progressive-strike counters)
#
# The shared pack installs its executable guards to .caws/hooks/ for every
# agent surface; CAWS_VENDOR_DIR selects a separate, per-surface
# settings/config directory (e.g. .claude for claude-code) that is not
# generally where the guard scripts themselves live. Protecting only the
# vendor-dir path leaves the pack's actual install directory — where every
# live guard resides — unprotected, so this guard covers both.
#
# Documentation under the hooks dir (*.md — e.g. the installer-managed
# CLAUDE.md, or a hand-authored README.md) is NOT a guard artifact and is
# explicitly ADMITTED. The doctrine this hook enforces protects the
# executable guards from being removed or weakened, not the docs that
# describe them (CAWS-PROTECTED-PATHS-DOCS-NOT-SCRIPTS-001). Blocking a
# legitimate doc edit was the over-match defect: it refused the very
# CLAUDE.md `caws init` itself ships and re-writes, pushing the agent
# toward a bypass — the exact failure mode CAWS exists to prevent. This
# admission applies uniformly across every protected hooks directory,
# including .caws/hooks/ — .pristine/ baselines under .caws/hooks/ are
# written by the CAWS CLI process directly (never by an agent Write/Edit
# tool call), so no separate carve-out is needed for them.
#
# The match keys on the artifact CLASS, not the directory: docs are
# allowlisted, every other extension under the hooks dir stays blocked
# (fail-closed — an unrecognized extension defaults to protected).
#
# SECURITY NOTE: case patterns in bash cannot expand variables, so the
# vendor-dir pattern is written as a conditional using [[ == ]] with
# CAWS_VENDOR_DIR. The .caws/hooks/ pattern is a plain literal — that path
# is the pack's fixed install location, not surface-derived.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/agent-surface.sh
# Provides CAWS_VENDOR_DIR for protected-path matching — load-bearing. A fatal
# `source <missing>` under `set -euo pipefail` is NOT caught by `|| true`, so
# guard with an existence test and fail CLOSED if absent: a guard that protects
# hook files from edits must not silently disappear when its lib is missing
# (CAWS-HOOK-SOURCE-GUARD-FAIL-SOFT-001).
if [[ -f "$SCRIPT_DIR/lib/agent-surface.sh" ]]; then
  source "$SCRIPT_DIR/lib/agent-surface.sh"
else
  echo "[protected-paths] CAWS hook infrastructure incomplete: lib/agent-surface.sh is missing — cannot resolve protected hook paths. Failing CLOSED (refusing the edit). Restore the shared hook libs with: caws init --adopt" >&2
  printf '{"decision":"block","reason":"CAWS protected-paths: cannot load lib/agent-surface.sh, so protected-path matching cannot run. Failing closed. Restore the hook pack: caws init --adopt"}\n'
  exit 2
fi
parse_hook_input
# Shared legibility helpers (identity prefix + escape-hatch naming) — same
# fail-soft pattern scope-guard.sh uses: absence degrades the message, never
# the enforcement.
[[ -f "$SCRIPT_DIR/lib/guard-message.sh" ]] && source "$SCRIPT_DIR/lib/guard-message.sh"

case "$HOOK_TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

if [[ -z "$HOOK_FILE_PATH" ]]; then
  exit 0
fi

FILE_PATH="$HOOK_FILE_PATH"

# Match against every directory the shared pack actually installs guard
# scripts into: the pack's own install dir (.caws/hooks/, always — this is
# where every agent surface's guards physically live) and the vendor-surface
# hooks dir (case patterns cannot expand variables — CAWS-PROTECTED-PATHS-
# DOCS-NOT-SCRIPTS-001 original used literal .claude/hooks/; we generalize
# via CAWS_VENDOR_DIR for legacy layouts / per-surface staging).
# Patterns: .caws/hooks/  and  */${CAWS_VENDOR_DIR}/hooks/

_hooks_prefix_match() {
  # Returns 0 (true) if FILE_PATH is under the shared pack's install
  # directory or a vendor-surface hooks dir.
  [[ "$FILE_PATH" == */.caws/hooks/* ]] || \
  [[ "$FILE_PATH" == ".caws/hooks/"* ]] || \
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
      if command -v guard_reprieve_hint >/dev/null 2>&1; then
        guard_reprieve_hint protected-paths.sh >&2
      fi
      # exit 2, not 1: the Claude Code PreToolUse protocol treats ONLY exit 2
      # as a block. Exit 1 is a non-blocking error — the dispatcher (which
      # returns the max handler exit code) reports failure, but the tool call
      # itself still proceeds, silently defeating the "BLOCKED" message above.
      # The missing-lib branch above and the strike-state branch below both
      # already exit 2; this keeps this branch consistent with them and with
      # its own diagnostic.
      exit 2
      ;;
  esac
fi

if _strikes_match; then
  echo "BLOCKED: $FILE_PATH is protected guard state." >&2
  echo "Do not edit strike counters by hand to bypass enforcement." >&2
  echo "If the scope was legitimately corrected and prior strikes are stale, ask the user to run:" >&2
  echo "  bash ${CAWS_HOOKS_DIR:-.caws/hooks}/reset-strikes.sh --current" >&2
  echo "(or --session <uuid> / --worktree <name> / --all --confirm; resets are logged)." >&2
  echo "Otherwise switch into the correct worktree, update the active CAWS spec scope, or ask the user for direction." >&2
  if command -v guard_reprieve_hint >/dev/null 2>&1; then
    guard_reprieve_hint protected-paths.sh >&2
  fi
  exit 2
fi

exit 0
