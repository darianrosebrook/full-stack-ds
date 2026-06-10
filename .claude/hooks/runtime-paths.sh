#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 8,16
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
# Shared runtime bootstrap for Claude hook scripts.
# Ensures common developer-installed binaries remain available when hooks run
# under a reduced PATH that does not load interactive shell init.
#
# If you are reading this because a hook failed, do not patch PATH handling here
# as an unblock shortcut. Fix the real issue in the worktree/spec setup, or ask
# the user if the hook runtime itself truly needs to change.

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
