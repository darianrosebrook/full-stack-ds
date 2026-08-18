import { useEffect, useMemo, useState } from "react";
import { Dialog, Input, Stack } from "@full-stack-ds/react";
import type { Bundle } from "../types/data";
import { buildHref } from "../router";

interface CommandPaletteProps {
  bundle: Bundle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PaletteEntry {
  id: string;
  label: string;
  hint: string;
  href: string;
}

const STATIC_ENTRIES: PaletteEntry[] = [
  { id: "home", label: "Overview", hint: "landing page", href: "#/" },
  { id: "architecture", label: "Architecture", hint: "the claim", href: "#/architecture" },
  { id: "tokens", label: "Tokens", hint: "token explorer", href: "#/tokens" },
  { id: "tokens-philosophy", label: "Tokens philosophy", hint: "editorial", href: "#/tokens-philosophy" },
  { id: "complexity", label: "Component complexity", hint: "layers", href: "#/complexity" },
  { id: "standards", label: "Component standards", hint: "reference", href: "#/standards" },
  { id: "display-case", label: "Display case", hint: "visual audit", href: "#/display-case" },
  { id: "settings", label: "Settings", hint: "preferences", href: "#/settings" },
  { id: "activity", label: "Activity", hint: "repo feed", href: "#/activity" },
];

/**
 * Cmd+K navigation palette over every view and component, built on the DS
 * Dialog (modal, Escape-dismissing) with the DS Input as the filter field.
 * The DS Command component is blocked for this job: its emitted root drops
 * the contract children slot and renders only internal scaffold, so consumer
 * entries cannot compose (see chrome-coverage BLOCKED_FAMILIES).
 */
export function CommandPalette({ bundle, open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const entries = useMemo<PaletteEntry[]>(
    () => [
      ...STATIC_ENTRIES,
      ...bundle.components.map((c) => ({
        id: `component:${c.name}`,
        label: c.name,
        hint: c.contract.layer ?? "component",
        href: buildHref({ kind: "component", name: c.name, tab: "design" }),
      })),
    ],
    [bundle.components],
  );

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? entries.filter((e) => `${e.label} ${e.hint}`.toLowerCase().includes(needle))
    : entries;

  const navigate = (href: string) => {
    window.location.hash = href.replace(/^#/, "");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      size="md"
      slots={{ title: "Command palette" }}
      aria-label="Command palette"
    >
      <Stack className="stack-gap-05" style={{ minWidth: "min(560px, 80vw)" }}>
        <Input
          type="search"
          name="command-palette-filter"
          placeholder="Jump to a view or component…"
          aria-label="Filter destinations"
          value={search}
          onChange={setSearch}
        />
        <nav aria-label="Destinations" style={{ maxHeight: "50vh", overflowY: "auto" }}>
          <Stack className="stack-gap-02">
            {filtered.length === 0 && (
              <p className="muted" style={{ margin: 0, fontSize: "var(--fsds-core-typography-ramp-2)" }}>
                Nothing matches “{search}”.
              </p>
            )}
            {filtered.slice(0, 40).map((entry) => (
              <a
                key={entry.id}
                href={entry.href}
                className="panel panel--inset"
                style={{ textDecoration: "none" }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(entry.href);
                }}
              >
                <Stack variant="horizontal" className="stack-gap-05" style={{ justifyContent: "space-between" }}>
                  <span>{entry.label}</span>
                  <span className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-1)" }}>
                    {entry.hint}
                  </span>
                </Stack>
              </a>
            ))}
          </Stack>
        </nav>
      </Stack>
    </Dialog>
  );
}

/** Installs the Cmd+K / Ctrl+K window listener. */
export function useCommandPaletteHotkey(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}
