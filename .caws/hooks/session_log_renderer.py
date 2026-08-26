#!/usr/bin/env python3
# CAWS-MANAGED-HOOK
# hook_pack: shared
# hook_pack_version: 47
# caws_min_major: 11
# lineage_refs: 10
# edit_stance: YOURS TO EDIT. This is a starting hook, not a locked one — shape it
#   to your repo: tune thresholds, add checks, remove what does not fit. Your edits
#   are preserved: caws init treats a changed hook as intended growth and will not
#   clobber it — it shows a diff and asks (--adopt keeps yours; --overwrite --force
#   takes the upstream template). The CAWS-MANAGED-HOOK marker above is only how caws
#   init finds hooks it can offer updates for; it is NOT a keep-out sign. CAWS owns the
#   failure-class invariant (the why/what a guard protects); you own the how. The one
#   edit to avoid: gutting a guard to dodge a block instead of fixing the cause. Grow
#   everything else freely.
"""Render lean session artifacts from a Claude transcript JSONL.

This file is invoked by session-log.sh via `python3 <path>`. It is NOT
executable on its own; the pack manifest registers it with
`executable: false`. The CAWS-MANAGED-HOOK header above is parsed
by `caws init` to recognize this file as managed.

Bundled in v6 of the pack to fix CAWS-HOOK-PACK-RENDERER-MISSING-001:
session-log.sh's `RENDERER` path used to point at a file that was
not bundled, producing a crash on every invocation in fresh installs.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


NOISE_PREFIXES = (
    "<local-command",
    "<command-name",
    "<command-message",
    "<local-command-stdout",
    "<local-command-caveat",
    "This session is being continued",
    # Slash-command body + hook-block echoes. A hook-intercepted command
    # (/copy-turn, /replay-last, /reorient) is delivered as a user-role event in
    # three shapes — a <command-message>/<command-name> wrapper (covered above),
    # the skill body text, and the block reason echoed back as "Operation
    # stopped by hook:". None of these are agent work; left unfiltered they open
    # phantom turns (an empty turn-NNN.json) that persisted into the session log.
    "This slash command's behavior is handled entirely by",
    "Operation stopped by hook:",
)

SESSION_EVENT_PREFIXES = (
    "<task-notification>",
    "[Request interrupted",
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
NEXT_ACTION_PATTERNS = [
    re.compile(r"(?:^|\n)\s*(?:next step|next action|next:|todo:|will now)[:\s]+(.+?)(?:\n|$)", re.IGNORECASE),
]
BLOCKING_PATTERNS = [
    re.compile(r"(?:^|\n)\s*(?:blocked|blocking|cannot proceed|stuck)[:\s]+(.+?)(?:\n|$)", re.IGNORECASE),
]

# --- Qwen Code transcript support (CAWS-SESSION-LOG-QWEN-001) ---------------
# Qwen Code transcripts (~/.qwen/projects/<slug>/chats/<session-id>.jsonl,
# verified on 0.21.4) are Gemini-shaped: rows of type user/assistant/
# tool_result/system with message.parts entries ({text[, thought]},
# {functionCall}, {functionResponse}) — NOT Claude's message.content blocks.
# The helpers below convert qwen rows to the same canonical event dicts the
# claude branches emit, so accumulate_turns stays surface-neutral.
#
# Tool names arrive as qwen RUNTIME ids; they normalize to the canonical
# harness names here (same boundary normalization as the qwen-code
# parse-input.sh hook override) so every downstream tool branch applies.
QWEN_TOOL_NAME_MAP = {
    "write_file": "Write",
    "edit": "Edit",
    "read_file": "Read",
    "run_shell_command": "Bash",
    "glob": "Glob",
    "grep_search": "Grep",
    "notebook_edit": "NotebookEdit",
    "web_fetch": "WebFetch",
    "agent": "Agent",
    "skill": "Skill",
    "exit_plan_mode": "ExitPlanMode",
}

# When a prompt references a file (@-mention / editor context), Qwen delivers
# the file content as SEPARATE user-type rows wrapped in marker lines. They
# are context injection, not human turns — left in, each wrapper row opens a
# phantom turn. Matched against stripped text (wrapper rows carry a leading
# space). Verified on 0.21.4.
QWEN_CONTEXT_INJECTION_PATTERNS = (
    re.compile(r"^--- Content from referenced files ---"),
    re.compile(r"^--- End of content ---"),
    re.compile(r"^Content from /\S+"),
    re.compile(r"^Showing lines \d+"),
)


def _qwen_message_parts(obj: dict[str, Any]) -> list[Any] | None:
    """Gemini-style message.parts when present (None for Claude rows)."""
    message = obj.get("message")
    if not isinstance(message, dict):
        return None
    parts = message.get("parts")
    return parts if isinstance(parts, list) else None


def _is_qwen_row(obj: dict[str, Any]) -> bool:
    kind = obj.get("type")
    if kind == "tool_result":
        # Only Qwen emits a top-level tool_result row type.
        return True
    if kind == "system":
        # Qwen harness telemetry (ui_telemetry, attribution/file-history
        # snapshots, slash-command echoes). Claude transcripts carry no
        # system rows this parser consumes, so claiming them is a no-op for
        # claude rendering.
        return "systemPayload" in obj or obj.get("subtype") is not None
    if kind in ("user", "assistant"):
        return _qwen_message_parts(obj) is not None
    return False


def _parse_qwen_row(obj: dict[str, Any], ts: str | None) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    kind = obj.get("type")
    parts = _qwen_message_parts(obj) or []

    if kind == "system":
        return events

    if kind == "user":
        is_interjection = obj.get("subtype") == "mid_turn_user_message"
        for part in parts:
            if not isinstance(part, dict):
                continue
            text = part.get("text")
            if not isinstance(text, str) or not text.strip():
                continue
            stripped = text.strip()
            if any(p.match(stripped) for p in QWEN_CONTEXT_INJECTION_PATTERNS):
                continue
            if is_interjection:
                events.append({"ev": "interjection", "text": text, "ts": ts})
            else:
                # notification rows (task-notification envelopes) flow
                # through as user_text; SESSION_EVENT_PREFIXES routes them
                # to control events, same as Claude's task notifications.
                events.append({"ev": "user_text", "text": text, "ts": ts})
        return events

    if kind == "assistant":
        for part in parts:
            if not isinstance(part, dict):
                continue
            text = part.get("text")
            if isinstance(text, str) and text.strip():
                events.append({"ev": "assistant_text", "text": text, "ts": ts})
                continue
            call = part.get("functionCall")
            if isinstance(call, dict):
                raw_name = call.get("name", "") or ""
                args = call.get("args")
                events.append(
                    {
                        "ev": "tool_use",
                        "name": QWEN_TOOL_NAME_MAP.get(raw_name, raw_name),
                        "id": call.get("id", ""),
                        "input": args if isinstance(args, dict) else {},
                        "ts": ts,
                    }
                )
        return events

    if kind == "tool_result":
        call_result = obj.get("toolCallResult")
        status = call_result.get("status") if isinstance(call_result, dict) else None
        for part in parts:
            if not isinstance(part, dict):
                continue
            response = part.get("functionResponse")
            if not isinstance(response, dict):
                continue
            payload = response.get("response")
            if isinstance(payload, dict):
                output = payload.get("output", "")
                if not isinstance(output, str):
                    output = json.dumps(output, ensure_ascii=False)
            else:
                output = ""
            events.append(
                {
                    "ev": "tool_result",
                    "id": response.get("id", "")
                    or (call_result.get("callId", "") if isinstance(call_result, dict) else ""),
                    "content": output,
                    "is_error": isinstance(status, str) and status != "success",
                    "ts": ts,
                }
            )
    return events


# --- Kimi Code transcript support (CAWS-SESSION-LOG-KIMI-001) ---------------
# Kimi Code durable transcripts are the per-session wire logs at
# ~/.kimi-code/sessions/<workspace-slug>/session_<id>/agents/main/wire.jsonl
# (indexed by ~/.kimi-code/session_index.jsonl; wire protocol 1.4 verified
# live against kimi-code 0.31.x, 2026-08-12). Rows are
# {"type": "<dotted.type>", "time": <epoch ms>, ...} — NOT Claude's
# timestamp/message.content and NOT Qwen's timestamp/message.parts. The
# helpers below convert kimi rows to the same canonical event dicts the
# claude branches emit, so accumulate_turns stays surface-neutral.
#
# Kimi tool names already arrive canonical (Read, Write, Edit, Bash, ...),
# but kimi's file tools carry the target in args.path, not the Claude-schema
# file_path the accumulation branches read. Same boundary normalization as
# the kimi-code parse-input.sh hook override: args.path mirrors to file_path
# so Write/Edit/Read land in edited_files/read_files.
def _is_kimi_row(obj: dict[str, Any]) -> bool:
    # Every kimi wire row stamps `time` (epoch ms); claude and qwen rows stamp
    # `timestamp` and never carry `time`. A numeric `time` plus a string
    # `type` is unique to kimi across the three shapes. (The kimi `metadata`
    # header row has no `time` and falls through to the claude branches,
    # which ignore its unmatched type.)
    return isinstance(obj.get("time"), (int, float)) and isinstance(obj.get("type"), str)


def _parse_kimi_row(obj: dict[str, Any], _ts: str | None) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    # kimi `time` is epoch MILLISECONDS (wire protocol 1.4); parse_timestamp's
    # numeric branch expects seconds, so convert here rather than per-event.
    raw_time = obj.get("time")
    ts = parse_timestamp(raw_time / 1000) if isinstance(raw_time, (int, float)) else None
    kind = obj.get("type")

    if kind == "turn.prompt":
        # Human turn input: {input: [{type: "text", text}], origin: {kind}}.
        for block in obj.get("input") or []:
            if not isinstance(block, dict):
                continue
            text = block.get("text")
            if isinstance(text, str) and text.strip():
                events.append({"ev": "user_text", "text": text, "ts": ts})
        return events

    if kind != "context.append_loop_event":
        # context.append_message duplicates turn.prompt for user messages
        # (same text, one row later) — claiming it would open each turn
        # twice. Everything else (llm.request, usage.record, config.update,
        # tools.update_store, plan_mode.*, compaction rows) is harness
        # telemetry, not agent work.
        return events

    event = obj.get("event")
    if not isinstance(event, dict):
        return events
    sub = event.get("type")

    if sub == "content.part":
        part = event.get("part")
        if not isinstance(part, dict):
            return events
        # {type: "text", text} is model output; {type: "think", think} is
        # reasoning. Both become assistant_text (the timeline's reasoning
        # kind) — kimi's think parts are this surface's reasoning trace.
        part_type = part.get("type")
        text = part.get("text") if part_type == "text" else part.get("think") if part_type == "think" else None
        if isinstance(text, str) and text.strip():
            events.append({"ev": "assistant_text", "text": text, "ts": ts})

    elif sub == "tool.call":
        args = event.get("args")
        tool_input = dict(args) if isinstance(args, dict) else {}
        if "file_path" not in tool_input and isinstance(tool_input.get("path"), str):
            tool_input["file_path"] = tool_input["path"]
        events.append(
            {
                "ev": "tool_use",
                "name": event.get("name", ""),
                "id": event.get("toolCallId", ""),
                "input": tool_input,
                "ts": ts,
            }
        )

    elif sub == "tool.result":
        result = event.get("result")
        if not isinstance(result, dict):
            result = {}
        output = result.get("output", "")
        if not isinstance(output, str):
            output = json.dumps(output, ensure_ascii=False)
        events.append(
            {
                "ev": "tool_result",
                "id": event.get("toolCallId", ""),
                "content": output,
                "is_error": bool(result.get("isError")),
                "ts": ts,
            }
        )

    # step.begin / step.end carry usage and latency telemetry, not content.
    return events


def rel_path(path: str | None, cwd: str) -> str:
    if path and path.startswith(cwd + "/"):
        return path[len(cwd) + 1 :]
    return path or ""


def parse_timestamp(ts: Any) -> str | None:
    if not ts:
        return None
    if isinstance(ts, str):
        return ts
    if isinstance(ts, (int, float)):
        try:
            return datetime.utcfromtimestamp(ts).strftime("%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            return str(ts)
    return str(ts)


def seconds_between(ts1: str | None, ts2: str | None) -> float | None:
    if not ts1 or not ts2:
        return None
    fmts = (
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%S.%f%z",
    )
    first = second = None
    for fmt in fmts:
        if first is None:
            try:
                first = datetime.strptime(ts1, fmt)
            except ValueError:
                pass
        if second is None:
            try:
                second = datetime.strptime(ts2, fmt)
            except ValueError:
                pass
    if first and second:
        return round((second - first).total_seconds(), 2)
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


def decode_structured_text_payload(raw: str | None) -> str:
    if not isinstance(raw, str):
        return raw or ""
    payload = raw.strip()
    if not payload or payload[0] not in "[{":
        return raw
    try:
        parsed = json.loads(payload)
    except Exception:
        return raw
    items = parsed if isinstance(parsed, list) else [parsed]
    blocks = []
    for item in items:
        if isinstance(item, dict):
            text = item.get("text")
            if isinstance(text, str) and text.strip():
                blocks.append(text)
    return "\n\n".join(blocks) if blocks else raw


def extract_heuristic_fields(reasoning_texts: list[str]) -> tuple[list[dict[str, str]], str | None, str | None]:
    decisions: list[dict[str, str]] = []
    next_action = None
    blocking_issue = None
    full_text = "\n".join(reasoning_texts)

    for pattern in DECISION_PATTERNS:
        for match in pattern.finditer(full_text):
            statement = match.group(1).strip()[:240]
            if statement and statement not in {d["statement"] for d in decisions}:
                decisions.append({"statement": statement, "source": "heuristic"})

    for pattern in NEXT_ACTION_PATTERNS:
        match = pattern.search(full_text)
        if match:
            next_action = match.group(1).strip()[:240]
            break

    for pattern in BLOCKING_PATTERNS:
        match = pattern.search(full_text)
        if match:
            blocking_issue = match.group(1).strip()[:240]
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


def extract_text_from_content_blocks(content: Any) -> str:
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""

    blocks = []
    for item in content:
        if not isinstance(item, dict):
            continue
        text = item.get("text")
        if isinstance(text, str) and text.strip():
            blocks.append(text)
            continue
        if item.get("type") == "json":
            value = item.get("json")
            if value is not None:
                blocks.append(json.dumps(value, ensure_ascii=False))
    return "\n\n".join(blocks)


def extract_tool_result_content(entry: dict[str, Any]) -> str:
    tool_use_result = entry.get("tool_use_result")
    if isinstance(tool_use_result, dict):
        file_payload = tool_use_result.get("file")
        if isinstance(file_payload, dict):
            content = file_payload.get("content")
            if isinstance(content, str) and content.strip():
                return content
        text = tool_use_result.get("text")
        if isinstance(text, str) and text.strip():
            return text
    item_content = extract_text_from_content_blocks(entry.get("content"))
    if item_content.strip():
        return item_content
    return entry.get("content", "") or ""


def parse_transcript_events(transcript_path: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    with open(transcript_path, encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            ts = parse_timestamp(obj.get("timestamp"))
            kind = obj.get("type")

            # Qwen Code rows (Gemini-shaped parts) convert to the same
            # canonical events the claude branches emit; claude rows never
            # match _is_qwen_row (no message.parts / tool_result type).
            if _is_qwen_row(obj):
                events.extend(_parse_qwen_row(obj, ts))
                continue

            # Kimi Code wire rows (epoch-ms `time`, dotted types) convert to
            # the same canonical events; claude/qwen rows never match
            # _is_kimi_row (no numeric `time` key).
            if _is_kimi_row(obj):
                events.extend(_parse_kimi_row(obj, ts))
                continue

            if kind == "user":
                content = obj.get("message", {}).get("content")
                if isinstance(content, str):
                    events.append({"ev": "user_text", "text": content, "ts": ts})
                elif isinstance(content, list):
                    for item in content:
                        if not isinstance(item, dict):
                            continue
                        if item.get("type") == "tool_result":
                            events.append(
                                {
                                    "ev": "tool_result",
                                    "id": item.get("tool_use_id", ""),
                                    "content": extract_tool_result_content(item),
                                    "tool_use_result": item.get("tool_use_result"),
                                    "is_error": item.get("is_error", False),
                                    "ts": ts,
                                }
                            )
                        elif item.get("type") == "text":
                            events.append({"ev": "user_text", "text": item.get("text", ""), "ts": ts})

            elif kind == "assistant":
                content = obj.get("message", {}).get("content", [])
                if not isinstance(content, list):
                    continue
                for item in content:
                    if not isinstance(item, dict):
                        continue
                    if item.get("type") == "text":
                        events.append({"ev": "assistant_text", "text": item.get("text", ""), "ts": ts})
                    elif item.get("type") == "tool_use":
                        tool_input = item.get("input", {}) if isinstance(item.get("input"), dict) else {}
                        events.append(
                            {
                                "ev": "tool_use",
                                "name": item.get("name", ""),
                                "id": item.get("id", ""),
                                "input": tool_input,
                                "ts": ts,
                            }
                        )

            elif kind == "attachment":
                attachment = obj.get("attachment")
                # Mid-turn interjections: a message sent while the assistant is
                # still running never becomes a role:user transcript line — the
                # harness stores it as a queued_command attachment instead, and
                # it is delivered inline (often between tool calls) rather than
                # opening a new turn. Without this branch, human steering sent
                # mid-flight is invisible to the session log even though it can
                # change the shape of the work that follows in the same turn.
                # Task-notification queued_command entries (background-agent
                # completions) are excluded: they never carry origin.kind, only
                # genuine human-authored prompts do.
                # CAWS-SESSION-LOG-INTERJECTION-CAPTURE-001.
                if isinstance(attachment, str):
                    if "'queued_command'" in attachment and "'human'" in attachment:
                        m = re.search(r"'prompt':\s*'(.*?)',\s*'commandMode'", attachment, re.DOTALL)
                        if m:
                            events.append({"ev": "interjection", "text": m.group(1), "ts": ts})
                    continue
                if not isinstance(attachment, dict):
                    continue
                if attachment.get("type") == "queued_command":
                    origin = attachment.get("origin")
                    if isinstance(origin, dict) and origin.get("kind") == "human":
                        # prompt is usually a string, but a pasted image (or
                        # other content-block payload) makes it a list like
                        # message.content elsewhere in the transcript.
                        raw_prompt = attachment.get("prompt", "")
                        prompt = raw_prompt if isinstance(raw_prompt, str) \
                            else extract_text_from_content_blocks(raw_prompt)
                        if prompt and prompt.strip():
                            events.append({"ev": "interjection", "text": prompt, "ts": ts})
                    continue

    return events


def accumulate_turns(events: list[dict[str, Any]], cwd: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    turns: list[dict[str, Any]] = []
    session_events: list[dict[str, Any]] = []
    current = new_turn()
    pending_tools: dict[str, dict[str, Any]] = {}

    for entry in events:
        ev = entry.get("ev")
        ts = parse_timestamp(entry.get("ts"))

        if ev == "user_text":
            text = entry.get("text", "")
            if any(text.startswith(prefix) for prefix in NOISE_PREFIXES) or not text.strip():
                continue
            if any(text.startswith(prefix) for prefix in SESSION_EVENT_PREFIXES):
                session_events.append(parse_control_event(text, ts))
                continue
            if current["user"] or current["timeline"] or current["control_events"] or current["interjections"]:
                turns.append(current)
            current = new_turn(text, ts)
            continue

        if ev == "assistant_text":
            text = entry.get("text", "")
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
            name = entry.get("name", "")
            tool_input = entry.get("input", {})
            tool_entry: dict[str, Any] = {
                "kind": "tool_call",
                "name": name,
                "id": entry.get("id", ""),
                "ts": ts,
                "provenance": "tool_call",
            }

            if name in ("Write", "Edit"):
                file_path = rel_path(tool_input.get("file_path"), cwd)
                tool_entry["file"] = file_path
                append_unique(current["edited_files"], file_path)
                if name == "Edit":
                    tool_entry["old_string"] = truncate(tool_input.get("old_string", ""), 1200)
                    tool_entry["new_string"] = truncate(tool_input.get("new_string", ""), 1200)
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

        if ev == "tool_result":
            tool_id = entry.get("id", "")
            tool_info = pending_tools.get(tool_id)
            content = entry.get("content", "") or ""
            if tool_info:
                name = tool_info.get("name", "")
                result_text = content
                if name in ("Agent", "Task"):
                    result_text = decode_structured_text_payload(content)
                if name == "Read":
                    result_text = content
                if name in ("Bash", "Agent", "Task"):
                    pass
                elif name in ("Read", "Write", "Edit"):
                    result_text = truncate(result_text, 2500)
                else:
                    result_text = truncate(result_text, 3000)

                duration = seconds_between(tool_info.get("ts"), ts)
                tool_info["output"] = result_text
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
            continue

    if current["user"] or current["timeline"] or current["control_events"] or current["interjections"]:
        turns.append(current)

    return turns, session_events


def build_turn_payload(turn: dict[str, Any], number: int) -> dict[str, Any]:
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
    for item in turn["interjections"]:
        if item.get("ts"):
            all_ts.append(item["ts"])
    ts_values = [value for value in all_ts if value]
    ts_start = min(ts_values) if ts_values else None
    ts_end = max(ts_values) if ts_values else None

    status = "error" if turn_ended_in_error else "blocked" if blocking_issue else "ok"

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

    return {
        "schema_version": 2,
        "turn": number,
        "ts_start": ts_start,
        "ts_end": ts_end,
        "user": turn.get("user"),
        "user_ts": turn.get("user_ts"),
        "turn_summary": summary,
        "status": status,
        "decisions": decisions,
        "next_action": next_action,
        "blocking_issue": blocking_issue,
        "refs": refs,
        "interjections": turn["interjections"],
        "timeline": turn["timeline"],
    }


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


def cleanup_generated_outputs(log_dir: Path) -> None:
    for path in log_dir.iterdir():
        if path.name in {"session.txt", "session.json", "handoff.json"}:
            path.unlink(missing_ok=True)
            continue
        if re.match(r"turn-\d+\.(json|txt)$", path.name):
            path.unlink(missing_ok=True)


def render_session(
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
    cleanup_generated_outputs(output_dir)

    if not transcript_path or not os.path.isfile(transcript_path):
        return

    turns, _session_events = accumulate_turns(parse_transcript_events(transcript_path), cwd)
    turn_payloads = [build_turn_payload(turn, idx + 1) for idx, turn in enumerate(turns)]

    for payload in turn_payloads:
        target = output_dir / f"turn-{payload['turn']:03d}.json"
        target.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> int:
    if len(sys.argv) != 11:
        print("usage: session_log_renderer.py <log_dir> <cwd> <session_id> <started_at> <model> <branch> <head_sha> <dirty_count> <start_sha> <transcript_path>", file=sys.stderr)
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
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
