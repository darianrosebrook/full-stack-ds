#!/usr/bin/env python3
"""Reconstruct a Claude-Code-shaped .jsonl transcript from opencode's SQLite store.

opencode keeps session history in ~/.local/share/opencode/opencode.db
(message + part tables) rather than per-session .jsonl files. session_log_renderer.py
only knows how to parse the Claude Code .jsonl transcript event shape
({"type": "user"|"assistant", "message": {"content": [...]}}), so this script
projects opencode's relational rows into that same event shape and writes the
result to a cache file. session-log.sh's resolve_transcript() then treats the
cache file exactly like a native transcript — no renderer changes needed.

Usage: opencode-transcript.py <db_path> <session_id> <out_path>
Exits 0 and writes nothing if the session has no rows (caller checks for the
file's existence, not the exit code, before treating it as a hit).
"""
from __future__ import annotations

import json
import sqlite3
import sys
from typing import Any

# opencode tool name -> Claude Code tool name. Only mapped tools get
# structured handling in session_log_renderer.py's accumulate_turns(); unmapped
# tools (e.g. opencode's "question") still render as a generic timeline entry
# under their original name, so omission here is not silent data loss.
TOOL_NAME_MAP = {
    "read": "Read",
    "write": "Write",
    "edit": "Edit",
    "bash": "Bash",
    "grep": "Grep",
    "glob": "Glob",
    "task": "Agent",
    "skill": "Skill",
    "todowrite": "TodoWrite",
}

# opencode tool -> function that maps state.input into Claude Code's expected
# tool_use.input field names.
def _map_edit_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {
        "file_path": inp.get("filePath", ""),
        "old_string": inp.get("oldString", ""),
        "new_string": inp.get("newString", ""),
    }


def _map_write_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {"file_path": inp.get("filePath", ""), "content": inp.get("content", "")}


def _map_read_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {"file_path": inp.get("filePath", "")}


def _map_bash_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {"command": inp.get("command", ""), "description": inp.get("description", "")}


def _map_search_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {"pattern": inp.get("pattern", ""), "path": inp.get("path", "")}


def _map_task_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {
        "prompt": inp.get("prompt", ""),
        "subagent_type": inp.get("subagent_type", ""),
        "description": inp.get("description", ""),
    }


def _map_skill_input(inp: dict[str, Any]) -> dict[str, Any]:
    return {"skill": inp.get("name", ""), "args": inp.get("args", "")}


INPUT_MAPPERS = {
    "edit": _map_edit_input,
    "write": _map_write_input,
    "read": _map_read_input,
    "bash": _map_bash_input,
    "grep": _map_search_input,
    "glob": _map_search_input,
    "task": _map_task_input,
    "skill": _map_skill_input,
}


def _iso(ms: Any) -> str | None:
    if not ms:
        return None
    try:
        from datetime import datetime, timezone

        return datetime.fromtimestamp(int(ms) / 1000, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    except (ValueError, TypeError, OSError):
        return None


def _tool_part_to_events(part: dict[str, Any], ts: str | None) -> list[dict[str, Any]]:
    """One opencode `tool` part carries both the call and its result inline
    (state.input / state.output). Claude Code's transcript shape splits these
    into a tool_use (assistant turn) and a tool_result (user turn), so each
    opencode tool part becomes a (tool_use, tool_result) event pair.
    """
    tool = part.get("tool", "")
    call_id = part.get("callID", "")
    state = part.get("state") or {}
    raw_input = state.get("input") or {}
    mapped_input = INPUT_MAPPERS.get(tool, lambda i: i)(raw_input)
    mapped_name = TOOL_NAME_MAP.get(tool, tool)

    events = [
        {
            "type": "assistant",
            "timestamp": ts,
            "message": {
                "content": [
                    {"type": "tool_use", "id": call_id, "name": mapped_name, "input": mapped_input}
                ]
            },
        }
    ]

    if state.get("status") in ("completed", "error"):
        output = state.get("output", "")
        events.append(
            {
                "type": "user",
                "timestamp": ts,
                "message": {
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": call_id,
                            "is_error": state.get("status") == "error",
                            "content": output if isinstance(output, str) else json.dumps(output),
                        }
                    ]
                },
            }
        )

    return events


def reconstruct(db_path: str, session_id: str) -> list[dict[str, Any]]:
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    try:
        messages = conn.execute(
            "SELECT id, data, time_created FROM message WHERE session_id = ? ORDER BY time_created, id",
            (session_id,),
        ).fetchall()

        events: list[dict[str, Any]] = []
        for msg in messages:
            try:
                msg_data = json.loads(msg["data"])
            except json.JSONDecodeError:
                continue
            role = msg_data.get("role")
            msg_ts = _iso(msg["time_created"])

            parts = conn.execute(
                "SELECT data, time_created FROM part WHERE message_id = ? ORDER BY id",
                (msg["id"],),
            ).fetchall()

            for part_row in parts:
                try:
                    part = json.loads(part_row["data"])
                except json.JSONDecodeError:
                    continue
                part_ts = _iso(part_row["time_created"]) or msg_ts
                part_type = part.get("type")

                if part_type == "text" and role == "user":
                    text = part.get("text", "")
                    if text.strip():
                        events.append(
                            {
                                "type": "user",
                                "timestamp": part_ts,
                                "message": {"content": [{"type": "text", "text": text}]},
                            }
                        )
                elif part_type in ("text", "reasoning") and role == "assistant":
                    text = part.get("text", "")
                    if text.strip():
                        events.append(
                            {
                                "type": "assistant",
                                "timestamp": part_ts,
                                "message": {"content": [{"type": "text", "text": text}]},
                            }
                        )
                elif part_type == "tool":
                    events.extend(_tool_part_to_events(part, part_ts))
                # step-start / step-finish / other bookkeeping part types carry
                # no renderer-relevant content and are intentionally skipped.

        return events
    finally:
        conn.close()


def main() -> int:
    if len(sys.argv) != 4:
        print("usage: opencode-transcript.py <db_path> <session_id> <out_path>", file=sys.stderr)
        return 2

    db_path, session_id, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

    try:
        events = reconstruct(db_path, session_id)
    except sqlite3.Error as exc:
        print(f"opencode-transcript: sqlite error: {exc}", file=sys.stderr)
        return 1

    if not events:
        return 0

    with open(out_path, "w", encoding="utf-8") as handle:
        for event in events:
            handle.write(json.dumps(event) + "\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
