#!/usr/bin/env bash
# GUARD-REPRIEVE-PATH-SPLIT-01 — the reprieve reader finds a record in BOTH the
# repo-local state dir and the machine-global session dir the caws CLI writes.
#
# The defect this pins was silent and total: `caws reprieve grant` reported
# success and wrote a well-formed record to ~/.caws/state/sessions/<id>/, while
# this reader looked only in <repo>/.claude/hooks/state/. Every guard the grant
# named kept blocking. A guard that reports success while doing nothing is the
# worst failure shape available, so the machine-global case below is the
# load-bearing one — but the repo-local case is pinned too, because "find it
# anywhere" must not become "stop finding it where it used to be".
#
# The negative cases matter as much: widening WHERE a record is read from must
# not widen WHAT is accepted. An expired record, a record naming a different
# handler, and an unresolved session id must all still refuse — in EITHER
# location. Without those, this suite would pass against a reader that simply
# returned 0.
#
# All state is synthetic: CAWS_HOME_STATE_DIR and CAWS_PROJECT_DIR are pointed
# at a temp tree, so the suite never reads or writes the operator's real
# reprieve records and cannot grant itself anything.
set -uo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(cd "$TEST_DIR/.." && pwd)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

SESSION="test-session-0000"
OTHER_SESSION="test-session-ffff"
FUTURE="$(python3 -c 'import datetime;print((datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(hours=1)).isoformat().replace("+00:00","Z"))')"
PAST="$(python3 -c 'import datetime;print((datetime.datetime.now(datetime.timezone.utc)-datetime.timedelta(hours=1)).isoformat().replace("+00:00","Z"))')"

REPO_STATE="$TMP/repo/.claude/hooks/state"
HOME_STATE="$TMP/home/.caws/state"
mkdir -p "$REPO_STATE" "$HOME_STATE/sessions/$SESSION"

write_record() {  # <path> <expires> <handlers-json>
  mkdir -p "$(dirname "$1")"
  printf '{"session_id":"%s","expires_at":"%s","approved_by":"t","reason":"t","handlers":%s}\n' \
    "$SESSION" "$2" "$3" > "$1"
}

# Ask the reader for a verdict in a clean subshell so no state leaks between
# cases. Echoes YES / NO.
consult() {  # <handler> <session>
  (
    export CAWS_PROJECT_DIR="$TMP/repo"
    export CAWS_HOME_STATE_DIR="$HOME_STATE"
    export CAWS_VENDOR_DIR=".claude"
    # shellcheck source=/dev/null
    source "$HOOKS_DIR/lib/reprieve.sh"
    # Pin the state dir to the synthetic repo: the real resolver walks
    # git-common-dir, which would escape the temp tree.
    caws_reprieve_state_dir() { printf '%s\n' "$REPO_STATE"; }
    if caws_is_handler_reprieved "$1" "$2"; then echo YES; else echo NO; fi
  )
}

pass=0; fail=0
check() {  # <label> <expected> <actual>
  if [[ "$2" == "$3" ]]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    printf 'FAIL  %s: expected %s, got %s\n' "$1" "$2" "$3" >&2
  fi
}

REPO_REC="$REPO_STATE/guard-reprieve-$SESSION.json"
HOME_REC="$HOME_STATE/sessions/$SESSION/guard-reprieve-$SESSION.json"

# 1. Machine-global only — the defect case. Nothing repo-local.
rm -f "$REPO_REC"
write_record "$HOME_REC" "$FUTURE" '["scope-guard.sh"]'
check "machine-global record is honoured" YES "$(consult scope-guard.sh "$SESSION")"

# 2. Repo-local only — the pre-existing behaviour must not regress.
rm -f "$HOME_REC"
write_record "$REPO_REC" "$FUTURE" '["scope-guard.sh"]'
check "repo-local record still honoured" YES "$(consult scope-guard.sh "$SESSION")"

# 3. Neither location.
rm -f "$REPO_REC" "$HOME_REC"
check "no record anywhere refuses" NO "$(consult scope-guard.sh "$SESSION")"

# 4. Expired, machine-global. Widening location must not widen acceptance.
write_record "$HOME_REC" "$PAST" '["scope-guard.sh"]'
check "expired machine-global refuses" NO "$(consult scope-guard.sh "$SESSION")"

# 5. Expired, repo-local.
rm -f "$HOME_REC"
write_record "$REPO_REC" "$PAST" '["scope-guard.sh"]'
check "expired repo-local refuses" NO "$(consult scope-guard.sh "$SESSION")"

# 6. Valid record that does NOT name the handler being consulted.
rm -f "$REPO_REC"
write_record "$HOME_REC" "$FUTURE" '["protected-paths.sh"]'
check "unnamed handler refuses" NO "$(consult scope-guard.sh "$SESSION")"

# 7. Valid record, but consulted for a DIFFERENT session id.
check "other session refuses" NO "$(consult scope-guard.sh "$OTHER_SESSION")"

# 8. Unresolved session id is never admitted.
check "unknown session refuses" NO "$(consult scope-guard.sh unknown)"

# 9. A present-but-expired repo-local record is decisive: it must NOT be
#    silently upgraded by a valid machine-global one. First-existing, not
#    first-valid — otherwise a stale local file becomes invisible rather than
#    authoritative and an operator cannot tell which record governed.
write_record "$REPO_REC" "$PAST" '["scope-guard.sh"]'
write_record "$HOME_REC" "$FUTURE" '["scope-guard.sh"]'
check "expired repo-local is not upgraded by machine-global" NO "$(consult scope-guard.sh "$SESSION")"

# 10. Malformed record fails open (refuses), never crashes the caller.
printf 'not json at all\n' > "$REPO_REC"
rm -f "$HOME_REC"
check "malformed record refuses" NO "$(consult scope-guard.sh "$SESSION")"

if [[ $fail -eq 0 ]]; then
  echo "reprieve path resolution: PASS ($pass cases)"
  exit 0
fi
echo "reprieve path resolution: FAIL ($pass passed, $fail failed)" >&2
exit 1
