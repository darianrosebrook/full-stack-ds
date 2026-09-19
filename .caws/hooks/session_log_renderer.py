#!/usr/bin/env python3
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 87
# caws_min_major: 11
# lineage_refs: 10
# edit_stance: this repo OWNS and may grow this hook. Edits are expected and
#   preserved — `caws init` refuses to overwrite a changed managed hook (re-run
#   with --adopt to keep yours, or --overwrite to pull this upstream template).
#   CAWS owns the failure-class invariant (the why/what you must not silently
#   weaken); you own the how. Do not edit it to BYPASS the guard; do grow it.
"""Render lean session artifacts from agent transcripts.

Harness-agnostic turn renderer. Per-harness row normalization lives in
sibling modules under lib/harness_*.py, each exporting a HarnessModule that
contributes adapters (row-to-canonical-event translators) and noise prefixes
(user-role rows to filter). This file assembles those contributions, applies
them to produce canonical events, then accumulates those events into
harness-agnostic turn-NNN.json artifacts.

Adding or changing a harness means editing its lib/harness_*.py module, not
this file. The accumulation/render logic below is harness-agnostic: it
operates only on canonical events and the assembled noise filter.

Invoked by session-log.sh via `python3 <path>`. NOT executable on its own;
the pack manifest registers it with `executable: false`. The CAWS-MANAGED-
HOOK header above is parsed by `caws init` to recognize this file as managed.

Bundled in v6 of the pack to fix CAWS-HOOK-PACK-RENDERER-MISSING-001:
session-log.sh's `RENDERER` path used to point at a file that was not
bundled, producing a crash on every invocation in fresh installs.
"""

from __future__ import annotations

import copy
import fcntl
import importlib.util
import uuid
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

# Make the sibling lib/ directory importable so the harness modules load.
_LIB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib")
if _LIB_DIR not in sys.path:
    sys.path.insert(0, _LIB_DIR)

import harness_kimi
import harness_claude  # noqa: E402
from harness_claude import extract_text_from_content_blocks, extract_tool_result_content
import harness_codex  # noqa: E402
import harness_dsh  # noqa: E402
import harness_opencode  # noqa: E402
import harness_qwen  # noqa: E402
import harness_zcode  # noqa: E402
from harness_codex import (  # noqa: E402
    extract_codex_inner_actions,
)
from harness_common import (  # noqa: E402
    TOOL_ECHO_PATTERN,
    HarnessModule,
    TranscriptRowAdapter,
    decode_structured_text_payload,
    parse_hook_stdout,
    parse_timestamp,
    patch_paths,
)

# Each harness module declares how its native rows normalize to canonical
# events and what noise its surface injects. The renderer assembles these
# contributions — adding a harness means adding one module and one line here,
# not editing the accumulation/render logic below.
HARNESS_MODULES: tuple[HarnessModule, ...] = (
    harness_kimi.MODULE,
    harness_dsh.MODULE,
    harness_codex.MODULE,
    # qwen-code BEFORE claude: qwen rows use the same user/assistant type
    # values the claude matcher claims, and adapters are first-match-wins.
    # The qwen matcher discriminates on message.parts so Claude rows still
    # reach the claude adapter.
    harness_qwen.MODULE,
    harness_claude.MODULE,
    harness_zcode.MODULE,
    harness_opencode.MODULE,
)

DEFAULT_TRANSCRIPT_ROW_ADAPTERS: tuple[TranscriptRowAdapter, ...] = tuple(
    adapter for module in HARNESS_MODULES for adapter in module.adapters
)

NOISE_PREFIXES: tuple[str, ...] = tuple(
    prefix for module in HARNESS_MODULES for prefix in module.noise_prefixes
)

SESSION_EVENT_PREFIXES = (
    "<task-notification>",
    "[Request interrupted",
    "Conversation rewind applied.",  # zcode control event, not a human turn
)

NOTABLE_KW = (
    "error",
    "fail",
    "failed",
    "refusal",
    "mismatch",
    "passed",
    "assert",
    "traceback",
    "exception",
    "pytest",
    "typedrefusal",
)

#
# MEANINGFUL_COMMAND_KW is a small, intentionally-generic baseline of
# substrings that mark "interesting" bash commands worth surfacing in
# session.txt. Consumers with project-specific toolchains (Rust:
# `cargo test`, `cargo build`; Python lint/typecheck: `ruff`, `mypy`;
# etc.) should NOT edit this file to add their entries — re-running
# `caws init --agent-surface claude-code` would refuse the merge as
# `unmanaged_collision`. Future work (CAWS-HOOK-PACK-RENDERER-CONFIG-001)
# will admit a sidecar config (e.g. `.caws/session-log.yaml`) for
# consumer extensions; until then the baseline is the only set.
MEANINGFUL_COMMAND_KW = (
    "pytest",
    "npm test",
    "pnpm test",
    "git log",
    "git diff",
    "git status",
    "git add",
    "git commit",
    "git merge",
    "caws ",
    "pip install",
    "make",
)


DECISION_PATTERNS = [
    re.compile(r"(?:^|\n)\s*(?:decision|decided|choosing|will use|going with)[:\s]+(.+?)(?:\n|$)", re.IGNORECASE),
    re.compile(r"(?:^|\n)\s*(?:approach|plan|strategy)[:\s]+(.+?)(?:\n|$)", re.IGNORECASE),
]
DECISION_SECTION_PATTERN = re.compile(
    r"^\s{0,3}(?:#{1,6}\s*)?decisions(?:\s+made)?\s*:\s*$",
    re.IGNORECASE,
)
DECISION_BULLET_PATTERN = re.compile(r"^\s*[-*]\s+(.+?)\s*$")
NEXT_ACTION_PATTERNS = [
    re.compile(r"(?:^|\n)\s*the next recommended tranche is\s+(.+?)(?:\n|$)", re.IGNORECASE),
    re.compile(r"(?:^|\n)\s*(?:next step|next action|next:|todo:|will now)[:\s]+(.+?)(?:\n|$)", re.IGNORECASE),
]
BLOCKING_PATTERNS = [
    re.compile(r"(?:^|\n)\s*blocking issue:\s*(.+?)(?:\n|$)", re.IGNORECASE),
    re.compile(r"(?:^|\n)\s*(?:blocked|blocking|cannot proceed|stuck)[:\s]+(.+?)(?:\n|$)", re.IGNORECASE),
]


def rel_path(path: str | None, cwd: str) -> str:
    if path and path.startswith(cwd + "/"):
        return path[len(cwd) + 1 :]
    return path or ""


def _parse_ts_value(value: str) -> datetime | None:
    # fromisoformat (C-accelerated) covers every timestamp shape the strptime
    # ladder below accepts. The ladder used to run first with the
    # non-fractional format at the top, so every fractional timestamp — all
    # of them, in practice — paid a raised-and-caught ValueError per parse
    # (~15% of a warm worst-case render). The "T" guard keeps date-only
    # strings rejected, as the ladder rejected them.
    if "T" in value:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            pass
    for fmt in (
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S.%f%z",
    ):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def seconds_between(ts1: str | None, ts2: str | None) -> float | None:
    if not ts1 or not ts2:
        return None
    first = _parse_ts_value(ts1)
    second = _parse_ts_value(ts2)
    if first and second:
        try:
            return round((second - first).total_seconds(), 2)
        except TypeError:
            # one aware, one naive (mixed timestamp dialects in a single
            # transcript) — no defensible duration exists
            return None
    return None


def truncate(text: str | None, limit: int) -> str:
    value = text or ""
    if len(value) <= limit:
        return value
    return value[:limit] + "..."


def compact_ws(text: str | None, limit: int = 160) -> str:
    value = re.sub(r"\s+", " ", (text or "").strip())
    if len(value) <= limit:
        return value
    return value[:limit] + "..."


def bounded_text(text: str | None, limit: int) -> tuple[str, bool]:
    value = text or ""
    return (truncate(value, limit), len(value) > limit)


def extract_heuristic_fields(reasoning_texts: list[str]) -> tuple[list[dict[str, str]], str | None, str | None]:
    decisions: list[dict[str, str]] = []
    next_action = None
    blocking_issue = None
    full_text = "\n".join(reasoning_texts)

    lines = full_text.splitlines()
    for index, line in enumerate(lines):
        if not DECISION_SECTION_PATTERN.match(line):
            continue
        collecting = False
        for candidate in lines[index + 1 :]:
            if not candidate.strip() and not collecting:
                continue
            bullet = DECISION_BULLET_PATTERN.match(candidate)
            if not bullet:
                break
            collecting = True
            statement = bullet.group(1).strip()[:240]
            if statement and statement not in {d["statement"] for d in decisions}:
                decisions.append({"statement": statement, "source": "heuristic"})

    for pattern in DECISION_PATTERNS:
        for match in pattern.finditer(full_text):
            statement = match.group(1).strip()[:240]
            if statement and statement not in {d["statement"] for d in decisions}:
                decisions.append({"statement": statement, "source": "heuristic"})

    for pattern in NEXT_ACTION_PATTERNS:
        next_match = pattern.search(full_text)
        if next_match:
            next_action = next_match.group(1).strip()[:240]
            break

    for pattern in BLOCKING_PATTERNS:
        blocking_match = pattern.search(full_text)
        if blocking_match:
            blocking_issue = blocking_match.group(1).strip()[:240]
            break

    return decisions, next_action, blocking_issue


def parse_control_event(text: str, ts: str | None) -> dict[str, Any]:
    task_id = re.search(r"<task-id>(.*?)</task-id>", text, re.DOTALL)
    summary = re.search(r"<summary>(.*?)</summary>", text, re.DOTALL)
    command = re.search(r"<command-message>(.*?)</command-message>", text, re.DOTALL)
    event_type = "task_notification" if text.startswith("<task-notification>") else "control"
    preview = summary.group(1).strip() if summary else command.group(1).strip() if command else compact_ws(text, 180)
    return {
        "type": event_type,
        "task_id": task_id.group(1).strip() if task_id else None,
        "preview": preview,
        "raw": truncate(text, 1200),
        "ts": ts,
    }


def new_turn(user_text: str | None = None, ts: str | None = None) -> dict[str, Any]:
    return {
        "user": user_text,
        "user_ts": ts,
        "timeline": [],
        "hook_contexts": [],
        "interjections": [],
        "edited_files": [],
        "read_files": [],
        "searches": [],
        "commands": [],
        "agent_runs": [],
        "artifacts": [],
        "control_events": [],
    }


def append_unique(items: list[str], value: str) -> None:
    if value and value not in items:
        items.append(value)


def make_transcript_adapter_factory(
    adapters: tuple[TranscriptRowAdapter, ...] = DEFAULT_TRANSCRIPT_ROW_ADAPTERS,
) -> Callable[[dict[str, Any], dict[str, Any]], list[dict[str, Any]]]:
    """Build an injectable native-row to canonical-event dispatcher."""

    def normalize(row: dict[str, Any], state: dict[str, Any]) -> list[dict[str, Any]]:
        for adapter in adapters:
            if adapter.matches(row):
                events = adapter.normalize(row, state)
                for event in events:
                    if event.get("ev") == "tool_use":
                        event["source_harness"] = adapter.name
                return events
        return []

    return normalize


def _parse_transcript_lines(
    data: bytes,
    normalize: Callable[[dict[str, Any], dict[str, Any]], list[dict[str, Any]]],
    adapter_state: dict[str, Any],
    events: list[dict[str, Any]],
) -> None:
    # Per-line decode matches the strictness of the former text-mode read: an
    # invalid UTF-8 byte raises, same as it did at file-read time. Lone-\r
    # line endings (which text-mode universal newlines would split) are not
    # split here; no harness emits them.
    for raw in data.split(b"\n"):
        line = raw.decode("utf-8").strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(obj, dict):
            events.extend(normalize(obj, adapter_state))


def parse_transcript_events(
    transcript_path: str,
    adapters: tuple[TranscriptRowAdapter, ...] = DEFAULT_TRANSCRIPT_ROW_ADAPTERS,
    cache: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Parse a transcript into canonical events, optionally resuming.

    `cache` is a checkpoint dict owned by the caller (in practice the render
    daemon — SESSION-LOG-TRANSCRIPT-CACHE-001). Parsing resumes from the
    checkpointed byte offset only when the already-parsed prefix is PROVEN
    unchanged: same inode, size not below the offset, and sha256 of
    bytes[0:offset] equal to the checkpointed hash. mtime is never consulted
    — it cannot distinguish an append from an in-place edit. On any mismatch
    the checkpoint is discarded and a full parse runs.

    The checkpoint advances only past newline-terminated lines and is
    mutated only after a successful parse; a partial trailing line (file
    caught mid-append) is parsed tentatively against a COPY of adapter state
    — matching what a one-shot parse of the same bytes produces — and
    re-read on the next call, so it can neither duplicate nor vanish.
    """
    adapter = os.environ.get("CAWS_SESSION_TRANSCRIPT_ADAPTER")
    if os.environ.get("CAWS_MACHINE_RUNTIME") == "1" and adapter:
        spec = importlib.util.spec_from_file_location("caws_session_transcript_adapter", adapter)
        if spec is None or spec.loader is None:
            raise ValueError("Cannot load configured transcript adapter")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module.parse_transcript_events(transcript_path)
    normalize = make_transcript_adapter_factory(adapters)
    events: list[dict[str, Any]] = []
    adapter_state: dict[str, Any] = {}
    offset = 0
    mode = "full"
    prefix_hash = hashlib.sha256()

    with open(transcript_path, "rb") as handle:
        try:
            st = os.fstat(handle.fileno())
        except OSError:
            st = None
        if cache is not None and cache.get("events") is not None:
            if (
                st is not None
                and cache.get("source_path") == str(Path(transcript_path).resolve())
                and cache.get("adapters") == adapters
                and st.st_ino == cache.get("ino")
                and st.st_size >= cache.get("offset", 0)
            ):
                remaining = int(cache.get("offset", 0))
                while remaining > 0:
                    chunk = handle.read(min(1 << 22, remaining))
                    if not chunk:
                        break
                    prefix_hash.update(chunk)
                    remaining -= len(chunk)
                if remaining == 0 and prefix_hash.hexdigest() == cache.get("prefix_sha"):
                    mode = "tail"
                    offset = int(cache["offset"])
        if mode == "full":
            handle.seek(0)
            prefix_hash = hashlib.sha256()
        data = handle.read()

    cut = data.rfind(b"\n") + 1  # 0 when newline-free: the whole tail is partial
    complete, partial = data[:cut], data[cut:]

    if mode == "tail" and cache is not None:
        adapter_state = copy.deepcopy(cache["adapter_state"])

    new_events: list[dict[str, Any]] = []
    _parse_transcript_lines(complete, normalize, adapter_state, new_events)

    if cache is not None:
        # Checkpoint mutation happens only here, after the parse succeeded —
        # an adapter exception above leaves the prior checkpoint intact
        # instead of half-advanced (which would duplicate or drop events).
        prefix_hash.update(complete)
        if mode == "tail":
            cache["events"].extend(new_events)
            events = cache["events"]
        else:
            events = new_events
            cache["events"] = events
        cache["ino"] = st.st_ino if st is not None else None
        cache.update(
            source_path=str(Path(transcript_path).resolve()),
            adapters=adapters,
            offset=offset + len(complete),
            prefix_sha=prefix_hash.hexdigest(),
            adapter_state=adapter_state,
            mode=mode,
        )
    else:
        events = new_events

    if partial.strip():
        tentative_state = copy.deepcopy(adapter_state)
        tentative: list[dict[str, Any]] = []
        _parse_transcript_lines(partial, normalize, tentative_state, tentative)
        if tentative:
            # Concatenation (not extend): the checkpointed list must hold only
            # events from newline-terminated lines.
            events = events + tentative

    return events


def load_json_records(path: str) -> list[dict[str, Any]]:
    """Read complete JSONL records; never salvage an embedded object from garbage.

    Legacy pretty/interleaved logs require a separate custody-preserving migration.
    A visible diagnostic names malformed records; they are not silently repaired.
    """
    if not path or not os.path.isfile(path):
        return []
    try:
        source = Path(path).read_text(encoding="utf-8", errors="replace")
    except OSError:
        return []
    records = []
    malformed = 0
    for line in source.splitlines():
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            malformed += 1
            continue
        if isinstance(value, dict):
            records.append(value)
    if malformed:
        print(f"[session-log] skipped {malformed} malformed JSONL record(s): {path}", file=sys.stderr)
    return records



def parse_audit_events(path: str, session_id: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for row in load_json_records(path):
        if row.get("session_id") != session_id or row.get("event") != "tool_use":
            continue
        tool_input = row.get("tool_input")
        if not isinstance(tool_input, dict):
            tool_input = {}
        if row.get("command") and not tool_input.get("command"):
            tool_input["command"] = row["command"]
        if row.get("file") and not tool_input.get("file_path"):
            tool_input["file_path"] = row["file"]
        events.append({
            "ev": "audit_action",
            "tool": row.get("tool", ""),
            "id": row.get("tool_use_id", ""),
            "input": tool_input,
            "response": row.get("tool_response") if isinstance(row.get("tool_response"), dict) else {},
            "is_error": bool(row.get("is_error")),
            "cwd": row.get("cwd"),
            "permission_mode": row.get("permission_mode"),
            "ts": parse_timestamp(row.get("timestamp")),
            "provenance": "hook_audit",
        })
    return events


def hook_handler_status(row: dict[str, Any], stdout: str) -> Any:
    """Interpret this handler's return; the adapter outcome belongs to the chain."""
    try:
        payload = json.loads(stdout)
    except (TypeError, ValueError):
        payload = None
    decision = None
    if isinstance(payload, dict):
        decision = payload.get("decision")
        hook_output = payload.get("hookSpecificOutput")
        if decision is None and isinstance(hook_output, dict):
            decision = hook_output.get("permissionDecision")
    if row.get("exit_code") == 2 or decision in ("block", "deny"):
        return "block"
    if decision == "ask":
        return "ask"
    return row.get("status")


def parse_hook_outcome_events(path: str, session_id: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for row in load_json_records(path):
        if row.get("session_id") != session_id:
            continue
        stdout = row.get("stdout") if isinstance(row.get("stdout"), str) else ""
        stderr = row.get("stderr") if isinstance(row.get("stderr"), str) else ""
        parsed_stdout = parse_hook_stdout(stdout)
        additional_context = ""
        context_authority = None
        kind = "hook_outcome"
        if parsed_stdout:
            additional_context = parsed_stdout.get("additional_context", "")
            context_authority = parsed_stdout.get("context_authority")
            kind = parsed_stdout.get("kind", kind)
        elif stdout:
            try:
                payload = json.loads(stdout)
            except json.JSONDecodeError:
                payload = None
            if isinstance(payload, dict) and isinstance(payload.get("reason"), str):
                additional_context = payload["reason"]
            else:
                additional_context = stdout
        elif stderr:
            additional_context = stderr
        events.append({
            "ev": "hook_context",
            "kind": kind,
            "hook_name": row.get("handler"),
            "hook_event": row.get("hook_event"),
            "tool_use_id": row.get("tool_use_id"),
            "tool_name": row.get("tool_name"),
            "status": hook_handler_status(row, stdout),
            "additional_context": additional_context,
            "context_authority": context_authority,
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": row.get("exit_code"),
            "duration_ms": row.get("duration_ms"),
            "provenance": "hook_outcome_sidecar",
            "observation_boundary": row.get("observation_boundary", "handler_return"),
            "delivery": row.get("delivery", "not_observed"),
            "invocation_id": row.get("invocation_id"),
            "source_sha256": row.get("source_sha256"),
            "runtime_digest": row.get("runtime_digest"),
            "adapter_exit_code": row.get("adapter_exit_code"),
            "ts": parse_timestamp(row.get("timestamp")),
        })
    return events


def merge_chronological_events(
    transcript_events: list[dict[str, Any]], auxiliary_events: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    if not auxiliary_events:
        return transcript_events

    priorities = {
        "turn_boundary": 0,
        "user_text": 1,
        "assistant_text": 2,
        "tool_use": 3,
        "hook_context": 4,
        "audit_action": 5,
        "tool_result": 6,
    }

    def sort_key(item: tuple[int, dict[str, Any]]) -> tuple[float, int, int]:
        index, event = item
        timestamp = parse_timestamp(event.get("ts"))
        try:
            epoch = datetime.fromisoformat((timestamp or "").replace("Z", "+00:00")).timestamp()
        except ValueError:
            epoch = float("inf")
        return epoch, priorities.get(event.get("ev", ""), 4), index

    combined = transcript_events + auxiliary_events
    return [event for _, event in sorted(enumerate(combined), key=sort_key)]


def accumulate_turns(events: list[dict[str, Any]], cwd: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    turns: list[dict[str, Any]] = []
    session_events: list[dict[str, Any]] = []
    current = new_turn()
    pending_tools: dict[str, dict[str, Any]] = {}
    # user_shell items arriving before any turn has opened (a session that
    # STARTS with a !-command). They prepend to the first turn that opens; if
    # no turn ever opens, they emit as one synthetic turn — capture beats
    # purity for a session whose only content is user shell activity.
    pending_shell: list[dict[str, Any]] = []
    # Deduplication for api_request usage, SESSION-scoped rather than
    # per-turn: a fork or resume copies earlier rows verbatim into the head of
    # the new transcript, so the same (message id, request id) can reappear in
    # a different turn. A per-turn set would count those copies again.
    seen_requests: set[tuple[str, str | None]] = set()
    # parent_uuid -> the turn opened by the prompt that most recently claimed
    # that conversational slot. A second turn-opening prompt on the same
    # parent means the user rewound and re-sent.
    prompt_parents: dict[str, dict[str, Any]] = {}

    def _turn_is_open(turn: dict[str, Any]) -> bool:
        return bool(
            turn.get("user")
            or turn["timeline"]
            or turn["control_events"]
            or turn["interjections"]
        )

    for entry in events:
        ev = entry.get("ev")
        ts = parse_timestamp(entry.get("ts"))

        if ev == "turn_boundary":
            if current["user"] or current["timeline"] or current["control_events"] or current["interjections"] or current["hook_contexts"]:
                turns.append(current)
            current = new_turn(ts=ts)
            continue

        if ev == "user_text":
            text = entry.get("text", "")
            if (
                any(text.startswith(prefix) for prefix in NOISE_PREFIXES)
                or TOOL_ECHO_PATTERN.match(text)
                or not text.strip()
            ):
                continue
            if any(text.startswith(prefix) for prefix in SESSION_EVENT_PREFIXES):
                # An escape-interrupt ends the in-flight turn; recording it on
                # the turn is the only way a reader can distinguish "agent
                # finished" from "user aborted mid-action" — session_events
                # are otherwise discarded by the turn-file-only renderer
                # (SESSION-LOG-REMOTE-DEBRIEF-001 A4).
                if text.startswith("[Request interrupted") and _turn_is_open(current):
                    # The two interrupt shapes are different steering acts and
                    # the harness distinguishes them, so the log does too: the
                    # "for tool use" variant is the user vetoing a specific
                    # action the agent proposed, while the bare variant is the
                    # user cutting generation off. Collapsing both to one
                    # "user_interrupt" value discarded that distinction.
                    current["ended_by"] = (
                        "user_interrupt_tool"
                        if text.startswith("[Request interrupted by user for tool use]")
                        else "user_interrupt_generation"
                    )
                session_events.append(parse_control_event(text, ts))
                continue
            if current["user"] or current["timeline"] or current["control_events"] or current["interjections"] or current["hook_contexts"]:
                turns.append(current)
            current = new_turn(text, ts)
            # Rewind detection. Only a prompt that OPENS a turn reaches here —
            # noise rows and interrupts were filtered above, and tool_use /
            # tool_result events never open a turn. That is what keeps the two
            # structural false positives out: parallel tool calls also fan out
            # parentUuid (tool_use -> [next tool_use, tool_result]), and a
            # <local-command-caveat> row re-parents onto the same turn-closing
            # record a re-typed prompt would (observed live). Neither is a
            # turn-opening prompt, so neither can claim a slot here.
            parent_uuid = entry.get("parent_uuid")
            if isinstance(parent_uuid, str) and parent_uuid:
                rewound = prompt_parents.get(parent_uuid)
                if rewound is not None:
                    current["rewound_from_turn"] = rewound
                    current["rewind_kind"] = (
                        "same_prompt" if (rewound.get("user") or "") == text else "edited_prompt"
                    )
                    rewound["rewound"] = True
                # The newest claimant owns the slot, so a third attempt points
                # at the second rather than chaining back to the first.
                prompt_parents[parent_uuid] = current
            if pending_shell:
                # Shell activity that preceded this first real turn prepends
                # to it (SESSION-LOG-REMOTE-DEBRIEF-001 A2).
                current["timeline"] = pending_shell + current["timeline"]
                pending_shell = []
            continue

        if ev == "api_request":
            message_id = entry.get("message_id")
            if not isinstance(message_id, str) or not message_id:
                continue
            request_id = entry.get("request_id")
            key = (message_id, request_id if isinstance(request_id, str) else None)
            if key in seen_requests:
                continue
            seen_requests.add(key)
            usage = entry.get("usage")
            if not isinstance(usage, dict):
                continue
            totals = current.get("usage")
            if totals is None:
                totals = {"requests": 0, "input": 0, "cache_read": 0,
                          "cache_write": 0, "output": 0, "models": []}
                current["usage"] = totals
            totals["requests"] += 1
            for token_class in ("input", "cache_read", "cache_write", "output"):
                value = usage.get(token_class)
                if isinstance(value, int) and not isinstance(value, bool):
                    totals[token_class] += value
            model = entry.get("model")
            if isinstance(model, str) and model:
                append_unique(totals["models"], model)
            continue

        if ev == "user_shell":
            # !-command activity (`! git push` and its output). Attaches to
            # the still-open turn it followed — a post-turn push concludes
            # that turn's work — or waits in pending_shell for the next turn
            # if nothing is open. Never opens a turn itself. The input and
            # output arrive as separate transcript rows; an output row merges
            # into the trailing command item so one timeline entry carries
            # {command, stdout, stderr}.
            target = current["timeline"] if _turn_is_open(current) else pending_shell
            is_output = "stdout" in entry or "stderr" in entry
            last = target[-1] if target else None
            if (
                is_output
                and last is not None
                and last.get("kind") == "user_shell"
                and "stdout" not in last
            ):
                last["stdout"] = entry.get("stdout", "")
                last["stderr"] = entry.get("stderr", "")
                if ts:
                    last["result_ts"] = ts
            else:
                item: dict[str, Any] = {
                    "kind": "user_shell",
                    "ts": ts,
                    "provenance": "user_shell",
                }
                if is_output:
                    item["stdout"] = entry.get("stdout", "")
                    item["stderr"] = entry.get("stderr", "")
                else:
                    item["command"] = entry.get("command", "")
                target.append(item)
            continue

        if ev == "assistant_text":
            text = entry.get("text", "")
            # "No response requested." is the model's boilerplate ack to a
            # harness-injected event (e.g. a !-command echo), not reasoning.
            # Exact-match on the harness convention string; as a timeline item
            # it manufactured substance for 139 phantom bash-echo turns in the
            # 2026-08 corpus audit (SESSION-LOG-REMOTE-DEBRIEF-001 A3).
            if text.strip() == "No response requested.":
                continue
            if text.strip():
                current["timeline"].append(
                    {
                        "kind": "reasoning",
                        "text": text,
                        "ts": ts,
                        "provenance": "assistant_reasoning",
                    }
                )
            continue

        if ev == "tool_use":
            original_name = entry.get("name", "")
            is_codex = entry.get("source_harness") == "codex"
            name = original_name.rsplit(".", 1)[-1] if is_codex else original_name
            tool_input = entry.get("input", {})
            tool_entry: dict[str, Any] = {
                "kind": "tool_call",
                "name": original_name,
                "source_harness": entry.get("source_harness", ""),
                "id": entry.get("id", ""),
                "ts": ts,
                "provenance": "tool_call",
            }

            # Full source payloads are the offline review record. Structured
            # references and previews below are indexes, never substitutes.
            if is_codex and not (isinstance(tool_input, dict) and "raw" in tool_input):
                tool_entry["input"] = tool_input
            raw_input = tool_input.get("raw") if isinstance(tool_input, dict) else None
            if isinstance(raw_input, str):
                input_raw, input_truncated = raw_input, False
                tool_entry["input_raw"] = input_raw
                tool_entry["input_length"] = len(raw_input)
                tool_entry["input_truncated"] = input_truncated
                if name == "exec":
                    inner_actions = extract_codex_inner_actions(raw_input)
                    tool_entry["inner_actions"] = inner_actions
                    for action in inner_actions:
                        inner_tool = action.get("tool")
                        if inner_tool == "exec_command":
                            commands = []
                            if action.get("command"):
                                commands.append(action["command"])
                            commands.extend(action.get("batch_commands", []))
                            for command in commands:
                                if not any(ref.get("command") == command for ref in current["commands"]):
                                    current["commands"].append({
                                        "command": command,
                                        "description": "Codex inner exec_command",
                                        "ts": ts,
                                        "provenance": "codex_exec_source_index",
                                        "execution": "not_observed",
                                    })
                                if re.search(r"(?:^|[;&|]\s*)rg\s", command):
                                    current["searches"].append({
                                        "tool": "rg",
                                        "query": command,
                                        "ts": ts,
                                        "provenance": "codex_exec_source_index",
                                        "execution": "not_observed",
                                    })
                                for read_match in re.finditer(
                                    r"\bsed\s+-n\s+(?:\"[^\"]*\"|'[^']*'|\S+)\s+([^\s;&|]+)",
                                    command,
                                ):
                                    append_unique(current["read_files"], rel_path(read_match.group(1), cwd))
                        elif inner_tool == "apply_patch":
                            for file_path in action.get("files", []):
                                normalized = rel_path(file_path, cwd)
                                append_unique(current["edited_files"], normalized)
                                if not any(
                                    artifact.get("type") == "file_edit" and artifact.get("path") == normalized
                                    for artifact in current["artifacts"]
                                ):
                                    current["artifacts"].append({
                                        "type": "file_edit",
                                        "path": normalized,
                                        "ts": ts,
                                        "provenance": "codex_exec_source_index",
                                        "execution": "not_observed",
                                    })
                        elif inner_tool == "view_image" and action.get("path"):
                            append_unique(current["read_files"], rel_path(action["path"], cwd))

            if name in ("Write", "Edit"):
                file_path = rel_path(tool_input.get("file_path"), cwd)
                tool_entry["file"] = file_path
                append_unique(current["edited_files"], file_path)
                if name == "Edit":
                    # Flagged bounding, matching the output_length/
                    # output_truncated convention: 28% of corpus edits were
                    # silently clipped at this limit, corrupting any patch
                    # reconstruction with no way to detect it
                    # (SESSION-LOG-REMOTE-DEBRIEF-001 A6).
                    for key in ("old_string", "new_string"):
                        raw_value = tool_input.get(key, "") or ""
                        bounded, was_truncated = bounded_text(raw_value, 1200)
                        tool_entry[key] = bounded
                        tool_entry[f"{key}_length"] = len(raw_value)
                        tool_entry[f"{key}_truncated"] = was_truncated
                else:
                    content = tool_input.get("content", "") or ""
                    tool_entry["content_preview"] = truncate(content, 1600)
                    tool_entry["content_length"] = len(content)
                current["artifacts"].append(
                    {
                        "type": "file_edit" if name == "Edit" else "file_write",
                        "path": file_path,
                        "ts": ts,
                    }
                )

            elif name == "Read":
                file_path = rel_path(tool_input.get("file_path"), cwd)
                tool_entry["file"] = file_path
                append_unique(current["read_files"], file_path)

            elif name in ("Grep", "Glob"):
                pattern = tool_input.get("pattern") or tool_input.get("path") or ""
                tool_entry["pattern"] = pattern
                if pattern:
                    current["searches"].append({"tool": name, "query": pattern, "ts": ts})

            elif name in ("WebSearch", "WebFetch"):
                query = tool_input.get("query") or tool_input.get("url") or ""
                tool_entry["query"] = query
                if query:
                    current["searches"].append({"tool": name, "query": query, "ts": ts})

            elif name == "Bash":
                command = tool_input.get("command", "")
                description = tool_input.get("description", "") or ""
                tool_entry["command"] = command
                tool_entry["description"] = description
                tool_entry["run_in_background"] = tool_input.get("run_in_background")
                current["commands"].append(
                    {
                        "command": command,
                        "description": description,
                        "ts": ts,
                    }
                )
                if "git commit" in command and "-m" in command:
                    current["artifacts"].append({"type": "git_commit", "command": command, "ts": ts})
                # Test-runner detection: kept aligned with MEANINGFUL_COMMAND_KW.
                # See the comment above that tuple for consumer-extension guidance.
                if any(keyword in command for keyword in ("pytest", "npm test", "pnpm test")):
                    current["artifacts"].append({"type": "test_run", "command": command, "ts": ts})

            elif name in ("Agent", "Task"):
                prompt = tool_input.get("prompt", "") or ""
                tool_entry["prompt"] = truncate(prompt, 1200)
                tool_entry["subagent_type"] = tool_input.get("subagent_type")
                tool_entry["run_in_background"] = tool_input.get("run_in_background")
                tool_entry["isolation"] = tool_input.get("isolation")
                tool_entry["provenance"] = "sub_agent_dispatch"
                current["agent_runs"].append(
                    {
                        "id": entry.get("id", ""),
                        "tool": name,
                        "subagent_type": tool_input.get("subagent_type"),
                        "prompt_preview": compact_ws(prompt, 300),
                        "status": "launched",
                        "ts": ts,
                    }
                )

            elif name == "Skill":
                tool_entry["skill"] = tool_input.get("skill", "")
                tool_entry["args"] = tool_input.get("args", "")

            elif name == "ExitPlanMode":
                plan_text = tool_input.get("plan") or ""
                tool_entry["plan"] = truncate(plan_text, 6000)
                tool_entry["provenance"] = "plan_approval"
                current["artifacts"].append(
                    {
                        "type": "plan",
                        "content": truncate(plan_text, 2500),
                        "ts": ts,
                    }
                )

            current["timeline"].append(tool_entry)
            pending_tools[entry.get("id", "")] = tool_entry
            continue

        if ev == "audit_action":
            name = entry.get("tool", "")
            tool_input = entry.get("input", {}) if isinstance(entry.get("input"), dict) else {}
            response = entry.get("response", {}) if isinstance(entry.get("response"), dict) else {}
            action = {
                "kind": "audit_action",
                "tool": name,
                "tool_use_id": entry.get("id", ""),
                "is_error": bool(entry.get("is_error")),
                "permission_mode": entry.get("permission_mode"),
                "ts": ts,
                "provenance": "hook_audit",
            }
            input_text = json.dumps(tool_input, ensure_ascii=False, sort_keys=True)
            action["input_preview"], action["input_truncated"] = bounded_text(input_text, 2000)
            action["input_length"] = len(input_text)
            if response:
                response_text, response_truncated = bounded_text(
                    json.dumps(response, ensure_ascii=False, sort_keys=True), 3000
                )
                action["response"] = response_text
                action["response_truncated"] = response_truncated

            file_path = rel_path(tool_input.get("file_path") or tool_input.get("path"), cwd)
            command = tool_input.get("command") or tool_input.get("cmd") or ""
            if name in ("Write", "Edit", "apply_patch") and file_path:
                append_unique(current["edited_files"], file_path)
            elif name == "apply_patch" and isinstance(tool_input.get("patch"), str):
                for patch_path in patch_paths(tool_input["patch"]):
                    append_unique(current["edited_files"], rel_path(patch_path, cwd))
            elif name in ("Read", "view_image") and file_path:
                append_unique(current["read_files"], file_path)
            elif name in ("Grep", "Glob"):
                query = tool_input.get("pattern") or tool_input.get("path") or ""
                if query:
                    current["searches"].append({
                        "tool": name,
                        "query": query,
                        "ts": ts,
                        "provenance": "hook_audit",
                    })
            if name in ("Bash", "exec_command") and command:
                if not any(ref.get("command") == command for ref in current["commands"]):
                    current["commands"].append({
                        "command": command,
                        "description": "Audited inner tool action",
                        "ts": ts,
                        "provenance": "hook_audit",
                        "is_error": bool(entry.get("is_error")),
                    })
            current["timeline"].append(action)
            continue

        if ev == "tool_result":
            tool_id = entry.get("id", "")
            tool_info = pending_tools.get(tool_id)
            content = entry.get("content", "") or ""
            if tool_info:
                name = tool_info.get("name", "")
                is_codex = tool_info.get("source_harness") == "codex"
                result_text = content
                if is_codex or name in ("Agent", "Task", "exec", "wait"):
                    result_text = decode_structured_text_payload(content)
                if name == "Read":
                    result_text = content
                if is_codex or name in ("Bash", "Agent", "Task", "exec", "wait"):
                    pass
                elif name in ("Read", "Write", "Edit"):
                    result_text = truncate(result_text, 2500)
                else:
                    result_text = truncate(result_text, 3000)

                duration = seconds_between(tool_info.get("ts"), ts)
                tool_info["output"] = result_text
                tool_info["output_length"] = len(decode_structured_text_payload(content))
                tool_info["output_truncated"] = tool_info["output_length"] > len(result_text)
                tool_info["is_error"] = bool(entry.get("is_error"))
                tool_info["result_ts"] = ts
                tool_info["duration_s"] = duration

                if name == "Bash":
                    for command in reversed(current["commands"]):
                        if command.get("command") == tool_info.get("command") and "output_preview" not in command:
                            command["output"] = result_text
                            command["output_preview"] = compact_ws(result_text, 320)
                            command["duration_s"] = duration
                            command["is_error"] = bool(entry.get("is_error"))
                            break

                if name in ("Agent", "Task"):
                    for agent_run in reversed(current["agent_runs"]):
                        if agent_run.get("id") == tool_id:
                            agent_run["status"] = "error" if entry.get("is_error") else "completed"
                            agent_run["output"] = result_text
                            agent_run["output_preview"] = compact_ws(result_text, 500)
                            agent_run["duration_s"] = duration
                            break
                continue

            current["timeline"].append(
                {
                    "kind": "tool_output",
                    "id": tool_id,
                    "content": truncate(content, 3000),
                    "is_error": bool(entry.get("is_error")),
                    "ts": ts,
                    "provenance": "tool_output_orphan",
                }
            )
            continue

        if ev == "interjection":
            text = entry.get("text", "")
            if text.strip():
                current["interjections"].append({"text": text, "ts": ts})
                # Also inline in the timeline: the array is the index, but the
                # timeline is THE ordered record — a reader should see WHERE
                # in the tool sequence the steering landed without a ts-join
                # (SESSION-LOG-REMOTE-DEBRIEF-001 A5).
                current["timeline"].append({
                    "kind": "interjection",
                    "text": text,
                    "ts": ts,
                    "provenance": "user_interjection",
                })
            continue

        if ev == "hook_context":
            hook_context = {
                "kind": entry.get("kind"),
                "hook_name": entry.get("hook_name"),
                "hook_event": entry.get("hook_event"),
                "tool_use_id": entry.get("tool_use_id"),
                "additional_context": entry.get("additional_context"),
                "context_authority": entry.get("context_authority"),
                "status": entry.get("status"),
                "tool_name": entry.get("tool_name"),
                "stdout": entry.get("stdout"),
                "stderr": entry.get("stderr"),
                "provenance": entry.get("provenance"),
                "exit_code": entry.get("exit_code"),
                "duration_ms": entry.get("duration_ms"),
                "observation_boundary": entry.get("observation_boundary"),
                "delivery": entry.get("delivery"),
                "invocation_id": entry.get("invocation_id"),
                "source_sha256": entry.get("source_sha256"),
                "runtime_digest": entry.get("runtime_digest"),
                "adapter_exit_code": entry.get("adapter_exit_code"),
                "ts": ts,
            }
            current["hook_contexts"].append(hook_context)

            tool_info = pending_tools.get(entry.get("tool_use_id") or "")
            if tool_info is not None:
                tool_info.setdefault("hook_contexts", []).append(hook_context)

    if current["user"] or current["timeline"] or current["control_events"] or current["interjections"] or current["hook_contexts"]:
        turns.append(current)

    if pending_shell:
        # The session contained shell activity but no turn ever opened to
        # carry it. Emit one synthetic turn so the record survives
        # (SESSION-LOG-REMOTE-DEBRIEF-001 A2: capture beats purity).
        synthetic = new_turn()
        synthetic["timeline"] = pending_shell
        turns.append(synthetic)

    return turns, session_events


def build_turn_payload(
    turn: dict[str, Any],
    number: int,
    context: dict[str, Any] | None = None,
    turn_numbers: dict[int, int] | None = None,
) -> dict[str, Any]:
    reasoning_texts = [item["text"] for item in turn["timeline"] if item.get("kind") == "reasoning"]
    decisions, next_action, blocking_issue = extract_heuristic_fields(reasoning_texts)

    summary = None
    for item in reversed(turn["timeline"]):
        if item.get("kind") == "reasoning":
            text = compact_ws(item.get("text", ""), 260)
            if len(text) >= 80:
                summary = text
                break

    turn_ended_in_error = False
    for item in reversed(turn["timeline"]):
        if item.get("kind") == "tool_call" and "is_error" in item:
            turn_ended_in_error = bool(item["is_error"])
            break

    all_ts = [turn.get("user_ts")] if turn.get("user_ts") else []
    for item in turn["timeline"]:
        if item.get("ts"):
            all_ts.append(item["ts"])
        if item.get("result_ts"):
            all_ts.append(item["result_ts"])
    for item in turn["hook_contexts"]:
        if item.get("ts"):
            all_ts.append(item["ts"])
    for item in turn["interjections"]:
        if item.get("ts"):
            all_ts.append(item["ts"])
    ts_values = [value for value in all_ts if value]
    ts_start = min(ts_values) if ts_values else None
    ts_end = max(ts_values) if ts_values else None

    hook_blocked = any(
        context.get("status") in ("block", "ask")
        for context in turn["hook_contexts"]
    )
    # "rewound" outranks the outcome statuses: whatever this turn produced was
    # discarded when the user rewound past it and re-sent, so reporting it as
    # ok/error/blocked would describe work that no longer counts.
    status = (
        "rewound" if turn.get("rewound")
        else "error" if turn_ended_in_error
        else "blocked" if blocking_issue or hook_blocked
        else "ok"
    )

    refs = {
        "files": {
            "edited": sorted(set(turn["edited_files"])),
            "read": sorted(set(turn["read_files"])),
        },
        "searches": turn["searches"],
        "commands": turn["commands"],
        "agents": turn["agent_runs"],
        "artifacts": turn["artifacts"],
    }

    payload: dict[str, Any] = {
        "schema_version": 2,
        "turn": number,
        # Self-identification: the turn file travels alone (uploaded to a
        # remote agent with no access to this machine or the sibling
        # .meta.json), so it must say which session/repo/model produced it
        # (SESSION-LOG-REMOTE-DEBRIEF-001 A1).
        "context": context,
        "ts_start": ts_start,
        "ts_end": ts_end,
        "user": turn.get("user"),
        "user_ts": turn.get("user_ts"),
        "turn_summary": summary,
        "status": status,
        # How the turn ended, when it did not end normally. Escape mid-action
        # is the strongest steering signal a session records, split by what
        # the user cut off: "user_interrupt_tool" vetoed a proposed action,
        # "user_interrupt_generation" cut off the reply. null means the agent
        # finished on its own.
        "ended_by": turn.get("ended_by"),
        "decisions": decisions,
        "next_action": next_action,
        "blocking_issue": blocking_issue,
        "refs": refs,
        "hook_contexts": turn["hook_contexts"],
        "interjections": turn["interjections"],
        "timeline": turn["timeline"],
    }

    # Both blocks are added only when the signal exists. A harness whose
    # transcript carries no usage must render NO usage key — a zero-filled
    # block would read as "this turn cost nothing" instead of "not recorded".
    usage = turn.get("usage")
    if usage:
        payload["usage"] = usage

    # rewound_from is a TURN NUMBER, and numbers are assigned only after the
    # non-substantive turns are filtered out, so accumulate_turns hands over an
    # object reference and it is resolved here against the final numbering. An
    # earlier turn that did not survive that filter yields no rewound_from
    # rather than a number pointing at the wrong turn.
    rewound_from = turn.get("rewound_from_turn")
    if rewound_from is not None and turn_numbers is not None:
        resolved = turn_numbers.get(id(rewound_from))
        if resolved is not None:
            payload["rewound_from"] = resolved
            payload["rewind_kind"] = turn.get("rewind_kind")

    return payload


def run_git(cwd: str, args: list[str], max_output: int = 12000) -> str:
    try:
        result = subprocess.run(
            ["git", *args],
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=10,
        )
    except Exception:
        return ""
    output = (result.stdout or "").strip()
    if len(output) > max_output:
        output = output[:max_output] + "\n...(truncated)"
    return output


def build_git_snapshot(cwd: str, start_sha: str, branch: str, head_sha: str, dirty_count: str) -> dict[str, Any]:
    snapshot = {
        "branch": branch,
        "head_sha": head_sha,
        "start_sha": start_sha,
        "dirty_files": int(dirty_count or "0"),
        "status": run_git(cwd, ["status", "--porcelain"], 6000),
        "log": run_git(cwd, ["log", "--oneline", f"{start_sha}..HEAD"] if start_sha else ["log", "--oneline", "-10"], 5000),
        "diff_stat": run_git(cwd, ["diff", "--stat", f"{start_sha}..HEAD"] if start_sha else ["diff", "--stat"], 5000),
        "diff_excerpt": run_git(cwd, ["diff", f"{start_sha}..HEAD"] if start_sha else ["diff"], 8000),
    }
    if not snapshot["log"]:
        snapshot["log"] = run_git(cwd, ["log", "--oneline", "-10"], 8000)
    return snapshot


TURN_FILE_RE = re.compile(r"turn-\d+\.(json|txt)$")


def remove_legacy_aggregates(log_dir: Path) -> None:
    """Delete the retired aggregate views (session.json / handoff.json /
    session.txt). These are always stale-if-present — nothing reads them and the
    renderer no longer emits them — so removing them unconditionally is safe.
    Turn files are handled separately and are NOT deleted here (see
    render_session): a delete-first sweep of turn files is what emptied
    sess_785a4237 when a later render resolved no transcript.
    """
    for name in ("session.txt", "session.json", "handoff.json"):
        (log_dir / name).unlink(missing_ok=True)


def existing_turn_files(log_dir: Path) -> list[Path]:
    if not log_dir.is_dir():
        return []
    return sorted(p for p in log_dir.iterdir() if TURN_FILE_RE.match(p.name))


def transcript_lineage(path: str) -> dict[str, Any] | None:
    if not path or not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8") as source:
        for index, line in enumerate(source):
            if index >= 32:
                break
            try:
                row = json.loads(line)
            except ValueError:
                continue
            if not isinstance(row, dict) or row.get("type") != "session_meta":
                continue
            payload = row.get("payload")
            if not isinstance(payload, dict):
                continue
            parent = payload.get("forked_from") or payload.get("parent_session_id")
            if isinstance(parent, str) and parent:
                return {"parent_session_id": parent, "source": "transcript_metadata",
                        "authority": "none", "source_path": path}
    return None


def _render_session_unlocked(
    *,
    log_dir: str,
    cwd: str,
    session_id: str,
    started_at: str,
    model: str,
    branch: str,
    head_sha: str,
    dirty_count: str,
    start_sha: str,
    transcript_path: str,
    audit_path: str = "",
    hook_outcome_path: str = "",
    transcript_cache: dict[str, Any] | None = None,
) -> None:
    # Turn files are the only emitted artifact. The aggregate views
    # (session.json / handoff.json / session.txt) were write-only duplication
    # of the numbered turn-NNN.json files — nothing read them, and an unused
    # session (no transcript / no substantive turns) used to leave an empty
    # session.json + session.txt behind. Now an unused session writes zero
    # turn files; the per-session pointer files (.session-envelope.json /
    # .caller-session.json / .meta.json) are written by parse-input.sh, not
    # here, and are untouched. Errored-command visibility (SESSION-LOG-ERROR-
    # VISIBILITY-001) is preserved in each turn payload's `commands` list and in
    # per-tool `is_error`/`duration_s` fields — a continuing agent reads the
    # turn files directly instead of a re-projected handoff.
    output_dir = Path(log_dir)

    existing = existing_turn_files(output_dir)

    # Compute the new render BEFORE mutating any turn file. A missing/unresolved
    # transcript yields zero turns; if turns already exist on disk, a zero-turn
    # render must NOT delete them (the sess_785a4237 data-loss mode). Only a
    # genuinely-empty session (no existing turns) legitimately stays at zero.
    turn_payloads: list[dict[str, Any]] = []
    transcript_available = bool(transcript_path and os.path.isfile(transcript_path))
    if transcript_available or (not existing and (audit_path or hook_outcome_path)):
        transcript_events = parse_transcript_events(transcript_path, cache=transcript_cache) if transcript_available else []
        if not transcript_events and existing:
            # Auxiliary hook observations cannot replace previously captured
            # human history when the transcript projection has become empty.
            return {"status": "retained_empty_source", "outputs_current": False}
        auxiliary_events = parse_audit_events(audit_path, session_id)
        auxiliary_events.extend(parse_hook_outcome_events(hook_outcome_path, session_id))
        events = merge_chronological_events(transcript_events, auxiliary_events)
        turns, _session_events = accumulate_turns(events, cwd)
        # Emit only substantive turns. A user event with an empty timeline is
        # either the in-progress turn being rendered mid-flight (prompt
        # submitted, no agent work yet) or a harness-injected event with no
        # agent response (an image attachment, a bash echo whose only reply
        # was the filtered ack). Emitting those shells is what produced empty
        # turn-NNN.json phantoms (SESSION-LOG-REMOTE-DEBRIEF-001 A9). The user
        # message is not lost: an in-flight turn surfaces the moment it gains
        # timeline content on the next render.
        substantive = [
            turn for turn in turns
            if turn["user"] or turn["timeline"] or turn["control_events"] or turn["interjections"] or turn["hook_contexts"]
        ]
        # Session-scoped context embedded in every turn. branch/head_sha/
        # dirty_files are the repo state at the MOST RECENT render (session-
        # log.sh reads them live), not per-turn history; start_sha is the
        # session-start anchor carried from .meta.json. No render timestamp —
        # a volatile field would defeat the byte-identical write skip.
        try:
            dirty = int(dirty_count or "0")
        except ValueError:
            dirty = 0
        context = {
            "session_id": session_id,
            "project": Path(cwd).name,
            "cwd": cwd,
            "model": model,
            "session_started_at": started_at,
            "branch": branch,
            "head_sha": head_sha,
            "start_sha": start_sha,
            "dirty_files": dirty,
            "lineage": transcript_lineage(transcript_path),
        }
        # Built before any payload so a rewind can resolve a turn number that
        # is only known once the substantive set is final.
        turn_numbers = {id(turn): idx + 1 for idx, turn in enumerate(substantive)}
        turn_payloads = [
            build_turn_payload(turn, idx + 1, context, turn_numbers)
            for idx, turn in enumerate(substantive)
        ]

    if not turn_payloads:
        # Preservation is observable staleness, never a successful current render.
        return {"status": ("retained_empty_source" if transcript_available else "retained_missing_transcript")
                if existing else "empty", "outputs_current": not existing}

    # M>0 turns produced: write the new set, then remove any orphaned
    # higher-numbered turn files (turn-(M+1)..turn-N) left by a prior larger
    # render. A legitimately smaller non-zero render (e.g. a noise-filter change)
    # is applied — the floor is only against a zero-turn clobber above.
    # Sweep tmp residue from crashed writes. Only files older than 60s: a
    # concurrent render's in-flight tmp must not be unlinked mid-write.
    written: set[str] = set()
    for payload in turn_payloads:
        name = f"turn-{payload['turn']:03d}.json"
        target = output_dir / name
        serialized = json.dumps(payload, indent=2)
        # Skip byte-identical rewrites. The renderer runs once per turn (Stop
        # hook) and re-renders the whole session; without this check a
        # steady-state invocation rewrote every turn file (measured: 54 files
        # / 12.5MB of identical JSON on a 38.6MB transcript) — churn for
        # file-watchers and mtimes, no information.
        try:
            if target.is_file() and target.read_text(encoding="utf-8") == serialized:
                written.add(name)
                continue
        except (OSError, ValueError):
            # ValueError covers UnicodeDecodeError from an externally-
            # corrupted turn file — fall through and rewrite it atomically
            # rather than failing every future render of the session.
            pass
        # Atomic write (tmp + rename): a turn file on disk must always be
        # complete JSON. Truncate-in-place let a reader — or a racing render
        # (daemon and one-shot fallback can both write the same session dir)
        # — observe a torn artifact (SESSION-LOG-DAEMON-HARDENING-001 A1).
        tmp_target = output_dir / f"{name}.tmp.{os.getpid()}.{uuid.uuid4().hex}"
        tmp_target.write_text(serialized, encoding="utf-8")
        tmp_target.replace(target)
        written.add(name)

    for path in existing:
        if path.name not in written:
            path.unlink(missing_ok=True)
    return {"status": "rendered", "outputs_current": True}


def input_snapshot(path: str) -> dict[str, Any]:
    if not path or not os.path.isfile(path):
        return {"path": path, "status": "missing"}
    digest = hashlib.sha256()
    with open(path, "rb") as source:
        stat = os.fstat(source.fileno())
        for block in iter(lambda: source.read(1 << 20), b""):
            digest.update(block)
    return {"path": path, "status": "read", "sha256": digest.hexdigest(),
            "bytes": stat.st_size, "inode": stat.st_ino}


def render_session(**kwargs: Any) -> None:
    """Serialize writers before reading inputs; each turn replacement is atomic.

    The lock is process-scoped and releases on exit/crash. No PID lease is
    interpreted and no other process is killed. Readers spanning several turn
    files still need a generation-aware protocol for a transactional snapshot.
    """
    directory = Path(kwargs["log_dir"])
    directory.mkdir(parents=True, exist_ok=True)
    fd = os.open(directory, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        lock = os.open(".render.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600, dir_fd=fd)
        try:
            fcntl.flock(lock, fcntl.LOCK_EX)
            paths = {key: str(kwargs.get(key, "")) for key in
                     ("transcript_path", "audit_path", "hook_outcome_path")}
            before = {key: input_snapshot(path) for key, path in paths.items()}
            outcome = _render_session_unlocked(**kwargs)
            after = {key: input_snapshot(path) for key, path in paths.items()}
            outputs = {path.name: hashlib.sha256(path.read_bytes()).hexdigest()
                       for path in sorted(directory.glob("turn-*.json"))}
            state = {"schema": "caws.session_render.v1", "session_id": kwargs["session_id"],
                     "status": outcome["status"],
                     "outputs_current": outcome["outputs_current"] and before == after,
                     "inputs_before": before, "inputs_after": after,
                     "inputs_stable": before == after, "outputs": outputs,
                     "observation_boundary": "renderer_return", "native_delivery": "not_observed"}
            name = ".render-state.json.tmp." + uuid.uuid4().hex
            state_fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=fd)
            try:
                with os.fdopen(state_fd, "w") as target:
                    json.dump(state, target, indent=2)
                os.replace(name, ".render-state.json", src_dir_fd=fd, dst_dir_fd=fd)
            finally:
                try:
                    os.unlink(name, dir_fd=fd)
                except FileNotFoundError:
                    pass
        finally:
            os.close(lock)
    finally:
        os.close(fd)


def main() -> int:
    if len(sys.argv) not in (11, 13):
        print("usage: session_log_renderer.py <log_dir> <cwd> <session_id> <started_at> <model> <branch> <head_sha> <dirty_count> <start_sha> <transcript_path> [<audit_path> <hook_outcome_path>]", file=sys.stderr)
        return 1

    render_session(
        log_dir=sys.argv[1],
        cwd=sys.argv[2],
        session_id=sys.argv[3],
        started_at=sys.argv[4],
        model=sys.argv[5],
        branch=sys.argv[6],
        head_sha=sys.argv[7],
        dirty_count=sys.argv[8],
        start_sha=sys.argv[9],
        transcript_path=sys.argv[10],
        audit_path=sys.argv[11] if len(sys.argv) == 13 else "",
        hook_outcome_path=sys.argv[12] if len(sys.argv) == 13 else "",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
