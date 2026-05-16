#!/bin/bash
# PostToolUse dispatcher for Claude Code hooks.
#
# Single entry point invoked from settings.json's PostToolUse block. Reads
# stdin ONCE, sanitizes via lib/parse-input.sh, then invokes every
# registered handler with HOOK_* env vars inherited and the sanitized
# JSON piped to each handler's stdin.
#
# Differences from pre_tool_use.sh:
#   - HANDLERS entries may carry a positional argument (e.g. "audit.sh
#     tool-use"). Entries are split on whitespace and passed to the
#     handler as argv, so existing scripts that dispatch on $1 keep
#     working without change.
#   - Exit 2 is a no-op for PostToolUse semantically (the tool has
#     already run) but we still honor it to short-circuit the chain and
#     propagate the blocker's stderr, matching the pre-tool-use
#     contract.
#
# Stdout: last non-empty handler buffer wins. Most PostToolUse handlers
# write hookSpecificOutput JSON (quality-check, validate-spec, naming,
# doc-frontmatter). Since each of those self-filters on file type, only
# one of them emits stdout for any given Write/Edit. If two ever collide
# (e.g., a YAML file that happens to match both the spec validator and
# the naming check), the later-in-HANDLERS wins. Order below is set so
# the more informative check runs last.
#
# Stderr: prefixed with "[<handler>]" so the source of any message is
# visible to the agent.
#
# Fail-open: parser or lib failure returns exit 0 silently.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$(dirname "$SCRIPT_DIR")"

# shellcheck source=../lib/parse-input.sh
source "$HOOKS_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
parse_hook_input || exit 0

# shellcheck source=../lib/run-handlers.sh
source "$HOOKS_DIR/lib/run-handlers.sh" 2>/dev/null || exit 0

# Registered handlers in execution order. Mirrors the pre-registry
# settings.json groups so ordering-sensitive behavior (stdout "last
# wins" policy, audit log ordering) is preserved.
HANDLERS=(
  "quality-check.sh"
  "validate-spec.sh"
  "naming-check.sh"
  "doc-frontmatter-check.sh"
  "audit.sh tool-use"
  "plan-transcript-snapshot.sh"
  "session-log.sh"
)

run_handlers "${HANDLERS[@]}"
