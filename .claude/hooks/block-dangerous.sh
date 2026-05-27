#!/bin/bash
# CAWS Dangerous Command Blocker for Claude Code
# Blocks potentially destructive shell commands
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

# Back-compat aliases keep the downstream pattern-match logic unchanged.
TOOL_NAME="$HOOK_TOOL_NAME"
COMMAND="$HOOK_COMMAND"

# Only check Bash tool
if [[ "$TOOL_NAME" != "Bash" ]] || [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Protect the write guard itself from shell-based self-modification.
# Keep this narrow: only block obvious mutating commands that target the
# specific guard path, either relatively or absolutely.
PROTECTED_HOOK_REL=".claude/hooks/worktree-write-guard.sh"
PROTECTED_HOOK_ABS="${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/worktree-write-guard.sh"
if echo "$COMMAND" | grep -qF "$PROTECTED_HOOK_REL" || echo "$COMMAND" | grep -qF "$PROTECTED_HOOK_ABS"; then
  # Allow checkpoint-oriented git flows that only stage/commit the protected file.
  if echo "$COMMAND" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(add|commit|status|diff|log|show)\b'; then
    exit 0
  fi

  # Check for mutating utilities (cp, mv, rm, etc.) targeting the protected path.
  if echo "$COMMAND" | grep -qE '(^|[;&|[:space:]])(cp|mv|rm|sed|perl|python|python3|ruby|node|tee|touch|truncate|install|chmod)[[:space:]]'; then
    echo "BLOCKED: $PROTECTED_HOOK_REL is protected from Bash-based edits." >&2
    echo "Ask the user for permission before modifying this hook." >&2
    echo "Command was: $COMMAND" >&2
    exit 2
  fi

  # Check for output-redirect operators that write to a file.
  # Match `>` or `>>` only when NOT followed by `&` (which would be fd-redirect
  # like 2>&1, >&2 — those are harmless read-only plumbing). `<<` is heredoc
  # INPUT and never writes to a file, so it is intentionally excluded here.
  if echo "$COMMAND" | grep -qE '(>>|>)[^&]'; then
    echo "BLOCKED: $PROTECTED_HOOK_REL is protected from Bash-based edits." >&2
    echo "Ask the user for permission before modifying this hook." >&2
    echo "Command was: $COMMAND" >&2
    exit 2
  fi
fi

# Dangerous command patterns
DANGEROUS_PATTERNS=(
  # Destructive file operations
  'rm -rf /'
  'rm -rf ~'
  'rm -rf \*'
  'rm -rf \.'
  'rm -rf /\*'
  'dd if=/dev/zero'
  'dd if=/dev/random'
  'mkfs\.'
  'fdisk'
  '> /dev/sd'

  # Fork bombs and resource exhaustion
  ':\(\)\{:\|:\&\};:'
  'while true.*fork'

  # Credential/secret exposure
  'cat.*\.env'
  'cat.*/etc/passwd'
  'cat.*/etc/shadow'
  'cat.*id_rsa'
  'cat.*\.ssh/'
  'cat.*credentials'
  'cat.*\.aws/'

  # Network exfiltration
  'curl.*\|.*sh'
  'wget.*\|.*sh'
  'curl.*\|.*bash'
  'wget.*\|.*bash'

  # Permission escalation
  'chmod 777'
  'chmod -R 777'
  'chmod.*\+s'

  # History manipulation
  'history -c'
  'rm.*\.bash_history'
  'rm.*\.zsh_history'

  # System modification
  'shutdown'
  'reboot'
  'init 0'
  'init 6'

  # Git destructive operations
  'git init'
  'git reset --hard'
  'git push --force'
  'git push -f '
  'git push --force-with-lease'
  'git clean -f'
  'git checkout \.'
  'git restore \.'
  '(^|&&|\|\||;|\|)\s*git rebase'
  '(^|&&|\|\||;|\|)\s*git cherry-pick'

  # Virtual environment creation (prevents venv sprawl)
  'python -m venv'
  'python3 -m venv'
  'virtualenv '
  'conda create'
)

# Check command against dangerous patterns
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qiE "$pattern"; then
    # Allow git init in worktree context
    if [[ "$pattern" == "git init" ]] && [[ "${CAWS_WORKTREE_CONTEXT:-0}" == "1" ]]; then
      continue
    fi

    # Allow git rebase only when no worktrees are active
    if [[ "$pattern" == *"git rebase"* ]] || [[ "$pattern" == *"git cherry-pick"* ]]; then
      PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
      # Resolve to main repo root if we're in a worktree
      if command -v git >/dev/null 2>&1; then
        GIT_COMMON=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
        if [[ -n "$GIT_COMMON" ]] && [[ "$GIT_COMMON" != ".git" ]]; then
          CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON/.." 2>/dev/null && pwd || echo "")
          if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
            PROJECT_DIR="$CANDIDATE"
          fi
        fi
      fi
      WT_FILE="$PROJECT_DIR/.caws/worktrees.json"
      if [[ -f "$WT_FILE" ]] && command -v node >/dev/null 2>&1; then
        ACTIVE_COUNT=$(node -e "
          try {
            var r = JSON.parse(require('fs').readFileSync('$WT_FILE','utf8'));
            var c = Object.values(r.worktrees||{}).filter(function(w){return w.status==='active';}).length;
            console.log(c);
          } catch(e) { console.log(0); }
        " 2>/dev/null || echo "0")
        if [[ "$ACTIVE_COUNT" -gt 0 ]]; then
          GIT_SUBCMD="git operation"
          [[ "$pattern" == *"git rebase"* ]] && GIT_SUBCMD="git rebase"
          [[ "$pattern" == *"git cherry-pick"* ]] && GIT_SUBCMD="git cherry-pick"
          echo "BLOCKED: $GIT_SUBCMD is forbidden while $ACTIVE_COUNT worktree(s) are active." >&2
          echo "This can replay or rewrite commits across worktree boundaries." >&2
          echo "Command was: $COMMAND" >&2
          exit 2
        fi
      fi
      # No active worktrees — allow
      continue
    fi

    # Allow venv commands if target matches designated venv path from scope.json
    if echo "$pattern" | grep -qE '(python.*venv|virtualenv|conda create)'; then
      PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
      SCOPE_FILE="$PROJECT_DIR/.caws/scope.json"
      if [[ -f "$SCOPE_FILE" ]] && command -v node >/dev/null 2>&1; then
        DESIGNATED_VENV=$(node -e "try { const s = JSON.parse(require('fs').readFileSync('$SCOPE_FILE','utf8')); console.log(s.designatedVenvPath || ''); } catch(e) { console.log(''); }" 2>/dev/null || echo "")
        if [[ -n "$DESIGNATED_VENV" ]] && echo "$COMMAND" | grep -qF "$DESIGNATED_VENV"; then
          continue
        fi
      fi
    fi

    # Output to stderr for Claude to see
    echo "BLOCKED: Command matches dangerous pattern: $pattern" >&2
    echo "Command was: $COMMAND" >&2

    # Exit code 2 blocks the tool and shows stderr to Claude
    exit 2
  fi
done

# Check for sudo without specific allowed commands
if echo "$COMMAND" | grep -qE '^sudo\s' && ! echo "$COMMAND" | grep -qE 'sudo (npm|yarn|pnpm|brew|apt-get|apt|dnf|yum)'; then
  echo "BLOCKED: sudo commands require explicit approval" >&2
  echo "If this command is safe, please run it manually in your terminal" >&2
  exit 2
fi

# Allow the command
exit 0
