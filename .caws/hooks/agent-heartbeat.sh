#!/bin/bash
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 1
# caws_min_major: 11
# lineage_refs: 19
# do_not_edit_directly: update via `caws init`
#
# PreToolUse handler — heartbeats the current session's lease and surfaces
# parallel-agent presence to the calling agent
# (MULTI-AGENT-ACTIVITY-REGISTRY-001).
#
# Sourcing: invoked by dispatch/pre_tool_use.sh (FIRST in the handler
# list) after parse-input.sh has populated HOOK_SESSION_ID. The dispatcher
# runs with --short-circuit-on-block; this handler must never block.
#
# Behavior:
#   - Refuses on empty/unknown HOOK_SESSION_ID.
#   - Invokes `caws agents heartbeat --session-id <id>
#     --platform "$CAWS_PLATFORM_FLAG" --throttle 30000 --reason pre_tool_use
#     --json --include-active-summary`.
#   - Parses CAWS-native JSON. When active_agent_count > 1, wraps the
#     active_agents list into the harness's hookSpecificOutput.additionalContext
#     envelope and emits it on stdout. When the count is 1 (self only),
#     emits nothing — silent in the common case.
#
# IO BOUNDARY: this script is the surface that emits the parallel-agent
# presence notice. The CLI emits CAWS-native JSON only. A different surface
# integration would rewrite this script to emit its own protocol-specific
# output while reusing the same `caws agents heartbeat --json
# --include-active-summary` command verbatim.
#
# FAIL-CLOSED-NON-BLOCKING: if the CLI is absent, fails, or returns
# malformed JSON, this hook exits 0 silently. Heartbeat is observability
# and parallel-agent surfacing; a failure must never block the tool call.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=lib/parse-input.sh
source "$SCRIPT_DIR/lib/parse-input.sh" 2>/dev/null || exit 0
# shellcheck source=lib/agent-surface.sh
# Provides CAWS_PROJECT_DIR, CAWS_PLATFORM_FLAG, and caws_source_lib.
# Must be sourced before caws_source_lib calls below.
source "$SCRIPT_DIR/lib/agent-surface.sh" 2>/dev/null || true
# shellcheck source=lib/emit.sh
# Use caws_source_lib so a vendor override (e.g. codex ask->deny) is
# preferred over the shared default when present.
caws_source_lib emit.sh 2>/dev/null || true
parse_hook_input || exit 0

if [[ -z "${HOOK_SESSION_ID:-}" || "$HOOK_SESSION_ID" == "unknown" ]]; then
  exit 0
fi

CAWS_BIN="${CAWS_BIN:-caws}"
if ! command -v "$CAWS_BIN" >/dev/null 2>&1; then
  exit 0
fi

# Capture both stdout (JSON) and stderr (diagnostics). On any CLI error,
# fall through to silent exit.
CLI_OUT="$(
  "$CAWS_BIN" agents heartbeat \
    --session-id "$HOOK_SESSION_ID" \
    --platform "$CAWS_PLATFORM_FLAG" \
    --throttle 30000 \
    --reason pre_tool_use \
    --json \
    --include-active-summary \
  2>/dev/null
)" || exit 0

if [[ -z "$CLI_OUT" ]]; then
  exit 0
fi

# Parse the CAWS-native JSON and, when active_agent_count > 1, compose
# the harness's hookSpecificOutput.additionalContext envelope.
# Change-detection guard: emit the MULTI-AGENT NOTICE only when the
# active-peer set has actually changed since the last emission.
PROJECT_DIR_FOR_CACHE="${CAWS_PROJECT_DIR:-.}"
EMIT_STATE_FILE="$PROJECT_DIR_FOR_CACHE/.caws/leases/heartbeat-emit-state.json"

_HEARTBEAT_CTX="$(printf '%s' "$CLI_OUT" | EMIT_STATE_FILE="$EMIT_STATE_FILE" node -e '
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { raw += chunk; });
  process.stdin.on("end", () => {
    let parsed;
    try { parsed = JSON.parse(raw); } catch { process.exit(0); }
    const count = Number(parsed && parsed.active_agent_count);
    if (!Number.isFinite(count) || count <= 1) process.exit(0);
    const agents = Array.isArray(parsed.active_agents) ? parsed.active_agents : [];
    const peers = agents.filter((a) => a && a.is_self !== true);
    if (peers.length === 0) process.exit(0);

    // Build a canonical peer summary (change-relevant axes only;
    // last_active_age_ms excluded — age changes every call by definition).
    const canonical = peers
      .map((a) => ({
        session_id: a.session_id || "",
        worktree: a.bound_worktree || "",
        spec: a.bound_spec_id || "",
        git_dir_kind: a.git_dir_kind || "",
        branch: a.branch || "",
      }))
      .sort((x, y) => x.session_id.localeCompare(y.session_id));
    const canonicalJSON = JSON.stringify({ count, peers: canonical });

    const crypto = require("crypto");
    const fs = require("fs");
    const path = require("path");
    const currentHash = crypto.createHash("sha256").update(canonicalJSON).digest("hex");

    const stateFile = process.env.EMIT_STATE_FILE;
    let cachedHash = null;
    try {
      if (stateFile && fs.existsSync(stateFile)) {
        const cached = JSON.parse(fs.readFileSync(stateFile, "utf8"));
        if (cached && typeof cached.peer_set_hash === "string") {
          cachedHash = cached.peer_set_hash;
        }
      }
    } catch (_) { /* fall through to emit */ }

    if (cachedHash === currentHash) {
      process.exit(0);
    }

    const minIntervalMs = (() => {
      const raw = Number(process.env.HEARTBEAT_EMIT_MIN_INTERVAL_MS);
      if (Number.isFinite(raw) && raw >= 0) return raw;
      return 60000;
    })();
    let cachedTs = null;
    try {
      if (stateFile && fs.existsSync(stateFile)) {
        const cached = JSON.parse(fs.readFileSync(stateFile, "utf8"));
        if (cached && typeof cached.last_emitted_ts_ms === "number") {
          cachedTs = cached.last_emitted_ts_ms;
        }
      }
    } catch (_) { /* fall through */ }
    const now = Date.now();
    if (
      minIntervalMs > 0 &&
      cachedTs !== null &&
      now - cachedTs < minIntervalMs
    ) {
      try {
        if (stateFile) {
          fs.mkdirSync(path.dirname(stateFile), { recursive: true });
          fs.writeFileSync(stateFile, JSON.stringify({
            peer_set_hash: currentHash,
            peer_count: count,
            last_emitted_ts_ms: cachedTs,
          }) + "\n");
        }
      } catch (_) { /* non-fatal */ }
      process.exit(0);
    }

    try {
      if (stateFile) {
        fs.mkdirSync(path.dirname(stateFile), { recursive: true });
        fs.writeFileSync(stateFile, JSON.stringify({
          peer_set_hash: currentHash,
          peer_count: count,
          last_emitted_ts_ms: now,
        }) + "\n");
      }
    } catch (_) { /* non-fatal — proceed with emission */ }

    const bullets = peers.map((a) => {
      const worktree = a.bound_worktree || "no worktree";
      const spec = a.bound_spec_id ? " — spec " + a.bound_spec_id : "";
      const kind = a.git_dir_kind || "unknown";
      const branch = a.branch || "-";
      const ageMs = Number(a.last_active_age_ms);
      const ageSec = Number.isFinite(ageMs) ? Math.floor(ageMs / 1000) : 0;
      return "• " + (a.session_id || "<unknown>") +
        " (" + worktree + ")" + spec +
        " — git_dir_kind=" + kind +
        " — branch=" + branch +
        " — last active " + ageSec + "s ago";
    }).join("\n");
    const ctx = "MULTI-AGENT NOTICE (peer set changed): " + count +
      " agents active in this repo (including this session). Other active sessions:\n" +
      bullets + "\n\n" +
      "Coordinate via '\''caws agents list'\'' and '\''caws status'\'' before " +
      "mutating shared state. Authority remains in .caws/worktrees.json " +
      "(ownership) and .caws/specs/<id>.yaml (scope) — leases are " +
      "visibility only.";
    process.stdout.write(ctx);
  });
' 2>/dev/null)" || exit 0

[[ -n "$_HEARTBEAT_CTX" ]] && emit_additional_context "$_HEARTBEAT_CTX"

exit 0
