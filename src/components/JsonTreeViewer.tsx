import { useEffect, useRef, type JSX } from "react";

interface JsonTreeViewerProps {
  value: unknown;
  highlightPath?: string;
}

function pathFor(parent: string, key: string | number): string {
  const segment = typeof key === "number" ? `[${key}]` : key;
  return parent ? (typeof key === "number" ? `${parent}${segment}` : `${parent}.${segment}`) : segment;
}

function renderValue(value: unknown, parentPath: string, highlight: string | undefined, depth: number): JSX.Element {
  if (value === null) return <span className="null">null</span>;
  if (typeof value === "string") return <span className="string">"{escapeString(value)}"</span>;
  if (typeof value === "number") return <span className="number">{value}</span>;
  if (typeof value === "boolean") return <span className="boolean">{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="muted">[]</span>;
    return (
      <details open={depth < 1}>
        <summary>
          <span className="muted">Array({value.length})</span>
        </summary>
        <ul>
          {value.map((v, i) => {
            const itemPath = pathFor(parentPath, i);
            const isHit = highlight && (itemPath === highlight || highlight.startsWith(itemPath + "."));
            return (
              <li key={i} data-path={itemPath} className={isHit ? "highlighted" : undefined}>
                <span className="muted">{i}: </span>
                {renderValue(v, itemPath, highlight, depth + 1)}
              </li>
            );
          })}
        </ul>
      </details>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="muted">{`{}`}</span>;
    return (
      <details open={depth < 1}>
        <summary>
          <span className="muted">{`{${entries.length}}`}</span>
        </summary>
        <ul>
          {entries.map(([k, v]) => {
            const childPath = pathFor(parentPath, k);
            const isHit = highlight && (childPath === highlight || highlight.startsWith(childPath + "."));
            return (
              <li key={k} data-path={childPath}>
                <span className={isHit ? "highlighted" : undefined}>
                  <span className="key">{escapeKey(k)}</span>
                  <span className="muted">: </span>
                </span>
                {renderValue(v, childPath, highlight, depth + 1)}
              </li>
            );
          })}
        </ul>
      </details>
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

  useEffect(() => {
    if (!highlightPath || !ref.current) return;
    // Open every ancestor of the highlighted path.
    const segments = highlightPath.split(/\.|\[/).map((s) => s.replace("]", "")).filter(Boolean);
    let acc = "";
    for (const seg of segments) {
      acc = acc ? (`${acc}.${seg}`) : seg;
      const el = ref.current.querySelector<HTMLElement>(`[data-path="${cssAttr(acc)}"]`);
      if (!el) continue;
      let parent: HTMLElement | null = el;
      while (parent) {
        if (parent.tagName === "DETAILS") (parent as HTMLDetailsElement).open = true;
        parent = parent.parentElement;
      }
    }
    const target = ref.current.querySelector<HTMLElement>(`[data-path="${cssAttr(highlightPath)}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightPath]);

  return (
    <div ref={ref} className="json-tree">
      {renderValue(value, "", highlightPath, 0)}
    </div>
  );
}

function cssAttr(value: string): string {
  return value.replace(/"/g, '\\"');
}
