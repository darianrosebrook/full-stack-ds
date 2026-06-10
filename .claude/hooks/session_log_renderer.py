#!/usr/bin/env python3
# CAWS-MANAGED-HOOK
# hook_pack: claude-code
# hook_pack_version: 13
# caws_min_major: 11
# lineage_refs: 10
# do_not_edit_directly: update via `caws init --agent-surface claude-code`
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
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


NOISE_PREFIXES = (
    "<local-command",
    "<command-name",
    "<local-command-stdout",
    "<local-command-caveat",
    "This session is being continued",
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


def command_is_of_interest(entry: dict[str, Any]) -> bool:
    """A command is worth surfacing in the handoff/log if it matches the
    meaningful-keyword allowlist OR if it ERRORED. Errors are always
    meaningful: a blocked/failed command is exactly what a continuing agent
    needs to see, even when the command itself is not on the curated list
    (e.g. a bare `git worktree list` that tripped a guard, or an `ls` into a
    missing worktree dir). Without this, non-allowlisted failures vanish from
    the handoff and first-contact debugging has to reconstruct them from raw
    transcript JSONL (SESSION-LOG-ERROR-VISIBILITY-001).
    """
    command = entry.get("command") or ""
    if entry.get("is_error"):
        return True
    return any(keyword in command for keyword in MEANINGFUL_COMMAND_KW)

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
            if current["user"] or current["timeline"] or current["control_events"]:
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

    if current["user"] or current["timeline"] or current["control_events"]:
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
        "timeline": turn["timeline"],
    }


def collect_indexes(turn_payloads: list[dict[str, Any]]) -> dict[str, Any]:
    file_index: dict[str, dict[str, list[int]]] = {}
    command_index = []
    search_index = []
    agent_index = []
    artifact_index = []

    for payload in turn_payloads:
        turn_number = payload["turn"]
        for path in payload["refs"]["files"]["edited"]:
            file_index.setdefault(path, {"edited_in": [], "read_in": []})
            file_index[path]["edited_in"].append(turn_number)
        for path in payload["refs"]["files"]["read"]:
            file_index.setdefault(path, {"edited_in": [], "read_in": []})
            file_index[path]["read_in"].append(turn_number)
        for command in payload["refs"]["commands"]:
            command_index.append({"turn": turn_number, **command})
        for search in payload["refs"]["searches"]:
            search_index.append({"turn": turn_number, **search})
        for agent in payload["refs"]["agents"]:
            agent_index.append({"turn": turn_number, **agent})
        for artifact in payload["refs"]["artifacts"]:
            artifact_index.append({"turn": turn_number, **artifact})

    return {
        "files": file_index,
        "commands": command_index,
        "searches": search_index,
        "agents": agent_index,
        "artifacts": artifact_index,
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


def write_session_txt(
    path: Path,
    *,
    project_name: str,
    session_id: str,
    started_at: str,
    model: str,
    branch: str,
    head_sha: str,
    start_sha: str,
    turn_index: list[dict[str, Any]],
    session_events: list[dict[str, Any]],
    indexes: dict[str, Any],
) -> None:
    lines = [
        f"# Session Log: {project_name}",
        "",
        "| Field | Value |",
        "|-------|-------|",
        f"| Session ID | `{session_id}` |",
        f"| Started | {started_at} |",
        f"| Model | {model} |",
        f"| Branch | `{branch}` @ `{head_sha}` |",
    ]
    if start_sha:
        lines.append(f"| Start SHA | `{start_sha}` |")
    lines.extend(
        [
            f"| Substantive turns | {len(turn_index)} |",
            f"| Session events | {len(session_events)} |",
            "",
            "Canonical JSON: `session.json` plus `turn-###.json` files.",
            "",
            "## Turns",
            "",
        ]
    )

    for item in turn_index:
        status = f" [{item['status']}]" if item["status"] != "ok" else ""
        lines.append(
            f"- **[Turn {item['turn']}](turn-{item['turn']:03d}.json)**{status} — {item['user_preview']}"
        )
        meta = f"  _{item['reasoning_count']} msgs, {item['tool_count']} tools"
        if item["edited_preview"]:
            meta += f" | {item['edited_preview']}"
        meta += "_"
        lines.append(meta)
        if item.get("summary_preview"):
            lines.append(f"  > {item['summary_preview']}")

    if session_events:
        lines.extend(["", "## Session Events", ""])
        for event in session_events[-12:]:
            prefix = f"`{event['type']}`"
            task_tag = f" `{event['task_id']}`" if event.get("task_id") else ""
            lines.append(f"- {prefix}{task_tag} {event['preview']}")

    lines.extend(["", "## Focus", ""])
    for path_key, refs in list(indexes["files"].items())[:20]:
        markers = []
        if refs["edited_in"]:
            markers.append("edit " + ",".join(str(v) for v in refs["edited_in"][:4]))
        if refs["read_in"]:
            markers.append("read " + ",".join(str(v) for v in refs["read_in"][:4]))
        lines.append(f"- `{path_key}` ({'; '.join(markers)})")

    lines.extend(["", "## Commands", ""])
    for command in indexes["commands"]:
        text = command.get("command", "")
        if command_is_of_interest(command):
            # Flag failures so a scanning reader spots them without parsing
            # output (SESSION-LOG-ERROR-VISIBILITY-001).
            marker = " ❌ FAILED" if command.get("is_error") else ""
            lines.append(f"- turn {command['turn']}: `{truncate(text, 120)}`{marker}")

    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def build_handoff(
    *,
    session_id: str,
    model: str,
    turn_payloads: list[dict[str, Any]],
    session_events: list[dict[str, Any]],
    indexes: dict[str, Any],
    git_snapshot: dict[str, Any],
    transcript_path: str,
) -> dict[str, Any]:
    decisions: list[dict[str, str]] = []
    next_actions = []
    blocking = []
    for payload in turn_payloads:
        decisions.extend(payload["decisions"])
        if payload.get("next_action"):
            next_actions.append({"turn": payload["turn"], "text": payload["next_action"]})
        if payload.get("blocking_issue"):
            blocking.append({"turn": payload["turn"], "text": payload["blocking_issue"]})

    files_of_interest = sorted(
        indexes["files"].items(),
        key=lambda item: len(item[1]["edited_in"]) + len(item[1]["read_in"]),
        reverse=True,
    )

    return {
        "schema_version": 2,
        "session_id": session_id,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "session_file": "session.json",
        "transcript_path": transcript_path,
        "model": model,
        "git": git_snapshot,
        "continuation": {
            "recent_turns": [
                {
                    "turn": payload["turn"],
                    "path": f"turn-{payload['turn']:03d}.json",
                    "status": payload["status"],
                    "summary": payload.get("turn_summary"),
                }
                for payload in turn_payloads[-8:]
            ],
            "blocking_issues": blocking,
            "next_actions": next_actions[-12:],
            "decisions": decisions[-20:],
            "files_of_interest": [
                {
                    "path": path,
                    "edited_in": refs["edited_in"],
                    "read_in": refs["read_in"],
                }
                for path, refs in files_of_interest[:20]
            ],
            "commands_of_interest": [
                {
                    "turn": entry["turn"],
                    "command": entry.get("command"),
                    "output_preview": entry.get("output_preview"),
                    "is_error": bool(entry.get("is_error")),
                    "duration_s": entry.get("duration_s"),
                }
                for entry in indexes["commands"]
                if command_is_of_interest(entry)
            ][-20:],
            "agent_reports": indexes["agents"][-20:],
            "session_events": session_events[-20:],
        },
    }


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
    output_dir = Path(log_dir)
    cleanup_generated_outputs(output_dir)

    if not transcript_path or not os.path.isfile(transcript_path):
        session_payload = {
            "schema_version": 2,
            "session_id": session_id,
            "started_at": started_at,
            "model": model,
            "cwd": cwd,
            "branch": branch,
            "head_sha": head_sha,
            "start_sha": start_sha,
            "transcript_path": transcript_path,
            "turn_index": [],
            "session_events": [],
            "indexes": {"files": {}, "commands": [], "searches": [], "agents": [], "artifacts": []},
            "git": build_git_snapshot(cwd, start_sha, branch, head_sha, dirty_count),
        }
        (output_dir / "session.json").write_text(json.dumps(session_payload, indent=2), encoding="utf-8")
        write_session_txt(
            output_dir / "session.txt",
            project_name=os.path.basename(cwd),
            session_id=session_id,
            started_at=started_at,
            model=model,
            branch=branch,
            head_sha=head_sha,
            start_sha=start_sha,
            turn_index=[],
            session_events=[],
            indexes=session_payload["indexes"],
        )
        return

    turns, session_events = accumulate_turns(parse_transcript_events(transcript_path), cwd)
    turn_payloads = [build_turn_payload(turn, idx + 1) for idx, turn in enumerate(turns)]

    for payload in turn_payloads:
        target = output_dir / f"turn-{payload['turn']:03d}.json"
        target.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    indexes = collect_indexes(turn_payloads)
    git_snapshot = build_git_snapshot(cwd, start_sha, branch, head_sha, dirty_count)
    turn_index = []
    for payload in turn_payloads:
        edited = payload["refs"]["files"]["edited"]
        edited_preview = ", ".join(f"`{path}`" for path in edited[:3])
        if len(edited) > 3:
            edited_preview += f" +{len(edited) - 3} more"
        turn_index.append(
            {
                "turn": payload["turn"],
                "path": f"turn-{payload['turn']:03d}.json",
                "ts_start": payload["ts_start"],
                "status": payload["status"],
                "user_preview": compact_ws(payload.get("user"), 140) or "(no user message)",
                "summary_preview": payload.get("turn_summary"),
                "reasoning_count": sum(1 for item in payload["timeline"] if item.get("kind") == "reasoning"),
                "tool_count": sum(1 for item in payload["timeline"] if item.get("kind") == "tool_call"),
                "edited_preview": edited_preview,
            }
        )

    session_payload = {
        "schema_version": 2,
        "session_id": session_id,
        "started_at": started_at,
        "model": model,
        "cwd": cwd,
        "branch": branch,
        "head_sha": head_sha,
        "start_sha": start_sha,
        "transcript_path": transcript_path,
        "turn_index": turn_index,
        "session_events": session_events,
        "indexes": indexes,
        "git": git_snapshot,
    }

    (output_dir / "session.json").write_text(json.dumps(session_payload, indent=2), encoding="utf-8")
    write_session_txt(
        output_dir / "session.txt",
        project_name=os.path.basename(cwd),
        session_id=session_id,
        started_at=started_at,
        model=model,
        branch=branch,
        head_sha=head_sha,
        start_sha=start_sha,
        turn_index=turn_index,
        session_events=session_events,
        indexes=indexes,
    )

    handoff_payload = build_handoff(
        session_id=session_id,
        model=model,
        turn_payloads=turn_payloads,
        session_events=session_events,
        indexes=indexes,
        git_snapshot=git_snapshot,
        transcript_path=transcript_path,
    )
    (output_dir / "handoff.json").write_text(json.dumps(handoff_payload, indent=2), encoding="utf-8")


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
