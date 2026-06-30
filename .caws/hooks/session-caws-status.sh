#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 4,11
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
#
# CAWS SessionStart status check.
# Surfaces inherited-dirty-state, foreign-claim soft-block, and version-skew
# to the agent at session start.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=lib/caws-state.sh
source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || true
# shellcheck source=lib/agent-surface.sh
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true

if [ ! -d "${CAWS_PROJECT_DIR:-.}/.caws" ]; then
  exit 0
fi

cd "${CAWS_PROJECT_DIR:-.}"

if ! command -v caws >/dev/null 2>&1; then
  exit 0
fi

caws status 2>/dev/null || true

exit 0
