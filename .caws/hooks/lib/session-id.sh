#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 42
# caws_min_major: 11
# lineage_refs: (new — CAWS-SESSION-RESOLVER-GUARD-DIVERGENCE-001)
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
# Session-id resolver — the SHELL-SIDE single source of truth for "what is the
# current session id?" across every hook that needs to compare against a
# worktree owner.
#
# WHY THIS EXISTS (CAWS-SESSION-RESOLVER-GUARD-DIVERGENCE-001). Before this lib,
# three shell surfaces each re-implemented their own session-id precedence, and a
# fourth (the write guards) passed ONLY HOOK_SESSION_ID to the ownership oracle.
# The TS resolver (resolve-session.ts) used yet another, broader chain. The four
# chains disagreed, so the surface that STAMPED an owner (worktree create, via the
# resolver) and the surface that CHECKED an owner (the guards, via the oracle)
# read different sources — and whenever they disagreed the rightful owner was
# treated as foreign (false block_foreign_worktree), or, worse, a foreign session
# could be treated as owner-self. This lib is the shell half of the fix: ONE
# env-var precedence every shell surface consults, mirroring the resolver's chain.
#
# THE CANONICAL PRECEDENCE (env vars only; shell cannot scan disk):
#   1. CLAUDE_SESSION_ID     — operator override (deliberate; always wins)
#   2. CLAUDE_CODE_SESSION_ID — Claude Code harness UUID; survives the agent-Bash
#                               tool boundary (HOOK_SESSION_ID does not)
#   3. CODEX_THREAD_ID        — Codex harness per-thread id; survives the tool
#                               boundary. THE fix for the codex incident: codex
#                               exports this, not CLAUDE_*_SESSION_ID.
#   4. QWEN_CODE_SESSION_ID   — Qwen Code harness session UUID (probed live on
#                               0.21.4); survives the tool boundary.
#   5. CAWS_SESSION_ID        — generic CAWS escape hatch (any harness)
#   6. HOOK_SESSION_ID        — the hook-envelope id (set only inside the hook's
#                               own shell; does NOT propagate to agent-Bash)
#   7. CURSOR_TRACE_ID        — cursor low-stability fallback
#   → "unknown" sentinel when nothing is set (the resolver refuses this literal).
#
# This MUST stay in lockstep with resolve-session.ts's env-var tiers
# (claude_env → claude_code_env → codex_thread_env → qwen_env → caws_env →
# hook_env → cursor_env). If you add a source to one, add it to the other.
#
# SURFACE DISPATCH. Each harness exports a DIFFERENT per-session id under a
# DIFFERENT env var. Rather than branch on a hardcoded harness name (architecture
# invariant: the shared core must not), this chain simply consults every known
# per-surface var in priority order. The first non-empty, non-"unknown" value
# wins — and because each harness only sets its OWN var, there is no collision
# across concurrent surfaces in the same shell.
#
# IDEMPOTENT: safe to source multiple times.

if [[ -n "${_CAWS_SESSION_ID_SH_LOADED:-}" ]]; then
  return 0 2>/dev/null || exit 0
fi
_CAWS_SESSION_ID_SH_LOADED=1

# resolve_caws_session_id — print the current session id per the canonical
# precedence, or "unknown" if no source is set. Pure function (no side effects,
# no exports) so callers can compose it. Callers that need the id as a variable:
# s="$(resolve_caws_session_id)".
#
# Precedence (mirrors the TS resolver resolve-session.ts so shell + TS agree on
# identity by construction — CAWS-SESSION-SHELL-RESOLVER-CAPSULE-001):
#   1. $1 payload id (harness-stamped stdin session_id; wins when present)
#   2. env identity vars (CLAUDE_SESSION_ID / CLAUDE_CODE_SESSION_ID /
#      CODEX_THREAD_ID / QWEN_CODE_SESSION_ID / CAWS_SESSION_ID /
#      HOOK_SESSION_ID / CURSOR_TRACE_ID)
#   3. the durable capsule at .caws/sessions/caws-<id>.json — the shell mirror
#      of the TS resolver's tier-3 readCapsule, and the same file caws worktree
#      create records as the owner. Reached when the env chain misses (the
#      agent-Bash case where no identity env var survives the subshell). Without
#      it, the resolver returned "unknown" and the write-guards treated the
#      owner's own edits as foreign. This is completing the shell resolver to
#      match the canonical identity model, NOT a parallel fallback.
# Returns "unknown" only when no capsule exists (fresh repo, no mint yet).
resolve_caws_session_id() {
  local payload_id="${1:-}"
  # The hook payload's session_id is the most authoritative when present (it is
  # what the harness stamped on THIS tool call). Mirror block-dangerous.sh's
  # historical behavior of preferring it over env.
  if [[ -n "$payload_id" && "$payload_id" != "unknown" ]]; then
    printf '%s\n' "$payload_id"
    return 0
  fi
  if [[ -n "${CLAUDE_SESSION_ID:-}" ]]; then
    printf '%s\n' "$CLAUDE_SESSION_ID"
    return 0
  fi
  if [[ -n "${CLAUDE_CODE_SESSION_ID:-}" && "${CLAUDE_CODE_SESSION_ID}" != "unknown" ]]; then
    printf '%s\n' "$CLAUDE_CODE_SESSION_ID"
    return 0
  fi
  if [[ -n "${CODEX_THREAD_ID:-}" && "${CODEX_THREAD_ID}" != "unknown" ]]; then
    printf '%s\n' "$CODEX_THREAD_ID"
    return 0
  fi
  if [[ -n "${QWEN_CODE_SESSION_ID:-}" && "${QWEN_CODE_SESSION_ID}" != "unknown" ]]; then
    printf '%s\n' "$QWEN_CODE_SESSION_ID"
    return 0
  fi
  if [[ -n "${CAWS_SESSION_ID:-}" && "${CAWS_SESSION_ID}" != "unknown" ]]; then
    printf '%s\n' "$CAWS_SESSION_ID"
    return 0
  fi
  if [[ -n "${HOOK_SESSION_ID:-}" && "${HOOK_SESSION_ID}" != "unknown" ]]; then
    printf '%s\n' "$HOOK_SESSION_ID"
    return 0
  fi
  if [[ -n "${CURSOR_TRACE_ID:-}" ]]; then
    printf '%s\n' "$CURSOR_TRACE_ID"
    return 0
  fi
  # Resolve the .caws dir (needed by the agent-PID and capsule tiers).
  # Reused below by both — compute once.
  local _caws_sid_dir="${CAWS_PROJECT_DIR:-}"
  if [[ -z "$_caws_sid_dir" || "$_caws_sid_dir" == "." ]]; then
    local _caws_self="${BASH_SOURCE[0]:-}"
    if [[ -n "$_caws_self" ]]; then
      _caws_sid_dir="$(cd "$(dirname "$_caws_self")/../../.." 2>/dev/null && pwd)"
    fi
  fi
  # Tier 2.8 (CAWS-AGENT-PID-SESSION-CORRELATION-001): the agent-PID
  # correlation record. Reached when the env chain misses — exactly the case
  # for harnesses that export no session-id env var (ZCode / generic). The
  # agent process is a stable, per-session-unique ANCESTOR of this process;
  # its PID keys a record the hook wrote (parse-input.sh's
  # _write_agent_pid_record) carrying the authoritative HOOK_SESSION_ID.
  # This is the canonical-checkout identity bridge — it resolves BEFORE the
  # capsule tier so the first-match-wins capsule fallback can no longer
  # silently misattribute. Fail-opens (prints nothing, continues) on any
  # miss: missing record, unfound agent ancestor (unknown surface),
  # stale record, or PID-reuse start-time mismatch.
  if [[ -n "$_caws_sid_dir" ]]; then
    # Source agent-pid.sh if the read function isn't already defined (a
    # caller may have sourced session-id.sh without it). Best-effort.
    if ! declare -F read_session_id_from_agent_pid >/dev/null 2>&1; then
      local _caws_self2="${BASH_SOURCE[0]:-}"
      [[ -n "$_caws_self2" ]] && source "$(dirname "$_caws_self2")/agent-pid.sh" 2>/dev/null || true
    fi
    if declare -F read_session_id_from_agent_pid >/dev/null 2>&1; then
      local _caws_pid_sid
      _caws_pid_sid="$(read_session_id_from_agent_pid \
        "${_caws_sid_dir}/.caws" "${CAWS_AGENT_PROCESS_NAMES:-}")"
      if [[ -n "$_caws_pid_sid" && "$_caws_pid_sid" != "unknown" ]]; then
        printf '%s\n' "$_caws_pid_sid"
        return 0
      fi
    fi
  fi
  # Tier 3 (CAWS-SESSION-SHELL-RESOLVER-CAPSULE-001): the durable capsule. This
  # is the shell mirror of resolve-session.ts's tier-3 readCapsule — the same
  # .caws/sessions/caws-<id>.json file caws worktree create records as the owner.
  # Reached when the env chain AND the agent-PID tier miss, so the resolver
  # stops returning "unknown" for the owner's own process. Bounded: one glob,
  # first match. Fail-opens to "unknown" when no capsule exists.
  if [[ -n "$_caws_sid_dir" ]]; then
    local _caws_capsule
    # First caws-*.json capsule (skip dotfiles like .caller-session.json). The
    # capsule shape is {session_id, platform, minted_at, worktree_root}; we read
    # only session_id. A malformed file is skipped (fail-open), not fatal.
    _caws_capsule="$(ls "$_caws_sid_dir/.caws/sessions"/caws-*.json 2>/dev/null | head -1)"
    if [[ -n "$_caws_capsule" && -f "$_caws_capsule" ]]; then
      local _caws_sid
      _caws_sid="$(python3 -c 'import json,sys
try:
    d=json.load(open(sys.argv[1]))
    sid=d.get("session_id")
    if isinstance(sid,str) and sid: print(sid)
except Exception:
    pass
' "$_caws_capsule" 2>/dev/null)"
      if [[ -n "$_caws_sid" && "$_caws_sid" != "unknown" ]]; then
        printf '%s\n' "$_caws_sid"
        return 0
      fi
    fi
  fi
  printf '%s\n' "unknown"
}

# resolve_caws_session_id_with_payload — convenience wrapper for guards that
# have HOOK_SESSION_ID already populated from the hook payload but ALSO need to
# fall back to the boundary-crossing vars when HOOK_SESSION_ID is absent (the
# agent-Bash case). Prints the resolved id. Identical to resolve_caws_session_id
# with HOOK_SESSION_ID as the payload argument; kept as a named entry point so
# call sites read clearly.
resolve_caws_session_id_with_payload() {
  resolve_caws_session_id "${1:-${HOOK_SESSION_ID:-}}"
}
