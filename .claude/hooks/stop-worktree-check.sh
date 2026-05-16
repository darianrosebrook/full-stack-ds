#!/bin/bash
# CAWS Worktree Cleanup Reminder for Claude Code
# Warns at session end if active worktrees remain
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# Hook does not read stdin fields; only checks worktree registry state.
# Sourcing parse-input.sh still wires up PATH for node (used below).

# Resolve main repo root
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
if command -v git >/dev/null 2>&1; then
  GIT_COMMON_DIR=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
  if [[ -n "$GIT_COMMON_DIR" ]] && [[ "$GIT_COMMON_DIR" != ".git" ]]; then
    CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON_DIR/.." 2>/dev/null && pwd || echo "")
    if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
      PROJECT_DIR="$CANDIDATE"
    fi
  fi
fi

# Check for active worktrees
if [[ -f "$PROJECT_DIR/.caws/worktrees.json" ]] && command -v node >/dev/null 2>&1; then
  ACTIVE_INFO=$(node -e "
    try {
      var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
      var active = Object.values(reg.worktrees || {}).filter(function(w) { return w.status === 'active'; });
      if (active.length > 0) {
        console.log(active.length + ':' + active.map(function(w) { return w.name; }).join(', '));
      } else {
        console.log('0:');
      }
    } catch(e) { console.log('0:'); }
  " 2>/dev/null || echo "0:")

  COUNT=$(echo "$ACTIVE_INFO" | cut -d: -f1)
  NAMES=$(echo "$ACTIVE_INFO" | cut -d: -f2)

  if [[ "$COUNT" -eq 0 ]] 2>/dev/null; then
    echo "REMINDER: Working on Main without a worktree is now forbidden. Start a new caws worktree. If your work is complete, run: caws worktree destroy <name> --delete-branch" >&2
    exit 0
  fi

  if [[ "$COUNT" -gt 0 ]] 2>/dev/null; then
    echo "REMINDER: $COUNT active worktree(s) remain: $NAMES. Other agents cannot commit to the base branch until all worktrees are destroyed. If your work is complete, run: caws worktree destroy <name> --delete-branch" >&2
    exit 0
  fi
  
fi

exit 0
