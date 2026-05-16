#!/bin/bash
# CAWS Scope Guard Hook for Claude Code
# Validates file edits against scope boundaries from working-spec + feature specs
# Specs with terminal status (completed, closed, archived) are skipped
# Worktree-aware: reads specs from the agent's working directory, not always the main repo
# @author @darianrosebrook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
# shellcheck source=guard-strikes.sh
source "$SCRIPT_DIR/guard-strikes.sh"
parse_hook_input

# Back-compat aliases kept to minimize diff in the scope-resolution logic below.
FILE_PATH="$HOOK_FILE_PATH"
TOOL_NAME="$HOOK_TOOL_NAME"
SESSION_ID="$HOOK_SESSION_ID"

# Only check Write/Edit operations
if [[ "$TOOL_NAME" != "Write" ]] && [[ "$TOOL_NAME" != "Edit" ]]; then
  exit 0
fi

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

emit_scope_progression() {
  local detail="$1"
  local unblock="To get unblocked: edit files that are already in scope, switch into the correct CAWS worktree, or update the relevant CAWS spec so this path is legitimately in scope. If you are already in the correct worktree, verify the mutual CAWS binding: the spec must declare 'worktree: <name>' and .caws/worktrees.json must map that same worktree name to the correct 'specId'. If that registry binding is missing, unrelated active specs may block your edit. If the scope change is not clearly yours to make, ask the user. If the scope was legitimately corrected but prior strikes from earlier edits are still cornering this session, ask the user to run: bash .claude/hooks/reset-strikes.sh --current (or --session <uuid>) to clear stale strike state — never edit guard-strikes-*.json by hand. Do not edit .claude/hooks/, .claude/logs/guard-strikes-*.json, or other guard state to bypass this check."

  guard_enforce_progressive_strikes \
    "$SESSION_ID" \
    "scope_guard" \
    "$WORK_DIR" \
    "Scope guard strike 1 of 3 for '$REL_PATH'. Strict warning: this edit is allowed, but the next out of scope edit requires user permission. $detail $unblock" \
    "Scope guard strike 2 of 3 for '$REL_PATH'. You are blocked, asking the user for approval. $detail $unblock" \
    "Scope guard strike 3 of 3 for '$REL_PATH'. You are blocked on moving forward until your scope is properly set. $detail $unblock"
}

resolve_worktree_root() {
  local candidate="${1:-}"

  if [[ -n "$candidate" ]] && [[ "$candidate" =~ ^(.*\/\.caws\/worktrees\/[^/]+)($|/) ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
    return 0
  fi

  return 1
}

# ── Always-allowed paths ──────────────────────────────────────────────
# Paths matching any of these prefixes bypass scope checks entirely.
# Edit this array to add new always-allowed directories.
ALLOW_PREFIXES=(
  "$HOME/.claude/"         # User's global Claude config (memory, settings)
  ".caws/"                 # CAWS governance files
  ".claude/"               # Project-level Claude config
  "docs/"                  # Documentation
  "tests/"                 # Test suites
  "scripts/"               # Automation scripts
  "tmp/"
  ".archive/"
)

# ── Policy-declared non-governed zones (CAWSFIX-26 / ledger D9) ──────
# Load additional allowlist prefixes from .caws/policy.yaml's
# `non_governed_zones` field. This lets the repo declare subtrees
# (research/, playground/) as opt-out from scope enforcement without
# burning a one-shot CAWS spec per declaration. The caws-cli
# scope-boundary gate (commit-time) already reads this field via
# PolicyManager; this shell hook mirrors the behavior at pre-write time.
#
# Parsing is intentionally narrow: only the block-style list form
#     non_governed_zones:
#       - "research/**"
#       - playground/**
# is recognized. Each entry is normalized `foo/**` -> `foo/` for
# prefix matching, consistent with ALLOW_PREFIXES semantics.
POLICY_FILE="${CLAUDE_PROJECT_DIR:-.}/.caws/policy.yaml"
if [[ -f "$POLICY_FILE" ]]; then
  while IFS= read -r raw_zone; do
    [[ -z "$raw_zone" ]] && continue
    # Strip surrounding quotes.
    raw_zone="${raw_zone%\"}"; raw_zone="${raw_zone#\"}"
    raw_zone="${raw_zone%\'}"; raw_zone="${raw_zone#\'}"
    # Normalize glob tail: `foo/**` -> `foo/`, `foo/*` -> `foo/`.
    raw_zone="${raw_zone%/\*\*}"
    raw_zone="${raw_zone%/\*}"
    # Ensure trailing slash for prefix matching (treat as a subtree).
    [[ "$raw_zone" != */ ]] && raw_zone="${raw_zone}/"
    ALLOW_PREFIXES+=("$raw_zone")
  done < <(awk '
    /^non_governed_zones:[[:space:]]*$/ { in_zones = 1; next }
    /^[^[:space:]#-]/ && in_zones { in_zones = 0 }
    in_zones && /^[[:space:]]+-[[:space:]]+/ {
      sub(/^[[:space:]]+-[[:space:]]+/, "")
      sub(/[[:space:]]+#.*$/, "")
      print
    }
  ' "$POLICY_FILE" 2>/dev/null)
fi

# --- Resolve working directory ---
# Use the hook input's cwd (where the agent is actually working), not
# CLAUDE_PROJECT_DIR. In a worktree, CLAUDE_PROJECT_DIR still points at the
# main repo root, but the agent's specs live in the worktree.
WORK_DIR="${HOOK_CWD:-${CLAUDE_PROJECT_DIR:-.}}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

FILE_WORKTREE_ROOT="$(resolve_worktree_root "$FILE_PATH" || true)"
CWD_WORKTREE_ROOT="$(resolve_worktree_root "$HOOK_CWD" || true)"
PROJECT_WORKTREE_ROOT="$(resolve_worktree_root "$PROJECT_DIR" || true)"

if [[ -n "$FILE_WORKTREE_ROOT" ]]; then
  WORK_DIR="$FILE_WORKTREE_ROOT"
elif [[ -n "$CWD_WORKTREE_ROOT" ]]; then
  WORK_DIR="$CWD_WORKTREE_ROOT"
elif [[ -n "$PROJECT_WORKTREE_ROOT" ]]; then
  WORK_DIR="$PROJECT_WORKTREE_ROOT"
fi

# Resolve the main repo root (needed for fallback)
PROJECT_DIR="$(cd "$PROJECT_DIR" 2>/dev/null && pwd || printf '%s\n' "$PROJECT_DIR")"
WORK_DIR="$(cd "$WORK_DIR" 2>/dev/null && pwd || printf '%s\n' "$WORK_DIR")"
WORKTREE_NAME=""
if [[ "$WORK_DIR" =~ \/\.caws\/worktrees\/([^/]+)$ ]]; then
  WORKTREE_NAME="${BASH_REMATCH[1]}"
fi

# Spec/scope resolution: prefer the worktree's own .caws/ if present,
# otherwise fall back to the main repo's .caws/.
if [[ -f "$WORK_DIR/.caws/working-spec.yaml" ]]; then
  SPEC_FILE="$WORK_DIR/.caws/working-spec.yaml"
  SCOPE_FILE="$WORK_DIR/.caws/scope.json"
  SPECS_BASE="$WORK_DIR"
else
  SPEC_FILE="$PROJECT_DIR/.caws/working-spec.yaml"
  SCOPE_FILE="$PROJECT_DIR/.caws/scope.json"
  SPECS_BASE="$PROJECT_DIR"
fi

# Check if any spec infrastructure exists
if [[ ! -f "$SPEC_FILE" ]] && [[ ! -f "$SCOPE_FILE" ]] && [[ ! -d "$SPECS_BASE/.caws/specs" ]]; then
  exit 0
fi

# Get relative path from the work directory (portable — macOS realpath lacks --relative-to)
if [[ "$FILE_PATH" == "$WORK_DIR"/* ]]; then
  REL_PATH="${FILE_PATH#$WORK_DIR/}"
elif [[ "$FILE_PATH" == "$PROJECT_DIR"/* ]]; then
  REL_PATH="${FILE_PATH#$PROJECT_DIR/}"
else
  REL_PATH="$FILE_PATH"
fi

# ── Check against allowlist ───────────────────────────────────────────
# Root-level files (no directory component) are always allowed.
if [[ "$REL_PATH" != */* ]]; then
  exit 0
fi
# Check both the absolute FILE_PATH and relative REL_PATH against prefixes.
for prefix in "${ALLOW_PREFIXES[@]}"; do
  if [[ "$FILE_PATH" == "${prefix}"* ]] || [[ "$REL_PATH" == "${prefix}"* ]]; then
    exit 0
  fi
done

# ── Lite mode: scope.json (no working-spec.yaml) ─────────────────────
if [[ ! -f "$SPEC_FILE" ]] && [[ -f "$SCOPE_FILE" ]]; then
  if command -v node >/dev/null 2>&1; then
    LITE_CHECK=$(node -e "
      var fs = require('fs');
      var path = require('path');
      try {
        var scope = JSON.parse(fs.readFileSync('$SCOPE_FILE', 'utf8'));
        var filePath = '$REL_PATH';
        var dirs = scope.allowedDirectories || [];
        var banned = scope.bannedPatterns || {};

        // Check banned file patterns
        var basename = path.basename(filePath);
        var bannedFiles = banned.files || [];
        for (var i = 0; i < bannedFiles.length; i++) {
          var regex = new RegExp(bannedFiles[i].replace(/\\*/g, '.*').replace(/\\?/g, '.'));
          if (regex.test(basename)) {
            console.log('banned:' + bannedFiles[i]);
            process.exit(0);
          }
        }

        // Check banned doc patterns
        var bannedDocs = banned.docs || [];
        for (var i = 0; i < bannedDocs.length; i++) {
          var regex = new RegExp(bannedDocs[i].replace(/\\*/g, '.*').replace(/\\?/g, '.'));
          if (regex.test(basename)) {
            console.log('banned:' + bannedDocs[i]);
            process.exit(0);
          }
        }

        // Check allowed directories
        if (dirs.length > 0) {
          var normalized = filePath.replace(/\\\\\\\\/g, '/');
          var found = false;
          for (var i = 0; i < dirs.length; i++) {
            var d = dirs[i].replace(/\\/$/, '');
            if (normalized.startsWith(d + '/') || normalized === d) { found = true; break; }
          }
          if (!found) {
            console.log('not_allowed');
            process.exit(0);
          }
        }
        console.log('allowed');
      } catch (error) {
        console.log('error:' + error.message);
      }
    " 2>&1)

    if [[ "$LITE_CHECK" == banned:* ]]; then
      PATTERN="${LITE_CHECK#banned:}"
      emit_scope_progression "This file matches banned pattern '$PATTERN' in .caws/scope.json."
      exit 0
    fi

    if [[ "$LITE_CHECK" == "not_allowed" ]]; then
      emit_scope_progression "This file is outside the allowed directories in .caws/scope.json."
      exit 0
    fi

    # File is allowed - exit normally
    exit 0
  fi
fi

# ── Full mode: working-spec.yaml + feature specs ─────────────────────
SPECS_DIR="$SPECS_BASE/.caws/specs"

if command -v node >/dev/null 2>&1; then
  SCOPE_CHECK=$(node -e "
    var yaml = require('js-yaml');
    var fs = require('fs');
    var path = require('path');

    try {
      var filePath = '$REL_PATH';
      var projectDir = '$PROJECT_DIR';
      var worktreeName = '$WORKTREE_NAME';

      // Terminal statuses: specs that are not active — scope no longer enforced
      var TERMINAL = { completed: 1, closed: 1, archived: 1, draft: 1 };

      // Collect all active specs (working-spec + feature specs)
      var specs = [];

      // Load working-spec.yaml if present
      var mainSpec = '$SPEC_FILE';
      if (fs.existsSync(mainSpec)) {
        try {
          var s = yaml.load(fs.readFileSync(mainSpec, 'utf8'));
          if (s && !TERMINAL[s.status]) {
            specs.push({ source: 'working-spec', spec: s });
          }
        } catch (_) {}
      }

      // Load feature specs from .caws/specs/
      var specsDir = '$SPECS_DIR';
      if (fs.existsSync(specsDir)) {
        var files = fs.readdirSync(specsDir).filter(function(f) { return f.endsWith('.yaml') || f.endsWith('.yml'); });
        for (var fi = 0; fi < files.length; fi++) {
          try {
            var s = yaml.load(fs.readFileSync(path.join(specsDir, files[fi]), 'utf8'));
            if (s && !TERMINAL[s.status]) {
              specs.push({ source: files[fi], spec: s });
            }
          } catch (_) {}
        }
      }

      // No active specs — allow everything
      if (specs.length === 0) {
        console.log('in_scope');
        process.exit(0);
      }

      // CSS-like specificity: when a worktree registry entry and a spec
      // mutually reference each other, that spec owns scope resolution for
      // edits inside the worktree. Unrelated active specs do not override it.
      var authoritativeSpec = null;
      if (worktreeName) {
        try {
          var registryPath = path.join(projectDir, '.caws', 'worktrees.json');
          if (fs.existsSync(registryPath)) {
            var registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            var entry = registry && registry.worktrees ? registry.worktrees[worktreeName] : null;
            if (entry && entry.specId) {
              for (var si = 0; si < specs.length; si++) {
                var candidate = specs[si].spec || {};
                if (candidate.id === entry.specId && candidate.worktree === worktreeName) {
                  authoritativeSpec = specs[si];
                  break;
                }
              }
            }
          }
        } catch (_) {}
      }

      var mode = authoritativeSpec ? 'authoritative' : 'union';
      var specsToCheck = authoritativeSpec ? [authoritativeSpec] : specs;

      // Check scope.out across applicable specs — any match blocks
      for (var si = 0; si < specsToCheck.length; si++) {
        var outPatterns = (specsToCheck[si].spec.scope && specsToCheck[si].spec.scope.out) || [];
        for (var pi = 0; pi < outPatterns.length; pi++) {
          var regex = new RegExp(outPatterns[pi].replace(/\\*/g, '.*').replace(/\\?/g, '.'));
          if (regex.test(filePath)) {
            console.log('out_of_scope:' + mode + ':' + specsToCheck[si].source + ':' + outPatterns[pi]);
            process.exit(0);
          }
        }
      }

      // Union all scope.in patterns from applicable specs — file must match at least one
      var allInScope = [];
      for (var si = 0; si < specsToCheck.length; si++) {
        var inPatterns = (specsToCheck[si].spec.scope && specsToCheck[si].spec.scope.in) || [];
        for (var pi = 0; pi < inPatterns.length; pi++) {
          allInScope.push(inPatterns[pi]);
        }
      }
      if (allInScope.length > 0) {
        var found = false;
        for (var pi = 0; pi < allInScope.length; pi++) {
          var regex = new RegExp(allInScope[pi].replace(/\\*/g, '.*').replace(/\\?/g, '.'));
          if (regex.test(filePath)) {
            found = true;
            break;
          }
        }
        if (!found) {
          console.log('not_in_scope:' + mode);
          process.exit(0);
        }
      }

      console.log('in_scope');
    } catch (error) {
      console.log('error:' + error.message);
    }
  " 2>&1)

  if [[ "$SCOPE_CHECK" == out_of_scope:* ]]; then
    DETAIL="${SCOPE_CHECK#out_of_scope:}"
    # Format: mode:source:pattern
    MODE="${DETAIL%%:*}"
    REST="${DETAIL#*:}"
    SOURCE="${REST%%:*}"
    PATTERN="${REST#*:}"
    if [[ "$MODE" == "union" ]]; then
      emit_scope_progression "This file is marked out-of-scope in '$SOURCE' by pattern '$PATTERN'. Mode: union (no authoritative spec bound). An unrelated spec may be blocking this edit. Fix: caws worktree bind <your-spec-id>. Diagnose: caws scope show."
    else
      emit_scope_progression "This file is marked out-of-scope in '$SOURCE' by pattern '$PATTERN'. Mode: authoritative (checking only your bound spec)."
    fi
    exit 0
  fi

  if [[ "$SCOPE_CHECK" == not_in_scope:* ]]; then
    MODE="${SCOPE_CHECK#not_in_scope:}"
    if [[ "$MODE" == "union" ]]; then
      emit_scope_progression "This file is not in the defined scope of any active spec. Mode: union (no authoritative spec bound). Fix: caws worktree bind <your-spec-id>. Diagnose: caws scope show."
    else
      emit_scope_progression "This file is not in the defined scope of your bound spec. Mode: authoritative. Update your spec's scope.in if this file should be in scope."
    fi
    exit 0
  fi

  # Legacy fallback for unqualified not_in_scope
  if [[ "$SCOPE_CHECK" == "not_in_scope" ]]; then
    emit_scope_progression "This file is not in the defined scope of any active spec. Diagnose: caws scope show."
    exit 0
  fi
fi

# File is in scope or scope couldn't be checked - allow
exit 0
