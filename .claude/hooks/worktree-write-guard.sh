#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 14
# caws_min_major: 11
# lineage_refs: 4,8,13
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
#
# CAWS Worktree Write Guard for Claude Code.
#
# Two responsibilities:
#
#   1. Canonical-spec-materialization refusal
#      (WORKTREE-SPEC-CANONICAL-ACCESS-GUARD-001 A1/A2).
#      From inside a linked worktree (git rev-parse --git-common-dir !=
#      git rev-parse --git-dir, after realpath normalization), refuse
#      Read/Write/Edit tool calls whose file_path resolves under
#      <linked-worktree>/.caws/specs/*. Such files would be private
#      materialized copies of canonical spec authority, divergent from
#      the canonical .caws/specs bytes, silently consulted by anything
#      that walks cwd upward. The refusal MUST fire BEFORE the broad
#      .caws/* allowlist below, otherwise the allowlist would exit 0
#      first and the slice would appear implemented while the target
#      path still bypassed the guard. The canonical checkout itself
#      (git_common_dir == git_dir) IS spec authority and is allowed
#      through this predicate; this refusal targets the linked-worktree
#      materialization class only.
#
#   2. Base-branch write enforcement (intentionally fail-open for
#      v11.1, restored in CLI-WORKTREE-001). The hook serves as the
#      managed-install seat for the worktree-write enforcement surface
#      and asserts the always-allowed allowlist so .caws/, .claude/,
#      docs/, scripts/, tmp/, and tests/ writes are never inadvertently
#      blocked by a future enforcement pass that forgets the allowlist.
#
# Worktree-active enforcement (when restored) must read the worktrees
# registry under both shapes:
#   v11 direct-key: { "<name>": { ... } }
#   v10 nested:     { "worktrees": { "<name>": { ... } } }
# and accept both specId (v10) and spec_id (v11) on entries.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh"
parse_hook_input
# shellcheck source=lib/caws-state.sh
# Provides $CAWS_NODE_ENTRIES_OF / $CAWS_NODE_ENTRY_SPEC_ID (registry
# reads) and _realpath (path normalization) used throughout this guard.
# The lib is a managed sibling shipped with this hook; if it is somehow
# absent we cannot normalize paths safely, so fail OPEN (exit 0) rather
# than enforce on un-normalized paths (HOOK-LIB-CONSOLIDATION-001 T2a).
source "$SCRIPT_DIR/lib/caws-state.sh" 2>/dev/null || exit 0
command -v _realpath >/dev/null 2>&1 || exit 0
# emit.sh provides emit_ask / emit_block / emit_additional_context — the
# canonical PreToolUse permission envelopes (WORKTREE-GUARD-RISK-SURFACE-001).
# If absent we cannot emit an ask envelope, so the base-branch decision tail
# degrades to the prior hard block (see emit_ask_or_block below).
source "$SCRIPT_DIR/lib/emit.sh" 2>/dev/null || true
# guard-message.sh provides guard_identity (HOOK-GUARD-LEGIBILITY-001) so the
# claimed/ask diagnostics self-identify as "CAWS worktree-write-guard" instead
# of reading as a generic harness prompt. Non-fatal if absent — the wording
# below falls back to a literal prefix. Guard the source with a file-existence
# test: under `set -euo pipefail`, `source <missing>` is a fatal builtin error
# that a trailing `|| true` does NOT catch.
[[ -f "$SCRIPT_DIR/lib/guard-message.sh" ]] && source "$SCRIPT_DIR/lib/guard-message.sh"

# WORKTREE-ISOLATION-HARDENING-001 (Fix 1+2): the shared ownership oracle.
# A standalone node helper (NOT an inline node -e heredoc — that form has
# corrupted hooks twice via JS-comment backtick/double-quote in a bash
# double-quoted string). worktree-write-guard.sh (here) AND bash-write-guard.sh
# both shell out to it so a Write/Edit and a Bash mutation of the same path get
# the same answer. Absent (older install) -> the worktree-payload arm below
# degrades to the prior allowlist behavior (fail open on the helper, never a
# silent enforcement claim).
CAWS_CLAIM_ORACLE="$SCRIPT_DIR/lib/worktree-claim-oracle.cjs"

TOOL_NAME="$HOOK_TOOL_NAME"
FILE_PATH="$HOOK_FILE_PATH"

case "$TOOL_NAME" in
  Write|Edit) ;;
  *) exit 0 ;;
esac

# WORKTREE_ROOT: where the agent is operating from. This is the cwd
# whose .caws/specs/* path is the refusal target. Kept distinct from
# CANONICAL_ROOT below — these MUST NOT be conflated for the spec-path
# predicate.
WORKTREE_ROOT="${CLAUDE_PROJECT_DIR:-.}"
WORKTREE_ROOT="$(cd "$WORKTREE_ROOT" 2>/dev/null && pwd -P || printf '%s\n' "$WORKTREE_ROOT")"

# _realpath is provided by lib/caws-state.sh (sourced above) —
# HOOK-LIB-CONSOLIDATION-001 T2a. The local copy was removed.

# Linked-worktree detection via git as primary signal. CAWS registry
# (.caws/worktrees.json) is consulted ONLY for diagnostic enrichment;
# a registry desync MUST NOT suppress the refusal (I3).
IS_LINKED_WORKTREE=0
CANONICAL_ROOT=""
if command -v git >/dev/null 2>&1; then
  GIT_COMMON_DIR_RAW="$(cd "$WORKTREE_ROOT" 2>/dev/null && git rev-parse --git-common-dir 2>/dev/null || printf '')"
  GIT_DIR_RAW="$(cd "$WORKTREE_ROOT" 2>/dev/null && git rev-parse --git-dir 2>/dev/null || printf '')"
  if [[ -n "$GIT_COMMON_DIR_RAW" ]] && [[ -n "$GIT_DIR_RAW" ]]; then
    # Resolve relative paths against WORKTREE_ROOT before realpath.
    case "$GIT_COMMON_DIR_RAW" in
      /*) GIT_COMMON_DIR_ABS="$GIT_COMMON_DIR_RAW" ;;
      *)  GIT_COMMON_DIR_ABS="$WORKTREE_ROOT/$GIT_COMMON_DIR_RAW" ;;
    esac
    case "$GIT_DIR_RAW" in
      /*) GIT_DIR_ABS="$GIT_DIR_RAW" ;;
      *)  GIT_DIR_ABS="$WORKTREE_ROOT/$GIT_DIR_RAW" ;;
    esac
    GIT_COMMON_DIR="$(_realpath "$GIT_COMMON_DIR_ABS")"
    GIT_DIR="$(_realpath "$GIT_DIR_ABS")"
    if [[ -n "$GIT_COMMON_DIR" ]] && [[ "$GIT_COMMON_DIR" != "$GIT_DIR" ]]; then
      IS_LINKED_WORKTREE=1
      # CANONICAL_ROOT = parent of GIT_COMMON_DIR. Used for allowlist
      # rewriting only; NOT used for the spec-path refusal predicate.
      CANONICAL_CANDIDATE="$(_realpath "$GIT_COMMON_DIR/..")"
      if [[ -n "$CANONICAL_CANDIDATE" ]] && [[ -d "$CANONICAL_CANDIDATE/.caws" ]]; then
        CANONICAL_ROOT="$CANONICAL_CANDIDATE"
      fi
    fi
  fi
fi

# Canonical-spec-materialization refusal (I1: BEFORE the allowlist).
#
# Predicate: tool_name in {Read,Write,Edit} (already gated above)
#            AND is_linked_worktree (via git signal)
#            AND FILE_PATH resolves under <WORKTREE_ROOT>/.caws/specs/.
#
# WORKTREE_ROOT is the cwd-as-resolved-via-CLAUDE_PROJECT_DIR. NOT
# CANONICAL_ROOT, NOT a PROJECT_DIR that has been rewritten upward. The
# refused path lives under the LINKED worktree's tree.
if [[ "$IS_LINKED_WORKTREE" == "1" ]] && [[ -n "$FILE_PATH" ]]; then
  # WORKTREE_ROOT is already realpath-normalized (pwd -P above), so
  # SPEC_ROOT inherits that normalization. We MUST also normalize
  # FILE_PATH_ABS through _realpath so the comparison is symlink-
  # immune. On macOS, /tmp -> /private/tmp; without normalization, an
  # agent-supplied /tmp/.../.caws/specs/X.yaml would NOT prefix-match
  # SPEC_ROOT=/private/tmp/.../.caws/specs because the literal strings
  # diverge. python3 os.path.realpath resolves the existing prefix
  # even when the leaf does not exist (Write tool case).
  SPEC_ROOT="$WORKTREE_ROOT/.caws/specs"
  case "$FILE_PATH" in
    /*) FILE_PATH_ABS="$FILE_PATH" ;;
    *)  FILE_PATH_ABS="$WORKTREE_ROOT/$FILE_PATH" ;;
  esac
  FILE_PATH_ABS="$(_realpath "$FILE_PATH_ABS")"
  case "$FILE_PATH_ABS" in
    "$SPEC_ROOT"/*|"$SPEC_ROOT")
      echo "[worktree-write-guard.sh] BLOCKED: $FILE_PATH" >&2
      echo "[worktree-write-guard.sh] Refusing $TOOL_NAME against a linked-worktree .caws/specs/ path." >&2
      echo "[worktree-write-guard.sh]" >&2
      echo "[worktree-write-guard.sh] Linked worktrees must not use worktree-local .caws/specs/ files as authority." >&2
      echo "[worktree-write-guard.sh] That path would be a private materialized copy, not canonical spec authority." >&2
      echo "[worktree-write-guard.sh] CAWS resolves spec reads through the canonical control plane regardless of cwd." >&2
      echo "[worktree-write-guard.sh]" >&2
      echo "[worktree-write-guard.sh] To read a spec from any cwd (including this worktree), use:" >&2
      echo "[worktree-write-guard.sh]   caws specs show <id>" >&2
      echo "[worktree-write-guard.sh]" >&2
      echo "[worktree-write-guard.sh] To check scope from any cwd, use:" >&2
      echo "[worktree-write-guard.sh]   caws scope show <path>" >&2
      echo "[worktree-write-guard.sh]   caws scope check <path>" >&2
      echo "[worktree-write-guard.sh]" >&2
      echo "[worktree-write-guard.sh] If sparse-checkout was disabled in this worktree and you need to restore" >&2
      echo "[worktree-write-guard.sh] the canonical-only invariant, run from the canonical checkout:" >&2
      echo "[worktree-write-guard.sh]   caws worktree repair-sparse <name>" >&2
      exit 2
      ;;
  esac
fi

# Legacy allowlist preserved from v11.1 fail-open base-branch enforcement.
# For the allowlist, use PROJECT_DIR rewritten toward the canonical checkout
# (the historical behavior) so that .caws/ etc. paths under canonical also
# match when the agent is operating from inside a linked worktree.
PROJECT_DIR="$WORKTREE_ROOT"
if [[ -n "$CANONICAL_ROOT" ]]; then
  PROJECT_DIR="$CANONICAL_ROOT"
fi

# Always-allowed paths bypass enforcement.
# User-global Claude state lives outside the repo; .caws/, .claude/, docs/,
# scripts/, tmp/, .archive/, and .githooks/ are coordination/governance
# surfaces, not application code.
#
# PROJECT_DIR is realpath-normalized (pwd -P / _realpath above). An
# agent-supplied FILE_PATH may NOT be (e.g. /tmp/... vs /private/tmp/...
# on macOS), so a raw "$PROJECT_DIR"/docs/* arm would miss. Normalize the
# file path through _realpath for the absolute-prefix comparison; keep the
# bare relative arms (docs/*, .caws/*) for cwd-relative paths.
if [[ -n "$FILE_PATH" ]]; then
  case "$FILE_PATH" in
    /*) FILE_PATH_FOR_ALLOWLIST="$(_realpath "$FILE_PATH")" ;;
    *)  FILE_PATH_FOR_ALLOWLIST="$FILE_PATH" ;;
  esac
  case "$FILE_PATH_FOR_ALLOWLIST" in
    "${HOME:-}"/.claude/*) exit 0 ;;
    # WORKTREE-ISOLATION-HARDENING-001 (Fix 1+2): .caws/worktrees/<name>/<rest>
    # is worktree PAYLOAD, not control-plane metadata. It must NOT ride the broad
    # .caws/* allowlist below (that is the side door the clash probe walked: a
    # foreign session wrote into another worktree's payload and the .caws/* arm
    # exited 0). Route it through the ownership oracle FIRST: owner-self -> allow;
    # foreign owner -> hard block; uncertain -> ask (never silent-allow). This arm
    # MUST precede the ".caws/*) exit 0" arm.
    "$PROJECT_DIR"/.caws/worktrees/*|.caws/worktrees/*)
      if [[ -f "$CAWS_CLAIM_ORACLE" ]] && command -v node >/dev/null 2>&1; then
        # Merge stderr into the captured output (2>&1) instead of discarding it,
        # so a node spawn crash — e.g. a CommonJS oracle loaded as ESM under a
        # consumer repo's package.json "type":"module" — surfaces its real cause
        # rather than the opaque "oracle-spawn". On a normal run the oracle prints
        # one decision line to stdout and nothing to stderr, so the parse below is
        # unchanged (FIX-HOOKPACK-CONSUMER-INSTALL-001 A3).
        _ORACLE_OUT="$(CAWS_ORACLE_PROJECT_DIR="$PROJECT_DIR" \
          CAWS_ORACLE_CURRENT_BRANCH="" \
          CAWS_ORACLE_REL_PATH="$FILE_PATH_FOR_ALLOWLIST" \
          CAWS_ORACLE_SESSION_ID="${HOOK_SESSION_ID:-}" \
          node "$CAWS_CLAIM_ORACLE" 2>&1 || true)"
        _ORACLE_FIRST="${_ORACLE_OUT%%$'\n'*}"
        case "${_ORACLE_FIRST%%:*}" in
          pass|block_foreign_worktree|block_claimed|ask_uncertain|error_fail_closed)
            _ORACLE_OUT="$_ORACLE_FIRST" ;;
          *)
            _ORACLE_REASON="$(printf '%s' "$_ORACLE_FIRST" | cut -c1-200)"
            _ORACLE_OUT="error_fail_closed:oracle-spawn (${_ORACLE_REASON:-no output})" ;;
        esac
        _ORACLE_OUTCOME="${_ORACLE_OUT%%:*}"
        _ORACLE_DETAIL="${_ORACLE_OUT#*:}"
        case "$_ORACLE_OUTCOME" in
          pass)
            exit 0 ;;
          block_foreign_worktree)
            _WG_ID="CAWS worktree-write-guard"
            command -v guard_identity >/dev/null 2>&1 && _WG_ID="$(guard_identity worktree-write-guard)"
            _OWN_WT="$(printf '%s' "$_ORACLE_DETAIL" | cut -d: -f1)"
            echo "[$_WG_ID] BLOCKED: this is a write into worktree '$_OWN_WT''s payload (.caws/worktrees/$_OWN_WT/...), which is owned by a DIFFERENT session." >&2
            echo "  A worktree's files are owned by the session that created/claimed it; another session must not mutate them directly." >&2
            echo "  This is a CAWS governance decision, not a Claude Code harness prompt." >&2
            echo "  To work in worktree '$_OWN_WT', your SESSION must be rooted there (caws claim '$_OWN_WT' --takeover if you intend to take ownership), not writing into its path from a foreign session." >&2
            echo "  Do NOT edit .claude/hooks/ or guard state to bypass this." >&2
            exit 2 ;;
          block_claimed)
            # A worktree-payload path that also matches a canonical claim. Treat
            # as the canonical claimed-block (session-independent) for legibility.
            # _ORACLE_DETAIL is a COMMA-separated list of name:pattern pairs —
            # one per claiming worktree (CLASH-GUARD-CLAIMANT-LABELING-001).
            _WG_ID="CAWS worktree-write-guard"
            command -v guard_identity >/dev/null 2>&1 && _WG_ID="$(guard_identity worktree-write-guard)"
            echo "[$_WG_ID] BLOCKED: '$FILE_PATH_FOR_ALLOWLIST' is claimed by an active worktree's scope.in." >&2
            # CLASH-GUARD-CLAIMANT-RENDER-HOTFIX-001: array split (no pipe-while).
            IFS=',' read -ra _CLAIM_PAIRS <<< "$_ORACLE_DETAIL"
            _CLAIMANT_COUNT=${#_CLAIM_PAIRS[@]}
            for _pair in "${_CLAIM_PAIRS[@]}"; do
              [[ -z "$_pair" ]] && continue
              _cw="${_pair%%:*}"
              _cp="${_pair#*:}"
              echo "  claimed:$_cw:$_cp — worktree '$_cw' via scope.in '$_cp'" >&2
            done
            [[ "$_CLAIMANT_COUNT" -gt 1 ]] && echo "  $_CLAIMANT_COUNT worktrees claim this path; route the edit through whichever single worktree should own it." >&2
            echo "  This is a CAWS governance decision, not a Claude Code harness prompt." >&2
            exit 2 ;;
          ask_uncertain|error_fail_closed)
            # Cannot prove same-session ownership of worktree payload. Fail
            # CLOSED: ask (never silent-allow). Degrade to block on an
            # ask-incapable harness, consistent with the base-branch tail below.
            _WG_ID="CAWS worktree-write-guard"
            command -v guard_identity >/dev/null 2>&1 && _WG_ID="$(guard_identity worktree-write-guard)"
            _WP_REASON="[$_WG_ID] This write targets worktree payload (.caws/worktrees/...) and ownership could not be confirmed ($_ORACLE_OUT). Approve only if you are the owning session; otherwise route the edit through the owning worktree's session."
            if [[ "${CAWS_GUARD_NO_ASK:-0}" == "1" ]] || ! command -v emit_ask >/dev/null 2>&1; then
              echo "$_WP_REASON" >&2
              echo "  (ask-incapable harness — degraded to block; no silent allow)" >&2
              exit 2
            fi
            emit_ask "$_WP_REASON"
            exit 0 ;;
        esac
      fi
      # Oracle absent (older install) or node missing: preserve the prior
      # behavior (the path was previously allowlisted). Fail OPEN here — the
      # enforcement claim is only made when the oracle is present.
      exit 0 ;;
    "$PROJECT_DIR"/.caws/*|.caws/*) exit 0 ;;
    "$PROJECT_DIR"/.claude/*|.claude/*) exit 0 ;;
    # Root CLAUDE.md is the project-level agent-instruction surface; it lives
    # at the repo root (not under .claude/) so it needs its own arm.
    "$PROJECT_DIR"/CLAUDE.md|CLAUDE.md) exit 0 ;;
    "$PROJECT_DIR"/.gitignore|.gitignore) exit 0 ;;
    "$PROJECT_DIR"/.tmp/*|.tmp/*) exit 0 ;;
    "$PROJECT_DIR"/tmp/*|tmp/*) exit 0 ;;
    "$PROJECT_DIR"/.archive/*|.archive/*) exit 0 ;;
    "$PROJECT_DIR"/.githooks/*|.githooks/*) exit 0 ;;
    "$PROJECT_DIR"/.github/*|.github/*) exit 0 ;;
    "$PROJECT_DIR"/docs/*|docs/*) exit 0 ;;
  esac
fi

# --- Base-branch write enforcement -----------------------------------------
# Harvested from Sterling (HOOK-PACK-DIVERGENCE-RECONCILE-001). Previously
# this hook was fail-open (exit 0) pending CLI-WORKTREE-001; that spec is
# archived and the active successor is WORKTREE-SPEC-AUTHORITY-CONTROL-PLANE-001.
# Enforcement is now restored: writes on the base branch are refused while
# worktrees are active (or whenever no worktree context is present), with a
# scope-contention diagnosis. Uses the dual-shape registry helpers from
# lib/caws-state.sh ($CAWS_NODE_ENTRIES_OF / $CAWS_NODE_ENTRY_SPEC_ID).

# Need the registry + node to enforce; absent either, fail open.
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
# Normalize AGENT_DIR through realpath so the WORKTREE_BASE prefix check
# below is symlink-immune (PROJECT_DIR is already normalized; an
# un-normalized AGENT_DIR like /tmp/... would never prefix-match a
# /private/tmp/... WORKTREE_BASE on macOS).
AGENT_DIR="$(_realpath "$AGENT_DIR")"
CURRENT_BRANCH=$(caws_current_branch "$AGENT_DIR")  # HOOK-LIB-CONSOLIDATION-001 T2b
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
  $CAWS_NODE_ENTRIES_OF
  try {
    var reg = JSON.parse(require('fs').readFileSync('$PROJECT_DIR/.caws/worktrees.json', 'utf8'));
    var current = '$CURRENT_BRANCH';
    var found = entriesOf(reg).some(function(w) {
      return w.branch === current && w.status !== 'destroyed' && w.status !== 'missing';
    });
    console.log(found ? '1' : '0');
  } catch(e) { console.log('0'); }
" 2>/dev/null || echo "0")

if [[ "$IS_REGISTERED_WORKTREE" == "1" ]]; then
  exit 0
fi

WT_INFO=$(node -e "
  $CAWS_NODE_ENTRIES_OF
  var fs = require('fs');
  var path = require('path');
  try {
    var projectDir = '$PROJECT_DIR';
    var reg = JSON.parse(fs.readFileSync(projectDir + '/.caws/worktrees.json', 'utf8'));
    var active = entriesOf(reg).filter(function(w) {
      if (w.status === 'destroyed' || w.status === 'missing') return false;
      if (w.baseBranch !== '$CURRENT_BRANCH') return false;
      // WORKTREE-GUARD-RISK-SURFACE-001: a registry entry whose physical
      // directory does not exist (orphaned/ghost) NEVER counts as an active
      // worktree. Kills the orphaned-registry-entry-blocks-everything bug —
      // registry presence alone must not confer hostility.
      var wtPath = (typeof w.path === 'string' && w.path)
        ? w.path
        : path.join(projectDir, '.caws', 'worktrees', String(w.name || ''));
      return fs.existsSync(wtPath);
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

# Zero worktrees → nothing to isolate → allow (CAWS-GUARD-NO-WORKTREE-NO-BLOCK-001).
# This guard exists to protect worktree ISOLATION: stopping a base-branch write
# from colliding with a parallel agent's worktree (a claimed file) or shared
# tree. With no active worktrees there is no sibling tree, no claimed file, and
# no competing spec — there is nothing to isolate. Asking here (the prior
# behavior) walled first-run setup: a PreToolUse `ask` cannot be pre-approved by
# auto-mode and re-fires on every retry, so an agent editing on main during
# orientation — before it has created its first spec/worktree — was wedged on an
# un-dismissable prompt with no worktree to switch into. The guard re-engages the
# moment a worktree exists (the WT_COUNT > 0 paths below are unchanged).
if [[ "$WT_COUNT" -lt 1 ]] 2>/dev/null; then
  exit 0
fi

if [[ -n "$FILE_PATH" ]] && [[ "$WT_COUNT" -gt 0 ]] 2>/dev/null; then
  # Derive REL_PATH from the realpath-normalized file path so it strips the
  # normalized PROJECT_DIR prefix correctly (see allowlist note above).
  REL_PATH="${FILE_PATH_FOR_ALLOWLIST:-$FILE_PATH}"
  if [[ "$REL_PATH" == "$PROJECT_DIR"/* ]]; then
    REL_PATH="${REL_PATH#$PROJECT_DIR/}"
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

    $CAWS_NODE_ENTRIES_OF
    $CAWS_NODE_ENTRY_SPEC_ID
    $CAWS_NODE_LIFECYCLE
    $CAWS_NODE_GLOB_TO_SCOPE_REGEXP

    try {
      var projectDir = process.env.PROJECT_DIR;
      var currentBranch = process.env.CURRENT_BRANCH;
      var relPath = process.env.REL_PATH;
      var registryPath = path.join(projectDir, '.caws', 'worktrees.json');
      var registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      // entriesOf handles both v10 envelope and v11 flat-map shapes —
      // see lib/caws-state.sh.
      var worktrees = entriesOf(registry).filter(function(w) {
        if (w.status === 'destroyed' || w.status === 'missing') return false;
        if (w.baseBranch !== currentBranch) return false;
        // WORKTREE-GUARD-RISK-SURFACE-001: a dir-gone (orphaned/ghost)
        // registry entry never participates in the authority decision.
        var wtPath = (typeof w.path === 'string' && w.path)
          ? w.path
          : path.join(projectDir, '.caws', 'worktrees', String(w.name || ''));
        return fs.existsSync(wtPath);
      });

      if (worktrees.length === 0) {
        console.log('unknown:no-registry-worktrees');
        process.exit(0);
      }

      // CLASH-GUARD-CLAIMANT-LABELING-001: accumulate EVERY claiming worktree
      // (a contested path may be claimed by more than one active spec) rather
      // than exiting on the first match, so the block names all owners.
      var _claimants = [];
      for (var wi = 0; wi < worktrees.length; wi++) {
        var wt = worktrees[wi];
        // entrySpecId handles both v11 spec_id and v10 specId carryover.
        var wtSpecId = entrySpecId(wt);
        if (!wtSpecId) {
          console.log('unknown:missing-specId:' + (wt.name || 'unnamed'));
          process.exit(0);
        }

        var specPath = path.join(projectDir, '.caws', 'specs', wtSpecId + '.yaml');
        if (!fs.existsSync(specPath)) {
          specPath = path.join(projectDir, '.caws', 'specs', wtSpecId + '.yml');
        }
        if (!fs.existsSync(specPath)) {
          console.log('unknown:missing-spec:' + wtSpecId);
          process.exit(0);
        }

        var spec = yaml.load(fs.readFileSync(specPath, 'utf8')) || {};

        // WORKTREE-GUARD-RISK-SURFACE-001: the HARD-BLOCK authority is an
        // ACTIVE bound spec. A draft or closed/archived bound spec does NOT
        // confer a block — only an active binding does. Non-active bindings
        // fall through to the ask path (the worktree may still be live work,
        // but it is not authority-claiming this file).
        if (lifecycle(spec) !== 'active') {
          continue;
        }

        var scope = spec.scope || {};
        // scope.IN ONLY for the claim. A path appearing in some spec's
        // scope.out must NOT make it 'claimed' — scope.out is exclusion
        // documentation, not a hostility surface (CLAUDE.md trap #4). This
        // is the same over-broad-authority class the slice removes.
        //
        // scope.support is INTENTIONALLY EXCLUDED from the claim surface
        // (WORKTREE-SUPPORT-SCOPE-001): a support path is editable like scope.in
        // but must NEVER establish a worktree claim — that is the entire point
        // of the class (it breaks the compose-trap where a repo-root deliverable
        // pulled into scope.in becomes worktree-claimed and hard-blocks the main
        // checkout). Do NOT add scope.support here; doing so silently
        // reintroduces the trap.
        var patterns = Array.isArray(scope.in) ? scope.in : [];

        if (patterns.length === 0) {
          console.log('unknown:missing-scope:' + wtSpecId);
          process.exit(0);
        }

        for (var pi = 0; pi < patterns.length; pi++) {
          if (globToRegExp(patterns[pi]).test(relPath)) {
            // First matching pattern per worktree; name the worktree once.
            _claimants.push((wt.name || wtSpecId) + ':' + patterns[pi]);
            break;
          }
        }
      }

      if (_claimants.length > 0) {
        // claimed: detail is a COMMA-separated list of name:pattern pairs, one
        // per claiming worktree. A single claimant is byte-identical to the
        // prior single-claimant 'claimed:name:pattern' output.
        console.log('claimed:' + _claimants.join(','));
        process.exit(0);
      }

      console.log('clear');
    } catch (error) {
      console.log('unknown:' + error.message);
    }
  " 2>/dev/null || echo "unknown:node-error")

  # We deliberately do NOT early-return on "clear". Sibling agents routinely
  # edit outside their declared scope (rename refactors, test updates,
  # cross-cutting fixes), and those unclaimed edits are exactly what triggers
  # cross-agent collisions on shared files. We still COMPUTE the contention
  # decision so the block message can tell the user whether the file is
  # claimed, unclaimed, or the check couldn't run.
  :
fi

# Ensure REL_PATH is set for the decision reason even when WT_COUNT==0 (the
# block above that derives REL_PATH only runs when worktrees are active).
if [[ -z "${REL_PATH:-}" ]]; then
  REL_PATH="${FILE_PATH_FOR_ALLOWLIST:-$FILE_PATH}"
  if [[ -n "$REL_PATH" ]] && [[ "$REL_PATH" == "$PROJECT_DIR"/* ]]; then
    REL_PATH="${REL_PATH#$PROJECT_DIR/}"
  fi
fi

# Allow edits during an active merge (conflict resolution). The worktree-
# isolation rules explicitly permit merge commits on the base branch; conflict
# resolution requires Write/Edit on the conflicted files. Checked BEFORE the
# block/ask decision so an in-progress merge is never walled or asked about.
MERGE_HEAD_PATH=$(cd "$AGENT_DIR" && git rev-parse --git-dir 2>/dev/null || echo ".git")
if [[ -f "$MERGE_HEAD_PATH/MERGE_HEAD" ]]; then
  exit 0
fi

# --- Base-branch block-vs-ask decision (WORKTREE-GUARD-RISK-SURFACE-001) ----
#
# The guard HARD-BLOCKS (exit 2) ONLY when an active bound spec's scope.in
# claims this file (SPEC_CONTENTION_CHECK=claimed:*) — the spec→worktree
# authority binding is the block authority. EVERY other base-branch case
# (no worktree present, no spec claims the file, or the check couldn't
# decide) emits permissionDecision:ask and surfaces the risk, letting the
# user approve/deny/direct rather than walling the edit.
#
# ASK DEGRADES TO BLOCK when the harness cannot honor an ask: CAWS_GUARD_NO_ASK=1
# (integrator opt-out for an ask-incapable harness) or emit_ask unavailable
# (lib/emit.sh failed to source). Degradation preserves the no-silent-allow
# guarantee — an ask emitted to a harness that ignores it would let the write
# through.

# _guard_throttled_risk: the composite risk line (dir/spec/agents/lease) from
# caws_compose_risk, THROTTLED via a short-TTL cache so it is not recomputed
# in full (which shells `caws agents list --json`) on every Write/Edit.
# Cache: .caws/cache/risk-<branch>.txt; recompute only when older than TTL.
# CAWS_RISK_THROTTLE_SECS overrides the default 30s (0 disables the cache).
_guard_throttled_risk() {
  command -v caws_compose_risk >/dev/null 2>&1 || return 0
  local ttl="${CAWS_RISK_THROTTLE_SECS:-30}"
  local cache_dir="$PROJECT_DIR/.caws/cache"
  local safe_branch
  safe_branch="$(printf '%s' "${CURRENT_BRANCH:-_}" | tr -c 'A-Za-z0-9._-' '_')"
  local cache_file="$cache_dir/risk-$safe_branch.txt"
  if [[ "$ttl" != "0" ]] && [[ -f "$cache_file" ]]; then
    local now mtime age
    now=$(date +%s 2>/dev/null || echo 0)
    mtime=$(stat -f %m "$cache_file" 2>/dev/null || stat -c %Y "$cache_file" 2>/dev/null || echo 0)
    age=$(( now - mtime ))
    if [[ "$age" -ge 0 ]] && [[ "$age" -lt "$ttl" ]]; then
      cat "$cache_file" 2>/dev/null
      return 0
    fi
  fi
  local line
  line="$(caws_compose_risk "$PROJECT_DIR" "$CURRENT_BRANCH" "$REL_PATH" 2>/dev/null || echo "")"
  if [[ -n "$line" ]] && [[ "$ttl" != "0" ]]; then
    mkdir -p "$cache_dir" 2>/dev/null || true
    printf '%s\n' "$line" > "$cache_file" 2>/dev/null || true
  fi
  printf '%s' "$line"
}

# emit a short worktree-context line for the ask/block reason, with the
# throttled composite risk signal (dir/spec/agents/lease) appended.
_guard_risk_reason() {
  local head="$1"
  local body=""
  if [[ "$WT_COUNT" -eq 0 ]] 2>/dev/null; then
    body="No active worktree is present for branch '$CURRENT_BRANCH'. Worktrees are preferred for isolated feature work; repo-coordination paths (.caws/, .claude/, docs/) are already allowlisted above."
  else
    body="$WT_COUNT active worktree(s) on '$CURRENT_BRANCH': ${WT_NAMES:-<unnamed>}."
    case "${SPEC_CONTENTION_CHECK:-}" in
      clear)      body="$body No active worktree's scope.in claims this file." ;;
      unknown:*)  body="$body Scope contention undetermined (${SPEC_CONTENTION_CHECK}); a bound spec may be missing its id, file, or scope." ;;
    esac
  fi
  local risk
  risk="$(_guard_throttled_risk)"
  if [[ -n "$risk" ]]; then
    body="$body $risk"
  fi
  # Actionable redirect (CAWS-GUARD-ASK-ACTIONABLE-REDIRECT-001 A1/A2, refined
  # by HOOK-GUARD-LEGIBILITY-001): a PreToolUse `ask` cannot be pre-approved by
  # auto-mode and re-fires on every retry, so a generic "cd into the owning
  # worktree" lets an agent loop the human on the same on-main write. When
  # exactly ONE active worktree is present, name it and give the literal path.
  #
  # IMPORTANT WORDING FIX (run-003): a one-off Bash `cd` does NOT move the
  # Edit/Write TOOL context — the tool still operates from the session root.
  # The fix is for your SESSION to be rooted in that worktree, not merely to
  # run a `cd` in one shell. We surface the path (it names WHICH worktree) but
  # frame it as a session-context requirement.
  local redirect="make this edit from a session rooted in the owning worktree (caws worktree list) — or create one (caws worktree create <name>)"
  if [[ "$WT_COUNT" -eq 1 ]] 2>/dev/null; then
    # WT_NAMES is a single name here (it may be comma/space-joined for >1).
    local _wt="${WT_NAMES%%[, ]*}"
    if [[ -n "$_wt" ]] && [[ "$_wt" != "<unnamed>" ]]; then
      redirect="make this edit from a session rooted in worktree '$_wt' (cd .caws/worktrees/$_wt and operate from there — a one-off Bash cd does NOT move your Edit/Write tool context). It is the active worktree for branch '$CURRENT_BRANCH'"
    fi
  fi
  printf '%s %s Approve to edit on the base branch, or %s.' "$head" "$body" "$redirect"
}

# _guard_no_ask: true when the harness cannot honor an ask, so we must block.
_guard_no_ask() {
  [[ "${CAWS_GUARD_NO_ASK:-0}" == "1" ]] && return 0
  command -v emit_ask >/dev/null 2>&1 || return 0
  return 1
}

# CLAIMED → hard block. The genuine authority conflict: an active bound spec
# owns this file via scope.in. This is the only base-branch hard block.
case "${SPEC_CONTENTION_CHECK:-}" in
  claimed:*)
    # Self-identify (HOOK-GUARD-LEGIBILITY-001): name the guard so the reader
    # knows this is CAWS worktree-write-guard, not a harness prompt.
    _WG_ID="CAWS worktree-write-guard"
    command -v guard_identity >/dev/null 2>&1 && _WG_ID="$(guard_identity worktree-write-guard)"
    echo "[$_WG_ID] BLOCKED: '$REL_PATH' is claimed by an active worktree's scope.in." >&2
    # SPEC_CONTENTION_CHECK is "claimed:<wt>:<pattern>[,<wt>:<pattern>...]" — the
    # payload after "claimed:" is a COMMA-separated list of claimants
    # (CLASH-GUARD-CLAIMANT-LABELING-001). List EVERY claimant so the agent sees
    # all owners of a contested path, not just the first.
    _CLAIM_LIST="${SPEC_CONTENTION_CHECK#claimed:}"
    # CLASH-GUARD-CLAIMANT-RENDER-HOTFIX-001: split on comma into an array via
    # `IFS=',' read -ra` (NO pipe, NO `while read` subshell). The prior
    # `printf | tr | while read` form emitted nothing under the guard's actual
    # runtime (hook JSON on stdin + `set -euo pipefail`), dropping the
    # `claimed:<wt>:<pattern>` token the risk-surface test asserts. A `for` over
    # an array is robust to that runtime.
    IFS=',' read -ra _CLAIM_PAIRS <<< "$_CLAIM_LIST"
    _CLAIM_COUNT=${#_CLAIM_PAIRS[@]}
    echo "  (format: claimed:<worktree-name>:<matching-pattern>)" >&2
    for _pair in "${_CLAIM_PAIRS[@]}"; do
      [[ -z "$_pair" ]] && continue
      echo "  claimed:$_pair" >&2
    done
    echo "  This is a CAWS governance decision, not a Claude Code harness prompt." >&2
    # Name the owning worktree(s) (CAWS-GUARD-ASK-ACTIONABLE-REDIRECT-001 A3),
    # but frame the fix as a SESSION-CONTEXT requirement, not a bare shell cd
    # (run-003 fix): a one-off Bash `cd` does NOT move the Edit/Write tool
    # context, so "cd into the worktree" alone makes the agent loop. The edit
    # must come from a SESSION rooted in the owning worktree.
    # The lead claimant is the first comma field; field 1 (pre-colon) is its name.
    _CLAIM_WT="$(printf '%s' "$_CLAIM_LIST" | cut -d, -f1 | cut -d: -f1)"
    if [[ "$_CLAIM_COUNT" -gt 1 ]]; then
      echo "This path is claimed via scope.in by $_CLAIM_COUNT active worktrees (listed above)." >&2
      echo "  Route the edit through whichever single worktree should own it; your SESSION must be rooted in that worktree (a one-off Bash cd does NOT move your Edit/Write tool context)." >&2
    elif [[ -n "$_CLAIM_WT" ]]; then
      echo "To make this edit, your SESSION must be operating in the owning worktree '$_CLAIM_WT'." >&2
      echo "  cd .caws/worktrees/$_CLAIM_WT and operate from there — a one-off Bash cd does NOT move your Edit/Write tool context; the session itself must be rooted in the worktree." >&2
    else
      echo "To make this edit, your SESSION must be operating in the owning worktree (caws worktree list)." >&2
    fi
    echo "Do NOT edit .claude/hooks/ or guard state to bypass this." >&2
    exit 2
    ;;
esac

# Not a claimed conflict → ASK (or degrade to block on ask-incapable harnesses).
# Lead the reason with the self-identifying guard token (HOOK-GUARD-LEGIBILITY-001)
# so a reader can tell this is CAWS worktree-write-guard, not a harness prompt.
_WG_ASK_ID="CAWS worktree-write-guard"
command -v guard_identity >/dev/null 2>&1 && _WG_ASK_ID="$(guard_identity worktree-write-guard)"
_RISK_REASON="$(_guard_risk_reason "$_WG_ASK_ID: base-branch write on '$CURRENT_BRANCH'.")"

if _guard_no_ask; then
  # Degrade to the prior hard block: emit unavailable or harness can't ask.
  echo "[worktree-write-guard.sh] BLOCKED: $_RISK_REASON" >&2
  echo "" >&2
  echo "(ask-incapable harness: CAWS_GUARD_NO_ASK=$CAWS_GUARD_NO_ASK or emit_ask unavailable — falling back to a hard block so the write is not silently allowed.)" >&2
  echo "Do NOT edit .claude/hooks/ or guard state to bypass this. Ask the user if a base-branch edit is genuinely needed." >&2
  exit 2
fi

emit_ask "$_RISK_REASON"
exit 0
