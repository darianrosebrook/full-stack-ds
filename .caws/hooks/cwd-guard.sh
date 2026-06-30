#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 22
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
#
# CWD Guard — warns when the agent's working directory is missing or
# inaccessible. A nonexistent CWD causes most Bash/tool-call invocations
# to fail silently; surfacing it early lets the agent recover before
# accumulating confusing errors.
#
# Promoted from Sterling per CAWS-HOOK-PACK-PROMOTE-001.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

CWD="${HOOK_CWD:-.}"

# Nothing to guard if no CWD was supplied.
[[ -z "$CWD" ]] && exit 0

if [[ ! -d "$CWD" ]]; then
  printf 'CAWS cwd-guard: working directory is missing or inaccessible: %s\n' "$CWD" >&2
  printf 'This may cause subsequent tool calls to fail. Consider recovering the directory or switching to a valid one.\n' >&2
fi

exit 0
