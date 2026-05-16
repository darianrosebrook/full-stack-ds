import { useMemo, useRef, useEffect } from "react";
import type { TraceHit } from "../trace/types";

interface CodeViewerProps {
  code: string;
  filename?: string;
  hits?: TraceHit[];
  onHitClick?: (hit: TraceHit) => void;
  selectedHitIndex?: number | null;
}

interface Segment {
  text: string;
  hit?: TraceHit;
  hitIndex?: number;
}

function segmentLine(line: string, lineHits: { hit: TraceHit; index: number; col: number; len: number }[]): Segment[] {
  if (lineHits.length === 0) return [{ text: line }];
  const sorted = [...lineHits].sort((a, b) => a.col - b.col);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const h of sorted) {
    if (h.col < cursor) continue;
    if (h.col > cursor) segments.push({ text: line.slice(cursor, h.col) });
    const endCol = Math.min(line.length, h.col + h.len);
    segments.push({ text: line.slice(h.col, endCol), hit: h.hit, hitIndex: h.index });
    cursor = endCol;
  }
  if (cursor < line.length) segments.push({ text: line.slice(cursor) });
  return segments;
}

export function CodeViewer({ code, filename, hits = [], onHitClick, selectedHitIndex }: CodeViewerProps) {
  const containerRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => {
    const raw = code.split("\n");
    const byLine: Record<number, { hit: TraceHit; index: number; col: number; len: number }[]> = {};
    hits.forEach((h, idx) => {
      const line = h.start.line;
      if (!byLine[line]) byLine[line] = [];
      byLine[line].push({ hit: h, index: idx, col: h.start.column, len: h.length });
    });
    return raw.map((text, i) => ({
      lineNumber: i + 1,
      segments: segmentLine(text, byLine[i] ?? []),
    }));
  }, [code, hits]);

  useEffect(() => {
    if (selectedHitIndex == null || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(`[data-hit-index="${selectedHitIndex}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedHitIndex]);

  return (
    <div className="card">
      {filename && (
        <div className="card-toolbar">
          <span>{filename}</span>
          <span className="subtle">{code.split("\n").length} lines</span>
        </div>
      )}
      <pre className="code-block" ref={containerRef} style={{ borderRadius: 0, border: "none" }}>
        <code>
          {lines.map(({ lineNumber, segments }) => (
            <div key={lineNumber} style={{ display: "flex" }}>
              <span
                className="subtle"
                style={{
                  display: "inline-block",
                  width: 36,
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: 12,
                  userSelect: "none",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {lineNumber}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                {segments.map((seg, idx) =>
                  seg.hit ? (
                    <button
                      key={idx}
                      type="button"
                      data-hit-index={seg.hitIndex}
                      onClick={() => onHitClick?.(seg.hit!)}
                      title={`${seg.hit.kind} → ${seg.hit.contractPath}\n${seg.hit.explanation}`}
                      style={{
                        background:
                          selectedHitIndex === seg.hitIndex ? "var(--accent)" : "var(--accent-soft)",
                        color: selectedHitIndex === seg.hitIndex ? "var(--accent-fg)" : "var(--fg-accent)",
                        border: "none",
                        borderRadius: "var(--radius-2)",
                        padding: "0 2px",
                        font: "inherit",
                        cursor: "pointer",
                        margin: "0 -1px",
                      }}
                    >
                      {seg.text}
                    </button>
                  ) : (
                    <span key={idx}>{seg.text || "​"}</span>
                  ),
                )}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
