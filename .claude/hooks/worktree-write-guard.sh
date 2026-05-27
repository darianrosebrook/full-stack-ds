
#!/bin/bash
# CAWS Worktree Write Guard for Claude Code
# Blocks Write/Edit on the base branch while worktrees are active.
# This prevents agents from modifying files on main and then trying to
# create worktrees retroactively to commit them.
# @author @darianrosebrook

# exit 0 # temporarily allow agent edits to the file.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input

# Back-compat aliases kept so the lookup logic below reads unchanged.
TOOL_NAME="$HOOK_TOOL_NAME"
FILE_PATH="$HOOK_FILE_PATH"

# Only check Write and Edit tools
case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

# --- Resolve main repo root ---
# Resolved early so the allow-list below can anchor patterns to the project
# root instead of substring-matching anywhere in the path.
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
PROJECT_DIR="$(cd "$PROJECT_DIR" 2>/dev/null && pwd || printf '%s\n' "$PROJECT_DIR")"

if command -v git >/dev/null 2>&1; then
  GIT_COMMON_DIR=$(cd "$PROJECT_DIR" && git rev-parse --git-common-dir 2>/dev/null || echo "")
  if [[ -n "$GIT_COMMON_DIR" ]] && [[ "$GIT_COMMON_DIR" != ".git" ]]; then
    CANDIDATE=$(cd "$PROJECT_DIR" && cd "$GIT_COMMON_DIR/.." 2>/dev/null && pwd || echo "")
    if [[ -n "$CANDIDATE" ]] && [[ -d "$CANDIDATE/.caws" ]]; then
      PROJECT_DIR="$CANDIDATE"
    fi
  fi
fi

# Main is blocked during active worktree work because shared unstaged state makes
# agents stash, checkpoint, or investigate each other's edits, wasting tokens. Keep direct main edits
# limited to coordination/docs/scratch paths, then use active spec scope below to
# permit only files no worktree claims. Patterns anchor to the project root so
# nested directories like src/tmp/... or python/foo/docs/... do NOT accidentally
# allow-list through. Each entry accepts both the absolute form (Claude usually
# passes absolute paths) and the bare-relative form.
if [[ -n "$FILE_PATH" ]]; then
  case "$FILE_PATH" in
    # User-global Claude state lives outside the repo and is not governed by
    # CAWS worktree isolation. Allow writes there so plan files, transcript
    # snapshots, and Claude-managed state do not get treated like main-branch
    # repo edits.
    "${HOME:-}"/.claude/*) exit 0 ;;
    "$PROJECT_DIR"/.caws/*|.caws/*) exit 0 ;;
    "$PROJECT_DIR"/.claude/*|.claude/*) exit 0 ;;
    "$PROJECT_DIR"/.gitignore|.gitignore) exit 0 ;;
    "$PROJECT_DIR"/.tmp/*|.tmp/*) exit 0 ;;
    "$PROJECT_DIR"/tmp/*|tmp/*) exit 0 ;;
    "$PROJECT_DIR"/.archive/*|.archive/*) exit 0 ;;
    "$PROJECT_DIR"/.githooks/*|.githooks/*) exit 0 ;;
    "$PROJECT_DIR"/.github/*|.github/*) exit 0 ;;
    "$PROJECT_DIR"/docs/*|docs/*) exit 0 ;;
  esac
fi

# --- Check for active worktrees ---
if [[ ! -f "$PROJECT_DIR/.caws/worktrees.json" ]]; then
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  exit 0
fi

# Use the hook input's cwd (where the agent is actually working), not
# CLAUDE_PROJECT_DIR (which always points to the main repo root, even when the
# agent has cd'd into a worktree at .caws/worktrees/<name>/).
AGENT_DIR="${HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}"
CURRENT_BRANCH=$(cd "$AGENT_DIR" && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
WORKTREE_BASE="$PROJECT_DIR/.caws/worktrees"

# If the agent is already operating inside a CAWS worktree, allow edits.
# A worktree may be "fresh" before its first commit, so branch-based matching
# alone is not sufficient here.
if [[ -n "$AGENT_DIR" ]] && [[ "$AGENT_DIR" == "$WORKTREE_BASE"/* ]]; then
  exit 0
fi

# Also allow edits when the current branch itself is a registered non-destroyed
# worktree branch, even if the cwd did not preserve the worktree path.
IS_REGISTERED_WORKTREE=$(node -e "
  try {
    var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
    var current = '$CURRENT_BRANCH';
    var found = Object.values(reg.worktrees || {}).some(function(w) {
      return w.branch === current && w.status !== 'destroyed' && w.status !== 'missing';
    });
    console.log(found ? '1' : '0');
  } catch(e) { console.log('0'); }
" 2>/dev/null || echo "0")

if [[ "$IS_REGISTERED_WORKTREE" == "1" ]]; then
  exit 0
fi

WT_INFO=$(node -e "
  try {
    var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
    var active = Object.values(reg.worktrees || {}).filter(function(w) {
      return w.status !== 'destroyed' && w.status !== 'missing' && w.baseBranch === '$CURRENT_BRANCH';
    });
    console.log(active.length + ':' + active.map(function(w) { return w.name; }).join(', '));
  } catch(e) { console.log('0:'); }
" 2>/dev/null || echo "0:")

WT_COUNT=$(echo "$WT_INFO" | cut -d: -f1)
WT_NAMES=$(echo "$WT_INFO" | cut -d: -f2)

if [[ "$WT_COUNT" -lt 1 ]] 2>/dev/null && command -v git >/dev/null 2>&1; then
  GIT_WT_INFO=$(git -C "$PROJECT_DIR" worktree list --porcelain 2>/dev/null | awk -v current="$PROJECT_DIR" '
    BEGIN {
      count = 0;
      names = "";
      path = "";
    }
    /^worktree / {
      path = substr($0, 10);
      next;
    }
    /^branch / {
      if (path != "" && path != current) {
        count++;
        name = path;
        sub(/^.*\//, "", name);
        names = names (names ? ", " : "") name;
      }
      path = "";
      next;
    }
    END {
      if (path != "" && path != current) {
        count++;
        name = path;
        sub(/^.*\//, "", name);
        names = names (names ? ", " : "") name;
      }
      printf "%d:%s\n", count, names;
    }
  ')

  WT_COUNT=$(echo "$GIT_WT_INFO" | cut -d: -f1)
  WT_NAMES=$(echo "$GIT_WT_INFO" | cut -d: -f2-)
fi

if [[ -n "$FILE_PATH" ]] && [[ "$WT_COUNT" -gt 0 ]] 2>/dev/null; then
  REL_PATH="$FILE_PATH"
  if [[ "$FILE_PATH" == "$PROJECT_DIR"/* ]]; then
    REL_PATH="${FILE_PATH#$PROJECT_DIR/}"
  fi

  SPEC_CONTENTION_CHECK=$(PROJECT_DIR="$PROJECT_DIR" CURRENT_BRANCH="$CURRENT_BRANCH" REL_PATH="$REL_PATH" node -e "
    var fs = require('fs');
    var path = require('path');
    var yaml;

    try {
      yaml = require('js-yaml');
    } catch (_) {
      console.log('unknown:no-js-yaml');
      process.exit(0);
    }

    function globToRegExp(pattern) {
      // Escape regex metachars (except *, ?) so literal path chars like '.'
      // are not treated as regex operators. Then expand glob wildcards:
      //   **  -> .+       (cross-segment, matches nested dirs)
      //   *   -> [^/]*    (single-segment, does NOT cross '/')
      //   ?   -> .        (any single char)
      // Finally anchor with ^ and \$ so the pattern must match the whole
      // relative path rather than appear as a substring.
      var escaped = String(pattern).replace(/[.+^\${}()|[\\]\\\\]/g, '\\\\\$&');
      var body = escaped.replace(/\\*\\*/g, '.+').replace(/\\*/g, '[^/]*').replace(/\\?/g, '.');
      return new RegExp('^' + body + '\$');
    }

    try {
      var projectDir = process.env.PROJECT_DIR;
      var currentBranch = process.env.CURRENT_BRANCH;
      var relPath = process.env.REL_PATH;
      var registryPath = path.join(projectDir, '.caws', 'worktrees.json');
      var registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      var worktrees = Object.values(registry.worktrees || {}).filter(function(w) {
        return w.status !== 'destroyed' && w.status !== 'missing' && w.baseBranch === currentBranch;
      });

      if (worktrees.length === 0) {
        console.log('unknown:no-registry-worktrees');
        process.exit(0);
      }

      for (var wi = 0; wi < worktrees.length; wi++) {
        var wt = worktrees[wi];
        if (!wt.specId) {
          console.log('unknown:missing-specId:' + (wt.name || 'unnamed'));
          process.exit(0);
        }

        var specPath = path.join(projectDir, '.caws', 'specs', wt.specId + '.yaml');
        if (!fs.existsSync(specPath)) {
          specPath = path.join(projectDir, '.caws', 'specs', wt.specId + '.yml');
        }
        if (!fs.existsSync(specPath)) {
          console.log('unknown:missing-spec:' + wt.specId);
          process.exit(0);
        }

        var spec = yaml.load(fs.readFileSync(specPath, 'utf8')) || {};
        var scope = spec.scope || {};
        var patterns = []
          .concat(Array.isArray(scope.in) ? scope.in : [])
          .concat(Array.isArray(scope.out) ? scope.out : []);

        if (patterns.length === 0) {
          console.log('unknown:missing-scope:' + wt.specId);
          process.exit(0);
        }

        for (var pi = 0; pi < patterns.length; pi++) {
          if (globToRegExp(patterns[pi]).test(relPath)) {
            console.log('claimed:' + (wt.name || wt.specId) + ':' + patterns[pi]);
            process.exit(0);
          }
        }
      }

      console.log('clear');
    } catch (error) {
      console.log('unknown:' + error.message);
    }
  " 2>/dev/null || echo "unknown:node-error")

  # Note: we deliberately do NOT early-return on "clear". Historical evidence
  # (see extraction_output_local/claude_conversations) showed ~22 cross-agent
  # collision events in a single session that the harness misattributed to
  # "a linter" but were actually sibling Claude instances writing outside their
  # declared scope. If an active worktree's spec didn't list the file, that's
  # the exact failure mode the broad-block policy protects against. We still
  # COMPUTE the contention decision so the block message below can tell the
  # user whether the file is claimed, unclaimed, or the check couldn't run.
  :
fi

# Block writes on the base branch even when no matching worktrees are active.
# Working directly on main is forbidden; the agent must first enter or create a
# worktree before making edits.
if [[ "$WT_COUNT" -eq 0 ]] 2>/dev/null; then
  echo "BLOCKED: Cannot write/edit files on '$CURRENT_BRANCH' without a worktree." >&2
  echo "" >&2
  echo "Working on Main without a worktree is forbidden." >&2
  echo "  To use an existing worktree: cd $PROJECT_DIR/.caws/worktrees/<name>/" >&2
  echo "  To create a new worktree:    caws worktree create <name>" >&2
  echo "  If the correct worktree already exists, switch into it before editing." >&2
  echo "" >&2
  echo "Do NOT edit .claude/hooks/, .claude/logs/guard-strikes-*.json, or other guard state to bypass this." >&2
  echo "If you believe main must be edited, ask the user first." >&2
  echo "" >&2
  echo "If your work is complete, run: caws worktree destroy <name> --delete-branch" >&2
  exit 2
fi

# Allow edits during an active merge (conflict resolution).
# The worktree-isolation rules explicitly permit merge commits on the base branch.
# Conflict resolution requires Write/Edit on the conflicted files.
MERGE_HEAD_PATH=$(cd "$AGENT_DIR" && git rev-parse --git-dir 2>/dev/null || echo ".git")
if [[ -f "$MERGE_HEAD_PATH/MERGE_HEAD" ]]; then
  exit 0
fi

# Block: we're on the base branch with active worktrees
echo "BLOCKED: Cannot write/edit files on '$CURRENT_BRANCH' while $WT_COUNT worktree(s) are active: $WT_NAMES" >&2
echo "" >&2

# Surface the scope-contention decision so the user knows WHY we blocked:
# either a specific active worktree claimed this file, or the contention check
# itself could not reach a decision (missing specId, missing spec, missing scope).
if [[ -n "${SPEC_CONTENTION_CHECK:-}" ]]; then
  case "$SPEC_CONTENTION_CHECK" in
    claimed:*)
      echo "File is claimed by an active worktree's scope:" >&2
      echo "  $SPEC_CONTENTION_CHECK" >&2
      echo "  (format: claimed:<worktree-name>:<matching-pattern>)" >&2
      echo "Switch into that worktree to make this edit." >&2
      echo "" >&2
      ;;
    clear)
      echo "No active worktree's scope claims this file." >&2
      echo "  Main remains blocked anyway — sibling agents routinely edit" >&2
      echo "  outside their declared scope (rename refactors, test updates," >&2
      echo "  cross-cutting fixes), and those unclaimed edits are exactly" >&2
      echo "  what triggers cross-agent collisions on shared files." >&2
      echo "  Create a new worktree + spec for this work, or extend an" >&2
      echo "  existing spec's scope.in to cover this file." >&2
      echo "" >&2
      ;;
    unknown:*)
      echo "Scope contention could not be evaluated: $SPEC_CONTENTION_CHECK" >&2
      echo "  Likely a spec is missing specId, spec file, or scope." >&2
      echo "  Run 'caws scope show' to diagnose; 'caws worktree bind <spec-id>' to fix." >&2
      echo "" >&2
      ;;
  esac
fi

echo "You MUST work in a worktree, not on the base branch." >&2
echo "  To use an existing worktree: cd $PROJECT_DIR/.caws/worktrees/<name>/" >&2
echo "  To create a new worktree:    caws worktree create <name>" >&2
echo "" >&2
echo "Do NOT make changes on main and create a worktree retroactively." >&2
echo "The worktree must exist BEFORE you start making changes." >&2
echo "Do NOT edit .claude/hooks/, .claude/logs/guard-strikes-*.json, or other guard state to bypass this." >&2
echo "If you believe the base branch needs a direct edit, ask the user first." >&2
echo "" >&2
echo "If you are merging a worktree branch, use: caws worktree merge <name>" >&2
echo "Or start the merge first (git merge --no-ff <branch>), then resolve conflicts." >&2
exit 2
