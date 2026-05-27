#!/bin/bash
# PreToolUse dispatcher for Claude Code hooks.
#
# Single entry point invoked from settings.json's PreToolUse block. Reads
# stdin ONCE, sanitizes it via lib/parse-input.sh, then invokes every
# registered handler with HOOK_* env vars inherited and the sanitized
# JSON piped to each handler's stdin.
#
# Handlers self-filter via their own matcher predicate (a case statement
# on $HOOK_TOOL_NAME at the top of the script). The dispatcher does NOT
# duplicate matcher logic -- keeping the per-handler short-circuit
# alongside the code that depends on it means matcher and policy stay in
# the same file.
#
# Exit-code aggregation:
#   - First handler exiting 2 short-circuits the remaining handlers and
#     the dispatcher returns 2 (blocking).
#   - Non-zero non-2 exits are warnings; the dispatcher continues and
#     returns the max non-2 code at the end.
#   - Stderr from each handler is prefixed with "[<handler>]" so the user
#     can see which guard emitted the message.
#   - Stdout: each handler's stdout is buffered; the LAST non-empty buffer
#     is forwarded to the dispatcher's stdout. Today only quiet-merge.sh
#     writes structured stdout (hookSpecificOutput), so "last wins" is
#     safe. If two handlers ever both write stdout, the later one wins
#     and we should revisit.
#
# Fail-open: if the dispatcher itself errors before any handler runs
# (parser crash, missing lib), it exits 0 rather than blocking the tool.
# Guard infrastructure must not turn its own bugs into tool-call blocks.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")"

# shellcheck source=../lib/parse-input.sh
source "$HOOKS_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

# shellcheck source=../lib/run-handlers.sh
source "$HOOKS_DIR/lib/run-handlers.sh" 2>/dev/null || exit 0

# Registered handlers in execution order. Preserve the order from the
# pre-registry settings.json so strike counters, block messages, and any
# ordering-sensitive behavior match exactly. Each handler self-filters
# on $HOOK_TOOL_NAME; non-matching cases return exit 0 cheaply.
HANDLERS=(
  cwd-guard.sh
  block-dangerous.sh
  worktree-guard.sh
  quiet-merge.sh
  protected-paths.sh
  scope-guard.sh
  worktree-write-guard.sh
  scan-secrets.sh
)

run_handlers --short-circuit-on-block "${HANDLERS[@]}"
