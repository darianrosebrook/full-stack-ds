import { useEffect, useRef, useState, type JSX } from "react";

import { Details } from "@full-stack-ds/react";

interface JsonTreeViewerProps {
  value: unknown;
  highlightPath?: string;
}

function pathFor(parent: string, key: string | number): string {
  const segment = typeof key === "number" ? `[${key}]` : key;
  return parent ? (typeof key === "number" ? `${parent}${segment}` : `${parent}.${segment}`) : segment;
}

function containsPath(parent: string, path: string | undefined): boolean {
  return !!path && (parent === "" || path === parent || path.startsWith(parent + ".") || path.startsWith(parent + "["));
}

interface BranchState {
  open: Record<string, boolean>;
  setOpen: (path: string, open: boolean) => void;
}

function renderValue(value: unknown, parentPath: string, highlight: string | undefined, depth: number, state: BranchState): JSX.Element {
  if (value === null) return <span className="null">null</span>;
  if (typeof value === "string") return <span className="string">"{escapeString(value)}"</span>;
  if (typeof value === "number") return <span className="number">{value}</span>;
  if (typeof value === "boolean") return <span className="boolean">{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="muted">[]</span>;
    return (
      <Details variant="compact" summary={`Array(${value.length})`}
        open={state.open[parentPath] ?? (depth < 1 || containsPath(parentPath, highlight))}
        onOpenChange={(open) => state.setOpen(parentPath, open)}>
        <ul>
          {value.map((v, i) => {
            const itemPath = pathFor(parentPath, i);
            const isHit = containsPath(itemPath, highlight);
            return (
              <li key={i} data-path={itemPath} className={isHit ? "highlighted" : undefined}>
                <span className="muted">{i}: </span>
                {renderValue(v, itemPath, highlight, depth + 1, state)}
              </li>
            );
          })}
        </ul>
      </Details>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="muted">{`{}`}</span>;
    return (
      <Details variant="compact" summary={`{${entries.length}}`}
        open={state.open[parentPath] ?? (depth < 1 || containsPath(parentPath, highlight))}
        onOpenChange={(open) => state.setOpen(parentPath, open)}>
        <ul>
          {entries.map(([k, v]) => {
            const childPath = pathFor(parentPath, k);
            const isHit = containsPath(childPath, highlight);
            return (
              <li key={k} data-path={childPath}>
                <span className={isHit ? "highlighted" : undefined}>
                  <span className="key">{escapeKey(k)}</span>
                  <span className="muted">: </span>
                </span>
                {renderValue(v, childPath, highlight, depth + 1, state)}
              </li>
            );
          })}
        </ul>
      </Details>
    );
  }
  return <span className="muted">{String(value)}</span>;
}

function escapeKey(key: string): string {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function JsonTreeViewer({ value, highlightPath }: JsonTreeViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const scrolledPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    // A newly selected trace reveals its ancestors, including array branches.
    // Other branches retain the reader's manual expansion state.
    setOpen((previous) => Object.fromEntries(
      Object.entries(previous).filter(([path]) => !containsPath(path, highlightPath)),
    ));
  }, [highlightPath]);

  useEffect(() => {
    if (!highlightPath) { scrolledPath.current = undefined; return; }
    if (!ref.current || scrolledPath.current === highlightPath) return;
    const target = [...ref.current.querySelectorAll<HTMLElement>("[data-path]")]
      .find((element) => element.dataset.path === highlightPath);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      scrolledPath.current = highlightPath;
    }
  }, [highlightPath, open]);

  return (
    <div ref={ref} className="json-tree">
      {renderValue(value, "", highlightPath, 0, {
        open, setOpen: (path, expanded) => setOpen((previous) => ({ ...previous, [path]: expanded })),
      })}
    </div>
  );
}
