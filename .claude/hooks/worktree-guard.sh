#!/bin/bash
# CAWS Worktree Safety Guard for Claude Code
# Blocks dangerous operations when parallel worktrees are active
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

# Back-compat aliases keep the downstream git-command checks readable.
TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Only check Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# --- Resolve main repo root ---
# When running inside a worktree, CLAUDE_PROJECT_DIR points to the
# worktree directory, but .caws/worktrees.json only exists in the main
# repo. Use git's common dir to find the true repo root.
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

if command -v git >/dev/null 2>&1; then
  GIT_COMMON_DIR=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
  if [[ -n "$GIT_COMMON_DIR" ]] && [[ "$GIT_COMMON_DIR" != ".git" ]]; then
    # Inside a worktree: --git-common-dir returns the main repo's .git path
    # (e.g., /path/to/repo/.git or /path/to/repo/.git/worktrees/<name>/..)
    CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON_DIR/.." 2>/dev/null && pwd || echo "")
    if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
      PROJECT_DIR="$CANDIDATE"
    fi
  fi
fi

# --- CWD-safety for worktree-destroying commands ---
# Handled by quiet-merge.sh (runs after this hook). That hook prepends
# `cd <repo-root>` and suppresses verbose output in a single updatedInput.
# Do NOT emit updatedInput here for merge/destroy — it would be overwritten
# by quiet-merge.sh, or quiet-merge.sh would overwrite ours.

# --- Gap 2: Block sparse checkout (all paths) ---
# This must run before the "only check git commands" early-exit
if echo "$COMMAND" | grep -qE 'caws\s+(worktree\s+create|parallel\s+setup).*--scope'; then
  echo "BLOCKED: --scope (sparse checkout) is not allowed." >&2
  echo "Sparse checkout breaks cross-module imports in most projects." >&2
  echo "Use full worktrees without --scope. Scope enforcement comes from" >&2
  echo "CAWS feature specs and lane discipline, not from hiding files." >&2
  exit 2
fi

# Block direct git sparse-checkout commands.
# Only match when sparse-checkout is an actual git subcommand (at line
# start or after a command separator), not when it appears inside a
# quoted string, commit message, or echo argument.
if echo "$COMMAND" | grep -qE '(^|;|&&|\|)\s*git\s+sparse-checkout'; then
  echo "BLOCKED: git sparse-checkout is not allowed in this project." >&2
  echo "Sterling's Python imports span the full codebase." >&2
  echo "Use full worktrees without sparse-checkout." >&2
  exit 2
fi

# --- Gap 5: Block cross-boundary file copies ---
# Only block copies FROM a worktree back to the main repo (defeats isolation).
# Copies INTO a worktree are fine — the agent is working there and the files
# live on the worktree branch, disappearing on merge.
WORKTREE_BASE="$PROJECT_DIR/.caws/worktrees"
if [[ -d "$WORKTREE_BASE" ]]; then
  if echo "$COMMAND" | grep -qE '\b(cp|mv)\b'; then
    # If the agent is working inside a worktree, allow all copies — they're
    # in their own workspace
    AGENT_IN_WORKTREE=false
    if [[ -n "$HOOK_CWD" ]] && [[ "$HOOK_CWD" == "$WORKTREE_BASE"/* ]]; then
      AGENT_IN_WORKTREE=true
    fi

    if [[ "$AGENT_IN_WORKTREE" != "true" ]]; then
      if echo "$COMMAND" | grep -qF ".caws/worktrees/" || echo "$COMMAND" | grep -qF "$WORKTREE_BASE"; then
        # Check if the command references both a worktree path and the main repo
        HAS_WT_PATH=false
        HAS_MAIN_PATH=false
        if echo "$COMMAND" | grep -qE '\.caws/worktrees/|'"$(echo "$WORKTREE_BASE" | sed 's/[\/&]/\\&/g')"''; then
          HAS_WT_PATH=true
        fi
        # Check if destination/source is outside the worktree
        if echo "$COMMAND" | grep -qE "(^|\s)$PROJECT_DIR/[^.]|core/|src/|tests/|packages/" && [[ "$HAS_WT_PATH" == "true" ]]; then
          HAS_MAIN_PATH=true
        fi
        if [[ "$HAS_WT_PATH" == "true" ]] && [[ "$HAS_MAIN_PATH" == "true" ]]; then
          echo "BLOCKED: Copying files from a worktree to the main repo is forbidden." >&2
          echo "This bypasses worktree isolation. Work entirely within your worktree." >&2
          echo "If tests need the main repo's venv, activate it with:" >&2
          echo "  source $PROJECT_DIR/.venv/bin/activate" >&2
          exit 2
        fi
      fi
    fi
  fi
fi

# Only check git commands from here on
if ! echo "$COMMAND" | grep -qE '(^|\s|&&|\|)git\s'; then
  exit 0
fi

# --- Determine if worktrees are active ---
WORKTREES_ACTIVE=false
PARALLEL_BASE=""

# Check .caws/parallel.json
if [[ -f "$PROJECT_DIR/.caws/parallel.json" ]] && command -v node >/dev/null 2>&1; then
  PARALLEL_INFO=$(node -e "
    try {
      var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/parallel.json', 'utf8'));
      var agents = (reg.agents || []).length;
      console.log(agents + ':' + (reg.baseBranch || ''));
    } catch(e) { console.log('0:'); }
  " 2>/dev/null || echo "0:")

  AGENT_COUNT=$(echo "$PARALLEL_INFO" | cut -d: -f1)
  PARALLEL_BASE=$(echo "$PARALLEL_INFO" | cut -d: -f2)

  if [[ "$AGENT_COUNT" -gt 0 ]] 2>/dev/null; then
    WORKTREES_ACTIVE=true
  fi
fi

# Check .caws/worktrees.json
if [[ "$WORKTREES_ACTIVE" != "true" ]] && [[ -f "$PROJECT_DIR/.caws/worktrees.json" ]] && command -v node >/dev/null 2>&1; then
  ACTIVE_COUNT=$(node -e "
    try {
      var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
      var active = Object.values(reg.worktrees || {}).filter(function(w) { return w.status === 'active'; });
      console.log(active.length);
    } catch(e) { console.log('0'); }
  " 2>/dev/null || echo "0")

  if [[ "$ACTIVE_COUNT" -gt 0 ]] 2>/dev/null; then
    WORKTREES_ACTIVE=true
  fi
fi

# If no worktrees are active, allow everything
if [[ "$WORKTREES_ACTIVE" != "true" ]]; then
  exit 0
fi

# --- Block dangerous git operations when worktrees are active ---

# Block git commit --amend
if echo "$COMMAND" | grep -qE 'git\s+commit\s+.*--amend'; then
  echo "BLOCKED: git commit --amend is not allowed while worktrees are active." >&2
  echo "Amending commits risks rewriting another agent's work." >&2
  echo "Create a new commit instead." >&2
  exit 2
fi

# Block git stash (shared across worktrees)
if echo "$COMMAND" | grep -qE 'git\s+stash' && ! echo "$COMMAND" | grep -qE 'git\s+stash\s+list'; then
  echo "BLOCKED: git stash is not allowed while worktrees are active." >&2
  echo "Stash is shared across all worktrees and can capture or destroy another agent's work." >&2
  echo "Commit your changes to your branch instead." >&2
  exit 2
fi

# Block git reset --hard
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "BLOCKED: git reset --hard is not allowed while worktrees are active." >&2
  echo "This could discard work that other agents depend on." >&2
  exit 2
fi

# Block git push --force
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(--force|-f\s)'; then
  echo "BLOCKED: Force push is not allowed while worktrees are active." >&2
  echo "This could rewrite history that other agents have based work on." >&2
  exit 2
fi

# --- Base branch protections ---
# Use the hook input's cwd (where the git command will actually execute), not
# CLAUDE_PROJECT_DIR (which always points to the main repo root, even when the
# agent has cd'd into a worktree at .caws/worktrees/<name>/).
AGENT_DIR="${HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}"
CURRENT_BRANCH=$(cd "$AGENT_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Determine the base branch to protect
BASE_BRANCH="$PARALLEL_BASE"
if [[ -z "$BASE_BRANCH" ]] && [[ -f "$PROJECT_DIR/.caws/worktrees.json" ]] && command -v node >/dev/null 2>&1; then
  BASE_BRANCH=$(node -e "
    try {
      var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
      var active = Object.values(reg.worktrees || {}).filter(function(w) { return w.status === 'active'; });
      if (active.length > 0) console.log(active[0].baseBranch || '');
      else console.log('');
    } catch(e) { console.log(''); }
  " 2>/dev/null || echo "")
fi

if [[ -n "$BASE_BRANCH" ]] && [[ "$CURRENT_BRANCH" == "$BASE_BRANCH" ]]; then
  # Block push from base branch
  if echo "$COMMAND" | grep -qE 'git\s+push'; then
    echo "BLOCKED: Pushing from the base branch ($BASE_BRANCH) while worktrees are active." >&2
    echo "You should be working in a worktree, not on the base branch." >&2
    echo "Use: cd .caws/worktrees/<name>/" >&2
    exit 2
  fi

  # Allow git merge into base branch (merging completed worktree branches back)
  # The commit-msg hook enforces the merge(worktree): message format
  if echo "$COMMAND" | grep -qE 'git\s+merge\b'; then
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "Merging into base branch ('"$BASE_BRANCH"') while worktrees are active. The commit-msg hook will enforce the merge(worktree): message format. Make sure the worktree for this branch has been destroyed first."
      }
    }'
    exit 0
  fi

  # Warn (but don't block) commits on base branch — the pre-commit + commit-msg hooks handle blocking
  if echo "$COMMAND" | grep -qE 'git\s+commit\b' && ! echo "$COMMAND" | grep -qE '--amend'; then
    echo '{
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "additionalContext": "NOTE: committing to the base branch ('"$BASE_BRANCH"') while worktrees are active. The commit-msg hook permits four commit categories: (1) merge(worktree): <description> for completed-worktree merges; (2) wip(checkpoint): <description> for prior-session dirty-file cleanup; (3) git merge --no-ff merge commits (detected via MERGE_HEAD); (4) doc/config-only commits (all staged files under docs/, .claude/, or .caws/). Commits outside those categories are blocked. See .claude/rules/worktree-isolation.md and .githooks/commit-msg for details."
      }
    }'
    exit 0
  fi
fi

# Allow the command
exit 0
