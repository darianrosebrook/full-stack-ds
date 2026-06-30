#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 8,16
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
# Shared runtime bootstrap for CAWS hook scripts.
# Ensures common developer-installed binaries remain available when hooks run
# under a reduced PATH that does not load interactive shell init.
#
# Growing this hook for your repo's runtime is welcome (that is the point — see
# the edit_stance header). What is NOT: patching PATH handling here as an
# unblock SHORTCUT when a hook failed. That weakens the guard instead of fixing
# the cause. Fix the real issue in the worktree/spec setup first; change the
# hook runtime deliberately, not to dodge a block.

ensure_hook_runtime_path() {
  if command -v node >/dev/null 2>&1; then
    return 0
  fi

  local latest_node_bin=""

  if [[ -d "$HOME/.nvm/versions/node" ]]; then
    latest_node_bin=$(
      find "$HOME/.nvm/versions/node" -maxdepth 4 -type f -name node 2>/dev/null \
        | sed 's#/node$##' \
        | sort -V \
        | tail -n 1
    )
  fi

  if [[ -n "$latest_node_bin" ]] && [[ -d "$latest_node_bin" ]]; then
    PATH="$latest_node_bin:$PATH"
  fi

  for candidate in /opt/homebrew/bin /usr/local/bin /usr/bin /bin; do
    if [[ -d "$candidate" ]] && [[ ":$PATH:" != *":$candidate:"* ]]; then
      PATH="$candidate:$PATH"
    fi
  done

  export PATH
}

read_hook_input_json() {
  python3 -c '
import json
import sys

raw = sys.stdin.buffer.read()
if not raw:
    sys.stdout.write("{}")
    raise SystemExit(0)

def strip_disallowed_controls(text: str) -> str:
    return "".join(
        ch
        for ch in text
        if ch in ("\t", "\n", "\r") or ord(ch) >= 0x20
    )

text = raw.decode("utf-8", "surrogateescape")
sanitized = strip_disallowed_controls(text.replace("\x00", ""))

for candidate in (text, sanitized):
    try:
        payload = json.loads(candidate, strict=False)
    except Exception:
        continue
    sys.stdout.write(json.dumps(payload))
    raise SystemExit(0)

# Never echo malformed raw input back to jq callers. Hook scripts should
# fail open on unreadable input rather than turning parse noise into
# blocking PreToolUse/PostToolUse errors.
sys.stdout.write("{}")
' 2>/dev/null
}

ensure_hook_runtime_path
