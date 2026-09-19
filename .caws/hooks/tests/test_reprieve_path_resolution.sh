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
# PRECEDENCE when both locations hold a record: the machine-global one decides,
# by PRESENCE and not by validity. Cases 9 and 9b pin both halves — a valid
# global beats a stale local, and an expired global is not resurrected by a
# valid local. The second half is the security-relevant one: revoking a grant
# centrally must not be undoable by a leftover file in one repo.
#
# All state is synthetic: CAWS_HOME and CAWS_PROJECT_DIR are pointed at a temp
# tree, so the suite never reads or writes the operator's real reprieve records
# and cannot grant itself anything. CAWS_HOME is load-bearing for that
# isolation — see the note in consult().
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

# A well-formed record. created_at/approved_by/reason must each be a non-empty
# string or the reader treats the record as malformed — an provenance-less grant
# is not a grant. repo_root is deliberately omitted: absent means machine-wide,
# which is what --all-repos writes and what pre-reach records look like.
write_record() {  # <path> <expires> <handlers-json>
  mkdir -p "$(dirname "$1")"
  printf '{"session_id":"%s","created_at":"%s","expires_at":"%s","approved_by":"t","reason":"t","handlers":%s}\n' \
    "$SESSION" "$PAST" "$2" "$3" > "$1"
}

# Same, minus one required provenance field, to pin that the reader refuses it.
write_record_without() {  # <path> <field-to-omit>
  mkdir -p "$(dirname "$1")"
  python3 - "$1" "$2" "$SESSION" "$FUTURE" <<'PY'
import json, sys
path, omit, session, future = sys.argv[1:5]
rec = {"session_id": session, "created_at": "2026-01-01T00:00:00Z",
       "expires_at": future, "approved_by": "t", "reason": "t",
       "handlers": ["scope-guard.sh"]}
rec.pop(omit, None)
with open(path, "w") as f:
    json.dump(rec, f)
PY
}

# Ask the reader for a verdict in a clean subshell so no state leaks between
# cases. Echoes YES / NO.
consult() {  # <handler> <session>
  (
    export CAWS_PROJECT_DIR="$TMP/repo"
    # CAWS_HOME (not CAWS_HOME_STATE_DIR) is what pins the machine-global
    # location: the reader derives "<CAWS_HOME>/state/sessions/<id>/". Getting
    # this wrong does not fail loudly — it silently resolves against the
    # operator's REAL ~/.caws, which is exactly what this suite must never do.
    export CAWS_HOME="$TMP/home/.caws"
    export CAWS_VENDOR_DIR=".claude"
    # shellcheck source=/dev/null
    source "$HOOKS_DIR/lib/reprieve.sh"
    # Pin the LEGACY (repo-local) dir to the synthetic repo: the real resolver
    # walks git-common-dir, which would escape the temp tree. Override the
    # legacy resolver specifically — caws_reprieve_state_dir is the GLOBAL one
    # and is already confined by CAWS_HOME above, so both locations stay inside
    # the temp tree.
    _caws_legacy_reprieve_state_dir() { printf '%s\n' "$REPO_STATE"; }
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

# 9. Precedence when BOTH locations hold a record: the machine-global one
#    governs. `caws reprieve grant` writes globally, so a stale expired
#    repo-local leftover must not veto a grant the operator just issued — that
#    would be a milder replay of the defect this suite exists to pin.
write_record "$REPO_REC" "$PAST" '["scope-guard.sh"]'
write_record "$HOME_REC" "$FUTURE" '["scope-guard.sh"]'
check "valid machine-global governs over expired repo-local" YES "$(consult scope-guard.sh "$SESSION")"

# 9b. The inverse, and the reason presence (not validity) decides: an expired
#     or revoked GLOBAL record must never be resurrected by a still-valid
#     repo-local copy. Without this, revoking a grant centrally could be undone
#     by a leftover file in one repo.
write_record "$REPO_REC" "$FUTURE" '["scope-guard.sh"]'
write_record "$HOME_REC" "$PAST" '["scope-guard.sh"]'
check "expired machine-global is not resurrected by repo-local" NO "$(consult scope-guard.sh "$SESSION")"

# 10. Malformed record fails open (refuses), never crashes the caller.
printf 'not json at all\n' > "$REPO_REC"
rm -f "$HOME_REC"
check "malformed record refuses" NO "$(consult scope-guard.sh "$SESSION")"

# 11. Provenance is mandatory. A record that is otherwise valid and unexpired
#     but cannot say who approved it, why, or when it was created is refused.
#     Pinned per-field: a single combined case would pass while two of the
#     three checks were missing.
for field in created_at approved_by reason; do
  rm -f "$HOME_REC"
  write_record_without "$REPO_REC" "$field"
  check "record missing $field refuses" NO "$(consult scope-guard.sh "$SESSION")"
done

# 12. Control for case 11: the same writer WITH every field present is admitted,
#     so the refusals above are attributable to the omitted field and not to
#     write_record_without emitting something the reader rejects anyway.
rm -f "$HOME_REC"
write_record_without "$REPO_REC" none
check "record with full provenance is admitted" YES "$(consult scope-guard.sh "$SESSION")"

if [[ $fail -eq 0 ]]; then
  echo "reprieve path resolution: PASS ($pass cases)"
  exit 0
fi
echo "reprieve path resolution: FAIL ($pass passed, $fail failed)" >&2
exit 1
