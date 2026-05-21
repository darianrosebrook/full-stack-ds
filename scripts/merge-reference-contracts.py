#!/usr/bin/env python3
"""Mechanical merge of portfolio + qualtrics contract data into ours.

Rule: ours wins where authored. Portfolio (then qualtrics) fills empty
fields. The cleanup pass that runs after this commit decides whether to
adopt reference content for the fields we already authored.

This is intentionally non-destructive. The merged contracts are written
back in-place, and `git diff` shows exactly what was filled in.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OURS_DIR = ROOT / "packages" / "ds-contracts"
PORT_DIR = Path("/Users/darianrosebrook/Desktop/Projects/portfolio/ui/components")
QUAL_DIR = Path(
    "/Users/darianrosebrook/Desktop/Projects/qualtrics/Archive/component-converter/"
    "packages/qds-ui-react-compat/src/headless/primitives"
)

# Qualtrics components that map to ours under a different name.
QUAL_ALIAS = {
    "Dialog": "Modal",
    "Sheet": "Modal",
    "Select": "SelectMenu",
    "Field": "FormField",
    "Spinner": "LoadingSpinner",
    "Links": "Link",
    "Status": "Indicator",
    "TextField": "InlineInput",
    "Toast": "Banner",
    "Calendar": "DatePicker",
    "Command": "QuickSearch",
    "List": "ListItem",
}

# Top-level fields where we never merge — ours is always authoritative.
# Identity: the contract author's own choices that the references can't
# improve mechanically.
DO_NOT_MERGE = {
    "$schema",
    "schemaVersion",
    "name",
    "description",
    "layer",
    "cssPrefix",
    "anatomy",       # structural choice; merging would corrupt our authored anatomy
    "props",         # mid-migration to six-bucket; cleanup pass handles
    "types",         # TS-specific; merging could collide
    "dataModel",     # TS-specific
    "variants",      # author's choice of variant axes
    "states",        # author's choice of state dimensions
    "codegen",       # our extension
    "keyframes",     # our extension
    "styles",        # our extension
    "surface",       # our extension
}


def is_empty(value) -> bool:
    """An "empty" field is missing, None, [], {}, or "".

    A field with even one key/item counts as authored.
    """
    if value is None:
        return True
    if isinstance(value, (list, dict, str)) and len(value) == 0:
        return True
    return False


def load_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as e:
        print(f"  WARN: skipping {path} — invalid JSON: {e}")
        return None


def load_qual_contract(name: str) -> dict | None:
    """Try direct name, then alias."""
    direct = QUAL_DIR / name / f"{name}.contract.json"
    if direct.exists():
        return load_json(direct)
    aliased = QUAL_ALIAS.get(name)
    if aliased:
        return load_json(QUAL_DIR / aliased / f"{aliased}.contract.json")
    return None


def merge_contract(name: str) -> tuple[bool, list[str]]:
    """Merge one contract. Returns (changed, list of fields filled in)."""
    ours_path = OURS_DIR / f"{name}.contract.json"
    port_path = PORT_DIR / name / f"{name}.contract.json"

    ours = load_json(ours_path)
    if ours is None:
        return False, []
    port = load_json(port_path)
    qual = load_qual_contract(name)

    if port is None and qual is None:
        return False, []

    filled: list[str] = []
    # Walk every field that appears in port or qual.
    candidate_fields = set()
    for src in (port, qual):
        if src:
            candidate_fields.update(src.keys())

    for field in candidate_fields:
        if field in DO_NOT_MERGE:
            continue
        if not is_empty(ours.get(field)):
            continue
        # Prefer portfolio, then qualtrics.
        for src, src_name in ((port, "P"), (qual, "Q")):
            if src and not is_empty(src.get(field)):
                ours[field] = src[field]
                filled.append(f"{field} ({src_name})")
                break

    if not filled:
        return False, []

    # Reorder keys so newly-added fields slot near their semantic neighbors.
    # Use the order from our schema's properties block as the canonical order.
    ordered = reorder_by_schema(ours)
    text = json.dumps(ordered, indent=2) + "\n"
    ours_path.write_text(text)
    return True, filled


_schema_order: list[str] | None = None


def schema_field_order() -> list[str]:
    """Read the canonical field order from our schema's `properties` block."""
    global _schema_order
    if _schema_order is None:
        schema = json.loads((OURS_DIR / "component.contract.schema.json").read_text())
        _schema_order = list(schema.get("properties", {}).keys())
    return _schema_order


def reorder_by_schema(contract: dict) -> dict:
    """Reorder keys to match the schema's `properties` order; unknown keys go last."""
    order = schema_field_order()
    result: dict = {}
    # Preserve $schema at the top if present.
    if "$schema" in contract:
        result["$schema"] = contract["$schema"]
    for key in order:
        if key == "$schema":
            continue
        if key in contract:
            result[key] = contract[key]
    # Any unknown keys (shouldn't happen with additionalProperties: false but
    # be defensive).
    for key in contract:
        if key not in result:
            result[key] = contract[key]
    return result


def main():
    contract_files = sorted(OURS_DIR.glob("*.contract.json"))
    print(f"Merging {len(contract_files)} contracts...\n")

    changed_count = 0
    no_change_count = 0
    report: list[tuple[str, list[str]]] = []

    for path in contract_files:
        name = path.stem.replace(".contract", "")
        changed, fields = merge_contract(name)
        if changed:
            changed_count += 1
            report.append((name, fields))
        else:
            no_change_count += 1

    print(f"Changed: {changed_count}")
    print(f"Unchanged: {no_change_count}")
    print()
    print("=== Per-contract fields filled ===")
    for name, fields in report:
        print(f"  {name:<14} {', '.join(fields)}")


if __name__ == "__main__":
    main()
