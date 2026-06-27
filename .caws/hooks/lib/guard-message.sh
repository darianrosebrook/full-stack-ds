#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 1
# caws_min_major: 11
# lineage_refs: 8,11,12,16,17
# do_not_edit_directly: update via `caws init`
# Shared guard-message legibility helpers (HOOK-GUARD-LEGIBILITY-001).
#
# WHY THIS EXISTS. The caws-firsttime-probe run-003 proved every write/exec
# guard layer (scope-guard, worktree-write-guard, block-dangerous) is reachable
# and correct — yet a first-timer (the probing agent itself, three times)
# mis-attributed CAWS refusal prompts to the agent harness, because the
# REASON string did not say which guard fired or what to do about it. A correct
# guard that does not name itself reads as harness noise, and noise gets
# dismissed. This file centralizes two things every guard refusal should carry:
#
#   1. a STABLE, GREPPABLE identity prefix naming the guard, so the reader can
#      tell it is CAWS governance and WHICH guard — never a generic confirm
#      indistinguishable from a harness permission prompt; and
#   2. a literal, copy-pasteable REMEDIATION command where one exists.
#
# These helpers produce TEXT only. They do not decide, block, ask, or latch —
# the calling guard owns the decision and the envelope (see lib/emit.sh). This
# slice changes message text, never enforcement.
#
# Functions:
#   guard_identity <guard-name>
#       Echo the stable identity token for a guard, e.g.
#       "CAWS scope-guard". Callers prepend this to a reason so the FIRST
#       thing the reader sees names the mechanism. <guard-name> is a short
#       slug: scope-guard | worktree-write-guard | command-safety.
#
#   guard_amend_scope_hint <spec-id> <path>
#       Echo the literal widening command a reader can copy-paste to bring
#       <path> into the bound spec's scope.in. When <spec-id> is empty/unknown,
#       emits a clearly-placeholdered form so the reader still knows the shape.
#
#   guard_not_harness_note
#       Echo a one-line disambiguation reminding the reader this is CAWS
#       governance, not an agent-harness permission prompt.

# Guard against double-sourcing.
if [[ -n "${_CAWS_GUARD_MESSAGE_SH_LOADED:-}" ]]; then
  return 0 2>/dev/null || exit 0
fi
_CAWS_GUARD_MESSAGE_SH_LOADED=1

# guard_identity <guard-name>
#   Stable identity prefix. Kept as plain "CAWS <slug>" so it is greppable in
#   logs and unambiguous to a reader scanning a permission prompt. Unknown
#   slugs pass through prefixed (fail-open on text — never blocks).
guard_identity() {
  local slug="${1:-guard}"
  printf 'CAWS %s' "$slug"
}

# guard_amend_scope_hint <spec-id> <path>
#   The literal copy-pasteable scope-widening command. The whole point of the
#   slice: a reader who hits an out-of-scope refusal should not have to recall
#   the command shape — it is printed, ready to paste.
guard_amend_scope_hint() {
  local spec_id="${1:-}"
  local path="${2:-<path>}"
  if [[ -z "$spec_id" ]]; then
    spec_id="<spec-id>"
  fi
  printf 'caws specs amend-scope %s --add %s' "$spec_id" "$path"
}

# guard_not_harness_note
#   One-line disambiguation. Run-003's core finding: the agent could not tell a
#   CAWS scope-ask from a harness confirm. This sentence ends that ambiguity.
#   Surface name is included when CAWS_AGENT_SURFACE is set so the message is
#   specific to the agent harness the user is working in.
guard_not_harness_note() {
  local surface="${CAWS_AGENT_SURFACE:-}"
  if [[ -n "$surface" ]]; then
    printf 'This is a CAWS governance decision, not a %s harness prompt.' "$surface"
  else
    printf 'This is a CAWS governance decision, not an agent harness prompt.'
  fi
}
