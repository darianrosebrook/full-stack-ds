#!/usr/bin/env bash
# GUARD-CMDTEXT-BOUNDARY-01 — worktree-guard.sh adjudicates COMMAND TEXT, not
# the payload a command carries.
#
# The guard's verb matchers scan the literal Bash command string. Before this
# pin, quoted prose that merely NAMED a refused verb was refused as that verb:
# a commit message describing why stashing is forbidden, an `echo` label, a
# `cat > file <<EOF` body documenting a rule. Each mutated nothing and ran no
# git, and each was blocked.
#
# The fix has two halves and this file pins BOTH DIRECTIONS of each, because a
# one-directional test here is worthless — "allow more" is trivially satisfied
# by deleting the guard:
#
#   forward  payload text that names a verb must be ALLOWED
#   inverse  a real invocation of that verb must still be REFUSED
#   no-hole  a heredoc body that is CODE (piped or fed to an interpreter) must
#            still be REFUSED — the cat/tee safelist must never blank it
#
# The no-hole cases are the load-bearing ones. `cat <<EOF | bash` puts `cat` in
# command position and would qualify as a file sink, but the body is executed;
# blanking it would blind every matcher downstream. That case is a REGRESSION
# THIS SUITE ALREADY CAUGHT ONCE during authoring — keep it.
#
# Case data lives in guard-cmdtext-cases.tsv, deliberately NOT inline: a refused
# verb literal appearing in this script's own argv would be adjudicated by the
# live guard when an agent runs the suite, which is the very defect under test.
#
# Usage: bash .caws/hooks/tests/test_worktree_guard_cmdtext.sh
# Exit:  0 all cases matched, 1 any mismatch.
set -uo pipefail

TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(cd "$TEST_DIR/.." && pwd)"
REPO_ROOT="$(cd "$HOOKS_DIR/../.." && pwd)"
GUARD="${1:-$HOOKS_DIR/worktree-guard.sh}"
CASES="$TEST_DIR/guard-cmdtext-cases.tsv"

if [[ ! -f "$CASES" ]]; then
  echo "FAIL: missing case corpus $CASES" >&2
  exit 1
fi
if [[ ! -f "$HOOKS_DIR/lib/heredoc.sh" ]]; then
  echo "FAIL: lib/heredoc.sh absent — the heredoc-body cases cannot pass" >&2
  exit 1
fi

pass=0
fail=0

while IFS=$'\t' read -r expect label cmd; do
  [[ "$expect" == "EXPECT" || -z "${expect:-}" ]] && continue
  cmd_real=$(printf '%b' "$cmd")   # \n in the corpus encodes a real newline
  payload=$(CMD="$cmd_real" python3 -c 'import json,os;print(json.dumps({"tool_name":"Bash","tool_input":{"command":os.environ["CMD"]}}))')
  out=$(printf '%s' "$payload" | CAWS_AGENT_SURFACE=claude-code CAWS_PROJECT_DIR="$REPO_ROOT" bash "$GUARD" 2>&1)
  code=$?
  [[ $code -eq 0 ]] && actual=ALLOW || actual=BLOCK

  case "$expect" in
    ALLOW)               want=ALLOW ;;
    BLOCK|BYPASS-BLOCK)  want=BLOCK ;;
    *) echo "FAIL: unknown EXPECT '$expect' for '$label'" >&2; exit 2 ;;
  esac

  if [[ "$actual" == "$want" ]]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    printf 'FAIL  [%s] %s\n' "$expect" "$label" >&2
    printf '      expected %s, got %s\n' "$want" "$actual" >&2
    [[ $code -ne 0 ]] && printf '      guard said: %s\n' "$(printf '%s' "$out" | head -1)" >&2
    if [[ "$expect" == "BYPASS-BLOCK" ]]; then
      printf '      ^ THIS IS A BYPASS: a heredoc body that executes was hidden from the matchers.\n' >&2
    fi
  fi
done < "$CASES"

if [[ $fail -eq 0 ]]; then
  echo "worktree-guard cmdtext boundary: PASS ($pass cases)"
  exit 0
fi
echo "worktree-guard cmdtext boundary: FAIL ($pass passed, $fail failed)" >&2
exit 1
